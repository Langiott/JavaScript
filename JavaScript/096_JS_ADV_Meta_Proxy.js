/* ============================================================
   96 JS ADV Meta Proxy
   Il Proxy e' un oggetto wrapper che intercetta ("trappa") le
   operazioni fondamentali su un altro oggetto (il target): lettura,
   scrittura, cancellazione, controllo di esistenza, enumerazione, ecc.
   Si configura con un "handler" che contiene le trap (get, set, has,
   deleteProperty, ...). E' la base per validazione, oggetti reactive,
   logging trasparente, lazy loading, default dinamici e API fluide.
   Spesso si usa insieme a Reflect per ri-eseguire il comportamento
   di default in modo pulito.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) BASE: cos'e' un Proxy
   new Proxy(target, handler). Senza trap, si comporta come il target.
------------------------------------------------------------ */
const target = { nome: 'Mario', reparto: 'UP' };
const passthrough = new Proxy(target, {}); // handler vuoto
console.log(passthrough.nome); // => Mario
passthrough.reparto = 'PR';
console.log(target.reparto); // => PR  (scrive sul target reale)

/* ------------------------------------------------------------
   2) TRAP get: intercetta la lettura di proprieta'
------------------------------------------------------------ */
const dipendente = { nome: 'Luigi', cognome: 'Verdi' };
const conLog = new Proxy(dipendente, {
  get(obj, prop, receiver) {
    console.log(`[get] lettura di "${String(prop)}"`);
    return Reflect.get(obj, prop, receiver); // comportamento di default
  },
});
conLog.nome; // => [get] lettura di "nome"

/* get con default dinamico: ritorna un valore se la prop non esiste */
const conDefault = new Proxy({}, {
  get(obj, prop) {
    return prop in obj ? obj[prop] : `<${String(prop)} mancante>`;
  },
});
conDefault.foo = 1;
console.log(conDefault.foo); // => 1
console.log(conDefault.bar); // => <bar mancante>

/* ------------------------------------------------------------
   3) TRAP set: intercetta la scrittura. DEVE ritornare true
   (altrimenti in strict mode lancia TypeError).
------------------------------------------------------------ */
const tracciato = new Proxy({}, {
  set(obj, prop, value, receiver) {
    console.log(`[set] ${String(prop)} = ${value}`);
    return Reflect.set(obj, prop, value, receiver); // ritorna true
  },
});
tracciato.taglia = 'L'; // => [set] taglia = L

/* ------------------------------------------------------------
   4) TRAP has: intercetta l'operatore `in`
------------------------------------------------------------ */
const nascondiPrivate = new Proxy({ nome: 'Anna', _token: 'segreto' }, {
  has(obj, prop) {
    if (String(prop).startsWith('_')) return false; // nasconde prop private
    return Reflect.has(obj, prop);
  },
});
console.log('nome' in nascondiPrivate);   // => true
console.log('_token' in nascondiPrivate); // => false

/* ------------------------------------------------------------
   5) TRAP deleteProperty: intercetta `delete`
------------------------------------------------------------ */
const protetto = new Proxy({ id: 1, nome: 'Sara' }, {
  deleteProperty(obj, prop) {
    if (prop === 'id') {
      console.log('Impossibile cancellare "id"');
      return false; // delete restituisce false
    }
    return Reflect.deleteProperty(obj, prop);
  },
});
delete protetto.nome; // ok
// in strict mode delete che ritorna false lancia TypeError: lo catturiamo
try { delete protetto.id; } catch (_) {} // => Impossibile cancellare "id"
console.log(protetto); // => { id: 1 }

/* ------------------------------------------------------------
   6) VALIDAZIONE: il caso d'uso piu' comune del trap set.
   Esempio ERP: validare un dipendente prima di scrivere.
------------------------------------------------------------ */
function creaDipendenteValidato(iniziale = {}) {
  const regole = {
    nome: (v) => typeof v === 'string' && v.trim().length > 0,
    codiceBadge: (v) => /^[A-Z]{2}-\d{3}$/.test(v),       // es 'UP-001'
    oreLavorate: (v) => typeof v === 'number' && v >= 0 && v <= 24,
  };
  return new Proxy({ ...iniziale }, {
    set(obj, prop, value) {
      const check = regole[prop];
      if (check && !check(value)) {
        throw new TypeError(`Valore non valido per "${String(prop)}": ${value}`);
      }
      return Reflect.set(obj, prop, value);
    },
  });
}
const d = creaDipendenteValidato({ nome: 'Carlo' });
d.codiceBadge = 'UP-001';      // ok
d.oreLavorate = 8;             // ok
try { d.codiceBadge = 'xx1'; } // formato errato
catch (e) { console.log(e.message); } // => Valore non valido per "codiceBadge": xx1
try { d.oreLavorate = 30; }
catch (e) { console.log(e.message); } // => Valore non valido per "oreLavorate": 30

/* ------------------------------------------------------------
   7) READONLY: rendere un oggetto immutabile via Proxy
------------------------------------------------------------ */
function readonly(obj) {
  const blocca = () => { throw new Error('Oggetto in sola lettura'); };
  return new Proxy(obj, { set: blocca, deleteProperty: blocca });
}
const config = readonly({ porta: 9000, db: 'polyuretech_test' });
console.log(config.porta); // => 9000
try { config.porta = 80; } catch (e) { console.log(e.message); } // => Oggetto in sola lettura

/* ------------------------------------------------------------
   8) REACTIVE OBJECTS: il cuore dei framework moderni (Vue-like).
   Su ogni set notifichiamo dei "watcher" (observer pattern).
------------------------------------------------------------ */
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const old = target[prop];
      const ok = Reflect.set(target, prop, value, receiver);
      if (old !== value) onChange(prop, value, old);
      return ok;
    },
    deleteProperty(target, prop) {
      const ok = Reflect.deleteProperty(target, prop);
      onChange(prop, undefined, 'cancellata');
      return ok;
    },
  });
}
const stato = reactive(
  { turno: 'P4', pausa: true },
  (prop, nuovo, vecchio) => console.log(`cambiato ${prop}: ${vecchio} -> ${nuovo}`)
);
stato.turno = 'P2'; // => cambiato turno: P4 -> P2
stato.pausa = false; // => cambiato pausa: true -> false

/* ------------------------------------------------------------
   9) DEEP REACTIVE: rendere reactive anche gli oggetti annidati
   (wrappa on-demand quando si legge un sotto-oggetto).
------------------------------------------------------------ */
function deepReactive(obj, onChange) {
  return new Proxy(obj, {
    get(t, p, r) {
      const val = Reflect.get(t, p, r);
      if (val && typeof val === 'object') return deepReactive(val, onChange);
      return val;
    },
    set(t, p, v, r) {
      const ok = Reflect.set(t, p, v, r);
      onChange(String(p), v);
      return ok;
    },
  });
}
const ordine = deepReactive(
  { cliente: 'ACME', vestiario: { taglia: 'L', quantita: 10 } },
  (p, v) => console.log(`[deep] ${p} = ${v}`)
);
ordine.vestiario.quantita = 25; // => [deep] quantita = 25

/* ------------------------------------------------------------
   10) NEGATIVE ARRAY INDEXING: arr[-1] = ultimo elemento
------------------------------------------------------------ */
function arrayNegativo(arr) {
  return new Proxy(arr, {
    get(t, p, r) {
      const idx = Number(p);
      if (Number.isInteger(idx) && idx < 0) return t[t.length + idx];
      return Reflect.get(t, p, r);
    },
  });
}
const turni = arrayNegativo(['P1', 'P2', 'P3', 'P4']);
console.log(turni[-1]); // => P4
console.log(turni[-2]); // => P3
console.log(turni.length); // => 4 (le altre operazioni restano normali)

/* ------------------------------------------------------------
   11) TRAP apply: intercetta la CHIAMATA di una funzione.
   Utile per logging/timing trasparente (decorator pattern).
------------------------------------------------------------ */
function calcolaOre(ingresso, uscita) { return uscita - ingresso; }
const conTiming = new Proxy(calcolaOre, {
  apply(fn, thisArg, args) {
    console.log(`chiamata con ${args}`);
    return Reflect.apply(fn, thisArg, args);
  },
});
console.log(conTiming(8, 17)); // => chiamata con 8,17  poi => 9

/* ------------------------------------------------------------
   12) TRAP construct: intercetta `new`
------------------------------------------------------------ */
class Reparto { constructor(sigla) { this.sigla = sigla; } }
const RepartoLog = new Proxy(Reparto, {
  construct(Target, args) {
    console.log(`new Reparto(${args})`);
    return Reflect.construct(Target, args);
  },
});
const rep = new RepartoLog('UP'); // => new Reparto(UP)
console.log(rep.sigla); // => UP

/* ------------------------------------------------------------
   13) ALTRE TRAP utili
   ownKeys: intercetta Object.keys / for..in / Object.getOwnPropertyNames
   getOwnPropertyDescriptor: richiesta dal motore durante ownKeys/keys
------------------------------------------------------------ */
const filtraPrivate = new Proxy({ a: 1, _b: 2, c: 3 }, {
  ownKeys(t) {
    return Reflect.ownKeys(t).filter((k) => !String(k).startsWith('_'));
  },
  getOwnPropertyDescriptor(t, p) {
    return Reflect.getOwnPropertyDescriptor(t, p);
  },
});
console.log(Object.keys(filtraPrivate)); // => [ 'a', 'c' ]

/* ------------------------------------------------------------
   14) Proxy.revocable: crea un Proxy disattivabile.
   Dopo revoke() ogni accesso lancia TypeError. Utile per
   gestire scope/lifetime (es. dati di una sessione scaduta).
------------------------------------------------------------ */
const { proxy: sessione, revoke } = Proxy.revocable({ utente: 'admin' }, {});
console.log(sessione.utente); // => admin
revoke();
try { sessione.utente; } catch (e) { console.log('revocato:', e.constructor.name); } // => revocato: TypeError

/* ------------------------------------------------------------
   15) API FLUENT / dinamica con get (es. query builder)
   Ogni prop sconosciuta diventa un metodo che accumula condizioni.
------------------------------------------------------------ */
function queryBuilder() {
  const where = {};
  const api = new Proxy({}, {
    get(_t, prop) {
      if (prop === 'build') return () => ({ where });
      return (value) => { where[prop] = value; return api; }; // chaining
    },
  });
  return api;
}
const q = queryBuilder().reparto('UP').ruolo('operaio').build();
console.log(q); // => { where: { reparto: 'UP', ruolo: 'operaio' } }

/* ------------------------------------------------------------
   16) DEFAULT MERGE via get: impostazioni con fallback ai default.
   Pattern ERP: { ...DEFAULT, ...impostazioni } reso "lazy".
------------------------------------------------------------ */
function conImpostazioni(impostazioni, DEFAULT) {
  return new Proxy(impostazioni, {
    get(t, p, r) {
      return p in t ? Reflect.get(t, p, r) : DEFAULT[p];
    },
  });
}
const DEFAULT = { regolaArrotondamento: 'nessuna', tolleranza: 5, fuso: 'Europe/Rome' };
const imp = conImpostazioni({ tolleranza: 10 }, DEFAULT);
console.log(imp.tolleranza);           // => 10  (override)
console.log(imp.regolaArrotondamento); // => nessuna (dal default)
console.log(imp.fuso);                 // => Europe/Rome

/* ------------------------------------------------------------
   17) GOTCHA & note:
   - le trap set/deleteProperty/defineProperty DEVONO ritornare boolean.
   - usa SEMPRE Reflect per il comportamento di default e per passare
     correttamente `receiver` (importante con getter/setter ereditati).
   - il Proxy NON e' === al target: target !== new Proxy(target, {}).
   - le invariant: non puoi mentire su proprieta' non-configurabili.
------------------------------------------------------------ */
const t2 = {};
const p2 = new Proxy(t2, {});
console.log(t2 === p2); // => false

/* ============================================================
   RIEPILOGO COMANDI (scheda memoria rapida)
   ------------------------------------------------------------
   new Proxy(target, handler)        -> crea il wrapper
   Proxy.revocable(target, handler)  -> { proxy, revoke }
   handler.get(t, prop, receiver)        -> lettura
   handler.set(t, prop, value, receiver) -> scrittura (ritorna boolean)
   handler.has(t, prop)                  -> operatore `in`
   handler.deleteProperty(t, prop)       -> delete (ritorna boolean)
   handler.ownKeys(t)                    -> Object.keys / for..in
   handler.getOwnPropertyDescriptor(t,p) -> descrittore proprieta'
   handler.defineProperty(t, p, desc)    -> Object.defineProperty
   handler.apply(fn, thisArg, args)      -> chiamata di funzione
   handler.construct(Target, args)       -> operatore `new`
   handler.getPrototypeOf / setPrototypeOf
   Reflect.get / set / has / deleteProperty / ownKeys
   Reflect.apply / construct / getOwnPropertyDescriptor
   Pattern: validazione, readonly, reactive, deep reactive,
            negative index, fluent API, default merge, logging.
   ============================================================ */
