
console.log("[PMP] script.js charge (V5.5)");
const AXES = {
  "NRJ": ["Je recharge mon energie plutot en etant seul qu'avec un groupe.",
"Je prefere des conversations en tete-a-tete plutot que de grands debats.",
"Je parle apres avoir reflechi longuement.",
"Les fetes bruyantes me fatiguent plus qu'elles ne m'enthousiasment.",
"Je garde souvent mes idees pour moi avant de les partager.",
"Je prefere ecrire un message plutot que passer un coup de fil.",
"Je passe beaucoup de temps a l'interieur de mes pensees.",
"Je choisis des activites calmes plutot que tres stimulantes.",
"Je suis selectif dans mes relations sociales.",
"On me decrit souvent comme reserve.",
"Je reflechis avant d'agir spontaneament.",
"Les interactions sociales prolongees m'epuisent.",
"Je prefere ecouter plutot que parler en groupe.",
"Je me sens a l'aise dans des environnements peu stimulants.",
"Je travaille mieux seul que dans des equipes nombreuses."],
  "Vision": ["Je me fie d'abord aux faits concrets plutot qu'aux possibilites.",
"Je prefere des instructions detaillees et precises.",
"J'apprecie les exemples concrets plus que les theories.",
"Je me concentre sur le present plutot que sur l'avenir lointain.",
"Je remarque les details pratiques rapidement.",
"Je prefere des methodes eprouvees aux approches nouvelles.",
"Je fais confiance a ce que je peux observer directement.",
"Je privilegie l'experience vecue aux speculations.",
"Je procede etape par etape plutot que par grands sauts.",
"Je prefere des solutions realistes aux idees abstraites.",
"Je suis sensible aux faits mesurables.",
"Je decris les choses telles qu'elles sont, pas comme elles pourraient etre.",
"Je cherche des donnees tangibles avant de decider.",
"Je m'interesse d'abord au 'comment' plutot qu'au 'et si'.",
"Je privilegie la precision et la fiabilite des informations."],
  "Décision": ["Je base mes decisions sur la logique plutot que sur l'impact emotionnel.",
"Je valorise la coherence plus que l'harmonie.",
"Je prefere des criteres objectifs aux impressions subjectives.",
"Je dis les choses franchement, meme si cela peut gener.",
"Je cherche ce qui est juste, pas necessairement ce qui fait plaisir.",
"Je critique pour ameliorer, pas pour blesser.",
"Je suis a l'aise avec le debat et la confrontation d'idees.",
"Je prends de la distance pour analyser un probleme.",
"Je defends la logique meme sous pression emotionnelle.",
"Je tranche selon des principes, pas selon les personnes.",
"Je privilegie l'efficacite a la delicatesse dans l'urgence.",
"Je me demande d'abord si c'est rationnel, ensuite si c'est agreable.",
"Je structure ma pensee avant d'ecouter mes ressentis.",
"Je valorise la verite plutot que l'approbation.",
"Je prefere des feedbacks directs et precis."],
  "Organisation": ["J'aime planifier et decider tot plutot que garder toutes les options ouvertes.",
"Je me sens mieux avec des listes et des echeances claires.",
"Je prefere clore un sujet plutot que le laisser en suspens.",
"Je suis ponctuel et respecte les delais.",
"Je decompose les projets en etapes planifiees.",
"J'aime quand les choses sont organisees et previsibles.",
"Je prepare a l'avance plutot que d'improviser.",
"Je prefere suivre un plan plutot que saisir les opportunites au vol.",
"Je range pour mieux me concentrer.",
"Je fixe des objectifs et j'en fais le suivi.",
"J'apprecie les procedures etablies.",
"Je decide rapidement pour avancer.",
"Je clarifie qui fait quoi et quand.",
"Je n'aime pas laisser trainer les decisions.",
"Je prefere des routines stables."]
};
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
  const screen = document.getElementById('screen');
  const bar = document.getElementById('bar');
  if(!screen) return;
  if(bar) bar.style.width = (idx*100/total)+'%';
  screen.innerHTML='';
  if(idx >= total){
    const scores = {NRJ:{pos:0,neg:0}, Vision:{pos:0,neg:0}, "Décision":{pos:0,neg:0}, Organisation:{pos:0,neg:0}};
    QUESTIONS.forEach(it => {
      const v = answers[it.id]; if(v==null) return;
      const s = v-3; if(s>0) scores[it.axis].pos += s; else if(s<0) scores[it.axis].neg += -s;
    });
    const code = [
      scores.NRJ.pos >= scores.NRJ.neg ? 'I':'E',
      scores.Vision.pos >= scores.Vision.neg ? 'C':'G',
      scores["Décision"].pos >= scores["Décision"].neg ? 'L':'V',
      scores.Organisation.pos >= scores.Organisation.neg ? 'P':'F'
    ].join('');
    screen.innerHTML = `<h2>Résultat</h2><p>Votre code PMP : <strong>${code}</strong>. Redirection vers votre rapport détaillé…</p>`;
    const known = ["ICLP","ICLF","ICVP","ICVF","IGLP","IGLF","IGVP","IGVF","ECLP","ECLF","ECVP","ECVF","EGLP","EGLF","EGVP","EGVF"];
    const target = known.includes(code) ? `profils/${code}.html` : "index.html";
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
  scale.addEventListener('change', e=>{ if(e.target && e.target.name==='ans'){ answers[it.id]=parseInt(e.target.value,10); next.disabled=false; } });
  next.addEventListener('click', ()=>{ idx++; render(); });
  reset.addEventListener('click', ()=>{ if(confirm('Recommencer le questionnaire ?')) location.reload(); });
}
document.addEventListener('DOMContentLoaded', render);
