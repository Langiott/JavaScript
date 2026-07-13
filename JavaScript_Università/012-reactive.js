// ============================================================================
//  012 — REACTIVE PROGRAMMING (stile Rx) + esempi front-end / back-end
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  La PROGRAMMAZIONE REATTIVA tratta i dati come FLUSSI (stream) che scorrono
//  nel tempo, e tu descrivi COSA fare quando arriva ogni valore. È il map/
//  filter/reduce (file 002) ma applicato a valori che arrivano UNO ALLA VOLTA,
//  anche in momenti diversi (eventi, click, messaggi dal server...).
//
//  Differenza chiave con un array:
//   · un ARRAY ce l'hai tutto ORA (dati "fermi").
//   · uno STREAM te li porta nel TEMPO (dati "in movimento": un movimento di
//     magazzino ora, un altro tra 2 secondi, ecc.).
//
//  OBSERVABLE = la "sorgente" di uno stream. Ti ci ISCRIVI (subscribe) e da quel
//  momento ricevi i valori mano a mano che arrivano. Su di essi applichi
//  OPERATORI (map, filter...) che trasformano il flusso, come una catena di
//  tubi. Questa è l'idea alla base di RxJS (la libreria "Rx" per JS/TS).
//
//  ESEMPI D'USO
//   · FRONT-END: reagire ai click/input dell'utente, o a dati che arrivano dal
//     server in tempo reale (es. lista timbrature che si aggiorna da sola).
//   · BACK-END: reagire a un flusso di eventi (movimenti di magazzino che
//     arrivano, notifiche, messaggi) filtrandoli e trasformandoli al volo.
//
//  Qui costruiamo un MINI-Observable "fatto in casa" (senza installare RxJS)
//  per capire il meccanismo dal vivo. In produzione useresti la libreria rxjs.
// ============================================================================

// OBSERVABLE minimale: incapsula una funzione che, dato un "osservatore"
// ({ next, complete }), gli consegna i valori. È il cuore di Rx in 5 righe.
function Observable(produttore) {
    return {
        subscribe(osservatore) { produttore(osservatore); },

        // OPERATORE map: restituisce un NUOVO observable con i valori trasformati
        map(fn) {
            return Observable((obs) => {
                produttore({
                    next: (v) => obs.next(fn(v)),   // trasformo prima di consegnare
                    complete: () => obs.complete?.(),
                });
            });
        },

        // OPERATORE filter: lascia passare solo i valori che superano il test
        filter(test) {
            return Observable((obs) => {
                produttore({
                    next: (v) => { if (test(v)) obs.next(v); },
                    complete: () => obs.complete?.(),
                });
            });
        },
    };
}

// crea un Observable che emette i valori di un array, uno per uno.
function fromArray(valori) {
    return Observable((obs) => {
        valori.forEach(v => obs.next(v));
        obs.complete?.();
    });
}

// helper leggibili (equivalenti agli operatori "sciolti" di Rx)
function mapOp(observable, fn)    { return observable.map(fn); }
function filterOp(observable, fn) { return observable.filter(fn); }
function subscribe(observable, onNext, onComplete) {
    observable.subscribe({ next: onNext, complete: onComplete });
}

// Esempio ERP: uno STREAM di movimenti di magazzino. Voglio, dei soli carichi,
// la giacenza aggiornata passo passo. Catena filter → map, come una pipeline.
function demoStreamMovimenti() {
    const movimenti = [
        { tipo: 'Carico',  qta: 10 },
        { tipo: 'Scarico', qta: 4 },
        { tipo: 'Carico',  qta: 5 },
        { tipo: 'Rettifica', qta: 0 },
    ];

    let giacenza = 0;

    fromArray(movimenti)
        .filter(m => m.tipo === 'Carico')     // solo i carichi
        .map(m => m.qta)                      // mi interessa solo la quantità
        .subscribe({
            next: (qta) => {
                giacenza += qta;              // reagisco a ogni valore che arriva
                console.log(`   📈 arrivato carico +${qta} → giacenza ${giacenza}`);
            },
            complete: () => console.log('   ✅ stream terminato, giacenza finale:', giacenza),
        });

    return giacenza;
}

// Esempio "front-end simulato": uno stream di eventi utente (input di ricerca).
// Filtro le ricerche troppo corte e le normalizzo — come faresti su una barra
// di ricerca articoli che reagisce mentre l'utente digita.
function demoStreamRicerca() {
    const battute = ['a', 'ar', 'art', 'artic', 'articolo'];
    fromArray(battute)
        .filter(t => t.length >= 3)          // ignora input troppo corti
        .map(t => t.toUpperCase())           // normalizzo
        .subscribe({
            next: (query) => console.log('   🔎 cerco articoli con:', query),
        });
}

// --- DEMO ---
function main() {
    console.log('=== 012 REACTIVE (stile Rx) ===\n');

    console.log('BACK-END — stream di movimenti magazzino:');
    demoStreamMovimenti();

    console.log('\nFRONT-END (simulato) — stream di ricerca mentre digiti:');
    demoStreamRicerca();
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   Observable(produttore)       mini-Observable con .map e .filter (cuore di Rx)
//   fromArray(valori)            crea uno stream dai valori di un array
//   mapOp(obs, fn)               operatore map "sciolto" (helper)
//   filterOp(obs, fn)            operatore filter "sciolto" (helper)
//   subscribe(obs, next, compl)  iscrizione allo stream (helper)
//   demoStreamMovimenti()        stream ERP: carichi → giacenza progressiva
//   demoStreamRicerca()          stream front-end: ricerca reattiva mentre digiti
// ============================================================================

module.exports = { Observable, fromArray, mapOp, filterOp, subscribe, demoStreamMovimenti, demoStreamRicerca };
