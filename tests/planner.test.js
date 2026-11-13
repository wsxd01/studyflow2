import test from 'node:test';import assert from 'node:assert/strict';import {demoSubjects,demoAvailability,generatePlan,dateOffset} from '../src/planner.js';
test('schedule does not exceed capacity',()=>{const r=generatePlan(demoSubjects(),demoAvailability);for(let i=0;i<7;i++)assert.ok(r.plan.filter(p=>p.date===dateOffset(i)).reduce((n,p)=>n+p.minutes,0)<=demoAvailability[i])});
test('no allocations after exam',()=>{const r=generatePlan(demoSubjects(),demoAvailability);for(const p of r.plan)assert.ok(p.date<=demoSubjects().find(s=>s.id===p.subjectId).exam)});
test('all durations positive and 15-minute multiples',()=>{const r=generatePlan(demoSubjects(),demoAvailability);for(const p of r.plan){assert.ok(p.minutes>0);assert.equal(p.minutes%15,0)}});
test('no phantom study minutes',()=>{const s=demoSubjects();const r=generatePlan(s,demoAvailability);assert.equal(r.scheduled+r.unallocated.reduce((n,x)=>n+x.minutes,0),s.reduce((n,x)=>n+x.remaining,0))});
test('zero availability yields no sessions',()=>{const r=generatePlan(demoSubjects(),[0,0,0,0,0,0,0]);assert.equal(r.scheduled,0)});
