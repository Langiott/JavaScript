/* ============================================================
   109 JS ADV Performance
   Tecniche per scrivere codice JavaScript veloce ed efficiente:
   debounce e throttle per limitare la frequenza di esecuzione,
   memoization per cachare risultati costosi, lazy evaluation
   per calcolare solo cio che serve e quando serve, e strategie
   generali per EVITARE LAVORO INUTILE (early return, caching,
   batching). Esempi ispirati a un gestionale ERP reale.
   ============================================================ */

'use strict';

/* ============================================================
   1) PERCHE' LA PERFORMANCE CONTA
   La regola d'oro: il codice piu veloce e quello che NON gira.
   Prima di ottimizzare, evita lavoro inutile (early return,
   short-circuit, caching). Solo dopo, ottimizza il resto.
   ============================================================ */

// Early return: esci appena possibile, niente calcoli inutili
function calcolaOreLavorate(timbratura) {
  if (!timbratura) return 0;                 // guard clause
  if (!timbratura.uscita) return 0;          // turno non chiuso
  const minuti = timbratura.uscita - timbratura.ingresso;
  return minuti / 60;
}
console.log(calcolaOreLavorate(null));                    // => 0
console.log(calcolaOreLavorate({ ingresso: 0 }));         // => 0
console.log(calcolaOreLavorate({ ingresso: 0, uscita: 28800 })); // => 8

// Short-circuit: && e || fermano la valutazione appena possibile
const reparto = null;
const sigla = reparto?.sigla ?? 'XX';        // niente accesso se null
console.log(sigla);                          // => XX

/* ============================================================
   2) DEBOUNCE
   Esegue la funzione SOLO dopo che e passato un certo tempo
   dall'ULTIMA chiamata. Utile per ricerche live, resize,
   salvataggio automatico: aspetta che l'utente smetta.
   ============================================================ */

function debounce(fn, delay = 300) {
  let timer;                                  // closure: ricorda il timer
  return function (...args) {
    clearTimeout(timer);                      // annulla la chiamata precedente
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Esempio: ricerca dipendente mentre l'utente digita nel filtro
const cercaDipendente = (q) => console.log('Query al server:', q);
const cercaDebounced = debounce(cercaDipendente, 200);
cercaDebounced('M');
cercaDebounced('Ma');
cercaDebounced('Mar');     // solo 'Mar' arrivera al server dopo 200ms
// => Query al server: Mar

// Variante con leading edge: esegue subito alla prima chiamata
function debounceLeading(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (!timer) fn.apply(this, args);         // esegue subito la prima volta
    clearTimeout(timer);
    timer = setTimeout(() => { timer = null; }, delay);
  };
}

/* ============================================================
   3) THROTTLE
   Esegue la funzione AL MASSIMO una volta ogni intervallo.
   Differenza con debounce: throttle garantisce esecuzioni
   regolari durante un flusso continuo (scroll, mousemove,
   polling di stato), debounce aspetta la quiete.
   ============================================================ */

function throttle(fn, limit = 1000) {
  let inAttesa = false;
  let ultimiArgs = null;
  return function (...args) {
    if (inAttesa) { ultimiArgs = args; return; }
    fn.apply(this, args);
    inAttesa = true;
    setTimeout(() => {
      inAttesa = false;
      if (ultimiArgs) { fn.apply(this, ultimiArgs); ultimiArgs = null; }
    }, limit);
  };
}

// Esempio: aggiorna il contatore presenti al massimo 1 volta/sec
const aggiornaPresenti = (n) => console.log('Presenti in fabbrica:', n);
const aggiornaThrottled = throttle(aggiornaPresenti, 1000);
aggiornaThrottled(12);   // eseguito subito => Presenti in fabbrica: 12
aggiornaThrottled(13);   // ignorato (in attesa)
aggiornaThrottled(14);   // memorizzato, eseguito a fine intervallo

/* ============================================================
   4) MEMOIZATION
   Cacha il risultato di una funzione pura in base agli argomenti:
   stessi input => stesso output, senza ricalcolare.
   Ideale per calcoli costosi e deterministici.
   ============================================================ */

function memoize(fn) {
  const cache = new Map();                    // closure persistente
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const risultato = fn.apply(this, args);
    cache.set(key, risultato);
    return risultato;
  };
}

// Calcolo costo orario di un reparto (immaginiamo sia costoso)
let chiamate = 0;
const costoReparto = memoize((sigla, ore) => {
  chiamate++;
  return ore * 25;                            // 25 euro/ora fittizi
});
console.log(costoReparto('UP', 8));   // => 200 (calcolato)
console.log(costoReparto('UP', 8));   // => 200 (da cache)
console.log(chiamate);                // => 1 (calcolato una sola volta)

// Memoization classica: Fibonacci da esponenziale a lineare
const fib = memoize((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(30));                 // => 832040 (istantaneo grazie alla cache)

// WeakMap per memoizzare per OGGETTO (chiave = riferimento, GC-friendly)
const cacheDTO = new WeakMap();
function toDTO(dipendente) {
  if (cacheDTO.has(dipendente)) return cacheDTO.get(dipendente);
  const dto = { badge: dipendente.codiceBadge, nome: dipendente.nome };
  cacheDTO.set(dipendente, dto);
  return dto;
}
const dip = { codiceBadge: 'UP-001', nome: 'Mario', extra: '...' };
console.log(toDTO(dip));              // => { badge: 'UP-001', nome: 'Mario' }
console.log(toDTO(dip) === toDTO(dip)); // => true (stesso oggetto cachato)

/* ============================================================
   5) LAZY EVALUATION
   Calcola un valore SOLO al primo accesso, poi riusa.
   Utile per inizializzazioni costose che potrebbero non servire.
   ============================================================ */

// Lazy con getter: la configurazione viene costruita solo se letta
function creaConfig() {
  let _cache;
  return {
    get turniDefault() {
      if (_cache === undefined) {
        console.log('Costruisco config (una volta sola)...');
        _cache = { P4: { pausa: 30 }, P2: { pausa: 0 } };
      }
      return _cache;
    },
  };
}
const cfg = creaConfig();
console.log(cfg.turniDefault.P4.pausa);  // => costruisco... poi 30
console.log(cfg.turniDefault.P2.pausa);  // => 0 (niente ricostruzione)

// Lazy generator: produce dati solo quando richiesti (stream pigro)
function* generaBadge(prefisso, n) {
  for (let i = 1; i <= n; i++) {
    yield `${prefisso}-${String(i).padStart(3, '0')}`;
  }
}
const it = generaBadge('UP', 1000);
console.log(it.next().value);            // => UP-001 (gli altri 999 non calcolati)
console.log(it.next().value);            // => UP-002

// Pipeline pigra: filtra e mappa senza creare array intermedi enormi
function* filtra(iter, pred) { for (const x of iter) if (pred(x)) yield x; }
function* mappa(iter, fn) { for (const x of iter) yield fn(x); }
const primiUP = mappa(
  filtra(generaBadge('UP', 1000), (b) => b.endsWith('5')),
  (b) => b.toLowerCase()
);
console.log(primiUP.next().value);       // => up-005 (lavoro minimo)

/* ============================================================
   6) EVITARE LAVORO INUTILE NEGLI ARRAY
   Un solo passaggio (reduce) invece di filter+map+reduce.
   Esci dal loop appena possibile (some/every/find).
   ============================================================ */

const richieste = [
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 60 },
  { approvata: true, minuti: 120 },
];

// LENTO: tre passaggi sull'array
const totaleLento = richieste
  .filter((r) => r.approvata)
  .map((r) => r.minuti)
  .reduce((s, m) => s + m, 0);
console.log(totaleLento);                // => 600

// VELOCE: un solo passaggio
const totaleVeloce = richieste.reduce(
  (s, r) => (r.approvata ? s + r.minuti : s),
  0
);
console.log(totaleVeloce);               // => 600

// find/some/every escono al primo match: niente scansione completa
const haTurnoLungo = richieste.some((r) => r.minuti > 400);
console.log(haTurnoLungo);               // => true (si ferma alla prima)

// Precompila un Set per lookup O(1) invece di includes O(n) in loop
const badgeAttivi = new Set(['UP-001', 'UP-002', 'UP-007']);
const verifica = (b) => badgeAttivi.has(b);   // O(1) ogni controllo
console.log(verifica('UP-002'));         // => true
console.log(verifica('UP-099'));         // => false

// Indicizza per chiave una volta sola (Map), poi cerca in O(1)
const dipendenti = [
  { id: 1, badge: 'UP-001', nome: 'Anna' },
  { id: 2, badge: 'UP-002', nome: 'Luca' },
];
const perBadge = new Map(dipendenti.map((d) => [d.badge, d]));
console.log(perBadge.get('UP-002').nome); // => Luca

/* ============================================================
   7) BATCHING E DEDUPLICA DELLE PROMISE
   Evita richieste duplicate: se una fetch e gia in corso per
   la stessa chiave, riusa la stessa Promise (single-flight).
   ============================================================ */

const inflight = new Map();
function fetchRepartoUnaVolta(sigla, fetcher) {
  if (inflight.has(sigla)) return inflight.get(sigla);  // riusa la richiesta
  const p = Promise.resolve(fetcher(sigla)).finally(() => inflight.delete(sigla));
  inflight.set(sigla, p);
  return p;
}
// Esempio: due chiamate ravvicinate => una sola fetch reale
const fakeFetch = (s) => { console.log('FETCH reale:', s); return { sigla: s }; };
fetchRepartoUnaVolta('UP', fakeFetch);
fetchRepartoUnaVolta('UP', fakeFetch);   // => una sola "FETCH reale: UP"

/* ============================================================
   8) MISURARE PRIMA DI OTTIMIZZARE
   Non indovinare: misura. console.time / performance.now.
   "Premature optimization is the root of all evil".
   ============================================================ */

function misura(label, fn) {
  const t0 = performance.now();
  const r = fn();
  const t1 = performance.now();
  console.log(`${label}: ${(t1 - t0).toFixed(3)}ms`);
  return r;
}
misura('somma 1..1e5', () => {
  let s = 0;
  for (let i = 0; i < 1e5; i++) s += i;
  return s;
});
// => somma 1..1e5: <qualche ms>

// console.time / console.timeEnd come alternativa
console.time('loop');
for (let i = 0; i < 1e4; i++) { /* lavoro fittizio */ }
console.timeEnd('loop');                 // => loop: X ms

/* ============================================================
   9) PATTERN PROFESSIONALI COMBINATI
   debounce su input + memoize sul calcolo + early return.
   ============================================================ */

// Autosave del modulo dipendente: salva solo se cambiato, con debounce
function creaAutosave(salva, delay = 500) {
  let ultimoSerializzato = null;
  const salvaDebounced = debounce((dato) => {
    const s = JSON.stringify(dato);
    if (s === ultimoSerializzato) return;     // niente lavoro se identico
    ultimoSerializzato = s;
    salva(dato);
  }, delay);
  return salvaDebounced;
}
const autosave = creaAutosave((d) => console.log('Salvato:', d.nome));
autosave({ nome: 'Anna', badge: 'UP-001' });
autosave({ nome: 'Anna', badge: 'UP-001' }); // ultima vince, una sola scrittura

// Memoize con TTL (cache che scade): utile per dati semi-statici (reparti)
function memoizeTTL(fn, ttlMs = 60000) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    const ora = Date.now();
    const hit = cache.get(key);
    if (hit && ora - hit.t < ttlMs) return hit.v;  // valido => riusa
    const v = fn.apply(this, args);
    cache.set(key, { v, t: ora });
    return v;
  };
}
const listaReparti = memoizeTTL(() => ['UP', 'P2', 'MG'], 5000);
console.log(listaReparti());             // => ['UP','P2','MG'] (calcolato)
console.log(listaReparti());             // => stesso array (cache valida)

/* ============================================================
   RIEPILOGO COMANDI
   - Early return / guard clause: if (!x) return ...
   - Short-circuit: a && b, a || b, a ?? b, x?.y
   - debounce(fn, delay) -> clearTimeout + setTimeout
   - throttle(fn, limit) -> flag inAttesa + setTimeout
   - memoize(fn) -> new Map() + JSON.stringify(args)
   - WeakMap per cache per-oggetto (GC-friendly)
   - memoizeTTL(fn, ttl) -> cache con scadenza Date.now()
   - Lazy getter: get prop() { if(!_c)... }
   - function* / yield / .next() -> generatori pigri
   - reduce in un passaggio invece di filter().map().reduce()
   - some()/every()/find() -> uscita anticipata dal loop
   - new Set() / Set.has() -> lookup O(1)
   - new Map(arr.map(...)) -> indicizzazione e get O(1)
   - single-flight: Map di Promise in corso + .finally()
   - performance.now() / console.time() / console.timeEnd()
   ============================================================ */
