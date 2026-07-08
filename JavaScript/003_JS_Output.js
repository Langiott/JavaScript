/* ============================================================
   3 JS Output
   Questo file raccoglie tutti i modi per produrre OUTPUT in
   JavaScript: la famiglia console.* (log, info, warn, error,
   table, group, ecc.) per il debug, alert() per i messaggi
   modali nel browser, document.write() per scrivere nel
   documento, e le proprieta innerHTML / textContent per
   inserire contenuto dentro un elemento del DOM.
   Console e' disponibile sia in Node.js sia nel browser;
   alert / document.write / innerHTML sono API solo-browser.
   ============================================================ */


/* ------------------------------------------------------------
   1) console.log — l'output base per il debug
   ------------------------------------------------------------ */

// Stampa una semplice stringa
console.log('Ciao mondo'); // => Ciao mondo

// console.log accetta piu argomenti separati da spazio
console.log('Badge:', 'UP-001', 'attivo'); // => Badge: UP-001 attivo

// Stampa numeri, boolean e risultati di espressioni
console.log(40 + 2); // => 42
console.log(10 > 3); // => true

// Stampa oggetti e array (vengono espansi in modo leggibile)
const dipendente = { id: 1, nome: 'Mario', codiceBadge: 'UP-001' };
console.log(dipendente); // => { id: 1, nome: 'Mario', codiceBadge: 'UP-001' }
console.log([1, 2, 3]); // => [ 1, 2, 3 ]


/* ------------------------------------------------------------
   2) Format specifiers (segnaposto) in console.log
   %s stringa, %d/%i intero, %f float, %o/%O oggetto, %c stile CSS
   ------------------------------------------------------------ */

// %s inserisce una stringa, %d un intero
console.log('Dipendente %s con badge numero %d', 'Mario', 1);
// => Dipendente Mario con badge numero 1

// %f per i numeri con decimali (qui le ore lavorate)
console.log('Ore lavorate: %f', 7.5); // => Ore lavorate: 7.5

// %o stampa un oggetto in forma espandibile
console.log('Record: %o', dipendente);

// %c applica uno stile CSS (utile nella console del browser)
// Esempio browser: gira nel browser, non in Node
// console.log('%cAttenzione', 'color: red; font-weight: bold');


/* ------------------------------------------------------------
   3) console.info — messaggi informativi
   Spesso identico a log, ma semanticamente "informativo".
   ------------------------------------------------------------ */

// Utile per tracciare il flusso normale dell'applicazione
console.info('Sincronizzazione timbrature avviata'); // => Sincronizzazione timbrature avviata
console.info('Reparti caricati:', 4); // => Reparti caricati: 4


/* ------------------------------------------------------------
   4) console.warn — avvisi (warning)
   Nel browser appare con icona/sfondo giallo; in Node va su stderr.
   ------------------------------------------------------------ */

// Avviso non bloccante: la scorta vestiario e' bassa
const scortaMinima = 5;
const quantita = 2;
if (quantita < scortaMinima) {
  console.warn('Scorta sotto la soglia: %d / %d', quantita, scortaMinima);
  // => Scorta sotto la soglia: 2 / 5
}


/* ------------------------------------------------------------
   5) console.error — errori
   Nel browser appare in rosso; in Node viene scritto su stderr.
   ------------------------------------------------------------ */

// Stampa un messaggio di errore
console.error('Timbratura non valida'); // => Timbratura non valida

// Si puo passare direttamente un oggetto Error con stack trace
try {
  throw new Error('Badge UP-999 inesistente');
} catch (err) {
  console.error('Errore creazione dipendente:', err.message);
  // => Errore creazione dipendente: Badge UP-999 inesistente
}


/* ------------------------------------------------------------
   6) console.debug — messaggi di debug a basso livello
   Spesso nascosto di default nel browser (livello "verbose").
   ------------------------------------------------------------ */

console.debug('Valore intermedio reduce:', 480); // => Valore intermedio reduce: 480


/* ------------------------------------------------------------
   7) console.table — output tabellare
   Ottimo per array di oggetti: mostra una tabella con colonne.
   ------------------------------------------------------------ */

const dipendenti = [
  { id: 1, nome: 'Mario', reparto: 'UP', codiceBadge: 'UP-001' },
  { id: 2, nome: 'Lucia', reparto: 'AM', codiceBadge: 'AM-002' },
  { id: 3, nome: 'Anna',  reparto: 'UP', codiceBadge: 'UP-003' },
];

// Stampa una tabella con indice, nome, reparto, codiceBadge
console.table(dipendenti);

// Si puo limitare alle colonne desiderate passando un array di chiavi
console.table(dipendenti, ['nome', 'codiceBadge']);

// Funziona anche con un oggetto semplice (chiave => valore)
console.table({ ingresso: '08:00', uscita: '17:00' });


/* ------------------------------------------------------------
   8) console.group / groupEnd / groupCollapsed — raggruppare output
   Crea blocchi indentati e collassabili per ordinare i log.
   ------------------------------------------------------------ */

// Raggruppa log correlati sotto un'etichetta
console.group('Calcolo ore turno P4');
console.log('Ingresso: 08:00');
console.log('Uscita pranzo: 12:00');
console.log('Rientro pranzo: 13:00');
console.log('Uscita: 17:00');
console.log('Totale: 8 ore (pausa esclusa)');
console.groupEnd();

// groupCollapsed parte chiuso (utile per log voluminosi)
console.groupCollapsed('Dettaglio query Prisma');
console.log('findMany dipendenti');
console.log('include: { reparto: true }');
console.groupEnd();

// I group possono essere annidati
console.group('Reparto UP');
console.log('Dipendenti: 2');
console.group('Turni attivi');
console.log('P4 con pausa');
console.groupEnd();
console.groupEnd();


/* ------------------------------------------------------------
   9) console.dir — ispeziona le proprieta di un oggetto
   Utile nel browser per vedere un nodo DOM come oggetto JS.
   ------------------------------------------------------------ */

console.dir(dipendente); // mostra l'oggetto come struttura navigabile


/* ------------------------------------------------------------
   10) console.assert — stampa solo se la condizione e' falsa
   Strumento di asserzione: silenzioso se il test passa.
   ------------------------------------------------------------ */

const oreLavorate = 8;
console.assert(oreLavorate > 0, 'Le ore devono essere positive'); // niente output
console.assert(oreLavorate <= 6, 'Superato il limite di 6 ore'); // => Assertion failed: Superato...


/* ------------------------------------------------------------
   11) console.count / countReset — conta quante volte si arriva qui
   ------------------------------------------------------------ */

function timbra(codiceBadge) {
  console.count(`timbrature ${codiceBadge}`);
}
timbra('UP-001'); // => timbrature UP-001: 1
timbra('UP-001'); // => timbrature UP-001: 2
timbra('AM-002'); // => timbrature AM-002: 1
console.countReset('timbrature UP-001');
timbra('UP-001'); // => timbrature UP-001: 1


/* ------------------------------------------------------------
   12) console.time / timeEnd / timeLog — misurare durate
   Misura quanto tempo passa tra time e timeEnd (in ms).
   ------------------------------------------------------------ */

console.time('caricaReparti');
const reparti = Array.from({ length: 1000 }, (_, i) => ({ id: i, sigla: 'UP' }));
console.timeLog('caricaReparti', 'array creato'); // tempo parziale
console.timeEnd('caricaReparti'); // => caricaReparti: X.XXXms


/* ------------------------------------------------------------
   13) console.trace — stampa lo stack trace corrente
   Mostra da dove e' stata chiamata la funzione.
   ------------------------------------------------------------ */

function validaOrario(orario) {
  if (!/^\d{2}:\d{2}$/.test(orario)) {
    console.trace('Formato orario non valido:', orario);
  }
}
validaOrario('8.00'); // stampa il messaggio + la catena di chiamate


/* ------------------------------------------------------------
   14) Esempio pratico ERP: report timbrature con console.*
   Aggrega minuti lavorati e usa il livello di log adeguato.
   ------------------------------------------------------------ */

const richieste = [
  { badge: 'UP-001', minuti: 480, approvata: true },
  { badge: 'AM-002', minuti: 300, approvata: false },
  { badge: 'UP-003', minuti: 510, approvata: true },
];

console.group('Report giornaliero');
const totaleMinuti = richieste
  .filter((r) => r.approvata)
  .reduce((somma, r) => somma + r.minuti, 0);
console.info('Richieste totali:', richieste.length); // => Richieste totali: 3
console.log('Minuti approvati:', totaleMinuti); // => Minuti approvati: 990
if (totaleMinuti > 900) {
  console.warn('Straordinario rilevato: %d minuti', totaleMinuti);
}
console.table(richieste, ['badge', 'minuti', 'approvata']);
console.groupEnd();


/* ------------------------------------------------------------
   15) Formattare l'output in modo leggibile
   ------------------------------------------------------------ */

// JSON.stringify con indentazione per oggetti complessi
console.log(JSON.stringify(dipendente, null, 2));
// => {
//      "id": 1,
//      "nome": "Mario",
//      "codiceBadge": "UP-001"
//    }

// Template literal per comporre la riga di output
const { nome, codiceBadge } = dipendente;
console.log(`Assegnato a ${nome} (${codiceBadge})`); // => Assegnato a Mario (UP-001)

// padStart per allineare gli orari HH:MM
const ore = String(8).padStart(2, '0');
const minuti = String(5).padStart(2, '0');
console.log(`${ore}:${minuti}`); // => 08:05


/* ------------------------------------------------------------
   16) alert() — finestra modale (SOLO BROWSER)
   Blocca l'esecuzione finche l'utente non clicca OK.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function avvisaScortaBassa(articolo, qta) {
  // alert(`Scorta bassa per ${articolo}: ${qta} pezzi`);
  return `Scorta bassa per ${articolo}: ${qta} pezzi`; // versione testabile in Node
}
console.log(avvisaScortaBassa('Guanti', 2)); // => Scorta bassa per Guanti: 2 pezzi

// Esempio browser: confirm restituisce true/false, prompt restituisce la stringa
// const conferma = confirm('Eliminare il dipendente?');
// const valore = prompt('Inserisci il codice badge:', 'UP-');


/* ------------------------------------------------------------
   17) document.write() — scrive direttamente nel documento HTML
   Sconsigliato: se usato dopo il load, cancella la pagina.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function scriviInPagina() {
  // document.write('<h1>Report Timbrature</h1>');
  // document.write('<p>Generato il ' + new Date().toISOString().slice(0, 10) + '</p>');
}
// scriviInPagina(); // da chiamare solo nel browser


/* ------------------------------------------------------------
   18) innerHTML — inserisce HTML dentro un elemento del DOM
   Interpreta i tag: utile, ma attento alla XSS con input utente.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function renderBadge(el, dip) {
  // el.innerHTML = `<span class="badge">${dip.codiceBadge}</span> ${dip.nome}`;
  return `<span class="badge">${dip.codiceBadge}</span> ${dip.nome}`;
}
console.log(renderBadge(null, dipendente));
// => <span class="badge">UP-001</span> Mario

// Esempio browser: costruire una lista con map + join e iniettarla
function renderLista(dips) {
  const righe = dips.map((d) => `<li>${d.nome} - ${d.codiceBadge}</li>`).join('');
  // document.getElementById('lista').innerHTML = `<ul>${righe}</ul>`;
  return `<ul>${righe}</ul>`;
}
console.log(renderLista(dipendenti));
// => <ul><li>Mario - UP-001</li><li>Lucia - AM-002</li><li>Anna - UP-003</li></ul>


/* ------------------------------------------------------------
   19) textContent — inserisce TESTO puro (niente HTML)
   Piu sicuro di innerHTML: l'input viene mostrato letteralmente.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function mostraNomeSicuro(el, nomeUtente) {
  // textContent NON interpreta i tag: protegge da XSS
  // el.textContent = nomeUtente;
  return nomeUtente; // qualsiasi <script> resta testo innocuo
}
console.log(mostraNomeSicuro(null, '<b>Mario</b>')); // => <b>Mario</b> (come testo, non grassetto)

// Differenza chiave:
//   innerHTML  => interpreta i tag (rischio XSS con input non fidato)
//   textContent => mostra il testo cosi com'e (sicuro)
//   innerText  => simile a textContent ma rispetta lo stile/visibilita (solo browser)


/* ------------------------------------------------------------
   20) Output verso file/stream in Node.js
   process.stdout / process.stderr scrivono senza newline finale.
   ------------------------------------------------------------ */

// stdout: output standard (come console.log ma senza \n automatico)
process.stdout.write('Salvataggio'); // => Salvataggio
process.stdout.write(' completato\n'); // => Salvataggio completato

// stderr: canale errori, separato da stdout
process.stderr.write('Attenzione: connessione DB lenta\n');


/* ============================================================
   RIEPILOGO COMANDI
   - console.log()        output base per il debug
   - console.info()       messaggio informativo
   - console.warn()       avviso (warning)
   - console.error()      errore (stderr)
   - console.debug()      log di debug a basso livello
   - console.table()      output tabellare di array/oggetti
   - console.group()      apre un gruppo indentato
   - console.groupCollapsed() gruppo inizialmente chiuso
   - console.groupEnd()   chiude il gruppo
   - console.dir()        ispeziona le proprieta di un oggetto
   - console.assert()     stampa solo se la condizione e' falsa
   - console.count()      conta le chiamate per etichetta
   - console.countReset() azzera il contatore
   - console.time()/timeLog()/timeEnd() misura durate
   - console.trace()      stampa lo stack trace
   - Format specifiers    %s %d %i %f %o %O %c
   - alert()/confirm()/prompt() dialoghi modali (browser)
   - document.write()     scrive nel documento (browser)
   - element.innerHTML    inserisce HTML (browser, attenzione XSS)
   - element.textContent  inserisce testo puro (browser, sicuro)
   - element.innerText    testo rispettando lo stile (browser)
   - process.stdout.write()/stderr.write() output stream Node
   - JSON.stringify(obj, null, 2) formattazione leggibile
   ============================================================ */
