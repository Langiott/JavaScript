/* ============================================================
   63 JS Generators
   Un generator e una funzione speciale (function*) che puo essere
   messa in pausa e ripresa: ogni 'yield' restituisce un valore e
   sospende l'esecuzione fino alla successiva chiamata di next().
   Restituisce un iterator (lazy), quindi i valori vengono prodotti
   solo quando servono: utile per lazy sequences, stream di dati,
   pipeline e sequenze potenzialmente infinite senza occupare memoria.
   ============================================================ */

// ------------------------------------------------------------
// 1) Generator di base: function* + yield
// ------------------------------------------------------------

// La funzione viene dichiarata con l'asterisco function*.
function* saluti() {
  yield 'ciao';
  yield 'buongiorno';
  yield 'salve';
}

// Chiamare un generator NON esegue il corpo: ritorna un iterator.
const it = saluti();
console.log(it.next()); // => { value: 'ciao', done: false }
console.log(it.next()); // => { value: 'buongiorno', done: false }
console.log(it.next()); // => { value: 'salve', done: false }
console.log(it.next()); // => { value: undefined, done: true }

// ------------------------------------------------------------
// 2) I generator sono iterabili: for...of, spread, destructuring
// ------------------------------------------------------------

// for...of consuma automaticamente fino a done:true (ignora il return).
for (const s of saluti()) {
  console.log(s); // => ciao / buongiorno / salve
}

// Spread in un array.
const arr = [...saluti()];
console.log(arr); // => [ 'ciao', 'buongiorno', 'salve' ]

// Array destructuring (prende solo i primi valori richiesti).
const [primo, secondo] = saluti();
console.log(primo, secondo); // => ciao buongiorno

// ------------------------------------------------------------
// 3) yield in un ciclo: generare sequenze
// ------------------------------------------------------------

// Genera i numeri da start a end (inclusi).
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}

console.log([...range(1, 5)]);      // => [ 1, 2, 3, 4, 5 ]
console.log([...range(0, 10, 2)]);  // => [ 0, 2, 4, 6, 8, 10 ]

// ------------------------------------------------------------
// 4) return dentro un generator
// ------------------------------------------------------------

// Il valore di return finisce in { value, done:true } ma NON in for...of.
function* conReturn() {
  yield 1;
  yield 2;
  return 99; // valore finale
  // yield 3; // mai raggiunto
}

const r = conReturn();
console.log(r.next()); // => { value: 1, done: false }
console.log(r.next()); // => { value: 2, done: false }
console.log(r.next()); // => { value: 99, done: true }
console.log([...conReturn()]); // => [ 1, 2 ]  (il return e escluso)

// ------------------------------------------------------------
// 5) Passare valori a next(): comunicazione bidirezionale
// ------------------------------------------------------------

// Il valore passato a next() diventa il risultato dell'espressione yield.
function* dialogo() {
  const nome = yield 'Come ti chiami?';
  const eta = yield `Ciao ${nome}, quanti anni hai?`;
  return `${nome} ha ${eta} anni`;
}

const d = dialogo();
console.log(d.next().value);        // => Come ti chiami?
console.log(d.next('Anna').value);  // => Ciao Anna, quanti anni hai?
console.log(d.next(30).value);      // => Anna ha 30 anni

// ------------------------------------------------------------
// 6) yield* : delega ad un altro iterable/generator
// ------------------------------------------------------------

// yield* "appiattisce" delegando i valori di un altro generator o array.
function* lettere() {
  yield 'a';
  yield 'b';
}

function* misto() {
  yield 1;
  yield* lettere();       // delega al generator lettere
  yield* [10, 20];        // delega ad un array iterable
  yield 2;
}

console.log([...misto()]); // => [ 1, 'a', 'b', 10, 20, 2 ]

// yield* puo anche catturare il valore di return del generator delegato.
function* interno() {
  yield 'x';
  return 'fine-interno';
}
function* esterno() {
  const res = yield* interno();
  console.log('return delegato:', res); // => return delegato: fine-interno
  yield 'y';
}
console.log([...esterno()]); // => [ 'x', 'y' ]

// ------------------------------------------------------------
// 7) Generatori infiniti (lazy): la chiave e non consumare tutto
// ------------------------------------------------------------

// Contatore infinito: senza un break consumerebbe per sempre.
function* naturali() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

const nat = naturali();
console.log(nat.next().value); // => 1
console.log(nat.next().value); // => 2
console.log(nat.next().value); // => 3

// Sequenza di Fibonacci infinita ma calcolata on demand.
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// take(): prende solo i primi n valori da un iterable (anche infinito).
function* take(iterable, n) {
  let i = 0;
  for (const v of iterable) {
    if (i++ >= n) return;
    yield v;
  }
}

console.log([...take(fibonacci(), 8)]); // => [ 0, 1, 1, 2, 3, 5, 8, 13 ]

// ------------------------------------------------------------
// 8) Combinatori lazy: map, filter su sequenze (pipeline)
// ------------------------------------------------------------

// mapGen e filterGen lavorano in streaming, senza materializzare array.
function* mapGen(iterable, fn) {
  for (const v of iterable) yield fn(v);
}

function* filterGen(iterable, pred) {
  for (const v of iterable) if (pred(v)) yield v;
}

// Pipeline: naturali -> tieni i pari -> raddoppia -> primi 5.
const pipeline = take(
  mapGen(
    filterGen(naturali(), x => x % 2 === 0),
    x => x * 10
  ),
  5
);
console.log([...pipeline]); // => [ 20, 40, 60, 80, 100 ]

// ------------------------------------------------------------
// 9) [Symbol.iterator] con generator: rendere iterabile un oggetto
// ------------------------------------------------------------

// Definendo [Symbol.iterator] come generator l'oggetto diventa iterabile.
const reparto = {
  sigla: 'UP',
  dipendenti: ['Anna', 'Luca', 'Sara'],
  *[Symbol.iterator]() {
    for (const d of this.dipendenti) {
      yield `${this.sigla}: ${d}`;
    }
  }
};

console.log([...reparto]); // => [ 'UP: Anna', 'UP: Luca', 'UP: Sara' ]

// ------------------------------------------------------------
// 10) ESEMPIO ERP: generatore di codici badge progressivi
// ------------------------------------------------------------

// Spunto reale: badge tipo 'UP-001', 'UP-002'... generati on demand.
function* generaBadge(sigla, partenza = 1) {
  let n = partenza;
  while (true) {
    yield `${sigla}-${String(n++).padStart(3, '0')}`;
  }
}

const badge = generaBadge('UP');
console.log(badge.next().value); // => UP-001
console.log(badge.next().value); // => UP-002
console.log([...take(generaBadge('MG', 10), 3)]); // => [ 'MG-010', 'MG-011', 'MG-012' ]

// ------------------------------------------------------------
// 11) ESEMPIO ERP: iterare le timbrature di una giornata (naive-UTC)
// ------------------------------------------------------------

// Le timbrature sono salvate come orari "naive-UTC" (HH:MM stringa).
// Un generator produce gli eventi in ordine, lazy, senza array intermedi.
const giornata = {
  badge: 'UP-001',
  ingresso: '08:00',
  uscitaPranzo: '12:30',
  rientroPranzo: '13:00',
  uscita: '17:00'
};

function* eventiTimbratura(t) {
  if (t.ingresso) yield { tipo: 'ingresso', ora: t.ingresso };
  if (t.uscitaPranzo) yield { tipo: 'uscitaPranzo', ora: t.uscitaPranzo };
  if (t.rientroPranzo) yield { tipo: 'rientroPranzo', ora: t.rientroPranzo };
  if (t.uscita) yield { tipo: 'uscita', ora: t.uscita };
}

for (const e of eventiTimbratura(giornata)) {
  console.log(`${e.ora} -> ${e.tipo}`);
}
// => 08:00 -> ingresso
// => 12:30 -> uscitaPranzo
// => 13:00 -> rientroPranzo
// => 17:00 -> uscita

// ------------------------------------------------------------
// 12) ESEMPIO ERP: paginazione lazy di query (chunk a chunk)
// ------------------------------------------------------------

// Simula una sorgente dati grande (es. tabella dipendenti).
const tuttiDipendenti = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  nome: `Dip${i + 1}`
}));

// Restituisce pagine (chunk) di dimensione fissa, una alla volta.
function* paginazione(items, size = 10) {
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size); // una "pagina" per volta
  }
}

for (const pagina of paginazione(tuttiDipendenti, 10)) {
  console.log(`pagina di ${pagina.length} dipendenti`);
}
// => pagina di 10 dipendenti
// => pagina di 10 dipendenti
// => pagina di 3 dipendenti

// ------------------------------------------------------------
// 13) ESEMPIO ERP: appiattire reparti -> dipendenti con yield*
// ------------------------------------------------------------

// Struttura annidata: ogni reparto ha una lista di dipendenti.
const reparti = [
  { sigla: 'UP', dipendenti: ['Anna', 'Luca'] },
  { sigla: 'MG', dipendenti: ['Sara'] },
  { sigla: 'AM', dipendenti: ['Marco', 'Elia'] }
];

// yield* delega all'iterazione interna -> flatten lazy.
function* dipendentiDiReparto(rep) {
  for (const nome of rep.dipendenti) {
    yield { reparto: rep.sigla, nome };
  }
}

function* tuttiIDipendenti(reparti) {
  for (const rep of reparti) {
    yield* dipendentiDiReparto(rep);
  }
}

console.log([...tuttiIDipendenti(reparti)]);
// => [ { reparto:'UP', nome:'Anna' }, { reparto:'UP', nome:'Luca' },
//      { reparto:'MG', nome:'Sara' }, { reparto:'AM', nome:'Marco' },
//      { reparto:'AM', nome:'Elia' } ]

// ------------------------------------------------------------
// 14) Generator ricorsivo con yield* : attraversare un albero
// ------------------------------------------------------------

// Albero organizzativo: yield* permette ricorsione naturale e lazy.
const organigramma = {
  nome: 'Azienda',
  figli: [
    { nome: 'Produzione', figli: [{ nome: 'Linea1', figli: [] }] },
    { nome: 'Magazzino', figli: [] }
  ]
};

function* attraversa(nodo) {
  yield nodo.nome;
  for (const figlio of nodo.figli) {
    yield* attraversa(figlio); // ricorsione delegata
  }
}

console.log([...attraversa(organigramma)]);
// => [ 'Azienda', 'Produzione', 'Linea1', 'Magazzino' ]

// ------------------------------------------------------------
// 15) return() e throw() sull'iterator: chiusura e gestione errori
// ------------------------------------------------------------

// try/finally dentro un generator garantisce la pulizia anche se interrotto.
function* conPulizia() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log('cleanup eseguito'); // es. chiudere una connessione
  }
}

const c = conPulizia();
console.log(c.next().value); // => 1
console.log(c.return(0));    // => stampa 'cleanup eseguito' poi { value: 0, done: true }

// throw() inietta un errore nel punto dello yield corrente.
function* conThrow() {
  try {
    yield 'lavoro';
  } catch (err) {
    console.log('gestito:', err.message); // => gestito: stop
    yield 'recuperato';
  }
}
const ct = conThrow();
console.log(ct.next().value);          // => lavoro
console.log(ct.throw(new Error('stop')).value); // => recuperato

// ------------------------------------------------------------
// 16) Async generator: async function* + for await...of
// ------------------------------------------------------------

// Gli async generator producono valori asincroni (es. fetch a pagine).
async function* streamPagineAsync(pagine) {
  for (const p of pagine) {
    // simula attesa I/O (await di una Promise)
    await new Promise(res => setTimeout(res, 0));
    yield p;
  }
}

async function consumaStream() {
  const out = [];
  for await (const pagina of streamPagineAsync(['p1', 'p2', 'p3'])) {
    out.push(pagina);
  }
  console.log(out); // => [ 'p1', 'p2', 'p3' ]
}
consumaStream();

/* ============================================================
   RIEPILOGO COMANDI
   - function* nome() {}        dichiarazione di un generator
   - yield valore               restituisce un valore e sospende
   - yield* iterable            delega ad un altro iterable/generator
   - gen()                      crea l'iterator (non esegue il corpo)
   - it.next(arg)               avanza; arg diventa il risultato di yield
   - it.return(v)               termina il generator (attiva finally)
   - it.throw(err)              inietta un errore nel punto dello yield
   - for...of                   consuma un generator (ignora il return)
   - [...gen()]                 spread in array
   - [a, b] = gen()             destructuring lazy
   - [Symbol.iterator]() {}     rende iterabile un oggetto custom
   - while(true) + yield        generatori infiniti (lazy sequences)
   - async function*            async generator
   - for await...of             consuma un async generator
   ============================================================ */
