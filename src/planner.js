export function dateOffset(days, from=new Date()) { const d=new Date(from); d.setHours(12,0,0,0); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export const demoSubjects = () => [
 {id:'math',name:'수학',exam:dateOffset(5),remaining:540,importance:5,confidence:35,color:'#8b7cf6'},
 {id:'physics',name:'물리',exam:dateOffset(4),remaining:420,importance:5,confidence:30,color:'#42c9d5'},
 {id:'english',name:'영어',exam:dateOffset(8),remaining:300,importance:3,confidence:75,color:'#ffbb68'},
 {id:'korean',name:'국어',exam:dateOffset(6),remaining:360,importance:4,confidence:60,color:'#ff7899'}
];
export const demoAvailability = [180,180,150,210,180,240,210];
export function priority(s, days) {return (0.8+s.importance/5)* (1.5-s.confidence/100) * (1+3/(days+1)) * Math.log1p(Math.max(0,s.remaining)/60);}
export function generatePlan(subjects, availability, start=new Date()) {
 const plan=[]; const left=Object.fromEntries(subjects.map(s=>[s.id,Math.max(0,Math.round(s.remaining/15)*15)]));
 for(let day=0;day<7;day++) {
  const date=dateOffset(day,start);let capacity=Math.max(0,Math.floor((availability[day]||0)/15)*15);
  while(capacity>=15){
   const options=subjects.filter(s=>left[s.id]>=15 && s.exam>=date);
   if(!options.length)break;
   const selected=options.map(s=>({s,score:priority({...s,remaining:left[s.id]},Math.max(0,Math.round((new Date(s.exam+'T12:00:00')-new Date(date+'T12:00:00'))/86400000))) / (1+(plan.filter(p=>p.date===date && p.subjectId===s.id).length)*0.08)})).sort((a,b)=>b.score-a.score)[0].s;
   const last=plan.at(-1);
   if(last?.date===date && last.subjectId===selected.id)last.minutes+=15;
   else plan.push({date,subjectId:selected.id,name:selected.name,color:selected.color,minutes:15});
   left[selected.id]-=15;capacity-=15;
  }
 }
 return {plan,unallocated:subjects.map(s=>({...s,minutes:left[s.id]})).filter(s=>s.minutes>0),scheduled:plan.reduce((a,p)=>a+p.minutes,0)};
}
export function analyze(subjects,result){const urgent=[...subjects].sort((a,b)=>priority(b,Math.max(0,Math.round((new Date(b.exam)-new Date())/86400000)))-priority(a,Math.max(0,Math.round((new Date(a.exam)-new Date())/86400000))))[0];const missing=result.unallocated.reduce((n,s)=>n+s.minutes,0);return `${urgent?.name||'학습'} 과목을 우선 배정했어. ${missing?`7일 내 배치하지 못한 학습량은 ${missing}분이야. 공부 가능 시간을 늘리거나 목표를 조정해 봐.`:'입력된 학습량을 7일 계획에 모두 배정했어.'} 이 설명은 규칙 기반 분석이며 생성형 AI 응답이 아니야.`}
