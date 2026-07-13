// ============================================================================
//  003 — FP AVANZATA: CURRYING, FUNCTOR, MONAD (le "parole difficili")
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  Queste parole spaventano ma le idee sono semplici. Andiamo per gradi.
//
//  1) CURRYING — trasformare una funzione a più argomenti in una CATENA di
//     funzioni a un argomento ciascuna.
//        normale:  somma(a, b)         → somma(2, 3)
//        curried:  somma(a)(b)         → somma(2)(3)
//     A che serve? A "pre-impostare" un argomento e ottenere una funzione
//     specializzata:
//        const aggiungiIVA = moltiplica(1.22);  // fisso il primo arg
//        aggiungiIVA(100) → 122
//     Nel tuo ERP: "prezzo con questo listino", "sconto di questo cliente"...
//
//  2) FUNCTOR — parola grossa per un concetto minuscolo: è "una scatola con un
//     .map()". Un array È un functor: ha .map() che applica una funzione al
//     contenuto SENZA aprire la scatola. Regola: map non cambia il "tipo di
//     scatola", cambia solo il contenuto. [1,2,3].map(x=>x*2) → [2,4,6].
//     Costruiamo una nostra scatola-functor (Identity) per vederlo dal vivo.
//
//  3) MONAD — un functor "potenziato": oltre a .map() ha un modo di
//     CONCATENARE operazioni che possono "fallire" o "non esserci", senza
//     riempire il codice di if/null-check. L'esempio classico è MAYBE:
//     rappresenta "un valore che POTREBBE non esserci" (come un articolo che
//     magari non esiste). Concateni operazioni e se a un certo punto manca il
//     valore, il resto viene saltato automaticamente. Niente `if (x == null)`.
//     (Le Promise sono monadi: `.then` concatena operazioni async — vedi 011.)
//
//  4) INTEGRAZIONE FP + OOP — non sono nemici. Puoi avere una CLASSE (OOP) i
//     cui metodi sono puri e restituiscono nuove istanze invece di mutare
//     (stile immutabile). Lo mostriamo con `Contatore`.
// ============================================================================

// --- 1) CURRYING ---

// curry generico: trasforma f(a,b) in f(a)(b). (versione a 2 argomenti)
function curry(fn) {
    return (a) => (b) => fn(a, b);
}

// versione "scritta a mano" per capire cosa fa curry() sotto: ogni chiamata
// restituisce una funzione che aspetta il prossimo argomento.
function curryManuale(a) {
    return function (b) {
        return a + b;
    };
}

// --- 2) FUNCTOR: una "scatola con map" ---

// Identity: la scatola più semplice. Contiene un valore e sa applicargli una
// funzione con .map(), restituendo una NUOVA scatola (immutabile).
function Identity(valore) {
    return {
        valore,
        map(fn) { return Identity(fn(valore)); }, // applico dentro, resto scatola
        toString() { return `Identity(${valore})`; },
    };
}

function demoFunctor() {
    // stessa "regola" di [].map, ma sulla nostra scatola
    const risultato = Identity(10).map(x => x + 5).map(x => x * 2);
    console.log('📦 functor Identity(10).map(+5).map(*2) =', risultato.valore); // 30
    return risultato.valore;
}

// --- 3) MONAD: Maybe (valore che potrebbe non esserci) ---

// Maybe incapsula "c'è un valore" (Just) oppure "niente" (Nothing).
// .map applica la funzione SOLO se il valore c'è; altrimenti resta Nothing.
function Maybe(valore) {
    const vuoto = valore === null || valore === undefined;
    return {
        vuoto,
        valore,
        // se vuoto, salta tutto; altrimenti applica e re-impacchetta
        map(fn) { return vuoto ? Maybe(null) : Maybe(fn(valore)); },
        // "or else": valore di default se dentro non c'è niente
        orElse(def) { return vuoto ? def : valore; },
    };
}

// helper leggibile
function mapMaybe(maybe, fn) { return maybe.map(fn); }

function demoMonad() {
    // Caso reale ERP: cerco un articolo (potrebbe non esistere) e ne voglio il
    // codice in maiuscolo. SENZA Maybe servirebbero più if (articolo == null).
    const trovato   = Maybe({ codice: 'a001' });
    const nonTrovato = Maybe(null);

    const r1 = trovato.map(a => a.codice).map(c => c.toUpperCase()).orElse('(assente)');
    const r2 = nonTrovato.map(a => a.codice).map(c => c.toUpperCase()).orElse('(assente)');

    console.log('🎁 monad Maybe — trovato    →', r1); // A001
    console.log('🎁 monad Maybe — non trovato →', r2); // (assente) — nessun crash!
    return { r1, r2 };
}

// --- 4) FP + OOP: classe con metodi immutabili ---

// Contatore: è una CLASSE (OOP) ma "incrementa" NON muta this: restituisce una
// nuova istanza (stile funzionale/immutabile). Il meglio dei due mondi.
class Contatore {
    constructor(valore = 0) { this.valore = valore; }
    incrementa(di = 1) { return new Contatore(this.valore + di); } // niente mutazione
}

// --- DEMO ---
function main() {
    console.log('=== 003 FUNZIONALE — AVANZATO ===\n');

    // currying
    const moltiplica = (a, b) => a * b;
    const aggiungiIVA = curry(moltiplica)(1.22);   // fisso il fattore IVA
    console.log('💶 aggiungiIVA(100) =', aggiungiIVA(100).toFixed(2)); // 122.00
    console.log('➕ curryManuale(2)(3) =', curryManuale(2)(3));         // 5

    // functor
    demoFunctor();

    // monad
    demoMonad();

    // fp + oop
    const c = new Contatore().incrementa().incrementa(5); // 0 → 1 → 6
    console.log('🧱 Contatore immutabile → valore =', c.valore);
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   curry(fn)            trasforma f(a,b) in f(a)(b)
//   curryManuale(a)      currying scritto a mano (didattico)
//   Identity(valore)     functor minimale (scatola con .map)
//   demoFunctor()        map che resta "nella scatola"
//   Maybe(valore)        monad per valori che potrebbero mancare
//   mapMaybe(maybe, fn)  helper leggibile su Maybe
//   demoMonad()          concatena operazioni saltando i valori assenti
//   Contatore            classe OOP con metodi immutabili (FP+OOP)
// ============================================================================

module.exports = { curry, curryManuale, Identity, demoFunctor, Maybe, mapMaybe, demoMonad, Contatore };
