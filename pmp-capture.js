
// -*- coding: utf-8 -*-
// Universal capture: works with BANK+answers (question par question) OR q1..q48 radios.
(function(){
  function readFromBank(){
    try{
      const items = (window.BANK && Array.isArray(window.BANK.items)) ? window.BANK.items : null;
      const answers = window.answers || window.ANSWERS || window.userAnswers || null;
      if (!items || !answers || answers.length !== items.length) return null;
      const axes = window.BANK.axes || [
        {left:'I',right:'E'},
        {left:'C',right:'G'},
        {left:'L',right:'V'},
        {left:'P',right:'F'},
      ];
      let scores=[0,0,0,0], counts=[0,0,0,0];
      items.forEach((it, i)=>{
        const v=(answers[i]||3)-3;
        scores[it.axis] += (it.polarity||1)*v;
        counts[it.axis]++;
      });
      const rightPct = scores.map((S,i)=>{
        const n=counts[i]||1;
        let p = ((S + 2*n) / (4*n)) * 100;
        p=Math.max(0,Math.min(100,Math.round(p)));
        if (p===50) p = (S>=0) ? 51 : 49;
        return p;
      });
      const code = scores.map((S,i)=> S>=0 ? axes[i].right : axes[i].left).join('');
      return {rightPct, code};
    }catch(e){ return null; }
  }
  function readRadios(){
    let arr=[];
    for(let i=1;i<=48;i++){
      const name='q'+i;
      const checked=document.querySelector('input[type="radio"][name="'+name+'"]:checked');
      if(checked) arr.push(parseInt(checked.value,10)); else arr.push(null);
    }
    // If all nulls, bail
    if (!arr.some(v=>typeof v==='number')) return null;
    // Build default mapping (12 per axis, alt polarity)
    const map=[]; for(let i=0;i<48;i++){ map.push({axis:Math.floor(i/12), polarity:(i%2===0)?+1:-1}); }
    const axes=[{left:'I',right:'E'},{left:'C',right:'G'},{left:'L',right:'V'},{left:'P',right:'F'}];
    let scores=[0,0,0,0], counts=[0,0,0,0];
    for(let i=0;i<48;i++){
      const v=arr[i];
      if (typeof v!=='number') continue;
      const d=v-3;
      const ax=map[i].axis, pol=map[i].polarity;
      scores[ax]+=pol*d; counts[ax]++;
    }
    const rightPct=scores.map((S,i)=>{
      const n=counts[i]||1; let p=((S+2*n)/(4*n))*100; p=Math.max(0,Math.min(100,Math.round(p))); if(p===50) p=(S>=0)?51:49; return p;
    });
    const code=scores.map((S,i)=> S>=0?axes[i].right:axes[i].left).join('');
    return {rightPct, code};
  }
  function compute(){
    return readFromBank() || readRadios();
  }
  function persist(res){
    if(!res) return;
    try{ localStorage.setItem('pmp_last_bars', JSON.stringify({code:res.code,a:res.rightPct,ts:Date.now()})); }catch(e){}
  }
  function attach(){
    const link = document.getElementById('linkProfil') || document.querySelector('a[href*="/profils/"]');
    if (!link) return;
    link.addEventListener('click', function(){
      try{
        const res = compute();
        if (res){
          persist(res);
          const u = new URL(link.href, location.origin);
          u.searchParams.set('code', res.code);
          res.rightPct.forEach((p,i)=> u.searchParams.set('a'+i,p));
          link.href = u.toString();
          console.log('[PMP] bars attached to URL', u.toString());
        }else{
          console.warn('[PMP] impossible de calculer les barres (answers introuvables)');
        }
      }catch(e){ console.warn('[PMP] capture error', e); }
    }, {once:true});
    // live store on change
    document.addEventListener('change', function(e){
      if (e.target && (e.target.matches('input[type="radio"][name^="q"]') || e.target.closest('[data-q]'))){
        const res=compute(); persist(res);
      }
    });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
