/* ============================================================
   32 JS HigherOrder
   Le higher-order functions (funzioni di ordine superiore) sono
   funzioni che accettano altre funzioni come argomento (callback)
   oppure che ritornano una funzione come risultato.
   Sono il cuore della programmazione funzionale in JavaScript e
   poggiano sul concetto di closure e di first-class functions.
   In questo file reimplementiamo map/filter/reduce da zero, vediamo
   funzioni che ritornano funzioni, currying, compose/pipe e
   tante applicazioni pratiche ispirate a un gestionale ERP.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. CONCETTO BASE: funzione passata come argomento (callback)
   ------------------------------------------------------------ */

// Una higher-order function riceve una funzione e la invoca.
function applicaDueVolte(fn, valore) {
  return fn(fn(valore));
}
console.log(applicaDueVolte((x) => x + 3, 10)); // => 16

// Le funzioni sono "first-class": si assegnano a variabili.
const raddoppia = (x) => x * 2;
console.log(applicaDueVolte(raddoppia, 5)); // => 20

/* ------------------------------------------------------------
   2. MAP CUSTOM: trasforma ogni elemento di un array
   ------------------------------------------------------------ */

// Reimplementiamo Array.prototype.map come funzione pura.
function myMap(arr, fn) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(fn(arr[i], i, arr)); // callback riceve (valore, indice, array)
  }
  return out;
}
console.log(myMap([1, 2, 3], (n) => n * 10)); // => [ 10, 20, 30 ]

// Esempio ERP: trasformo righe query in DTO (Data Transfer Object).
const articoli = [
  { articolo_poly: 'UP-001', descrizione: 'Tuta', interno: true },
  { articolo_poly: 'UP-002', descrizione: 'Guanti', interno: false },
];
const dto = myMap(articoli, (a) => ({ cdAr: a.articolo_poly, desc: a.descrizione }));
console.log(dto); // => [ { cdAr: 'UP-001', desc: 'Tuta' }, { cdAr: 'UP-002', desc: 'Guanti' } ]

/* ------------------------------------------------------------
   3. FILTER CUSTOM: tiene solo gli elementi che passano il test
   ------------------------------------------------------------ */

function myFilter(arr, predicate) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) out.push(arr[i]);
  }
  return out;
}
console.log(myFilter([1, 2, 3, 4], (n) => n % 2 === 0)); // => [ 2, 4 ]

// Esempio ERP: solo articoli a uso interno.
console.log(myFilter(articoli, (a) => a.interno).length); // => 1

/* ------------------------------------------------------------
   4. REDUCE CUSTOM: riduce un array a un singolo valore
   ------------------------------------------------------------ */

function myReduce(arr, fn, initial) {
  let acc = initial;
  let start = 0;
  if (acc === undefined) {        // senza valore iniziale parto dal primo
    acc = arr[0];
    start = 1;
  }
  for (let i = start; i < arr.length; i++) {
    acc = fn(acc, arr[i], i, arr); // accumulatore, valore corrente, indice
  }
  return acc;
}
console.log(myReduce([1, 2, 3, 4], (s, n) => s + n, 0)); // => 10
console.log(myReduce([1, 2, 3, 4], (s, n) => s + n));    // => 10 (senza initial)

// Esempio ERP: somma minuti delle richieste approvate (pattern reale).
const richieste = [
  { minuti: 90, approvata: true },
  { minuti: 30, approvata: false },
  { minuti: 60, approvata: true },
];
const totaleMin = richieste
  .filter((r) => r.approvata)
  .reduce((s, r) => s + r.minuti, 0);
console.log(totaleMin); // => 150

/* ------------------------------------------------------------
   5. REDUCE AVANZATO: costruire oggetti e raggruppamenti
   ------------------------------------------------------------ */

// Conteggio occorrenze (frequenze).
const reparti = ['MO', 'MO', 'XX', 'MO', 'XX'];
const frequenze = reparti.reduce((acc, r) => {
  acc[r] = (acc[r] ?? 0) + 1;
  return acc;
}, {});
console.log(frequenze); // => { MO: 3, XX: 2 }

// groupBy generico: raggruppa per chiave calcolata da una funzione.
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}
const dipendenti = [
  { nome: 'Anna', reparto: 'MO' },
  { nome: 'Bea', reparto: 'XX' },
  { nome: 'Carlo', reparto: 'MO' },
];
console.log(groupBy(dipendenti, (d) => d.reparto));
// => { MO: [ {Anna}, {Carlo} ], XX: [ {Bea} ] }

/* ------------------------------------------------------------
   6. FUNZIONI CHE RITORNANO FUNZIONI (factory + closure)
   ------------------------------------------------------------ */

// Una funzione che genera moltiplicatori: ritorna una nuova funzione.
function creaMoltiplicatore(fattore) {
  return (n) => n * fattore; // la closure "ricorda" fattore
}
const perTre = creaMoltiplicatore(3);
console.log(perTre(5)); // => 15

// Esempio ERP: generatore di predicati per filtrare per reparto.
function filtraPerReparto(sigla) {
  return (dip) => dip.reparto === sigla;
}
console.log(dipendenti.filter(filtraPerReparto('MO')).map((d) => d.nome)); // => [ 'Anna', 'Carlo' ]

// Contatore con stato privato (closure persistente).
function creaContatore(start = 0) {
  let count = start;
  return {
    inc: () => ++count,
    valore: () => count,
  };
}
const c = creaContatore(10);
c.inc();
c.inc();
console.log(c.valore()); // => 12

/* ------------------------------------------------------------
   7. CURRYING: trasformare f(a, b) in f(a)(b)
   ------------------------------------------------------------ */

// Currying manuale.
const somma = (a) => (b) => a + b;
console.log(somma(2)(3)); // => 5
const add10 = somma(10);
console.log(add10(7)); // => 17

// Curry generico che adatta una funzione a N argomenti.
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...next) => curried(...args, ...next);
  };
}
const volume = (l, w, h) => l * w * h;
const cVolume = curry(volume);
console.log(cVolume(2)(3)(4)); // => 24
console.log(cVolume(2, 3)(4)); // => 24

/* ------------------------------------------------------------
   8. COMPOSE e PIPE: comporre funzioni in catena
   ------------------------------------------------------------ */

// compose: applica da destra a sinistra -> compose(f, g)(x) = f(g(x))
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

// pipe: applica da sinistra a destra -> pipe(f, g)(x) = g(f(x))
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const incrementa = (n) => n + 1;
const quadrato = (n) => n * n;

console.log(compose(quadrato, incrementa)(4)); // => 25  (incrementa poi quadrato)
console.log(pipe(quadrato, incrementa)(4));    // => 17  (quadrato poi incrementa)

// Esempio ERP: normalizzazione di un codice badge in pipeline.
const trim = (s) => s.trim();
const upper = (s) => s.toUpperCase();
const senzaSpazi = (s) => s.replace(/\s+/g, '');
const max8 = (s) => s.slice(0, 8);
const normalizzaBadge = pipe(trim, upper, senzaSpazi, max8);
console.log(normalizzaBadge('  up-001 extra ')); // => 'UP-001EX'

/* ------------------------------------------------------------
   9. HIGHER-ORDER UTILI: once, memoize, debounce-like
   ------------------------------------------------------------ */

// once: garantisce che una funzione venga eseguita una sola volta.
function once(fn) {
  let chiamata = false;
  let risultato;
  return (...args) => {
    if (!chiamata) {
      chiamata = true;
      risultato = fn(...args);
    }
    return risultato;
  };
}
const inizializza = once(() => 'init eseguito');
console.log(inizializza()); // => init eseguito
console.log(inizializza()); // => init eseguito (non rilancia il body)

// memoize: memorizza in cache i risultati per input gia visti.
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);
    const res = fn(arg);
    cache.set(arg, res);
    return res;
  };
}
const fattorialeLento = (n) => (n <= 1 ? 1 : n * fattorialeLento(n - 1));
const fattoriale = memoize(fattorialeLento);
console.log(fattoriale(5)); // => 120
console.log(fattoriale(5)); // => 120 (dalla cache)

/* ------------------------------------------------------------
   10. HIGHER-ORDER + ASYNC: wrapper che ritorna funzioni async
   ------------------------------------------------------------ */

// withRetry: ritorna una funzione che riprova in caso di errore.
function withRetry(fn, tentativi = 2) {
  return async (...args) => {
    let ultimoErrore;
    for (let i = 0; i <= tentativi; i++) {
      try {
        return await fn(...args);
      } catch (err) {
        ultimoErrore = err;
      }
    }
    throw ultimoErrore;
  };
}
let contatoreTentativi = 0;
const operazioneInstabile = async () => {
  contatoreTentativi++;
  if (contatoreTentativi < 3) throw new Error('fallita');
  return 'ok';
};
withRetry(operazioneInstabile, 5)().then((r) => console.log(r)); // => ok

/* ------------------------------------------------------------
   11. ESEMPIO PRATICO ERP: pipeline di elaborazione timbrature
   ------------------------------------------------------------ */

// Dataset di timbrature (oreLavorate in minuti), pattern naive-UTC ignorato qui.
const timbrature = [
  { badge: 'UP-001', reparto: 'MO', minuti: 480, turno: 'P4' },
  { badge: 'UP-002', reparto: 'XX', minuti: 240, turno: 'P2' },
  { badge: 'UP-003', reparto: 'MO', minuti: 510, turno: 'P4' },
  { badge: 'UP-004', reparto: 'MO', minuti: 60,  turno: 'P2' },
];

// Higher-order: predicato configurabile + trasformatore + accumulatore.
const minimoMinuti = (soglia) => (t) => t.minuti >= soglia;
const aOre = (t) => ({ ...t, ore: +(t.minuti / 60).toFixed(2) });

const riepilogoMO = timbrature
  .filter(filtraPerReparto('MO'))          // funzione factory del punto 6
  .filter(minimoMinuti(120))               // scarta presenze troppo brevi
  .map(aOre)                               // arricchisce con campo ore
  .reduce(
    (acc, t) => {
      acc.totaleOre += t.ore;
      acc.conteggio += 1;
      return acc;
    },
    { totaleOre: 0, conteggio: 0 }
  );
console.log(riepilogoMO); // => { totaleOre: 16.5, conteggio: 2 }

// Pipeline riutilizzabile con pipe: definita una volta, applicata a dati diversi.
const calcolaTotaleOre = (lista) =>
  lista.reduce((s, t) => s + t.minuti / 60, 0);
const reportReparto = (sigla) =>
  pipe(
    (lista) => lista.filter(filtraPerReparto(sigla)),
    calcolaTotaleOre,
    (ore) => `${sigla}: ${ore.toFixed(1)} ore`
  );
console.log(reportReparto('MO')(timbrature)); // => MO: 17.5 ore
console.log(reportReparto('XX')(timbrature)); // => XX: 4.0 ore

/* ------------------------------------------------------------
   12. HIGHER-ORDER come decoratori di validazione (ERP)
   ------------------------------------------------------------ */

// Funzione che ritorna un validatore basato su una regex.
function validatoreFormato(regex, messaggio) {
  return (valore) => (regex.test(valore) ? null : messaggio);
}
const validaOrario = validatoreFormato(/^\d{2}:\d{2}$/, 'Orario non valido');
console.log(validaOrario('08:30')); // => null
console.log(validaOrario('8:30'));  // => Orario non valido

// Combinatore di validatori: ritorna il primo errore trovato.
const combinaValidatori = (...validatori) => (valore) =>
  validatori.reduce((err, v) => err ?? v(valore), null);
const validaBadge = combinaValidatori(
  validatoreFormato(/^UP-/, 'Deve iniziare con UP-'),
  validatoreFormato(/\d{3}$/, 'Deve finire con 3 cifre')
);
console.log(validaBadge('UP-001')); // => null
console.log(validaBadge('XX-1'));   // => Deve iniziare con UP-

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   - Array.prototype.map(fn)        -> trasforma ogni elemento
   - Array.prototype.filter(pred)   -> filtra per predicato
   - Array.prototype.reduce(fn,acc) -> riduce a un valore
   - Array.prototype.reduceRight    -> reduce da destra (compose)
   - callback / first-class function-> funzione passata come dato
   - closure                        -> funzione che ricorda lo scope
   - factory function               -> funzione che ritorna funzione
   - currying  f(a)(b)              -> applicazione parziale
   - compose(...fns)                -> destra->sinistra
   - pipe(...fns)                   -> sinistra->destra
   - once(fn)                       -> esegue una sola volta
   - memoize(fn)                    -> cache dei risultati (Map)
   - withRetry(fn, n)               -> wrapper async con retry
   - groupBy(arr, keyFn)            -> raggruppa via reduce
   - ?? / ??= / ?.                  -> nullish, default, optional chaining
   - spread { ...obj } / [ ...arr ] -> copia/merge immutabile
   ============================================================ */
