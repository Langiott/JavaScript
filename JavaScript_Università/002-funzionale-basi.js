// ============================================================================
//  002 — PROGRAMMAZIONE FUNZIONALE: LE BASI
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  La programmazione funzionale (FP) tratta le FUNZIONI come mattoni: le passi
//  in giro, le componi, le restituisci. Poggia su poche idee forti:
//
//  1) FUNZIONE PURA — dato lo stesso input, dà SEMPRE lo stesso output e NON
//     tocca nulla fuori (non stampa, non scrive su DB, non cambia variabili
//     esterne). È prevedibile e facile da testare.
//        pura:    (a, b) => a + b
//        impura:  () => new Date()   // dipende dal tempo → output diverso ogni volta
//
//  2) IMMUTABILITÀ — non modifichi i dati esistenti, ne crei di nuovi.
//     Invece di "aggiungi a questa lista", fai "dammi una NUOVA lista con in più".
//     Evita bug del tipo "qualcuno ha cambiato il mio array sotto il naso".
//
//  3) FUNZIONI DI ORDINE SUPERIORE (higher-order) — funzioni che prendono o
//     restituiscono altre funzioni. Le tre regine:
//        · map    — TRASFORMA ogni elemento         [1,2,3] → [2,4,6]
//        · filter — SELEZIONA gli elementi           [1,2,3,4] → [2,4]
//        · reduce — RIDUCE la lista a un valore solo [1,2,3] → 6
//
//  4) LAMBDA CALCOLO (cenni) — la teoria matematica dietro la FP (Church, 1930).
//     Idea base: TUTTO è una funzione di un argomento. Una funzione a più
//     argomenti si scrive come funzione che ne restituisce un'altra:
//        f(x, y)  diventa  f(x)(y)     ← questo si chiama CURRYING (vedi file 003)
//     Le arrow function di JS `x => y => x + y` SONO lambda calcolo in pratica.
//
//  Perché ti interessa nell'ERP: quando elabori liste di articoli/timbrature/
//  movimenti, map/filter/reduce sostituiscono cicli for pieni di bug e rendono
//  il codice leggibile come una frase.
// ============================================================================

// --- Funzioni pure semplici ---

// PURA: stesso input → stesso output, nessun effetto collaterale.
function raddoppia(n) {
    return n * 2;
}

// PURA: somma una lista SENZA modificarla (reduce).
function sommaLista(numeri) {
    return numeri.reduce((acc, n) => acc + n, 0);
}

// --- Immutabilità ---

// Mostra la differenza tra mutare (male) e creare nuovo (bene).
function demoImmutabilita() {
    const articoli = ['A001', 'A002'];

    // ❌ MUTABILE: push modifica l'array originale (chi lo condivide se ne accorge)
    // articoli.push('A003');

    // ✅ IMMUTABILE: creo un NUOVO array, l'originale resta intatto
    const conNuovo = [...articoli, 'A003'];

    console.log('🧊 immutabilità → originale:', articoli, '| nuovo:', conNuovo);
    return { originale: articoli, nuovo: conNuovo };
}

// Mostra pura vs impura affiancate.
function demoPure() {
    const pura   = (a, b) => a + b;          // prevedibile
    const impura = () => Math.floor(1 + 1);  // qui è deterministica, ma se usasse
                                             // Date/random/DB sarebbe impura
    console.log('🎯 pura(2,3) =', pura(2, 3), '(sempre 5)');
    console.log('🎯 impura() =', impura(), '(dipenderebbe dal mondo esterno)');
    return { pura, impura };
}

// --- Le tre regine: map, filter, reduce ---

// MAP — trasforma ogni elemento. Qui: articoli → loro codici in maiuscolo.
function demoMap() {
    const articoli = [{ codice: 'a001' }, { codice: 'a002' }];
    const codici = articoli.map(a => a.codice.toUpperCase()); // TRASFORMA
    console.log('🔁 map →', codici); // ['A001', 'A002']
    return codici;
}

// FILTER — tiene solo gli elementi che passano un test. Qui: solo attivi.
function demoFilter() {
    const articoli = [
        { codice: 'A001', attivo: true },
        { codice: 'A002', attivo: false },
        { codice: 'A003', attivo: true },
    ];
    const attivi = articoli.filter(a => a.attivo); // SELEZIONA
    console.log('🧹 filter → attivi:', attivi.map(a => a.codice)); // ['A001','A003']
    return attivi;
}

// REDUCE — riduce la lista a un valore solo. Qui: peso totale di più articoli.
function demoReduce() {
    const articoli = [{ peso: 1.5 }, { peso: 2.0 }, { peso: 0.5 }];
    const pesoTotale = articoli.reduce((acc, a) => acc + a.peso, 0); // RIDUCE
    console.log('➗ reduce → peso totale =', pesoTotale, 'kg'); // 4
    return pesoTotale;
}

// PIPELINE — il vero potere: concateno map+filter+reduce come una catena.
// "Dei movimenti di solo carico, somma le quantità raddoppiate" (esempio).
function pipeline() {
    const movimenti = [
        { tipo: 'Carico',  quantita: 10 },
        { tipo: 'Scarico', quantita: 5 },
        { tipo: 'Carico',  quantita: 3 },
    ];
    const risultato = movimenti
        .filter(m => m.tipo === 'Carico')  // 1. solo i carichi
        .map(m => m.quantita * 2)          // 2. raddoppio la quantità
        .reduce((acc, q) => acc + q, 0);   // 3. sommo tutto
    console.log('🚚 pipeline (carichi×2 sommati) =', risultato); // (10+3)*2 = 26
    return risultato;
}

// --- DEMO ---
function main() {
    console.log('=== 002 FUNZIONALE — BASI ===\n');
    console.log('raddoppia(21) =', raddoppia(21));
    console.log('sommaLista([1,2,3,4]) =', sommaLista([1, 2, 3, 4]));
    demoImmutabilita();
    demoPure();
    demoMap();
    demoFilter();
    demoReduce();
    pipeline();
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   raddoppia(n)          esempio di funzione pura
//   sommaLista(numeri)    somma pura via reduce
//   demoImmutabilita()    mutare vs creare-nuovo (spread)
//   demoPure()            pura vs impura affiancate
//   demoMap()             map: trasforma ogni elemento
//   demoFilter()          filter: seleziona elementi
//   demoReduce()          reduce: collassa la lista in un valore
//   pipeline()            catena map+filter+reduce sui movimenti
// ============================================================================

module.exports = { raddoppia, sommaLista, demoImmutabilita, demoPure, demoMap, demoFilter, demoReduce, pipeline };
