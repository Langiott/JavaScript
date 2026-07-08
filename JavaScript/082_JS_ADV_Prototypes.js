/* ============================================================
   82 JS ADV Prototypes
   In JavaScript l'ereditarieta non si basa su classi "vere" ma su
   oggetti collegati tra loro tramite il prototype. Ogni oggetto ha
   un riferimento interno [[Prototype]] (leggibile con __proto__) che
   punta a un altro oggetto da cui eredita proprieta e metodi: questa
   catena si chiama prototype chain. Le funzioni costruttore hanno una
   proprieta `prototype` che diventa il [[Prototype]] delle istanze.
   Qui vediamo: __proto__ vs prototype, Object.create, ereditarieta
   classica con costruttori, le class come zucchero sintattico.
   ============================================================ */

'use strict';

// ------------------------------------------------------------
// 1) Ogni oggetto ha un [[Prototype]]: la catena dei prototipi
// ------------------------------------------------------------

// Un oggetto literal eredita da Object.prototype
const vuoto = {};
console.log(Object.getPrototypeOf(vuoto) === Object.prototype); // => true
console.log(vuoto.__proto__ === Object.prototype);              // => true

// Metodi come toString/hasOwnProperty NON sono sull'oggetto:
// vengono trovati risalendo la prototype chain fino a Object.prototype
console.log(vuoto.hasOwnProperty('x')); // => false
console.log(typeof vuoto.toString);     // => 'function'

// In cima alla catena c'e null (Object.prototype non ha prototipo)
console.log(Object.getPrototypeOf(Object.prototype)); // => null

// ------------------------------------------------------------
// 2) __proto__ (istanza) vs prototype (costruttore)
// ------------------------------------------------------------

// `prototype` esiste sulle FUNZIONI costruttore.
// `__proto__` (cioe [[Prototype]]) esiste su ogni OGGETTO/istanza.
function Dipendente(nome) {
  this.nome = nome;
}
Dipendente.prototype.saluta = function () {
  return `Ciao, sono ${this.nome}`;
};

const d1 = new Dipendente('Anna');
console.log(d1.__proto__ === Dipendente.prototype);            // => true
console.log(Object.getPrototypeOf(d1) === Dipendente.prototype); // => true
console.log(d1.saluta()); // => 'Ciao, sono Anna'

// La proprieta `constructor` punta indietro alla funzione costruttore
console.log(d1.constructor === Dipendente); // => true

// ------------------------------------------------------------
// 3) Proprietà proprie (own) vs ereditate
// ------------------------------------------------------------

console.log(d1.hasOwnProperty('nome'));   // => true  (su istanza)
console.log(d1.hasOwnProperty('saluta')); // => false (sul prototype)
console.log('saluta' in d1);              // => true  ('in' guarda la catena)

// Object.keys elenca SOLO le own enumerable
console.log(Object.keys(d1)); // => [ 'nome' ]

// ------------------------------------------------------------
// 4) Shadowing: l'istanza "copre" il metodo del prototype
// ------------------------------------------------------------

const d2 = new Dipendente('Bruno');
d2.saluta = function () {
  return `[override] ${this.nome}`;
};
console.log(d2.saluta()); // => '[override] Bruno' (own vince sul prototype)
console.log(d1.saluta()); // => 'Ciao, sono Anna'  (d1 non e toccato)

// ------------------------------------------------------------
// 5) Object.create: creare un oggetto con un prototipo scelto
// ------------------------------------------------------------

// Object.create(proto) costruisce un nuovo oggetto il cui
// [[Prototype]] e esattamente `proto`. Niente costruttore.
const baseTimbratura = {
  durata() {
    return this.uscita - this.ingresso; // minuti
  },
};
const t = Object.create(baseTimbratura);
t.ingresso = 540; // 09:00 in minuti
t.uscita = 1080;  // 18:00 in minuti
console.log(t.durata()); // => 540
console.log(Object.getPrototypeOf(t) === baseTimbratura); // => true

// Object.create(null): oggetto SENZA prototipo (dictionary puro,
// utile per mappe senza ereditare toString/hasOwnProperty)
const mappaBadge = Object.create(null);
mappaBadge['UP-001'] = 'Anna';
console.log(mappaBadge['UP-001']);          // => 'Anna'
console.log(mappaBadge.toString);            // => undefined (nessuna catena)

// Object.create con property descriptors (secondo argomento)
const reparto = Object.create(baseTimbratura, {
  sigla: { value: 'UP', enumerable: true, writable: false },
});
console.log(reparto.sigla); // => 'UP'

// ------------------------------------------------------------
// 6) Condivisione di metodi: efficienza del prototype
// ------------------------------------------------------------

// Mettere i metodi sul prototype significa UNA sola funzione in
// memoria condivisa da tutte le istanze (non una per oggetto).
function Articolo(codice, scortaMinima) {
  this.codice = codice;
  this.scortaMinima = scortaMinima;
  this.quantita = 0;
}
Articolo.prototype.sottoScorta = function () {
  return this.quantita < this.scortaMinima;
};
const a1 = new Articolo('DPI-01', 10);
const a2 = new Articolo('DPI-02', 5);
console.log(a1.sottoScorta === a2.sottoScorta); // => true (stessa funzione)
a1.quantita = 3;
console.log(a1.sottoScorta()); // => true

// ------------------------------------------------------------
// 7) Ereditarietà classica con funzioni costruttore (pre-ES6)
// ------------------------------------------------------------

// Pattern storico: figlio chiama il costruttore padre con .call(this)
// e collega i prototipi con Object.create.
function Persona(nome, cognome) {
  this.nome = nome;
  this.cognome = cognome;
}
Persona.prototype.nomeCompleto = function () {
  return `${this.nome} ${this.cognome}`;
};

function Operaio(nome, cognome, reparto) {
  Persona.call(this, nome, cognome); // eredita le proprieta proprie
  this.reparto = reparto;
}
// 1) collega la catena: Operaio.prototype eredita da Persona.prototype
Operaio.prototype = Object.create(Persona.prototype);
// 2) ripristina il constructor (perso al passo precedente)
Operaio.prototype.constructor = Operaio;
// 3) aggiungi/override metodi specifici del figlio
Operaio.prototype.badge = function () {
  return `${this.reparto}-${this.nomeCompleto()}`;
};

const op = new Operaio('Carla', 'Verdi', 'UP');
console.log(op.nomeCompleto()); // => 'Carla Verdi' (ereditato da Persona)
console.log(op.badge());        // => 'UP-Carla Verdi'
console.log(op instanceof Operaio); // => true
console.log(op instanceof Persona); // => true (catena risalita da instanceof)

// ------------------------------------------------------------
// 8) class come zucchero sintattico sul prototype
// ------------------------------------------------------------

// Le `class` ES6 producono ESATTAMENTE lo stesso meccanismo prototype.
class Turno {
  constructor(sigla, conPausa) {
    this.sigla = sigla;
    this.conPausa = conPausa;
  }
  descrizione() {
    return `${this.sigla}${this.conPausa ? ' (con pausa)' : ''}`;
  }
}
class TurnoNotturno extends Turno {
  constructor(sigla) {
    super(sigla, false); // chiama il costruttore padre
    this.maggiorazione = 0.25;
  }
  descrizione() {
    return `${super.descrizione()} +${this.maggiorazione * 100}%`;
  }
}
const tn = new TurnoNotturno('P4');
console.log(tn.descrizione()); // => 'P4 +25%'
// I metodi della class stanno sul prototype, proprio come prima:
console.log(typeof Turno.prototype.descrizione);            // => 'function'
console.log(Object.getPrototypeOf(TurnoNotturno.prototype) === Turno.prototype); // => true

// ------------------------------------------------------------
// 9) Object.setPrototypeOf e Object.getPrototypeOf
// ------------------------------------------------------------

// setPrototypeOf cambia la catena a runtime (lento: usare con cautela)
const protoSaluto = { hello() { return 'hi'; } };
const obj = { x: 1 };
Object.setPrototypeOf(obj, protoSaluto);
console.log(obj.hello()); // => 'hi'
console.log(Object.getPrototypeOf(obj) === protoSaluto); // => true

// ------------------------------------------------------------
// 10) Override di metodi nativi sul prototype (con cautela)
// ------------------------------------------------------------

// Esempio: personalizzare toString per un log leggibile.
function Vestiario(nome, taglia) {
  this.nome = nome;
  this.taglia = taglia;
}
Vestiario.prototype.toString = function () {
  return `${this.nome} [${this.taglia}]`;
};
const giacca = new Vestiario('Giacca', 'L');
console.log(`${giacca}`); // => 'Giacca [L]' (toString invocato dal template)

// ------------------------------------------------------------
// 11) Mixin: comporre comportamenti su un prototype
// ------------------------------------------------------------

// Un mixin e un oggetto di metodi copiati in un prototype con
// Object.assign: utile per "ereditarieta multipla" leggera.
const Esportabile = {
  toDTO() {
    return { codice: this.codice, qta: this.quantita };
  },
};
const Loggabile = {
  log() {
    return `LOG: ${this.codice}`;
  },
};
function Magazzino(codice, quantita) {
  this.codice = codice;
  this.quantita = quantita;
}
Object.assign(Magazzino.prototype, Esportabile, Loggabile);
const m = new Magazzino('ART-9', 42);
console.log(m.toDTO()); // => { codice: 'ART-9', qta: 42 }
console.log(m.log());   // => 'LOG: ART-9'

// ------------------------------------------------------------
// 12) Property descriptors lungo la catena
// ------------------------------------------------------------

// getOwnPropertyDescriptor ispeziona una own property
const desc = Object.getOwnPropertyDescriptor(m, 'codice');
console.log(desc.writable, desc.enumerable); // => true true

// getter sul prototype: calcolato ad ogni accesso
function Stipendio(base) {
  this.base = base;
}
Object.defineProperty(Stipendio.prototype, 'netto', {
  get() {
    return Math.round(this.base * 0.72);
  },
});
const s = new Stipendio(2000);
console.log(s.netto); // => 1440

// ------------------------------------------------------------
// 13) Caso ERP: factory con Object.create + naive-UTC
// ------------------------------------------------------------

// Pattern factory: prototipo condiviso + stato per istanza.
// L'orario di Roma viene letto e salvato come naive-UTC (pattern ERP).
const protoBadge = {
  formatta() {
    const hh = String(this.ore).padStart(2, '0');
    const mm = String(this.minuti).padStart(2, '0');
    return `${this.codice} -> ${hh}:${mm}`;
  },
};
function creaTimbratura(codice, ore, minuti) {
  const obj = Object.create(protoBadge);
  obj.codice = codice;
  obj.ore = ore;
  obj.minuti = minuti;
  return obj;
}
const tb = creaTimbratura('UP-001', 9, 5);
console.log(tb.formatta()); // => 'UP-001 -> 09:05'
console.log(Object.getPrototypeOf(tb) === protoBadge); // => true

// ------------------------------------------------------------
// 14) instanceof, isPrototypeOf e controllo della catena
// ------------------------------------------------------------

console.log(protoBadge.isPrototypeOf(tb));   // => true
console.log(Array.prototype.isPrototypeOf([])); // => true
// instanceof cerca il prototype del costruttore lungo la catena:
console.log([] instanceof Array);  // => true
console.log([] instanceof Object); // => true (Array eredita da Object)

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   - obj.__proto__ / [[Prototype]]   riferimento al prototipo dell'oggetto
   - Funzione.prototype               oggetto usato come proto delle istanze
   - Object.getPrototypeOf(obj)       legge il prototipo (preferito a __proto__)
   - Object.setPrototypeOf(obj,proto) cambia il prototipo a runtime (lento)
   - Object.create(proto[,descr])     crea oggetto con proto scelto
   - Object.create(null)              oggetto senza prototipo (mappa pura)
   - new Costruttore()                istanzia, collega __proto__ a .prototype
   - Costruttore.call(this, ...)      chiama il costruttore padre (super manuale)
   - obj.hasOwnProperty(k)            true se own property (no catena)
   - 'k' in obj                       true anche se ereditata (catena)
   - Object.keys(obj)                 own enumerable keys
   - Object.assign(proto, mixin...)   compone mixin nel prototype
   - Object.defineProperty(o,k,desc)  definisce getter/setter o descrittori
   - Object.getOwnPropertyDescriptor  ispeziona un descrittore
   - class / extends / super          zucchero sintattico sul prototype
   - x instanceof C                   controlla C.prototype lungo la catena
   - proto.isPrototypeOf(obj)         true se proto e nella catena di obj
   ============================================================ */
