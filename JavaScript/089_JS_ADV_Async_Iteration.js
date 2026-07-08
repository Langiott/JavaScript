/* ============================================================
   89 JS ADV Async Iteration
   Iterazione asincrona: il costrutto for await...of, gli async
   generators (function* combinata con async) e lo streaming di
   dati. Permette di consumare sorgenti che producono valori nel
   tempo (paginazione API, righe DB, eventi, file letti a chunk)
   come se fossero un normale ciclo, gestendo automaticamente le
   promise restituite a ogni iterazione. Fondamentale per back-
   pressure, pipeline e consumo "lazy" di grandi dataset.
   ============================================================ */

// ------------------------------------------------------------
// 1) Async iterable: il protocollo Symbol.asyncIterator
// ------------------------------------------------------------
// Un oggetto e' async iterable se ha un metodo [Symbol.asyncIterator]
// che ritorna un async iterator (next() restituisce una Promise<{value, done}>).
const contoAllaRovescia = {
  [Symbol.asyncIterator]() {
    let n = 3;
    return {
      next() {
        if (n <= 0) return Promise.resolve({ value: undefined, done: true });
        return Promise.resolve({ value: n--, done: false });
      },
    };
  },
};

// ------------------------------------------------------------
// 2) for await...of: consuma un async iterable
// ------------------------------------------------------------
async function demoForAwait() {
  for await (const v of contoAllaRovescia) {
    console.log("tick", v); // => tick 3, tick 2, tick 1
  }
}
demoForAwait();

// ------------------------------------------------------------
// 3) Async generator: la forma piu' comoda (async function*)
// ------------------------------------------------------------
// yield "sospende" e produce un valore; await dentro funziona.
async function* genNumeri() {
  for (let i = 1; i <= 3; i++) {
    await new Promise((r) => setTimeout(r, 10)); // simula attesa I/O
    yield i;
  }
}
async function demoGen() {
  for await (const n of genNumeri()) {
    console.log("gen", n); // => gen 1, gen 2, gen 3
  }
}
demoGen();

// ------------------------------------------------------------
// 4) for await...of funziona anche su array di Promise
// ------------------------------------------------------------
async function demoArrayPromise() {
  const promesse = [Promise.resolve("a"), Promise.resolve("b")];
  for await (const v of promesse) {
    console.log("risolto", v); // => risolto a, risolto b
  }
}
demoArrayPromise();

// ------------------------------------------------------------
// 5) yield* delega ad un altro async iterable
// ------------------------------------------------------------
async function* genA() {
  yield "x";
  yield "y";
}
async function* genComposto() {
  yield "inizio";
  yield* genA(); // delega
  yield "fine";
}
async function demoYieldStar() {
  for await (const v of genComposto()) console.log("comp", v);
  // => comp inizio, comp x, comp y, comp fine
}
demoYieldStar();

// ------------------------------------------------------------
// 6) Paginazione API come async generator (caso reale ERP)
// ------------------------------------------------------------
// Simuliamo un endpoint che restituisce dipendenti a pagine.
async function fetchPaginaDipendenti(pagina) {
  // mock: 2 pagine, poi vuoto
  const dati = {
    1: [{ id: 1, nome: "Anna", badge: "UP-001" }, { id: 2, nome: "Bruno", badge: "UP-002" }],
    2: [{ id: 3, nome: "Carla", badge: "UP-003" }],
    3: [],
  };
  await new Promise((r) => setTimeout(r, 5));
  return dati[pagina] ?? [];
}
async function* tuttiIDipendenti() {
  let pagina = 1;
  while (true) {
    const blocco = await fetchPaginaDipendenti(pagina++);
    if (blocco.length === 0) return; // fine paginazione
    yield* blocco; // emette un dipendente alla volta
  }
}
async function demoPaginazione() {
  for await (const dip of tuttiIDipendenti()) {
    console.log("dip", dip.badge, dip.nome);
  }
  // => dip UP-001 Anna, dip UP-002 Bruno, dip UP-003 Carla
}
demoPaginazione();

// ------------------------------------------------------------
// 7) Streaming di righe DB con take/cursor (lazy, basso consumo RAM)
// ------------------------------------------------------------
// Pattern: invece di caricare 100k timbrature in memoria, le si
// scorre a blocchi (take=1000) come stream.
async function queryTimbrature(skip, take) {
  // mock di Prisma findMany({ skip, take, orderBy:[{id:'asc'}] })
  const totale = 5;
  const out = [];
  for (let id = skip + 1; id <= Math.min(skip + take, totale); id++) {
    out.push({ id, badge: "UP-001", oreLavorate: 7.5 + id });
  }
  await new Promise((r) => setTimeout(r, 5));
  return out;
}
async function* streamTimbrature(take = 2) {
  let skip = 0;
  while (true) {
    const blocco = await queryTimbrature(skip, take);
    if (blocco.length === 0) return;
    for (const t of blocco) yield t;
    skip += take;
  }
}
async function demoStreamDB() {
  let totaleOre = 0;
  for await (const t of streamTimbrature()) {
    totaleOre += t.oreLavorate; // riduzione incrementale
  }
  console.log("totale ore", totaleOre);
}
demoStreamDB();

// ------------------------------------------------------------
// 8) Trasformazione di uno stream: map asincrona via generator
// ------------------------------------------------------------
// Higher-order async generator: prende un async iterable e ne
// produce uno nuovo applicando una funzione (eventualmente async).
async function* mapAsync(sorgente, fn) {
  for await (const x of sorgente) {
    yield await fn(x);
  }
}
async function demoMap() {
  const dto = mapAsync(tuttiIDipendenti(), (d) => ({
    badge: d.badge,
    label: `${d.nome} (${d.badge})`,
  }));
  for await (const r of dto) console.log("dto", r.label);
  // => dto Anna (UP-001), ...
}
demoMap();

// ------------------------------------------------------------
// 9) Filtro asincrono via generator
// ------------------------------------------------------------
async function* filterAsync(sorgente, predicato) {
  for await (const x of sorgente) {
    if (await predicato(x)) yield x;
  }
}
async function demoFilter() {
  const validi = filterAsync(streamTimbrature(), (t) => t.oreLavorate > 9);
  for await (const t of validi) console.log("turno lungo", t.id, t.oreLavorate);
}
demoFilter();

// ------------------------------------------------------------
// 10) Pipeline componibile (filter -> map -> consumo)
// ------------------------------------------------------------
async function demoPipeline() {
  const pipeline = mapAsync(
    filterAsync(streamTimbrature(), (t) => t.oreLavorate > 9),
    (t) => ({ id: t.id, ore: t.oreLavorate.toFixed(2) })
  );
  for await (const r of pipeline) console.log("pipe", r);
}
demoPipeline();

// ------------------------------------------------------------
// 11) take/limit su uno stream infinito (chiusura anticipata)
// ------------------------------------------------------------
async function* generatoreInfinito() {
  let i = 0;
  while (true) {
    await new Promise((r) => setTimeout(r, 1));
    yield i++;
  }
}
async function takeN(sorgente, n) {
  const out = [];
  for await (const x of sorgente) {
    out.push(x);
    if (out.length >= n) break; // break chiude l'iterator (chiama return())
  }
  return out;
}
async function demoTake() {
  console.log("primi 3", await takeN(generatoreInfinito(), 3)); // => [0,1,2]
}
demoTake();

// ------------------------------------------------------------
// 12) Cleanup garantito: return() / try...finally nel generator
// ------------------------------------------------------------
// Quando un for await...of termina con break/throw, viene chiamato
// il metodo return() dell'iterator: il finally permette di rilasciare
// risorse (connessione DB, file handle, lock).
async function* genConRisorsa() {
  console.log("apro connessione");
  try {
    let i = 0;
    while (true) yield i++;
  } finally {
    console.log("chiudo connessione"); // sempre eseguito
  }
}
async function demoCleanup() {
  for await (const v of genConRisorsa()) {
    if (v >= 2) break;
    console.log("uso", v);
  }
  // => apro connessione, uso 0, uso 1, chiudo connessione
}
demoCleanup();

// ------------------------------------------------------------
// 13) Gestione errori con try/catch attorno a for await...of
// ------------------------------------------------------------
async function* genCheFallisce() {
  yield 1;
  throw new Error("errore di rete");
}
async function demoErrore() {
  try {
    for await (const v of genCheFallisce()) console.log("ok", v);
  } catch (e) {
    console.log("catturato:", e.message); // => catturato: errore di rete
  }
}
demoErrore();

// ------------------------------------------------------------
// 14) Concorrenza controllata: Promise.all su un batch dello stream
// ------------------------------------------------------------
// A volte vuoi processare a blocchi in parallelo invece che uno a uno.
async function* aBatch(sorgente, dimensione) {
  let batch = [];
  for await (const x of sorgente) {
    batch.push(x);
    if (batch.length >= dimensione) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length) yield batch; // ultimo batch parziale
}
async function elaboraTimbratura(t) {
  await new Promise((r) => setTimeout(r, 2));
  return t.oreLavorate;
}
async function demoBatchParallelo() {
  for await (const batch of aBatch(streamTimbrature(), 2)) {
    const risultati = await Promise.all(batch.map(elaboraTimbratura));
    console.log("batch elaborato", risultati);
  }
}
demoBatchParallelo();

// ------------------------------------------------------------
// 15) Browser/Node streams: ReadableStream e' async iterable
// ------------------------------------------------------------
// Esempio browser/fetch: gira nel browser o in Node con fetch,
// non eseguito qui (richiede rete). Mostrato come pseudo-eseguibile.
async function leggiStreamHttp(url) {
  const res = await fetch(url);
  // In ambienti recenti il body e' async iterable di Uint8Array
  for await (const chunk of res.body) {
    console.log("ricevuti byte:", chunk.length);
  }
}
// leggiStreamHttp("https://example.com/grande.csv");
void leggiStreamHttp; // evita warning, non invochiamo (serve rete)

// ------------------------------------------------------------
// 16) Merge di piu' sorgenti async in un unico stream
// ------------------------------------------------------------
// Utile per unire eventi da fonti diverse (es. timbrature + badge live).
async function* sorgente1() { yield "T1"; yield "T2"; }
async function* sorgente2() { yield "B1"; yield "B2"; }
async function* mergeSequenziale(...sorgenti) {
  for (const s of sorgenti) yield* s; // concatenazione ordinata
}
async function demoMerge() {
  for await (const v of mergeSequenziale(sorgente1(), sorgente2())) {
    console.log("merge", v); // => T1, T2, B1, B2
  }
}
demoMerge();

// ------------------------------------------------------------
// 17) Riduzione finale di uno stream in un report (caso ERP)
// ------------------------------------------------------------
async function reportOrePerBadge(stream) {
  const acc = {};
  for await (const t of stream) {
    acc[t.badge] = (acc[t.badge] ?? 0) + t.oreLavorate; // nullish + accumulo
  }
  return acc;
}
async function demoReport() {
  const report = await reportOrePerBadge(streamTimbrature());
  console.log("report ore", report); // => { 'UP-001': <somma> }
}
demoReport();

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   - for await (const x of iterable) { ... }   // consuma async iterable
   - [Symbol.asyncIterator]() { return { next() {...} } } // protocollo
   - async function* gen() { yield v; }         // async generator
   - yield                                       // produce un valore
   - yield* altroAsyncIterable                   // delega
   - await dentro al generator                   // attende I/O
   - break / return                              // chiusura anticipata (-> return())
   - try { ... } finally { ... }                 // cleanup risorse nel generator
   - try/catch attorno a for await...of          // gestione errori
   - Promise.all(batch.map(fn))                  // concorrenza su batch
   - res.body (ReadableStream)                   // async iterable di chunk
   - pattern: mapAsync / filterAsync / takeN / aBatch / merge
   - pattern: paginazione, streaming DB (skip/take), report incrementale
   ============================================================ */
