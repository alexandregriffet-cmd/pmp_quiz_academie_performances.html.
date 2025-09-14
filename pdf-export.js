// -*- coding: utf-8 -*-
// Export PDF auto (jsPDF + html2canvas)
(function(){
  function q(sel){return document.querySelector(sel);}
  async function addBlock(el, doc, x=15, y=15, maxW=180){
    if (!el) return;
    const canvas = await html2canvas(el, {scale:2, useCORS:true});
    const img = canvas.toDataURL('image/jpeg','1.0');
    doc.addImage(img,'JPEG',x,y,maxW,0);
  }
  async function exportPDF(){
    const { jsPDF } = window.jspdf;
    if(typeof window.computeScores==='function'){window.computeScores();}
    const pid=(q('#pid')?.value)||'anonyme';
    const ctx=(q('#context')?.value)||'';
    const date=(q('#pdate')?.value)||'';
    const doc=new jsPDF('p','mm','a4');
    await addBlock(q('#bandeau'),doc,15,10,180);
    doc.setFontSize(18);doc.text('PMP — Profil Mental de Performance',15,70);
    doc.setFontSize(12);
    doc.text('Participant : '+pid,15,86);
    doc.text('Contexte : '+ctx,15,94);
    doc.text('Date : '+date,15,102);
    if(q('#results')){doc.addPage();await addBlock(q('#results'),doc,15,15,180);}
    if(q('#profiles16')){doc.addPage();await addBlock(q('#profiles16'),doc,15,15,180);}
    if(q('#details')){doc.addPage();await addBlock(q('#details'),doc,15,15,180);}
    doc.save('PMP_profil_resultats_'+pid+'_'+date+'.pdf');
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const btn=q('#exportPdf');
    if(btn) btn.addEventListener('click',exportPDF);
  });
})();
