/* ============================================================
   42 JS Scope
   Lo "scope" (ambito) definisce DOVE una variabile e' visibile e
   accessibile nel codice. In JavaScript esistono tre tipi di scope:
   global scope, function scope e block scope. Le variabili vengono
   risolte seguendo la "scope chain" (catena degli ambiti) verso
   l'esterno, e il legame e' deciso a "compile time" dalla posizione
   nel codice (lexical scope / static scope). Capire lo scope serve
   a evitare bug, name collision e leak di variabili.
   ============================================================ */

// ------------------------------------------------------------
// 1. GLOBAL SCOPE
// ------------------------------------------------------------

// Variabile dichiarata fuori da ogni funzione/blocco: visibile ovunque.
const APP_NAME = "ERP Polyuretech";

function stampaApp() {
  // Qui dentro vediamo la global perche' la scope chain risale verso l'alto.
  console.log(APP_NAME); // => ERP Polyuretech
}
stampaApp();

// ATTENZIONE: in Node ogni file e' un modulo, quindi le var "globali"
// sono in realta' module-scoped. Il vero global object e' globalThis.
globalThis.versioneApp = "1.0.0";
console.log(globalThis.versioneApp); // => 1.0.0

// ------------------------------------------------------------
// 2. FUNCTION SCOPE
// ------------------------------------------------------------

// Le variabili dichiarate dentro una funzione esistono SOLO li dentro.
function calcolaOre() {
  const oreLavorate = 8; // function-scoped
  return oreLavorate;
}
console.log(calcolaOre()); // => 8
// console.log(oreLavorate); // ReferenceError: oreLavorate is not defined

// var e' function-scoped (ignora i blocchi), let/const sono block-scoped.
function esempioVar() {
  if (true) {
    var x = 1;   // "sale" a tutta la funzione (function scope)
    let y = 2;   // resta dentro il blocco if (block scope)
  }
  console.log(x); // => 1
  // console.log(y); // ReferenceError
}
esempioVar();

// ------------------------------------------------------------
// 3. BLOCK SCOPE
// ------------------------------------------------------------

// Qualsiasi { } (if, for, while, blocco nudo) crea uno scope per let/const.
{
  const segreto = "nascosto";
  console.log(segreto); // => nascosto
}
// console.log(segreto); // ReferenceError: fuori dal blocco non esiste

// Caso classico: la closure nel ciclo for.
const callbacksVar = [];
for (var i = 0; i < 3; i++) {
  callbacksVar.push(() => i); // tutte catturano la STESSA i (function scope)
}
console.log(callbacksVar.map((f) => f())); // => [3, 3, 3]

const callbacksLet = [];
for (let j = 0; j < 3; j++) {
  callbacksLet.push(() => j); // ogni iterazione ha la SUA j (block scope)
}
console.log(callbacksLet.map((f) => f())); // => [0, 1, 2]

// ------------------------------------------------------------
// 4. SCOPE CHAIN
// ------------------------------------------------------------

// Quando si cerca una variabile, JS guarda lo scope locale, poi quello
// che lo contiene, e cosi' via fino al global. Questa e' la scope chain.
const azienda = "Polyuretech"; // global

function reparto() {
  const sigla = "UP"; // function scope di reparto
  function badge() {
    const numero = "001"; // function scope di badge
    // badge vede: numero (locale) -> sigla (reparto) -> azienda (global)
    return `${azienda}/${sigla}-${numero}`;
  }
  return badge();
}
console.log(reparto()); // => Polyuretech/UP-001

// La ricerca va solo verso l'ESTERNO, mai verso l'interno.
function esterna() {
  const a = 1;
  function interna() {
    const b = 2;
    console.log(a + b); // => 3 (interna vede a)
  }
  interna();
  // console.log(b); // ReferenceError: esterna NON vede b
}
esterna();

// ------------------------------------------------------------
// 5. LEXICAL SCOPE (static scope)
// ------------------------------------------------------------

// Lo scope e' deciso da DOVE la funzione e' SCRITTA, non da dove e' chiamata.
const messaggio = "globale";

function creaStampatore() {
  const messaggio = "lessicale"; // catturato dalla posizione testuale
  return function () {
    console.log(messaggio); // usa quello del punto in cui e' stata definita
  };
}
const stampatore = creaStampatore();
stampatore(); // => lessicale (NON "globale", anche se chiamata nel global)

// Lexical scope abilita le closure: una funzione "ricorda" il suo ambiente.
function contatore() {
  let count = 0; // resta vivo grazie alla closure
  return () => ++count;
}
const next = contatore();
console.log(next()); // => 1
console.log(next()); // => 2
console.log(next()); // => 3

// ------------------------------------------------------------
// 6. SHADOWING (variable shadowing)
// ------------------------------------------------------------

// Una variabile interna con lo stesso nome "oscura" (shadow) quella esterna.
const ruolo = "operaio";
function mostraRuolo() {
  const ruolo = "responsabile"; // shadow della global
  console.log(ruolo); // => responsabile
}
mostraRuolo();
console.log(ruolo); // => operaio (la global e' intatta)

// Lo shadowing vale anche tra blocchi annidati.
let livello = 0;
{
  let livello = 1;
  {
    let livello = 2;
    console.log(livello); // => 2
  }
  console.log(livello); // => 1
}
console.log(livello); // => 0

// ------------------------------------------------------------
// 7. HOISTING e Temporal Dead Zone (TDZ)
// ------------------------------------------------------------

// var viene "hoisted" e inizializzata a undefined.
function hoistVar() {
  console.log(v); // => undefined (dichiarazione sollevata, non il valore)
  var v = 10;
  console.log(v); // => 10
}
hoistVar();

// let/const sono hoisted ma NON inizializzate: vivono nella TDZ fino alla riga.
function hoistLet() {
  // console.log(w); // ReferenceError: Cannot access 'w' before initialization
  let w = 20;
  console.log(w); // => 20
}
hoistLet();

// ------------------------------------------------------------
// 8. ESEMPI PRATICI ISPIRATI AL GESTIONALE ERP
// ------------------------------------------------------------

// (a) IIFE per isolare uno scope ed evitare di sporcare il global.
const configReparti = (function () {
  const DEFAULT = { arrotondamento: 5, pausa: true }; // privata, non leak
  return { ...DEFAULT, sigla: "UP" };
})();
console.log(configReparti); // => { arrotondamento: 5, pausa: true, sigla: 'UP' }

// (b) Module pattern: stato privato + API pubblica via closure.
function creaRegistroBadge() {
  const badge = new Set(); // function-scoped, accessibile solo via i metodi
  return {
    aggiungi: (codice) => badge.add(codice),
    esiste: (codice) => badge.has(codice),
    totale: () => badge.size,
  };
}
const registro = creaRegistroBadge();
registro.aggiungi("UP-001");
registro.aggiungi("UP-002");
console.log(registro.esiste("UP-001")); // => true
console.log(registro.totale());          // => 2

// (c) Closure che cattura un parametro: factory di validatori orario.
function creaValidatoreOrario(pattern = /^\d{2}:\d{2}$/) {
  // pattern resta nello scope della closure ritornata
  return (orario) => pattern.test(orario);
}
const validaHHMM = creaValidatoreOrario();
console.log(validaHHMM("08:30")); // => true
console.log(validaHHMM("8:3"));   // => false

// (d) Block scope per non rompere il calcolo dentro un reduce.
const timbrature = [
  { tipo: "P4", minuti: 480 },
  { tipo: "P2", minuti: 360 },
  { tipo: "P4", minuti: 420 },
];
const totaleMinuti = timbrature
  .filter((t) => t.tipo === "P4")
  .reduce((somma, t) => {
    const peso = 1; // block-scoped a ogni iterazione, non inquina l'esterno
    return somma + t.minuti * peso;
  }, 0);
console.log(totaleMinuti); // => 900

// (e) Higher-order function: lo scope della funzione esterna alimenta quella interna.
function applicaFiltroData(dataBase) {
  // dataBase vive nella closure del filtro ritornato
  return (timbratura) => timbratura.data >= dataBase;
}
const dalPrimoLuglio = applicaFiltroData("2026-07-01");
console.log(dalPrimoLuglio({ data: "2026-07-05" })); // => true
console.log(dalPrimoLuglio({ data: "2026-06-30" })); // => false

// (f) Pattern naive-UTC: variabili tutte function-scoped, niente leak globali.
function nowRomeNaiveUTC() {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const ora = parts.find((p) => p.type === "hour").value;   // local al function scope
  const minuto = parts.find((p) => p.type === "minute").value;
  return `${ora.padStart(2, "0")}:${minuto.padStart(2, "0")}`;
}
console.log(/^\d{2}:\d{2}$/.test(nowRomeNaiveUTC())); // => true

// ------------------------------------------------------------
// 9. ERRORI COMUNI LEGATI ALLO SCOPE
// ------------------------------------------------------------

// (1) Variabile globale accidentale (in non-strict): senza let/const finisce nel global.
function leakAccidentale() {
  "use strict"; // in strict mode questo lancia un errore, proteggendoci
  // perduta = 5; // ReferenceError in strict mode
  const perduta = 5; // corretto: resta locale
  return perduta;
}
console.log(leakAccidentale()); // => 5

// (2) Riusare un nome e dimenticare lo shadowing -> valore inatteso.
const taglia = "L";
function assegnaVestiario() {
  const taglia = "M"; // shadow: dentro la funzione vale M
  return `Taglia ${taglia}`;
}
console.log(assegnaVestiario()); // => Taglia M
console.log(taglia);             // => L

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI
   - global scope: variabili fuori da funzioni e blocchi
   - function scope: var + variabili dichiarate in funzioni
   - block scope: let / const dentro { } (if, for, while, blocco)
   - scope chain: risoluzione verso l'esterno fino al global
   - lexical scope: legame deciso dalla posizione nel codice
   - shadowing: variabile interna che oscura quella esterna
   - hoisting: var -> undefined; let/const -> TDZ
   - closure: funzione che ricorda il suo lexical environment
   - globalThis: riferimento al vero oggetto globale
   - "use strict": evita global accidentali
   - IIFE: (function(){...})() per isolare lo scope
   - module pattern: stato privato via closure
   - Set: add / has / size
   - Array: filter / reduce / map / find
   - Intl.DateTimeFormat().formatToParts()
   - String.padStart() ; RegExp.test()
   ============================================================ */
