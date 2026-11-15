/* SRASH v5 site script: progressive enhancement, no dependencies */
(function(){
'use strict';
var d=document,de=d.documentElement,b=d.body;
var me=d.currentScript&&d.currentScript.src||'';
var ROOT=me.replace(/\/assets\/site\.js.*$/,'');            // origin + optional /srash-site prefix
var PFX=ROOT.replace(/^https?:\/\/[^/]+/,'');                 // '' or '/srash-site'
function $(s,c){return (c||d).querySelector(s);}
function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s));}
function on(el,ev,fn,o){if(el)el.addEventListener(ev,fn,o);}
var FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
function visible(el){return !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);}
function trap(container,e){
  var f=$$(FOCUSABLE,container).filter(visible);if(!f.length)return;
  var first=f[0],last=f[f.length-1];
  if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus();}
}

/* ---------- mobile menu with focus trap */
var tog=$('.nav-toggle'),nav=$('#nav'),hdr=$('.site-header');
function setMenu(o){
  if(!nav||!tog)return;
  nav.classList.toggle('open',o);b.classList.toggle('nav-open',o);
  tog.setAttribute('aria-expanded',o);tog.setAttribute('aria-label',o?'Close menu':'Open menu');
  if(o){d.documentElement.style.setProperty('--navtop',Math.max(0,hdr.getBoundingClientRect().bottom)+'px');var f=$('.nav-b',nav);f&&f.focus();}
}
on(tog,'click',function(){setMenu(!nav.classList.contains('open'));});
on(hdr,'keydown',function(e){
  if(!nav||!nav.classList.contains('open'))return;
  if(e.key==='Escape'){setMenu(false);tog.focus();}
  if(e.key==='Tab'){trap(hdr,e);}
});
var mq=window.matchMedia('(min-width:1024px)');
function mqChange(){if(mq.matches)setMenu(false);}
mq.addEventListener?mq.addEventListener('change',mqChange):mq.addListener(mqChange);

/* ---------- mega menus: click, hover (desktop), full keyboard support */
var megas=$$('.has-mega');
var fine=window.matchMedia('(hover:hover) and (min-width:1024px)');
function closeAll(except){megas.forEach(function(li){if(li!==except)setMega(li,false);});}
function setMega(li,o){li.classList.toggle('open',o);$('button',li).setAttribute('aria-expanded',o);}
megas.forEach(function(li){
  var btn=$('button',li),panel=$('.mega',li),t;
  function links(){return $$('a',panel).filter(visible);}
  on(btn,'click',function(e){e.stopPropagation();var o=li.dataset.hov==='1'?true:!li.classList.contains('open');li.dataset.hov='';closeAll(li);setMega(li,o);});
  on(li,'mouseenter',function(){if(!fine.matches)return;clearTimeout(t);if(!li.classList.contains('open')){li.dataset.hov='1';setTimeout(function(){li.dataset.hov='';},700);}closeAll(li);setMega(li,true);});
  on(li,'mouseleave',function(){if(!fine.matches)return;t=setTimeout(function(){setMega(li,false);},120);});
  on(btn,'keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();closeAll(li);setMega(li,true);var l=links();l[0]&&l[0].focus();}
  });
  on(panel,'keydown',function(e){
    var l=links(),i=l.indexOf(d.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();(l[i+1]||l[0]).focus();}
    else if(e.key==='ArrowUp'){e.preventDefault();if(i<=0){btn.focus();}else{l[i-1].focus();}}
    else if(e.key==='Home'){e.preventDefault();l[0].focus();}
    else if(e.key==='End'){e.preventDefault();l[l.length-1].focus();}
  });
  on(li,'keydown',function(e){if(e.key==='Escape'&&li.classList.contains('open')){e.stopPropagation();setMega(li,false);btn.focus();}});
  on(li,'focusout',function(e){if(mq.matches&&!li.contains(e.relatedTarget))setMega(li,false);});
});
on(d,'click',function(e){megas.forEach(function(li){if(!li.contains(e.target))setMega(li,false);});});
/* horizontal arrow keys between top-level items on desktop */
var tops=$$('.nav-b');
tops.forEach(function(x,i){on(x,'keydown',function(e){
  if(!mq.matches)return;
  if(e.key==='ArrowRight'){e.preventDefault();(tops[i+1]||tops[0]).focus();}
  if(e.key==='ArrowLeft'){e.preventDefault();(tops[i-1]||tops[tops.length-1]).focus();}
});});

/* ---------- live day counts */
var now=new Date();
function daysTo(iso){return Math.ceil((new Date(iso+'T23:59:59')-now)/864e5);}
function paintCounts(scope){
  $$('[data-deadline]',scope).forEach(function(el){
    var n=daysTo(el.getAttribute('data-deadline')),num=$('[data-num]',el);
    if(num){num.textContent=n>0?n.toLocaleString('en-US'):'0';if(n<=0)el.classList.add('past');return;}
    el.textContent=n>0?n.toLocaleString('en-US')+' days left':'Date passed';
    if(n<=0)el.classList.add('past');
  });
}
paintCounts();

/* ---------- site search overlay ('/' shortcut) */
var sOv=$('#search'),sQ=$('#search-q'),sR=$('#search-r'),sN=$('#search-n'),sIdx=null,sLast=null,sLoading=null;
function loadIdx(){
  if(sIdx)return Promise.resolve(sIdx);
  if(!sLoading)sLoading=fetch(ROOT+'/assets/search.json').then(function(r){return r.json();}).then(function(j){sIdx=j;return j;});
  return sLoading;
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function hl(s,terms){var h=esc(s);terms.forEach(function(t){if(t.length<2)return;h=h.replace(new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>');});return h;}
function search(q){
  var terms=q.toLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length){sR.innerHTML='';sN.textContent='';return;}
  var res=sIdx.map(function(it){
    var t=it.t.toLowerCase(),de=it.d.toLowerCase(),kx=(it.x||'').toLowerCase(),s=0,strong=false;
    for(var i=0;i<terms.length;i++){var w=terms[i],hit=false;
      if(t.indexOf(w)>-1){s+=t.indexOf(w)===0?14:10;hit=strong=true;}
      if(de.indexOf(w)>-1){s+=5;hit=strong=true;}
      if(kx.indexOf(w)>-1){s+=1;hit=true;}
      if(!hit)return null;}
    if(strong){if(it.k==='Service')s+=3;if(it.k==='Practice')s+=2;}
    return {it:it,s:s};
  }).filter(Boolean).sort(function(a,b){return b.s-a.s;}).slice(0,12);
  sN.textContent=res.length?(res.length+(res.length===12?'+':'')+' results'):'No results. Try a platform name such as PostgreSQL or EKS.';
  sR.innerHTML=res.map(function(r){var u=PFX+r.it.u;return '<li><a href="'+esc(u)+'"><span class="sk">'+esc(r.it.k)+'</span><span class="st">'+hl(r.it.t,terms)+'</span><span class="sd">'+hl(r.it.d,terms)+'</span></a></li>';}).join('');
}
function openSearch(){
  if(!sOv)return;sLast=d.activeElement;sOv.hidden=false;b.style.overflow='hidden';
  setMenu(false);closeAll();sQ.focus();loadIdx().then(function(){if(sQ.value)search(sQ.value);});
}
function closeSearch(){if(!sOv||sOv.hidden)return;sOv.hidden=true;b.style.overflow='';if(sLast&&sLast.focus)sLast.focus();}
$$('[data-search-open]').forEach(function(x){on(x,'click',openSearch);});
$$('[data-search-close]').forEach(function(x){on(x,'click',closeSearch);});
on(sOv,'click',function(e){if(e.target===sOv)closeSearch();});
on(sQ,'input',function(){loadIdx().then(function(){search(sQ.value.trim());});});
$$('[data-q]',sOv).forEach(function(x){on(x,'click',function(){sQ.value=x.getAttribute('data-q');sQ.dispatchEvent(new Event('input'));sQ.focus();});});
on(sOv,'keydown',function(e){
  if(e.key==='Escape'){e.preventDefault();closeSearch();return;}
  if(e.key==='Tab'){trap(sOv,e);return;}
  var l=$$('a',sR),i=l.indexOf(d.activeElement);
  if(e.key==='ArrowDown'&&l.length){e.preventDefault();(l[i+1]||l[0]).focus();}
  if(e.key==='ArrowUp'&&l.length){e.preventDefault();if(i<=0)sQ.focus();else l[i-1].focus();}
  if(e.key==='Enter'&&d.activeElement===sQ&&l.length){e.preventDefault();location.href=l[0].getAttribute('href');}
});
on(d,'keydown',function(e){
  var tg=e.target,typing=/INPUT|TEXTAREA|SELECT/.test(tg.tagName)||tg.isContentEditable;
  if(e.key==='/'&&!typing&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();openSearch();}
  if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)){e.preventDefault();openSearch();}
});

/* ---------- tabs (home practice explorer) */
$$('[data-tabs]').forEach(function(w){
  var tabs=$$('[role=tab]',w);
  function sel(t,focus){tabs.forEach(function(x){var s=x===t;x.setAttribute('aria-selected',s);x.tabIndex=s?0:-1;var p=d.getElementById(x.getAttribute('aria-controls'));if(s)p.removeAttribute('data-inactive');else p.setAttribute('data-inactive','');});if(focus)t.focus();}
  tabs.forEach(function(t,i){
    on(t,'click',function(){sel(t);});
    on(t,'keydown',function(e){var k=e.key,n=null;
      if(k==='ArrowRight')n=tabs[(i+1)%tabs.length];else if(k==='ArrowLeft')n=tabs[(i-1+tabs.length)%tabs.length];else if(k==='Home')n=tabs[0];else if(k==='End')n=tabs[tabs.length-1];
      if(n){e.preventDefault();sel(n,true);}});
  });
});

/* ---------- sticky sub-nav: highlight current section */
var sub=$('.subnav');
if(sub&&'IntersectionObserver' in window){
  var sl=$$('a',sub),map={};
  sl.forEach(function(a){var s=d.getElementById(a.getAttribute('href').slice(1));if(s)map[s.id]=a;});
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){sl.forEach(function(a){a.removeAttribute('aria-current');});var a=map[en.target.id];if(a){a.setAttribute('aria-current','true');var ul=a.closest('ul');if(ul)ul.scrollTo({left:a.offsetLeft-24,behavior:'smooth'});}}});},{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(function(id){io.observe(d.getElementById(id));});
}

/* ---------- deadlines: filter + sort */
var df=$('[data-dl-filters]'),dt=$('#dl-table');
if(df&&dt){
  var tb=$('tbody',dt),rows=$$('tr',tb),st={practice:'',kind:'',cloud:'',q:''},cnt=$('[data-f-count]'),emp=$('[data-f-empty]');
  function apply(){
    var n=0;rows.forEach(function(r){
      var ok=(!st.practice||r.dataset.practice===st.practice)&&(!st.kind||r.dataset.kind===st.kind)&&(!st.cloud||r.dataset.cloud===st.cloud)&&(!st.q||r.textContent.toLowerCase().indexOf(st.q)>-1);
      r.hidden=!ok;if(ok)n++;});
    cnt.textContent=n+' of '+rows.length+' dates shown';emp.hidden=n>0;
  }
  $$('[data-f-practice]',df).forEach(function(c){on(c,'click',function(){$$('[data-f-practice]',df).forEach(function(x){x.setAttribute('aria-pressed',x===c);});st.practice=c.getAttribute('data-f-practice');apply();});});
  on($('[data-f-kind]',df),'change',function(e){st.kind=e.target.value;apply();});
  on($('[data-f-cloud]',df),'change',function(e){st.cloud=e.target.value;apply();});
  on($('[data-f-q]',df),'input',function(e){st.q=e.target.value.trim().toLowerCase();apply();});
  on($('[data-f-reset]'),'click',function(){st={practice:'',kind:'',cloud:'',q:''};df.reset();$$('[data-f-practice]',df).forEach(function(x,i){x.setAttribute('aria-pressed',i===0);});apply();});
  $$('[data-sort]',dt).forEach(function(btn){on(btn,'click',function(){
    var th=btn.closest('th'),k=btn.getAttribute('data-sort'),dir=th.getAttribute('aria-sort')==='ascending'?'descending':'ascending';
    $$('th[aria-sort]',dt).forEach(function(x){x.setAttribute('aria-sort','none');});th.setAttribute('aria-sort',dir);
    rows.sort(function(a,c){var r=k==='date'?0:String(a.dataset[k]).localeCompare(String(c.dataset[k]),'en',{sensitivity:'base'});if(!r)r=a.dataset.date<c.dataset.date?-1:a.dataset.date>c.dataset.date?1:0;return r*(dir==='ascending'?1:-1);});
    rows.forEach(function(r){tb.appendChild(r);});
    cnt.textContent='Sorted by '+btn.textContent.trim().toLowerCase()+', '+dir;
  });});
  apply();
}

/* ---------- insights: chips + search */
var inf=$('[data-ins-filters]');
if(inf){
  var cards=$$('[data-i-list] .post'),ist={p:'',t:'',q:''},icnt=$('[data-i-count]'),iemp=$('[data-i-empty]');
  function iapply(){
    var n=0;cards.forEach(function(c){
      var ok=(!ist.p||c.dataset.practice===ist.p)&&(!ist.t||(c.dataset.topics||'').split('|').indexOf(ist.t)>-1)&&(!ist.q||c.textContent.toLowerCase().indexOf(ist.q)>-1);
      c.hidden=!ok;if(ok)n++;});
    icnt.textContent=n+(n===1?' article':' articles');iemp.hidden=n>0;
  }
  function chipGroup(attr,key){var cs=$$('['+attr+']',inf);cs.forEach(function(c){on(c,'click',function(){cs.forEach(function(x){x.setAttribute('aria-pressed',x===c);});ist[key]=c.getAttribute(attr);iapply();});});}
  chipGroup('data-i-practice','p');chipGroup('data-i-topic','t');
  on($('[data-i-q]',inf),'input',function(e){ist.q=e.target.value.trim().toLowerCase();iapply();});
  on($('[data-i-reset]'),'click',function(){ist={p:'',t:'',q:''};inf.reset();['data-i-practice','data-i-topic'].forEach(function(a){$$('['+a+']',inf).forEach(function(x,i){x.setAttribute('aria-pressed',i===0);});});iapply();});
}

/* ---------- deadline checker */
var ck=$('[data-checker]');
if(ck){
  var data=JSON.parse($('#checker-data').textContent),boxes=$$('input[name=tech]',ck),list=$('[data-c-list]',ck),cempty=$('[data-c-empty]',ck),ccta=$('[data-c-cta]',ck),clink=$('[data-c-link]',ck);
  var KEY='srash-checker';
  try{var saved=JSON.parse(localStorage.getItem(KEY)||'[]');boxes.forEach(function(x){x.checked=saved.indexOf(x.value)>-1;});}catch(e){}
  function render(){
    var keys={},picked=[];
    boxes.forEach(function(x){if(x.checked){picked.push(x.value);x.getAttribute('data-keys').split(' ').forEach(function(k){if(k)keys[k]=1;});}});
    try{localStorage.setItem(KEY,JSON.stringify(picked));}catch(e){}
    var ks=Object.keys(keys).sort(function(a,c){return data[a].date<data[c].date?-1:1;});
    list.innerHTML=ks.map(function(k){var x=data[k],n=daysTo(x.date);
      return '<li class="dlr'+(n<=0?' past':'')+'"><span class="dlr-d"><time datetime="'+x.date+'">'+esc(x.label)+'</time></span><span class="dlr-n">'+(n>0?n.toLocaleString('en-US')+' days':'Passed')+'</span><span class="dlr-p"><strong>'+esc(x.plat)+'</strong> '+esc(x.short)+' <a href="'+esc(x.src)+'" rel="noopener" target="_blank">Source</a></span><span class="dlr-a"><a class="ics" href="'+esc(x.ics)+'" download>.ics</a> <a href="'+esc(x.href)+'">'+esc(x.offer)+'</a></span></li>';}).join('');
    cempty.textContent=ks.length?(ks.length+(ks.length===1?' deadline applies':' deadlines apply')+' to what you selected.'):'Select one or more platforms to see the dates that apply.';
    ccta.hidden=!ks.length;
    if(ks.length){var dl=ks.length===1?data[ks[0]].opt:'Several of these';clink.href=PFX+'/contact/?deadline='+encodeURIComponent(dl)+'&from=checker&stack='+encodeURIComponent(picked.join('; '));}
  }
  boxes.forEach(function(x){on(x,'change',render);});
  on($('[data-c-all]',ck),'click',function(){boxes.forEach(function(x){x.checked=true;});render();});
  on($('[data-c-none]',ck),'click',function(){boxes.forEach(function(x){x.checked=false;});render();});
  render();
}

/* ---------- contact form: steps, validation, prefill, submit */
var f=$('#contact-form');
if(f){
  f.noValidate=true; /* JS takes over validation; without JS the browser's native checks still apply */
  var steps=$$('.fstep',f),pills=$$('.stepper li',f),cur=0,status=$('.form-status',f),ok=$('.form-ok');
  var FREE=/@(gmail|googlemail|yahoo|hotmail|outlook|live|icloud|aol|proton|protonmail|gmx|yandex|mail)\./i;
  function err(el,msg){var e=d.getElementById('e-'+(el.id||'').replace('f-',''));el.setAttribute('aria-invalid',msg?'true':'false');if(e)e.textContent=msg||'';}
  function check(el){
    var v=(el.value||'').trim(),m='';
    if(el.type==='checkbox'){if(el.required&&!el.checked)m='Please confirm so we can reply to you.';}
    else if(el.required&&!v)m={'f-name':'Enter your name.','f-email':'Enter your work email.','f-company':'Enter your company name.'}[el.id]||'This field is required.';
    else if(el.type==='email'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))m='Enter an email address like name@company.com.';
    err(el,m);return !m;
  }
  function validStep(i){var bad=null;$$('[required]',steps[i]).forEach(function(el){if(!check(el)&&!bad)bad=el;});if(bad)bad.focus();return !bad;}
  function show(i,init){cur=i;steps.forEach(function(s,k){if(k===i)s.removeAttribute('data-hidden');else s.setAttribute('data-hidden','');});
    pills.forEach(function(p,k){p.classList.toggle('on',k===i);p.classList.toggle('done',k<i);});
    if(init)return;
    var first=$('input:not([type=hidden]):not([tabindex="-1"]),select,textarea',steps[i]);if(first)first.focus({preventScroll:true});
    var top=f.getBoundingClientRect().top;if(top<80)window.scrollBy({top:top-140,behavior:'smooth'});}
  show(0,true);
  $$('[data-next]',f).forEach(function(x){on(x,'click',function(){if(validStep(cur))show(cur+1);});});
  $$('[data-prev]',f).forEach(function(x){on(x,'click',function(){show(cur-1);});});
  /* clear errors while typing; validate on blur, but not when focus moves to a nav button (avoids a layout shift swallowing the click) */
  $$('[required]',f).forEach(function(el){
    if(el.type==='checkbox'){on(el,'change',function(){check(el);});return;}
    on(el,'input',function(){if(el.getAttribute('aria-invalid')==='true')check(el);});
    on(el,'blur',function(e){var r=e.relatedTarget;if(r&&r.closest&&r.closest('.fnav'))return;if(el.getAttribute('aria-invalid')==='true'||el.value)check(el);});});
  var em=$('#f-email'),hint=$('#h-email');
  on(em,'input',function(){hint.textContent=FREE.test(em.value)?'A work address helps us reply faster, but personal email is fine.':'';});
  var msg=$('#f-msg'),mc=$('[data-count]',f);
  function count(){mc.textContent=(msg.value.length?msg.value.length.toLocaleString('en-US')+' / 4,000 characters':'');}
  on(msg,'input',count);
  /* smart prefill from ?topic= ?deadline= ?stack= (e.g. from the deadline checker or a service page) */
  var qs=new URLSearchParams(location.search);
  function pick(sel,val){if(!val)return;var o=$$('option',sel).filter(function(x){return x.textContent.trim()===val||x.value===val;})[0];if(o)sel.value=o.value;}
  pick($('#f-topic'),qs.get('topic'));pick($('#f-deadline'),qs.get('deadline'));
  if(qs.get('stack')&&msg&&!msg.value){msg.value='From the deadline checker. We run: '+qs.get('stack');count();}
  if(!qs.get('topic')&&d.referrer){try{var rp=new URL(d.referrer).pathname.replace(PFX,'');var m=rp.match(/^\/(data|cloud|ai)\/([^/]+)\//);if(m){var o=$$('#f-topic option').filter(function(x){return x.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').indexOf(m[2].split('-')[0])===0;})[0];if(o)$('#f-topic').value=o.value;}}catch(e){}}
  on(f,'formdata',function(e){var v=e.formData.getAll('platforms');if(v.length){e.formData.delete('platforms');e.formData.append('platforms',v.join(', '));}});
  on(f,'submit',function(e){
    e.preventDefault();
    for(var i=0;i<steps.length;i++){if(!validStep(i)){show(i);validStep(i);return;}}
    var fd=new FormData(f),key=fd.get('access_key'),to=f.getAttribute('data-mailto');
    if(fd.get('botcheck'))return;
    status.classList.remove('is-err');
    if(!key||key.indexOf('YOUR_')===0){
      var body='Name: '+fd.get('name')+'\nEmail: '+fd.get('email')+'\nCompany: '+fd.get('company')+'\nRole: '+(fd.get('role')||'')+'\nTopic: '+fd.get('interest')+'\nPlatforms: '+(fd.get('platforms')||'')+'\nDeadline: '+fd.get('deadline')+'\nTimeline: '+fd.get('timeline')+'\nBudget: '+fd.get('budget')+'\n\n'+(fd.get('message')||'');
      location.href='mailto:'+to+'?subject='+encodeURIComponent('Free review request: '+(fd.get('company')||fd.get('name')))+'&body='+encodeURIComponent(body);
      status.textContent='Opening your email app to send the request. If nothing opens, email '+to+'.';return;
    }
    var sb=$('button[type=submit]',f);sb.disabled=true;status.textContent='Sending your request…';
    fetch(f.action,{method:'POST',headers:{Accept:'application/json'},body:fd})
      .then(function(r){return r.json().then(function(j){if(!r.ok||!j.success)throw new Error(j.message||'Failed');return j;});})
      .then(function(){f.hidden=true;ok.hidden=false;ok.focus();try{history.replaceState(null,'',location.pathname+'#sent');}catch(e){}})
      .catch(function(){sb.disabled=false;status.classList.add('is-err');status.innerHTML='Something went wrong sending the form. Please try again or email <a href="mailto:'+to+'">'+to+'</a>.';});
  });
}

/* ---------- checklists: remember ticks */
$$('[data-checklist]').forEach(function(w){
  var k='srash-cl-'+w.getAttribute('data-checklist'),bx=$$('input[type=checkbox]',w),c=$('[data-cl-count]',w),st={};
  try{st=JSON.parse(localStorage.getItem(k)||'{}');}catch(e){}
  function upd(){var n=bx.filter(function(x){return x.checked;}).length;c.textContent=n+' of '+bx.length+' checks done';}
  bx.forEach(function(x){x.checked=!!st[x.id];on(x,'change',function(){st[x.id]=x.checked;try{localStorage.setItem(k,JSON.stringify(st));}catch(e){}upd();});});
  on($('[data-cl-reset]',w),'click',function(){st={};bx.forEach(function(x){x.checked=false;});try{localStorage.removeItem(k);}catch(e){}upd();});
  upd();
});

/* ---------- print buttons */
$$('[data-print]').forEach(function(x){on(x,'click',function(){window.print();});});

/* ---------- back to top + reading progress */
var tt=$('.totop'),pr=$('.progress span'),art=$('.prose'),tick=false;
function onScroll(){tick=false;var y=window.scrollY;
  if(tt)tt.classList.toggle('on',y>900);
  if(pr&&art){var r=art.getBoundingClientRect(),h=r.height-window.innerHeight*.6,p=Math.min(1,Math.max(0,-r.top/(h||1)));pr.style.transform='scaleX('+p+')';}}
on(window,'scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll);}},{passive:true});
on(tt,'click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});var m=$('#main');m&&m.focus({preventScroll:true});});
onScroll();

/* ---------- copy link on article headings */
function slug(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);}
$$('.prose h2').forEach(function(h){
  if(!h.id)h.id=slug(h.textContent);
  var bt=d.createElement('button');bt.type='button';bt.className='copy-h';bt.textContent='Copy link';bt.setAttribute('aria-label','Copy link to section: '+h.textContent);
  on(bt,'click',function(){var u=location.href.split('#')[0]+'#'+h.id;
    (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){bt.textContent='Copied';bt.classList.add('ok');},function(){history.replaceState(null,'','#'+h.id);bt.textContent='Link in address bar';})
    .then(function(){setTimeout(function(){bt.textContent='Copy link';bt.classList.remove('ok');},2000);});});
  h.appendChild(bt);
});
})();
