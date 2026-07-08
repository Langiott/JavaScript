/* ============================================================
   46 JS Date Methods
   In JavaScript l'oggetto Date rappresenta un istante nel tempo.
   I "getter" (getFullYear, getMonth, getDate, getHours, getDay)
   permettono di leggere le singole componenti di una data, mentre
   i "setter" (setFullYear, setMonth, ...) le modificano.
   Esistono due famiglie di metodi: quelli LOCALI (fuso del sistema)
   e quelli UTC (tempo universale). Capire la differenza e' cruciale
   per evitare bug di fuso orario, calcolare differenze tra giorni e
   gestire timbrature aziendali in modo affidabile.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) CREARE UN OGGETTO DATE
   ------------------------------------------------------------ */

// Data/ora corrente
const now = new Date();
console.log(now instanceof Date); // => true

// Da stringa ISO (consigliato: lo standard ISO 8601)
const d1 = new Date('2026-06-30T08:30:00');
console.log(d1.getFullYear()); // => 2026

// Da componenti: ATTENZIONE il mese e' 0-based (0 = gennaio)
const d2 = new Date(2026, 5, 30, 8, 30, 0); // 5 = giugno
console.log(d2.getMonth()); // => 5

// Da timestamp (millisecondi dal 1 gen 1970, "epoch")
const d3 = new Date(0);
console.log(d3.toISOString()); // => 1970-01-01T00:00:00.000Z

/* ------------------------------------------------------------
   2) GETTER LOCALI: leggere le componenti
   ------------------------------------------------------------ */

const data = new Date('2026-06-30T14:45:09.250');

console.log(data.getFullYear());     // => 2026  (anno a 4 cifre)
console.log(data.getMonth());        // => 5     (0=gen ... 11=dic)
console.log(data.getDate());         // => 30    (giorno del mese 1-31)
console.log(data.getDay());          // => 2     (0=domenica ... 6=sabato; martedi=2)
console.log(data.getHours());        // => 14
console.log(data.getMinutes());      // => 45
console.log(data.getSeconds());      // => 9
console.log(data.getMilliseconds()); // => 250

// getTime(): timestamp in millisecondi (base per ogni calcolo)
console.log(typeof data.getTime()); // => number

// Date.now(): timestamp corrente senza creare un oggetto Date
console.log(typeof Date.now()); // => number

/* ------------------------------------------------------------
   3) getMonth e getDay sono numerici: convertirli in nomi
   ------------------------------------------------------------ */

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const GIORNI = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];

function descriviData(d) {
  return `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`;
}
console.log(descriviData(new Date('2026-06-30'))); // => Martedi 30 Giugno 2026

/* ------------------------------------------------------------
   4) SETTER: modificare una data
   ------------------------------------------------------------ */

const s = new Date('2026-01-15T10:00:00');
s.setFullYear(2027);
s.setMonth(11);   // dicembre
s.setDate(25);
s.setHours(18, 30, 0); // ore, minuti, secondi in un colpo solo
console.log(s.getFullYear(), s.getMonth(), s.getDate()); // => 2027 11 25

// I setter normalizzano gli overflow: utilissimo per aritmetica sulle date
const fine = new Date('2026-01-31');
fine.setDate(fine.getDate() + 1); // 31 gen + 1 giorno
console.log(fine.getMonth(), fine.getDate()); // => 1 1  (1 febbraio)

// Aggiungere mesi: anche il mese fa overflow correttamente
const m = new Date('2026-11-15');
m.setMonth(m.getMonth() + 2); // novembre + 2 = gennaio anno dopo
console.log(m.getFullYear(), m.getMonth()); // => 2027 0

/* ------------------------------------------------------------
   5) UTC vs LOCALE
   ------------------------------------------------------------ */

// I metodi getUTC* ignorano il fuso del sistema e leggono in UTC.
const t = new Date('2026-06-30T08:00:00Z'); // la "Z" indica UTC
console.log(t.getUTCHours());  // => 8   (sempre 8, indipendente dal fuso)
// console.log(t.getHours());  // dipende dal fuso del PC (in Italia estate => 10)

// Date.UTC(...): costruisce un timestamp interpretando le componenti come UTC
const tsUtc = Date.UTC(2026, 5, 30, 8, 0, 0);
console.log(new Date(tsUtc).toISOString()); // => 2026-06-30T08:00:00.000Z

// toISOString() restituisce SEMPRE UTC (suffisso Z)
console.log(new Date('2026-06-30T08:00:00Z').toISOString()); // => 2026-06-30T08:00:00.000Z

// getTimezoneOffset(): minuti di scarto tra locale e UTC (negativo a est di Greenwich)
console.log(typeof now.getTimezoneOffset()); // => number

/* ------------------------------------------------------------
   6) FORMATTAZIONE: zero-padding e parti standard
   ------------------------------------------------------------ */

// Padding manuale con padStart per ottenere HH:MM o YYYY-MM-DD
function formattaOra(d) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
console.log(formattaOra(new Date('2026-06-30T09:05:00'))); // => 09:05

// YYYY-MM-DD in UTC (utile come chiave/giorno di una timbratura)
function isoDay(d) {
  return d.toISOString().slice(0, 10);
}
console.log(isoDay(new Date('2026-06-30T23:59:00Z'))); // => 2026-06-30

// Intl.DateTimeFormat: formattazione localizzata e per fuso specifico
const fmtRoma = new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome',
  hour: '2-digit',
  minute: '2-digit',
});
console.log(typeof fmtRoma.format(new Date())); // => string

/* ------------------------------------------------------------
   7) DIFFERENZA TRA DATE: giorni, ore, minuti
   ------------------------------------------------------------ */

const MS_GIORNO = 1000 * 60 * 60 * 24;

// Differenza in giorni: si lavora sui timestamp (getTime)
function diffGiorni(a, b) {
  return Math.round((b.getTime() - a.getTime()) / MS_GIORNO);
}
console.log(diffGiorni(new Date('2026-06-01'), new Date('2026-06-30'))); // => 29

// Differenza in minuti tra due orari
function diffMinuti(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}
console.log(diffMinuti(new Date('2026-06-30T08:00'), new Date('2026-06-30T12:30'))); // => 270

// Per i giorni "di calendario" conviene azzerare l'orario (evita errori per DST)
function aMezzanotte(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
console.log(diffGiorni(aMezzanotte(new Date('2026-06-01T23:00')),
  aMezzanotte(new Date('2026-06-03T01:00')))); // => 2

/* ------------------------------------------------------------
   8) ESEMPI ERP: TIMBRATURE con pattern naive-UTC
   ------------------------------------------------------------ */

// Pattern reale: il server e' in UTC. Per salvare "l'ora di Roma" come se fosse
// UTC (naive-UTC) si legge l'ora locale di Roma e la si ricostruisce con Date.UTC.
function nowRomeNaiveUTC(istante = new Date()) {
  const parts = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(istante);
  const get = (tipo) => Number(parts.find((p) => p.type === tipo).value);
  return new Date(Date.UTC(
    get('year'), get('month') - 1, get('day'),
    get('hour'), get('minute'), get('second'),
  ));
}
// Lettura: usare i getter UTC perche' il valore e' stato salvato come naive-UTC
const timbratura = nowRomeNaiveUTC();
console.log(typeof timbratura.getUTCHours()); // => number

// Ore lavorate da una timbratura giornaliera (ingresso/uscita)
function oreLavorate(ingresso, uscita, pausaMin = 0) {
  const minuti = (uscita.getTime() - ingresso.getTime()) / 60000 - pausaMin;
  return Math.round((minuti / 60) * 100) / 100; // 2 decimali
}
const ingresso = new Date('2026-06-30T08:00:00Z');
const uscita = new Date('2026-06-30T17:00:00Z');
console.log(oreLavorate(ingresso, uscita, 60)); // => 8  (9h meno 1h di pausa)

// Sommare i minuti lavorati di piu' dipendenti (filter + reduce sui timestamp)
const richieste = [
  { badge: 'UP-001', ingresso: '2026-06-30T08:00:00Z', uscita: '2026-06-30T12:00:00Z', approvata: true },
  { badge: 'UP-002', ingresso: '2026-06-30T08:30:00Z', uscita: '2026-06-30T13:00:00Z', approvata: false },
  { badge: 'UP-003', ingresso: '2026-06-30T09:00:00Z', uscita: '2026-06-30T17:00:00Z', approvata: true },
];
const minutiTotali = richieste
  .filter((r) => r.approvata)
  .reduce((s, r) => s + (new Date(r.uscita) - new Date(r.ingresso)) / 60000, 0);
console.log(minutiTotali); // => 720  (4h + 8h)

/* ------------------------------------------------------------
   9) ESEMPI ERP: turni, scadenze, anzianita'
   ------------------------------------------------------------ */

// Validare che un orario di turno sia HH:MM e calcolarne la durata
function durataTurno(inizio, fine) {
  const oggi = '2026-01-01T';
  return diffMinuti(new Date(oggi + inizio), new Date(oggi + fine));
}
console.log(durataTurno('06:00', '14:00')); // => 480  (turno P4 da 8 ore)

// Giorni alla scadenza scorta DPI (es. controllo periodico vestiario)
function giorniAllaScadenza(dataScadenza, oggi = new Date()) {
  return diffGiorni(aMezzanotte(oggi), aMezzanotte(new Date(dataScadenza)));
}
console.log(giorniAllaScadenza('2026-07-30', new Date('2026-06-30'))); // => 30

// Anzianita' di un dipendente in anni interi compiuti
function anniServizio(dataAssunzione, oggi = new Date()) {
  const a = new Date(dataAssunzione);
  let anni = oggi.getFullYear() - a.getFullYear();
  const primaDelCompleanno =
    oggi.getMonth() < a.getMonth() ||
    (oggi.getMonth() === a.getMonth() && oggi.getDate() < a.getDate());
  if (primaDelCompleanno) anni -= 1;
  return anni;
}
console.log(anniServizio('2020-09-01', new Date('2026-06-30'))); // => 5

// E' un giorno feriale lavorativo? (esclude sabato e domenica)
function isLavorativo(d) {
  const g = d.getDay();
  return g !== 0 && g !== 6;
}
console.log(isLavorativo(new Date('2026-06-30'))); // => true   (martedi)
console.log(isLavorativo(new Date('2026-07-04'))); // => false  (sabato)

/* ------------------------------------------------------------
   10) UTILITY VARIE
   ------------------------------------------------------------ */

// Inizio e fine del mese corrente
function rangeMese(d) {
  const primo = new Date(d.getFullYear(), d.getMonth(), 1);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0); // giorno 0 = ultimo del mese prec.
  return { primo, ultimo };
}
const r = rangeMese(new Date('2026-02-10'));
console.log(r.ultimo.getDate()); // => 28  (febbraio 2026 non bisestile)

// Quanti giorni ha un mese
function giorniNelMese(anno, mese0) {
  return new Date(anno, mese0 + 1, 0).getDate();
}
console.log(giorniNelMese(2024, 1)); // => 29  (febbraio 2024 bisestile)

// Aggiungere N giorni senza mutare l'originale
function aggiungiGiorni(d, n) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
console.log(isoDay(aggiungiGiorni(new Date('2026-06-30T00:00Z'), 5))); // => 2026-07-05

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   new Date(), new Date(iso), new Date(ts), new Date(y,m,d,...)
   Date.now()                  -> timestamp corrente (ms)
   Date.UTC(y,m,d,...)         -> timestamp interpretato come UTC

   GETTER LOCALI:
     getFullYear() getMonth() getDate() getDay()
     getHours() getMinutes() getSeconds() getMilliseconds()
     getTime() getTimezoneOffset()
   GETTER UTC:
     getUTCFullYear() getUTCMonth() getUTCDate() getUTCDay()
     getUTCHours() getUTCMinutes() getUTCSeconds()

   SETTER:
     setFullYear() setMonth() setDate()
     setHours() setMinutes() setSeconds()  (normalizzano gli overflow)

   FORMATTAZIONE:
     toISOString()  -> sempre UTC, suffisso Z
     toISOString().slice(0,10) -> YYYY-MM-DD
     String(n).padStart(2,'0') -> zero-padding HH:MM
     Intl.DateTimeFormat(locale,{timeZone,...}).format/formatToParts

   CALCOLI:
     getTime() per differenze; MS_GIORNO = 1000*60*60*24
     setHours(0,0,0,0) per azzerare l'orario (giorni di calendario)
   ============================================================ */
