// Broker Verification Enhanced - WikiFX Level
// Uses Groq AI with per-section error handling + fallback + cache

const BK_REG_URLS2 = window.BK_REG_URLS || {
  ASIC:'https://connectonline.asic.gov.au/RegistrySearch',
  FCA:'https://register.fca.org.uk/s/search?predefined=Companies',
  CFTC:'https://www.nfa.futures.org/BasicNet/',
  CySEC:'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',
  MAS:'https://eservices.mas.gov.sg/fid/institution',
  FINMA:'https://www.finma.ch/en/authorisation/self-regulatory-organisations-sros/',
  BaFin:'https://www.bafin.de/EN/Supervision/SupervisedCompanies/supervised_companies_node_en.html',
  DFSA:'https://www.dfsa.ae/public-register',
  FSCA:'https://www.fsca.co.za/Fais/Search_FSP.htm'
};

// Cache helper (30min)
function bkvCache(key,data){
  try{sessionStorage.setItem('bkv_'+key,JSON.stringify({d:data,t:Date.now()}))}catch(e){}
}
function bkvCacheGet(key){
  try{const v=JSON.parse(sessionStorage.getItem('bkv_'+key)||'null');
    if(v&&Date.now()-v.t<1800000)return v.d}catch(e){}
  return null;
}

// AI call helper
async function bkvAiCall(prompt){
  const resp=await fetch(window.GROQ_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.GROQ_KEY},
    body:JSON.stringify({model:window.GROQ_MODEL,messages:[
      {role:'system',content:'너는 FX 브로커 데이터베이스야. 반드시 유효한 JSON만 출력. 다른 텍스트 없이.'},
      {role:'user',content:prompt}
    ],max_tokens:2000,temperature:0.1})
  });
  const data=await resp.json();
  const text=data.choices?.[0]?.message?.content||'';
  const s=text.indexOf('{'),e=text.lastIndexOf('}');
  if(s<0)throw new Error('No JSON');
  return JSON.parse(text.substring(s,e+1));
}

// Source badge HTML
function srcBadge(type){
  if(type==='api')return'<span style="background:#d1fae5;color:#089981;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;margin-left:6px">공식 데이터</span>';
  if(type==='ai')return'<span style="background:#fef3c7;color:#d97706;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;margin-left:6px">🤖 AI 추정</span>';
  return'<span style="background:var(--gray-100);color:var(--gray-500);padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;margin-left:6px">기본 데이터</span>';
}

async function bkVerifyEnhanced(d, container) {
  const name = d.name;
  const cacheKey = name.replace(/\s/g,'_');

  // Create section shells
  const sections = ['license','company','payment','products','spreads','calc'].map(id => {
    const el = document.createElement('div');
    el.id = 'bkv_'+id;
    el.className = 'bk-layer';
    container.appendChild(el);
    return el;
  });

  // 1. Licenses
  bkvRenderLicenses(d, sections[0], cacheKey);
  // 2. Company
  bkvRenderCompany(d, sections[1], cacheKey);
  // 3. Payments
  bkvRenderPayments(d, sections[2], cacheKey);
  // 4. Products
  bkvRenderProducts(d, sections[3], cacheKey);
  // 5. Spreads
  bkvRenderSpreads(d, sections[4], cacheKey);
  // 6. Calculator (no API needed)
  bkvRenderCalc(d, sections[5]);

  // Share + Disclaimer
  const shareEl = document.createElement('div');
  shareEl.style.cssText = 'display:flex;gap:6px;margin:16px 0;flex-wrap:wrap';
  shareEl.innerHTML = `
    <button onclick="navigator.clipboard.writeText('${d.name} 브로커 검증 - 안전도 ${d.safetyScore}/100');alert('복사됨!')" style="padding:6px 14px;border:1px solid var(--gray-200);border-radius:8px;background:var(--white);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font)">📋 링크 복사</button>
    <a href="https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(d.name+' 안전도 '+d.safetyScore+'/100')}" target="_blank" style="padding:6px 14px;border:1px solid var(--gray-200);border-radius:8px;background:var(--white);font-size:11px;font-weight:600;text-decoration:none;color:var(--navy)">✈️ 텔레그램</a>`;
  container.appendChild(shareEl);

  const disc = document.createElement('div');
  disc.style.cssText = 'margin-top:12px;padding:14px;background:var(--gray-50);border-radius:10px;font-size:10px;color:var(--gray-400);line-height:1.6';
  disc.innerHTML = '⚠️ <strong>면책 조항</strong>: 이 정보는 공식 규제기관 데이터, Trustpilot 리뷰, AI 분석을 종합한 결과이며, 투자 권유가 아닙니다. 데이터의 정확성을 보장하지 않습니다.';
  container.appendChild(disc);
}

// ===== 1. LICENSES =====
async function bkvRenderLicenses(d, el, ck) {
  const topRegs={CFTC:1,NFA:1,FCA:1,ASIC:1,BaFin:1,MAS:1,FINMA:1};
  const midRegs={CySEC:1,DFSA:1};
  el.innerHTML = '<div class="bk-layer-header">🏛 라이선스 상세</div><div class="bk-layer-body"><div class="st-ai-loading">라이선스 정보 조회 중<span class="st-dots"></span></div></div>';

  let licenses = bkvCacheGet(ck+'_lic');
  let source = 'cache';

  if (!licenses) {
    try {
      const res = await bkvAiCall(`브로커: ${d.name}\n이 브로커의 라이선스 정보를 JSON으로:\n{"licenses":[{"regulator":"규제기관","country":"국가","licenseNumber":"번호","status":"Active/Inactive","expiryDate":"YYYY-MM-DD 또는 null"}]}`);
      licenses = res.licenses || [];
      source = 'ai';
      bkvCache(ck+'_lic', licenses);
    } catch (e) {
      // Fallback from brokers.js
      licenses = (d.regulations || []).map(r => ({regulator:r,country:'—',licenseNumber:'—',status:'확인필요',expiryDate:null}));
      source = 'default';
    }
  }

  el.querySelector('.bk-layer-body').innerHTML = srcBadge(source) +
    '<div style="overflow-x:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="border-bottom:2px solid var(--gray-200)"><th style="text-align:left;padding:8px">규제기관</th><th>상태</th><th>라이선스 번호</th><th>만료일</th><th></th></tr></thead><tbody>' +
    licenses.map(l => {
      const isTop = topRegs[l.regulator]; const isMid = midRegs[l.regulator];
      const stOk = l.status === 'Active';
      const url = BK_REG_URLS2[l.regulator];
      return `<tr style="border-bottom:1px solid var(--gray-100)">
        <td style="padding:8px"><span class="bk-reg-badge ${isTop?'top':isMid?'mid':'low'}">${l.regulator}</span></td>
        <td style="text-align:center" class="${stOk?'bk-check-ok':'bk-check-warn'}">${stOk?'✅ 유효':'⚠️ '+l.status}</td>
        <td style="text-align:center">${l.licenseNumber||'—'} ${l.licenseNumber&&l.licenseNumber!=='—'?'<button onclick="navigator.clipboard.writeText(\''+l.licenseNumber+'\');this.textContent=\'✓\';setTimeout(()=>this.textContent=\'📋\',1000)" style="background:none;border:none;cursor:pointer;font-size:12px">📋</button>':''}</td>
        <td style="text-align:center;font-size:11px">${l.expiryDate||'—'}</td>
        <td>${url?'<a href="'+url+'" target="_blank" class="bk-ext-link" style="font-size:10px">공식 확인 →</a>':''}</td></tr>`;
    }).join('') + '</tbody></table></div>';
}

// ===== 2. COMPANY =====
async function bkvRenderCompany(d, el, ck) {
  el.innerHTML = '<div class="bk-layer-header">🏢 회사 소개 & 연락처</div><div class="bk-layer-body"><div class="st-ai-loading">회사 정보 로딩 중<span class="st-dots"></span></div></div>';

  let info = bkvCacheGet(ck+'_comp');
  let source = 'cache';

  if (!info) {
    try {
      info = await bkvAiCall(`브로커: ${d.name}\n회사 정보 JSON:\n{"officialDesc":"소개200자한국어","history":"연혁150자","awards":["수상1"],"headOffice":"본사주소","employees":"직원수","email":"이메일","phone":"전화","supportLanguages":["한국어","영어"],"supportHours":"24/5","supportChannels":["라이브챗","이메일"],"koreanSupport":true}`);
      source = 'ai';
      bkvCache(ck+'_comp', info);
    } catch (e) {
      info = {officialDesc:d.name+'은 글로벌 외환 브로커입니다.',koreanSupport:false,supportLanguages:['영어'],supportChannels:['이메일']};
      source = 'default';
    }
  }

  const hasKo = info.koreanSupport || (info.supportLanguages||[]).some(l=>l.includes('한국'));
  el.querySelector('.bk-layer-body').innerHTML = srcBadge(source) + `
    <div style="margin:8px 0">${info.officialDesc||''}</div>
    ${info.history?'<div style="color:var(--gray-500);font-size:11px;margin-bottom:8px">📜 '+info.history+'</div>':''}
    ${(info.awards||[]).length?'<div style="margin-bottom:8px"><strong>🏆 수상</strong><br>'+info.awards.map(a=>'· '+a).join('<br>')+'</div>':''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
      ${info.headOffice?'<div>📍 '+info.headOffice+'</div>':''}
      ${d.domain?'<div>🌐 <a href="https://'+d.domain+'" target="_blank" style="color:var(--blue)">'+d.domain+'</a></div>':''}
      ${info.email?'<div>📧 '+info.email+'</div>':''}
      ${info.phone?'<div>📞 '+info.phone+'</div>':''}
      ${info.employees?'<div>👥 '+info.employees+'</div>':''}
      <div>⏰ ${info.supportHours||'정보 없음'}</div>
    </div>
    <div style="margin-top:8px">${hasKo?'<span style="background:#d1fae5;color:#089981;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">🇰🇷 한국어 지원</span>':'<span style="background:var(--gray-100);color:var(--gray-500);padding:3px 8px;border-radius:6px;font-size:11px">한국어 미지원</span>'} ${(info.supportChannels||[]).map(ch=>'<span style="background:var(--gray-100);padding:3px 8px;border-radius:6px;font-size:11px;margin-left:4px">'+ch+'</span>').join('')}</div>`;
}

// ===== 3. PAYMENTS =====
async function bkvRenderPayments(d, el, ck) {
  el.innerHTML = '<div class="bk-layer-header">💳 입출금 방법</div><div class="bk-layer-body"><div class="st-ai-loading">입출금 정보 로딩 중<span class="st-dots"></span></div></div>';

  let info = bkvCacheGet(ck+'_pay');
  let source = 'cache';

  if (!info) {
    try {
      info = await bkvAiCall(`브로커: ${d.name}\n입출금 방법 JSON:\n{"deposit":[{"method":"Visa","icon":"💳","minAmount":"$10","processingTime":"즉시","fee":"무료","KRWSupport":false}],"withdrawal":[{"method":"Visa","icon":"💳","minAmount":"$50","processingTime":"1~3일","fee":"무료"}]}`);
      source = 'ai';
      bkvCache(ck+'_pay', info);
    } catch (e) {
      info = {deposit:[{method:'Visa',icon:'💳'},{method:'Mastercard',icon:'💳'},{method:'은행송금',icon:'🏦'},{method:'Bitcoin',icon:'₿'}],withdrawal:[{method:'Visa',icon:'💳'},{method:'은행송금',icon:'🏦'}]};
      source = 'default';
    }
  }

  const renderMethods = (methods, isBg) => (methods||[]).map(m =>
    `<div style="padding:6px 10px;${isBg?'background:var(--blue-light);color:var(--blue)':'background:var(--gray-50);border:1px solid var(--gray-200);color:var(--gray-600)'};border-radius:8px;font-size:11px;font-weight:600" title="${m.minAmount?'최소 '+m.minAmount:''}${m.processingTime?' · '+m.processingTime:''}${m.fee?' · 수수료 '+m.fee:''}">${m.icon||'💰'} ${m.method}${m.KRWSupport?' 🇰🇷':''}</div>`
  ).join('');

  el.querySelector('.bk-layer-body').innerHTML = srcBadge(source) + `
    <div style="font-size:11px;font-weight:700;color:var(--navy);margin:8px 0 6px">입금 방법</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${renderMethods(info.deposit, true)}</div>
    <div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px">출금 방법</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${renderMethods(info.withdrawal, false)}</div>`;
}

// ===== 4. PRODUCTS =====
async function bkvRenderProducts(d, el, ck) {
  el.innerHTML = '<div class="bk-layer-header">📊 거래 상품</div><div class="bk-layer-body"><div class="st-ai-loading">거래 상품 로딩 중<span class="st-dots"></span></div></div>';

  let info = bkvCacheGet(ck+'_prod');
  let source = 'cache';

  if (!info) {
    try {
      info = await bkvAiCall(`브로커: ${d.name}\n거래 상품 JSON:\n{"forex":{"available":true,"count":"60+","desc":"주요통화쌍"},"stocks":{"available":true,"count":"1600+","desc":"미국유럽주식"},"indices":{"available":true,"count":"20+","desc":"글로벌지수"},"commodities":{"available":true,"count":"20+","desc":"금은원유"},"crypto":{"available":true,"count":"25+","desc":"BTC ETH"}}`);
      source = 'ai';
      bkvCache(ck+'_prod', info);
    } catch (e) {
      info = {forex:{available:true,count:'다수',desc:''},stocks:{available:true,count:'다수',desc:''},indices:{available:true,count:'다수',desc:''},commodities:{available:true,count:'다수',desc:''},crypto:{available:true,count:'다수',desc:''}};
      source = 'default';
    }
  }

  const cats = [
    {key:'forex',icon:'💱',name:'외환'},{key:'stocks',icon:'📈',name:'주식 CFD'},
    {key:'indices',icon:'📊',name:'지수'},{key:'commodities',icon:'🥇',name:'원자재'},
    {key:'crypto',icon:'₿',name:'암호화폐'}
  ];

  el.querySelector('.bk-layer-body').innerHTML = srcBadge(source) +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:8px">' +
    cats.map(c => {
      const p = info[c.key] || {};
      const on = p.available !== false;
      return `<div style="padding:12px;border-radius:10px;text-align:center;${on?'background:var(--blue-light);border:1px solid var(--blue)':'background:var(--gray-50);border:1px solid var(--gray-200);opacity:.5'}"><div style="font-size:20px">${c.icon}</div><div style="font-size:12px;font-weight:700;${on?'color:var(--blue)':'color:var(--gray-400)'}">${c.name}</div><div style="font-size:11px;color:var(--gray-500)">${on?(p.count||'다수'):'미지원'}</div></div>`;
    }).join('') + '</div>';
}

// ===== 5. SPREADS =====
async function bkvRenderSpreads(d, el, ck) {
  el.innerHTML = '<div class="bk-layer-header">📈 주요 페어 스프레드</div><div class="bk-layer-body"><div class="st-ai-loading">스프레드 정보 로딩 중<span class="st-dots"></span></div></div>';

  let spreads = bkvCacheGet(ck+'_sprd');
  let source = 'cache';

  if (!spreads) {
    try {
      const res = await bkvAiCall(`브로커: ${d.name}\n주요 페어 스프레드 JSON:\n{"spreads":[{"pair":"EUR/USD","avg":"0.1","min":"0.0","type":"ECN"},{"pair":"GBP/USD","avg":"0.3","min":"0.1","type":"ECN"},{"pair":"USD/JPY","avg":"0.1","min":"0.0","type":"ECN"},{"pair":"XAU/USD","avg":"15","min":"10","type":"CFD"},{"pair":"NAS100","avg":"0.5","min":"0.3","type":"CFD"},{"pair":"BTC/USD","avg":"30","min":"20","type":"CFD"}]}`);
      spreads = res.spreads || [];
      source = 'ai';
      bkvCache(ck+'_sprd', spreads);
    } catch (e) {
      spreads = [{pair:'EUR/USD',avg:'1.0',min:'0.5',type:'Standard'},{pair:'GBP/USD',avg:'1.5',min:'1.0',type:'Standard'},{pair:'USD/JPY',avg:'1.0',min:'0.5',type:'Standard'}];
      source = 'default';
    }
  }

  el.querySelector('.bk-layer-body').innerHTML = srcBadge(source) +
    '<div style="overflow-x:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="border-bottom:2px solid var(--gray-200)"><th style="text-align:left;padding:6px">페어</th><th>평균</th><th>최소</th><th>유형</th></tr></thead><tbody>' +
    spreads.map(s =>
      `<tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:6px;font-weight:700">${s.pair}</td><td style="text-align:center">${s.avg}</td><td style="text-align:center;color:#089981;font-weight:700">${s.min}</td><td style="text-align:center"><span style="background:var(--blue-light);color:var(--blue);padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">${s.type}</span></td></tr>`
    ).join('') + '</tbody></table></div>';
}

// ===== 6. CALCULATOR =====
function bkvRenderCalc(d, el) {
  window._bkCalcBroker = d;
  el.innerHTML = `<div class="bk-layer-header">🧮 거래 조건 계산기</div>
    <div class="bk-layer-body">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div><label style="font-size:11px;font-weight:600;color:var(--gray-500)">페어</label>
          <select id="bkCalcPair" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:8px;font-size:12px" onchange="bkCalcUpdate()">
            <option value="EURUSD">EUR/USD</option><option value="GBPUSD">GBP/USD</option><option value="USDJPY">USD/JPY</option><option value="NAS100">NAS100</option><option value="XAUUSD">XAU/USD</option>
          </select></div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gray-500)">거래량 (lot)</label>
          <input id="bkCalcLot" type="number" value="1" step="0.1" min="0.01" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:8px;font-size:12px" oninput="bkCalcUpdate()"></div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gray-500)">레버리지</label>
          <select id="bkCalcLev" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:8px;font-size:12px" onchange="bkCalcUpdate()">
            <option value="30">1:30</option><option value="100">1:100</option><option value="200">1:200</option><option value="500" selected>1:500</option>
          </select></div>
      </div>
      <div id="bkCalcResult" style="background:var(--gray-50);border-radius:8px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px"></div>
    </div>`;
  bkCalcUpdate();
}

function bkCalcUpdate() {
  const pair = document.getElementById('bkCalcPair')?.value || 'EURUSD';
  const lot = parseFloat(document.getElementById('bkCalcLot')?.value || 1);
  const lev = parseInt(document.getElementById('bkCalcLev')?.value || 500);
  const pd = {EURUSD:{pv:10,pr:1.08,sp:0.1},GBPUSD:{pv:10,pr:1.26,sp:0.2},USDJPY:{pv:6.7,pr:150,sp:0.1},NAS100:{pv:1,pr:18000,sp:50},XAUUSD:{pv:1,pr:2350,sp:15}}[pair]||{pv:10,pr:1,sp:1};
  const margin = pd.pr * 100000 * lot / lev;
  const spreadCost = pd.sp * pd.pv * lot;
  const comm = lot * 3.5 * 2;
  const el = document.getElementById('bkCalcResult');
  if (el) el.innerHTML = `
    <div>필요 증거금<br><strong style="font-size:16px;color:var(--navy)">$${margin.toFixed(2)}</strong></div>
    <div>스프레드 비용<br><strong style="font-size:16px;color:#FF6B35">$${spreadCost.toFixed(2)}</strong></div>
    <div>왕복 수수료<br><strong style="font-size:16px;color:var(--gray-600)">$${comm.toFixed(2)}</strong></div>
    <div>총 비용<br><strong style="font-size:16px;color:#f23645">$${(spreadCost+comm).toFixed(2)}</strong></div>`;
}

window.bkVerifyEnhanced = bkVerifyEnhanced;
window.bkCalcUpdate = bkCalcUpdate;
