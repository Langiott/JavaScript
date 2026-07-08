/* ============================================================
   25 JS Math
   L'oggetto Math e' un built-in object che fornisce costanti e
   funzioni matematiche. Non e' un constructor: non si usa con
   "new", ma si chiamano direttamente i suoi metodi statici
   (Math.round, Math.random, ecc.). Tutti i metodi lavorano su
   numeri di tipo Number (floating point a 64 bit). In questo file
   vediamo arrotondamenti (round/floor/ceil/trunc), numeri casuali
   (random), minimi/massimi (min/max), valore assoluto (abs),
   potenze (pow) e radici (sqrt), con molti esempi pratici.
   ============================================================ */

// ------------------------------------------------------------
// 1) COSTANTI principali dell'oggetto Math
// ------------------------------------------------------------

// Math.PI: il pi greco
console.log(Math.PI); // => 3.141592653589793

// Math.E: numero di Eulero (base dei logaritmi naturali)
console.log(Math.E); // => 2.718281828459045

// Math.SQRT2: radice quadrata di 2
console.log(Math.SQRT2); // => 1.4142135623730951

// ------------------------------------------------------------
// 2) Math.round() — arrotonda all'intero piu' vicino
// ------------------------------------------------------------

// .5 va sempre verso l'alto (verso +Infinity)
console.log(Math.round(2.4)); // => 2
console.log(Math.round(2.5)); // => 3
console.log(Math.round(2.6)); // => 3

// Attenzione ai negativi: -2.5 arrotonda a -2 (non a -3!)
console.log(Math.round(-2.5)); // => -2
console.log(Math.round(-2.6)); // => -3

// ------------------------------------------------------------
// 3) Math.floor() — arrotonda per difetto (verso -Infinity)
// ------------------------------------------------------------

console.log(Math.floor(2.9)); // => 2
console.log(Math.floor(2.1)); // => 2
console.log(Math.floor(-2.1)); // => -3 (va verso il basso!)

// ------------------------------------------------------------
// 4) Math.ceil() — arrotonda per eccesso (verso +Infinity)
// ------------------------------------------------------------

console.log(Math.ceil(2.1)); // => 3
console.log(Math.ceil(2.9)); // => 3
console.log(Math.ceil(-2.9)); // => -2 (va verso l'alto!)

// ------------------------------------------------------------
// 5) Math.trunc() — taglia la parte decimale (no arrotondamento)
// ------------------------------------------------------------

// Rimuove i decimali qualunque sia il segno (verso lo zero)
console.log(Math.trunc(2.9)); // => 2
console.log(Math.trunc(-2.9)); // => -2
console.log(Math.trunc(4.123)); // => 4

// Differenza chiave: floor(-2.9) = -3 ma trunc(-2.9) = -2
console.log(Math.floor(-2.9), Math.trunc(-2.9)); // => -3 -2

// ------------------------------------------------------------
// 6) Arrotondamento a N decimali (pattern comune)
// ------------------------------------------------------------

// toFixed restituisce una STRING, va riconvertita con Number()
const prezzo = 19.999;
console.log(prezzo.toFixed(2)); // => "20.00" (string)
console.log(Number(prezzo.toFixed(2))); // => 20

// Tecnica con Math.round per arrotondare a 2 decimali (number)
const round2 = (n) => Math.round(n * 100) / 100;
console.log(round2(3.14159)); // => 3.14
console.log(round2(2.005)); // => 2 (occhio al float!)

// Versione generica a N decimali
const roundTo = (n, dec = 2) => {
  const f = 10 ** dec;
  return Math.round(n * f) / f;
};
console.log(roundTo(3.14159, 3)); // => 3.142

// ------------------------------------------------------------
// 7) Math.abs() — valore assoluto (toglie il segno)
// ------------------------------------------------------------

console.log(Math.abs(-7)); // => 7
console.log(Math.abs(7)); // => 7
console.log(Math.abs(-3.5)); // => 3.5

// Utile per calcolare la differenza (delta) tra due valori
const delta = (a, b) => Math.abs(a - b);
console.log(delta(10, 14)); // => 4
console.log(delta(14, 10)); // => 4

// ------------------------------------------------------------
// 8) Math.pow() ed operatore ** — potenze
// ------------------------------------------------------------

console.log(Math.pow(2, 10)); // => 1024
console.log(2 ** 10); // => 1024 (sintassi moderna ES2016)
console.log(5 ** 2); // => 25
console.log(2 ** 0.5); // => 1.4142135623730951 (radice quadrata)

// ------------------------------------------------------------
// 9) Math.sqrt() e Math.cbrt() — radici
// ------------------------------------------------------------

console.log(Math.sqrt(81)); // => 9
console.log(Math.sqrt(2)); // => 1.4142135623730951
console.log(Math.sqrt(-1)); // => NaN (radice di negativo)
console.log(Math.cbrt(27)); // => 3 (radice cubica)

// Esempio: teorema di Pitagora (Math.hypot lo fa diretto)
const ipotenusa = Math.sqrt(3 ** 2 + 4 ** 2);
console.log(ipotenusa); // => 5
console.log(Math.hypot(3, 4)); // => 5

// ------------------------------------------------------------
// 10) Math.min() e Math.max() — minimo e massimo
// ------------------------------------------------------------

console.log(Math.min(3, 1, 2)); // => 1
console.log(Math.max(3, 1, 2)); // => 3

// Con un array: usare lo spread operator (...)
const numeri = [12, 5, 27, 3, 19];
console.log(Math.max(...numeri)); // => 27
console.log(Math.min(...numeri)); // => 3

// Senza argomenti: comportamento "identita'"
console.log(Math.min()); // => Infinity
console.log(Math.max()); // => -Infinity

// clamp: limitare un valore in un intervallo [min, max]
const clamp = (val, lo, hi) => Math.min(Math.max(val, lo), hi);
console.log(clamp(150, 0, 100)); // => 100
console.log(clamp(-5, 0, 100)); // => 0
console.log(clamp(42, 0, 100)); // => 42

// ------------------------------------------------------------
// 11) Math.random() — numero casuale in [0, 1)
// ------------------------------------------------------------

// Restituisce un float >= 0 e < 1
const r = Math.random();
console.log(r >= 0 && r < 1); // => true

// Intero casuale tra min e max INCLUSI
const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
console.log(randInt(1, 6) >= 1); // => true (un dado)

// Elemento casuale da un array
const reparti = ['UP', 'MG', 'AM', 'PR'];
const sceltoCasuale = reparti[Math.floor(Math.random() * reparti.length)];
console.log(reparti.includes(sceltoCasuale)); // => true

// ------------------------------------------------------------
// 12) Altri metodi utili
// ------------------------------------------------------------

// Math.sign: segno del numero (-1, 0, 1)
console.log(Math.sign(-8)); // => -1
console.log(Math.sign(0)); // => 0
console.log(Math.sign(8)); // => 1

// Logaritmi
console.log(Math.log(Math.E)); // => 1 (logaritmo naturale)
console.log(Math.log10(1000)); // => 3
console.log(Math.log2(8)); // => 3

// ------------------------------------------------------------
// 13) ESEMPI PRATICI ispirati al gestionale ERP
// ------------------------------------------------------------

// Arrotondamento delle ore lavorate (pattern timbratura):
// minuti totali -> ore con 2 decimali, regola configurabile.
const minutiToOre = (minuti, dec = 2) => roundTo(minuti / 60, dec);
console.log(minutiToOre(450)); // => 7.5  (7 ore e 30 minuti)
console.log(minutiToOre(485)); // => 8.08

// Arrotondamento timbratura al quarto d'ora piu' vicino:
// 7:52 -> 7:45? no, al piu' vicino => 8:00. 09:07 => 09:00.
const arrotondaAlQuarto = (minutiDaMezzanotte) =>
  Math.round(minutiDaMezzanotte / 15) * 15;
console.log(arrotondaAlQuarto(7 * 60 + 52)); // => 480 (08:00)
console.log(arrotondaAlQuarto(9 * 60 + 7)); // => 540 (09:00)

// Differenza assoluta tra ore previste dal turno e ore timbrate
// (per evidenziare scostamenti, in positivo o negativo).
const scostamentoOre = (previste, effettive) =>
  roundTo(Math.abs(previste - effettive));
console.log(scostamentoOre(8, 7.5)); // => 0.5

// Numero di confezioni di DPI necessarie per coprire la scorta:
// servono 47 paia, in confezioni da 10 => ceil per non andare sotto.
const confezioniNecessarie = (richiesti, perConfezione) =>
  Math.ceil(richiesti / perConfezione);
console.log(confezioniNecessarie(47, 10)); // => 5
console.log(confezioniNecessarie(50, 10)); // => 5

// Massimo e minimo delle ore lavorate nel mese da una lista
// di timbrature (DTO semplificato del gestionale).
const timbrature = [
  { badge: 'UP-001', ore: 7.5 },
  { badge: 'UP-002', ore: 8.2 },
  { badge: 'UP-003', ore: 6.9 },
];
const oreArr = timbrature.map((t) => t.ore);
console.log(Math.max(...oreArr)); // => 8.2
console.log(Math.min(...oreArr)); // => 6.9

// Percentuale di scorta rimanente, limitata in [0, 100] con clamp.
const percentualeScorta = (attuale, massima) =>
  clamp(roundTo((attuale / massima) * 100), 0, 100);
console.log(percentualeScorta(30, 40)); // => 75
console.log(percentualeScorta(60, 40)); // => 100 (clampato)

// Generazione di un suffisso numerico casuale per un badge di test
// es: 'UP-' + 3 cifre con padStart per allinearle.
const badgeCasuale = (prefisso = 'UP') => {
  const n = randInt(1, 999);
  return `${prefisso}-${String(n).padStart(3, '0')}`;
};
console.log(/^UP-\d{3}$/.test(badgeCasuale())); // => true

// Costo totale vestiario arrotondato a 2 decimali (parte finanziaria).
const articoli = [
  { nome: 'Tuta', prezzo: 24.99, qta: 3 },
  { nome: 'Guanti', prezzo: 4.5, qta: 10 },
];
const totale = roundTo(
  articoli.reduce((s, a) => s + a.prezzo * a.qta, 0)
);
console.log(totale); // => 119.97

// ------------------------------------------------------------
// 14) Gotcha: i floating point non sono esatti
// ------------------------------------------------------------

console.log(0.1 + 0.2); // => 0.30000000000000004
console.log(roundTo(0.1 + 0.2)); // => 0.3 (arrotondando si normalizza)
console.log(0.1 + 0.2 === 0.3); // => false
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // => true

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   Math.PI, Math.E, Math.SQRT2   -> costanti matematiche
   Math.round(n)                 -> arrotonda all'intero piu' vicino
   Math.floor(n)                 -> arrotonda per difetto (-Infinity)
   Math.ceil(n)                  -> arrotonda per eccesso (+Infinity)
   Math.trunc(n)                 -> taglia i decimali (verso lo zero)
   Math.abs(n)                   -> valore assoluto
   Math.pow(b, e) / b ** e       -> potenza
   Math.sqrt(n) / Math.cbrt(n)   -> radice quadrata / cubica
   Math.hypot(a, b)              -> ipotenusa (sqrt(a^2+b^2))
   Math.min(...) / Math.max(...) -> minimo / massimo
   Math.random()                 -> casuale in [0, 1)
   Math.sign(n)                  -> segno (-1, 0, 1)
   Math.log / log10 / log2       -> logaritmi
   n.toFixed(dec)                -> string con N decimali
   Number.EPSILON                -> margine confronto float
   Pattern: round2, roundTo, clamp, randInt
   ============================================================ */
