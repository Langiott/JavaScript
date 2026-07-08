/* ============================================================
   62 JS Iterables
   Un oggetto e' "iterable" quando definisce il metodo Symbol.iterator,
   che ritorna un "iterator": un oggetto con un metodo next() che
   produce { value, done }. I costrutti come for...of, lo spread (...),
   la destructuring e Array.from sanno consumare qualsiasi iterable.
   In questo file vediamo gli iterable nativi, come scrivere un custom
   iterator manuale, come usare i generator come scorciatoia e pattern
   pratici ispirati a un gestionale ERP (timbrature, badge, turni).
   ============================================================ */

// ------------------------------------------------------------
// 1) ITERABLE NATIVI: Array, String, Map, Set
// ------------------------------------------------------------

// Array e' iterable: for...of scorre i value
const reparti = ["Produzione", "Magazzino", "Uffici"];
for (const r of reparti) {
  console.log(r); // => Produzione, Magazzino, Uffici
}

// String e' iterable carattere per carattere (gestisce anche gli emoji)
for (const ch of "UP") {
  console.log(ch); // => U, P
}

// Map e' iterable di coppie [chiave, valore]
const taglie = new Map([["S", 4], ["M", 10], ["L", 6]]);
for (const [taglia, qta] of taglie) {
  console.log(taglia, qta); // => S 4, M 10, L 6
}

// Set e' iterable di valori unici
const siglePresenti = new Set(["PR", "MG", "PR"]);
for (const s of siglePresenti) {
  console.log(s); // => PR, MG
}

// ------------------------------------------------------------
// 2) IL PROTOCOLLO: Symbol.iterator e next()
// ------------------------------------------------------------

// Ogni iterable espone una funzione sotto la chiave Symbol.iterator
const iter = reparti[Symbol.iterator]();
console.log(iter.next()); // => { value: 'Produzione', done: false }
console.log(iter.next()); // => { value: 'Magazzino', done: false }
console.log(iter.next()); // => { value: 'Uffici', done: false }
console.log(iter.next()); // => { value: undefined, done: true }

// Verificare se qualcosa e' iterable: controllare la presenza del metodo
function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === "function";
}
console.log(isIterable([])); // => true
console.log(isIterable("ciao")); // => true
console.log(isIterable(42)); // => false
console.log(isIterable({})); // => false (un oggetto plain NON e' iterable)

// ------------------------------------------------------------
// 3) COSTRUTTI CHE CONSUMANO UN ITERABLE
// ------------------------------------------------------------

// Spread operator: espande l'iterable in argomenti / elementi
const lettere = [..."ABC"];
console.log(lettere); // => [ 'A', 'B', 'C' ]

// Array.from: crea un array da un qualsiasi iterable (o array-like)
console.log(Array.from(siglePresenti)); // => [ 'PR', 'MG' ]

// Array.from con funzione di mapping (secondo argomento)
console.log(Array.from("123", (c) => Number(c) * 2)); // => [ 2, 4, 6 ]

// Destructuring usa l'iterator sotto il cofano
const [primo, secondo] = reparti;
console.log(primo, secondo); // => Produzione Magazzino

// Anche Map e Set accettano un iterable nel costruttore
const copiaSet = new Set([..."aabbc"]);
console.log([...copiaSet]); // => [ 'a', 'b', 'c' ]

// ------------------------------------------------------------
// 4) CUSTOM ITERATOR MANUALE (senza generator)
// ------------------------------------------------------------

// Un range numerico [start, end) implementato a mano
function range(start, end, step = 1) {
  let current = start;
  // ritorniamo direttamente un oggetto iterable
  return {
    [Symbol.iterator]() {
      // ritorna un iterator fresco a ogni for...of
      return {
        next() {
          if (current < end) {
            const value = current;
            current += step;
            return { value, done: false };
          }
          return { value: undefined, done: true };
        },
      };
    },
  };
}
console.log([...range(0, 5)]); // => [ 0, 1, 2, 3, 4 ]
for (const n of range(0, 10, 3)) {
  console.log(n); // => 0, 3, 6, 9
}

// Un oggetto che e' al tempo stesso iterable e iterator (self-iterator)
// Nota: cosi facendo NON e' riutilizzabile in due loop simultanei.
function contatore(max) {
  let i = 0;
  return {
    next() {
      return i < max ? { value: i++, done: false } : { value: undefined, done: true };
    },
    [Symbol.iterator]() {
      return this; // permette comunque l'uso con for...of
    },
  };
}
console.log([...contatore(3)]); // => [ 0, 1, 2 ]

// ------------------------------------------------------------
// 5) RENDERE ITERABLE UN OGGETTO CUSTOM (classe)
// ------------------------------------------------------------

// Una collezione di dipendenti che si puo' scorrere direttamente
class ListaDipendenti {
  constructor() {
    this.items = [];
  }
  aggiungi(dip) {
    this.items.push(dip);
    return this;
  }
  // delegando a this.items[Symbol.iterator] riusiamo l'iterator dell'array
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
}
const lista = new ListaDipendenti()
  .aggiungi({ nome: "Mario", badge: "UP-001" })
  .aggiungi({ nome: "Lucia", badge: "UP-002" });
for (const d of lista) {
  console.log(`${d.badge} -> ${d.nome}`); // => UP-001 -> Mario, UP-002 -> Lucia
}
console.log([...lista].length); // => 2

// ------------------------------------------------------------
// 6) GENERATOR: la scorciatoia per scrivere iterator
// ------------------------------------------------------------

// function* + yield costruisce automaticamente l'iterator { value, done }
function* generaBadge(prefisso, da, a) {
  for (let i = da; i <= a; i++) {
    yield `${prefisso}-${String(i).padStart(3, "0")}`;
  }
}
console.log([...generaBadge("UP", 1, 3)]); // => [ 'UP-001', 'UP-002', 'UP-003' ]

// yield* delega a un altro iterable
function* tuttiCodici() {
  yield* generaBadge("UP", 1, 2);
  yield* generaBadge("MG", 1, 2);
}
console.log([...tuttiCodici()]); // => [ 'UP-001', 'UP-002', 'MG-001', 'MG-002' ]

// Lo stesso range del punto 4, ma in 3 righe
function* rangeGen(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}
console.log([...rangeGen(0, 6, 2)]); // => [ 0, 2, 4 ]

// Generator infinito + consumo controllato (lazy evaluation)
function* idInfiniti() {
  let id = 1;
  while (true) yield id++;
}
const gen = idInfiniti();
console.log(gen.next().value); // => 1
console.log(gen.next().value); // => 2
console.log(gen.next().value); // => 3

// ------------------------------------------------------------
// 7) ITERABLE LAZY: pipeline di trasformazione senza array intermedi
// ------------------------------------------------------------

// map e filter "pigri" che lavorano su qualsiasi iterable
function* mapIter(iterable, fn) {
  for (const x of iterable) yield fn(x);
}
function* filterIter(iterable, pred) {
  for (const x of iterable) if (pred(x)) yield x;
}
function* takeIter(iterable, n) {
  let count = 0;
  for (const x of iterable) {
    if (count++ >= n) return;
    yield x;
  }
}

// Primi 3 id pari, calcolati on demand su una sorgente infinita
const pipeline = takeIter(
  filterIter(mapIter(idInfiniti(), (x) => x * 10), (x) => x % 20 === 0),
  3
);
console.log([...pipeline]); // => [ 20, 40, 60 ]

// ------------------------------------------------------------
// 8) ESEMPI PRATICI ISPIRATI ALL'ERP
// ------------------------------------------------------------

// (a) Scorrere coppie badge->dipendente con una Map iterabile
const dipendentiPerBadge = new Map([
  ["UP-001", { nome: "Mario", reparto: "PR" }],
  ["UP-002", { nome: "Lucia", reparto: "MG" }],
  ["UP-003", { nome: "Gino", reparto: "PR" }],
]);
for (const [badge, dip] of dipendentiPerBadge) {
  console.log(`${badge}: ${dip.nome} (${dip.reparto})`);
} // => UP-001: Mario (PR) ...

// (b) Generator che produce le timbrature di una giornata in formato HH:MM
//     (orari naive: ragioniamo solo sui minuti dalla mezzanotte)
function* slotTurno(inizioMin, fineMin, passoMin) {
  for (let m = inizioMin; m <= fineMin; m += passoMin) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    yield `${hh}:${mm}`;
  }
}
// Turno P4 dalle 08:00 alle 09:00 ogni 30 minuti
console.log([...slotTurno(8 * 60, 9 * 60, 30)]); // => [ '08:00', '08:30', '09:00' ]

// (c) Custom iterable che filtra i dipendenti di un reparto (lazy)
class Reparto {
  constructor(sigla, dipendenti) {
    this.sigla = sigla;
    this.dipendenti = dipendenti;
  }
  *[Symbol.iterator]() {
    for (const d of this.dipendenti) {
      if (d.reparto === this.sigla) yield d;
    }
  }
}
const produzione = new Reparto("PR", [...dipendentiPerBadge.values()]);
console.log([...produzione].map((d) => d.nome)); // => [ 'Mario', 'Gino' ]

// (d) Sommare ore lavorate scorrendo un iterable di timbrature
const timbrature = [
  { badge: "UP-001", minuti: 480 },
  { badge: "UP-002", minuti: 450 },
  { badge: "UP-001", minuti: 60 },
];
let totaleMinuti = 0;
for (const t of timbrature) totaleMinuti += t.minuti;
console.log(`Totale ore: ${(totaleMinuti / 60).toFixed(1)}`); // => Totale ore: 16.5

// (e) Scorporare un range orario "08:00 - 17:00" con destructuring da iterable
const [hI, mI, hF, mF] = "08:00-17:00".match(/\d{2}/g).map(Number);
console.log(`Durata: ${hF - hI} ore`); // => Durata: 9 ore

// ------------------------------------------------------------
// 9) NOTE UTILI E TRAPPOLE
// ------------------------------------------------------------

// - for...of NON funziona su oggetti plain: usa Object.entries() (che e' array)
const config = { regola: "P4", pausa: true };
for (const [k, v] of Object.entries(config)) {
  console.log(k, v); // => regola P4, pausa true
}

// - Un generator si esaurisce: consumarlo due volte da' un array vuoto la seconda
const g = generaBadge("UP", 1, 2);
console.log([...g]); // => [ 'UP-001', 'UP-002' ]
console.log([...g]); // => [] (gia' consumato)

// - return anticipato in un loop chiude correttamente l'iterator (cleanup)
function* conCleanup() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log("iterator chiuso"); // viene eseguito anche col break
  }
}
for (const x of conCleanup()) {
  if (x === 2) break; // => stampa 1, poi "iterator chiuso"
  console.log(x);
}

/* ============================================================
   RIEPILOGO COMANDI
   - Symbol.iterator               // chiave del metodo che rende iterable
   - obj[Symbol.iterator]()        // ottiene l'iterator
   - iterator.next()               // => { value, done }
   - for...of                      // consuma un iterable
   - [...iterable] (spread)        // espande in array
   - Array.from(iterable, mapFn)   // array da iterable + mapping
   - destructuring [a, b] = iter   // usa l'iterator
   - new Map(iterable) / new Set(iterable)
   - function* / yield / yield*    // generator e delega
   - generator.next() / .return() / .throw()
   - Object.entries(obj)           // per iterare oggetti plain
   - String/Array/Map/Set          // iterable nativi
   - .padStart(2,'0'), .match(/.../g), .toFixed(1)  // helper usati negli esempi
   ============================================================ */
