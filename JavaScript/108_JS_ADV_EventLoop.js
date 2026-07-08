/* ============================================================
   108 JS ADV EventLoop
   L'event loop e' il meccanismo che permette a JavaScript (single-thread)
   di gestire codice asincrono senza bloccare l'esecuzione. Qui vediamo
   la call stack, la differenza tra microtask (Promise, queueMicrotask)
   e macrotask (setTimeout, setInterval, I/O), e soprattutto l'ORDINE
   con cui vengono stampati console.log sincroni, callback di setTimeout
   e callback di Promise. Capire questo ordine e' fondamentale per non
   introdurre race condition in un gestionale (es. salvataggio timbrature).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. JavaScript e' single-thread: la CALL STACK
   ------------------------------------------------------------
   Ogni chiamata di funzione viene impilata (push) sulla call stack
   ed eliminata (pop) quando ritorna. Tutto il codice SINCRONO gira
   prima di qualsiasi codice asincrono. */
function terzo() {
  console.log('terzo');
}
function secondo() {
  terzo();
}
function primo() {
  console.log('primo');
  secondo();
}
primo();
// => primo
// => terzo
// La stack era: primo -> secondo -> terzo, poi svuotata in ordine inverso.

/* ------------------------------------------------------------
   2. Il modello: call stack + Web/Node API + task queues + event loop
   ------------------------------------------------------------
   - Call stack: dove gira il codice ORA.
   - Background API: timer, I/O, network gestiti fuori dal main thread.
   - Macrotask queue (task queue): callback di setTimeout/setInterval/I/O.
   - Microtask queue: callback di Promise.then/catch/finally, queueMicrotask, await.
   L'event loop: quando la call stack e' VUOTA, svuota TUTTI i microtask,
   poi prende UN macrotask, poi di nuovo TUTTI i microtask, e cosi' via. */

/* ------------------------------------------------------------
   3. L'esempio classico: ordine sync / setTimeout / Promise
   ------------------------------------------------------------ */
console.log('A: sincrono inizio');

setTimeout(() => {
  console.log('D: macrotask (setTimeout 0)');
}, 0);

Promise.resolve().then(() => {
  console.log('C: microtask (Promise.then)');
});

console.log('B: sincrono fine');
// Output:
// => A: sincrono inizio
// => B: sincrono fine
// => C: microtask (Promise.then)
// => D: macrotask (setTimeout 0)
// Regola d'oro: SINCRONO > MICROTASK > MACROTASK.

/* ------------------------------------------------------------
   4. I microtask hanno SEMPRE priorita' sui macrotask
   ------------------------------------------------------------
   Anche con setTimeout 0, la Promise vince. */
setTimeout(() => console.log('macro 1'), 0);
Promise.resolve().then(() => console.log('micro 1'));
Promise.resolve().then(() => console.log('micro 2'));
setTimeout(() => console.log('macro 2'), 0);
// => micro 1
// => micro 2
// => macro 1
// => macro 2

/* ------------------------------------------------------------
   5. queueMicrotask: schedulare manualmente un microtask
   ------------------------------------------------------------ */
queueMicrotask(() => console.log('queueMicrotask eseguito'));
console.log('dopo queueMicrotask (sincrono)');
// => dopo queueMicrotask (sincrono)
// => queueMicrotask eseguito

/* ------------------------------------------------------------
   6. Microtask che generano altri microtask
   ------------------------------------------------------------
   Una microtask queue viene svuotata COMPLETAMENTE prima del
   prossimo macrotask, anche se i microtask ne aggiungono altri. */
Promise.resolve().then(() => {
  console.log('micro a');
  Promise.resolve().then(() => console.log('micro a.1 (annidato)'));
});
Promise.resolve().then(() => console.log('micro b'));
// => micro a
// => micro b
// => micro a.1 (annidato)

/* ------------------------------------------------------------
   7. async/await e' "zucchero sintattico" sui microtask
   ------------------------------------------------------------
   Tutto cio' che segue un await viene messo nella microtask queue. */
async function esempioAwait() {
  console.log('1: prima dell await (sincrono)');
  await null; // crea un punto di sospensione -> microtask
  console.log('3: dopo l await (microtask)');
}
esempioAwait();
console.log('2: dopo la chiamata (sincrono)');
// => 1: prima dell await (sincrono)
// => 2: dopo la chiamata (sincrono)
// => 3: dopo l await (microtask)

/* ------------------------------------------------------------
   8. Esempio combinato e ostico: sync + await + then + setTimeout
   ------------------------------------------------------------ */
async function combinato() {
  console.log('s1');
  await Promise.resolve();
  console.log('s4'); // microtask
}
console.log('s0');
setTimeout(() => console.log('s5 (macro)'), 0);
combinato();
Promise.resolve().then(() => console.log('s3 (micro)'));
console.log('s2');
// => s0
// => s1
// => s2
// => s4
// => s3
// => s5 (macro)
// Nota: s4 (await) viene accodato PRIMA del then s3 -> quindi esce prima.

/* ------------------------------------------------------------
   9. setTimeout NON e' preciso: e' un minimo, non una garanzia
   ------------------------------------------------------------
   Il delay e' il tempo MINIMO prima che il callback sia ELIGIBILE.
   Se la call stack e' occupata, parte dopo. */
const inizio = Date.now();
setTimeout(() => {
  console.log('setTimeout 50ms reale:', Date.now() - inizio, 'ms (>= 50)');
}, 50);
// Un loop sincrono pesante ritarderebbe ulteriormente questo callback.

/* ------------------------------------------------------------
   10. Spezzare un lavoro pesante per non bloccare l'event loop
   ------------------------------------------------------------
   Pattern reale: elaborare tante righe senza freezare l'interfaccia.
   Si "cede" il controllo all'event loop tra un blocco e l'altro. */
function elaboraAChunk(items, dimChunk, onItem, onDone) {
  let i = 0;
  function prossimoBlocco() {
    const fine = Math.min(i + dimChunk, items.length);
    for (; i < fine; i++) onItem(items[i]);
    if (i < items.length) {
      setTimeout(prossimoBlocco, 0); // cede il controllo: altri task possono girare
    } else {
      onDone();
    }
  }
  prossimoBlocco();
}
const numeri = Array.from({ length: 10 }, (_, k) => k + 1);
let somma = 0;
elaboraAChunk(numeri, 3, (n) => (somma += n), () => {
  console.log('elaborazione chunk completata, somma =', somma); // => 55
});

/* ------------------------------------------------------------
   11. ERP: salvataggio timbratura naive-UTC dopo I/O asincrono
   ------------------------------------------------------------
   L'ora va calcolata al momento giusto. Qui simuliamo una fetch e
   mostriamo che il calcolo dell'orario avviene nel microtask post-await. */
function nowRomeNaiveUTC() {
  // legge l'ora di Roma e la "congela" come fosse UTC
  const parts = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('hour')}:${get('minute')}`;
}
function fintoFetch(badge) {
  return new Promise((res) => setTimeout(() => res({ badge, ok: true }), 10));
}
async function timbra(badge) {
  console.log(`[${badge}] avvio timbratura (sincrono)`);
  const risposta = await fintoFetch(badge); // sospensione -> microtask al ritorno
  const orario = nowRomeNaiveUTC(); // calcolato DOPO l await, valore "fresco"
  console.log(`[${risposta.badge}] timbrato alle ${orario} (microtask)`);
}
timbra('UP-001');
console.log('UI: spinner mostrato (sincrono, parte prima del timbrato)');
// => [UP-001] avvio timbratura (sincrono)
// => UI: spinner mostrato (sincrono, parte prima del timbrato)
// => [UP-001] timbrato alle HH:MM (microtask)  (dopo ~10ms)

/* ------------------------------------------------------------
   12. Promise.all e ordine: parallele ma callback nei microtask
   ------------------------------------------------------------
   ERP: 8 query parallele al DB; il .then finale gira come microtask. */
function query(nome, ms) {
  return new Promise((res) => setTimeout(() => res(nome), ms));
}
Promise.all([
  query('dipendenti', 5),
  query('turni', 5),
  query('reparti', 5),
]).then((risultati) => {
  console.log('Promise.all completato:', risultati.join(', '));
});
// => Promise.all completato: dipendenti, turni, reparti

/* ------------------------------------------------------------
   13. Errore nei microtask: unhandled rejection
   ------------------------------------------------------------
   Una Promise rifiutata senza catch genera un microtask di rejection.
   Gestire SEMPRE l'errore evita crash silenziosi nel backend. */
Promise.reject(new Error('timbratura duplicata'))
  .catch((e) => console.log('gestito:', e.message)); // => gestito: timbratura duplicata

/* ------------------------------------------------------------
   14. Node: process.nextTick batte i microtask delle Promise
   ------------------------------------------------------------
   In Node, process.nextTick ha priorita' ANCORA superiore alle Promise.
   (In browser non esiste; e' specifico di Node.) */
if (typeof process !== 'undefined' && process.nextTick) {
  Promise.resolve().then(() => console.log('node: promise microtask'));
  process.nextTick(() => console.log('node: nextTick (prima della promise)'));
  // => node: nextTick (prima della promise)
  // => node: promise microtask
}

/* ------------------------------------------------------------
   15. Node: setImmediate vs setTimeout(0)
   ------------------------------------------------------------
   Entrambi macrotask, ma in fasi diverse del loop. setImmediate gira
   nella fase "check", utile per "esegui dopo l'I/O corrente". */
if (typeof setImmediate !== 'undefined') {
  setImmediate(() => console.log('node: setImmediate (fase check)'));
  setTimeout(() => console.log('node: setTimeout 0 (fase timers)'), 0);
  // L'ordine relativo nel codice top-level non e' garantito;
  // dentro un callback di I/O, setImmediate vince sempre.
}

/* ------------------------------------------------------------
   16. Esempio browser: l'event loop e il rendering
   ------------------------------------------------------------
   Esempio browser: gira nel browser, non in Node.
   I microtask girano PRIMA del repaint; un loop di microtask infinito
   bloccherebbe il rendering. requestAnimationFrame gira prima del paint. */
function esempioBrowserRender() {
  // requestAnimationFrame(() => console.log('prima del prossimo paint'));
  // Promise.resolve().then(() => console.log('microtask prima del rAF'));
  // setTimeout(() => console.log('macrotask, in genere dopo il paint'), 0);
}
esempioBrowserRender();

/* ------------------------------------------------------------
   17. Trappola: microtask infiniti affamano i macrotask
   ------------------------------------------------------------
   Se un microtask ne ri-accoda sempre uno nuovo, i setTimeout NON
   partono mai (starvation). Esempio CONTROLLATO con contatore. */
let conta = 0;
function microRicorsivo() {
  if (conta++ < 3) {
    Promise.resolve().then(microRicorsivo); // si auto-riaccoda (limitato)
  } else {
    console.log('catena microtask terminata, conta =', conta); // => 4
  }
}
microRicorsivo();

/* ------------------------------------------------------------
   18. await in un ciclo: serializza i microtask (utile per ordine)
   ------------------------------------------------------------
   ERP: registrare timbrature una alla volta mantenendo l'ordine. */
async function registraInOrdine(badges) {
  for (const b of badges) {
    await Promise.resolve(); // ogni iterazione attende un tick microtask
    console.log('registrato badge', b);
  }
  console.log('tutte le registrazioni in ordine completate');
}
registraInOrdine(['UP-001', 'UP-002', 'UP-003']);
// => registrato badge UP-001
// => registrato badge UP-002
// => registrato badge UP-003
// => tutte le registrazioni in ordine completate

/* ------------------------------------------------------------
   19. Quadro finale dell'ordine di esecuzione (riepilogo mentale)
   ------------------------------------------------------------
   1) Tutto il codice SINCRONO del task corrente (call stack).
   2) Svuota TUTTA la microtask queue (nextTick > promise/await/queueMicrotask).
   3) Rendering (solo browser).
   4) UN macrotask (setTimeout/setImmediate/I/O), poi torna al punto 2.
   ------------------------------------------------------------ */

/* ============================================================
   RIEPILOGO COMANDI (scheda di ripasso rapida)
   ------------------------------------------------------------
   - console.log()                  -> codice sincrono, gira subito
   - setTimeout(fn, ms)             -> macrotask (delay = minimo, non esatto)
   - setInterval(fn, ms)            -> macrotask ripetuto
   - Promise.resolve().then(fn)     -> microtask
   - .catch(fn) / .finally(fn)      -> microtask (gestione errori/cleanup)
   - Promise.all([...])             -> attende tutte; callback in microtask
   - Promise.reject()               -> microtask di rejection (gestire con catch)
   - async / await                  -> il post-await diventa un microtask
   - queueMicrotask(fn)             -> accoda un microtask manuale
   - process.nextTick(fn)           -> [Node] microtask a priorita' massima
   - setImmediate(fn)               -> [Node] macrotask in fase "check"
   - requestAnimationFrame(fn)      -> [browser] prima del prossimo paint
   - Intl.DateTimeFormat            -> usato per orario naive-UTC dopo await
   Priorita': SINCRONO > nextTick > MICROTASK > (render) > MACROTASK
   ============================================================ */
