// ============================================================================
//  004 — INTRODUZIONE A NODE.JS + FP APPLICATA ALL'ERP
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  NODE.JS è JavaScript che gira FUORI dal browser (lato server). È ciò su cui
//  gira il tuo backend ERP. Caratteristiche chiave:
//   · Un solo thread + EVENT LOOP (vedi file 010): gestisce tante richieste
//     senza bloccarsi, delegando le operazioni lente (DB, file) e reagendo
//     quando sono pronte.
//   · MODULI: ogni file è un modulo. `module.exports` espone cose, `require`
//     le importa. (In TypeScript / ESM si usa `export` / `import`.)
//   · NPM: il gestore dei pacchetti (le dipendenze in package.json).
//
//  FP IN JS/TS: JavaScript e TypeScript supportano bene lo stile funzionale
//  (arrow function, map/filter/reduce, immutabilità con spread). TypeScript in
//  più aggiunge i TIPI: puoi dire "questa funzione prende Articolo[] e torna
//  string[]", e l'editor ti avvisa se sbagli PRIMA di eseguire.
//
//  In questo file applichiamo la FP dei file 002/003 a dati che assomigliano a
//  quelli reali del tuo ERP (articoli), ma senza toccare il database: usiamo
//  dati "mock" (finti) così il file gira ovunque, subito.
//
//  Equivalente TypeScript (solo per riferimento, qui usiamo JS):
//     type Articolo = { codice: string; descrizione: string; stato: string; peso: number };
//     const soloConCodice = (a: Articolo[]): Articolo[] => a.filter(x => !!x.codice);
// ============================================================================

// Dati finti che imitano il model Articolo (niente DB: gira sempre).
function leggiArticoliMock() {
    return [
        { codice: 'A001', descrizione: 'Boccola PU',      stato: 'produzione', peso: 1.2 },
        { codice: 'A002', descrizione: 'Rullo gommato',   stato: 'preventivo', peso: 3.5 },
        { codice: '',     descrizione: 'Bozza senza cod', stato: 'preventivo', peso: 0.0 },
        { codice: 'A004', descrizione: 'Guarnizione',     stato: 'produzione', peso: 0.3 },
    ];
}

// FILTER — tiene solo gli articoli che hanno un codice (scarta le bozze).
function soloConCodice(articoli) {
    return articoli.filter(a => a.codice !== '');
}

// MAP — trasforma: estrae i codici in maiuscolo.
function codiciMaiuscoli(articoli) {
    return articoli.map(a => a.codice.toUpperCase());
}

// REDUCE — raggruppa gli articoli per stato in un oggetto { stato: [codici] }.
// È il pattern "group by" fatto a mano in stile funzionale.
function raggruppaPerStato(articoli) {
    return articoli.reduce((gruppi, a) => {
        (gruppi[a.stato] ??= []).push(a.codice); // crea l'array se non c'è, poi aggiunge
        return gruppi;
    }, {});
}

// Compongo tutto in un piccolo "report" leggibile (pipeline di funzioni pure).
function report() {
    const articoli = leggiArticoliMock();

    const validi   = soloConCodice(articoli);
    const codici   = codiciMaiuscoli(validi);
    const perStato = raggruppaPerStato(validi);
    const pesoTot  = validi.reduce((acc, a) => acc + a.peso, 0);

    console.log('📄 REPORT ARTICOLI');
    console.log('   validi (con codice):', codici.join(', '));
    console.log('   raggruppati per stato:', perStato);
    console.log('   peso totale:', pesoTot.toFixed(2), 'kg');

    return { codici, perStato, pesoTot };
}

// --- DEMO ---
function main() {
    console.log('=== 004 NODE.JS + FP ===\n');
    report();
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   leggiArticoliMock()        dati finti simili al model Articolo
//   soloConCodice(articoli)    filter: scarta gli articoli senza codice
//   codiciMaiuscoli(articoli)  map: estrae i codici in maiuscolo
//   raggruppaPerStato(art.)    reduce: "group by" per stato
//   report()                   pipeline che compone le funzioni pure
// ============================================================================

module.exports = { leggiArticoliMock, soloConCodice, codiciMaiuscoli, raggruppaPerStato, report };
