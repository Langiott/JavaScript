/* ============================================================
   94 JS ADV Immutability
   L'immutability e' il principio per cui un dato, una volta creato,
   non viene mutato "in place" ma sostituito con una NUOVA copia che
   contiene le modifiche. E' alla base di React/Redux (state update),
   del time-travel debugging e del confronto rapido per reference.
   In questo file vediamo Object.freeze (freeze shallow vs deep),
   structuredClone (deep clone nativo ES2022), e gli immutable update
   pattern con spread/map/filter per oggetti e array annidati.
   ============================================================ */

// NB: file in modalita' non-strict di proposito, cosi' le scritture su
// oggetti frozen vengono IGNORATE silenziosamente (in strict lancerebbero
// un TypeError, come mostrato nell'esempio dedicato).

/* ------------------------------------------------------------
   1) PERCHE' L'IMMUTABILITY: la mutazione "nascosta"
   ------------------------------------------------------------ */

// Mutare un oggetto condiviso crea bug difficili da tracciare.
const dipendenteA = { nome: 'Mario', reparto: 'UP' };
const dipendenteB = dipendenteA; // NON e' una copia: stessa reference
dipendenteB.reparto = 'XX';
console.log(dipendenteA.reparto); // => XX  (mutato anche A!)

// Confronto per reference: stesso oggetto => true
console.log(dipendenteA === dipendenteB); // => true


/* ------------------------------------------------------------
   2) Object.freeze: congela un oggetto (shallow)
   ------------------------------------------------------------ */

// freeze impedisce add/remove/modifica delle proprieta' di primo livello.
const config = Object.freeze({ porta: 9000, host: 'localhost' });
config.porta = 3000;          // ignorato in modalita' non-strict
console.log(config.porta);    // => 9000

// Object.isFrozen verifica lo stato di freeze.
console.log(Object.isFrozen(config)); // => true

// In 'use strict' la stessa scrittura lancerebbe un TypeError:
function provaStrict() {
  'use strict';
  const f = Object.freeze({ x: 1 });
  try {
    f.x = 2;
  } catch (e) {
    return e.constructor.name;
  }
}
console.log(provaStrict()); // => TypeError

// freeze e' SHALLOW: gli oggetti annidati restano mutabili.
const badge = Object.freeze({ codice: 'UP-001', meta: { usi: 0 } });
badge.meta.usi = 5;           // permesso: meta non e' congelato
console.log(badge.meta.usi);  // => 5


/* ------------------------------------------------------------
   3) Deep freeze ricorsivo
   ------------------------------------------------------------ */

// Per congelare in profondita' serve ricorrere su tutte le proprieta'.
function deepFreeze(obj) {
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return Object.freeze(obj);
}

const turno = deepFreeze({
  sigla: 'P4',
  pausa: { inizio: '12:00', durata: 60 },
});
turno.pausa.durata = 30;          // bloccato anche in profondita'
console.log(turno.pausa.durata);  // => 60
console.log(Object.isFrozen(turno.pausa)); // => true


/* ------------------------------------------------------------
   4) Cugini di freeze: seal e preventExtensions
   ------------------------------------------------------------ */

// seal: non puoi aggiungere/rimuovere chiavi, ma puoi MODIFICARLE.
const sealed = Object.seal({ taglia: 'L', quantita: 10 });
sealed.quantita = 8;       // permesso
delete sealed.taglia;      // ignorato
sealed.nuova = 1;          // ignorato
console.log(sealed);       // => { taglia: 'L', quantita: 8 }

// preventExtensions: blocca solo l'aggiunta di nuove chiavi.
const ext = Object.preventExtensions({ a: 1 });
ext.a = 2;   // permesso
ext.b = 3;   // ignorato
console.log(ext); // => { a: 2 }


/* ------------------------------------------------------------
   5) structuredClone: deep clone nativo (ES2022)
   ------------------------------------------------------------ */

// structuredClone crea una copia profonda indipendente.
const originale = {
  dipendente: { nome: 'Anna', cognome: 'Rossi' },
  vestiario: [{ taglia: 'M', quantita: 3 }],
  assunto: new Date('2026-01-15'),
};
const copia = structuredClone(originale);
copia.dipendente.nome = 'Luca';
copia.vestiario[0].quantita = 99;

console.log(originale.dipendente.nome);   // => Anna  (intatto)
console.log(originale.vestiario[0].quantita); // => 3
console.log(copia.assunto instanceof Date);   // => true (Date preservata)

// Vantaggio su JSON.parse(JSON.stringify(...)): preserva Date, Map, Set.
const conMap = { ruoli: new Map([['UP', 'Ufficio Produzione']]) };
const clonata = structuredClone(conMap);
console.log(clonata.ruoli.get('UP')); // => Ufficio Produzione

// Limite: structuredClone NON clona funzioni -> DataCloneError.
try {
  structuredClone({ fn: () => 1 });
} catch (e) {
  console.log(e.constructor.name); // => DataCloneError
}


/* ------------------------------------------------------------
   6) Immutable update pattern: OGGETTI con spread
   ------------------------------------------------------------ */

// Aggiornare un oggetto creando una nuova reference (stile Redux reducer).
const stato = { loading: false, error: null, dati: [] };
const nuovoStato = { ...stato, loading: true };
console.log(stato.loading);     // => false (vecchio intatto)
console.log(nuovoStato.loading); // => true
console.log(stato === nuovoStato); // => false (nuova reference)

// Merge di default + impostazioni utente (pattern config ERP).
const DEFAULT = { regolaArrotondamento: 'nessuna', take: 1000 };
function risolviConfig(impostazioni = {}) {
  return { ...DEFAULT, ...impostazioni };
}
console.log(risolviConfig({ take: 50 }));
// => { regolaArrotondamento: 'nessuna', take: 50 }


/* ------------------------------------------------------------
   7) Update di oggetti ANNIDATI (nested) immutabili
   ------------------------------------------------------------ */

// Ogni livello toccato va ricreato; i fratelli restano condivisi.
const record = {
  id: 1,
  dipendente: { nome: 'Mario', reparto: { sigla: 'UP', piano: 1 } },
  oreLavorate: 7,
};

const aggiornato = {
  ...record,
  dipendente: {
    ...record.dipendente,
    reparto: { ...record.dipendente.reparto, piano: 2 },
  },
};
console.log(record.dipendente.reparto.piano);    // => 1
console.log(aggiornato.dipendente.reparto.piano); // => 2

// Helper generico per update di un path a 2 livelli.
function updateIn(obj, k1, k2, value) {
  return { ...obj, [k1]: { ...obj[k1], [k2]: value } };
}
console.log(updateIn(record, 'dipendente', 'nome', 'Anna').dipendente.nome);
// => Anna


/* ------------------------------------------------------------
   8) Immutable update pattern: ARRAY
   ------------------------------------------------------------ */

const timbrature = [
  { id: 1, badge: 'UP-001', ore: 8 },
  { id: 2, badge: 'UP-002', ore: 6 },
  { id: 3, badge: 'UP-003', ore: 7 },
];

// ADD: nuovo array con spread (non push).
const conNuova = [...timbrature, { id: 4, badge: 'UP-004', ore: 5 }];
console.log(conNuova.length, timbrature.length); // => 4 3

// REMOVE: filter (non splice).
const senzaId2 = timbrature.filter((t) => t.id !== 2);
console.log(senzaId2.map((t) => t.id)); // => [ 1, 3 ]

// UPDATE: map che ricrea solo l'elemento target.
const piuOre = timbrature.map((t) =>
  t.id === 1 ? { ...t, ore: t.ore + 1 } : t
);
console.log(timbrature[0].ore, piuOre[0].ore); // => 8 9

// INSERT in posizione i (slice + spread).
function insertAt(arr, i, item) {
  return [...arr.slice(0, i), item, ...arr.slice(i)];
}
console.log(insertAt([1, 2, 4], 2, 3)); // => [ 1, 2, 3, 4 ]


/* ------------------------------------------------------------
   9) Metodi array immutabili moderni (ES2023)
   ------------------------------------------------------------ */

// toSorted/toReversed/with/toSpliced NON mutano l'originale.
const ore = [8, 6, 7];
const ordinate = ore.toSorted((a, b) => a - b);
console.log(ore, ordinate); // => [ 8, 6, 7 ] [ 6, 7, 8 ]

// with(i, val): copia con un elemento sostituito.
const corrette = ore.with(1, 9);
console.log(ore, corrette); // => [ 8, 6, 7 ] [ 8, 9, 7 ]

const inverse = ore.toReversed();
console.log(inverse); // => [ 7, 6, 8 ]


/* ------------------------------------------------------------
   10) Reducer stile Redux (caso ERP completo)
   ------------------------------------------------------------ */

// Lo state e' immutabile: ogni action restituisce un nuovo state.
const initialState = { dipendenti: [], filtroReparto: null, loading: false };

function dipendentiReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, dipendenti: action.payload };
    case 'SET_REPARTO':
      return { ...state, filtroReparto: action.reparto };
    case 'INCREMENTA_ORE':
      return {
        ...state,
        dipendenti: state.dipendenti.map((d) =>
          d.id === action.id ? { ...d, ore: (d.ore ?? 0) + action.delta } : d
        ),
      };
    default:
      return state;
  }
}

let s = dipendentiReducer(undefined, { type: 'FETCH_START' });
s = dipendentiReducer(s, {
  type: 'FETCH_SUCCESS',
  payload: [{ id: 1, nome: 'Mario', ore: 7 }],
});
s = dipendentiReducer(s, { type: 'INCREMENTA_ORE', id: 1, delta: 1 });
console.log(s.dipendenti[0].ore); // => 8
console.log(s.loading);           // => false


/* ------------------------------------------------------------
   11) Update state in stile React (setState funzionale)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node (qui simuliamo setState).
function makeSetState(initial) {
  let value = initial;
  return {
    get: () => value,
    set: (updater) => {
      value = typeof updater === 'function' ? updater(value) : updater;
    },
  };
}

const lista = makeSetState([{ id: 1, taglia: 'M', quantita: 3 }]);
// Pattern React: setLista(prev => prev.map(...)) mai mutando prev.
lista.set((prev) =>
  prev.map((v) => (v.id === 1 ? { ...v, quantita: v.quantita - 1 } : v))
);
console.log(lista.get()); // => [ { id: 1, taglia: 'M', quantita: 2 } ]


/* ------------------------------------------------------------
   12) Freeze come "guardia" in sviluppo
   ------------------------------------------------------------ */

// Congelare lo state iniziale aiuta a scoprire mutazioni accidentali.
function safeState(obj) {
  return process.env.NODE_ENV === 'production' ? obj : deepFreeze(obj);
}
const guard = safeState({ contatori: { totale: 0 } });
console.log(Object.isFrozen(guard)); // => true (in dev)


/* ------------------------------------------------------------
   13) Copia "immutabile" di una collezione di vestiario
   ------------------------------------------------------------ */

// Decrementa la scorta di un articolo restituendo SEMPRE un nuovo array.
function consumaScorta(magazzino, taglia, qta) {
  return magazzino.map((art) =>
    art.taglia === taglia
      ? { ...art, quantita: Math.max(0, art.quantita - qta) }
      : art
  );
}
const magazzino = [
  { taglia: 'M', quantita: 5, scortaMinima: 2 },
  { taglia: 'L', quantita: 1, scortaMinima: 2 },
];
const dopo = consumaScorta(magazzino, 'M', 3);
console.log(magazzino[0].quantita, dopo[0].quantita); // => 5 2

// Derivare dati senza mutare: articoli sotto scorta.
const sottoScorta = dopo.filter((a) => a.quantita < a.scortaMinima);
console.log(sottoScorta.map((a) => a.taglia)); // => [ 'L' ]


/* ------------------------------------------------------------
   14) Immutabilita' e confronto efficiente (referential equality)
   ------------------------------------------------------------ */

// Se nulla cambia, riusare la stessa reference evita re-render inutili.
function setFiltro(state, reparto) {
  if (state.filtroReparto === reparto) return state; // stessa reference
  return { ...state, filtroReparto: reparto };
}
const st1 = { filtroReparto: 'UP' };
console.log(setFiltro(st1, 'UP') === st1);  // => true  (nessun cambiamento)
console.log(setFiltro(st1, 'XX') === st1);  // => false (nuovo state)


/* ============================================================
   RIEPILOGO COMANDI
   - Object.freeze(obj)            -> congela (shallow)
   - Object.isFrozen(obj)          -> verifica freeze
   - Object.seal(obj)              -> no add/remove, si modifica
   - Object.preventExtensions(obj) -> no add
   - deepFreeze (ricorsivo)        -> freeze profondo custom
   - structuredClone(obj)          -> deep clone nativo (ES2022)
   - {...obj, chiave: val}         -> update immutabile oggetto
   - [...arr, item]                -> add immutabile array
   - arr.filter(...)               -> remove immutabile
   - arr.map(x => ...)             -> update immutabile
   - slice + spread                -> insert in posizione
   - arr.toSorted/toReversed       -> sort/reverse non mutanti
   - arr.with(i, val)              -> sostituzione non mutante
   - arr.toSpliced(...)            -> splice non mutante
   - reducer (switch + spread)     -> pattern Redux state update
   - setState(prev => ...)         -> update funzionale React
   - referential equality (===)    -> confronto per reference
   ============================================================ */
