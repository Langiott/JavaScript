/* ============================================================
   79 JS ADV Functions
   Funzioni avanzate in JavaScript: tecniche di functional programming
   per scrivere codice riusabile, componibile e performante.
   Vediamo currying, partial application, memoization e compose/pipe.
   Sono pattern professionali per costruire pipeline di trasformazione
   dati (DTO, filtri, validazioni) tipiche di un gestionale ERP.
   Tutti gli esempi sono eseguibili con Node.js (sintassi ES2020+).
   ============================================================ */

// ------------------------------------------------------------
// 1) RIPASSO: higher-order functions (funzioni che ricevono o
//    ritornano altre funzioni). Base di tutto ciò che segue.
// ------------------------------------------------------------

// Una funzione che ritorna una funzione (closure sul parametro)
const moltiplicaPer = (n) => (x) => x * n;
const doppio = moltiplicaPer(2);
console.log(doppio(21)); // => 42

// Higher-order che riceve una callback
const applica = (fn, valore) => fn(valore);
console.log(applica((s) => s.toUpperCase(), "up-001")); // => UP-001

// ------------------------------------------------------------
// 2) CURRYING: trasformare f(a, b, c) in f(a)(b)(c).
//    Ogni chiamata "fissa" un argomento e ritorna una nuova
//    funzione grazie alla closure.
// ------------------------------------------------------------

// Currying manuale
const sommaCurry = (a) => (b) => (c) => a + b + c;
console.log(sommaCurry(1)(2)(3)); // => 6

// Esempio ERP: builder di messaggi badge curried
const messaggioBadge = (reparto) => (ruolo) => (nome) =>
  `[${reparto}] ${ruolo}: ${nome}`;
const repProd = messaggioBadge("PR");
const operaioProd = repProd("Operaio");
console.log(operaioProd("Mario Rossi")); // => [PR] Operaio: Mario Rossi

// Curry generico: funziona con qualunque arità
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...rest) => curried.apply(this, [...args, ...rest]);
  };
}
const volume = (l, w, h) => l * w * h;
const volumeCurried = curry(volume);
console.log(volumeCurried(2)(3)(4)); // => 24
console.log(volumeCurried(2, 3)(4)); // => 24
console.log(volumeCurried(2, 3, 4)); // => 24

// ------------------------------------------------------------
// 3) PARTIAL APPLICATION: fissare ALCUNI argomenti adesso, gli
//    altri dopo. Diversa dal currying (che fissa 1 alla volta).
// ------------------------------------------------------------

// Partial con bind (il primo argomento è il this)
function log(livello, modulo, messaggio) {
  return `${livello} | ${modulo} | ${messaggio}`;
}
const logTimbrature = log.bind(null, "INFO", "timbrature");
console.log(logTimbrature("Ingresso registrato")); // => INFO | timbrature | Ingresso registrato

// Partial generico con spread
const partial = (fn, ...fissi) => (...resto) => fn(...fissi, ...resto);
const tassaIva = (aliquota, prezzo) => prezzo * (1 + aliquota / 100);
const con22 = partial(tassaIva, 22);
console.log(con22(100)); // => 122

// Esempio ERP: validatore di formato orario riusabile
const matchRegex = (regex, valore) => regex.test(valore);
const isOrarioValido = partial(matchRegex, /^\d{2}:\d{2}$/);
console.log(isOrarioValido("08:30")); // => true
console.log(isOrarioValido("8:3"));   // => false

// ------------------------------------------------------------
// 4) MEMOIZATION: cache dei risultati per input identici.
//    Utile per calcoli costosi o query ripetute.
// ------------------------------------------------------------

// Memoize generico con Map (chiave = JSON degli argomenti)
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const risultato = fn(...args);
    cache.set(key, risultato);
    return risultato;
  };
}

// Esempio costoso: fattoriale ricorsivo
const fattoriale = memoize((n) => (n <= 1 ? 1 : n * fattoriale(n - 1)));
console.log(fattoriale(5)); // => 120
console.log(fattoriale(5)); // => 120 (servito dalla cache)

// Esempio ERP: minuti lavorati da una stringa "HH:MM-HH:MM"
const minutiTurno = memoize((range) => {
  const m = range.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return 0;
  const [, h1, m1, h2, m2] = m.map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
});
console.log(minutiTurno("08:00-12:30")); // => 270
console.log(minutiTurno("08:00-12:30")); // => 270 (cache hit)

// ------------------------------------------------------------
// 5) COMPOSE e PIPE: comporre più funzioni in un'unica pipeline.
//    compose applica da destra a sinistra, pipe da sinistra a
//    destra (più leggibile, ordine di lettura naturale).
// ------------------------------------------------------------

const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const incrementa = (x) => x + 1;
const raddoppia = (x) => x * 2;

// compose: prima raddoppia, poi incrementa
console.log(compose(incrementa, raddoppia)(10)); // => 21
// pipe: prima incrementa, poi raddoppia
console.log(pipe(incrementa, raddoppia)(10));    // => 22

// Esempio ERP: normalizzazione di un codice badge in pipeline
const trim = (s) => s.trim();
const upper = (s) => s.toUpperCase();
const noSpazi = (s) => s.replace(/\s+/g, "");
const max8 = (s) => s.slice(0, 8);

const normalizzaBadge = pipe(trim, upper, noSpazi, max8);
console.log(normalizzaBadge("  up-001 abc ")); // => UP-001AB

// ------------------------------------------------------------
// 6) PIPELINE DATI ERP: trasformazione record -> DTO.
//    Combina filter/map/reduce con compose/pipe.
// ------------------------------------------------------------

const richieste = [
  { id: 1, dip: "Rossi", approvata: true,  minuti: 480 },
  { id: 2, dip: "Bianchi", approvata: false, minuti: 300 },
  { id: 3, dip: "Verdi", approvata: true,  minuti: 510 },
];

// Funzioni piccole e pure, poi composte
const soloApprovate = (arr) => arr.filter((r) => r.approvata);
const sommaMinuti = (arr) => arr.reduce((s, r) => s + r.minuti, 0);
const inOre = (minuti) => +(minuti / 60).toFixed(2);

const oreApprovate = pipe(soloApprovate, sommaMinuti, inOre);
console.log(oreApprovate(richieste)); // => 16.5

// Trasformazione record query -> DTO leggero per il frontend
const toDTO = (a) => ({ cd: a.articolo_poly, descr: a.descrizione });
const articoli = [
  { articolo_poly: "P4", descrizione: "Tuta", scortaMinima: 5 },
  { articolo_poly: "P2", descrizione: "Guanti", scortaMinima: 20 },
];
console.log(articoli.map(toDTO));
// => [ { cd: 'P4', descr: 'Tuta' }, { cd: 'P2', descr: 'Guanti' } ]

// ------------------------------------------------------------
// 7) PARTIAL + CURRY APPLICATI: filtri configurabili.
//    Higher-order che genera predicati riusabili.
// ------------------------------------------------------------

// Predicato curried: per campo, per valore
const campoUguale = (campo) => (valore) => (oggetto) => oggetto[campo] === valore;
const perReparto = campoUguale("reparto");
const repPR = perReparto("PR");

const dipendenti = [
  { nome: "Mario", reparto: "PR", badge: "UP-001" },
  { nome: "Luca", reparto: "AM", badge: "UP-002" },
  { nome: "Sara", reparto: "PR", badge: "UP-003" },
];
console.log(dipendenti.filter(repPR).map((d) => d.nome)); // => [ 'Mario', 'Sara' ]

// ------------------------------------------------------------
// 8) PIPE ASINCRONO: comporre funzioni async (await in catena).
//    Utile per orchestrare step di salvataggio con rollback.
// ------------------------------------------------------------

const pipeAsync = (...fns) => (x) =>
  fns.reduce((p, fn) => p.then(fn), Promise.resolve(x));

const fetchDip = async (id) => ({ id, nome: "Rossi", minuti: 480 });
const arricchisci = async (d) => ({ ...d, ore: inOre(d.minuti) });
const formatta = async (d) => `${d.nome}: ${d.ore}h`;

pipeAsync(fetchDip, arricchisci, formatta)(7).then((res) =>
  console.log(res) // => Rossi: 8h
);

// ------------------------------------------------------------
// 9) DEBOUNCE e THROTTLE (closure su timer): pattern frequenti
//    in UI ma utili anche lato server per limitare chiamate.
// ------------------------------------------------------------

// Debounce: esegue solo dopo "ritardo" ms di inattività
function debounce(fn, ritardo) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ritardo);
  };
}
const cercaDip = debounce((q) => console.log("Cerco:", q), 200);
cercaDip("Ro"); cercaDip("Ros"); cercaDip("Rossi"); // => Cerco: Rossi (una sola volta)

// Throttle: esegue al massimo una volta ogni "intervallo" ms
function throttle(fn, intervallo) {
  let ultimo = 0;
  return (...args) => {
    const ora = Date.now();
    if (ora - ultimo >= intervallo) {
      ultimo = ora;
      fn(...args);
    }
  };
}
const salvaBozza = throttle(() => console.log("Bozza salvata"), 1000);
salvaBozza(); salvaBozza(); // => Bozza salvata (una sola volta nel burst)

// ------------------------------------------------------------
// 10) ONCE: garantisce esecuzione singola (init, seed, connessioni)
// ------------------------------------------------------------

function once(fn) {
  let chiamata = false;
  let risultato;
  return (...args) => {
    if (!chiamata) {
      chiamata = true;
      risultato = fn(...args);
    }
    return risultato;
  };
}
const initDB = once(() => {
  console.log("Connessione DB aperta");
  return { connesso: true };
});
initDB(); // => Connessione DB aperta
initDB(); // (niente, ritorna il risultato cached)

// ------------------------------------------------------------
// 11) DEFAULT PARAMS + REST in funzioni configurabili (stile ERP)
// ------------------------------------------------------------

const DEFAULT = { regola: "intero", arrotonda: 5 };
function applicaArrotondamento(minuti, { regola, arrotonda } = DEFAULT) {
  if (regola === "intero") return Math.round(minuti / arrotonda) * arrotonda;
  return minuti;
}
console.log(applicaArrotondamento(487));                       // => 485
console.log(applicaArrotondamento(487, { regola: "nessuna" })); // => 487

// ------------------------------------------------------------
// 12) MEMOIZE con WeakMap: cache legata all'oggetto (no leak).
//    La chiave è l'oggetto stesso, garbage-collected con esso.
// ------------------------------------------------------------

function memoizeOggetto(fn) {
  const cache = new WeakMap();
  return (obj) => {
    if (cache.has(obj)) return cache.get(obj);
    const r = fn(obj);
    cache.set(obj, r);
    return r;
  };
}
const calcolaTotale = memoizeOggetto((dip) => dip.minuti / 60);
const d1 = { nome: "Rossi", minuti: 480 };
console.log(calcolaTotale(d1)); // => 8
console.log(calcolaTotale(d1)); // => 8 (cache su d1)

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   - Higher-order: funzioni che ricevono/ritornano funzioni
   - Currying: f(a)(b)(c) tramite closure
   - curry(fn) generico con fn.length e args.length
   - Partial application: fn.bind(null, ...) / partial(fn, ...fissi)
   - Memoization: memoize() con Map e JSON.stringify(args)
   - memoizeOggetto() con WeakMap (chiave = oggetto)
   - compose(...fns): reduceRight, destra -> sinistra
   - pipe(...fns): reduce, sinistra -> destra
   - pipeAsync(...fns): reduce con .then()
   - debounce(fn, ms): clearTimeout/setTimeout
   - throttle(fn, ms): Date.now() + ultimo timestamp
   - once(fn): flag booleano per esecuzione singola
   - Default params + rest/spread per funzioni configurabili
   - Array helpers in pipeline: filter / map / reduce
   ============================================================ */
