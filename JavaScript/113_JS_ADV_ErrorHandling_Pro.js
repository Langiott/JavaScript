/* ============================================================
   113 JS ADV ErrorHandling Pro
   Gestione errori a livello professionale in JavaScript.
   Vedremo come creare custom Error classes con proprieta'
   semantiche (status, code), il pattern Result/Either per
   evitare il throw, strategie di retry con backoff esponenziale
   e jitter, e la corretta gestione degli errori in codice async
   (try/catch, Promise.allSettled, AbortController, timeout).
   Esempi ispirati a un gestionale ERP (dipendenti, timbrature,
   badge, turni, reparti).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) BASI: throw, Error e proprieta' standard
   ------------------------------------------------------------ */

// Un Error ha .name, .message e .stack. Si lancia con throw.
try {
  throw new Error('Badge non valido');
} catch (e) {
  console.log(e.name, '-', e.message); // => Error - Badge non valido
}

// I tipi built-in: TypeError, RangeError, SyntaxError, ecc.
try {
  null.nome; // accesso a proprieta' di null
} catch (e) {
  console.log(e instanceof TypeError); // => true
}

/* ------------------------------------------------------------
   2) CUSTOM ERROR CLASSES
   Estendono Error per aggiungere semantica (code, status).
   ------------------------------------------------------------ */

// Classe base per tutti gli errori applicativi.
class AppError extends Error {
  constructor(message, { code = 'APP_ERROR', status = 500, cause } = {}) {
    super(message, { cause });           // cause: ES2022, errore originale
    this.name = this.constructor.name;   // imposta il name corretto
    this.code = code;
    this.status = status;
    // Mantiene lo stack pulito (solo Node/V8)
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

// Errore di validazione: 400 + elenco campi non validi.
class ValidationError extends AppError {
  constructor(message, fields = []) {
    super(message, { code: 'VALIDATION', status: 400 });
    this.fields = fields;
  }
}

// Errore "non trovato": 404.
class NotFoundError extends AppError {
  constructor(entita, id) {
    super(`${entita} con id ${id} non trovato`, { code: 'NOT_FOUND', status: 404 });
    this.entita = entita;
    this.id = id;
  }
}

const errV = new ValidationError('Dati dipendente non validi', ['nome', 'codiceBadge']);
console.log(errV.name, errV.status, errV.fields); // => ValidationError 400 [ 'nome', 'codiceBadge' ]
console.log(errV instanceof AppError, errV instanceof Error); // => true true

// instanceof permette gestione differenziata per tipo.
function gestisci(err) {
  if (err instanceof ValidationError) return `400: ${err.fields.join(', ')}`;
  if (err instanceof NotFoundError) return `404: ${err.entita}`;
  return `500: errore interno`;
}
console.log(gestisci(new NotFoundError('Dipendente', 7))); // => 404: Dipendente

/* ------------------------------------------------------------
   3) ERROR CHAINING con `cause`
   Avvolgere un errore di basso livello in uno applicativo.
   ------------------------------------------------------------ */

function leggiBadgeGrezzo(raw) {
  if (!/^UP-\d{3}$/.test(raw)) throw new Error(`formato grezzo errato: ${raw}`);
  return raw;
}

function validaBadge(raw) {
  try {
    return leggiBadgeGrezzo(raw);
  } catch (low) {
    // Avvolgo l'errore tecnico mantenendo la causa originale.
    throw new ValidationError('Badge non conforme', ['codiceBadge'], { cause: low });
  }
}

try {
  validaBadge('XX1');
} catch (e) {
  console.log(e.message, '<-', e.cause?.message);
  // => Badge non conforme <- formato grezzo errato: XX1
}

/* ------------------------------------------------------------
   4) RESULT / EITHER PATTERN
   Invece di lanciare, restituire un oggetto { ok, value|error }.
   Rende il fallimento esplicito nella firma e nel chiamante.
   ------------------------------------------------------------ */

const Ok = (value) => ({ ok: true, value });
const Err = (error) => ({ ok: false, error });

// Normalizza un badge e ritorna un Result invece di throw.
function parseBadge(input) {
  const v = String(input || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!/^UP-\d{3}$/.test(v)) return Err(new ValidationError('Badge invalido', ['codiceBadge']));
  return Ok(v);
}

const r1 = parseBadge('  up-001 ');
const r2 = parseBadge('zzz');
console.log(r1); // => { ok: true, value: 'UP-001' }
console.log(r2.ok, r2.error.code); // => false VALIDATION

// Helper funzionali sul Result: map applica solo se ok.
const mapResult = (res, fn) => (res.ok ? Ok(fn(res.value)) : res);
const unwrapOr = (res, def) => (res.ok ? res.value : def);

const numero = mapResult(parseBadge('UP-042'), (b) => Number(b.slice(3)));
console.log(unwrapOr(numero, -1)); // => 42
console.log(unwrapOr(parseBadge('no'), -1)); // => -1

// Comporre piu' Result senza throw: si ferma al primo Err.
function creaDipendente(nome, badge) {
  const rb = parseBadge(badge);
  if (!rb.ok) return rb;
  if (!nome) return Err(new ValidationError('Nome mancante', ['nome']));
  return Ok({ nome, codiceBadge: rb.value });
}
console.log(creaDipendente('Mario', 'up-007')); // => { ok: true, value: { nome: 'Mario', codiceBadge: 'UP-007' } }
console.log(creaDipendente('', 'up-007').error.fields); // => [ 'nome' ]

// Convertire una funzione che lancia in una che ritorna Result.
function toResult(fn) {
  return (...args) => {
    try { return Ok(fn(...args)); }
    catch (e) { return Err(e); }
  };
}
const safeParse = toResult(JSON.parse);
console.log(safeParse('{"a":1}').value); // => { a: 1 }
console.log(safeParse('{rotto').ok);     // => false

/* ------------------------------------------------------------
   5) ERRORI ASYNC: try/catch con async/await
   ------------------------------------------------------------ */

// Simula una query al DB che a volte fallisce.
function queryTimbrature(badge, { fallisci = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fallisci) reject(new AppError('DB irraggiungibile', { code: 'DB_DOWN', status: 503 }));
      else resolve([{ badge, oreLavorate: 8 }]);
    }, 10);
  });
}

async function caricaTimbrature(badge) {
  try {
    const righe = await queryTimbrature(badge);
    const totale = righe.reduce((s, r) => s + r.oreLavorate, 0);
    return Ok({ badge, totale });
  } catch (e) {
    // Errore convertito in Result: il chiamante non deve fare try/catch.
    return Err(e);
  }
}

(async () => {
  const res = await caricaTimbrature('UP-001');
  console.log(res.ok, res.value.totale); // => true 8
})();

// Pattern rollback: se uno step async fallisce, si annulla il precedente.
async function creaDipendenteConBadge(db) {
  const dip = await db.insert('dipendente');
  try {
    await db.insert('badge', { di: dip.id });
    return Ok(dip);
  } catch (e) {
    await db.delete('dipendente', dip.id); // rollback manuale
    return Err(new AppError('Creazione fallita, rollback eseguito', { cause: e }));
  }
}

/* ------------------------------------------------------------
   6) GESTIRE PIU' OPERAZIONI ASYNC
   Promise.all vs Promise.allSettled.
   ------------------------------------------------------------ */

// Promise.all: fallisce tutto al primo reject (fail-fast).
(async () => {
  try {
    await Promise.all([
      queryTimbrature('UP-001'),
      queryTimbrature('UP-002', { fallisci: true }),
    ]);
  } catch (e) {
    console.log('all -> stop al primo errore:', e.code); // => all -> stop al primo errore: DB_DOWN
  }
})();

// Promise.allSettled: NON fallisce, riporta esito di ognuna.
(async () => {
  const esiti = await Promise.allSettled([
    queryTimbrature('UP-001'),
    queryTimbrature('UP-002', { fallisci: true }),
  ]);
  const ok = esiti.filter((e) => e.status === 'fulfilled').length;
  const ko = esiti.filter((e) => e.status === 'rejected').length;
  console.log(`settled -> ok:${ok} ko:${ko}`); // => settled -> ok:1 ko:1
})();

/* ------------------------------------------------------------
   7) TIMEOUT con AbortController / Promise.race
   ------------------------------------------------------------ */

// Lancia un errore se la promise non si risolve entro ms.
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new AppError('Timeout', { code: 'TIMEOUT', status: 504 })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

(async () => {
  try {
    await withTimeout(queryTimbrature('UP-001'), 1); // troppo poco
  } catch (e) {
    console.log(e.code); // => TIMEOUT
  }
})();

/* ------------------------------------------------------------
   8) RETRY con BACKOFF ESPONENZIALE + JITTER
   Riprova operazioni transitorie (DB_DOWN, TIMEOUT, rete).
   ------------------------------------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Decide se un errore vale la pena ritentare.
const retriable = (e) => ['DB_DOWN', 'TIMEOUT'].includes(e?.code);

async function retry(fn, { tentativi = 4, base = 20, max = 500 } = {}) {
  let ultimo;
  for (let i = 0; i < tentativi; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimo = e;
      if (!retriable(e) || i === tentativi - 1) break;
      // backoff esponenziale: base * 2^i, con jitter casuale, cap a max.
      const attesa = Math.min(max, base * 2 ** i) * (0.5 + Math.random());
      console.log(`tentativo ${i + 1} fallito (${e.code}), retry tra ~${Math.round(attesa)}ms`);
      await sleep(attesa);
    }
  }
  throw ultimo; // esauriti i tentativi
}

(async () => {
  let chiamate = 0;
  const flaky = async () => {
    chiamate++;
    if (chiamate < 3) throw new AppError('giu', { code: 'DB_DOWN' });
    return 'OK al 3o tentativo';
  };
  console.log(await retry(flaky, { tentativi: 5, base: 5 }));
  // => tentativo 1 fallito (DB_DOWN), retry tra ~..ms
  // => tentativo 2 fallito (DB_DOWN), retry tra ~..ms
  // => OK al 3o tentativo
})();

// Errore NON ritentabile: esce subito senza riprovare.
(async () => {
  try {
    await retry(async () => { throw new ValidationError('no retry', ['x']); });
  } catch (e) {
    console.log('non ritentato:', e.code); // => non ritentato: VALIDATION
  }
})();

/* ------------------------------------------------------------
   9) ERRORI NON CATTURATI (cenni)
   In Node, intercettare i reject mai gestiti aiuta a non crashare.
   ------------------------------------------------------------ */

// Esempio: registrare un handler globale (decommentare per provarlo).
// process.on('unhandledRejection', (reason) => {
//   console.error('Promise non gestita:', reason);
// });

/* ------------------------------------------------------------
   10) ESEMPIO BROWSER (pseudo-eseguibile)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
async function caricaReparti() {
  try {
    const res = await fetch('/api/reparti');
    if (!res.ok) throw new AppError(`HTTP ${res.status}`, { status: res.status });
    return Ok(await res.json());
  } catch (e) {
    // errore di rete o HTTP -> Result da mostrare in UI
    return Err(e);
  }
}
void caricaReparti; // evita warning "non usata"

/* ------------------------------------------------------------
   11) MAPPARE ERRORI -> RISPOSTA HTTP (pattern backend)
   ------------------------------------------------------------ */

// Da qualsiasi errore produce { status, body } coerente.
function toHttp(err) {
  if (err instanceof AppError) {
    return { status: err.status, body: { code: err.code, message: err.message, fields: err.fields } };
  }
  return { status: 500, body: { code: 'INTERNAL', message: 'Errore inatteso' } };
}
console.log(toHttp(new NotFoundError('Turno', 9)).status); // => 404
console.log(toHttp(new Error('boom')).body.code);          // => INTERNAL

/* ============================================================
   RIEPILOGO COMANDI
   - throw / try / catch / finally
   - new Error(msg, { cause })  // ES2022 error cause
   - class X extends Error      // custom error classes
   - this.name = this.constructor.name
   - Error.captureStackTrace(this, this.constructor)  // V8
   - instanceof                 // discriminare tipi di errore
   - Result/Either: Ok()/Err() -> { ok, value | error }
   - mapResult / unwrapOr / toResult
   - async / await + try/catch
   - Promise.all   // fail-fast
   - Promise.allSettled  // status: fulfilled | rejected
   - Promise.race  // timeout
   - .finally()    // cleanup (clearTimeout)
   - AbortController (cenni)
   - setTimeout / clearTimeout / sleep
   - retry + backoff esponenziale (base * 2 ** i) + jitter
   - process.on('unhandledRejection', ...)  // Node globale
   - fetch + res.ok  // errori HTTP (browser)
   ============================================================ */
