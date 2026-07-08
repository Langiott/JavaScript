/* ============================================================
   45 JS Dates
   L'oggetto Date rappresenta un istante temporale in JavaScript.
   Internamente un Date e' un numero: i millisecondi trascorsi
   dal 1 gennaio 1970 UTC (epoch / Unix timestamp). In questo file
   vediamo come creare Date (vari costruttori), leggere il timestamp,
   usare Date.now(), fare il parsing di stringhe e gestire il fuso
   orario (locale vs UTC), con esempi ispirati a un gestionale ERP.
   ============================================================ */

// ------------------------------------------------------------
// 1) CREAZIONE BASE: new Date() senza argomenti = adesso
// ------------------------------------------------------------

// Crea un Date con l'istante corrente (momento dell'esecuzione)
const adesso = new Date();
console.log(adesso instanceof Date); // => true

// typeof di un Date e' 'object', non 'date'
console.log(typeof adesso); // => object

// ------------------------------------------------------------
// 2) COSTRUTTORE CON TIMESTAMP (millisecondi da epoch)
// ------------------------------------------------------------

// 0 ms = epoch: 1 gennaio 1970 00:00:00 UTC
const epoch = new Date(0);
console.log(epoch.toISOString()); // => 1970-01-01T00:00:00.000Z

// Un timestamp positivo in millisecondi
const t = new Date(1_700_000_000_000);
console.log(t.toISOString()); // => 2023-11-14T22:13:20.000Z

// ------------------------------------------------------------
// 3) COSTRUTTORE CON STRINGA (parsing)
// ------------------------------------------------------------

// Formato ISO 8601: il piu' affidabile e portabile
const iso = new Date("2026-06-30T08:30:00Z"); // Z = UTC
console.log(iso.toISOString()); // => 2026-06-30T08:30:00.000Z

// Solo data ISO: interpretata come UTC mezzanotte
const soloData = new Date("2026-06-30");
console.log(soloData.toISOString()); // => 2026-06-30T00:00:00.000Z

// ATTENZIONE: formati non-ISO ("06/30/2026") sono dipendenti
// dall'implementazione/locale: meglio evitarli.

// ------------------------------------------------------------
// 4) COSTRUTTORE CON COMPONENTI (anno, mese, giorno, ...)
// ------------------------------------------------------------

// I mesi partono da 0: gennaio = 0, dicembre = 11
// Questi argomenti sono interpretati nel fuso LOCALE del sistema
const compleanno = new Date(1990, 0, 15); // 15 gennaio 1990 (local)
console.log(compleanno.getFullYear()); // => 1990
console.log(compleanno.getMonth());    // => 0  (gennaio!)
console.log(compleanno.getDate());     // => 15

// Forma completa: anno, mese, giorno, ore, minuti, secondi, ms
const preciso = new Date(2026, 5, 30, 8, 30, 15, 500); // 30 giu 2026
console.log(preciso.getHours());   // => 8 (local)
console.log(preciso.getMinutes()); // => 30

// ------------------------------------------------------------
// 5) Date.now() — timestamp corrente in ms, SENZA creare oggetti
// ------------------------------------------------------------

// Date.now() e' un metodo statico: restituisce un Number
const ms = Date.now();
console.log(typeof ms); // => number

// Utile per misurare durate (benchmark grezzo)
const inizio = Date.now();
for (let i = 0; i < 1e6; i++) { /* lavoro */ }
const durataMs = Date.now() - inizio;
console.log(`Durata: ${durataMs} ms`);

// ------------------------------------------------------------
// 6) Date.UTC() — costruisce un timestamp interpretando UTC
// ------------------------------------------------------------

// Date.UTC ritorna un NUMBER (ms), non un Date.
// I componenti sono interpretati come UTC, non locale.
const tsUtc = Date.UTC(2026, 5, 30, 8, 30, 0); // mese 5 = giugno
console.log(new Date(tsUtc).toISOString()); // => 2026-06-30T08:30:00.000Z

// ------------------------------------------------------------
// 7) Date.parse() — parsing che ritorna un timestamp (number)
// ------------------------------------------------------------

// Equivale a new Date(str).getTime() ma ritorna direttamente ms
const parsed = Date.parse("2026-06-30T08:30:00Z");
console.log(parsed); // => 1782808200000

// Stringa non valida => NaN (non lancia errore!)
const invalido = Date.parse("non-una-data");
console.log(Number.isNaN(invalido)); // => true

// ------------------------------------------------------------
// 8) LEGGERE IL TIMESTAMP da un oggetto Date
// ------------------------------------------------------------

const d = new Date("2026-06-30T08:30:00Z");
console.log(d.getTime());   // => 1782808200000 (ms da epoch)
console.log(d.valueOf());   // => 1782808200000 (uguale a getTime)
console.log(+d);            // => 1782808200000 (coercion numerica)

// Differenza tra due Date = differenza di timestamp in ms
const a1 = new Date("2026-06-30T08:00:00Z");
const a2 = new Date("2026-06-30T09:30:00Z");
const diffMin = (a2 - a1) / 60000;
console.log(diffMin); // => 90

// ------------------------------------------------------------
// 9) VALIDARE UN DATE — gestire date "Invalid Date"
// ------------------------------------------------------------

// Un Date invalido non lancia: ha getTime() === NaN
const cattivo = new Date("xyz");
console.log(cattivo.toString()); // => Invalid Date
console.log(Number.isNaN(cattivo.getTime())); // => true

// Helper riusabile per validare
const isDateValida = (val) => val instanceof Date && !Number.isNaN(val.getTime());
console.log(isDateValida(new Date("2026-06-30"))); // => true
console.log(isDateValida(new Date("boh")));        // => false

// ------------------------------------------------------------
// 10) GETTER LOCALI vs GETTER UTC
// ------------------------------------------------------------

const x = new Date("2026-06-30T08:30:00Z");
// I getUTC* leggono i componenti in UTC (stabili ovunque)
console.log(x.getUTCFullYear()); // => 2026
console.log(x.getUTCMonth());    // => 5  (giugno)
console.log(x.getUTCDate());     // => 30
console.log(x.getUTCHours());    // => 8
console.log(x.getUTCMinutes());  // => 30
console.log(x.getUTCDay());      // => 2  (0=domenica, 2=martedi')

// I get* (senza UTC) dipendono dal fuso del sistema:
// es. server UTC => coincidono; PC in Italia (estate +2) => +2 ore.

// ------------------------------------------------------------
// 11) FORMATTAZIONE rapida (ISO e slice)
// ------------------------------------------------------------

const ora = new Date("2026-06-30T08:05:09Z");
// toISOString() => sempre UTC con suffisso Z
console.log(ora.toISOString());          // => 2026-06-30T08:05:09.000Z
// Estrarre solo YYYY-MM-DD
console.log(ora.toISOString().slice(0, 10)); // => 2026-06-30
// Estrarre solo HH:MM
console.log(ora.toISOString().slice(11, 16)); // => 08:05

// ------------------------------------------------------------
// 12) PATTERN ERP: timbratura "naive-UTC"
//     Il server gira in UTC. Per registrare l'ora di Roma in modo
//     stabile, si legge l'ora locale di Roma e la si salva con
//     Date.UTC(...), evitando new Date() che dipende dal TZ server.
// ------------------------------------------------------------

// Ritorna un Date i cui componenti UTC corrispondono all'ora di Roma "adesso".
function nowRomeNaiveUTC() {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  // formatToParts -> array di { type, value }; usiamo find() per estrarre
  const get = (tipo) => Number(parts.find((p) => p.type === tipo).value);
  const ts = Date.UTC(get("year"), get("month") - 1, get("day"),
                      get("hour"), get("minute"), get("second"));
  return new Date(ts);
}

const timbratura = nowRomeNaiveUTC();
// In lettura uso SEMPRE i getUTC* per ricostruire l'ora di Roma salvata
const hh = String(timbratura.getUTCHours()).padStart(2, "0");
const mm = String(timbratura.getUTCMinutes()).padStart(2, "0");
console.log(`Ingresso registrato: ${hh}:${mm}`); // es. => 10:30

// ------------------------------------------------------------
// 13) PATTERN ERP: calcolo ore lavorate da timbrature
// ------------------------------------------------------------

// Date di una giornata (formato ISO, semplici da confrontare)
const ingresso = new Date("2026-06-30T08:00:00Z");
const uscitaPranzo = new Date("2026-06-30T12:30:00Z");
const rientroPranzo = new Date("2026-06-30T13:30:00Z");
const uscita = new Date("2026-06-30T17:00:00Z");

const minutiTra = (da, a) => Math.round((a - da) / 60000);
const oreLavorate = (minutiTra(ingresso, uscitaPranzo)
                   + minutiTra(rientroPranzo, uscita)) / 60;
console.log(`Ore lavorate: ${oreLavorate}`); // => 8

// ------------------------------------------------------------
// 14) PATTERN ERP: somma minuti di piu' richieste (filter+reduce)
// ------------------------------------------------------------

const richieste = [
  { tipo: "permesso", minuti: 60, approvata: true },
  { tipo: "ferie",    minuti: 480, approvata: true },
  { tipo: "permesso", minuti: 30, approvata: false },
];
const totaleApprovato = richieste
  .filter((r) => r.approvata)
  .reduce((somma, r) => somma + r.minuti, 0);
console.log(totaleApprovato); // => 540

// ------------------------------------------------------------
// 15) ARITMETICA SULLE DATE: i setter normalizzano gli overflow
// ------------------------------------------------------------

// Aggiungere giorni: setDate gestisce il passaggio di mese
const base = new Date("2026-06-30T00:00:00Z");
const piu5 = new Date(base);
piu5.setUTCDate(piu5.getUTCDate() + 5); // 30 + 5 = 35 -> 5 luglio
console.log(piu5.toISOString().slice(0, 10)); // => 2026-07-05

// Aggiungere giorni via timestamp (immutabile, molto comune)
const UN_GIORNO = 24 * 60 * 60 * 1000;
const domani = new Date(Date.now() + UN_GIORNO);
console.log(domani instanceof Date); // => true

// Inizio e fine giornata (utile per query "where data tra X e Y")
function rangeGiornata(isoDate) {
  const inizio = new Date(`${isoDate}T00:00:00.000Z`);
  const fine = new Date(`${isoDate}T23:59:59.999Z`);
  return { inizio, fine };
}
const { inizio: g0, fine: g1 } = rangeGiornata("2026-06-30");
console.log(g0.toISOString(), "->", g1.toISOString());

// ------------------------------------------------------------
// 16) CONFRONTARE DATE
// ------------------------------------------------------------

const dA = new Date("2026-06-30T08:00:00Z");
const dB = new Date("2026-06-30T09:00:00Z");
console.log(dA < dB);  // => true  (confronto via valueOf/timestamp)
console.log(dA > dB);  // => false
// ATTENZIONE: == tra due Date confronta i riferimenti, non l'istante!
console.log(new Date(0) == new Date(0)); // => false
console.log(new Date(0).getTime() === new Date(0).getTime()); // => true

// ------------------------------------------------------------
// 17) FORMATTAZIONE LOCALIZZATA con Intl/toLocaleString
// ------------------------------------------------------------

const ev = new Date("2026-06-30T08:30:00Z");
// Formattazione esplicita nel fuso di Roma (output leggibile)
const fmt = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  dateStyle: "short",
  timeStyle: "short",
});
console.log(fmt.format(ev)); // es. => 30/06/26, 10:30

// toLocaleDateString / toLocaleTimeString: scorciatoie
console.log(ev.toLocaleDateString("it-IT", { timeZone: "Europe/Rome" }));

// ------------------------------------------------------------
// 18) PATTERN ERP: estrarre HH:MM da una stringa orario con regex
// ------------------------------------------------------------

const orario = "08:30";
console.log(/^\d{2}:\d{2}$/.test(orario)); // => true (formato valido)

// Costruire un Date di oggi a una certa ora HH:MM (in UTC naive)
function oggiAllOra(hhmm, isoData = new Date().toISOString().slice(0, 10)) {
  return new Date(`${isoData}T${hhmm}:00.000Z`);
}
console.log(oggiAllOra("08:30", "2026-06-30").toISOString());
// => 2026-06-30T08:30:00.000Z

// ------------------------------------------------------------
// 19) ALTRI METODI DI OUTPUT
// ------------------------------------------------------------

const o = new Date("2026-06-30T08:30:00Z");
console.log(o.toDateString());  // es. => Tue Jun 30 2026 (parte data, local)
console.log(o.toJSON());        // => 2026-06-30T08:30:00.000Z (usato da JSON.stringify)
console.log(JSON.stringify({ quando: o })); // => {"quando":"2026-06-30T08:30:00.000Z"}

/* ============================================================
   RIEPILOGO COMANDI
   - new Date()                         // istante corrente
   - new Date(ms)                       // da timestamp
   - new Date("ISO 8601")               // parsing stringa
   - new Date(anno, mese0, gg, ...)     // da componenti (locale)
   - Date.now()                         // timestamp corrente (number)
   - Date.UTC(anno, mese0, ...)         // timestamp da componenti UTC
   - Date.parse("...")                  // parsing -> timestamp (number)
   - .getTime() / .valueOf() / +date    // timestamp in ms
   - .getFullYear/.getMonth/.getDate/.getHours/.getMinutes/.getDay
   - .getUTCFullYear/.getUTCMonth/.getUTCDate/.getUTCHours/.getUTCMinutes/.getUTCDay
   - .setUTCDate(...) / .setDate(...)   // mutano e normalizzano overflow
   - .toISOString()                     // stringa UTC con Z
   - .toJSON() / .toDateString() / .toLocaleString()
   - Intl.DateTimeFormat(...).format / .formatToParts
   - validazione: Number.isNaN(date.getTime())
   - confronto: date1 < date2 (mai == tra oggetti Date)
   ============================================================ */
