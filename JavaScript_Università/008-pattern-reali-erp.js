// ============================================================================
//  008 — DESIGN PATTERN IN CONTESTI REALI (architettura dell'ERP)
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  Qui mettiamo insieme i pattern per mostrare COME si struttura davvero un
//  modulo del gestionale. L'architettura classica di un backend è a STRATI:
//
//     CONTROLLER  →  riceve la richiesta HTTP, valida l'input, risponde
//         ↓
//     SERVICE     →  la LOGICA di business (regole, transazioni multi-tabella)
//         ↓
//     REPOSITORY  →  le operazioni sul database (una tabella)
//         ↓
//     DATABASE (Prisma)
//
//  Perché a strati? Ognuno ha UNA responsabilità:
//   · REPOSITORY (pattern Repository) — l'unico che "parla" col DB. Se cambi
//     ORM, tocchi solo qui. Il resto dell'app non sa che esiste Prisma.
//   · SERVICE — coordina più operazioni come un'unica azione sensata ("crea
//     articolo E registra il movimento iniziale"), in transazione se serve.
//   · CONTROLLER — sottile: prende i dati HTTP, chiama il service, risponde.
//
//  In questo file NON tocchiamo il DB reale: il repository usa un array in
//  memoria, così il file gira subito. Ma la STRUTTURA è identica a quella vera:
//  per passare al DB reale basta sostituire il corpo dei metodi del repository
//  con chiamate prisma.articolo.* (create/findMany/update...).
//
//  Riusiamo anche la STRATEGY dei movimenti (file 007) dentro il service.
// ============================================================================

// --- REPOSITORY (accesso ai dati) ---
// Nel reale: dentro i metodi ci sarebbe prisma.articolo.create/findMany/...
// Qui: un array in memoria che finge il DB.
class ArticoloRepository {
    constructor() {
        this._db = [];        // finto "database"
        this._nextId = 1;     // finto autoincrement
    }
    create(dati) {
        const record = { id: this._nextId++, giacenza: 0, ...dati };
        this._db.push(record);                    // ≈ prisma.articolo.create
        return record;
    }
    findById(id) {
        return this._db.find(a => a.id === id) ?? null; // ≈ prisma.articolo.findUnique
    }
    update(id, dati) {
        const art = this.findById(id);
        if (!art) throw new Error(`articolo id=${id} non trovato`);
        Object.assign(art, dati);                 // ≈ prisma.articolo.update
        return art;
    }
    all() { return [...this._db]; }               // ≈ prisma.articolo.findMany
}

// --- STRATEGY (riuso dei movimenti dal file 007) ---
const strategieMovimento = {
    Carico:    (g, q) => g + q,
    Scarico:   (g, q) => g - q,
    Rettifica: (g, q) => q,
};

// --- SERVICE (logica di business) ---
// Coordina il repository + le strategie. È QUI che vivono le regole:
// "un movimento aggiorna la giacenza dell'articolo". Il controller non lo sa;
// il repository non lo sa: la regola sta nel service, il posto giusto.
class ArticoloService {
    constructor(repository) { this.repo = repository; } // dependency injection

    creaArticolo(dati) {
        if (!dati.codice) throw new Error('codice obbligatorio'); // regola di business
        return this.repo.create(dati);
    }

    // Applica un movimento all'articolo aggiornando la giacenza (usa Strategy).
    registraMovimento(articoloId, tipo, quantita) {
        const articolo = this.repo.findById(articoloId);
        if (!articolo) throw new Error(`articolo id=${articoloId} non trovato`);

        const strategia = strategieMovimento[tipo];
        if (!strategia) throw new Error(`tipo movimento sconosciuto: ${tipo}`);

        const nuovaGiacenza = strategia(articolo.giacenza, quantita);
        if (nuovaGiacenza < 0) throw new Error('giacenza non può andare sotto zero'); // regola!

        return this.repo.update(articoloId, { giacenza: nuovaGiacenza });
    }
}

// --- CONTROLLER (simulato) ---
// Nel reale sarebbe una route Express: (req, res) => { ...res.json(...) }.
// Qui simuliamo "arriva una richiesta" chiamando il service e stampando l'esito.
function simulaControllerCreazione(service, corpoRichiesta) {
    try {
        const creato = service.creaArticolo(corpoRichiesta);
        console.log('   201 Created →', creato);
        return creato;
    } catch (e) {
        console.log('   400 Bad Request →', e.message);
        return null;
    }
}

// --- DEMO ---
function main() {
    console.log('=== 008 PATTERN REALI (Repository + Service + Strategy) ===\n');

    // monto gli strati (come farebbe l'app all'avvio)
    const repo = new ArticoloRepository();
    const service = new ArticoloService(repo);

    console.log('CONTROLLER → SERVICE → REPOSITORY:');
    const art = simulaControllerCreazione(service, { codice: 'A001', descrizione: 'Boccola PU' });
    simulaControllerCreazione(service, { descrizione: 'senza codice' }); // fallisce (regola)

    console.log('\nMOVIMENTI (Strategy dentro il Service):');
    service.registraMovimento(art.id, 'Carico', 30);
    service.registraMovimento(art.id, 'Scarico', 10);
    console.log('   giacenza finale:', repo.findById(art.id).giacenza); // 20

    try {
        service.registraMovimento(art.id, 'Scarico', 999); // viola "no sotto zero"
    } catch (e) {
        console.log('   regola di business →', e.message);
    }
}

main();

// ============================================================================
//  ELENCO FUNZIONI / CLASSI
//   ArticoloRepository            REPOSITORY: accesso ai dati (≈ Prisma)
//   strategieMovimento            STRATEGY: mappa dei comportamenti movimento
//   ArticoloService               SERVICE: logica di business + transazioni
//   simulaControllerCreazione()   CONTROLLER simulato: HTTP → service → risposta
// ============================================================================

module.exports = { ArticoloRepository, strategieMovimento, ArticoloService, simulaControllerCreazione };
