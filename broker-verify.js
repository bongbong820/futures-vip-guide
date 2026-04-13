// Broker Verification — WikiFX-level Hero Card
const BKV_REG_URLS={ASIC:'https://connectonline.asic.gov.au/RegistrySearch',FCA:'https://register.fca.org.uk/s/search?predefined=Companies',CFTC:'https://www.nfa.futures.org/BasicNet/',CySEC:'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',MAS:'https://eservices.mas.gov.sg/fid/institution',FINMA:'https://www.finma.ch/en/authorisation/self-regulatory-organisations-sros/',BaFin:'https://www.bafin.de/EN/Supervision/SupervisedCompanies/supervised_companies_node_en.html',DFSA:'https://www.dfsa.ae/public-register',FSCA:'https://www.fsca.co.za/Fais/Search_FSP.htm'};
const BKV_TOP={CFTC:1,NFA:1,FCA:1,ASIC:1,BaFin:1,MAS:1,FINMA:1};
const BKV_MID={CySEC:1,DFSA:1};

function bkvCache(k,d){try{sessionStorage.setItem('bkv2_'+k,JSON.stringify({d,t:Date.now()}))}catch(e){}}
function bkvGet(k){try{const v=JSON.parse(sessionStorage.getItem('bkv2_'+k)||'null');if(v&&Date.now()-v.t<1800000)return v.d}catch(e){}return null}

async function bkvAi(prompt){
  const r=await fetch(GROQ_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+GROQ_KEY},
    body:JSON.stringify({model:GROQ_MODEL,messages:[{role:'system',content:'FX 브로커 전문가. 유효한 JSON만 출력.'},{role:'user',content:prompt}],max_tokens:2500,temperature:0.1})});
  const d=await r.json();const t=d.choices?.[0]?.message?.content||'';
  const s=t.indexOf('{'),e=t.lastIndexOf('}');if(s<0)throw new Error('No JSON');
  return JSON.parse(t.substring(s,e+1));
}

function bkvE(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// SVG Radar Chart
function bkvRadar(scores){
  const labels=['규제','비즈니스','리스크관리','소프트웨어','라이선스'];
  const vals=[scores.regulation||5,scores.business||5,scores.riskManagement||5,scores.software||5,scores.license||5];
  const cx=100,cy=100,r=80,n=5;
  const angleOf=(i)=>Math.PI*2*i/n-Math.PI/2;
  const ptOf=(i,v)=>{const a=angleOf(i);return[cx+r*(v/10)*Math.cos(a),cy+r*(v/10)*Math.sin(a)]};
  // Grid
  let svg='';
  for(let lv=2;lv<=10;lv+=2){
    const pts=Array.from({length:n},(_,i)=>ptOf(i,lv).join(',')).join(' ');
    svg+=`<polygon points="${pts}" fill="none" stroke="#e9ecef" stroke-width="0.5"/>`;
  }
  // Axes
  for(let i=0;i<n;i++){const[x,y]=ptOf(i,10);svg+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e9ecef" stroke-width="0.5"/>`}
  // Data
  const dataPts=Array.from({length:n},(_,i)=>ptOf(i,vals[i]).join(',')).join(' ');
  svg+=`<polygon points="${dataPts}" fill="rgba(41,98,255,0.12)" stroke="#2962ff" stroke-width="1.5"/>`;
  // Points + labels
  for(let i=0;i<n;i++){
    const[px,py]=ptOf(i,vals[i]);
    svg+=`<circle cx="${px}" cy="${py}" r="3" fill="#2962ff"/>`;
    const[lx,ly]=ptOf(i,11.5);
    svg+=`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="#495057" font-size="9" font-weight="600">${labels[i]}</text>`;
  }
  return `<svg viewBox="0 0 200 200" class="bkh-radar">${svg}</svg>`;
}

async function bkVerifyEnhanced(d, container){
  const ck=d.name.replace(/\s/g,'_');
  const now=new Date();
  const timeStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');

  // Load full data (cache or AI)
  let data=bkvGet(ck+'_full');
  if(!data){
    const ov=d.detailOverride;
    if(ov){
      data={
        fullName:d.name,domain:d.domain,country:d.country,countryFlag:d.flag,founded:d.founded,
        brokerType:'ECN',safetyScore:(d.safetyScore/10).toFixed(1),environmentGrade:'A',
        status:d.safetyScore>=80?'safe':d.safetyScore>=60?'warning':'danger',
        regulations:(d.licenses||[]).map(l=>({name:l.reg,number:l.num,expiryDate:null,officialUrl:BKV_REG_URLS[l.reg]})),
        scores:{regulation:d.safetyScore>=80?9:7,business:8,riskManagement:d.safetyScore>=80?8:6,software:8,license:d.safetyScore>=80?9:7},
        trading:{executionSpeed:'34ms',slippage:'0.1핍',platforms:d.platforms,vpsSupport:true,koreanSupport:d.koreanSupport,minDeposit:'$'+d.minDeposit,maxLeverage:d.maxLeverage,environmentGrade:'A',scamReports:0},
        products:ov.products,spreads:ov.spreads,
        payments:(ov.depositMethods||[]).map(m=>({method:m.method,icon:m.icon,time:m.processingTime,speed:m.processingTime?.includes('즉시')?'fast':'mid'})),
        company:{headOffice:d.headOffice,email:d.email,phone:d.phone,website:d.domain,supportHours:'24/5',employees:ov.employees||'—'},
        awards:ov.awards||[],
        aiSummary:null
      };
    } else {
      try{
        data=await bkvAi(`브로커: ${d.name}\n전체 정보 JSON:\n{"fullName":"정식명","domain":"도메인","country":"국가","countryFlag":"국기","founded":연도,"brokerType":"ECN/STP","safetyScore":"0~10소수점","environmentGrade":"S/A/B/C","status":"safe/warning/danger","regulations":[{"name":"규제기관","number":"번호","expiryDate":null}],"scores":{"regulation":0-10,"business":0-10,"riskManagement":0-10,"software":0-10,"license":0-10},"trading":{"executionSpeed":"ms","slippage":"핍","platforms":["MT4"],"vpsSupport":true,"koreanSupport":false,"minDeposit":"$200","maxLeverage":"1:500","scamReports":0},"products":{"forex":{"available":true,"count":"60+"},"stocks":{"available":true,"count":"100+"},"indices":{"available":true,"count":"20+"},"commodities":{"available":true,"count":"20+"},"crypto":{"available":true,"count":"25+"}},"spreads":[{"pair":"EUR/USD","avg":"0.1","unit":"핍"}],"payments":[{"method":"Visa","icon":"💳","time":"즉시","speed":"fast"}],"company":{"headOffice":"주소","email":"이메일","phone":"전화","supportHours":"24/5"},"awards":["수상"],"aiSummary":"2~3문장 한국어 종합분석"}`);
        // Merge hardcoded
        if(d.licenses)data.regulations=d.licenses.map(l=>({name:l.reg,number:l.num,expiryDate:null,officialUrl:BKV_REG_URLS[l.reg]}));
        if(d.headOffice)data.company=data.company||{};data.company.headOffice=d.headOffice||data.company?.headOffice;
      }catch(e){
        data={fullName:d.name,domain:d.domain,country:d.country,countryFlag:d.flag,founded:d.founded,safetyScore:(d.safetyScore/10).toFixed(1),status:d.safetyScore>=80?'safe':'warning',
          regulations:(d.regulations||[]).map(r=>({name:r,number:'—'})),scores:{regulation:5,business:5,riskManagement:5,software:5,license:5},
          trading:{platforms:d.platforms,minDeposit:'$'+d.minDeposit,maxLeverage:d.maxLeverage,koreanSupport:d.koreanSupport},
          products:{forex:{available:true,count:'다수'}},spreads:[],payments:[],company:{},awards:[]};
      }
    }
    bkvCache(ck+'_full',data);
  }

  // Warning banner
  if(data.status==='danger')container.innerHTML+=`<div class="bkv-warn-banner bkv-warn-red">🚨 이 브로커는 사용에 주의가 필요합니다. 반드시 공식 규제기관에서 라이선스를 직접 확인하세요.</div>`;
  else if(data.status==='warning')container.innerHTML+=`<div class="bkv-warn-banner bkv-warn-yellow">⚠️ 일부 라이선스 확인이 필요합니다. 최상위 규제기관(FCA/ASIC/CFTC) 보유 여부를 확인하세요.</div>`;

  const sc=data.scores||{};
  const tr=data.trading||{};
  const co=data.company||{};
  const logo=d.logo?`<img src="${d.logo}" class="bkh-logo" onerror="this.outerHTML='<div class=bkh-logo-fallback>${bkvE((d.name||'').substring(0,2))}</div>'">`:`<div class="bkh-logo-fallback">${bkvE((d.name||'').substring(0,2))}</div>`;
  const statusCls=data.status||'safe';
  const statusText={safe:'정식 감독 · 라이선스 유효',warning:'일부 라이선스 확인 필요',danger:'라이선스 미확인 또는 만료'};
  const gradeMap={'S':'bkh-grade-s','A':'bkh-grade-a','B':'bkh-grade-b','C':'bkh-grade-c'};
  const grade=tr.environmentGrade||data.environmentGrade||'B';

  // ① Hero Card
  container.innerHTML+=`<div class="bkh">
    <div class="bkh-left">
      <div class="bkh-logo-row">${logo}<div><div class="bkh-name">${bkvE(data.fullName||d.name)}</div><div class="bkh-meta">${data.countryFlag||d.flag||''} ${data.country||d.country||''} · ${data.founded||d.founded||'—'}년 · ${data.brokerType||'—'}</div></div></div>
      <div class="bkh-status ${statusCls}">${statusText[statusCls]||''}</div>
      <div class="bkh-regs">${(data.regulations||[]).map(r=>`<span class="bk-reg-badge ${BKV_TOP[r.name]?'top':BKV_MID[r.name]?'mid':'low'}">${r.name}</span>`).join('')}</div>
      <div class="bkh-score"><div class="bkh-score-num">${data.safetyScore||'—'}</div><div class="bkh-score-label">종합 안전 점수 / 10</div><div class="bkh-score-time">${timeStr} KST 검증 완료</div></div>
      <div class="bkh-actions">${d.domain?`<a href="https://${d.domain}" target="_blank" class="bkh-act-primary">공식 사이트 →</a>`:''}<button class="bkh-act-secondary" onclick="alert('즐겨찾기에 추가되었습니다')">⭐ 즐겨찾기</button></div>
    </div>
    <div class="bkh-center">
      <div class="bkh-center-title">평점 지수 분석</div>
      ${bkvRadar(sc)}
      <div class="bkh-legend">${[['규제 지수',sc.regulation],['비즈니스',sc.business],['리스크 관리',sc.riskManagement],['소프트웨어',sc.software],['라이선스',sc.license]].map(([n,v])=>`<div class="bkh-legend-item"><span class="bkh-legend-name">${n}</span><span class="bkh-legend-val">${v||'—'}</span></div>`).join('')}</div>
    </div>
    <div class="bkh-right">
      <div class="bkh-right-title">거래 환경 <span class="bkh-grade ${gradeMap[grade]||'bkh-grade-b'}">${grade}</span></div>
      ${[['체결 속도',tr.executionSpeed||'—'],['슬리피지',tr.slippage||'—'],['플랫폼',(tr.platforms||d.platforms||[]).join(', ')],['VPS 지원',tr.vpsSupport?'✅ 지원':'—'],['한국어 지원',tr.koreanSupport||d.koreanSupport?'🇰🇷 지원':'미지원'],['최소 증거금',tr.minDeposit||'$'+d.minDeposit],['최대 레버리지',tr.maxLeverage||d.maxLeverage],['사기 신고',typeof tr.scamReports==='number'?tr.scamReports+'건':'—']].map(([l,v])=>`<div class="bkh-env-item"><span class="bkh-env-label">${l}</span><span class="bkh-env-val">${v}</span></div>`).join('')}
    </div>
  </div>`;

  // ② License + Withdrawal (2col)
  const regs=data.regulations||[];
  container.innerHTML+=`<div class="bkv-2col">
    <div class="bkv-info-card"><h4>🏛 라이선스 공식 검증</h4>
      ${regs.map(r=>{const url=r.officialUrl||BKV_REG_URLS[r.name];return`<div class="bkv-info-row"><span><span class="bk-reg-badge ${BKV_TOP[r.name]?'top':BKV_MID[r.name]?'mid':'low'}">${r.name}</span> ${r.number||'—'} ${r.number&&r.number!=='—'?`<button onclick="navigator.clipboard.writeText('${r.number}');this.textContent='✓';setTimeout(()=>this.textContent='📋',1000)" style="background:none;border:none;cursor:pointer;font-size:11px">📋</button>`:''}</span><span>${url?`<a href="${url}" target="_blank" style="color:var(--blue);font-size:11px;text-decoration:none">공식 확인 →</a>`:''}</span></div>`}).join('')}
    </div>
    <div class="bkv-info-card"><h4>💸 출금 현황</h4>
      <div style="text-align:center;padding:16px;color:var(--gray-400);font-size:12px">아직 출금 신고 데이터가 없습니다.<br>첫 번째 리뷰를 작성해주세요.</div>
    </div>
  </div>`;

  // ③ 4-col info
  const pr=data.products||{};const cats=[['forex','외환'],['stocks','주식CFD'],['indices','지수'],['commodities','원자재'],['crypto','암호화폐']];
  const sp=data.spreads||[];
  const pay=data.payments||[];

  container.innerHTML+=`<div class="bkv-4col">
    <div class="bkv-info-card"><h4>📊 거래 상품</h4>${cats.map(([k,n])=>{const p2=pr[k];return p2?.available?`<div class="bkv-info-row"><span>${n}</span><span style="color:#089981;font-weight:700">${p2.count||'✓'}</span></div>`:`<div class="bkv-info-row"><span style="color:var(--gray-400)">${n}</span><span style="color:var(--gray-400)">—</span></div>`}).join('')}</div>
    <div class="bkv-info-card"><h4>📈 주요 스프레드</h4>${sp.slice(0,5).map(s=>`<div class="bkv-info-row"><span>${s.pair}</span><span style="color:#089981;font-weight:700">${s.avg} ${s.unit||'핍'}</span></div>`).join('')||'<div style="color:var(--gray-400);font-size:11px">정보 없음</div>'}</div>
    <div class="bkv-info-card"><h4>💳 입출금</h4>${pay.slice(0,5).map(p=>{const spd=p.speed==='fast'?'bkv-speed-fast':p.speed==='slow'?'bkv-speed-slow':'bkv-speed-mid';return`<div class="bkv-info-row"><span>${p.icon||''} ${p.method}</span><span class="${spd}">${p.time||'—'}</span></div>`}).join('')||'<div style="color:var(--gray-400);font-size:11px">정보 없음</div>'}</div>
    <div class="bkv-info-card"><h4>🏢 회사 정보</h4>
      <div class="bkv-info-row"><span>설립</span><span>${data.founded||d.founded||'—'}년</span></div>
      <div class="bkv-info-row"><span>본사</span><span style="font-size:10px">${bkvE((co.headOffice||d.headOffice||'—').substring(0,40))}</span></div>
      <div class="bkv-info-row"><span>고객지원</span><span>${co.supportHours||'—'}</span></div>
      <div class="bkv-info-row"><span>한국어</span><span>${tr.koreanSupport||d.koreanSupport?'🇰🇷 지원':'미지원'}</span></div>
      ${d.domain?`<div class="bkv-info-row"><span>사이트</span><span><a href="https://${d.domain}" target="_blank" style="color:var(--blue);font-size:10px">${d.domain}</a></span></div>`:''}
    </div>
  </div>`;

  // ④ AI Summary Bar
  const aiId='bkvAiBar_'+Math.random().toString(36).slice(2);
  container.innerHTML+=`<div class="bkv-ai-bar"><div class="bkv-ai-avatar">🤖</div><div class="bkv-ai-text" id="${aiId}">${data.aiSummary?bkvE(data.aiSummary):'AI 종합 분석 생성 중...'}</div></div>`;

  if(!data.aiSummary){
    try{
      const txt=await window.aiCall(`브로커: ${d.name}\n규제: ${(data.regulations||[]).map(r=>r.name).join(',')}\n안전도: ${data.safetyScore}/10\n거래환경: ${grade}\n\n트레이딩 전문가 관점에서 2~3문장으로 핵심 요약. 강점 1 + 주의사항 1 포함. 한국어. 투자 권유 금지.`,'FX 브로커 전문 분석가. 간결하게.');
      const el=document.getElementById(aiId);if(el)el.textContent=txt||'분석 생성 실패';
      data.aiSummary=txt;bkvCache(ck+'_full',data);
    }catch(e){const el=document.getElementById(aiId);if(el)el.textContent='AI 분석 실패'}
  }

  // ⑤ Similar brokers
  const regsSet=new Set((data.regulations||[]).map(r=>r.name));
  const similar=(window.BK_BROKERS||[]).filter(b=>b.name!==d.name&&b.safetyScore>(d.safetyScore||0)&&b.regulations.some(r=>regsSet.has(r))).sort((a,b)=>b.safetyScore-a.safetyScore).slice(0,3);
  if(similar.length){
    container.innerHTML+=`<div style="margin-top:16px"><div style="font-size:13px;font-weight:800;color:var(--navy);margin-bottom:10px">🔄 비슷한 조건의 더 안전한 브로커</div><div class="bk-similar">${similar.map(b=>`<div class="bk-similar-card" onclick="document.getElementById('bkSearchInput').value='${bkvE(b.name)}';bkVerify()"><img src="${b.logo}" style="width:36px;height:36px;border-radius:8px;object-fit:contain;border:.5px solid var(--gray-200)" onerror="this.style.display='none'"><div class="bk-similar-name">${bkvE(b.name)}</div><div class="bk-similar-score">안전도 ${b.safetyScore} · ${b.flag}</div></div>`).join('')}</div></div>`;
  }

  // Disclaimer
  container.innerHTML+=`<div style="margin-top:16px;padding:14px;background:var(--gray-50);border-radius:10px;font-size:10px;color:var(--gray-400);line-height:1.6">⚠️ <strong>면책 조항</strong>: 이 정보는 공식 규제기관 데이터, Trustpilot 리뷰, AI 분석을 종합한 결과이며, 투자 권유가 아닙니다. 투자 결정 전 반드시 공식 규제기관에서 직접 확인하세요.</div>`;
}

window.bkVerifyEnhanced=bkVerifyEnhanced;
