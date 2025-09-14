
// -*- coding: utf-8 -*-
// Renders axis bars using URL params a0..a3 or localStorage('pmp_last_bars') if params missing.
(function(){
  function pct(val){ return Math.max(0, Math.min(100, Math.round(val))); }
  function getProfileCode(){
    try{
      var file = (location.pathname||"").split('/').pop()||"";
      var code = file.replace(/\..*$/,'').toUpperCase();
      if (/^[IE][CG][LV][PF]$/.test(code)) return code;
    }catch(e){}
    var t=(document.title||"").toUpperCase();
    var m=t.match(/\b[IE][CG][LV][PF]\b/); if (m) return m[0];
    return "";
  }
  function parseParams(){
    const p = new URLSearchParams(location.search);
    const a = [p.get('a0'), p.get('a1'), p.get('a2'), p.get('a3')].map(x => x? Number(x): null);
    const code = (p.get('code')||'').toUpperCase();
    return { a, code };
  }
  function readFromStorage(code){
    try{
      const raw = localStorage.getItem('pmp_last_bars');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.a || !obj.code) return null;
      if (code && obj.code && obj.code !== code) return null;
      return obj;
    }catch(e){ return null; }
  }
  function lettersForAxis(i){
    return [['I','E'],['C','G'],['L','V'],['P','F']][i];
  }
  function createBar(i, rightPct){
    const [L, R] = lettersForAxis(i);
    const wrap = document.createElement('div');
    wrap.className = 'pmp-ax';
    wrap.innerHTML = `
      <div class="pmp-ax-head"><span class="l">${L}</span><span class="r">${R}</span></div>
      <div class="pmp-ax-track">
        <div class="pmp-ax-fill" style="width:${pct(rightPct)}%"></div>
        <div class="pmp-ax-marker" style="left:${pct(rightPct)}%"></div>
      </div>
      <div class="pmp-ax-foot"><span>${100-pct(rightPct)}%</span><span>${pct(rightPct)}%</span></div>
    `;
    return wrap;
  }
  function ensureStyle(){
    if (document.getElementById('pmp-ax-style')) return;
    const s = document.createElement('style');
    s.id = 'pmp-ax-style';
    s.textContent = `
      .pmp-bars{margin:12px 0 4px 0}
      .pmp-ax{margin:12px 0}
      .pmp-ax-head, .pmp-ax-foot{display:flex;justify-content:space-between;font-weight:600}
      .pmp-ax-track{position:relative;height:12px;border-radius:999px;background:#1f2937;border:1px solid #334155;overflow:hidden}
      .pmp-ax-fill{position:absolute;left:0;top:0;bottom:0;background:#22c55e}
      .pmp-ax-marker{position:absolute;top:-4px;width:2px;height:20px;background:#e5e7eb}
      @media print {.pmp-ax-marker{display:none}}
    `;
    document.head.appendChild(s);
  }
  function mount(){
    const code = getProfileCode();
    const params = parseParams();
    let a = params.a;
    if (!a.filter(x=>typeof x==='number' && !isNaN(x)).length){
      const st = readFromStorage(params.code || code);
      if (st && st.a && st.a.length===4) a = st.a;
    }
    if (!a || !a.filter(x=>typeof x==='number' && !isNaN(x)).length) return;

    ensureStyle();
    const root = document.getElementById('pmp-axis-bars') || (function(){
      const d = document.createElement('div'); d.id='pmp-axis-bars'; 
      const report = document.querySelector('#report') || document.body;
      report.insertBefore(d, report.firstChild);
      return d;
    })();
    root.className = 'pmp-bars';
    a.forEach((rpct,i)=>{
      if (rpct==null || isNaN(rpct)) return;
      root.appendChild(createBar(i, rpct));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
