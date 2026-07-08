/* ============================================================
   87 JS ADV Async AwaitAsync
   async/await e la sintassi moderna per gestire codice asincrono.
   Una funzione async ritorna SEMPRE una Promise; la keyword await
   sospende l'esecuzione finche' la promise non si risolve (resolve)
   o viene rifiutata (reject). Vedremo try/catch per la gestione
   errori, la differenza tra esecuzione sequenziale e parallela
   (Promise.all / allSettled), e il valore di ritorno (return value).
   Esempi ispirati a un gestionale ERP: timbrature, dipendenti, turni.
   ============================================================ */

'use strict';

// ------------------------------------------------------------
// 1) BASE: una async function ritorna sempre una Promise
// ------------------------------------------------------------

// Anche se ritorniamo un valore "normale", viene wrappato in una Promise.
async function saluta() {
  return 'ciao';
}
console.log(saluta()); // => Promise { 'ciao' }
saluta().then((v) => console.log(v)); // => ciao

// await "spacchetta" la promise e restituisce il valore risolto.
async function main1() {
  const messaggio = await saluta();
  console.log(messaggio); // => ciao
}
main1();

// ------------------------------------------------------------
// 2) await su una Promise reale (simuliamo una chiamata di rete)
// ------------------------------------------------------------

// Helper: ritorna una promise che si risolve dopo "ms" millisecondi.
function delay(ms, valore) {
  return new Promise((resolve) => setTimeout(() => resolve(valore), ms));
}

async function caricaDipendente() {
  console.log('inizio caricamento...');
  const dip = await delay(50, { id: 1, nome: 'Mario', badge: 'UP-001' });
  console.log('caricato:', dip.nome); // => caricato: Mario
  return dip;
}
caricaDipendente();

// ------------------------------------------------------------
// 3) try/catch: gestione errori in stile sincrono
// ------------------------------------------------------------

// Una promise rejected fa "lanciare" l'await: lo intercettiamo con catch.
function fetchTimbratura(badge) {
  return new Promise((resolve, reject) => {
    if (!badge) reject(new Error('badge mancante'));
    else resolve({ badge, ingresso: '08:00' });
  });
}

async function leggiTimbratura(badge) {
  try {
    const t = await fetchTimbratura(badge);
    console.log('ingresso:', t.ingresso);
    return t;
  } catch (err) {
    console.error('errore:', err.message); // => errore: badge mancante
    return null;
  } finally {
    console.log('lettura terminata'); // gira sempre, sia in successo che errore
  }
}
leggiTimbratura('UP-001');
leggiTimbratura(''); // => errore: badge mancante

// ------------------------------------------------------------
// 4) await dentro un ciclo = SEQUENZIALE (uno dopo l'altro)
// ------------------------------------------------------------

const badges = ['UP-001', 'UP-002', 'UP-003'];

async function caricaSequenziale() {
  const risultati = [];
  for (const b of badges) {
    // ogni iterazione ASPETTA la precedente: lento se sono indipendenti
    const t = await delay(20, { badge: b, ore: 8 });
    risultati.push(t);
  }
  console.log('sequenziale:', risultati.length); // => sequenziale: 3
  return risultati;
}
caricaSequenziale();

// ------------------------------------------------------------
// 5) Promise.all = PARALLELO (tutte insieme, attende la piu' lenta)
// ------------------------------------------------------------

async function caricaParallelo() {
  // lancio tutte le promise SUBITO, poi attendo l'insieme
  const promesse = badges.map((b) => delay(20, { badge: b, ore: 8 }));
  const risultati = await Promise.all(promesse);
  console.log('parallelo:', risultati.length); // => parallelo: 3
  return risultati;
}
caricaParallelo();

// Pattern ERP reale: 8 query indipendenti in parallelo (dashboard).
async function caricaDashboard() {
  const [dipendenti, reparti, turni] = await Promise.all([
    delay(15, ['Mario', 'Luca']),
    delay(15, ['UP', 'MG']),
    delay(15, ['P4', 'P2']),
  ]);
  console.log(dipendenti.length, reparti.length, turni.length); // => 2 2 2
}
caricaDashboard();

// ------------------------------------------------------------
// 6) ATTENZIONE: Promise.all fallisce se UNA sola promise va in reject
// ------------------------------------------------------------

async function allConErrore() {
  try {
    await Promise.all([
      delay(10, 'ok'),
      Promise.reject(new Error('query 2 fallita')),
      delay(10, 'ok'),
    ]);
  } catch (err) {
    console.error('all rifiutata:', err.message); // => all rifiutata: query 2 fallita
  }
}
allConErrore();

// ------------------------------------------------------------
// 7) Promise.allSettled = non fallisce mai, riporta lo stato di ognuna
// ------------------------------------------------------------

async function allSettledEsempio() {
  const esiti = await Promise.allSettled([
    delay(10, 'timbratura ok'),
    Promise.reject(new Error('badge invalido')),
  ]);
  // ogni esito: { status: 'fulfilled', value } | { status: 'rejected', reason }
  esiti.forEach((e, i) => {
    if (e.status === 'fulfilled') console.log(`#${i} ok:`, e.value);
    else console.log(`#${i} ko:`, e.reason.message);
  });
  // => #0 ok: timbratura ok
  // => #1 ko: badge invalido
}
allSettledEsempio();

// ------------------------------------------------------------
// 8) Promise.race / Promise.any
// ------------------------------------------------------------

// race: si risolve/rifiuta con la PRIMA promise che termina (anche reject).
async function raceEsempio() {
  const vincitore = await Promise.race([delay(30, 'lento'), delay(10, 'veloce')]);
  console.log('race:', vincitore); // => race: veloce
}
raceEsempio();

// any: la prima che si RISOLVE (ignora i reject, finche' ce n'e' almeno una ok).
async function anyEsempio() {
  const ok = await Promise.any([
    Promise.reject(new Error('server1 down')),
    delay(10, 'server2 ok'),
  ]);
  console.log('any:', ok); // => any: server2 ok
}
anyEsempio();

// Pattern reale: timeout su una richiesta lenta usando race.
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}
async function caricaConTimeout() {
  try {
    const dato = await withTimeout(delay(100, 'tardi'), 30);
    console.log(dato);
  } catch (err) {
    console.error('caricaConTimeout:', err.message); // => caricaConTimeout: timeout
  }
}
caricaConTimeout();

// ------------------------------------------------------------
// 9) RETURN VALUE: il valore ritornato e' SEMPRE una Promise
// ------------------------------------------------------------

async function calcolaOre(timbrature) {
  // riduce minuti totali poi converte in ore (pattern filter+reduce ERP)
  const minuti = timbrature
    .filter((t) => t.approvata)
    .reduce((s, t) => s + t.minuti, 0);
  return minuti / 60;
}
calcolaOre([
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 60 },
]).then((ore) => console.log('ore lavorate:', ore)); // => ore lavorate: 8

// Se ritorni una Promise dentro un'async function, viene "appiattita" (no doppio wrap).
async function passaThrough() {
  return delay(10, 'gia una promise');
}
passaThrough().then((v) => console.log(v)); // => gia una promise

// ------------------------------------------------------------
// 10) Rollback con try/catch (pattern ERP: crea, se fallisce annulla)
// ------------------------------------------------------------

async function creaDipendenteConVestiario(dip) {
  let creato = null;
  try {
    creato = await delay(10, { id: 99, ...dip }); // INSERT dipendente
    await fetchTimbratura(dip.badge); // step che puo' fallire
    console.log('dipendente creato:', creato.id);
    return creato;
  } catch (err) {
    if (creato) {
      await delay(5); // DELETE di rollback
      console.log('rollback: dipendente', creato.id, 'eliminato');
    }
    throw err; // ri-propaga l'errore al chiamante
  }
}
creaDipendenteConVestiario({ nome: 'Sara', badge: '' }).catch((e) =>
  console.error('creazione fallita:', e.message)
); // => rollback ... // => creazione fallita: badge mancante

// ------------------------------------------------------------
// 11) Sequenziale QUANDO serve (lo step 2 dipende dallo step 1)
// ------------------------------------------------------------

async function flussoTimbratura(badge) {
  const dip = await delay(10, { id: 1, badge, reparto: 'UP' }); // 1
  const turno = await delay(10, dip.reparto === 'UP' ? 'P4' : 'P2'); // 2 dipende da 1
  console.log(`dip ${dip.badge} -> turno ${turno}`); // => dip UP-001 -> turno P4
  return { dip, turno };
}
flussoTimbratura('UP-001');

// ------------------------------------------------------------
// 12) Combinare parallelo + sequenziale (ottimizzazione)
// ------------------------------------------------------------

async function reportReparto(sigla) {
  // questi due sono indipendenti: lanciali in parallelo
  const [dipendenti, dpi] = await Promise.all([
    delay(20, ['Mario', 'Luca']),
    delay(20, [{ taglia: 'L', q: 5 }]),
  ]);
  // questo dipende dai precedenti: deve essere dopo
  const riepilogo = await delay(10, {
    sigla,
    nDip: dipendenti.length,
    nDpi: dpi.length,
  });
  console.log('report:', riepilogo); // => report: { sigla:'UP', nDip:2, nDpi:1 }
  return riepilogo;
}
reportReparto('UP');

// ------------------------------------------------------------
// 13) for await...of: iterare su un async iterator / stream
// ------------------------------------------------------------

async function* generaPagine() {
  // simula la paginazione di una query (take/skip)
  yield await delay(10, ['UP-001', 'UP-002']);
  yield await delay(10, ['UP-003']);
}
async function leggiTutteLePagine() {
  let totale = 0;
  for await (const pagina of generaPagine()) {
    totale += pagina.length;
  }
  console.log('badge totali:', totale); // => badge totali: 3
}
leggiTutteLePagine();

// ------------------------------------------------------------
// 14) Errori comuni da evitare
// ------------------------------------------------------------

// (a) Dimenticare await -> ottieni la Promise, non il valore.
async function bug() {
  const t = fetchTimbratura('UP-001'); // manca await!
  console.log('tipo:', typeof t.ingresso); // => tipo: undefined (t e' una Promise)
}
bug();

// (b) await in sequenza quando potrebbe essere parallelo -> lentezza.
//     Soluzione: Promise.all (vedi punto 5).

// (c) catch mancante su una async chiamata "fire and forget" ->
//     UnhandledPromiseRejection. Aggiungi sempre .catch() o try/catch.
leggiTimbratura('').catch(() => {}); // gestito

// ------------------------------------------------------------
// 15) Top-level await (solo in moduli ESM .mjs / type:module)
// ------------------------------------------------------------

// Esempio modulo: in un file ESM puoi usare await fuori da funzioni.
// const dati = await fetch('/api/dipendenti').then(r => r.json());
// In CommonJS (questo file) racchiudi in una IIFE async:
(async () => {
  const ore = await calcolaOre([{ approvata: true, minuti: 90 }]);
  console.log('IIFE async ore:', ore); // => IIFE async ore: 1.5
})();

/* ============================================================
   RIEPILOGO COMANDI
   - async function / const f = async () => {}  -> ritorna Promise
   - await promise                              -> attende il resolve
   - try { } catch (e) { } finally { }          -> gestione errori
   - throw err                                  -> propaga l'errore
   - Promise.all([...])      -> parallelo, fallisce se UNA rejecta
   - Promise.allSettled([])  -> parallelo, mai fallisce (status/value/reason)
   - Promise.race([...])     -> prima che termina (resolve o reject)
   - Promise.any([...])      -> prima che RISOLVE (ignora i reject)
   - Promise.reject(err) / Promise.resolve(v)
   - for await (const x of asyncIterable)       -> stream/paginazione
   - async function* () { yield await ... }     -> async generator
   - .then() / .catch() / .finally()            -> interop con Promise
   - top-level await (solo ESM), IIFE async per CommonJS
   ============================================================ */
