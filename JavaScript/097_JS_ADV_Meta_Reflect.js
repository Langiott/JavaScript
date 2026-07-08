/* ============================================================
   97 JS ADV Meta Reflect
   Reflect e' un oggetto built-in (non costruibile, non chiamabile)
   che raccoglie i metodi delle "internal methods" degli oggetti come
   funzioni statiche: Reflect.get, set, has, ownKeys, deleteProperty,
   defineProperty, getPrototypeOf, ecc. E' il complemento naturale del
   Proxy: i suoi metodi hanno la stessa firma dei trap, quindi dentro un
   handler basta inoltrare a Reflect per il comportamento di default.
   E' la base della metaprogrammazione moderna in JavaScript (ES2015+).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) PERCHE' Reflect invece degli operatori?
   I metodi Reflect.* ritornano valori utili e sono funzioni di prima
   classe, mentre gli operatori (in, delete, .) sono sintassi.
   ------------------------------------------------------------ */

const dipendente = { nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001' };

// Reflect.get: come leggere una property tramite funzione
console.log(Reflect.get(dipendente, 'nome'));        // => Mario

// Reflect.set: ritorna true/false (successo) invece di lanciare in modo opaco
console.log(Reflect.set(dipendente, 'ruolo', 'Operaio')); // => true
console.log(dipendente.ruolo);                       // => Operaio

// Reflect.has: equivalente dell'operatore "in" ma come funzione
console.log(Reflect.has(dipendente, 'codiceBadge')); // => true
console.log(Reflect.has(dipendente, 'mansione'));    // => false

// Reflect.deleteProperty: equivalente di "delete" ma ritorna boolean
console.log(Reflect.deleteProperty(dipendente, 'ruolo')); // => true

/* ------------------------------------------------------------
   2) Reflect.ownKeys: TUTTE le chiavi proprie (string + symbol)
   A differenza di Object.keys (solo enumerabili stringhe), include
   anche le non-enumerabili e i Symbol.
   ------------------------------------------------------------ */

const ID = Symbol('id');
const turno = {
  nome: 'P4',
  pausa: true,
  [ID]: 42,
};
Object.defineProperty(turno, 'interno', { value: true, enumerable: false });

console.log(Object.keys(turno));    // => [ 'nome', 'pausa' ]
console.log(Reflect.ownKeys(turno)); // => [ 'nome', 'pausa', 'interno', Symbol(id) ]

/* ------------------------------------------------------------
   3) Reflect.getPrototypeOf / setPrototypeOf / getOwnPropertyDescriptor
   ------------------------------------------------------------ */

class Reparto {
  constructor(sigla) { this.sigla = sigla; }
  etichetta() { return `Reparto ${this.sigla}`; }
}
const rep = new Reparto('UP');
console.log(Reflect.getPrototypeOf(rep) === Reparto.prototype); // => true

const desc = Reflect.getOwnPropertyDescriptor(turno, 'nome');
console.log(desc.writable, desc.enumerable); // => true true

/* ------------------------------------------------------------
   4) Reflect.defineProperty: come Object.defineProperty ma ritorna boolean
   ------------------------------------------------------------ */

const dpi = {};
const ok = Reflect.defineProperty(dpi, 'taglia', {
  value: 'L',
  enumerable: true,
});
console.log(ok, dpi.taglia); // => true L

/* ------------------------------------------------------------
   5) Reflect.apply e Reflect.construct
   apply: invoca una funzione con this e array di argomenti espliciti.
   construct: equivalente di "new" come funzione.
   ------------------------------------------------------------ */

function saluta(prefisso) {
  return `${prefisso} ${this.nome} ${this.cognome}`;
}
console.log(Reflect.apply(saluta, dipendente, ['Ciao'])); // => Ciao Mario Rossi

const istanza = Reflect.construct(Reparto, ['MG']);
console.log(istanza.etichetta()); // => Reparto MG

/* ------------------------------------------------------------
   6) IL PATTERN CHIAVE: Reflect dentro un Proxy
   Ogni trap ha la stessa firma del corrispondente metodo Reflect.
   Inoltrare a Reflect = comportamento di default + correttezza del
   "receiver" (importante per getter/setter ereditati).
   ------------------------------------------------------------ */

const target = { a: 1 };
const loggante = new Proxy(target, {
  get(obj, prop, receiver) {
    console.log(`[get] ${String(prop)}`);
    return Reflect.get(obj, prop, receiver); // default corretto
  },
  set(obj, prop, value, receiver) {
    console.log(`[set] ${String(prop)} = ${value}`);
    return Reflect.set(obj, prop, value, receiver);
  },
});
loggante.a;       // => [get] a
loggante.b = 2;   // => [set] b = 2

/* ------------------------------------------------------------
   7) Perche' il "receiver" conta: getter ereditati
   Senza passare receiver, un getter che usa "this" leggerebbe dal
   target sbagliato. Reflect.get(obj, prop, receiver) lo risolve.
   ------------------------------------------------------------ */

const base = {
  _nome: 'base',
  get nome() { return this._nome.toUpperCase(); },
};
const wrap = new Proxy(base, {
  get(o, p, r) { return Reflect.get(o, p, r); },
});
const figlio = Object.create(wrap);
figlio._nome = 'figlio';
console.log(figlio.nome); // => FIGLIO  (receiver = figlio, non base)

/* ------------------------------------------------------------
   8) ESEMPIO ERP: validazione su scrittura con Proxy + Reflect.set
   Normalizziamo e validiamo il codiceBadge prima di salvarlo.
   ------------------------------------------------------------ */

function creaDipendenteValidato(iniziale = {}) {
  const handler = {
    set(obj, prop, value, receiver) {
      if (prop === 'codiceBadge') {
        const norm = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
        if (!/^[A-Z]{2}-\d{3}$/.test(norm)) {
          throw new Error(`Badge non valido: ${value}`);
        }
        value = norm;
      }
      if (prop === 'oreLavorate' && (typeof value !== 'number' || value < 0)) {
        throw new Error('oreLavorate deve essere un numero >= 0');
      }
      return Reflect.set(obj, prop, value, receiver);
    },
  };
  return new Proxy({ ...iniziale }, handler);
}

const d = creaDipendenteValidato({ nome: 'Anna' });
d.codiceBadge = ' up-007 ';
console.log(d.codiceBadge); // => UP-007
try { d.oreLavorate = -3; } catch (e) { console.log(e.message); } // => oreLavorate deve essere un numero >= 0

/* ------------------------------------------------------------
   9) ESEMPIO ERP: campi privati nascosti con Reflect.ownKeys + has
   Le chiavi che iniziano con "_" sono interne: il Proxy le nasconde
   da enumerazione (ownKeys) e dall'operatore "in".
   ------------------------------------------------------------ */

function nascondiPrivati(obj) {
  const visibile = (p) => typeof p !== 'string' || !p.startsWith('_');
  return new Proxy(obj, {
    has(o, p) { return visibile(p) && Reflect.has(o, p); },
    ownKeys(o) { return Reflect.ownKeys(o).filter(visibile); },
    getOwnPropertyDescriptor(o, p) {
      if (!visibile(p)) return undefined;
      return Reflect.getOwnPropertyDescriptor(o, p);
    },
    get(o, p, r) { return visibile(p) ? Reflect.get(o, p, r) : undefined; },
  });
}

const record = nascondiPrivati({ id: 1, nome: 'Turno P4', _hash: 'xyz' });
console.log(Object.keys(record));  // => [ 'id', 'nome' ]
console.log('_hash' in record);    // => false
console.log(record._hash);         // => undefined

/* ------------------------------------------------------------
   10) ESEMPIO ERP: default automatici via trap get + Reflect
   Se la property manca ritorniamo un default invece di undefined.
   Pattern utile per impostazioni/turni con merge dei default.
   ------------------------------------------------------------ */

function conDefault(obj, defaults) {
  return new Proxy(obj, {
    get(o, p, r) {
      if (Reflect.has(o, p)) return Reflect.get(o, p, r);
      return Reflect.get(defaults, p);
    },
  });
}

const DEFAULT_TURNO = { regolaArrotondamento: 5, pausa: false, durataMin: 480 };
const t = conDefault({ nome: 'P2', pausa: false }, DEFAULT_TURNO);
console.log(t.nome);                 // => P2
console.log(t.regolaArrotondamento); // => 5  (preso dai default)

/* ------------------------------------------------------------
   11) Conteggio accessi (audit) con Reflect: telemetria sulle letture
   ------------------------------------------------------------ */

function tracciaLetture(obj) {
  const contatori = new Map();
  const proxy = new Proxy(obj, {
    get(o, p, r) {
      contatori.set(p, (contatori.get(p) || 0) + 1);
      return Reflect.get(o, p, r);
    },
  });
  return { proxy, contatori };
}

const { proxy: badge, contatori } = tracciaLetture({ sigla: 'UP', n: 1 });
badge.sigla; badge.sigla; badge.n;
console.log(contatori.get('sigla'), contatori.get('n')); // => 2 1

/* ------------------------------------------------------------
   12) Sola lettura (immutabilita' soft) bloccando set/delete
   ------------------------------------------------------------ */

function soloLettura(obj) {
  return new Proxy(obj, {
    set() { return false; },          // in strict mode lanciara' TypeError
    deleteProperty() { return false; },
    defineProperty() { return false; },
  });
}

const config = soloLettura({ apiUrl: '/api', maxRows: 1000 });
try { config.maxRows = 5; } catch (e) { console.log('bloccato:', e.constructor.name); }
console.log(config.maxRows); // => 1000

/* ------------------------------------------------------------
   13) Reflect.construct con newTarget: factory che preserva il prototype
   Il 3o argomento definisce quale prototype usare (utile per subclassing).
   ------------------------------------------------------------ */

function Base() { this.tipo = 'base'; }
class Esteso {}
const obj = Reflect.construct(Base, [], Esteso);
console.log(obj.tipo);                              // => base
console.log(obj instanceof Esteso);                // => true

/* ------------------------------------------------------------
   14) ownKeys che mantiene l'ordine: clonare le property in modo robusto
   ------------------------------------------------------------ */

function clonaConDescrittori(src) {
  const dst = {};
  for (const key of Reflect.ownKeys(src)) {
    Reflect.defineProperty(dst, key, Reflect.getOwnPropertyDescriptor(src, key));
  }
  return dst;
}
const copia = clonaConDescrittori(turno);
console.log(Reflect.ownKeys(copia)); // => [ 'nome', 'pausa', 'interno', Symbol(id) ]

/* ------------------------------------------------------------
   15) Esempio browser: gira nel browser, non in Node
   Proxy + Reflect per loggare gli accessi a un oggetto di stato UI.
   ------------------------------------------------------------ */

function statoUiBrowser() {
  // Esempio browser: gira nel browser, non in Node
  const stato = new Proxy({ loading: false, errore: null }, {
    set(o, p, v, r) {
      // document.title = `Stato: ${String(p)}=${v}`;  // pseudo-eseguibile
      console.log(`UI ${String(p)} ->`, v);
      return Reflect.set(o, p, v, r);
    },
  });
  return stato;
}
// const ui = statoUiBrowser(); ui.loading = true;

/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   - Reflect.get(obj, key, receiver?)        legge una property
   - Reflect.set(obj, key, val, receiver?)   scrive, ritorna boolean
   - Reflect.has(obj, key)                   come operatore "in"
   - Reflect.deleteProperty(obj, key)        come "delete", boolean
   - Reflect.ownKeys(obj)                    tutte le chiavi (string+symbol)
   - Reflect.defineProperty(obj, k, desc)    define, ritorna boolean
   - Reflect.getOwnPropertyDescriptor(o, k)  descrittore di una property
   - Reflect.getPrototypeOf / setPrototypeOf gestione prototype
   - Reflect.apply(fn, this, argsArray)      invoca con this/args
   - Reflect.construct(fn, args, newTarget?) come "new"
   - Pattern: dentro un Proxy trap, inolt -> Reflect.<trap>(...args)
     per il comportamento di default e per gestire il receiver.
   ============================================================ */
