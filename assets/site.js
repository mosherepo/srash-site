(function(){
  var t=document.querySelector('.nav-toggle'),n=document.getElementById('nav');
  if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o);t.setAttribute('aria-label',o?'Close menu':'Open menu');});}
  // live countdowns to support deadlines
  var now=new Date();
  document.querySelectorAll('[data-deadline]').forEach(function(el){
    var d=new Date(el.getAttribute('data-deadline')+'T23:59:59'),days=Math.ceil((d-now)/864e5);
    el.textContent=days>0?days+' days left':'Passed';
  });
  // contact form: Web3Forms via fetch, mailto fallback until a key is configured
  var f=document.getElementById('contact-form');
  if(f){f.addEventListener('submit',function(e){
    e.preventDefault();
    var s=f.querySelector('.form-status'),key=f.querySelector('[name=access_key]').value,fd=new FormData(f);
    if(fd.get('botcheck'))return;
    if(!key||key.indexOf('YOUR_')===0){
      var body='Name: '+fd.get('name')+'\nEmail: '+fd.get('email')+'\nCompany: '+fd.get('company')+'\nInterest: '+fd.get('interest')+'\n\n'+fd.get('message');
      location.href='mailto:'+f.getAttribute('data-mailto')+'?subject='+encodeURIComponent('Assessment request: '+(fd.get('company')||fd.get('name')))+'&body='+encodeURIComponent(body);
      s.textContent='Opening your email app to send the request.';return;
    }
    s.textContent='Sending\u2026';
    fetch(f.action,{method:'POST',headers:{Accept:'application/json'},body:fd})
      .then(function(r){return r.json();})
      .then(function(j){if(j.success){location.href='/srash-site/thanks/';}else{throw 0;}})
      .catch(function(){s.innerHTML='Something went wrong. Please email <a href="mailto:'+f.getAttribute('data-mailto')+'">'+f.getAttribute('data-mailto')+'</a>.';});
  });}
})();
