/* ============================================================
   88 JS ADV Async Patterns
   Pattern avanzati di concorrenza con le Promise: combinatori
   (Promise.all / allSettled / race / any), gestione della
   concorrenza limitata (pool/worker), timeout su operazioni
   asincrone e strategie di retry con backoff esponenziale.
   Tema centrale: orchestrare molte operazioni I/O (query DB,
   chiamate HTTP) in modo efficiente, resiliente e controllato,
   con esempi ispirati a un gestionale ERP aziendale.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   HELPER: simula operazioni asincrone (query DB, fetch HTTP)
   ------------------------------------------------------------ */

// delay: ritorna una promise che si risolve dopo ms millisecondi
const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

// delayReject: come delay ma fallisce (reject) dopo ms
const delayReject = (ms, err) =>
  new Promise((_, reject) => setTimeout(() => reject(err instanceof Error ? err : new Error(err)), ms));

// simula una query su un dipendente del gestionale ERP
async function getDipendente(id) {
  await delay(50);
  return { id, nome: 'Mario', cognome: 'Rossi', codiceBadge: `UP-${String(id).padStart(3, '0')}` };
}

/* ------------------------------------------------------------
   1) Promise.all — tutte in parallelo, fallisce alla prima
   ------------------------------------------------------------ */

// Promise.all attende che TUTTE si risolvano; se UNA fallisce,
// l'intero risultato fa reject ("fail-fast").
async function esempioAll() {
  const [d1, d2, d3] = await Promise.all([
    getDipendente(1),
    getDipendente(2),
    getDipendente(3),
  ]);
  console.log(d1.codiceBadge, d2.codiceBadge, d3.codiceBadge);
  // => UP-001 UP-002 UP-003
}
esempioAll();

// Pattern ERP reale: dashboard che carica 4 sezioni in parallelo.
async function caricaDashboard() {
  const [dipendenti, turni, reparti, timbrature] = await Promise.all([
    delay(30, [{ id: 1 }, { id: 2 }]),
    delay(40, [{ sigla: 'P4' }, { sigla: 'P2' }]),
    delay(20, [{ sigla: 'UP' }, { sigla: 'AM' }]),
    delay(50, [{ ore: 8 }, { ore: 7.5 }]),
  ]);
  return { dipendenti, turni, reparti, timbrature };
}
caricaDashboard().then((d) => console.log('Sezioni:', Object.keys(d).length)); // => 4

// ATTENZIONE: Promise.all in fail-fast. Se una query fallisce,
// le altre continuano comunque l'esecuzione ma il risultato è perso.
async function allFailFast() {
  try {
    await Promise.all([delay(10, 'ok'), delayReject(20, 'DB timeout'), delay(30, 'ok')]);
  } catch (e) {
    console.log('all ha fallito:', e.message); // => all ha fallito: DB timeout
  }
}
allFailFast();

/* ------------------------------------------------------------
   2) Promise.allSettled — aspetta TUTTE, non fallisce mai
   ------------------------------------------------------------ */

// allSettled ritorna un array di { status, value } | { status, reason }.
// Utile quando vuoi i risultati parziali anche se alcune falliscono.
async function esempioAllSettled() {
  const results = await Promise.allSettled([
    getDipendente(1),
    delayReject(30, 'badge non trovato'),
    getDipendente(3),
  ]);
  const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value.codiceBadge);
  const ko = results.filter((r) => r.status === 'rejected').map((r) => r.reason.message);
  console.log('OK:', ok); // => OK: [ 'UP-001', 'UP-003' ]
  console.log('KO:', ko); // => KO: [ 'badge non trovato' ]
}
esempioAllSettled();

// Pattern ERP: import massivo di timbrature; voglio salvare quelle
// valide e raccogliere gli errori riga per riga, senza bloccare tutto.
async function importTimbrature(righe) {
  const esiti = await Promise.allSettled(
    righe.map(async (r) => {
      if (!/^\d{2}:\d{2}$/.test(r.orario)) throw new Error(`orario invalido riga ${r.id}`);
      await delay(10);
      return { id: r.id, salvata: true };
    })
  );
  const salvate = esiti.filter((e) => e.status === 'fulfilled').length;
  const errori = esiti.filter((e) => e.status === 'rejected').map((e) => e.reason.message);
  return { salvate, errori };
}
importTimbrature([
  { id: 1, orario: '08:00' },
  { id: 2, orario: '8:0' },
  { id: 3, orario: '17:30' },
]).then((res) => console.log(res)); // => { salvate: 2, errori: [ 'orario invalido riga 2' ] }

/* ------------------------------------------------------------
   3) Promise.race — vince la PRIMA che si conclude (ok o ko)
   ------------------------------------------------------------ */

// race si risolve/rigetta appena UNA promise si conclude.
async function esempioRace() {
  const vincitore = await Promise.race([delay(100, 'lenta'), delay(20, 'veloce')]);
  console.log('Vince:', vincitore); // => Vince: veloce
}
esempioRace();

// Uso tipico: leggere da due repliche del DB e tenere la più rapida.
async function letturaPiuRapida() {
  const dato = await Promise.race([
    delay(60, { fonte: 'replica-A', value: 42 }),
    delay(35, { fonte: 'replica-B', value: 42 }),
  ]);
  console.log('Fonte usata:', dato.fonte); // => Fonte usata: replica-B
}
letturaPiuRapida();

/* ------------------------------------------------------------
   4) Promise.any — vince la prima che ha SUCCESSO
   ------------------------------------------------------------ */

// any ignora i reject e si risolve con il primo fulfilled.
// Se TUTTE falliscono lancia un AggregateError.
async function esempioAny() {
  const ok = await Promise.any([
    delayReject(20, 'mirror1 down'),
    delay(40, 'risposta dal mirror2'),
    delayReject(10, 'mirror3 down'),
  ]);
  console.log(ok); // => risposta dal mirror2
}
esempioAny();

// Gestire il caso "tutte fallite" con AggregateError.
async function anyTutteFallite() {
  try {
    await Promise.any([delayReject(10, 'a'), delayReject(20, 'b')]);
  } catch (e) {
    console.log(e instanceof AggregateError, e.errors.length); // => true 2
  }
}
anyTutteFallite();

/* ------------------------------------------------------------
   5) TIMEOUT su una operazione asincrona
   ------------------------------------------------------------ */

// withTimeout: avvolge una promise e fallisce se supera ms.
function withTimeout(promise, ms, msg = 'timeout') {
  return Promise.race([promise, delayReject(ms, msg)]);
}

async function esempioTimeout() {
  try {
    await withTimeout(getDipendente(7), 30); // query 50ms vs timeout 30ms
  } catch (e) {
    console.log('Scaduto:', e.message); // => Scaduto: timeout
  }
  const ok = await withTimeout(getDipendente(7), 200);
  console.log('In tempo:', ok.codiceBadge); // => In tempo: UP-007
}
esempioTimeout();

// Versione moderna con AbortController + AbortSignal.timeout (Node 18+).
async function fetchConAbort(simulatoMs, timeoutMs) {
  const signal = AbortSignal.timeout(timeoutMs);
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve('dati turni'), simulatoMs);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new Error('richiesta abortita per timeout'));
    });
  });
}
fetchConAbort(100, 40).catch((e) => console.log(e.message)); // => richiesta abortita per timeout

/* ------------------------------------------------------------
   6) RETRY con BACKOFF esponenziale
   ------------------------------------------------------------ */

// retry: riprova fn fino a maxTentativi volte, con attesa crescente
// (baseMs, baseMs*2, baseMs*4 ...) ed eventuale jitter casuale.
async function retry(fn, { maxTentativi = 3, baseMs = 50, jitter = true } = {}) {
  let ultimoErrore;
  for (let tentativo = 1; tentativo <= maxTentativi; tentativo++) {
    try {
      return await fn(tentativo);
    } catch (err) {
      ultimoErrore = err;
      if (tentativo === maxTentativi) break;
      const espo = baseMs * 2 ** (tentativo - 1);
      const attesa = jitter ? espo + Math.random() * baseMs : espo;
      console.log(`Tentativo ${tentativo} fallito, riprovo tra ~${Math.round(attesa)}ms`);
      await delay(attesa);
    }
  }
  throw new Error(`Falliti tutti i ${maxTentativi} tentativi: ${ultimoErrore.message}`);
}

// Esempio: una query che fallisce le prime 2 volte poi riesce.
async function esempioRetry() {
  let chiamate = 0;
  const sincronizzaBadge = async () => {
    chiamate++;
    if (chiamate < 3) throw new Error('rete instabile');
    return 'badge UP-001 sincronizzato';
  };
  const res = await retry(sincronizzaBadge, { maxTentativi: 5, baseMs: 20 });
  console.log(res); // => badge UP-001 sincronizzato
}
esempioRetry();

// Retry + timeout combinati: ogni tentativo ha il suo limite di tempo.
async function fetchRobusto(fn, opzioni = {}) {
  return retry(() => withTimeout(fn(), opzioni.timeoutMs ?? 100, 'tentativo scaduto'), opzioni);
}
fetchRobusto(() => getDipendente(9), { maxTentativi: 2, timeoutMs: 200 })
  .then((d) => console.log('Robusto:', d.codiceBadge)); // => Robusto: UP-009

/* ------------------------------------------------------------
   7) CONCORRENZA LIMITATA (pool di worker)
   ------------------------------------------------------------ */

// Promise.all lancia TUTTO insieme: con 1000 query satura il DB.
// mapLimit esegue al massimo "limite" task contemporaneamente,
// preservando l'ordine dei risultati.
async function mapLimit(items, limite, worker) {
  const risultati = new Array(items.length);
  let indice = 0;
  async function run() {
    while (indice < items.length) {
      const i = indice++;
      risultati[i] = await worker(items[i], i);
    }
  }
  const runners = Array.from({ length: Math.min(limite, items.length) }, run);
  await Promise.all(runners);
  return risultati;
}

// Pattern ERP: generare 8 badge ma con al massimo 2 generazioni in parallelo.
async function esempioPool() {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8];
  let attivi = 0;
  let maxAttivi = 0;
  const badge = await mapLimit(ids, 2, async (id) => {
    attivi++;
    maxAttivi = Math.max(maxAttivi, attivi);
    await delay(20);
    attivi--;
    return `UP-${String(id).padStart(3, '0')}`;
  });
  console.log('Generati:', badge.length, '| max paralleli:', maxAttivi);
  // => Generati: 8 | max paralleli: 2
}
esempioPool();

/* ------------------------------------------------------------
   8) Esecuzione SEQUENZIALE vs PARALLELA (differenze chiave)
   ------------------------------------------------------------ */

// Sequenziale: ogni await blocca il successivo (somma dei tempi).
async function sequenziale() {
  const start = Date.now();
  await delay(40);
  await delay(40);
  console.log('Sequenziale ~80ms:', Date.now() - start >= 80); // => true
}
// Parallelo: avvio entrambe poi attendo (tempo del più lento).
async function parallelo() {
  const start = Date.now();
  const a = delay(40);
  const b = delay(40);
  await a;
  await b;
  console.log('Parallelo ~40ms:', Date.now() - start < 80); // => true
}
sequenziale();
parallelo();

/* ------------------------------------------------------------
   9) Pattern reali aggiuntivi
   ------------------------------------------------------------ */

// firstSettled util: come race ma scartando i reject finché possibile
// (equivale a Promise.any, mostrato a scopo didattico).
async function primaRispostaValida(fonti) {
  return Promise.any(fonti.map((f) => f()));
}
primaRispostaValida([
  () => delayReject(10, 'cache miss'),
  () => delay(30, 'reparto UP'),
]).then((r) => console.log('Prima valida:', r)); // => Prima valida: reparto UP

// allSettled per calcolare un totale parziale robusto (filter+reduce, stile ERP).
async function totaleMinutiApprovati(richieste) {
  const esiti = await Promise.allSettled(
    richieste.map(async (r) => {
      await delay(5);
      if (!r.approvata) throw new Error('non approvata');
      return r.minuti;
    })
  );
  return esiti
    .filter((e) => e.status === 'fulfilled')
    .reduce((somma, e) => somma + e.value, 0);
}
totaleMinutiApprovati([
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 60 },
  { approvata: true, minuti: 30 },
]).then((tot) => console.log('Minuti totali:', tot)); // => Minuti totali: 510

// Throttle temporale: garantire almeno X ms tra una chiamata e l'altra.
async function conPausaMinima(tasks, pausaMs) {
  const out = [];
  for (const t of tasks) {
    const start = Date.now();
    out.push(await t());
    const trascorso = Date.now() - start;
    if (trascorso < pausaMs) await delay(pausaMs - trascorso);
  }
  return out;
}
conPausaMinima([() => delay(5, 'A'), () => delay(5, 'B')], 30)
  .then((r) => console.log('Throttled:', r)); // => Throttled: [ 'A', 'B' ]

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - Promise.all([...])        -> tutte ok, fail-fast al primo reject
   - Promise.allSettled([...]) -> attende tutte, mai reject, {status,value/reason}
   - Promise.race([...])       -> la prima che si conclude (ok o ko)
   - Promise.any([...])        -> la prima fulfilled; tutte ko -> AggregateError
   - AggregateError / .errors  -> raccolta errori di Promise.any
   - new Promise((res,rej)=>)  -> wrapper su setTimeout/callback
   - async / await / try-catch -> gestione sincrona-like + errori
   - setTimeout / clearTimeout -> base per delay e timeout
   - AbortController / AbortSignal.timeout(ms) -> annullamento operazioni
   - withTimeout(p, ms)        -> Promise.race con delayReject (timeout)
   - retry(fn, {maxTentativi, baseMs}) -> backoff esponenziale + jitter
   - mapLimit(items, n, fn)    -> concorrenza limitata (pool di worker)
   - filter() / reduce() / map() su risultati settled
   - Math.max / 2 ** n / Math.random() -> calcolo backoff e jitter
   ============================================================ */
