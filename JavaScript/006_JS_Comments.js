/* ============================================================
   6 JS Comments
   I commenti sono porzioni di testo ignorate dal motore JavaScript:
   servono SOLO a chi legge il codice (te stesso o altri sviluppatori).
   Esistono commenti single-line (//), multi-line (/* ... *\/) e i
   commenti di documentazione JSDoc (/** ... *\/) che descrivono funzioni,
   parametri e valori di ritorno. Un buon commento spiega il PERCHE',
   non il COSA gia' evidente dal codice. In questo file vediamo sintassi,
   buone pratiche, anti-pattern e esempi ispirati a un gestionale ERP.
   ============================================================ */

'use strict';

// ============================================================
// 1) COMMENTO SINGLE-LINE (//)
// ============================================================

// Questo e' un commento su una riga: tutto cio' che segue // viene ignorato.
const ivaStandard = 0.22; // commento a fine riga (inline), spiega il valore
console.log(ivaStandard); // => 0.22

// Puoi disattivare temporaneamente una riga di codice ("commentare via").
// console.log("questa riga NON viene eseguita");

// Piu' righe consecutive di commento single-line:
// Calcoliamo il prezzo IVA inclusa.
// La base imponibile arriva dal gestionale.
const imponibile = 100;
const prezzoIvato = imponibile * (1 + ivaStandard);
console.log(prezzoIvato); // => 122


// ============================================================
// 2) COMMENTO MULTI-LINE (/* ... */)
// ============================================================

/* Questo e' un commento su piu' righe.
   Utile per blocchi di spiegazione lunghi
   o per intestazioni di sezione. */
const reparti = ['UP', 'MG', 'AM'];
console.log(reparti.length); // => 3

/* Si puo' usare anche inline */ const badge = 'UP-001'; /* dopo il codice */
console.log(badge); // => UP-001

/*
 * Stile "banner" con asterischi allineati: molto leggibile
 * per descrivere il senso generale di una sezione di codice.
 */
function minutiToOre(min) {
  return min / 60;
}
console.log(minutiToOre(90)); // => 1.5

// ATTENZIONE: i commenti multi-line NON si annidano.
// Questo NON funziona: /* esterno /* interno */ resto */  <-- errore di sintassi
// Per "commentare via" un blocco che contiene gia' /* */, usa // su ogni riga.


// ============================================================
// 3) JSDOC: COMMENTI DI DOCUMENTAZIONE (/** ... */)
// ============================================================

/**
 * Converte minuti totali in una stringa orario HH:MM.
 * @param {number} minuti - Minuti totali (>= 0).
 * @returns {string} Orario formattato, es. "01:30".
 */
function formattaDurata(minuti) {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
console.log(formattaDurata(90)); // => "01:30"

/**
 * Rappresenta un dipendente del gestionale.
 * @typedef {Object} Dipendente
 * @property {number} id        - Identificativo univoco.
 * @property {string} nome      - Nome di battesimo.
 * @property {string} cognome   - Cognome.
 * @property {string} codiceBadge - Badge, formato "UP-001".
 */

/**
 * Compone l'etichetta leggibile di un dipendente.
 * @param {Dipendente} dip - Il dipendente da etichettare.
 * @returns {string} Etichetta "Nome Cognome (badge)".
 */
function etichettaDipendente(dip) {
  return `${dip.nome} ${dip.cognome} (${dip.codiceBadge})`;
}
console.log(etichettaDipendente({ id: 1, nome: 'Anna', cognome: 'Rossi', codiceBadge: 'UP-001' }));
// => "Anna Rossi (UP-001)"

/**
 * Funzione asincrona documentata.
 * @async
 * @param {number} id - ID dipendente.
 * @returns {Promise<Dipendente|null>} Il dipendente o null se assente.
 */
async function caricaDipendente(id) {
  const db = { 1: { id: 1, nome: 'Anna', cognome: 'Rossi', codiceBadge: 'UP-001' } };
  return db[id] ?? null; // nullish coalescing: null se non trovato
}
caricaDipendente(1).then((d) => console.log(d?.codiceBadge)); // => "UP-001"

/**
 * Tag JSDoc utili da ricordare:
 * @param   descrive un parametro
 * @returns descrive il valore di ritorno
 * @throws  documenta un'eccezione lanciata
 * @example mostra un esempio d'uso
 * @deprecated segnala una API obsoleta
 * @see     rimanda ad altra risorsa/funzione
 *
 * @example
 *   formattaDurata(125); // => "02:05"
 */


// ============================================================
// 4) COMMENTI UTILI vs COMMENTI INUTILI
// ============================================================

// INUTILE: ripete cio' che il codice gia' dice chiaramente.
let contatore = 0;
contatore = contatore + 1; // incrementa contatore di 1  <-- rumore, non aggiunge nulla

// UTILE: spiega il PERCHE' (motivazione, vincolo, scelta non ovvia).
// Il server gira in UTC: salviamo l'ora di Roma come "naive-UTC" per evitare
// shift dovuti all'ora legale quando rileggiamo la timbratura.
const ORARIO_CHIUSURA_REPARTO = 17; // motivato da regolamento aziendale interno

// UTILE: avverte di un effetto collaterale o di un trabocchetto.
const turni = [];
turni.push({ sigla: 'P4', pausa: true });  // P4 = turno CON pausa pranzo
turni.push({ sigla: 'P2', pausa: false }); // P2 = turno SENZA pausa
console.log(turni.length); // => 2

// REGOLA PRATICA: se devi scrivere un commento per spiegare COSA fa una riga
// criptica, spesso e' meglio rendere il CODICE piu' chiaro (nomi parlanti).
// Peggio:
const x = turni.filter((t) => t.pausa).length;
// Meglio (commento non piu' necessario perche' il nome spiega tutto):
const turniConPausa = turni.filter((t) => t.pausa).length;
console.log(x, turniConPausa); // => 1 1


// ============================================================
// 5) COMMENTI "SEGNALE": TODO, FIXME, NOTE, HACK
// ============================================================

// TODO: gestire i dipendenti archiviati nel filtro reparto.
// FIXME: arrotondamento errato quando i minuti sono negativi.
// NOTE: il badge ha sempre prefisso reparto di 2 lettere + numero.
// HACK: workaround temporaneo finche' l'API non espone la sigla reparto.
// Molti editor evidenziano queste keyword per ritrovarle facilmente.
function siglaReparto(reparto) {
  return reparto?.sigla ?? 'XX'; // XX = placeholder finche' reparto non noto
}
console.log(siglaReparto(null)); // => "XX"


// ============================================================
// 6) COMMENTARE PARAMETRI E SEZIONI DI ESPRESSIONI
// ============================================================

// Commento inline per chiarire un argomento posizionale poco leggibile.
function creaTimbratura(badge, tipo /* 'ingresso' | 'uscita' */, minuti) {
  return { badge, tipo, minuti };
}
console.log(creaTimbratura('UP-001', 'ingresso', 480).tipo); // => "ingresso"

// Spiegare un'espressione complessa passo passo.
const richieste = [
  { approvata: true, minuti: 120 },
  { approvata: false, minuti: 60 },
  { approvata: true, minuti: 30 },
];
const totaleApprovato = richieste
  .filter((r) => r.approvata)              // tieni solo le richieste approvate
  .reduce((somma, r) => somma + r.minuti, 0); // somma i minuti
console.log(totaleApprovato); // => 150


// ============================================================
// 7) COMMENTI E REGEX: documentare pattern altrimenti illeggibili
// ============================================================

// Senza commento una regex e' un geroglifico: spiegala SEMPRE.
const reOrario = /^\d{2}:\d{2}$/; // valida formato HH:MM (es. "08:30")
console.log(reOrario.test('08:30')); // => true
console.log(reOrario.test('8:30'));  // => false

// Estrae il numero progressivo dal badge "UP-001" -> "001".
const matchBadge = 'UP-001'.match(/-(\d+)$/); // gruppo 1 = cifre dopo il trattino
console.log(matchBadge?.[1]); // => "001"


// ============================================================
// 8) ESEMPIO BROWSER (DOM): commenti per codice non eseguibile in Node
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function evidenziaBadgeNonValidi() {
  // document non esiste in Node: incapsuliamo in funzione per non rompere import-time.
  // const celle = document.querySelectorAll('.badge');
  // celle.forEach((c) => {
  //   // se il testo non rispetta HH:MM lo segnaliamo in rosso
  //   if (!/^[A-Z]{2}-\d{3}$/.test(c.textContent)) c.style.color = 'red';
  // });
  return 'esempio DOM (pseudo-eseguibile)';
}
console.log(evidenziaBadgeNonValidi()); // => "esempio DOM (pseudo-eseguibile)"


// ============================================================
// 9) DIRETTIVE SPECIALI CHE SEMBRANO COMMENTI (ma non lo sono del tutto)
// ============================================================

// I commenti di lint/strumenti: NON sono semplice testo, modificano i tool.
// eslint-disable-next-line no-unused-vars
const usatoSoloPerDemo = 42;
// @ts-ignore   <-- in file TS dice a TypeScript di ignorare la riga seguente
// Shebang #!/usr/bin/env node sulla PRIMA riga di uno script eseguibile (non e' un commento JS classico).
console.log(usatoSoloPerDemo); // => 42


// ============================================================
// 10) CASO PRATICO ERP: una funzione ben documentata end-to-end
// ============================================================

/**
 * Calcola le ore lavorate di una giornata a partire dalle timbrature.
 * Gli orari sono salvati come minuti dalla mezzanotte (naive-UTC).
 *
 * @param {Object} t                - Timbrature della giornata (minuti).
 * @param {number} t.ingresso       - Minuti dell'ingresso.
 * @param {number} t.uscitaPranzo   - Minuti uscita per pranzo.
 * @param {number} t.rientroPranzo  - Minuti rientro dal pranzo.
 * @param {number} t.uscita         - Minuti dell'uscita serale.
 * @returns {string} Ore lavorate nette in formato HH:MM.
 * @throws {Error} Se gli orari non sono in ordine cronologico.
 * @example
 *   oreLavorate({ ingresso: 480, uscitaPranzo: 720, rientroPranzo: 780, uscita: 1020 });
 *   // => "07:00"
 */
function oreLavorate(t) {
  // Validazione: l'ordine deve essere coerente, altrimenti i conti saltano.
  if (!(t.ingresso <= t.uscitaPranzo && t.uscitaPranzo <= t.rientroPranzo && t.rientroPranzo <= t.uscita)) {
    throw new Error('Timbrature non in ordine cronologico');
  }
  const mattina = t.uscitaPranzo - t.ingresso;     // minuti del mattino
  const pomeriggio = t.uscita - t.rientroPranzo;   // minuti del pomeriggio
  return formattaDurata(mattina + pomeriggio);     // riusiamo l'helper documentato
}
console.log(oreLavorate({ ingresso: 480, uscitaPranzo: 720, rientroPranzo: 780, uscita: 1020 }));
// => "07:00"


// ============================================================
// RIEPILOGO COMANDI (scheda di memoria rapida)
// ============================================================
/*
  // ...................... commento single-line (fine riga / riga intera)
  /* ... *\/ ............... commento multi-line (NON annidabile)
  /** ... *\/ ............. blocco JSDoc di documentazione

  TAG JSDOC: @param  @returns  @throws  @typedef  @property
             @async  @example  @deprecated  @see

  KEYWORD SEGNALE: TODO  FIXME  NOTE  HACK

  DIRETTIVE-COMMENTO: // eslint-disable-next-line   // @ts-ignore   #!/usr/bin/env node (shebang)

  METODI/COSTRUTTI VISTI:
    String.padStart()  Math.floor()  Array.filter()  Array.reduce()
    Array.push()  RegExp.test()  String.match()  optional chaining ?.
    nullish coalescing ??  template literals `${}`  async/await  Promise.then()

  REGOLE D'ORO:
    - Commenta il PERCHE', non il COSA ovvio.
    - Se serve un commento per spiegare codice criptico -> rendi il codice piu' chiaro.
    - Documenta sempre regex, magic number e workaround (HACK/FIXME).
    - Usa JSDoc per API pubbliche, parametri e valori di ritorno.
*/
