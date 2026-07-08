/* ============================================================
   29 JS Arrow Functions
   Le arrow functions (funzioni freccia, ES6) sono una sintassi
   compatta per scrivere funzioni. La differenza piu' importante
   rispetto alle function tradizionali e' che NON hanno un proprio
   binding di `this`, `arguments`, `super` ne' `new.target`:
   ereditano `this` dallo scope lessicale circostante (lexical this).
   Sono ideali per callback e operazioni funzionali (map/filter/reduce),
   ma NON vanno usate come metodi di oggetto, costruttori o handler
   che si appoggiano su `this` dinamico.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) SINTASSI DI BASE
   ------------------------------------------------------------ */

// Function tradizionale
function quadratoFn(x) {
  return x * x;
}

// Arrow equivalente: con parentesi, parametro e body con return
const quadratoArrow = (x) => {
  return x * x;
};

console.log(quadratoFn(5), quadratoArrow(5)); // => 25 25

// Un solo parametro: le parentesi sono opzionali
const doppio = x => x * 2;
console.log(doppio(8)); // => 16

// Nessun parametro: parentesi vuote OBBLIGATORIE
const saluta = () => 'ciao';
console.log(saluta()); // => ciao

// Piu' parametri: parentesi obbligatorie
const somma = (a, b) => a + b;
console.log(somma(3, 4)); // => 7

/* ------------------------------------------------------------
   2) IMPLICIT RETURN (return implicito)
   ------------------------------------------------------------ */

// Se il body e' una sola espressione, niente graffe e niente `return`
const triplo = n => n * 3;
console.log(triplo(10)); // => 30

// Con le graffe il return diventa ESPLICITO: senza, ritorna undefined
const sbagliato = n => { n * 3; };       // manca return
const giusto = n => { return n * 3; };
console.log(sbagliato(10), giusto(10));  // => undefined 30

// Restituire un OBJECT literal: va racchiuso tra parentesi tonde
// altrimenti le graffe vengono lette come body della funzione
const makeDipendente = (nome, badge) => ({ nome, badge });
console.log(makeDipendente('Anna', 'UP-001'));
// => { nome: 'Anna', badge: 'UP-001' }

// Implicit return su piu' righe (espressione singola)
const etichetta = (nome, cognome) =>
  `Assegnato a ${nome} ${cognome}`;
console.log(etichetta('Mario', 'Rossi')); // => Assegnato a Mario Rossi

/* ------------------------------------------------------------
   3) ARROW NELLE CALLBACK (uso piu' comune)
   ------------------------------------------------------------ */

const numeri = [1, 2, 3, 4, 5, 6];

// map: trasforma ogni elemento
console.log(numeri.map(n => n * n)); // => [ 1, 4, 9, 16, 25, 36 ]

// filter: tiene solo i pari
console.log(numeri.filter(n => n % 2 === 0)); // => [ 2, 4, 6 ]

// reduce: somma tutti
console.log(numeri.reduce((acc, n) => acc + n, 0)); // => 21

// Concatenazione fluida con arrow
const risultato = numeri
  .filter(n => n > 2)
  .map(n => n * 10)
  .reduce((s, n) => s + n, 0);
console.log(risultato); // => 180

/* ------------------------------------------------------------
   4) LEXICAL THIS (il cuore delle arrow functions)
   Le arrow NON creano un proprio `this`: lo prendono dal contesto
   in cui sono DEFINITE, non da come vengono chiamate.
   ------------------------------------------------------------ */

// Problema classico con function tradizionale dentro un metodo:
const badge1 = {
  prefisso: 'UP',
  codici: [1, 2, 3],
  // function tradizionale come callback -> `this` cambia, e' undefined/global
  stampaSbagliato() {
    return this.codici.map(function (n) {
      // qui `this` NON e' badge1
      return `${this.prefisso}-00${n}`; // this.prefisso => undefined
    });
  },
  // arrow come callback -> eredita `this` da stampaCorretto -> badge1
  stampaCorretto() {
    return this.codici.map(n => `${this.prefisso}-00${n}`);
  },
};

console.log(badge1.stampaCorretto());
// => [ 'UP-001', 'UP-002', 'UP-003' ]

// Esempio con setTimeout: l'arrow mantiene `this` dell'oggetto
const timbratore = {
  dipendente: 'Anna',
  registra() {
    // simulazione asincrona: l'arrow vede ancora `this.dipendente`
    setTimeout(() => {
      console.log(`Timbratura registrata per ${this.dipendente}`);
    }, 0);
  },
};
timbratore.registra(); // => Timbratura registrata per Anna (async)

/* ------------------------------------------------------------
   5) NIENTE `arguments` (usa rest parameters)
   Le arrow NON hanno l'oggetto `arguments`: usa ...args
   ------------------------------------------------------------ */

const sommaTutti = (...args) => args.reduce((s, n) => s + n, 0);
console.log(sommaTutti(1, 2, 3, 4)); // => 10

// function tradizionale: ha `arguments`
function sommaVecchia() {
  return Array.from(arguments).reduce((s, n) => s + n, 0);
}
console.log(sommaVecchia(1, 2, 3, 4)); // => 10

/* ------------------------------------------------------------
   6) HIGHER-ORDER FUNCTIONS e CURRYING con arrow
   ------------------------------------------------------------ */

// Una funzione che ritorna una funzione (closure)
const moltiplicatorePer = fattore => numero => numero * fattore;
const perTre = moltiplicatorePer(3);
console.log(perTre(10)); // => 30

// Currying a piu' livelli
const somma3 = a => b => c => a + b + c;
console.log(somma3(1)(2)(3)); // => 6

// Higher-order: applica un filtro di reparto e ritorna funzione
const filtroReparto = sigla => dip => dip.reparto === sigla;
const dipendenti = [
  { nome: 'Anna', reparto: 'UP' },
  { nome: 'Luca', reparto: 'MG' },
  { nome: 'Sara', reparto: 'UP' },
];
console.log(dipendenti.filter(filtroReparto('UP')).map(d => d.nome));
// => [ 'Anna', 'Sara' ]

/* ------------------------------------------------------------
   7) ARROW + DESTRUCTURING e DEFAULT PARAMS
   ------------------------------------------------------------ */

// Destructuring dei parametri direttamente nella firma
const nomeCompleto = ({ nome, cognome }) => `${nome} ${cognome}`;
console.log(nomeCompleto({ nome: 'Mario', cognome: 'Rossi' }));
// => Mario Rossi

// Default param + nullish per la sigla mancante
const siglaReparto = (reparto = {}) => reparto?.sigla ?? 'XX';
console.log(siglaReparto({ sigla: 'UP' })); // => UP
console.log(siglaReparto());                // => XX

// DTO mapping (pattern ERP: query -> oggetto pulito)
const articoli = [
  { articolo_poly: 'A1', descrizione: 'Guanti', extra: 1 },
  { articolo_poly: 'A2', descrizione: 'Casco', extra: 2 },
];
const dto = articoli.map(({ articolo_poly, descrizione }) => ({
  cdAr: articolo_poly,
  descrizione,
}));
console.log(dto);
// => [ { cdAr: 'A1', descrizione: 'Guanti' }, { cdAr: 'A2', descrizione: 'Casco' } ]

/* ------------------------------------------------------------
   8) ARROW e ASYNC / PROMISE
   ------------------------------------------------------------ */

// Arrow async: stessa sintassi, prefissa con `async`
const caricaDipendente = async id => {
  // simuliamo una promise
  return await Promise.resolve({ id, nome: 'Anna' });
};
caricaDipendente(1).then(d => console.log(d));
// => { id: 1, nome: 'Anna' } (async)

// Catena di .then con arrow
Promise.resolve(10)
  .then(n => n + 5)
  .then(n => n * 2)
  .then(n => console.log('promise:', n)); // => promise: 30 (async)

/* ------------------------------------------------------------
   9) ESEMPIO PRATICO ERP: minuti lavorati e ore totali
   ------------------------------------------------------------ */

// Pattern: filter(approvata).reduce(somma minuti)
const richieste = [
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 120 },
  { approvata: true, minuti: 300 },
];
const totaleMinuti = richieste
  .filter(r => r.approvata)
  .reduce((s, r) => s + r.minuti, 0);
console.log(`Totale: ${totaleMinuti} min`); // => Totale: 780 min

// Formattazione HH:MM con arrow + padStart
const formattaOre = minuti => {
  const h = String(Math.floor(minuti / 60)).padStart(2, '0');
  const m = String(minuti % 60).padStart(2, '0');
  return `${h}:${m}`;
};
console.log(formattaOre(totaleMinuti)); // => 13:00

// Validazione orario HH:MM con regex in un'arrow predicato
const orarioValido = s => /^\d{2}:\d{2}$/.test(s);
console.log(['08:30', '8:3', '17:00'].map(orarioValido));
// => [ true, false, true ]

// some / every su turni
const turni = [{ ore: 8 }, { ore: 4 }, { ore: 8 }];
console.log(turni.every(t => t.ore <= 8)); // => true
console.log(turni.some(t => t.ore < 5));   // => true

/* ------------------------------------------------------------
   10) QUANDO **NON** USARE LE ARROW FUNCTIONS
   ------------------------------------------------------------ */

// (a) Come METODO di un oggetto che usa `this`
const sbagliatoMetodo = {
  nome: 'Reparto UP',
  // arrow: `this` NON e' l'oggetto, e' lo scope esterno
  stampa: () => `Sono ${this?.nome}`, // this.nome => undefined
};
console.log(sbagliatoMetodo.stampa()); // => Sono undefined

const corretto = {
  nome: 'Reparto UP',
  stampa() { return `Sono ${this.nome}`; }, // shorthand method
};
console.log(corretto.stampa()); // => Sono Reparto UP

// (b) Come COSTRUTTORE: le arrow non sono chiamabili con `new`
const Persona = nome => { this.nome = nome; };
try {
  new Persona('Anna');
} catch (e) {
  console.log('Errore new su arrow:', e.constructor.name);
  // => Errore new su arrow: TypeError
}

// (c) Quando serve `arguments` -> usa function o rest params
// (d) Nei prototype methods e negli event handler dove servirebbe
//     `this` legato all'elemento DOM.

// Esempio browser: gira nel browser, non in Node.
// document.querySelector('#btn').addEventListener('click', function () {
//   // qui `this` e' il bottone cliccato; con un'arrow sarebbe lo scope esterno
//   this.classList.toggle('attivo');
// });

/* ------------------------------------------------------------
   11) DIFFERENZE DI HOISTING
   Le function dichiarate sono "hoisted" (usabili prima della
   definizione); le arrow assegnate a const NO.
   ------------------------------------------------------------ */

console.log(fnHoisted()); // => funziona
function fnHoisted() { return 'funziona'; }

// console.log(fnArrow()); // => ReferenceError (Cannot access before init)
const fnArrow = () => 'ora si';
console.log(fnArrow()); // => ora si

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI
   ------------------------------------------------------------
   - (params) => espressione        // implicit return
   - param => espressione           // un solo parametro, no parentesi
   - () => valore                    // zero parametri
   - (a, b) => { return a + b; }    // body con return esplicito
   - () => ({ chiave: valore })     // ritornare object literal
   - lexical this                    // eredita this dallo scope
   - (...args) => ...                // rest al posto di arguments
   - async (x) => await ...         // arrow asincrona
   - f => g => h => ...             // currying / higher-order
   - .map() / .filter() / .reduce() // callback con arrow
   - .some() / .every()             // predicati booleani
   - String.padStart()              // formattazione HH:MM
   - RegExp.test()                  // validazione orario
   - NON usare arrow: metodi obj con this, costruttori (new), handler DOM
   - hoisting: function si, arrow su const no
   ============================================================ */
