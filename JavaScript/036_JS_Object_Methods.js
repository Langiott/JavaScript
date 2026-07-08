/* ============================================================
   36 JS Object Methods
   I metodi statici di Object permettono di ispezionare, copiare,
   trasformare e proteggere gli oggetti. In questo file vediamo
   Object.keys, Object.values, Object.entries, Object.assign,
   Object.freeze, Object.fromEntries e il metodo hasOwnProperty.
   Sono strumenti fondamentali per iterare sulle proprieta',
   creare DTO, fare merge di configurazioni e rendere immutabili
   le strutture dati. Tutto eseguibile con Node.js.
   ============================================================ */

'use strict';

// ------------------------------------------------------------
// 1. Object.keys() - array delle chiavi (proprie ed enumerable)
// ------------------------------------------------------------

// Restituisce un array con i nomi delle proprieta'
const dipendente = { nome: 'Mario', cognome: 'Rossi', badge: 'UP-001' };
console.log(Object.keys(dipendente)); // => [ 'nome', 'cognome', 'badge' ]

// Utile per contare quante proprieta' ha un oggetto
console.log(Object.keys(dipendente).length); // => 3

// Iterare con forEach sulle chiavi
Object.keys(dipendente).forEach((k) => {
  console.log(`${k} = ${dipendente[k]}`);
});
// => nome = Mario
// => cognome = Rossi
// => badge = UP-001

// Su un array, le chiavi sono gli indici come stringhe
console.log(Object.keys(['a', 'b'])); // => [ '0', '1' ]

// ------------------------------------------------------------
// 2. Object.values() - array dei valori
// ------------------------------------------------------------

// Restituisce solo i valori, nell'ordine di inserimento
console.log(Object.values(dipendente)); // => [ 'Mario', 'Rossi', 'UP-001' ]

// Esempio: sommare i minuti lavorati per reparto
const minutiPerReparto = { UP: 480, MO: 510, LV: 465 };
const totaleMinuti = Object.values(minutiPerReparto).reduce((s, m) => s + m, 0);
console.log(totaleMinuti); // => 1455

// Trovare il valore massimo
console.log(Math.max(...Object.values(minutiPerReparto))); // => 510

// ------------------------------------------------------------
// 3. Object.entries() - array di coppie [chiave, valore]
// ------------------------------------------------------------

// Ogni elemento e' un array [key, value]
console.log(Object.entries(dipendente));
// => [ [ 'nome', 'Mario' ], [ 'cognome', 'Rossi' ], [ 'badge', 'UP-001' ] ]

// Destructuring nel ciclo for...of
for (const [chiave, valore] of Object.entries(dipendente)) {
  console.log(`${chiave}: ${valore}`);
}
// => nome: Mario
// => cognome: Rossi
// => badge: UP-001

// map su entries per trasformare in stringhe
const righe = Object.entries(minutiPerReparto).map(
  ([sigla, min]) => `${sigla} -> ${(min / 60).toFixed(1)}h`
);
console.log(righe); // => [ 'UP -> 8.0', 'MO -> 8.5', 'LV -> 7.8' ]

// filter su entries: tieni solo reparti sopra le 8h (480 min)
const sopraOtto = Object.entries(minutiPerReparto)
  .filter(([, min]) => min > 480)
  .map(([sigla]) => sigla);
console.log(sopraOtto); // => [ 'MO' ]

// ------------------------------------------------------------
// 4. Object.fromEntries() - inverso di entries
// ------------------------------------------------------------

// Da array di coppie a oggetto
const coppie = [['nome', 'Anna'], ['ruolo', 'operaia']];
console.log(Object.fromEntries(coppie)); // => { nome: 'Anna', ruolo: 'operaia' }

// Da Map a oggetto
const mappa = new Map([['UP', 1], ['MO', 2]]);
console.log(Object.fromEntries(mappa)); // => { UP: 1, MO: 2 }

// Pattern entries -> map -> fromEntries: trasformare i valori
const minutiInOre = Object.fromEntries(
  Object.entries(minutiPerReparto).map(([k, v]) => [k, v / 60])
);
console.log(minutiInOre); // => { UP: 8, MO: 8.5, LV: 7.75 }

// Filtrare un oggetto mantenendo solo alcune chiavi
const filtraOggetto = (obj, chiavi) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => chiavi.includes(k)));
console.log(filtraOggetto(dipendente, ['nome', 'badge']));
// => { nome: 'Mario', badge: 'UP-001' }

// Parsing di una query string in oggetto (esempio browser/Node)
const params = new URLSearchParams('reparto=UP&attivo=true');
console.log(Object.fromEntries(params)); // => { reparto: 'UP', attivo: 'true' }

// ------------------------------------------------------------
// 5. Object.assign() - copia/merge di proprieta'
// ------------------------------------------------------------

// Copia le proprieta' delle sorgenti nel target (lo modifica e lo ritorna)
const target = { a: 1 };
const risultato = Object.assign(target, { b: 2 }, { c: 3 });
console.log(risultato); // => { a: 1, b: 2, c: 3 }
console.log(target === risultato); // => true (target modificato)

// Clone superficiale (shallow copy) con target vuoto
const originale = { nome: 'Luca', badge: 'UP-007' };
const clone = Object.assign({}, originale);
clone.nome = 'Modificato';
console.log(originale.nome); // => Luca (originale intatto)

// ATTENZIONE: e' shallow, gli oggetti annidati sono condivisi per reference
const conNested = { dati: { ore: 8 } };
const cloneShallow = Object.assign({}, conNested);
cloneShallow.dati.ore = 99;
console.log(conNested.dati.ore); // => 99 (condiviso!)

// Merge di configurazione: DEFAULT sovrascritti dalle impostazioni utente
const DEFAULT = { regola: 'standard', arrotondamento: 5, pausa: true };
const impostazioni = { arrotondamento: 15 };
const config = Object.assign({}, DEFAULT, impostazioni);
console.log(config); // => { regola: 'standard', arrotondamento: 15, pausa: true }

// In sintassi moderna lo stesso merge si fa con lo spread operator
const config2 = { ...DEFAULT, ...impostazioni };
console.log(config2.arrotondamento); // => 15

// ------------------------------------------------------------
// 6. Object.freeze() - rendere immutabile un oggetto
// ------------------------------------------------------------

// Dopo freeze non si possono aggiungere, rimuovere o modificare proprieta'
const turnoP4 = Object.freeze({ codice: 'P4', pausa: true, durata: 480 });
turnoP4.durata = 999; // ignorato in modalita' non-strict; errore in strict
console.log(turnoP4.durata); // => 480

// Verificare se un oggetto e' congelato
console.log(Object.isFrozen(turnoP4)); // => true

// freeze e' SHALLOW: gli oggetti annidati restano modificabili
const configBloccata = Object.freeze({ soglie: { max: 10 } });
configBloccata.soglie.max = 50;
console.log(configBloccata.soglie.max); // => 50 (nested non congelato)

// deepFreeze ricorsivo per congelare anche i livelli interni
function deepFreeze(obj) {
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object' && obj[k] !== null) deepFreeze(obj[k]);
  });
  return Object.freeze(obj);
}
const profondo = deepFreeze({ soglie: { max: 10 } });
profondo.soglie.max = 50;
console.log(profondo.soglie.max); // => 10 (ora bloccato davvero)

// Esiste anche Object.seal: vieta aggiunta/rimozione ma permette modifica
const sigillato = Object.seal({ stato: 'aperto' });
sigillato.stato = 'chiuso'; // permesso
sigillato.nuovo = 1; // ignorato
console.log(sigillato); // => { stato: 'chiuso' }

// ------------------------------------------------------------
// 7. hasOwnProperty() - la proprieta' e' propria (non ereditata)?
// ------------------------------------------------------------

// Distingue le proprieta' proprie da quelle del prototype
const badge = { codice: 'UP-001' };
console.log(badge.hasOwnProperty('codice')); // => true
console.log(badge.hasOwnProperty('toString')); // => false (ereditata)

// 'in' invece controlla anche la catena del prototype
console.log('toString' in badge); // => true

// Object.hasOwn() (ES2022) e' la forma moderna e piu' sicura
console.log(Object.hasOwn(badge, 'codice')); // => true

// Perche' usare Object.hasOwn invece del metodo diretto:
// un oggetto creato con Object.create(null) non ha hasOwnProperty
const senzaProto = Object.create(null);
senzaProto.x = 1;
// senzaProto.hasOwnProperty('x') -> TypeError
console.log(Object.hasOwn(senzaProto, 'x')); // => true

// ------------------------------------------------------------
// 8. Metodi correlati utili
// ------------------------------------------------------------

// Object.getOwnPropertyNames: anche le non-enumerable
const o = {};
Object.defineProperty(o, 'nascosta', { value: 42, enumerable: false });
console.log(Object.keys(o)); // => []
console.log(Object.getOwnPropertyNames(o)); // => [ 'nascosta' ]

// Object.create: crea con un prototype specifico
const proto = { saluta() { return 'ciao'; } };
const figlio = Object.create(proto);
console.log(figlio.saluta()); // => ciao

// ------------------------------------------------------------
// 9. Esempi pratici stile ERP (gestionale aziendale)
// ------------------------------------------------------------

// Trasformare il risultato di una query in DTO leggero
const rows = [
  { id: 1, nome: 'Mario', cognome: 'Rossi', _interno: true },
  { id: 2, nome: 'Anna', cognome: 'Bianchi', _interno: false },
];
const dto = rows.map(({ id, nome, cognome }) => ({ id, label: `${nome} ${cognome}` }));
console.log(dto);
// => [ { id: 1, label: 'Mario Rossi' }, { id: 2, label: 'Anna Bianchi' } ]

// Indicizzare una lista per badge usando fromEntries (lookup O(1))
const dipendenti = [
  { badge: 'UP-001', nome: 'Mario' },
  { badge: 'UP-007', nome: 'Luca' },
];
const perBadge = Object.fromEntries(dipendenti.map((d) => [d.badge, d]));
console.log(perBadge['UP-007'].nome); // => Luca

// Catalogo vestiario/DPI immutabile (taglie fisse, non vanno alterate)
const TAGLIE = Object.freeze({ S: 1, M: 2, L: 3, XL: 4 });
console.log(Object.entries(TAGLIE)); // => [ [ 'S', 1 ], [ 'M', 2 ], [ 'L', 3 ], [ 'XL', 4 ] ]

// Sommare le ore lavorate per dipendente da un registro timbrature
const timbrature = {
  'UP-001': [480, 510, 465],
  'UP-007': [480, 480, 0],
};
const totali = Object.fromEntries(
  Object.entries(timbrature).map(([b, gg]) => [b, gg.reduce((s, m) => s + m, 0)])
);
console.log(totali); // => { 'UP-001': 1455, 'UP-007': 960 }

// Validare che ogni reparto abbia una sigla di 2 lettere
const reparti = { UP: 'Ufficio', MO: 'Montaggio', X: 'Errato' };
const tutteValide = Object.keys(reparti).every((s) => /^[A-Z]{2}$/.test(s));
console.log(tutteValide); // => false (X non valido)

// Costruire un oggetto di default per un nuovo dipendente e congelarlo
function nuovoDipendente(dati = {}) {
  const base = { nome: '', cognome: '', badge: '', reparto: 'XX', attivo: true };
  return Object.assign({}, base, dati);
}
console.log(nuovoDipendente({ nome: 'Sara', badge: 'UP-009' }));
// => { nome: 'Sara', cognome: '', badge: 'UP-009', reparto: 'XX', attivo: true }

// Contare le occorrenze (es. presenze per reparto) con reduce + entries
const presenze = ['UP', 'MO', 'UP', 'LV', 'UP', 'MO'];
const conteggio = presenze.reduce((acc, r) => {
  acc[r] = (acc[r] ?? 0) + 1;
  return acc;
}, {});
console.log(conteggio); // => { UP: 3, MO: 2, LV: 1 }
console.log(Object.entries(conteggio).sort((a, b) => b[1] - a[1]));
// => [ [ 'UP', 3 ], [ 'MO', 2 ], [ 'LV', 1 ] ]

/* ============================================================
   RIEPILOGO COMANDI (scheda di ripasso)
   ------------------------------------------------------------
   Object.keys(obj)                -> array delle chiavi proprie
   Object.values(obj)              -> array dei valori
   Object.entries(obj)             -> array di coppie [key, value]
   Object.fromEntries(coppie)      -> da coppie/Map a oggetto
   Object.assign(target, ...src)   -> merge/copia shallow (muta target)
   Object.freeze(obj)              -> immutabile (shallow)
   Object.isFrozen(obj)            -> true se congelato
   Object.seal(obj)                -> vieta add/remove, permette modifica
   obj.hasOwnProperty(key)         -> proprieta' propria?
   Object.hasOwn(obj, key)         -> forma moderna ES2022, piu' sicura
   'key' in obj                    -> cerca anche nel prototype
   Object.getOwnPropertyNames(obj) -> anche le non-enumerable
   Object.create(proto)            -> nuovo oggetto con prototype dato
   Pattern: entries -> map -> fromEntries  per trasformare oggetti
   Spread {...a, ...b}             -> alternativa moderna a assign
   ============================================================ */
