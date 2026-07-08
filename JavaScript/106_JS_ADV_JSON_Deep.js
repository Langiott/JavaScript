/* ============================================================
   106 JS ADV JSON Deep
   JSON avanzato in JavaScript: tecniche professionali per copiare,
   serializzare e leggere dati in modo sicuro. Vedremo il deep clone
   (copia profonda), i parametri replacer e reviver di JSON.stringify
   e JSON.parse, il parsing difensivo con try/catch e la moderna
   structuredClone(). Esempi ispirati a un gestionale ERP (dipendenti,
   timbrature, turni, badge tipo 'UP-001').
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) RIPASSO BASE: stringify / parse
   ------------------------------------------------------------ */

// JSON.stringify converte un value JS in una stringa JSON
const dip = { id: 1, nome: 'Mario', codiceBadge: 'UP-001' };
console.log(JSON.stringify(dip)); // => {"id":1,"nome":"Mario","codiceBadge":"UP-001"}

// JSON.parse fa il contrario: stringa JSON -> value JS
const back = JSON.parse('{"id":1,"nome":"Mario"}');
console.log(back.nome); // => Mario

// Terzo argomento di stringify = indentazione (pretty print)
console.log(JSON.stringify(dip, null, 2));
// => stampa il JSON indentato di 2 spazi

/* ------------------------------------------------------------
   2) IL PROBLEMA: copia per riferimento (shallow vs deep)
   ------------------------------------------------------------ */

// L'assegnazione di un object copia il RIFERIMENTO, non i dati
const a = { reparto: { sigla: 'UP' } };
const b = a;
b.reparto.sigla = 'XX';
console.log(a.reparto.sigla); // => XX  (a e b puntano allo stesso object!)

// Lo spread {...} fa una SHALLOW copy: il primo livello è copiato,
// ma gli object annidati restano condivisi
const orig = { id: 1, turno: { nome: 'P4', pausa: true } };
const shallow = { ...orig };
shallow.turno.pausa = false;
console.log(orig.turno.pausa); // => false  (annidato condiviso: bug classico)

/* ------------------------------------------------------------
   3) DEEP CLONE con JSON (la tecnica "storica")
   ------------------------------------------------------------ */

// Serializzo e ri-parso: ottengo una copia totalmente indipendente
const deepJson = (obj) => JSON.parse(JSON.stringify(obj));

const dipendente = {
  id: 1,
  nome: 'Mario',
  reparto: { sigla: 'UP', piano: 2 },
  turni: ['P4', 'P2'],
};
const copia = deepJson(dipendente);
copia.reparto.sigla = 'XX';
console.log(dipendente.reparto.sigla); // => UP  (originale intatto)

// LIMITI del deep clone via JSON:
// - perde Date (diventa stringa), undefined, function, Symbol
// - non gestisce riferimenti circolari (lancia errore)
const conData = { ts: new Date('2026-06-30T08:00:00Z'), nota: undefined, fn: () => 1 };
console.log(deepJson(conData)); // => { ts: '2026-06-30T08:00:00.000Z' }
// la Date è diventata string, nota e fn sono spariti

/* ------------------------------------------------------------
   4) structuredClone(): il deep clone MODERNO (ES2021+ / Node 17+)
   ------------------------------------------------------------ */

// structuredClone copia in profondità e MANTIENE i tipi (Date, Map, Set...)
const sorgente = {
  id: 7,
  ts: new Date('2026-06-30T08:00:00Z'),
  tags: new Set(['DPI', 'urgente']),
  meta: new Map([['scortaMinima', 5]]),
  turno: { nome: 'P4', pausa: true },
};
const clone = structuredClone(sorgente);
clone.turno.pausa = false;
console.log(sorgente.turno.pausa);          // => true  (indipendente)
console.log(clone.ts instanceof Date);       // => true  (Date preservata!)
console.log(clone.tags.has('DPI'));          // => true  (Set preservato)
console.log(clone.meta.get('scortaMinima')); // => 5     (Map preservata)

// structuredClone gestisce ANCHE i riferimenti circolari
const nodo = { sigla: 'UP' };
nodo.self = nodo; // ciclo
const cloneCiclo = structuredClone(nodo);
console.log(cloneCiclo.self === cloneCiclo); // => true (ciclo ricostruito, niente crash)

// COSA NON copia: function e Symbol -> lancia DataCloneError
try {
  structuredClone({ fn: () => 1 });
} catch (e) {
  console.log(e.constructor.name); // => DataCloneError
}

/* ------------------------------------------------------------
   5) REPLACER di JSON.stringify (secondo argomento)
   ------------------------------------------------------------ */

// 5a) Replacer come ARRAY di chiavi = whitelist dei campi da serializzare
const full = { id: 1, nome: 'Mario', password: 'segreta', codiceBadge: 'UP-001' };
console.log(JSON.stringify(full, ['id', 'nome', 'codiceBadge']));
// => {"id":1,"nome":"Mario","codiceBadge":"UP-001"}  (password esclusa)

// 5b) Replacer come FUNCTION (key, value) -> trasforma/filtra ogni nodo
// Esempio ERP: rimuovere campi sensibili e arrotondare le ore lavorate
const timbratura = { id: 9, password: 'x', oreLavorate: 7.836, badge: 'UP-001' };
const replacer = (key, value) => {
  if (key === 'password') return undefined;       // undefined => campo omesso
  if (key === 'oreLavorate') return Number(value.toFixed(2));
  return value;
};
console.log(JSON.stringify(timbratura, replacer));
// => {"id":9,"oreLavorate":7.84,"badge":"UP-001"}

// 5c) Il replacer è chiamato anche con key '' per il root.
//     this dentro il replacer è l'object che contiene la chiave corrente.

// 5d) toJSON(): un object può definire come serializzarsi
const turnoP4 = {
  nome: 'P4',
  inizio: '08:00',
  fine: '17:00',
  toJSON() {
    return `${this.nome} (${this.inizio}-${this.fine})`;
  },
};
console.log(JSON.stringify({ turno: turnoP4 }));
// => {"turno":"P4 (08:00-17:00)"}

/* ------------------------------------------------------------
   6) REVIVER di JSON.parse (secondo argomento)
   ------------------------------------------------------------ */

// Il reviver (key, value) trasforma ogni value durante il parsing.
// Caso tipico ERP: ripristinare le Date salvate come ISO string.
const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const reviver = (key, value) => {
  if (typeof value === 'string' && isoDate.test(value)) return new Date(value);
  return value;
};
const grezzo = '{"id":1,"ingresso":"2026-06-30T08:00:00.000Z"}';
const rec = JSON.parse(grezzo, reviver);
console.log(rec.ingresso instanceof Date); // => true
console.log(rec.ingresso.getUTCHours());   // => 8

// Reviver per normalizzare i codici badge in lettura
const normBadge = (key, value) =>
  key === 'codiceBadge' && typeof value === 'string'
    ? value.trim().toUpperCase()
    : value;
console.log(JSON.parse('{"codiceBadge":" up-001 "}', normBadge));
// => { codiceBadge: 'UP-001' }

// Se il reviver ritorna undefined, la chiave viene RIMOSSA dal risultato
const dropNull = (key, value) => (value === null ? undefined : value);
console.log(JSON.parse('{"a":1,"b":null}', dropNull)); // => { a: 1 }

/* ------------------------------------------------------------
   7) PARSING SICURO con try/catch
   ------------------------------------------------------------ */

// JSON.parse LANCIA SyntaxError su input non valido: va sempre protetto
function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn('JSON non valido:', err.message);
    return fallback;
  }
}
console.log(safeParse('{"ok":true}'));   // => { ok: true }
console.log(safeParse('{rotto}', []));   // => []  (fallback, niente crash)

// Pattern professionale: risultato discriminato { ok, value | error }
function tryParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
const r1 = tryParse('[1,2,3]');
console.log(r1.ok ? r1.value : r1.error); // => [ 1, 2, 3 ]

// Esempio ERP: leggere impostazioni utente da localStorage in sicurezza
// (in Node simuliamo localStorage con una stringa)
const DEFAULT_IMPOST = { regolaArrotondamento: 5, tema: 'chiaro' };
function leggiImpostazioni(raw) {
  const parsed = safeParse(raw, {});
  // merge con i default: i valori salvati sovrascrivono i default
  return { ...DEFAULT_IMPOST, ...parsed };
}
console.log(leggiImpostazioni('{"tema":"scuro"}'));
// => { regolaArrotondamento: 5, tema: 'scuro' }
console.log(leggiImpostazioni('XXX corrotto'));
// => { regolaArrotondamento: 5, tema: 'chiaro' }

/* ------------------------------------------------------------
   8) CASI D'USO PROFESSIONALI COMBINATI
   ------------------------------------------------------------ */

// 8a) Snapshot per "annulla modifiche" in un form (deep clone)
const formTurno = { nome: 'P4', pausa: true, oreTeoriche: 8 };
const snapshot = structuredClone(formTurno);
formTurno.pausa = false; // utente modifica
// ripristino:
const ripristinato = structuredClone(snapshot);
console.log(ripristinato.pausa); // => true

// 8b) Serializzare DTO verso un'API escludendo campi interni
const dipendenteDB = {
  id: 1, nome: 'Mario', cognome: 'Rossi',
  _hash: 'abc', __v: 3, oreLavorate: 7.83333,
};
function toDTO(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (key.startsWith('_')) return undefined;            // togli campi interni
    if (key === 'oreLavorate') return Number(value.toFixed(2));
    return value;
  }));
}
console.log(toDTO(dipendenteDB));
// => { id: 1, nome: 'Mario', cognome: 'Rossi', oreLavorate: 7.83 }

// 8c) Deep merge ricorsivo (lo spread NON fa merge profondo)
function deepMerge(target, source) {
  const out = structuredClone(target);
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object') {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
const base = { ui: { tema: 'chiaro', densita: 'comoda' }, lingua: 'it' };
const patch = { ui: { tema: 'scuro' } };
console.log(deepMerge(base, patch));
// => { ui: { tema: 'scuro', densita: 'comoda' }, lingua: 'it' }

// 8d) Confronto profondo "rapido" di due value serializzabili
const equalJSON = (x, y) => JSON.stringify(x) === JSON.stringify(y);
console.log(equalJSON({ a: 1, b: 2 }, { a: 1, b: 2 })); // => true
// ATTENZIONE: dipende dall'ordine delle chiavi! { b, a } darebbe false.

// 8e) Round-trip Date sicuro: stringify (toJSON automatico) + reviver
const conTimbri = { badge: 'UP-001', ingresso: new Date('2026-06-30T08:00:00Z') };
const wire = JSON.stringify(conTimbri);          // Date -> ISO string
const restored = JSON.parse(wire, reviver);      // ISO string -> Date
console.log(restored.ingresso instanceof Date);  // => true

/* ------------------------------------------------------------
   9) ERRORI COMUNI DA RICORDARE
   ------------------------------------------------------------ */

// 9a) Riferimenti circolari rompono JSON.stringify
const ciclico = { nome: 'reparto' };
ciclico.parent = ciclico;
try { JSON.stringify(ciclico); }
catch (e) { console.log(e.constructor.name); } // => TypeError (circular)

// 9b) I BigInt non sono serializzabili da JSON.stringify
try { JSON.stringify({ n: 10n }); }
catch (e) { console.log(e.constructor.name); } // => TypeError

// 9c) NaN e Infinity diventano null
console.log(JSON.stringify({ x: NaN, y: Infinity })); // => {"x":null,"y":null}

/* ============================================================
   RIEPILOGO COMANDI (scheda memoria rapida)
   ------------------------------------------------------------
   JSON.stringify(value)                 -> serializza in stringa JSON
   JSON.stringify(value, null, 2)        -> pretty print indentato
   JSON.stringify(value, [ 'k1','k2' ])  -> replacer array = whitelist chiavi
   JSON.stringify(value, fn)             -> replacer function (key,value)
   obj.toJSON()                          -> serializzazione custom dell'object
   JSON.parse(text)                      -> parse stringa -> value JS
   JSON.parse(text, fn)                  -> reviver function (key,value)
   JSON.parse(JSON.stringify(o))         -> deep clone "storico" (con limiti)
   structuredClone(o)                    -> deep clone moderno (Date/Map/Set/cicli)
   try { JSON.parse } catch              -> parsing sicuro / fallback
   { ...obj }                            -> shallow copy (solo 1° livello)
   undefined nel replacer/reviver        -> omette / rimuove la chiave
   Note: cicli e BigInt rompono stringify; NaN/Infinity -> null
   ============================================================ */
