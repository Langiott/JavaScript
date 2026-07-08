/* ============================================================
   47 JS Date Formatting
   La formattazione delle date in JavaScript consiste nel
   trasformare un oggetto Date in una stringa leggibile o in un
   formato standard (ISO 8601). I metodi principali sono
   toISOString (UTC standard), toLocaleDateString/toLocaleTimeString
   (formato localizzato) e Intl.DateTimeFormat (controllo fine su
   locale e timeZone). Vedremo anche il pattern "naive-UTC" usato
   nei gestionali per salvare l'ora locale senza il fuso orario.
   ============================================================ */

// ------------------------------------------------------------
// 1. Punto di partenza: l'oggetto Date
// ------------------------------------------------------------

// Creiamo una data fissa (UTC) per esempi riproducibili.
const d = new Date('2026-06-30T14:05:09.250Z');
console.log(d instanceof Date); // => true

// La rappresentazione di default dipende dal fuso del sistema.
console.log(typeof d.toString()); // => "string"


// ------------------------------------------------------------
// 2. toISOString: standard ISO 8601 in UTC
// ------------------------------------------------------------

// Sempre UTC, sempre lo stesso formato: YYYY-MM-DDTHH:mm:ss.sssZ
console.log(d.toISOString()); // => "2026-06-30T14:05:09.250Z"

// Estrarre solo la parte data (YYYY-MM-DD) con slice.
console.log(d.toISOString().slice(0, 10)); // => "2026-06-30"

// Estrarre solo l'orario (HH:MM:SS) in UTC.
console.log(d.toISOString().slice(11, 19)); // => "14:05:09"

// toJSON() restituisce la stessa stringa: usato da JSON.stringify.
console.log(d.toJSON()); // => "2026-06-30T14:05:09.250Z"
console.log(JSON.stringify({ creata: d })); // => {"creata":"2026-06-30T14:05:09.250Z"}


// ------------------------------------------------------------
// 3. I metodi "to...String" classici
// ------------------------------------------------------------

// toDateString / toTimeString: formato fisso in inglese (ora locale).
const sample = new Date(2026, 5, 30, 9, 30, 0); // 30 giugno 2026 09:30 locale
console.log(sample.toDateString()); // => "Tue Jun 30 2026"
console.log(typeof sample.toTimeString()); // => "string"

// toUTCString: formato RFC, sempre in UTC.
console.log(d.toUTCString()); // => "Tue, 30 Jun 2026 14:05:09 GMT"


// ------------------------------------------------------------
// 4. toLocaleDateString / toLocaleTimeString
// ------------------------------------------------------------

// Formato localizzato: con locale 'it-IT' usa giorno/mese/anno.
console.log(d.toLocaleDateString('it-IT', { timeZone: 'UTC' }));
// => "30/06/2026"

// Locale americano: mese/giorno/anno.
console.log(d.toLocaleDateString('en-US', { timeZone: 'UTC' }));
// => "6/30/2026"

// Solo orario, formato italiano 24h.
console.log(d.toLocaleTimeString('it-IT', { timeZone: 'UTC' }));
// => "14:05:09"

// toLocaleString combina data + ora.
console.log(d.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
// => "30/06/2026, 16:05:09"  (Roma in estate = UTC+2)


// ------------------------------------------------------------
// 5. Opzioni di formattazione (options object)
// ------------------------------------------------------------

// weekday/year/month/day con stili: 'long', 'short', 'narrow', 'numeric', '2-digit'.
console.log(d.toLocaleDateString('it-IT', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  timeZone: 'UTC',
})); // => "martedì 30 giugno 2026"

// Stile compatto con due cifre.
console.log(d.toLocaleDateString('it-IT', {
  day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC',
})); // => "30/06/26"

// Orario con secondi e formato 12h.
console.log(d.toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: true, timeZone: 'UTC',
})); // => "02:05:09 PM"


// ------------------------------------------------------------
// 6. Intl.DateTimeFormat: il formatter riutilizzabile
// ------------------------------------------------------------

// Si crea una volta e si riusa: piu efficiente in loop.
const fmtRoma = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Rome',
});
console.log(fmtRoma.format(d));
// => "martedì 30 giugno 2026 alle ore 16:05"

// dateStyle/timeStyle: scorciatoie ('full','long','medium','short').
const fmtBreve = new Intl.DateTimeFormat('it-IT', { dateStyle: 'short' });
console.log(fmtBreve.format(d)); // => "30/06/26"

// formatRange: intervallo tra due date (utile per periodi/turni).
const inizio = new Date('2026-06-01T00:00:00Z');
const fine = new Date('2026-06-30T00:00:00Z');
const fmtRange = new Intl.DateTimeFormat('it-IT', { month: 'long', day: 'numeric', timeZone: 'UTC' });
console.log(fmtRange.formatRange(inizio, fine)); // => "1–30 giugno"


// ------------------------------------------------------------
// 7. formatToParts: leggere i singoli pezzi
// ------------------------------------------------------------

// Restituisce un array di { type, value }: utile per ricomporre formati custom.
const parts = new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  timeZone: 'Europe/Rome', hour12: false,
}).formatToParts(d);
console.log(parts.map(p => `${p.type}:${p.value}`).join(' '));
// => "hour:16 literal:: minute:05 literal:: second:09"

// find() su parts per estrarre un valore specifico (pattern ERP).
const oraRoma = parts.find(p => p.type === 'hour').value;
console.log(oraRoma); // => "16"


// ------------------------------------------------------------
// 8. Timezone: capire UTC vs locale
// ------------------------------------------------------------

// getTimezoneOffset(): minuti di differenza tra locale e UTC (negativo a est).
const off = new Date().getTimezoneOffset();
console.log(typeof off); // => "number"

// Stessa istante, fusi diversi: cambia solo la rappresentazione.
const istante = new Date('2026-12-25T12:00:00Z'); // inverno => Roma UTC+1
console.log(istante.toLocaleTimeString('it-IT', { timeZone: 'UTC' }));        // => "12:00:00"
console.log(istante.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' })); // => "13:00:00"
console.log(istante.toLocaleTimeString('it-IT', { timeZone: 'America/New_York' })); // => "07:00:00"


// ------------------------------------------------------------
// 9. Helper: formattare con padStart
// ------------------------------------------------------------

// Pattern manuale HH:MM con padStart per garantire due cifre.
function hhmm(date, timeZone = 'Europe/Rome') {
  const p = new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone,
  }).formatToParts(date);
  const h = p.find(x => x.type === 'hour').value;
  const m = p.find(x => x.type === 'minute').value;
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}
console.log(hhmm(d)); // => "16:05"

// YYYY-MM-DD da componenti UTC, sempre con padStart.
function isoDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const g = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${g}`;
}
console.log(isoDate(d)); // => "2026-06-30"


// ------------------------------------------------------------
// 10. Il pattern "naive-UTC" (gestionale ERP timbrature)
// ------------------------------------------------------------

// Problema: il server gira in UTC, ma il timbratore registra l'ora
// di Roma. Vogliamo SALVARE l'ora locale di Roma "as is", senza fuso,
// cosi getUTCHours() rilegge esattamente l'ora mostrata al dipendente.

// 10a. Leggiamo l'ora di Roma con Intl e la ricostruiamo come Date.UTC.
function nowRomeNaiveUTC(base = new Date()) {
  const p = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(base);
  const get = t => Number(p.find(x => x.type === t).value);
  // Mettiamo i componenti di Roma dentro un timestamp UTC: "naive".
  return new Date(Date.UTC(
    get('year'), get('month') - 1, get('day'),
    get('hour'), get('minute'), get('second'),
  ));
}

// In estate Roma e' UTC+2: 14:05 UTC reali = 16:05 a Roma.
const timbratura = nowRomeNaiveUTC(new Date('2026-06-30T14:05:09Z'));
// Salvata come naive-UTC: rileggendo in UTC ottengo l'ora di Roma.
console.log(timbratura.toISOString()); // => "2026-06-30T16:05:09.000Z"
console.log(timbratura.getUTCHours());  // => 16

// 10b. Rilettura per il badge: l'ora va mostrata SEMPRE in UTC,
// altrimenti il fuso del client la sposterebbe di nuovo.
function oraTimbratura(naive) {
  const h = String(naive.getUTCHours()).padStart(2, '0');
  const m = String(naive.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
console.log(oraTimbratura(timbratura)); // => "16:05"


// ------------------------------------------------------------
// 11. Esempi pratici ERP: report e dipendenti
// ------------------------------------------------------------

// Dataset di timbrature (orari gia' in naive-UTC).
const timbrature = [
  { badge: 'UP-001', nome: 'Marco', ingresso: new Date('2026-06-30T08:02:00Z'), uscita: new Date('2026-06-30T17:01:00Z') },
  { badge: 'UP-002', nome: 'Luisa', ingresso: new Date('2026-06-30T08:55:00Z'), uscita: new Date('2026-06-30T18:10:00Z') },
];

// map() per produrre un DTO formattato leggibile (template literals).
const report = timbrature.map(t => ({
  badge: t.badge,
  giorno: t.ingresso.toISOString().slice(0, 10),
  fascia: `${oraTimbratura(t.ingresso)} - ${oraTimbratura(t.uscita)}`,
}));
console.log(report[0]); // => { badge: 'UP-001', giorno: '2026-06-30', fascia: '08:02 - 17:01' }

// Etichetta "umana" per un report mensile con Intl (locale it-IT).
function etichettaMese(date) {
  return new Intl.DateTimeFormat('it-IT', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(date);
}
console.log(etichettaMese(d)); // => "giugno 2026"

// Ore lavorate: differenza tra Date in ms -> ore con una cifra decimale.
function oreLavorate(ing, usc) {
  const ms = usc.getTime() - ing.getTime();
  return Math.round((ms / 3_600_000) * 10) / 10;
}
console.log(oreLavorate(timbrature[0].ingresso, timbrature[0].uscita)); // => 8.98


// ------------------------------------------------------------
// 12. Validazione e parsing sicuro
// ------------------------------------------------------------

// Date non valida -> "Invalid Date": controllare con isNaN.
const brutta = new Date('non-una-data');
console.log(Number.isNaN(brutta.getTime())); // => true

// Regex per validare un orario HH:MM prima di costruire la Date.
const orarioOk = /^\d{2}:\d{2}$/.test('08:30');
console.log(orarioOk); // => true

// Parsing affidabile: solo stringhe ISO complete sono garantite cross-engine.
console.log(new Date('2026-06-30').toISOString().slice(0, 10)); // => "2026-06-30"


// ------------------------------------------------------------
// 13. Esempio browser (DOM)
// ------------------------------------------------------------

// Esempio browser: gira nel browser, non in Node.
function mostraOrologio() {
  // const el = document.getElementById('orologio');
  // el.textContent = new Intl.DateTimeFormat('it-IT', {
  //   timeStyle: 'medium', timeZone: 'Europe/Rome',
  // }).format(new Date());
  // setInterval(mostraOrologio, 1000); // aggiorna ogni secondo
}
console.log(typeof mostraOrologio); // => "function"


/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - new Date(iso)               crea una Date da stringa ISO
   - date.toISOString()          stringa UTC ISO 8601
   - date.toJSON()               come toISOString (usato da JSON.stringify)
   - date.toDateString()         data fissa in inglese (locale)
   - date.toUTCString()          formato RFC in UTC
   - date.toLocaleDateString(loc, opts)   data localizzata
   - date.toLocaleTimeString(loc, opts)   ora localizzata
   - date.toLocaleString(loc, opts)       data + ora localizzata
   - opzioni: weekday/year/month/day/hour/minute/second, hour12, timeZone
   - dateStyle / timeStyle       scorciatoie ('full'..'short')
   - new Intl.DateTimeFormat(loc, opts)   formatter riutilizzabile
   - fmt.format(date)            applica il formatter
   - fmt.formatRange(a, b)       intervallo tra due date
   - fmt.formatToParts(date)     array di { type, value }
   - parts.find(p => p.type==='hour')   estrarre un pezzo
   - date.getTimezoneOffset()    offset locale-UTC in minuti
   - date.getUTCHours()/getUTCMinutes()/getUTCFullYear()  componenti UTC
   - Date.UTC(y,m,d,h,mi,s)      timestamp UTC (pattern naive-UTC)
   - String(n).padStart(2,'0')   HH:MM a due cifre
   - .slice(0,10)                YYYY-MM-DD da toISOString
   - Number.isNaN(date.getTime())   verifica Invalid Date
   ============================================================ */
