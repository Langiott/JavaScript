/* ============================================================
   54 JS Array Sort
   Il metodo sort() ordina gli elementi di un array IN PLACE
   (modifica l'array originale) e ne ritorna il riferimento.
   Senza argomenti ordina convertendo gli elementi in stringa
   (ordinamento "lessicografico"), perciò sui numeri da' risultati
   sorprendenti. Per controllare l'ordine si passa una callback
   comparatore (a, b) => number. Vedremo: ordinamento numerico,
   alfabetico, di oggetti per campo, multi-criterio e localeCompare.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) BASE: sort() senza comparatore (ordine lessicografico)
   ------------------------------------------------------------ */

// Stringhe: l'ordine alfabetico "di default" funziona bene per ASCII semplice
const frutta = ['banana', 'mela', 'arancia', 'ciliegia'];
console.log(frutta.sort()); // => [ 'arancia', 'banana', 'ciliegia', 'mela' ]

// ATTENZIONE: sui numeri il default li converte in stringa
const numeri = [100, 25, 9, 3, 41];
console.log(numeri.sort()); // => [ 100, 25, 3, 41, 9 ]  (sbagliato come numeri!)
// perche' "100" < "25" < "3" come testo

/* ------------------------------------------------------------
   2) sort() MUTA l'array originale e ritorna lo stesso riferimento
   ------------------------------------------------------------ */
const originale = [3, 1, 2];
const risultato = originale.sort((a, b) => a - b);
console.log(originale === risultato); // => true (stesso array)
console.log(originale);               // => [ 1, 2, 3 ]

// Per NON mutare, copia prima con spread o usa toSorted (ES2023)
const intatto = [3, 1, 2];
const copiaOrdinata = [...intatto].sort((a, b) => a - b);
console.log(intatto);       // => [ 3, 1, 2 ] (invariato)
console.log(copiaOrdinata); // => [ 1, 2, 3 ]

// toSorted(): versione immutabile nativa (ES2023, Node 20+)
const conToSorted = [3, 1, 2].toSorted((a, b) => a - b);
console.log(conToSorted); // => [ 1, 2, 3 ]

/* ------------------------------------------------------------
   3) IL COMPARATORE: come funziona (a, b) => number
   ------------------------------------------------------------
   - se ritorna < 0  -> a va prima di b
   - se ritorna > 0  -> b va prima di a
   - se ritorna 0    -> ordine invariato (stabile da ES2019)
   ------------------------------------------------------------ */

// Numerico crescente
console.log([100, 25, 9, 3, 41].sort((a, b) => a - b)); // => [ 3, 9, 25, 41, 100 ]

// Numerico decrescente: basta invertire
console.log([100, 25, 9, 3, 41].sort((a, b) => b - a)); // => [ 100, 41, 25, 9, 3 ]

// Comparatore esplicito (equivalente, piu' leggibile per principianti)
const crescente = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
console.log([5, 2, 8].sort(crescente)); // => [ 2, 5, 8 ]

/* ------------------------------------------------------------
   4) ORDINAMENTO ALFABETICO e il problema degli accenti
   ------------------------------------------------------------ */
const nomi = ['Zoe', 'anna', 'Beatrice', 'aldo'];

// sort() di default e' case-sensitive: le maiuscole (codici ASCII piu' bassi) vengono prima
console.log([...nomi].sort()); // => [ 'Beatrice', 'Zoe', 'aldo', 'anna' ]

// localeCompare: ordinamento corretto secondo la lingua, case-insensitive con opzioni
console.log(
  [...nomi].sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }))
); // => [ 'aldo', 'anna', 'Beatrice', 'Zoe' ]

// Accenti: senza localeCompare 'è' finisce dopo 'z'; con localeCompare e' al posto giusto
const conAccenti = ['perù', 'pera', 'pesca', 'però'];
console.log([...conAccenti].sort());                              // ordine errato per la lingua
console.log([...conAccenti].sort((a, b) => a.localeCompare(b, 'it'))); // ordine corretto IT

/* ------------------------------------------------------------
   5) Intl.Collator: piu' veloce per ordinare GRANDI liste di stringhe
   ------------------------------------------------------------ */
const collatorIT = new Intl.Collator('it', { sensitivity: 'base', numeric: true });
const reparti = ['Stampaggio', 'assemblaggio', 'Élite', 'controllo'];
console.log([...reparti].sort(collatorIT.compare));
// => [ 'assemblaggio', 'controllo', 'Élite', 'Stampaggio' ]

// L'opzione numeric:true ordina "naturalmente" i numeri dentro le stringhe
const badge = ['UP-2', 'UP-10', 'UP-1', 'UP-21'];
console.log([...badge].sort()); // => lessicografico: [ 'UP-1', 'UP-10', 'UP-2', 'UP-21' ]
console.log([...badge].sort(new Intl.Collator('it', { numeric: true }).compare));
// => [ 'UP-1', 'UP-2', 'UP-10', 'UP-21' ] (ordine "umano")

/* ------------------------------------------------------------
   6) ORDINARE ARRAY DI OGGETTI per un campo
   ------------------------------------------------------------ */
const dipendenti = [
  { id: 1, nome: 'Anna', cognome: 'Verdi', reparto: 'ST', oreLavorate: 7.5 },
  { id: 2, nome: 'Luca', cognome: 'Bianchi', reparto: 'AS', oreLavorate: 8 },
  { id: 3, nome: 'Marco', cognome: 'Bianchi', reparto: 'ST', oreLavorate: 6 },
  { id: 4, nome: 'Sara', cognome: 'Rossi', reparto: 'AS', oreLavorate: 8 },
];

// Per campo numerico
console.log(
  [...dipendenti].sort((a, b) => a.oreLavorate - b.oreLavorate).map((d) => d.nome)
); // => [ 'Marco', 'Anna', 'Luca', 'Sara' ]

// Per campo stringa con localeCompare
console.log(
  [...dipendenti].sort((a, b) => a.cognome.localeCompare(b.cognome, 'it')).map((d) => d.cognome)
); // => [ 'Bianchi', 'Bianchi', 'Rossi', 'Verdi' ]

/* ------------------------------------------------------------
   7) ORDINAMENTO MULTI-CRITERIO (campo primario, poi secondario)
   ------------------------------------------------------------
   Pattern: il primo comparatore che ritorna != 0 "vince".
   Si usa l'operatore || (OR) per concatenare i criteri.
   ------------------------------------------------------------ */

// Ordina per cognome, a parita' di cognome per nome
const perCognomePoiNome = [...dipendenti].sort(
  (a, b) =>
    a.cognome.localeCompare(b.cognome, 'it') ||
    a.nome.localeCompare(b.nome, 'it')
);
console.log(perCognomePoiNome.map((d) => `${d.cognome} ${d.nome}`));
// => [ 'Bianchi Luca', 'Bianchi Marco', 'Rossi Sara', 'Verdi Anna' ]

// Reparto crescente, poi ore lavorate DECRESCENTI a parita' di reparto
const perRepartoPoiOre = [...dipendenti].sort(
  (a, b) =>
    a.reparto.localeCompare(b.reparto) ||
    b.oreLavorate - a.oreLavorate
);
console.log(perRepartoPoiOre.map((d) => `${d.reparto}/${d.nome}/${d.oreLavorate}`));
// => [ 'AS/Luca/8', 'AS/Sara/8', 'ST/Anna/7.5', 'ST/Marco/6' ]

/* ------------------------------------------------------------
   8) Helper riutilizzabili (higher-order) per generare comparatori
   ------------------------------------------------------------ */

// byNumber: comparatore numerico su una chiave o un selettore
const byNumber = (selector, dir = 'asc') => (a, b) => {
  const va = typeof selector === 'function' ? selector(a) : a[selector];
  const vb = typeof selector === 'function' ? selector(b) : b[selector];
  return dir === 'asc' ? va - vb : vb - va;
};

// byString: comparatore stringa con localeCompare
const byString = (key, dir = 'asc', locale = 'it') => (a, b) => {
  const r = String(a[key]).localeCompare(String(b[key]), locale, { sensitivity: 'base' });
  return dir === 'asc' ? r : -r;
};

// thenBy: compone piu' comparatori in cascata
const thenBy = (...comparatori) => (a, b) => {
  for (const cmp of comparatori) {
    const r = cmp(a, b);
    if (r !== 0) return r;
  }
  return 0;
};

console.log([...dipendenti].sort(byNumber('oreLavorate', 'desc')).map((d) => d.nome));
// => [ 'Luca', 'Sara', 'Anna', 'Marco' ]

const comparatoreComposto = thenBy(byString('reparto'), byNumber('oreLavorate', 'desc'));
console.log([...dipendenti].sort(comparatoreComposto).map((d) => `${d.reparto}/${d.nome}`));
// => [ 'AS/Luca', 'AS/Sara', 'ST/Anna', 'ST/Marco' ]

/* ------------------------------------------------------------
   9) ESEMPIO ERP: ordinare le timbrature per orario (naive-UTC)
   ------------------------------------------------------------
   Nel modulo timbrature gli orari sono stringhe "HH:MM".
   Ordinarle come stringa funziona perche' il formato e' a larghezza
   fissa con padStart(2,'0'); per sicurezza ordiniamo per minuti totali.
   ------------------------------------------------------------ */
const timbrature = [
  { badge: 'UP-003', evento: 'uscita', orario: '17:30' },
  { badge: 'UP-001', evento: 'ingresso', orario: '08:05' },
  { badge: 'UP-002', evento: 'uscitaPranzo', orario: '12:00' },
  { badge: 'UP-001', evento: 'rientroPranzo', orario: '13:00' },
];

const toMinuti = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const timbratureOrdinate = [...timbrature].sort((a, b) => toMinuti(a.orario) - toMinuti(b.orario));
console.log(timbratureOrdinate.map((t) => `${t.orario} ${t.evento}`));
// => [ '08:05 ingresso', '12:00 uscitaPranzo', '13:00 rientroPranzo', '17:30 uscita' ]

// A parita' di orario, ordina per badge "umano" (UP-1, UP-2, UP-10)
const badgeCollator = new Intl.Collator('it', { numeric: true });
const ordinatePerOrarioPoiBadge = [...timbrature].sort(
  thenBy(
    (a, b) => toMinuti(a.orario) - toMinuti(b.orario),
    (a, b) => badgeCollator.compare(a.badge, b.badge)
  )
);
console.log(ordinatePerOrarioPoiBadge.map((t) => `${t.orario} ${t.badge}`));

/* ------------------------------------------------------------
   10) ESEMPIO ERP: vestiario/DPI per scorta critica
   ------------------------------------------------------------
   Mostriamo prima gli articoli sotto scorta minima (urgenti),
   poi ordiniamo per quantita' mancante decrescente.
   ------------------------------------------------------------ */
const vestiario = [
  { articolo: 'Guanti', taglia: 'M', quantita: 12, scortaMinima: 10 },
  { articolo: 'Scarpe', taglia: '42', quantita: 3, scortaMinima: 8 },
  { articolo: 'Tuta', taglia: 'L', quantita: 1, scortaMinima: 5 },
  { articolo: 'Occhiali', taglia: 'U', quantita: 20, scortaMinima: 15 },
];

const sottoScorta = (v) => v.quantita < v.scortaMinima;
const mancante = (v) => v.scortaMinima - v.quantita;

const priorita = [...vestiario].sort(
  thenBy(
    // i sotto-scorta (true) prima: confrontiamo i boolean come numeri
    (a, b) => Number(sottoScorta(b)) - Number(sottoScorta(a)),
    // poi per quantita' mancante decrescente
    (a, b) => mancante(b) - mancante(a)
  )
);
console.log(priorita.map((v) => `${v.articolo}: manca ${Math.max(0, mancante(v))}`));
// => [ 'Tuta: manca 4', 'Scarpe: manca 5', ... gli altri con 0 ]
// (nota: i due sotto-scorta vengono prima, ordinati per mancante desc)

/* ------------------------------------------------------------
   11) ORDINARE PER DATE
   ------------------------------------------------------------ */
const richieste = [
  { id: 1, data: '2026-03-15' },
  { id: 2, data: '2026-01-02' },
  { id: 3, data: '2026-03-01' },
];

// Le date ISO "YYYY-MM-DD" si ordinano correttamente anche come stringa
console.log([...richieste].sort((a, b) => a.data.localeCompare(b.data)).map((r) => r.data));
// => [ '2026-01-02', '2026-03-01', '2026-03-15' ]

// In generale, per oggetti Date convertiamo a timestamp
const eventi = [
  { nome: 'turno P4', inizio: new Date('2026-06-30T08:00:00Z') },
  { nome: 'turno P2', inizio: new Date('2026-06-30T06:00:00Z') },
];
console.log([...eventi].sort((a, b) => a.inizio - b.inizio).map((e) => e.nome));
// => [ 'turno P2', 'turno P4' ]

/* ------------------------------------------------------------
   12) STABILITA' dell'ordinamento (garantita da ES2019)
   ------------------------------------------------------------
   Elementi "uguali" secondo il comparatore mantengono l'ordine
   d'ingresso. Utile per ordinamenti incrementali.
   ------------------------------------------------------------ */
const turni = [
  { dip: 'Anna', tipo: 'P4' },
  { dip: 'Luca', tipo: 'P2' },
  { dip: 'Sara', tipo: 'P4' },
];
// Ordinando solo per tipo, Anna resta prima di Sara (entrambe P4)
console.log([...turni].sort((a, b) => a.tipo.localeCompare(b.tipo)).map((t) => t.dip));
// => [ 'Luca', 'Anna', 'Sara' ]

/* ------------------------------------------------------------
   13) TRUCCO: sort + map (decorate-sort-undecorate) per chiavi costose
   ------------------------------------------------------------
   Se calcolare la chiave di ordinamento e' costoso, calcolala UNA volta.
   ------------------------------------------------------------ */
const parole = ['casa', 'a', 'elefante', 'no'];
const perLunghezza = parole
  .map((p) => ({ p, len: p.length }))   // decorate
  .sort((a, b) => a.len - b.len)         // sort sulla chiave precalcolata
  .map((o) => o.p);                      // undecorate
console.log(perLunghezza); // => [ 'a', 'no', 'casa', 'elefante' ]

/* ------------------------------------------------------------
   14) ERRORI COMUNI da evitare
   ------------------------------------------------------------ */
// (a) Comparatore che ritorna boolean -> comportamento NON definito/instabile
//     SBAGLIATO: arr.sort((a, b) => a > b)
//     GIUSTO:    arr.sort((a, b) => a - b)
console.log([3, 1, 2].sort((a, b) => a - b)); // => [ 1, 2, 3 ]

// (b) Dimenticare che sort() muta: usa [...arr] o toSorted() se ti serve l'originale
// (c) Ordinare numeri senza comparatore (vedi esempio 1)

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - arr.sort()                      ordina IN PLACE (lessicografico di default)
   - arr.sort((a,b)=>a-b)            numerico crescente
   - arr.sort((a,b)=>b-a)            numerico decrescente
   - arr.toSorted(cmp)               ordina senza mutare (ES2023)
   - [...arr].sort(cmp)              copia + ordina (immutabile)
   - a.localeCompare(b, 'it', opt)   confronto stringhe per lingua/accenti
   - new Intl.Collator(loc, opt)     collator riutilizzabile; .compare; numeric:true
   - cmp1(a,b) || cmp2(a,b)          multi-criterio (primario poi secondario)
   - thenBy(...cmp)                  compone comparatori in cascata
   - byNumber / byString            factory di comparatori (higher-order)
   - decorate-sort-undecorate       map -> sort -> map per chiavi costose
   - sort e' STABILE da ES2019
   ============================================================ */
