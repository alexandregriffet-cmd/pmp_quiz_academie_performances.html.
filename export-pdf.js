
// -*- coding: utf-8 -*-
(function(){
  function isProfilePage(){
    var path = (location.pathname || "").toLowerCase();
    if (path.indexOf("/profils/") !== -1) return true;
    var meta = document.querySelector('meta[name="pmp-profile"][content="true"]');
    if (meta) return true;
    return false;
  }
  function getProfileCode(){
    try{
      var file = (location.pathname || "").split('/').pop() || "";
      var code = file.replace(/\..*$/,'').toUpperCase();
      if (/^[IE][CG][LV][PF]$/.test(code)) return code;
    }catch(e){}
    var re = /\b[IE][CG][LV][PF]\b/;
    var title = (document.title||"").toUpperCase();
    var m = title.match(re); if (m) return m[0];
    var h1 = document.querySelector('h1');
    if (h1){ var t=(h1.textContent||"").toUpperCase(); m = t.match(re); if (m) return m[0]; }
    return "PMP";
  }
  function ensureStyle(){
    var css = [
      ".pmp-export-btn{position:fixed;right:16px;top:16px;z-index:9999;",
      "border:1px solid #2e3748;background:#0b1220;color:#e5e7eb;",
      "padding:10px 14px;border-radius:10px;cursor:pointer}",
      "@media print{.pmp-export-btn{display:none!important}}"
    ].join("");
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }
  function pick(sel){ var el=document.querySelector(sel); return el ? (el.value||el.textContent||"").trim() : ""; }
  async function captureElementToPagedPdf(doc, el, margins){
    const canvas = await html2canvas(el, {scale:2, useCORS:true, windowWidth: document.documentElement.scrollWidth});
    const imgWidth = doc.internal.pageSize.getWidth() - (margins.left + margins.right);
    const pageHeight = doc.internal.pageSize.getHeight() - (margins.top + margins.bottom);
    const pxPerMm = canvas.width / imgWidth;
    const sliceHeightPx = Math.floor(pageHeight * pxPerMm);
    let y = 0, total = canvas.height;
    const sliceCanvas = document.createElement('canvas');
    const sliceCtx = sliceCanvas.getContext('2d');
    sliceCanvas.width = canvas.width;
    let first = true;
    while (y < total){
      const h = Math.min(sliceHeightPx, total - y);
      sliceCanvas.height = h;
      sliceCtx.clearRect(0,0,sliceCanvas.width,sliceCanvas.height);
      sliceCtx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      const imgData = sliceCanvas.toDataURL('image/jpeg','1.0');
      if (!first) doc.addPage();
      doc.addImage(imgData, 'JPEG', margins.left, margins.top, imgWidth, h/pxPerMm);
      y += h; first = false;
    }
  }
  async function exportPdf(profileCode){
    if (!window.jspdf || !window.html2canvas){ alert("PDF engine non chargé."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');
    const margins = {left:10,right:10,top:10,bottom:10};

    // Cover
    const logo = document.querySelector('img[src*="logo"], img[src*="bandeau"], img[src*="header"], img[src*="assets"]');
    if (logo){
      try{
        const c = await html2canvas(logo, {scale:2, useCORS:true});
        const img = c.toDataURL('image/jpeg','1.0');
        doc.addImage(img,'JPEG',15,10,180,0);
      }catch(e){}
    }
    doc.setFontSize(18); doc.text("PMP — Rapport de profil", 15, 70);
    doc.setFontSize(16); doc.text(profileCode, 15, 80);
    const participant = pick('#pid, .participant, [name="participant"]') || "anonyme";
    const ctx = pick('#context, .context, [name="context"]');
    let date = pick('#pdate, .date, [name="date"]');
    if (!date){ const d=new Date(); date=d.toISOString().slice(0,10); }
    doc.setFontSize(12);
    doc.text("Participant : " + participant, 15, 92);
    if (ctx) doc.text("Contexte : " + ctx, 15, 100);
    doc.text("Date : " + date, 15, 108);

    // Report (paged)
    const report = document.querySelector('#report, main, .report, .content, .wrap, body');
    doc.addPage();
    await captureElementToPagedPdf(doc, report, margins);

    doc.save("PMP_"+profileCode+"_"+participant+"_"+date+".pdf");
  }
  function addButton(profileCode){
    ensureStyle();
    const btn = document.createElement('button');
    btn.className='pmp-export-btn';
    btn.textContent='Exporter PDF';
    btn.addEventListener('click', ()=>exportPdf(profileCode));
    document.body.appendChild(btn);
  }
  function onReady(){
    var path = (location.pathname||'').toLowerCase();
    if (path.indexOf('/profils/') === -1) return; // only on profile pages
    addButton(getProfileCode());
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();
})();
