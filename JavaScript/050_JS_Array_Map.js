/* ============================================================
   50 JS Array Map
   Il metodo map() crea un NUOVO array applicando una callback a
   ogni elemento dell'array originale. E' la base della
   trasformazione (transformation) dei dati in JavaScript: non
   muta l'array sorgente, ma restituisce una versione "mappata".
   In questo file vediamo: trasformazioni semplici, uso dell'index,
   mappare array di oggetti in DTO, e il chaining (encadenare) con
   altri metodi come filter() e reduce().
   ============================================================ */

// ============================================================
// 1) BASE: che cos'e' map()
// ============================================================

// map() prende una callback e ritorna un nuovo array della stessa lunghezza
const numeri = [1, 2, 3, 4];
const doppi = numeri.map((n) => n * 2);
console.log(doppi); // => [2, 4, 6, 8]

// L'array originale NON viene mutato (map e' immutabile)
console.log(numeri); // => [1, 2, 3, 4]

// Sintassi estesa della callback (function dichiarata)
const quadrati = numeri.map(function (n) {
  return n * n;
});
console.log(quadrati); // => [1, 4, 9, 16]

// ============================================================
// 2) LA CALLBACK RICEVE 3 ARGOMENTI: value, index, array
// ============================================================

// Secondo argomento: index dell'elemento corrente
const lettere = ["a", "b", "c"];
const conIndex = lettere.map((lettera, i) => `${i}:${lettera}`);
console.log(conIndex); // => ['0:a', '1:b', '2:c']

// Terzo argomento: l'intero array (utile per confronti)
const percentuali = [10, 20, 70];
const totale = percentuali.reduce((s, n) => s + n, 0);
const normalizzate = percentuali.map((n, _i, arr) => n / arr.reduce((s, x) => s + x, 0));
console.log(normalizzate); // => [0.1, 0.2, 0.7]

// Numerare una lista a partire da 1
const turni = ["P2", "P4", "P2"];
const numerati = turni.map((t, i) => `${i + 1}) ${t}`);
console.log(numerati); // => ['1) P2', '2) P4', '3) P2']

// ============================================================
// 3) ATTENZIONE: ritornare SEMPRE un valore
// ============================================================

// Senza return la callback produce undefined per ogni elemento
const sbagliato = [1, 2, 3].map((n) => {
  n * 2; // manca il return!
});
console.log(sbagliato); // => [undefined, undefined, undefined]

// Con arrow implicito o return esplicito va bene
const corretto = [1, 2, 3].map((n) => {
  return n * 2;
});
console.log(corretto); // => [2, 4, 6]

// ============================================================
// 4) MAP SU STRINGHE E TIPI DIVERSI
// ============================================================

// Convertire numeri in stringhe formattate
const prezzi = [9, 19.5, 100];
const formattati = prezzi.map((p) => `${p.toFixed(2)} EUR`);
console.log(formattati); // => ['9.00 EUR', '19.50 EUR', '100.00 EUR']

// Normalizzare stringhe (pattern reale: codici badge)
const inputBadge = [" up-001 ", "Up-002", "uP 003"];
const badgePuliti = inputBadge.map((v) =>
  String(v || "").trim().toUpperCase().replace(/\s+/g, "")
);
console.log(badgePuliti); // => ['UP-001', 'UP-002', 'UP003']

// Estrarre il numero da un codice badge tipo 'UP-001'
const codici = ["UP-001", "UP-014", "UP-103"];
const progressivi = codici.map((c) => Number(c.match(/-(\d+)$/)?.[1] ?? 0));
console.log(progressivi); // => [1, 14, 103]

// ============================================================
// 5) MAPPARE OGGETTI -> nuovi oggetti (creare DTO)
// ============================================================

// Pattern ERP: trasformare le righe di una query in un DTO snello
const articoli = [
  { id: 1, articolo_poly: "ART-100", descrizione: "Tuta", scorta: 5, interno: true },
  { id: 2, articolo_poly: "ART-200", descrizione: "Guanti", scorta: 0, interno: false },
];

const dto = articoli.map((a) => ({
  cdAr: a.articolo_poly,
  descrizione: a.descrizione,
}));
console.log(dto);
// => [{ cdAr: 'ART-100', descrizione: 'Tuta' }, { cdAr: 'ART-200', descrizione: 'Guanti' }]

// NOTA: per ritornare un object literal con arrow serve la parentesi ()
// altrimenti le graffe sono interpretate come body di funzione.
const ko = [1, 2].map((n) => { valore: n }); // graffe = body, niente return
console.log(ko); // => [undefined, undefined]
const ok = [1, 2].map((n) => ({ valore: n }));
console.log(ok); // => [{ valore: 1 }, { valore: 2 }]

// Aggiungere/derivare campi calcolati
const dipendenti = [
  { nome: "Mario", cognome: "Rossi", reparto: { sigla: "PR" } },
  { nome: "Anna", cognome: "Bianchi", reparto: null },
];

const conLabel = dipendenti.map((d) => ({
  ...d,
  nomeCompleto: `${d.nome} ${d.cognome}`,
  sigla: d.reparto?.sigla ?? "XX", // optional chaining + nullish coalescing
}));
console.log(conLabel[0].nomeCompleto); // => 'Mario Rossi'
console.log(conLabel[1].sigla); // => 'XX'

// ============================================================
// 6) DESTRUCTURING dentro la callback
// ============================================================

// Estrarre direttamente i campi che servono nei parametri
const righe = [
  { id: 1, nome: "Mario", codiceBadge: "UP-001" },
  { id: 2, nome: "Anna", codiceBadge: "UP-002" },
];
const etichette = righe.map(({ nome, codiceBadge }) => `${codiceBadge} - ${nome}`);
console.log(etichette); // => ['UP-001 - Mario', 'UP-002 - Anna']

// map() su Object.entries() per trasformare un object in array
const scorte = { tuta: 5, guanti: 0, occhiali: 12 };
const listaScorte = Object.entries(scorte).map(([articolo, qta]) => ({
  articolo,
  qta,
  sottoScorta: qta < 3,
}));
console.log(listaScorte[1]); // => { articolo: 'guanti', qta: 0, sottoScorta: true }

// ============================================================
// 7) CHAINING: encadenare map con filter e reduce
// ============================================================

// Pattern ERP: filtrare le richieste approvate, mappare i minuti, sommare
const richieste = [
  { tipo: "ferie", minuti: 480, approvata: true },
  { tipo: "permesso", minuti: 120, approvata: false },
  { tipo: "ferie", minuti: 240, approvata: true },
];

const minutiApprovati = richieste
  .filter((r) => r.approvata) // tieni solo le approvate
  .map((r) => r.minuti) // estrai i minuti
  .reduce((s, m) => s + m, 0); // somma
console.log(minutiApprovati); // => 720

// map -> filter: trasforma poi scarta
const timbrature = [
  { badge: "UP-001", oreLavorate: 8 },
  { badge: "UP-002", oreLavorate: 0 },
  { badge: "UP-003", oreLavorate: 6.5 },
];
const presenti = timbrature
  .map((t) => ({ badge: t.badge, ore: t.oreLavorate }))
  .filter((t) => t.ore > 0)
  .map((t) => t.badge);
console.log(presenti); // => ['UP-001', 'UP-003']

// ============================================================
// 8) map con index per costruire chiavi/ID (es. liste React)
// ============================================================

// Esempio browser: gira nel browser, non in Node (qui solo come stringa)
function renderListaPseudoJSX(items) {
  // In React: items.map((x) => <li key={x.id}>{x.nome}</li>)
  return items.map((x) => `<li key="${x.id}">${x.nome}</li>`).join("");
}
console.log(renderListaPseudoJSX([{ id: 1, nome: "Mario" }]));
// => <li key="1">Mario</li>

// ============================================================
// 9) MAP ANNIDATI (array di array)
// ============================================================

// Trasformare una matrice mantenendo la struttura
const matrice = [
  [1, 2],
  [3, 4],
];
const matriceDoppia = matrice.map((riga) => riga.map((n) => n * 2));
console.log(matriceDoppia); // => [[2, 4], [6, 8]]

// map + flat per appiattire (oppure flatMap)
const repartiConDip = [
  { sigla: "PR", dip: ["Mario", "Anna"] },
  { sigla: "MG", dip: ["Luca"] },
];
const tuttiNomi = repartiConDip.map((r) => r.dip).flat();
console.log(tuttiNomi); // => ['Mario', 'Anna', 'Luca']

// flatMap = map seguito da flat di livello 1
const tuttiNomi2 = repartiConDip.flatMap((r) => r.dip);
console.log(tuttiNomi2); // => ['Mario', 'Anna', 'Luca']

// ============================================================
// 10) MAP con Date naive-UTC (pattern timbrature)
// ============================================================

// Formattare un elenco di istanti come orario di Roma HH:MM
function oraRomaHHMM(date) {
  const fmt = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return fmt.format(date);
}
const istanti = [new Date("2026-06-30T06:00:00Z"), new Date("2026-06-30T12:30:00Z")];
const orari = istanti.map(oraRomaHHMM);
console.log(orari); // => ['08:00', '14:30'] (Roma = UTC+2 in estate)

// Mappare minuti -> 'HH:MM' con padStart
const minutiTurni = [480, 90, 615];
const hhmm = minutiTurni.map((m) => {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const min = String(m % 60).padStart(2, "0");
  return `${h}:${min}`;
});
console.log(hhmm); // => ['08:00', '01:30', '10:15']

// ============================================================
// 11) MAP con Promise: trasformare in promise e Promise.all
// ============================================================

// map() che ritorna promise produce un array di promise -> Promise.all
async function caricaDettagli(ids) {
  const finto = (id) => Promise.resolve({ id, ok: true });
  const promesse = ids.map((id) => finto(id)); // array di Promise
  return Promise.all(promesse); // attende tutte
}
caricaDettagli([1, 2, 3]).then((res) => console.log(res));
// => [{ id: 1, ok: true }, { id: 2, ok: true }, { id: 3, ok: true }]

// ============================================================
// 12) DETTAGLI E TRABOCCHETTI
// ============================================================

// map salta i "buchi" (holes) in array sparsi ma mantiene la lunghezza
const sparso = [1, , 3];
console.log(sparso.map((n) => n * 10)); // => [10, <1 empty>, 30]

// parseInt come callback: il secondo argomento (index) diventa la radice!
console.log(["1", "2", "3"].map(parseInt)); // => [1, NaN, NaN]
// Soluzione: wrappare per ignorare l'index
console.log(["1", "2", "3"].map((s) => parseInt(s, 10))); // => [1, 2, 3]
// Oppure usare Number che ignora gli argomenti extra
console.log(["1", "2", "3"].map(Number)); // => [1, 2, 3]

// thisArg: secondo parametro di map() per fissare 'this' nella callback function
const moltiplicatore = { fattore: 3 };
const tripli = [1, 2, 3].map(function (n) {
  return n * this.fattore;
}, moltiplicatore);
console.log(tripli); // => [3, 6, 9]

// Array.from con funzione di mapping (alternativa a map su iterabili)
const range = Array.from({ length: 5 }, (_v, i) => i + 1);
console.log(range); // => [1, 2, 3, 4, 5]

// ============================================================
// 13) ESEMPIO PRATICO COMPLETO (mini report ERP)
// ============================================================

const datiTimbrature = [
  { badge: "UP-001", nome: "Mario", reparto: { sigla: "PR" }, minutiLavorati: 480 },
  { badge: "UP-002", nome: "Anna", reparto: null, minutiLavorati: 510 },
  { badge: "UP-003", nome: "Luca", reparto: { sigla: "MG" }, minutiLavorati: 0 },
];

const report = datiTimbrature
  .filter((t) => t.minutiLavorati > 0) // scarta assenti
  .map((t, i) => ({
    riga: i + 1,
    badge: t.badge,
    dipendente: t.nome,
    reparto: t.reparto?.sigla ?? "XX",
    ore: `${String(Math.floor(t.minutiLavorati / 60)).padStart(2, "0")}:${String(
      t.minutiLavorati % 60
    ).padStart(2, "0")}`,
  }));
console.log(report);
// => [
//   { riga: 1, badge: 'UP-001', dipendente: 'Mario', reparto: 'PR', ore: '08:00' },
//   { riga: 2, badge: 'UP-002', dipendente: 'Anna',  reparto: 'XX', ore: '08:30' }
// ]

/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   - arr.map(cb)                  -> nuovo array trasformato (immutabile)
   - cb(value, index, array)      -> 3 argomenti della callback
   - map((x) => ({ ... }))        -> object literal richiede parentesi
   - destructuring nei parametri  -> map(({a, b}) => ...)
   - chaining                     -> filter().map().reduce()
   - matrice.map(r => r.map(...)) -> map annidati
   - arr.flatMap(cb)              -> map + flat(1)
   - arr.map(...).flat()          -> appiattisce dopo il map
   - ids.map(p) + Promise.all()   -> mappare a promise e attendere
   - map(parseInt)                -> TRAP (usa map(s => parseInt(s,10)))
   - map(cb, thisArg)             -> fissa 'this' nella callback
   - Array.from({length}, cb)     -> map-like su iterabili / range
   - Object.entries(o).map(...)   -> trasformare object in array
   ============================================================ */
