
// Axes PMP
const AXES = {
  "NRJ": [
    "Je recharge mon énergie plutôt en étant seul qu'avec un groupe.",
    "Je préfère des conversations en tête-à-tête plutôt que de grands débats.",
    "Je parle après avoir réfléchi longuement.",
    "Les fêtes bruyantes me fatiguent plus qu'elles ne m'enthousiasment.",
    "Je garde souvent mes idées pour moi avant de les partager.",
    "Je préfère écrire un message plutôt que passer un coup de fil.",
    "Je passe beaucoup de temps à l'intérieur de mes pensées.",
    "Je choisis des activités calmes plutôt que très stimulantes.",
    "Je suis sélectif dans mes relations sociales.",
    "On me décrit souvent comme réservé.",
    "Je réfléchis avant d'agir spontanément.",
    "Les interactions sociales prolongées m'épuisent.",
    "Je préfère écouter plutôt que parler en groupe.",
    "Je me sens à l'aise dans des environnements peu stimulants.",
    "Je travaille mieux seul que dans des équipes nombreuses."
  ],
  "Vision": [
    "Je me fie d'abord aux faits concrets plutôt qu'aux possibilités.",
    "Je préfère des instructions détaillées et précises.",
    "J'apprécie les exemples concrets plus que les théories.",
    "Je me concentre sur le présent plutôt que sur l'avenir lointain.",
    "Je remarque les détails pratiques rapidement.",
    "Je préfère des méthodes éprouvées aux approches nouvelles.",
    "Je fais confiance à ce que je peux observer directement.",
    "Je privilégie l'expérience vécue aux spéculations.",
    "Je procède étape par étape plutôt que par grands sauts.",
    "Je préfère des solutions réalistes aux idées abstraites.",
    "Je suis sensible aux faits mesurables.",
    "Je décris les choses telles qu'elles sont, pas comme elles pourraient être.",
    "Je cherche des données tangibles avant de décider.",
    "Je m'intéresse d'abord au 'comment' plutôt qu'au 'et si'.",
    "Je privilégie la précision et la fiabilité des informations."
  ],
  "Décision": [
    "Je base mes décisions sur la logique plutôt que sur l'impact émotionnel.",
    "Je valorise la cohérence plus que l'harmonie.",
    "Je préfère des critères objectifs aux impressions subjectives.",
    "Je dis les choses franchement, même si cela peut gêner.",
    "Je cherche ce qui est juste, pas nécessairement ce qui fait plaisir.",
    "Je critique pour améliorer, pas pour blesser.",
    "Je suis à l'aise avec le débat et la confrontation d'idées.",
    "Je prends de la distance pour analyser un problème.",
    "Je défends la logique même sous pression émotionnelle.",
    "Je tranche selon des principes, pas selon les personnes.",
    "Je privilégie l'efficacité à la délicatesse dans l'urgence.",
    "Je me demande d'abord si c'est rationnel, ensuite si c'est agréable.",
    "Je structure ma pensée avant d'écouter mes ressentis.",
    "Je valorise la vérité plutôt que l'approbation.",
    "Je préfère des feedbacks directs et précis."
  ],
  "Organisation": [
    "J'aime planifier et décider tôt plutôt que garder toutes les options ouvertes.",
    "Je me sens mieux avec des listes et des échéances claires.",
    "Je préfère clore un sujet plutôt que le laisser en suspens.",
    "Je suis ponctuel et respecte les délais.",
    "Je décompose les projets en étapes planifiées.",
    "J'aime quand les choses sont organisées et prévisibles.",
    "Je prépare à l'avance plutôt que d'improviser.",
    "Je préfère suivre un plan plutôt que saisir les opportunités au vol.",
    "Je range pour mieux me concentrer.",
    "Je fixe des objectifs et j'en fais le suivi.",
    "J'apprécie les procédures établies.",
    "Je décide rapidement pour avancer.",
    "Je clarifie qui fait quoi et quand.",
    "Je n'aime pas laisser traîner les décisions.",
    "Je préfère des routines stables."
  ]
};

// Constituer la banque et mélanger
let QUESTIONS = [];
Object.entries(AXES).forEach(([axis, arr]) => {
  arr.forEach((q, i) => QUESTIONS.push({axis, q, id: axis + "_" + (i+1)}));
});
for (let i = QUESTIONS.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [QUESTIONS[i], QUESTIONS[j]] = [QUESTIONS[j], QUESTIONS[i]];
}

let idx = 0;
const answers = {};

function render(){
  const total = QUESTIONS.length;
  const bar = document.getElementById('bar');
  if(bar) bar.style.width = (idx*100/total)+'%';
  const screen = document.getElementById('screen');
  if(!screen){ console.error("Élément #screen introuvable"); return; }
  screen.innerHTML='';

  if(idx >= total){
    const scores = {NRJ:{pos:0,neg:0}, Vision:{pos:0,neg:0}, Décision:{pos:0,neg:0}, Organisation:{pos:0,neg:0}};
    QUESTIONS.forEach(it => {
      const v = answers[it.id]; if(v==null) return;
      const s = v-3;
      if(s>0) scores[it.axis].pos += s; else if(s<0) scores[it.axis].neg += -s;
    });
    const code = [
      scores.NRJ.pos >= scores.NRJ.neg ? 'I':'E',
      scores.Vision.pos >= scores.Vision.neg ? 'C':'G',
      scores.Décision.pos >= scores.Décision.neg ? 'L':'V',
      scores.Organisation.pos >= scores.Organisation.neg ? 'P':'F'
    ].join('');
    screen.innerHTML = `<h2>Résultat</h2><p>Votre code PMP : <strong>${code}</strong>. Redirection vers votre rapport détaillé…</p>`;
    const known = ["ICLP","ICLF","ICVP","ICVF","IGLP","IGLF","IGVP","IGVF","ECLP","ECLF","ECVP","ECVF","EGLP","EGLF","EGVP","EGVF"];
    const target = known.includes(code) ? \`profils/\${code}.html\` : "index.html";
    setTimeout(()=>{ window.location.href = target; }, 900);
    return;
  }

  const it = QUESTIONS[idx];
  const q = document.createElement('div'); q.className='q'; q.textContent = it.q; screen.appendChild(q);
  const scale = document.createElement('div'); scale.className='scale';
  for(let v=1; v<=5; v++){ const lab=document.createElement('label'); const inp=document.createElement('input');
    inp.type='radio'; inp.name='ans'; inp.value=v; lab.appendChild(inp); lab.appendChild(document.createTextNode(' '+v)); scale.appendChild(lab); }
  screen.appendChild(scale);

  const btns = document.createElement('div'); btns.className='btns';
  const next=document.createElement('button'); next.className='btn'; next.textContent=(idx===total-1)?'Voir mon résultat':'Question suivante'; next.disabled=true; btns.appendChild(next);
  const reset=document.createElement('button'); reset.className='btn secondary'; reset.textContent='Recommencer'; btns.appendChild(reset);
  screen.appendChild(btns);

  scale.addEventListener('change', e=>{ if(e.target && e.target.name==='ans'){ answers[it.id]=parseInt(e.target.value,10); next.disabled=false; }});
  next.addEventListener('click', ()=>{ idx++; render(); });
  reset.addEventListener('click', ()=>{ if(confirm('Recommencer le questionnaire ?')) location.reload(); });
}

document.addEventListener('DOMContentLoaded', render);
