/* ============================================================
   95 JS ADV FP
   Functional Programming in JavaScript: pure functions, immutability,
   function composition, currying e stile point-free.
   La FP tratta le funzioni come "first-class citizens": le si passa,
   le si ritorna, le si combina. L'obiettivo e' scrivere codice
   prevedibile (stesso input -> stesso output), senza side effect,
   facile da testare e da comporre come tanti mattoncini riutilizzabili.
   Esempi ispirati a un gestionale ERP (dipendenti, timbrature, turni).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) PURE FUNCTIONS (funzioni pure)
   Una pure function: dipende SOLO dai suoi argomenti e NON
   produce side effect (non muta variabili esterne, non logga,
   non scrive su DB). Stesso input => sempre stesso output.
------------------------------------------------------------ */

// Pura: dipende solo da a e b
const somma = (a, b) => a + b;
console.log(somma(2, 3)); // => 5

// IMPURA: legge uno stato esterno mutabile
let aliquota = 0.22;
const lordoImpuro = (netto) => netto * (1 + aliquota);
console.log(lordoImpuro(100)); // => 122 (ma cambia se cambia 'aliquota')

// Versione PURA: l'aliquota diventa un parametro
const lordoPuro = (netto, iva) => netto * (1 + iva);
console.log(lordoPuro(100, 0.22)); // => 122

// IMPURA: muta l'array ricevuto (side effect)
const aggiungiBadgeImpuro = (lista, badge) => { lista.push(badge); return lista; };

// PURA: ritorna un nuovo array, non tocca l'originale
const aggiungiBadgePuro = (lista, badge) => [...lista, badge];
const badges = ['UP-001', 'UP-002'];
console.log(aggiungiBadgePuro(badges, 'UP-003')); // => ['UP-001','UP-002','UP-003']
console.log(badges); // => ['UP-001','UP-002']  (intatto)


/* ------------------------------------------------------------
   2) IMMUTABILITY (immutabilita')
   Non si modifica un dato esistente: se ne crea una copia nuova
   con le modifiche. Spread, map, filter aiutano molto.
------------------------------------------------------------ */

const dipendente = { id: 1, nome: 'Mario', reparto: 'PR', ruolo: 'operaio' };

// Aggiornare un campo senza mutare: spread + override
const promosso = { ...dipendente, ruolo: 'capoturno' };
console.log(promosso.ruolo);    // => capoturno
console.log(dipendente.ruolo);  // => operaio (originale intatto)

// Rimuovere un campo in modo immutabile (rest destructuring)
const { reparto, ...senzaReparto } = dipendente;
console.log(senzaReparto); // => { id: 1, nome: 'Mario', ruolo: 'operaio' }

// Object.freeze: congela superficialmente l'oggetto (shallow)
const CONFIG = Object.freeze({ regolaArrotondamento: 5, turnoDefault: 'P4' });
CONFIG.regolaArrotondamento = 10; // ignorato in strict mode -> errore silenzioso/throw
console.log(CONFIG.regolaArrotondamento); // => 5

// Update immutabile di un elemento dentro un array
const turni = [
  { id: 1, sigla: 'P4', pausa: true },
  { id: 2, sigla: 'P2', pausa: false },
];
const senzaPausaSulP4 = turni.map(t =>
  t.sigla === 'P4' ? { ...t, pausa: false } : t
);
console.log(senzaPausaSulP4[0].pausa); // => false
console.log(turni[0].pausa);           // => true (intatto)


/* ------------------------------------------------------------
   3) HIGHER-ORDER FUNCTIONS (funzioni di ordine superiore)
   Funzioni che ricevono e/o ritornano altre funzioni.
   Sono il cuore della componibilita'.
------------------------------------------------------------ */

// Ritorna una funzione (factory di validatori)
const lunghezzaMax = (n) => (str) => str.length <= n;
const siglaValida = lunghezzaMax(2);
console.log(siglaValida('PR')); // => true
console.log(siglaValida('PROD')); // => false

// Riceve una funzione (predicato configurabile)
const contaSe = (arr, pred) => arr.filter(pred).length;
const numeri = [4, 9, 2, 7, 1];
console.log(contaSe(numeri, n => n > 3)); // => 3


/* ------------------------------------------------------------
   4) COMPOSE e PIPE (composizione di funzioni)
   compose(f, g)(x) = f(g(x))  -> da destra a sinistra
   pipe(f, g)(x)    = g(f(x))  -> da sinistra a destra (piu' leggibile)
------------------------------------------------------------ */

const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const trim = (s) => s.trim();
const upper = (s) => s.toUpperCase();
const noSpazi = (s) => s.replace(/\s+/g, '');
const max8 = (s) => s.slice(0, 8);

// Normalizzazione codice (pattern reale ERP: String(v).trim().toUpperCase()...)
const normalizzaCodice = pipe(trim, upper, noSpazi, max8);
console.log(normalizzaCodice('  up 001 extra ')); // => UP001EXT

// Stesso risultato con compose (ordine invertito)
const normalizzaCompose = compose(max8, noSpazi, upper, trim);
console.log(normalizzaCompose('  up 001 extra ')); // => UP001EXT


/* ------------------------------------------------------------
   5) CURRYING (currificazione)
   Trasformare f(a, b, c) in f(a)(b)(c): si fissano gli argomenti
   uno alla volta, ottenendo funzioni specializzate riutilizzabili.
------------------------------------------------------------ */

// Curry manuale
const moltiplica = (a) => (b) => a * b;
const doppio = moltiplica(2);
console.log(doppio(21)); // => 42

// Curry generico (auto-curry a partire da una funzione a N argomenti)
const curry = (fn) => {
  const curried = (...args) =>
    args.length >= fn.length
      ? fn(...args)
      : (...next) => curried(...args, ...next);
  return curried;
};

const calcolaStraordinario = (tariffa, maggiorazione, ore) =>
  tariffa * (1 + maggiorazione) * ore;
const cs = curry(calcolaStraordinario);

const straFestivo = cs(15)(0.5); // tariffa 15, maggiorazione 50% fissate
console.log(straFestivo(4));     // => 90
console.log(cs(15, 0.5, 4));     // => 90 (puoi anche chiamarla tutta insieme)


/* ------------------------------------------------------------
   6) PARTIAL APPLICATION (applicazione parziale)
   Simile al currying ma fissa un sottoinsieme di argomenti
   in un colpo solo, senza per forza arrivare ad aracne(a)(b)(c).
------------------------------------------------------------ */

const partial = (fn, ...fissi) => (...resto) => fn(...fissi, ...resto);

const logEvento = (livello, modulo, msg) => `[${livello}] ${modulo}: ${msg}`;
const logTimbrature = partial(logEvento, 'INFO', 'TIMBRATURE');
console.log(logTimbrature('ingresso registrato')); // => [INFO] TIMBRATURE: ingresso registrato


/* ------------------------------------------------------------
   7) POINT-FREE STYLE (tacit programming)
   Si definiscono funzioni senza nominare esplicitamente i loro
   argomenti: si combinano funzioni gia' pronte. Piu' dichiarativo.
------------------------------------------------------------ */

// Con argomento esplicito (non point-free)
const isApprovataExpl = (richiesta) => richiesta.stato === 'approvata';

// Point-free: helper riutilizzabili + composizione
const prop = (chiave) => (obj) => obj[chiave];
const equals = (val) => (x) => x === val;
const isApprovata = pipe(prop('stato'), equals('approvata'));
console.log(isApprovata({ stato: 'approvata' })); // => true
console.log(isApprovata({ stato: 'in_attesa' }));  // => false

// map "point-free": passo direttamente la funzione, non (x => f(x))
const nomi = [{ nome: 'Mario' }, { nome: 'Lucia' }];
console.log(nomi.map(prop('nome'))); // => ['Mario','Lucia']


/* ------------------------------------------------------------
   8) reduce come motore universale della FP
   map, filter e somme sono tutti esprimibili con reduce.
------------------------------------------------------------ */

// Somma minuti delle richieste approvate (pattern reale ERP)
const richieste = [
  { stato: 'approvata', minuti: 120 },
  { stato: 'in_attesa', minuti: 60 },
  { stato: 'approvata', minuti: 30 },
];
const totaleMinuti = richieste
  .filter(isApprovata)
  .reduce((acc, r) => acc + r.minuti, 0);
console.log(totaleMinuti); // => 150

// map implementato con reduce
const mapR = (fn) => (arr) => arr.reduce((acc, x) => [...acc, fn(x)], []);
console.log(mapR(doppio)([1, 2, 3])); // => [2,4,6]

// groupBy: raggruppa dipendenti per reparto (utilissimo nei report)
const groupBy = (chiaveFn) => (arr) =>
  arr.reduce((acc, x) => {
    const k = chiaveFn(x);
    return { ...acc, [k]: [...(acc[k] ?? []), x] };
  }, {});
const personale = [
  { nome: 'Mario', reparto: 'PR' },
  { nome: 'Lucia', reparto: 'PR' },
  { nome: 'Gino', reparto: 'MG' },
];
console.log(groupBy(prop('reparto'))(personale));
// => { PR: [Mario, Lucia], MG: [Gino] }


/* ------------------------------------------------------------
   9) PIPELINE DI DOMINIO COMPLETA (caso reale ERP)
   Da array grezzo di timbrature -> DTO pulito per la UI.
   Tutto puro, componibile e immutabile.
------------------------------------------------------------ */

const timbrature = [
  { badge: 'up-001 ', reparto: 'pr', minuti: 480, valida: true },
  { badge: 'UP-002', reparto: 'mg', minuti: 0, valida: false },
  { badge: ' up-003', reparto: 'pr', minuti: 510, valida: true },
];

const toOre = (m) => +(m / 60).toFixed(2);
const soloValide = (arr) => arr.filter(prop('valida'));
const toDTO = (t) => ({
  badge: normalizzaCodice(t.badge),
  reparto: (t.reparto || 'xx').toUpperCase(),
  ore: toOre(t.minuti),
});

const elaboraTimbrature = pipe(soloValide, mapR(toDTO));
console.log(elaboraTimbrature(timbrature));
// => [ {badge:'UP-001',reparto:'PR',ore:8}, {badge:'UP-003',reparto:'PR',ore:8.5} ]


/* ------------------------------------------------------------
   10) FUNCTOR-LIKE: incatenare trasformazioni in sicurezza
   Un piccolo wrapper "Maybe" per gestire null/undefined senza if.
------------------------------------------------------------ */

const Maybe = (valore) => ({
  map: (fn) => (valore == null ? Maybe(null) : Maybe(fn(valore))),
  getOr: (def) => (valore == null ? def : valore),
});

const siglaReparto = (dip) =>
  Maybe(dip)
    .map(prop('reparto'))
    .map(upper)
    .getOr('XX');
console.log(siglaReparto({ reparto: 'pr' })); // => PR
console.log(siglaReparto(null));              // => XX


/* ------------------------------------------------------------
   11) MEMOIZE (cache di funzioni pure)
   Solo le pure functions sono memoizzabili in modo affidabile:
   stesso input => stesso output, quindi la cache e' sempre valida.
------------------------------------------------------------ */

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const val = fn(...args);
    cache.set(key, val);
    return val;
  };
};

const fib = memoize((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(20)); // => 6765 (veloce grazie alla cache)


/* ------------------------------------------------------------
   12) tap: side effect controllato dentro una pipe (debug)
   tap esegue un effetto (es. log) ma RITORNA il valore invariato,
   cosi' la pipe resta intatta.
------------------------------------------------------------ */

const tap = (fn) => (x) => { fn(x); return x; };
const elaboraConDebug = pipe(
  trim,
  tap((v) => console.log('dopo trim:', v)), // => dopo trim: up 001
  upper
);
console.log(elaboraConDebug('  up 001  ')); // => UP 001


/* ============================================================
   RIEPILOGO COMANDI / CONCETTI PRINCIPALI
   ------------------------------------------------------------
   - pure function: stesso input -> stesso output, niente side effect
   - immutability: { ...obj }, [ ...arr ], map/filter, Object.freeze()
   - rest destructuring: const { x, ...resto } = obj  (rimozione campo)
   - higher-order function: funzioni che prendono/ritornano funzioni
   - compose(...fns): reduceRight, applica da destra a sinistra
   - pipe(...fns): reduce, applica da sinistra a destra
   - curry(fn): fn(a)(b)(c), specializzazione progressiva
   - partial(fn, ...fissi): fissa alcuni argomenti subito
   - point-free: prop(), equals(), composizione senza nominare args
   - Array.reduce / reduceRight: motore di map, filter, somme, groupBy
   - groupBy(keyFn): raggruppamento immutabile via reduce
   - Maybe.map/.getOr: gestione null/undefined senza if
   - memoize(fn): cache per pure functions (new Map + JSON.stringify)
   - tap(fn): side effect (log) che ritorna il valore invariato
   ============================================================ */
