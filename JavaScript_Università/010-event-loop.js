// ============================================================================
//  010 — EVENT LOOP E PROGRAMMAZIONE A EVENTI
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  L'EVENT LOOP è il cuore di Node.js. Immaginalo come un cameriere UNICO in un
//  ristorante affollato: non resta fermo davanti a un tavolo aspettando che i
//  clienti decidano; prende l'ordine, lo passa alla cucina e va da un altro
//  tavolo. Quando la cucina suona il campanello ("piatto pronto"), torna a
//  servire. Un solo cameriere serve TANTI tavoli senza mai stare fermo.
//
//  In Node:
//   · Il codice "normale" gira subito (sincrono).
//   · Le operazioni lente (timer, DB, file, rete) vengono AVVIATE e messe da
//     parte; la loro funzione di risposta (CALLBACK) viene messa in coda.
//   · Quando l'operazione finisce, l'event loop prende la callback dalla coda
//     e la esegue. Tutto su UN thread, senza bloccarsi.
//
//  ORDINE DI ESECUZIONE (fondamentale da capire):
//   1. prima TUTTO il codice sincrono
//   2. poi le microtask (Promise, vedi file 011)
//   3. poi le macrotask (setTimeout, I/O)
//  Per questo un console.log dentro setTimeout(...,0) stampa DOPO il codice
//  che gli sta sotto: viene "rimandato" al prossimo giro del loop.
//
//  PROGRAMMAZIONE A EVENTI: invece di "fai A poi B poi C", dici "QUANDO succede
//  X, fai Y". Ti iscrivi a un evento e reagisci. In Node lo strumento base è
//  EventEmitter (emit = "è successo!", on = "quando succede, fai questo").
//  È lo stesso principio dell'Observer (file 007) ma integrato in Node.
// ============================================================================

const EventEmitter = require('events'); // modulo built-in di Node

// Mostra l'ordine sorprendente: sincrono → poi il setTimeout, anche con 0 ms.
function demoEventLoop() {
    console.log('   1. inizio (sincrono)');

    setTimeout(() => console.log('   4. timeout 0ms (macrotask: ultimo)'), 0);

    Promise.resolve().then(() => console.log('   3. promise (microtask: prima del timeout)'));

    console.log('   2. fine (sincrono)');
    // Ordine stampato: 1, 2, 3, 4 — anche se il timeout è "0ms".
}

// Mostra che setTimeout NON blocca: il programma prosegue e la callback arriva dopo.
function demoSetTimeout() {
    console.log('   avvio operazione "lenta" (simulata con timer)...');
    setTimeout(() => console.log('   ...operazione completata (callback eseguita dopo)'), 50);
    console.log('   intanto continuo a fare altro senza aspettare');
}

// EventEmitter: mi iscrivo a un evento e reagisco quando viene emesso.
// Caso ERP: "quando un articolo viene creato, avvisa il log e la UI".
const emitter = new EventEmitter();

function demoEventi() {
    // mi iscrivo: "QUANDO scatta 'articolo:creato', fai questo"
    emitter.on('articolo:creato', (art) => console.log('   📝 log: creato', art.codice));
    emitter.on('articolo:creato', (art) => console.log('   🖥️  UI : aggiorno lista con', art.codice));

    // più tardi, quando succede davvero, EMETTO l'evento → scattano tutti gli iscritti
    emitter.emit('articolo:creato', { codice: 'A001' });
}

// --- DEMO ---
function main() {
    console.log('=== 010 EVENT LOOP ===\n');

    console.log('ORDINE DI ESECUZIONE (sincrono → microtask → macrotask):');
    demoEventLoop();

    console.log('\nEVENTI (EventEmitter):');
    demoEventi();

    console.log('\nSETTIMEOUT non bloccante:');
    demoSetTimeout();

    // NB: alcuni messaggi "dopo" appariranno in fondo, quando il loop li esegue.
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   demoEventLoop()    mostra l'ordine sincrono → microtask → macrotask
//   demoSetTimeout()   mostra che setTimeout non blocca il flusso
//   demoEventi()       EventEmitter: on (iscrizione) + emit (notifica)
//   emitter            istanza EventEmitter condivisa dal file
// ============================================================================

module.exports = { demoEventLoop, demoSetTimeout, demoEventi, emitter };
