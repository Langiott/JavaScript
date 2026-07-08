/* ============================================================
   91 JS ADV Modules Patterns
   Pattern di organizzazione del codice con i moduli ES (ESM).
   Vediamo come strutturare un progetto reale: barrel files per
   esportazioni centralizzate, il pattern Singleton per istanze
   condivise, la Dependency Injection per disaccoppiare i moduli,
   e i criteri per organizzare cartelle e responsabilita' in un
   gestionale aziendale (ERP). Tutti i concetti sono illustrati
   con esempi autonomi ed eseguibili con Node.js.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) RIPASSO: import / export (named, default, namespace)
   ------------------------------------------------------------ */
// In ESM si esporta con `export` e si importa con `import`.
// Qui simuliamo i moduli con funzioni-factory per restare in un
// singolo file eseguibile, ma i commenti mostrano la sintassi reale.

// --- File: utils/date.js (esempio sintassi reale, commentato) ---
// export function nowRomeNaiveUTC() { /* ... */ }     // named export
// export const TZ = 'Europe/Rome';                    // named export
// export default function formatHHMM(d) { /* ... */ } // default export

// --- File: app.js ---
// import formatHHMM, { nowRomeNaiveUTC, TZ } from './utils/date.js';
// import * as dateUtils from './utils/date.js';  // namespace import
// console.log(dateUtils.TZ); // => 'Europe/Rome'

// Regola pratica: UN default export per modulo (l'entita' principale),
// + named export per le utility correlate.

/* ------------------------------------------------------------
   2) BARREL FILE (file "barile" / index.js)
   ------------------------------------------------------------ */
// Un barrel file raccoglie ed ri-esporta piu' moduli da un'unica
// porta d'ingresso, cosi' chi importa scrive un solo path pulito.
//
// Senza barrel:
//   import { Dipendente } from './models/dipendente.js';
//   import { Reparto }    from './models/reparto.js';
//   import { Turno }      from './models/turno.js';
//
// Con barrel (./models/index.js):
//   export { Dipendente } from './dipendente.js';
//   export { Reparto }    from './reparto.js';
//   export { Turno }      from './turno.js';
// e poi:
//   import { Dipendente, Reparto, Turno } from './models/index.js';

// Simuliamo i tre "moduli" del barrel come oggetti.
const dipendenteModule = {
  crea: (nome, cognome, badge) => ({ nome, cognome, badge }),
};
const repartoModule = {
  crea: (sigla) => ({ sigla }),
};
const turnoModule = {
  crea: (codice, conPausa) => ({ codice, conPausa }),
};

// Il barrel: un oggetto che ri-esporta tutto.
const models = {
  ...dipendenteModule && { creaDipendente: dipendenteModule.crea },
  creaReparto: repartoModule.crea,
  creaTurno: turnoModule.crea,
};
console.log(models.creaDipendente('Mario', 'Rossi', 'UP-001'));
// => { nome: 'Mario', cognome: 'Rossi', badge: 'UP-001' }

// Pro dei barrel: import puliti, refactor del path interno trasparente.
// Contro: import * da barrel grandi puo' caricare tutto (peggior tree-shaking);
// rischio di import circolari se i moduli si referenziano a vicenda.

/* ------------------------------------------------------------
   3) Re-export selettivo e rinominato
   ------------------------------------------------------------ */
// Sintassi reale dentro un barrel:
//   export { default as Dipendente } from './dipendente.js'; // default -> named
//   export { calcolaOre as oreTurno } from './turno.js';     // rinomina
//   export * from './validators.js';                         // tutti i named
//   export * as v from './validators.js';                    // come namespace

// Esempio: rinominare in un oggetto-barrel.
const validators = {
  isBadge: (b) => /^[A-Z]{2}-\d{3}$/.test(b),
  isOrario: (o) => /^\d{2}:\d{2}$/.test(o),
};
const api = { ...validators, validaBadge: validators.isBadge };
console.log(api.validaBadge('UP-001')); // => true
console.log(api.isOrario('07:30'));     // => true

/* ------------------------------------------------------------
   4) SINGLETON PATTERN
   ------------------------------------------------------------ */
// Un Singleton garantisce UNA sola istanza condivisa in tutta l'app.
// In ESM e' quasi gratis: un modulo viene valutato UNA volta sola,
// quindi cio' che esporti e' di fatto un singleton (module caching).

// --- 4a) Singleton "naturale" via modulo ESM (sintassi reale) ---
// File: config.js
//   const config = { dbUrl: process.env.DB_URL, tz: 'Europe/Rome' };
//   export default config; // ogni import riceve LO STESSO oggetto

// --- 4b) Singleton esplicito con IIFE + closure ---
const Logger = (() => {
  let istanza;                      // privata grazie alla closure
  function crea() {
    const righe = [];
    return {
      log: (msg) => { righe.push(msg); return msg; },
      storico: () => [...righe],
    };
  }
  return {
    getInstance: () => {
      if (!istanza) istanza = crea(); // lazy init: crea solo al bisogno
      return istanza;
    },
  };
})();

const l1 = Logger.getInstance();
const l2 = Logger.getInstance();
l1.log('avvio ERP');
console.log(l1 === l2);          // => true (stessa istanza)
console.log(l2.storico());       // => [ 'avvio ERP' ]

// --- 4c) Singleton con classe + campo statico ---
class ConnessioneDB {
  static #istanza = null;
  #queries = 0;
  constructor() {
    if (ConnessioneDB.#istanza) return ConnessioneDB.#istanza;
    ConnessioneDB.#istanza = this;
  }
  query(sql) { this.#queries++; return `OK: ${sql}`; }
  get totaleQuery() { return this.#queries; }
}
const db1 = new ConnessioneDB();
const db2 = new ConnessioneDB();
db1.query('SELECT * FROM dipendenti');
db2.query('SELECT * FROM reparti');
console.log(db1 === db2);        // => true
console.log(db1.totaleQuery);    // => 2 (contatore condiviso)

// Quando usarlo: pool DB, cache, config, logger. Attenzione: i Singleton
// sono stato globale -> rendono i test piu' difficili. Spesso e' meglio la DI.

/* ------------------------------------------------------------
   5) DEPENDENCY INJECTION (DI)
   ------------------------------------------------------------ */
// Invece di creare le dipendenze DENTRO un modulo (accoppiamento forte),
// le si passano dall'esterno. Cosi' il modulo non sa "quale" implementazione
// usa -> testabile e flessibile.

// --- 5a) DI via parametri (la forma piu' semplice) ---
// Il repository viene iniettato: in test passo un finto repo.
function creaServizioTimbrature(repo, clock) {
  return {
    timbra: (badge) => {
      const ora = clock();            // dipendenza "tempo" iniettata
      return repo.salva({ badge, ora });
    },
  };
}

// Implementazione reale del repo.
const repoMemoria = {
  righe: [],
  salva(t) { this.righe.push(t); return t; },
};
// Clock controllabile (utile per i test naive-UTC dell'ERP).
const clockFisso = () => '2026-06-30T07:30:00';

const servizio = creaServizioTimbrature(repoMemoria, clockFisso);
console.log(servizio.timbra('UP-001'));
// => { badge: 'UP-001', ora: '2026-06-30T07:30:00' }
console.log(repoMemoria.righe.length); // => 1

// --- 5b) DI via costruttore (classe) ---
class CalcolatoreOre {
  constructor({ turni, arrotonda }) { // dipendenze come oggetto
    this.turni = turni;
    this.arrotonda = arrotonda;       // funzione iniettata
  }
  oreDovute(codiceTurno) {
    const t = this.turni.find((x) => x.codice === codiceTurno);
    const lorde = t.conPausa ? 8.5 : 8;
    return this.arrotonda(lorde);
  }
}
const calc = new CalcolatoreOre({
  turni: [turnoModule.crea('P4', true), turnoModule.crea('P2', false)],
  arrotonda: (n) => Math.round(n * 4) / 4, // al quarto d'ora
});
console.log(calc.oreDovute('P4')); // => 8.5
console.log(calc.oreDovute('P2')); // => 8

// --- 5c) Container DI minimale (service locator) ---
// Registra le "ricette" per costruire i servizi e risolvile a richiesta.
function creaContainer() {
  const ricette = new Map();
  const cache = new Map();
  return {
    register(nome, factory) { ricette.set(nome, factory); },
    resolve(nome) {
      if (cache.has(nome)) return cache.get(nome); // singleton per nome
      const factory = ricette.get(nome);
      if (!factory) throw new Error(`Servizio non registrato: ${nome}`);
      const istanza = factory(this);               // passa il container
      cache.set(nome, istanza);
      return istanza;
    },
  };
}

const container = creaContainer();
container.register('repo', () => ({ righe: [], salva(x) { this.righe.push(x); return x; } }));
container.register('clock', () => () => '2026-06-30T08:00:00');
container.register('timbrature', (c) =>
  creaServizioTimbrature(c.resolve('repo'), c.resolve('clock')));

const svc = container.resolve('timbrature');
console.log(svc.timbra('UP-002').ora); // => '2026-06-30T08:00:00'
console.log(container.resolve('repo') === container.resolve('repo')); // => true

/* ------------------------------------------------------------
   6) ORGANIZZAZIONE DEI MODULI (layout di progetto ERP)
   ------------------------------------------------------------ */
// Struttura per FEATURE (consigliata per app grandi tipo gestionale):
//
//   src/
//     dipendenti/
//       dipendente.model.js
//       dipendente.service.js
//       dipendente.repo.js
//       index.js            <- barrel della feature
//     timbrature/
//       timbratura.service.js
//       index.js
//     shared/
//       date.js
//       validators.js
//       index.js            <- barrel delle utility comuni
//     container.js          <- composizione (wiring) delle dipendenze
//     app.js                <- entry point
//
// Principi:
// - "Composition root": un solo punto (container.js/app.js) che crea e
//   collega le dipendenze. Il resto del codice riceve cio' che serve.
// - Dipendenze che puntano sempre verso il dominio (i service non dipendono
//   da Express/React, ma ricevono repo/clock astratti).
// - Un barrel per feature: l'esterno importa solo da `feature/index.js`.

/* ------------------------------------------------------------
   7) IMPORT CIRCOLARI: il problema e come evitarlo
   ------------------------------------------------------------ */
// Se a.js importa b.js e b.js importa a.js, uno dei due puo' ricevere
// `undefined` al momento della valutazione (TDZ sui binding non ancora pronti).
//
// Sintomo classico: "Cannot access 'X' before initialization" oppure una
// funzione importata che risulta undefined SOLO a import-time.
//
// Soluzioni:
//   1) estrarre la parte condivisa in un terzo modulo (shared/) di cui
//      entrambi dipendono (rompe il ciclo);
//   2) importare in modo "pigro" dentro la funzione, non a top-level;
//   3) usare la DI: passa la dipendenza come parametro invece di importarla.
//
// Esempio di import pigro (sintassi reale):
//   export async function inviaBadge(id) {
//     const { repo } = await import('./repo.js'); // caricato all'uso
//     return repo.find(id);
//   }

/* ------------------------------------------------------------
   8) FACADE: nascondere la complessita' dietro un'API semplice
   ------------------------------------------------------------ */
// Una Facade espone poche funzioni chiare e dentro orchestra piu' moduli.
function creaErpFacade({ container }) {
  return {
    // Una sola chiamata per il caso d'uso "timbra ingresso".
    timbraIngresso: (badge) => container.resolve('timbrature').timbra(badge),
    // Caso d'uso composto: badge valido + timbra.
    timbraSicuro: (badge) => {
      if (!validators.isBadge(badge)) throw new Error('Badge non valido');
      return container.resolve('timbrature').timbra(badge);
    },
  };
}
const erp = creaErpFacade({ container });
console.log(erp.timbraSicuro('UP-009').badge); // => 'UP-009'

/* ------------------------------------------------------------
   9) DYNAMIC IMPORT e top-level await (ES2022)
   ------------------------------------------------------------ */
// import() restituisce una Promise: utile per code-splitting / plugin / lazy.
// (sintassi reale, commentata per non spezzare l'esecuzione)
//   const mod = await import('./report.js');     // top-level await in ESM
//   mod.generaReport();
//
// Caricamento condizionale di un modulo opzionale:
//   if (config.exportPDF) {
//     const { toPDF } = await import('./pdf.js');
//     toPDF(dati);
//   }

/* ------------------------------------------------------------
   10) ESEMPIO ERP COMPLETO: wiring di una feature
   ------------------------------------------------------------ */
// Mettiamo insieme barrel + DI + facade per la feature "vestiario/DPI".
const vestiarioRepo = {
  capi: [{ id: 1, nome: 'Tuta', taglia: 'L', quantita: 3, scortaMinima: 5 }],
  sottoScorta() { return this.capi.filter((c) => c.quantita < c.scortaMinima); },
};
function creaVestiarioService(repo) {
  return {
    daRiordinare: () => repo.sottoScorta().map((c) => ({
      capo: c.nome,
      mancanti: c.scortaMinima - c.quantita,
    })),
  };
}
const cont2 = creaContainer();
cont2.register('vestiarioRepo', () => vestiarioRepo);
cont2.register('vestiario', (c) => creaVestiarioService(c.resolve('vestiarioRepo')));
console.log(cont2.resolve('vestiario').daRiordinare());
// => [ { capo: 'Tuta', mancanti: 2 } ]

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI
   ------------------------------------------------------------
   - export / export default / export { x as y } / export * from
   - import x, { a, b } from '...'  |  import * as ns from '...'
   - barrel file: index.js che ri-esporta piu' moduli
   - re-export: export { default as N } from './m.js'
   - Singleton via modulo ESM (module caching, valutato 1 volta)
   - Singleton via IIFE + closure (getInstance, lazy init)
   - Singleton via classe: static #istanza, campi privati #
   - Dependency Injection: per parametro / per costruttore
   - Container DI: register(nome, factory) + resolve(nome) + cache (Map)
   - Composition root / wiring centralizzato
   - Facade pattern: API semplice che orchestra piu' moduli
   - import circolari: estrai shared, import pigro, usa DI
   - dynamic import(): Promise, code-splitting, lazy load
   - top-level await (ES2022) negli ESM
   - organizzazione per feature: model/service/repo + index.js
   ============================================================ */
