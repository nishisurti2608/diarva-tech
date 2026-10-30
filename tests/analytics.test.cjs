const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/analytics.js'),'utf8');
const ID='G-TEST123456';
function control(){const events=new Map();return {hidden:true,focus(){this.focused=true;},addEventListener(n,fn){events.set(n,fn);},click(){events.get('click')?.();},getAttribute(){return this.value;}};}
function setup({id=ID,saved=null,storageBlocked=false}={}){
 const accept=control(),reject=control(),banner=control(),settings=control();accept.value='accepted';reject.value='rejected';
 banner.querySelector=()=>accept;banner.querySelectorAll=()=>[accept,reject];
 const scripts=[],cookies=[],eventHandlers=new Map(),storage=new Map();let reloads=0;
 if(saved)storage.set(`diarva_analytics_choice_v1_${id}`,JSON.stringify(saved));
 const document={title:'Diarva Tech',referrer:'https://example.com/private?email=private@example.com#secret',querySelector:s=>s==='.analytics-consent'?banner:settings,createElement:()=>({}),head:{appendChild:script=>scripts.push(script)},addEventListener:(name,fn)=>eventHandlers.set(name,fn),set cookie(value){cookies.push(value);}};
 const window={DIARVA_CONFIG:{ga4MeasurementId:id},localStorage:{getItem(k){if(storageBlocked)throw Error('denied');return storage.get(k)||null;},setItem(k,v){if(storageBlocked)throw Error('denied');storage.set(k,v);}},location:{href:'https://diarva.example/services/?email=private@example.com&utm_source=outreach&utm_medium=email&utm_campaign=websites_october#private',hostname:'diarva.example',reload(){reloads++;}}};
 vm.runInNewContext(source,{window,document,URL,Date,JSON,encodeURIComponent});
 function clickLink(href){eventHandlers.get('click')?.({target:{closest:()=>({getAttribute:()=>href,classList:{contains:()=>false}})}});}
 const calls=()=>Array.from(window.dataLayer||[],args=>Array.from(args));
 return {window,accept,reject,banner,settings,scripts,cookies,storage,calls,clickLink,reloads:()=>reloads};
}
test('missing or invalid GA ID stays inactive with no prompt or tag request',()=>{
 for(const id of ['', 'UA-123456', 'G-invalid']){const h=setup({id});assert.equal(h.scripts.length,0);assert.equal(h.banner.hidden,true);assert.equal(h.settings.hidden,true);}
});
test('unknown consent makes zero Google requests; reject persists without loading a tag',()=>{
 const h=setup();assert.equal(h.scripts.length,0);assert.equal(h.banner.hidden,false);h.reject.click();assert.equal(h.scripts.length,0);assert.equal(h.banner.hidden,true);assert.equal(h.window[`ga-disable-${ID}`],true);assert.equal(h.reloads(),0);
 assert.equal(JSON.parse([...h.storage.values()][0]).value,'rejected');
});
test('accept loads one tag, sends one page view and strips private query/fragment/referrer path',()=>{
 const h=setup();h.accept.click();assert.equal(h.scripts.length,1);assert.match(h.scripts[0].src,/googletagmanager\.com\/gtag\/js\?id=G-TEST123456/);h.accept.click();assert.equal(h.scripts.length,1);
 const views=h.calls().filter(c=>c[0]==='event'&&c[1]==='page_view');assert.equal(views.length,1);assert.equal(views[0][2].page_location,'https://diarva.example/services/');assert.equal(views[0][2].page_referrer,'https://example.com');assert.equal(views[0][2].campaign_source,'outreach');assert.equal(views[0][2].campaign_name,'websites_october');
 assert.doesNotMatch(JSON.stringify(h.calls()),/private@example|#private|email=/);
 const defaults=h.calls().find(c=>c[0]==='consent'&&c[1]==='default');assert.equal(defaults[2].analytics_storage,'denied');const updates=h.calls().find(c=>c[0]==='consent'&&c[1]==='update');assert.equal(updates[2].analytics_storage,'granted');assert.equal(updates[2].ad_storage,'denied');
});
test('email click is contact_click, never a completed lead or raw email target',()=>{
 const h=setup();h.accept.click();h.clickLink('mailto:tech@diarva.org');const event=h.calls().find(c=>c[0]==='event'&&c[1]==='contact_click');assert.equal(event[2].contact_method,'email');assert.doesNotMatch(JSON.stringify(event),/tech@diarva/);assert.equal(h.calls().some(c=>c[1]==='generate_lead'),false);
});
test('revocation disables events, clears owned analytics cookies, and reloads to unload Google code',()=>{
 const h=setup();h.accept.click();h.reject.click();const count=h.calls().length;h.clickLink('tel:+13657670707');assert.equal(h.calls().length,count);assert.equal(h.window[`ga-disable-${ID}`],true);assert.ok(h.cookies.some(c=>c.startsWith('_ga=')));assert.equal(h.reloads(),1);
});
test('stored reject does not load Google; accepted choice loads; expired choice asks again',()=>{
 const rejected=setup({saved:{value:'rejected',timestamp:Date.now()}});assert.equal(rejected.banner.hidden,true);assert.equal(rejected.scripts.length,0);
 const accepted=setup({saved:{value:'accepted',timestamp:Date.now()}});assert.equal(accepted.scripts.length,1);
 const expired=setup({saved:{value:'accepted',timestamp:Date.now()-181*86400000}});assert.equal(expired.scripts.length,0);assert.equal(expired.banner.hidden,false);
});
test('blocked browser storage never causes implicit consent and still allows explicit choices',()=>{
 const h=setup({storageBlocked:true});assert.equal(h.scripts.length,0);h.accept.click();assert.equal(h.scripts.length,1);h.settings.click();assert.equal(h.banner.hidden,false);assert.equal(h.accept.focused,true);
});
