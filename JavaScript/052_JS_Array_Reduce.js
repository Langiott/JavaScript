/* ============================================================
   52 JS Array Reduce
   Il metodo reduce() "riduce" un array a un singolo valore (numero,
   stringa, oggetto o nuovo array) applicando una callback ad ogni
   elemento e accumulando il risultato in un accumulator.
   E' lo strumento piu' potente e generico tra gli array methods:
   con reduce() puoi reimplementare map, filter, sum, groupBy,
   conteggi, max/min e costruire accumulatori complessi (oggetti).
   In questo file: dalla somma base fino a groupBy avanzati ispirati
   a un gestionale ERP (timbrature, dipendenti, reparti, vestiario).
   ============================================================ */

/* ------------------------------------------------------------
   1) SINTASSI BASE
   array.reduce((accumulator, currentValue, index, array) => {...}, initialValue)
   - accumulator: il valore accumulato finora
   - currentValue: l'elemento corrente
   - initialValue: valore di partenza dell'accumulator (FORTEMENTE consigliato)
   ------------------------------------------------------------ */

// Somma semplice di numeri con initialValue 0
const numeri = [10, 20, 30, 40];
const somma = numeri.reduce((acc, n) => acc + n, 0);
console.log(somma); // => 100

// Prodotto di tutti gli elementi (initialValue 1)
const prodotto = numeri.reduce((acc, n) => acc * n, 1);
console.log(prodotto); // => 240000

/* ------------------------------------------------------------
   2) SENZA initialValue
   Se ometti l'initialValue, il primo elemento diventa l'accumulator
   iniziale e l'iterazione parte dal secondo. ATTENZIONE: su array
   vuoto senza initialValue viene lanciato un TypeError.
   ------------------------------------------------------------ */
const sommaSenzaInit = numeri.reduce((acc, n) => acc + n);
console.log(sommaSenzaInit); // => 100

// Buona pratica: passa SEMPRE initialValue per evitare errori su array vuoti
const vuoto = [];
console.log(vuoto.reduce((acc, n) => acc + n, 0)); // => 0
// vuoto.reduce((acc, n) => acc + n); // => TypeError: Reduce of empty array with no initial value

/* ------------------------------------------------------------
   3) USARE index E array (i parametri extra della callback)
   ------------------------------------------------------------ */
const media = numeri.reduce((acc, n, i, arr) => {
  acc += n;
  if (i === arr.length - 1) return acc / arr.length; // all'ultimo giro calcola la media
  return acc;
}, 0);
console.log(media); // => 25

/* ------------------------------------------------------------
   4) MAX e MIN con reduce
   ------------------------------------------------------------ */
const valori = [42, 7, 99, 13, 64];
const massimo = valori.reduce((max, n) => (n > max ? n : max), valori[0]);
const minimo = valori.reduce((min, n) => (n < min ? n : min), valori[0]);
console.log(massimo, minimo); // => 99 7

// Max su oggetti: trovare il dipendente con piu' ore lavorate
const oreDip = [
  { nome: 'Anna', ore: 7.5 },
  { nome: 'Luca', ore: 8.2 },
  { nome: 'Sara', ore: 6.0 },
];
const topDip = oreDip.reduce((best, d) => (d.ore > best.ore ? d : best));
console.log(topDip.nome); // => Luca

/* ------------------------------------------------------------
   5) CONTEGGIO occorrenze (frequency map)
   Accumulator = oggetto. Pattern classico per contare elementi.
   ------------------------------------------------------------ */
const frutta = ['mela', 'pera', 'mela', 'kiwi', 'pera', 'mela'];
const conteggio = frutta.reduce((acc, f) => {
  acc[f] = (acc[f] || 0) + 1; // se non esiste parti da 0
  return acc;
}, {});
console.log(conteggio); // => { mela: 3, pera: 2, kiwi: 1 }

/* ------------------------------------------------------------
   6) GROUP BY (raggruppamento)
   Accumulator = oggetto con array come valori.
   ------------------------------------------------------------ */
const dipendenti = [
  { nome: 'Anna', reparto: 'PR' },
  { nome: 'Luca', reparto: 'MG' },
  { nome: 'Sara', reparto: 'PR' },
  { nome: 'Gino', reparto: 'MG' },
  { nome: 'Ivo', reparto: 'AM' },
];
const perReparto = dipendenti.reduce((acc, d) => {
  (acc[d.reparto] ||= []).push(d.nome); // logical OR assignment ES2021
  return acc;
}, {});
console.log(perReparto);
// => { PR: ['Anna','Sara'], MG: ['Luca','Gino'], AM: ['Ivo'] }

// groupBy generico come higher-order function riutilizzabile
const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

const perInizialeReparto = groupBy(dipendenti, (d) => d.reparto[0]);
console.log(Object.keys(perInizialeReparto)); // => ['P', 'M', 'A']

/* ------------------------------------------------------------
   7) reduce() per costruire un OGGETTO indicizzato (lookup map)
   Trasforma un array in una mappa id -> oggetto per accessi O(1).
   ------------------------------------------------------------ */
const reparti = [
  { id: 1, sigla: 'PR', nome: 'Produzione' },
  { id: 2, sigla: 'MG', nome: 'Magazzino' },
  { id: 3, sigla: 'AM', nome: 'Amministrazione' },
];
const repartoById = reparti.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});
console.log(repartoById[2].nome); // => Magazzino

/* ------------------------------------------------------------
   8) reduce() che reimplementa map e filter (per capirne il motore)
   ------------------------------------------------------------ */
const mapConReduce = (arr, fn) => arr.reduce((acc, x) => [...acc, fn(x)], []);
console.log(mapConReduce([1, 2, 3], (x) => x * 10)); // => [10, 20, 30]

const filterConReduce = (arr, pred) =>
  arr.reduce((acc, x) => (pred(x) ? [...acc, x] : acc), []);
console.log(filterConReduce([1, 2, 3, 4], (x) => x % 2 === 0)); // => [2, 4]

/* ------------------------------------------------------------
   9) FLATTEN di array annidati con reduce
   ------------------------------------------------------------ */
const annidato = [[1, 2], [3, 4], [5]];
const piatto = annidato.reduce((acc, sub) => acc.concat(sub), []);
console.log(piatto); // => [1, 2, 3, 4, 5]

/* ------------------------------------------------------------
   10) reduceRight: come reduce ma da destra verso sinistra
   ------------------------------------------------------------ */
const parole = ['ciao', 'come', 'stai'];
const inverso = parole.reduceRight((acc, p) => acc + ' ' + p, '').trim();
console.log(inverso); // => stai come ciao

/* ============================================================
   ESEMPI AVANZATI ISPIRATI AL GESTIONALE ERP
   ============================================================ */

/* ------------------------------------------------------------
   11) SOMMA MINUTI delle richieste approvate (pattern filter+reduce)
   Pattern reale: somma dei minuti solo delle richieste approvate.
   ------------------------------------------------------------ */
const richieste = [
  { tipo: 'permesso', minuti: 60, approvata: true },
  { tipo: 'permesso', minuti: 30, approvata: false },
  { tipo: 'ferie', minuti: 480, approvata: true },
  { tipo: 'permesso', minuti: 90, approvata: true },
];
const minutiApprovati = richieste
  .filter((r) => r.approvata)
  .reduce((tot, r) => tot + r.minuti, 0);
console.log(minutiApprovati); // => 630

/* ------------------------------------------------------------
   12) ORE LAVORATE totali per dipendente (accumulatore numerico per chiave)
   Le timbrature usano orari naive-UTC; qui lavoriamo gia' su oreLavorate.
   ------------------------------------------------------------ */
const timbrature = [
  { badge: 'UP-001', oreLavorate: 8.0 },
  { badge: 'UP-002', oreLavorate: 7.5 },
  { badge: 'UP-001', oreLavorate: 4.0 },
  { badge: 'UP-002', oreLavorate: 8.0 },
  { badge: 'UP-001', oreLavorate: 8.0 },
];
const oreTotaliPerBadge = timbrature.reduce((acc, t) => {
  acc[t.badge] = (acc[t.badge] || 0) + t.oreLavorate;
  return acc;
}, {});
console.log(oreTotaliPerBadge); // => { 'UP-001': 20, 'UP-002': 15.5 }

/* ------------------------------------------------------------
   13) groupBy turno + conteggio in un solo reduce (accumulatore oggetto)
   ------------------------------------------------------------ */
const presenze = [
  { badge: 'UP-001', turno: 'P4' },
  { badge: 'UP-002', turno: 'P2' },
  { badge: 'UP-003', turno: 'P4' },
  { badge: 'UP-004', turno: 'P4' },
  { badge: 'UP-005', turno: 'P2' },
];
const conteggioTurni = presenze.reduce((acc, p) => {
  acc[p.turno] = (acc[p.turno] || 0) + 1;
  return acc;
}, {});
console.log(conteggioTurni); // => { P4: 3, P2: 2 }

/* ------------------------------------------------------------
   14) ACCUMULATORE OGGETTO COMPLESSO: statistiche per reparto
   Per ogni reparto: numero dipendenti, ore totali, ore media.
   ------------------------------------------------------------ */
const registro = [
  { reparto: 'PR', badge: 'UP-001', ore: 8 },
  { reparto: 'PR', badge: 'UP-002', ore: 6 },
  { reparto: 'MG', badge: 'UP-003', ore: 7 },
  { reparto: 'PR', badge: 'UP-004', ore: 4 },
  { reparto: 'MG', badge: 'UP-005', ore: 8 },
];
const statsReparto = registro.reduce((acc, r) => {
  acc[r.reparto] ||= { conteggio: 0, oreTotali: 0, media: 0 };
  acc[r.reparto].conteggio += 1;
  acc[r.reparto].oreTotali += r.ore;
  acc[r.reparto].media =
    acc[r.reparto].oreTotali / acc[r.reparto].conteggio;
  return acc;
}, {});
console.log(statsReparto.PR); // => { conteggio: 3, oreTotali: 18, media: 6 }
console.log(statsReparto.MG); // => { conteggio: 2, oreTotali: 15, media: 7.5 }

/* ------------------------------------------------------------
   15) CONTROLLO SCORTA VESTIARIO/DPI: somma quantita e flag sotto scorta
   ------------------------------------------------------------ */
const vestiario = [
  { articolo: 'Tuta', taglia: 'M', quantita: 5, scortaMinima: 10 },
  { articolo: 'Tuta', taglia: 'L', quantita: 12, scortaMinima: 10 },
  { articolo: 'Guanti', taglia: 'U', quantita: 3, scortaMinima: 20 },
];
const riepilogoMagazzino = vestiario.reduce(
  (acc, v) => {
    acc.totalePezzi += v.quantita;
    if (v.quantita < v.scortaMinima) acc.sottoScorta.push(`${v.articolo} ${v.taglia}`);
    return acc;
  },
  { totalePezzi: 0, sottoScorta: [] }
);
console.log(riepilogoMagazzino);
// => { totalePezzi: 20, sottoScorta: ['Tuta M', 'Guanti U'] }

/* ------------------------------------------------------------
   16) PIPELINE di funzioni con reduce (compose / pipe)
   reduce applica in sequenza una lista di trasformazioni.
   ------------------------------------------------------------ */
const pipe = (...fns) => (input) => fns.reduce((val, fn) => fn(val), input);
const normalizzaBadge = pipe(
  (s) => String(s || '').trim(),
  (s) => s.toUpperCase(),
  (s) => s.replace(/\s+/g, ''),
  (s) => s.slice(0, 8)
);
console.log(normalizzaBadge('  up-001 ')); // => UP-001

/* ------------------------------------------------------------
   17) groupBy + map dei risultati in DTO (pattern map post-reduce)
   Da timbrature raggruppate a un array di DTO per la UI.
   ------------------------------------------------------------ */
const dto = Object.entries(oreTotaliPerBadge).map(([badge, ore]) => ({
  badge,
  ore,
  stato: ore >= 16 ? 'completo' : 'parziale',
}));
console.log(dto);
// => [ {badge:'UP-001',ore:20,stato:'completo'}, {badge:'UP-002',ore:15.5,stato:'parziale'} ]

/* ------------------------------------------------------------
   18) reduce ASINCRONO in serie (catena di Promise)
   Esegue operazioni async una dopo l'altra mantenendo l'ordine.
   ------------------------------------------------------------ */
const salvaTimbratura = async (t) => {
  // simulazione await di una scrittura DB
  return new Promise((res) => setTimeout(() => res(t.badge), 10));
};
async function salvaInSerie(lista) {
  return lista.reduce(async (accPromise, t) => {
    const acc = await accPromise; // aspetta il giro precedente
    const id = await salvaTimbratura(t);
    return [...acc, id];
  }, Promise.resolve([]));
}
salvaInSerie([{ badge: 'UP-001' }, { badge: 'UP-002' }]).then((ids) =>
  console.log(ids) // => ['UP-001', 'UP-002']
);

/* ------------------------------------------------------------
   19) Object.groupBy (ES2024): alternativa nativa al groupBy con reduce
   Disponibile su Node recenti. Restituisce un oggetto raggruppato.
   ------------------------------------------------------------ */
if (typeof Object.groupBy === 'function') {
  const nativo = Object.groupBy(dipendenti, (d) => d.reparto);
  console.log(Object.keys(nativo)); // => ['PR', 'MG', 'AM']
}

/* ------------------------------------------------------------
   20) ERRORI COMUNI da ricordare
   - Dimenticare initialValue -> errori su array vuoti o tipi sbagliati
   - Non restituire l'accumulator dalla callback -> acc diventa undefined
   - Mutare l'accumulator e' ok per performance, ma occhio agli effetti
   ------------------------------------------------------------ */
// SBAGLIATO: manca il return -> acc undefined al secondo giro
// [1,2,3].reduce((acc, n) => { acc + n; }, 0); // => undefined

/* ============================================================
   RIEPILOGO COMANDI
   - array.reduce((acc, cur, i, arr) => ..., initialValue)
   - array.reduceRight(...)            // riduce da destra
   - acc += n / acc * n                // somma / prodotto
   - acc[key] = (acc[key] || 0) + 1    // conteggio (frequency map)
   - (acc[key] ||= []).push(item)      // groupBy (ES2021 ||=)
   - reduce(... , {})                  // accumulatore oggetto
   - reduce(... , [])                  // accumulatore array (map/filter/flatten)
   - filter(...).reduce(...)           // somma condizionata
   - reduce(async (accP, x) => ..., Promise.resolve(init)) // serie async
   - Object.entries(obj).map(...)      // da oggetto raggruppato a DTO
   - Object.groupBy(arr, keyFn)        // groupBy nativo ES2024
   ============================================================ */
