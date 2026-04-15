// Spread Trading — Single chart, multi-broker (v3)
const TSYMS=[
  {id:'NQ',name:'NQ',desc:'나스닥100',base:21340,vol:.0006},
  {id:'ES',name:'ES',desc:'S&P500',base:5842,vol:.0004},
  {id:'GOLD',name:'GOLD',desc:'금',base:3142,vol:.0003},
  {id:'BTC',name:'BTC/USD',desc:'비트코인',base:83420,vol:.0008},
  {id:'OIL',name:'OIL',desc:'원유',base:71.24,vol:.0005},
  {id:'HSI',name:'HSI',desc:'항셍',base:19840,vol:.0005}
];
const TB={
  icm:{n:'IC Markets',s:'IC',col:'#4a8eff',NQ:.5,ES:.4,GOLD:.3,BTC:42,OIL:.03,HSI:12},
  pep:{n:'Pepperstone',s:'PP',col:'#3ab87a',NQ:.7,ES:.5,GOLD:.4,BTC:55,OIL:.04,HSI:15},
  tkm:{n:'Tickmill',s:'TK',col:'#f5a623',NQ:.9,ES:.6,GOLD:.5,BTC:60,OIL:.05,HSI:18},
  ibkr:{n:'Interactive Brokers',s:'IB',col:'#90e0ef',NQ:.4,ES:.3,GOLD:.25,BTC:38,OIL:.02,HSI:10},
  ig:{n:'IG Group',s:'IG',col:'#00b4d8',NQ:.6,ES:.5,GOLD:.35,BTC:50,OIL:.04,HSI:14},
  blackb:{n:'BlackBull',s:'BB',col:'#95d5b2',NQ:.6,ES:.5,GOLD:.35,BTC:52,OIL:.04,HSI:13},
  axi:{n:'Axi',s:'AX',col:'#48cae4',NQ:.7,ES:.5,GOLD:.38,BTC:54,OIL:.04,HSI:14},
  saxo:{n:'Saxo Bank',s:'SX',col:'#cdb4db',NQ:.8,ES:.6,GOLD:.45,BTC:65,OIL:.05,HSI:18},
  xtb:{n:'XTB',s:'XT',col:'#ff9f1c',NQ:.8,ES:.6,GOLD:.4,BTC:60,OIL:.05,HSI:16},
  fxpro:{n:'FxPro',s:'FP',col:'#a8dadc',NQ:.9,ES:.7,GOLD:.5,BTC:65,OIL:.06,HSI:19},
  vantage:{n:'Vantage',s:'VT',col:'#84a98c',NQ:.8,ES:.6,GOLD:.4,BTC:58,OIL:.05,HSI:16},
  tmgm:{n:'TMGM',s:'TM',col:'#74b3ce',NQ:.8,ES:.6,GOLD:.42,BTC:58,OIL:.05,HSI:16},
  capital:{n:'Capital.com',s:'CP',col:'#52b788',NQ:.9,ES:.7,GOLD:.48,BTC:62,OIL:.06,HSI:17},
  admir:{n:'Admiral Markets',s:'AD',col:'#e9c46a',NQ:1,ES:.8,GOLD:.55,BTC:68,OIL:.06,HSI:20},
  fxcm:{n:'FXCM',s:'FC',col:'#ffb347',NQ:1.2,ES:1,GOLD:.7,BTC:75,OIL:.07,HSI:22},
  ava:{n:'AvaTrade',s:'AV',col:'#b5c7d3',NQ:1.1,ES:.9,GOLD:.6,BTC:70,OIL:.07,HSI:21},
  hfm:{n:'HFM',s:'HF',col:'#d4a5a5',NQ:1.3,ES:1.1,GOLD:.75,BTC:78,OIL:.08,HSI:24},
  oan:{n:'OANDA',s:'OA',col:'#e87dd3',NQ:1.4,ES:1.2,GOLD:.8,BTC:80,OIL:.07,HSI:25},
  hotfx:{n:'HotForex',s:'HX',col:'#e76f51',NQ:1.4,ES:1.2,GOLD:.8,BTC:82,OIL:.08,HSI:26},
  etoro:{n:'eToro',s:'ET',col:'#8ecae6',NQ:1.5,ES:1.3,GOLD:.9,BTC:85,OIL:.09,HSI:28},
  bdswiss:{n:'BDSwiss',s:'BD',col:'#f4a261',NQ:1.6,ES:1.4,GOLD:.95,BTC:90,OIL:.1,HSI:30},
  robo:{n:'RoboForex',s:'RB',col:'#ff85a1',NQ:1.8,ES:1.6,GOLD:1,BTC:88,OIL:.1,HSI:28},
  alpari:{n:'Alpari',s:'AL',col:'#b7b7a4',NQ:1.8,ES:1.6,GOLD:1,BTC:90,OIL:.1,HSI:30},
  exn:{n:'Exness',s:'EX',col:'#ff6b6b',NQ:2,ES:1.8,GOLD:1.2,BTC:95,OIL:.09,HSI:30},
  fbs:{n:'FBS',s:'FB',col:'#c77dff',NQ:2.2,ES:2,GOLD:1.4,BTC:105,OIL:.11,HSI:38},
  xm:{n:'XM',s:'XM',col:'#aaaaaa',NQ:2.5,ES:2.2,GOLD:1.5,BTC:120,OIL:.12,HSI:40}
};
const TPV={NQ:20,ES:12.5,GOLD:10,BTC:1,OIL:10,HSI:5};
const MC=60;

let T={sym:'NQ',sel:['icm','pep'],mid:21340,qty:1,pos:[],real:0,cds:[],tk:0,anim:null,cw:0,ch:0,bkSearch:''};

window.trdOpen=function(){document.getElementById('trdPage').classList.add('show');tInit()};
window.trdClose=function(){document.getElementById('trdPage').classList.remove('show');if(T.anim)cancelAnimationFrame(T.anim);T.anim=null};

function tInit(){
  const s=TSYMS.find(x=>x.id===T.sym);T.mid=s.base;T.cds=[];T.tk=0;
  let p=s.base;for(let i=0;i<MC;i++){T.cds.push(tMkC(p));p=T.cds[T.cds.length-1].c}
  T.mid=p;tRenderLeft();tRenderBadges();tRenderSpCmp();
  requestAnimationFrame(()=>{tResize();tLoop()});
}
function tMkC(p){const v=p*.006,o=p+(Math.random()-.5)*v*.3,c=o+(Math.random()-.48)*v;return{o,h:Math.max(o,c)+Math.random()*v*.5,l:Math.min(o,c)-Math.random()*v*.5,c}}
function tD(){const s=TSYMS.find(x=>x.id===T.sym);return s.base>1000?1:s.base>100?2:s.base>10?3:4}

function tResize(){const c=document.getElementById('trdCanvas');if(!c)return;const dpr=window.devicePixelRatio||1,r=c.getBoundingClientRect();if(r.width<1)return;T.cw=Math.round(r.width*dpr);T.ch=Math.round(r.height*dpr);c.width=T.cw;c.height=T.ch}
window.addEventListener('resize',tResize);

function tLoop(){
  if(!document.getElementById('trdPage')?.classList.contains('show'))return;
  const sv=(TSYMS.find(x=>x.id===T.sym)?.vol||.0004);
  T.mid+=(Math.random()-.49)*T.mid*sv+Math.sin(Date.now()*.0002)*.2;
  T.tk++;const last=T.cds[T.cds.length-1];last.c=T.mid;last.h=Math.max(last.h,T.mid);last.l=Math.min(last.l,T.mid);
  if(T.tk%40===0){T.cds.push({o:T.mid,h:T.mid,l:T.mid,c:T.mid});if(T.cds.length>MC)T.cds.shift()}
  tDraw();tUpdateUI();
  setTimeout(()=>{T.anim=requestAnimationFrame(tLoop)},80);
}

function tDraw(){
  const W=T.cw,H=T.ch;if(W<10||H<10){tResize();return}
  const canvas=document.getElementById('trdCanvas'),ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const n=T.cds.length,d=tD(),dpr=window.devicePixelRatio||1;
  const PL=10,PR=55*dpr,PT=15,PB=15,cW=W-PL-PR,cH=H-PT-PB;
  const allH=T.cds.map(c=>c.h),allL=T.cds.map(c=>c.l);
  const mn=Math.min(...allL)-Math.abs(T.mid)*.003,mx=Math.max(...allH)+Math.abs(T.mid)*.003;
  const rng=mx-mn||1;const ty=v=>PT+(mx-v)/rng*cH;const cw=cW/MC;

  ctx.strokeStyle='#1e2130';ctx.lineWidth=1;ctx.font=Math.round(8*dpr)+'px Courier New';ctx.fillStyle='#3a4a5a';
  for(let i=0;i<5;i++){const v=mx-rng*i/4,y=ty(v);ctx.beginPath();ctx.moveTo(PL,y);ctx.lineTo(W-PR+10,y);ctx.stroke();ctx.fillText(v.toFixed(d),W-PR+14,y+3)}

  for(let i=0;i<n;i++){
    const c=T.cds[i],up=c.c>=c.o,x=PL+i*cw,xc=x+cw/2,bw=Math.max(2,cw*.7),bx=xc-bw/2;
    ctx.strokeStyle=up?'rgba(58,184,122,.85)':'rgba(224,80,80,.85)';ctx.lineWidth=Math.max(1,dpr);
    ctx.beginPath();ctx.moveTo(xc,ty(c.h));ctx.lineTo(xc,ty(c.l));ctx.stroke();
    ctx.fillStyle=up?'rgba(58,184,122,.85)':'rgba(224,80,80,.85)';
    const top=ty(Math.max(c.o,c.c)),bot=ty(Math.min(c.o,c.c));ctx.fillRect(bx,top,bw,Math.max(1,bot-top));
  }

  // Position lines (4px offset)
  const posBySym=T.pos.filter(p=>p.sym===T.sym);
  const priceGroups={};posBySym.forEach((p,i)=>{const k=p.entry.toFixed(d);if(!priceGroups[k])priceGroups[k]=[];priceGroups[k].push(i)});
  posBySym.forEach((pos,idx)=>{
    const bk=TB[pos.bk];if(!bk)return;
    const k=pos.entry.toFixed(d);const gi=priceGroups[k].indexOf(idx);
    const y=ty(pos.entry)+gi*4*dpr;
    const sp=bk[T.sym]||1;
    pos.pnl=pos.dir==='buy'?(T.mid-sp/2-pos.entry)*(TPV[T.sym]||1)*pos.qty:(pos.entry-(T.mid+sp/2))*(TPV[T.sym]||1)*pos.qty;
    ctx.setLineDash([5,4]);ctx.strokeStyle=bk.col;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(PL,y);ctx.lineTo(PL+cW,y);ctx.stroke();ctx.setLineDash([]);
    // Left tag
    ctx.fillStyle=bk.col+'33';const tw=50*dpr/2;ctx.fillRect(PL,y-10,tw,20);
    ctx.fillStyle=bk.col;ctx.font=Math.round(9*dpr)+'px Courier New';
    ctx.fillText((pos.dir==='buy'?'▲':'▼')+' '+bk.s,PL+3,y+3);
    // Right PnL tag (bigger)
    const pnl=pos.pnl;ctx.fillStyle=pnl>=0?bk.col+'44':bk.col+'22';const pw=55*dpr/2;
    ctx.fillRect(PL+cW-pw,y-10,pw,20);
    ctx.fillStyle=pnl>=0?bk.col:'#e05050';ctx.font='bold '+Math.round(10*dpr)+'px Courier New';
    ctx.fillText((pnl>=0?'+':'')+pnl.toFixed(1),PL+cW-pw+3,y+4);
  });

  // Current price
  const curY=ty(T.mid);const up=T.cds[0]&&T.mid>=T.cds[0].o;
  ctx.strokeStyle='#4a6a8a';ctx.lineWidth=1;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(PL,curY);ctx.lineTo(PL+cW,curY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=up?'#1a4a2a':'#5a1a1a';const plw=48*dpr/2;ctx.fillRect(W-PR+10,curY-9,plw,18);
  ctx.fillStyle='#fff';ctx.font='bold '+Math.round(9*dpr)+'px Courier New';ctx.fillText(T.mid.toFixed(d),W-PR+14,curY+3);
}

function tUpdateUI(){
  const d=tD();
  const hp=document.getElementById('trdHdrPrice');
  if(hp){hp.textContent=T.mid.toFixed(d);hp.style.color=T.cds[0]&&T.mid>=T.cds[0].o?'#3ab87a':'#e05050'}
  const buyP=document.getElementById('trdAllBuyPrice');if(buyP)buyP.textContent=T.mid.toFixed(d);
  const sellP=document.getElementById('trdAllSellPrice');if(sellP)sellP.textContent=T.mid.toFixed(d);
  const buySub=document.getElementById('trdAllBuySub');if(buySub)buySub.textContent=T.sel.length+'개 브로커 동시 매수';
  const sellSub=document.getElementById('trdAllSellSub');if(sellSub)sellSub.textContent=T.sel.length+'개 브로커 동시 매도';
  // Costs with % diff
  const costsEl=document.getElementById('trdCosts');
  if(costsEl){
    const costs=T.sel.map(k=>{const b=TB[k];return{k,n:b.n,col:b.col,cost:(b[T.sym]||0)*(TPV[T.sym]||1)*T.qty}});
    const cheapest=Math.min(...costs.map(c=>c.cost))||1;
    costsEl.innerHTML=costs.map(c=>{
      const pct=c.cost<=cheapest?'':'<span style="color:#4a6a8a;font-size:8px"> +'+Math.round((c.cost-cheapest)/cheapest*100)+'%</span>';
      return`<div class="trd-cost-row"><span class="trd-cost-dot" style="background:${c.col}"></span><span class="trd-cost-name">${c.n}</span><span class="trd-cost-val">-$${c.cost.toFixed(0)}${pct}</span></div>`}).join('');
  }
  let total=0;T.pos.forEach(p=>total+=p.pnl||0);tRenderPos();
  const bal=10000+T.real+total;
  const bE=document.getElementById('trdBal');if(bE)bE.textContent='$'+bal.toFixed(2);
  const eE=document.getElementById('trdEPnl');if(eE){eE.textContent=(total>=0?'+':'')+total.toFixed(2);eE.style.color=total>=0?'#3ab87a':'#e05050'}
  const rE=document.getElementById('trdRPnl');if(rE){rE.textContent=(T.real>=0?'+':'')+T.real.toFixed(2);rE.style.color=T.real>=0?'#3ab87a':'#e05050'}
  TSYMS.forEach(s=>{const el=document.getElementById('tw_'+s.id);if(!el)return;
    const m=s.id===T.sym?T.mid:s.base;el.querySelector('.tw-p').textContent=m.toFixed(s.base>1000?0:s.base>100?1:2)});
}

function tRenderLeft(){
  document.getElementById('trdWatchList').innerHTML=TSYMS.map(s=>
    `<div class="trd-watch-item ${s.id===T.sym?'active':''}" id="tw_${s.id}" onclick="trdSetSym('${s.id}')"><div><div class="trd-watch-sym">${s.name}</div><div class="trd-watch-desc">${s.desc}</div></div><span class="tw-p" style="font-size:10px;color:#c8d4e0">—</span></div>`
  ).join('');
  tRenderBkList();
}

function tRenderBkList(){
  const q=T.bkSearch.toLowerCase();
  const filtered=Object.entries(TB).filter(([k,b])=>!q||b.n.toLowerCase().includes(q));
  document.getElementById('trdBkList').innerHTML=filtered.length?filtered.map(([k,b])=>{
    const on=T.sel.includes(k);const sp=b[T.sym]||0;
    return`<div class="trd-bk-item" onclick="trdToggleBk('${k}')"><div class="trd-bk-check ${on?'on':''}" style="${on?'background:'+b.col:''}">✓</div><span class="trd-bk-dot" style="background:${b.col}"></span><span class="trd-bk-name">${b.n}</span><span class="trd-bk-sp">${sp}p</span></div>`;
  }).join(''):'<div style="padding:10px;font-size:9px;color:#3a4a5a">검색 결과 없음</div>';
}

function tRenderBadges(){
  const el=document.getElementById('trdBadges');if(!el)return;
  if(!T.sel.length){el.innerHTML='<span class="trd-badges-empty">좌측에서 브로커를 선택하세요 (복수 선택 가능)</span>';return}
  el.innerHTML=T.sel.map(k=>{const b=TB[k];return`<div class="trd-badge"><span class="trd-badge-dot" style="background:${b.col}"></span>${b.n} ${(b[T.sym]||0)}p</div>`}).join('');
}

window.trdSetSym=function(id){T.sym=id;const s=TSYMS.find(x=>x.id===id);T.mid=s.base;T.cds=[];T.tk=0;
  let p=s.base;for(let i=0;i<MC;i++){T.cds.push(tMkC(p));p=T.cds[T.cds.length-1].c}T.mid=p;tRenderLeft();tRenderBadges();tRenderSpCmp()};
window.trdToggleBk=function(k){const i=T.sel.indexOf(k);if(i>=0)T.sel.splice(i,1);else T.sel.push(k);tRenderBkList();tRenderBadges()};
window.trdBkSearch=function(v){T.bkSearch=v;tRenderBkList()};
window.trdAllBuy=function(){T.sel.forEach(k=>{const sp=TB[k][T.sym]||0;T.pos.push({sym:T.sym,dir:'buy',entry:T.mid+sp/2,qty:T.qty,bk:k,pnl:0})})};
window.trdAllSell=function(){T.sel.forEach(k=>{const sp=TB[k][T.sym]||0;T.pos.push({sym:T.sym,dir:'sell',entry:T.mid-sp/2,qty:T.qty,bk:k,pnl:0})})};
window.trdClosePos=function(i){if(i>=0&&i<T.pos.length){T.real+=T.pos[i].pnl||0;T.pos.splice(i,1)}};
window.trdQtyAdj=function(d){T.qty=Math.max(.1,Math.round((T.qty+d)*10)/10);const e=document.getElementById('trdQtyIn');if(e)e.value=T.qty};
window.trdRightTab=function(t){document.getElementById('trdPosPanel').style.display=t===0?'':'none';document.getElementById('trdSpPanel').style.display=t===1?'':'none';document.querySelectorAll('.trd-right-tab').forEach((e,i)=>e.classList.toggle('active',i===t));if(t===1)tRenderSpCmp()};

function tRenderPos(){
  const el=document.getElementById('trdPosList');if(!el)return;
  if(!T.pos.length){el.innerHTML='<div class="trd-pos-empty">브로커를 선택하고<br>ALL BUY / ALL SELL로<br>동시 진입하세요</div>';return}
  el.innerHTML=T.pos.map((p,i)=>{const b=TB[p.bk];const c=p.pnl>=0?'#3ab87a':'#e05050';
    return`<div class="trd-pos-item" style="border-left-color:${b?.col||'#4a8eff'}"><div class="trd-pos-top"><span class="trd-pos-sym">${p.sym} <span class="trd-pos-side ${p.dir}">${p.dir==='buy'?'매수':'매도'}</span></span><span class="trd-pos-pnl" style="color:${c}">${p.pnl>=0?'+':''}$${(p.pnl||0).toFixed(2)}</span></div><div class="trd-pos-detail">${b?.n||''} · SP ${b?.[T.sym]||0} · ${p.qty}계약 · ${p.entry.toFixed(tD())}</div><button class="trd-pos-close" onclick="trdClosePos(${i})">✕ 청산</button></div>`}).join('');
}

function tRenderSpCmp(){
  const el=document.getElementById('trdSpList');if(!el)return;
  const sym=T.sym,pv=TPV[sym]||1;
  const list=Object.entries(TB).map(([k,b])=>({k,n:b.n,col:b.col,sp:b[sym]||0,cost:(b[sym]||0)*pv})).sort((a,b)=>a.sp-b.sp);
  const mx=list[list.length-1]?.sp||1;
  el.innerHTML=list.map((b,i)=>{const pct=Math.round(b.sp/mx*100);const sel=T.sel.includes(b.k);
    return`<div class="trd-sp-item"><span class="trd-cost-dot" style="background:${b.col}"></span><span class="trd-sp-name" style="${sel?'color:#fff;font-weight:700':''}">${b.n}</span><div class="trd-sp-bar-wrap"><div class="trd-sp-bar" style="width:${pct}%;background:${b.col}"></div></div><span class="trd-sp-val" style="color:${b.col}">${b.sp}p</span><span class="trd-sp-cost">-$${b.cost.toFixed(0)}</span>${i===0?'<span class="trd-sp-best">최저</span>':''}</div>`}).join('');
}
