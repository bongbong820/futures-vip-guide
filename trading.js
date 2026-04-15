// Spread Comparison Trading — DUAL CHART (fixed)
const TSYMS=[
  {id:'NQ',name:'NQ',desc:'나스닥100',base:21340},
  {id:'ES',name:'ES',desc:'S&P500',base:5842},
  {id:'GOLD',name:'GOLD',desc:'금',base:3142},
  {id:'BTC',name:'BTC/USD',desc:'비트코인',base:83420},
  {id:'OIL',name:'OIL',desc:'원유',base:71.24},
  {id:'HSI',name:'HSI',desc:'항셍',base:19840}
];
const TBROKERS={
  icm:{n:'IC Markets',NQ:.5,ES:.4,GOLD:.3,BTC:42,OIL:.03,HSI:12},
  pep:{n:'Pepperstone',NQ:.7,ES:.5,GOLD:.4,BTC:55,OIL:.04,HSI:15},
  tkm:{n:'Tickmill',NQ:.9,ES:.6,GOLD:.5,BTC:60,OIL:.05,HSI:18},
  oan:{n:'OANDA',NQ:1.4,ES:1.2,GOLD:.8,BTC:80,OIL:.07,HSI:25},
  exn:{n:'Exness',NQ:2.0,ES:1.8,GOLD:1.2,BTC:95,OIL:.09,HSI:30},
  xm:{n:'XM',NQ:2.5,ES:2.2,GOLD:1.5,BTC:120,OIL:.12,HSI:40}
};
const TPIPVAL={NQ:20,ES:12.5,GOLD:10,BTC:1,OIL:10,HSI:5};
const MAXC=60;

let T={sym:'NQ',brokerA:'icm',brokerB:'oan',mid:21340,qtyA:1,qtyB:1,positions:[],realized:0,candles:[],tick:0,anim:null};

function trdOpen(){document.getElementById('trdPage').classList.add('show');trdInitAll()}
function trdClose(){document.getElementById('trdPage').classList.remove('show');if(T.anim)cancelAnimationFrame(T.anim);T.anim=null}

function trdInitAll(){
  const s=TSYMS.find(x=>x.id===T.sym);T.mid=s.base;T.candles=[];T.tick=0;
  let p=s.base;for(let i=0;i<MAXC;i++){T.candles.push(tMkC(p));p=T.candles[T.candles.length-1].c}
  T.mid=p;trdRenderSymBar();
  // Resize canvases after DOM is visible
  requestAnimationFrame(()=>{trdResizeAll();trdLoop()});
}

function tMkC(prev){
  const v=prev*0.006,o=prev+(Math.random()-.5)*v*.3,c=o+(Math.random()-.48)*v;
  return{o,h:Math.max(o,c)+Math.random()*v*.5,l:Math.min(o,c)-Math.random()*v*.5,c};
}

function tDec(){const s=TSYMS.find(x=>x.id===T.sym);return s.base>1000?1:s.base>100?2:s.base>10?3:4}
function tSp(bk){return TBROKERS[bk]?.[T.sym]||1}
function tAsk(bk){return T.mid+tSp(bk)/2}
function tBid(bk){return T.mid-tSp(bk)/2}

function trdSetSym(id){
  T.sym=id;const s=TSYMS.find(x=>x.id===id);T.mid=s.base;T.candles=[];T.tick=0;
  let p=s.base;for(let i=0;i<MAXC;i++){T.candles.push(tMkC(p));p=T.candles[T.candles.length-1].c}
  T.mid=p;trdRenderSymBar();trdRenderSpreadCompare();
}
function trdSetBrokerA(v){T.brokerA=v;trdRenderSpreadCompare()}
function trdSetBrokerB(v){T.brokerB=v;trdRenderSpreadCompare()}

function trdResizeAll(){
  ['trdCanvasA','trdCanvasB'].forEach(id=>{
    const c=document.getElementById(id);if(!c)return;
    const dpr=window.devicePixelRatio||1;
    const r=c.getBoundingClientRect();
    if(r.width<1)return;
    c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);
  });
}
window.addEventListener('resize',trdResizeAll);

// === MAIN LOOP ===
function trdLoop(){
  if(!document.getElementById('trdPage')?.classList.contains('show'))return;
  T.mid+=(Math.random()-.49)*T.mid*.0004+Math.sin(Date.now()*.0002)*.3;
  T.tick++;
  const last=T.candles[T.candles.length-1];
  last.c=T.mid;last.h=Math.max(last.h,T.mid);last.l=Math.min(last.l,T.mid);
  if(T.tick%40===0){T.candles.push({o:T.mid,h:T.mid,l:T.mid,c:T.mid});if(T.candles.length>MAXC)T.candles.shift()}

  trdDraw('trdCanvasA',T.brokerA);
  trdDraw('trdCanvasB',T.brokerB);
  trdUpdateUI();
  setTimeout(()=>{T.anim=requestAnimationFrame(trdLoop)},80);
}

// === DRAW CHART ===
function trdDraw(canvasId,bk){
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  const W=canvas.width,H=canvas.height;
  if(W<10||H<10)return;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);

  const cds=T.candles,n=cds.length;if(!n)return;
  const d=tDec(),sp=tSp(bk),dpr=window.devicePixelRatio||1;

  // Padding
  const PL=10,PR=60*dpr,PT=20,PB=20;
  const chartW=W-PL-PR,chartH=H-PT-PB;

  // Y range — computed fresh every frame from current candles
  const allH=cds.map(c=>c.h);
  const allL=cds.map(c=>c.l);
  const mn=Math.min(...allL)-Math.abs(T.mid)*0.003;
  const mx=Math.max(...allH)+Math.abs(T.mid)*0.003;
  const range=mx-mn||1;
  const ty=v=>PT+(mx-v)/range*chartH;

  // Candle width — fills full chart width
  const cw=chartW/MAXC;

  // Grid (5 lines)
  ctx.strokeStyle='#1e2130';ctx.lineWidth=1;
  ctx.font=Math.round(8*dpr)+'px Courier New';ctx.fillStyle='#3a4a5a';
  for(let i=0;i<5;i++){
    const val=mx-range*i/4;
    const y=ty(val);
    ctx.beginPath();ctx.moveTo(PL,y);ctx.lineTo(W-PR+10,y);ctx.stroke();
    ctx.fillText(val.toFixed(d),W-PR+14,y+3);
  }

  // Candles — left-aligned, fill full width
  for(let i=0;i<n;i++){
    const c=cds[i],up=c.c>=c.o;
    const x=PL+i*cw;
    const xc=x+cw/2;
    const bodyW=Math.max(2,cw*0.7);
    const bx=xc-bodyW/2;

    ctx.strokeStyle=up?'#3ab87a':'#e05050';ctx.lineWidth=Math.max(1,dpr);
    ctx.beginPath();ctx.moveTo(xc,ty(c.h));ctx.lineTo(xc,ty(c.l));ctx.stroke();

    ctx.fillStyle=up?'#3ab87a':'#e05050';
    const top=ty(Math.max(c.o,c.c)),bot=ty(Math.min(c.o,c.c));
    ctx.fillRect(bx,top,bodyW,Math.max(1,bot-top));
  }

  // Spread band
  const askY=ty(T.mid+sp/2),bidY=ty(T.mid-sp/2);
  ctx.fillStyle='rgba(74,158,255,0.06)';
  ctx.fillRect(PL,askY,chartW,bidY-askY);
  ctx.setLineDash([3,3]);ctx.lineWidth=1;
  ctx.strokeStyle='rgba(58,184,122,.4)';ctx.beginPath();ctx.moveTo(PL,askY);ctx.lineTo(PL+chartW,askY);ctx.stroke();
  ctx.strokeStyle='rgba(224,80,80,.4)';ctx.beginPath();ctx.moveTo(PL,bidY);ctx.lineTo(PL+chartW,bidY);ctx.stroke();
  ctx.setLineDash([]);
  // Spread label
  ctx.fillStyle='#4a8eff';ctx.font='bold '+Math.round(9*dpr)+'px Courier New';
  ctx.fillText('SP '+sp,(PL+chartW)/2,((askY+bidY)/2)+4);

  // Position entry lines — same ty() function
  T.positions.filter(p=>p.sym===T.sym&&p.broker===bk).forEach(pos=>{
    const y=ty(pos.entry);
    ctx.setLineDash([6,4]);ctx.strokeStyle=pos.side==='buy'?'rgba(58,184,122,.8)':'rgba(224,80,80,.8)';
    ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PL,y);ctx.lineTo(PL+chartW,y);ctx.stroke();ctx.setLineDash([]);
    // Entry tag (left)
    const pnl=pos.side==='buy'?(tBid(bk)-pos.entry)*(TPIPVAL[T.sym]||1)*pos.qty:(pos.entry-tAsk(bk))*(TPIPVAL[T.sym]||1)*pos.qty;
    ctx.fillStyle=pos.side==='buy'?'#1a4a2a':'#5a1a1a';
    const tw=75*dpr/2;
    ctx.fillRect(PL,y-9,tw,18);
    ctx.fillStyle='#fff';ctx.font=Math.round(8*dpr)+'px Courier New';
    ctx.fillText((pos.side==='buy'?'▲BUY ':'▼SELL ')+pos.entry.toFixed(d),PL+4,y+3);
    // PnL tag (right)
    ctx.fillStyle=pnl>=0?'#1a4a2a':'#5a1a1a';
    const pw=50*dpr/2;
    ctx.fillRect(PL+chartW-pw,y-9,pw,18);
    ctx.fillStyle=pnl>=0?'#3ab87a':'#e05050';ctx.font='bold '+Math.round(9*dpr)+'px Courier New';
    ctx.fillText((pnl>=0?'+':'')+pnl.toFixed(1),PL+chartW-pw+3,y+3);
  });

  // Current price line — same ty()
  const curY=ty(T.mid);
  ctx.strokeStyle='#4a6a8a';ctx.lineWidth=1;ctx.setLineDash([2,2]);
  ctx.beginPath();ctx.moveTo(PL,curY);ctx.lineTo(PL+chartW,curY);ctx.stroke();ctx.setLineDash([]);
  // Price label (right)
  const plw=48*dpr/2;
  ctx.fillStyle=T.candles[0]&&T.mid>=T.candles[0].o?'#1a4a2a':'#5a1a1a';
  ctx.fillRect(W-PR+10,curY-9,plw,18);
  ctx.fillStyle='#fff';ctx.font='bold '+Math.round(9*dpr)+'px Courier New';
  ctx.fillText(T.mid.toFixed(d),W-PR+14,curY+3);
}

// === UI UPDATE ===
function trdUpdateUI(){
  const d=tDec();
  ['A','B'].forEach(side=>{
    const bk=side==='A'?T.brokerA:T.brokerB;
    const br=TBROKERS[bk];if(!br)return;
    const sp=tSp(bk),ask=tAsk(bk),bid=tBid(bk);
    const panel=document.getElementById('trdPanel'+side);if(!panel)return;
    // Spread info
    const spEl=panel.querySelector('.trd-panel-spread');
    if(spEl)spEl.innerHTML=`<span class="trd-panel-spread-val">SP ${sp}</span><span class="trd-panel-spread-cost">$${(sp*(TPIPVAL[T.sym]||1)).toFixed(1)}/계약</span>`;
    // Bid/Ask overlay
    const ba=panel.querySelector('.trd-panel-bidask');
    if(ba)ba.innerHTML=`<div style="color:#3ab87a;font-weight:700">${ask.toFixed(d)}</div><div style="color:#4a6a8a;font-size:9px">SP ${sp}</div><div style="color:#e05050;font-weight:700">${bid.toFixed(d)}</div>`;
    // Button prices
    panel.querySelectorAll('.trd-buy-price').forEach(e=>e.textContent=ask.toFixed(d));
    panel.querySelectorAll('.trd-sell-price').forEach(e=>e.textContent=bid.toFixed(d));
  });
  // Positions PnL
  let totalPnl=0;
  T.positions.forEach(p=>{
    p.pnl=p.side==='buy'?(tBid(p.broker)-p.entry)*(TPIPVAL[p.sym]||1)*p.qty:(p.entry-tAsk(p.broker))*(TPIPVAL[p.sym]||1)*p.qty;
    totalPnl+=p.pnl;
  });
  trdRenderPositions();
  const bal=10000+T.realized+totalPnl;
  const bE=document.getElementById('trdBal');if(bE)bE.textContent='$'+bal.toFixed(2);
  const eE=document.getElementById('trdEPnl');if(eE){eE.textContent=(totalPnl>=0?'+':'')+totalPnl.toFixed(2);eE.style.color=totalPnl>=0?'#3ab87a':'#e05050'}
  const rE=document.getElementById('trdRPnl');if(rE){rE.textContent=(T.realized>=0?'+':'')+T.realized.toFixed(2);rE.style.color=T.realized>=0?'#3ab87a':'#e05050'}
}

// === ORDERS ===
function trdBuy(bk){T.positions.push({sym:T.sym,side:'buy',entry:tAsk(bk),qty:bk===T.brokerA?T.qtyA:T.qtyB,broker:bk,pnl:0})}
function trdSell(bk){T.positions.push({sym:T.sym,side:'sell',entry:tBid(bk),qty:bk===T.brokerA?T.qtyA:T.qtyB,broker:bk,pnl:0})}
function trdClosePos(i){if(i>=0&&i<T.positions.length){T.realized+=T.positions[i].pnl;T.positions.splice(i,1)}}
function trdQtyA(d){T.qtyA=Math.max(0.1,Math.round((T.qtyA+d)*10)/10);const e=document.getElementById('trdQtyA');if(e)e.value=T.qtyA}
function trdQtyB(d){T.qtyB=Math.max(0.1,Math.round((T.qtyB+d)*10)/10);const e=document.getElementById('trdQtyB');if(e)e.value=T.qtyB}

// === POSITIONS RENDER ===
function trdRenderPositions(){
  const el=document.getElementById('trdPosList');if(!el)return;
  if(!T.positions.length){el.innerHTML='<div class="trd-pos-empty">BUY / SELL로 두 브로커의 스프레드 차이를 비교해보세요</div>';return}
  el.innerHTML=T.positions.map((p,i)=>{
    const c=p.pnl>=0?'#3ab87a':'#e05050';
    const br=TBROKERS[p.broker];
    return`<div class="trd-pos-card ${p.side}"><div class="trd-pos-top"><span class="trd-pos-sym">${p.sym} <span class="trd-pos-side ${p.side}">${p.side==='buy'?'매수':'매도'}</span></span><span class="trd-pos-pnl" style="color:${c}">${p.pnl>=0?'+':''}$${p.pnl.toFixed(2)}</span></div><div class="trd-pos-detail">${br?.n||''} · ${p.qty}계약 · ${p.entry.toFixed(tDec())}</div><button class="trd-pos-close" onclick="trdClosePos(${i})">✕ 청산</button></div>`;
  }).join('');
}

// === SPREAD COMPARE ===
function trdRenderSpreadCompare(){
  const el=document.getElementById('trdSpList');if(!el)return;
  const sym=T.sym;const pv=TPIPVAL[sym]||1;
  const list=Object.entries(TBROKERS).map(([k,b])=>({k,n:b.n,sp:b[sym]||0,cost:(b[sym]||0)*pv})).sort((a,b)=>a.sp-b.sp);
  const maxSp=list[list.length-1]?.sp||1;
  const colors=['#3ab87a','#4a8eff','#6ab87a','#f5a623','#e08050','#e05050'];
  el.innerHTML=list.map((b,i)=>{
    const pct=Math.round(b.sp/maxSp*100);
    const isA=b.k===T.brokerA,isB=b.k===T.brokerB;
    const tag=isA?'<span style="color:#4a8eff;font-size:8px;margin-left:3px">A</span>':isB?'<span style="color:#f5a623;font-size:8px;margin-left:3px">B</span>':'';
    return`<div class="trd-sp-item"><span class="trd-sp-name">${b.n}${tag}</span><div class="trd-sp-bar-wrap"><div class="trd-sp-bar" style="width:${pct}%;background:${colors[i]}"></div></div><span class="trd-sp-val" style="color:${colors[i]}">${b.sp}p</span><span class="trd-sp-cost">-$${b.cost.toFixed(0)}</span>${i===0?'<span class="trd-sp-best">최저</span>':''}</div>`;
  }).join('');
}

function trdRightTab(t){
  document.getElementById('trdPosPanel').style.display=t===0?'':'none';
  document.getElementById('trdSpPanel').style.display=t===1?'':'none';
  document.querySelectorAll('.trd-right-tab').forEach((el,i)=>el.classList.toggle('active',i===t));
  if(t===1)trdRenderSpreadCompare();
}

// === SYM BAR ===
function trdRenderSymBar(){
  const bar=document.getElementById('trdSymBar');if(!bar)return;
  bar.innerHTML=TSYMS.map(s=>`<button class="trd-sym-btn ${s.id===T.sym?'active':''}" onclick="trdSetSym('${s.id}')">${s.name}</button>`).join('');
  trdRenderSpreadCompare();
}

// Globals
window.trdOpen=trdOpen;window.trdClose=trdClose;window.trdSetSym=trdSetSym;
window.trdSetBrokerA=trdSetBrokerA;window.trdSetBrokerB=trdSetBrokerB;
window.trdBuy=trdBuy;window.trdSell=trdSell;window.trdClosePos=trdClosePos;
window.trdQtyA=trdQtyA;window.trdQtyB=trdQtyB;window.trdRightTab=trdRightTab;
window.trdRenderSpreadCompare=trdRenderSpreadCompare;window.T=T;
