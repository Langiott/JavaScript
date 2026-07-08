/* ============================================================
   92 JS ADV Destructuring Deep
   Destructuring avanzato in JavaScript: come combinare in un
   colpo solo nested destructuring (oggetti/array annidati),
   default values, rename (alias delle proprieta'), e rest
   pattern. Vediamo l'uso nei parametri di funzione, dove il
   destructuring sostituisce i classici "options object" e
   permette API pulite, sicure contro undefined e con valori
   di default. Esempi base -> avanzati, con casi reali ispirati
   a un gestionale ERP (dipendenti, timbrature, turni, reparti).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) RIPASSO LAMPO: destructuring base di oggetto e array
   ------------------------------------------------------------ */

// Estrarre proprieta' da un oggetto in variabili omonime
const dip = { nome: 'Mario', cognome: 'Rossi', badge: 'UP-001' };
const { nome, cognome } = dip;
console.log(nome, cognome); // => Mario Rossi

// Estrarre elementi da un array per posizione
const turni = ['P2', 'P4', 'P6'];
const [primo, secondo] = turni;
console.log(primo, secondo); // => P2 P4

/* ------------------------------------------------------------
   2) RENAME (alias): { chiave: nuovoNome }
   Utile quando la chiave del DB non e' un nome comodo.
   ------------------------------------------------------------ */

const rowDb = { articolo_poly: 'A123', des_art: 'Tuta DPI' };
const { articolo_poly: codice, des_art: descrizione } = rowDb;
console.log(codice, descrizione); // => A123 Tuta DPI

/* ------------------------------------------------------------
   3) DEFAULT VALUES: scattano SOLO se il valore e' undefined
   Attenzione: null NON attiva il default, undefined si'.
   ------------------------------------------------------------ */

const config = { regola: 'arrotonda' };
const { regola, soglia = 5 } = config;
console.log(regola, soglia); // => arrotonda 5

const test = { a: null, b: undefined };
const { a = 'X', b = 'Y' } = test;
console.log(a, b); // => null Y

/* ------------------------------------------------------------
   4) RENAME + DEFAULT insieme: { chiave: nuovoNome = default }
   ------------------------------------------------------------ */

const imp = { sigla: undefined };
const { sigla: siglaReparto = 'XX' } = imp;
console.log(siglaReparto); // => XX

/* ------------------------------------------------------------
   5) REST in oggetti: raccoglie "tutto il resto"
   Pattern tipico: estraggo un campo e tengo il resto a parte.
   ------------------------------------------------------------ */

const assegnazione = { id: 7, vestiario: 'Tuta', taglia: 'L', quantita: 2 };
const { vestiario, ...resto } = assegnazione;
console.log(vestiario); // => Tuta
console.log(resto);     // => { id: 7, taglia: 'L', quantita: 2 }

// REST in array: primo elemento + coda
const [testa, ...coda] = [10, 20, 30, 40];
console.log(testa); // => 10
console.log(coda);  // => [ 20, 30, 40 ]

/* ------------------------------------------------------------
   6) NESTED destructuring: scendere dentro oggetti annidati
   ------------------------------------------------------------ */

const record = {
  dipendente: { nome: 'Lucia', reparto: { sigla: 'PR', nome: 'Produzione' } },
  oreLavorate: 7.5,
};

// Scendo fino a reparto.sigla con rename
const { dipendente: { nome: nomeDip, reparto: { sigla: sig } } } = record;
console.log(nomeDip, sig); // => Lucia PR

// Nota: cosi' NON ho creato la variabile "dipendente" ne' "reparto",
// ho solo "attraversato" la struttura per arrivare alle foglie.

/* ------------------------------------------------------------
   7) NESTED + DEFAULT su livelli annidati
   Se manca un sotto-oggetto serve un default sul ramo, altrimenti
   destrutturare undefined lancia un TypeError.
   ------------------------------------------------------------ */

const parziale = { dipendente: { nome: 'Ada' } };
// reparto non esiste -> diamo default {} al ramo, poi default alla foglia
const {
  dipendente: { nome: n2, reparto: { sigla: s2 = 'XX' } = {} } = {},
} = parziale;
console.log(n2, s2); // => Ada XX

/* ------------------------------------------------------------
   8) NESTED + RENAME + DEFAULT + REST tutti insieme
   Il caso "deep" completo: questa e' la combinazione del file.
   ------------------------------------------------------------ */

const ordine = {
  id: 99,
  cliente: { ragioneSociale: 'ACME', sede: { citta: 'Roma' } },
  righe: [{ art: 'A1', qta: 3 }, { art: 'A2', qta: 1 }],
  note: 'urgente',
};

const {
  id: idOrdine,                                  // rename
  cliente: { ragioneSociale: cli, sede: { citta = 'N/D' } = {} }, // nested + default
  righe: [primaRiga, ...altreRighe],             // nested array + rest
  ...metaOrdine                                  // rest dell'oggetto (note, ...)
} = ordine;

console.log(idOrdine);    // => 99
console.log(cli, citta);  // => ACME Roma
console.log(primaRiga);   // => { art: 'A1', qta: 3 }
console.log(altreRighe);  // => [ { art: 'A2', qta: 1 } ]
console.log(metaOrdine);  // => { note: 'urgente' }

/* ------------------------------------------------------------
   9) DESTRUCTURING NEI PARAMETRI DI FUNZIONE (options object)
   Sostituisce liste lunghe di argomenti posizionali.
   ------------------------------------------------------------ */

// Senza destructuring: ordine degli argomenti fragile
function creaBadgeVecchio(nome, cognome, reparto) {
  return `${nome} ${cognome} [${reparto}]`;
}

// Con destructuring + default: chiamata leggibile e robusta
function creaBadge({ nome, cognome, reparto = 'XX' }) {
  return `${nome} ${cognome} [${reparto}]`;
}
console.log(creaBadge({ nome: 'Gio', cognome: 'Bianchi' }));
// => Gio Bianchi [XX]

/* ------------------------------------------------------------
   10) DEFAULT dell'INTERO parametro: { } = {}
   Permette di chiamare la funzione senza alcun argomento.
   ------------------------------------------------------------ */

function applicaFiltro({ stato = 'tutti', take = 1000 } = {}) {
  return { stato, take };
}
console.log(applicaFiltro());                 // => { stato: 'tutti', take: 1000 }
console.log(applicaFiltro({ take: 50 }));     // => { stato: 'tutti', take: 50 }

/* ------------------------------------------------------------
   11) NESTED nei parametri: estrarre campi profondi all'ingresso
   ------------------------------------------------------------ */

function etichettaReparto({ dipendente: { nome, reparto: { sigla = 'XX' } = {} } }) {
  return `${nome} -> ${sigla}`;
}
console.log(etichettaReparto({ dipendente: { nome: 'Eva' } }));
// => Eva -> XX

/* ------------------------------------------------------------
   12) REST nei parametri: separo cio' che mi serve dal resto
   Pattern ERP: estraggo "vestiario" e passo il resto a un'altra fn.
   ------------------------------------------------------------ */

function salvaAssegnazione({ vestiario, ...datiBase }) {
  return { tipoCapo: vestiario, payload: datiBase };
}
console.log(salvaAssegnazione({ vestiario: 'Camice', id: 3, taglia: 'M' }));
// => { tipoCapo: 'Camice', payload: { id: 3, taglia: 'M' } }

/* ------------------------------------------------------------
   13) MERGE di default + override + spread (default object pattern)
   Tipico nelle impostazioni: DEFAULT <- impostazioni utente.
   ------------------------------------------------------------ */

const DEFAULT_TURNO = { regolaArrotondamento: 'su', pausaMin: 0, tolleranzaMin: 5 };

function normalizzaTurno(impostazioni = {}, turni = []) {
  // unisco i default con le impostazioni e poi destrutturo cio' che serve
  const { regolaArrotondamento, pausaMin, tolleranzaMin } = {
    ...DEFAULT_TURNO,
    ...impostazioni,
  };
  return { regolaArrotondamento, pausaMin, tolleranzaMin, turni };
}
console.log(normalizzaTurno({ pausaMin: 30 }, ['P4']));
// => { regolaArrotondamento: 'su', pausaMin: 30, tolleranzaMin: 5, turni: [ 'P4' ] }

/* ------------------------------------------------------------
   14) DESTRUCTURING in cicli for...of (array di oggetti)
   ------------------------------------------------------------ */

const timbrature = [
  { badge: 'UP-001', ore: 8 },
  { badge: 'UP-002', ore: 6.5 },
];
for (const { badge, ore } of timbrature) {
  console.log(`${badge}: ${ore}h`);
}
// => UP-001: 8h
// => UP-002: 6.5h

/* ------------------------------------------------------------
   15) DESTRUCTURING + Object.entries: iterare chiave/valore
   ------------------------------------------------------------ */

const scorte = { tuta: 12, guanti: 4, casco: 0 };
for (const [articolo, qta] of Object.entries(scorte)) {
  const stato = qta === 0 ? 'ESAURITO' : 'ok';
  console.log(`${articolo}=${qta} (${stato})`);
}
// => tuta=12 (ok)
// => guanti=4 (ok)
// => casco=0 (ESAURITO)

/* ------------------------------------------------------------
   16) DESTRUCTURING su valore di ritorno (multi-return via array/obj)
   ------------------------------------------------------------ */

function spezzaOrario(orario) {
  // "HH:MM" -> [ore, minuti] come numeri
  const [hh, mm] = orario.split(':').map(Number);
  return { hh, mm, minutiTotali: hh * 60 + mm };
}
const { hh, mm, minutiTotali } = spezzaOrario('08:30');
console.log(hh, mm, minutiTotali); // => 8 30 510

/* ------------------------------------------------------------
   17) SWAP di variabili senza temporanea (array destructuring)
   ------------------------------------------------------------ */

let inizio = '09:00', fine = '08:00';
[inizio, fine] = [fine, inizio]; // corregge l'inversione
console.log(inizio, fine); // => 08:00 09:00

/* ------------------------------------------------------------
   18) DESTRUCTURING con computed keys (chiave dinamica)
   ------------------------------------------------------------ */

const campoChiave = 'sigla';
const reparto = { sigla: 'MG', nome: 'Magazzino' };
const { [campoChiave]: valoreSigla } = reparto;
console.log(valoreSigla); // => MG

/* ------------------------------------------------------------
   19) SKIP di elementi in array (buchi con virgole)
   ------------------------------------------------------------ */

const parts = ['30', '/', '06', '/', '2026'];
const [giorno, , mese, , anno] = parts;
console.log(`${anno}-${mese}-${giorno}`); // => 2026-06-30

/* ------------------------------------------------------------
   20) DEEP DEFAULT che usa altre variabili gia' destrutturate
   I default possono riferirsi a binding dichiarati prima nello
   stesso pattern (valutazione da sinistra a destra).
   ------------------------------------------------------------ */

function rangeTurno({ start = '08:00', end = start } = {}) {
  return `${start} - ${end}`;
}
console.log(rangeTurno({ start: '06:00' })); // => 06:00 - 06:00
console.log(rangeTurno());                   // => 08:00 - 08:00

/* ------------------------------------------------------------
   21) CASO ERP COMPLETO: report timbratura
   Un singolo destructuring nei parametri che combina nested,
   rename, default e rest. Estrae cio' che serve per la riga di
   report e tiene il "resto" come metadati grezzi.
   ------------------------------------------------------------ */

function rigaReportTimbratura({
  dipendente: { nome, cognome, codiceBadge: badge = 'N/D' },
  reparto: { sigla: siglaRep = 'XX' } = {},
  ore: { lavorate: oreLav = 0, straordinario: extra = 0 } = {},
  ...meta
} = {}) {
  const totale = oreLav + extra;
  return {
    descrizione: `${nome} ${cognome} (${badge}) [${siglaRep}]`,
    totaleOre: totale,
    meta, // tutto cio' che non abbiamo estratto esplicitamente
  };
}

console.log(
  rigaReportTimbratura({
    dipendente: { nome: 'Sara', cognome: 'Verdi', codiceBadge: 'UP-007' },
    reparto: { sigla: 'PR' },
    ore: { lavorate: 8, straordinario: 1.5 },
    data: '2026-06-30',
    approvata: true,
  })
);
// => {
//      descrizione: 'Sara Verdi (UP-007) [PR]',
//      totaleOre: 9.5,
//      meta: { data: '2026-06-30', approvata: true }
//    }

// Chiamata con dati minimi: i default coprono i buchi
console.log(rigaReportTimbratura({ dipendente: { nome: 'Tom', cognome: 'Neri' } }));
// => { descrizione: 'Tom Neri (N/D) [XX]', totaleOre: 0, meta: {} }

/* ------------------------------------------------------------
   22) DESTRUCTURING su array di DTO con map (trasformazione)
   ------------------------------------------------------------ */

const dipendenti = [
  { nome: 'Mara', cognome: 'Blu', reparto: { sigla: 'PR' } },
  { nome: 'Ivo', cognome: 'Gialli', reparto: { sigla: 'MG' } },
];
const elenco = dipendenti.map(({ nome, cognome, reparto: { sigla } }) =>
  `${cognome} ${nome} - ${sigla}`
);
console.log(elenco); // => [ 'Blu Mara - PR', 'Gialli Ivo - MG' ]

/* ------------------------------------------------------------
   23) ATTENZIONE: errore comune con destructuring di undefined
   ------------------------------------------------------------ */

// Questo lancerebbe TypeError perche' non c'e' default sul ramo:
//   const { x: { y } } = {};   // TypeError: Cannot destructure 'undefined'
// Soluzione: default sul ramo intermedio
const { x: { y = 1 } = {} } = {};
console.log(y); // => 1

/* ============================================================
   RIEPILOGO COMANDI / PATTERN
   - const { a, b } = obj            -> destructuring oggetto
   - const [a, b] = arr             -> destructuring array
   - { chiave: alias }              -> rename
   - { chiave = def }               -> default (solo se undefined)
   - { chiave: alias = def }        -> rename + default
   - { a, ...rest }                 -> rest in oggetto
   - [primo, ...coda]               -> rest in array
   - { o: { p: { q } } }            -> nested
   - { o: { p = def } = {} }        -> default sul ramo nested
   - function f({ a = 1 } = {})     -> destructuring nei parametri
   - { ...DEFAULT, ...override }     -> merge default + override
   - for (const { a, b } of arr)    -> destructuring in for...of
   - Object.entries(obj)            -> [chiave, valore] iterabili
   - [a, b] = [b, a]                -> swap senza temporanea
   - { [chiave]: v }                -> computed key in destructuring
   - [a, , c]                       -> skip elementi array
   ============================================================ */
