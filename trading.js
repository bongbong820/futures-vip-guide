// Spread Comparison Trading — Self-contained module
const TRD_SYMS=[
  {id:'NQ',name:'NQ',desc:'나스닥100',base:21340,pip:.5},
  {id:'ES',name:'ES',desc:'S&P500',base:5842,pip:.25},
  {id:'GOLD',name:'GOLD',desc:'금',base:3142,pip:.1},
  {id:'BTC',name:'BTC/USD',desc:'비트코인',base:83420,pip:1},
  {id:'OIL',name:'OIL',desc:'원유',base:71.24,pip:.01},
  {id:'HSI',name:'HSI',desc:'항셍지수',base:19840,pip:1}
];
const TRD_BROKERS={
  icm:{n:'IC Markets',NQ:.5,ES:.4,GOLD:.3,BTC:42,OIL:.03,HSI:12},
  pep:{n:'Pepperstone',NQ:.7,ES:.5,GOLD:.4,BTC:55,OIL:.04,HSI:15},
  tkm:{n:'Tickmill',NQ:.9,ES:.6,GOLD:.5,BTC:60,OIL:.05,HSI:18},
  oan:{n:'OANDA',NQ:1.4,ES:1.2,GOLD:.8,BTC:80,OIL:.07,HSI:25},
  exn:{n:'Exness',NQ:2.0,ES:1.8,GOLD:1.2,BTC:95,OIL:.09,HSI:30},
  xm:{n:'XM',NQ:2.5,ES:2.2,GOLD:1.5,BTC:120,OIL:.12,HSI:40}
};
const TRD_PIPVAL={NQ:20,ES:12.5,GOLD:10,BTC:1,OIL:10,HSI:5};

let trd={sym:'NQ',broker:'icm',mid:21340,qty:1,positions:[],realized:0,candles:[],tick:0,anim:null};

function trdOpen(){
  document.getElementById('trdPage').classList.add('show');
  trdInit();
}
function trdClose(){
  document.getElementById('trdPage').classList.remove('show');
  cancelAnimationFrame(trd.anim);
}

function trdInit(){
  const s=TRD_SYMS.find(x=>x.id===trd.sym);
  trd.mid=s.base;
  trd.candles=[];
  let p=s.base;
  for(let i=0;i<60;i++){const c=mkCandle(p);trd.candles.push(c);p=c.c}
  trd.mid=p;trd.tick=0;
  trdRenderWatch();trdRenderRight();trdLoop();
}

function mkCandle(prev){
  const vol=prev*0.006;
  const o=prev+(Math.random()-0.5)*vol*0.3;
  const c=o+(Math.random()-0.48)*vol;
  const h=Math.max(o,c)+Math.random()*vol*0.5;
  const l=Math.min(o,c)-Math.random()*vol*0.5;
  return{o,h,l,c};
}

function trdSetSym(id){
  trd.sym=id;const s=TRD_SYMS.find(x=>x.id===id);
  trd.mid=s.base;trd.candles=[];
  let p=s.base;for(let i=0;i<60;i++){const c=mkCandle(p);trd.candles.push(c);p=c.c}
  trd.mid=p;trd.tick=0;
  trdRenderWatch();
}

function trdSetBroker(v){trd.broker=v}

// Main loop
function trdLoop(){
  trd.mid+=(Math.random()-0.49)*trd.mid*0.0004+Math.sin(Date.now()*0.0002)*0.3;
  trd.tick++;

  // Update current candle
  const last=trd.candles[trd.candles.length-1];
  last.c=trd.mid;
  last.h=Math.max(last.h,trd.mid);
  last.l=Math.min(last.l,trd.mid);

  if(trd.tick%40===0){
    trd.candles.push({o:trd.mid,h:trd.mid,l:trd.mid,c:trd.mid});
    if(trd.candles.length>60)trd.candles.shift();
  }

  trdDrawChart();trdUpdateUI();
  setTimeout(()=>{trd.anim=requestAnimationFrame(trdLoop)},80);
}

function trdSpread(){return TRD_BROKERS[trd.broker][trd.sym]||1}
function trdAsk(){return trd.mid+trdSpread()/2}
function trdBid(){return trd.mid-trdSpread()/2}
function trdDec(){const s=TRD_SYMS.find(x=>x.id===trd.sym);return s.base>1000?1:s.base>100?2:s.base>10?3:4}

// Draw candle chart
function trdDrawChart(){
  const canvas=document.getElementById('trdCanvas');
  if(!canvas||!canvas.offsetWidth)return;
  const dpr=window.devicePixelRatio||1;
  if(canvas.width!==canvas.offsetWidth*dpr){canvas.width=canvas.offsetWidth*dpr;canvas.height=canvas.offsetHeight*dpr}
  const W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const cds=trd.candles,n=cds.length;if(!n)return;
  const allP=cds.flatMap(c=>[c.h,c.l]);
  const mn=Math.min(...allP),mx=Math.max(...allP);
  const pad=40,range=(mx-mn)||1;
  const yOf=v=>pad+(H-pad*2)*(1-(v-mn)/range);
  const cw=Math.max(4,(W-80)/n);
  const gap=Math.max(1,cw*0.2);

  // Grid
  ctx.strokeStyle='#1a1d26';ctx.lineWidth=1;ctx.font=(10*dpr)+'px Courier New';ctx.fillStyle='#3a4a5a';
  for(let i=0;i<5;i++){const y=pad+(H-pad*2)*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    ctx.fillText((mx-range*i/4).toFixed(trdDec()),W-70*dpr,y-4)}

  // Candles
  for(let i=0;i<n;i++){
    const c=cds[i],x=40+i*(cw+gap),up=c.c>=c.o;
    ctx.fillStyle=up?'#3ab87a':'#e05050';
    ctx.strokeStyle=up?'#3ab87a':'#e05050';ctx.lineWidth=1;
    // Wick
    const xc=x+cw/2;
    ctx.beginPath();ctx.moveTo(xc,yOf(c.h));ctx.lineTo(xc,yOf(c.l));ctx.stroke();
    // Body
    const top=yOf(Math.max(c.o,c.c)),bot=yOf(Math.min(c.o,c.c));
    const bh=Math.max(1,bot-top);
    ctx.fillRect(x,top,cw,bh);
  }

  // Position lines
  trd.positions.forEach(pos=>{
    if(pos.sym!==trd.sym)return;
    const y=yOf(pos.entry);
    ctx.setLineDash([6,4]);ctx.strokeStyle=pos.side==='buy'?'rgba(58,184,122,.7)':'rgba(224,80,80,.7)';
    ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
    // Tag
    const pnl=pos.side==='buy'?(trdBid()-pos.entry)*TRD_PIPVAL[pos.sym]*pos.qty:(pos.entry-trdAsk())*TRD_PIPVAL[pos.sym]*pos.qty;
    ctx.fillStyle=pos.side==='buy'?'#1a4a2a':'#5a1a1a';
    ctx.fillRect(4,y-10,90*dpr/2,20);
    ctx.fillStyle='#fff';ctx.font=(9*dpr)+'px Courier New';
    ctx.fillText((pos.side==='buy'?'▲ BUY ':'▼ SELL ')+pos.entry.toFixed(trdDec()),8,y+4);
    // PnL tag right
    ctx.fillStyle=pnl>=0?'#1a4a2a':'#5a1a1a';
    ctx.fillRect(W-70*dpr/2,y-10,70*dpr/2,20);
    ctx.fillStyle=pnl>=0?'#3ab87a':'#e05050';ctx.font='bold '+(10*dpr)+'px Courier New';
    ctx.fillText((pnl>=0?'+':'')+pnl.toFixed(2),W-66*dpr/2,y+4);
  });

  // Current price line
  const curY=yOf(trd.mid);
  ctx.strokeStyle=trd.mid>=trd.candles[0].o?'#3ab87a':'#e05050';
  ctx.lineWidth=1;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(0,curY);ctx.lineTo(W,curY);ctx.stroke();ctx.setLineDash([]);
  // Price label
  ctx.fillStyle=trd.mid>=trd.candles[0].o?'#1a4a2a':'#5a1a1a';
  ctx.fillRect(W-60*dpr/2,curY-10,60*dpr/2,20);
  ctx.fillStyle='#fff';ctx.font='bold '+(10*dpr)+'px Courier New';
  ctx.fillText(trd.mid.toFixed(trdDec()),W-56*dpr/2,curY+4);
}

// Update all UI
function trdUpdateUI(){
  const d=trdDec(),sp=trdSpread(),ask=trdAsk(),bid=trdBid();
  const s=TRD_SYMS.find(x=>x.id===trd.sym);
  // Header
  const hdrP=document.getElementById('trdHdrPrice');
  if(hdrP){hdrP.textContent=trd.mid.toFixed(d);hdrP.style.color=trd.mid>=s.base?'#3ab87a':'#e05050'}
  // Bid/Ask overlay
  const ba=document.getElementById('trdBidAsk');
  if(ba)ba.innerHTML=`<div class="trd-bidask-ask">${ask.toFixed(d)}</div><div class="trd-bidask-sp">SPREAD ${sp}</div><div class="trd-bidask-bid">${bid.toFixed(d)}</div>`;
  // Buy/Sell buttons
  const buyP=document.getElementById('trdBuyPrice');if(buyP)buyP.textContent=ask.toFixed(d);
  const sellP=document.getElementById('trdSellPrice');if(sellP)sellP.textContent=bid.toFixed(d);
  const buySub=document.getElementById('trdBuySub');if(buySub)buySub.textContent='ASK · '+sp+'p';
  const sellSub=document.getElementById('trdSellSub');if(sellSub)sellSub.textContent='BID · '+sp+'p';
  // Cost
  const cost=sp*(TRD_PIPVAL[trd.sym]||1)*trd.qty;
  const costEl=document.getElementById('trdCost');if(costEl)costEl.textContent='-$'+cost.toFixed(2);
  const costBr=document.getElementById('trdCostBroker');if(costBr)costBr.textContent=TRD_BROKERS[trd.broker].n;
  // Positions PnL
  let totalPnl=0;
  trd.positions.forEach(p=>{
    const pv=TRD_PIPVAL[p.sym]||1;
    p.pnl=p.side==='buy'?(trdBid()-p.entry)*pv*p.qty:(p.entry-trdAsk())*pv*p.qty;
    totalPnl+=p.pnl;
  });
  trdRenderPositions();
  // Top bar
  const bal=document.getElementById('trdBal');if(bal)bal.textContent='$'+(10000+trd.realized+totalPnl).toFixed(2);
  const ePnl=document.getElementById('trdEPnl');if(ePnl){ePnl.textContent=(totalPnl>=0?'+':'')+totalPnl.toFixed(2);ePnl.style.color=totalPnl>=0?'#3ab87a':'#e05050'}
  const rPnl=document.getElementById('trdRPnl');if(rPnl){rPnl.textContent=(trd.realized>=0?'+':'')+trd.realized.toFixed(2);rPnl.style.color=trd.realized>=0?'#3ab87a':'#e05050'}
  // Watchlist prices
  TRD_SYMS.forEach(sym=>{
    const el=document.getElementById('trdW_'+sym.id);
    if(!el)return;
    const sp2=TRD_BROKERS[trd.broker][sym.id]||1;
    const m=sym.id===trd.sym?trd.mid:sym.base+(Math.random()-0.5)*sym.base*0.001;
    el.querySelector('.trd-watch-ask').textContent=(m+sp2/2).toFixed(sym.base>1000?1:sym.base>100?2:3);
    el.querySelector('.trd-watch-bid').textContent=(m-sp2/2).toFixed(sym.base>1000?1:sym.base>100?2:3);
    el.querySelector('.trd-watch-sp').textContent='SP '+sp2;
  });
  // Bottom
  const bBal=document.getElementById('trdBBal');if(bBal)bBal.textContent='$'+(10000+trd.realized+totalPnl).toFixed(2);
  const bPos=document.getElementById('trdBPos');if(bPos)bPos.textContent=trd.positions.length;
  const bBr=document.getElementById('trdBBr');if(bBr)bBr.textContent=TRD_BROKERS[trd.broker].n;
  const bSp=document.getElementById('trdBSp');if(bSp)bSp.textContent=sp;
}

function trdRenderWatch(){
  const el=document.getElementById('trdWatchList');if(!el)return;
  el.innerHTML=TRD_SYMS.map(s=>
    `<div class="trd-watch-item ${s.id===trd.sym?'active':''}" id="trdW_${s.id}" onclick="trdSetSym('${s.id}')"><div><div class="trd-watch-sym">${s.name}</div><div class="trd-watch-desc">${s.desc}</div></div><div class="trd-watch-prices"><div class="trd-watch-ask">—</div><div class="trd-watch-bid">—</div><div class="trd-watch-sp">—</div></div></div>`
  ).join('');
  // Header
  const s=TRD_SYMS.find(x=>x.id===trd.sym);
  const hdrSym=document.getElementById('trdHdrSym');if(hdrSym)hdrSym.textContent=s.name+' '+s.desc;
}

// Positions
function trdBuy(){
  trd.positions.push({sym:trd.sym,side:'buy',entry:trdAsk(),qty:trd.qty,broker:trd.broker,pnl:0});
}
function trdSell(){
  trd.positions.push({sym:trd.sym,side:'sell',entry:trdBid(),qty:trd.qty,broker:trd.broker,pnl:0});
}
function trdClosePos(i){
  trd.realized+=trd.positions[i].pnl;
  trd.positions.splice(i,1);
}
function trdQtyAdj(d){
  trd.qty=Math.max(0.1,Math.round((trd.qty+d)*10)/10);
  document.getElementById('trdQtyInput').value=trd.qty;
}
function trdQtySet(v){trd.qty=Math.max(0.1,parseFloat(v)||0.1)}

function trdRenderPositions(){
  const el=document.getElementById('trdPosList');if(!el)return;
  if(!trd.positions.length){el.innerHTML='<div class="trd-pos-empty">보유 포지션 없음<br>BUY / SELL 클릭으로<br>거래를 시작하세요</div>';return}
  el.innerHTML=trd.positions.map((p,i)=>{
    const c=p.pnl>=0?'#3ab87a':'#e05050';
    return`<div class="trd-pos-item"><div class="trd-pos-top"><span><span class="trd-pos-sym">${p.sym}</span> <span class="trd-pos-side ${p.side}">${p.side==='buy'?'매수':'매도'}</span></span><span class="trd-pos-pnl" style="color:${c}">${p.pnl>=0?'+':''}${p.pnl.toFixed(2)}</span></div><div class="trd-pos-detail">${TRD_BROKERS[p.broker].n} · ${p.qty}계약 · ${p.entry.toFixed(trdDec())}</div><button class="trd-pos-close" onclick="trdClosePos(${i})">✕ 청산</button></div>`;
  }).join('');
}

// Right panel
function trdRenderRight(){
  trdRenderPositions();
  trdRenderSpreadCompare();
}
function trdRightTab(t){
  document.querySelectorAll('.trd-right-tab').forEach((el,i)=>{el.classList.toggle('active',i===t)});
  document.getElementById('trdPosPanel').style.display=t===0?'':'none';
  document.getElementById('trdSpPanel').style.display=t===1?'':'none';
}

function trdRenderSpreadCompare(){
  const sym=document.getElementById('trdSpSym')?.value||trd.sym;
  const el=document.getElementById('trdSpList');if(!el)return;
  const entries=Object.entries(TRD_BROKERS).map(([k,b])=>({k,n:b.n,sp:b[sym]||1,cost:(b[sym]||1)*(TRD_PIPVAL[sym]||1)}));
  entries.sort((a,b)=>a.sp-b.sp);
  const maxSp=Math.max(...entries.map(e=>e.sp));
  el.innerHTML=entries.map((e,i)=>{
    const pct=e.sp/maxSp*100;
    const c=pct<40?'#3ab87a':pct<70?'#f5a623':'#e05050';
    return`<div class="trd-sp-item"><span class="trd-sp-name">${e.n}</span><div class="trd-sp-bar-wrap"><div class="trd-sp-bar" style="width:${pct}%;background:${c}"></div></div><span class="trd-sp-val" style="color:${c}">${e.sp}</span><span class="trd-sp-cost">$${e.cost.toFixed(1)}</span>${i===0?'<span class="trd-sp-best">최저</span>':''}</div>`;
  }).join('');
}

// Make global
window.trdOpen=trdOpen;window.trdClose=trdClose;window.trdSetSym=trdSetSym;
window.trdSetBroker=trdSetBroker;window.trdBuy=trdBuy;window.trdSell=trdSell;
window.trdClosePos=trdClosePos;window.trdQtyAdj=trdQtyAdj;window.trdQtySet=trdQtySet;
window.trdRightTab=trdRightTab;window.trdRenderSpreadCompare=trdRenderSpreadCompare;
