/* ============================================================
   59 JS Sets
   Un Set è una collezione di valori UNICI: ogni valore può comparire
   una sola volta. A differenza dell'array non ha indici e non ammette
   duplicati. È perfetto per deduplicare dati, verificare appartenenza
   in modo veloce (has) e modellare insiemi matematici (union,
   intersection, difference). Mantiene l'ordine di inserimento e la
   sua dimensione si legge con la property "size".
   ============================================================ */

/* ---------- 1. Creare un Set ---------- */

// Set vuoto
const vuoto = new Set();
console.log(vuoto.size); // => 0

// Set da un array (i duplicati vengono rimossi automaticamente)
const numeri = new Set([1, 2, 2, 3, 3, 3]);
console.log(numeri); // => Set(3) { 1, 2, 3 }
console.log(numeri.size); // => 3

// Set da una stringa (itera carattere per carattere)
const lettere = new Set("mississippi");
console.log(lettere); // => Set(4) { 'm', 'i', 's', 'p' }


/* ---------- 2. add: aggiungere valori ---------- */

// add restituisce il Set stesso, quindi è "chainable"
const reparti = new Set();
reparti.add("Produzione");
reparti.add("Magazzino").add("Qualità").add("Produzione"); // duplicato ignorato
console.log(reparti); // => Set(3) { 'Produzione', 'Magazzino', 'Qualità' }

// L'unicità usa il confronto SameValueZero (simile a ===)
const misti = new Set();
misti.add(1).add("1"); // numero e stringa sono distinti
console.log(misti.size); // => 2

// NaN è considerato uguale a se stesso nei Set (a differenza di ===)
const conNaN = new Set();
conNaN.add(NaN).add(NaN);
console.log(conNaN.size); // => 1


/* ---------- 3. has: verificare appartenenza ---------- */

const badge = new Set(["UP-001", "UP-002", "UP-003"]);
console.log(badge.has("UP-002")); // => true
console.log(badge.has("UP-999")); // => false

// has è molto veloce (tempo costante) rispetto ad array.includes su grandi dati
const presenti = new Set(["UP-001", "UP-004"]);
const timbra = "UP-004";
console.log(presenti.has(timbra) ? "già in sede" : "assente"); // => già in sede


/* ---------- 4. delete e clear: rimuovere ---------- */

const dpi = new Set(["guanti", "occhiali", "casco"]);
console.log(dpi.delete("occhiali")); // => true  (rimosso)
console.log(dpi.delete("scarpe"));   // => false (non c'era)
console.log(dpi); // => Set(2) { 'guanti', 'casco' }

dpi.clear(); // svuota completamente
console.log(dpi.size); // => 0


/* ---------- 5. size: contare gli elementi ---------- */

// size è una property (NON un metodo: niente parentesi)
const turni = new Set(["P2", "P4", "P4", "P2"]);
console.log(turni.size); // => 2


/* ---------- 6. Iterare un Set ---------- */

const sigle = new Set(["PR", "MG", "QA"]);

// for...of mantiene l'ordine di inserimento
for (const s of sigle) {
  console.log(s); // => PR, MG, QA
}

// forEach (value e key coincidono nei Set)
sigle.forEach((valore) => console.log("sigla:", valore));

// keys(), values(), entries() restituiscono iteratori
console.log([...sigle.values()]); // => [ 'PR', 'MG', 'QA' ]
console.log([...sigle.entries()]); // => [ ['PR','PR'], ['MG','MG'], ['QA','QA'] ]


/* ---------- 7. Set <-> Array ---------- */

// Da Set ad array: spread oppure Array.from
const setNum = new Set([10, 20, 30]);
const arr1 = [...setNum];
const arr2 = Array.from(setNum);
console.log(arr1); // => [ 10, 20, 30 ]
console.log(arr2); // => [ 10, 20, 30 ]

// Array.from accetta una map function
const doppi = Array.from(setNum, (n) => n * 2);
console.log(doppi); // => [ 20, 40, 60 ]


/* ---------- 8. DEDUPLICAZIONE di array (uso più comune) ---------- */

// Pattern classico: new Set + spread
const conDuplicati = [1, 1, 2, 3, 3, 4];
const unici = [...new Set(conDuplicati)];
console.log(unici); // => [ 1, 2, 3, 4 ]

// Deduplicare codici badge letti da più sorgenti
const lettiMattina = ["UP-001", "UP-002", "UP-002"];
const lettiPomeriggio = ["UP-002", "UP-003"];
const tuttiBadge = [...new Set([...lettiMattina, ...lettiPomeriggio])];
console.log(tuttiBadge); // => [ 'UP-001', 'UP-002', 'UP-003' ]

// Deduplicare oggetti per chiave: Set di array di oggetti NON deduplica
// (gli oggetti sono confrontati per riferimento). Si usa una chiave univoca.
const dipendenti = [
  { id: 1, nome: "Anna" },
  { id: 2, nome: "Luca" },
  { id: 1, nome: "Anna" }, // record ripetuto
];
const idVisti = new Set();
const dipUnici = dipendenti.filter((d) => {
  if (idVisti.has(d.id)) return false;
  idVisti.add(d.id);
  return true;
});
console.log(dipUnici.length); // => 2


/* ---------- 9. UNION (unione): tutti gli elementi di entrambi ---------- */

const setA = new Set([1, 2, 3]);
const setB = new Set([3, 4, 5]);

// Modo classico (compatibile ovunque): spread dei due set
const union = new Set([...setA, ...setB]);
console.log([...union]); // => [ 1, 2, 3, 4, 5 ]

// Modo moderno ES2024: metodo nativo .union (ritorna un nuovo Set)
// console.log([...setA.union(setB)]); // => [ 1, 2, 3, 4, 5 ]


/* ---------- 10. INTERSECTION (intersezione): elementi in comune ---------- */

// Modo classico: filtra A tenendo ciò che è anche in B
const intersection = new Set([...setA].filter((x) => setB.has(x)));
console.log([...intersection]); // => [ 3 ]

// Modo moderno ES2024:
// console.log([...setA.intersection(setB)]); // => [ 3 ]


/* ---------- 11. DIFFERENCE (differenza): in A ma non in B ---------- */

// Modo classico
const difference = new Set([...setA].filter((x) => !setB.has(x)));
console.log([...difference]); // => [ 1, 2 ]

// Differenza simmetrica: in A o in B ma non in entrambi
const simmetrica = new Set(
  [...setA, ...setB].filter((x) => !(setA.has(x) && setB.has(x)))
);
console.log([...simmetrica]); // => [ 1, 2, 4, 5 ]

// Modo moderno ES2024:
// setA.difference(setB) -> { 1, 2 }
// setA.symmetricDifference(setB) -> { 1, 2, 4, 5 }


/* ---------- 12. Sottoinsieme / sovrainsieme ---------- */

// isSubset: ogni elemento di piccolo è dentro grande?
function isSubset(piccolo, grande) {
  return [...piccolo].every((x) => grande.has(x));
}
console.log(isSubset(new Set([1, 2]), setA)); // => true
console.log(isSubset(new Set([1, 9]), setA)); // => false

// disgiunti: nessun elemento in comune
function isDisjoint(s1, s2) {
  return [...s1].every((x) => !s2.has(x));
}
console.log(isDisjoint(new Set([7, 8]), setA)); // => true


/* ---------- 13. ESEMPI PRATICI dal gestionale ERP ---------- */

// 13a. DPI assegnati vs DPI obbligatori: cosa manca al dipendente?
const obbligatori = new Set(["guanti", "occhiali", "casco", "scarpe"]);
const assegnati = new Set(["guanti", "scarpe"]);
const mancanti = new Set([...obbligatori].filter((d) => !assegnati.has(d)));
console.log([...mancanti]); // => [ 'occhiali', 'casco' ]

// 13b. Reparti coperti oggi: deduplica le sigle dei dipendenti presenti
const presenze = [
  { badge: "UP-001", reparto: "PR" },
  { badge: "UP-002", reparto: "MG" },
  { badge: "UP-003", reparto: "PR" },
];
const repartiCoperti = new Set(presenze.map((p) => p.reparto));
console.log(repartiCoperti.size); // => 2  (PR, MG)

// 13c. Badge che hanno timbrato sia ingresso sia uscita (intersezione)
const ingressi = new Set(["UP-001", "UP-002", "UP-003"]);
const uscite = new Set(["UP-001", "UP-003"]);
const completi = new Set([...ingressi].filter((b) => uscite.has(b)));
console.log([...completi]); // => [ 'UP-001', 'UP-003' ]
// chi è entrato ma non ancora uscito (differenza)
const ancoraDentro = new Set([...ingressi].filter((b) => !uscite.has(b)));
console.log([...ancoraDentro]); // => [ 'UP-002' ]

// 13d. Turni distinti pianificati nella settimana
const pianificazione = ["P4", "P2", "P4", "P4", "P2", "Riposo"];
const turniDistinti = [...new Set(pianificazione)];
console.log(turniDistinti); // => [ 'P4', 'P2', 'Riposo' ]

// 13e. Validare che un codice taglia sia tra quelli ammessi (has come whitelist)
const taglieAmmesse = new Set(["S", "M", "L", "XL"]);
function tagliaValida(t) {
  return taglieAmmesse.has(String(t).trim().toUpperCase());
}
console.log(tagliaValida(" m ")); // => true
console.log(tagliaValida("XXS")); // => false


/* ---------- 14. WeakSet (cenni) ---------- */

// WeakSet contiene SOLO oggetti, tenuti con riferimento "debole"
// (non impediscono il garbage collection). Non è iterabile e non ha size.
const visti = new WeakSet();
const obj = { id: 1 };
visti.add(obj);
console.log(visti.has(obj)); // => true
// visti.add(42); // => TypeError: i primitivi non sono ammessi


/* ---------- 15. Mini-utility riusabili ---------- */

const dedup = (arr) => [...new Set(arr)];
const unione = (a, b) => new Set([...a, ...b]);
const intersez = (a, b) => new Set([...a].filter((x) => b.has(x)));
const differ = (a, b) => new Set([...a].filter((x) => !b.has(x)));

console.log(dedup([1, 1, 2])); // => [ 1, 2 ]
console.log([...unione(new Set([1]), new Set([2]))]); // => [ 1, 2 ]
console.log([...intersez(new Set([1, 2]), new Set([2, 3]))]); // => [ 2 ]
console.log([...differ(new Set([1, 2]), new Set([2]))]); // => [ 1 ]


/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   new Set([iterable])      -> crea un Set (deduplica l'iterable)
   .add(valore)             -> aggiunge (chainable), ignora i duplicati
   .delete(valore)          -> rimuove, ritorna true/false
   .has(valore)             -> appartenenza, true/false (veloce)
   .clear()                 -> svuota il Set
   .size                    -> numero di elementi (property, no ())
   .keys() .values()        -> iteratori sui valori
   .entries()               -> iteratore [valore, valore]
   .forEach((v) => ...)     -> itera nell'ordine di inserimento
   for...of                 -> itera i valori
   [...set]  Array.from(set)-> Set -> Array
   [...new Set(arr)]        -> DEDUPLICA un array

   INSIEMI (modo classico con spread/filter):
   union        -> new Set([...a, ...b])
   intersection -> new Set([...a].filter(x => b.has(x)))
   difference   -> new Set([...a].filter(x => !b.has(x)))
   subset       -> [...a].every(x => b.has(x))

   INSIEMI (ES2024 nativi): a.union(b) a.intersection(b)
     a.difference(b) a.symmetricDifference(b)
     a.isSubsetOf(b) a.isSupersetOf(b) a.isDisjointFrom(b)

   WeakSet: add/has/delete (solo oggetti, no size, no iterazione)
   ============================================================ */
