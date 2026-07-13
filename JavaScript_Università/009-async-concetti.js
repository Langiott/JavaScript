// ============================================================================
//  009 — PROGRAMMAZIONE ASINCRONA: CONCETTI E MODELLI
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  SINCRONO vs ASINCRONO
//   · SINCRONO — le istruzioni si eseguono una dopo l'altra; se una è lenta
//     (leggere dal DB, un file, la rete), TUTTO si blocca finché non finisce.
//   · ASINCRONO — l'operazione lenta viene "avviata e messa da parte"; il
//     programma continua con altro e viene avvisato quando il risultato è
//     pronto. Non spreca tempo ad aspettare.
//
//  Perché è VITALE nel tuo ERP: il backend serve tanti utenti insieme. Se una
//  query al DB bloccasse tutto, mentre carichi gli articoli di un utente gli
//  altri resterebbero fermi. Con l'async, Node avvia la query e nel frattempo
//  serve gli altri.
//
//  MODELLARE UN SISTEMA CONCORRENTE — quando più cose accadono "insieme" servono
//  regole per non pestarsi i piedi. Due grandi famiglie:
//   · MEMORIA CONDIVISA — più esecutori leggono/scrivono gli stessi dati. Veloce
//     ma servono lucchetti (lock) per evitare le "corse critiche" (due che
//     modificano lo stesso dato insieme → risultato imprevedibile).
//   · SCAMBIO DI MESSAGGI — gli esecutori NON condividono dati: si mandano
//     messaggi (come lettere). Nessun dato condiviso = niente corse critiche.
//     È il modello degli ATTORI e, in piccolo, di come Node parla coi worker.
//
//  Node.js sceglie una via elegante: UN SOLO thread + EVENT LOOP (file 010).
//  Niente memoria condivisa tra thread → niente lock → meno bug. Le operazioni
//  lente sono delegate "sotto" e il risultato torna come evento.
// ============================================================================

// Descrive a parole un modello di concorrenza (ripasso a console).
function descriviModelloConcorrenza(nome) {
    const schede = {
        'memoria-condivisa': 'Esecutori sugli stessi dati. Veloce ma servono lock (rischio corse critiche).',
        'scambio-messaggi':  'Esecutori isolati che si mandano messaggi. Niente dati condivisi → niente lock.',
        'event-loop':        'Un thread solo che reagisce a eventi; le operazioni lente sono delegate (Node.js).',
    };
    const testo = schede[nome] ?? '(modello sconosciuto)';
    console.log(`🧵 ${nome}: ${testo}`);
    return testo;
}

// Simula lo SCAMBIO DI MESSAGGI: due "attori" che non condividono memoria e si
// parlano solo passandosi messaggi. Il magazziniere chiede, il registro risponde.
function demoScambioMessaggi() {
    // ogni attore è una funzione che riceve un messaggio e ne restituisce uno
    const registro = (messaggio) => {
        if (messaggio.tipo === 'CHIEDI_GIACENZA')
            return { tipo: 'GIACENZA', codice: messaggio.codice, valore: 42 };
        return { tipo: 'IGNOTO' };
    };

    const magazziniere = () => {
        const domanda = { tipo: 'CHIEDI_GIACENZA', codice: 'A001' };
        console.log('   👷 magazziniere invia:', domanda);
        const risposta = registro(domanda);           // "manda il messaggio"
        console.log('   📇 registro risponde:', risposta);
        return risposta;
    };

    return magazziniere();
}

// --- DEMO ---
function main() {
    console.log('=== 009 ASYNC — CONCETTI ===\n');
    ['memoria-condivisa', 'scambio-messaggi', 'event-loop'].forEach(descriviModelloConcorrenza);
    console.log('\nSCAMBIO DI MESSAGGI (due attori isolati):');
    demoScambioMessaggi();
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   descriviModelloConcorrenza(nome)  scheda testuale di un modello di concorrenza
//   demoScambioMessaggi()             due attori che comunicano solo con messaggi
// ============================================================================

module.exports = { descriviModelloConcorrenza, demoScambioMessaggi };
