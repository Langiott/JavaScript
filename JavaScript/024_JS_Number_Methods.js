/* ============================================================
   24 JS Number Methods
   I Number methods permettono di formattare, convertire e
   validare i numeri in JavaScript. Vedremo toFixed e toPrecision
   per la formattazione, parseInt e parseFloat per estrarre numeri
   da stringhe, Number() per la conversione esplicita, e i metodi
   di controllo Number.isNaN e Number.isInteger. Sono essenziali in
   un gestionale ERP per ore lavorate, importi, quantita e badge.
   ============================================================ */

// ============================================================
// 1. toFixed() - fissa il numero di cifre decimali
// ============================================================

// toFixed(n) ritorna una STRING con n cifre decimali (arrotondate)
const prezzo = 19.9876;
console.log(prezzo.toFixed(2)); // => "19.99"
console.log(prezzo.toFixed(0)); // => "20"
console.log(prezzo.toFixed(4)); // => "19.9876"

// Attenzione: il risultato e' sempre una string, non un number
console.log(typeof (12.5).toFixed(1)); // => "string"

// Aggiunge zeri se servono per raggiungere n decimali
console.log((5).toFixed(2)); // => "5.00"

// toFixed usa arrotondamento half-up (ma con i limiti del floating point)
console.log((1.005).toFixed(2)); // => "1.00" (gotcha floating point!)
console.log((2.675).toFixed(2)); // => "2.67" (idem)

// Per ri-convertire a number basta il prefisso +
const importoNum = +(99.567).toFixed(2);
console.log(importoNum, typeof importoNum); // => 99.57 'number'

// ============================================================
// 2. toPrecision() - fissa il numero totale di cifre significative
// ============================================================

// toPrecision(n) considera TUTTE le cifre (intere + decimali)
const valore = 123.456;
console.log(valore.toPrecision(2)); // => "1.2e+2"
console.log(valore.toPrecision(4)); // => "123.5"
console.log(valore.toPrecision(6)); // => "123.456"

// Anche toPrecision ritorna una string
console.log(typeof (3.14159).toPrecision(3)); // => "string"

// Senza argomento si comporta come toString()
console.log((42.5).toPrecision()); // => "42.5"

// ============================================================
// 3. Number() - conversione esplicita a number
// ============================================================

// Number() converte stringhe, boolean, null in number
console.log(Number("42")); // => 42
console.log(Number("3.14")); // => 3.14
console.log(Number("   7  ")); // => 7 (gli spazi vengono ignorati)
console.log(Number("")); // => 0 (string vuota diventa 0)
console.log(Number("12px")); // => NaN (non e' un numero puro)
console.log(Number(true)); // => 1
console.log(Number(false)); // => 0
console.log(Number(null)); // => 0
console.log(Number(undefined)); // => NaN
console.log(Number("0x1F")); // => 31 (esadecimale)
console.log(Number("1e3")); // => 1000 (notazione scientifica)

// ============================================================
// 4. parseInt() - estrae un intero da una string
// ============================================================

// parseInt legge finche' trova cifre valide, poi si ferma
console.log(parseInt("42px")); // => 42
console.log(parseInt("3.99")); // => 3 (tronca i decimali)
console.log(parseInt("   15 anni")); // => 15
console.log(parseInt("anni 15")); // => NaN (non inizia con cifra)

// SEMPRE specificare la base (radix) come secondo argomento
console.log(parseInt("100", 10)); // => 100 (base 10)
console.log(parseInt("100", 2)); // => 4 (binario)
console.log(parseInt("FF", 16)); // => 255 (esadecimale)
console.log(parseInt("0x1F", 16)); // => 31

// ============================================================
// 5. parseFloat() - estrae un numero con decimali da una string
// ============================================================

console.log(parseFloat("3.14metri")); // => 3.14
console.log(parseFloat("  7.5kg ")); // => 7.5
console.log(parseFloat("1.2.3")); // => 1.2 (si ferma al secondo punto)
console.log(parseFloat("1e3")); // => 1000
console.log(parseFloat("ciao")); // => NaN

// Differenza chiave tra Number e parseFloat
console.log(Number("12.5px")); // => NaN (deve essere numero puro)
console.log(parseFloat("12.5px")); // => 12.5 (estrae il prefisso numerico)

// ============================================================
// 6. Number.isNaN() - controlla se un valore e' NaN
// ============================================================

// NaN e' l'unico valore in JS che non e' uguale a se stesso
console.log(NaN === NaN); // => false

// Number.isNaN e' affidabile: ritorna true SOLO per il vero NaN
console.log(Number.isNaN(NaN)); // => true
console.log(Number.isNaN(42)); // => false
console.log(Number.isNaN("ciao")); // => false (string, non NaN)

// Il vecchio isNaN globale fa coercion ed e' insidioso
console.log(isNaN("ciao")); // => true (converte prima a NaN)
console.log(Number.isNaN("ciao")); // => false (nessuna coercion)
// Preferisci SEMPRE Number.isNaN

// ============================================================
// 7. Number.isInteger() - controlla se e' un intero
// ============================================================

console.log(Number.isInteger(10)); // => true
console.log(Number.isInteger(10.0)); // => true (10.0 === 10)
console.log(Number.isInteger(10.5)); // => false
console.log(Number.isInteger("10")); // => false (string, niente coercion)
console.log(Number.isInteger(NaN)); // => false
console.log(Number.isInteger(Infinity)); // => false

// Metodi affini utili
console.log(Number.isFinite(42)); // => true
console.log(Number.isFinite(Infinity)); // => false
console.log(Number.isSafeInteger(2 ** 53)); // => false (oltre il limite sicuro)

// ============================================================
// 8. Esempi ERP: ore lavorate e importi
// ============================================================

// Calcolo ore lavorate da minuti totali e formattazione a 2 decimali
const minutiLavorati = 487; // 8h 7m
const oreDecimali = minutiLavorati / 60;
console.log(oreDecimali.toFixed(2)); // => "8.12"

// Somma importi vestiario/DPI e arrotondamento valuta
const righeOrdine = [
  { articolo: "Tuta", prezzo: 24.9, qta: 3 },
  { articolo: "Guanti", prezzo: 4.55, qta: 10 },
  { articolo: "Scarpe", prezzo: 38.999, qta: 2 },
];
const totale = righeOrdine.reduce((s, r) => s + r.prezzo * r.qta, 0);
console.log(`Totale ordine: ${totale.toFixed(2)} EUR`); // => Totale ordine: 198.20 EUR

// Estrazione progressivo numerico dal codice badge 'UP-001'
function numeroBadge(codice) {
  const match = String(codice).match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : NaN;
}
console.log(numeroBadge("UP-001")); // => 1
console.log(numeroBadge("UP-042")); // => 42
console.log(Number.isNaN(numeroBadge("BADGE"))); // => true

// Validazione quantita inserita da form (string) per scorta DPI
function quantitaValida(input) {
  const n = Number(input);
  return Number.isInteger(n) && n > 0;
}
console.log(quantitaValida("5")); // => true
console.log(quantitaValida("5.5")); // => false
console.log(quantitaValida("ciao")); // => false
console.log(quantitaValida("-3")); // => false

// Parsing taglia/quantita da una string libera "12 paia"
function quantitaDaTesto(testo) {
  const n = parseInt(testo, 10);
  return Number.isNaN(n) ? 0 : n;
}
console.log(quantitaDaTesto("12 paia")); // => 12
console.log(quantitaDaTesto("nessuna")); // => 0

// ============================================================
// 9. Esempi ERP avanzati: report ore reparto
// ============================================================

// Calcolo media ore di un reparto con guardia su input non numerici
const timbrature = [
  { badge: "UP-001", ore: "8.5" },
  { badge: "UP-002", ore: "7.75" },
  { badge: "UP-003", ore: "n/d" }, // dato sporco
  { badge: "UP-004", ore: "8" },
];

const oreValide = timbrature
  .map((t) => parseFloat(t.ore))
  .filter((n) => !Number.isNaN(n));

const mediaOre = oreValide.reduce((s, n) => s + n, 0) / oreValide.length;
console.log(`Media ore reparto: ${mediaOre.toFixed(2)}`); // => Media ore reparto: 8.08
console.log(`Timbrature scartate: ${timbrature.length - oreValide.length}`); // => Timbrature scartate: 1

// Percentuale di completamento turno (P4 = 480 minuti) con toPrecision
function percentualeTurno(minutiFatti, minutiTurno = 480) {
  const perc = (minutiFatti / minutiTurno) * 100;
  return perc.toPrecision(3) + "%";
}
console.log(percentualeTurno(360)); // => "75.0%"
console.log(percentualeTurno(480)); // => "100%"
console.log(percentualeTurno(123)); // => "25.6%"

// Conversione sicura di un importo da localStorage (sempre string)
function leggiImporto(raw, fallback = 0) {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}
console.log(leggiImporto("19.90")); // => 19.9
console.log(leggiImporto(null)); // => 0
console.log(leggiImporto("abc", 100)); // => 100

// ============================================================
// 10. Gotcha riepilogo veloce
// ============================================================

// toFixed/toPrecision -> ritornano STRING (ricordare il +)
// Number("") -> 0, ma parseInt("") -> NaN
console.log(Number(""), parseInt("", 10)); // => 0 NaN
// isNaN globale fa coercion, Number.isNaN no -> usa Number.isNaN
// parseInt SENZA radix puo' essere ambiguo -> metti sempre la base 10

// ============================================================
// RIEPILOGO COMANDI
// ============================================================
/*
  (num).toFixed(n)        -> string con n decimali (arrotonda)
  (num).toPrecision(n)    -> string con n cifre significative
  Number(valore)          -> conversione esplicita a number (numero puro)
  parseInt(str, radix)    -> estrae intero da string (specifica radix!)
  parseFloat(str)         -> estrae numero con decimali da string
  Number.isNaN(v)         -> true solo per il vero NaN (no coercion)
  isNaN(v)                -> globale, fa coercion (sconsigliato)
  Number.isInteger(v)     -> true se v e' un intero
  Number.isFinite(v)      -> true se v e' un numero finito
  Number.isSafeInteger(v) -> true se intero entro i limiti sicuri
  +(str)                  -> coercion rapida a number
*/
