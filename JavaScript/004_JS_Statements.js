/* ============================================================
   4 JS Statements
   Uno "statement" (istruzione) e' una singola unita' di lavoro che
   il motore JavaScript esegue: assegnazioni, chiamate, dichiarazioni,
   blocchi, cicli, condizioni. In questo file vediamo come si scrivono
   gli statement, il ruolo del punto e virgola (semicolon), come lo
   whitespace e l'indentazione influiscono (o no) sul codice, cosa
   sono i code blocks { ... } e la differenza fondamentale tra
   "expression" (qualcosa che produce un valore) e "statement"
   (qualcosa che esegue un'azione). Sintassi moderna ES2020+.
   ============================================================ */

// ------------------------------------------------------------
// 1) COS'E' UNO STATEMENT
// ------------------------------------------------------------

// Uno statement esegue un'azione. Qui dichiariamo e assegniamo.
let x = 5;
let y = 6;
let z = x + y;
console.log(z); // => 11

// Un programma e' una sequenza di statement eseguiti in ordine (top-down).
let nome = "Mario";
let cognome = "Rossi";
let intero = nome + " " + cognome;
console.log(intero); // => Mario Rossi

// ------------------------------------------------------------
// 2) IL PUNTO E VIRGOLA (SEMICOLON)
// ------------------------------------------------------------

// Il semicolon separa gli statement. Si possono mettere piu' statement
// sulla stessa riga separandoli con ; (sconsigliato per leggibilita').
let a = 1; let b = 2; let c = a + b;
console.log(c); // => 3

// Stesso codice, stile leggibile: uno statement per riga.
let d = 1;
let e = 2;
let f = d + e;
console.log(f); // => 3

// ASI (Automatic Semicolon Insertion): JS inserisce il ; automaticamente.
// Funziona spesso, ma puo' creare trappole. Esempio innocuo:
let saluto = "ciao"
console.log(saluto) // => ciao

// Trappola classica dell'ASI: un return seguito da a-capo.
function ritornaOggettoSbagliato() {
  return
  { valore: 42 }; // mai raggiunto: ASI inserisce ; dopo return
}
console.log(ritornaOggettoSbagliato()); // => undefined

// Versione corretta: la graffa sulla stessa riga del return.
function ritornaOggettoGiusto() {
  return { valore: 42 };
}
console.log(ritornaOggettoGiusto()); // => { valore: 42 }

// ------------------------------------------------------------
// 3) WHITESPACE E INDENTAZIONE
// ------------------------------------------------------------

// Gli spazi extra tra i token sono ignorati: questi due sono identici.
let p1 = 10+20;
let p2 = 10  +  20;
console.log(p1, p2); // => 30 30

// L'indentazione e' solo per noi umani, non cambia l'esecuzione.
// Convenzione: 2 spazi per livello (usata in questo file).
if (true) {
      console.log("indentazione strana ma valida"); // gira lo stesso
}

// Lo spazio DENTRO le stringhe invece conta eccome.
console.log("a b c".length); // => 5

// Code line length: spezzare una riga lunga dopo un operatore va bene.
let frase =
  "Questa frase e' spezzata " +
  "su piu' righe per leggibilita'.";
console.log(frase.length); // => 56

// ------------------------------------------------------------
// 4) CODE BLOCKS { ... }
// ------------------------------------------------------------

// Un blocco raggruppa piu' statement come una singola unita'.
{
  let temp = 99;
  console.log(temp); // => 99
}
// temp non esiste qui fuori: let/const hanno block scope.

// I blocchi sono usati da if, for, while, function, ecc.
if (5 > 3) {
  let dentro = "blocco if";
  console.log(dentro); // => blocco if
}

// Block scope vs leak: dimostriamo che let resta confinato.
for (let i = 0; i < 3; i++) {
  // i vive solo dentro il blocco del for
}
// console.log(i); // => ReferenceError (i non e' definito qui)

// ------------------------------------------------------------
// 5) EXPRESSION vs STATEMENT
// ------------------------------------------------------------

// EXPRESSION: produce un valore. Puo' stare dove serve un valore.
let somma = 2 + 3;          // 2 + 3 e' una expression
let test = somma > 4;       // confronto: expression booleana
console.log(somma, test);   // => 5 true

// STATEMENT: esegue un'azione (if, for, dichiarazioni, ...).
// Un if e' uno statement: NON ritorna un valore assegnabile.
// let q = if (true) { 1 }; // SyntaxError

// L'operatore ternario e' una EXPRESSION: alternativa all'if.
let eta = 20;
let categoria = eta >= 18 ? "adulto" : "minore";
console.log(categoria); // => adulto

// Expression statement: una expression usata come statement a se'.
somma + 1;          // valida ma inutile (valore scartato)
console.log(somma); // => 5

// ------------------------------------------------------------
// 6) DICHIARAZIONI: let, const, var, function
// ------------------------------------------------------------

const PI = 3.14159;     // const: non riassegnabile
let contatore = 0;      // let: riassegnabile, block scope
var vecchio = "legacy"; // var: function scope (evitare)
console.log(PI, contatore, vecchio); // => 3.14159 0 legacy

// Function declaration: uno statement che definisce una funzione.
function quadrato(n) {
  return n * n;
}
console.log(quadrato(4)); // => 16

// Function expression: una funzione assegnata a una variabile (expression).
const cubo = function (n) {
  return n * n * n;
};
console.log(cubo(3)); // => 27

// Arrow function expression (ES6+), forma moderna e concisa.
const doppio = (n) => n * 2;
console.log(doppio(21)); // => 42

// ------------------------------------------------------------
// 7) STATEMENT CONDIZIONALI
// ------------------------------------------------------------

let ora = 14;
if (ora < 12) {
  console.log("mattina");
} else if (ora < 18) {
  console.log("pomeriggio"); // => pomeriggio
} else {
  console.log("sera");
}

// switch: confronto di un valore contro piu' casi (usa break).
let reparto = "UP";
switch (reparto) {
  case "UP":
    console.log("Ufficio Produzione"); // => Ufficio Produzione
    break;
  case "MG":
    console.log("Magazzino");
    break;
  default:
    console.log("Reparto sconosciuto");
}

// ------------------------------------------------------------
// 8) STATEMENT ITERATIVI (cicli)
// ------------------------------------------------------------

// for classico
for (let i = 0; i < 3; i++) {
  console.log("giro", i); // => giro 0 / giro 1 / giro 2
}

// while
let n = 3;
while (n > 0) {
  n--;
}
console.log(n); // => 0

// for...of (itera sui valori di un iterabile)
for (const lettera of "abc") {
  console.log(lettera); // => a / b / c
}

// for...in (itera sulle chiavi di un oggetto)
const turno = { codice: "P4", pausa: true };
for (const chiave in turno) {
  console.log(chiave); // => codice / pausa
}

// ------------------------------------------------------------
// 9) break, continue, return, throw
// ------------------------------------------------------------

// break: esce dal ciclo
for (let i = 0; i < 10; i++) {
  if (i === 2) break;
  console.log("b", i); // => b 0 / b 1
}

// continue: salta all'iterazione successiva
for (let i = 0; i < 4; i++) {
  if (i % 2 === 0) continue;
  console.log("dispari", i); // => dispari 1 / dispari 3
}

// throw: lancia un errore (statement), gestito da try/catch
function dividi(a, b) {
  if (b === 0) throw new Error("Divisione per zero");
  return a / b;
}
try {
  dividi(10, 0);
} catch (err) {
  console.log(err.message); // => Divisione per zero
}

// ------------------------------------------------------------
// 10) ESEMPI ISPIRATI AL GESTIONALE ERP
// ------------------------------------------------------------

// Pattern ERP: sommare i minuti delle richieste approvate.
// filter + reduce sono expression che alimentano uno statement (assegnazione).
const richieste = [
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 60 },
  { approvata: true, minuti: 120 },
];
const totaleMinuti = richieste
  .filter((r) => r.approvata)
  .reduce((s, r) => s + r.minuti, 0);
console.log(totaleMinuti); // => 600

// Pattern ERP: normalizzare un codice badge tipo 'UP-001'.
// Statement di assegnazione che incatena expression di string.
function normalizzaBadge(v) {
  return String(v || "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 8);
}
console.log(normalizzaBadge("  up-001 ")); // => UP-001

// Pattern ERP: validare un orario HH:MM con un blocco condizionale.
function orarioValido(orario) {
  if (/^\d{2}:\d{2}$/.test(orario)) {
    return true;
  }
  return false;
}
console.log(orarioValido("08:30")); // => true
console.log(orarioValido("8:3"));   // => false

// Pattern ERP: salvare l'ora di Roma come naive-UTC (modulo timbratura).
// Qui dentro convivono dichiarazioni, expression e return statement.
function orarioRomaHHMM(date = new Date()) {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hh = parts.find((p) => p.type === "hour").value;
  const mm = parts.find((p) => p.type === "minute").value;
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}
console.log(/^\d{2}:\d{2}$/.test(orarioRomaHHMM())); // => true

// Pattern ERP: trasformare righe DB in DTO con map (expression -> const).
const dipendenti = [
  { nome: "Mario", cognome: "Rossi", reparto: { sigla: "UP" } },
  { nome: "Lucia", cognome: "Bianchi", reparto: null },
];
const dto = dipendenti.map((d) => ({
  etichetta: `${d.nome} ${d.cognome}`,
  sigla: d.reparto?.sigla ?? "XX", // optional chaining + nullish
}));
console.log(dto[0]); // => { etichetta: 'Mario Rossi', sigla: 'UP' }
console.log(dto[1]); // => { etichetta: 'Lucia Bianchi', sigla: 'XX' }

// Pattern ERP: merge di impostazioni turno con default (spread expression).
const DEFAULT_TURNO = { regola: "arrotonda", pausa: 60 };
function applicaImpostazioni(impostazioni = {}) {
  return { ...DEFAULT_TURNO, ...impostazioni };
}
console.log(applicaImpostazioni({ pausa: 30 })); // => { regola: 'arrotonda', pausa: 30 }

// ------------------------------------------------------------
// 11) STATEMENT VUOTO E LABEL (avanzato, raramente usati)
// ------------------------------------------------------------

// Empty statement: un ; da solo non fa nulla (attenzione ai bug).
for (let i = 0; i < 3; i++); // il ; chiude il for: corpo vuoto!
// console.log(i); // i non visibile fuori

// Labeled statement: etichetta un ciclo per break/continue mirati.
esterno: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue esterno; // salta all'iterazione esterna
    console.log(i, j); // => 0 0 / 1 0 / 2 0
  }
}

// Arrow funtion expression: una funzione anonima assegnata a una variabile (expression). 
const numeri = [1, 2, 3, 4, 5, 6];

const estrai = (numeri) => {
  return numeri.filter(((n)=>n>=3));
};

console.log(estrai(numeri));

//reduce()
richieste.reduce((s, r) => s + r.minuti, 0) //METODO1 

let s = 0;
for (const r of richieste) {
    s = s + r.minuti;   // METODO2
}

// ------------------------------------------------------------
// RIEPILOGO COMANDI
// ------------------------------------------------------------
/*
  let / const / var        -> dichiarazione variabili (statement)
  function / =>            -> dichiarazione ed expression di funzione
  ;                        -> separatore di statement (semicolon)
  { ... }                  -> code block (block scope con let/const)
  if / else if / else      -> statement condizionale
  ? :                      -> operatore ternario (expression)
  switch / case / default  -> selezione multipla
  for / while / do...while -> cicli
  for...of                 -> itera valori (iterabili)
  for...in                 -> itera chiavi (oggetti)
  break / continue         -> controllo di flusso nei cicli
  return                   -> ritorna un valore da una funzione
  throw / try / catch      -> lancio e gestione errori
  label:                   -> labeled statement per break/continue mirati
  reduce()                 -> Prendi tanti valori e combinali in uno solo 
  String() .trim() .toUpperCase() .replace() .slice() .padStart()
  Array .filter() .reduce() .map() .find()
  ?. (optional chaining) / ?? (nullish coalescing) / ... (spread)
  Intl.DateTimeFormat().formatToParts() / RegExp .test()
  
*/
