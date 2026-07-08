/* ============================================================
   49 JS Array Methods
   Metodi base per lavorare con gli array in JavaScript:
   push/pop/shift/unshift per aggiungere e togliere elementi,
   slice/splice per estrarre e modificare porzioni, concat per
   unire array, join per produrre stringhe, reverse per invertire
   l'ordine e indexOf per cercare la posizione di un elemento.
   Distinguiamo i metodi "mutating" (modificano l'array originale)
   da quelli "non-mutating" (restituiscono un nuovo array/valore).
   ============================================================ */

// ------------------------------------------------------------
// push(): aggiunge uno o piu elementi IN CODA. MUTATING.
// Ritorna la nuova length dell'array.
// ------------------------------------------------------------
const badge = ['UP-001', 'UP-002'];
const nuovaLen = badge.push('UP-003');
console.log(badge);    // => ['UP-001', 'UP-002', 'UP-003']
console.log(nuovaLen); // => 3

// push accetta piu argomenti in un colpo solo
const reparti = ['MA'];
reparti.push('VE', 'LO', 'QC');
console.log(reparti); // => ['MA', 'VE', 'LO', 'QC']

// ------------------------------------------------------------
// pop(): rimuove e ritorna l'ULTIMO elemento. MUTATING.
// ------------------------------------------------------------
const turni = ['P2', 'P4', 'P6'];
const ultimo = turni.pop();
console.log(ultimo); // => 'P6'
console.log(turni);  // => ['P2', 'P4']

// pop su array vuoto ritorna undefined (non lancia errore)
console.log([].pop()); // => undefined

// ------------------------------------------------------------
// shift(): rimuove e ritorna il PRIMO elemento. MUTATING.
// ------------------------------------------------------------
const coda = ['UP-001', 'UP-002', 'UP-003'];
const primo = coda.shift();
console.log(primo); // => 'UP-001'
console.log(coda);  // => ['UP-002', 'UP-003']

// ------------------------------------------------------------
// unshift(): aggiunge uno o piu elementi IN TESTA. MUTATING.
// Ritorna la nuova length.
// ------------------------------------------------------------
const lista = ['VE', 'LO'];
lista.unshift('MA');
console.log(lista); // => ['MA', 'VE', 'LO']

// Riepilogo stack/queue: con push+pop simuli uno stack (LIFO),
// con push+shift simuli una queue (FIFO).
const stack = [];
stack.push('badge1');
stack.push('badge2');
console.log(stack.pop()); // => 'badge2' (LIFO)

// ------------------------------------------------------------
// slice(start, end): estrae una porzione. NON-MUTATING.
// 'end' e' escluso. L'array originale resta intatto.
// ------------------------------------------------------------
const numeri = [10, 20, 30, 40, 50];
console.log(numeri.slice(1, 3)); // => [20, 30]
console.log(numeri.slice(2));    // => [30, 40, 50]
console.log(numeri);             // => [10, 20, 30, 40, 50] (intatto)

// Indici negativi: contano dalla fine
console.log(numeri.slice(-2));    // => [40, 50]
console.log(numeri.slice(-3, -1)); // => [30, 40]

// slice() senza argomenti crea una COPIA superficiale (shallow copy)
const copia = numeri.slice();
copia.push(60);
console.log(numeri.length); // => 5 (l'originale non cambia)

// ------------------------------------------------------------
// splice(start, deleteCount, ...items): MUTATING e potentissimo.
// Rimuove deleteCount elementi da start e/o inserisce items.
// Ritorna l'array degli elementi RIMOSSI.
// ------------------------------------------------------------
const dipendenti = ['Rossi', 'Bianchi', 'Verdi', 'Neri'];

// Rimuovere 1 elemento all'indice 1
const rimossi = dipendenti.splice(1, 1);
console.log(rimossi);     // => ['Bianchi']
console.log(dipendenti);  // => ['Rossi', 'Verdi', 'Neri']

// Inserire senza rimuovere (deleteCount = 0)
dipendenti.splice(1, 0, 'Gialli');
console.log(dipendenti); // => ['Rossi', 'Gialli', 'Verdi', 'Neri']

// Sostituire: rimuove 1 e inserisce 2
dipendenti.splice(0, 1, 'Russo', 'Romano');
console.log(dipendenti); // => ['Russo', 'Romano', 'Gialli', 'Verdi', 'Neri']

// ------------------------------------------------------------
// concat(): unisce array. NON-MUTATING (ritorna nuovo array).
// ------------------------------------------------------------
const a = ['MA', 'VE'];
const b = ['LO', 'QC'];
const tutti = a.concat(b);
console.log(tutti); // => ['MA', 'VE', 'LO', 'QC']
console.log(a);     // => ['MA', 'VE'] (intatto)

// concat accetta piu array e/o valori singoli
console.log([1].concat([2, 3], 4, [5])); // => [1, 2, 3, 4, 5]

// Alternativa moderna con spread operator (equivalente)
const tuttiSpread = [...a, ...b, 'IT'];
console.log(tuttiSpread); // => ['MA', 'VE', 'LO', 'QC', 'IT']

// ------------------------------------------------------------
// join(separatore): trasforma l'array in stringa. NON-MUTATING.
// Separatore di default e' la virgola.
// ------------------------------------------------------------
const ore = ['08', '30'];
console.log(ore.join(':'));  // => '08:30'
console.log([1, 2, 3].join()); // => '1,2,3'
console.log(['MA', 'VE', 'LO'].join(' / ')); // => 'MA / VE / LO'
console.log(['a', 'b', 'c'].join('')); // => 'abc'

// join e' utile per costruire un orario HH:MM (pattern timbrature)
const h = 8, m = 5;
const orario = [String(h).padStart(2, '0'), String(m).padStart(2, '0')].join(':');
console.log(orario); // => '08:05'

// ------------------------------------------------------------
// reverse(): inverte l'ordine. MUTATING (modifica l'originale!).
// ------------------------------------------------------------
const seq = [1, 2, 3];
seq.reverse();
console.log(seq); // => [3, 2, 1]

// Per invertire SENZA mutare, prima copia con slice o spread
const originale = ['lun', 'mar', 'mer'];
const invertito = [...originale].reverse();
console.log(invertito);  // => ['mer', 'mar', 'lun']
console.log(originale);  // => ['lun', 'mar', 'mer'] (intatto)

// ------------------------------------------------------------
// indexOf(elemento, fromIndex?): cerca la PRIMA posizione.
// Ritorna -1 se non trovato. Usa confronto stretto (===).
// ------------------------------------------------------------
const codici = ['UP-001', 'UP-002', 'UP-003', 'UP-002'];
console.log(codici.indexOf('UP-002'));    // => 1
console.log(codici.indexOf('UP-999'));    // => -1 (non trovato)
console.log(codici.indexOf('UP-002', 2)); // => 3 (cerca da indice 2)

// lastIndexOf cerca dalla fine
console.log(codici.lastIndexOf('UP-002')); // => 3

// indexOf con === non trova oggetti "uguali" ma diversi riferimenti
console.log([{ id: 1 }].indexOf({ id: 1 })); // => -1
// Per gli oggetti usa findIndex con un predicato
const arr = [{ id: 1 }, { id: 2 }];
console.log(arr.findIndex(x => x.id === 2)); // => 1

// Idioma classico: usare indexOf per testare l'esistenza
const repartiAttivi = ['MA', 'VE', 'LO'];
if (repartiAttivi.indexOf('VE') !== -1) {
  console.log('reparto presente'); // => 'reparto presente'
}
// Piu leggibile con includes() (ES2016)
console.log(repartiAttivi.includes('QC')); // => false

// ------------------------------------------------------------
// ESEMPIO PRATICO 1: coda di timbrature da processare (FIFO)
// Simuliamo l'ingresso/uscita usando shift come "preleva il piu vecchio".
// ------------------------------------------------------------
const codaTimbrature = [
  { badge: 'UP-001', tipo: 'ingresso', ora: '08:00' },
  { badge: 'UP-002', tipo: 'ingresso', ora: '08:03' },
  { badge: 'UP-001', tipo: 'uscita', ora: '17:00' },
];
while (codaTimbrature.length > 0) {
  const t = codaTimbrature.shift();
  console.log(`Processo ${t.badge} ${t.tipo} alle ${t.ora}`);
}
// => Processo UP-001 ingresso alle 08:00
// => Processo UP-002 ingresso alle 08:03
// => Processo UP-001 uscita alle 17:00

// ------------------------------------------------------------
// ESEMPIO PRATICO 2: paginazione di una lista dipendenti con slice.
// Pattern tipico: take/skip lato client.
// ------------------------------------------------------------
function paginaDipendenti(elenco, pagina, perPagina) {
  const start = (pagina - 1) * perPagina;
  return elenco.slice(start, start + perPagina);
}
const elenco = ['Russo', 'Romano', 'Gialli', 'Verdi', 'Neri', 'Bianchi'];
console.log(paginaDipendenti(elenco, 1, 2)); // => ['Russo', 'Romano']
console.log(paginaDipendenti(elenco, 2, 2)); // => ['Gialli', 'Verdi']
console.log(paginaDipendenti(elenco, 3, 2)); // => ['Neri', 'Bianchi']

// ------------------------------------------------------------
// ESEMPIO PRATICO 3: rimuovere un dipendente per codiceBadge.
// Cerco l'indice con indexOf, poi lo elimino con splice.
// ------------------------------------------------------------
function rimuoviBadge(arr, codice) {
  const i = arr.indexOf(codice);
  if (i !== -1) arr.splice(i, 1);
  return arr;
}
console.log(rimuoviBadge(['UP-001', 'UP-002', 'UP-003'], 'UP-002'));
// => ['UP-001', 'UP-003']

// ------------------------------------------------------------
// ESEMPIO PRATICO 4: costruire la sigla di un percorso reparti.
// concat per unire, reverse su copia per mostrare il ritorno, join per la label.
// ------------------------------------------------------------
const andata = ['MA', 'VE', 'LO'];
const ritorno = [...andata].reverse();
const percorso = andata.concat(ritorno.slice(1)); // evito di duplicare 'LO'
console.log(percorso.join(' -> '));
// => 'MA -> VE -> LO -> VE -> MA'

// ------------------------------------------------------------
// ESEMPIO PRATICO 5: storico ultimi N badge passati (LIFO con limite).
// push aggiunge in coda, se supera il limite shift toglie il piu vecchio.
// ------------------------------------------------------------
function pushConLimite(storico, valore, max) {
  storico.push(valore);
  if (storico.length > max) storico.shift();
  return storico;
}
let storico = [];
['UP-001', 'UP-002', 'UP-003', 'UP-004'].forEach(b => pushConLimite(storico, b, 3));
console.log(storico); // => ['UP-002', 'UP-003', 'UP-004']

// ------------------------------------------------------------
// ESEMPIO PRATICO 6: insiemi con indexOf (deduplica manuale).
// Aggiungo una taglia DPI solo se non e' gia presente.
// ------------------------------------------------------------
const taglie = [];
['M', 'L', 'M', 'XL', 'L'].forEach(t => {
  if (taglie.indexOf(t) === -1) taglie.push(t);
});
console.log(taglie); // => ['M', 'L', 'XL']
// Versione moderna equivalente: [...new Set(...)]
console.log([...new Set(['M', 'L', 'M', 'XL', 'L'])]); // => ['M', 'L', 'XL']

// ------------------------------------------------------------
// NOTA IMPORTANTE: mutating vs non-mutating
// MUTATING  (cambiano l'originale): push, pop, shift, unshift, splice, reverse
// NON-MUTATING (ritornano nuovo):   slice, concat, join, indexOf, includes
// Regola pratica: in contesti dove conta l'immutabilita (es. state React)
// preferisci slice/concat/spread invece di splice/push.
// ------------------------------------------------------------
const statoOriginale = ['a', 'b', 'c'];
const nuovoStato = [...statoOriginale, 'd']; // immutabile
console.log(statoOriginale); // => ['a', 'b', 'c']
console.log(nuovoStato);     // => ['a', 'b', 'c', 'd']

/* ============================================================
   RIEPILOGO COMANDI
   - push(...items)        aggiunge in coda, MUTATING, ritorna length
   - pop()                 toglie l'ultimo, MUTATING, ritorna elemento
   - shift()               toglie il primo, MUTATING, ritorna elemento
   - unshift(...items)     aggiunge in testa, MUTATING, ritorna length
   - slice(start, end?)    estrae porzione, NON-MUTATING, copia shallow
   - splice(start, n, ...) rimuove/inserisce, MUTATING, ritorna rimossi
   - concat(...arr)        unisce array, NON-MUTATING
   - join(sep)             array -> stringa, NON-MUTATING
   - reverse()             inverte ordine, MUTATING
   - indexOf(x, from?)     prima posizione o -1, NON-MUTATING
   - lastIndexOf(x)        ultima posizione o -1
   - includes(x)           true/false (alternativa a indexOf !== -1)
   - findIndex(fn)         indice per predicato (utile con oggetti)
   - [...arr] / Set        spread e deduplica moderni
   ============================================================ */
