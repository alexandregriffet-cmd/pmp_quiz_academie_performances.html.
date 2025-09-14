
(function(){
  function pct(v){return Math.max(0,Math.min(100,Math.round(v)));}
  function getCode(){
    var f=(location.pathname||"").split('/').pop()||"";
    var c=f.replace(/\..*$/,'').toUpperCase();
    if (/^[IE][CG][LV][PF]$/.test(c)) return c;
    var m=(document.title||"").toUpperCase().match(/\b[IE][CG][LV][PF]\b/);
    return m?m[0]:"";
  }
  function fromURL(){
    const p=new URLSearchParams(location.search);
    return [p.get('a0'),p.get('a1'),p.get('a2'),p.get('a3')].map(x=>x?Number(x):null);
  }
  function fromStore(code){
    try{
      const raw=localStorage.getItem('pmp_last_bars'); if(!raw) return null;
      const obj=JSON.parse(raw)||{}; if (code && obj.code && obj.code!==code) return null;
      return obj.a;
    }catch(e){return null;}
  }
  function letters(i){return [['I','E'],['C','G'],['L','V'],['P','F']][i];}
  function styleOnce(){
    if(document.getElementById('pmp-ax-style'))return;
    const s=document.createElement('style'); s.id='pmp-ax-style';
    s.textContent=`
      .pmp-bars{margin:16px 0 8px 0}
      .pmp-ax{margin:12px 0}
      .pmp-ax-head,.pmp-ax-foot{display:flex;justify-content:space-between;font-weight:600}
      .pmp-ax-track{position:relative;height:12px;border-radius:999px;background:#1f2937;border:1px solid #334155;overflow:hidden}
      .pmp-ax-fill{position:absolute;left:0;top:0;bottom:0;background:#22c55e}
      .pmp-ax-marker{position:absolute;top:-4px;width:2px;height:20px;background:#e5e7eb}
      @media print{.pmp-ax-marker{display:none}}
    `; document.head.appendChild(s);
  }
  function bar(i,pctRight){
    const [L,R]=letters(i);
    const d=document.createElement('div'); d.className='pmp-ax';
    d.innerHTML=`
      <div class="pmp-ax-head"><span>${L}</span><span>${R}</span></div>
      <div class="pmp-ax-track"><div class="pmp-ax-fill" style="width:${pct(pctRight)}%"></div><div class="pmp-ax-marker" style="left:${pct(pctRight)}%"></div></div>
      <div class="pmp-ax-foot"><span>${100-pct(pctRight)}%</span><span>${pct(pctRight)}%</span></div>
    `;
    return d;
  }
  function mount(){
    const code=getCode();
    let a=fromURL();
    if(!a.filter(x=>typeof x==='number'&&!isNaN(x)).length){
      const st=fromStore(code); if(st) a=st;
    }
    if(!a||!a.filter(x=>typeof x==='number'&&!isNaN(x)).length) return;
    styleOnce();
    const root=document.getElementById('pmp-axis-bars')||(function(){
      const d=document.createElement('div'); d.id='pmp-axis-bars';
      const rep=document.querySelector('#report')||document.body; rep.insertBefore(d, rep.firstChild); return d;
    })();
    root.className='pmp-bars';
    a.forEach((p,i)=>{ if(p!=null&&!isNaN(p)) root.appendChild(bar(i,p)); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
