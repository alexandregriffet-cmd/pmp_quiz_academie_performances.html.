
// -*- coding: utf-8 -*-
(function(){
  function isProfilePage(){
    var p=(location.pathname||"").toLowerCase();
    return p.indexOf("/profils/")!==-1 || !!document.querySelector('meta[name="pmp-profile"][content="true"]');
  }
  function getCode(){
    try{
      var f=(location.pathname||"").split('/').pop()||"";
      var c=f.replace(/\..*$/,'').toUpperCase();
      if (/^[IE][CG][LV][PF]$/.test(c)) return c;
    }catch(e){}
    var m=(document.title||"").toUpperCase().match(/\b[IE][CG][LV][PF]\b/);
    return m?m[0]:"PMP";
  }
  function ensureStyle(){
    var css = `
      .pmp-export-btn{position:fixed;right:16px;top:16px;z-index:9999;border:1px solid #2e3748;background:#0b1220;color:#e5e7eb;padding:10px 14px;border-radius:10px;cursor:pointer}
      @media print{.pmp-export-btn{display:none!important}}
      /* Hints for better page breaks */
      #report h2, #report h3, #report .section, #report p { break-inside: avoid; page-break-inside: avoid; }
    `;
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }
  function pick(sel){var el=document.querySelector(sel);return el?(el.value||el.textContent||"").trim():"";}

  function addPrintMode(){
    var css=`
      body.pmp-print, body.pmp-print *{background:#ffffff !important; box-shadow:none !important;}
      body.pmp-print .sticky{position:static !important; top:auto !important;}
      body.pmp-print .no-print{display:none !important;}
      body.pmp-print img{max-width:100% !important;}
    `;
    var s=document.createElement('style'); s.id='pmp-print-style'; s.textContent=css; document.head.appendChild(s);
    document.body.classList.add('pmp-print');
  }
  function removePrintMode(){
    var s=document.getElementById('pmp-print-style'); if (s) s.remove();
    document.body.classList.remove('pmp-print');
  }

  function waitImages(el){
    const imgs=Array.from(el.querySelectorAll('img'));
    return Promise.all(imgs.map(img=>{
      if (img.complete) return Promise.resolve();
      return new Promise(res=>{ img.onload=img.onerror=()=>res(); });
    }));
  }

  function cloneForRender(el){
    // Render in a fixed-width hidden container to stabilize pagination (A4 ~ 794px @96dpi)
    const wrap=document.createElement('div');
    wrap.style.position='fixed'; wrap.style.left='-99999px'; wrap.style.top='0'; wrap.style.width='794px';
    wrap.style.background='#fff'; wrap.style.padding='0 16px 32px 16px';
    wrap.appendChild(el.cloneNode(true));
    document.body.appendChild(wrap);
    return wrap;
  }

  async function elementCanvas(el){
    // Use clone to stabilize layout
    const tmp = cloneForRender(el);
    await waitImages(tmp);
    // small delay for fonts/layout
    await new Promise(r=>setTimeout(r,150));
    const canvas = await html2canvas(tmp, {scale:2, useCORS:true, windowWidth: 900, scrollY: 0});
    tmp.remove();
    return canvas;
  }

  async function getLogoDataURL(){
    const logoEl = document.querySelector('img[src*="logo"], img[src*="bandeau"], img[src*="header"], img[src*="assets"]');
    if (!logoEl) return null;
    try{
      const c = await html2canvas(logoEl, {scale:2, useCORS:true});
      return c.toDataURL('image/jpeg','1.0');
    }catch(e){ return null; }
  }

  async function capturePaged(doc, el, margins, headerImg){
    const pageW=doc.internal.pageSize.getWidth(), pageH=doc.internal.pageSize.getHeight();
    const headerH= headerImg ? 12 : 0;
    const imgW = pageW - (margins.left + margins.right);
    const canvas = await elementCanvas(el);
    const usableH = pageH - (margins.top + margins.bottom) - headerH - 2;
    const pxPerMm = canvas.width / imgW;
    const sliceHpx = Math.ceil(usableH * pxPerMm);
    let y=0, total=canvas.height;
    const slice=document.createElement('canvas'), ctx=slice.getContext('2d');
    slice.width=canvas.width;
    let first=true;
    while (y<total){
      const h=Math.min(sliceHpx, total - y);
      slice.height=h;
      ctx.clearRect(0,0,slice.width,slice.height);
      ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      const imgData=slice.toDataURL('image/jpeg','1.0');
      if (!first) doc.addPage();
      let yStart=margins.top;
      if (headerImg){
        const headerW=30;
        doc.addImage(headerImg,'JPEG', pageW - margins.right - headerW, margins.top, headerW, headerH);
        yStart += headerH + 2;
      }
      doc.addImage(imgData,'JPEG',margins.left,yStart,imgW,h/pxPerMm);
      y += h;
      first=false;
    }
  }

  async function exportPdf(){
    if (!window.jspdf||!window.html2canvas){ alert("PDF engine non chargé."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');
    const margins={left:10,right:10,top:10,bottom:10};

    addPrintMode();

    const logo=await getLogoDataURL();
    // cover
    if (logo){ doc.addImage(logo,'JPEG',15,10,180,0); }
    doc.setFontSize(18); doc.text("PMP — Rapport de profil",15,70);
    doc.setFontSize(16); doc.text(getCode(),15,80);
    const participant = pick('#pid,.participant,[name="participant"]')||"anonyme";
    const ctx = pick('#context,.context,[name="context"]');
    let date = pick('#pdate,.date,[name="date"]'); if(!date){ const d=new Date(); date=d.toISOString().slice(0,10); }
    doc.setFontSize(12); doc.text("Participant : "+participant,15,92);
    if (ctx) doc.text("Contexte : "+ctx,15,100);
    doc.text("Date : "+date,15,108);

    // content
    const report = document.querySelector('#report, main, .report, .content, .wrap, body');
    doc.addPage();
    await capturePaged(doc, report, margins, logo);

    removePrintMode();
    doc.save("PMP_"+getCode()+"_"+participant+"_"+date+".pdf");
  }

  function mount(){
    if (!isProfilePage()) return;
    ensureStyle();
    const btn=document.createElement('button');
    btn.className='pmp-export-btn'; btn.textContent='Exporter PDF';
    btn.addEventListener('click', exportPdf);
    document.body.appendChild(btn);
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
