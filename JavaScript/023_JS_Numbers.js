/* ============================================================
   23 JS Numbers
   In JavaScript esiste un solo tipo numerico standard: Number,
   un floating point a 64 bit (IEEE 754 double precision). Lo
   stesso tipo rappresenta sia interi (integer) sia decimali
   (float). Da questo derivano valori speciali come NaN e
   Infinity, e i celebri problemi di precisione floating point.
   Per gli interi molto grandi esiste il tipo separato BigInt.
   ============================================================ */

// ------------------------------------------------------------
// 1. INTEGER E FLOAT: un unico tipo Number
// ------------------------------------------------------------

// Interi e decimali sono entrambi typeof 'number'
const intero = 42;
const decimale = 3.14;
console.log(typeof intero, typeof decimale); // => number number

// Anche un intero "tondo" e in realta un double
console.log(7 === 7.0); // => true

// Notazione esponenziale (scientific notation)
const grande = 1.5e6;   // 1.5 * 10^6
const piccolo = 2e-4;   // 0.0002
console.log(grande, piccolo); // => 1500000 0.0002

// ------------------------------------------------------------
// 2. LETTERALI: basi diverse e separatori
// ------------------------------------------------------------

const dec = 255;
const hex = 0xff;      // esadecimale
const oct = 0o377;     // ottale
const bin = 0b11111111; // binario
console.log(dec, hex, oct, bin); // => 255 255 255 255

// Separatore numerico _ (solo leggibilita, ignorato dal motore)
const stipendio = 1_250_000;
console.log(stipendio); // => 1250000

// ------------------------------------------------------------
// 3. OPERAZIONI ARITMETICHE
// ------------------------------------------------------------

console.log(10 + 3);   // => 13
console.log(10 - 3);   // => 7
console.log(10 * 3);   // => 30
console.log(10 / 3);   // => 3.3333333333333335
console.log(10 % 3);   // => 1   (modulo / resto)
console.log(2 ** 10);  // => 1024 (exponentiation)

// Incremento/decremento
let x = 5;
console.log(x++); // => 5 (post-incremento: ritorna poi aumenta)
console.log(++x); // => 7 (pre-incremento: aumenta poi ritorna)

// ------------------------------------------------------------
// 4. NaN (Not-a-Number)
// ------------------------------------------------------------

// NaN nasce da operazioni numeriche non valide
console.log(0 / 0);            // => NaN
console.log(parseInt('ciao')); // => NaN
console.log(Math.sqrt(-1));    // => NaN

// NaN e l'unico valore diverso da se stesso!
console.log(NaN === NaN); // => false

// Per testarlo si usa Number.isNaN (NON il vecchio isNaN globale)
console.log(Number.isNaN(NaN));   // => true
console.log(Number.isNaN('ciao')); // => false (non fa coercion)
console.log(isNaN('ciao'));        // => true  (fa coercion, sconsigliato)

// ------------------------------------------------------------
// 5. Infinity e -Infinity
// ------------------------------------------------------------

console.log(1 / 0);   // => Infinity
console.log(-1 / 0);  // => -Infinity
console.log(Infinity + 1);        // => Infinity
console.log(Infinity - Infinity); // => NaN

// Numeri rappresentabili: limiti
console.log(Number.MAX_VALUE);     // => 1.7976931348623157e+308
console.log(Number.MIN_VALUE);     // => 5e-324 (piu piccolo positivo)
console.log(Number.MAX_VALUE * 2); // => Infinity (overflow)

// Test di finitezza
console.log(Number.isFinite(42));       // => true
console.log(Number.isFinite(Infinity)); // => false

// ------------------------------------------------------------
// 6. PRECISIONE FLOATING POINT (il classico tranello)
// ------------------------------------------------------------

// I decimali in base 2 non rappresentano esattamente 0.1, 0.2...
console.log(0.1 + 0.2);            // => 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);    // => false

// Soluzione 1: arrotondamento con toFixed (ritorna STRING)
const somma = (0.1 + 0.2).toFixed(2);
console.log(somma, typeof somma); // => 0.30 string

// Soluzione 2: confronto con tolleranza (epsilon)
const quasiUguali = Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;
console.log(quasiUguali); // => true
console.log(Number.EPSILON); // => 2.220446049250313e-16

// Soluzione 3: lavorare in interi (es. centesimi di euro)
const euro = 19.99;
const centesimi = Math.round(euro * 100); // => 1999
console.log(centesimi / 100); // => 19.99

// Interi sicuri: oltre 2^53-1 si perde precisione
console.log(Number.MAX_SAFE_INTEGER);          // => 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1);      // => 9007199254740992
console.log(Number.MAX_SAFE_INTEGER + 2);      // => 9007199254740992 (!)
console.log(Number.isSafeInteger(9007199254740991)); // => true

// ------------------------------------------------------------
// 7. CONVERSIONE STRINGA -> NUMERO
// ------------------------------------------------------------

console.log(Number('42'));     // => 42
console.log(Number('3.14'));   // => 3.14
console.log(Number(''));       // => 0  (attenzione!)
console.log(Number('  10  ')); // => 10 (trim automatico)
console.log(Number('10px'));   // => NaN

console.log(parseInt('10px'));     // => 10 (legge finche puo)
console.log(parseInt('ff', 16));   // => 255 (base esadecimale)
console.log(parseFloat('3.14m'));  // => 3.14

// Operatore unario + come conversione rapida
console.log(+'7' + 1); // => 8

// ------------------------------------------------------------
// 8. CONVERSIONE NUMERO -> STRINGA / FORMATTAZIONE
// ------------------------------------------------------------

const n = 255.5;
console.log(n.toString());        // => 255.5
console.log((255).toString(16));  // => ff (in base 16)
console.log((5).toString(2));     // => 101 (in base 2)

// toFixed: numero fisso di decimali
console.log((3.14159).toFixed(2)); // => 3.14

// toPrecision: numero totale di cifre significative
console.log((3.14159).toPrecision(3)); // => 3.14

// padStart utile per formattare ore (pattern ERP timbrature)
const ore = 9;
const minuti = 5;
const orario = `${String(ore).padStart(2, '0')}:${String(minuti).padStart(2, '0')}`;
console.log(orario); // => 09:05

// ------------------------------------------------------------
// 9. INTL.NUMBERFORMAT: valute e locale
// ------------------------------------------------------------

const fmtEuro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
});
console.log(fmtEuro.format(1250.5)); // => 1.250,50 €

const fmtPerc = new Intl.NumberFormat('it-IT', { style: 'percent' });
console.log(fmtPerc.format(0.4275)); // => 43%

// ------------------------------------------------------------
// 10. OGGETTO Math (statico, metodi di utilita)
// ------------------------------------------------------------

console.log(Math.round(2.5)); // => 3
console.log(Math.floor(2.9)); // => 2
console.log(Math.ceil(2.1));  // => 3
console.log(Math.trunc(-2.7));// => -2 (taglia, non arrotonda)
console.log(Math.abs(-5));    // => 5
console.log(Math.max(3, 9, 1));// => 9
console.log(Math.min(3, 9, 1));// => 1
console.log(Math.sqrt(144));  // => 12
console.log(Math.pow(2, 8));  // => 256
console.log(Math.sign(-3));   // => -1

// Numero casuale: intero in [min, max]
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(randomInt(1, 6) >= 1); // => true (simula un dado)

// ------------------------------------------------------------
// 11. BigInt: interi di precisione arbitraria
// ------------------------------------------------------------

// Si crea col suffisso n oppure con BigInt()
const big = 9007199254740993n;
const big2 = BigInt('123456789012345678901234567890');
console.log(typeof big); // => bigint

// Risolve il problema dei MAX_SAFE_INTEGER
console.log(9007199254740991n + 2n); // => 9007199254740993n (corretto!)

// Aritmetica tra BigInt
console.log(10n * 3n);  // => 30n
console.log(10n / 3n);  // => 3n (divisione INTERA, niente decimali)
console.log(2n ** 64n); // => 18446744073709551616n

// Non si possono mischiare Number e BigInt direttamente
try {
  // eslint-disable-next-line
  console.log(1n + 1);
} catch (e) {
  console.log(e.constructor.name); // => TypeError
}
// Va fatta una conversione esplicita
console.log(1n + BigInt(1)); // => 2n
console.log(Number(10n) + 1); // => 11

// Confronto sciolto (==) funziona, stretto (===) distingue il tipo
console.log(10n == 10);  // => true
console.log(10n === 10); // => false

// ------------------------------------------------------------
// 12. ESEMPI PRATICI ISPIRATI AL GESTIONALE ERP
// ------------------------------------------------------------

// Esempio A: somma dei minuti lavorati e conversione in ore decimali.
// Pattern: filter+reduce, poi formattazione robusta.
const timbrature = [
  { dipendente: 'UP-001', minuti: 480 },
  { dipendente: 'UP-001', minuti: 95 },
  { dipendente: 'UP-001', minuti: 30 },
];
const minutiTotali = timbrature.reduce((s, t) => s + t.minuti, 0);
const oreDecimali = (minutiTotali / 60).toFixed(2);
console.log(`Ore lavorate: ${oreDecimali}`); // => Ore lavorate: 10.08

// Esempio B: minuti -> formato HH:MM (turni P4/P2)
function minutiToHHMM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
console.log(minutiToHHMM(605)); // => 10:05

// Esempio C: importo vestiario/DPI calcolato in centesimi per evitare
// errori floating point sulle somme di prezzi.
const ordineVestiario = [
  { articolo: 'Tuta', prezzo: 24.99, qta: 3 },
  { articolo: 'Guanti', prezzo: 4.5, qta: 10 },
];
const totaleCentesimi = ordineVestiario.reduce(
  (s, r) => s + Math.round(r.prezzo * 100) * r.qta,
  0,
);
console.log(`Totale: ${fmtEuro.format(totaleCentesimi / 100)}`); // => Totale: 119,97 €

// Esempio D: estrarre il numero progressivo dal codice badge 'UP-001'.
function numeroBadge(codice) {
  const match = codice.match(/-(\d+)$/);
  return match ? Number(match[1]) : NaN;
}
console.log(numeroBadge('UP-042')); // => 42
console.log(numeroBadge('XX'));     // => NaN

// Esempio E: validare e arrotondare le ore secondo una regola aziendale
// (default param come nel modulo timbrature ERP).
function arrotondaOre(ore, regolaMinuti = 15) {
  if (!Number.isFinite(ore) || ore < 0) return 0;
  const passo = regolaMinuti / 60;
  return Math.round(ore / passo) * passo;
}
console.log(arrotondaOre(7.97)); // => 8
console.log(arrotondaOre(7.6));  // => 7.5

// Esempio F: scorta minima vestiario, confronto sicuro con Number.
function sottoScorta(quantita, scortaMinima) {
  const q = Number(quantita);
  return Number.isFinite(q) && q < scortaMinima;
}
console.log(sottoScorta('3', 5)); // => true
console.log(sottoScorta('', 5));  // => true (Number('') === 0)

// ------------------------------------------------------------
// 13. CLAMP E UTILITY NUMERICHE COMUNI
// ------------------------------------------------------------

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
console.log(clamp(150, 0, 100)); // => 100
console.log(clamp(-3, 0, 100));  // => 0

// Media difensiva (evita divisione per zero)
const media = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
console.log(media([8, 9, 10])); // => 9
console.log(media([]));         // => 0

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   typeof, ** (exponentiation), % (modulo)
   Number(), parseInt(), parseFloat(), + unario
   NaN, isNaN(), Number.isNaN()
   Infinity, -Infinity, Number.isFinite()
   Number.MAX_VALUE, Number.MIN_VALUE, Number.EPSILON
   Number.MAX_SAFE_INTEGER, Number.isSafeInteger()
   num.toFixed(), num.toPrecision(), num.toString(base)
   String().padStart()
   Intl.NumberFormat (style:'currency'/'percent').format()
   Math.round/floor/ceil/trunc/abs/max/min/sqrt/pow/sign/random
   BigInt(), letterali 123n
   ============================================================ */
