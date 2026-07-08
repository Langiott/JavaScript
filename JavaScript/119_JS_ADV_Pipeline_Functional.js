/* ============================================================
   119 JS ADV Pipeline Functional
   Programmazione funzionale applicata: costruiamo una PIPELINE di
   trasformazione dati (stile "processore di report"). Caso reale:
   da una lista grezza di timbrature ottenere un report mensile per
   reparto, componendo piccole funzioni pure.
   Impariamo: pipe/compose, currying, funzioni pure, groupBy,
   e perche' comporre funzioni piccole batte i mega-cicli.
   JavaScript moderno (ES2020+), eseguibile con Node.js.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. GLI STRUMENTI FUNZIONALI DI BASE
   ------------------------------------------------------------
   pipe: applica le funzioni da SINISTRA a DESTRA (piu' leggibile).
   compose: da DESTRA a SINISTRA (notazione matematica). */

// pipe(f, g, h)(x) === h(g(f(x)))
const pipe = (...fns) => (valoreIniziale) =>
  fns.reduce((acc, fn) => fn(acc), valoreIniziale);

// compose(f, g, h)(x) === f(g(h(x)))
const compose = (...fns) => (valoreIniziale) =>
  fns.reduceRight((acc, fn) => fn(acc), valoreIniziale);

const aggiungi1 = (n) => n + 1;
const perDue = (n) => n * 2;

console.log(pipe(aggiungi1, perDue)(5));    // => 12  ((5+1)*2)
console.log(compose(aggiungi1, perDue)(5)); // => 11  ((5*2)+1)

/* ------------------------------------------------------------
   2. CURRYING: fissare un argomento alla volta
   ------------------------------------------------------------
   Trasforma f(a, b) in f(a)(b). Serve per creare funzioni
   "preconfigurate" da usare dentro la pipeline. */

const curry2 = (fn) => (a) => (b) => fn(a, b);

const moltiplica = curry2((a, b) => a * b);
const triplica = moltiplica(3); // fissato a=3
console.log(triplica(10)); // => 30

// Versione curried di filter/map: prima la logica, poi i dati.
const filterBy = (predicato) => (array) => array.filter(predicato);
const mapWith = (trasforma) => (array) => array.map(trasforma);

/* ------------------------------------------------------------
   3. DATI GREZZI (dominio: timbrature del mese)
   ------------------------------------------------------------ */

const timbrature = [
  { badge: 'UP-001', reparto: 'PR', ingresso: '08:00', uscita: '17:00' },
  { badge: 'UP-002', reparto: 'AM', ingresso: '09:00', uscita: '18:00' },
  { badge: 'UP-003', reparto: 'PR', ingresso: '08:30', uscita: '16:30' },
  { badge: 'UP-004', reparto: 'QU', ingresso: '08:00', uscita: '12:00' }, // mezza giornata
  { badge: 'UP-005', reparto: 'AM', ingresso: '08:15', uscita: '17:45' },
  { badge: 'UP-006', reparto: 'PR', ingresso: null, uscita: '17:00' },   // dato sporco
];

/* ------------------------------------------------------------
   4. FUNZIONI PURE (mattoncini della pipeline)
   ------------------------------------------------------------
   Pura = stesso input -> stesso output, nessun effetto collaterale.
   Sono facili da testare e da comporre. */

const oraInMinuti = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Scarta i record senza ingresso o uscita (dati sporchi).
const soloValide = filterBy((t) => t.ingresso && t.uscita);

// Arricchisce ogni record con i minuti lavorati (nuovo oggetto: immutabilita').
const conMinuti = mapWith((t) => ({
  ...t,
  minuti: oraInMinuti(t.uscita) - oraInMinuti(t.ingresso),
}));

// Tiene solo chi ha lavorato almeno mezza giornata (>= 240 min).
const soloGiornateePiene = filterBy((t) => t.minuti >= 240);

/* ------------------------------------------------------------
   5. groupBy: raggruppare per una chiave (con reduce)
   ------------------------------------------------------------
   Higher-order + curried: passi la funzione-chiave, ottieni un
   raggruppatore riusabile. */

const groupBy = (chiaveFn) => (array) =>
  array.reduce((acc, item) => {
    const k = chiaveFn(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});

const perReparto = groupBy((t) => t.reparto);

/* ------------------------------------------------------------
   6. LA PIPELINE COMPLETA
   ------------------------------------------------------------
   Leggiamo il flusso dall'alto verso il basso: pulisci -> arricchisci
   -> filtra -> raggruppa. Ogni passo e' una funzione testabile. */

const preparaTimbrature = pipe(
  soloValide,          // via i dati sporchi (UP-006 salta)
  conMinuti,           // aggiunge .minuti
  soloGiornateePiene,  // via le mezze giornate (UP-004 salta)
  perReparto           // { PR: [...], AM: [...] }
);

const raggruppate = preparaTimbrature(timbrature);
console.log(Object.keys(raggruppate)); // => ['PR', 'AM']
console.log(raggruppate.PR.map((t) => t.badge)); // => ['UP-001', 'UP-003']

/* ------------------------------------------------------------
   7. REPORT FINALE: totale e media ore per reparto
   ------------------------------------------------------------
   Trasformiamo il raggruppamento in un riepilogo leggibile. */

const minutiInOre = (min) => (min / 60).toFixed(2);

const report = Object.entries(raggruppate).map(([reparto, righe]) => {
  const totale = righe.reduce((s, t) => s + t.minuti, 0);
  return {
    reparto,
    dipendenti: righe.length,
    oreTotali: minutiInOre(totale),
    oreMedie: minutiInOre(totale / righe.length),
  };
});

console.table ? console.table(report) : console.log(report);
/* Report atteso:
   PR: 2 dipendenti, 17.00 ore totali, 8.50 medie
   AM: 2 dipendenti, 18.50 ore totali, 9.25 medie */

/* ------------------------------------------------------------
   8. BONUS: pipeline riusabile su dati diversi
   ------------------------------------------------------------
   Poiche' 'preparaTimbrature' e' solo una funzione, la applichiamo
   a qualsiasi nuovo set di dati senza riscrivere nulla. */

const timbratureBis = [
  { badge: 'UP-010', reparto: 'IT', ingresso: '07:30', uscita: '16:30' },
];
console.log(preparaTimbrature(timbratureBis)); // => { IT: [ { ...UP-010, minuti: 540 } ] }

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - pipe/compose COMPONGONO funzioni piccole in un flusso leggibile.
   - Le funzioni pure sono testabili e riutilizzabili come mattoncini.
   - Il currying crea funzioni "preconfigurate" (filterBy, groupBy).
   - L'immutabilita' (spread, map) evita bug da mutazioni nascoste.
   - Una pipeline e' una funzione: la riusi su qualunque dato.
   ============================================================ */
