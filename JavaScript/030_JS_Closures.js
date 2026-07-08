/* ============================================================
   30 JS Closures
   Una closure e' una funzione che "ricorda" e continua ad accedere
   alle variabili dello scope in cui e' stata creata, anche dopo che
   quella funzione esterna ha gia' terminato l'esecuzione.
   In JavaScript ogni funzione cattura (closes over) il lexical scope
   circostante: questo permette private state, factory functions,
   counter incapsulati, memorization e callback con dati persistenti.
   Le closure sono uno dei concetti piu' potenti del linguaggio.
   ============================================================ */

// ------------------------------------------------------------
// 1) IDEA BASE: una funzione interna accede allo scope esterno
// ------------------------------------------------------------

// La funzione interna "vede" la variabile messaggio anche dopo
// che esterna() e' ritornata: il suo scope resta catturato.
function esterna() {
  const messaggio = "Ciao dalla closure";
  function interna() {
    return messaggio; // cattura 'messaggio'
  }
  return interna;
}
const dimmiCiao = esterna();
console.log(dimmiCiao()); // => Ciao dalla closure

// ------------------------------------------------------------
// 2) LEXICAL SCOPE: lo scope e' deciso da DOVE scrivi il codice
// ------------------------------------------------------------

const fattore = 10;
function moltiplica(x) {
  return x * fattore; // 'fattore' risolto dallo scope lessicale esterno
}
console.log(moltiplica(5)); // => 50

// ------------------------------------------------------------
// 3) FACTORY FUNCTION: genera funzioni preconfigurate
// ------------------------------------------------------------

// creaMoltiplicatore restituisce funzioni che ricordano 'n'.
function creaMoltiplicatore(n) {
  return function (x) {
    return x * n; // cattura 'n'
  };
}
const doppio = creaMoltiplicatore(2);
const triplo = creaMoltiplicatore(3);
console.log(doppio(8)); // => 16
console.log(triplo(8)); // => 24

// ------------------------------------------------------------
// 4) PRIVATE STATE: variabili non accessibili dall'esterno
// ------------------------------------------------------------

// 'saldo' e' privato: si modifica solo tramite i metodi ritornati.
function creaConto(saldoIniziale = 0) {
  let saldo = saldoIniziale;
  return {
    deposita(importo) {
      saldo += importo;
      return saldo;
    },
    preleva(importo) {
      if (importo > saldo) return "Fondi insufficienti";
      saldo -= importo;
      return saldo;
    },
    leggi() {
      return saldo;
    },
  };
}
const conto = creaConto(100);
console.log(conto.deposita(50)); // => 150
console.log(conto.preleva(30)); // => 120
console.log(conto.leggi());     // => 120
console.log(conto.saldo);       // => undefined (privato!)

// ------------------------------------------------------------
// 5) COUNTER: l'esempio classico di closure
// ------------------------------------------------------------

function creaCounter() {
  let count = 0;
  return function () {
    count += 1; // ogni chiamata incrementa lo stesso 'count'
    return count;
  };
}
const next = creaCounter();
console.log(next()); // => 1
console.log(next()); // => 2
console.log(next()); // => 3

// Counter avanzato con piu' operazioni sullo stesso state.
function creaCounterAvanzato(start = 0, step = 1) {
  let valore = start;
  return {
    inc: () => (valore += step),
    dec: () => (valore -= step),
    reset: () => (valore = start),
    get: () => valore,
  };
}
const c = creaCounterAvanzato(10, 5);
c.inc();
c.inc();
console.log(c.get()); // => 20
c.dec();
console.log(c.get()); // => 15
c.reset();
console.log(c.get()); // => 10

// ------------------------------------------------------------
// 6) ISTANZE INDIPENDENTI: ogni closure ha il proprio scope
// ------------------------------------------------------------

// Due counter creati separatamente non condividono lo state.
const counterA = creaCounter();
const counterB = creaCounter();
console.log(counterA()); // => 1
console.log(counterA()); // => 2
console.log(counterB()); // => 1 (indipendente da A)

// ------------------------------------------------------------
// 7) IL TRABOCCHETTO var/let DENTRO UN LOOP
// ------------------------------------------------------------

// Con 'var' tutte le closure condividono la STESSA variabile i.
const conVar = [];
for (var i = 0; i < 3; i++) {
  conVar.push(() => i);
}
console.log(conVar.map((f) => f())); // => [3, 3, 3]

// Con 'let' ogni iterazione crea un nuovo binding catturato.
const conLet = [];
for (let j = 0; j < 3; j++) {
  conLet.push(() => j);
}
console.log(conLet.map((f) => f())); // => [0, 1, 2]

// Soluzione storica pre-ES6: IIFE che cattura il valore corrente.
const conIIFE = [];
for (var k = 0; k < 3; k++) {
  conIIFE.push(
    (function (catturato) {
      return () => catturato;
    })(k)
  );
}
console.log(conIIFE.map((f) => f())); // => [0, 1, 2]

// ------------------------------------------------------------
// 8) ONCE: esegue una funzione una sola volta (state catturato)
// ------------------------------------------------------------

function once(fn) {
  let chiamata = false;
  let risultato;
  return function (...args) {
    if (!chiamata) {
      chiamata = true;
      risultato = fn(...args);
    }
    return risultato;
  };
}
const inizializza = once(() => {
  console.log("Inizializzazione eseguita");
  return 42;
});
console.log(inizializza()); // => Inizializzazione eseguita  poi => 42
console.log(inizializza()); // => 42 (non ristampa)

// ------------------------------------------------------------
// 9) MEMOIZATION: cache dei risultati in una closure
// ------------------------------------------------------------

function memoize(fn) {
  const cache = new Map(); // privata, vive nella closure
  return function (n) {
    if (cache.has(n)) return cache.get(n);
    const valore = fn(n);
    cache.set(n, valore);
    return valore;
  };
}
const quadrato = memoize((n) => n * n);
console.log(quadrato(4)); // => 16 (calcolato)
console.log(quadrato(4)); // => 16 (da cache)

// ------------------------------------------------------------
// 10) PARTIAL APPLICATION e CURRYING con closure
// ------------------------------------------------------------

function somma(a) {
  return function (b) {
    return function (c) {
      return a + b + c; // cattura a, b
    };
  };
}
console.log(somma(1)(2)(3)); // => 6

const aggiungi = (base) => (x) => base + x; // partial application
const aggiungi10 = aggiungi(10);
console.log(aggiungi10(5)); // => 15

// ------------------------------------------------------------
// 11) ESEMPIO ERP: generatore di codici badge progressivi
// ------------------------------------------------------------

// Pattern ispirato al gestionale: badge tipo 'UP-001', 'UP-002'.
function creaGeneratoreBadge(prefisso = "UP") {
  let progressivo = 0;
  return function () {
    progressivo += 1;
    return `${prefisso}-${String(progressivo).padStart(3, "0")}`;
  };
}
const nuovoBadge = creaGeneratoreBadge("UP");
console.log(nuovoBadge()); // => UP-001
console.log(nuovoBadge()); // => UP-002
console.log(nuovoBadge()); // => UP-003

// ------------------------------------------------------------
// 12) ESEMPIO ERP: accumulatore di minuti lavorati per reparto
// ------------------------------------------------------------

// La closure mantiene il totale minuti senza esporre la variabile.
function creaRegistroOre(siglaReparto = "XX") {
  let totaleMinuti = 0;
  return {
    timbra(minuti) {
      totaleMinuti += minuti;
      return totaleMinuti;
    },
    report() {
      const ore = Math.floor(totaleMinuti / 60);
      const min = totaleMinuti % 60;
      return `${siglaReparto}: ${ore}h ${String(min).padStart(2, "0")}m`;
    },
  };
}
const reparto = creaRegistroOre("PR");
reparto.timbra(480); // turno mattina
reparto.timbra(95);  // straordinario
console.log(reparto.report()); // => PR: 9h 35m

// ------------------------------------------------------------
// 13) ESEMPIO ERP: validatore di turno configurabile (HOF)
// ------------------------------------------------------------

// creaValidatoreTurno cattura le regole e ritorna un validatore.
function creaValidatoreTurno(regole = { minOre: 4, maxOre: 10 }) {
  const { minOre, maxOre } = regole;
  return function (oreLavorate) {
    if (oreLavorate < minOre) return "Turno troppo corto";
    if (oreLavorate > maxOre) return "Turno troppo lungo";
    return "OK";
  };
}
const validaP4 = creaValidatoreTurno({ minOre: 6, maxOre: 9 });
console.log(validaP4(8)); // => OK
console.log(validaP4(3)); // => Turno troppo corto

// ------------------------------------------------------------
// 14) ESEMPIO ERP: limitatore scorta minima vestiario/DPI
// ------------------------------------------------------------

// La closure tiene traccia della quantita' e segnala sotto scorta.
function creaMagazzinoArticolo(quantita, scortaMinima) {
  let q = quantita;
  return {
    preleva(n) {
      q -= n;
      return q < scortaMinima ? `ATTENZIONE sotto scorta (${q})` : `Rimanenza ${q}`;
    },
    rifornisci(n) {
      q += n;
      return q;
    },
  };
}
const guanti = creaMagazzinoArticolo(10, 5);
console.log(guanti.preleva(3)); // => Rimanenza 7
console.log(guanti.preleva(4)); // => ATTENZIONE sotto scorta (3)

// ------------------------------------------------------------
// 15) DEBOUNCE: closure + timer (utile su input di ricerca)
// ------------------------------------------------------------

function debounce(fn, attesaMs) {
  let timer = null; // catturato tra le chiamate
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), attesaMs);
  };
}
const cercaDipendente = debounce((q) => {
  console.log("Ricerca:", q);
}, 300);
cercaDipendente("Ros");
cercaDipendente("Rossi"); // solo questa esegue dopo 300ms

// ------------------------------------------------------------
// 16) MODULE PATTERN con IIFE: namespace con membri privati
// ------------------------------------------------------------

const ModuloTimbrature = (function () {
  const timbrature = []; // privato
  function nowNaive() {
    // pattern naive-UTC semplificato: stringa HH:MM
    const d = new Date();
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
      d.getUTCMinutes()
    ).padStart(2, "0")}`;
  }
  return {
    timbra(badge) {
      timbrature.push({ badge, ora: nowNaive() });
      return timbrature.length;
    },
    totale() {
      return timbrature.length;
    },
  };
})();
ModuloTimbrature.timbra("UP-001");
console.log(ModuloTimbrature.totale()); // => 1

// ------------------------------------------------------------
// 17) CLOSURE + async/await: state condiviso tra retry
// ------------------------------------------------------------

// Wrapper che conta i tentativi grazie alla closure.
function conRetry(fn, maxTentativi = 3) {
  return async function (...args) {
    let tentativi = 0;
    while (tentativi < maxTentativi) {
      try {
        return await fn(...args);
      } catch (e) {
        tentativi += 1;
        if (tentativi >= maxTentativi) throw e;
      }
    }
  };
}
const opSicura = conRetry(async (x) => x * 2);
opSicura(21).then((r) => console.log(r)); // => 42

// ------------------------------------------------------------
// 18) GETTER/SETTER incapsulati (private state read-only)
// ------------------------------------------------------------

function creaDipendente(nome, cognome) {
  let badge = null; // assegnabile una sola volta
  return {
    get nomeCompleto() {
      return `${nome} ${cognome}`;
    },
    assegnaBadge(b) {
      if (badge) return "Badge gia' assegnato";
      badge = b;
      return badge;
    },
    get badge() {
      return badge;
    },
  };
}
const dip = creaDipendente("Mario", "Rossi");
console.log(dip.nomeCompleto);       // => Mario Rossi
console.log(dip.assegnaBadge("UP-007")); // => UP-007
console.log(dip.assegnaBadge("UP-008")); // => Badge gia' assegnato

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI PRINCIPALI
   - closure: funzione + lexical scope catturato
   - lexical scope: risoluzione variabili in base alla posizione
   - factory function: funzione che ritorna funzioni/oggetti
   - private state: variabili interne non accessibili dall'esterno
   - return function / return { metodi }: esporre solo l'interfaccia
   - counter pattern: let interno incrementato dalla closure
   - var vs let nei loop: binding condiviso vs per-iterazione
   - IIFE: (function(){...})() per catturare valori / module pattern
   - once(fn): esecuzione singola con flag catturato
   - memoize(fn): cache (Map) nella closure
   - currying / partial application: a => b => c
   - debounce(fn, ms): timer catturato tra chiamate
   - conRetry / HOF: higher-order functions con state
   - getter/setter: get nome(){} per espose read-only
   - padStart, Math.floor, String(): util usate negli esempi
   ============================================================ */
