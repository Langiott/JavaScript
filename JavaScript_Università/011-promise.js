// ============================================================================
//  011 — PROMISE, ASYNC / AWAIT E CORRELATI
// ============================================================================
//
//  RIEPILOGO (semplice ma puntuale)
//  --------------------------------------------------------------------------
//  Una PROMISE è "la PROMESSA di un valore che arriverà". È una scatola che ora
//  è vuota ma prima o poi conterrà un risultato (successo) o un errore. Ha tre
//  stati: pending (in atteso) → fulfilled (riuscita) oppure rejected (fallita).
//
//  Nel tuo ERP le usi di continuo: ogni chiamata a Prisma restituisce una
//  Promise (`prisma.articolo.findMany()` non ti dà subito gli articoli, ti dà
//  la PROMESSA che arriveranno).
//
//  DUE MODI DI USARLE
//   · .then()/.catch() — "quando pronta fai...", "se fallisce fai...".
//   · async/await — più leggibile: `await` "aspetta" il valore come se fosse
//     sincrono, ma senza bloccare Node. È lo stile che usi nei controller.
//        const articoli = await prisma.articolo.findMany();
//     `await` va dentro una funzione `async`. Gli errori si prendono con
//     try/catch normale.
//
//  SEQUENZA vs PARALLELO (concetto che fa la differenza sulle performance)
//   · In SEQUENZA (await uno dopo l'altro): aspetti la 1ª, POI avvii la 2ª.
//     Tre operazioni da 1s = 3s totali.
//   · In PARALLELO (Promise.all): le avvii TUTTE insieme e aspetti che finiscano.
//     Tre operazioni da 1s = ~1s totale. Usa il parallelo quando le operazioni
//     sono indipendenti tra loro!
//
//  CORRELATI UTILI
//   · Promise.all([...])       → aspetta tutte; se UNA fallisce, fallisce tutto.
//   · Promise.allSettled([...])→ aspetta tutte e ti dice per ognuna esito/errore.
//   · Promise.race([...])      → vince la prima che finisce (utile per timeout).
// ============================================================================

// "attendi": crea una Promise che si risolve dopo `ms` millisecondi.
// È il mattoncino per simulare operazioni lente (come una query al DB).
function attendi(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simula il caricamento di un articolo dal DB: ritorna una Promise.
// (Nel reale sarebbe: return prisma.articolo.findUnique({ where: { id } }).)
async function caricaArticolo(id) {
    await attendi(300);                       // finge la latenza del DB
    if (id <= 0) throw new Error(`id ${id} non valido`); // finge un errore
    return { id, codice: `A00${id}`, descrizione: `Articolo ${id}` };
}

// SEQUENZA: carico gli articoli uno dopo l'altro (più lento, ma a volte serve
// quando l'operazione N dipende dal risultato della N-1).
async function caricaInSequenza(ids) {
    const inizio = Date.now();
    const risultati = [];
    for (const id of ids) {
        risultati.push(await caricaArticolo(id)); // aspetto ognuno prima del prossimo
    }
    console.log(`   ⏱️  sequenza: ${Date.now() - inizio}ms per ${ids.length} articoli`);
    return risultati;
}

// PARALLELO: li avvio tutti insieme con Promise.all (molto più veloce se
// indipendenti). È il pattern che useresti per caricare dati non collegati.
async function caricaInParallelo(ids) {
    const inizio = Date.now();
    const risultati = await Promise.all(ids.map(id => caricaArticolo(id))); // tutte insieme
    console.log(`   ⏱️  parallelo: ${Date.now() - inizio}ms per ${ids.length} articoli`);
    return risultati;
}

// RETRY: riprova un'operazione async che può fallire, con attesa crescente.
// Utile per DB momentaneamente occupato o rete instabile.
async function conRetry(operazione, tentativi = 3, attesaMs = 200) {
    for (let i = 1; i <= tentativi; i++) {
        try {
            return await operazione();
        } catch (e) {
            if (i === tentativi) throw e;      // esauriti i tentativi
            console.log(`   ↻ tentativo ${i} fallito (${e.message}), riprovo tra ${attesaMs * i}ms`);
            await attendi(attesaMs * i);       // backoff crescente
        }
    }
}

// --- DEMO ---
async function main() {
    console.log('=== 011 PROMISE / ASYNC-AWAIT ===\n');

    // .then vs await (stessa cosa, due stili)
    console.log('STILE .then():');
    await caricaArticolo(1).then(a => console.log('   caricato:', a.codice));

    console.log('\nSTILE async/await:');
    const a2 = await caricaArticolo(2);
    console.log('   caricato:', a2.codice);

    // sequenza vs parallelo (guarda i tempi!)
    console.log('\nSEQUENZA vs PARALLELO:');
    await caricaInSequenza([1, 2, 3]);   // ~900ms
    await caricaInParallelo([1, 2, 3]);  // ~300ms

    // gestione errore con try/catch
    console.log('\nGESTIONE ERRORE:');
    try {
        await caricaArticolo(-1);
    } catch (e) {
        console.log('   ❌ preso l\'errore:', e.message);
    }

    // retry
    console.log('\nRETRY:');
    let contatore = 0;
    const risultato = await conRetry(async () => {
        contatore++;
        if (contatore < 3) throw new Error('DB occupato');
        return 'ok al 3° tentativo';
    });
    console.log('   ✅', risultato);
}

main();

// ============================================================================
//  ELENCO FUNZIONI
//   attendi(ms)                Promise che si risolve dopo ms (mattoncino)
//   caricaArticolo(id)         finge una query async (ritorna una Promise)
//   caricaInSequenza(ids)      await in serie: più lento
//   caricaInParallelo(ids)     Promise.all: molto più veloce se indipendenti
//   conRetry(op, n, ms)        riprova con backoff crescente
// ============================================================================

module.exports = { attendi, caricaArticolo, caricaInSequenza, caricaInParallelo, conRetry };
