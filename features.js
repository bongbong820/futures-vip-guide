import{getFirestore,doc,getDoc,setDoc,collection,query,orderBy,limit,getDocs,serverTimestamp}from"https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Re-use the already-initialized Firebase app
let db,auth;
function initFeatures(){
  try{
    const{getApp}=window._fbApp||{};
    auth=getAuth();db=getFirestore();
  }catch(e){console.error('Features init error:',e)}
}
// Wait for Firebase to be ready
const _fReady=setInterval(()=>{
  try{auth=getAuth();db=getFirestore();clearInterval(_fReady);onFeaturesReady()}catch(e){}
},200);

function onFeaturesReady(){
  // Show member-only sidebar items when logged in
  auth.onAuthStateChanged(u=>{
    const show=u?'block':'none';
    // Member-only sidebar items removed; dropdown handles these now
  });
}

function kstToday(){return new Date(Date.now()+9*3600000).toISOString().slice(0,10)}

// ========== QUIZ DATA (20 questions) ==========
const QUIZ_DATA=[
  {id:1,category:'기초',level:'bronze',type:'ox',question:'선물 거래에서 롱 포지션은 가격 상승 시 수익이 난다.',answer:true,explanation:'롱(매수) 포지션은 가격이 오를 때 수익, 내릴 때 손실입니다.'},
  {id:2,category:'기초',level:'bronze',type:'multiple',question:'레버리지 10배 사용 시 가격이 10% 하락하면?',options:['10% 손실','50% 손실','100% 손실 (청산)','20% 손실'],answer:2,explanation:'레버리지 10배에서 10% 하락은 증거금 100% 손실로 청산됩니다.'},
  {id:3,category:'기초',level:'bronze',type:'ox',question:'숏 포지션은 가격이 하락할 때 수익이 발생한다.',answer:true,explanation:'숏(매도) 포지션은 가격 하락 시 수익, 상승 시 손실입니다.'},
  {id:4,category:'기초',level:'bronze',type:'multiple',question:'선물 거래에서 "증거금"이란?',options:['수수료','포지션 유지에 필요한 담보금','레버리지 비율','일일 정산금'],answer:1,explanation:'증거금은 포지션을 열고 유지하기 위해 거래소에 예치하는 담보금입니다.'},
  {id:5,category:'기초',level:'bronze',type:'ox',question:'손절(Stop Loss)은 손실을 제한하기 위한 주문이다.',answer:true,explanation:'손절은 손실이 일정 수준 이상 커지는 것을 방지하는 보호 주문입니다.'},
  {id:6,category:'기초',level:'bronze',type:'multiple',question:'1:100 레버리지에서 $100으로 거래 가능한 금액은?',options:['$1,000','$5,000','$10,000','$100,000'],answer:2,explanation:'레버리지 100배이므로 $100 × 100 = $10,000 규모로 거래할 수 있습니다.'},
  {id:7,category:'기초',level:'bronze',type:'ox',question:'선물 거래는 만기일이 없다.',answer:false,explanation:'일반 선물에는 만기일이 있습니다. 무기한 선물(Perpetual)은 만기가 없지만 펀딩비가 발생합니다.'},
  {id:8,category:'기술적분석',level:'silver',type:'multiple',question:'RSI가 70 이상이면 일반적으로 어떤 상태인가?',options:['과매도','중립','과매수','추세 전환'],answer:2,explanation:'RSI 70 이상은 과매수 상태로, 가격이 과도하게 상승했음을 의미합니다.'},
  {id:9,category:'기술적분석',level:'silver',type:'ox',question:'이동평균선(MA)은 과거 가격의 평균을 나타내는 지표이다.',answer:true,explanation:'이동평균선은 일정 기간의 종가 평균을 연결한 선으로, 추세를 파악하는 데 사용됩니다.'},
  {id:10,category:'기술적분석',level:'silver',type:'multiple',question:'볼린저 밴드에서 가격이 상단 밴드를 터치하면?',options:['반드시 매수','과매수 가능성','추세 확정','거래량 증가'],answer:1,explanation:'상단 밴드 터치는 과매수 가능성을 의미하지만, 강한 상승 추세에서는 밴드를 따라 이동할 수도 있습니다.'},
  {id:11,category:'기술적분석',level:'silver',type:'ox',question:'MACD 히스토그램이 양수에서 음수로 전환되면 매도 신호일 수 있다.',answer:true,explanation:'MACD 히스토그램이 양수→음수로 전환은 상승 모멘텀이 약해지고 있다는 신호입니다.'},
  {id:12,category:'기술적분석',level:'silver',type:'multiple',question:'피보나치 되돌림에서 가장 중요한 비율은?',options:['23.6%','38.2%','61.8%','78.6%'],answer:2,explanation:'61.8%는 황금비율로, 피보나치 되돌림에서 가장 중요한 지지/저항 수준입니다.'},
  {id:13,category:'기술적분석',level:'silver',type:'ox',question:'거래량이 증가하면서 가격이 상승하면 추세가 강하다는 의미이다.',answer:true,explanation:'가격 상승 + 거래량 증가는 많은 참여자가 상승에 동의하고 있다는 것으로, 추세가 강합니다.'},
  {id:14,category:'기술적분석',level:'silver',type:'multiple',question:'"데드크로스"는 어떤 상황을 의미하는가?',options:['단기MA가 장기MA를 상향돌파','단기MA가 장기MA를 하향돌파','RSI가 50을 돌파','거래량이 급증'],answer:1,explanation:'데드크로스는 단기 이동평균선이 장기 이동평균선을 아래로 뚫는 것으로, 하락 신호입니다.'},
  {id:15,category:'고급',level:'gold',type:'multiple',question:'펀딩비(Funding Rate)가 양수일 때 비용을 지불하는 쪽은?',options:['숏 포지션','거래소','롱 포지션','양쪽 동일'],answer:2,explanation:'펀딩비가 양수면 롱 포지션이 숏 포지션에게 비용을 지불합니다.'},
  {id:16,category:'고급',level:'gold',type:'ox',question:'헤지(Hedge)는 기존 포지션의 리스크를 줄이기 위한 반대 포지션이다.',answer:true,explanation:'헤지는 현재 포지션과 반대 방향의 거래를 통해 잠재적 손실을 제한하는 전략입니다.'},
  {id:17,category:'고급',level:'gold',type:'multiple',question:'VIX 지수가 30 이상이면 시장은 어떤 상태인가?',options:['안정적','낮은 변동성','높은 공포/변동성','강세장'],answer:2,explanation:'VIX 30 이상은 시장 참여자들의 공포와 높은 변동성을 나타냅니다.'},
  {id:18,category:'고급',level:'gold',type:'ox',question:'손익비 2:1은 기대수익이 기대손실의 2배라는 뜻이다.',answer:true,explanation:'손익비 2:1은 $1 리스크당 $2의 수익을 목표로 한다는 의미입니다.'},
  {id:19,category:'고급',level:'gold',type:'multiple',question:'포지션 사이징에서 일반적으로 권장되는 1회 리스크 비율은?',options:['총 자산의 1~2%','총 자산의 5%','총 자산의 10%','총 자산의 20%'],answer:0,explanation:'대부분의 전문 트레이더는 1회 거래에 총 자산의 1~2%만 리스크로 설정합니다.'},
  {id:20,category:'고급',level:'gold',type:'ox',question:'백테스팅(Backtesting)은 과거 데이터로 전략을 검증하는 과정이다.',answer:true,explanation:'백테스팅은 과거 시장 데이터에 전략을 적용하여 성과를 검증하는 방법입니다.'}
];

// ========== ACHIEVEMENTS DATA ==========
const ACHV_DATA=[
  {id:'first_login',icon:'🌱',title:'첫 발걸음',desc:'첫 로그인',category:'attendance'},
  {id:'streak_7',icon:'📅',title:'일주일의 약속',desc:'7일 연속 출석',category:'attendance'},
  {id:'streak_14',icon:'💪',title:'꾸준함의 힘',desc:'14일 연속 출석',category:'attendance'},
  {id:'streak_30',icon:'🏆',title:'한 달의 기적',desc:'30일 연속 출석',category:'attendance'},
  {id:'monthly_perfect',icon:'⭐',title:'이달의 개근왕',desc:'한 달 개근',category:'attendance'},
  {id:'quiz_first',icon:'🎯',title:'첫 도전',desc:'퀴즈 첫 응시',category:'quiz'},
  {id:'quiz_10',icon:'🧠',title:'트레이딩 입문',desc:'퀴즈 10점 이상',category:'quiz'},
  {id:'quiz_15',icon:'💡',title:'날카로운 분석',desc:'퀴즈 15점 이상',category:'quiz'},
  {id:'quiz_20',icon:'🔥',title:'퀴즈 마스터',desc:'퀴즈 만점 (20/20)',category:'quiz'},
  {id:'quiz_10times',icon:'📚',title:'연구하는 트레이더',desc:'퀴즈 10회 응시',category:'quiz'},
  {id:'level_bronze',icon:'🥉',title:'브론즈 달성',desc:'브론즈 레벨',category:'level'},
  {id:'level_silver',icon:'🥈',title:'실버 달성',desc:'실버 레벨 달성',category:'level'},
  {id:'level_gold',icon:'🥇',title:'골드 달성',desc:'골드 레벨 달성',category:'level'},
  {id:'calc_10',icon:'🔢',title:'계산의 달인',desc:'계산기 10회 사용',category:'activity'},
  {id:'ai_first',icon:'🤖',title:'AI와 대화',desc:'AI 채팅 첫 질문',category:'activity'}
];

// ========== DASHBOARD WIDGETS ==========
const DB_WIDGETS=[
  {id:'calendar',label:'📅 경제 캘린더',render:()=>'<div class="db-widget-body" style="color:var(--gray-400)">경제 캘린더 페이지로 이동하세요<br><button onclick="goToCalendar()" style="margin-top:8px;padding:6px 16px;border:none;border-radius:8px;background:var(--blue);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">바로가기 →</button></div>'},
  {id:'calculator',label:'💲 증거금 & 손익 계산기',render:()=>'<div class="db-widget-body"><button onclick="goToCalc()" style="padding:6px 16px;border:none;border-radius:8px;background:var(--green);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">계산기 열기 →</button></div>'},
  {id:'ai',label:'🤖 AI 채팅 바로가기',render:()=>'<div class="db-widget-body"><button onclick="aiToggle()" style="padding:6px 16px;border:none;border-radius:8px;background:var(--blue);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">AI 채팅 열기</button></div>'},
  {id:'attendance',label:'📊 오늘의 출석 현황',render:dbRenderAttendance},
  {id:'quiz',label:'📝 퀴즈 오늘의 문제',render:()=>'<div class="db-widget-body"><button onclick="goToNewQuiz()" style="padding:6px 16px;border:none;border-radius:8px;background:var(--green);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">퀴즈 풀기 →</button></div>'},
  {id:'level',label:'🎯 내 레벨 & 도전과제',render:dbRenderLevel},
  {id:'feargreed',label:'😱 공포/탐욕 지수',render:()=>'<div class="db-widget-body" style="min-height:200px"><iframe src="https://s.tradingview.com/embed-widget/technical-analysis/?symbol=CRYPTO%3ABTCUSD&interval=1D&width=100%25&height=180&locale=kr&colorTheme=light&isTransparent=true" style="width:100%;height:180px;border:none"></iframe></div>'}
];

async function dbRenderAttendance(){
  const user=auth.currentUser;
  if(!user)return'<div class="db-widget-body">로그인 필요</div>';
  const snap=await getDoc(doc(db,'users',user.uid));
  if(!snap.exists())return'<div class="db-widget-body">데이터 없음</div>';
  const d=snap.data();
  return`<div class="db-widget-body"><strong>연속 ${d.streak_current||0}일</strong> · 총 ${d.total_days||0}일 · 최고 ${d.streak_best||0}일</div>`;
}
async function dbRenderLevel(){
  const user=auth.currentUser;
  if(!user)return'<div class="db-widget-body">로그인 필요</div>';
  const snap=await getDoc(doc(db,'users',user.uid));
  if(!snap.exists())return'<div class="db-widget-body">데이터 없음</div>';
  const d=snap.data();
  const achSnap=await getDoc(doc(db,'users',user.uid,'achievements','data'));
  const achCount=achSnap.exists()?(achSnap.data().achievements||[]).filter(a=>a.achieved).length:0;
  return`<div class="db-widget-body">레벨: <strong>${d.level||'bronze'}</strong> · 도전과제: ${achCount}/15</div>`;
}

// Dashboard functions exposed globally
window.goToDashboard=function(){
  goToPage('chDashboard','dash-btn');
  dbRender();
};

let _dbEditing=false;
window.dbToggleEdit=function(){
  _dbEditing=!_dbEditing;
  const panel=document.getElementById('dbEditPanel');
  const btn=document.getElementById('dbEditBtn');
  if(_dbEditing){
    panel.style.display='block';btn.textContent='편집 취소';btn.classList.add('active');
    dbRenderEditGrid();
  }else{
    panel.style.display='none';btn.textContent='대시보드 편집';btn.classList.remove('active');
  }
};

async function dbRenderEditGrid(){
  const user=auth.currentUser;
  let enabled=['calendar','attendance','quiz','level','feargreed'];
  if(user){
    const snap=await getDoc(doc(db,'users',user.uid,'dashboard','config'));
    if(snap.exists()&&snap.data().widgets)enabled=snap.data().widgets;
  }
  const grid=document.getElementById('dbEditGrid');
  grid.innerHTML=DB_WIDGETS.map(w=>{
    const on=enabled.includes(w.id);
    return`<label class="db-edit-item ${on?'on':''}"><input type="checkbox" value="${w.id}" ${on?'checked':''} onchange="this.parentElement.classList.toggle('on')">${w.label}</label>`;
  }).join('');
}

window.dbSave=async function(){
  const user=auth.currentUser;
  if(!user){alert('로그인이 필요합니다');return}
  const checks=document.querySelectorAll('#dbEditGrid input:checked');
  const widgets=Array.from(checks).map(c=>c.value);
  await setDoc(doc(db,'users',user.uid,'dashboard','config'),{widgets,updated_at:serverTimestamp()},{merge:true});
  _dbEditing=false;
  document.getElementById('dbEditPanel').style.display='none';
  document.getElementById('dbEditBtn').textContent='대시보드 편집';
  document.getElementById('dbEditBtn').classList.remove('active');
  dbRender();
};

async function dbRender(){
  const user=auth.currentUser;
  const grid=document.getElementById('dbGrid');
  const loginMsg=document.getElementById('dbLoginMsg');
  if(!user){loginMsg.style.display='block';grid.innerHTML='';grid.appendChild(loginMsg);return}
  loginMsg.style.display='none';

  let enabled=['calendar','attendance','quiz','level','feargreed'];
  try{
    const snap=await getDoc(doc(db,'users',user.uid,'dashboard','config'));
    if(snap.exists()&&snap.data().widgets)enabled=snap.data().widgets;
  }catch(e){}

  let html='';
  for(const wid of enabled){
    const w=DB_WIDGETS.find(x=>x.id===wid);
    if(!w)continue;
    let body;
    try{body=await w.render()}catch(e){body='<div class="db-widget-body">로딩 실패</div>'}
    html+=`<div class="db-widget"><div class="db-widget-hd">${w.label}</div>${body}</div>`;
  }
  grid.innerHTML=html||'<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">위젯을 추가해보세요. "대시보드 편집" 버튼을 클릭하세요.</div>';
}

// ========== LEADERBOARD ==========
let _lbTab='attendance';
window.goToLeaderboard=function(){goToPage('chLeaderboard','lb-btn');lbLoad()};
window.lbSetTab=function(btn,tab){
  document.querySelectorAll('.lb-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');_lbTab=tab;lbLoad();
};

async function lbLoad(){
  const body=document.getElementById('lbBody');
  body.innerHTML='<div class="ec4-state"><div class="ec4-spinner"></div><br>로딩중...</div>';

  try{
    const q=query(collection(db,'users'),limit(50));
    const snap=await getDocs(q);
    let users=[];
    const thisMonth=kstToday().slice(0,7);
    snap.forEach(d=>{const u=d.data();u._uid=d.id;users.push(u)});

    // Perfect attendance this month
    const now=new Date(Date.now()+9*3600000);
    const dayOfMonth=now.getUTCDate();
    const perfects=users.filter(u=>{
      const monthDates=(u.attendance_dates||[]).filter(d=>d.startsWith(thisMonth));
      return monthDates.length>=dayOfMonth;
    });
    const perfEl=document.getElementById('lbPerfect');
    if(perfects.length){
      perfEl.style.display='block';
      document.getElementById('lbPerfectList').innerHTML=perfects.map(u=>
        `<div class="lb-perfect-user"><img src="${u.photoURL||''}" alt="">${u.name||'회원'} 🏆</div>`
      ).join('');
    }else{perfEl.style.display='none'}

    // Sort by tab
    if(_lbTab==='attendance'){
      users.forEach(u=>{u._score=(u.attendance_dates||[]).filter(d=>d.startsWith(thisMonth)).length});
      users.sort((a,b)=>b._score-a._score);
    }else if(_lbTab==='quiz'){
      // Load quiz scores
      for(const u of users){
        try{
          const qs=await getDoc(doc(db,'users',u._uid,'quiz_records','data'));
          u._score=qs.exists()?qs.data().best_score||0:0;
        }catch(e){u._score=0}
      }
      users.sort((a,b)=>b._score-a._score);
    }else{
      users.forEach(u=>{u._score=u.streak_current||0});
      users.sort((a,b)=>b._score-a._score);
    }

    const labels={attendance:'일 출석',quiz:'점',streak:'일 연속'};
    const label=labels[_lbTab];

    body.innerHTML='<div class="lb-list">'+users.filter(u=>u._score>0).map((u,i)=>{
      const rank=i+1;
      const cls=rank<=3?` rank${rank}`:'';
      const medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank;
      return`<div class="lb-item${cls}"><div class="lb-rank">${medal}</div><img class="lb-photo" src="${u.photoURL||''}" alt=""><div class="lb-name">${u.name||'회원'}</div><div class="lb-score">${u._score}${label}</div></div>`;
    }).join('')+'</div>';

    // My rank
    const user=auth.currentUser;
    if(user){
      const myIdx=users.findIndex(u=>u._uid===user.uid);
      const myRank=document.getElementById('lbMyRank');
      if(myIdx>=0){
        myRank.style.display='block';
        myRank.textContent=`내 순위: 전체 ${users.filter(u=>u._score>0).length}명 중 ${myIdx+1}위 (${users[myIdx]._score}${label})`;
      }else{myRank.style.display='none'}
    }
  }catch(e){
    body.innerHTML='<div class="ec4-state">리더보드 데이터를 불러올 수 없습니다.</div>';
    console.error('Leaderboard error:',e);
  }
}

// ========== NEW QUIZ ==========
let nqState={current:0,score:0,questions:[],answers:[],timer:null,timeLeft:30};

window.goToNewQuiz=function(){if(window.goToUnifiedQuiz)window.goToUnifiedQuiz();else{goToPage('chUnifiedQuiz','quiz-btn');nqLoadInfo()}};

async function nqLoadInfo(){
  document.getElementById('nqGame').style.display='none';
  document.getElementById('nqResult').style.display='none';
  document.getElementById('nqInfo').style.display='block';
  const user=auth.currentUser;
  if(!user){
    document.getElementById('nqAttempts').textContent='로그인 필요';
    document.getElementById('nqStartBtn').disabled=true;
    return;
  }
  const today=kstToday();
  const snap=await getDoc(doc(db,'users',user.uid,'quiz_records','data'));
  let attempts=0,best=0;
  if(snap.exists()){
    const d=snap.data();
    best=d.best_score||0;
    if(d.last_date===today)attempts=d.attempts_today||0;
  }
  document.getElementById('nqAttempts').textContent=`${attempts} / 3회`;
  document.getElementById('nqBest').textContent=`${best} / 20`;
  document.getElementById('nqStartBtn').disabled=attempts>=3;
  if(attempts>=3)document.getElementById('nqStartBtn').textContent='오늘 응시 횟수를 모두 사용했습니다';
}

window.nqStart=function(){
  const shuffled=[...QUIZ_DATA].sort(()=>Math.random()-.5);
  nqState={current:0,score:0,questions:shuffled,answers:new Array(shuffled.length).fill(null),timer:null,timeLeft:30};
  document.getElementById('nqInfo').style.display='none';
  document.getElementById('nqResult').style.display='none';
  document.getElementById('nqGame').style.display='block';
  nqRender();
};

function nqRender(){
  const q=nqState.questions[nqState.current];
  const total=nqState.questions.length;
  document.getElementById('nqProgFill').style.width=((nqState.current+1)/total*100)+'%';
  document.getElementById('nqCount').textContent=`${nqState.current+1}/${total}`;
  document.getElementById('nqCat').textContent=q.category;
  document.getElementById('nqQuestion').textContent=q.question;
  document.getElementById('nqFeedback').style.display='none';
  document.getElementById('nqNextBtn').style.display='none';

  const optEl=document.getElementById('nqOptions');
  if(q.type==='ox'){
    optEl.innerHTML='<button class="nq-opt ox" onclick="nqAnswer(true)">⭕ 맞다</button><button class="nq-opt ox" onclick="nqAnswer(false)">❌ 틀리다</button>';
  }else{
    optEl.innerHTML=q.options.map((o,i)=>`<button class="nq-opt" onclick="nqAnswer(${i})">${o}</button>`).join('');
  }

  // Timer
  nqState.timeLeft=30;
  clearInterval(nqState.timer);
  const timerEl=document.getElementById('nqTimer');
  timerEl.textContent='30';timerEl.classList.remove('warn');
  nqState.timer=setInterval(()=>{
    nqState.timeLeft--;
    timerEl.textContent=nqState.timeLeft;
    if(nqState.timeLeft<=10)timerEl.classList.add('warn');
    if(nqState.timeLeft<=0){clearInterval(nqState.timer);nqTimeout()}
  },1000);
}

function nqTimeout(){
  document.querySelectorAll('.nq-opt').forEach(b=>{b.classList.add('disabled');b.onclick=null});
  nqState.answers[nqState.current]=false;
  const q=nqState.questions[nqState.current];
  const fb=document.getElementById('nqFeedback');
  fb.className='nq-feedback wrong';fb.style.display='block';
  fb.innerHTML=`⏰ 시간 초과!<br>${q.explanation}`;
  document.getElementById('nqNextBtn').style.display='inline-block';
  document.getElementById('nqNextBtn').textContent=nqState.current<nqState.questions.length-1?'다음 문제 →':'결과 보기';
}

window.nqAnswer=function(val){
  clearInterval(nqState.timer);
  const q=nqState.questions[nqState.current];
  let correct;
  if(q.type==='ox')correct=val===q.answer;
  else correct=val===q.answer;

  if(correct)nqState.score++;
  nqState.answers[nqState.current]=correct;

  const btns=document.querySelectorAll('.nq-opt');
  btns.forEach((b,i)=>{
    b.classList.add('disabled');b.onclick=null;
    if(q.type==='ox'){
      if((i===0&&q.answer===true)||(i===1&&q.answer===false))b.classList.add('correct');
      else if((i===0&&val===true&&!correct)||(i===1&&val===false&&!correct))b.classList.add('wrong');
    }else{
      if(i===q.answer)b.classList.add('correct');
      else if(i===val&&!correct)b.classList.add('wrong');
    }
  });

  const fb=document.getElementById('nqFeedback');
  fb.className='nq-feedback '+(correct?'correct':'wrong');fb.style.display='block';
  fb.innerHTML=(correct?'✅ 정답!':'❌ 오답!')+'<br>'+q.explanation;
  document.getElementById('nqNextBtn').style.display='inline-block';
  document.getElementById('nqNextBtn').textContent=nqState.current<nqState.questions.length-1?'다음 문제 →':'결과 보기';
};

window.nqNext=async function(){
  if(nqState.current<nqState.questions.length-1){
    nqState.current++;nqRender();
  }else{
    await nqShowResult();
  }
};

async function nqShowResult(){
  clearInterval(nqState.timer);
  document.getElementById('nqGame').style.display='none';
  const total=nqState.questions.length;
  const pct=Math.round(nqState.score/total*100);

  // Category breakdown
  const cats={};
  nqState.questions.forEach((q,i)=>{
    if(!cats[q.category])cats[q.category]={correct:0,total:0};
    cats[q.category].total++;
    if(nqState.answers[i])cats[q.category].correct++;
  });

  let msg='';
  if(nqState.score===total)msg='🏆 만점! 완벽합니다!';
  else if(nqState.score>=15)msg='🔥 훌륭해요! 거의 전문가!';
  else if(nqState.score>=10)msg='👍 좋아요! 계속 공부하세요!';
  else msg='📚 더 공부가 필요해요!';

  const result=document.getElementById('nqResult');
  result.style.display='block';
  result.innerHTML=`
    <div class="nq-result-score">${nqState.score} / ${total}</div>
    <div class="nq-result-label">정답률 ${pct}%</div>
    <div class="nq-result-msg">${msg}</div>
    <div class="nq-result-cats">${Object.entries(cats).map(([k,v])=>`<div class="nq-result-cat">${k}: ${v.correct}/${v.total}</div>`).join('')}</div>
    <div class="nq-result-btns">
      <button onclick="nqStart()" style="background:var(--blue);color:#fff">다시 도전</button>
      <button onclick="goToLeaderboard()" style="background:var(--gray-100);color:var(--navy)">리더보드</button>
    </div>`;

  // Save to Firestore
  const user=auth.currentUser;
  if(user){
    const today=kstToday();
    const ref=doc(db,'users',user.uid,'quiz_records','data');
    const snap=await getDoc(ref);
    let data=snap.exists()?snap.data():{};
    const attempts=(data.last_date===today?data.attempts_today||0:0)+1;
    const best=Math.max(data.best_score||0,nqState.score);
    const totalAttempts=(data.total_attempts||0)+1;
    await setDoc(ref,{
      last_date:today,score:nqState.score,total:total,
      attempts_today:attempts,best_score:best,total_attempts:totalAttempts,
      category_scores:cats,updated_at:serverTimestamp()
    },{merge:true});

    // Check achievements
    achvCheck(user.uid,{quiz_score:nqState.score,quiz_attempts:totalAttempts});
  }
}

// ========== ACHIEVEMENTS ==========
let _achvTab='all';
window.goToAchievements=function(){goToPage('chAchievements','achv-btn');achvRender()};
window.achvSetTab=function(btn,tab){
  document.querySelectorAll('.achv-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');_achvTab=tab;achvRender();
};

async function achvRender(){
  const user=auth.currentUser;
  if(!user){
    document.getElementById('achvGrid').innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">로그인이 필요합니다</div>';
    return;
  }
  const snap=await getDoc(doc(db,'users',user.uid,'achievements','data'));
  const achieved=snap.exists()?(snap.data().achievements||[]):[];
  const achievedMap={};
  achieved.forEach(a=>{if(a.achieved)achievedMap[a.id]=a});
  const total=Object.keys(achievedMap).length;

  // Progress
  document.getElementById('achvProgress').innerHTML=`
    <div class="achv-progress-text">${total} / ${ACHV_DATA.length} 달성</div>
    <div class="achv-progress-bar"><div class="achv-progress-fill" style="width:${total/ACHV_DATA.length*100}%"></div></div>`;

  // Grid
  const filtered=_achvTab==='all'?ACHV_DATA:ACHV_DATA.filter(a=>a.category===_achvTab);
  document.getElementById('achvGrid').innerHTML=filtered.map(a=>{
    const done=achievedMap[a.id];
    const cls=done?'achv-card':'achv-card locked';
    const date=done&&done.achieved_at?'달성: '+(done.achieved_at.toDate?done.achieved_at.toDate().toLocaleDateString('ko-KR'):done.achieved_at):'미달성';
    return`<div class="${cls}"><div class="achv-icon">${a.icon}</div><div class="achv-info"><div class="achv-name">${a.title}</div><div class="achv-desc">${a.desc}</div><div class="achv-date">${date}</div></div></div>`;
  }).join('');
}

async function achvCheck(uid,extra){
  const ref=doc(db,'users',uid,'achievements','data');
  const snap=await getDoc(ref);
  let achievements=snap.exists()?(snap.data().achievements||[]):[];
  const achievedIds=new Set(achievements.filter(a=>a.achieved).map(a=>a.id));
  const userSnap=await getDoc(doc(db,'users',uid));
  const u=userSnap.exists()?userSnap.data():{};
  const newAchievements=[];

  function grant(id){
    if(achievedIds.has(id))return;
    newAchievements.push(id);
    achievements=achievements.filter(a=>a.id!==id);
    achievements.push({id,achieved:true,achieved_at:new Date().toISOString()});
  }

  // Check conditions
  grant('first_login');
  if((u.streak_current||0)>=7)grant('streak_7');
  if((u.streak_current||0)>=14)grant('streak_14');
  if((u.streak_current||0)>=30)grant('streak_30');
  if((u.total_days||0)>=1)grant('level_bronze');
  if((u.total_days||0)>=15)grant('level_silver');
  if((u.total_days||0)>=30)grant('level_gold');

  // Monthly perfect
  const thisMonth=kstToday().slice(0,7);
  const monthDates=(u.attendance_dates||[]).filter(d=>d.startsWith(thisMonth));
  const dayOfMonth=new Date(Date.now()+9*3600000).getUTCDate();
  if(monthDates.length>=dayOfMonth&&dayOfMonth>=28)grant('monthly_perfect');

  // Quiz
  if(extra){
    if(extra.quiz_attempts>=1)grant('quiz_first');
    if(extra.quiz_score>=10)grant('quiz_10');
    if(extra.quiz_score>=15)grant('quiz_15');
    if(extra.quiz_score>=20)grant('quiz_20');
    if(extra.quiz_attempts>=10)grant('quiz_10times');
  }

  // Activity - calc usage
  const calcCount=parseInt(localStorage.getItem('calcUseCount')||'0');
  if(calcCount>=10)grant('calc_10');

  // Activity - AI chat
  const aiUsed=localStorage.getItem('aiChatUsed');
  if(aiUsed)grant('ai_first');

  // Save
  if(newAchievements.length){
    await setDoc(ref,{achievements,total_achieved:achievements.filter(a=>a.achieved).length,updated_at:serverTimestamp()},{merge:true});
    // Show popup for first new achievement
    const achvDef=ACHV_DATA.find(a=>a.id===newAchievements[0]);
    if(achvDef)achvShowPopup(achvDef);
  }
}

function achvShowPopup(achv){
  const popup=document.getElementById('achvPopup');
  document.getElementById('achvPopupIcon').textContent=achv.icon;
  document.getElementById('achvPopupName').textContent=achv.title+' — '+achv.desc;
  const pc=document.getElementById('achvParticles');pc.innerHTML='';
  for(let i=0;i<20;i++){
    const p=document.createElement('div');p.className='lvlup-particle';
    p.style.left=Math.random()*100+'%';p.style.top='-10px';
    p.style.background=['#FFD700','#3182F6','#FF6B35','#20C997'][Math.floor(Math.random()*4)];
    p.style.animationDelay=Math.random()*.8+'s';
    p.style.width=(4+Math.random()*6)+'px';p.style.height=p.style.width;
    pc.appendChild(p);
  }
  popup.style.display='flex';
  setTimeout(()=>{popup.style.display='none'},3000);
}

// Hook: track calc usage
const _origCalcUpdate=window.calcUpdate;
if(_origCalcUpdate){
  window.calcUpdate=function(){
    _origCalcUpdate();
    const c=parseInt(localStorage.getItem('calcUseCount')||'0')+1;
    localStorage.setItem('calcUseCount',String(c));
  };
}

// Hook: track AI chat usage
const _origAiSend=window.aiSend;
if(typeof _origAiSend==='function'){
  window.aiSend=function(){
    localStorage.setItem('aiChatUsed','true');
    return _origAiSend();
  };
}

// Check achievements on auth state change
const _achvInterval=setInterval(()=>{
  try{
    auth.onAuthStateChanged(user=>{
      if(user)setTimeout(()=>achvCheck(user.uid,{}),2000);
    });
    clearInterval(_achvInterval);
  }catch(e){}
},500);
