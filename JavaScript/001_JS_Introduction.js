/* ============================================================
   1 JS Introduction
   Introduzione a JavaScript: cos'e' il linguaggio, dove viene
   eseguito (browser e Node.js), come includerlo in una pagina
   web o lanciarlo da terminale, e come scrivere il primo
   programma. JavaScript e' un linguaggio interpretato,
   dynamically typed e single-threaded basato su un event loop,
   usato sia lato client (browser) sia lato server (Node.js).
   ============================================================ */

// ------------------------------------------------------------
// 1. COS'E' JAVASCRIPT
// ------------------------------------------------------------
// JavaScript (JS) e' un linguaggio di scripting ad alto livello.
// - dynamically typed: il tipo di una variabile e' deciso a runtime.
// - interpretato/JIT-compiled: eseguito da un engine (V8, SpiderMonkey).
// - single-threaded con event loop: gestisce async via callback/promise.

// Esempio: la stessa variabile puo' cambiare tipo (dynamic typing)
let valore = 42;        // number
valore = "ciao";        // string
valore = true;          // boolean
console.log(typeof valore); // => boolean

// ------------------------------------------------------------
// 2. IL PRIMO PROGRAMMA: console.log
// ------------------------------------------------------------
// console.log stampa sullo standard output (terminale in Node,
// console DevTools nel browser).
console.log("Hello, World!"); // => Hello, World!

// Si possono passare piu' argomenti separati da virgola
console.log("Somma:", 2 + 3); // => Somma: 5

// ------------------------------------------------------------
// 3. DOVE GIRA JAVASCRIPT
// ------------------------------------------------------------
// A) Nel BROWSER: motore JS + accesso al DOM e alle Web API.
// B) In NODE.js: motore V8 + accesso a file system, rete, ecc.

// Rilevare l'ambiente in modo robusto:
const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;
console.log("Sto girando in Node?", isNode); // => true (se lanci con node)

// In Node hai l'oggetto global "process"
if (isNode) {
  console.log("Versione Node:", process.version); // => v20.x.x (esempio)
}

// ------------------------------------------------------------
// 4. COME INCLUDERE JS IN UNA PAGINA HTML (esempio browser)
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// Inline:        <script> console.log("inline"); </script>
// Esterno:       <script src="app.js"></script>
// Module (ESM):  <script type="module" src="app.js"></script>
// "defer" carica lo script dopo il parsing dell'HTML:
//                <script src="app.js" defer></script>

// ------------------------------------------------------------
// 5. COME LANCIARE JS CON NODE.js
// ------------------------------------------------------------
// Da terminale:  node 1_JS_Introduction.js
// REPL interattivo: digita "node" e premi invio, poi scrivi codice.

// ------------------------------------------------------------
// 6. COMMENTI
// ------------------------------------------------------------
// Questo e' un commento di linea
/* Questo e'
   un commento multi-linea */
/**
 * Questo e' un blocco JSDoc, usato per documentare funzioni.
 * @param {number} a - primo addendo
 * @param {number} b - secondo addendo
 * @returns {number} la somma
 */
function somma(a, b) {
  return a + b;
}
console.log(somma(4, 6)); // => 10

// ------------------------------------------------------------
// 7. VARIABILI: let, const, var
// ------------------------------------------------------------
// const: costante (non riassegnabile), block scoped.
// let: variabile riassegnabile, block scoped.
// var: vecchio stile, function scoped, soggetto a hoisting (evitare).
const PI = 3.14159;
let contatore = 0;
contatore += 1;
console.log(PI, contatore); // => 3.14159 1

// Hoisting: le dichiarazioni var vengono "sollevate" in cima allo scope.
console.log(typeof nonAncoraDichiarata); // => undefined (per var hoisting)
var nonAncoraDichiarata = 1;

// ------------------------------------------------------------
// 8. TIPI PRIMITIVI
// ------------------------------------------------------------
console.log(typeof 10);          // => number
console.log(typeof 10n);         // => bigint
console.log(typeof "testo");     // => string
console.log(typeof true);        // => boolean
console.log(typeof undefined);   // => undefined
console.log(typeof null);        // => object  (bug storico di JS)
console.log(typeof Symbol("s")); // => symbol

// ------------------------------------------------------------
// 9. TEMPLATE LITERALS
// ------------------------------------------------------------
// I backtick permettono interpolazione ${} e stringhe multilinea.
const nome = "Mario";
const cognome = "Rossi";
console.log(`Assegnato a ${nome} ${cognome}`); // => Assegnato a Mario Rossi
console.log(`Riga 1
Riga 2`); // stringa su due righe

// ------------------------------------------------------------
// 10. OPERATORI MODERNI (ES2020+)
// ------------------------------------------------------------
// Optional chaining ?.  e  nullish coalescing ??
const reparto = { sigla: undefined };
console.log(reparto?.sigla ?? "XX"); // => XX
const dipendente = { nome: "Anna", indirizzo: null };
console.log(dipendente?.indirizzo?.via ?? "n/d"); // => n/d

//es:2
const reparto = { nome : null};
const ufficio = { nome : null , reparto : reparto};
console.log(ufficio.reparto.nome ?? "Ufficio Tecnico");
console.log(ufficio.reparto.nome );

// ------------------------------------------------------------
// 11. PRIMO ESEMPIO PRATICO ISPIRATO A UN GESTIONALE ERP
// ------------------------------------------------------------
// Pattern ERP: normalizzazione di un codice badge tipo 'UP-001'.
// Estraiamo il PATTERN reale (String(v||'').trim().toUpperCase()...)
// e lo rendiamo un esempio JS autonomo ed eseguibile.
function normalizzaBadge(input) {
  return String(input || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .slice(0, 8);
}
console.log(normalizzaBadge("  up-001 ")); // => UP-001
console.log(normalizzaBadge("up 002 extra")); // => UP-002EX

// Pattern ERP: validare un orario in formato HH:MM con una regex.
function isOrarioValido(orario) {
  return /^\d{2}:\d{2}$/.test(orario);
}
console.log(isOrarioValido("08:30")); // => true
console.log(isOrarioValido("8:30"));  // => false

// Pattern ERP: estrarre il numero progressivo dal badge.
function numeroBadge(codice) {
  const m = codice.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}
console.log(numeroBadge("UP-001")); // => 1
console.log(numeroBadge("UP-042")); // => 42

// ------------------------------------------------------------
// 12. PRIMO PROGRAMMA "COMPLETO": un mini report
// ------------------------------------------------------------
// Spunto ERP: lista dipendenti con reparto; usiamo map per i DTO.
const dipendenti = [
  { id: 1, nome: "Mario", cognome: "Rossi", badge: "UP-001", reparto: "PR" },
  { id: 2, nome: "Anna", cognome: "Bianchi", badge: "UP-002", reparto: "MG" },
  { id: 3, nome: "Luca", cognome: "Verdi", badge: "UP-003", reparto: null },
];

/* map() trasforma ogni record in una riga leggibile (DTO).
=>  la "arrow function" (funzione freccia) È solo un modo più corto di scrivere una funzione. Contiene anche il return 
??  il "nullish coalescing" Serve a dare un valore di riserva quando qualcosa è null o undefined
*/

const righe = dipendenti.map(
  (d) => `${d.badge}: ${d.nome} ${d.cognome} [${d.reparto ?? "XX"}]`
);
righe.forEach((r) => console.log(r));
// => UP-001: Mario Rossi [PR]
// => UP-002: Anna Bianchi [MG]
// => UP-003: Luca Verdi [XX]

// ------------------------------------------------------------
// 13. INPUT/OUTPUT DI BASE IN NODE
// ------------------------------------------------------------
// Gli argomenti da riga di comando stanno in process.argv.
// node 1_JS_Introduction.js pippo  => process.argv[2] === "pippo"
if (isNode) {
  const arg = process.argv[2];
  console.log("Primo argomento CLI:", arg ?? "(nessuno)");
}

// ------------------------------------------------------------
// 14. ESEMPIO DOM (browser) - pseudo-eseguibile
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// Lo mettiamo dentro una funzione cosi' non viene eseguito a import-time.
function aggiornaTitoloPagina(testo) {
  // document e' una Web API: esiste solo nel browser.
  document.getElementById("titolo").textContent = testo;
}
// Uso (nel browser): aggiornaTitoloPagina("Benvenuto nel gestionale");
console.log(typeof aggiornaTitoloPagina); // => function

// ------------------------------------------------------------
// 15. STRICT MODE
// ------------------------------------------------------------
// "use strict" abilita controlli piu' severi (errori invece di
// fallimenti silenziosi). Nei module ESM e' attivo di default.
(function () {
  "use strict";
  // In strict mode assegnare a una variabile non dichiarata lancia errore.
  let dichiarata = 1;
  console.log("strict ok:", dichiarata); // => strict ok: 1
})();

// ------------------------------------------------------------
// 16. ESPRESSIONI vs ISTRUZIONI + VERITA'/FALSITA'
// ------------------------------------------------------------
// Valori falsy: false, 0, "", null, undefined, NaN. Tutto il resto e' truthy.
console.log(Boolean(0));        // => false
console.log(Boolean(""));       // => false
console.log(Boolean("0"));      // => true (stringa non vuota)
console.log(Boolean([]));       // => true (array sempre truthy)

// ------------------------------------------------------------
// 17. ERRORI E DEBUG DI BASE
// ------------------------------------------------------------
try {
  throw new Error("Esempio di errore controllato");
} catch (e) {
  console.log("Catturato:", e.message); // => Catturato: Esempio di errore controllato
}
console.error("Questo va su stderr"); // utile per log di errore
console.warn("Questo e' un warning");

// ============================================================
// RIEPILOGO COMANDI (memoria rapida)
// ============================================================
// - console.log / console.error / console.warn  -> output
// - typeof x                                     -> tipo del valore
// - let / const / var                            -> dichiarazione variabili
// - "use strict"                                 -> modalita' severa
// - process.version / process.argv               -> info e args Node
// - process.versions.node                        -> rilevare ambiente Node
// - Template literals `...${}...`                -> interpolazione stringhe
// - Optional chaining  a?.b                       -> accesso sicuro
// - Nullish coalescing a ?? b                     -> default su null/undefined
// - String().trim().toUpperCase().replace().slice() -> normalizzazione
// - regex.test(str) / str.match(regex)            -> validazione/estrazione
// - Array.map() / Array.forEach()                 -> trasformare/iterare
// - try / catch / throw new Error()               -> gestione errori
// - Boolean(x)                                    -> conversione truthy/falsy
// - <script src>, type="module", defer            -> inclusione JS in HTML
// - node file.js                                  -> esecuzione in Node
