const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');
function element(){
 const classes=new Set(),attributes=new Map(),events=new Map();
 return {hidden:true,innerHTML:'',textContent:'',events,classes,focusCount:0,
 classList:{add(c){classes.add(c);},contains(c){return classes.has(c);},toggle(c,on){if(on===undefined)on=!classes.has(c);if(on)classes.add(c);else classes.delete(c);}},
 addEventListener(name,fn){events.set(name,fn);},setAttribute(k,v){attributes.set(k,v);},getAttribute(k){return attributes.get(k)??null;},focus(){this.focusCount++;},fire(name,event={}){return events.get(name)?.(event);}};
}
function media(matches){return {matches,listeners:[],addEventListener(_,fn){this.listeners.push(fn);},change(next){this.matches=next;this.listeners.forEach(fn=>fn());}};}
function harness({desktop=true,reduced=false,clipboard=async()=>{}}={}){
 const selectors=['.menu-toggle','#navigation','.motion-toggle','.hero-motion','.copy-email','.copy-status'];
 const nodes=Object.fromEntries(selectors.map(s=>[s,element()]));
 const doc=element(),desktopMedia=media(desktop),motionMedia=media(reduced);
 const steps=Array.from({length:6},element),observers=[];
 let now=0,id=0;const timers=new Map();
 const Observer=class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}unobserve(){}disconnect(){this.disconnected=true;}};
 const window={isSecureContext:true,matchMedia(q){return q.includes('reduced')?motionMedia:desktopMedia;},IntersectionObserver:Observer,setTimeout(fn,delay){timers.set(++id,{fn,time:now+delay});return id;},clearTimeout(id){timers.delete(id);}};
 const context={document:{documentElement:element(),querySelector:s=>nodes[s],querySelectorAll:()=>steps,addEventListener:doc.addEventListener.bind(doc)},window,navigator:{clipboard:{writeText:clipboard}},IntersectionObserver:Observer,performance:{now:()=>now},Set};
 vm.runInNewContext(read('site.js'),context);
 function advance(target){while(true){const next=[...timers].sort((a,b)=>a[1].time-b[1].time)[0];if(!next||next[1].time>target)break;now=next[1].time;timers.delete(next[0]);next[1].fn();}now=target;}
 return {nodes,steps,doc,desktopMedia,motionMedia,observers,advance};
}
test('desktop menu stays hidden; switching to mobile enables open, navigation close, and Escape focus',()=>{
 const h=harness(),toggle=h.nodes['.menu-toggle'],nav=h.nodes['#navigation'];
 assert.equal(toggle.hidden,true);h.desktopMedia.change(false);assert.equal(toggle.hidden,false);
 toggle.fire('click');assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.ok(nav.classes.has('is-open'));
 nav.fire('click',{target:{closest:()=>({})}});assert.equal(toggle.getAttribute('aria-expanded'),'false');
 toggle.fire('click');h.doc.fire('keydown',{key:'Escape'});assert.equal(toggle.getAttribute('aria-expanded'),'false');assert.equal(toggle.focusCount,1);
 toggle.fire('click');h.desktopMedia.change(true);assert.equal(toggle.hidden,true);assert.equal(toggle.getAttribute('aria-expanded'),'false');
});
test('hero pause toggles and reduced motion overrides play',()=>{
 const h=harness(),toggle=h.nodes['.motion-toggle'],hero=h.nodes['.hero-motion'];
 toggle.fire('click');assert.ok(hero.classes.has('motion-paused'));assert.equal(toggle.getAttribute('aria-pressed'),'true');
 toggle.fire('click');assert.equal(hero.classes.has('motion-paused'),false);
 h.motionMedia.change(true);assert.ok(hero.classes.has('motion-paused'));assert.equal(toggle.hidden,true);
});
test('all six steps reveal individually in order at 900ms intervals',()=>{
 const h=harness();h.observers[0].callback(h.steps.map(target=>({target,isIntersecting:true})));
 for(let i=0;i<6;i++){h.advance(i*900);assert.equal(h.steps.filter(s=>s.classes.has('is-visible')).length,i+1);if(i<5){h.advance(i*900+899);assert.equal(h.steps.filter(s=>s.classes.has('is-visible')).length,i+1);}}
});
test('offscreen steps do not consume the reveal sequence; motion preference reveals all content',()=>{
 const h=harness(),o=h.observers[0];o.callback(h.steps.map(target=>({target,isIntersecting:true})));h.advance(0);
 o.callback(h.steps.slice(1).map(target=>({target,isIntersecting:false})));h.advance(2000);assert.equal(h.steps.filter(s=>s.classes.has('is-visible')).length,1);
 o.callback([{target:h.steps[1],isIntersecting:true}]);h.advance(2000);assert.ok(h.steps[1].classes.has('is-visible'));
 h.motionMedia.change(true);assert.ok(h.steps.every(s=>s.classes.has('is-visible')));assert.equal(o.disconnected,true);
});
test('initial reduced motion does not hide any process cards',()=>{
 const h=harness({reduced:true});assert.equal(h.observers.length,0);assert.ok(h.steps.every(s=>!s.classes.has('step-reveal')));
});
test('copy-email reports success only after write, and handles clipboard denial',async()=>{
 let actual;const h=harness({clipboard:async text=>{actual=text;}});await h.nodes['.copy-email'].fire('click');assert.equal(actual,'tech@diarva.org');assert.match(h.nodes['.copy-status'].textContent,/Email copied/);
 const denied=harness({clipboard:async()=>{throw Error('denied');}});await denied.nodes['.copy-email'].fire('click');assert.match(denied.nodes['.copy-status'].textContent,/select and copy/);assert.doesNotMatch(denied.nodes['.copy-status'].textContent,/Email copied/);
});
async function pixelHarness({reduced=false,imageFailure=false}={}){
 const stage=element(),hero=element(),motion=media(reduced),frames=[];
 let clears=0,squares=0;
 const context2d={scale(){},clearRect(){clears++;},fillRect(){squares++;}};
 const canvas={width:0,height:0,getContext:()=>context2d};
 const maskContext={drawImage(){},fillText(){},getImageData(){const data=new Uint8ClampedArray(500*500*4);for(let y=80;y<310;y++)for(let x=130;x<360;x++)data[(y*500+x)*4+3]=255;return {data};}};
 const doc={hidden:false,fonts:{ready:Promise.resolve()},querySelector(s){return s==='.pixel-canvas'?canvas:s==='.pixel-stage'?stage:hero;},createElement(){return {getContext:()=>maskContext};}};
 const image=class{decode(){return imageFailure?Promise.reject(Error('missing image')):Promise.resolve();}};
 const win={devicePixelRatio:3,matchMedia:()=>motion,requestAnimationFrame:fn=>frames.push(fn)};
 vm.runInNewContext(read('hero-pixels.js'),{document:doc,window:win,Image:image,Uint8ClampedArray,Math});
 await new Promise(setImmediate);
 function frame(time){const fn=frames.shift();assert.ok(fn,'animation frame scheduled');fn(time);}
 return {stage,hero,canvas,motion,frame,counts:()=>({clears,squares})};
}
test('pixel logo initializes with DPR capped; paused frames do not redraw',async()=>{
 const h=await pixelHarness();assert.ok(h.stage.classes.has('pixels-ready'));assert.equal(h.canvas.width,1000);assert.ok(h.counts().squares>0);
 h.frame(0);const before=h.counts().clears;h.hero.classes.add('motion-paused');h.frame(16);assert.equal(h.counts().clears,before);
});
test('reduced-motion pixel logo draws once; image failure preserves SVG fallback',async()=>{
 const h=await pixelHarness({reduced:true}),before=h.counts().clears;h.frame(0);h.frame(16);assert.equal(h.counts().clears,before);
 const failed=await pixelHarness({imageFailure:true});assert.equal(failed.stage.classes.has('pixels-ready'),false);
});
