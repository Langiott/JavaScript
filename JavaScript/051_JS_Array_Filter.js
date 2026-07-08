/* ============================================================
   51 JS Array Filter
   Il metodo filter() crea un NUOVO array contenente solo gli
   elementi che superano un test definito da una funzione di
   callback (il predicato). Non modifica l'array originale ed e'
   uno dei metodi piu' usati per selezionare dati: rimuovere
   valori falsy, combinare filter+map, validare collezioni e
   costruire query lato client in un gestionale ERP.
   ============================================================ */


/* ------------------------------------------------------------
   1) BASE: cos'e' filter()
   filter() riceve un callback (predicate) che ritorna true/false.
   Se il callback ritorna un valore truthy, l'elemento viene tenuto.
   ------------------------------------------------------------ */

// Tieni solo i numeri pari
const numeri = [1, 2, 3, 4, 5, 6];
const pari = numeri.filter((n) => n % 2 === 0);
console.log(pari); // => [ 2, 4, 6 ]

// L'array originale NON viene modificato
console.log(numeri); // => [ 1, 2, 3, 4, 5, 6 ]

// Tieni i numeri maggiori di 3
const grandi = numeri.filter((n) => n > 3);
console.log(grandi); // => [ 4, 5, 6 ]


/* ------------------------------------------------------------
   2) FIRMA COMPLETA DEL CALLBACK
   filter((element, index, array) => boolean)
   ------------------------------------------------------------ */

// Tieni gli elementi nelle posizioni pari (index 0, 2, 4...)
const lettere = ["a", "b", "c", "d", "e"];
const posizioniPari = lettere.filter((el, index) => index % 2 === 0);
console.log(posizioniPari); // => [ 'a', 'c', 'e' ]

// Usare il terzo parametro (array) per confronti relativi
const valori = [10, 20, 30, 40];
const sopraMedia = valori.filter((v, i, arr) => {
  const media = arr.reduce((s, x) => s + x, 0) / arr.length;
  return v > media;
});
console.log(sopraMedia); // => [ 30, 40 ]


/* ------------------------------------------------------------
   3) IL PREDICATO: deve ritornare un boolean (o truthy/falsy)
   Conviene estrarre il predicato in una funzione nominata
   per riusarlo e renderlo leggibile.
   ------------------------------------------------------------ */

const isPositivo = (n) => n > 0;
console.log([-2, -1, 0, 1, 2].filter(isPositivo)); // => [ 1, 2 ]

// Predicato che ritorna truthy non-boolean: funziona comunque
const conLunghezza = ["", "ciao", "", "mondo"].filter((s) => s.length);
console.log(conLunghezza); // => [ 'ciao', 'mondo' ]


/* ------------------------------------------------------------
   4) RIMUOVERE VALORI FALSY
   I falsy in JS: false, 0, '', null, undefined, NaN.
   Boolean come callback e' il trucco classico.
   ------------------------------------------------------------ */

const sporco = [0, 1, "", "testo", null, undefined, NaN, false, "ok"];
const pulito = sporco.filter(Boolean);
console.log(pulito); // => [ 1, 'testo', 'ok' ]

// Rimuovere solo null e undefined (mantenendo 0 e '')
const dati = [0, null, "", undefined, 5];
const definiti = dati.filter((x) => x != null); // != usa coercion: copre null e undefined
console.log(definiti); // => [ 0, '', 5 ]

// Rimuovere stringhe vuote dopo trim
const note = ["  ", "valida", "", "  altra ", "\t"];
const noteValide = note.filter((s) => s.trim() !== "");
console.log(noteValide); // => [ 'valida', '  altra ' ]


/* ------------------------------------------------------------
   5) FILTER SU ARRAY DI OGGETTI
   Il caso piu' frequente nel mondo reale.
   ------------------------------------------------------------ */

const prodotti = [
  { nome: "Vite", prezzo: 0.1, disponibile: true },
  { nome: "Bullone", prezzo: 0.2, disponibile: false },
  { nome: "Dado", prezzo: 0.15, disponibile: true },
];

// Solo prodotti disponibili
const inStock = prodotti.filter((p) => p.disponibile);
console.log(inStock.map((p) => p.nome)); // => [ 'Vite', 'Dado' ]

// Prodotti economici e disponibili (predicato composto)
const economici = prodotti.filter((p) => p.disponibile && p.prezzo < 0.15);
console.log(economici.map((p) => p.nome)); // => [ 'Vite' ]


/* ------------------------------------------------------------
   6) FILTER + MAP: pattern fondamentale
   Prima seleziona (filter), poi trasforma (map).
   ------------------------------------------------------------ */

const articoli = [
  { cdAr: "A1", descrizione: "Pannello", attivo: true },
  { cdAr: "A2", descrizione: "Profilo", attivo: false },
  { cdAr: "A3", descrizione: "Guarnizione", attivo: true },
];

// DTO solo per gli articoli attivi
const dto = articoli
  .filter((a) => a.attivo)
  .map((a) => ({ codice: a.cdAr, label: a.descrizione }));
console.log(dto);
// => [ { codice: 'A1', label: 'Pannello' }, { codice: 'A3', label: 'Guarnizione' } ]

// In alternativa flatMap fa filter+map in un colpo solo:
// ritorna [] per scartare, [valore] per tenere
const soloAttiviCodici = articoli.flatMap((a) => (a.attivo ? [a.cdAr] : []));
console.log(soloAttiviCodici); // => [ 'A1', 'A3' ]


/* ------------------------------------------------------------
   7) FILTER + REDUCE: selezionare e poi aggregare
   Pattern tipico: filtra le righe valide e somma un campo.
   ------------------------------------------------------------ */

const richieste = [
  { ore: 8, approvata: true },
  { ore: 4, approvata: false },
  { ore: 6, approvata: true },
];
const oreApprovate = richieste
  .filter((r) => r.approvata)
  .reduce((somma, r) => somma + r.ore, 0);
console.log(oreApprovate); // => 14


/* ------------------------------------------------------------
   8) RIMUOVERE DUPLICATI con filter + indexOf
   Tieni l'elemento solo alla sua prima occorrenza.
   (Per casi semplici [...new Set(arr)] e' piu' diretto.)
   ------------------------------------------------------------ */

const conDoppi = ["UP", "PR", "UP", "MG", "PR"];
const unici = conDoppi.filter((v, i, arr) => arr.indexOf(v) === i);
console.log(unici); // => [ 'UP', 'PR', 'MG' ]


/* ------------------------------------------------------------
   9) DIFFERENZA TRA ARRAY (esclusione)
   Tieni solo gli elementi che NON sono in un altro array.
   ------------------------------------------------------------ */

const tutti = ["UP-001", "UP-002", "UP-003", "UP-004"];
const giaAssegnati = ["UP-002", "UP-004"];
const liberi = tutti.filter((badge) => !giaAssegnati.includes(badge));
console.log(liberi); // => [ 'UP-001', 'UP-003' ]


/* ------------------------------------------------------------
   10) FILTER vs find vs some/every
   - filter: ritorna TUTTI gli elementi che passano (array)
   - find:   ritorna il PRIMO elemento che passa (o undefined)
   - some:   true se ALMENO UNO passa
   - every:  true se TUTTI passano
   ------------------------------------------------------------ */

const eta = [17, 22, 30, 16];
console.log(eta.filter((e) => e >= 18)); // => [ 22, 30 ]
console.log(eta.find((e) => e >= 18)); // => 22
console.log(eta.some((e) => e < 18)); // => true
console.log(eta.every((e) => e >= 18)); // => false


/* ------------------------------------------------------------
   11) PREDICATI RIUSABILI E HIGHER-ORDER FUNCTION
   Una funzione che RITORNA un predicato (closure sui parametri).
   ------------------------------------------------------------ */

// Genera un predicato "campo === valore"
const dove = (campo, valore) => (oggetto) => oggetto[campo] === valore;

const dipendenti = [
  { nome: "Anna", reparto: "UP" },
  { nome: "Bruno", reparto: "PR" },
  { nome: "Carla", reparto: "UP" },
];
console.log(dipendenti.filter(dove("reparto", "UP")).map((d) => d.nome));
// => [ 'Anna', 'Carla' ]

// Combinare piu' predicati con AND logico
const e = (...predicati) => (x) => predicati.every((p) => p(x));
const maggiorenne = (p) => p.eta >= 18;
const haBadge = (p) => Boolean(p.badge);
const persone = [
  { nome: "Dino", eta: 20, badge: "UP-010" },
  { nome: "Elsa", eta: 17, badge: "UP-011" },
  { nome: "Fede", eta: 25, badge: null },
];
console.log(persone.filter(e(maggiorenne, haBadge)).map((p) => p.nome));
// => [ 'Dino' ]


/* ------------------------------------------------------------
   12) ESEMPIO ERP: filtrare timbrature
   Orari salvati come naive-UTC (HH:MM derivati dall'ora di Roma).
   ------------------------------------------------------------ */

const timbrature = [
  { badge: "UP-001", oreLavorate: 7.5, reparto: "UP" },
  { badge: "PR-002", oreLavorate: 0, reparto: "PR" },
  { badge: "UP-003", oreLavorate: 8.0, reparto: "UP" },
  { badge: "MG-004", oreLavorate: 4.0, reparto: "MG" },
];

// Solo chi ha effettivamente lavorato (oreLavorate > 0)
const presenti = timbrature.filter((t) => t.oreLavorate > 0);
console.log(presenti.length); // => 3

// Filtro multi-criterio: reparto UP con almeno 7 ore
const upFullTime = timbrature.filter(
  (t) => t.reparto === "UP" && t.oreLavorate >= 7
);
console.log(upFullTime.map((t) => t.badge)); // => [ 'UP-001', 'UP-003' ]

// Totale ore del solo reparto UP (filter + reduce)
const oreUP = timbrature
  .filter((t) => t.reparto === "UP")
  .reduce((s, t) => s + t.oreLavorate, 0);
console.log(oreUP); // => 15.5


/* ------------------------------------------------------------
   13) ESEMPIO ERP: ricerca testuale tipo "barra di ricerca"
   Normalizzazione + includes(), case-insensitive.
   ------------------------------------------------------------ */

const anagrafica = [
  { nome: "Mario", cognome: "Rossi", badge: "UP-001" },
  { nome: "Luca", cognome: "Bianchi", badge: "PR-002" },
  { nome: "Marina", cognome: "Verdi", badge: "MG-003" },
];

function cerca(lista, query) {
  const q = String(query || "").trim().toLowerCase();
  if (q === "") return lista;
  return lista.filter((d) =>
    `${d.nome} ${d.cognome} ${d.badge}`.toLowerCase().includes(q)
  );
}
console.log(cerca(anagrafica, "mar").map((d) => d.badge));
// => [ 'UP-001', 'MG-003' ]


/* ------------------------------------------------------------
   14) ESEMPIO ERP: filtro dinamico con piu' filtri opzionali
   Costruisce la catena di predicati solo per i filtri valorizzati.
   ------------------------------------------------------------ */

const scorte = [
  { dpi: "Guanti", taglia: "M", quantita: 12, scortaMinima: 10 },
  { dpi: "Occhiali", taglia: "U", quantita: 3, scortaMinima: 5 },
  { dpi: "Scarpe", taglia: "42", quantita: 8, scortaMinima: 4 },
];

function applicaFiltri(items, { taglia, sottoScorta } = {}) {
  let risultato = items;
  if (taglia) risultato = risultato.filter((i) => i.taglia === taglia);
  if (sottoScorta)
    risultato = risultato.filter((i) => i.quantita < i.scortaMinima);
  return risultato;
}
console.log(applicaFiltri(scorte, { sottoScorta: true }).map((i) => i.dpi));
// => [ 'Occhiali' ]
console.log(applicaFiltri(scorte, { taglia: "M" }).map((i) => i.dpi));
// => [ 'Guanti' ]


/* ------------------------------------------------------------
   15) ATTENZIONE: trappole comuni
   ------------------------------------------------------------ */

// (a) Dimenticare il return in callback a graffe -> array vuoto
const sbagliato = [1, 2, 3].filter((n) => {
  n > 1; // manca return!
});
console.log(sbagliato); // => []  (undefined e' falsy)
const corretto = [1, 2, 3].filter((n) => {
  return n > 1;
});
console.log(corretto); // => [ 2, 3 ]

// (b) filter NON salta i "buchi" allo stesso modo di una mappa densa;
//     su array sparsi gli elementi mancanti non vengono passati al callback.
const sparso = [1, , 3]; // indice 1 e' un buco
console.log(sparso.filter(() => true)); // => [ 1, 3 ]

// (c) filter ritorna sempre un nuovo array, anche se vuoto: ottimo per
//     evitare null-check, ma occhio a chiamare metodi sul risultato.
console.log([1, 2].filter((n) => n > 99)); // => []


/* ------------------------------------------------------------
   16) FILTER su risultati gia' trasformati / con Set per performance
   Per grandi array, indexOf/includes sono O(n): usa un Set O(1).
   ------------------------------------------------------------ */

const daEscludere = new Set(["PR-002", "MG-003"]);
const rimasti = anagrafica.filter((d) => !daEscludere.has(d.badge));
console.log(rimasti.map((d) => d.badge)); // => [ 'UP-001' ]


/* ============================================================
   RIEPILOGO COMANDI
   - array.filter((el, index, array) => boolean) -> nuovo array
   - filter(Boolean)            : rimuove tutti i falsy
   - filter(x => x != null)     : rimuove solo null/undefined
   - filter(...).map(...)       : seleziona poi trasforma
   - filter(...).reduce(...)    : seleziona poi aggrega
   - flatMap(x => cond ? [x] : []) : filter+map combinati
   - filter((v,i,a)=>a.indexOf(v)===i) : rimuove duplicati
   - filter(x => !altri.includes(x))   : differenza tra array
   - filter(x => set.has(x))    : lookup veloce con Set
   - find / some / every        : alternative a filter per uso singolo
   - higher-order predicate     : funzione che ritorna un predicato
   ============================================================ */
