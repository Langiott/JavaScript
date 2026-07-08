/* ============================================================
   31 JS Callbacks
   Una callback e' una funzione passata come argomento a un'altra
   funzione, che la invocera' al momento giusto. E' il mattone
   fondamentale della programmazione funzionale e asincrona in
   JavaScript: permette di "iniettare" comportamento dentro un'altra
   funzione. Distinguiamo callback SINCRONE (eseguite subito, come in
   map/filter/forEach) e callback ASINCRONE (eseguite piu' tardi, come
   setTimeout o le query a un database). L'abuso di callback annidate
   genera il temuto "callback hell".
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) Una funzione e' un valore: si puo' passare come argomento
   ------------------------------------------------------------ */

// Definiamo una funzione e la passiamo a un'altra funzione.
function saluta(nome) {
  return `Ciao ${nome}`;
}

function eseguiConNome(fn, nome) {
  // fn e' la callback: la funzione chiamante decide QUANDO chiamarla
  return fn(nome);
}

console.log(eseguiConNome(saluta, 'Mario')); // => Ciao Mario

/* ------------------------------------------------------------
   2) Callback anonime e arrow function inline
   ------------------------------------------------------------ */

function ripeti(volte, callback) {
  for (let i = 0; i < volte; i++) {
    callback(i); // passiamo l'indice corrente alla callback
  }
}

ripeti(3, (i) => console.log(`giro ${i}`));
// => giro 0
// => giro 1
// => giro 2

/* ------------------------------------------------------------
   3) Callback SINCRONE: i metodi degli array
   ------------------------------------------------------------ */

const numeri = [1, 2, 3, 4, 5];

// forEach: esegue la callback per ogni elemento (nessun valore di ritorno)
numeri.forEach((n) => process.stdout && void n);

// map: trasforma ogni elemento
const doppi = numeri.map((n) => n * 2);
console.log(doppi); // => [ 2, 4, 6, 8, 10 ]

// filter: tiene solo gli elementi per cui la callback ritorna true
const pari = numeri.filter((n) => n % 2 === 0);
console.log(pari); // => [ 2, 4 ]

// reduce: accumula un risultato (callback con accumulatore)
const somma = numeri.reduce((acc, n) => acc + n, 0);
console.log(somma); // => 15

// find / some / every: callback di test
console.log(numeri.find((n) => n > 3));      // => 4
console.log(numeri.some((n) => n > 4));       // => true
console.log(numeri.every((n) => n > 0));      // => true

/* ------------------------------------------------------------
   4) Higher-order function: funzione che RITORNA una funzione
   ------------------------------------------------------------ */

// moltiplicatore restituisce una callback specializzata (closure)
function moltiplicatore(fattore) {
  return (n) => n * fattore;
}
const triplica = moltiplicatore(3);
console.log([1, 2, 3].map(triplica)); // => [ 3, 6, 9 ]

/* ------------------------------------------------------------
   5) Callback con parametri di default
   ------------------------------------------------------------ */

function elabora(valore, trasforma = (x) => x) {
  // se non passi una callback, usa l'identita'
  return trasforma(valore);
}
console.log(elabora(10));                 // => 10
console.log(elabora(10, (x) => x + 5));   // => 15

/* ------------------------------------------------------------
   6) Callback ASINCRONE: setTimeout
   ------------------------------------------------------------ */

console.log('A: prima del timeout');
setTimeout(() => {
  console.log('C: dentro la callback (asincrona, dopo)');
}, 0);
console.log('B: dopo il timeout (sincrono, viene prima di C)');
// Ordine atteso: A, B, C  (la callback va nella event queue)

/* ------------------------------------------------------------
   7) Convenzione "error-first callback" (stile Node.js)
   La callback riceve come PRIMO argomento l'errore (o null),
   poi il risultato. E' lo standard storico di Node.
   ------------------------------------------------------------ */

function leggiTimbratura(badge, callback) {
  // simuliamo una lettura asincrona da DB
  setTimeout(() => {
    if (!badge) {
      callback(new Error('badge mancante'));   // err valorizzato
      return;
    }
    callback(null, { badge, ore: 8 });          // err = null, dati ok
  }, 5);
}

leggiTimbratura('UP-001', (err, dati) => {
  if (err) {
    console.error('Errore:', err.message);
    return;
  }
  console.log('Timbratura:', dati); // => Timbratura: { badge: 'UP-001', ore: 8 }
});

leggiTimbratura('', (err) => {
  if (err) console.error('Errore:', err.message); // => Errore: badge mancante
});

/* ------------------------------------------------------------
   8) ESEMPIO ERP: calcolo minuti lavorati con callback sincrone
   Pattern reale: filter().reduce() per sommare i minuti delle
   timbrature approvate.
   ------------------------------------------------------------ */

const timbrature = [
  { badge: 'UP-001', minuti: 480, approvata: true },
  { badge: 'UP-002', minuti: 300, approvata: false },
  { badge: 'UP-001', minuti: 120, approvata: true },
];

const minutiApprovati = timbrature
  .filter((t) => t.approvata)                // callback di test
  .reduce((tot, t) => tot + t.minuti, 0);    // callback accumulatrice
console.log(`Minuti approvati: ${minutiApprovati}`); // => Minuti approvati: 600

/* ------------------------------------------------------------
   9) ESEMPIO ERP: higher-order che applica un filtro a una query
   Pattern reale: applicaFiltroData(where, query) modifica e ritorna.
   ------------------------------------------------------------ */

function creaFiltroReparto(sigla) {
  // ritorna una callback usabile in filter()
  return (dipendente) => (dipendente.reparto ?? 'XX') === sigla;
}

const dipendenti = [
  { nome: 'Anna', reparto: 'UF' },
  { nome: 'Luca', reparto: 'PR' },
  { nome: 'Sara', reparto: 'UF' },
];
const ufficio = dipendenti.filter(creaFiltroReparto('UF'));
console.log(ufficio.map((d) => d.nome)); // => [ 'Anna', 'Sara' ]

/* ------------------------------------------------------------
   10) Callback come "strategia" (dependency injection)
   ------------------------------------------------------------ */

function ordinaDipendenti(lista, criterio) {
  // criterio e' la callback di confronto, come in Array.sort
  return [...lista].sort(criterio);
}
const perNome = ordinaDipendenti(dipendenti, (a, b) => a.nome.localeCompare(b.nome));
console.log(perNome.map((d) => d.nome)); // => [ 'Anna', 'Luca', 'Sara' ]

/* ------------------------------------------------------------
   11) CALLBACK HELL: annidamento profondo (anti-pattern)
   Ogni operazione asincrona dipende dalla precedente, e l'indentazione
   cresce a "piramide". Difficile da leggere e da gestire gli errori.
   ------------------------------------------------------------ */

function getDipendente(id, cb) {
  setTimeout(() => cb(null, { id, nome: 'Mario', badge: 'UP-001' }), 5);
}
function getTurni(badge, cb) {
  setTimeout(() => cb(null, [{ badge, turno: 'P4' }]), 5);
}
function getVestiario(badge, cb) {
  setTimeout(() => cb(null, [{ badge, capo: 'giacca', taglia: 'L' }]), 5);
}

// La piramide del callback hell:
getDipendente(1, (err, dip) => {
  if (err) return console.error(err);
  getTurni(dip.badge, (err, turni) => {
    if (err) return console.error(err);
    getVestiario(dip.badge, (err, vestiario) => {
      if (err) return console.error(err);
      console.log(`Hell -> ${dip.nome}: ${turni.length} turni, ${vestiario.length} capi`);
      // => Hell -> Mario: 1 turni, 1 capi
    });
  });
});

/* ------------------------------------------------------------
   12) Mitigare il callback hell: funzioni nominate e appiattimento
   Estraendo le callback in funzioni nominate la piramide si riduce.
   ------------------------------------------------------------ */

function gestisciVestiario(err, vestiario) {
  if (err) return console.error(err);
  console.log(`Flat -> capi: ${vestiario.length}`); // => Flat -> capi: 1
}
function gestisciTurni(err, turni) {
  if (err) return console.error(err);
  getVestiario('UP-001', gestisciVestiario);
}
getDipendente(1, (err, dip) => {
  if (err) return console.error(err);
  getTurni(dip.badge, gestisciTurni);
});

/* ------------------------------------------------------------
   13) Dalle callback alle Promise (la soluzione moderna)
   Si "promisifica" una funzione error-first avvolgendola in Promise.
   ------------------------------------------------------------ */

function getDipendenteP(id) {
  return new Promise((resolve, reject) => {
    getDipendente(id, (err, dip) => (err ? reject(err) : resolve(dip)));
  });
}

getDipendenteP(1)
  .then((dip) => console.log(`Promise -> ${dip.nome}`)) // => Promise -> Mario
  .catch((err) => console.error(err));

// util.promisify fa la stessa cosa automaticamente per le error-first callback:
const { promisify } = require('util');
const getTurniP = promisify(getTurni);
getTurniP('UP-001').then((t) => console.log(`Turni via promisify: ${t.length}`));
// => Turni via promisify: 1

/* ------------------------------------------------------------
   14) async/await: lettura sequenziale e leggibile (addio piramide)
   ------------------------------------------------------------ */

async function riepilogo(id) {
  const dip = await getDipendenteP(id);
  const turni = await getTurniP(dip.badge);
  return `${dip.nome}: ${turni.length} turni`;
}
riepilogo(1).then((r) => console.log('Async ->', r)); // => Async -> Mario: 1 turni

/* ------------------------------------------------------------
   15) Callback e this: attenzione al contesto
   Le arrow function NON hanno this proprio: ereditano quello esterno.
   Una function tradizionale come callback puo' perdere il this.
   ------------------------------------------------------------ */

const contatore = {
  valore: 0,
  // arrow: this preso dall'oggetto al momento giusto grazie alla chiusura
  incrementaTutti(lista) {
    lista.forEach(() => {
      this.valore++; // funziona perche' arrow eredita this di incrementaTutti
    });
  },
};
contatore.incrementaTutti([1, 2, 3]);
console.log(contatore.valore); // => 3

/* ------------------------------------------------------------
   16) ESEMPIO browser: callback su eventi (pseudo-eseguibile)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function registraEventiBadge() {
  // const input = document.getElementById('badge');
  // input.addEventListener('input', (e) => {
  //   const codice = e.target.value.trim().toUpperCase();
  //   if (/^UP-\d{3}$/.test(codice)) console.log('Badge valido', codice);
  // });
}
void registraEventiBadge;

/* ============================================================
   RIEPILOGO COMANDI
   - funzione passata come argomento (callback)
   - Array.forEach(cb) / map(cb) / filter(cb) / reduce(cb, init)
   - Array.find(cb) / some(cb) / every(cb) / sort(cb)
   - higher-order function (funzione che ritorna funzione)
   - parametri di default per callback: fn = (x) => x
   - setTimeout(cb, ms)  -> callback asincrona
   - error-first callback: cb(err, dati)
   - new Promise((resolve, reject) => {...})  -> promisificazione
   - util.promisify(fn)
   - .then() / .catch()
   - async / await
   - this nelle callback: arrow eredita, function tradizionale no
   - addEventListener(evento, cb)  (browser)
   ============================================================ */
