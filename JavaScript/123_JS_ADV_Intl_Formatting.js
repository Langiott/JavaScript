/* ============================================================
   123 JS ADV Intl Formatting
   L'oggetto Intl: formattazione internazionale nativa (niente
   librerie tipo moment/date-fns). Caso reale: un gestionale
   italiano deve mostrare euro (1.234,56 €), date in italiano
   (7 luglio 2026), percentuali, e ordinare nomi con gli accenti
   nel modo corretto. Intl fa tutto questo in modo standard.
   Eseguibile con: node 123_JS_ADV_Intl_Formatting.js
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. Intl.NumberFormat: NUMERI, VALUTE, PERCENTUALI
   ------------------------------------------------------------
   Attenzione: in italiano il separatore delle migliaia e' il PUNTO
   e i decimali la VIRGOLA -> l'opposto dell'inglese. Intl lo sa. */

const euro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
});
console.log(euro.format(1234.5));   // => 1.234,50 €
console.log(euro.format(99));       // => 99,00 €
console.log(euro.format(-50.9));    // => -50,90 €

// Confronto con formato USA: stessi dati, resa diversa.
const dollaro = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log(dollaro.format(1234.5)); // => $1,234.50

// Numero semplice con separatore migliaia italiano.
const numeroIt = new Intl.NumberFormat('it-IT');
console.log(numeroIt.format(1000000)); // => 1.000.000

// Percentuale: passa la FRAZIONE (0.75), non 75.
const percento = new Intl.NumberFormat('it-IT', { style: 'percent', maximumFractionDigits: 1 });
console.log(percento.format(0.753)); // => 75,3%

// Unita' di misura (utile per report: ore, kg, km...).
const ore = new Intl.NumberFormat('it-IT', { style: 'unit', unit: 'hour', unitDisplay: 'long' });
console.log(ore.format(8.5)); // => 8,5 ore

/* ------------------------------------------------------------
   2. Intl.DateTimeFormat: DATE E ORARI LOCALIZZATI
   ------------------------------------------------------------
   Usiamo una data FISSA per output riproducibile (niente "oggi"). */

const data = new Date('2026-07-07T14:30:00');

// Data lunga in italiano.
const dataLunga = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
console.log(dataLunga.format(data)); // => martedì 7 luglio 2026

// Solo ora e minuti (formato 24h, tipico in Italia).
const soloOra = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });
console.log(soloOra.format(data)); // => 14:30

// Formato numerico compatto gg/mm/aaaa.
const dataCorta = new Intl.DateTimeFormat('it-IT', { dateStyle: 'short' });
console.log(dataCorta.format(data)); // => 07/07/26

/* ------------------------------------------------------------
   3. Intl.RelativeTimeFormat: "3 giorni fa", "tra 2 ore"
   ------------------------------------------------------------
   Perfetto per feed/notifiche del gestionale. */

const relativo = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });
console.log(relativo.format(-1, 'day'));   // => ieri
console.log(relativo.format(-3, 'day'));   // => 3 giorni fa
console.log(relativo.format(2, 'hour'));   // => tra 2 ore
console.log(relativo.format(0, 'day'));    // => oggi

/* ------------------------------------------------------------
   4. Intl.Collator: ORDINARE TESTO come farebbe un umano
   ------------------------------------------------------------
   L'ordinamento predefinito degli array e' per codice Unicode:
   sbaglia con accenti e maiuscole. Collator ordina "all'italiana". */

const cognomi = ['Öztürk', 'Rossi', 'àbate', 'Zeta', 'Àbate', 'della Valle'];

// Ordinamento ingenuo (SBAGLIATO per un umano): maiuscole e accenti finiscono fuori posto.
console.log('Ingenuo:', [...cognomi].sort());

// Ordinamento localizzato: 'base' ignora maiuscole/accenti nel confronto.
const collator = new Intl.Collator('it-IT', { sensitivity: 'base' });
console.log('Corretto:', [...cognomi].sort(collator.compare));
// => [ 'àbate', 'Àbate', 'della Valle', 'Öztürk', 'Rossi', 'Zeta' ]

/* ------------------------------------------------------------
   5. Intl.ListFormat: unire elenchi in modo naturale
   ------------------------------------------------------------ */

const listaE = new Intl.ListFormat('it-IT', { style: 'long', type: 'conjunction' });
console.log(listaE.format(['Mario', 'Anna', 'Luca'])); // => Mario, Anna e Luca

const listaO = new Intl.ListFormat('it-IT', { style: 'long', type: 'disjunction' });
console.log(listaO.format(['PR', 'AM', 'QU'])); // => PR, AM o QU

/* ------------------------------------------------------------
   6. RIUSO: crea il formatter UNA volta, usalo tante
   ------------------------------------------------------------
   Costruire un Intl.* ha un costo. In un report con 10.000 righe,
   crea il formatter fuori dal ciclo e riusalo (grande differenza). */

const righeReport = [
  { badge: 'UP-001', importo: 1520.4 },
  { badge: 'UP-002', importo: 980 },
  { badge: 'UP-003', importo: 2340.75 },
];

// formatter creato UNA sola volta, riusato nel map.
const fmtEuro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const reportFormattato = righeReport.map((r) => `${r.badge}: ${fmtEuro.format(r.importo)}`);
console.log('\nReport:');
reportFormattato.forEach((r) => console.log('  ' + r));
/* =>
   UP-001: 1.520,40 €
   UP-002: 980,00 €
   UP-003: 2.340,75 € */

console.log('\n--- fine demo Intl ---');

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - Intl e' NATIVO: niente librerie per valute/date/ordinamenti.
   - NumberFormat: valute (€), percentuali (passa la frazione), unita'.
   - DateTimeFormat: date/orari localizzati (it-IT usa 24h e gg/mm/aaaa).
   - RelativeTimeFormat: "ieri", "tra 2 ore" per notifiche.
   - Collator: ordinare testo con accenti/maiuscole come un umano.
   - ListFormat: "Mario, Anna e Luca".
   - Crea il formatter UNA volta e riusalo: conta nei report grandi.
   ============================================================ */
