/* ============================================================
   114 JS ADV Validation
   Data validation in JavaScript: come difendersi da input
   sbagliati, mancanti o malevoli. Vedremo le guard functions
   (uscite anticipate), i type guards (controllo del tipo a
   runtime), la schema validation manuale (validare un oggetto
   campo per campo) e la sanitization (ripulire/normalizzare i
   dati). Esempi ispirati a un gestionale ERP: dipendenti,
   timbrature, badge 'UP-001', turni e reparti.
   ============================================================ */

'use strict';

/* ============================================================
   1) GUARD FUNCTIONS (early return / fail fast)
   Una guard clause controlla una condizione e "esce subito"
   se non e' soddisfatta, evitando nesting profondo di if.
   ============================================================ */

// Guard semplice: validare prima di procedere
function salvaDipendente(dip) {
  if (!dip) return { ok: false, error: 'dipendente assente' };
  if (!dip.nome) return { ok: false, error: 'nome obbligatorio' };
  if (!dip.codiceBadge) return { ok: false, error: 'badge obbligatorio' };
  return { ok: true, value: dip };
}
console.log(salvaDipendente(null));               // => { ok:false, error:'dipendente assente' }
console.log(salvaDipendente({ nome: 'Mario' }));  // => { ok:false, error:'badge obbligatorio' }

// Guard che lancia eccezione (assertion): utile a inizio funzione
function assert(condizione, messaggio) {
  if (!condizione) throw new Error(messaggio);
}
function calcolaOre(minuti) {
  assert(typeof minuti === 'number', 'minuti deve essere number');
  assert(minuti >= 0, 'minuti non puo essere negativo');
  return minuti / 60;
}
console.log(calcolaOre(90)); // => 1.5

/* ============================================================
   2) TYPE GUARDS (controllo del tipo a runtime)
   Funzioni che restituiscono boolean e confermano il tipo
   di un valore. Sono i mattoni di ogni validazione.
   ============================================================ */

const isString  = (v) => typeof v === 'string';
const isNumber  = (v) => typeof v === 'number' && !Number.isNaN(v);
const isBoolean = (v) => typeof v === 'boolean';
const isArray   = (v) => Array.isArray(v);
const isObject  = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isFunction = (v) => typeof v === 'function';

console.log(isString('UP-001')); // => true
console.log(isNumber(NaN));      // => false  (NaN scartato apposta)
console.log(isObject([]));       // => false  (gli array non sono "object" qui)
console.log(isObject({}));       // => true

// typeof null e' 'object': trappola classica, da gestire sempre
console.log(typeof null);        // => object

// Distinguere intero, float, finito
const isInteger = (v) => Number.isInteger(v);
const isFinitoPositivo = (v) => Number.isFinite(v) && v > 0;
console.log(isInteger(5));       // => true
console.log(isInteger(5.5));     // => false
console.log(isFinitoPositivo(Infinity)); // => false

// Type guard "non vuoto": stringa con contenuto reale
const isNonEmptyString = (v) => isString(v) && v.trim().length > 0;
console.log(isNonEmptyString('   ')); // => false
console.log(isNonEmptyString('Up'));  // => true

// instanceof come type guard per oggetti speciali
const isDate = (v) => v instanceof Date && !Number.isNaN(v.getTime());
console.log(isDate(new Date()));         // => true
console.log(isDate(new Date('xxx')));    // => false (Invalid Date)

// Guard su valori di un'enum (union types a runtime)
const RUOLI = ['operaio', 'impiegato', 'responsabile'];
const isRuolo = (v) => RUOLI.includes(v);
console.log(isRuolo('operaio'));  // => true
console.log(isRuolo('admin'));    // => false

/* ============================================================
   3) VALIDATORI DI DOMINIO (regex + range)
   Pattern reali ERP: badge 'UP-001', orario 'HH:MM', sigla
   reparto di 2 lettere, range minuti di un turno.
   ============================================================ */

// Badge formato 'XX-000' (due lettere, trattino, 3 cifre)
const isBadge = (v) => isString(v) && /^[A-Z]{2}-\d{3}$/.test(v);
console.log(isBadge('UP-001')); // => true
console.log(isBadge('up-1'));   // => false

// Orario 'HH:MM' valido (00:00 - 23:59)
function isOrario(v) {
  if (!isString(v) || !/^\d{2}:\d{2}$/.test(v)) return false;
  const [h, m] = v.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}
console.log(isOrario('08:30')); // => true
console.log(isOrario('25:00')); // => false

// Sigla reparto: 2 lettere maiuscole
const isSiglaReparto = (v) => isString(v) && /^[A-Z]{2}$/.test(v);
console.log(isSiglaReparto('PR')); // => true

// Estrarre il numero progressivo da un badge con match + guard
function numeroBadge(badge) {
  if (!isBadge(badge)) return null;
  const m = badge.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}
console.log(numeroBadge('UP-042')); // => 42
console.log(numeroBadge('zzz'));    // => null

/* ============================================================
   4) SANITIZATION (ripulire e normalizzare l'input)
   Prima di validare conviene normalizzare: trim, case, togliere
   spazi, troncare lunghezze. Pattern ERP autentico.
   ============================================================ */

// Normalizza un codice: stringa -> trim -> upper -> no spazi -> max 8
function normalizzaCodice(v) {
  return String(v ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .slice(0, 8);
}
console.log(normalizzaCodice('  up 001 ')); // => UP001
console.log(normalizzaCodice(null));        // => '' (nullish gestito)

// Coercizione sicura a numero: ritorna fallback se non valido
function toNumber(v, fallback = 0) {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}
console.log(toNumber('3,5'));        // => 3.5
console.log(toNumber('abc', -1));    // => -1

// Sanitize HTML basilare: neutralizza caratteri pericolosi (anti-XSS minimale)
function escapeHtml(v) {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
console.log(escapeHtml('<script>alert(1)</script>'));
// => &lt;script&gt;alert(1)&lt;/script&gt;

// Trim ricorsivo di tutte le stringhe di un oggetto (clean DTO in ingresso)
function trimDeep(obj) {
  if (isString(obj)) return obj.trim();
  if (isArray(obj)) return obj.map(trimDeep);
  if (isObject(obj)) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, trimDeep(v)]));
  }
  return obj;
}
console.log(trimDeep({ nome: '  Mario  ', tags: [' a ', ' b '] }));
// => { nome: 'Mario', tags: ['a','b'] }

// Whitelist dei campi: tiene solo le chiavi ammesse (evita mass assignment)
function pick(obj, chiavi) {
  const out = {};
  for (const k of chiavi) if (k in obj) out[k] = obj[k];
  return out;
}
console.log(pick({ nome: 'M', ruolo: 'admin', isAdmin: true }, ['nome', 'ruolo']));
// => { nome: 'M', ruolo: 'admin' }   (isAdmin scartato)

/* ============================================================
   5) SCHEMA VALIDATION MANUALE
   Un mini "validator" dichiarativo: per ogni campo una guard +
   un messaggio. Accumula tutti gli errori (non solo il primo).
   ============================================================ */

// Helper per costruire una regola: { test, message, required }
const rule = (test, message, required = true) => ({ test, message, required });

function validate(data, schema) {
  const errors = {};
  for (const [campo, regola] of Object.entries(schema)) {
    const valore = data?.[campo];
    const mancante = valore === undefined || valore === null || valore === '';
    if (mancante) {
      if (regola.required) errors[campo] = `${campo} obbligatorio`;
      continue; // se non required e assente, si salta
    }
    if (!regola.test(valore)) errors[campo] = regola.message;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// Schema per un dipendente ERP
const schemaDipendente = {
  nome:        rule(isNonEmptyString, 'nome non valido'),
  cognome:     rule(isNonEmptyString, 'cognome non valido'),
  codiceBadge: rule(isBadge, 'badge deve essere tipo UP-001'),
  ruolo:       rule(isRuolo, `ruolo tra: ${RUOLI.join(', ')}`),
  email:       rule((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'email non valida', false),
};

console.log(validate({ nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001', ruolo: 'operaio' }, schemaDipendente));
// => { valid: true, errors: {} }

console.log(validate({ nome: '', codiceBadge: 'xx', ruolo: 'capo' }, schemaDipendente));
// => { valid:false, errors:{ nome:'nome...', cognome:'cognome...', codiceBadge:'badge...', ruolo:'ruolo...' } }

// Schema per una timbratura (orari naive in formato HH:MM)
const schemaTimbratura = {
  badge:    rule(isBadge, 'badge non valido'),
  ingresso: rule(isOrario, 'ingresso HH:MM'),
  uscita:   rule(isOrario, 'uscita HH:MM'),
};
console.log(validate({ badge: 'UP-007', ingresso: '08:00', uscita: '17:00' }, schemaTimbratura).valid);
// => true

/* ============================================================
   6) VALIDAZIONE COMPOSTA / CROSS-FIELD
   Alcune regole coinvolgono piu campi insieme (es. uscita deve
   essere dopo l'ingresso). Si validano dopo lo schema base.
   ============================================================ */

function minutiDaOrario(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function validaTimbratura(t) {
  const base = validate(t, schemaTimbratura);
  if (!base.valid) return base;
  if (minutiDaOrario(t.uscita) <= minutiDaOrario(t.ingresso)) {
    return { valid: false, errors: { uscita: 'uscita deve essere dopo ingresso' } };
  }
  return { valid: true, errors: {} };
}
console.log(validaTimbratura({ badge: 'UP-007', ingresso: '17:00', uscita: '08:00' }));
// => { valid:false, errors:{ uscita:'uscita deve essere dopo ingresso' } }

/* ============================================================
   7) VALIDAZIONE DI ARRAY (every / some / map)
   ============================================================ */

const turni = [
  { badge: 'UP-001', ingresso: '08:00', uscita: '17:00' },
  { badge: 'UP-002', ingresso: '09:00', uscita: '13:00' },
];

// every: tutte le timbrature sono valide?
const tutteValide = turni.every((t) => validaTimbratura(t).valid);
console.log(tutteValide); // => true

// some: esiste almeno una timbratura sopra le 8 ore?
const c8 = turni.some((t) => minutiDaOrario(t.uscita) - minutiDaOrario(t.ingresso) > 480);
console.log(c8); // => true

// map per raccogliere SOLO gli errori, con indice di riga
const erroriRighe = turni
  .map((t, i) => ({ i, ...validaTimbratura(t) }))
  .filter((r) => !r.valid);
console.log(erroriRighe); // => []  (tutte valide qui)

/* ============================================================
   8) PATTERN "PARSE, DON'T VALIDATE"
   Invece di solo dire si/no, una funzione che trasforma input
   grezzo in un oggetto pulito e tipizzato, o lancia errore.
   ============================================================ */

function parseDipendente(raw) {
  const clean = trimDeep(pick(raw ?? {}, ['nome', 'cognome', 'codiceBadge', 'ruolo']));
  clean.codiceBadge = normalizzaCodice(clean.codiceBadge);
  const { valid, errors } = validate(clean, schemaDipendente);
  if (!valid) {
    const e = new Error('Dipendente non valido');
    e.details = errors;
    throw e;
  }
  return clean; // oggetto garantito conforme
}
try {
  console.log(parseDipendente({ nome: ' Anna ', cognome: 'Bianchi', codiceBadge: 'up-009', ruolo: 'impiegato' }));
  // => { nome:'Anna', cognome:'Bianchi', codiceBadge:'UP009', ruolo:'impiegato' }  (badge normalizzato)
} catch (e) {
  console.log(e.message, e.details);
}

/* ============================================================
   9) VALIDAZIONE ASINCRONA (regole che toccano il DB)
   Es. badge univoco: serve un controllo async. Si combina con
   le guard sincrone con async/await + try/catch.
   ============================================================ */

const badgeEsistenti = new Set(['UP-001', 'UP-002']);
async function badgeDisponibile(badge) {
  // simula una query: await fittizio
  await Promise.resolve();
  return !badgeEsistenti.has(badge);
}

async function validaNuovoBadge(badge) {
  if (!isBadge(badge)) return { ok: false, error: 'formato badge errato' };
  const libero = await badgeDisponibile(badge);
  if (!libero) return { ok: false, error: 'badge gia in uso' };
  return { ok: true, value: badge };
}
validaNuovoBadge('UP-001').then((r) => console.log(r)); // => { ok:false, error:'badge gia in uso' }
validaNuovoBadge('UP-099').then((r) => console.log(r)); // => { ok:true, value:'UP-099' }

/* ============================================================
   10) RISULTATO TIPO "Result" (no exception nel flusso normale)
   Pattern professionale: invece di throw, ritorna un oggetto
   discriminato { ok, value } | { ok:false, error }.
   ============================================================ */

const Ok  = (value) => ({ ok: true, value });
const Err = (error) => ({ ok: false, error });

function validaQuantitaVestiario(q) {
  if (!isNumber(q)) return Err('quantita deve essere number');
  if (!Number.isInteger(q)) return Err('quantita deve essere intero');
  if (q < 0) return Err('quantita non puo essere negativa');
  return Ok(q);
}
console.log(validaQuantitaVestiario(3));    // => { ok:true, value:3 }
console.log(validaQuantitaVestiario(-1));   // => { ok:false, error:'quantita non puo essere negativa' }
console.log(validaQuantitaVestiario(2.5));  // => { ok:false, error:'quantita deve essere intero' }

/* ============================================================
   11) DEFENSIVE DEFAULTS (nullish + spread)
   Riempire i buchi con valori di default in modo sicuro.
   ============================================================ */

const DEFAULT_TURNO = { regola: 'standard', pausa: true, minutiPausa: 60 };
function configuraTurno(impostazioni = {}) {
  const cfg = { ...DEFAULT_TURNO, ...impostazioni };
  // guard di sanita sui valori risultanti
  cfg.minutiPausa = toNumber(cfg.minutiPausa, DEFAULT_TURNO.minutiPausa);
  if (cfg.minutiPausa < 0) cfg.minutiPausa = 0;
  return cfg;
}
console.log(configuraTurno({ pausa: false }));
// => { regola:'standard', pausa:false, minutiPausa:60 }
console.log(configuraTurno({ minutiPausa: '-5' }));
// => { regola:'standard', pausa:true, minutiPausa:0 }

/* ============================================================
   12) ESEMPIO BROWSER: validazione di un form
   // Esempio browser: gira nel browser, non in Node
   ============================================================ */
function setupFormValidation() {
  // Esempio browser: gira nel browser, non in Node
  const form = document.querySelector('#formDipendente');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const { valid, errors } = validate(trimDeep(data), schemaDipendente);
    if (!valid) {
      for (const [campo, msg] of Object.entries(errors)) {
        const el = form.querySelector(`[name="${campo}"]`);
        if (el) el.setCustomValidity(msg); // mostra messaggio nativo
      }
      form.reportValidity();
      return;
    }
    console.log('Form valido, invio...', data);
  });
}
// setupFormValidation(); // da chiamare nel browser

/* ============================================================
   RIEPILOGO COMANDI
   - Guard clause: if (!cond) return / throw  (early return)
   - assert(cond, msg): throw new Error se falso
   - typeof v === 'string' | 'number' | 'boolean' | 'function'
   - Array.isArray(v)                 -> distingue array
   - Number.isNaN / Number.isFinite / Number.isInteger
   - v instanceof Date / Class        -> type guard su oggetti
   - String(v ?? '').trim().toUpperCase().replace(/\s+/g,'').slice(0,n)
   - replaceAll(...) / escapeHtml      -> sanitization anti-XSS
   - regex .test(v) / .match(re)       -> validazione formato
   - includes(v)                       -> enum/union a runtime
   - Object.entries / fromEntries      -> iterare e ricostruire oggetti
   - pick(obj, chiavi)                 -> whitelist (anti mass-assignment)
   - validate(data, schema)            -> schema validation manuale
   - every / some / filter / map       -> validazione di array
   - parse, don't validate             -> ritorna oggetto pulito o throw
   - async/await + try/catch           -> validazione async (DB)
   - Result Ok()/Err()                 -> esito senza exception
   - { ...DEFAULT, ...input } + ??      -> defensive defaults
   ============================================================ */
