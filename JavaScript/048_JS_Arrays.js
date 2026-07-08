/* ============================================================
   48 JS Arrays
   Un array e' una struttura dati ordinata che contiene una lista
   di valori, accessibili tramite un indice numerico che parte da 0.
   In JavaScript gli array sono oggetti dinamici: possono crescere e
   ridursi, contenere tipi misti, essere annidati (multidimensionali)
   e persino avere "buchi" (sparse array). Qui vediamo creazione,
   accesso, length, mutazione, array multidimensionali e sparse.
   ============================================================ */

// ------------------------------------------------------------
// 1) CREAZIONE DI ARRAY
// ------------------------------------------------------------

// Modo idiomatico: array literal con parentesi quadre.
const frutta = ["mela", "pera", "kiwi"];
console.log(frutta); // => [ 'mela', 'pera', 'kiwi' ]

// Array vuoto, da riempire dopo.
const vuoto = [];
console.log(vuoto.length); // => 0

// Tipi misti: JS non impone un tipo unico per gli elementi.
const misto = [1, "due", true, null, { id: 9 }];
console.log(misto[3]); // => null

// Costruttore Array: ATTENZIONE, con un solo numero crea la length.
const conNumero = new Array(3);
console.log(conNumero.length); // => 3 (array sparse, 3 buchi)

// new Array con piu' argomenti li usa come elementi.
const conElementi = new Array(1, 2, 3);
console.log(conElementi); // => [ 1, 2, 3 ]

// Array.of: crea sempre dagli argomenti (risolve l'ambiguita').
console.log(Array.of(3)); // => [ 3 ]

// Array.from: crea da un iterable o array-like.
console.log(Array.from("ciao")); // => [ 'c', 'i', 'a', 'o' ]
console.log(Array.from({ length: 3 }, (_, i) => i * 10)); // => [ 0, 10, 20 ]

// fill + map per generare sequenze.
const zeri = new Array(4).fill(0);
console.log(zeri); // => [ 0, 0, 0, 0 ]

// ------------------------------------------------------------
// 2) ACCESSO AGLI ELEMENTI
// ------------------------------------------------------------

const colori = ["rosso", "verde", "blu"];

// Accesso per indice (parte da 0).
console.log(colori[0]); // => rosso
console.log(colori[2]); // => blu

// Indice inesistente => undefined (nessun errore).
console.log(colori[99]); // => undefined

// Ultimo elemento: classico length - 1.
console.log(colori[colori.length - 1]); // => blu

// at(): supporta indici negativi (ES2022).
console.log(colori.at(-1)); // => blu
console.log(colori.at(-2)); // => verde

// ------------------------------------------------------------
// 3) LENGTH: leggere e MUTARE
// ------------------------------------------------------------

const numeri = [10, 20, 30, 40];
console.log(numeri.length); // => 4

// length e' scrivibile: troncare un array.
numeri.length = 2;
console.log(numeri); // => [ 10, 20 ]

// Aumentare length crea buchi (sparse).
numeri.length = 4;
console.log(numeri); // => [ 10, 20, <2 empty items> ]

// Svuotare un array azzerando length.
const daSvuotare = [1, 2, 3];
daSvuotare.length = 0;
console.log(daSvuotare); // => []

// ------------------------------------------------------------
// 4) MUTAZIONE: aggiungere e rimuovere
// ------------------------------------------------------------

const coda = ["a"];

// push: aggiunge in fondo, ritorna la nuova length.
console.log(coda.push("b", "c")); // => 3
console.log(coda); // => [ 'a', 'b', 'c' ]

// pop: rimuove e ritorna l'ultimo.
console.log(coda.pop()); // => c

// unshift: aggiunge in testa, ritorna la nuova length.
console.log(coda.unshift("z")); // => 3
console.log(coda); // => [ 'z', 'a', 'b' ]

// shift: rimuove e ritorna il primo.
console.log(coda.shift()); // => z

// splice(start, deleteCount, ...items): rimuove/inserisce in mezzo.
const lettere = ["a", "b", "c", "d"];
const rimossi = lettere.splice(1, 2, "X", "Y", "Z");
console.log(rimossi); // => [ 'b', 'c' ]
console.log(lettere); // => [ 'a', 'X', 'Y', 'Z', 'd' ]

// Assegnazione diretta a un indice oltre length crea buchi.
const cresci = [1];
cresci[3] = 4;
console.log(cresci); // => [ 1, <2 empty items>, 4 ]
console.log(cresci.length); // => 4

// ------------------------------------------------------------
// 5) COPIA E NON-MUTAZIONE (metodi che NON modificano l'originale)
// ------------------------------------------------------------

const base = [1, 2, 3];

// slice(start, end): estrae una porzione senza mutare.
console.log(base.slice(1)); // => [ 2, 3 ]
console.log(base); // => [ 1, 2, 3 ] (intatto)

// concat: unisce array creandone uno nuovo.
console.log([1, 2].concat([3, 4])); // => [ 1, 2, 3, 4 ]

// spread operator: copia superficiale (shallow copy).
const copia = [...base];
copia.push(99);
console.log(base); // => [ 1, 2, 3 ]
console.log(copia); // => [ 1, 2, 3, 99 ]

// toReversed / toSorted (ES2023): versioni immutabili.
const ord = [3, 1, 2];
console.log(ord.toSorted()); // => [ 1, 2, 3 ]
console.log(ord); // => [ 3, 1, 2 ] (non mutato)

// ------------------------------------------------------------
// 6) ITERAZIONE E HIGHER-ORDER FUNCTIONS
// ------------------------------------------------------------

const valori = [1, 2, 3, 4, 5];

// forEach: esegue una callback per ogni elemento (no return utile).
valori.forEach((v) => console.log(v)); // => 1 2 3 4 5 (su righe)

// map: trasforma ogni elemento in un nuovo array.
console.log(valori.map((v) => v * 2)); // => [ 2, 4, 6, 8, 10 ]

// filter: tiene solo gli elementi che passano il test.
console.log(valori.filter((v) => v % 2 === 0)); // => [ 2, 4 ]

// reduce: riduce l'array a un singolo valore (accumulator).
console.log(valori.reduce((acc, v) => acc + v, 0)); // => 15

// find / findIndex: primo elemento (o indice) che soddisfa il test.
console.log(valori.find((v) => v > 3)); // => 4
console.log(valori.findIndex((v) => v > 3)); // => 3

// some / every: test booleani sull'intero array.
console.log(valori.some((v) => v > 4)); // => true
console.log(valori.every((v) => v > 0)); // => true

// includes / indexOf: ricerca di un valore.
console.log(valori.includes(3)); // => true
console.log(valori.indexOf(3)); // => 2

// join: array -> stringa.
console.log(valori.join("-")); // => 1-2-3-4-5

// flat / flatMap: appiattiscono array annidati.
console.log([1, [2, [3]]].flat(2)); // => [ 1, 2, 3 ]
console.log([1, 2].flatMap((v) => [v, v * 10])); // => [ 1, 10, 2, 20 ]

// ------------------------------------------------------------
// 7) ARRAY MULTIDIMENSIONALI
// ------------------------------------------------------------

// Matrice 2D: array di array.
const matrice = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// Accesso: prima riga, poi colonna.
console.log(matrice[1][2]); // => 6

// Scansione con doppio ciclo.
for (const riga of matrice) {
  for (const cella of riga) {
    // process.stdout.write(cella + " "); // 1 2 3 4 5 6 7 8 9
  }
}

// Trasposta con map (avanzato).
const trasposta = matrice[0].map((_, col) => matrice.map((riga) => riga[col]));
console.log(trasposta[0]); // => [ 1, 4, 7 ]

// ------------------------------------------------------------
// 8) SPARSE ARRAY (array con buchi)
// ------------------------------------------------------------

// Un sparse array ha indici mancanti (empty items, diversi da undefined).
const sparse = [1, , 3]; // indice 1 e' un buco
console.log(sparse.length); // => 3
console.log(sparse[1]); // => undefined

// I metodi di iterazione SALTANO i buchi.
let conteggio = 0;
sparse.forEach(() => conteggio++);
console.log(conteggio); // => 2 (il buco e' saltato)

// Differenza tra "empty" e undefined esplicito:
const conUndef = [1, undefined, 3];
console.log(1 in sparse); // => false (buco)
console.log(1 in conUndef); // => true (chiave presente)

// Riempire i buchi: Array.from o fill normalizzano.
console.log(Array.from(sparse)); // => [ 1, undefined, 3 ]

// ------------------------------------------------------------
// 9) DESTRUCTURING E SPREAD CON ARRAY
// ------------------------------------------------------------

const [primo, secondo, ...resto] = [10, 20, 30, 40];
console.log(primo); // => 10
console.log(resto); // => [ 30, 40 ]

// Swap senza variabile temporanea.
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // => 2 1

// Default nel destructuring.
const [a = 0, b = 99] = [5];
console.log(a, b); // => 5 99

// ------------------------------------------------------------
// 10) ESEMPI ISPIRATI A UN GESTIONALE ERP
// ------------------------------------------------------------

// Dominio: dipendenti con badge tipo 'UP-001', reparto e ore lavorate.
const dipendenti = [
  { id: 1, nome: "Anna", badge: "UP-001", reparto: "PR", oreLavorate: 8 },
  { id: 2, nome: "Luca", badge: "UP-002", reparto: "MG", oreLavorate: 6 },
  { id: 3, nome: "Sara", badge: "UP-003", reparto: "PR", oreLavorate: 7.5 },
];

// map: trasformare le righe query in DTO leggeri.
const dto = dipendenti.map((d) => ({ badge: d.badge, nome: d.nome }));
console.log(dto[0]); // => { badge: 'UP-001', nome: 'Anna' }

// filter + reduce: totale ore di un reparto (pattern reale ERP).
const orePR = dipendenti
  .filter((d) => d.reparto === "PR")
  .reduce((tot, d) => tot + d.oreLavorate, 0);
console.log(orePR); // => 15.5

// find: cercare un dipendente per badge.
const trovato = dipendenti.find((d) => d.badge === "UP-002");
console.log(trovato.nome); // => Luca

// some / every: validazioni sui turni.
console.log(dipendenti.some((d) => d.oreLavorate > 8)); // => false
console.log(dipendenti.every((d) => d.oreLavorate >= 6)); // => true

// Timbrature: minuti totali con filter().reduce() (naive-UTC tipico ERP).
const timbrature = [
  { tipo: "lavoro", minuti: 240 },
  { tipo: "pausa", minuti: 30 },
  { tipo: "lavoro", minuti: 210 },
];
const minutiLavoro = timbrature
  .filter((t) => t.tipo === "lavoro")
  .reduce((s, t) => s + t.minuti, 0);
console.log(minutiLavoro); // => 450

// Vestiario/DPI: controllo scorta minima con map + filter.
const dpi = [
  { articolo: "Guanti", quantita: 5, scortaMinima: 10 },
  { articolo: "Occhiali", quantita: 20, scortaMinima: 8 },
];
const sottoScorta = dpi.filter((v) => v.quantita < v.scortaMinima).map((v) => v.articolo);
console.log(sottoScorta); // => [ 'Guanti' ]

// Raggruppamento per reparto con reduce (struttura a oggetto di array).
const perReparto = dipendenti.reduce((acc, d) => {
  (acc[d.reparto] ??= []).push(d.nome);
  return acc;
}, {});
console.log(perReparto); // => { PR: [ 'Anna', 'Sara' ], MG: [ 'Luca' ] }

// Ordinamento immutabile per ore (toSorted, ES2023).
const perOre = dipendenti.toSorted((a, b) => b.oreLavorate - a.oreLavorate);
console.log(perOre.map((d) => d.nome)); // => [ 'Anna', 'Sara', 'Luca' ]

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   Creazione:   [], new Array(), Array.of(), Array.from(), fill()
   Accesso:     arr[i], arr.at(i), arr.length
   Aggiungi:    push(), unshift(), splice()
   Rimuovi:     pop(), shift(), splice(), length = n
   Non-mutanti: slice(), concat(), [...spread], toSorted(), toReversed()
   Iterazione:  forEach(), map(), filter(), reduce(), find(), findIndex()
   Test:        some(), every(), includes(), indexOf()
   Stringa:     join()
   Annidati:    flat(), flatMap(), matrice[r][c]
   Sparse:      [1,,3], 'i' in arr, empty vs undefined
   Destructur.: [a, b, ...resto], [x,y]=[y,x], default
   ============================================================ */
