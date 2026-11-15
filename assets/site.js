(function(){
  var d=document,b=d.body;
  // mobile nav
  var t=d.querySelector('.nav-toggle'),n=d.getElementById('nav');
  if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');b.classList.toggle('nav-open',o);t.setAttribute('aria-expanded',o);t.setAttribute('aria-label',o?'Close menu':'Open menu');});
    n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){n.classList.remove('open');b.classList.remove('nav-open');t.setAttribute('aria-expanded',false);t.setAttribute('aria-label','Open menu');});});}
  // mega menu (click / keyboard; hover on desktop)
  d.querySelectorAll('.has-mega').forEach(function(li){
    var btn=li.querySelector('button'),fine=window.matchMedia('(hover:hover) and (min-width:981px)');
    function set(o){li.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);}
    btn.addEventListener('click',function(e){e.stopPropagation();set(!li.classList.contains('open'));});
    li.addEventListener('mouseenter',function(){if(fine.matches)set(true);});
    li.addEventListener('mouseleave',function(){if(fine.matches)set(false);});
    li.addEventListener('keydown',function(e){if(e.key==='Escape'){set(false);btn.focus();}});
    d.addEventListener('click',function(e){if(!li.contains(e.target))set(false);});
  });
  // live countdowns to support deadlines (end of the given day, local time)
  var now=new Date();
  d.querySelectorAll('[data-deadline]').forEach(function(el){
    var dt=new Date(el.getAttribute('data-deadline')+'T23:59:59'),days=Math.ceil((dt-now)/864e5);
    var num=el.querySelector('[data-num]');
    if(num){num.textContent=days>0?days.toLocaleString('en-US'):'0';return;}
    el.textContent=days>0?days.toLocaleString('en-US')+' days left':'Date passed';
  });
  // contact form: Web3Forms via fetch, mailto fallback until a key is configured
  var f=d.getElementById('contact-form');
  if(f){f.addEventListener('submit',function(e){
    e.preventDefault();
    var s=f.querySelector('.form-status'),key=f.querySelector('[name=access_key]').value,fd=new FormData(f),to=f.getAttribute('data-mailto');
    if(fd.get('botcheck'))return;
    if(!key||key.indexOf('YOUR_')===0){
      var body='Name: '+fd.get('name')+'\nEmail: '+fd.get('email')+'\nCompany: '+fd.get('company')+'\nTopic: '+fd.get('interest')+'\nDeadline: '+fd.get('deadline')+'\n\n'+fd.get('message');
      location.href='mailto:'+to+'?subject='+encodeURIComponent('Deadline check request: '+(fd.get('company')||fd.get('name')))+'&body='+encodeURIComponent(body);
      s.textContent='Opening your email app to send the request.';return;
    }
    s.textContent='Sending\u2026';
    fetch(f.action,{method:'POST',headers:{Accept:'application/json'},body:fd})
      .then(function(r){return r.json();})
      .then(function(j){if(j.success){location.href=f.getAttribute('data-thanks');}else{throw 0;}})
      .catch(function(){s.innerHTML='Something went wrong. Please email <a href="mailto:'+to+'">'+to+'</a>.';});
  });}
})();
