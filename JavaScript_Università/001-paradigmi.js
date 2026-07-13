// ============================================================================
//  001 — PANORAMICA SUI PARADIGMI DI PROGRAMMAZIONE
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  Un PARADIGMA è un "modo di pensare" il programma: lo stile con cui organizzi
//  le istruzioni. Lo stesso problema si può risolvere in paradigmi diversi.
//
//  1) IMPERATIVO — dici al computer COME fare, passo per passo.
//     "Prendi un contenitore, mettici 0, per ogni numero aggiungilo, restituisci".
//     È il modo più vicino a come lavora la macchina. Usa variabili che cambiano
//     (stato mutabile) e cicli (for/while). JavaScript "classico" è imperativo.
//
//  2) FUNZIONALE (FP) — dici COSA vuoi, componendo funzioni.
//     Niente stato che cambia: dai dati in ingresso -> ottieni dati in uscita.
//     Le funzioni sono "pure" (stesso input -> stesso output, nessun effetto
//     collaterale). Esempi: map/filter/reduce. È il focus di questo corso.
//
//  3) LOGICO — dichiari FATTI e REGOLE, il motore deduce le risposte.
//     Tu non scrivi l'algoritmo: descrivi il mondo e fai domande (Prolog, SQL).
//     Curiosità: le tue query Prisma/SQL sono "dichiarative" -> parenti del logico.
//
//  4) AD OGGETTI (OOP) — organizzi il codice in OGGETTI che uniscono
//     dati (proprietà) e comportamenti (metodi). Concetti: incapsulamento,
//     ereditarietà, polimorfismo. Il tuo ERP è pieno di OOP (classi, servizi).
//
//  NB: JavaScript è MULTI-PARADIGMA: puoi mescolare imperativo, FP e OOP.
//
//  --------------------------------------------------------------------------
//  PROGRAMMAZIONE CONCORRENTE (fare più cose "insieme")
//  --------------------------------------------------------------------------
//  · MULTI-THREADED — più fili di esecuzione paralleli sulla stessa memoria.
//    Potente ma pericoloso (due thread che toccano lo stesso dato -> bug).
//  · AD EVENTI (event-driven) — un unico ciclo che reagisce a eventi
//    ("è arrivata una richiesta", "il file è pronto"). È il modello di Node.js.
//  · AD ATTORI — tanti "attori" indipendenti che NON condividono memoria e si
//    parlano solo con messaggi (Erlang, Akka). Niente dati condivisi = niente
//    corse critiche.
//  · REATTIVA — il programma è una rete di flussi di dati (stream) che si
//    aggiornano da soli quando la sorgente cambia (RxJS). Vedi file 012.
//
//  Node.js (e quindi il tuo backend) usa il modello AD EVENTI su singolo thread.
// ============================================================================

// Stampa una descrizione breve di un paradigma (comodo per ripasso a console).
function descriviParadigma(nome) {
    const schede = {
        imperativo: 'COME farlo, passo-passo, con stato mutabile e cicli.',
        funzionale: 'COSA vuoi, componendo funzioni pure senza stato mutabile.',
        logico:     'Dichiari fatti/regole; il motore DEDUCE le risposte (SQL/Prolog).',
        oop:        'Oggetti che uniscono dati + comportamenti (incapsulamento, ereditarietà).',
    };
    const testo = schede[nome] ?? '(paradigma sconosciuto)';
    console.log(`📘 ${nome.toUpperCase()}: ${testo}`);
    return testo;
}

// Stesso problema — "somma dei numeri" — risolto nei vari stili.

// IMPERATIVO: dico i passi, uso una variabile che cambia (accumulatore).
function demoImperativo(numeri) {
    let totale = 0;                         // stato mutabile
    for (let i = 0; i < numeri.length; i++) // ciclo esplicito
        totale += numeri[i];                // modifico lo stato
    console.log('🔧 imperativo → somma =', totale);
    return totale;
}

// FUNZIONALE: nessuna variabile che cambia, compongo una funzione (reduce).
function demoFunzionale(numeri) {
    const totale = numeri.reduce((acc, n) => acc + n, 0); // niente stato esterno
    console.log('🧩 funzionale → somma =', totale);
    return totale;
}

// LOGICO (simulato): descrivo la REGOLA, non l'algoritmo. In un vero linguaggio
// logico scriveresti "somma([], 0). somma([X|R], S) :- somma(R, S1), S is X+S1."
// Qui mostro l'idea: dichiaro il fatto e faccio la domanda.
function demoLogico(numeri) {
    // "regola": la somma è definita ricorsivamente sui fatti (testa + coda)
    const somma = (lista) => lista.length === 0 ? 0 : lista[0] + somma(lista.slice(1));
    const risultato = somma(numeri);
    console.log('🧠 logico (stile dichiarativo) → somma =', risultato);
    return risultato;
}

// OOP: un oggetto "Calcolatrice" che INCAPSULA lo stato e offre metodi.
function demoOOP(numeri) {
    class Calcolatrice {
        constructor() { this.totale = 0; }      // stato incapsulato nell'oggetto
        aggiungi(n) { this.totale += n; return this; } // metodo (this = l'oggetto)
    }
    const calc = new Calcolatrice();
    numeri.forEach(n => calc.aggiungi(n));
    console.log('🧱 oop → somma =', calc.totale);
    return calc.totale;
}

// Descrive a parole i modelli di concorrenza (nessun calcolo, solo ripasso).
function panoramicaConcorrenza() {
    const modelli = {
        'multi-threaded': 'più thread, memoria condivisa → veloce ma rischio corse critiche',
        'ad eventi':      'un solo thread + event loop → il modello di Node.js',
        'ad attori':      'attori isolati che si scambiano messaggi → niente memoria condivisa',
        'reattiva':       'flussi (stream) che si aggiornano da soli → RxJS',
    };
    console.log('\n⚙️  MODELLI DI CONCORRENZA:');
    for (const [nome, desc] of Object.entries(modelli)) console.log(`   • ${nome}: ${desc}`);
    return modelli;
}

// --- DEMO ---
function main() {
    console.log('=== 001 PARADIGMI ===\n');
    ['imperativo', 'funzionale', 'logico', 'oop'].forEach(descriviParadigma);

    const numeri = [10, 20, 30, 40];
    console.log('\nStesso problema (somma) in 4 paradigmi, dati =', numeri);
    demoImperativo(numeri);
    demoFunzionale(numeri);
    demoLogico(numeri);
    demoOOP(numeri);

    panoramicaConcorrenza();
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   descriviParadigma(nome)   scheda testuale di un paradigma
//   demoImperativo(numeri)    somma in stile imperativo (stato + ciclo)
//   demoFunzionale(numeri)    somma in stile funzionale (reduce)
//   demoLogico(numeri)        somma in stile dichiarativo/logico (ricorsione)
//   demoOOP(numeri)           somma con oggetto che incapsula lo stato
//   panoramicaConcorrenza()   riepilogo dei 4 modelli di concorrenza
// ============================================================================

module.exports = { descriviParadigma, demoImperativo, demoFunzionale, demoLogico, demoOOP, panoramicaConcorrenza };
