/* ============================================================
   61 JS WeakMap WeakSet
   WeakMap e WeakSet sono collezioni "deboli": le loro chiavi (WeakMap)
   o i loro valori (WeakSet) devono essere OGGETTI e vengono tenuti con
   un riferimento "weak". Questo significa che se l'oggetto non e' piu'
   raggiungibile altrove, il garbage collector puo' eliminarlo anche se
   e' ancora dentro la collezione. Servono per associare metadati privati
   agli oggetti senza causare memory leak e senza "sporcarli". Non sono
   iterabili e non hanno .size, proprio per via della garbage collection.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) WeakMap: creazione e metodi base (get / set / has / delete)
   Le chiavi DEVONO essere oggetti (o symbol non registrati). I valori
   possono essere qualsiasi cosa.
   ------------------------------------------------------------ */
const wm = new WeakMap();
const chiave1 = { id: 1 };
const chiave2 = { id: 2 };

wm.set(chiave1, 'metadato A');
wm.set(chiave2, 42);

console.log(wm.get(chiave1)); // => metadato A
console.log(wm.has(chiave2)); // => true
wm.delete(chiave2);
console.log(wm.has(chiave2)); // => false

/* set() ritorna la WeakMap stessa: si puo' concatenare (chaining) */
const wmChain = new WeakMap();
const a = {}, b = {};
wmChain.set(a, 1).set(b, 2);
console.log(wmChain.get(b)); // => 2

/* ------------------------------------------------------------
   2) Le chiavi primitive NON sono ammesse in WeakMap
   ------------------------------------------------------------ */
try {
  const wmErr = new WeakMap();
  wmErr.set('stringa', 1); // errore: chiave primitiva
} catch (e) {
  console.log(e.constructor.name); // => TypeError
}

/* ------------------------------------------------------------
   3) WeakMap NON e' iterabile e non ha .size
   Niente forEach, keys(), values(), entries(), size.
   ------------------------------------------------------------ */
const wmNoIter = new WeakMap();
wmNoIter.set({}, 'x');
console.log('size' in wmNoIter);          // => false
console.log(typeof wmNoIter.forEach);     // => undefined

/* ------------------------------------------------------------
   4) Garbage collection: il concetto
   Se l'unico riferimento all'oggetto e' la chiave di una WeakMap,
   quando perdiamo quel riferimento l'entry diventa eliminabile dal GC.
   ------------------------------------------------------------ */
let temporaneo = { grande: 'oggetto' };
const cache = new WeakMap();
cache.set(temporaneo, 'dati derivati');
console.log(cache.get(temporaneo)); // => dati derivati
temporaneo = null; // ora l'oggetto non e' piu' raggiungibile: GC libero di rimuoverlo
// Con una Map normale, invece, l'oggetto resterebbe vivo per sempre (memory leak).

/* ------------------------------------------------------------
   5) Metadati privati con WeakMap (pattern classico)
   Associamo dati "privati" a un'istanza senza aggiungere proprieta'
   visibili sull'oggetto.
   ------------------------------------------------------------ */
const _saldo = new WeakMap();

class ContoCorrente {
  constructor(iniziale) {
    _saldo.set(this, iniziale);
  }
  deposita(x) {
    _saldo.set(this, _saldo.get(this) + x);
  }
  get saldo() {
    return _saldo.get(this);
  }
}

const conto = new ContoCorrente(100);
conto.deposita(50);
console.log(conto.saldo);           // => 150
console.log(Object.keys(conto));    // => []  (nessun campo esposto)

/* ------------------------------------------------------------
   6) Caching di risultati costosi legati a un oggetto (memoize)
   ------------------------------------------------------------ */
const cacheCalcoli = new WeakMap();

function calcoloCostoso(oggetto) {
  if (cacheCalcoli.has(oggetto)) {
    return cacheCalcoli.get(oggetto); // hit
  }
  const risultato = oggetto.valore * 2; // finto calcolo pesante
  cacheCalcoli.set(oggetto, risultato);
  return risultato;
}

const dato = { valore: 21 };
console.log(calcoloCostoso(dato)); // => 42 (calcolato)
console.log(calcoloCostoso(dato)); // => 42 (dalla cache)

/* ------------------------------------------------------------
   7) WeakSet: creazione e metodi (add / has / delete)
   Contiene solo OGGETTI, tenuti con riferimento weak. Non iterabile,
   niente .size.
   ------------------------------------------------------------ */
const ws = new WeakSet();
const o1 = {}, o2 = {};
ws.add(o1);
ws.add(o2).add({}); // add() ritorna il WeakSet: chaining

console.log(ws.has(o1)); // => true
ws.delete(o1);
console.log(ws.has(o1)); // => false

/* ------------------------------------------------------------
   8) WeakSet per marcare oggetti "gia' processati"
   Utile per evitare di rielaborare lo stesso oggetto.
   ------------------------------------------------------------ */
const processati = new WeakSet();

function processa(item) {
  if (processati.has(item)) {
    return 'gia visto';
  }
  processati.add(item);
  return 'processato';
}

const itemX = { nome: 'X' };
console.log(processa(itemX)); // => processato
console.log(processa(itemX)); // => gia visto

/* ------------------------------------------------------------
   9) WeakSet per rilevare cicli (esempio: visita di un grafo)
   ------------------------------------------------------------ */
function haCiclo(nodo, visti = new WeakSet()) {
  if (visti.has(nodo)) return true;
  visti.add(nodo);
  return nodo.next ? haCiclo(nodo.next, visti) : false;
}
const n1 = { v: 1 }, n2 = { v: 2 };
n1.next = n2;
n2.next = n1; // ciclo
console.log(haCiclo(n1)); // => true

/* ============================================================
   ESEMPI ISPIRATI AL GESTIONALE ERP
   ============================================================ */

/* ------------------------------------------------------------
   10) Metadati privati su un Dipendente (badge 'UP-001')
   Teniamo i dati sensibili fuori dall'oggetto pubblico tramite WeakMap.
   ------------------------------------------------------------ */
const _datiRiservati = new WeakMap();

class Dipendente {
  constructor(nome, cognome, codiceBadge) {
    this.nome = nome;
    this.cognome = cognome;
    this.codiceBadge = codiceBadge;
    _datiRiservati.set(this, { stipendio: 0, valutazioni: [] });
  }
  set stipendio(v) {
    _datiRiservati.get(this).stipendio = v;
  }
  get stipendio() {
    return _datiRiservati.get(this).stipendio;
  }
  get etichetta() {
    return `${this.nome} ${this.cognome} (${this.codiceBadge})`;
  }
}

const dip = new Dipendente('Mario', 'Rossi', 'UP-001');
dip.stipendio = 1800;
console.log(dip.etichetta);          // => Mario Rossi (UP-001)
console.log(dip.stipendio);          // => 1800
console.log(JSON.stringify(dip));    // => {"nome":"Mario","cognome":"Rossi","codiceBadge":"UP-001"}
// Lo stipendio NON finisce nel JSON: e' un metadato privato.

/* ------------------------------------------------------------
   11) Cache di timbrature elaborate per dipendente (WeakMap)
   Pattern naive-UTC: leggiamo l'ora di Roma e calcoliamo i minuti.
   La cache si svuota da sola quando il dipendente esce dallo scope.
   ------------------------------------------------------------ */
const cacheOreLavorate = new WeakMap();

function minutiTraOrari(inizioHHMM, fineHHMM) {
  const [hi, mi] = inizioHHMM.split(':').map(Number);
  const [hf, mf] = fineHHMM.split(':').map(Number);
  return (hf * 60 + mf) - (hi * 60 + mi);
}

function oreLavorate(dipendente, timbrature) {
  if (cacheOreLavorate.has(dipendente)) {
    return cacheOreLavorate.get(dipendente);
  }
  const minuti = timbrature
    .filter(t => t.ingresso && t.uscita)
    .reduce((s, t) => s + minutiTraOrari(t.ingresso, t.uscita), 0);
  const ore = (minuti / 60).toFixed(2);
  cacheOreLavorate.set(dipendente, ore);
  return ore;
}

const turniMario = [
  { ingresso: '08:00', uscita: '12:00' },
  { ingresso: '13:00', uscita: '17:00' },
];
console.log(oreLavorate(dip, turniMario)); // => 8.00
console.log(oreLavorate(dip, turniMario)); // => 8.00 (dalla cache)

/* ------------------------------------------------------------
   12) WeakSet per marcare dipendenti "gia' validati" in un import
   Evita doppia validazione dello stesso record nello stesso batch.
   ------------------------------------------------------------ */
const giaValidati = new WeakSet();
const regexBadge = /^[A-Z]{2}-\d{3}$/;

function validaBadge(dipendente) {
  if (giaValidati.has(dipendente)) return 'skip';
  giaValidati.add(dipendente);
  return regexBadge.test(dipendente.codiceBadge) ? 'ok' : 'badge non valido';
}

const dip2 = new Dipendente('Lucia', 'Bianchi', 'UP-002');
console.log(validaBadge(dip2)); // => ok
console.log(validaBadge(dip2)); // => skip
console.log(validaBadge(new Dipendente('X', 'Y', 'BADBADGE'))); // => badge non valido

/* ------------------------------------------------------------
   13) WeakMap come registro di "lock" su righe (es. timbrature in modifica)
   Marchiamo un oggetto come bloccato durante un'operazione async.
   ------------------------------------------------------------ */
const lockRighe = new WeakMap();

async function salvaRiga(riga) {
  if (lockRighe.get(riga)) return 'gia in salvataggio';
  lockRighe.set(riga, true);
  try {
    await Promise.resolve(); // finta scrittura su DB
    return `salvata riga ${riga.id}`;
  } finally {
    lockRighe.delete(riga);
  }
}

(async () => {
  const riga = { id: 7, oreLavorate: 8 };
  console.log(await salvaRiga(riga)); // => salvata riga 7
})();

/* ------------------------------------------------------------
   14) Associare un reparto a piu' dipendenti senza tenerli "vivi"
   La WeakMap mappa dipendente -> sigla reparto (2 lettere).
   ------------------------------------------------------------ */
const repartoDi = new WeakMap();
repartoDi.set(dip, 'PR');   // Produzione
repartoDi.set(dip2, 'MG');  // Magazzino
console.log(repartoDi.get(dip) ?? 'XX');  // => PR
console.log(repartoDi.get({}) ?? 'XX');   // => XX (nullish coalescing su chiave assente)

/* ------------------------------------------------------------
   15) WeakSet per tracciare DPI/vestiario gia' consegnati in sessione
   ------------------------------------------------------------ */
const consegnati = new WeakSet();
function consegnaDPI(articolo) {
  if (consegnati.has(articolo)) return `${articolo.descrizione}: gia consegnato`;
  consegnati.add(articolo);
  return `${articolo.descrizione}: consegnato (taglia ${articolo.taglia})`;
}
const giubbotto = { descrizione: 'Giubbotto', taglia: 'L', quantita: 1 };
console.log(consegnaDPI(giubbotto)); // => Giubbotto: consegnato (taglia L)
console.log(consegnaDPI(giubbotto)); // => Giubbotto: gia consegnato

/* ------------------------------------------------------------
   16) WeakMap vs Map: quando usare cosa
   - Map: serve iterare, contare (.size), chiavi primitive, dati persistenti.
   - WeakMap: metadati legati al ciclo di vita di un oggetto, no leak,
     niente iterazione, solo chiavi oggetto.
   ------------------------------------------------------------ */
const mapNormale = new Map();
mapNormale.set('chiaveStringa', 1); // Map accetta primitive
console.log(mapNormale.size);       // => 1
console.log([...mapNormale.keys()]); // => [ 'chiaveStringa' ]

/* ------------------------------------------------------------
   17) FinalizationRegistry (correlato): callback alla garbage collection
   Permette di sapere (in modo NON garantito) quando un oggetto e' stato
   raccolto. Da usare con cautela: il timing dipende dal GC.
   ------------------------------------------------------------ */
const registry = new FinalizationRegistry((token) => {
  // Esempio: qui potremmo loggare la pulizia di una risorsa
  // console.log('raccolto:', token);
});
let risorsa = { handle: 123 };
registry.register(risorsa, 'risorsa-123');
risorsa = null; // prima o poi la callback POTRA' essere invocata dal GC
console.log(typeof registry.register); // => function

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   WeakMap:
     new WeakMap()            crea una WeakMap (chiavi = oggetti)
     wm.set(obj, val)         aggiunge/aggiorna (ritorna la WeakMap)
     wm.get(obj)              legge il valore (undefined se assente)
     wm.has(obj)              true/false se la chiave esiste
     wm.delete(obj)           rimuove l'entry (ritorna true/false)
     // NIENTE: size, keys, values, entries, forEach, iterazione

   WeakSet:
     new WeakSet()            crea un WeakSet (valori = oggetti)
     ws.add(obj)              aggiunge (ritorna il WeakSet)
     ws.has(obj)              true/false se presente
     ws.delete(obj)           rimuove (ritorna true/false)
     // NIENTE: size, iterazione

   Correlati / concetti:
     garbage collection       entry rimossa quando l'oggetto non e' piu' raggiungibile
     FinalizationRegistry     callback (non garantita) alla raccolta di un oggetto
     registry.register(o,tok) registra un oggetto per la finalizzazione

   Usi tipici: metadati privati, cache legata al ciclo di vita,
   marcatura "gia' processato/validato", lock temporanei, rilevazione cicli.
   ============================================================ */
