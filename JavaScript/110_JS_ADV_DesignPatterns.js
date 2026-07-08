/* ============================================================
   110 JS ADV DesignPatterns
   I design pattern sono soluzioni riusabili a problemi ricorrenti
   di progettazione del software. In JavaScript sfruttiamo closure,
   first-class functions e prototypes per implementarli in modo
   idiomatico. In questo file vediamo i pattern creazionali
   (Singleton, Factory), comportamentali (Observer, Strategy) e
   strutturali/organizzativi (Module), con esempi reali ispirati a
   un gestionale ERP (dipendenti, timbrature, turni, reparti, badge).
   ============================================================ */

'use strict';

/* ============================================================
   1) SINGLETON PATTERN
   Garantisce UNA sola istanza di un oggetto condivisa in tutta
   l'app. Tipico per: configurazione, connessione DB, logger.
   ============================================================ */

// Singleton classico tramite closure (IIFE): l'istanza vive nello scope
const ConfigManager = (() => {
  let instance; // riferimento privato all'unica istanza

  function createInstance() {
    return {
      timezone: 'Europe/Rome',
      arrotondamentoMinuti: 5,
      get(key) { return this[key]; },
      set(key, value) { this[key] = value; return this; },
    };
  }

  return {
    getInstance() {
      if (!instance) instance = createInstance(); // lazy init
      return instance;
    },
  };
})();

const cfgA = ConfigManager.getInstance();
const cfgB = ConfigManager.getInstance();
cfgA.set('arrotondamentoMinuti', 15);
console.log(cfgB.get('arrotondamentoMinuti')); // => 15 (stessa istanza)
console.log(cfgA === cfgB); // => true

// Singleton moderno con classe + static field (ES2022)
class Logger {
  static #instance = null; // campo privato statico
  #logs = [];

  static getInstance() {
    if (!Logger.#instance) Logger.#instance = new Logger();
    return Logger.#instance;
  }

  log(msg) {
    const riga = `[${new Date().toISOString().slice(0, 10)}] ${msg}`;
    this.#logs.push(riga);
    return riga;
  }

  count() { return this.#logs.length; }
}

Logger.getInstance().log('Avvio modulo timbrature');
Logger.getInstance().log('Dipendente UP-001 timbra ingresso');
console.log(Logger.getInstance().count()); // => 2

// Singleton via modulo: in ES modules un oggetto esportato E' di fatto un singleton
const dbPool = Object.freeze({ maxConn: 10, host: '127.0.0.1' });
console.log(Object.isFrozen(dbPool)); // => true (immutabile, condiviso)

/* ============================================================
   2) FACTORY PATTERN
   Centralizza la CREAZIONE di oggetti, nascondendo la logica di
   istanziazione. Utile quando il tipo concreto dipende da input.
   ============================================================ */

// Factory function semplice: crea un dipendente con badge normalizzato
function creaDipendente(nome, cognome, sigla, numero) {
  const badge = `${String(sigla || 'UP').toUpperCase()}-${String(numero).padStart(3, '0')}`;
  return { nome, cognome, codiceBadge: badge, get etichetta() { return `${nome} ${cognome} (${badge})`; } };
}

const dip = creaDipendente('Mario', 'Rossi', 'up', 1);
console.log(dip.codiceBadge); // => UP-001
console.log(dip.etichetta);   // => Mario Rossi (UP-001)

// Factory con "registro" di costruttori: scelta del tipo a runtime
class TurnoP4 { // turno con pausa pranzo
  constructor() { this.pausa = true; this.oreNominali = 8; }
  calcolaOre(min) { return Math.max(0, (min - 60) / 60); } // 60 min di pausa
}
class TurnoP2 { // turno senza pausa
  constructor() { this.pausa = false; this.oreNominali = 6; }
  calcolaOre(min) { return min / 60; }
}

const TurnoFactory = {
  registry: { P4: TurnoP4, P2: TurnoP2 },
  crea(tipo) {
    const Ctor = this.registry[tipo];
    if (!Ctor) throw new Error(`Turno sconosciuto: ${tipo}`);
    return new Ctor();
  },
};

console.log(TurnoFactory.crea('P4').calcolaOre(540).toFixed(1)); // => 8.0 (540-60=480min)
console.log(TurnoFactory.crea('P2').calcolaOre(360).toFixed(1)); // => 6.0

// Abstract Factory: famiglia di oggetti correlati (es. DPI per reparto)
function creaKitDPI(reparto) {
  const kit = {
    PR: () => [{ articolo: 'Guanti', taglia: 'L' }, { articolo: 'Casco', taglia: 'U' }],
    UF: () => [{ articolo: 'Badge', taglia: 'U' }],
  };
  return (kit[reparto] || kit.UF)();
}
console.log(creaKitDPI('PR').length); // => 2

/* ============================================================
   3) OBSERVER PATTERN (Pub/Sub)
   Un Subject notifica automaticamente tutti gli Observer iscritti
   quando cambia stato. Base di EventEmitter, reattivita', UI.
   ============================================================ */

class EventEmitter {
  #handlers = new Map(); // evento -> Set di callback

  on(evento, cb) {
    if (!this.#handlers.has(evento)) this.#handlers.set(evento, new Set());
    this.#handlers.get(evento).add(cb);
    return () => this.off(evento, cb); // ritorna funzione di unsubscribe
  }

  off(evento, cb) { this.#handlers.get(evento)?.delete(cb); }

  emit(evento, payload) {
    this.#handlers.get(evento)?.forEach((cb) => cb(payload));
  }
}

// Esempio ERP: quando un dipendente timbra, piu' moduli reagiscono
const bus = new EventEmitter();
const unsub = bus.on('timbratura', (t) => console.log(`Presenze: ${t.badge} alle ${t.ora}`));
bus.on('timbratura', (t) => Logger.getInstance().log(`audit ${t.badge}`));

bus.emit('timbratura', { badge: 'UP-001', ora: '08:00' });
// => Presenze: UP-001 alle 08:00
unsub(); // disiscrizione del primo observer
bus.emit('timbratura', { badge: 'UP-001', ora: '12:00' });
// (solo l'audit reagisce ora)
console.log(Logger.getInstance().count()); // => 4

// Observer "reattivo": uno store che notifica i sottoscrittori sui cambi
function creaStore(statoIniziale) {
  let stato = statoIniziale;
  const subs = new Set();
  return {
    get: () => stato,
    set(nuovo) { stato = { ...stato, ...nuovo }; subs.forEach((f) => f(stato)); },
    subscribe(f) { subs.add(f); return () => subs.delete(f); },
  };
}

const store = creaStore({ presenti: 0 });
store.subscribe((s) => console.log(`Presenti in azienda: ${s.presenti}`));
store.set({ presenti: 1 }); // => Presenti in azienda: 1
store.set({ presenti: 2 }); // => Presenti in azienda: 2

/* ============================================================
   4) STRATEGY PATTERN
   Incapsula algoritmi intercambiabili dietro la stessa interfaccia,
   scegliendo a runtime quale usare. In JS spesso e' un oggetto di
   funzioni (lookup table) anziche' una gerarchia di classi.
   ============================================================ */

// Strategie di arrotondamento dei minuti di timbratura
const strategieArrotondamento = {
  nessuno: (min) => min,
  difetto: (min, step) => Math.floor(min / step) * step,
  eccesso: (min, step) => Math.ceil(min / step) * step,
  vicino: (min, step) => Math.round(min / step) * step,
};

function arrotonda(minuti, regola = 'vicino', step = 5) {
  const fn = strategieArrotondamento[regola] ?? strategieArrotondamento.nessuno;
  return fn(minuti, step);
}

console.log(arrotonda(487, 'difetto')); // => 485
console.log(arrotonda(487, 'eccesso')); // => 490
console.log(arrotonda(487, 'vicino'));  // => 485

// Strategy con classi: politiche di calcolo retribuzione
class CalcoloOrario { calcola(ore, tariffa) { return ore * tariffa; } }
class CalcoloStraordinario { calcola(ore, tariffa) { return ore * tariffa * 1.5; } }

function paga(strategia, ore, tariffa) { return strategia.calcola(ore, tariffa); }
console.log(paga(new CalcoloOrario(), 8, 10));        // => 80
console.log(paga(new CalcoloStraordinario(), 8, 10)); // => 120

/* ============================================================
   5) MODULE PATTERN
   Incapsula stato e funzioni private, esponendo solo un'API
   pubblica (revealing module). Precursore degli ES modules.
   ============================================================ */

// Revealing Module Pattern tramite IIFE: 'archivio' resta privato
const RegistroBadge = (() => {
  const archivio = new Map(); // privato: badge -> dipendente

  function valida(badge) { return /^[A-Z]{2}-\d{3}$/.test(badge); } // privato

  function registra(badge, nome) {
    if (!valida(badge)) throw new Error(`Badge non valido: ${badge}`);
    archivio.set(badge, nome);
    return true;
  }

  function cerca(badge) { return archivio.get(badge) ?? null; }

  return { registra, cerca, get totale() { return archivio.size; } }; // API pubblica
})();

RegistroBadge.registra('UP-001', 'Mario Rossi');
RegistroBadge.registra('UP-002', 'Anna Bianchi');
console.log(RegistroBadge.cerca('UP-001')); // => Mario Rossi
console.log(RegistroBadge.totale);          // => 2
console.log(RegistroBadge.archivio);        // => undefined (privato, non esposto)

/* ============================================================
   6) PATTERN COMBINATI E BONUS
   Esempi che mescolano piu' pattern, tipici di codice reale.
   ============================================================ */

// Decorator: aggiunge logging a qualsiasi funzione senza modificarla
function conLog(fn, nome) {
  return (...args) => {
    Logger.getInstance().log(`call ${nome}(${args.join(',')})`);
    return fn(...args);
  };
}
const sommaLoggata = conLog((a, b) => a + b, 'somma');
console.log(sommaLoggata(2, 3)); // => 5

// Builder: costruzione fluente di una query (chainable)
class QueryBuilder {
  #q = { where: {}, orderBy: [], take: undefined };
  filtra(campo, val) { this.#q.where[campo] = val; return this; }
  ordina(campo, dir = 'asc') { this.#q.orderBy.push({ [campo]: dir }); return this; }
  limita(n) { this.#q.take = n; return this; }
  build() { return this.#q; }
}
const query = new QueryBuilder().filtra('reparto', 'PR').ordina('cognome').limita(50).build();
console.log(query.take); // => 50

// Memoization (Flyweight/caching): evita ricalcoli costosi
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);
    const out = fn(arg);
    cache.set(arg, out);
    return out;
  };
}
const minutiTurno = memoize((tipo) => TurnoFactory.crea(tipo).oreNominali * 60);
console.log(minutiTurno('P4')); // => 480
console.log(minutiTurno('P4')); // => 480 (dalla cache)

// Observer + Strategy + Factory insieme: pipeline timbrature ERP
const sistema = new EventEmitter();
sistema.on('chiusura-giornata', ({ tipoTurno, minuti, regola }) => {
  const turno = TurnoFactory.crea(tipoTurno);          // Factory
  const ore = turno.calcolaOre(arrotonda(minuti, regola)); // Strategy
  console.log(`Ore lavorate: ${ore.toFixed(2)}`);      // Observer reagisce
});
sistema.emit('chiusura-giornata', { tipoTurno: 'P4', minuti: 543, regola: 'difetto' });
// => Ore lavorate: 8.00 (543->540, -60 pausa = 480min = 8h)

/* ============================================================
   RIEPILOGO COMANDI
   - IIFE (()=>{...})() ............ scope privato per Singleton/Module
   - static #field / static metodo . Singleton con classe (ES2022)
   - Object.freeze / isFrozen ...... oggetto immutabile condiviso
   - factory function .............. funzione che ritorna oggetti
   - registry[tipo] + new Ctor() ... Factory con registro
   - new Map() / .set/.get/.has .... store privato, handlers, cache
   - new Set() / .add/.delete ...... insieme di observer/subscriber
   - emit/on/off ................... Observer / EventEmitter
   - ritornare unsubscribe ......... gestione lifecycle observer
   - lookup table di funzioni ...... Strategy idiomatico
   - ?? (nullish) / ?. (optional) .. fallback di strategia/dato
   - revealing module (return API) . incapsulamento stato privato
   - decorator (fn -> fn wrappata) . aggiungere comportamento
   - return this ................... Builder fluente/chainable
   - memoize con Map ............... caching/Flyweight
   - String().padStart(3,'0') ...... normalizzazione badge UP-001
   - RegExp .test() ................ validazione formato badge
   ============================================================ */
