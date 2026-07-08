/* ============================================================
   84 JS ADV Class Inheritance
   L'ereditarieta (inheritance) tra class permette di costruire
   gerarchie di tipi: una classe figlia (subclass) eredita campi e
   metodi dalla classe padre (superclass) tramite "extends", richiama
   il costruttore e i metodi del padre con "super", e puo ridefinire
   il comportamento con l'override dei metodi. Su questa base nascono
   il polimorfismo (stessa interfaccia, comportamenti diversi) e i
   pattern per classi astratte (abstract) che definiscono un contratto
   senza implementarlo del tutto. Esempi ispirati a un gestionale ERP.
   ============================================================ */

'use strict';

// ------------------------------------------------------------
// 1. EXTENDS: una subclass eredita dalla superclass
// ------------------------------------------------------------

// La classe base Dipendente definisce campi e metodi comuni.
class Dipendente {
  constructor(nome, cognome, codiceBadge) {
    this.nome = nome;
    this.cognome = cognome;
    this.codiceBadge = codiceBadge;
  }
  descrizione() {
    return `${this.nome} ${this.cognome} (${this.codiceBadge})`;
  }
}

// Operaio "extends" Dipendente: eredita constructor e metodi.
class Operaio extends Dipendente {}

const op = new Operaio('Mario', 'Rossi', 'UP-001');
console.log(op.descrizione()); // => Mario Rossi (UP-001)
console.log(op instanceof Operaio);   // => true
console.log(op instanceof Dipendente); // => true (catena di prototipi)

// ------------------------------------------------------------
// 2. SUPER nel constructor: inizializzare la parte ereditata
// ------------------------------------------------------------

// La subclass deve chiamare super(...) PRIMA di usare "this".
class Impiegato extends Dipendente {
  constructor(nome, cognome, codiceBadge, reparto) {
    super(nome, cognome, codiceBadge); // inizializza i campi del padre
    this.reparto = reparto;            // campo specifico della subclass
  }
}

const imp = new Impiegato('Anna', 'Bianchi', 'UP-014', 'AMMINISTRAZIONE');
console.log(imp.descrizione(), '-', imp.reparto);
// => Anna Bianchi (UP-014) - AMMINISTRAZIONE

// Errore tipico: usare this prima di super() lancia ReferenceError.
// class Sbagliata extends Dipendente {
//   constructor(n) { this.nome = n; super(n,'','X'); } // ReferenceError
// }

// ------------------------------------------------------------
// 3. OVERRIDE: ridefinire un metodo del padre
// ------------------------------------------------------------

class Dirigente extends Dipendente {
  // Override: stesso nome di metodo, comportamento diverso.
  descrizione() {
    return `DIRIGENTE ${this.nome} ${this.cognome}`;
  }
}
console.log(new Dirigente('Luca', 'Verdi', 'UP-002').descrizione());
// => DIRIGENTE Luca Verdi

// ------------------------------------------------------------
// 4. SUPER nei metodi: estendere (non sostituire) il padre
// ------------------------------------------------------------

class Responsabile extends Dipendente {
  constructor(nome, cognome, codiceBadge, team) {
    super(nome, cognome, codiceBadge);
    this.team = team;
  }
  // Richiama il metodo del padre con super.metodo() e lo arricchisce.
  descrizione() {
    return `${super.descrizione()} - capo di ${this.team} persone`;
  }
}
console.log(new Responsabile('Sara', 'Neri', 'UP-003', 5).descrizione());
// => Sara Neri (UP-003) - capo di 5 persone

// ------------------------------------------------------------
// 5. POLIMORFISMO: stessa interfaccia, comportamenti diversi
// ------------------------------------------------------------

// Ogni turno calcola le ore lavorate in modo diverso (override),
// ma il codice chiamante usa sempre lo stesso metodo oreLavorate().
class Turno {
  constructor(ingressoMin, uscitaMin) {
    this.ingressoMin = ingressoMin; // minuti da mezzanotte
    this.uscitaMin = uscitaMin;
  }
  oreLavorate() {
    return (this.uscitaMin - this.ingressoMin) / 60;
  }
}
class TurnoP2 extends Turno {} // P2: senza pausa, eredita il calcolo base

class TurnoP4 extends Turno {  // P4: con pausa pranzo da scalare
  constructor(ingressoMin, uscitaMin, pausaMin = 60) {
    super(ingressoMin, uscitaMin);
    this.pausaMin = pausaMin;
  }
  oreLavorate() {
    return (this.uscitaMin - this.ingressoMin - this.pausaMin) / 60;
  }
}

// Il chiamante non sa che tipo di turno sia: polimorfismo in azione.
const turni = [
  new TurnoP2(8 * 60, 13 * 60),       // 5h
  new TurnoP4(8 * 60, 17 * 60, 60),   // 9h - 1h pausa = 8h
];
for (const t of turni) console.log(t.oreLavorate());
// => 5
// => 8

// ------------------------------------------------------------
// 6. ABSTRACT PATTERN: classe base non istanziabile (new.target)
// ------------------------------------------------------------

// new.target indica la classe usata con "new"; se e la base, blocca.
class DocumentoHR {
  constructor(numero) {
    if (new.target === DocumentoHR) {
      throw new Error('DocumentoHR e astratta: usa una subclass');
    }
    this.numero = numero;
  }
  // Metodo astratto: il padre impone il contratto, non l'implementazione.
  stampa() {
    throw new Error('stampa() deve essere implementato dalla subclass');
  }
}

class BustaPaga extends DocumentoHR {
  constructor(numero, importo) {
    super(numero);
    this.importo = importo;
  }
  stampa() {
    return `Busta #${this.numero}: ${this.importo.toFixed(2)} EUR`;
  }
}

console.log(new BustaPaga(101, 1500).stampa()); // => Busta #101: 1500.00 EUR
try {
  new DocumentoHR(1);
} catch (e) {
  console.log(e.message); // => DocumentoHR e astratta: usa una subclass
}

// ------------------------------------------------------------
// 7. ABSTRACT con metodi astratti verificati nel constructor
// ------------------------------------------------------------

// Un altro modo: la base verifica che la subclass abbia ridefinito i metodi.
class Esportatore {
  constructor() {
    if (this.formatta === Esportatore.prototype.formatta) {
      throw new Error('formatta() non implementato');
    }
  }
  formatta() {
    throw new Error('astratto');
  }
  esporta(rows) {
    return rows.map((r) => this.formatta(r)).join('\n');
  }
}
class EsportatoreCSV extends Esportatore {
  formatta(r) {
    return `${r.codiceBadge};${r.nome}`;
  }
}
const exp = new EsportatoreCSV();
console.log(exp.esporta([{ codiceBadge: 'UP-001', nome: 'Mario' }]));
// => UP-001;Mario

// ------------------------------------------------------------
// 8. EREDITARIETA SU PIU LIVELLI (catena di gerarchie)
// ------------------------------------------------------------

class Persona {
  constructor(nome) { this.nome = nome; }
  saluta() { return `Ciao, sono ${this.nome}`; }
}
class Lavoratore extends Persona {
  constructor(nome, azienda) { super(nome); this.azienda = azienda; }
  saluta() { return `${super.saluta()}, lavoro in ${this.azienda}`; }
}
class Stagista extends Lavoratore {
  constructor(nome, azienda, tutor) {
    super(nome, azienda);
    this.tutor = tutor;
  }
  saluta() { return `${super.saluta()} (tutor: ${this.tutor})`; }
}
console.log(new Stagista('Eva', 'Polyuretech', 'Sara').saluta());
// => Ciao, sono Eva, lavoro in Polyuretech (tutor: Sara)

// ------------------------------------------------------------
// 9. METODI E CAMPI STATIC con ereditarieta
// ------------------------------------------------------------

// I membri static si ereditano e super funziona anche nei metodi static.
class Articolo {
  static prefisso = 'ART';
  static crea(id) { return `${this.prefisso}-${String(id).padStart(3, '0')}`; }
}
class Vestiario extends Articolo {
  static prefisso = 'DPI'; // override del campo static
  static crea(id) { return `[${super.crea(id)}]`; }
}
console.log(Articolo.crea(7));  // => ART-007
console.log(Vestiario.crea(7)); // => [DPI-007]

// ------------------------------------------------------------
// 10. GETTER/SETTER con override
// ------------------------------------------------------------

class CapoMagazzino extends Dipendente {
  get etichetta() { return `[CAPO] ${this.descrizione()}`; }
}
const cm = new CapoMagazzino('Gino', 'Pallino', 'UP-009');
console.log(cm.etichetta); // => [CAPO] Gino Pallino (UP-009)

// ------------------------------------------------------------
// 11. CAMPI PRIVATI (#) e protezione dello stato ereditato
// ------------------------------------------------------------

// I campi privati #x NON sono accessibili dalle subclass: restano
// confinati alla classe che li dichiara. Si espongono via metodi.
class ContoOre {
  #minuti = 0;
  aggiungi(min) { this.#minuti += min; return this; }
  get ore() { return this.#minuti / 60; }
}
class ContoOreStraordinario extends ContoOre {
  // Non puo toccare #minuti: usa l'API pubblica del padre.
  aggiungiMaggiorato(min) { return this.aggiungi(Math.round(min * 1.5)); }
}
const conto = new ContoOreStraordinario();
conto.aggiungi(60).aggiungiMaggiorato(60);
console.log(conto.ore); // => 2.5

// ------------------------------------------------------------
// 12. POLIMORFISMO + collezioni eterogenee (caso ERP reale)
// ------------------------------------------------------------

// Calcolo del costo mensile: ogni tipo di contratto override il calcolo,
// ma il totale si ottiene con un unico ciclo polimorfico + reduce().
class Contratto {
  constructor(dipendente) { this.dipendente = dipendente; }
  costoMensile() { return 0; }
}
class ContrattoMensile extends Contratto {
  constructor(dipendente, stipendio) { super(dipendente); this.stipendio = stipendio; }
  costoMensile() { return this.stipendio; }
}
class ContrattoOrario extends Contratto {
  constructor(dipendente, tariffa, ore) {
    super(dipendente);
    this.tariffa = tariffa;
    this.ore = ore;
  }
  costoMensile() { return this.tariffa * this.ore; }
}
const contratti = [
  new ContrattoMensile('UP-001', 1800),
  new ContrattoOrario('UP-014', 15, 160),
];
const totale = contratti.reduce((s, c) => s + c.costoMensile(), 0);
console.log(totale); // => 4200

// ------------------------------------------------------------
// 13. SUPER-CALL e Template Method pattern
// ------------------------------------------------------------

// La base definisce lo "scheletro" (validazione + salvataggio); le
// subclass riempiono i passi astratti. Pattern professionale comune.
class SalvataggioEntita {
  salva(dati) {
    this.valida(dati);            // hook astratto
    const norm = this.normalizza(dati); // hook con default
    return `OK salvato: ${JSON.stringify(norm)}`;
  }
  valida() { throw new Error('valida() astratto'); }
  normalizza(d) { return d; }     // default sovrascrivibile
}
class SalvaDipendente extends SalvataggioEntita {
  valida(d) { if (!d.codiceBadge) throw new Error('badge mancante'); }
  normalizza(d) {
    return { ...d, codiceBadge: String(d.codiceBadge).trim().toUpperCase() };
  }
}
console.log(new SalvaDipendente().salva({ codiceBadge: ' up-005 ', nome: 'Tom' }));
// => OK salvato: {"codiceBadge":"UP-005","nome":"Tom"}

// ------------------------------------------------------------
// 14. EREDITARE da classi built-in (Array, Error)
// ------------------------------------------------------------

// Custom Error: utile per distinguere errori di dominio nel try/catch.
class ErroreTimbratura extends Error {
  constructor(messaggio, badge) {
    super(messaggio);
    this.name = 'ErroreTimbratura';
    this.badge = badge;
  }
}
try {
  throw new ErroreTimbratura('uscita prima di ingresso', 'UP-001');
} catch (e) {
  console.log(e instanceof Error, e.name, e.badge);
  // => true ErroreTimbratura UP-001
}

// Estendere Array per una collezione tipizzata con metodi propri.
class ListaTurni extends Array {
  oreTotali() { return this.reduce((s, t) => s + t.oreLavorate(), 0); }
}
const lista = ListaTurni.from([new TurnoP2(480, 780), new TurnoP4(480, 1020)]);
console.log(lista.oreTotali()); // => 13

// ------------------------------------------------------------
// 15. MIXIN: simulare ereditarieta multipla (JS ne ha solo una)
// ------------------------------------------------------------

// Un mixin e una funzione che aggiunge metodi a una superclass passata.
const Timbrabile = (Base) => class extends Base {
  timbra(ora) {
    (this.timbrature ??= []).push(ora);
    return this;
  }
};
const Esportabile = (Base) => class extends Base {
  toDTO() { return { ...this }; }
};
class Reparto {
  constructor(sigla) { this.sigla = sigla; }
}
// Componiamo piu comportamenti tramite mixin annidati.
class RepartoCompleto extends Esportabile(Timbrabile(Reparto)) {}
const rep = new RepartoCompleto('UP');
rep.timbra('08:00').timbra('17:00');
console.log(rep.toDTO()); // => { sigla: 'UP', timbrature: [ '08:00', '17:00' ] }

// ------------------------------------------------------------
// 16. CONTROLLO DEL TIPO: instanceof vs isPrototypeOf vs constructor
// ------------------------------------------------------------

console.log(new TurnoP4(0, 60) instanceof Turno);            // => true
console.log(Turno.prototype.isPrototypeOf(new TurnoP2(0, 60))); // => true
console.log(new TurnoP2(0, 60).constructor.name);            // => TurnoP2
console.log(Object.getPrototypeOf(TurnoP4) === Turno);       // => true (catena static)

/* ============================================================
   RIEPILOGO COMANDI
   - class Figlia extends Padre {}      : dichiara ereditarieta
   - super(args)                        : chiama il constructor del padre
   - super.metodo(args)                 : chiama il metodo del padre
   - override                           : ridefinire metodo con stesso nome
   - new.target                         : rileva la classe usata con new (abstract)
   - get / set                          : accessor ereditabili e overridabili
   - static + super in static           : membri di classe ereditati
   - #campo                             : campo privato (non ereditato dalle subclass)
   - instanceof                         : verifica appartenenza alla catena
   - X.prototype.isPrototypeOf(obj)     : check prototipo
   - obj.constructor.name               : nome della classe effettiva
   - Object.getPrototypeOf(X)           : risale la catena (anche static)
   - extends Error / Array              : ereditare da built-in
   - Mixin = (Base) => class extends Base {} : composizione di comportamenti
   - Array.reduce / map                 : aggregazione polimorfica
   - Template Method                    : base definisce lo scheletro, subclass i passi
   ============================================================ */
