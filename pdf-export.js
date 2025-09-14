
// PMP PDF Export Add-on (keeps your v5.5 layout untouched)
// Loads jsPDF + html2canvas and exports a multi-page PDF with cover (logo + participant + date + contexte),
// then results (scores + radar), then detail (items, profiles, etc.).

// -------- Loader for dependencies --------
(function(){
  function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  function ready(){ return Promise.resolve(); }

  // expose init after DOM ready
  function init(){
    // Detect key elements without forcing changes to your HTML
    var banner = document.querySelector('#bandeau, .banner, header .logo, .header .logo, .header img, .banner img') || document.body;
    var pidInput = document.querySelector('#pid, input[name="participant"], input[name="identifiant"], input[data-role="participant"]');
    var ctxInput = document.querySelector('#context, select[name="contexte"], select[data-role="context"]');
    var dateInput = document.querySelector('#pdate, input[type="date"], input[name="date"], input[data-role="date"]');
    var resultsEl = document.querySelector('#results, #scores, #resume, section.results, .results');
    var profilesEl = document.querySelector('#profiles16, #profils16, .profiles16, .profils16'); // 16 profils détaillés
    var detailEl = document.querySelector('#details, #detail, #itemsDetail, #itemsTable, section.detail, .detail');

    // Add click handler to existing Export PDF button if present, else create one near other actions
    var btn = document.getElementById('exportPdf');
    if(!btn){
      var actions = document.querySelector('.actions, #actions, .toolbar, .controls') || document.body;
      btn = document.createElement('button');
      btn.id = 'exportPdf';
      btn.className = 'btn';
      btn.textContent = 'Exporter PDF';
      actions.appendChild(btn);
    }

    btn.addEventListener('click', async function(){
      try{
        // Compute scores if your page exposes compute/update API
        if (typeof computeScores === 'function') {
          var r = computeScores();
          if (r && typeof updateUI === 'function') updateUI(r);
        }

        // Load deps
        if (!window.html2canvas) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        const { jsPDF } = window.jspdf;

        const pid = (pidInput && pidInput.value) ? pidInput.value : 'anonyme';
        const ctx = (ctxInput && (ctxInput.value || (ctxInput.options && ctxInput.options[ctxInput.selectedIndex].text))) || '';
        const date = (dateInput && dateInput.value) || '';

        const doc = new jsPDF('p','mm','a4');

        // --- Page 1: Cover ---
        if (banner){
          const canvas = await html2canvas(banner, {scale:2, useCORS:true});
          const imgData = canvas.toDataURL('image/jpeg','1.0');
          // Fit banner to width 180mm max
          doc.addImage(imgData,'JPEG',15,10,180,0);
        }
        doc.setFontSize(18);
        doc.text('PMP — Profil Mental de Performance', 15, 70);
        doc.setFontSize(12);
        doc.text('Participant : ' + pid, 15, 86);
        doc.text('Contexte : ' + ctx, 15, 94);
        doc.text('Date : ' + date, 15, 102);
        doc.addPage();

        // --- Page 2: Results + Radar ---
        if (resultsEl){
          const canvas2 = await html2canvas(resultsEl, {scale:2, useCORS:true});
          const img2 = canvas2.toDataURL('image/jpeg','1.0');
          // Fit within margins
          const pageW = 210 - 20*2; // 170mm
          const ratio = (pageW*3) / canvas2.width; // dynamic height scaling
          doc.addImage(img2, 'JPEG', 20, 20, pageW, 0);
        }

        // Include 16 profiles block if present
        if (profilesEl){
          doc.addPage();
          const canvasP = await html2canvas(profilesEl, {scale:2, useCORS:true});
          const imgP = canvasP.toDataURL('image/jpeg','1.0');
          const pageW = 210 - 20*2;
          doc.addImage(imgP,'JPEG',20,20,pageW,0);
        }

        // --- Page 3+: Details ---
        if (detailEl){
          doc.addPage();
          const canvas3 = await html2canvas(detailEl, {scale:2, useCORS:true});
          const img3 = canvas3.toDataURL('image/jpeg','1.0');
          const pageW = 210 - 15*2;
          doc.addImage(img3, 'JPEG', 15, 15, pageW, 0);
        }

        doc.save('PMP_profil_resultats_' + pid + '_' + date + '.pdf');
      }catch(err){
        alert('Export PDF: ' + err.message);
        console.error(err);
      }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(init, 0);
  }else{
    document.addEventListener('DOMContentLoaded', init);
  }
})();
