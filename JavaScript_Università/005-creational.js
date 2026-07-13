// ============================================================================
//  005 — CREATIONAL DESIGN PATTERN (pattern di CREAZIONE)
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  I pattern CREAZIONALI rispondono a UNA domanda: "come creo gli oggetti nel
//  modo giusto?". Invece di sparpagliare `new ...` ovunque, centralizzi la
//  creazione così puoi cambiarla in un posto solo.
//
//  1) SINGLETON — di una certa cosa deve esistere UNA SOLA istanza in tutta
//     l'app, condivisa da tutti. Esempio reale nel tuo ERP: il PrismaClient!
//     Se ne creassi uno per file apriresti decine di connessioni al DB. Ne
//     tieni UNO e lo riusi. → funzione getPrisma() qui sotto.
//
//  2) FACTORY (fabbrica) — una funzione che CREA l'oggetto per te, applicando
//     valori di default e regole, così non devi ricordarti tutti i campi ogni
//     volta. "Dammi un articolo" → la factory te lo crea già ben formato.
//
//  3) BUILDER (costruttore passo-passo) — quando un oggetto ha TANTI campi
//     opzionali, invece di un costruttore con 15 parametri, lo costruisci a
//     pezzi con metodi concatenati (.con...().con...().build()). Leggibile e
//     flessibile. Perfetto per il tuo Articolo che ha decine di campi.
// ============================================================================

// --- 1) SINGLETON ---
// Teniamo l'istanza in una variabile di modulo: la prima chiamata la crea, le
// successive restituiscono SEMPRE la stessa. (Qui è un finto client per non
// dipendere dal DB; nel backend vero dentro ci sarebbe new PrismaClient().)
let _istanza = null;
function getPrisma() {
    if (_istanza === null) {
        console.log('   🔌 (creo l\'unica istanza — succede una volta sola)');
        _istanza = { nome: 'PrismaClient-finto', creatoAlle: 'ora' }; // new PrismaClient() nel reale
    }
    return _istanza;
}

// --- 2) FACTORY ---
// Crea un articolo già ben formato: applica i default e garantisce i campi
// minimi. Chi chiama non deve conoscere tutti i campi del model.
function creaArticolo({ codice, descrizione = 'Senza descrizione', stato = 'preventivo' } = {}) {
    if (!codice) throw new Error('creaArticolo: il codice è obbligatorio');
    return {
        codice,
        descrizione,
        stato,
        attivo: true,          // default applicato dalla factory
        creatoDa: 'factory',
    };
}

// --- 3) BUILDER ---
// Costruisce un Articolo complesso pezzo per pezzo. Ogni metodo restituisce
// `this` così puoi concatenare le chiamate (fluent interface).
class ArticoloBuilder {
    constructor(codice) {
        this._art = { codice }; // parto dal minimo indispensabile
    }
    conDescrizione(d) { this._art.descrizione = d; return this; }
    conStato(s)       { this._art.stato = s;       return this; }
    conPeso(kg)       { this._art.peso_netto = kg; return this; }
    conDimensioni(l, larg, h) {
        this._art.dim_lung = l; this._art.dim_larg = larg; this._art.dim_alt = h;
        return this;
    }
    build() { return { ...this._art }; } // restituisce una COPIA (immutabile)
}

// --- DEMO ---
function main() {
    console.log('=== 005 CREATIONAL ===\n');

    // Singleton: due chiamate → stessa identica istanza
    console.log('SINGLETON:');
    const a = getPrisma();
    const b = getPrisma();
    console.log('   stessa istanza?', a === b); // true

    // Factory
    console.log('\nFACTORY:');
    console.log('  ', creaArticolo({ codice: 'A001', descrizione: 'Boccola' }));

    // Builder
    console.log('\nBUILDER:');
    const articolo = new ArticoloBuilder('A999')
        .conDescrizione('Rullo speciale')
        .conStato('produzione')
        .conPeso(4.2)
        .conDimensioni(100, 50, 50)
        .build();
    console.log('  ', articolo);
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   getPrisma()          SINGLETON: unica istanza condivisa (come il PrismaClient)
//   creaArticolo(dati)   FACTORY: crea un articolo con default e validazione
//   ArticoloBuilder      BUILDER: costruzione passo-passo con metodi concatenati
// ============================================================================

module.exports = { getPrisma, creaArticolo, ArticoloBuilder };
