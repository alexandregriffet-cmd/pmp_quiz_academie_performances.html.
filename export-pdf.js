
// -*- coding: utf-8 -*-
(function(){
  function isProfilePage(){
    // Detect a 4-letter code pattern in <title> or first <h1>
    const re = /\b[IE][CG][LV][PF]\b/;
    const title = (document.title || "").toUpperCase();
    if (re.test(title)) return title.match(re)[0];
    const h1 = document.querySelector('h1');
    if (h1){
      const t = (h1.textContent||"").toUpperCase();
      if (re.test(t)) return t.match(re)[0];
    }
    return null;
  }

  function ensureStyle(){
    const css = `
    .pmp-export-btn{position:fixed;right:16px;top:16px;z-index:9999;border:1px solid #2e3748;background:#0b1220;color:#e5e7eb;padding:10px 14px;border-radius:10px;cursor:pointer}
    @media print { .pmp-export-btn{display:none!important} }
    `;
    const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }

  async function exportPdf(profileCode){
    if (!window.jspdf || !window.html2canvas){ alert("PDF engine non chargé."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');

    // Cover: logo + code + participant + date
    const logo = document.querySelector('img[src*="logo"], img[src*="bandeau"], img[src*="header"], img[src*="assets"]');
    if (logo){
      try{
        const canvas = await html2canvas(logo, {scale:2, useCORS:true});
        const img = canvas.toDataURL('image/jpeg','1.0');
        doc.addImage(img,'JPEG',15,10,180,0);
      }catch(e){ /* ignore */ }
    }
    doc.setFontSize(18); doc.text("PMP — Rapport de profil", 15, 70);
    doc.setFontSize(16); doc.text(profileCode, 15, 80);

    // Try to read participant + date from page if present
    function pick(sel){ const el=document.querySelector(sel); return el ? (el.value || el.textContent || "").trim() : ""; }
    let participant = pick('#pid, .participant, [name="participant"]') || "anonyme";
    let ctx = pick('#context, .context, [name="context"]');
    let date = pick('#pdate, .date, [name="date"]');
    if (!date){
      // fallback: today's date in ISO
      const d = new Date(); date = d.toISOString().slice(0,10);
    }
    doc.setFontSize(12);
    doc.text("Participant : " + participant, 15, 92);
    if (ctx) doc.text("Contexte : " + ctx, 15, 100);
    doc.text("Date : " + date, 15, 108);

    // Capture report content
    const report = document.querySelector('#report, main, .report, .content, .wrap, body');
    const canvas = await html2canvas(report, {scale:2, useCORS:true, windowWidth: document.documentElement.scrollWidth});
    const img = canvas.toDataURL('image/jpeg','1.0');
    doc.addPage();
    doc.addImage(img,'JPEG',10,10,190,0);

    doc.save("PMP_"+profileCode+"_"+participant+"_"+date+".pdf");
  }

  function addButton(profileCode){
    ensureStyle();
    const btn = document.createElement('button');
    btn.className = 'pmp-export-btn';
    btn.textContent = 'Exporter PDF';
    btn.addEventListener('click', ()=>exportPdf(profileCode));
    document.body.appendChild(btn);
  }

  function onReady(){
    const profileCode = isProfilePage();
    if (!profileCode) return;
    addButton(profileCode);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
