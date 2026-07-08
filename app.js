const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
const hardwareSeed=[['Reception tablet/PC','Required','Intake, owner updates, payments, audit review'],['Staff phones/tablets','Required','Yard checks, meds, photos, alerts, incidents'],['Secure Wi‑Fi mesh','Required','Kennel-wide access, cameras and sensors'],['Backup internet','Recommended','Fail-safe during outages'],['UPS / backup power','Required','Router, front desk, med fridge, key systems'],['Microchip scanner','Required','Animal ID verification'],['Digital scale','Required','Medication dosing and health monitoring'],['Medication fridge with thermometer/data logger','Required','Cold-chain medication evidence'],['QR/RFID kennel tags','Required','Scan kennel, scan dog, scan task'],['Thermal label printer','Recommended','Food/med/kennel labels'],['CCTV with privacy signage','Recommended','Safety, disputes, escapes, incidents'],['Door/gate sensors','Recommended','Escape prevention'],['Temp/humidity sensors','Required','Heat/storm/environment alerts'],['Smoke/fire alarm integration','Required','Emergency readiness'],['Panic buttons / duress buttons','Required','Staff safety and WorkCover evidence'],['Two-way radios','Required','Yard/storm/emergency coordination'],['Emergency lighting','Required','Power outage / evacuation'],['Evacuation leads, crates and ID tags','Required','Flood, fire, storm or escape readiness'],['Isolation PPE and cleaning station','Required','Biosecurity and illness control'],['Human and animal first aid kits','Required','Immediate response'],['Weather station or weather feed','Recommended','Storm/heat planning'],['Noise/bark sensor','Optional','Stress and welfare monitoring'],['Smart locks/gate controller','Optional','Access control and audit'],['Barcode/stock scanner','Recommended','Food, medication, cleaning stock'],['Backup battery banks','Recommended','Mobile devices during outage']];
function defaultDogs(){return[{id:'dog_bruno',name:'Bruno',breed:'Staffy x',size:'Medium',reactive:5,energy:7,social:5,gateSensitivity:'High',playStyle:'Gentle',bestMatches:'gentle medium/large dogs',notSocialToday:false,intact:false,onHeat:false,stormSensitive:true,weightKg:'24',microchip:'',vaccination:'C5 current',desexed:'Desexed',allergies:'',feeding:'2 meals daily',medication:'',physio:'',owner:'Demo Owner',ownerContact:'',vet:''},{id:'dog_molly',name:'Molly',breed:'Cavoodle',size:'Small',reactive:2,energy:4,social:8,gateSensitivity:'Low',playStyle:'Gentle',bestMatches:'small calm dogs',notSocialToday:false,intact:false,onHeat:false,stormSensitive:false,weightKg:'8',vaccination:'C5 current',desexed:'Desexed',allergies:'Chicken',feeding:'own food only',medication:'',physio:'',owner:'Demo Owner',ownerContact:'',vet:''}]}
function defaultKennels(){return[{id:'ken_quiet_1',name:'Quiet Run 1',zone:'Quiet',capacity:1,climate:true,camera:true,sensor:true,quiet:true,secure:true},{id:'ken_med_1',name:'Medical / Physio 1',zone:'Medical / physio',capacity:1,climate:true,camera:true,sensor:true,quiet:true,secure:true},{id:'ken_large_1',name:'Large Dog Run 1',zone:'Large dog',capacity:1,climate:false,camera:true,sensor:true,quiet:false,secure:true},{id:'ken_iso_1',name:'Isolation 1',zone:'Isolation',capacity:1,climate:true,camera:true,sensor:true,quiet:true,secure:true},{id:'ken_storm_1',name:'Storm Safe 1',zone:'Storm-safe',capacity:1,climate:true,camera:true,sensor:true,quiet:true,secure:true}]}
let dogs=load('gk_dogs',defaultDogs()),kennels=load('gk_kennels',defaultKennels()),tasks=load('gk_tasks',[]),incidents=load('gk_incidents',[]),policies=load('gk_policies',[]),audit=load('gk_audit',[]);
function addAudit(type,detail,level='green'){audit.unshift({id:'audit_'+Date.now(),type,detail,level,time:now()});audit=audit.slice(0,400);save('gk_audit',audit);renderDashboard()}
function level(score){if(score>=80)return'red';if(score>=55)return'amber';if(score>=30)return'yellow';return'green'} function label(cls){return{green:'Green',yellow:'Yellow',amber:'Amber',red:'Red',black:'Black'}[cls]||'Amber'} function bar(cls){return{green:'g',yellow:'y',amber:'a',red:'r',black:'k'}[cls]||'a'}
function renderSelects(){const dogOpts=dogs.map(d=>`<option value="${safe(d.id)}">${safe(d.name)}</option>`).join('');['matchDog','playDogs','taskDog','incidentDog'].forEach(id=>{const n=$('#'+id);if(n)n.innerHTML=dogOpts});const kenOpts=kennels.map(k=>`<option value="${safe(k.id)}">${safe(k.name)} — ${safe(k.zone)}</option>`).join('');const mk=$('#matchKennel');if(mk)mk.innerHTML=kenOpts}
function renderDashboard(){const openTasks=tasks.filter(t=>t.status!=='Done').length; if($('#dashDogs'))$('#dashDogs').textContent=dogs.length;if($('#dashTasks'))$('#dashTasks').textContent=openTasks;if($('#dashRisk'))$('#dashRisk').textContent=incidents.filter(i=>!i.closed).length;const feed=$('#todayFeed');if(feed)feed.innerHTML=audit.slice(0,20).map(a=>`<div class="config-row"><b>${safe(a.type)}</b><br>${safe(a.detail)}<br><small>${new Date(a.time).toLocaleString()}</small></div>`).join('')||`<div class="config-row">No audit yet.</div>`}
function renderDogs(){const node=$('#dogList');if(!node)return;node.innerHTML=dogs.map(d=>`<article class="card"><h2>${safe(d.name)} <span class="chip">${safe(d.size)}</span></h2><div class="chips"><span class="chip">Reactive ${safe(d.reactive)}/10</span><span class="chip">${safe(d.vaccination||'vaccination unknown')}</span><span class="chip">${safe(d.stormSensitive?'storm sensitive':'storm normal')}</span>${d.notSocialToday?'<span class="chip">needs space today</span>':''}${(kk=>kk?`<span class="chip">📍 ${safe(kk.name)}</span>`:'<span class="chip">no kennel assigned</span>')(kennels.find(kk=>kk.id===d.kennelId))}</div><details><summary>View profile, medical, feeding and emergency notes</summary><p><b>Breed:</b> ${safe(d.breed)}<br><b>Owner:</b> ${safe(d.owner)} ${safe(d.ownerContact)}<br><b>Weight:</b> ${safe(d.weightKg||'unknown')} kg<br><b>Microchip:</b> ${safe(d.microchip||'not recorded')}<br><b>Desexed:</b> ${safe(d.desexed||'unknown')}</p><p><b>Allergies:</b> ${safe(d.allergies||'none recorded')}</p><p><b>Feeding:</b> ${safe(d.feeding||'not recorded')}</p><p><b>Medication:</b> ${safe(d.medication||'none recorded')}</p><p><b>Physio:</b> ${safe(d.physio||'none recorded')}</p><button data-delete-dog="${safe(d.id)}" class="danger">Delete dog</button></details></article>`).join('')}
function renderKennels(){const node=$('#kennelList');if(!node)return;node.innerHTML=kennels.map(k=>`<article class="card"><h2>${safe(k.name)} <span class="chip">${safe(k.zone)}</span></h2><div class="chips">${k.climate?'<span class="chip">climate</span>':''}${k.camera?'<span class="chip">camera</span>':''}${k.sensor?'<span class="chip">sensor</span>':''}${k.quiet?'<span class="chip">quiet</span>':''}${k.secure?'<span class="chip">secure gate</span>':''}</div><button data-delete-kennel="${safe(k.id)}" class="danger">Delete kennel</button></article>`).join('')}
function matchDogKennel(d,k,state){let score=8;const reasons=[],controls=[];if(d.reactive>=5&&!k.quiet){score+=20;reasons.push(`${d.name} is reactive-${d.reactive}; quieter run preferred.`)}if(d.gateSensitivity==='High'&&!k.secure){score+=18;reasons.push('High gate sensitivity needs double-gate/escape control.')}if(d.stormSensitive&&k.zone!=='Storm-safe'&&state==='Storm forecast'){score+=30;reasons.push('Storm forecast and storm-sensitive dog; move to storm-safe run.')}if(d.medication&&k.zone!=='Medical / physio'){score+=10;reasons.push('Medication plan benefits from medical/close-monitoring run.')}if(d.physio&&k.zone!=='Medical / physio'){score+=18;reasons.push('Physio/restricted movement requires medical/physio placement.')}if((d.onHeat||d.intact)&&k.zone!=='Isolation'){score+=20;reasons.push('Entire/on-heat dog needs separated placement and supervision.')}if(state==='Heat warning'&&!k.climate){score+=20;reasons.push('Heat warning: climate-controlled run preferred.')}if(state==='Cleaning / chemical use nearby'&&d.allergies){score+=12;reasons.push('Allergy/chemical sensitivity: isolate from cleaning area.')}if(!k.sensor){score+=8;reasons.push('No temp/humidity sensor in run.')}if(!k.secure){score+=8;reasons.push('No secure double-gate control.')}if(score<30)reasons.push('No major mismatch detected.');controls.push('Eliminate: avoid unsuitable group placement.');controls.push('Isolation/engineering: use quiet/secure/medical/storm-safe run where needed.');controls.push('Administrative: care card, staff handover, owner notes, scheduled checks.');controls.push('PPE: only where handling/cleaning risk requires it.');const cls=level(score);return{score:Math.min(100,score),cls,reasons,controls}}
function playScore(selected,yard){let score=5;const reasons=[];for(let i=0;i<selected.length;i++)for(let j=i+1;j<selected.length;j++){const a=selected[i],b=selected[j];const gap=Math.abs((a.energy||0)-(b.energy||0))+Math.abs((a.social||0)-(b.social||0));score+=gap*2;if(a.playStyle==='Rough'||b.playStyle==='Rough')score+=10;if(a.playStyle==='Solo only'||b.playStyle==='Solo only')score+=40;if(a.notSocialToday||b.notSocialToday)score+=30;if(a.onHeat||b.onHeat||a.intact||b.intact)score+=25}if(yard==='Busy gate')score+=15;if(yard==='Hot weather')score+=10;if(yard==='Storm approaching')score+=20;const cls=level(score);reasons.push(score<30?'Play group looks suitable with normal supervision.':'Use slow greeting, smaller group or separate play.');return{score:Math.min(100,score),cls,reasons}}
function renderTasks(){const node=$('#taskList');if(!node)return;node.innerHTML=tasks.map(t=>{const d=dogs.find(x=>x.id===t.dogId);const overdue=t.due&&new Date(t.due).getTime()<Date.now()&&t.status!=='Done';return`<article class="card ${overdue?'danger':''}"><h2>${safe(t.type)} ${overdue?'<span class="chip">overdue</span>':''}</h2><p><b>Dog:</b> ${safe(d?.name||'Facility task')}<br><b>Due:</b> ${safe(t.due||'not set')}<br>${safe(t.notes||'')}</p><button data-done-task="${safe(t.id)}">Mark done</button><button data-delete-task="${safe(t.id)}" class="danger">Delete</button></article>`}).join('')||`<div class="card">No care tasks yet.</div>`}
function renderIncidents(){const node=$('#incidentList');if(!node)return;node.innerHTML=incidents.map(i=>`<article class="card"><h2>${safe(i.type)} <span class="chip">${safe(i.severity)}</span></h2><p>${safe(i.summary)}</p><details><summary>View controls, notifications and evidence</summary><p><b>Immediate action:</b> ${safe(i.action)}</p><p><b>Controls:</b><br>Eliminate: ${safe(i.eliminate)}<br>Higher controls: ${safe(i.higherControls)}<br>Admin: ${safe(i.adminControls)}<br>PPE: ${safe(i.ppe)}</p><div class="chips">${i.flags.map(f=>`<span class="chip">${safe(f)}</span>`).join('')}</div><button data-close-incident="${safe(i.id)}">Close</button><button data-delete-incident="${safe(i.id)}" class="danger">Delete</button></details></article>`).join('')||`<div class="card">No incidents yet.</div>`}
function renderPolicies(){const node=$('#policyList');if(!node)return;node.innerHTML=policies.map(p=>`<article class="card"><h2>${safe(p.type)}</h2><p><b>Insurer:</b> ${safe(p.insurer)}<br><b>Policy:</b> ${safe(p.number)}<br><b>Expiry:</b> ${safe(p.expiry)}</p><p>${safe(p.notes)}</p><button data-delete-policy="${safe(p.id)}" class="danger">Delete policy</button></article>`).join('')||`<div class="card">No policy records yet. Add WorkCover, public liability, care/custody/control and other covers here.</div>`}
function renderHardware(){const installed=load('gk_hardware',{});const node=$('#hardwareList');if(!node)return;node.innerHTML=hardwareSeed.map(([name,need,why])=>`<article class="card"><h2>${safe(name)} <span class="chip">${safe(need)}</span></h2><p>${safe(why)}</p><label class="toggle"><input type="checkbox" data-hardware="${safe(name)}" ${installed[name]?'checked':''}> Installed / available</label></article>`).join('')}
function renderAudit(){const node=$('#auditList');if(!node)return;node.innerHTML=audit.slice(0,80).map(a=>`<div class="config-row"><b>${safe(a.type)}</b><br>${safe(a.detail)}<br><small>${new Date(a.time).toLocaleString()}</small></div>`).join('')||`<div class="config-row">No audit yet.</div>`}
function renderAll(){renderSelects();renderDashboard();renderDogs();renderKennels();renderTasks();renderIncidents();renderPolicies();renderHardware();renderAudit()}
document.addEventListener('DOMContentLoaded',()=>{renderAll();$$('.tabs button').forEach(btn=>btn.addEventListener('click',()=>{$$('.tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$$('.screen').forEach(s=>s.classList.remove('active'));$('#'+btn.dataset.tab)?.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}));document.body.addEventListener('click',e=>{const go=e.target.getAttribute('data-go');if(go)document.querySelector(`[data-tab="${go}"]`)?.click();const delDog=e.target.getAttribute('data-delete-dog');if(delDog&&confirm('Delete dog profile?')){dogs=dogs.filter(d=>d.id!==delDog);save('gk_dogs',dogs);addAudit('Deleted dog',delDog,'red');renderAll()}const delKen=e.target.getAttribute('data-delete-kennel');if(delKen&&confirm('Delete kennel?')){kennels=kennels.filter(k=>k.id!==delKen);save('gk_kennels',kennels);addAudit('Deleted kennel',delKen,'red');renderAll()}const done=e.target.getAttribute('data-done-task');if(done){tasks=tasks.map(t=>t.id===done?{...t,status:'Done',doneAt:now()}:t);save('gk_tasks',tasks);addAudit('Care task completed',done);renderAll()}const delTask=e.target.getAttribute('data-delete-task');if(delTask){tasks=tasks.filter(t=>t.id!==delTask);save('gk_tasks',tasks);addAudit('Deleted task',delTask,'red');renderAll()}const close=e.target.getAttribute('data-close-incident');if(close){incidents=incidents.map(i=>i.id===close?{...i,closed:true}:i);save('gk_incidents',incidents);addAudit('Closed incident',close);renderAll()}const delInc=e.target.getAttribute('data-delete-incident');if(delInc&&confirm('Delete incident record?')){incidents=incidents.filter(i=>i.id!==delInc);save('gk_incidents',incidents);addAudit('Deleted incident',delInc,'red');renderAll()}const delPol=e.target.getAttribute('data-delete-policy');if(delPol){policies=policies.filter(p=>p.id!==delPol);save('gk_policies',policies);renderAll()}});document.body.addEventListener('change',e=>{const hw=e.target.getAttribute('data-hardware');if(hw){const status=load('gk_hardware',{});status[hw]=e.target.checked;save('gk_hardware',status);addAudit('Hardware status updated',`${hw}: ${e.target.checked?'installed':'not installed'}`)}});
$('#intakeForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const dog={id:'dog_'+Date.now(),name:f.get('name'),breed:f.get('breed'),size:f.get('size'),arrival:f.get('arrival'),departure:f.get('departure'),owner:f.get('owner'),ownerContact:f.get('ownerContact'),reactive:Number(f.get('reactive')||0),energy:Number(f.get('energy')||0),social:Number(f.get('social')||0),gateSensitivity:f.get('gateSensitivity'),playStyle:f.get('playStyle'),bestMatches:f.get('bestMatches'),notSocialToday:Boolean(f.get('notSocialToday')),intact:Boolean(f.get('intact')),onHeat:Boolean(f.get('onHeat')),stormSensitive:Boolean(f.get('stormSensitive')),weightKg:f.get('weightKg'),microchip:f.get('microchip'),vaccination:f.get('vaccination'),desexed:f.get('desexed'),allergies:f.get('allergies'),feeding:f.get('feeding'),medication:f.get('medication'),physio:f.get('physio'),vet:f.get('vet')};dog.flatFaced=Boolean(f.get('flatFaced'));dogs.unshift(dog);save('gk_dogs',dogs);addAudit('Dog intake saved',dog.name);if(dog.vaccination==='Unknown'||dog.vaccination==='Expired / needs update'){tasks.unshift({id:'task_'+Date.now()+'_vax',dogId:dog.id,type:'Welfare check',due:'',notes:'VACCINATION EVIDENCE REQUIRED: '+dog.name+' has no current C5 on record. Sight certificate before group play or shared yards. Consider isolation zone until confirmed.',status:'Open',createdAt:now()});save('gk_tasks',tasks);addAudit('Vaccination gap flagged',dog.name+' admitted without current C5 evidence','amber')}e.target.reset();renderAll();document.querySelector('[data-tab="dogs"]').click()});
$('#kennelForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const kennel={id:'ken_'+Date.now(),name:f.get('name'),zone:f.get('zone'),capacity:Number(f.get('capacity')||1),climate:Boolean(f.get('climate')),camera:Boolean(f.get('camera')),sensor:Boolean(f.get('sensor')),quiet:Boolean(f.get('quiet')),secure:Boolean(f.get('secure'))};kennels.unshift(kennel);save('gk_kennels',kennels);addAudit('Kennel added',kennel.name);e.target.reset();renderAll()});
$('#matchForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),d=dogs.find(x=>x.id===f.get('dog')),k=kennels.find(x=>x.id===f.get('kennel'));if(!d||!k)return;const res=matchDogKennel(d,k,f.get('state'));$('#matchAnswer').className=`answerBox ${res.cls}`;$('#matchAnswer').innerHTML=`<b>${label(res.cls)} for ${safe(d.name)} → ${safe(k.name)}</b><br>${res.score}/100 risk line.`;$('#matchResult').innerHTML=`<div class="result ${res.cls}"><b>${label(res.cls)} placement</b><div class="barWrap"><div class="bar ${bar(res.cls)}" style="width:${res.score}%"></div></div><ul>${res.reasons.map(r=>`<li>${safe(r)}</li>`).join('')}</ul><h3>Controls</h3><ul>${res.controls.map(c=>`<li>${safe(c)}</li>`).join('')}</ul><button data-assign-dog="${safe(d.id)}" data-assign-kennel="${safe(k.id)}" class="primaryAction">Assign ${safe(d.name)} to ${safe(k.name)}</button></div>`;addAudit('Kennel match',`${label(res.cls)} ${d.name} to ${k.name}: ${res.score}/100`,res.cls)});
$('#playForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const ids=Array.from($('#playDogs').selectedOptions).map(o=>o.value);const selected=dogs.filter(d=>ids.includes(d.id));const res=playScore(selected,f.get('yard'));$('#playResult').innerHTML=`<div class="result ${res.cls}"><b>${label(res.cls)} play group</b><br>${selected.map(d=>safe(d.name)).join(', ')}<div class="barWrap"><div class="bar ${bar(res.cls)}" style="width:${res.score}%"></div></div>${res.reasons.map(r=>`<p>${safe(r)}</p>`).join('')}</div>`;addAudit('Play group check',`${label(res.cls)}: ${selected.map(d=>d.name).join(', ')}`,res.cls)});
$('#taskForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const t={id:'task_'+Date.now(),dogId:f.get('dog'),type:f.get('type'),due:f.get('due'),notes:f.get('notes'),status:'Open',createdAt:now()};tasks.unshift(t);save('gk_tasks',tasks);addAudit('Care task added',t.type);e.target.reset();renderAll()});
$('#stormForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const sensitive=dogs.filter(d=>d.stormSensitive||d.reactive>=6||d.physio||d.medication);$('#stormPlan').innerHTML=`<div class="result red"><b>${safe(f.get('condition'))}</b><br>${safe(f.get('action'))}<br><br><b>Priority dogs:</b> ${sensitive.map(d=>safe(d.name)).join(', ')||'none flagged'}</div>`;addAudit('Storm/emergency plan activated',`${f.get('condition')}: ${f.get('action')}`,'red')});
$('#incidentForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const flags=['workerInjury','regulatorReview','insurerReview','sitePreserve','ownerNotify','vetNotify'].filter(x=>f.get(x));const inc={id:'inc_'+Date.now(),type:f.get('type'),severity:f.get('severity'),dogId:f.get('dog'),person:f.get('person'),summary:f.get('summary'),action:f.get('action'),eliminate:f.get('eliminate'),higherControls:f.get('higherControls'),adminControls:f.get('adminControls'),ppe:f.get('ppe'),flags,createdAt:now(),closed:false};incidents.unshift(inc);save('gk_incidents',incidents);addAudit('Incident saved',`${inc.type}: ${inc.severity}. Flags: ${flags.join(', ')}`,inc.severity.includes('Red')?'red':'amber');e.target.reset();renderAll()});
$('#policyForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const p={id:'pol_'+Date.now(),type:f.get('type'),insurer:f.get('insurer'),number:f.get('number'),expiry:f.get('expiry'),notes:f.get('notes')};policies.unshift(p);save('gk_policies',policies);addAudit('Policy saved',p.type);e.target.reset();renderAll()});
$('#addWorkCoverChecklist')?.addEventListener('click',()=>{tasks.unshift({id:'task_'+Date.now(),dogId:'',type:'WorkCover / insurance',due:'',notes:'Confirm WorkCover/worker compensation, public liability, care custody/control, insurer notification windows, claim contacts and certificate currency.',status:'Open',createdAt:now()});save('gk_tasks',tasks);addAudit('WorkCover checklist added','Insurance checklist task created','amber');renderAll()});
function exportJson(name,payload){const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
$('#exportEvidence')?.addEventListener('click',()=>exportJson('genevieve-kennels-insurance-workcover-evidence.json',{dogs,kennels,tasks,incidents,policies,audit,hardware:load('gk_hardware',{}),exportedAt:now()}));
$('#exportAudit')?.addEventListener('click',()=>exportJson('genevieve-kennels-full-audit.json',{dogs,kennels,tasks,incidents,policies,audit,hardware:load('gk_hardware',{}),exportedAt:now()}));
$('#clearDemo')?.addEventListener('click',()=>{if(confirm('Clear all local demo data?')){localStorage.clear();location.reload()}});
});

/* ============================================================
   GENEVIEVE EMERGENCY COMMAND + STAFF/SHIFT MODULE
   One-tap scenario response: triages every animal into the
   safest available space, assigns on-shift staff to roles,
   generates a WHS-aligned checklist, and records everything
   in the audit trail. Decision support only — official
   emergency services directions always come first.
   ============================================================ */
(function(){
let staff=load('gk_staff',[]);
let activeEmergency=load('gk_active_emergency',null);

const SCENARIOS={
  storm:{name:'Severe storm / cyclone',cls:'red',mode:'shelter',
    official:'Monitor BoM warnings. Follow QFES/SES directions. Storm-safe rooms, secure loose items, prepare for power loss.',
    checklist:['Check BoM warnings and act on official directions first','Secure or bring in loose yard items, bowls, shade sails','Charge phones, radios and battery banks now','Fill spare water containers before mains risk','Move animals per the list below — highest priority first','Pause all group play immediately','Test emergency lighting and torches','Confirm evacuation crates, leads and ID tags are staged','Complete a full headcount against the animal register after moves','Log completion times as you go — this screen writes the audit for you']},
  heat:{name:'Heatwave / extreme heat',cls:'red',mode:'shelter',
    official:'Follow BoM heat warnings. Water, shade, airflow, cooling. Flat-faced, heavy-coated, senior and unwell dogs are highest risk.',
    checklist:['Check every water supply now, double bowls in every run','Move highest heat-risk dogs to climate-controlled runs per the list below','Wet towels/cooling mats for dogs that cannot be moved yet','Stop all exercise and group play until conditions ease','Check pavement/surfaces before any dog walks on them','Watch for heat stress: heavy panting, drooling, wobbliness — vet immediately if seen','Recheck all animals every 30 minutes and log each check','Confirm staff are hydrating and rotating out of the heat (worker heat stress is a WHS duty)']},
  bushfire:{name:'Bushfire threat / smoke',cls:'red',mode:'shelter',
    official:'Follow QFES warnings and the Australian Warning System. If a Watch and Act or Emergency Warning applies, act on it, not on this app.',
    checklist:['Check the QFES warnings page for your area NOW and follow it first','Close windows/doors, reduce smoke entry to enclosed runs','Move smoke-sensitive and flat-faced dogs to enclosed climate runs per list below','Stage evacuation crates, leads, ID tags and animal register at the exit point','Load the medication fridge contents list — meds travel with the animals','Pre-position vehicles facing the exit, fuel checked','Confirm every animal has visible ID before any possible evacuation','Prepare to activate the State Emergency evacuation scenario if warnings escalate']},
  flood:{name:'Flood risk',cls:'red',mode:'shelter',
    official:'Follow BoM flood warnings and SES directions. Never drive through flood water — if it is flooded, forget it.',
    checklist:['Check BoM flood warnings and SES advice for your catchment first','Move animals from low-lying runs per the list below','Raise food, medication and electrical equipment off the floor','Stage evacuation crates and leads at the highest access point','Check drains and clear blockages while safe to do so','Identify your evacuation route and confirm it is not cut','Prepare to activate the State Emergency scenario if an evacuation order is issued']},
  power:{name:'Power failure',cls:'amber',mode:'shelter',
    official:'Check your provider outage page. UPS covers key systems only — prioritise the medication fridge.',
    checklist:['Confirm UPS/backup power is carrying the medication fridge — this is the top priority','Record medication fridge temperature now and every hour (cold-chain evidence)','Move heat-risk dogs to best-ventilated runs per the list below','Switch to torches/emergency lighting, save phone battery','Turn on battery radios for weather and outage updates','Manually check every gate and door lock — electric locks may have failed','Log outage start time and provider ETA for the insurance record']},
  escape:{name:'Dog escape / gate breach',cls:'red',mode:'lockdown',
    official:'One calm person follows the dog at a distance. Do not chase — chasing drives dogs onto roads.',
    checklist:['LOCKDOWN: close and check every gate and door NOW, in order, and log it','Full headcount against the register — confirm exactly who is missing','Assign ONE person to follow calmly at a distance with a lead and high-value treats','Phone the owner immediately — the dog may head home or respond to their voice on the phone','Notify council animal management and nearby vets with description and microchip number','Check the gate/breach point and photograph it before repair (evidence)','When resolved: record an Escape incident with the hierarchy of controls — what stops this happening again']},
  fire:{name:'FIRE ON SITE — EVACUATE',cls:'black',mode:'evacuate',
    official:'CALL 000 FIRST. People before animals — no staff member re-enters a burning structure for any reason. Follow your fire evacuation plan.',
    checklist:['CALL 000 — do this before anything on this list','Evacuate all PEOPLE to the muster point and headcount staff/visitors FIRST','Only if safe: release/evacuate animals in the priority order below to the secure muster yard','NO re-entry once smoke or flame blocks a path — no exception, no animal is worth a human life','Meet fire crews at the entrance with the site layout and animal count','Account for every animal against the register once safe','Notify owners of affected animals as soon as the site is under control','This is a notifiable event: preserve the scene, notify insurer, complete incident records']},
  state:{name:'STATE EMERGENCY — OFFICIAL EVACUATION ORDER',cls:'black',mode:'evacuate',
    official:'An official evacuation order overrides everything. Follow the directed route and timing exactly. Leave early — leaving late is the most dangerous choice.',
    checklist:['Confirm the official order, route and destination (QFES/SES/Police direction)','Headcount STAFF first and assign vehicles','Load animals in the priority order below — medication and medical dogs first','Every animal travels with ID tag, lead/crate label and its medication','Take the animal register, owner contact list and this evidence export with you','Photograph each vehicle load list — who is in which vehicle','Notify owners: destination and contact number, as soon as safely possible','Notify your insurer of the evacuation event','Secure the site last: power, gas, locks — only if time safely permits','Log departure time and arrival headcount at the destination']}
};

function heatRisk(d){let s=0;if(d.flatFaced)s+=40;if(d.medication)s+=15;if(d.physio)s+=10;if((d.size==='Large'||d.size==='Giant'))s+=8;return s}
function triageScore(d,key){
  let s=0;const why=[];
  if(d.medication){s+=30;why.push('medication')}
  if(d.physio){s+=20;why.push('physio/medical')}
  if(d.reactive>=6){s+=20;why.push('reactive-'+d.reactive+' (experienced handler)')}
  if(d.onHeat||d.intact){s+=12;why.push('entire/on-heat (keep separated)')}
  if(d.notSocialToday){s+=8;why.push('needs space')}
  if(key==='storm'||key==='flood'){if(d.stormSensitive){s+=35;why.push('storm sensitive')}}
  if(key==='heat'||key==='power'||key==='bushfire'){const h=heatRisk(d);s+=h;if(d.flatFaced)why.push('flat-faced HIGH heat risk')}
  return{s,why}
}
function kennelFit(k,key){
  let f=0;
  if(key==='storm'||key==='flood'){if(k.zone==='Storm-safe')f+=60;if(k.quiet)f+=15;if(k.secure)f+=15;if(k.climate)f+=10}
  else if(key==='heat'||key==='power'||key==='bushfire'){if(k.climate)f+=60;if(k.sensor)f+=15;if(k.quiet)f+=10;if(k.zone==='Storm-safe')f+=10}
  else{if(k.secure)f+=40;if(k.zone==='Storm-safe')f+=20;if(k.quiet)f+=10}
  return f
}
function planMoves(key){
  const ranked=dogs.map(d=>({d,t:triageScore(d,key)})).sort((a,b)=>b.t.s-a.t.s);
  const occupancy={};dogs.forEach(d=>{if(d.kennelId)occupancy[d.kennelId]=(occupancy[d.kennelId]||0)+1});
  const moves=[];const kennelsRanked=[...kennels].sort((a,b)=>kennelFit(b,key)-kennelFit(a,key));
  ranked.forEach(({d,t})=>{
    const current=kennels.find(k=>k.id===d.kennelId);
    const currentFit=current?kennelFit(current,key):-1;
    let target=null;
    for(const k of kennelsRanked){
      if((d.onHeat||d.intact)&&k.zone!=='Isolation'&&kennelsRanked.some(x=>x.zone==='Isolation'&&(occupancy[x.id]||0)<x.capacity)&&k.zone!=='Isolation')continue;
      const used=(occupancy[k.id]||0)-(current&&current.id===k.id?1:0);
      if(used>=k.capacity)continue;
      target=k;break
    }
    if(target&&(!current||kennelFit(target,key)>currentFit)){
      if(current)occupancy[current.id]=Math.max(0,(occupancy[current.id]||1)-1);
      occupancy[target.id]=(occupancy[target.id]||0)+1;
      moves.push({d,to:target,stay:false,why:t.why,score:t.s})
    }else{
      moves.push({d,to:current||null,stay:true,why:t.why,score:t.s})
    }
  });
  return moves
}
function onShift(){return staff.filter(s=>s.onShift)}
function assignRoles(key,mode){
  const crew=onShift();const lines=[];
  if(crew.length===0){lines.push('⚠️ NO STAFF MARKED ON SHIFT. Mark who is on shift in the Staff tab. If you are alone: work the checklist top to bottom yourself, call for backup FIRST, and do not enter a run with a red-flag dog alone (lone-worker WHS rule).');return lines}
  const manager=crew.find(s=>s.role==='Manager')||crew.find(s=>s.role==='Senior attendant')||crew[0];
  lines.push('🎯 COORDINATOR: '+manager.name+' — makes calls, watches official warnings, checks items off, no hands-on animal work unless unavoidable.');
  const rest=crew.filter(s=>s!==manager);
  const reactiveHandler=rest.find(s=>s.experiencedReactive)||(manager.experiencedReactive?manager:null);
  if(reactiveHandler)lines.push('🐕 HIGH-NEEDS ANIMAL MOVES (reactive/medical dogs first): '+reactiveHandler.name+(reactiveHandler===manager?' (coordinator — only because no other reactive-experienced staff on shift)':''));
  else lines.push('⚠️ No reactive-experienced staff on shift: move red-flag dogs LAST, two people per dog, or leave secured in place if safe.');
  const firstAider=crew.find(s=>s.humanFirstAid);
  lines.push(firstAider?'⛑️ FIRST AID LEAD: '+firstAider.name+' — first aid kits staged, injuries logged.':'⚠️ Nobody on shift holds human first aid — note this in the incident record and fix it on the roster.');
  const remaining=rest.filter(s=>s!==reactiveHandler);
  if(remaining.length>0)lines.push('🐾 REMAINING ANIMAL MOVES: '+remaining.map(s=>s.name).join(', ')+' — work the move list in order, tick off each animal.');
  if(mode==='evacuate'){const warden=crew.find(s=>s.fireWarden);lines.push(warden?'🚪 EVACUATION WARDEN: '+warden.name+' — sweeps the site, confirms nobody left behind, closes up last.':'🚪 Coordinator doubles as evacuation warden — sweep and confirm the site is clear of PEOPLE before animals move.')}
  else lines.push('🔧 SITE SWEEP: '+(remaining[remaining.length-1]||manager).name+' — gates, water, power, loose items, hazards.');
  if(crew.length===1)lines.push('⚠️ SINGLE-PERSON SHIFT during an emergency: call the manager/backup NOW, keep your phone on you, and prioritise: official warnings → your own safety → highest-priority animals only.');
  return lines
}
function renderEmergencyPlan(key){
  const s=SCENARIOS[key];const moves=planMoves(key);const roles=assignRoles(key,s.mode);
  const moveHtml=moves.map((m,i)=>{
    const badge=m.score>=50?'red':m.score>=25?'amber':'green';
    const where=s.mode==='evacuate'
      ?(m.d.medication?'VEHICLE 1 — meds travel with dog':'next available vehicle/crate')
      :(m.to?m.to.name+(m.stay?' (already suitable — check and stay)':''): 'NO SUITABLE RUN FREE — use staged evacuation crate, senior staff decision');
    return `<li><b>${i+1}. ${safe(m.d.name)}</b> → ${safe(where)}${m.why.length?' <small>('+safe(m.why.join(', '))+')</small>':''} <span class="chip">${badge}</span></li>`
  }).join('');
  const unassigned=dogs.filter(d=>!d.kennelId).length;
  $('#emergencyPlan').innerHTML=`<div class="result ${s.cls==='black'?'red':s.cls}">
    <b>${safe(s.name)} — ACTIVATED ${new Date().toLocaleTimeString()}</b>
    <p class="warning">${safe(s.official)}</p>
    ${unassigned>0?`<p class="warning">⚠️ ${unassigned} dog(s) have no kennel assigned — headcounts cannot be verified. Assign kennels in the Match tab as soon as this event ends.</p>`:''}
    <h3>1. Staff assignments (${onShift().length} on shift)</h3><ul>${roles.map(r=>`<li>${safe(r)}</li>`).join('')}</ul>
    <h3>2. Animal priority list — work top to bottom</h3><ol>${moveHtml||'<li>No animals on site.</li>'}</ol>
    <h3>3. Checklist</h3><ul class="checklist">${s.checklist.map(c=>`<li><label class="toggle"><input type="checkbox" data-emg-check="${safe(c)}"> ${safe(c)}</label></li>`).join('')}</ul>
    <p><small>Genevieve organises; humans decide. Official emergency services directions always override this plan.</small></p></div>`;
  renderEmergencyBanner()
}
function renderEmergencyBanner(){
  const node=$('#activeEmergencyBanner');const today=$('#todayAnswer');
  if(activeEmergency){
    const s=SCENARIOS[activeEmergency.key];
    if(node)node.innerHTML=`<div class="answerBox red"><b>ACTIVE: ${safe(s.name)}</b><br>Started ${new Date(activeEmergency.startedAt).toLocaleString()}. Stand down below when the all-clear is official.</div>`;
    if(today){today.className='answerBox red';today.innerHTML=`<b>🚨 ACTIVE EMERGENCY: ${safe(s.name)}</b><br>Open Emergency Command for the live plan.`}
  }else if(node)node.innerHTML=''
}
function generateHandover(){
  const out=$('#handoverOut')?.value||'outgoing staff';const inc=$('#handoverIn')?.value||'incoming staff';
  const openTasks=tasks.filter(t=>t.status!=='Done');
  const overdue=openTasks.filter(t=>t.due&&new Date(t.due).getTime()<Date.now());
  const medsDogs=dogs.filter(d=>d.medication);
  const flagged=dogs.filter(d=>d.notSocialToday||d.onHeat||d.reactive>=6);
  const openInc=incidents.filter(i=>!i.closed);
  const vaxGaps=dogs.filter(d=>d.vaccination==='Unknown'||d.vaccination==='Expired / needs update');
  const emg=activeEmergency?SCENARIOS[activeEmergency.key].name:null;
  const html=`<div class="result ${emg?'red':overdue.length?'amber':'green'}">
    <b>SHIFT HANDOVER — ${safe(out)} → ${safe(inc)} — ${new Date().toLocaleString()}</b>
    ${emg?`<p class="warning">🚨 ACTIVE EMERGENCY: ${safe(emg)} — open Emergency Command first, everything else waits.</p>`:''}
    <h3>Animals on site: ${dogs.length}</h3>
    <p><b>💊 Medication dogs (${medsDogs.length}):</b> ${medsDogs.map(d=>safe(d.name)).join(', ')||'none'}</p>
    <p><b>⚠️ Flagged dogs (${flagged.length}):</b> ${flagged.map(d=>safe(d.name)+' ('+safe([d.notSocialToday?'needs space':'',d.onHeat?'ON HEAT':'',d.reactive>=6?'reactive-'+d.reactive:''].filter(Boolean).join(', '))+')').join('; ')||'none'}</p>
    <p><b>💉 Vaccination evidence outstanding:</b> ${vaxGaps.map(d=>safe(d.name)).join(', ')||'none'}</p>
    <h3>Tasks</h3><p><b>Overdue (${overdue.length}):</b> ${overdue.map(t=>safe(t.type)+' — '+safe((dogs.find(d=>d.id===t.dogId)||{}).name||'facility')).join('; ')||'none'} <br><b>Open total:</b> ${openTasks.length}</p>
    <h3>Open incidents: ${openInc.length}</h3><p>${openInc.map(i=>safe(i.type)+' ('+safe(i.severity)+')').join('; ')||'none'}</p>
    <p><small>Incoming staff: read this, walk the kennels once, then confirm below. The confirmation is written to the audit trail.</small></p>
    <button id="confirmHandover" class="primaryAction">Incoming staff: I have read and walked through</button></div>`;
  $('#handoverResult').innerHTML=html;
  addAudit('Shift handover generated',out+' → '+inc+' | meds:'+medsDogs.length+' flagged:'+flagged.length+' overdue:'+overdue.length+' openIncidents:'+openInc.length+(emg?' ACTIVE EMERGENCY: '+emg:''),emg||overdue.length?'amber':'green')
}
function renderStaff(){
  const node=$('#staffList');if(!node)return;
  node.innerHTML=staff.map(s=>`<article class="card"><h2>${safe(s.name)} <span class="chip">${safe(s.role)}</span></h2>
    <div class="chips">${s.humanFirstAid?'<span class="chip">⛑️ human first aid</span>':''}${s.animalFirstAid?'<span class="chip">🐾 animal first aid</span>':''}${s.fireWarden?'<span class="chip">🚪 fire warden</span>':''}${s.experiencedReactive?'<span class="chip">🐕 reactive experienced</span>':''}</div>
    <p>${safe(s.phone||'')}</p>
    <label class="toggle"><input type="checkbox" data-onshift="${safe(s.id)}" ${s.onShift?'checked':''}> On shift now</label>
    <button data-delete-staff="${safe(s.id)}" class="danger">Remove</button></article>`).join('')||'<div class="card">No staff yet. Add your team so Emergency Command and handovers can assign real people.</div>'
}
document.addEventListener('DOMContentLoaded',()=>{
  renderStaff();renderEmergencyBanner();
  $('#staffForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);staff.unshift({id:'staff_'+Date.now(),name:f.get('name'),role:f.get('role'),phone:f.get('phone'),humanFirstAid:Boolean(f.get('humanFirstAid')),animalFirstAid:Boolean(f.get('animalFirstAid')),fireWarden:Boolean(f.get('fireWarden')),experiencedReactive:Boolean(f.get('experiencedReactive')),onShift:false});save('gk_staff',staff);addAudit('Staff member added',String(f.get('name')));e.target.reset();renderStaff()});
  $('#generateHandover')?.addEventListener('click',generateHandover);
  $('#standDown')?.addEventListener('click',()=>{
    if(!activeEmergency){$('#emergencyPlan').innerHTML='<div class="result green"><b>No active emergency.</b> Nothing to stand down.</div>';return}
    const name=SCENARIOS[activeEmergency.key].name;activeEmergency=null;save('gk_active_emergency',null);
    addAudit('EMERGENCY STAND DOWN',name+' — all clear declared by staff','amber');
    $('#emergencyPlan').innerHTML=`<div class="result green"><b>STAND DOWN — ${safe(name)} — ${new Date().toLocaleString()}</b>
      <h3>Recovery checklist</h3><ul class="checklist">
      <li>Welfare-check EVERY animal now: water, injuries, stress signs — log each check as a care task</li>
      <li>Full headcount against the register and record it</li>
      <li>Walk the site: damage, water, fencing, gates, power — photograph anything for the insurer</li>
      <li>Restock and re-stage the evacuation kit (crates, leads, ID tags, torches, first aid)</li>
      <li>Update owners of any affected animals</li>
      <li>Complete incident records for anything that happened, with hierarchy of controls</li>
      <li>5-minute staff debrief: what worked, what did not — add fixes as tasks</li>
      <li>Export the evidence pack (Insurance tab) so this event is preserved</li></ul></div>`;
    renderEmergencyBanner();renderDashboard()
  });
  document.body.addEventListener('click',e=>{
    const sc=e.target.getAttribute('data-scenario');
    if(sc&&SCENARIOS[sc]){activeEmergency={key:sc,startedAt:now()};save('gk_active_emergency',activeEmergency);addAudit('EMERGENCY ACTIVATED',SCENARIOS[sc].name+' — '+onShift().length+' staff on shift, '+dogs.length+' animals on site',SCENARIOS[sc].cls==='black'?'red':SCENARIOS[sc].cls);renderEmergencyPlan(sc)}
    const del=e.target.getAttribute('data-delete-staff');
    if(del&&confirm('Remove staff member?')){staff=staff.filter(s=>s.id!==del);save('gk_staff',staff);renderStaff()}
    const assignDog=e.target.getAttribute('data-assign-dog');
    if(assignDog){const kid=e.target.getAttribute('data-assign-kennel');dogs=dogs.map(d=>d.id===assignDog?{...d,kennelId:kid}:d);save('gk_dogs',dogs);const dg=dogs.find(d=>d.id===assignDog);const kn=kennels.find(k=>k.id===kid);addAudit('Kennel assigned',(dg?dg.name:assignDog)+' → '+(kn?kn.name:kid));renderDogs();e.target.textContent='✅ Assigned'}
    if(e.target.id==='confirmHandover'){addAudit('Handover confirmed','Incoming staff confirmed handover read and walk-through complete','green');e.target.textContent='✅ Confirmed and logged';e.target.disabled=true}
  });
  document.body.addEventListener('change',e=>{
    const os=e.target.getAttribute('data-onshift');
    if(os){staff=staff.map(s=>s.id===os?{...s,onShift:e.target.checked}:s);save('gk_staff',staff);addAudit('Shift status',(staff.find(s=>s.id===os)||{}).name+': '+(e.target.checked?'ON shift':'off shift'))}
    const chk=e.target.getAttribute('data-emg-check');
    if(chk)addAudit('Emergency checklist',(e.target.checked?'DONE: ':'unchecked: ')+chk,e.target.checked?'green':'amber')
  });
  if(activeEmergency&&SCENARIOS[activeEmergency.key])renderEmergencyPlan(activeEmergency.key)
});
})();
