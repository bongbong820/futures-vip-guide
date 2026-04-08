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

// ========== ACHIEVEMENTS DATA (52 total) ==========
const ACHV_DATA=[
  // 출석 (10)
  {id:'first_login',icon:'🌱',title:'첫 발걸음',desc:'첫 로그인',category:'attendance',diff:'easy'},
  {id:'streak_7',icon:'📅',title:'일주일의 약속',desc:'7일 연속 출석',category:'attendance',diff:'easy'},
  {id:'streak_14',icon:'💪',title:'꾸준함의 힘',desc:'14일 연속 출석',category:'attendance',diff:'medium'},
  {id:'streak_30',icon:'🏆',title:'한 달의 기적',desc:'30일 연속 출석',category:'attendance',diff:'hard'},
  {id:'monthly_perfect',icon:'⭐',title:'이달의 개근왕',desc:'한 달 개근',category:'attendance',diff:'hard'},
  {id:'weekend_warrior',icon:'🌅',title:'주말 전사',desc:'토·일 연속 출석',category:'attendance',diff:'easy'},
  {id:'monday_fighter',icon:'💼',title:'월요병 극복',desc:'월요일 4주 연속 출석',category:'attendance',diff:'easy'},
  {id:'early_bird',icon:'🌄',title:'새벽 트레이더',desc:'오전 6시 이전 접속 3회',category:'attendance',diff:'easy'},
  {id:'steady_month',icon:'📊',title:'꾸준한 한 달',desc:'한 달 20일 이상 출석',category:'attendance',diff:'medium'},
  {id:'quarter_champ',icon:'👑',title:'분기 챔피언',desc:'3개월 연속 15일 이상 출석',category:'attendance',diff:'hard'},
  // 퀴즈 (10)
  {id:'quiz_first',icon:'🎯',title:'첫 도전',desc:'퀴즈 최초 완료',category:'quiz',diff:'easy'},
  {id:'quiz_10',icon:'🧠',title:'트레이딩 입문',desc:'퀴즈 10점 이상',category:'quiz',diff:'easy'},
  {id:'quiz_15',icon:'💡',title:'날카로운 분석',desc:'퀴즈 15점 이상',category:'quiz',diff:'medium'},
  {id:'quiz_20',icon:'🔥',title:'퀴즈 마스터',desc:'퀴즈 만점 (20/20)',category:'quiz',diff:'hard'},
  {id:'quiz_10times',icon:'📚',title:'연구하는 트레이더',desc:'퀴즈 10회 응시',category:'quiz',diff:'medium'},
  {id:'quiz_streak7',icon:'📆',title:'연속 응시',desc:'7일 연속 퀴즈 응시',category:'quiz',diff:'medium'},
  {id:'quiz_retry10',icon:'🔄',title:'오답 노트',desc:'틀린 문제 재도전 후 정답 10회',category:'quiz',diff:'medium'},
  {id:'quiz_speed20',icon:'⚡',title:'스피드 퀴즈',desc:'타이머 10초 이내 정답 20회',category:'quiz',diff:'medium'},
  {id:'quiz_allcat',icon:'📋',title:'카테고리 완파',desc:'모든 카테고리 응시',category:'quiz',diff:'medium'},
  {id:'quiz_3perfect',icon:'🏅',title:'퀴즈 3연패',desc:'3일 연속 만점',category:'quiz',diff:'hard'},
  // 계산기 (6)
  {id:'calc_first',icon:'🔢',title:'첫 계산',desc:'계산기 최초 사용',category:'calculator',diff:'easy'},
  {id:'calc_pnl5',icon:'💰',title:'손익 입문',desc:'손익 계산기 5회',category:'calculator',diff:'easy'},
  {id:'calc_pos10',icon:'📐',title:'리스크 관리자',desc:'포지션 사이징 10회',category:'calculator',diff:'medium'},
  {id:'calc_liq10',icon:'⚠️',title:'청산 경계',desc:'청산가 계산기 10회',category:'calculator',diff:'medium'},
  {id:'calc_rr20',icon:'⚖️',title:'손익비 달인',desc:'손익비 계산기 20회',category:'calculator',diff:'medium'},
  {id:'calc_master',icon:'🧮',title:'계산기 마스터',desc:'4종 계산기 각 10회 이상',category:'calculator',diff:'hard'},
  // 용어사전 (5)
  {id:'gl_first',icon:'🔍',title:'첫 검색',desc:'용어사전 최초 검색',category:'glossary',diff:'easy'},
  {id:'gl_bm10',icon:'📌',title:'단어 수집가',desc:'북마크 10개',category:'glossary',diff:'easy'},
  {id:'gl_view20',icon:'📖',title:'용어 탐험가',desc:'20개 항목 열람',category:'glossary',diff:'easy'},
  {id:'gl_cat_done',icon:'📗',title:'카테고리 완독',desc:'한 카테고리 전체 열람',category:'glossary',diff:'medium'},
  {id:'gl_all',icon:'🎓',title:'용어 박사',desc:'전체 항목 열람',category:'glossary',diff:'hard'},
  // AI채팅 (5)
  {id:'ai_first',icon:'🤖',title:'AI와 첫 대화',desc:'AI 최초 질문',category:'ai',diff:'easy'},
  {id:'ai_10',icon:'💬',title:'AI 단골',desc:'AI 질문 10회',category:'ai',diff:'easy'},
  {id:'ai_deep',icon:'🗣️',title:'깊은 대화',desc:'한 세션에 5회 이상 연속 질문',category:'ai',diff:'easy'},
  {id:'ai_50',icon:'🧑‍💻',title:'AI 마니아',desc:'AI 질문 50회',category:'ai',diff:'medium'},
  {id:'ai_100',icon:'🏅',title:'AI 전문가',desc:'AI 질문 100회',category:'ai',diff:'hard'},
  // 차트 (2)
  {id:'chart_first',icon:'📈',title:'차트 입문',desc:'차트 보기 첫 방문',category:'chart',diff:'easy'},
  {id:'chart_10',icon:'📊',title:'차트 분석가',desc:'차트 10회 방문',category:'chart',diff:'medium'},
  // 레벨 (3)
  {id:'level_bronze',icon:'🥉',title:'브론즈 달성',desc:'브론즈 레벨',category:'level',diff:'easy'},
  {id:'level_silver',icon:'🥈',title:'실버 달성',desc:'실버 레벨 달성',category:'level',diff:'medium'},
  {id:'level_gold',icon:'🥇',title:'골드 달성',desc:'골드 레벨 달성',category:'level',diff:'hard'},
  // 특별 (11)
  {id:'vip_spirit',icon:'💎',title:'VIP 정신',desc:'모든 기능 최소 1회 사용',category:'special',diff:'easy'},
  {id:'all_rounder',icon:'🌟',title:'올라운더',desc:'하루에 5가지 기능 모두 사용',category:'special',diff:'medium'},
  {id:'mission_first',icon:'🎯',title:'3일 미션 완료',desc:'3일 미션 세트 첫 완료',category:'mission',diff:'easy'},
  {id:'mission_5',icon:'🏅',title:'미션 달인',desc:'3일 미션 5세트 완료',category:'mission',diff:'medium'},
  {id:'mission_10',icon:'🏆',title:'미션 마스터',desc:'3일 미션 10세트 완료',category:'mission',diff:'hard'},
  {id:'legend_50',icon:'⭐',title:'전설의 트레이더',desc:'전체 과제 50% 달성',category:'special',diff:'hard'},
  {id:'perfect_100',icon:'💫',title:'완벽한 트레이더',desc:'전체 과제 100% 달성',category:'special',diff:'vhard'}
];

// ========== 3-DAY MISSION SETS (10 sets) ==========
const MISSION_SETS=[
  {name:'기초 탐험',tasks:[
    {desc:'경제 캘린더 오늘 일정 확인',key:'visit_calendar'},
    {desc:'용어사전 3개 항목 열람',key:'gl_view_3'},
    {desc:'퀴즈 1회 응시',key:'quiz_attempt'},
    {desc:'AI 채팅 질문 1회',key:'ai_chat_1'}
  ]},
  {name:'계산 연습',tasks:[
    {desc:'손익 계산기 사용 2회',key:'calc_pnl_2'},
    {desc:'계산기 다른 종류 1회',key:'calc_other'},
    {desc:'퀴즈 정답 5개 이상',key:'quiz_correct_5'},
    {desc:'AI 채팅 질문 1회',key:'ai_chat_1'}
  ]},
  {name:'뉴스 & 일정',tasks:[
    {desc:'경제 캘린더 확인',key:'visit_calendar'},
    {desc:'AI에게 시장 관련 질문',key:'ai_chat_1'},
    {desc:'용어사전 검색 2회',key:'gl_search_2'},
    {desc:'퀴즈 1회 응시',key:'quiz_attempt'}
  ]},
  {name:'퀴즈 집중',tasks:[
    {desc:'퀴즈 2회 응시',key:'quiz_attempt_2'},
    {desc:'퀴즈 정답률 70% 이상',key:'quiz_70pct'},
    {desc:'AI에게 모르는 용어 질문',key:'ai_chat_1'},
    {desc:'용어사전 5개 항목 열람',key:'gl_view_5'}
  ]},
  {name:'차트 & 분석',tasks:[
    {desc:'차트 보기 페이지 방문',key:'visit_chart'},
    {desc:'용어사전 기술적분석 5개 열람',key:'gl_view_5'},
    {desc:'퀴즈 1회 응시',key:'quiz_attempt'},
    {desc:'AI에게 차트 관련 질문',key:'ai_chat_1'}
  ]},
  {name:'매매 기록',tasks:[
    {desc:'매매일지 페이지 방문',key:'visit_journal'},
    {desc:'계산기 1회 사용',key:'calc_any'},
    {desc:'퀴즈 1회 응시',key:'quiz_attempt'},
    {desc:'AI에게 손절 관련 질문',key:'ai_chat_1'}
  ]},
  {name:'출석 챌린지',tasks:[
    {desc:'3일 연속 출석 유지',key:'streak_3'},
    {desc:'매일 퀴즈 1회씩 응시',key:'quiz_attempt'},
    {desc:'AI 채팅 질문 1회',key:'ai_chat_1'},
    {desc:'경제 캘린더 확인',key:'visit_calendar'}
  ]},
  {name:'용어 마스터',tasks:[
    {desc:'용어사전 10개 항목 열람',key:'gl_view_10'},
    {desc:'퀴즈 정답 5개 이상',key:'quiz_correct_5'},
    {desc:'AI에게 용어 설명 요청',key:'ai_chat_1'},
    {desc:'경제 캘린더 확인',key:'visit_calendar'}
  ]},
  {name:'경제지표 공부',tasks:[
    {desc:'경제 캘린더 이번주 탭 확인',key:'visit_calendar_week'},
    {desc:'AI에게 FOMC/CPI/NFP 질문',key:'ai_chat_3'},
    {desc:'퀴즈 1회 응시',key:'quiz_attempt'},
    {desc:'용어사전 3개 항목 열람',key:'gl_view_3'}
  ]},
  {name:'올라운더',tasks:[
    {desc:'모든 사이드바 메뉴 1회씩 방문',key:'visit_all'},
    {desc:'계산기 사용 1회',key:'calc_any'},
    {desc:'퀴즈 1회 응시',key:'quiz_attempt'},
    {desc:'AI와 3회 이상 대화',key:'ai_chat_3'}
  ]}
];

const DIFF_LABELS={easy:'쉬움',medium:'보통',hard:'어려움',vhard:'매우 어려움'};

// ========== DASHBOARD WIDGETS ==========
const DB_WIDGETS=[
  {id:'calendar',label:'📅 경제 캘린더',render:()=>'<div class="db-widget-body" style="color:var(--gray-400)">경제 캘린더 페이지로 이동하세요<br><button onclick="goToCalendar()" style="margin-top:8px;padding:6px 16px;border:none;border-radius:8px;background:var(--blue);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">바로가기 →</button></div>'},
  {id:'calculator',label:'💲 증거금 & 손익 계산기',render:()=>'<div class="db-widget-body"><button onclick="goToCalc()" style="padding:6px 16px;border:none;border-radius:8px;background:var(--green);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">계산기 열기 →</button></div>'},
  {id:'ai',label:'🤖 AI 채팅 바로가기',render:()=>'<div class="db-widget-body"><button onclick="aiToggle()" style="padding:6px 16px;border:none;border-radius:8px;background:var(--blue);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">AI 채팅 열기</button></div>'},
  {id:'attendance',label:'📊 오늘의 출석 현황',render:dbRenderAttendance},
  {id:'quiz',label:'📝 퀴즈 오늘의 문제',render:()=>'<div class="db-widget-body"><button onclick="goToNewQuiz()" style="padding:6px 16px;border:none;border-radius:8px;background:var(--green);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px">퀴즈 풀기 →</button></div>'},
  {id:'level',label:'🎯 내 레벨 & 도전과제',render:dbRenderLevel},
  {id:'feargreed',label:'😱 공포/탐욕 지수',render:()=>{
    const dark=document.body.classList.contains('dark');
    const theme=dark?'dark':'light';
    return`<div class="db-widget-body db-fg-body"><div class="db-fg-powered">Powered by TradingView</div><div class="db-fg-wrap"><div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js">{"interval":"1D","width":"100%","height":"200","symbol":"CRYPTO:BTCUSD","showIntervalTabs":false,"isTransparent":true,"locale":"kr","colorTheme":"${theme}"}<\/script></div></div></div>`;
  }}
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
window.goToAchievements=function(){goToPage('chAchievements','achv-btn');achvRender();msRender()};
window.achvSetTab=function(btn,tab){
  document.querySelectorAll('.achv-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');_achvTab=tab;achvRender();
};

function formatDate(d){
  if(!d)return'미달성';
  try{
    const dt=typeof d==='string'?new Date(d):(d.toDate?d.toDate():new Date(d));
    return dt.getFullYear()+'년 '+(dt.getMonth()+1)+'월 '+dt.getDate()+'일';
  }catch(e){return String(d)}
}

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

  document.getElementById('achvProgress').innerHTML=`
    <div class="achv-progress-text">${total} / ${ACHV_DATA.length} 달성</div>
    <div class="achv-progress-bar"><div class="achv-progress-fill" style="width:${total/ACHV_DATA.length*100}%"></div></div>`;

  const filtered=_achvTab==='all'?ACHV_DATA:ACHV_DATA.filter(a=>a.category===_achvTab);
  // Sort: achieved first, then by difficulty
  const sorted=[...filtered].sort((a,b)=>{
    const aD=achievedMap[a.id]?0:1,bD=achievedMap[b.id]?0:1;
    return aD-bD;
  });

  document.getElementById('achvGrid').innerHTML=sorted.map(a=>{
    const done=achievedMap[a.id];
    const cls=done?'achv-card':'achv-card locked';
    const date=done?'달성: '+formatDate(done.achieved_at):'미달성';
    const diffCls=a.diff==='vhard'?'vhard':a.diff;
    const diffLabel=DIFF_LABELS[a.diff]||'';
    return`<div class="${cls}"><div class="achv-diff ${diffCls}">${diffLabel}</div><div class="achv-icon">${a.icon}</div><div class="achv-info"><div class="achv-name">${a.title}</div><div class="achv-desc">${a.desc}</div><div class="achv-date">${date}</div></div></div>`;
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
  const ts=new Date().toISOString();

  function grant(id){
    if(!ACHV_DATA.find(a=>a.id===id))return;
    if(achievedIds.has(id))return;
    newAchievements.push(id);
    achievements=achievements.filter(a=>a.id!==id);
    achievements.push({id,achieved:true,achieved_at:ts});
  }

  // Attendance
  grant('first_login');
  const streak=u.streak_current||0;
  if(streak>=7)grant('streak_7');
  if(streak>=14)grant('streak_14');
  if(streak>=30)grant('streak_30');
  const totalDays=u.total_days||0;

  // Weekend warrior
  const kstNow=new Date(Date.now()+9*3600000);
  const dow=kstNow.getUTCDay();
  const dates=u.attendance_dates||[];
  if(dow===0){const sat=new Date(kstNow.getTime()-86400000).toISOString().slice(0,10);if(dates.includes(sat))grant('weekend_warrior')}

  // Early bird
  const earlyCount=parseInt(localStorage.getItem('earlyBirdCount')||'0');
  if(kstNow.getUTCHours()<6){const c=earlyCount+1;localStorage.setItem('earlyBirdCount',String(c));if(c>=3)grant('early_bird')}

  // Steady month (20+ days)
  const thisMonth=kstToday().slice(0,7);
  const monthDates=dates.filter(d=>d.startsWith(thisMonth));
  const dayOfMonth=kstNow.getUTCDate();
  if(monthDates.length>=20)grant('steady_month');
  if(monthDates.length>=dayOfMonth&&dayOfMonth>=28)grant('monthly_perfect');

  // Levels
  if(totalDays>=1)grant('level_bronze');
  if(totalDays>=15)grant('level_silver');
  if(totalDays>=30)grant('level_gold');

  // Quiz
  const e=extra||{};
  const qAttempts=e.quiz_attempts||0;
  const qScore=e.quiz_score||0;
  if(qAttempts>=1)grant('quiz_first');
  if(qScore>=10)grant('quiz_10');
  if(qScore>=15)grant('quiz_15');
  if(qScore>=20)grant('quiz_20');
  if(qAttempts>=10)grant('quiz_10times');

  // Calculator
  const calcCount=parseInt(localStorage.getItem('calcUseCount')||'0');
  if(calcCount>=1)grant('calc_first');
  if(calcCount>=5)grant('calc_pnl5');
  if(calcCount>=10){grant('calc_pos10');grant('calc_liq10')}
  if(calcCount>=20)grant('calc_rr20');

  // AI chat
  const aiCount=parseInt(localStorage.getItem('aiChatCount')||'0');
  if(aiCount>=1)grant('ai_first');
  if(aiCount>=10)grant('ai_10');
  if(aiCount>=50)grant('ai_50');
  if(aiCount>=100)grant('ai_100');
  const aiSession=parseInt(localStorage.getItem('aiSessionCount')||'0');
  if(aiSession>=5)grant('ai_deep');

  // Glossary
  const glViews=parseInt(localStorage.getItem('glViewCount')||'0');
  const glSearches=parseInt(localStorage.getItem('glSearchCount')||'0');
  if(glSearches>=1)grant('gl_first');
  if(glViews>=20)grant('gl_view20');

  // Chart
  const chartVisits=parseInt(localStorage.getItem('chartVisitCount')||'0');
  if(chartVisits>=1)grant('chart_first');
  if(chartVisits>=10)grant('chart_10');

  // Missions
  const msSnap=await getDoc(doc(db,'users',uid,'missions','data'));
  const msData=msSnap.exists()?msSnap.data():{};
  const completedSets=(msData.completed_sets||[]).length;
  if(completedSets>=1)grant('mission_first');
  if(completedSets>=5)grant('mission_5');
  if(completedSets>=10)grant('mission_10');

  // Special: progress-based
  const totalAchieved=achievements.filter(a=>a.achieved).length+newAchievements.length;
  if(totalAchieved>=Math.ceil(ACHV_DATA.length*0.5))grant('legend_50');
  if(totalAchieved>=ACHV_DATA.length-1)grant('perfect_100');

  // Save
  if(newAchievements.length){
    await setDoc(ref,{achievements,total_achieved:achievements.filter(a=>a.achieved).length,updated_at:serverTimestamp()},{merge:true});
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

// ========== 3-DAY MISSIONS ==========
let _msTimer;
async function msRender(){
  const user=auth.currentUser;
  const section=document.getElementById('msSection');
  if(!user){section.style.display='none';return}
  section.style.display='block';

  const ref=doc(db,'users',user.uid,'missions','data');
  const snap=await getDoc(ref);
  let msData=snap.exists()?snap.data():{};
  const today=kstToday();

  // Initialize or rotate mission set
  if(!msData.set_start_date||today>msData.set_end_date){
    const setIdx=(msData.current_set!=null?(msData.current_set+1)%MISSION_SETS.length:0);
    const endDate=new Date(Date.now()+9*3600000+3*86400000).toISOString().slice(0,10);
    msData={
      current_set:setIdx,set_start_date:today,set_end_date:endDate,
      completed_tasks:new Array(MISSION_SETS[setIdx].tasks.length).fill(false),
      completed_sets:msData.completed_sets||[],total_missions_completed:msData.total_missions_completed||0
    };
    await setDoc(ref,msData,{merge:true});
  }

  const set=MISSION_SETS[msData.current_set]||MISSION_SETS[0];
  const tasks=msData.completed_tasks||new Array(set.tasks.length).fill(false);
  const done=tasks.filter(Boolean).length;
  const allDone=done===set.tasks.length;

  document.getElementById('msTitle').textContent=`이번 3일 미션: ${set.name}`;
  document.getElementById('msProgressText').textContent=`${done} / ${set.tasks.length} 완료`;
  document.getElementById('msProgressFill').style.width=(done/set.tasks.length*100)+'%';

  // Tasks
  document.getElementById('msTasks').innerHTML=set.tasks.map((t,i)=>{
    const isDone=tasks[i];
    return`<div class="ms-task${isDone?' done':''}"><span class="ms-task-check">${isDone?'✅':'⬜'}</span>${t.desc}</div>`;
  }).join('');

  // Complete message
  document.getElementById('msComplete').style.display=allDone?'block':'none';

  // If all done and not yet recorded
  if(allDone&&!(msData.completed_sets||[]).includes('set'+(msData.current_set+1))){
    msData.completed_sets=(msData.completed_sets||[]);
    msData.completed_sets.push('set'+(msData.current_set+1));
    msData.total_missions_completed=(msData.total_missions_completed||0)+1;
    await setDoc(ref,msData,{merge:true});
    achvCheck(user.uid,{});
  }

  // Countdown
  msCountdown(msData.set_end_date);
}

function msCountdown(endDate){
  clearInterval(_msTimer);
  const el=document.getElementById('msCountdown');
  function tick(){
    const end=new Date(endDate+'T23:59:59+09:00').getTime();
    const diff=Math.max(0,end-Date.now());
    if(diff<=0){el.textContent='시간 만료';clearInterval(_msTimer);return}
    const h=Math.floor(diff/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    el.textContent=`남은 시간: ${h}시간 ${m}분 ${s}초`;
  }
  tick();_msTimer=setInterval(tick,1000);
}

// Track mission tasks via localStorage events
function missionTrack(key){
  const d=JSON.parse(localStorage.getItem('missionProgress')||'{}');
  d[key]=(d[key]||0)+1;
  localStorage.setItem('missionProgress',JSON.stringify(d));
}

// ========== ACTIVITY TRACKING HOOKS ==========
const _origCalcUpdate=window.calcUpdate;
if(_origCalcUpdate){
  window.calcUpdate=function(){
    _origCalcUpdate();
    const c=parseInt(localStorage.getItem('calcUseCount')||'0')+1;
    localStorage.setItem('calcUseCount',String(c));
    missionTrack('calc_any');
  };
}

const _origAiSend=window.aiSend;
if(typeof _origAiSend==='function'){
  window.aiSend=function(){
    const c=parseInt(localStorage.getItem('aiChatCount')||'0')+1;
    localStorage.setItem('aiChatCount',String(c));
    const s=parseInt(localStorage.getItem('aiSessionCount')||'0')+1;
    localStorage.setItem('aiSessionCount',String(s));
    localStorage.setItem('aiChatUsed','true');
    missionTrack('ai_chat_1');
    return _origAiSend();
  };
}

// Track page visits
function trackVisit(page){
  const key=page+'VisitCount';
  const c=parseInt(localStorage.getItem(key)||'0')+1;
  localStorage.setItem(key,String(c));
  missionTrack('visit_'+page);
}
const _origGoToCalendar=window.goToCalendar;
if(_origGoToCalendar){window.goToCalendar=function(){_origGoToCalendar();trackVisit('calendar')}}
const _origGoToChart=window.goToChart;
if(_origGoToChart){window.goToChart=function(){_origGoToChart();trackVisit('chart')}}
const _origGoToGlossary=window.goToGlossary;
if(_origGoToGlossary){window.goToGlossary=function(){_origGoToGlossary();trackVisit('glossary')}}

// Check achievements on auth state change
const _achvInterval=setInterval(()=>{
  try{
    auth.onAuthStateChanged(user=>{
      if(user)setTimeout(()=>achvCheck(user.uid,{}),2000);
    });
    clearInterval(_achvInterval);
  }catch(e){}
},500);
