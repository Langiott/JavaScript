/* ============================================================
   115 JS Examples Practical
   Esempi pratici end-to-end ispirati a un gestionale aziendale (ERP).
   Affrontiamo casi reali: calcolo delle ore dalle timbrature con
   gestione naive-UTC, filtri sui dipendenti, normalizzazione e
   generazione di un codice badge tipo 'UP-001'.
   Tutto e' scritto in JavaScript moderno (ES2020+), eseguibile con
   Node.js, senza librerie esterne. Spieghiamo i pattern (closure,
   higher-order function, destructuring, optional chaining) sul campo.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. DATI DI ESEMPIO (dominio: dipendenti, timbrature, turni)
   ------------------------------------------------------------ */

// Una lista di dipendenti: ogni record ha id, nome, cognome, badge, reparto, attivo.
const dipendenti = [
  { id: 1, nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001', reparto: 'PR', ruolo: 'operaio', attivo: true },
  { id: 2, nome: 'Anna', cognome: 'Verdi', codiceBadge: 'UP-002', reparto: 'AM', ruolo: 'impiegato', attivo: true },
  { id: 3, nome: 'Luca', cognome: 'Bianchi', codiceBadge: 'UP-003', reparto: 'PR', ruolo: 'operaio', attivo: false },
  { id: 4, nome: 'Sara', cognome: 'Neri', codiceBadge: 'UP-010', reparto: 'QU', ruolo: 'responsabile', attivo: true },
];

// Le timbrature di una giornata: orari come stringhe 'HH:MM' (naive, senza timezone).
const timbrature = [
  { dipendenteId: 1, data: '2026-06-30', ingresso: '08:00', uscitaPranzo: '12:30', rientroPranzo: '13:15', uscita: '17:30' },
  { dipendenteId: 2, data: '2026-06-30', ingresso: '09:00', uscitaPranzo: '13:00', rientroPranzo: '14:00', uscita: '18:00' },
  { dipendenteId: 4, data: '2026-06-30', ingresso: '08:15', uscitaPranzo: null, rientroPranzo: null, uscita: '16:45' },
];

/* ------------------------------------------------------------
   2. CALCOLO ORE DALLE TIMBRATURE
   ------------------------------------------------------------ */

// Converte 'HH:MM' in minuti dall'inizio del giorno. Pattern: split + Number.
const oraInMinuti = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
console.log(oraInMinuti('08:30')); // => 510

// Converte minuti in 'HH:MM'. Usa padStart per avere sempre 2 cifre.
const minutiInOra = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
console.log(minutiInOra(510)); // => '08:30'

// Calcola i minuti lavorati di una timbratura, sottraendo la pausa pranzo.
// Optional chaining e nullish: se manca la pausa, conta 0.
const minutiLavorati = (t) => {
  const lavoroLordo = oraInMinuti(t.uscita) - oraInMinuti(t.ingresso);
  const pausa = (t.uscitaPranzo && t.rientroPranzo)
    ? oraInMinuti(t.rientroPranzo) - oraInMinuti(t.uscitaPranzo)
    : 0;
  return lavoroLordo - pausa;
};
console.log(minutiLavorati(timbrature[0])); // => 525  (8h45m: 9h30 - 45m pausa)
console.log(minutiInOra(minutiLavorati(timbrature[0]))); // => '08:45'

// Totale ore lavorate di tutta la giornata (tutti i dipendenti) con reduce.
const totaleMinutiGiornata = timbrature.reduce((s, t) => s + minutiLavorati(t), 0);
console.log(minutiInOra(totaleMinutiGiornata)); // => '24:45'

/* ------------------------------------------------------------
   3. PATTERN NAIVE-UTC (cuore del modulo timbratura)
   ------------------------------------------------------------ */

// Leggiamo l'ora di Roma e la salviamo come UTC "naive" (senza spostare il fuso).
// Pattern reale: Intl.DateTimeFormat con timeZone Europe/Rome, poi Date.UTC.
const nowRomeNaiveUTC = () => {
  const fmt = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  // formatToParts ritorna un array di {type, value}: lo trasformiamo in oggetto.
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
  return new Date(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second));
};
const ora = nowRomeNaiveUTC();
console.log(ora.toISOString().slice(0, 10)); // => 'YYYY-MM-DD' (data odierna)
console.log(ora.getUTCHours());              // => ora di Roma letta come UTC

/* ------------------------------------------------------------
   4. FILTRI SUI DIPENDENTI (filter / map / find / some / every)
   ------------------------------------------------------------ */

// Solo dipendenti attivi.
const attivi = dipendenti.filter(d => d.attivo);
console.log(attivi.length); // => 3

// Dipendenti di un reparto specifico (higher-order: ritorna un predicato).
const delReparto = (sigla) => (d) => d.reparto === sigla;
const reparto_PR = dipendenti.filter(delReparto('PR'));
console.log(reparto_PR.map(d => d.cognome)); // => [ 'Rossi', 'Bianchi' ]

// find: primo elemento che soddisfa la condizione (o undefined).
const perBadge = (badge) => dipendenti.find(d => d.codiceBadge === badge);
console.log(perBadge('UP-010')?.nome ?? 'non trovato'); // => 'Sara'
console.log(perBadge('UP-999')?.nome ?? 'non trovato'); // => 'non trovato'

// some: esiste almeno un responsabile attivo?
console.log(dipendenti.some(d => d.ruolo === 'responsabile' && d.attivo)); // => true

// every: tutti i dipendenti attivi hanno un badge?
console.log(attivi.every(d => Boolean(d.codiceBadge))); // => true

// map verso DTO (Data Transfer Object): nome completo + badge.
const elenco = dipendenti.map(d => ({
  badge: d.codiceBadge,
  nomeCompleto: `${d.nome} ${d.cognome}`,
}));
console.log(elenco[0]); // => { badge: 'UP-001', nomeCompleto: 'Mario Rossi' }

// Filtri combinati: ricerca testuale case-insensitive su nome o cognome.
const cerca = (q) => {
  const t = q.trim().toLowerCase();
  return dipendenti.filter(d =>
    d.nome.toLowerCase().includes(t) || d.cognome.toLowerCase().includes(t));
};
console.log(cerca('ro').map(d => d.cognome)); // => [ 'Rossi' ]

// Raggruppamento per reparto con reduce (pattern groupBy).
const perRepartoMap = dipendenti.reduce((acc, d) => {
  (acc[d.reparto] ??= []).push(d.cognome);
  return acc;
}, {});
console.log(perRepartoMap); // => { PR: ['Rossi','Bianchi'], AM: ['Verdi'], QU: ['Neri'] }

/* ------------------------------------------------------------
   5. ORDINAMENTO E STATISTICHE
   ------------------------------------------------------------ */

// Ordina i dipendenti per cognome (sort con localeCompare, copia con spread).
const ordinati = [...dipendenti].sort((a, b) => a.cognome.localeCompare(b.cognome));
console.log(ordinati.map(d => d.cognome)); // => ['Bianchi','Neri','Rossi','Verdi']

// Conta dipendenti per ruolo.
const conteggioRuoli = dipendenti.reduce((acc, d) => {
  acc[d.ruolo] = (acc[d.ruolo] ?? 0) + 1;
  return acc;
}, {});
console.log(conteggioRuoli); // => { operaio: 2, impiegato: 1, responsabile: 1 }

// Media minuti lavorati (con guardia per evitare divisione per zero).
const mediaMinuti = timbrature.length
  ? Math.round(totaleMinutiGiornata / timbrature.length)
  : 0;
console.log(minutiInOra(mediaMinuti)); // => '08:15'

/* ------------------------------------------------------------
   6. BADGE: validazione, normalizzazione, generazione
   ------------------------------------------------------------ */

// Valida il formato badge 'UP-001' con una regular expression.
const badgeValido = (b) => /^UP-\d{3}$/.test(b);
console.log(badgeValido('UP-007')); // => true
console.log(badgeValido('up-7'));   // => false

// Normalizza un input badge: trim, maiuscolo, niente spazi, max 8 char.
const normalizzaBadge = (v) =>
  String(v || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
console.log(normalizzaBadge('  up-001 ')); // => 'UP-001'

// Estrae il numero progressivo dal badge con match e gruppo di cattura.
const numeroBadge = (b) => {
  const m = b.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
};
console.log(numeroBadge('UP-010')); // => 10

// Genera il prossimo badge libero: trova il max e incrementa.
const prossimoBadge = (lista) => {
  const max = lista.reduce((m, d) => Math.max(m, numeroBadge(d.codiceBadge) ?? 0), 0);
  return `UP-${String(max + 1).padStart(3, '0')}`;
};
console.log(prossimoBadge(dipendenti)); // => 'UP-011'

/* ------------------------------------------------------------
   7. TURNI: default params e merge di configurazioni
   ------------------------------------------------------------ */

// Configurazione di default di un turno (P4 = con pausa pranzo).
const TURNO_DEFAULT = { sigla: 'P4', inizio: '08:00', fine: '17:00', pausaMin: 60, arrotondaA: 5 };

// Merge con spread: i valori passati sovrascrivono i default.
const creaTurno = (impostazioni = {}) => ({ ...TURNO_DEFAULT, ...impostazioni });
console.log(creaTurno({ sigla: 'P2', pausaMin: 0 }));
// => { sigla: 'P2', inizio: '08:00', fine: '17:00', pausaMin: 0, arrotondaA: 5 }

// Arrotondamento dei minuti al multiplo configurato (default param dal turno).
const arrotonda = (min, a = TURNO_DEFAULT.arrotondaA) => Math.round(min / a) * a;
console.log(arrotonda(127)); // => 125
console.log(arrotonda(127, 15)); // => 120

/* ------------------------------------------------------------
   8. DESTRUCTURING avanzato e rest/spread
   ------------------------------------------------------------ */

// Destructuring con rinomina e default; rest per il resto delle proprieta'.
const { cognome: cogn, ruolo = 'n/d', ...altro } = dipendenti[1];
console.log(cogn);   // => 'Verdi'
console.log(altro.reparto); // => 'AM'

// Destructuring annidato dentro i parametri di funzione.
const etichetta = ({ nome, cognome, codiceBadge }) => `${codiceBadge}: ${nome} ${cognome}`;
console.log(etichetta(dipendenti[0])); // => 'UP-001: Mario Rossi'

/* ------------------------------------------------------------
   9. ASYNC: simulazione chiamate al backend (Promise / async-await)
   ------------------------------------------------------------ */

// Simula una query asincrona che ritorna i dipendenti dopo un breve delay.
const fetchDipendenti = () =>
  new Promise((resolve) => setTimeout(() => resolve(dipendenti.filter(d => d.attivo)), 10));

// Simula il calcolo ore lato server.
const fetchOre = (id) =>
  new Promise((resolve) => {
    const t = timbrature.find(x => x.dipendenteId === id);
    resolve(t ? minutiLavorati(t) : 0);
  });

// async/await con try/catch: pattern reale del caricamento dati.
async function reportGiornaliero() {
  try {
    const lista = await fetchDipendenti();
    // Promise.all: eseguiamo i calcoli in parallelo.
    const ore = await Promise.all(lista.map(d => fetchOre(d.id)));
    return lista.map((d, i) => ({ badge: d.codiceBadge, ore: minutiInOra(ore[i]) }));
  } catch (err) {
    console.error('Errore report:', err.message);
    return [];
  }
}
reportGiornaliero().then(r => console.log(r));
// => [ {badge:'UP-001',ore:'08:45'}, {badge:'UP-002',ore:'08:00'}, {badge:'UP-010',ore:'08:30'} ]

/* ------------------------------------------------------------
   10. HIGHER-ORDER FUNCTION: builder di filtri componibili
   ------------------------------------------------------------ */

// applicaFiltri: prende una lista e una serie di predicati, li applica tutti.
const applicaFiltri = (lista, ...predicati) =>
  lista.filter(item => predicati.every(p => p(item)));

const isAttivo = (d) => d.attivo;
const isOperaio = (d) => d.ruolo === 'operaio';
console.log(applicaFiltri(dipendenti, isAttivo, isOperaio).map(d => d.cognome));
// => [ 'Rossi' ]

/* ------------------------------------------------------------
   11. ROLLBACK simulato (try/catch con compensazione)
   ------------------------------------------------------------ */

// Pattern: crea il record; se uno step successivo fallisce, annulla (delete).
async function creaDipendenteConBadge(nuovo) {
  const creato = { ...nuovo, id: Date.now(), codiceBadge: prossimoBadge(dipendenti) };
  dipendenti.push(creato);
  try {
    if (!badgeValido(creato.codiceBadge)) throw new Error('badge non valido');
    return creato;
  } catch (err) {
    // rollback: rimuovo il record appena inserito.
    const i = dipendenti.findIndex(d => d.id === creato.id);
    if (i >= 0) dipendenti.splice(i, 1);
    throw err;
  }
}
creaDipendenteConBadge({ nome: 'Gino', cognome: 'Gialli', reparto: 'PR', ruolo: 'operaio', attivo: true })
  .then(d => console.log('creato', d.codiceBadge)); // => creato UP-011

/* ------------------------------------------------------------
   12. ESEMPIO BROWSER (DOM): rendering badge sulla pagina
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
function renderBadge(lista) {
  // const ul = document.getElementById('lista-badge');
  // ul.innerHTML = lista
  //   .map(d => `<li data-id="${d.id}">${d.codiceBadge} - ${d.nome} ${d.cognome}</li>`)
  //   .join('');
  return lista.map(d => `<li>${d.codiceBadge} ${d.nome}</li>`).join('');
}
console.log(renderBadge(dipendenti.slice(0, 2)));
// => '<li>UP-001 Mario</li><li>UP-002 Anna</li>'

/* ============================================================
   RIEPILOGO COMANDI (per memoria rapida)
   ------------------------------------------------------------
   - String.prototype.split / Number()        -> parsing 'HH:MM'
   - String.prototype.padStart                 -> formato HH:MM, badge 001
   - Math.floor / Math.round / %               -> minuti<->ore, arrotondamento
   - Array.prototype.filter                    -> dipendenti attivi/reparto
   - Array.prototype.map                       -> trasformazione in DTO
   - Array.prototype.reduce                    -> somma minuti, groupBy, conteggi
   - Array.prototype.find / findIndex          -> ricerca per badge/id
   - Array.prototype.some / every              -> validazioni di insieme
   - Array.prototype.sort + localeCompare      -> ordinamento per cognome
   - Spread ... / rest ...                     -> merge config, copia array
   - Destructuring + default + rename          -> { cognome: cogn, ruolo = 'n/d' }
   - Optional chaining ?. / nullish ?? / ??=   -> accesso sicuro e default
   - Template literals `...${}`                -> etichette/HTML
   - Regular expression .test / .match         -> formato e parsing badge
   - Default parameters                        -> creaTurno, arrotonda
   - Higher-order functions                    -> delReparto, applicaFiltri
   - Intl.DateTimeFormat / formatToParts       -> ora di Roma
   - Date.UTC / toISOString / getUTCHours      -> pattern naive-UTC
   - Object.fromEntries                        -> parts -> oggetto
   - Promise / async / await / try-catch       -> chiamate backend, rollback
   - Promise.all                               -> calcoli in parallelo
   - setTimeout                                 -> simulazione delay
   ============================================================ */
