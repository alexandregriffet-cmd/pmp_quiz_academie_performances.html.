
// -*- coding: utf-8 -*-
// Captures questionnaire answers and computes a0..a3 percentages for MBTI-like bars.
// Default mapping assumes 48 questions -> 4 axes * 12 questions each, alternating polarity.
// You can override mapping by defining window.PMP_AXIS_MAP = [{axis:0,polarity:+1}, ... length 48]
(function(){
  function detectQuestionInputs(){
    return Array.from(document.querySelectorAll('input[type="radio"][name^="q"]'));
  }
  function readAnswers(){
    // read q1..q48 values (1..5). If multiple per qX, take the checked one.
    let answers = [];
    for (let i=1;i<=48;i++){
      const name='q'+i;
      const checked = document.querySelector('input[type="radio"][name="'+name+'"]:checked');
      if (checked) answers.push(parseInt(checked.value,10));
      else{
        // try data-answer attributes for custom UIs
        const el = document.querySelector('[data-answer="'+name+'"].selected,[data-q="'+name+'"].active');
        if (el && el.dataset && el.dataset.value) answers.push(parseInt(el.dataset.value,10));
        else answers.push(null);
      }
    }
    return answers;
  }
  function defaultMap(){
    // 48 items: 12 per axis, alternating polarity +1, -1, +1, -1...
    const map=[];
    for (let i=0;i<48;i++){
      const axis = Math.floor(i/12); // 0..3
      const polarity = (i%2===0)? +1 : -1;
      map.push({axis, polarity});
    }
    return map;
  }
  function computeBars(answers, map, axesDef){
    const A = map || (window.PMP_AXIS_MAP || defaultMap());
    const axes = axesDef || [
      {left:'I',right:'E'},
      {left:'C',right:'G'},
      {left:'L',right:'V'},
      {left:'P',right:'F'},
    ];
    let scores=[0,0,0,0], counts=[0,0,0,0];
    for (let i=0;i<A.length && i<answers.length;i++){
      const v = answers[i];
      if (typeof v!=='number' || isNaN(v)) continue;
      const delta = v - 3; // center at 0
      const ax = A[i].axis;
      const pol = A[i].polarity || 1;
      scores[ax] += pol*delta;
      counts[ax]++;
    }
    // convert score to right-side %
    const rightPct = scores.map((S,i)=>{
      const n = counts[i]||1;
      let p = ((S + 2*n) / (4*n)) * 100; // shift/scale to 0..100
      p = Math.max(0, Math.min(100, Math.round(p)));
      // Avoid 50/50
      if (p === 50){
        const right = (S>=0);
        p = right ? 51 : 49;
      }
      return p;
    });
    const code = scores.map((S,i)=> S>=0 ? axes[i].right : axes[i].left).join('');
    return {rightPct, code};
  }
  function attach(){
    // Hook on the link to profile (id=linkProfil), store to localStorage and append params
    const link = document.getElementById('linkProfil') || document.querySelector('a[href*="/profils/"]');
    if (!link) return;
    link.addEventListener('click', function(ev){
      try{
        const answers = readAnswers();
        const res = computeBars(answers);
        // persist
        localStorage.setItem('pmp_last_bars', JSON.stringify({code:res.code, a:res.rightPct, ts:Date.now()}));
        // append to URL
        const u = new URL(link.href, location.origin);
        u.searchParams.set('code', res.code);
        res.rightPct.forEach((p,i)=> u.searchParams.set('a'+i, p));
        link.href = u.toString();
      }catch(e){ console.warn('[PMP] capture error', e); }
    }, {once:true});
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
  // optional: store continuously on change
  document.addEventListener('change', function(e){
    if (e.target && e.target.matches('input[type="radio"][name^="q"]')){
      try{
        const answers = readAnswers();
        const res = computeBars(answers);
        localStorage.setItem('pmp_last_bars', JSON.stringify({code:res.code, a:res.rightPct, ts:Date.now()}));
      }catch(e){}
    }
  });
})();
