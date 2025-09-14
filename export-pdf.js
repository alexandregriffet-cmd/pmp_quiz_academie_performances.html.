
// -*- coding: utf-8 -*-
(function(){
  function getProfileCode(){
    // Try to infer from filename first (e.g., /profils/IGVF.html)
    try{
      var path = (location.pathname || "").toUpperCase();
      var file = path.split('/').pop() || "";
      var code = file.replace(/\..*$/,'').toUpperCase();
      if (/^[IE][CG][LV][PF]$/.test(code)) return code;
    }catch(e){}
    // Fallback: scan title or h1
    var re = /\b[IE][CG][LV][PF]\b/;
    var title = (document.title || "").toUpperCase();
    var m = title.match(re);
    if (m) return m[0];
    var h1 = document.querySelector('h1');
    if (h1){
      var t = (h1.textContent||"").toUpperCase();
      m = t.match(re);
      if (m) return m[0];
    }
    return "PMP";
  }

  function isProfilePage(){
    // New rule: any page whose path contains /profils/ is a profile page
    var path = (location.pathname || "").toLowerCase();
    if (path.indexOf("/profils/") !== -1) return true;
    // Also allow manual opt-in via <meta name="pmp-profile" content="true">
    var meta = document.querySelector('meta[name="pmp-profile"][content="true"]');
    if (meta) return true;
    // Legacy fallback: detect 4-letter code in title/h1
    var re = /\b[IE][CG][LV][PF]\b/;
    var title = (document.title || "").toUpperCase();
    if (re.test(title)) return true;
    var h1 = document.querySelector('h1');
    if (h1 && re.test((h1.textContent||"").toUpperCase())) return true;
    return false;
  }

  function ensureStyle(){
    var css = [
      ".pmp-export-btn{position:fixed;right:16px;top:16px;z-index:9999;",
      "border:1px solid #2e3748;background:#0b1220;color:#e5e7eb;",
      "padding:10px 14px;border-radius:10px;cursor:pointer}",
      "@media print { .pmp-export-btn{display:none!important} }"
    ].join("");
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }

  async function exportPdf(profileCode){
    if (!window.jspdf || !window.html2canvas){ alert("PDF engine non chargé."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');

    // Cover: try to capture a logo/banner
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

    // Participant/context/date if present
    function pick(sel){ const el=document.querySelector(sel); return el ? (el.value || el.textContent || "").trim() : ""; }
    let participant = pick('#pid, .participant, [name="participant"]') || "anonyme";
    let ctx = pick('#context, .context, [name="context"]');
    let date = pick('#pdate, .date, [name="date"]');
    if (!date){
      const d = new Date(); date = d.toISOString().slice(0,10);
    }
    doc.setFontSize(12);
    doc.text("Participant : " + participant, 15, 92);
    if (ctx) doc.text("Contexte : " + ctx, 15, 100);
    doc.text("Date : " + date, 15, 108);

    // Report content
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
    if (!isProfilePage()) return;
    const code = getProfileCode();
    addButton(code);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
