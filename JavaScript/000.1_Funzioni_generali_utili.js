// ============================================================================
// FUNZIONI
//   create()               crea un nuovo articolo, restituisce il record creato
//   get()                  cerca l'articolo di test e stampa il totale record
//   set(id, campo, valore) modifica UN singolo campo di un record (via id)
//   update(id, dati)       aggiorna PIÙ campi insieme (via id), passando un oggetto
//   duplicate(id)          copia i campi di un articolo in un nuovo record
//   delete(id)                cancella un record per id  (delete è parola riservata JS)
//   cleanup()              rimuove i record di test -> lo script è ri-eseguibile
//   main()                 esegue tutte le operazioni in sequenza come demo
// ============================================================================
// MODEL ARTICOLO (vedi prisma/schema.prisma, model Articolo)
//   - id            Int      PK reale (autoincrement); usata per set/update/duplicate/delete
//   - Id_AR         String?  @unique  chiave record ARCA (null per articoli creati a mano)
//   - codice_ARCA   String?  @unique  chiave per import dal vecchio DB ARCA
//   - articolo_poly String?  "codice poly" -> lo usiamo come codice logico (NON @unique)
//   - descrizione   String?  descrizione articolo (max 160 char)
//   - tipologia / stato / stati / dimensioni / pesi / note / FK (cliente, fornitore,
//     famiglia, gruppo, unita_misura...) e relazioni distinta base -> vedi schema.
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CODICE = 'TEST-A001';

// CREATE — crea un articolo e restituisce il record
async function create() {
    const articolo = await prisma.articolo.create({
        data: {
            articolo_poly: CODICE,
            descrizione: 'Articolo di test',
        },
    });
    console.log('✅ Ho creato articolo \nid:', articolo.id,"\ncodice: ", articolo.articolo_poly, "\n");
    return articolo;
}

// GET — legge (ricerca per codice logico) e stampa il totale
async function get() {
    const totale = await prisma.articolo.count();
    const articolo = await prisma.articolo.findFirst({
        where: { articolo_poly: CODICE },
    });
    console.log(`📋 get: totale=${totale}, trovato id=${articolo?.id ?? '(nessuno)'}`);
    return articolo;
}

// SET — modifica UN singolo campo di un record (via id)
async function set(id, campo, valore) {
    const articolo = await prisma.articolo.update({
        where: { id },
        data:  { [campo]: valore },
    });
    console.log(`🔧 set: id=${id}, ${campo}=${valore}`);
    return articolo;
}

// UPDATE — aggiorna PIÙ campi insieme (via id)
async function update(id, dati) {
    const articolo = await prisma.articolo.update({
        where: { id },
        data:  dati,
    });
    console.log(`✏️  update: id=${id}`, dati);
    return articolo;
}

// DUPLICATE — copia i campi di un articolo esistente in un nuovo record
async function duplicate(id) {
    const originale = await prisma.articolo.findUnique({ where: { id } });
    if (!originale) throw new Error(`duplicate: articolo id=${id} non trovato`);

    const copia = await prisma.articolo.create({
        data: {
            articolo_poly: `${originale.articolo_poly}-COPY`,
            descrizione: originale.descrizione,
            // ...copia qui altri campi se ti servono (dimensioni, pesi, FK, ecc.)
        },
    });
    console.log(`📑 duplicate: ${originale.id} -> ${copia.id}`);
    return copia;
}

// DELETE — cancella un record per id
async function del(id) {
    const articolo = await prisma.articolo.delete({ where: { id } });
    console.log(`🗑️  delete: id=${id}`);
    return articolo;
}

// CLEANUP — rimuove i record di test così lo script è ri-eseguibile
async function cleanup() {
    const { count } = await prisma.articolo.deleteMany({
        where: { articolo_poly: { startsWith: CODICE } },
    });
    console.log(`🧹 Cancella tutti i record di test (${count})`);
}

// ============================================================================
// ============================================================================
//   CONCETTI AVANZATI (aggiunti dopo, tutto quello sopra resta invariato)
//
//   upsert()          "update OR insert": aggiorna se esiste, crea se non esiste
//   getPage()         PAGINAZIONE: leggi a blocchi (skip/take) + ordinamento
//   search()          FILTRI combinati (AND/OR, contains, in, ranges)
//   bulkCreate()      inserimento MASSIVO in una sola query (createMany)
//   stats()           AGGREGAZIONI: count/avg/min/max + groupBy
//   withRelations()   JOIN: leggere un articolo con i suoi record collegati (include)
//   distinta()        JOIN distinta base: da un articolo padre scendo ai figli (materiali)
//   doveUsato()       JOIN inverso "where used": in quali padri compare come materiale
//   transferStock()   TRANSAZIONE: più scritture "tutto o niente" ($transaction)
//   safeUpdate()      GESTIONE ERRORI tipizzata (codici errore Prisma P2025/P2002)
//   retry()           RETRY con backoff: rieseguire un'operazione che può fallire
//   selectFields()    SELECT parziale: leggere solo i campi che servono (performance)
//   rawQuery()        SQL grezzo quando Prisma non basta ($queryRaw, parametrizzato)
// ============================================================================

// UPSERT "Se esiste un articolo con questo codice lo aggiorno, altrimenti lo creo".
// Evita il classico giro findFirst -> if -> create/update (e la race condition).
/*
const esiste = await prisma.articolo.findFirst({ where: { codice_ARCA: 'ABC123' } });
if (esiste) {
    await prisma.articolo.update({ where: { id: esiste.id }, data: { descrizione: 'Nuova desc' } });
} else {
    await prisma.articolo.create({ data: { codice_ARCA: 'ABC123', descrizione: 'Nuova desc' } });
}
*/
async function upsert(codice, dati) {
    const articolo = await prisma.articolo.upsert({
        where:  { articolo_poly: codice },   // NB: funziona bene su campi @unique
        update: dati,                        // cosa fare se esiste
        create: { articolo_poly: codice, ...dati }, // cosa fare se NON esiste
    });
    console.log(`🔁 upsert: id=${articolo.id} (codice=${codice})`);
    return articolo;
}

// PAGINAZIONE — non caricare mai "tutta la tabella" in memoria se è grande.
// skip = quanti saltare, take = quanti prenderne. pagina 1 => skip 0.
async function getPage(pagina = 1, perPagina = 20) {
    const [righe, totale] = await prisma.$transaction([
        prisma.articolo.findMany({
            skip: (pagina - 1) * perPagina,
            take: perPagina,
            orderBy: { id: 'desc' },          // ordinamento stabile è d'obbligo
        }),
        prisma.articolo.count(),
    ]);
    const totalePagine = Math.ceil(totale / perPagina);
    console.log(`📄 pagina ${pagina}/${totalePagine} — ${righe.length} record (totale ${totale})`);
    return { righe, pagina, totalePagine, totale };
}

// SEARCH — filtri veri: AND implicito tra le chiavi, OR esplicito, contains, in.
// Questo è il pattern che userai per le barre di ricerca del gestionale.
async function search({ testo, tipologie, soloConDescrizione } = {}) {
    const where = {
        AND: [
            testo
                ? { OR: [                                     // cerca testo in più campi
                    { articolo_poly: { contains: testo, mode: 'insensitive' } },
                    { descrizione:   { contains: testo, mode: 'insensitive' } },
                  ] }
                : {},
            tipologie?.length ? { tipologia: { in: tipologie } } : {}, // WHERE ... IN (...)
            soloConDescrizione ? { descrizione: { not: null } } : {},
        ],
    };
    const risultati = await prisma.articolo.findMany({ where, take: 50 });
    console.log(`🔎 search: ${risultati.length} risultati`);
    return risultati;
}

// BULK CREATE — inserire N record con UNA query invece di N create in loop.
// skipDuplicates evita di esplodere sui vincoli @unique.
async function bulkCreate(n = 5) {
    const dati = Array.from({ length: n }, (_, i) => ({
        articolo_poly: `${CODICE}-BULK-${i}`,
        descrizione: `Articolo massivo ${i}`,
    }));
    const { count } = await prisma.articolo.createMany({
        data: dati,
        skipDuplicates: true,
    });
    console.log(`📦 bulkCreate: inseriti ${count} record`);
    return count;
}

// STATS — aggregazioni lato DB (velocissime, non scarichi le righe).
// aggregate = count/avg/sum/min/max; groupBy = "quanti articoli per tipologia".
async function stats() {
    const aggregato = await prisma.articolo.aggregate({
        _count: { _all: true },
        _max:   { id: true },
        _min:   { id: true },
    });
    const perTipologia = await prisma.articolo.groupBy({
        by: ['tipologia'],
        _count: { _all: true },
        orderBy: { _count: { tipologia: 'desc' } },
    });
    console.log('📊 stats globali:', aggregato._count._all, 'record; id min/max:',
        aggregato._min.id, '/', aggregato._max.id);
    console.table(perTipologia.map(g => ({ tipologia: g.tipologia, n: g._count._all })));
    return { aggregato, perTipologia };
}

// WITH RELATIONS — leggere un record insieme ai suoi collegati (JOIN via include).
// Nomi presi dal TUO schema.prisma (model Articolo): cliente, fornitore, famiglia,
// gruppo, sottogruppo, unita_misura sono relazioni "1"; attributi/disegni "N".
// La FK nel DB è solo un numero (cliente_id: 7); l'include ti porta l'oggetto vero
// (cliente.ragioneSociale = "Rossi S.p.A.") così mostri il nome, non l'id.
async function withRelations(id) {
    const articolo = await prisma.articolo.findUnique({
        where: { id },
        include: {
            cliente:      { select: { id: true, ragioneSociale: true } }, // 1 — solo i campi che mostro
            fornitore:    { select: { id: true, ragioneSociale: true } }, // 1
            famiglia:     true,                                           // 1
            gruppo:       true,                                           // 1
            sottogruppo:  true,                                           // 1
            unita_misura: true,                                           // 1
            attributi:    true,                                           // N — colori/lavorazioni
            disegni:      true,                                           // N — PDF collegati
        },
    });
    console.log(`🔗 withRelations: id=${id}`,
        '→ cliente:', articolo?.cliente?.ragioneSociale ?? '(nessuno)',
        '| attributi:', articolo?.attributi.length ?? 0,
        '| disegni:', articolo?.disegni.length ?? 0);
    return articolo;
}

// DISTINTA — il JOIN che conta davvero nel tuo gestionale: da un articolo PADRE
// scendo ai suoi FIGLI (i materiali che usa). Nel tuo schema il legame diretto
// padre->figlio è già materializzato in RelazioneArticolo (rel_come_padre):
// non devo risalire distinta->ciclo->fase->materiale a mano, lo leggo diretto.
async function distinta(id) {
    const padre = await prisma.articolo.findUnique({
        where: { id },
        include: {
            rel_come_padre: {                          // i legami dove QUESTO articolo è il padre
                include: {
                    figlio: {                          // e per ogni legame, l'articolo figlio (il materiale)
                        select: { id: true, articolo_poly: true, descrizione: true },
                    },
                },
                orderBy: { id: 'asc' },
            },
        },
    });
    if (!padre) { console.warn(`⚠️  distinta: articolo id=${id} non trovato`); return null; }

    console.log(`🌳 distinta di ${padre.articolo_poly} — ${padre.rel_come_padre.length} figli:`);
    for (const legame of padre.rel_come_padre) {
        const primario = legame.materiale_primario ? '★' : ' ';
        console.log(`   ${primario} ${legame.figlio.articolo_poly ?? '(no cod)'} — ${legame.figlio.descrizione ?? ''}`);
    }
    return padre;
}

// DOVE-USATO ("where used") — la domanda inversa: in quali articoli PADRE compare
// questo come materiale? Usa rel_come_figlio. Serve per l'analisi di impatto:
// "se cambio/obsoleto questo articolo, quali prodotti finiti tocco?".
async function doveUsato(id) {
    const figlio = await prisma.articolo.findUnique({
        where: { id },
        include: {
            rel_come_figlio: {
                include: { padre: { select: { id: true, articolo_poly: true, descrizione: true } } },
            },
        },
    });
    if (!figlio) { console.warn(`⚠️  doveUsato: articolo id=${id} non trovato`); return null; }
    console.log(`🔎 ${figlio.articolo_poly} è usato in ${figlio.rel_come_figlio.length} articoli padre`);
    return figlio.rel_come_figlio.map(r => r.padre);
}

// TRANSAZIONE INTERATTIVA — serve per garantire che più scritture siano "tutto o niente" (atomicità).
async function transferStock(idA, idB) {
    return prisma.$transaction(async (tx) => {
        // dentro tx usi tx.articolo.* (NON prisma.*), così tutto è nella stessa transazione
        await tx.articolo.update({ where: { id: idA }, data: { note_principale: 'meno stock' } });
        await tx.articolo.update({ where: { id: idB }, data: { note_principale: 'più stock' } });
        console.log(`💳 transferStock: ${idA} -> ${idB} (atomico)`);
        return true;
    });
}

// SAFE UPDATE — gestione errori tipizzata invece del try/catch "cieco".
// Prisma espone codici: P2025 = record non trovato, P2002 = vincolo @unique violato.
async function safeUpdate(id, dati) {
    try {
        const r = await prisma.articolo.update({ where: { id }, data: dati });
        console.log(`✅ safeUpdate: id=${id} ok`);
        return { ok: true, articolo: r };
    } catch (e) {
        if (e.code === 'P2025') { console.warn(`⚠️  safeUpdate: id=${id} non esiste`); return { ok: false, motivo: 'non_trovato' }; }
        if (e.code === 'P2002') { console.warn(`⚠️  safeUpdate: valore duplicato su ${e.meta?.target}`); return { ok: false, motivo: 'duplicato' }; }
        throw e; // errore imprevisto: rilancialo, non nasconderlo
    }
}

// RETRY con backoff — rieseguire un'operazione che può fallire (es. lock DB,
// rete instabile). Aspetta un po' di più a ogni tentativo prima di riprovare.
async function retry(fn, tentativi = 3, attesaMs = 200) {
    for (let i = 1; i <= tentativi; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === tentativi) throw e;      // finiti i tentativi: arrenditi
            const wait = attesaMs * i;          // backoff lineare (200, 400, 600...)
            console.warn(`↻ retry ${i}/${tentativi} fallito, riprovo tra ${wait}ms`);
            await new Promise(r => setTimeout(r, wait));
        }
    }
}

// SELECT PARZIALE — chiedi solo i campi che ti servono: meno dati, query più veloce.
// Il risultato NON avrà gli altri campi (utile per liste/dropdown).
async function selectFields() {
    const righe = await prisma.articolo.findMany({
        where:  { articolo_poly: { startsWith: CODICE } },
        select: { id: true, articolo_poly: true },   // niente descrizione, note, ecc.
        take: 10,
    });
    console.log(`🎯 selectFields: ${righe.length} record "leggeri"`);
    return righe;
}

// RAW QUERY — quando Prisma non basta (query particolari, funzioni SQL).
// USA SEMPRE la forma con i backtick (template tag): è parametrizzata e
// SICURA contro SQL injection. NON concatenare mai stringhe a mano.
async function rawQuery(codice = CODICE) {
    const righe = await prisma.$queryRaw`
        SELECT id, articolo_poly, descrizione
        FROM   "Articolo"
        WHERE  articolo_poly LIKE ${codice + '%'}
        LIMIT  5
    `;
    console.log(`🧬 rawQuery: ${righe.length} record via SQL grezzo`);
    return righe;
}

async function main() {
    await cleanup();                                   // parte da pulito (idempotente)

    const creato = await create();                     // CREATE
    await get();                                       // GET
    await set(creato.id, 'descrizione', 'Modificato con set');   // SET (1 campo)
    await update(creato.id, {                          // UPDATE (più campi)
        descrizione: 'Modificato con update',
        note_principale: 'nota di test',
    });
    const copia = await duplicate(creato.id);          // DUPLICATE
    await del(copia.id);                               // DELETE (cancella la copia)
    await get();
}

main()
    .catch((e) => console.error('❌ Errore:', e))
    .finally(() => prisma.$disconnect());
