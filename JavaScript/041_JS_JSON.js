/* ============================================================
   41 JS JSON
   JSON (JavaScript Object Notation) è il formato testuale standard
   per scambiare dati tra client e server. In JS i due metodi chiave
   sono JSON.stringify (object -> string) e JSON.parse (string -> object).
   In questo file vediamo: serializzazione base, replacer/reviver,
   indentazione (pretty print), uso con localStorage (browser),
   deep clone tramite JSON, gestione errori e casi limite.
   Esempi ispirati a un gestionale ERP (dipendenti, timbrature, turni).
   ============================================================ */

/* ------------------------------------------------------------
   1. JSON.stringify: da object/array a stringa JSON
   ------------------------------------------------------------ */

// Object semplice trasformato in stringa
const dipendente = { id: 1, nome: 'Mario', codiceBadge: 'UP-001' };
console.log(JSON.stringify(dipendente));
// => {"id":1,"nome":"Mario","codiceBadge":"UP-001"}

// Array di valori primitivi
console.log(JSON.stringify([1, 2, 3]));
// => [1,2,3]

// Valori primitivi singoli
console.log(JSON.stringify('ciao')); // => "ciao"
console.log(JSON.stringify(42));      // => 42
console.log(JSON.stringify(true));    // => true
console.log(JSON.stringify(null));    // => null

/* ------------------------------------------------------------
   2. Pretty print: terzo argomento (indentazione)
   ------------------------------------------------------------ */

// Il terzo parametro indenta l'output (numero di spazi o stringa)
const turno = { codice: 'P4', pausa: true, durataMin: 480 };
console.log(JSON.stringify(turno, null, 2));
/* =>
{
  "codice": "P4",
  "pausa": true,
  "durataMin": 480
}
*/

// Si può usare anche una stringa come indentatore
console.log(JSON.stringify({ a: 1 }, null, '--'));
/* =>
{
--"a": 1
}
*/

/* ------------------------------------------------------------
   3. Cosa NON viene serializzato
   ------------------------------------------------------------ */

// undefined, function e Symbol vengono OMESSI negli object
const misto = {
  nome: 'Anna',
  saluta: function () {},   // omessa
  temp: undefined,          // omessa
  sym: Symbol('x'),         // omessa
  attiva: true,
};
console.log(JSON.stringify(misto));
// => {"nome":"Anna","attiva":true}

// In un array, undefined/function/Symbol diventano null
console.log(JSON.stringify([1, undefined, function () {}, 4]));
// => [1,null,null,4]

// Le proprietà Date diventano stringhe ISO (toJSON interno)
console.log(JSON.stringify({ data: new Date('2026-06-30T08:00:00Z') }));
// => {"data":"2026-06-30T08:00:00.000Z"}

/* ------------------------------------------------------------
   4. JSON.parse: da stringa JSON a object/array
   ------------------------------------------------------------ */

const testo = '{"id":7,"nome":"Luca","reparto":"PR"}';
const obj = JSON.parse(testo);
console.log(obj.nome);      // => Luca
console.log(typeof obj);    // => object

// parse di array
const numeri = JSON.parse('[10, 20, 30]');
console.log(numeri[1]);     // => 20

/* ------------------------------------------------------------
   5. Gestione errori con try/catch
   ------------------------------------------------------------ */

// JSON.parse lancia SyntaxError su input non valido
function parseSicuro(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.log('JSON non valido:', err.message);
    return fallback;
  }
}
console.log(parseSicuro('{"ok":true}')); // => { ok: true }
console.log(parseSicuro('{rotto}', {}));  // => {} (dopo log errore)

/* ------------------------------------------------------------
   6. Il parametro REPLACER di stringify
   ------------------------------------------------------------ */

// Replacer come ARRAY: whitelist delle chiavi da includere
const completo = { id: 1, nome: 'Mario', cognome: 'Rossi', password: 'x' };
console.log(JSON.stringify(completo, ['id', 'nome']));
// => {"id":1,"nome":"Mario"}

// Replacer come FUNCTION: trasforma/filtra ogni coppia chiave-valore
// Qui rimuoviamo i campi sensibili (es. esportazione dati dipendente)
const replacer = (key, value) => {
  if (key === 'password') return undefined; // omette la chiave
  return value;
};
console.log(JSON.stringify(completo, replacer));
// => {"id":1,"nome":"Mario","cognome":"Rossi"}

// Replacer per normalizzare: badge sempre upper-case
const conReplacer = JSON.stringify(
  { badge: 'up-007', nome: 'Eva' },
  (k, v) => (k === 'badge' ? String(v).toUpperCase() : v),
);
console.log(conReplacer);
// => {"badge":"UP-007","nome":"Eva"}

/* ------------------------------------------------------------
   7. Il parametro REVIVER di parse
   ------------------------------------------------------------ */

// Il reviver è una callback chiamata per ogni coppia in lettura.
// Tipico: ricostruire le Date da stringhe ISO.
const grezzo = '{"badge":"UP-001","ingresso":"2026-06-30T08:00:00.000Z"}';
const isoRegex = /^\d{4}-\d{2}-\d{2}T/;
const ripristinato = JSON.parse(grezzo, (key, value) => {
  if (typeof value === 'string' && isoRegex.test(value)) {
    return new Date(value);
  }
  return value;
});
console.log(ripristinato.ingresso instanceof Date); // => true
console.log(ripristinato.ingresso.getUTCHours());   // => 8

// Reviver per convertire numeri "stringa" in number
const conNumeri = JSON.parse('{"oreLavorate":"7.5"}', (k, v) =>
  k === 'oreLavorate' ? Number(v) : v,
);
console.log(conNumeri.oreLavorate + 1); // => 8.5

/* ------------------------------------------------------------
   8. Metodo toJSON: serializzazione personalizzata
   ------------------------------------------------------------ */

// Se un object ha un metodo toJSON, stringify usa il suo risultato
const timbratura = {
  badge: 'UP-001',
  oreLavorate: 7.5,
  toJSON() {
    // espone solo una vista "pulita" per l'API
    return { badge: this.badge, ore: this.oreLavorate };
  },
};
console.log(JSON.stringify(timbratura));
// => {"badge":"UP-001","ore":7.5}

/* ------------------------------------------------------------
   9. localStorage (browser): persistere object come JSON
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
// localStorage memorizza SOLO stringhe: serve JSON.stringify/parse.
function salvaImpostazioni(settings) {
  localStorage.setItem('erp.settings', JSON.stringify(settings));
}
function leggiImpostazioni(defaults = {}) {
  const raw = localStorage.getItem('erp.settings');
  return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
}
// salvaImpostazioni({ tema: 'scuro', repartoDefault: 'PR' });
// const s = leggiImpostazioni({ tema: 'chiaro' });
// console.log(s.tema); // => scuro

// Pattern token auth salvato/letto da localStorage (interceptor axios)
function getAuthHeader() {
  // Esempio browser: gira nel browser, non in Node.
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
void getAuthHeader; // evita warning "non usata" in Node

/* ------------------------------------------------------------
   10. Deep clone tramite JSON
   ------------------------------------------------------------ */

// JSON.parse(JSON.stringify(x)) crea una copia PROFONDA (senza riferimenti)
const DEFAULT = { regola: 'arrotonda', turni: ['P4', 'P2'], soglia: { min: 5 } };
const copia = JSON.parse(JSON.stringify(DEFAULT));
copia.soglia.min = 99;
console.log(DEFAULT.soglia.min); // => 5  (l'originale NON cambia)
console.log(copia.soglia.min);   // => 99

// LIMITI del deep clone via JSON: perde Date/function/undefined,
// non gestisce riferimenti ciclici (lancia errore).
const conData = { quando: new Date('2026-06-30') };
const cloneJson = JSON.parse(JSON.stringify(conData));
console.log(typeof cloneJson.quando); // => string (la Date è diventata stringa!)

// Alternativa moderna senza questi limiti (ma senza function): structuredClone
const cloneVero = structuredClone(conData);
console.log(cloneVero.quando instanceof Date); // => true

/* ------------------------------------------------------------
   11. Esempi pratici ERP: round-trip completo
   ------------------------------------------------------------ */

// Trasformiamo risultati "query" in DTO, serializziamo, poi rileggiamo
const articoli = [
  { articolo_poly: 'p4-guanti', descrizione: 'Guanti', taglia: 'L', scortaMinima: 5 },
  { articolo_poly: 'p2-tuta', descrizione: 'Tuta', taglia: 'M', scortaMinima: 2 },
];
const dto = articoli.map((a) => ({ cd: a.articolo_poly, desc: a.descrizione }));
const payload = JSON.stringify(dto);
console.log(payload);
// => [{"cd":"p4-guanti","desc":"Guanti"},{"cd":"p2-tuta","desc":"Tuta"}]
const ricevuto = JSON.parse(payload);
console.log(ricevuto.length); // => 2

// Calcolo dopo round-trip: totale minuti da timbrature serializzate
const grezzoTimbrature = '[{"min":480},{"min":300},{"min":120}]';
const totale = JSON.parse(grezzoTimbrature).reduce((s, t) => s + t.min, 0);
console.log(totale); // => 900

// Serializzazione condizionale: esporta solo dipendenti attivi
const personale = [
  { id: 1, nome: 'Mario', attivo: true },
  { id: 2, nome: 'Anna', attivo: false },
];
const exportAttivi = JSON.stringify(personale.filter((d) => d.attivo), null, 2);
console.log(exportAttivi.includes('Anna')); // => false

/* ------------------------------------------------------------
   12. Casi limite e curiosità
   ------------------------------------------------------------ */

// NaN e Infinity diventano null
console.log(JSON.stringify({ x: NaN, y: Infinity })); // => {"x":null,"y":null}

// BigInt NON è serializzabile: lancia TypeError
try {
  JSON.stringify({ big: 10n });
} catch (e) {
  console.log(e.name); // => TypeError
}

// Le chiavi numeriche degli array restano indici; degli object diventano stringhe
console.log(JSON.stringify({ 1: 'a', 2: 'b' })); // => {"1":"a","2":"b"}

// Confronto strutturale "povero" tramite stringify (attenzione all'ordine chiavi!)
const ugualeStruttura = (a, b) => JSON.stringify(a) === JSON.stringify(b);
console.log(ugualeStruttura({ a: 1, b: 2 }, { a: 1, b: 2 })); // => true
console.log(ugualeStruttura({ a: 1, b: 2 }, { b: 2, a: 1 })); // => false (ordine!)

/* ============================================================
   RIEPILOGO COMANDI
   - JSON.stringify(value)              -> object/array a stringa
   - JSON.stringify(value, null, 2)     -> pretty print (indentazione)
   - JSON.stringify(value, [chiavi])    -> replacer come whitelist
   - JSON.stringify(value, fn)          -> replacer come function
   - JSON.parse(string)                 -> stringa a object/array
   - JSON.parse(string, reviver)        -> reviver per trasformare valori
   - toJSON() {}                        -> serializzazione custom su object
   - obj.toISOString()                  -> Date in stringa ISO (via toJSON)
   - localStorage.setItem/getItem       -> persistenza stringhe (browser)
   - JSON.parse(JSON.stringify(x))      -> deep clone (con limiti)
   - structuredClone(x)                 -> deep clone moderno (Date/Map/Set)
   - try/catch                          -> gestione SyntaxError di parse
   Note: undefined/function/Symbol omessi; NaN/Infinity -> null;
   BigInt non serializzabile; cicli -> errore.
   ============================================================ */
