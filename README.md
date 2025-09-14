# Add-on Export PDF pour PMP v5.5 (sans toucher aux questions)

Ce pack ajoute un **bouton Exporter PDF** à votre *PMP – Profil Mental de Performance* (v5.5), **sans modifier** votre questionnaire ni l’ordre des questions. Il génère un PDF multi-pages avec **page de garde** (logo + participant + contexte + date), **résultats** (scores + radar) et **détail** (items, profils).

## Installation (2 minutes)
1. Copiez **`pdf-export.js`** à la **racine** de votre projet (ou dans `assets/js/` si vous préférez).
2. Dans votre fichier HTML PMP (v5.5), **ajoutez** ceci **avant la balise `</body>`** :
   ```html
   <script src="pdf-export.js"></script>
   ```
   > Le script chargera automatiquement `html2canvas` et `jsPDF` si nécessaire.
3. Ajoutez **un bouton** (si vous n’en avez pas déjà un) dans votre barre d’actions :
   ```html
   <button id="exportPdf" class="btn">Exporter PDF</button>
   ```

## Balises/IDs détectés automatiquement
Le script essaie de détecter vos éléments existants :
- **Bandeau/logo** : `#bandeau`, `.banner`, `header .logo`, `.header img`…
- **Identifiant** : `#pid`, `input[name="participant"]`, `input[name="identifiant"]`
- **Contexte** : `#context`, `select[name="contexte"]`
- **Date** : `#pdate`, `input[type="date"]`
- **Résultats** : `#results`, `#scores`, `#resume`, `section.results`, `.results`
- **Bloc 16 profils** : `#profiles16`, `#profils16`, `.profiles16`, `.profils16`
- **Détail par item** : `#details`, `#detail`, `#itemsDetail`, `#itemsTable`, `section.detail`, `.detail`

> Si vos IDs/classes sont différents, ajoutez **un des IDs ci-dessus** sur vos blocs (ex. `<section id="results">…</section>`). Aucune autre modification n’est nécessaire.

## Utilisation
- Remplissez le questionnaire, calculez vos **résultats** (le script invoque `computeScores()` et `updateUI()` s’ils existent).
- Cliquez sur **Exporter PDF** → un fichier est généré automatiquement, nommé :
  `PMP_profil_resultats_<participant>_<date>.pdf`.

## Notes
- Le rendu PDF reflète **exactement** votre mise en page v5.5 (pas de changement de style).
- Le script n’altère ni l’ordre des items, ni les calculs, ni vos 16 profils.
