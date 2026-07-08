/* ============================================================
   43 JS Hoisting
   L'hoisting è il meccanismo per cui il motore JavaScript, prima
   di eseguire il codice, "solleva" (hoist) le dichiarazioni in
   cima al loro scope. Ma attenzione: var, let/const e le function
   si comportano in modo MOLTO diverso. var viene inizializzata a
   undefined, let/const finiscono nella Temporal Dead Zone (TDZ),
   le function declaration sono completamente disponibili, le
   function expression no. Capire questo evita bug subdoli.
   ============================================================ */

// ------------------------------------------------------------
// 1) COS'E' L'HOISTING (intuizione)
// ------------------------------------------------------------

// Il codice che SCRIVI:
//   console.log(x); var x = 5;
// viene interpretato dal motore COME SE fosse:
//   var x;            // dichiarazione "sollevata" in cima, init a undefined
//   console.log(x);   // => undefined (non errore!)
//   x = 5;            // assegnazione resta al suo posto

// ------------------------------------------------------------
// 2) HOISTING DI var: dichiarazione sollevata, valore NO
// ------------------------------------------------------------

console.log(typeof messaggio); // => "undefined" (non ReferenceError)
var messaggio = "ciao";
console.log(messaggio);        // => ciao

// Dentro una funzione il concetto è identico:
function demoVar() {
  console.log(stato); // => undefined (hoisted ma non ancora assegnato)
  var stato = "attivo";
  console.log(stato); // => attivo
}
demoVar();

// ------------------------------------------------------------
// 3) let / const: HOISTED ma in TEMPORAL DEAD ZONE (TDZ)
// ------------------------------------------------------------

// Anche let/const sono "hoisted", ma NON inizializzate: accederle
// prima della dichiarazione lancia un ReferenceError. La zona tra
// l'inizio dello scope e la dichiarazione si chiama TDZ.

function demoTDZ() {
  // console.log(reparto); // ReferenceError: Cannot access 'reparto' before initialization
  let reparto = "Produzione";
  console.log(reparto);    // => Produzione
}
demoTDZ();

// Dimostrazione "sicura" della TDZ con try/catch:
try {
  console.log(taglia);     // taglia è in TDZ qui
  let taglia = "L";
} catch (e) {
  console.log(e.constructor.name); // => ReferenceError
}

// const si comporta come let riguardo alla TDZ, in più è immutabile:
const PI = 3.14159;
// PI = 3; // TypeError: Assignment to constant variable.

// ------------------------------------------------------------
// 4) DIFFERENZA CHIAVE: var=undefined vs let=ReferenceError
// ------------------------------------------------------------

function confronto() {
  console.log(conVar);          // => undefined (var hoisted+init)
  // console.log(conLet);       // ReferenceError (TDZ)
  var conVar = 1;
  let conLet = 2;
  console.log(conVar, conLet);  // => 1 2
}
confronto();

// ------------------------------------------------------------
// 5) FUNCTION DECLARATION: completamente hoisted
// ------------------------------------------------------------

// Puoi chiamarla PRIMA della sua definizione: corpo incluso.
console.log(calcolaOre(8, 1)); // => 7 (funziona anche se definita sotto)

function calcolaOre(inizioFine, pausa) {
  return inizioFine - pausa;
}

// ------------------------------------------------------------
// 6) FUNCTION EXPRESSION: hoisting segue la variabile
// ------------------------------------------------------------

// La variabile è hoisted (regole var/let/const), ma NON la funzione.
try {
  saluta(); // se var: TypeError (saluta è undefined); se let: ReferenceError
} catch (e) {
  console.log(e.constructor.name); // => ReferenceError (qui usiamo const)
}
const saluta = function () {
  return "Benvenuto";
};
console.log(saluta()); // => Benvenuto

// Arrow function = function expression: stesse regole.
// console.log(somma(2,3)); // ReferenceError (TDZ di const)
const somma = (a, b) => a + b;
console.log(somma(2, 3)); // => 5

// ------------------------------------------------------------
// 7) ORDINE: function declaration "vince" sulle var
// ------------------------------------------------------------

function priorita() {
  console.log(typeof item); // => "function" (la declaration ha priorità)
  var item = 5;
  function item() {}        // hoisted come funzione
  console.log(typeof item); // => "number" (dopo l'assegnazione var item=5)
}
priorita();

// ------------------------------------------------------------
// 8) HOISTING e BLOCK SCOPE
// ------------------------------------------------------------

// var NON ha block scope: "esce" dal blocco (function-scoped).
function scopeVar() {
  if (true) {
    var dentro = "x";
  }
  console.log(dentro); // => x (var ignora il blocco)
}
scopeVar();

// let/const SONO block-scoped: vivono solo nel { }.
function scopeLet() {
  if (true) {
    let dentro = "y";
    console.log(dentro); // => y
  }
  // console.log(dentro); // ReferenceError: dentro is not defined
}
scopeLet();

// ------------------------------------------------------------
// 9) IL CLASSICO BUG var NEL LOOP (causa: hoisting + no block scope)
// ------------------------------------------------------------

// Con var: una sola variabile condivisa, hoisted fuori dal ciclo.
var callbacksVar = [];
for (var i = 0; i < 3; i++) {
  callbacksVar.push(() => i);
}
console.log(callbacksVar.map((f) => f())); // => [3, 3, 3] (i è una sola!)

// Con let: una nuova binding per ogni iterazione (no hoisting condiviso).
let callbacksLet = [];
for (let j = 0; j < 3; j++) {
  callbacksLet.push(() => j);
}
console.log(callbacksLet.map((f) => f())); // => [0, 1, 2]

// ------------------------------------------------------------
// 10) class: hoisted ma in TDZ (come let/const)
// ------------------------------------------------------------

// const d = new Dipendente(); // ReferenceError (class in TDZ)
class Dipendente {
  constructor(nome) {
    this.nome = nome;
  }
}
const dip = new Dipendente("Mario");
console.log(dip.nome); // => Mario

// ------------------------------------------------------------
// 11) ESEMPIO ERP: bug di hoisting in un calcolo timbrature
// ------------------------------------------------------------

// SPUNTO ERP: somma dei minuti lavorati dalle richieste approvate.
// Versione con bug: usare var nel loop e callback asincrone.
const richieste = [
  { id: 1, minuti: 480, approvata: true },
  { id: 2, minuti: 60, approvata: false },
  { id: 3, minuti: 420, approvata: true },
];

// Pattern corretto (function declaration usabile prima, let block-scoped):
console.log("Totale minuti:", sommaMinutiApprovati(richieste)); // chiamata PRIMA

function sommaMinutiApprovati(lista) {
  return lista
    .filter((r) => r.approvata)
    .reduce((acc, r) => acc + r.minuti, 0);
}
// => Totale minuti: 900

// ------------------------------------------------------------
// 12) ESEMPIO ERP: TDZ con const di configurazione turni
// ------------------------------------------------------------

// Le costanti di dominio vanno dichiarate PRIMA dell'uso, altrimenti TDZ.
function descriviTurno(codice) {
  // Se mettessi l'accesso a TURNI qui sopra alla const => ReferenceError
  const TURNI = {
    P4: { pausa: true, label: "Turno con pausa" },
    P2: { pausa: false, label: "Turno senza pausa" },
  };
  return TURNI[codice]?.label ?? "Turno sconosciuto";
}
console.log(descriviTurno("P4")); // => Turno con pausa
console.log(descriviTurno("P9")); // => Turno sconosciuto

// ------------------------------------------------------------
// 13) ESEMPIO ERP: badge in loop (let evita il bug dei listener)
// ------------------------------------------------------------

const badge = ["UP-001", "UP-002", "UP-003"];
const stampaBadge = [];
for (let k = 0; k < badge.length; k++) {
  // Ogni iterazione cattura il proprio k grazie al block scope di let.
  stampaBadge.push(() => `Badge ${k}: ${badge[k]}`);
}
console.log(stampaBadge.map((f) => f()));
// => ["Badge 0: UP-001", "Badge 1: UP-002", "Badge 2: UP-003"]

// ------------------------------------------------------------
// 14) IIFE: pattern storico pre-ES6 per isolare scope (no hoisting leak)
// ------------------------------------------------------------

const modulo = (function () {
  var privato = "segreto"; // var resta dentro la IIFE, non leak globale
  return {
    leggi: () => privato,
  };
})();
console.log(modulo.leggi()); // => segreto
// console.log(privato);     // ReferenceError: privato is not defined

// ------------------------------------------------------------
// 15) HOISTING e 'use strict' / moduli
// ------------------------------------------------------------

// In strict mode assegnare a una variabile non dichiarata lancia errore,
// evitando la creazione "magica" di globali. In ES modules lo strict mode
// è sempre attivo. Best practice: dichiarare SEMPRE prima dell'uso.
"use strict";
// nonDichiarata = 10; // ReferenceError in strict mode

// ------------------------------------------------------------
// 16) RIEPILOGO VISIVO: cosa succede ad accedere PRIMA della dichiarazione
// ------------------------------------------------------------

// var      -> undefined        (dichiarazione hoisted, valore no)
// let      -> ReferenceError   (TDZ)
// const    -> ReferenceError   (TDZ)
// function -> funziona         (corpo completamente hoisted)
// fn expr  -> come la variabile (undefined o ReferenceError)
// class    -> ReferenceError   (TDZ)

console.log("Fine esempi hoisting");

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI (memoria rapida)
   ------------------------------------------------------------
   - hoisting: sollevamento delle dichiarazioni in cima allo scope
   - var: hoisted + inizializzata a undefined, function-scoped
   - let / const: hoisted ma in TDZ (ReferenceError prima dell'init)
   - const: anche immutabile (TypeError su riassegnazione)
   - TDZ (Temporal Dead Zone): zona prima della dichiarazione let/const
   - function declaration: completamente hoisted (chiamabile prima)
   - function expression / arrow: hoisting segue var/let/const
   - class: hoisted in TDZ (come let/const)
   - block scope vs function scope ({ } vs funzione)
   - bug del loop con var vs let (closure su binding condivisa)
   - IIFE: (function(){...})() per isolare lo scope
   - typeof: utile per ispezionare var hoisted senza errori
   - 'use strict' / ES modules: strict mode evita globali implicite
   - filter() / reduce() / map(): usati negli esempi ERP
   - optional chaining ?. e nullish ?? negli esempi config turni
   ============================================================ */
