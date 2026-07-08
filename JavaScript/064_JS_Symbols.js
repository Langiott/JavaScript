/* ============================================================
   64 JS Symbols
   Il tipo primitivo Symbol (ES2015) rappresenta un valore
   UNICO e immutabile, spesso usato come chiave di proprieta'
   per evitare collisioni di nomi. Ogni Symbol() creato e'
   diverso da ogni altro, anche con la stessa descrizione.
   Esistono i "well-known symbols" (Symbol.iterator,
   Symbol.toPrimitive, ecc.) che permettono di personalizzare
   il comportamento interno degli oggetti, e il registro globale
   Symbol.for / Symbol.keyFor per condividere Symbol tra moduli.
   I Symbol come chiavi NON sono enumerabili nei cicli classici.
   ============================================================ */

// ------------------------------------------------------------
// 1) CREARE UN SYMBOL: unicita' garantita
// ------------------------------------------------------------

// Symbol() crea sempre un valore nuovo e irripetibile.
const s1 = Symbol();
const s2 = Symbol();
console.log(s1 === s2); // => false

// La descrizione e' solo un'etichetta per il debug, non l'identita'.
const a = Symbol('badge');
const b = Symbol('badge');
console.log(a === b); // => false (stessa descrizione, Symbol diversi)

// typeof restituisce "symbol".
console.log(typeof a); // => symbol

// La proprieta' .description legge l'etichetta (sola lettura).
console.log(a.description); // => badge

// toString() per stampa esplicita (non si concatenano direttamente).
console.log(a.toString()); // => Symbol(badge)


// ------------------------------------------------------------
// 2) ATTENZIONE: i Symbol non si convertono implicitamente
// ------------------------------------------------------------

// Concatenare un Symbol in una stringa lancia un TypeError.
try {
  const x = 'codice: ' + Symbol('UP-001'); // errore!
} catch (e) {
  console.log(e.constructor.name); // => TypeError
}

// Conversione esplicita consentita.
console.log(String(Symbol('UP-001'))); // => Symbol(UP-001)


// ------------------------------------------------------------
// 3) SYMBOL COME CHIAVE DI PROPRIETA'
// ------------------------------------------------------------

// Usare un Symbol come chiave evita collisioni con chiavi stringa.
const ID = Symbol('id');
const dipendente = {
  nome: 'Mario',
  cognome: 'Rossi',
  [ID]: 1024, // chiave computata di tipo Symbol
};
console.log(dipendente[ID]); // => 1024
console.log(dipendente.nome); // => Mario

// La chiave Symbol non compare nei normali elenchi di chiavi.
console.log(Object.keys(dipendente)); // => [ 'nome', 'cognome' ]


// ------------------------------------------------------------
// 4) NON ENUMERABILITA' (di fatto) DEI SYMBOL
// ------------------------------------------------------------

// I Symbol sono saltati da for...in, Object.keys, JSON.stringify.
const META = Symbol('meta');
const reparto = { sigla: 'UP', [META]: { interno: true } };

for (const k in reparto) {
  console.log(k); // => sigla   (META non appare)
}

console.log(JSON.stringify(reparto)); // => {"sigla":"UP"}

// Per LEGGERE le chiavi Symbol servono API dedicate.
console.log(Object.getOwnPropertySymbols(reparto)); // => [ Symbol(meta) ]

// Reflect.ownKeys raccoglie sia stringhe sia Symbol.
console.log(Reflect.ownKeys(reparto)); // => [ 'sigla', Symbol(meta) ]


// ------------------------------------------------------------
// 5) USO TIPICO: metadati "nascosti" su un oggetto di dominio
// ------------------------------------------------------------

// Pattern ERP: agganciare informazioni tecniche a un record senza
// inquinare il DTO che verra' serializzato e inviato al client.
const CACHE_TS = Symbol('cacheTimestamp');

function creaTimbratura(badge, oreLavorate) {
  const record = { badge, oreLavorate };
  record[CACHE_TS] = Date.now(); // metadato interno, non serializzato
  return record;
}

const t = creaTimbratura('UP-001', 8);
console.log(JSON.stringify(t)); // => {"badge":"UP-001","oreLavorate":8}
console.log(typeof t[CACHE_TS]); // => number


// ------------------------------------------------------------
// 6) SYMBOL.FOR: il registro globale (Symbol condivisi)
// ------------------------------------------------------------

// Symbol.for(key) cerca nel registro globale: se la key esiste
// ritorna lo STESSO Symbol, altrimenti lo crea.
const g1 = Symbol.for('app.tenant');
const g2 = Symbol.for('app.tenant');
console.log(g1 === g2); // => true (a differenza di Symbol())

// Symbol.keyFor recupera la chiave di un Symbol del registro globale.
console.log(Symbol.keyFor(g1)); // => app.tenant

// I Symbol NON globali non hanno chiave nel registro.
const locale = Symbol('locale');
console.log(Symbol.keyFor(locale)); // => undefined

// Utile per condividere uno stesso Symbol tra moduli diversi
// senza importarlo: basta concordare la stringa-chiave.
const VERSIONE = Symbol.for('erp.schemaVersion');
const config = { [VERSIONE]: '2026.06' };
console.log(config[Symbol.for('erp.schemaVersion')]); // => 2026.06


// ------------------------------------------------------------
// 7) SYMBOL COME COSTANTI/ENUM SICURE
// ------------------------------------------------------------

// I Symbol fanno ottimi valori di enum: impossibili da confondere
// o da ricreare per sbaglio, a differenza di stringhe magiche.
const Turno = {
  P4: Symbol('P4'), // con pausa
  P2: Symbol('P2'), // senza pausa
};

function haPausa(turno) {
  return turno === Turno.P4;
}
console.log(haPausa(Turno.P4)); // => true
console.log(haPausa(Turno.P2)); // => false
// Nessun rischio: 'P4' (stringa) non coincide mai con Turno.P4.
console.log(haPausa('P4')); // => false


// ------------------------------------------------------------
// 8) WELL-KNOWN SYMBOL: Symbol.iterator
// ------------------------------------------------------------

// Definire Symbol.iterator rende un oggetto iterabile con for...of.
const listaBadge = {
  valori: ['UP-001', 'UP-002', 'UP-003'],
  [Symbol.iterator]() {
    let i = 0;
    const v = this.valori;
    return {
      next() {
        return i < v.length
          ? { value: v[i++], done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

for (const badge of listaBadge) {
  console.log(badge); // => UP-001 ... UP-002 ... UP-003
}
console.log([...listaBadge]); // => [ 'UP-001', 'UP-002', 'UP-003' ]


// ------------------------------------------------------------
// 9) WELL-KNOWN SYMBOL: Symbol.toPrimitive
// ------------------------------------------------------------

// Personalizza la conversione dell'oggetto a primitivo.
const oreMese = {
  totaleMinuti: 9870,
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.totaleMinuti; // 9870
    if (hint === 'string') return `${Math.round(this.totaleMinuti / 60)}h`;
    return this.totaleMinuti; // hint 'default'
  },
};

console.log(+oreMese); // => 9870  (hint number)
console.log(`${oreMese}`); // => 165h (hint string)
console.log(oreMese + 30); // => 9900 (hint default)


// ------------------------------------------------------------
// 10) WELL-KNOWN SYMBOL: Symbol.toStringTag
// ------------------------------------------------------------

// Personalizza l'output di Object.prototype.toString.call(obj).
class Dipendente {
  constructor(nome) {
    this.nome = nome;
  }
  get [Symbol.toStringTag]() {
    return 'Dipendente';
  }
}
const d = new Dipendente('Anna');
console.log(Object.prototype.toString.call(d)); // => [object Dipendente]


// ------------------------------------------------------------
// 11) WELL-KNOWN SYMBOL: Symbol.hasInstance
// ------------------------------------------------------------

// Personalizza il comportamento dell'operatore instanceof.
class BadgeValido {
  static [Symbol.hasInstance](valore) {
    return typeof valore === 'string' && /^UP-\d{3}$/.test(valore);
  }
}
console.log('UP-042' instanceof BadgeValido); // => true
console.log('XX-9' instanceof BadgeValido); // => false


// ------------------------------------------------------------
// 12) WELL-KNOWN SYMBOL: Symbol.asyncIterator
// ------------------------------------------------------------

// Rende un oggetto iterabile con for await...of (stream asincroni).
const pagineQuery = {
  async *[Symbol.asyncIterator]() {
    for (let pagina = 1; pagina <= 3; pagina++) {
      // simula una query Prisma paginata (take/skip)
      await new Promise((r) => setTimeout(r, 0));
      yield { pagina, righe: pagina * 100 };
    }
  },
};

async function scorri() {
  for await (const p of pagineQuery) {
    console.log(`pagina ${p.pagina}: ${p.righe} righe`);
    // => pagina 1: 100 righe ... pagina 2: 200 righe ... pagina 3: 300 righe
  }
}
scorri();


// ------------------------------------------------------------
// 13) ELENCARE I WELL-KNOWN SYMBOL
// ------------------------------------------------------------

// Sono proprieta' statiche di Symbol, condivise globalmente.
console.log(typeof Symbol.iterator); // => symbol
console.log(Symbol.iterator === Symbol.iterator); // => true
console.log(Symbol.for('Symbol.iterator') === Symbol.iterator); // => false
// (i well-known NON stanno nel registro Symbol.for)


// ------------------------------------------------------------
// 14) PROPRIETA' NON ENUMERABILI (anche senza Symbol)
// ------------------------------------------------------------

// Si possono creare proprieta' nascoste con defineProperty.
const articolo = { cdAr: 'DPI-12', descrizione: 'Guanti' };
Object.defineProperty(articolo, '_versioneRiga', {
  value: 7,
  enumerable: false, // non appare in Object.keys / for...in
  writable: true,
});
console.log(Object.keys(articolo)); // => [ 'cdAr', 'descrizione' ]
console.log(articolo._versioneRiga); // => 7

// getOwnPropertyNames mostra anche le non-enumerabili (stringhe).
console.log(Object.getOwnPropertyNames(articolo));
// => [ 'cdAr', 'descrizione', '_versioneRiga' ]

// propertyIsEnumerable verifica la enumerabilita' di una chiave.
console.log(articolo.propertyIsEnumerable('cdAr')); // => true
console.log(articolo.propertyIsEnumerable('_versioneRiga')); // => false


// ------------------------------------------------------------
// 15) ESEMPIO PRATICO ERP: chiave Symbol per stato di validazione
// ------------------------------------------------------------

// Allego lo stato di validazione di una timbratura come Symbol,
// cosi' resta fuori dal DTO inviato al frontend ma resta accessibile
// internamente durante il calcolo delle ore.
const VALIDAZIONE = Symbol.for('erp.validazione');

const timbrature = [
  { badge: 'UP-001', ingresso: '08:00', uscita: '17:00' },
  { badge: 'UP-002', ingresso: '09:00', uscita: '' },
];

function valida(t) {
  const ok = /^\d{2}:\d{2}$/.test(t.ingresso) && /^\d{2}:\d{2}$/.test(t.uscita);
  t[VALIDAZIONE] = ok ? 'valida' : 'incompleta';
  return t;
}

timbrature.forEach(valida);
console.log(timbrature[0][VALIDAZIONE]); // => valida
console.log(timbrature[1][VALIDAZIONE]); // => incompleta
// Il DTO serializzato resta pulito:
console.log(JSON.stringify(timbrature[0]));
// => {"badge":"UP-001","ingresso":"08:00","uscita":"17:00"}


// ------------------------------------------------------------
// 16) COPIA DEGLI OGGETTI E SYMBOL
// ------------------------------------------------------------

// Object.assign e lo spread COPIANO anche le chiavi Symbol enumerabili.
const SRC = Symbol('src');
const origine = { a: 1, [SRC]: 'interno' };
const copia = { ...origine };
console.log(copia[SRC]); // => interno  (lo spread porta i Symbol)

// JSON.parse(JSON.stringify(...)) invece le PERDE (non serializzabili).
const clone = JSON.parse(JSON.stringify(origine));
console.log(clone[SRC]); // => undefined


/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   Symbol('desc')                  -> crea Symbol unico
   symbol.description              -> etichetta (sola lettura)
   typeof sym                      -> 'symbol'
   String(sym) / sym.toString()    -> conversione esplicita
   obj[sym] / { [sym]: v }         -> chiave Symbol computata
   Symbol.for('key')               -> registro globale (condiviso)
   Symbol.keyFor(sym)              -> chiave di un Symbol globale
   Object.getOwnPropertySymbols()  -> elenca chiavi Symbol
   Reflect.ownKeys(obj)            -> stringhe + Symbol
   Object.getOwnPropertyNames()    -> stringhe (anche non enumerabili)
   Object.keys() / for...in        -> ignorano i Symbol
   JSON.stringify                  -> ignora i Symbol
   Object.defineProperty(enumerable:false) -> proprieta' nascosta
   obj.propertyIsEnumerable(k)     -> test enumerabilita'
   Symbol.iterator                 -> rende iterabile (for...of, spread)
   Symbol.asyncIterator            -> rende iterabile async (for await)
   Symbol.toPrimitive              -> conversione a primitivo
   Symbol.toStringTag              -> tag in Object.prototype.toString
   Symbol.hasInstance              -> personalizza instanceof
   ============================================================ */
