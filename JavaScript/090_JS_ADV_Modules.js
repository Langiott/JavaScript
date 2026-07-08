/* ============================================================
   90 JS ADV Modules
   ES Modules (ESM) e' il sistema di moduli standard di JavaScript.
   Permette di dividere il codice in file riusabili tramite 'export'
   (named e default) e 'import'. Include il dynamic import() per il
   caricamento lazy, il re-export per costruire "barrel" file, e il
   confronto con CommonJS (require/module.exports) ancora usato in Node.
   I moduli hanno scope proprio, sono in strict mode di default e
   vengono valutati una sola volta (singleton).
   ============================================================ */

/* ------------------------------------------------------------
   NOTA ESECUZIONE
   Per usare ESM in Node servono: estensione .mjs, oppure
   "type": "module" nel package.json. In CommonJS si usa require().
   Questo file mostra la SINTASSI; gli import reali sono in commento
   o simulati, cosi' il file resta leggibile come scheda di ripasso.
   ------------------------------------------------------------ */


/* ============================================================
   1. NAMED EXPORT
   Esporta piu' valori con nome. Si importano con le graffe { }.
   ============================================================ */

// file: tariffe.js  (named export inline)
export const ALIQUOTA_IVA = 0.22;
export const VALUTA = 'EUR';

// named export di funzioni
export function calcolaIva(imponibile) {
  return imponibile * ALIQUOTA_IVA;
}
export function lordo(imponibile) {
  return imponibile + calcolaIva(imponibile);
}

// Import lato consumatore (sintassi):
// import { ALIQUOTA_IVA, calcolaIva, lordo } from './tariffe.js';
// console.log(lordo(100)); // => 122


/* ============================================================
   2. EXPORT LIST (in fondo al file)
   Si dichiarano normalmente e si esportano in blocco.
   ============================================================ */

const SCORTA_MINIMA = 5;
function sottoScorta(quantita) {
  return quantita < SCORTA_MINIMA;
}
export { SCORTA_MINIMA, sottoScorta };
// import { SCORTA_MINIMA, sottoScorta } from './magazzino.js';


/* ============================================================
   3. RINOMINARE con 'as' (alias)
   Sia in export sia in import.
   ============================================================ */

function _minutiLavorati(t) {
  return (t.uscita - t.ingresso) / 60000;
}
export { _minutiLavorati as minutiLavorati };

// Lato import si puo' rinominare per evitare collisioni:
// import { minutiLavorati as minuti } from './timbrature.js';


/* ============================================================
   4. DEFAULT EXPORT
   Un solo default per modulo. Si importa SENZA graffe e con
   nome a piacere del consumatore.
   ============================================================ */

// file: Dipendente.js
export default class Dipendente {
  constructor(nome, cognome, codiceBadge) {
    this.nome = nome;
    this.cognome = cognome;
    this.codiceBadge = codiceBadge; // es. 'UP-001'
  }
  etichetta() {
    return `${this.nome} ${this.cognome} [${this.codiceBadge}]`;
  }
}

// Import del default (nome libero):
// import Dipendente from './Dipendente.js';
// const d = new Dipendente('Mario', 'Rossi', 'UP-001');
// console.log(d.etichetta()); // => Mario Rossi [UP-001]


/* ============================================================
   5. DEFAULT + NAMED INSIEME
   Pattern comunissimo: il default e' l'oggetto principale,
   i named sono helper/costanti collegate.
   ============================================================ */

// file: badge.js
export const PREFISSO_BADGE = 'UP';
export function normalizzaBadge(v) {
  return String(v || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
}
export default function generaBadge(progressivo) {
  // progressivo 1 => 'UP-001'
  return `${PREFISSO_BADGE}-${String(progressivo).padStart(3, '0')}`;
}
// import generaBadge, { PREFISSO_BADGE, normalizzaBadge } from './badge.js';
// console.log(generaBadge(1)); // => UP-001


/* ============================================================
   6. IMPORT NAMESPACE  (import * as)
   Raccoglie tutti i named export in un oggetto.
   ============================================================ */

// import * as Tariffe from './tariffe.js';
// console.log(Tariffe.ALIQUOTA_IVA);   // => 0.22
// console.log(Tariffe.lordo(100));     // => 122
// NB: il default, se presente, e' su Tariffe.default


/* ============================================================
   7. SIDE-EFFECT IMPORT
   Esegue il modulo senza importare niente (setup, polyfill, css).
   ============================================================ */

// import './bootstrap.js'; // esegue solo il codice top-level del modulo


/* ============================================================
   8. RE-EXPORT (barrel file)
   Un file 'index.js' che ri-esporta da piu' moduli per offrire
   un unico punto di import. Tipico nei gestionali per i 'services'.
   ============================================================ */

// file: services/index.js
// export { calcolaIva, lordo } from '../tariffe.js';      // re-export named
// export { default as Dipendente } from '../Dipendente.js'; // default -> named
// export * from '../magazzino.js';                        // tutti i named
// export { generaBadge as default } from '../badge.js';   // re-export come default

// Lato consumatore basta:
// import { calcolaIva, Dipendente } from './services/index.js';


/* ============================================================
   9. DYNAMIC IMPORT  -> import()
   Ritorna una Promise. Carica il modulo a runtime (lazy/condizionale).
   Utile per code-splitting, plugin, feature opzionali.
   ============================================================ */

async function caricaModuloReport(formato) {
  // simuliamo i moduli con Promise.resolve(oggetto-modulo)
  const moduli = {
    pdf: Promise.resolve({ default: (d) => `PDF di ${d.length} righe` }),
    csv: Promise.resolve({ esporta: (d) => d.map((r) => r.join(';')).join('\n') }),
  };
  // forma reale: const mod = await import(`./report/${formato}.js`);
  const mod = await moduli[formato];
  return mod;
}

(async () => {
  const pdf = await caricaModuloReport('pdf');
  console.log(pdf.default([1, 2, 3])); // => PDF di 3 righe

  const csv = await caricaModuloReport('csv');
  console.log(csv.esporta([['UP-001', 'Rossi']])); // => UP-001;Rossi
})();

// import() con destructuring del named export:
// const { calcolaIva } = await import('./tariffe.js');


/* ============================================================
   10. DYNAMIC IMPORT CONDIZIONALE
   Carica un modulo solo se serve davvero (riduce il bundle iniziale).
   ============================================================ */

async function esporta(dipendenti, vuoiExcel) {
  if (vuoiExcel) {
    // const xlsx = await import('./xlsx.js'); // caricato solo qui
    return `Excel con ${dipendenti.length} dipendenti`;
  }
  return dipendenti.map((d) => d.codiceBadge).join(', ');
}
esporta([{ codiceBadge: 'UP-001' }], false).then((r) => console.log(r)); // => UP-001


/* ============================================================
   11. SINGLETON DEI MODULI
   Un modulo viene valutato UNA volta: lo stato e' condiviso.
   Pattern tipico: un piccolo "store" / cache in memoria.
   ============================================================ */

// file: cache.js
const _store = new Map();
export function setCache(k, v) { _store.set(k, v); }
export function getCache(k) { return _store.get(k); }
// Tutti i file che importano cache.js vedono LO STESSO _store.
setCache('reparto:UF', { sigla: 'UF', nome: 'Ufficio' });
console.log(getCache('reparto:UF').nome); // => Ufficio


/* ============================================================
   12. TOP-LEVEL AWAIT (ESM, ES2022)
   In un modulo ESM si puo' usare await fuori da funzioni async.
   ------------------------------------------------------------
   // file: config.mjs
   // const risposta = await fetch('/api/config');
   // export const config = await risposta.json();
   // -> i moduli che lo importano attendono il completamento.
   ============================================================ */


/* ============================================================
   13. COMMONJS (CJS) — il sistema "classico" di Node
   require() per importare, module.exports / exports per esportare.
   Sincrono, valutato a runtime, niente static analysis.
   ============================================================ */

// --- esportare in CommonJS ---
// file: utils.cjs
// function pad2(n) { return String(n).padStart(2, '0'); }
// module.exports = { pad2 };            // named-like
// module.exports = pad2;                // "default-like" (export singolo)
// exports.pad2 = pad2;                  // forma scorciatoia

// --- importare in CommonJS ---
// const { pad2 } = require('./utils.cjs');
// const pad2 = require('./utils.cjs');  // se esportato come singolo

// Esempio eseguibile (questo file e' trattabile come CJS):
function pad2(n) { return String(n).padStart(2, '0'); }
console.log(`${pad2(9)}:${pad2(5)}`); // => 09:05


/* ============================================================
   14. CommonJS vs ESM — differenze chiave (tabella mentale)
   ------------------------------------------------------------
   - Sintassi:    require/module.exports   vs   import/export
   - Caricamento: sincrono                 vs   asincrono (static)
   - Analisi:     runtime                  vs   statica (tree-shaking)
   - this top:    module.exports           vs   undefined
   - Variabili:   __dirname,__filename ok  vs   usa import.meta.url
   - Dinamico:    require() ovunque        vs   import() (Promise)
   - strict mode: opzionale                vs   sempre attivo
   ============================================================ */

// import.meta.url -> URL del modulo ESM corrente (sostituisce __filename)
// console.log(import.meta.url); // => file:///.../90_JS_ADV_Modules.mjs


/* ============================================================
   15. INTEROP: usare CJS da ESM e viceversa
   ------------------------------------------------------------
   - Da ESM importi un pacchetto CJS:
       import pkg from 'pacchetto-cjs';      // il module.exports = default
       const { metodo } = pkg;               // i named spesso vanno destrutturati
   - Da CJS caricare un ESM: solo con dynamic import:
       const mod = await import('./modulo.mjs');
   - require() NON puo' caricare ESM (errore ERR_REQUIRE_ESM su versioni vecchie).
   ============================================================ */


/* ============================================================
   16. ERRORI COMUNI (gotcha)
   ------------------------------------------------------------
   - import/export DEVONO stare al top-level: niente dentro if/funzioni
     (per quello c'e' import()).
   - I named import devono combaciare ESATTI col nome esportato.
   - Estensione .js obbligatoria negli import ESM in Node.
   - Le live binding ESM: un named import riflette i cambi della variabile
     nel modulo origine (a differenza della copia CJS).
   - Cicli di dipendenza: in ESM funzionano via "live binding", ma valori
     usati a import-time possono essere undefined se il ciclo non e' risolto.
   ============================================================ */

// Esempio live binding (concettuale):
// counter.js:  export let n = 0; export function inc(){ n++; }
// main.js:     import { n, inc } from './counter.js';
//              inc(); console.log(n); // => 1  (n e' "vivo", non una copia)


/* ============================================================
   17. PATTERN ERP — barrel di moduli dominio (simulato)
   Costruiamo un piccolo "package" di funzioni timbrature usando
   un oggetto come se fosse il namespace di un modulo importato.
   ============================================================ */

// Simulazione del modulo './timbrature.js' come namespace
const Timbrature = (() => {
  // helper privato (non esportato): ora di Roma in stile naive-UTC
  function nowRomeNaiveUTC() {
    const parts = new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return `${get('hour')}:${get('minute')}`;
  }
  // named export "pubblici"
  return {
    nowRomeNaiveUTC,
    oreLavorate(ingresso, uscita) {
      const [hi, mi] = ingresso.split(':').map(Number);
      const [hu, mu] = uscita.split(':').map(Number);
      return ((hu * 60 + mu) - (hi * 60 + mi)) / 60;
    },
    validoOrario: (s) => /^\d{2}:\d{2}$/.test(s),
  };
})();

console.log(Timbrature.validoOrario('08:00'));      // => true
console.log(Timbrature.oreLavorate('08:00', '17:00')); // => 9
console.log(typeof Timbrature.nowRomeNaiveUTC());   // => string


/* ============================================================
   18. PATTERN ERP — registry di esportatori via dynamic import()
   Caricamento lazy del giusto formato (PDF/CSV) di un report turni.
   ============================================================ */

async function reportTurni(turni, formato) {
  const fabbriche = {
    csv: async () => ({
      genera: (rows) =>
        ['badge;turno;ore', ...rows.map((t) => `${t.badge};${t.turno};${t.ore}`)].join('\n'),
    }),
    json: async () => ({ genera: (rows) => JSON.stringify(rows) }),
  };
  const mod = await fabbriche[formato](); // come await import(`./fmt/${formato}.js`)
  return mod.genera(turni);
}

reportTurni(
  [{ badge: 'UP-001', turno: 'P4', ore: 8 }, { badge: 'UP-002', turno: 'P2', ore: 6 }],
  'csv',
).then((out) => console.log(out));
// => badge;turno;ore
//    UP-001;P4;8
//    UP-002;P2;6


/* ============================================================
   19. PATTERN ERP — merge di config da piu' "moduli" (spread)
   Default del modulo base + override del modulo reparto.
   ============================================================ */

const CONFIG_DEFAULT = { regolaArrotondamento: 5, pausaPranzo: true };
function configReparto(override) {
  return { ...CONFIG_DEFAULT, ...override }; // override vince
}
console.log(configReparto({ pausaPranzo: false }));
// => { regolaArrotondamento: 5, pausaPranzo: false }


/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   export const/function/class      -> named export inline
   export { a, b }                  -> export list
   export { a as b }                -> rinomina in export
   export default ...               -> default export (uno per file)
   import { a, b } from '...'       -> named import
   import { a as b } from '...'     -> named import rinominato
   import Nome from '...'           -> default import (nome libero)
   import Nome, { a } from '...'    -> default + named insieme
   import * as NS from '...'        -> namespace import
   import '...'                     -> side-effect import
   export { a } from '...'          -> re-export named
   export { default as X } from '.' -> re-export del default come named
   export * from '...'              -> re-export di tutti i named
   import('...')                    -> dynamic import (Promise)
   await import('...')              -> dynamic import in async
   import.meta.url                  -> URL del modulo ESM corrente
   top-level await                  -> await fuori da async (solo ESM)
   require('...')                   -> import CommonJS
   module.exports = ...             -> export singolo CommonJS
   exports.x = ...                  -> export named CommonJS
   ------------------------------------------------------------ */
