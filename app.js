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
$('#intakeForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const dog={id:'dog_'+Date.now(),name:f.get('name'),breed:f.get('breed'),size:f.get('size'),arrival:f.get('arrival'),departure:f.get('departure'),owner:f.get('owner'),ownerContact:f.get('ownerContact'),reactive:Number(f.get('reactive')||0),energy:Number(f.get('energy')||0),social:Number(f.get('social')||0),gateSensitivity:f.get('gateSensitivity'),playStyle:f.get('playStyle'),bestMatches:f.get('bestMatches'),notSocialToday:Boolean(f.get('notSocialToday')),intact:Boolean(f.get('intact')),onHeat:Boolean(f.get('onHeat')),stormSensitive:Boolean(f.get('stormSensitive')),weightKg:f.get('weightKg'),microchip:f.get('microchip'),vaccination:f.get('vaccination'),desexed:f.get('desexed'),allergies:f.get('allergies'),feeding:f.get('feeding'),medication:f.get('medication'),physio:f.get('physio'),vet:f.get('vet')};dog.flatFaced=Boolean(f.get('flatFaced'));dog.species=f.get('species')||'Dog';dog.family=f.get('family')||'';dog.bedding=f.get('bedding')||'';dog.resourceGuarding=Boolean(f.get('resourceGuarding'));dog.coHouseOk=Boolean(f.get('coHouseOk'));dogs.unshift(dog);save('gk_dogs',dogs);addAudit('Dog intake saved',dog.name);if(dog.vaccination==='Unknown'||dog.vaccination==='Expired / needs update'){tasks.unshift({id:'task_'+Date.now()+'_vax',dogId:dog.id,type:'Welfare check',due:'',notes:'VACCINATION EVIDENCE REQUIRED: '+dog.name+' has no current C5 on record. Sight certificate before group play or shared yards. Consider isolation zone until confirmed.',status:'Open',createdAt:now()});save('gk_tasks',tasks);addAudit('Vaccination gap flagged',dog.name+' admitted without current C5 evidence','amber')}e.target.reset();renderAll();document.querySelector('[data-tab="dogs"]').click()});
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

/* ============================================================
   GENEVIEVE LEARNING + DAILY OPERATIONS MODULE
   - Pattern learning: recorded incidents automatically raise
     placement caution for the dogs involved (transparent,
     decaying over time, capped). The locked colour system and
     scoring engine stay exactly as patented — learning only
     feeds evidence-based adjustments INTO them.
   - Calm ring dashboard, arrivals/departures, insights
   - Owner report cards, medication sign-off, temperature log
   Genevieve assists; humans decide.
   ============================================================ */
(function(){
const DAY=24*60*60*1000;
function learnAdjust(dogId){
  let total=0;const nowMs=Date.now();
  incidents.forEach(i=>{
    if(i.dogId!==dogId)return;
    const age=nowMs-new Date(i.createdAt||nowMs).getTime();
    if(age>180*DAY)return;
    let w=/Red|Black/.test(i.severity)?10:/Amber/.test(i.severity)?5:2;
    if(age>90*DAY)w=w/2;
    if(i.closed)w=w*0.7;
    total+=w
  });
  return Math.min(30,Math.round(total))
}
function learnWhy(dogId){const n=incidents.filter(i=>i.dogId===dogId&&(Date.now()-new Date(i.createdAt||Date.now()).getTime())<=180*DAY).length;return n}
// Wrap the patented engines: same engine, evidence-adjusted input
const _match=window.matchDogKennel;
window.matchDogKennel=function(d,k,state){
  const r=_match(d,k,state);
  const adj=learnAdjust(d.id);
  if(adj>0){
    r.score=Math.min(100,r.score+adj);
    r.cls=level(r.score);
    r.reasons.push('🧠 Genevieve learning: +'+adj+' caution from '+learnWhy(d.id)+' recorded incident(s) involving '+d.name+' in the last 6 months (decays over time).')
  }
  return r
};
const _play=window.playScore;
window.playScore=function(selected,yard){
  const r=_play(selected,yard);
  let adj=0;selected.forEach(d=>{adj+=learnAdjust(d.id)});
  adj=Math.min(30,Math.round(adj/Math.max(1,selected.length)*1.5));
  if(adj>0){
    r.score=Math.min(100,r.score+adj);
    r.cls=level(r.score);
    r.reasons.push('🧠 Genevieve learning: +'+adj+' group caution from recorded incident history of the selected dogs.')
  }
  return r
};
function facilityInsights(){
  const out=[];const nowMs=Date.now();
  const recent=incidents.filter(i=>(nowMs-new Date(i.createdAt||nowMs).getTime())<=90*DAY);
  const byType={};recent.forEach(i=>{byType[i.type]=(byType[i.type]||0)+1});
  const fixes={'Dog bite / fight':'Review play group mixing — run every group through the Play engine before yard time.','Escape / lost dog':'Gate audit: self-closing hinges, double-gate airlocks (engineering control beats reminders).','Medication error':'Introduce a two-person medication check and use the medication sign-off records.','Worker injury':'WHS review due: check the hierarchy of controls on recent worker incidents, and the roster for fatigue.','Feeding/allergy error':'Print allergy labels for affected runs and add allergy line to the handover.','Biosecurity / illness':'Review isolation protocol, cleaning checklist and vaccination evidence gaps.','Animal injury':'Walk the runs for physical hazards: surfaces, gaps, protruding fixtures.'};
  Object.entries(byType).forEach(([t,n])=>{if(n>=2)out.push('⚠️ '+n+'× "'+t+'" in 90 days. '+(fixes[t]||'Pattern detected — review the hierarchy of controls for this hazard.'))});
  dogs.forEach(d=>{const a=learnAdjust(d.id);if(a>=10)out.push('🐕 '+d.name+': placement caution raised +'+a+' from incident history — engine now scores this dog more conservatively.')});
  const overdue=tasks.filter(t=>t.status!=='Done'&&t.due&&new Date(t.due).getTime()<nowMs).length;
  if(overdue>=3)out.push('⏰ '+overdue+' care tasks overdue — if this repeats daily, the roster may be under-staffed for the animal count (psychosocial/workload WHS flag).');
  const vax=dogs.filter(d=>d.vaccination==='Unknown'||d.vaccination==='Expired / needs update').length;
  if(vax>0)out.push('💉 '+vax+' dog(s) without current C5 evidence on site.');
  if(out.length===0)out.push('✅ No adverse patterns detected. The more you record, the more Genevieve learns.');
  return out
}
function ring(pct,cls,val,lbl){
  const r=26,c=2*Math.PI*r,off=c*(1-Math.max(0,Math.min(100,pct))/100);
  const col={green:'var(--g)',yellow:'var(--y)',amber:'var(--a)',red:'var(--r)'}[cls]||'var(--g)';
  return '<div class="ringCard"><svg width="66" height="66" viewBox="0 0 66 66" role="img" aria-label="'+lbl+' '+val+'"><circle cx="33" cy="33" r="'+r+'" fill="none" stroke="#e6ede8" stroke-width="7"/><circle cx="33" cy="33" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'" transform="rotate(-90 33 33)"/></svg><div class="ringVal">'+val+'</div><div class="ringLbl">'+lbl+'</div></div>'
}
window.renderDashboard=function(){
  const rings=$('#dashRings');
  if(rings){
    const cap=kennels.reduce((s,k)=>s+Number(k.capacity||1),0);
    const assigned=dogs.filter(d=>d.kennelId).length;
    const occPct=cap?Math.round(dogs.length/cap*100):0;
    const occCls=occPct>=95?'red':occPct>=80?'amber':'green';
    const todayStr=new Date().toDateString();
    const doneToday=tasks.filter(t=>t.status==='Done'&&t.doneAt&&new Date(t.doneAt).toDateString()===todayStr).length;
    const open=tasks.filter(t=>t.status!=='Done').length;
    const taskPct=(doneToday+open)?Math.round(doneToday/(doneToday+open)*100):100;
    const overdue=tasks.filter(t=>t.status!=='Done'&&t.due&&new Date(t.due).getTime()<Date.now()).length;
    const taskCls=overdue>0?'red':open>0?'amber':'green';
    const openInc=incidents.filter(i=>!i.closed).length;
    const incCls=openInc===0?'green':openInc<3?'amber':'red';
    const unassigned=dogs.length-assigned;
    rings.innerHTML=
      ring(occPct,occCls,dogs.length+'/'+cap,'Occupancy')+
      ring(taskPct,taskCls,doneToday+'✓ '+open+' open','Care today')+
      ring(openInc===0?100:Math.max(10,100-openInc*25),incCls,openInc,'Open incidents')+
      ring(dogs.length?Math.round(assigned/dogs.length*100):100,unassigned?'amber':'green',unassigned?unassigned+' unplaced':'all placed','Kennels')
  }
  const movesN=$('#dashMoves');
  if(movesN){
    const iso=d=>d?new Date(d).toDateString():'';
    const todayStr=new Date().toDateString();
    const arrivals=dogs.filter(d=>iso(d.arrival)===todayStr);
    const departures=dogs.filter(d=>iso(d.departure)===todayStr);
    movesN.innerHTML='<h2>Today’s movements</h2><p><b>🟢 Arriving ('+arrivals.length+'):</b> '+(arrivals.map(d=>safe(d.name)).join(', ')||'none')+'</p><p><b>🔵 Departing ('+departures.length+'):</b> '+(departures.map(d=>safe(d.name)+' — prepare report card').join('; ')||'none')+'</p>'
  }
  const ins=$('#dashInsights');
  if(ins)ins.innerHTML=facilityInsights().map(i=>'<div class="config-row">'+safe(i)+'</div>').join('');
  const answer=$('#todayAnswer');
  if(answer&&!load('gk_active_emergency',null)){
    const overdue=tasks.filter(t=>t.status!=='Done'&&t.due&&new Date(t.due).getTime()<Date.now());
    const openInc=incidents.filter(i=>!i.closed).length;
    if(overdue.length){answer.className='answerBox red';answer.innerHTML='<b>'+overdue.length+' care task(s) overdue.</b><br>'+safe(overdue.slice(0,3).map(t=>t.type+' — '+((dogs.find(d=>d.id===t.dogId)||{}).name||'facility')).join('; '))}
    else if(openInc){answer.className='answerBox amber';answer.innerHTML='<b>'+openInc+' incident(s) open.</b><br>Review, act, close with controls.'}
    else{answer.className='answerBox green';answer.innerHTML='<b>All on track.</b><br>Tasks current, no open incidents, no active emergency.'}
  }
  const feed=$('#todayFeed');
  if(feed)feed.innerHTML=audit.slice(0,20).map(a=>'<div class="config-row"><b>'+safe(a.type)+'</b><br>'+safe(a.detail)+'<br><small>'+new Date(a.time).toLocaleString()+'</small></div>').join('')||'<div class="config-row">No audit yet.</div>'
};
// Dogs list with learning chips, level bar and report card button
const _renderDogs=window.renderDogs;
window.renderDogs=function(){
  const node=$('#dogList');if(!node)return;
  node.innerHTML=dogs.map(d=>{
    const adj=learnAdjust(d.id);
    const kk=kennels.find(k=>k.id===d.kennelId);
    const riskPct=Math.min(100,(Number(d.reactive)||0)*8+adj);
    const cls=level(riskPct);
    return '<article class="card"><h2>'+safe(d.name)+' <span class="chip">'+safe(d.size)+'</span></h2>'+
    '<div class="barWrap"><div class="bar '+bar(cls)+'" style="width:'+Math.max(6,riskPct)+'%"></div></div>'+
    '<div class="chips"><span class="chip">Reactive '+safe(d.reactive)+'/10</span><span class="chip">'+safe(d.vaccination||'vaccination unknown')+'</span>'+(d.stormSensitive?'<span class="chip">⛈️ storm sensitive</span>':'')+(d.flatFaced?'<span class="chip">🌡️ flat-faced heat risk</span>':'')+(d.notSocialToday?'<span class="chip">needs space today</span>':'')+(adj>0?'<span class="chip">🧠 +'+adj+' learned caution</span>':'')+(kk?'<span class="chip">📍 '+safe(kk.name)+'</span>':'<span class="chip">no kennel assigned</span>')+'</div>'+
    '<button data-report-dog="'+safe(d.id)+'" class="secondary">📋 Owner report card</button>'+
    '<details><summary>View profile, medical, feeding and emergency notes</summary><p><b>Breed:</b> '+safe(d.breed)+'<br><b>Owner:</b> '+safe(d.owner)+' '+safe(d.ownerContact)+'<br><b>Weight:</b> '+safe(d.weightKg||'unknown')+' kg<br><b>Microchip:</b> '+safe(d.microchip||'not recorded')+'<br><b>Desexed:</b> '+safe(d.desexed||'unknown')+'</p><p><b>Allergies:</b> '+safe(d.allergies||'none recorded')+'</p><p><b>Feeding:</b> '+safe(d.feeding||'not recorded')+'</p><p><b>Medication:</b> '+safe(d.medication||'none recorded')+'</p><p><b>Physio:</b> '+safe(d.physio||'none recorded')+'</p><button data-delete-dog="'+safe(d.id)+'" class="danger">Delete dog</button></details></article>'
  }).join('')
};
function buildReportCard(d){
  const todayStr=new Date().toDateString();
  const doneToday=tasks.filter(t=>t.dogId===d.id&&t.status==='Done'&&t.doneAt&&new Date(t.doneAt).toDateString()===todayStr);
  const meals=doneToday.filter(t=>t.type==='Feeding').length;
  const meds=doneToday.filter(t=>t.type==='Medication');
  const play=doneToday.filter(t=>t.type==='Exercise').length;
  const adj=learnAdjust(d.id);
  const mood=d.notSocialToday?'had a quiet day and enjoyed some personal space':adj>0?'is settling in — our team is giving extra one-on-one attention':'had a happy, settled day';
  return 'GENEVIEVE DAILY REPORT — '+d.name+' — '+new Date().toLocaleDateString()+'\n\n'+
    d.name+' '+mood+'. 🐾\n\n'+
    '🍽️ Meals given: '+(meals||'see notes')+'\n'+
    (d.medication?('💊 Medication: '+(meds.length?meds.length+' dose(s) given'+(meds[0].givenBy?' by '+meds[0].givenBy:''):'as per plan')+'\n'):'')+
    '🎾 Exercise/play sessions: '+(play||'included in daily routine')+'\n'+
    (d.feeding?('📝 Feeding plan: '+d.feeding+'\n'):'')+
    '\nAny questions, just reply — thanks for trusting us with '+d.name+'!\n(Generated by GENEVIEVE™ — records available on request)'
}
// Temperature log
let templog=load('gk_templog',[]);
function renderTemps(){
  const node=$('#tempList');if(!node)return;
  node.innerHTML=templog.slice(0,6).map(t=>'<div class="config-row"><b>'+safe(t.loc)+':</b> '+safe(t.temp)+'°C '+(t.flag?'<span class="chip">⚠️ '+safe(t.flag)+'</span>':'')+'<br><small>'+new Date(t.time).toLocaleString()+'</small></div>').join('')||'<div class="config-row">No readings yet. Log the medication fridge at least daily.</div>'
}
document.addEventListener('DOMContentLoaded',()=>{
  renderDashboard();renderDogs();renderTemps();
  $('#tempForm')?.addEventListener('submit',e=>{
    e.preventDefault();const f=new FormData(e.target);
    const loc=String(f.get('loc'));const temp=Number(f.get('temp'));
    let flag='';
    if(loc==='Medication fridge'&&(temp<2||temp>8))flag='OUT OF 2–8°C COLD-CHAIN RANGE — check medications, log corrective action';
    if(loc!=='Medication fridge'&&temp>=32)flag='HEAT RISK — activate heat checks: water, cooling, no exercise';
    templog.unshift({loc,temp,flag,time:now()});templog=templog.slice(0,120);save('gk_templog',templog);
    addAudit('Temperature logged',loc+': '+temp+'°C'+(flag?' — '+flag:''),flag?'red':'green');
    if(flag&&loc==='Medication fridge'){tasks.unshift({id:'task_'+Date.now()+'_temp',dogId:'',type:'Welfare check',due:'',notes:'MEDICATION FRIDGE '+temp+'°C — outside 2–8°C. Check all refrigerated medications, record corrective action, consider vet advice for affected doses.',status:'Open',createdAt:now()});save('gk_tasks',tasks)}
    e.target.reset();renderTemps();renderDashboard()
  });
  document.body.addEventListener('click',e=>{
    const rep=e.target.getAttribute('data-report-dog');
    if(rep){const d=dogs.find(x=>x.id===rep);if(!d)return;
      const text=buildReportCard(d);
      const out=$('#reportCardOut');
      if(out){out.innerHTML='<div class="result green"><b>📋 Report card — '+safe(d.name)+'</b><pre style="white-space:pre-wrap;font-family:inherit;font-size:.9rem">'+safe(text)+'</pre><button id="shareReport" class="primaryAction">Share / send to owner</button></div>';window.scrollTo({top:0,behavior:'smooth'});
        $('#shareReport')?.addEventListener('click',()=>{if(navigator.share){navigator.share({text}).catch(()=>{})}else{navigator.clipboard?.writeText(text);const b=$('#shareReport');if(b)b.textContent='✅ Copied — paste into SMS/email'}});
        addAudit('Owner report card generated',d.name)}
    }
    // Medication/Feeding sign-off: runs after the original done-handler
    const done=e.target.getAttribute('data-done-task');
    if(done){const t=tasks.find(x=>x.id===done);
      if(t&&t.status==='Done'&&(t.type==='Medication'||t.type==='Feeding')&&!t.givenBy){
        const crew=(typeof load==='function'?load('gk_staff',[]):[]).filter(s=>s.onShift).map(s=>s.name);
        t.givenBy=crew.length?crew.join('/'):'(unrecorded — add administering staff in notes)';
        save('gk_tasks',tasks);
        addAudit(t.type+' administered',((dogs.find(d=>d.id===t.dogId)||{}).name||'')+' — recorded by: '+t.givenBy,t.type==='Medication'?'amber':'green')
      }
    }
  })
});
})();

/* ============================================================
   GENEVIEVE™ PHYSIO + CO-HOUSING + DIRECTOR ROSTER MODULE
   Canine rehab with tick-offs, minutes and sign-off (recorded
   under veterinary direction); family & compatibility-based
   shared housing via the GENEVIEVE™ engine and locked colour
   system; and the Director's one-tap daily operations roster.
   ============================================================ */
(function(){
const PHYSIO_TREATMENTS=['Passive range of motion (ROM)','Assisted stretching','Massage / soft-tissue therapy','Hydrotherapy — underwater treadmill','Hydrotherapy — swimming','Therapeutic laser (vet-directed)','Heat pack therapy','Cold pack / cryotherapy','Balance board / wobble cushion','Cavaletti pole work','Sit-to-stand repetitions','Weight-shifting exercises','Controlled lead walking','Gait retraining','Stair / ramp work','Core strengthening','Proprioception games','Post-op wound check','Ice after exercise','Rest / crate rest enforcement'];
let physioPlans=load('gk_physio_plans',{});   // dogId -> {vetDirection, minutes, items:[]}
let physioSessions=load('gk_physio_sessions',[]); // {id,dogId,items:[{name,done}],pain,mobility,minutes,notes,by,time}
function painCls(p){return p<=2?'green':p<=4?'yellow':p<=6?'amber':'red'}
function crewNames(){return (load('gk_staff',[])||[]).filter(s=>s.onShift).map(s=>s.name).join('/')||'(record staff in notes)'}

function renderPhysioPicker(){
  const node=$('#physioTreatmentPicker');if(!node)return;
  node.innerHTML='<summary style="display:none"></summary><p><b>Treatments in this plan:</b></p>'+PHYSIO_TREATMENTS.map(t=>'<label class="toggle"><input type="checkbox" name="pt" value="'+safe(t)+'"> '+safe(t)+'</label>').join('')
}
function renderPhysioSelects(){
  const opts=dogs.map(d=>'<option value="'+safe(d.id)+'">'+safe(d.name)+(physioPlans[d.id]?' — plan active':'')+'</option>').join('');
  const a=$('#physioDog');if(a)a.innerHTML=opts;
  const b=$('#physioSessionDog');if(b){b.innerHTML=opts;loadSessionChecklist(b.value)}
  const c=$('#coDogs');if(c)c.innerHTML=dogs.map(d=>'<option value="'+safe(d.id)+'">'+safe(d.name)+' ('+safe(d.species||'Dog')+(d.family?' — '+safe(d.family):'')+')</option>').join('')
}
function loadSessionChecklist(dogId){
  const node=$('#physioSessionChecklist');if(!node)return;
  const plan=physioPlans[dogId];
  if(!plan){node.innerHTML='<p><small>No physio plan for this animal yet — set one above first.</small></p>';return}
  node.innerHTML='<p><b>Plan:</b> '+safe(plan.vetDirection||'no vet direction recorded')+' — target '+safe(plan.minutes)+' min/day</p>'+plan.items.map(t=>'<label class="toggle"><input type="checkbox" name="done" value="'+safe(t)+'"> '+safe(t)+'</label>').join('')
}
function physioTrend(dogId){
  const s=physioSessions.filter(x=>x.dogId===dogId).slice(0,3);
  if(s.length<3)return null;
  const painUp=s[0].pain>s[1].pain&&s[1].pain>=s[2].pain;
  const mobDown=s[0].mobility<s[1].mobility&&s[1].mobility<=s[2].mobility;
  if(painUp||mobDown)return 'declining';
  if(s[0].pain<s[2].pain||s[0].mobility>s[2].mobility)return 'improving';
  return 'steady'
}
function renderPhysioHistory(){
  const node=$('#physioHistory');if(!node)return;
  const byDog={};physioSessions.forEach(s=>{(byDog[s.dogId]=byDog[s.dogId]||[]).push(s)});
  node.innerHTML=Object.entries(byDog).map(([dogId,list])=>{
    const d=dogs.find(x=>x.id===dogId);if(!d)return'';
    const trend=physioTrend(dogId);
    const todayStr=new Date().toDateString();
    const minsToday=list.filter(s=>new Date(s.time).toDateString()===todayStr).reduce((a,s)=>a+Number(s.minutes||0),0);
    const target=(physioPlans[dogId]||{}).minutes||0;
    const pct=target?Math.min(100,Math.round(minsToday/target*100)):0;
    const trendTxt=trend==='declining'?'<span class="chip">📉 DECLINING — vet review flagged</span>':trend==='improving'?'<span class="chip">📈 improving</span>':trend?'<span class="chip">➡️ steady</span>':'';
    return '<article class="card"><h2>'+safe(d.name)+' — physio record '+trendTxt+'</h2>'+
    '<p><b>Minutes today:</b> '+minsToday+' / '+target+' target</p><div class="barWrap"><div class="bar '+(pct>=100?'g':pct>=50?'a':'r')+'" style="width:'+Math.max(6,pct)+'%"></div></div>'+
    list.slice(0,4).map(s=>'<div class="config-row"><b>Pain '+s.pain+'/10</b> <span class="chip">'+painCls(s.pain)+'</span> · Mobility '+s.mobility+'/10 · '+s.minutes+' min · signed: '+safe(s.by)+'<br><small>'+s.items.filter(i=>i.done).map(i=>'✅ '+safe(i.name)).join(' · ')+'</small><br><small>'+new Date(s.time).toLocaleString()+' '+safe(s.notes||'')+'</small></div>').join('')+'</article>'
  }).join('')||'<div class="card">No physio sessions yet. GENEVIEVE™ tracks minutes, pain, mobility and sign-off per animal.</div>'
}

/* ---------- Co-housing engine ---------- */
function coHouseCheck(list){
  const reasons=[];let score=5;
  if(list.length<2)return{cls:'green',score:0,reasons:['Select two or more animals.']};
  const families=new Set(list.map(a=>(a.family||'').trim().toLowerCase()).filter(Boolean));
  const sameFamily=families.size===1&&list.every(a=>(a.family||'').trim());
  const species=new Set(list.map(a=>a.species||'Dog'));
  if(species.size>1&&!sameFamily){return{cls:'red',score:100,reasons:['❌ Different species from different households must NEVER share housing. Cats room in the cattery/cat room.']}}
  if(species.size>1&&sameFamily){score+=25;reasons.push('Same-family dog + cat: only if they live together at home, owner consents, room has vertical escape space for the cat, separate feeding, and constant early supervision. If in ANY doubt — separate rooms with scent swapping.')}
  list.forEach(a=>{
    if(!a.coHouseOk){score+=30;reasons.push('⚠️ '+a.name+': no owner consent for shared housing recorded — consent is mandatory before co-housing.')}
    if(a.resourceGuarding){score+=35;reasons.push('❌ '+a.name+' resource guards: if housed together, ALL food, chews and toys removed from shared space; feed in separate rooms, always.')}
    if(a.onHeat){score+=40;reasons.push('❌ '+a.name+' is on heat: individual housing only.')}
    if(a.notSocialToday){score+=20;reasons.push(a.name+' flagged needs-space today.')}
    if(a.reactive>=6){score+=15;reasons.push(a.name+' reactive-'+a.reactive+': shared housing needs senior staff sign-off.')}
    const adj=(typeof window.__learnAdjustProxy==='function')?0:0;
  });
  const dogsOnly=list.filter(a=>(a.species||'Dog')==='Dog');
  const intactMix=dogsOnly.some(a=>a.intact)&&dogsOnly.length>1;
  if(intactMix){score+=25;reasons.push('Entire dog in the group: no mixed-sex co-housing; supervision increased.')}
  if(sameFamily){score=Math.max(5,score-25);reasons.unshift('✅ Same household ('+list[0].family+') — familiar animals, lowest-risk co-housing when owner consents.')}
  else if(species.size===1){
    for(let i=0;i<dogsOnly.length;i++)for(let j=i+1;j<dogsOnly.length;j++){const gap=Math.abs((dogsOnly[i].energy||0)-(dogsOnly[j].energy||0));score+=gap*2}
    reasons.push('Unfamiliar dogs: co-house only after a GREEN supervised play result, gradual introduction, and daily reassessment.')
  }
  reasons.push('House rules for ALL shared housing: feed separately, remove high-value items, extra welfare checks (minimum 3 daily logged), separate immediately at any tension, record who approved.');
  score=Math.min(100,score);
  return{cls:level(score),score,reasons}
}

/* ---------- Director's daily roster ---------- */
function buildDirectorRoster(){
  const todayStr=new Date().toDateString();
  const byKennel={};dogs.forEach(d=>{const k=d.kennelId||'__unassigned';(byKennel[k]=byKennel[k]||[]).push(d)});
  const crew=(load('gk_staff',[])||[]);const onS=crew.filter(s=>s.onShift);
  const arrivals=dogs.filter(d=>d.arrival&&new Date(d.arrival).toDateString()===todayStr);
  const departures=dogs.filter(d=>d.departure&&new Date(d.departure).toDateString()===todayStr);
  const overdue=tasks.filter(t=>t.status!=='Done'&&t.due&&new Date(t.due).getTime()<Date.now());
  let rows='';
  kennels.forEach(k=>{
    const occ=byKennel[k.id]||[];
    if(occ.length===0){rows+='<div class="config-row"><b>'+safe(k.name)+'</b> <span class="chip">'+safe(k.zone)+'</span> — empty</div>';return}
    let co='';
    if(occ.length>1){const chk=coHouseCheck(occ);co='<br><b>Co-housed ('+occ.length+'):</b> <span class="chip">'+chk.cls.toUpperCase()+' co-housing</span>'}
    rows+='<div class="config-row"><b>'+safe(k.name)+'</b> <span class="chip">'+safe(k.zone)+'</span>'+co+
      occ.map(d=>'<br>🐾 <b>'+safe(d.name)+'</b> ('+safe(d.species||'Dog')+(d.family?', '+safe(d.family):'')+')'+
        '<br>&nbsp;&nbsp;🍽️ '+safe(d.feeding||'standard feeding')+
        (d.allergies?'<br>&nbsp;&nbsp;⚠️ ALLERGIES: '+safe(d.allergies):'')+
        (d.medication?'<br>&nbsp;&nbsp;💊 '+safe(d.medication):'')+
        (physioPlans[d.id]?'<br>&nbsp;&nbsp;🦴 Physio: '+safe(physioPlans[d.id].minutes)+' min — '+safe(physioPlans[d.id].vetDirection||''):'')+
        (d.bedding?'<br>&nbsp;&nbsp;🛏️ '+safe(d.bedding):'')+
        ((d.vaccination==='Unknown'||d.vaccination==='Expired / needs update')?'<br>&nbsp;&nbsp;💉 <b>VAX EVIDENCE OUTSTANDING</b>':'')
      ).join('')+'</div>'
  });
  const un=byKennel['__unassigned']||[];
  if(un.length)rows+='<div class="config-row"><b>⚠️ NOT YET PLACED:</b> '+un.map(d=>safe(d.name)).join(', ')+' — assign via Match before end of shift</div>';
  return '<div class="result green printArea" id="directorPrintArea"><b>📋 GENEVIEVE™ DIRECTOR’S DAILY ROSTER — '+new Date().toLocaleDateString()+'</b>'+
    '<p><b>Staff on shift ('+onS.length+'):</b> '+ (onS.map(s=>safe(s.name)+' ('+safe(s.role)+')').join(', ')||'⚠️ none marked on shift')+'</p>'+
    '<p><b>Arrivals today:</b> '+(arrivals.map(d=>safe(d.name)).join(', ')||'none')+' · <b>Departures:</b> '+(departures.map(d=>safe(d.name)).join(', ')||'none')+(overdue.length?' · <b>⚠️ Overdue tasks: '+overdue.length+'</b>':'')+'</p>'+
    '<h3>Housing, feeding, medical &amp; physio by kennel</h3>'+rows+
    '<p><small>Generated by GENEVIEVE™ — Genevieve assists; humans decide. Locked colour system: Green safe · Yellow monitor · Amber action · Red urgent · Black official emergency only.</small></p>'+
    '<button id="printRoster" class="secondary">🖨️ Print / save as PDF</button></div>'
}

document.addEventListener('DOMContentLoaded',()=>{
  renderPhysioPicker();renderPhysioSelects();renderPhysioHistory();
  const _rs=window.renderSelects;window.renderSelects=function(){_rs();renderPhysioSelects()};
  $('#physioSessionDog')?.addEventListener('change',e=>loadSessionChecklist(e.target.value));
  $('#physioPlanForm')?.addEventListener('submit',e=>{
    e.preventDefault();const f=new FormData(e.target);const dogId=f.get('dog');
    const items=Array.from(e.target.querySelectorAll('input[name="pt"]:checked')).map(i=>i.value);
    if(!items.length){addAudit('Physio plan rejected','No treatments selected','amber');return}
    physioPlans[dogId]={vetDirection:f.get('vetDirection'),minutes:Number(f.get('minutes')||20),items};
    save('gk_physio_plans',physioPlans);
    const d=dogs.find(x=>x.id===dogId);
    addAudit('Physio plan saved',(d?d.name:dogId)+': '+items.length+' treatments, '+physioPlans[dogId].minutes+' min/day — '+String(f.get('vetDirection')||'no vet direction recorded'),'green');
    renderPhysioSelects();e.target.reset();renderPhysioPicker()
  });
  $('#physioSessionForm')?.addEventListener('submit',e=>{
    e.preventDefault();const f=new FormData(e.target);const dogId=f.get('dog');
    const plan=physioPlans[dogId];if(!plan){loadSessionChecklist(dogId);return}
    const doneSet=new Set(Array.from(e.target.querySelectorAll('input[name="done"]:checked')).map(i=>i.value));
    const sess={id:'phys_'+Date.now(),dogId,items:plan.items.map(n=>({name:n,done:doneSet.has(n)})),pain:Number(f.get('pain')||0),mobility:Number(f.get('mobility')||0),minutes:Number(f.get('minutes')||0),notes:f.get('notes'),by:crewNames(),time:now()};
    physioSessions.unshift(sess);physioSessions=physioSessions.slice(0,300);save('gk_physio_sessions',physioSessions);
    const d=dogs.find(x=>x.id===dogId);
    addAudit('Physio session signed off',(d?d.name:dogId)+': '+sess.minutes+' min, pain '+sess.pain+'/10, mobility '+sess.mobility+'/10, by '+sess.by,painCls(sess.pain));
    if(sess.pain>=7){tasks.unshift({id:'task_'+Date.now()+'_pain',dogId,type:'Welfare check',due:'',notes:'HIGH PAIN SCORE ('+sess.pain+'/10) in physio for '+(d?d.name:'')+' — contact vet before next session.',status:'Open',createdAt:now()});save('gk_tasks',tasks)}
    const trend=physioTrend(dogId);
    if(trend==='declining'){tasks.unshift({id:'task_'+Date.now()+'_trend',dogId,type:'Welfare check',due:'',notes:'🧠 GENEVIEVE learning: '+(d?d.name:'')+' physio trend DECLINING over last 3 sessions (pain up / mobility down). Vet review recommended before continuing plan.',status:'Open',createdAt:now()});save('gk_tasks',tasks);addAudit('Physio trend alert',(d?d.name:dogId)+' declining — vet review task created','amber')}
    e.target.reset();renderPhysioHistory();renderDashboard()
  });
  $('#coHouseForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const ids=Array.from($('#coDogs').selectedOptions).map(o=>o.value);
    const list=dogs.filter(d=>ids.includes(d.id));
    const res=coHouseCheck(list);
    $('#coHouseResult').innerHTML='<div class="result '+res.cls+'"><b>'+label(res.cls)+' co-housing — '+list.map(d=>safe(d.name)).join(' + ')+'</b><div class="barWrap"><div class="bar '+bar(res.cls)+'" style="width:'+Math.max(6,res.score)+'%"></div></div><ul>'+res.reasons.map(r=>'<li>'+safe(r)+'</li>').join('')+'</ul></div>';
    addAudit('Co-housing check',label(res.cls)+': '+list.map(d=>d.name).join(' + ')+' ('+res.score+'/100)',res.cls)
  });
  // Guard: assigning into an occupied kennel runs a co-house check first (capture phase, before the assign handler)
  document.body.addEventListener('click',e=>{
    const assignDog=e.target.getAttribute&&e.target.getAttribute('data-assign-dog');
    if(!assignDog)return;
    const kid=e.target.getAttribute('data-assign-kennel');
    const occupants=dogs.filter(d=>d.kennelId===kid&&d.id!==assignDog);
    if(occupants.length){
      const incoming=dogs.find(d=>d.id===assignDog);
      const res=coHouseCheck([incoming,...occupants]);
      if(res.cls==='red'){
        if(!confirm('🔴 RED co-housing: '+incoming.name+' with '+occupants.map(o=>o.name).join(', ')+'.\n\n'+res.reasons[0]+'\n\nGENEVIEVE™ recommends AGAINST this placement. Assign anyway? (This override will be audited.)')){
          e.stopPropagation();e.preventDefault();addAudit('Co-housing blocked','RED placement of '+incoming.name+' declined by staff — engine recommendation followed','green');return
        }
        addAudit('Co-housing override','⚠️ RED co-housing OVERRIDDEN by staff: '+incoming.name+' + '+occupants.map(o=>o.name).join(', ')+' — senior review required','red')
      }else{
        addAudit('Co-housing check on assign',label(res.cls)+': '+incoming.name+' + '+occupants.map(o=>o.name).join(', '),res.cls)
      }
    }
  },true);
  $('#directorRoster')?.addEventListener('click',()=>{
    $('#directorSheet').innerHTML=buildDirectorRoster();
    addAudit('Director roster generated','Full housing/feeding/medical/physio roster for '+new Date().toLocaleDateString());
    $('#printRoster')?.addEventListener('click',()=>{document.body.classList.add('print-director');window.print();setTimeout(()=>document.body.classList.remove('print-director'),500)})
  })
});
})();

/* ============================================================
   GENEVIEVE™ KENNEL COMMAND MODULE
   Care Command patterns applied to kennels:
   - Escalation banner ("Currently with: ...")
   - WHS daily safety register (compliance toggles, resets daily)
   - Welfare rounds (2–3 hourly per-animal checks, overdue escalates)
   - Staff breaks: entitlement tracking + FAIRNESS detector
     (skipped breaks are a psychosocial WHS hazard — nobody is
     the person who always misses out)
   - Emergency information card
   - Inspector Compliance Report (regulator-ready, printable)
   - Notes with colour flags
   ============================================================ */
(function(){
const HOUR=60*60*1000;
const WHS_ITEMS=[
 ['Animal Safety',[['Fresh water in every run','Each shift','All staff'],['Gates, latches & double-gates checked','Each shift','All staff'],['Perimeter fence walk — no gaps or digging','Daily','Senior attendant'],['Isolation protocols active where required','Continuous','Manager'],['Medication fridge temp logged (2–8°C)','Daily','Med lead']]],
 ['Manual Handling & Equipment',[['Leads, collars & muzzles serviceable','Daily','All staff'],['2-person lift for large or injured dogs','Continuous','Team leader'],['Crates & trolleys safe and clean','Daily','Care staff'],['Hydro / physio equipment checked','Before use','Physio lead']]],
 ['Hygiene & Biosecurity',[['Hand hygiene & PPE stocked','Continuous','All staff'],['Cleaning & sanitising schedule followed','Daily','All staff'],['Chemicals locked & labelled','Daily','All staff'],['Waste & sharps disposal safe','Continuous','All staff']]],
 ['Environment & Emergency',[['Fire equipment, exits & evacuation plan clear','Each shift','Fire warden'],['Emergency / evac kit staged (crates, leads, ID tags)','Daily','All staff'],['Storm-safe rooms clear & ready','Daily','Care staff'],['Yard surfaces safe — heat, water, hazards','Each shift','All staff']]],
 ['Records & Compliance',[['Vaccination evidence current for all animals','Ongoing','Manager'],['Incident & hazard log up to date','Continuous','All staff'],['Staff first aid & certs current','Ongoing','Manager'],['Insurance & WorkCover certificates current','Ongoing','Manager'],['Staff breaks taken & recorded','Each shift','Team leader']]]
];
const WHS_TOTAL=WHS_ITEMS.reduce((s,[,items])=>s+items.length,0);
function whsState(){let st=load('gk_whsreg',null);const today=new Date().toDateString();if(!st||st.date!==today){st={date:today,done:{}};save('gk_whsreg',st)}return st}
let breaks=load('gk_breaks',[]);           // {staffId,name,type,start,end}
let missed=load('gk_missedbreaks',[]);     // {name,time}
let notes=load('gk_notes',[]);
let rounds=load('gk_rounds',[]);           // {dogId,time,note,by}
let emgInfo=load('gk_emginfo',{vet:'',vetPhone:'',assembly:'',drill:''});
function staffList(){return load('gk_staff',[])||[]}
function crewStr(){return staffList().filter(s=>s.onShift).map(s=>s.name).join('/')||'staff'}
function seniorOnShift(){const c=staffList().filter(s=>s.onShift);return (c.find(s=>s.role==='Manager')||c.find(s=>s.role==='Senior attendant')||c[0]||{}).name||'Manager'}

/* ---- WHS daily register ---- */
function renderWhs(){
  const node=$('#whsRegister');if(!node)return;
  const st=whsState();const doneN=Object.values(st.done).filter(Boolean).length;
  const pct=Math.round(doneN/WHS_TOTAL*100);
  const sum=$('#whsSummary');
  if(sum){sum.className='answerBox '+(pct===100?'green':pct>=50?'amber':'red');sum.innerHTML='<b>'+pct+'%</b> — '+doneN+' of '+WHS_TOTAL+' checks complete. The animal-welfare &amp; work-safety items a safe kennel confirms each shift.'}
  node.innerHTML=WHS_ITEMS.map(([group,items])=>{
    const gd=items.filter(([n])=>st.done[n]).length;
    return '<div class="card"><h3>'+safe(group)+' <span class="chip">'+gd+'/'+items.length+'</span></h3>'+items.map(([n,freq,role])=>'<label class="toggle whsRow"><input type="checkbox" data-whs="'+safe(n)+'" '+(st.done[n]?'checked':'')+'> <span><b>'+safe(n)+'</b><br><small>'+safe(freq)+' · '+safe(role)+'</small></span></label>').join('')+'</div>'
  }).join('')
}

/* ---- Welfare rounds ---- */
function lastRound(dogId){return rounds.find(r=>r.dogId===dogId)}
function roundStatus(dogId){const r=lastRound(dogId);if(!r)return{cls:'red',txt:'Not checked yet this shift'};const h=(Date.now()-new Date(r.time).getTime())/HOUR;if(h<2)return{cls:'green',txt:'Checked '+Math.round(h*60)+' min ago'};if(h<3)return{cls:'amber',txt:'Due — last check '+h.toFixed(1)+'h ago'};return{cls:'red',txt:'OVERDUE — '+h.toFixed(1)+'h since last check'}}
function roundsOverdueCount(){return dogs.filter(d=>roundStatus(d.id).cls==='red').length}
function renderRounds(){
  const node=$('#roundsList');if(!node)return;
  node.innerHTML=dogs.map(d=>{const st=roundStatus(d.id);
    return '<div class="result '+st.cls+'"><b>'+safe(d.name)+'</b> '+(d.medication?'<span class="chip">💊 meds</span>':'')+(physioLabel(d.id))+'<br><small>'+safe(st.txt)+'</small><br><input data-round-note="'+safe(d.id)+'" placeholder="Note what you observed (water, mood, toileting, injuries)..."><button data-round-check="'+safe(d.id)+'" class="secondary">✓ Checked / welfare round done</button></div>'
  }).join('')||'<div class="config-row">No animals on site.</div>'
}
function physioLabel(dogId){try{const p=load('gk_physio_plans',{})[dogId];return p?'<span class="chip">🦴 physio plan</span>':''}catch(e){return''}}

/* ---- Breaks & fairness ---- */
function activeBreak(staffId){return breaks.find(b=>b.staffId===staffId&&!b.end)}
function mealTakenToday(staffId){const t=new Date().toDateString();return breaks.some(b=>b.staffId===staffId&&b.type==='Meal'&&b.end&&new Date(b.start).toDateString()===t)}
function breakAlertCount(){let n=0;staffList().forEach(s=>{if(!s.onShift||!s.clockInAt)return;const h=(Date.now()-s.clockInAt)/HOUR;if(h>=4.5&&!mealTakenToday(s.id)&&!activeBreak(s.id))n++});return n}
function fairnessFlag(){
  const cutoff=Date.now()-14*24*HOUR;
  const recent=missed.filter(m=>new Date(m.time).getTime()>cutoff);
  if(recent.length<3)return null;
  const by={};recent.forEach(m=>{by[m.name]=(by[m.name]||0)+1});
  const [name,count]=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
  if(count>=3&&count/recent.length>=0.6)return{name,count,total:recent.length};
  return null
}
function renderBreaks(){
  const node=$('#breaksPanel');if(!node)return;
  const crew=staffList().filter(s=>s.onShift);
  const fair=fairnessFlag();
  node.innerHTML=(fair?'<div class="answerBox red"><b>⚠️ FAIRNESS FLAG:</b> '+safe(fair.name)+' has missed '+fair.count+' of the last '+fair.total+' recorded missed breaks. The same person is always going without — that is a psychosocial WHS hazard and a roster problem, not a personal one. Fix the roster; everyone gets their break.</div>':'')+
  (crew.map(s=>{
    const h=s.clockInAt?((Date.now()-s.clockInAt)/HOUR):0;
    const onBreak=activeBreak(s.id);
    const meal=mealTakenToday(s.id);
    let cls='green',msg='On shift '+h.toFixed(1)+'h · '+(meal?'meal break ✅ taken':'meal break not yet taken');
    if(!meal&&!onBreak&&h>=5){cls='red';msg='⚠️ '+h.toFixed(1)+'h WITHOUT A MEAL BREAK — must break NOW (award entitlement; skipped breaks are recorded)'}
    else if(!meal&&!onBreak&&h>=4.5){cls='amber';msg='Meal break due — '+h.toFixed(1)+'h on shift, break before the 5-hour mark'}
    if(onBreak){cls='green';msg='☕ On '+onBreak.type.toLowerCase()+' break since '+new Date(onBreak.start).toLocaleTimeString()+' — leave them alone'}
    return '<div class="result '+cls+'"><b>'+safe(s.name)+'</b> <span class="chip">'+safe(s.role)+'</span><br><small>'+msg+'</small><br>'+
    (onBreak?'<button data-break-end="'+safe(s.id)+'" class="secondary">End break</button>':
      '<button data-break-start="'+safe(s.id)+'" data-break-type="Meal" class="secondary">Start meal break (30 min)</button><button data-break-start="'+safe(s.id)+'" data-break-type="Rest" class="quietButton">Rest break (10 min)</button>')+'</div>'
  }).join('')||'<div class="config-row">Nobody marked on shift. Mark staff on shift to start break tracking.</div>')
}

/* ---- Escalation banner ---- */
function renderActionBanner(){
  const node=$('#actionBanner');if(!node)return;
  const overdueT=tasks.filter(t=>t.status!=='Done'&&t.due&&new Date(t.due).getTime()<Date.now()).length;
  const openI=incidents.filter(i=>!i.closed).length;
  const rOver=roundsOverdueCount();
  const bAlerts=breakAlertCount();
  const st=whsState();const whsLeft=WHS_TOTAL-Object.values(st.done).filter(Boolean).length;
  const parts=[];
  if(rOver)parts.push(rOver+' welfare round'+(rOver>1?'s':'')+' overdue');
  if(bAlerts)parts.push(bAlerts+' staff overdue for a break');
  if(overdueT)parts.push(overdueT+' care task'+(overdueT>1?'s':'')+' overdue');
  if(openI)parts.push(openI+' incident'+(openI>1?'s':'')+' open');
  const n=rOver+bAlerts+overdueT+openI;
  if(n===0){node.innerHTML=whsLeft>0?'<div class="answerBox amber"><b>WHS register: '+whsLeft+' checks remaining today</b> · Currently with: <b>'+safe(seniorOnShift())+'</b></div>':'';return}
  node.innerHTML='<div class="answerBox '+(rOver||bAlerts||overdueT?'red':'amber')+'"><b>🔴 '+n+' alert'+(n>1?'s':'')+' need action</b> — '+safe(parts.join(' · '))+'<br>Currently with: <b>'+safe(seniorOnShift())+'</b> · tap the tab to view &amp; action</div>'
}

/* ---- Emergency info ---- */
function renderEmgInfo(){
  const node=$('#emgInfoView');if(!node)return;
  node.innerHTML='<p><b>After-hours vet:</b> '+safe(emgInfo.vet||'not set')+(emgInfo.vetPhone?' · <a href="tel:'+safe(emgInfo.vetPhone.replace(/[^\d+]/g,''))+'">'+safe(emgInfo.vetPhone)+'</a>':'')+'<br><b>Evacuation assembly point:</b> '+safe(emgInfo.assembly||'not set')+'<br><b>Last evacuation drill:</b> '+safe(emgInfo.drill||'not recorded')+(emgInfo.drill&&(Date.now()-new Date(emgInfo.drill).getTime())>90*24*HOUR?' <span class="chip">⚠️ over 90 days — run a drill</span>':'')+'</p>'
}

/* ---- Notes ---- */
function renderNotes(){
  const node=$('#noteList');if(!node)return;
  node.innerHTML=notes.slice(0,6).map(n=>'<div class="config-row"><span class="chip">'+safe(n.cat)+'</span> <span class="chip">'+safe(n.flag)+'</span> '+safe(n.text)+'<br><small>'+new Date(n.time).toLocaleString()+' · '+safe(n.by)+'</small></div>').join('')||'<div class="config-row">No notes yet.</div>'
}

/* ---- Inspector Compliance Report ---- */
function certStatus(dateStr){if(!dateStr)return['not recorded','amber'];const d=new Date(dateStr).getTime();if(d<Date.now())return['expired','red'];if(d<Date.now()+60*24*HOUR)return['expiring','amber'];return['✓ current','green']}
function buildInspectorReport(){
  const st=whsState();const whsPct=Math.round(Object.values(st.done).filter(Boolean).length/WHS_TOTAL*100);
  const checkedOk=dogs.filter(d=>roundStatus(d.id).cls!=='red').length;
  const medsGiven=audit.filter(a=>/administered/i.test(a.type)).length;
  const openI=incidents.filter(i=>!i.closed).length;
  const notifiable=incidents.filter(i=>i.flags&&i.flags.includes('regulatorReview')).length;
  const fair=fairnessFlag();
  const staffRows=staffList().map(s=>{const [txt,cls]=certStatus(s.firstAidExpiry);return '<tr><td>'+safe(s.name)+'</td><td>'+safe(s.role)+'</td><td><span class="chip">'+(s.humanFirstAid?txt:'none recorded')+'</span></td><td>'+(s.animalFirstAid?'✓':'—')+'</td><td>'+(s.fireWarden?'✓':'—')+'</td></tr>'}).join('');
  return '<div class="result green printArea" id="inspectorPrintArea"><b>📋 GENEVIEVE™ KENNELS — INSPECTOR COMPLIANCE REPORT</b><br><small>For presentation to Workplace Health and Safety Queensland / council / insurer · Generated '+new Date().toLocaleString()+'</small>'+
  '<p><b>Facility:</b> '+safe(($('#facilityName')||{}).textContent||'Kennels')+' · <b>ABN:</b> 36 530 564 761 · <b>Governing:</b> WHS Act 2011 (QLD), Animal Management (Cats and Dogs) Act 2008 (QLD), award break entitlements</p>'+
  '<h3>1 · Duty of care — welfare rounds</h3><p><b>'+checkedOk+'/'+dogs.length+'</b> animals within check window right now · rounds logged: '+rounds.length+'</p>'+
  '<h3>2 · WHS daily safety register</h3><p><b>'+whsPct+'%</b> of '+WHS_TOTAL+' checks complete today</p>'+
  '<h3>3 · Staff breaks &amp; psychosocial (QLD WHS Reg — psychosocial hazards)</h3><p>Breaks recorded: '+breaks.filter(b=>b.end).length+' · missed-break events (14 days): '+missed.filter(m=>(Date.now()-new Date(m.time).getTime())<14*24*HOUR).length+(fair?' · <b style="color:#b02121">FAIRNESS FLAG ACTIVE: '+safe(fair.name)+'</b> — roster review required':' · no unfair pattern detected')+'</p>'+(window.__fairnessSummary?window.__fairnessSummary():'')+
  '<h3>4 · Medication &amp; care</h3><p>Recorded administrations: '+medsGiven+' · physio sessions: '+(load('gk_physio_sessions',[])||[]).length+'</p>'+
  '<h3>5 · Incidents &amp; hierarchy of controls</h3><p>Open: '+openI+' · total recorded: '+incidents.length+' · flagged for regulator review: '+notifiable+'</p>'+
  '<h3>6 · Staff competency</h3><table class="certTable"><tr><th>Staff</th><th>Role</th><th>First aid</th><th>Animal first aid</th><th>Fire warden</th></tr>'+staffRows+'</table>'+
  '<h3>7 · Evidence timeline (latest)</h3>'+audit.slice(0,8).map(a=>'<div class="config-row"><b>'+safe(a.type)+'</b> — '+safe(a.detail)+'<br><small>'+new Date(a.time).toLocaleString()+'</small></div>').join('')+
  '<p><small><b>Genevieve App Suite</b> · Behavioural Intelligence Framework · IP Australia Standard Patent No. 2026204552 · Labrador, Queensland, Australia · Decision-support only — the operator remains responsible.</small></p>'+
  '<button data-print="inspector" class="secondary">🖨️ Print / save as PDF</button></div>'
}

document.addEventListener('DOMContentLoaded',()=>{
  const stamp=$('#buildStamp');if(stamp)stamp.textContent='v2.0 · '+new Date().toLocaleDateString();
  renderWhs();renderRounds();renderBreaks();renderActionBanner();renderEmgInfo();renderNotes();
  const _rd=window.renderDashboard;window.renderDashboard=function(){_rd();renderActionBanner()};
  setInterval(()=>{renderBreaks();renderRounds();renderActionBanner()},60000);
  // stamp clock-in time when staff marked on shift; record missed break at clock-off
  document.body.addEventListener('change',e=>{
    const os=e.target.getAttribute&&e.target.getAttribute('data-onshift');
    if(os){let list=staffList();list=list.map(s=>{
      if(s.id!==os)return s;
      if(e.target.checked)return{...s,clockInAt:Date.now()};
      const h=s.clockInAt?((Date.now()-s.clockInAt)/HOUR):0;
      if(h>=5&&!mealTakenToday(s.id)){missed.unshift({name:s.name,time:now()});missed=missed.slice(0,200);save('gk_missedbreaks',missed);addAudit('Missed meal break recorded',s.name+' clocked off after '+h.toFixed(1)+'h with no meal break — psychosocial WHS record','red')}
      return{...s,clockInAt:null}
    });save('gk_staff',list);renderBreaks()}
    const w=e.target.getAttribute&&e.target.getAttribute('data-whs');
    if(w){const st=whsState();st.done[w]=e.target.checked;save('gk_whsreg',st);addAudit('WHS register',(e.target.checked?'✓ ':'unchecked: ')+w+' — by '+crewStr(),e.target.checked?'green':'amber');renderWhs();renderActionBanner()}
  });
  document.body.addEventListener('click',e=>{
    const bs=e.target.getAttribute&&e.target.getAttribute('data-break-start');
    if(bs){const type=e.target.getAttribute('data-break-type')||'Meal';const s=staffList().find(x=>x.id===bs);breaks.unshift({staffId:bs,name:s?s.name:'',type,start:now(),end:null});breaks=breaks.slice(0,400);save('gk_breaks',breaks);addAudit('Break started',(s?s.name:'')+' — '+type+' break','green');renderBreaks()}
    const be=e.target.getAttribute&&e.target.getAttribute('data-break-end');
    if(be){const b=activeBreak(be);if(b){b.end=now();save('gk_breaks',breaks);const mins=Math.round((new Date(b.end)-new Date(b.start))/60000);addAudit('Break ended',b.name+' — '+b.type+' break, '+mins+' min','green')}renderBreaks()}
    const rc=e.target.getAttribute&&e.target.getAttribute('data-round-check');
    if(rc){const noteEl=document.querySelector('input[data-round-note="'+rc+'"]');const d=dogs.find(x=>x.id===rc);
      rounds.unshift({dogId:rc,time:now(),note:noteEl?noteEl.value:'',by:crewStr()});rounds=rounds.slice(0,500);save('gk_rounds',rounds);
      addAudit('Welfare round',(d?d.name:rc)+' checked by '+crewStr()+(noteEl&&noteEl.value?' — '+noteEl.value:''),'green');renderRounds();renderActionBanner()}
    if(e.target.id==='inspectorReport'){$('#inspectorSheet').innerHTML=buildInspectorReport();addAudit('Inspector Compliance Report generated','Regulator-ready report built')}
    if(e.target.getAttribute&&e.target.getAttribute('data-print')==='inspector'){document.body.classList.add('print-director');window.print();setTimeout(()=>document.body.classList.remove('print-director'),500)}
  });
  $('#noteForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);notes.unshift({cat:f.get('cat'),flag:f.get('flag'),text:f.get('text'),by:crewStr(),time:now()});notes=notes.slice(0,100);save('gk_notes',notes);addAudit('Note added',f.get('cat')+' ('+f.get('flag')+'): '+f.get('text'),f.get('flag')==='red'?'red':f.get('flag')==='amber'?'amber':'green');e.target.reset();renderNotes()});
  $('#emgInfoForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);emgInfo={vet:f.get('vet'),vetPhone:f.get('vetPhone'),assembly:f.get('assembly'),drill:f.get('drill')};save('gk_emginfo',emgInfo);addAudit('Emergency information updated','Vet/assembly/drill details saved');renderEmgInfo()});
  // patch cert expiry onto newly added staff
  $('#staffForm')?.addEventListener('submit',e=>{const f=new FormData(e.target);setTimeout(()=>{const list=staffList();if(list[0]&&!list[0].firstAidExpiry&&f.get('firstAidExpiry')){list[0].firstAidExpiry=f.get('firstAidExpiry');save('gk_staff',list)}},50)});
});
})();

/* ============================================================
   GENEVIEVE™ ROSTER FAIRNESS MODULE
   1) Shift rotation: the same person must not always get the
      close (or open). 28-day rotation detector.
   2) Overtime: every minute past rostered end is counted and
      shown as OWED until marked paid/TOIL — all time worked
      must be paid (Fair Work Act).
   3) Duties: fair auto-assignment weighted to whoever has done
      the least lately; done = credited, not-done = recorded
      against the assignee. Equal roles, equal load.
   ============================================================ */
(function(){
const DAY=24*60*60*1000;
let shiftHistory=load('gk_shifthistory',[]);   // {staffId,name,type,date}
let overtime=load('gk_overtime',[]);           // {staffId,name,mins,time,paid:false}
let duties=load('gk_duties',[]);               // {id,name}
let dutyLog=load('gk_dutylog',[]);             // {id,dutyName,assignee,staffId,date,status,time}
if(duties.length===0){duties=['Yard hose-down & poo patrol','Bins out & waste','Laundry — bedding & towels','Kitchen & food-prep clean','Reception, phones & bookings tidy','Closing checks — gates, locks, lights'].map((n,i)=>({id:'duty_'+i,name:n}));save('gk_duties',duties)}
function sList(){return load('gk_staff',[])||[]}
function todayStr(){return new Date().toDateString()}

/* ---- rotation ---- */
function logShiftType(staffId,type){
  const s=sList().find(x=>x.id===staffId);if(!s)return;
  shiftHistory=shiftHistory.filter(h=>!(h.staffId===staffId&&h.date===todayStr()));
  shiftHistory.unshift({staffId,name:s.name,type,date:todayStr()});
  shiftHistory=shiftHistory.slice(0,400);save('gk_shifthistory',shiftHistory)
}
function rotationFlag(type){
  const cutoff=Date.now()-28*DAY;
  const recent=shiftHistory.filter(h=>h.type===type&&new Date(h.date).getTime()>cutoff);
  if(recent.length<4)return null;
  const by={};recent.forEach(h=>{by[h.name]=(by[h.name]||0)+1});
  const names=Object.keys(by);if(names.length<1)return null;
  const [name,count]=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
  if(count>=3&&count/recent.length>=0.5&&(names.length>1||sList().length>1))return{name,count,total:recent.length};
  return null
}
/* ---- overtime ---- */
function owedMins(staffId){return overtime.filter(o=>o.staffId===staffId&&!o.paid).reduce((a,o)=>a+o.mins,0)}
function recordOvertime(s){
  if(!s.rosteredEnd)return;
  const [hh,mm]=String(s.rosteredEnd).split(':').map(Number);if(isNaN(hh))return;
  const end=new Date();end.setHours(hh,mm,0,0);
  const mins=Math.round((Date.now()-end.getTime())/60000);
  if(mins>=5){overtime.unshift({staffId:s.id,name:s.name,mins,time:now(),paid:false});overtime=overtime.slice(0,300);save('gk_overtime',overtime);
    addAudit('OVERTIME RECORDED',s.name+' worked '+mins+' min past rostered end ('+s.rosteredEnd+') — must be paid or credited as TOIL. Running total owed: '+owedMins(s.id)+' min','red')}
}
/* ---- duties ---- */
function doneCount14(name){const c=Date.now()-14*DAY;return dutyLog.filter(l=>l.assignee===name&&l.status==='done'&&new Date(l.time).getTime()>c).length}
function notDoneCount14(name){const c=Date.now()-14*DAY;return dutyLog.filter(l=>l.assignee===name&&l.status==='assigned'&&new Date(l.time).getTime()>c&&l.date!==todayStr()).length}
function assignDutiesFairly(){
  const crew=sList().filter(s=>s.onShift);
  if(crew.length===0){addAudit('Duty assignment failed','Nobody marked on shift','amber');renderDuties();return}
  dutyLog=dutyLog.filter(l=>l.date!==todayStr());
  const ranked=[...crew].sort((a,b)=>doneCount14(a.name)-doneCount14(b.name)); // least-done first
  duties.forEach((d,i)=>{const s=ranked[i%ranked.length];
    dutyLog.unshift({id:'dl_'+Date.now()+'_'+i,dutyName:d.name,assignee:s.name,staffId:s.id,date:todayStr(),status:'assigned',time:now()})});
  save('gk_dutylog',dutyLog);
  addAudit('Duties assigned fairly',duties.length+' duties across '+crew.length+' staff, weighted to whoever has done least in 14 days','green');
  renderDuties()
}
function dutyImbalance(){
  const c=Date.now()-14*DAY;const by={};
  dutyLog.filter(l=>l.status==='done'&&new Date(l.time).getTime()>c).forEach(l=>{by[l.assignee]=(by[l.assignee]||0)+1});
  const e=Object.entries(by);if(e.length<2)return null;
  e.sort((a,b)=>b[1]-a[1]);const [maxN,maxC]=e[0];const [minN,minC]=e[e.length-1];
  if(maxC-minC>=4&&maxC>=minC*2)return{maxN,maxC,minN,minC};
  return null
}
function accountabilityFlags(){
  const names=[...new Set(dutyLog.map(l=>l.assignee))];
  return names.map(n=>({n,miss:notDoneCount14(n)})).filter(x=>x.miss>=3)
}
function renderRotation(){
  const node=$('#rotationPanel');if(!node)return;
  const closeF=rotationFlag('Close');const openF=rotationFlag('Open');
  let flags='';
  if(closeF)flags+='<div class="answerBox red"><b>⚠️ ROTATION UNFAIR — CLOSES:</b> '+safe(closeF.name)+' has done '+closeF.count+' of the last '+closeF.total+' closes. Closes rotate — nobody is the permanent closer. Fix the roster.</div>';
  if(openF)flags+='<div class="answerBox amber"><b>Rotation check — opens:</b> '+safe(openF.name)+' is doing most opens ('+openF.count+'/'+openF.total+').</div>';
  const rows=sList().map(s=>{
    const owed=owedMins(s.id);
    const closes28=shiftHistory.filter(h=>h.staffId===s.id&&h.type==='Close'&&new Date(h.date).getTime()>Date.now()-28*DAY).length;
    return '<div class="result '+(owed>0?'red':'green')+'"><b>'+safe(s.name)+'</b> <span class="chip">closes 28d: '+closes28+'</span>'+(owed>0?'<span class="chip">⏱️ OWED '+owed+' min unpaid</span>':'')+
    (s.onShift?'<br><label>Today\u2019s shift <select data-shift-type="'+safe(s.id)+'"><option value="">choose...</option><option'+(s.shiftType==='Open'?' selected':'')+'>Open</option><option'+(s.shiftType==='Mid'?' selected':'')+'>Mid</option><option'+(s.shiftType==='Close'?' selected':'')+'>Close</option></select></label><label>Rostered finish <input type="time" data-rostered-end="'+safe(s.id)+'" value="'+safe(s.rosteredEnd||'')+'"></label>':'')+
    (owed>0?'<button data-ot-paid="'+safe(s.id)+'" class="secondary">✅ Overtime paid / TOIL credited ('+owed+' min)</button>':'')+'</div>'
  }).join('');
  node.innerHTML=flags+rows
}
function renderDuties(){
  const node=$('#dutiesPanel');if(!node)return;
  const today=dutyLog.filter(l=>l.date===todayStr());
  const imb=dutyImbalance();const acc=accountabilityFlags();
  let flags='';
  if(imb)flags+='<div class="answerBox amber"><b>⚖️ DUTY IMBALANCE:</b> '+safe(imb.maxN)+' has done '+imb.maxC+' duties vs '+safe(imb.minN)+'\u2019s '+imb.minC+' in 14 days. Same role = same load — rebalance today\u2019s assignment.</div>';
  acc.forEach(a=>{flags+='<div class="answerBox red"><b>📋 ACCOUNTABILITY:</b> '+safe(a.n)+' has '+a.miss+' assigned duties not completed in 14 days. Recorded — everyone owns their own work so others don\u2019t burn out covering it.</div>'});
  node.innerHTML=flags+(today.length?today.map(l=>'<div class="result '+(l.status==='done'?'green':'amber')+'"><b>'+safe(l.dutyName)+'</b> — '+safe(l.assignee)+(l.status==='done'?' <span class="chip">✅ done</span>':'<button data-duty-done="'+safe(l.id)+'" class="secondary">Done ✓ ('+safe(l.assignee)+' signs off)</button>')+'</div>').join(''):'<div class="config-row">No duties assigned today yet — tap "Assign today\u2019s duties fairly".</div>')+
  '<p><small>Duties on the list: '+duties.map(d=>safe(d.name)).join(' · ')+'</small></p>'
}
window.__fairnessSummary=function(){
  const closeF=rotationFlag('Close');const totalOwed=overtime.filter(o=>!o.paid).reduce((a,o)=>a+o.mins,0);
  const imb=dutyImbalance();const acc=accountabilityFlags();
  return '<p><b>Rotation:</b> '+(closeF?'⚠️ UNFAIR — '+safe(closeF.name)+' '+closeF.count+'/'+closeF.total+' closes':'rotating fairly')+' · <b>Unpaid overtime owed:</b> '+(totalOwed>0?'<b style="color:#b02121">'+totalOwed+' min — must be paid/TOIL</b>':'0 min')+' · <b>Duties:</b> '+(imb?'imbalance flagged':'balanced')+(acc.length?' · accountability flags: '+acc.map(a=>safe(a.n)).join(', '):'')+'</p>'
};
document.addEventListener('DOMContentLoaded',()=>{
  renderRotation();renderDuties();
  setInterval(renderRotation,60000);
  $('#assignDuties')?.addEventListener('click',assignDutiesFairly);
  $('#dutyForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const n=String(f.get('name')||'').trim();if(!n)return;duties.push({id:'duty_'+Date.now(),name:n});save('gk_duties',duties);addAudit('Duty added to list',n);e.target.reset();renderDuties()});
  document.body.addEventListener('change',e=>{
    const st=e.target.getAttribute&&e.target.getAttribute('data-shift-type');
    if(st&&e.target.value){let list=sList();list=list.map(s=>s.id===st?{...s,shiftType:e.target.value}:s);save('gk_staff',list);logShiftType(st,e.target.value);addAudit('Shift type set',(list.find(s=>s.id===st)||{}).name+': '+e.target.value+(e.target.value==='Close'?' — rotation counter updated':''));renderRotation()}
    const re=e.target.getAttribute&&e.target.getAttribute('data-rostered-end');
    if(re){let list=sList();list=list.map(s=>s.id===re?{...s,rosteredEnd:e.target.value}:s);save('gk_staff',list)}
    const os=e.target.getAttribute&&e.target.getAttribute('data-onshift');
    if(os&&!e.target.checked){const s=sList().find(x=>x.id===os);if(s)recordOvertime(s);renderRotation()}
  });
  document.body.addEventListener('click',e=>{
    const dd=e.target.getAttribute&&e.target.getAttribute('data-duty-done');
    if(dd){const l=dutyLog.find(x=>x.id===dd);if(l){l.status='done';l.time=now();save('gk_dutylog',dutyLog);addAudit('Duty completed',l.dutyName+' — '+l.assignee,'green');renderDuties()}}
    const op=e.target.getAttribute&&e.target.getAttribute('data-ot-paid');
    if(op){const mins=owedMins(op);overtime=overtime.map(o=>o.staffId===op?{...o,paid:true}:o);save('gk_overtime',overtime);addAudit('Overtime settled',(sList().find(s=>s.id===op)||{}).name+': '+mins+' min marked paid / TOIL credited','green');renderRotation()}
  });
});
})();
