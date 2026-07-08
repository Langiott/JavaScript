/* ============================================================
   11 JS Arithmetic
   Gli arithmetic operators permettono di eseguire calcoli matematici
   sui number: addizione, sottrazione, moltiplicazione, divisione.
   In questo file vediamo anche il modulo (%, resto della divisione),
   l'exponent (** elevamento a potenza), gli operatori di incremento
   e decremento (++ / --) con le loro forme prefix/postfix, e il
   valore speciale NaN (Not-A-Number) che nasce da operazioni
   matematiche non valide. Tutti gli esempi sono eseguibili con Node.js.
   ============================================================ */

// ------------------------------------------------------------
// 1) OPERATORI ARITMETICI DI BASE
// ------------------------------------------------------------

// Addizione (+): somma due number
let somma = 7 + 3;
console.log(somma); // => 10

// Sottrazione (-): differenza tra due number
let differenza = 10 - 4;
console.log(differenza); // => 6

// Moltiplicazione (*): prodotto
let prodotto = 6 * 7;
console.log(prodotto); // => 42

// Divisione (/): in JS ritorna sempre un float, non c'e divisione intera
let divisione = 20 / 8;
console.log(divisione); // => 2.5

// Negazione unaria (-): cambia il segno
let saldo = 50;
console.log(-saldo); // => -50

// Piu unario (+): converte a number (utile per coercion)
console.log(+"42"); // => 42
console.log(+"3.14"); // => 3.14

// ------------------------------------------------------------
// 2) PRECEDENZA DEGLI OPERATORI E PARENTESI
// ------------------------------------------------------------

// La moltiplicazione ha precedenza sull'addizione
console.log(2 + 3 * 4); // => 14

// Le parentesi forzano l'ordine di valutazione
console.log((2 + 3) * 4); // => 20

// Esempio: media di tre valori (servono le parentesi)
let media = (8 + 6 + 10) / 3;
console.log(media); // => 8

// ------------------------------------------------------------
// 3) MODULO (%) - IL RESTO DELLA DIVISIONE
// ------------------------------------------------------------

// Il modulo ritorna il resto di una divisione intera
console.log(10 % 3); // => 1
console.log(12 % 4); // => 0  (divisibile esattamente)

// Caso d'uso classico: verificare se un number e pari o dispari
function isPari(n) {
  return n % 2 === 0;
}
console.log(isPari(8)); // => true
console.log(isPari(7)); // => false

// Modulo con number negativi: il segno segue il dividendo
console.log(-7 % 3); // => -1
console.log(7 % -3); // => 1

// Caso d'uso: ciclare su un intervallo (es. indice colore badge)
let colori = ["rosso", "verde", "blu"];
for (let i = 0; i < 7; i++) {
  // i % colori.length resta sempre nel range 0..2
  process.stdout.write(colori[i % colori.length] + " ");
}
console.log(); // => rosso verde blu rosso verde blu rosso

// ------------------------------------------------------------
// 4) EXPONENT (**) - ELEVAMENTO A POTENZA (ES2016)
// ------------------------------------------------------------

// L'operatore ** eleva la base all'esponente
console.log(2 ** 3); // => 8   (2*2*2)
console.log(5 ** 2); // => 25  (quadrato)
console.log(10 ** 6); // => 1000000

// Radice quadrata come potenza 0.5
console.log(16 ** 0.5); // => 4

// Esponente negativo: reciproco
console.log(2 ** -1); // => 0.5

// ** e right-associative: si valuta da destra a sinistra
console.log(2 ** 3 ** 2); // => 512  (cioe 2 ** (3 ** 2) = 2 ** 9)

// Alternativa "vecchia" con Math.pow (stesso risultato)
console.log(Math.pow(2, 10)); // => 1024

// ------------------------------------------------------------
// 5) INCREMENTO (++) E DECREMENTO (--)
// ------------------------------------------------------------

// ++ aumenta di 1, -- diminuisce di 1
let contatore = 5;
contatore++;
console.log(contatore); // => 6
contatore--;
console.log(contatore); // => 5

// PREFIX (++x): incrementa PRIMA, poi ritorna il valore
let a = 5;
let risultatoPrefix = ++a;
console.log(a, risultatoPrefix); // => 6 6

// POSTFIX (x++): ritorna il valore PRIMA, poi incrementa
let b = 5;
let risultatoPostfix = b++;
console.log(b, risultatoPostfix); // => 6 5

// Uso tipico in un ciclo for
for (let i = 0; i < 3; i++) {
  console.log("giro", i); // => giro 0 / giro 1 / giro 2
}

// ------------------------------------------------------------
// 6) OPERATORI DI ASSEGNAZIONE COMPOSTI
// ------------------------------------------------------------

let x = 10;
x += 5; // x = x + 5
console.log(x); // => 15
x -= 3; // x = x - 3
console.log(x); // => 12
x *= 2; // x = x * 2
console.log(x); // => 24
x /= 4; // x = x / 4
console.log(x); // => 6
x %= 4; // x = x % 4
console.log(x); // => 2
x **= 3; // x = x ** 3
console.log(x); // => 8

// ------------------------------------------------------------
// 7) NaN - NOT A NUMBER
// ------------------------------------------------------------

// NaN nasce da operazioni matematiche non valide
console.log(0 / 0); // => NaN
console.log("ciao" * 3); // => NaN
console.log(Math.sqrt(-1)); // => NaN
console.log(parseInt("abc")); // => NaN

// NaN e di tipo "number" (curiosita tecnica)
console.log(typeof NaN); // => number

// NaN NON e uguale a se stesso: e l'unico valore con questa proprieta
console.log(NaN === NaN); // => false

// Per controllare NaN usa Number.isNaN (modo corretto e robusto)
console.log(Number.isNaN(NaN)); // => true
console.log(Number.isNaN(42)); // => false

// Differenza con il vecchio isNaN globale (fa coercion, meno sicuro)
console.log(isNaN("ciao")); // => true  (converte prima a number)
console.log(Number.isNaN("ciao")); // => false (nessuna coercion)

// Infinity: non e NaN, e un number speciale
console.log(10 / 0); // => Infinity
console.log(-10 / 0); // => -Infinity
console.log(Number.isFinite(10 / 0)); // => false

// ------------------------------------------------------------
// 8) FLOAT E PRECISIONE (un classico trabocchetto)
// ------------------------------------------------------------

// I float binari non sono sempre esatti
console.log(0.1 + 0.2); // => 0.30000000000000004

// Soluzione: arrotondare con toFixed (ritorna una string)
let totaleEuro = 0.1 + 0.2;
console.log(Number(totaleEuro.toFixed(2))); // => 0.3

// ------------------------------------------------------------
// 9) ESEMPI ISPIRATI AL GESTIONALE ERP
// ------------------------------------------------------------

// Calcolo ore lavorate da minuti totali (timbrature)
// Pattern reale: somma minuti delle richieste e converti in ore:minuti
function minutiInOreMinuti(minutiTotali) {
  const ore = Math.floor(minutiTotali / 60); // divisione intera via floor
  const minuti = minutiTotali % 60; // resto = minuti residui
  return `${String(ore).padStart(2, "0")}:${String(minuti).padStart(2, "0")}`;
}
console.log(minutiInOreMinuti(485)); // => 08:05
console.log(minutiInOreMinuti(90)); // => 01:30

// Somma minuti delle timbrature approvate (filter + reduce + aritmetica)
const richieste = [
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 120 },
  { approvata: true, minuti: 30 },
];
const totaleMinuti = richieste
  .filter((r) => r.approvata)
  .reduce((s, r) => s + r.minuti, 0);
console.log(totaleMinuti); // => 510

// Estrarre il numero progressivo dal codiceBadge 'UP-001'
function numeroBadge(codiceBadge) {
  const match = codiceBadge.match(/-(\d+)$/);
  // Number(...) converte la string in number; se non matcha -> NaN
  return match ? Number(match[1]) : NaN;
}
console.log(numeroBadge("UP-001")); // => 1
console.log(numeroBadge("UP-042")); // => 42
console.log(Number.isNaN(numeroBadge("NO-MATCH"))); // => false (match c'e)
console.log(Number.isNaN(numeroBadge("UPXX"))); // => true

// Verifica scorta vestiario/DPI: serve riordino se sotto la scorta minima
function quantitaDaRiordinare(quantita, scortaMinima) {
  const mancante = scortaMinima - quantita;
  return mancante > 0 ? mancante : 0;
}
console.log(quantitaDaRiordinare(3, 10)); // => 7
console.log(quantitaDaRiordinare(15, 10)); // => 0

// Calcolo percentuale presenze del reparto (occhio alla divisione per zero)
function percentualePresenze(presenti, totale) {
  if (totale === 0) return 0; // evita NaN da 0/0
  return Number(((presenti / totale) * 100).toFixed(1));
}
console.log(percentualePresenze(8, 10)); // => 80
console.log(percentualePresenze(0, 0)); // => 0  (gestito, niente NaN)

// Distribuzione turni in modo ciclico tra i dipendenti (modulo)
const turni = ["P4", "P2"];
const dipendenti = ["Rossi", "Bianchi", "Verdi", "Neri"];
dipendenti.forEach((nome, i) => {
  console.log(`${nome} -> ${turni[i % turni.length]}`);
});
// => Rossi -> P4 / Bianchi -> P2 / Verdi -> P4 / Neri -> P2

// ------------------------------------------------------------
// 10) METODI UTILI DI Math CON L'ARITMETICA
// ------------------------------------------------------------

console.log(Math.round(2.5)); // => 3   (arrotonda)
console.log(Math.floor(2.9)); // => 2   (verso il basso)
console.log(Math.ceil(2.1)); // => 3    (verso l'alto)
console.log(Math.trunc(-2.9)); // => -2 (toglie i decimali)
console.log(Math.abs(-7)); // => 7      (valore assoluto)
console.log(Math.max(3, 9, 1)); // => 9
console.log(Math.min(3, 9, 1)); // => 1

/* ============================================================
   RIEPILOGO COMANDI
   - + - * /            operatori aritmetici di base
   - + (unario)         coercion a number
   - %                  modulo (resto della divisione)
   - **                 exponent (elevamento a potenza, right-associative)
   - ++ / --            incremento / decremento (prefix e postfix)
   - += -= *= /= %= **= assegnazione composta
   - NaN                Not-A-Number (NaN !== NaN)
   - Number.isNaN()     controllo NaN corretto (no coercion)
   - isNaN()            controllo NaN globale (con coercion)
   - Infinity           number speciale da divisione per zero
   - Number.isFinite()  verifica number finito
   - Number()           conversione string -> number
   - toFixed(n)         arrotonda a n decimali (ritorna string)
   - Math.pow()         potenza (alternativa a **)
   - Math.round/floor/ceil/trunc  arrotondamenti
   - Math.abs/max/min   valore assoluto, massimo, minimo
   - padStart()         padding string (es. HH:MM)
   ============================================================ */
