/* ============================================================
   2 JS WhereTo
   Dove inserire lo script in una pagina HTML: inline (attributi
   on*), internal (tag <script> nel documento) ed external (file .js
   separato con src). Vediamo anche gli attributi defer e async che
   controllano QUANDO il browser scarica ed esegue lo script, e la
   POSIZIONE del tag nel documento (head vs fine del body) e come
   influisce su parsing, performance e accesso al DOM.
   ============================================================ */

/* ------------------------------------------------------------
   NOTA: la maggior parte di questo argomento riguarda HTML/browser.
   Gli esempi di markup sono in template literals (stringhe) cosi'
   girano anche in Node senza rompersi. I blocchi DOM veri sono
   dentro funzioni o commentati.
   ------------------------------------------------------------ */

// ============================================================
// 1) INLINE SCRIPT — codice JS dentro un attributo HTML on*
// ============================================================

// Esempio browser: gira nel browser, non in Node.
// Lo script e' scritto direttamente nell'attributo evento (onclick).
const inlineEsempio = `
  <button onclick="alert('Ciao!')">Cliccami</button>
  <input oninput="console.log(this.value)">
`;
console.log(inlineEsempio.trim());
// => stringa HTML con handler inline

// Lo stile inline e' sconsigliato: mescola struttura e comportamento,
// e' difficile da mantenere e blocca le Content-Security-Policy severe.
const motiviControInline = ['no separazione', 'no riuso', 'CSP blocca'];
console.log(motiviControInline.length); // => 3

// ============================================================
// 2) INTERNAL SCRIPT — tag <script> dentro il documento HTML
// ============================================================

// Esempio browser. Il codice vive in un <script> nella pagina.
const internalScript = `
  <script>
    const badge = 'UP-001';
    document.title = 'Dipendente ' + badge;
  <\/script>
`;
console.log(internalScript.includes('<script>')); // => true

// Comodo per pochi script o prototipi; non e' cacheabile separatamente.

// ============================================================
// 3) EXTERNAL SCRIPT — file .js separato linkato con src
// ============================================================

// Esempio browser. Approccio raccomandato in produzione.
const externalScript = `<script src="app.js"><\/script>`;
console.log(externalScript); // => <script src="app.js"></script>

// Vantaggi: separazione, riuso tra pagine, caching del browser,
// minificazione e bundling piu' semplici.
const vantaggiExternal = {
  separazione: true,
  caching: true,
  riuso: true,
};
console.log(Object.keys(vantaggiExternal).length); // => 3

// Si possono caricare piu' file external; vengono eseguiti
// nell'ordine in cui appaiono (senza defer/async).
const piuFile = ['vendor.js', 'utils.js', 'app.js'];
console.log(piuFile.join(' -> ')); // => vendor.js -> utils.js -> app.js

// ============================================================
// 4) POSIZIONE NEL DOCUMENTO — head vs fine del body
// ============================================================

// Esempio browser. Script nell'<head> SENZA defer: blocca il parsing
// dell'HTML finche' non e' scaricato ed eseguito (rallenta il rendering).
const headBloccante = `
  <head>
    <script src="app.js"><\/script>  <!-- blocca il parsing -->
  </head>
`;
console.log(headBloccante.includes('blocca')); // => true

// Script appena prima di </body>: il DOM e' gia' costruito, quindi
// puoi accedere agli elementi e l'utente vede prima la pagina.
const bodyFinale = `
  <body>
    <div id="app"></div>
    <script src="app.js"><\/script>  <!-- DOM pronto -->
  </body>
`;
console.log(bodyFinale.includes('DOM pronto')); // => true

// ============================================================
// 5) ATTRIBUTO defer — scarica in parallelo, esegue dopo il parsing
// ============================================================

// Esempio browser. defer: il download avviene in parallelo al parsing,
// l'esecuzione e' RIMANDATA a fine parsing, prima di DOMContentLoaded.
// Mantiene l'ORDINE dei file. Funziona solo con src (external).
const deferScript = `<script src="app.js" defer><\/script>`;
console.log(deferScript.includes('defer')); // => true

// Con defer gli script restano ordinati anche se nell'head.
const ordineDefer = ['polyfill.js', 'app.js']; // eseguiti in quest'ordine
console.log(ordineDefer[0]); // => polyfill.js

// ============================================================
// 6) ATTRIBUTO async — scarica in parallelo, esegue appena pronto
// ============================================================

// Esempio browser. async: download in parallelo, esecuzione appena
// il file e' pronto (puo' interrompere il parsing). NON garantisce
// l'ordine: ideale per script indipendenti (es. analytics).
const asyncScript = `<script src="analytics.js" async><\/script>`;
console.log(asyncScript.includes('async')); // => true

// Tabella mentale di confronto, modellata come dati JS.
const confronto = [
  { attr: 'nessuno', download: 'blocca', esecuzione: 'subito', ordine: 'si' },
  { attr: 'defer', download: 'parallelo', esecuzione: 'fine parsing', ordine: 'si' },
  { attr: 'async', download: 'parallelo', esecuzione: 'appena pronto', ordine: 'no' },
];
confronto.forEach((c) => console.log(`${c.attr}: ordine=${c.ordine}`));
// => nessuno: ordine=si
// => defer: ordine=si
// => async: ordine=no

// Scelta rapida: usa defer per il codice dell'app, async per tracker.
function scegliAttributo(dipendeDalDOM, indipendente) {
  if (dipendeDalDOM) return 'defer';
  if (indipendente) return 'async';
  return 'defer';
}
console.log(scegliAttributo(true, false)); // => defer
console.log(scegliAttributo(false, true)); // => async

// ============================================================
// 7) type="module" — script come ES module (defer implicito)
// ============================================================

// Esempio browser. I module hanno scope proprio (niente variabili
// globali), supportano import/export e sono deferred di default.
const moduleScript = `<script type="module" src="main.js"><\/script>`;
console.log(moduleScript.includes('module')); // => true

// In un module potresti scrivere:
// import { calcolaOre } from './timbrature.js';
// export const VERSIONE = '1.0';

// ============================================================
// 8) DOMContentLoaded — eseguire codice quando il DOM e' pronto
// ============================================================

// Esempio browser. Se uno script gira PRIMA che il DOM esista
// (es. nell'head senza defer), si aspetta l'evento.
function initQuandoProntoDOM() {
  // document.addEventListener('DOMContentLoaded', () => {
  //   const el = document.getElementById('app');
  //   el.textContent = 'Pronto';
  // });
  return 'handler registrato';
}
console.log(initQuandoProntoDOM()); // => handler registrato

// ============================================================
// 9) CARICAMENTO DINAMICO — creare un <script> da JS
// ============================================================

// Esempio browser. Inserire uno script a runtime (lazy loading).
function caricaScript(url) {
  // const s = document.createElement('script');
  // s.src = url;
  // s.defer = true;
  // document.head.appendChild(s);
  return `creo <script src="${url}">`;
}
console.log(caricaScript('chart.js')); // => creo <script src="chart.js">

// Versione Promise-based: utile con async/await.
function caricaScriptAsync(url) {
  return new Promise((resolve, reject) => {
    // const s = document.createElement('script');
    // s.src = url;
    // s.onload = () => resolve(url);
    // s.onerror = () => reject(new Error('fail ' + url));
    resolve(url); // simulazione per Node
  });
}
caricaScriptAsync('app.js').then((u) => console.log('caricato', u));
// => caricato app.js

// ============================================================
// 10) SPUNTI ERP — organizzare gli script di un gestionale
// ============================================================

// Pattern: in un ERP separi i bundle per cacheabilita' e dipendenze.
// Estraiamo il PATTERN come dati JS autonomi (no framework).
const bundleERP = [
  { file: 'vendor.js', attr: 'defer', motivo: 'librerie stabili, cache lunga' },
  { file: 'erp-app.js', attr: 'defer', motivo: 'dipende dal DOM, ordine dopo vendor' },
  { file: 'tracker.js', attr: 'async', motivo: 'indipendente, non blocca' },
];

// Generiamo i tag <script> con un map (pattern map -> DTO dell'ERP).
const tags = bundleERP.map((b) => `<script src="${b.file}" ${b.attr}><\/script>`);
console.log(tags.join('\n'));
// => <script src="vendor.js" defer></script>
// => <script src="erp-app.js" defer></script>
// => <script src="tracker.js" async></script>

// Validazione: gli script che toccano il DOM NON devono essere async.
const tuttiCorretti = bundleERP
  .filter((b) => b.motivo.includes('DOM'))
  .every((b) => b.attr !== 'async');
console.log(tuttiCorretti); // => true

// Esempio: uno script esterno che inizializza il badge dipendente.
// Il PATTERN ERP (template literal + normalizzazione) reso autonomo.
function normalizzaBadge(v) {
  return String(v || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
}
const badge = normalizzaBadge('  up-001 ');
console.log(`Carico modulo per ${badge}`); // => Carico modulo per UP-001

// Pattern config: merge di default con impostazioni passate via inline
// script + caricamento del bundle external (spread, optional chaining).
const DEFAULT_CFG = { tema: 'chiaro', reparto: 'XX', moduli: ['timbrature'] };
function avviaApp(impostazioni = {}) {
  const cfg = { ...DEFAULT_CFG, ...impostazioni };
  const reparto = cfg?.reparto ?? 'XX';
  return `App reparto ${reparto}, tema ${cfg.tema}`;
}
console.log(avviaApp({ reparto: 'P4' })); // => App reparto P4, tema chiaro

// ============================================================
// 11) ERRORI COMUNI E BEST PRACTICE
// ============================================================

// - Accedere al DOM da uno script nell'head senza defer => null.
// - Mettere codice dell'app con async se dipende dall'ordine => bug.
// - Mescolare logica negli attributi inline => problemi di CSP.
// - Preferire external + defer; type="module" per progetti moderni.
const bestPractice = [
  'external + defer per il codice dell app',
  'async solo per script indipendenti',
  'type=module per import/export',
  'evita inline on* handler',
];
console.log(bestPractice.length); // => 4

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI PRINCIPALI
   - inline:        <button onclick="...">  (attributi on*)
   - internal:      <script> ... </script>  nel documento
   - external:      <script src="app.js"></script>
   - posizione:     head (blocca) vs fine <body> (DOM pronto)
   - defer:         download parallelo, esegue a fine parsing, ordinato
   - async:         download parallelo, esegue appena pronto, non ordinato
   - type="module": ES module, scope proprio, defer implicito, import/export
   - DOMContentLoaded:  document.addEventListener('DOMContentLoaded', cb)
   - caricamento dinamico: document.createElement('script') + appendChild
   - metodi JS visti: Array.map / filter / every / forEach / join,
                      Object.keys, String.trim / toUpperCase / replace / slice,
                      Promise, template literals, spread {...}, ?? , ?.
   ============================================================ */
