/* ============================================================
   58 JS Array Destructuring
   Il destructuring di array permette di "spacchettare" i valori
   di un array in variabili distinte con una sintassi compatta.
   Si basa sulla POSIZIONE degli elementi (a differenza degli
   oggetti che usano il nome). Vedremo: assegnazione base, swap
   di variabili senza temporanee, valori di default, skip di
   elementi, nested destructuring e il rest pattern (...rest).
   Sintassi moderna ES2020+, codice eseguibile con Node.js.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) DESTRUCTURING DI BASE
   ------------------------------------------------------------ */

// Estrai i primi valori per posizione
const colori = ['rosso', 'verde', 'blu'];
const [primo, secondo, terzo] = colori;
console.log(primo, secondo, terzo); // => rosso verde blu

// Funziona con qualsiasi iterable, anche una stringa
const [c1, c2, c3] = 'ABC';
console.log(c1, c2, c3); // => A B C

// Si possono dichiarare meno variabili degli elementi
const [soloPrimo] = [10, 20, 30];
console.log(soloPrimo); // => 10

/* ------------------------------------------------------------
   2) SWAP DI VARIABILI (senza variabile temporanea)
   ------------------------------------------------------------ */

let a = 1;
let b = 2;
[a, b] = [b, a]; // scambio in una sola riga
console.log(a, b); // => 2 1

// Swap di tre o più variabili in rotazione
let x = 'X', y = 'Y', z = 'Z';
[x, y, z] = [z, x, y];
console.log(x, y, z); // => Z X Y

/* ------------------------------------------------------------
   3) VALORI DI DEFAULT
   ------------------------------------------------------------ */

// Se un elemento e' undefined, viene usato il default
const [larghezza = 100, altezza = 50] = [200];
console.log(larghezza, altezza); // => 200 50

// Il default scatta solo per undefined, NON per null
const [val = 'x'] = [null];
console.log(val); // => null

// Il default puo' riferirsi a una variabile gia' assegnata
const [base = 10, doppio = base * 2] = [];
console.log(base, doppio); // => 10 20

/* ------------------------------------------------------------
   4) SKIP DI ELEMENTI (con le virgole)
   ------------------------------------------------------------ */

// Salta elementi lasciando "buchi" tra le virgole
const numeri = [1, 2, 3, 4, 5];
const [, secondoN, , quartoN] = numeri;
console.log(secondoN, quartoN); // => 2 4

// Prendi solo l'ultimo combinando skip e rest
const [, , ultimoTreElementi] = ['a', 'b', 'c'];
console.log(ultimoTreElementi); // => c

/* ------------------------------------------------------------
   5) REST PATTERN (...rest)
   ------------------------------------------------------------ */

// Raccoglie gli elementi rimanenti in un nuovo array
const [testa, ...coda] = [1, 2, 3, 4];
console.log(testa); // => 1
console.log(coda);  // => [ 2, 3, 4 ]

// Il rest e' sempre un array vero (ha map, filter, ecc.)
const [, ...senzaPrimo] = [10, 20, 30];
console.log(senzaPrimo.map(n => n * 2)); // => [ 40, 60 ]

// Il rest DEVE essere l'ultimo elemento, altrimenti SyntaxError
// const [...inizio, fine] = [1,2,3]; // SyntaxError

// Se non resta nulla, il rest e' un array vuoto
const [unico, ...niente] = [42];
console.log(niente); // => []

/* ------------------------------------------------------------
   6) NESTED DESTRUCTURING (array dentro array)
   ------------------------------------------------------------ */

const matrice = [[1, 2], [3, 4]];
const [[m00, m01], [m10, m11]] = matrice;
console.log(m00, m01, m10, m11); // => 1 2 3 4

// Mix di array e oggetti annidati
const dati = ['Mario', { eta: 30, citta: 'Roma' }];
const [nome, { eta, citta }] = dati;
console.log(nome, eta, citta); // => Mario 30 Roma

// Nested con default su struttura mancante
const [[p = 0, q = 0] = []] = [];
console.log(p, q); // => 0 0

/* ------------------------------------------------------------
   7) DESTRUCTURING NEI PARAMETRI DI FUNZIONE
   ------------------------------------------------------------ */

// Spacchetta direttamente l'argomento array
function distanza([x1, y1], [x2, y2]) {
  return Math.hypot(x2 - x1, y2 - y1);
}
console.log(distanza([0, 0], [3, 4])); // => 5

// Default nei parametri destrutturati
function intervallo([inizio = 0, fine = 10] = []) {
  return fine - inizio;
}
console.log(intervallo());        // => 10
console.log(intervallo([2, 8]));  // => 6

/* ------------------------------------------------------------
   8) DESTRUCTURING + ITERATOR / METODI ARRAY
   ------------------------------------------------------------ */

// .entries() restituisce [indice, valore]: ottimo per destructuring
for (const [indice, frutto] of ['mela', 'pera'].entries()) {
  console.log(indice, frutto);
}
// => 0 mela
// => 1 pera

// Destructuring del risultato di .split()
const [giorno, mese, anno] = '30/06/2026'.split('/');
console.log(anno, mese, giorno); // => 2026 06 30

// Una Map e' iterabile come [chiave, valore]
const reparti = new Map([['UP', 'Ufficio Produzione'], ['MG', 'Magazzino']]);
for (const [sigla, descr] of reparti) {
  console.log(sigla, '=>', descr);
}
// => UP => Ufficio Produzione
// => MG => Magazzino

/* ------------------------------------------------------------
   9) ESEMPI PRATICI ISPIRATI A UN GESTIONALE ERP
   ------------------------------------------------------------ */

// 9.1 Parsing di un range di turno "08:00-17:00" via regex + destructuring
const rangeTurno = '08:00-17:00';
const match = rangeTurno.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
if (match) {
  // match[0] e' la stringa intera: la saltiamo con lo skip
  const [, hIn, mIn, hOut, mOut] = match;
  console.log(`Turno dalle ${hIn}:${mIn} alle ${hOut}:${mOut}`);
  // => Turno dalle 08:00 alle 17:00
}

// 9.2 Estrarre il numero progressivo da un codice badge 'UP-001'
const codiceBadge = 'UP-001';
const [siglaReparto, progressivo] = codiceBadge.split('-');
console.log(siglaReparto, Number(progressivo)); // => UP 1

// 9.3 Timbrature di una giornata: testa = ingresso, resto = eventi successivi
const timbrature = ['08:02', '12:30', '13:00', '17:05'];
const [ingresso, ...altriEventi] = timbrature;
console.log('Ingresso:', ingresso);     // => Ingresso: 08:02
console.log('Altri eventi:', altriEventi); // => Altri eventi: [ '12:30', '13:00', '17:05' ]

// 9.4 Swap di due turni assegnati a due dipendenti
let turnoMario = 'P4';
let turnoLucia = 'P2';
[turnoMario, turnoLucia] = [turnoLucia, turnoMario];
console.log(turnoMario, turnoLucia); // => P2 P4

// 9.5 Funzione che ritorna piu' valori come array (tuple-like)
function calcolaOre(timbrature) {
  const minutiTotali = 525; // esempio gia' calcolato
  const ore = Math.floor(minutiTotali / 60);
  const minuti = minutiTotali % 60;
  return [ore, minuti]; // ritorno multiplo
}
const [oreLavorate, minutiResidui] = calcolaOre(timbrature);
console.log(`${oreLavorate}h ${String(minutiResidui).padStart(2, '0')}m`); // => 8h 45m

// 9.6 Lettura ora di Roma con Intl.parts: trovare e destrutturare
const parts = new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome',
  hour: '2-digit',
  minute: '2-digit',
}).formatToParts(new Date(Date.UTC(2026, 5, 30, 10, 0)));
const oraPart = parts.find(part => part.type === 'hour');
console.log('Tipo part trovato:', oraPart.type); // => Tipo part trovato: hour

// 9.7 Dipendente come tupla [nome, cognome, reparto] con default
function badgeLabel([nome, cognome, reparto = 'XX']) {
  return `${nome} ${cognome} (${reparto})`;
}
console.log(badgeLabel(['Mario', 'Rossi', 'UP'])); // => Mario Rossi (UP)
console.log(badgeLabel(['Lucia', 'Bianchi']));     // => Lucia Bianchi (XX)

/* ------------------------------------------------------------
   10) CASI AVANZATI E TRAPPOLE
   ------------------------------------------------------------ */

// 10.1 Destructuring su array vuoto: tutto undefined (default utili)
const [primoVuoto = 'n/d'] = [];
console.log(primoVuoto); // => n/d

// 10.2 Riassegnare proprieta' di oggetto via destructuring (servono le parentesi)
const obj = {};
[obj.a, obj.b] = [1, 2];
console.log(obj); // => { a: 1, b: 2 }

// 10.3 Combinare default + rest
const [intestazione = 'Titolo', ...righe] = ['Report', 'r1', 'r2'];
console.log(intestazione, righe); // => Report [ 'r1', 'r2' ]

// 10.4 Destructuring di valori da una promise risolta (con await)
async function demoAsync() {
  const [u1, u2] = await Promise.all([
    Promise.resolve('utente1'),
    Promise.resolve('utente2'),
  ]);
  console.log(u1, u2); // => utente1 utente2
}
demoAsync();

// 10.5 Scambio dei valori in un array tramite indici (ordinamento manuale)
const arr = [3, 1];
[arr[0], arr[1]] = [arr[1], arr[0]];
console.log(arr); // => [ 1, 3 ]

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   const [a, b] = arr            -> destructuring base per posizione
   [a, b] = [b, a]               -> swap senza variabile temporanea
   const [a = 10] = []           -> valore di default (solo su undefined)
   const [, , c] = arr           -> skip elementi con le virgole
   const [primo, ...resto] = arr -> rest pattern (sempre array, ultimo)
   const [[x, y]] = matrice      -> nested destructuring
   function f([a, b]) {}         -> destructuring nei parametri
   for (const [i, v] of arr.entries())  -> indice + valore
   for (const [k, v] of map)     -> chiavi/valori di una Map
   const [h, m] = str.split(':') -> destrutturare risultati di metodi
   const [a, b] = await Promise.all([...]) -> destrutturare risultati async
   [obj.a, obj.b] = [1, 2]       -> assegnare a proprieta' esistenti
   ============================================================ */
