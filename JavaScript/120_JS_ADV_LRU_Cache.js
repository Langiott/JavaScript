/* ============================================================
   120 JS ADV LRU Cache
   Costruiamo una cache LRU (Least Recently Used): quando e' piena,
   butta via l'elemento usato MENO di recente. Caso reale: nel
   gestionale interroghiamo spesso l'anagrafica dipendenti dal DB;
   una cache riduce le query, ma ha memoria limitata.
   Impariamo: perche' Map ricorda l'ordine di inserimento, come
   sfruttarlo per l'LRU, e come "memoizzare" una funzione costosa.
   JavaScript moderno (ES2020+), eseguibile con Node.js.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. L'INTUIZIONE: Map mantiene l'ordine di inserimento
   ------------------------------------------------------------
   Questa e' la chiave del trucco. Se cancello e reinserisco una
   chiave, questa "torna in fondo" = diventa la piu' recente. */

const m = new Map();
m.set('a', 1);
m.set('b', 2);
m.set('c', 3);
console.log([...m.keys()]); // => ['a', 'b', 'c']  (ordine di inserimento)

// "Tocco" 'a': lo cancello e reinserisco -> va in fondo.
m.delete('a');
m.set('a', 1);
console.log([...m.keys()]); // => ['b', 'c', 'a']  ('a' ora e' il piu' recente)

// La PRIMA chiave (map.keys().next().value) e' sempre la meno recente.
console.log(m.keys().next().value); // => 'b'

/* ------------------------------------------------------------
   2. LA CLASSE LRUCache
   ------------------------------------------------------------
   capacita' = quanti elementi tenere. Superata, si elimina il
   meno recente (il primo della Map). */

class LRUCache {
  constructor(capacita = 3) {
    if (capacita < 1) throw new RangeError('capacita deve essere >= 1');
    this.capacita = capacita;
    this._map = new Map();
    this.hits = 0;   // statistiche: quante volte abbiamo trovato in cache
    this.misses = 0; // ...e quante no
  }

  // Legge un valore. Se presente, lo "promuove" a piu' recente.
  get(chiave) {
    if (!this._map.has(chiave)) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    const valore = this._map.get(chiave);
    this._map.delete(chiave); // rimuovo...
    this._map.set(chiave, valore); // ...e reinserisco in fondo (promozione)
    return valore;
  }

  // Scrive un valore. Se pieno, elimina il meno recente prima di aggiungere.
  set(chiave, valore) {
    if (this._map.has(chiave)) {
      this._map.delete(chiave); // aggiorno la posizione
    } else if (this._map.size >= this.capacita) {
      const menoRecente = this._map.keys().next().value; // primo = LRU
      this._map.delete(menoRecente);
      console.log(`  [LRU] sfratto '${menoRecente}' (cache piena)`);
    }
    this._map.set(chiave, valore);
    return this;
  }

  has(chiave) { return this._map.has(chiave); }
  get size() { return this._map.size; }
  chiavi() { return [...this._map.keys()]; } // dal meno al piu' recente

  // Tasso di successo: utile per capire se la cache "serve".
  hitRate() {
    const tot = this.hits + this.misses;
    return tot === 0 ? 0 : Number((this.hits / tot).toFixed(2));
  }
}

/* ------------------------------------------------------------
   3. USO BASE E SFRATTO AUTOMATICO
   ------------------------------------------------------------ */

const cache = new LRUCache(3);
cache.set('UP-001', { nome: 'Mario' });
cache.set('UP-002', { nome: 'Anna' });
cache.set('UP-003', { nome: 'Luca' });
console.log(cache.chiavi()); // => ['UP-001', 'UP-002', 'UP-003']

// Uso UP-001: diventa il piu' recente.
cache.get('UP-001');
console.log(cache.chiavi()); // => ['UP-002', 'UP-003', 'UP-001']

// Aggiungo un 4o: la cache e' piena -> sfratta il meno recente ('UP-002').
cache.set('UP-004', { nome: 'Sara' });
// => [LRU] sfratto 'UP-002' (cache piena)
console.log(cache.chiavi()); // => ['UP-003', 'UP-001', 'UP-004']
console.log(cache.has('UP-002')); // => false

/* ------------------------------------------------------------
   4. MEMOIZZAZIONE: cache LRU applicata a una funzione costosa
   ------------------------------------------------------------
   Simuliamo una query lenta al DB e la avvolgiamo in una cache.
   Alla seconda chiamata con la stessa chiave, risposta immediata. */

let queryEseguite = 0;
function caricaDipendenteDalDB(badge) {
  queryEseguite++; // effetto costoso simulato
  return { badge, nome: `Dip-${badge}`, caricatoConQuery: queryEseguite };
}

function memoizzaLRU(fn, capacita = 3) {
  const c = new LRUCache(capacita);
  return function (chiave) {
    if (c.has(chiave)) return c.get(chiave); // HIT: niente query
    const risultato = fn(chiave);            // MISS: esegue e memorizza
    c.set(chiave, risultato);
    return risultato;
  };
}

const caricaConCache = memoizzaLRU(caricaDipendenteDalDB, 2);

console.log(caricaConCache('UP-001')); // query #1
console.log(caricaConCache('UP-001')); // dalla cache (nessuna nuova query)
console.log(caricaConCache('UP-002')); // query #2
console.log('Query totali eseguite:', queryEseguite); // => 2 (non 3!)

/* ------------------------------------------------------------
   5. STATISTICHE (hit rate)
   ------------------------------------------------------------ */

const c2 = new LRUCache(2);
c2.set('x', 10);
c2.get('x'); // hit
c2.get('y'); // miss
c2.get('x'); // hit
console.log('Hits:', c2.hits, 'Misses:', c2.misses); // => Hits: 2 Misses: 1
console.log('Hit rate:', c2.hitRate()); // => 0.67

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - Map ricorda l'ordine di inserimento: base per l'LRU.
   - "Promuovere" = delete + set (l'elemento torna in fondo).
   - La prima chiave della Map e' sempre la meno recente (da sfrattare).
   - La memoizzazione riusa i risultati di funzioni costose (query, calcoli).
   - hitRate() misura se la cache sta davvero aiutando.
   ============================================================ */
