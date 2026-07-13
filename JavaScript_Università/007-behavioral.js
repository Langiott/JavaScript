// ============================================================================
//  007 — BEHAVIORAL DESIGN PATTERN (pattern COMPORTAMENTALI)
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  I pattern COMPORTAMENTALI rispondono a: "come si parlano e collaborano gli
//  oggetti? come organizzo la LOGICA e le responsabilità?". Riguardano il
//  comportamento a runtime, non la creazione né la forma.
//
//  1) STRATEGY (strategia) — al posto di un if/else gigante che sceglie il
//     comportamento, metti ogni comportamento in una funzione separata e ne
//     SCEGLI una da una mappa. Aggiungere un caso = aggiungere una riga, non
//     riscrivere l'if. Esempio ERP perfetto: i movimenti Carico/Scarico/Rettifica.
//
//  2) OBSERVER (osservatore) — un oggetto "notifica" tanti altri quando succede
//     qualcosa, senza sapere chi sono. "Iscriviti all'evento, ti avviso io".
//     Esempio: quando un articolo cambia stato, avvisa il log, la mail, la UI...
//     È lo stesso principio degli eventi di Node (vedi file 010).
//
//  3) CHAIN OF RESPONSIBILITY (catena di responsabilità) — una richiesta passa
//     attraverso una CATENA di gestori; ognuno fa il suo pezzo e passa oltre.
//     È esattamente come funzionano i MIDDLEWARE di Express (auth → log → ...).
//     Qui lo usiamo per una catena di VALIDAZIONI su un articolo.
// ============================================================================

// --- 1) STRATEGY ---
// Ogni tipo di movimento è una funzione (strategia). Niente if/else.
const _strategie = {
    Carico:    (giacenza, qta) => giacenza + qta,
    Scarico:   (giacenza, qta) => giacenza - qta,
    Rettifica: (giacenza, qta) => qta,           // rettifica = imposta il valore
    // domani "Reso"? aggiungi UNA riga qui, non tocchi applicaMovimento:
    // Reso:   (giacenza, qta) => giacenza + qta,
};

function applicaMovimento(giacenza, tipo, qta) {
    const strategia = _strategie[tipo];
    if (!strategia) throw new Error(`Tipo movimento sconosciuto: ${tipo}`);
    return strategia(giacenza, qta);
}

// --- 2) OBSERVER ---
// Un piccolo "bus" di eventi: gli osservatori si iscrivono, l'oggetto li avvisa.
class EventiArticolo {
    constructor() { this._osservatori = []; }
    // ci si iscrive passando una funzione da chiamare quando scatta l'evento
    iscriviti(fn) { this._osservatori.push(fn); return this; }
    // notifica TUTTI gli iscritti (l'oggetto non sa chi sono: disaccoppiamento)
    notifica(evento) { this._osservatori.forEach(fn => fn(evento)); }
}

// --- 3) CHAIN OF RESPONSIBILITY ---
// Ogni validatore è un anello: riceve l'articolo, controlla una cosa, e se ok
// passa al successivo. Se fallisce, interrompe la catena con un errore.
function pipelineValidazioni(articolo) {
    const anelli = [
        (a) => { if (!a.codice) throw new Error('manca il codice'); },
        (a) => { if (!a.descrizione) throw new Error('manca la descrizione'); },
        (a) => { if (a.descrizione.length > 160) throw new Error('descrizione troppo lunga'); },
    ];
    for (const controlla of anelli) controlla(articolo); // scorre la catena
    return true; // tutti gli anelli superati
}

// --- DEMO ---
function main() {
    console.log('=== 007 BEHAVIORAL ===\n');

    // Strategy
    console.log('STRATEGY (movimenti magazzino):');
    let giacenza = 100;
    giacenza = applicaMovimento(giacenza, 'Carico', 20);    console.log('   dopo Carico +20   →', giacenza);
    giacenza = applicaMovimento(giacenza, 'Scarico', 15);   console.log('   dopo Scarico -15  →', giacenza);
    giacenza = applicaMovimento(giacenza, 'Rettifica', 50); console.log('   dopo Rettifica=50 →', giacenza);

    // Observer
    console.log('\nOBSERVER (avviso più iscritti al cambio stato):');
    const eventi = new EventiArticolo();
    eventi.iscriviti(e => console.log('   📝 LOG   :', e))
          .iscriviti(e => console.log('   📧 MAIL  :', 'notifico responsabile per', e.codice));
    eventi.notifica({ codice: 'A001', nuovoStato: 'produzione' });

    // Chain of responsibility
    console.log('\nCHAIN (catena di validazioni):');
    try {
        pipelineValidazioni({ codice: 'A001', descrizione: 'Boccola PU' });
        console.log('   ✅ articolo valido (tutti gli anelli superati)');
        pipelineValidazioni({ codice: 'A002', descrizione: '' }); // fallirà
    } catch (e) {
        console.log('   ❌ validazione fallita:', e.message);
    }
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   applicaMovimento(g,t,q)   STRATEGY: sceglie il comportamento da una mappa
//   EventiArticolo            OBSERVER: iscriviti/notifica (bus di eventi)
//   pipelineValidazioni(a)    CHAIN: catena di validatori in sequenza
// ============================================================================

module.exports = { applicaMovimento, EventiArticolo, pipelineValidazioni };
