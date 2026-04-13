// Broker Verification Enhanced - WikiFX Level
// Called after bkRenderVerify renders the basic card

// BK_REG_URLS is defined in index.html, reuse it
const BK_REG_URLS2 = window.BK_REG_URLS || {};

// Enhanced verification - called with broker data + target container
async function bkVerifyEnhanced(d, container) {
  const GROQ_KEY = window.GROQ_KEY;
  const GROQ_URL = window.GROQ_URL;
  const GROQ_MODEL = window.GROQ_MODEL;

  // 1. License details via AI
  const licenseEl = document.createElement('div');
  licenseEl.className = 'bk-layer';
  licenseEl.innerHTML = '<div class="bk-layer-header">🏛 라이선스 상세</div><div class="bk-layer-body"><div class="st-ai-loading">AI로 라이선스 정보 조회 중<span class="st-dots"></span></div></div>';
  container.appendChild(licenseEl);

  // 2. Company intro
  const companyEl = document.createElement('div');
  companyEl.className = 'bk-layer';
  companyEl.innerHTML = '<div class="bk-layer-header">🏢 회사 소개 & 연락처</div><div class="bk-layer-body"><div class="st-ai-loading">로딩 중<span class="st-dots"></span></div></div>';
  container.appendChild(companyEl);

  // 3. Payment methods
  const payEl = document.createElement('div');
  payEl.className = 'bk-layer';
  payEl.innerHTML = '<div class="bk-layer-header">💳 입출금 방법</div><div class="bk-layer-body"><div class="st-ai-loading">로딩 중<span class="st-dots"></span></div></div>';
  container.appendChild(payEl);

  // 4. Trading products
  const prodEl = document.createElement('div');
  prodEl.className = 'bk-layer';
  prodEl.innerHTML = '<div class="bk-layer-header">📊 거래 상품</div><div class="bk-layer-body"><div class="st-ai-loading">로딩 중<span class="st-dots"></span></div></div>';
  container.appendChild(prodEl);

  // 5. Spread table
  const spreadEl = document.createElement('div');
  spreadEl.className = 'bk-layer';
  spreadEl.innerHTML = '<div class="bk-layer-header">📈 주요 페어 스프레드</div><div class="bk-layer-body"><div class="st-ai-loading">로딩 중<span class="st-dots"></span></div></div>';
  container.appendChild(spreadEl);

  // 6. Mini calculator
  const calcEl = document.createElement('div');
  calcEl.className = 'bk-layer';
  calcEl.innerHTML = `<div class="bk-layer-header">🧮 거래 조건 계산기</div>
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
  container.appendChild(calcEl);

  // 7. Share buttons
  const shareEl = document.createElement('div');
  shareEl.style.cssText = 'display:flex;gap:6px;margin:16px 0;flex-wrap:wrap';
  const url = window.location.href;
  shareEl.innerHTML = `
    <button onclick="navigator.clipboard.writeText('${d.name} 브로커 검증 결과 - 안전도 ${d.safetyScore}/100\\n${url}');alert('링크가 복사되었습니다!')" style="padding:6px 14px;border:1px solid var(--gray-200);border-radius:8px;background:var(--white);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font)">📋 링크 복사</button>
    <a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(d.name+' 안전도 '+d.safetyScore+'/100')}" target="_blank" style="padding:6px 14px;border:1px solid var(--gray-200);border-radius:8px;background:var(--white);font-size:11px;font-weight:600;cursor:pointer;text-decoration:none;color:var(--navy)">✈️ 텔레그램</a>`;
  container.appendChild(shareEl);

  // 8. Disclaimer
  const discEl = document.createElement('div');
  discEl.style.cssText = 'margin-top:16px;padding:14px;background:var(--gray-50);border-radius:10px;font-size:10px;color:var(--gray-400);line-height:1.6';
  discEl.innerHTML = '⚠️ <strong>면책 조항</strong>: 이 정보는 공식 규제기관 데이터, Trustpilot 리뷰, AI 분석을 종합한 결과이며, 투자 권유가 아닙니다. 투자 결정 전 반드시 공식 규제기관에서 직접 확인하세요. 데이터의 정확성을 보장하지 않으며, 투자 손실에 대한 책임을 지지 않습니다.';
  container.appendChild(discEl);

  // Init calculator
  window._bkCalcBroker = d;
  bkCalcUpdate();

  // Fetch all AI data in one call
  try {
    const prompt = `FX 브로커 "${d.name}" 상세 정보를 JSON으로만 응답:
{
  "licenses": [{"reg":"규제기관","number":"라이선스번호","status":"Active/Inactive","validUntil":"만료일 또는 null"}],
  "company": {"desc":"공식소개 200자","history":"연혁 150자","awards":["수상1","수상2"],"headOffice":"본사주소","employees":"직원수","email":"이메일","phone":"전화","supportLangs":["한국어","영어"],"supportHours":"24/5","supportChannels":["라이브챗","이메일"]},
  "payments": {"deposit":[{"method":"Visa","minAmount":"$10","time":"즉시","fee":"무료","krw":true}],"withdrawal":[{"method":"Visa","minAmount":"$50","time":"1~3일","fee":"무료"}]},
  "products": {"fx":{"count":60,"note":"주요 및 마이너 페어"},"stocks":{"count":0,"note":""},"indices":{"count":20,"note":""},"commodities":{"count":15,"note":"금,은,원유"},"crypto":{"count":25,"note":"BTC,ETH 등"}},
  "spreads": [{"pair":"EUR/USD","avg":"0.1","min":"0.0","type":"ECN"},{"pair":"GBP/USD","avg":"0.2","min":"0.1","type":"ECN"},{"pair":"USD/JPY","avg":"0.1","min":"0.0","type":"ECN"},{"pair":"XAU/USD","avg":"15","min":"10","type":"CFD"},{"pair":"NAS100","avg":"0.5","min":"0.3","type":"CFD"},{"pair":"BTC/USD","avg":"30","min":"20","type":"CFD"}]
}
정확하지 않으면 null. 한국어로.`;

    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
      body: JSON.stringify({ model: GROQ_MODEL, messages: [
        { role: 'system', content: '너는 FX 브로커 데이터베이스야. 정확한 JSON만 반환.' },
        { role: 'user', content: prompt }
      ], max_tokens: 3000 })
    });
    const rData = await resp.json();
    const text = rData.choices?.[0]?.message?.content || '';
    const start = text.indexOf('{'), end = text.lastIndexOf('}');
    const info = start >= 0 && end >= 0 ? JSON.parse(text.substring(start, end + 1)) : null;

    if (!info) throw new Error('Parse failed');

    // Render licenses
    const topRegs = { CFTC: 1, NFA: 1, FCA: 1, ASIC: 1, BaFin: 1, MAS: 1, FINMA: 1 };
    const midRegs = { CySEC: 1, DFSA: 1 };
    licenseEl.querySelector('.bk-layer-body').innerHTML = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="border-bottom:2px solid var(--gray-200)"><th style="text-align:left;padding:8px">규제기관</th><th>상태</th><th>라이선스 번호</th><th>만료일</th><th></th></tr></thead><tbody>' +
      (info.licenses || []).map(l => {
        const isTop = topRegs[l.reg];
        const isMid = midRegs[l.reg];
        const stateCls = l.status === 'Active' ? 'bk-check-ok' : 'bk-check-warn';
        const stateIcon = l.status === 'Active' ? '✅ 유효' : '⚠️ 확인불가';
        const url = BK_REG_URLS2[l.reg];
        return `<tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:8px;font-weight:700"><span class="bk-reg-badge ${isTop ? 'top' : isMid ? 'mid' : 'low'}">${l.reg}</span></td><td class="${stateCls}" style="text-align:center">${stateIcon}</td><td style="text-align:center">${l.number || '—'} ${l.number ? '<button onclick="navigator.clipboard.writeText(\'' + l.number + '\');this.textContent=\'✓\';setTimeout(()=>this.textContent=\'📋\',1000)" style="background:none;border:none;cursor:pointer;font-size:12px" title="복사">📋</button>' : ''}</td><td style="text-align:center;font-size:11px">${l.validUntil || '—'}</td><td>${url ? '<a href="' + url + '" target="_blank" class="bk-ext-link" style="font-size:10px">공식 확인 →</a>' : ''}</td></tr>`;
      }).join('') + '</tbody></table></div>';

    // Company info
    const c = info.company || {};
    const hasKorean = (c.supportLangs || []).some(l => l.includes('한국'));
    companyEl.querySelector('.bk-layer-body').innerHTML = `
      <div style="margin-bottom:10px">${c.desc || ''}</div>
      ${c.history ? '<div style="margin-bottom:10px;color:var(--gray-500);font-size:11px">📜 ' + c.history + '</div>' : ''}
      ${(c.awards || []).length ? '<div style="margin-bottom:10px"><strong>🏆 수상 이력</strong><br>' + c.awards.map(a => '· ' + a).join('<br>') + '</div>' : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
        ${c.headOffice ? '<div>📍 ' + c.headOffice + '</div>' : ''}
        ${d.domain ? '<div>🌐 <a href="https://' + d.domain + '" target="_blank" style="color:var(--blue)">' + d.domain + '</a></div>' : ''}
        ${c.email ? '<div>📧 ' + c.email + '</div>' : ''}
        ${c.phone ? '<div>📞 ' + c.phone + '</div>' : ''}
        ${c.employees ? '<div>👥 직원 ' + c.employees + '</div>' : ''}
        <div>⏰ ${c.supportHours || '—'}</div>
      </div>
      <div style="margin-top:8px">${hasKorean ? '<span style="background:#d1fae5;color:#089981;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">🇰🇷 한국어 지원</span>' : '<span style="background:var(--gray-100);color:var(--gray-500);padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600">한국어 미지원</span>'} ${(c.supportChannels || []).map(ch => '<span style="background:var(--gray-100);padding:3px 8px;border-radius:6px;font-size:11px;margin-left:4px">' + ch + '</span>').join('')}</div>`;

    // Payments
    const pay = info.payments || {};
    const depMethods = (pay.deposit || []);
    const wdMethods = (pay.withdrawal || []);
    const payIcons = { 'Visa': '💳', 'Mastercard': '💳', '은행송금': '🏦', 'PayPal': '💰', 'Skrill': '⚡', 'Neteller': '🎰', 'Bitcoin': '₿', 'Ethereum': 'Ξ', 'USDT': '🔵', '카드': '💳' };
    payEl.querySelector('.bk-layer-body').innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px">입금 방법</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${depMethods.map(m => {
        const icon = payIcons[m.method] || '💰';
        return `<div style="padding:6px 10px;background:var(--blue-light);border-radius:8px;font-size:11px;font-weight:600;color:var(--blue)" title="최소 ${m.minAmount} · ${m.time} · 수수료 ${m.fee}">${icon} ${m.method}${m.krw ? ' 🇰🇷' : ''}</div>`;
      }).join('')}</div>
      <div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px">출금 방법</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${wdMethods.map(m => {
        const icon = payIcons[m.method] || '💰';
        return `<div style="padding:6px 10px;background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;font-size:11px;font-weight:600" title="최소 ${m.minAmount} · ${m.time} · 수수료 ${m.fee}">${icon} ${m.method}</div>`;
      }).join('')}</div>`;

    // Products
    const p = info.products || {};
    const cats = [
      { key: 'fx', icon: '💱', name: '외환' },
      { key: 'stocks', icon: '📈', name: '주식 CFD' },
      { key: 'indices', icon: '📊', name: '지수' },
      { key: 'commodities', icon: '🥇', name: '원자재' },
      { key: 'crypto', icon: '₿', name: '암호화폐' }
    ];
    prodEl.querySelector('.bk-layer-body').innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">' +
      cats.map(cat => {
        const data = p[cat.key];
        const count = data?.count || 0;
        const active = count > 0;
        return `<div style="padding:12px;border-radius:10px;text-align:center;${active ? 'background:var(--blue-light);border:1px solid var(--blue)' : 'background:var(--gray-50);border:1px solid var(--gray-200);opacity:.5'}"><div style="font-size:20px">${cat.icon}</div><div style="font-size:12px;font-weight:700;${active ? 'color:var(--blue)' : 'color:var(--gray-400)'}">${cat.name}</div><div style="font-size:11px;color:var(--gray-500)">${count > 0 ? count + '+' : '미지원'}</div></div>`;
      }).join('') + '</div>';

    // Spreads
    spreadEl.querySelector('.bk-layer-body').innerHTML = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="border-bottom:2px solid var(--gray-200)"><th style="text-align:left;padding:6px">페어</th><th>평균 스프레드</th><th>최소</th><th>유형</th></tr></thead><tbody>' +
      (info.spreads || []).map(s =>
        `<tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:6px;font-weight:700">${s.pair}</td><td style="text-align:center">${s.avg}</td><td style="text-align:center;color:var(--green)">${s.min}</td><td style="text-align:center"><span style="background:var(--blue-light);color:var(--blue);padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">${s.type}</span></td></tr>`
      ).join('') + '</tbody></table></div>';

  } catch (e) {
    console.error('Enhanced verify error:', e);
    [licenseEl, companyEl, payEl, prodEl, spreadEl].forEach(el => {
      const body = el.querySelector('.bk-layer-body');
      if (body) body.innerHTML = '<div style="color:var(--gray-400);text-align:center;padding:10px">데이터 로딩 실패</div>';
    });
  }
}

// Mini calculator
function bkCalcUpdate() {
  const b = window._bkCalcBroker;
  if (!b) return;
  const pair = document.getElementById('bkCalcPair')?.value || 'EURUSD';
  const lot = parseFloat(document.getElementById('bkCalcLot')?.value || 1);
  const lev = parseInt(document.getElementById('bkCalcLev')?.value || 500);

  const pairData = {
    EURUSD: { pipVal: 10, price: 1.08, spread: 0.1 },
    GBPUSD: { pipVal: 10, price: 1.26, spread: 0.2 },
    USDJPY: { pipVal: 6.7, price: 150, spread: 0.1 },
    NAS100: { pipVal: 1, price: 18000, spread: 50 },
    XAUUSD: { pipVal: 1, price: 2350, spread: 15 }
  };
  const pd = pairData[pair] || pairData.EURUSD;
  const notional = pd.price * 100000 * lot;
  const margin = notional / lev;
  const spreadCost = pd.spread * pd.pipVal * lot;
  const commission = lot * 3.5 * 2; // round trip

  const el = document.getElementById('bkCalcResult');
  if (el) {
    el.innerHTML = `
      <div>필요 증거금<br><strong style="font-size:16px;color:var(--navy)">$${margin.toFixed(2)}</strong></div>
      <div>스프레드 비용<br><strong style="font-size:16px;color:var(--orange)">$${spreadCost.toFixed(2)}</strong></div>
      <div>왕복 수수료<br><strong style="font-size:16px;color:var(--gray-600)">$${commission.toFixed(2)}</strong></div>
      <div>총 비용<br><strong style="font-size:16px;color:var(--red)">$${(spreadCost + commission).toFixed(2)}</strong></div>`;
  }
}

// Make functions globally accessible
window.bkVerifyEnhanced = bkVerifyEnhanced;
window.bkCalcUpdate = bkCalcUpdate;
