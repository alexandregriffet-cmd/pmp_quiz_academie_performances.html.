
// -*- coding: utf-8 -*-
// PMP axis bars renderer for profile pages using URL params a0..a3
(function(){
  function pct(val){ return Math.max(0, Math.min(100, Math.round(val))); }
  function parseParams(){
    const p = new URLSearchParams(location.search);
    const a = [p.get('a0'), p.get('a1'), p.get('a2'), p.get('a3')].map(x => x? Number(x): null);
    const code = (p.get('code')||'').toUpperCase();
    return { a, code };
  }
  function lettersForAxis(i){
    const pairs = [['I','E'],['C','G'],['L','V'],['P','F']];
    return pairs[i];
  }
  function createBar(i, rightPct){
    const [L, R] = lettersForAxis(i);
    const container = document.createElement('div');
    container.className = 'pmp-ax';
    container.innerHTML = `
      <div class="pmp-ax-head"><span class="l">${L}</span><span class="r">${R}</span></div>
      <div class="pmp-ax-track">
        <div class="pmp-ax-fill" style="width:${pct(rightPct)}%"></div>
        <div class="pmp-ax-marker" style="left:${pct(rightPct)}%"></div>
      </div>
      <div class="pmp-ax-foot"><span>${100-pct(rightPct)}%</span><span>${pct(rightPct)}%</span></div>
    `;
    return container;
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
    const root = document.getElementById('pmp-axis-bars') || (function(){
      const d = document.createElement('div'); d.id='pmp-axis-bars'; 
      const report = document.querySelector('#report') || document.body;
      report.insertBefore(d, report.firstChild);
      return d;
    })();
    root.className = 'pmp-bars';
    ensureStyle();
    const { a } = parseParams();
    if (!a.filter(x=>typeof x==='number' && !isNaN(x)).length) return;
    a.forEach((rpct,i)=>{
      if (rpct==null || isNaN(rpct)) return;
      root.appendChild(createBar(i, rpct));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
