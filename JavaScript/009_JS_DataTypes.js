/* ============================================================
   9 JS DataTypes
   I tipi di dato in JavaScript: primitives vs objects, l'operatore
   typeof, il dynamic typing (tipizzazione dinamica) e la differenza
   tra undefined e null. JavaScript ha 7 primitives (string, number,
   bigint, boolean, undefined, symbol, null) e un solo tipo di
   reference: object (che include array, function, Date, ecc.).
   Le primitives sono immutabili e copiate per valore; gli objects
   sono copiati per reference.
   ============================================================ */

// ============================================================
// 1) LE 7 PRIMITIVES
// ============================================================

// string: sequenza di caratteri (testo)
const nome = "Mario";            // doppi apici
const cognome = 'Rossi';         // apici singoli
const badge = `UP-001`;          // template literal (backtick)
console.log(typeof nome);        // => string

// number: interi e decimali (un solo tipo numerico, IEEE 754 double)
const oreLavorate = 7.5;
const dipendenti = 42;
console.log(typeof oreLavorate); // => number

// bigint: interi di precisione arbitraria (suffisso n)
const grande = 9007199254740993n;
console.log(typeof grande);      // => bigint

// boolean: vero/falso
const presente = true;
console.log(typeof presente);    // => boolean

// undefined: variabile dichiarata ma non assegnata
let pausa;
console.log(typeof pausa);       // => undefined

// symbol: identificatore unico e immutabile
const id = Symbol("id");
console.log(typeof id);          // => symbol

// null: assenza intenzionale di valore (vedi sezione 7 per il "bug" di typeof)
const reparto = null;
console.log(typeof reparto);     // => object  (storico bug di JS!)

// ============================================================
// 2) OBJECTS (reference types)
// ============================================================

// object literal: collezione di coppie chiave-valore
const dipendente = { nome: "Anna", codiceBadge: "UP-007", reparto: "PR" };
console.log(typeof dipendente);  // => object

// array: e' un object specializzato (indici numerici)
const turni = ["P4", "P2", "P4"];
console.log(typeof turni);       // => object  (non "array"!)

// function: e' un callable object
function timbra() { return "ok"; }
console.log(typeof timbra);      // => function  (caso speciale di typeof)

// Date: object built-in
const adesso = new Date();
console.log(typeof adesso);      // => object

// Per distinguere un array da un object generico usa Array.isArray
console.log(Array.isArray(turni));      // => true
console.log(Array.isArray(dipendente)); // => false

// ============================================================
// 3) PRIMITIVES vs OBJECTS: copia per valore vs per reference
// ============================================================

// Le primitives si copiano per VALORE: a e b sono indipendenti
let a = 10;
let b = a;
b = 20;
console.log(a, b);               // => 10 20

// Gli objects si copiano per REFERENCE: puntano allo stesso oggetto
const obj1 = { ore: 8 };
const obj2 = obj1;
obj2.ore = 6;
console.log(obj1.ore);           // => 6  (modificato anche obj1!)

// Per copiare davvero un object: spread (shallow copy)
const copia = { ...obj1 };
copia.ore = 8;
console.log(obj1.ore, copia.ore); // => 6 8

// Confronto: due objects sono uguali solo se sono lo STESSO reference
console.log({ x: 1 } === { x: 1 }); // => false
console.log(isEqual({ x: 1 }, { x: 1 })); // => true
console.log(obj1 === obj2);         // => true
console.log("UP-001" === "UP-001"); // => true (primitives per valore)


// ============================================================
// 4) IMMUTABILITA' delle primitives
// ============================================================

// Una primitive non puo' essere modificata: i metodi creano NUOVI valori
let codice = "up-001";
codice.toUpperCase();            // non modifica codice
console.log(codice);             // => up-001
codice = codice.toUpperCase();   // bisogna riassegnare
console.log(codice);             // => UP-001

// const blocca la riassegnazione della variabile, NON il contenuto dell'object
const config = { soglia: 5 };
config.soglia = 10;              // OK: muto il contenuto
console.log(config.soglia);      // => 10
// config = {};                  // TypeError: Assignment to constant variable

// Per congelare davvero un object: Object.freeze
const fisso = Object.freeze({ regola: "arrotonda" });
fisso.regola = "tronca";         // ignorato (in strict mode: errore)
console.log(fisso.regola);       // => arrotonda
console.log(Object.isFrozen(fisso)); // => true

// ============================================================
// 5) DYNAMIC TYPING (tipizzazione dinamica)
// ============================================================

// Il tipo e' legato al VALORE, non alla variabile: puo' cambiare a runtime
let dato = "ciao";
console.log(typeof dato);        // => string
dato = 123;
console.log(typeof dato);        // => number
dato = true;
console.log(typeof dato);        // => boolean
dato = { id: 1 };
console.log(typeof dato);        // => object

// Conseguenza: coercizione automatica nelle operazioni
console.log("5" + 3);            // => 53  (number convertito in string)
console.log("5" - 3);            // => 2   (string convertita in number)
console.log("5" * "2");          // => 10
console.log(5 + true);           // => 6   (true => 1)
console.log("abc" * 2);          // => NaN (Not a Number, ma typeof NaN === "number")
console.log(typeof NaN);         // => number

// Confronto loose (==) vs strict (===)
console.log(0 == "");            // => true  (coercizione)
console.log(0 === "");           // => false (tipi diversi)
console.log(1 == "1");           // => true
console.log(1 === "1");          // => false
// Regola pratica: usa SEMPRE === per evitare sorprese

// ============================================================
// 6) CONVERSIONI DI TIPO esplicite
// ============================================================

// String(...) / Number(...) / Boolean(...) sono i modi piu' chiari
console.log(String(42));         // => "42"
console.log(Number("3.14"));     // => 3.14
console.log(Number("abc"));      // => NaN
console.log(Boolean(0));         // => false
console.log(Boolean("x"));       // => true

// parseInt / parseFloat: leggono numeri da stringhe "sporche"
console.log(parseInt("08:30", 10)); // => 8   (specifica sempre la base 10)
console.log(parseFloat("7.5h"));    // => 7.5

// Falsy values (diventano false in Boolean): false, 0, "", null, undefined, NaN
// Tutto il resto e' truthy (anche [], {}, "0", "false")
console.log(Boolean([]));        // => true
console.log(Boolean("false"));   // => true

// ============================================================
// 7) UNDEFINED vs NULL
// ============================================================

// undefined: il valore non e' stato ASSEGNATO (lo mette JS)
let x;
console.log(x);                  // => undefined
const ogg = {};
console.log(ogg.inesistente);    // => undefined (proprieta' assente)
function f(p) { return p; }
console.log(f());                // => undefined (argomento mancante)

// null: assenza INTENZIONALE di valore (lo mette il programmatore)
let repartoAssegnato = null;     // "so che ora non c'e' un reparto"

// typeof: differenza storica
console.log(typeof undefined);   // => undefined
console.log(typeof null);        // => object  (bug storico mai corretto)

// Confronti
console.log(null == undefined);  // => true  (loose: sono "vuoti" entrambi)
console.log(null === undefined); // => false (strict: tipi diversi)
console.log(null == 0);          // => false (null non si converte a 0!)

// In aritmetica si comportano diversamente
console.log(null + 1);           // => 1   (null => 0)
console.log(undefined + 1);      // => NaN (undefined => NaN)

// ============================================================
// 8) GESTIRE i valori mancanti (operatori moderni ES2020)
// ============================================================

// Optional chaining ?. : evita errori su null/undefined annidati
const row = { dipendente: { nome: "Lia" } };
console.log(row.dipendente?.nome);     // => Lia
console.log(row.timbratura?.ingresso); // => undefined (niente crash)

// Nullish coalescing ?? : fallback SOLO se null o undefined
const sigla = null;
console.log(sigla ?? "XX");      // => XX
console.log(0 ?? "XX");          // => 0  (0 non e' nullish, a differenza di ||)
console.log(0 || "XX");          // => XX (|| scatta su tutti i falsy)

// Logical nullish assignment ??= : assegna solo se la var e' null/undefined
const impostazioni = { regola: undefined };
impostazioni.regola ??= "arrotonda";
console.log(impostazioni.regola); // => arrotonda

// ============================================================
// 9) ESEMPI ISPIRATI AL GESTIONALE ERP
// ============================================================

// (a) Validare un codice badge: typeof + normalizzazione di una primitive
function normalizzaBadge(v) {
  // se non e' una string usa stringa vuota, poi pulisci e accorcia
  return String(v ?? "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 8);
}
console.log(normalizzaBadge("  up-001 "));  // => UP-001
console.log(normalizzaBadge(null));         // => "" (nessun crash)
console.log(normalizzaBadge(7));            // => 7  (numero coerced a string)

// (b) Distinguere reparto assegnato (object) da non assegnato (null)
function siglaReparto(dipendente) {
  // optional chaining + nullish: gestisce reparto null o assente
  return dipendente.reparto?.sigla ?? "XX";
}
console.log(siglaReparto({ nome: "Ada", reparto: { sigla: "PR" } })); // => PR
console.log(siglaReparto({ nome: "Bo", reparto: null }));             // => XX

// (c) Somma ore: distinzione tra dato presente (number) e mancante (null)
const timbrature = [
  { giorno: "lun", ore: 8 },
  { giorno: "mar", ore: null },   // assenza intenzionale
  { giorno: "mer", ore: 6.5 },
];
const totale = timbrature.reduce((s, t) => s + (t.ore ?? 0), 0);
console.log(totale);             // => 14.5

// (d) Merge di impostazioni: DEFAULT + override, gli object si fondono
const DEFAULT_TURNO = { pausa: true, minuti: 480 };
function creaTurno(override = {}) {
  return { ...DEFAULT_TURNO, ...override }; // shallow merge (nuovo object)
}
console.log(creaTurno());                       // => { pausa: true, minuti: 480 }
console.log(creaTurno({ pausa: false }));       // => { pausa: false, minuti: 480 }

// (e) typeof come guardia di tipo prima di operare
function minutiDaOre(ore) {
  if (typeof ore !== "number" || Number.isNaN(ore)) return 0;
  return Math.round(ore * 60);
}
console.log(minutiDaOre(7.5));   // => 450
console.log(minutiDaOre("7.5")); // => 0  (string rifiutata)
console.log(minutiDaOre(NaN));   // => 0

// (f) Controllo robusto "e' un vero object" (non null, non array)
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
console.log(isPlainObject({ id: 1 })); // => true
console.log(isPlainObject(null));      // => false
console.log(isPlainObject([1, 2]));    // => false

// ============================================================
// 10) CONTROLLI UTILI sui tipi (riepilogo pratico)
// ============================================================

console.log(Number.isInteger(42));        // => true
console.log(Number.isNaN(NaN));           // => true (piu' sicuro di isNaN globale)
console.log(Number.isFinite(Infinity));   // => false
console.log(typeof Infinity);             // => number
console.log(typeof function () {});       // => function
console.log(Array.isArray([]));           // => true

/* ============================================================
   RIEPILOGO COMANDI (scheda memoria rapida)
   ------------------------------------------------------------
   PRIMITIVES   : string, number, bigint, boolean, undefined, symbol, null
   typeof       : "string"|"number"|"bigint"|"boolean"|"undefined"|
                  "symbol"|"object"|"function"  (typeof null === "object")
   Array.isArray(v)         -> distingue array da object
   Object.freeze / isFrozen -> immutabilita' di un object
   { ...obj }               -> shallow copy / merge di object
   String() Number() Boolean() -> conversioni esplicite
   parseInt(str, 10) / parseFloat(str) -> numeri da string
   Number.isNaN / isInteger / isFinite -> check numerici sicuri
   ?.   (optional chaining)  -> accesso sicuro su null/undefined
   ??   (nullish coalescing) -> fallback solo su null/undefined
   ??=  (nullish assignment) -> assegna solo se null/undefined
   ==  vs  ===              -> usa SEMPRE === (no coercizione)
   undefined = non assegnato (JS) ; null = vuoto intenzionale (dev)
   Falsy: false, 0, "", null, undefined, NaN
   isEqual()
   ============================================================ */
