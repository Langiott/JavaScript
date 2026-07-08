/* ============================================================
   83 JS ADV Classes
   Le class in JavaScript sono "syntactic sugar" sopra il modello
   a prototype: constructor, methods, getter/setter, membri static,
   instance fields (anche #private) e inheritance con extends/super.
   In questo file partiamo dalle basi e arriviamo a pattern reali
   usati in un gestionale ERP (dipendenti, timbrature, badge, turni).
   Codice eseguibile con Node.js (ES2020+), senza librerie esterne.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) CLASS BASE: constructor e instance fields
   Il constructor viene chiamato con `new` e inizializza lo stato.
   ------------------------------------------------------------ */

// Definizione minima: un dipendente con nome e cognome.
class DipendenteBase {
  constructor(nome, cognome) {
    this.nome = nome;       // instance field assegnato nel constructor
    this.cognome = cognome;
  }
}

const d0 = new DipendenteBase('Mario', 'Rossi');
console.log(d0.nome, d0.cognome); // => Mario Rossi
console.log(d0 instanceof DipendenteBase); // => true

/* ------------------------------------------------------------
   2) METHODS (instance methods)
   Vivono sul prototype: condivisi da tutte le istanze.
   ------------------------------------------------------------ */

class Dipendente {
  constructor(nome, cognome, codiceBadge) {
    this.nome = nome;
    this.cognome = cognome;
    this.codiceBadge = codiceBadge; // es: 'UP-001'
  }

  // method: template literal per il nome completo
  nomeCompleto() {
    return `${this.nome} ${this.cognome}`;
  }

  // method che usa un altro method (this risolve a runtime)
  etichetta() {
    return `[${this.codiceBadge}] ${this.nomeCompleto()}`;
  }
}

const d1 = new Dipendente('Anna', 'Bianchi', 'UP-002');
console.log(d1.nomeCompleto()); // => Anna Bianchi
console.log(d1.etichetta());    // => [UP-002] Anna Bianchi
// I methods stanno sul prototype, non sull'istanza:
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(d1)));
// => [ 'constructor', 'nomeCompleto', 'etichetta' ]

/* ------------------------------------------------------------
   3) CAMPI DI ISTANZA (class fields) con valore di default
   Dichiarati nel corpo della class, fuori dal constructor.
   ------------------------------------------------------------ */

class Reparto {
  sigla = 'XX';          // instance field con default
  attivo = true;         // default booleano
  dipendenti = [];       // ATTENZIONE: ogni istanza ha il SUO array

  constructor(sigla) {
    if (sigla) this.sigla = sigla.toUpperCase().slice(0, 2);
  }

  aggiungi(dip) {
    this.dipendenti.push(dip);
    return this; // ritorno this -> method chaining
  }
}

const rep = new Reparto('produzione').aggiungi(d1).aggiungi(d0);
console.log(rep.sigla, rep.dipendenti.length); // => PR 2

/* ------------------------------------------------------------
   4) GETTER e SETTER
   Property "calcolate": si usano senza parentesi (sembrano campi).
   ------------------------------------------------------------ */

class Timbratura {
  constructor(ingressoMin, uscitaMin) {
    this._ingresso = ingressoMin; // minuti dalla mezzanotte
    this._uscita = uscitaMin;
  }

  // getter: oreLavorate calcolato al volo
  get oreLavorate() {
    return (this._uscita - this._ingresso) / 60;
  }

  // getter formattato "HH:MM" con padStart
  get orarioIngresso() {
    const h = String(Math.floor(this._ingresso / 60)).padStart(2, '0');
    const m = String(this._ingresso % 60).padStart(2, '0');
    return `${h}:${m}`;
  }

  // setter con validazione (regex su formato "HH:MM")
  set orarioIngresso(hhmm) {
    if (!/^\d{2}:\d{2}$/.test(hhmm)) throw new Error('Formato orario non valido');
    const [h, m] = hhmm.split(':').map(Number);
    this._ingresso = h * 60 + m;
  }
}

const t = new Timbratura(8 * 60, 17 * 60);
console.log(t.oreLavorate);      // => 9   (niente parentesi: è un getter)
console.log(t.orarioIngresso);   // => 08:00
t.orarioIngresso = '08:30';      // invoca il setter
console.log(t.orarioIngresso);   // => 08:30
console.log(t.oreLavorate);      // => 8.5

/* ------------------------------------------------------------
   5) MEMBRI STATIC: methods e fields sulla CLASS, non sull'istanza
   Utili per factory, costanti condivise, contatori.
   ------------------------------------------------------------ */

class Badge {
  static PREFISSO = 'UP';        // static field (costante condivisa)
  static #contatore = 0;         // static private field (contatore interno)

  constructor(numero) {
    this.codice = `${Badge.PREFISSO}-${String(numero).padStart(3, '0')}`;
  }

  // static method: factory che genera il prossimo badge progressivo
  static prossimo() {
    Badge.#contatore += 1;
    return new Badge(Badge.#contatore);
  }

  // static method di utilita: estrae il numero da un codice badge
  static estraiNumero(codice) {
    const m = codice.match(/-(\d+)$/);
    return m ? Number(m[1]) : null;
  }
}

console.log(Badge.PREFISSO);             // => UP   (accesso via class)
console.log(Badge.prossimo().codice);    // => UP-001
console.log(Badge.prossimo().codice);    // => UP-002
console.log(Badge.estraiNumero('UP-042')); // => 42

/* ------------------------------------------------------------
   6) CAMPI PRIVATI (#) e methods privati
   Il prefisso # rende il membro davvero privato (hard private).
   ------------------------------------------------------------ */

class ContoOre {
  #minuti = 0; // private instance field

  aggiungiTurno(min) {
    if (this.#valido(min)) this.#minuti += min;
    return this;
  }

  // private method: controllo interno non esposto
  #valido(min) {
    return Number.isFinite(min) && min > 0;
  }

  get ore() {
    return this.#minuti / 60;
  }
}

const conto = new ContoOre().aggiungiTurno(480).aggiungiTurno(-10).aggiungiTurno(120);
console.log(conto.ore); // => 10   (il turno negativo viene scartato)
// console.log(conto.#minuti); // SyntaxError: campo privato non accessibile fuori

/* ------------------------------------------------------------
   7) INHERITANCE: extends e super
   La subclass estende la base; super() chiama il constructor padre.
   ------------------------------------------------------------ */

class Persona {
  constructor(nome, cognome) {
    this.nome = nome;
    this.cognome = cognome;
  }
  saluta() {
    return `Ciao, sono ${this.nome}`;
  }
}

class Operaio extends Persona {
  constructor(nome, cognome, reparto) {
    super(nome, cognome);    // OBBLIGATORIO prima di usare this
    this.reparto = reparto;
  }

  // override del method della base, con super.metodo()
  saluta() {
    return `${super.saluta()} del reparto ${this.reparto}`;
  }
}

const op = new Operaio('Luca', 'Verdi', 'PR');
console.log(op.saluta());            // => Ciao, sono Luca del reparto PR
console.log(op instanceof Persona);  // => true (catena di prototype)

/* ------------------------------------------------------------
   8) METHOD CHAINING + BUILDER (pattern professionale)
   Ogni method ritorna this per concatenare le chiamate.
   ------------------------------------------------------------ */

class TurnoBuilder {
  #turno = { codice: '', pausa: false, fasce: [] };

  codice(c) { this.#turno.codice = c; return this; }
  conPausa(v = true) { this.#turno.pausa = v; return this; }
  fascia(inizio, fine) { this.#turno.fasce.push({ inizio, fine }); return this; }
  build() { return { ...this.#turno, fasce: [...this.#turno.fasce] }; }
}

const turnoP4 = new TurnoBuilder()
  .codice('P4')
  .conPausa()
  .fascia('08:00', '12:00')
  .fascia('13:00', '17:00')
  .build();
console.log(turnoP4.codice, turnoP4.pausa, turnoP4.fasce.length); // => P4 true 2

/* ------------------------------------------------------------
   9) STATIC FACTORY: from() per costruire da dati grezzi (DTO)
   Pattern tipico: mappare una row del DB in un'istanza.
   ------------------------------------------------------------ */

class Articolo {
  constructor(cdAr, descrizione, scortaMinima = 0) {
    this.cdAr = cdAr;
    this.descrizione = descrizione;
    this.scortaMinima = scortaMinima;
  }

  // static factory dalla row del DB (con destructuring e default)
  static fromRow(row) {
    const { articolo_poly, descrizione, scorta_minima = 0 } = row;
    return new Articolo(articolo_poly, descrizione, scorta_minima);
  }

  sottoScorta(quantita) {
    return quantita < this.scortaMinima;
  }
}

const rows = [
  { articolo_poly: 'DPI-01', descrizione: 'Guanti', scorta_minima: 50 },
  { articolo_poly: 'DPI-02', descrizione: 'Casco' },
];
const articoli = rows.map(Articolo.fromRow); // map con static method come callback
console.log(articoli[0].sottoScorta(30)); // => true
console.log(articoli[1].scortaMinima);    // => 0

/* ------------------------------------------------------------
   10) CLASS con stato calcolato + Symbol.iterator
   Rende l'istanza iterabile con for...of e spread.
   ------------------------------------------------------------ */

class RegistroPresenze {
  #lista = [];
  registra(nome) { this.#lista.push(nome); return this; }
  get totale() { return this.#lista.length; }

  // rende la class iterabile
  *[Symbol.iterator]() {
    yield* this.#lista;
  }
}

const reg = new RegistroPresenze().registra('Anna').registra('Luca');
console.log([...reg]);     // => [ 'Anna', 'Luca' ]
for (const p of reg) console.log('presente:', p); // => presente: Anna / presente: Luca
console.log(reg.totale);   // => 2

/* ------------------------------------------------------------
   11) toString() e valueOf(): integrazione con il linguaggio
   ------------------------------------------------------------ */

class Ore {
  constructor(minuti) { this.minuti = minuti; }
  toString() {
    const h = Math.floor(this.minuti / 60);
    const m = this.minuti % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }
  valueOf() { return this.minuti; } // usato nei contesti numerici
}

const o = new Ore(150);
console.log(`Lavorate: ${o}`); // => Lavorate: 2h 30m  (chiama toString)
console.log(o + 30);           // => 180  (chiama valueOf)

/* ------------------------------------------------------------
   12) ABSTRACT-like: vietare l'istanziazione diretta
   JS non ha class astratte, ma si simula con new.target.
   ------------------------------------------------------------ */

class Documento {
  constructor() {
    if (new.target === Documento) {
      throw new Error('Documento e astratta: usa una subclass');
    }
  }
  intestazione() { throw new Error('Implementa intestazione()'); }
}

class BollaUscita extends Documento {
  intestazione() { return 'BOLLA DI USCITA'; }
}

try {
  new Documento();
} catch (e) {
  console.log(e.message); // => Documento e astratta: usa una subclass
}
console.log(new BollaUscita().intestazione()); // => BOLLA DI USCITA

/* ------------------------------------------------------------
   13) ESTENDERE Error: errori di dominio personalizzati
   Pattern reale per gestire i casi del gestionale.
   ------------------------------------------------------------ */

class TimbraturaError extends Error {
  constructor(messaggio, codice) {
    super(messaggio);
    this.name = 'TimbraturaError';
    this.codice = codice; // metadato extra
  }
}

function validaTimbratura(ingresso, uscita) {
  if (uscita <= ingresso) {
    throw new TimbraturaError('Uscita precedente all\'ingresso', 'ORDINE_ORARI');
  }
  return true;
}

try {
  validaTimbratura(1000, 800);
} catch (e) {
  console.log(e.name, e.codice); // => TimbraturaError ORDINE_ORARI
  console.log(e instanceof Error); // => true
}

/* ------------------------------------------------------------
   14) CASO ERP COMPLETO: gerarchia + static + getter privati
   Cartellino mensile che aggrega timbrature naive-UTC.
   ------------------------------------------------------------ */

class Cartellino {
  static ORE_CONTRATTO = 8;       // static field condiviso
  #timbrature = [];               // private field

  constructor(dipendente) {
    this.dipendente = dipendente; // istanza di Dipendente
  }

  // accetta minuti lavorati per giorno
  aggiungiGiorno(minuti) {
    this.#timbrature.push(minuti);
    return this;
  }

  get oreTotali() {
    return this.#timbrature.reduce((s, m) => s + m, 0) / 60;
  }

  get straordinario() {
    const atteso = this.#timbrature.length * Cartellino.ORE_CONTRATTO;
    return Math.max(0, this.oreTotali - atteso);
  }

  riepilogo() {
    return `${this.dipendente.nomeCompleto()}: ${this.oreTotali}h (extra ${this.straordinario}h)`;
  }
}

const cart = new Cartellino(d1)
  .aggiungiGiorno(9 * 60)   // 9h
  .aggiungiGiorno(8 * 60)   // 8h
  .aggiungiGiorno(10 * 60); // 10h
console.log(cart.oreTotali);    // => 27
console.log(cart.straordinario); // => 3   (27 - 24 atteso)
console.log(cart.riepilogo());   // => Anna Bianchi: 27h (extra 3h)

/* ------------------------------------------------------------
   15) MIXIN: comporre comportamenti con funzioni che ritornano class
   Utile quando l'inheritance singola non basta.
   ------------------------------------------------------------ */

const Serializzabile = (Base) => class extends Base {
  toJSON() { return JSON.stringify({ ...this }); }
};

class EntitaBase {
  constructor(id) { this.id = id; }
}

class RepartoSerializzabile extends Serializzabile(EntitaBase) {
  constructor(id, sigla) { super(id); this.sigla = sigla; }
}

const rs = new RepartoSerializzabile(1, 'PR');
console.log(rs.toJSON()); // => {"id":1,"sigla":"PR"}

/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   ------------------------------------------------------------
   class Nome { }                  -> dichiarazione di una class
   constructor(...) { }            -> inizializzazione con `new`
   campo = valore;                 -> instance field con default
   #campo = valore;                -> private instance field
   metodo() { }                    -> instance method (sul prototype)
   #metodo() { }                   -> private method
   get prop() { }                  -> getter (accesso come property)
   set prop(v) { }                 -> setter (assegnazione come property)
   static campo = ...;             -> static field (sulla class)
   static #campo = ...;            -> static private field
   static metodo() { }             -> static method (factory/utility)
   extends Base                    -> inheritance
   super(...) / super.metodo()     -> chiama constructor/method padre
   new.target                      -> rileva la class istanziata (abstract)
   instanceof                      -> verifica appartenenza alla catena
   this                            -> riferimento all'istanza corrente
   return this;                    -> method chaining
   static fromRow(row)             -> static factory da dati grezzi
   [Symbol.iterator]() { }         -> rende l'istanza iterabile
   toString() / valueOf()          -> coercion verso string/number
   class X extends Error           -> errore di dominio custom
   const M = (B) => class extends B -> mixin (composizione)
   ============================================================ */
