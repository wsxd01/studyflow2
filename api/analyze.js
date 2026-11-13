export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'POST 요청만 지원해요.'});
 const key=process.env.GEMINI_API_KEY;
 if(!key)return res.status(503).json({error:'서버에 GEMINI_API_KEY가 설정되지 않았어요.'});
 try{
  const {subjects,plan,unallocated,scenario,logs}=req.body||{};
  if(!Array.isArray(subjects)||!Array.isArray(plan)||subjects.length>30||plan.length>500)return res.status(400).json({error:'요청 데이터가 올바르지 않아요.'});
  const payload={subjects,plan:plan.slice(0,120),unallocated,scenario,logs:Array.isArray(logs)?logs.slice(0,20):[]};
  const prompt=`너는 고등학생 학습 일정 분석 도우미다. 아래 JSON 데이터만 사용해 한국어로 1) 우선순위 근거 2) 일정 위험 3) 실천 가능한 개선 제안 3가지를 작성해. 계산된 시간을 임의로 변경하거나 데이터에 없는 사실을 단정하지 마. 공부를 무리하게 늘리라고 권하지 마. 간결하게 350자 이내로 작성해.\n${JSON.stringify(payload)}`;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),18000);
  let response;
  try{response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.3,maxOutputTokens:850}}),signal:controller.signal});}finally{clearTimeout(timer)}
  const data=await response.json();
  if(!response.ok)return res.status(502).json({error:`Gemini 요청 실패 (${response.status}): ${data.error?.message||'잠시 후 다시 시도해 줘.'}`});
  const text=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim();
  if(!text)return res.status(502).json({error:'Gemini 응답이 비어 있어요.'});
  return res.status(200).json({text,model:'gemini-2.5-flash'});
 }catch(e){return res.status(500).json({error:e.name==='AbortError'?'AI 응답 시간이 초과됐어.':'AI 분석 중 오류가 발생했어.'});}
}
