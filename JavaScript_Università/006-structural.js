// ============================================================================
//  006 — STRUCTURAL DESIGN PATTERN (pattern STRUTTURALI)
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  I pattern STRUTTURALI rispondono a: "come metto insieme oggetti e classi per
//  formare strutture più grandi, senza fare un groviglio?". Riguardano la FORMA
//  del codice, come i pezzi si incastrano.
//
//  1) ADAPTER (adattatore) — fa parlare due cose con "prese" diverse. Come
//     l'adattatore per la presa elettrica all'estero. Nel tuo ERP: i dati che
//     arrivano da ARCA hanno nomi di campo diversi dai tuoi (es. "COD_ART" vs
//     "articolo_poly"). L'Adapter traduce il formato ARCA nel TUO formato.
//
//  2) DECORATOR (decoratore) — AGGIUNGE un comportamento a una funzione/oggetto
//     SENZA modificarne il codice, "avvolgendolo". Esempio classico: prendo una
//     funzione e la avvolgo per farle stampare un log ogni volta che viene
//     chiamata, senza toccare la funzione originale.
//
//  3) FACADE (facciata) — offre UN'interfaccia semplice davanti a un sistema
//     complicato. Dietro ci sono 10 operazioni; tu esponi UN metodo `caricaMerce()`
//     che le orchestra. Chi lo usa non deve sapere cosa succede dentro.
// ============================================================================

// --- 1) ADAPTER ---
// Un record "grezzo" come arriva da ARCA (nomi diversi, maiuscoli).
// L'adapter lo traduce nel formato del nostro model Articolo.
function ArcaAdapter(recordArca) {
    return {
        codice:      recordArca.COD_ART,      // ARCA "COD_ART"  → nostro "codice"
        descrizione: recordArca.DESCR,        // ARCA "DESCR"    → nostro "descrizione"
        peso_netto:  Number(recordArca.PESO), // ARCA stringa    → nostro numero
        codice_ARCA: recordArca.ID_AR,        // teniamo il riferimento originale
    };
}

// --- 2) DECORATOR ---
// Avvolge una funzione qualsiasi aggiungendo un log prima e dopo, senza
// modificarne il corpo. `fn` resta intatta; ne restituiamo una versione "decorata".
function conLog(nome, fn) {
    return function (...args) {
        console.log(`   ➡️  chiamo ${nome}(${args.join(', ')})`);
        const risultato = fn(...args);      // eseguo la funzione originale
        console.log(`   ⬅️  ${nome} ha restituito ${risultato}`);
        return risultato;
    };
}

// --- 3) FACADE ---
// Dietro le quinte "caricare merce" richiede più passi (valida, aggiorna
// giacenza, registra movimento). La facade li nasconde dietro UN metodo.
class MagazzinoFacade {
    constructor() { this.giacenza = 0; this.movimenti = []; }

    // metodi "interni" (i passi complicati)
    _valida(qta) { if (qta <= 0) throw new Error('quantità non valida'); }
    _aggiornaGiacenza(qta) { this.giacenza += qta; }
    _registraMovimento(qta) { this.movimenti.push({ tipo: 'Carico', qta }); }

    // UNICO metodo pubblico e semplice: orchestra i passi interni
    caricaMerce(qta) {
        this._valida(qta);
        this._aggiornaGiacenza(qta);
        this._registraMovimento(qta);
        console.log(`   📦 caricata merce: +${qta} (giacenza ora: ${this.giacenza})`);
        return this.giacenza;
    }
}

// --- DEMO ---
function main() {
    console.log('=== 006 STRUCTURAL ===\n');

    // Adapter
    console.log('ADAPTER (ARCA → nostro formato):');
    const daArca = { COD_ART: 'A001', DESCR: 'Boccola PU', PESO: '1.20', ID_AR: 'AR-777' };
    console.log('  ', ArcaAdapter(daArca));

    // Decorator
    console.log('\nDECORATOR (aggiungo log senza toccare la funzione):');
    const somma = (a, b) => a + b;
    const sommaConLog = conLog('somma', somma);
    sommaConLog(3, 4);

    // Facade
    console.log('\nFACADE (un metodo semplice nasconde 3 passi):');
    const magazzino = new MagazzinoFacade();
    magazzino.caricaMerce(10);
    magazzino.caricaMerce(5);
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   ArcaAdapter(record)     ADAPTER: traduce un record ARCA nel nostro formato
//   conLog(nome, fn)        DECORATOR: avvolge una funzione aggiungendo log
//   MagazzinoFacade         FACADE: un metodo semplice nasconde passi complessi
// ============================================================================

module.exports = { ArcaAdapter, conLog, MagazzinoFacade };
