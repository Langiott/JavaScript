/* ============================================================
   60 JS Maps
   La Map è una collezione di coppie chiave/valore in cui le chiavi
   possono essere di QUALSIASI tipo (non solo stringhe come negli object).
   Mantiene l'ordine di inserimento, espone la dimensione tramite .size
   ed è iterabile. È la struttura ideale quando le chiavi non sono
   stringhe statiche o quando servono inserimenti/letture frequenti.
   In questo file: set/get/has/delete, iterazione, Map vs object,
   chiavi non-stringa e gestione della size.
   ============================================================ */

/* ------------------------------------------------------------
   1. CREARE UNA MAP
   ------------------------------------------------------------ */

// Map vuota
const m1 = new Map();
console.log(m1.size); // => 0

// Map inizializzata con un array di coppie [chiave, valore]
const reparti = new Map([
  ['UP', 'Ufficio Produzione'],
  ['MG', 'Magazzino'],
  ['AM', 'Amministrazione'],
]);
console.log(reparti.size); // => 3

/* ------------------------------------------------------------
   2. set / get / has / delete
   ------------------------------------------------------------ */

const badge = new Map();

// set(chiave, valore): aggiunge o aggiorna; ritorna la Map (chainable)
badge.set('UP-001', 'Mario Rossi');
badge.set('UP-002', 'Luigi Bianchi');
console.log(badge.get('UP-001')); // => Mario Rossi

// set è chainable perché ritorna la Map stessa
badge.set('MG-001', 'Anna Verdi').set('MG-002', 'Sara Neri');
console.log(badge.size); // => 4

// get di una chiave inesistente => undefined
console.log(badge.get('XX-999')); // => undefined

// has(chiave): true/false se la chiave esiste
console.log(badge.has('UP-002')); // => true
console.log(badge.has('UP-099')); // => false

// delete(chiave): rimuove la coppia, ritorna true se esisteva
console.log(badge.delete('MG-002')); // => true
console.log(badge.delete('MG-002')); // => false (già rimossa)
console.log(badge.size); // => 3

// set su chiave esistente => aggiorna il valore (non duplica)
badge.set('UP-001', 'Mario Rossi (turno notte)');
console.log(badge.get('UP-001')); // => Mario Rossi (turno notte)
console.log(badge.size); // => 3 (nessun duplicato)

// clear(): svuota completamente la Map
const tmp = new Map([['a', 1], ['b', 2]]);
tmp.clear();
console.log(tmp.size); // => 0

/* ------------------------------------------------------------
   3. CHIAVI NON-STRINGA (il vantaggio principale sugli object)
   ------------------------------------------------------------ */

// Le chiavi possono essere number, boolean, object, function, ecc.
const misto = new Map();
misto.set(1, 'numero uno');
misto.set('1', 'stringa uno'); // chiave DIVERSA da 1
misto.set(true, 'booleano vero');
console.log(misto.get(1));   // => numero uno
console.log(misto.get('1')); // => stringa uno
console.log(misto.size);     // => 3

// Oggetti come chiavi: l'identità è per riferimento, non per contenuto
const dip1 = { id: 1, nome: 'Mario' };
const dip2 = { id: 2, nome: 'Luigi' };
const oreLavorate = new Map();
oreLavorate.set(dip1, 480);
oreLavorate.set(dip2, 420);
console.log(oreLavorate.get(dip1)); // => 480

// Attenzione: un oggetto con lo stesso contenuto ma riferimento diverso
// NON è la stessa chiave
console.log(oreLavorate.get({ id: 1, nome: 'Mario' })); // => undefined

// NaN come chiave funziona (a differenza dell'uguaglianza ===)
const conNaN = new Map();
conNaN.set(NaN, 'non un numero');
console.log(conNaN.get(NaN)); // => non un numero

/* ------------------------------------------------------------
   4. ITERAZIONE
   ------------------------------------------------------------ */

const turni = new Map([
  ['P4', 'Turno con pausa pranzo'],
  ['P2', 'Turno senza pausa'],
  ['NT', 'Turno notturno'],
]);

// for...of su entries (default): ottieni [chiave, valore]
for (const [codice, descrizione] of turni) {
  console.log(`${codice} -> ${descrizione}`);
}
// => P4 -> Turno con pausa pranzo
// => P2 -> Turno senza pausa
// => NT -> Turno notturno

// keys(): iteratore delle sole chiavi
for (const k of turni.keys()) {
  console.log(k); // => P4, P2, NT
}

// values(): iteratore dei soli valori
for (const v of turni.values()) {
  console.log(v); // => le tre descrizioni
}

// entries(): equivalente al for...of diretto
for (const entry of turni.entries()) {
  console.log(entry); // => ['P4', 'Turno con pausa pranzo'], ...
}

// forEach(callback): nota l'ordine dei parametri (valore, chiave, map)
turni.forEach((valore, chiave) => {
  console.log(`${chiave}: ${valore}`);
});

// L'ordine di iterazione è SEMPRE quello di inserimento
const ord = new Map();
ord.set('z', 1).set('a', 2).set('m', 3);
console.log([...ord.keys()]); // => ['z', 'a', 'm']

/* ------------------------------------------------------------
   5. CONVERSIONI Map <-> array <-> object
   ------------------------------------------------------------ */

// Map -> array di coppie con lo spread operator
const arrCoppie = [...turni];
console.log(arrCoppie[0]); // => ['P4', 'Turno con pausa pranzo']

// Map -> array di chiavi / valori
console.log([...turni.keys()]);   // => ['P4', 'P2', 'NT']
console.log([...turni.values()]); // => [3 descrizioni]

// Array.from accetta anche un mapper come secondo argomento
const codici = Array.from(turni, ([codice]) => codice);
console.log(codici); // => ['P4', 'P2', 'NT']

// object -> Map con Object.entries
const config = { porta: 9000, host: 'localhost', debug: true };
const mConfig = new Map(Object.entries(config));
console.log(mConfig.get('porta')); // => 9000

// Map -> object con Object.fromEntries (solo se le chiavi sono valide)
const backToObj = Object.fromEntries(mConfig);
console.log(backToObj.host); // => localhost

/* ------------------------------------------------------------
   6. MAP vs OBJECT — quando usare cosa
   ------------------------------------------------------------ */

/*
   OBJECT:
   - chiavi solo string o symbol
   - ottimo per dati strutturati "a record" noti a priori
   - ha un prototype (rischio collisioni: 'toString', '__proto__'...)
   - dimensione: Object.keys(obj).length

   MAP:
   - chiavi di qualsiasi tipo (number, object, function...)
   - mantiene l'ordine di inserimento garantito
   - .size diretto, niente prototype "sporco"
   - performance migliore con aggiunte/rimozioni frequenti
   - iterabile nativamente
*/

// Problema classico dell'object: chiavi che collidono col prototype
const objPericoloso = {};
console.log(objPericoloso['toString']); // => [Function: toString] (ereditato!)

const mapSicura = new Map();
console.log(mapSicura.get('toString')); // => undefined (pulita)

// size diretto contro il conteggio manuale dell'object
const obj = { a: 1, b: 2, c: 3 };
console.log(Object.keys(obj).length); // => 3 (object)
const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
console.log(map.size);                // => 3 (map, immediato)

/* ------------------------------------------------------------
   7. PATTERN PRATICI ISPIRATI AL GESTIONALE ERP
   ------------------------------------------------------------ */

// 7a. Indicizzare i dipendenti per codiceBadge per lookup O(1)
const dipendenti = [
  { codiceBadge: 'UP-001', nome: 'Mario', cognome: 'Rossi', reparto: 'UP' },
  { codiceBadge: 'UP-002', nome: 'Luigi', cognome: 'Bianchi', reparto: 'UP' },
  { codiceBadge: 'MG-001', nome: 'Anna', cognome: 'Verdi', reparto: 'MG' },
];

const perBadge = new Map(dipendenti.map((d) => [d.codiceBadge, d]));
console.log(perBadge.get('UP-002').cognome); // => Bianchi
console.log(perBadge.has('MG-001'));         // => true

// 7b. Raggruppare i dipendenti per reparto (Map<string, array>)
function raggruppaPerReparto(lista) {
  const gruppi = new Map();
  for (const d of lista) {
    if (!gruppi.has(d.reparto)) gruppi.set(d.reparto, []);
    gruppi.get(d.reparto).push(`${d.nome} ${d.cognome}`);
  }
  return gruppi;
}
const perReparto = raggruppaPerReparto(dipendenti);
console.log(perReparto.get('UP')); // => ['Mario Rossi', 'Luigi Bianchi']
console.log(perReparto.size);      // => 2

// 7c. Contatore di timbrature per giorno (Map come istogramma)
const timbrature = ['2026-06-30', '2026-06-30', '2026-06-29', '2026-06-30'];
const conteggio = new Map();
for (const giorno of timbrature) {
  conteggio.set(giorno, (conteggio.get(giorno) ?? 0) + 1);
}
console.log(conteggio.get('2026-06-30')); // => 3
console.log(conteggio.get('2026-06-29')); // => 1

// 7d. Cache di scorte vestiario/DPI con chiave composta taglia
const scorte = new Map([
  ['guanti-M', { quantita: 40, scortaMinima: 20 }],
  ['guanti-L', { quantita: 12, scortaMinima: 20 }],
]);
function sottoScorta(map) {
  return [...map]
    .filter(([, v]) => v.quantita < v.scortaMinima)
    .map(([k]) => k);
}
console.log(sottoScorta(scorte)); // => ['guanti-L']

// 7e. Sommare i minuti lavorati per dipendente (reduce su Map)
const minutiPerDip = new Map([
  ['UP-001', [480, 420, 460]],
  ['UP-002', [500, 480]],
]);
const totali = new Map(
  [...minutiPerDip].map(([badge, m]) => [badge, m.reduce((s, x) => s + x, 0)])
);
console.log(totali.get('UP-001')); // => 1360
console.log(totali.get('UP-002')); // => 980

/* ------------------------------------------------------------
   8. NOTE AVANZATE
   ------------------------------------------------------------ */

// La Map NON è serializzabile direttamente in JSON (diventa {})
console.log(JSON.stringify(new Map([['a', 1]]))); // => {}
// Per serializzare conviene passare per Object.fromEntries (chiavi stringa)
console.log(JSON.stringify(Object.fromEntries(map))); // => {"a":1,"b":2,"c":3}

// Spread di Map dentro un'altra Map (merge: le ultime chiavi vincono)
const base = new Map([['a', 1], ['b', 2]]);
const override = new Map([['b', 99], ['c', 3]]);
const merge = new Map([...base, ...override]);
console.log(merge.get('b')); // => 99
console.log(merge.size);     // => 3

// Map e WeakMap: WeakMap accetta solo chiavi-oggetto e non è iterabile,
// ma permette la garbage collection delle chiavi non più referenziate.
const wm = new WeakMap();
const chiaveObj = { id: 1 };
wm.set(chiaveObj, 'dato privato');
console.log(wm.get(chiaveObj)); // => dato privato
console.log(wm.has(chiaveObj)); // => true

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   new Map()                       crea una Map vuota
   new Map([[k, v], ...])          crea una Map da array di coppie
   map.set(k, v)                   aggiunge/aggiorna (chainable)
   map.get(k)                      legge il valore (undefined se assente)
   map.has(k)                      true/false se la chiave esiste
   map.delete(k)                   rimuove la coppia (true se esisteva)
   map.clear()                     svuota la Map
   map.size                        numero di coppie (proprieta)
   map.keys()                      iteratore delle chiavi
   map.values()                    iteratore dei valori
   map.entries()                   iteratore delle coppie [k, v]
   map.forEach((v, k, map) => ...) itera con callback
   for (const [k, v] of map)       iterazione diretta
   [...map]                        Map -> array di coppie
   Array.from(map, fn)             Map -> array con mapper
   new Map(Object.entries(obj))    object -> Map
   Object.fromEntries(map)         Map -> object
   new WeakMap()                   Map con chiavi-oggetto, GC-friendly
   ============================================================ */
