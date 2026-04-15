// Spread Comparison Trading — DUAL CHART comparison
const TSYMS=[
  {id:'NQ',name:'NQ',desc:'나스닥100',base:21340},
  {id:'ES',name:'ES',desc:'S&P500',base:5842},
  {id:'GOLD',name:'GOLD',desc:'금',base:3142},
  {id:'BTC',name:'BTC/USD',desc:'비트코인',base:83420},
  {id:'OIL',name:'OIL',desc:'원유',base:71.24},
  {id:'HSI',name:'HSI',desc:'항셍',base:19840}
];
const TBROKERS={
  icm:{n:'IC Markets',c:'#4a8eff',NQ:.5,ES:.4,GOLD:.3,BTC:42,OIL:.03,HSI:12},
  pep:{n:'Pepperstone',c:'#4a8eff',NQ:.7,ES:.5,GOLD:.4,BTC:55,OIL:.04,HSI:15},
  tkm:{n:'Tickmill',c:'#4a8eff',NQ:.9,ES:.6,GOLD:.5,BTC:60,OIL:.05,HSI:18},
  oan:{n:'OANDA',c:'#f5a623',NQ:1.4,ES:1.2,GOLD:.8,BTC:80,OIL:.07,HSI:25},
  exn:{n:'Exness',c:'#f5a623',NQ:2.0,ES:1.8,GOLD:1.2,BTC:95,OIL:.09,HSI:30},
  xm:{n:'XM',c:'#f5a623',NQ:2.5,ES:2.2,GOLD:1.5,BTC:120,OIL:.12,HSI:40}
};
const TPIPVAL={NQ:20,ES:12.5,GOLD:10,BTC:1,OIL:10,HSI:5};

let T={sym:'NQ',brokerA:'icm',brokerB:'oan',mid:21340,qtyA:1,qtyB:1,positions:[],realized:0,candles:[],tick:0,anim:null,cwA:0,chA:0,cwB:0,chB:0};

function trdOpen(){document.getElementById('trdPage').classList.add('show');trdInitAll()}
function trdClose(){document.getElementById('trdPage').classList.remove('show');cancelAnimationFrame(T.anim)}

function trdInitAll(){
  const s=TSYMS.find(x=>x.id===T.sym);T.mid=s.base;T.candles=[];T.tick=0;
  let p=s.base;for(let i=0;i<60;i++){const c=tMkC(p);T.candles.push(c);p=c.c}
  T.mid=p;trdRenderSymBar();trdResizeCanvases();trdLoop();
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
  let p=s.base;for(let i=0;i<60;i++){const c=tMkC(p);T.candles.push(c);p=c.c}
  T.mid=p;trdRenderSymBar();
}
function trdSetBrokerA(v){T.brokerA=v}
function trdSetBrokerB(v){T.brokerB=v}

function trdResizeCanvases(){
  ['trdCanvasA','trdCanvasB'].forEach(id=>{
    const c=document.getElementById(id);if(!c)return;
    const dpr=window.devicePixelRatio||1;
    const r=c.getBoundingClientRect();
    if(r.width<1)return;
    c.width=r.width*dpr;c.height=r.height*dpr;
    if(id==='trdCanvasA'){T.cwA=c.width;T.chA=c.height}
    else{T.cwB=c.width;T.chB=c.height}
  });
}
window.addEventListener('resize',trdResizeCanvases);

function trdLoop(){
  T.mid+=(Math.random()-.49)*T.mid*.0004+Math.sin(Date.now()*.0002)*.3;
  T.tick++;
  const last=T.candles[T.candles.length-1];
  last.c=T.mid;last.h=Math.max(last.h,T.mid);last.l=Math.min(last.l,T.mid);
  if(T.tick%40===0){T.candles.push({o:T.mid,h:T.mid,l:T.mid,c:T.mid});if(T.candles.length>60)T.candles.shift()}
  trdDrawPanel('trdCanvasA',T.cwA,T.chA,T.brokerA);
  trdDrawPanel('trdCanvasB',T.cwB,T.chB,T.brokerB);
  trdUpdateUI();
  setTimeout(()=>{T.anim=requestAnimationFrame(trdLoop)},80);
}

function trdDrawPanel(canvasId,W,H,bk){
  const canvas=document.getElementById(canvasId);
  if(!canvas||W<1||H<1)return;
  if(canvas.width!==W){trdResizeCanvases();return}
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const cds=T.candles,n=cds.length;if(!n)return;
  const sp=tSp(bk),d=tDec();
  const allP=cds.flatMap(c=>[c.h+sp,c.l-sp]);
  const mn=Math.min(...allP)-(T.mid*.001),mx=Math.max(...allP)+(T.mid*.001);
  const range=mx-mn||1,pad=30;
  const yOf=v=>pad+(H-pad*2)*(1-(v-mn)/range);
  const cw=Math.max(3,(W-60)/n),gap=Math.max(1,cw*.15);
  const dpr=window.devicePixelRatio||1;

  // Grid
  ctx.strokeStyle='#1a1d26';ctx.lineWidth=1;
  ctx.font=(8*dpr)+'px Courier New';ctx.fillStyle='#3a4a5a';
  for(let i=0;i<5;i++){const y=pad+(H-pad*2)*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    ctx.fillText((mx-range*i/4).toFixed(d),W-55*dpr,y-3)}

  // Candles (with spread applied: ask candle tops, bid candle bottoms)
  for(let i=0;i<n;i++){
    const c=cds[i],x=30+i*(cw+gap),up=c.c>=c.o;
    ctx.fillStyle=up?'#3ab87a':'#e05050';ctx.strokeStyle=up?'#3ab87a':'#e05050';ctx.lineWidth=1;
    const xc=x+cw/2;
    ctx.beginPath();ctx.moveTo(xc,yOf(c.h));ctx.lineTo(xc,yOf(c.l));ctx.stroke();
    const top=yOf(Math.max(c.o,c.c)),bot=yOf(Math.min(c.o,c.c));
    ctx.fillRect(x,top,cw,Math.max(1,bot-top));
  }

  // Spread band (ASK line + BID line)
  const askY=yOf(T.mid+sp/2),bidY=yOf(T.mid-sp/2);
  ctx.fillStyle='rgba(74,158,255,0.06)';
  ctx.fillRect(0,askY,W,bidY-askY);
  ctx.setLineDash([3,3]);
  ctx.strokeStyle='rgba(58,184,122,.5)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,askY);ctx.lineTo(W,askY);ctx.stroke();
  ctx.strokeStyle='rgba(224,80,80,.5)';
  ctx.beginPath();ctx.moveTo(0,bidY);ctx.lineTo(W,bidY);ctx.stroke();
  ctx.setLineDash([]);

  // Spread label in band
  ctx.fillStyle='rgba(74,158,255,0.2)';
  const bandMid=(askY+bidY)/2;
  ctx.font='bold '+(9*dpr)+'px Courier New';
  ctx.fillStyle='#4a8eff';
  ctx.fillText('SPREAD '+sp,W/2-30*dpr,bandMid+3);

  // Position lines
  T.positions.filter(p=>p.sym===T.sym&&p.broker===bk).forEach(pos=>{
    const y=yOf(pos.entry);
    ctx.setLineDash([6,4]);ctx.strokeStyle=pos.side==='buy'?'rgba(58,184,122,.8)':'rgba(224,80,80,.8)';
    ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
    const pnl=pos.side==='buy'?(tBid(bk)-pos.entry)*TPIPVAL[T.sym]*pos.qty:(pos.entry-tAsk(bk))*TPIPVAL[T.sym]*pos.qty;
    // Entry tag
    ctx.fillStyle=pos.side==='buy'?'#1a4a2a':'#5a1a1a';
    ctx.fillRect(4,y-9,80*dpr/2,18);ctx.fillStyle='#fff';ctx.font=(8*dpr)+'px Courier New';
    ctx.fillText((pos.side==='buy'?'▲BUY ':'▼SELL ')+pos.entry.toFixed(d),8,y+3);
    // PnL tag
    ctx.fillStyle=pnl>=0?'#1a4a2a':'#5a1a1a';
    ctx.fillRect(W-55*dpr/2,y-9,55*dpr/2,18);
    ctx.fillStyle=pnl>=0?'#3ab87a':'#e05050';ctx.font='bold '+(9*dpr)+'px Courier New';
    ctx.fillText((pnl>=0?'+':'')+pnl.toFixed(1),W-52*dpr/2,y+3);
  });

  // Current price
  const curY=yOf(T.mid);
  ctx.strokeStyle='#4a6a8a';ctx.lineWidth=1;ctx.setLineDash([2,2]);
  ctx.beginPath();ctx.moveTo(0,curY);ctx.lineTo(W,curY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#1a2a3a';ctx.fillRect(W-48*dpr/2,curY-9,48*dpr/2,18);
  ctx.fillStyle='#c8d4e0';ctx.font='bold '+(8*dpr)+'px Courier New';
  ctx.fillText(T.mid.toFixed(d),W-45*dpr/2,curY+3);
}

function trdUpdateUI(){
  const d=tDec();
  ['A','B'].forEach(side=>{
    const bk=side==='A'?T.brokerA:T.brokerB;
    const br=TBROKERS[bk];const sp=tSp(bk);
    const ask=tAsk(bk),bid=tBid(bk);
    const el=document.getElementById('trdPanel'+side);if(!el)return;
    // Broker name + spread
    const spEl=el.querySelector('.trd-panel-spread');
    if(spEl)spEl.innerHTML=`<span class="trd-panel-spread-val">SP ${sp}</span><span class="trd-panel-spread-cost">$${(sp*TPIPVAL[T.sym]).toFixed(1)}/계약</span>`;
    // Bid/Ask
    const ba=el.querySelector('.trd-panel-bidask');
    if(ba)ba.innerHTML=`<div style="color:#3ab87a;font-weight:700">${ask.toFixed(d)}</div><div style="color:#4a6a8a;font-size:9px">SP ${sp}</div><div style="color:#e05050;font-weight:700">${bid.toFixed(d)}</div>`;
    // Buttons
    const buyP=el.querySelector('.trd-buy-price');if(buyP)buyP.textContent=ask.toFixed(d);
    const sellP=el.querySelector('.trd-sell-price');if(sellP)sellP.textContent=bid.toFixed(d);
  });
  // Positions
  let totalPnl=0;
  T.positions.forEach(p=>{
    const pv=TPIPVAL[p.sym]||1;
    p.pnl=p.side==='buy'?(tBid(p.broker)-p.entry)*pv*p.qty:(p.entry-tAsk(p.broker))*pv*p.qty;
    totalPnl+=p.pnl;
  });
  trdRenderPositions();
  const bal=10000+T.realized+totalPnl;
  const bE=document.getElementById('trdBal');if(bE)bE.textContent='$'+bal.toFixed(2);
  const eE=document.getElementById('trdEPnl');if(eE){eE.textContent=(totalPnl>=0?'+':'')+totalPnl.toFixed(2);eE.style.color=totalPnl>=0?'#3ab87a':'#e05050'}
  const rE=document.getElementById('trdRPnl');if(rE){rE.textContent=(T.realized>=0?'+':'')+T.realized.toFixed(2);rE.style.color=T.realized>=0?'#3ab87a':'#e05050'}
}

function trdBuy(bk){
  const qty=bk===T.brokerA?T.qtyA:T.qtyB;
  T.positions.push({sym:T.sym,side:'buy',entry:tAsk(bk),qty,broker:bk,pnl:0});
}
function trdSell(bk){
  const qty=bk===T.brokerA?T.qtyA:T.qtyB;
  T.positions.push({sym:T.sym,side:'sell',entry:tBid(bk),qty,broker:bk,pnl:0});
}
function trdClosePos(i){
  if(i>=0&&i<T.positions.length){T.realized+=T.positions[i].pnl;T.positions.splice(i,1)}
}
function trdQtyA(d){T.qtyA=Math.max(0.1,Math.round((T.qtyA+d)*10)/10);const e=document.getElementById('trdQtyA');if(e)e.value=T.qtyA}
function trdQtyB(d){T.qtyB=Math.max(0.1,Math.round((T.qtyB+d)*10)/10);const e=document.getElementById('trdQtyB');if(e)e.value=T.qtyB}

function trdRenderPositions(){
  const el=document.getElementById('trdPosList');if(!el)return;
  if(!T.positions.length){el.innerHTML='<div class="trd-pos-empty">BUY / SELL 클릭으로 두 브로커의 스프레드 차이를 비교해보세요</div>';return}
  el.innerHTML=T.positions.map((p,i)=>{
    const c=p.pnl>=0?'#3ab87a':'#e05050';
    const br=TBROKERS[p.broker];
    return`<div class="trd-pos-card ${p.side}"><div class="trd-pos-top"><span class="trd-pos-sym">${p.sym} <span class="trd-pos-side ${p.side}">${p.side==='buy'?'매수':'매도'}</span></span><span class="trd-pos-pnl" style="color:${c}">${p.pnl>=0?'+':''}$${p.pnl.toFixed(2)}</span></div><div class="trd-pos-detail">${br?.n||p.broker} · ${p.qty}계약 · ${p.entry.toFixed(tDec())}</div><button class="trd-pos-close" onclick="trdClosePos(${i})">✕ 청산</button></div>`;
  }).join('');
}

function trdRenderSymBar(){
  const bar=document.getElementById('trdSymBar');if(!bar)return;
  bar.innerHTML=TSYMS.map(s=>`<button class="trd-sym-btn ${s.id===T.sym?'active':''}" onclick="trdSetSym('${s.id}')">${s.name}</button>`).join('');
}

// Globals
window.trdOpen=trdOpen;window.trdClose=trdClose;window.trdSetSym=trdSetSym;
window.trdSetBrokerA=trdSetBrokerA;window.trdSetBrokerB=trdSetBrokerB;
window.trdBuy=trdBuy;window.trdSell=trdSell;window.trdClosePos=trdClosePos;
window.trdQtyA=trdQtyA;window.trdQtyB=trdQtyB;
