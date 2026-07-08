/* ============================================================
   85 JS ADV Class Private
   Questo file approfondisce l'encapsulation nelle class moderne:
   i private fields con il prefisso #, i private methods, i
   private static members, i getter/setter su campi privati e i
   pattern professionali per nascondere lo stato interno di un
   oggetto. Vedremo perche' i # garantiscono una privacy "hard"
   (a livello di linguaggio) impossibile da aggirare dall'esterno,
   a differenza della vecchia convenzione con underscore _campo.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) PRIVATE FIELD DI BASE (#)
   Un campo prefissato con # e' accessibile SOLO dall'interno
   della class. Va dichiarato a livello di class.
   ------------------------------------------------------------ */
class Contatore {
  #valore = 0; // private field con valore iniziale

  incrementa() {
    this.#valore++;
    return this.#valore;
  }
  get valore() {
    return this.#valore;
  }
}
const c = new Contatore();
console.log(c.incrementa()); // => 1
console.log(c.incrementa()); // => 2
console.log(c.valore);       // => 2
console.log(c.valore);       // => 2
// console.log(c.#valore);   // SyntaxError: campo privato non accessibile fuori

/* ------------------------------------------------------------
   2) PRIVACY "HARD": il # non e' aggirabile
   A differenza di _underscore, il private field non compare in
   Object.keys, non e' enumerabile, non e' raggiungibile con [].
   ------------------------------------------------------------ */
class Conto {
  #saldo = 100;
  saldoPubblico() { return this.#saldo; }
}
const conto = new Conto();
console.log(Object.keys(conto));        // => []
console.log(JSON.stringify(conto));     // => {}
console.log(conto['#saldo']);           // => undefined (NON e' il private!)
console.log(conto.saldoPubblico());     // => 100

/* ------------------------------------------------------------
   3) PRIVATE METHODS (#metodo)
   Anche i methods possono essere privati: utili come helper
   interni che NON devono far parte dell'API pubblica.
   ------------------------------------------------------------ */
class CalcolatoreOre {
  #minuti = 0;

  aggiungi(min) {
    this.#minuti += this.#sanifica(min);
    return this;
  }
  // private method: helper interno di validazione
  #sanifica(min) {
    return Number.isFinite(min) && min > 0 ? Math.floor(min) : 0;
  }
  get ore() {
    return (this.#minuti / 60).toFixed(2);
  }
}
const calc = new CalcolatoreOre();
calc.aggiungi(90).aggiungi(45.7).aggiungi(-10); // chaining; -10 ignorato
console.log(calc.ore); // => 2.25

/* ------------------------------------------------------------
   4) GETTER/SETTER PRIVATI con validazione
   Il setter pubblico controlla l'input prima di scrivere nel
   private field: encapsulation classica.
   ------------------------------------------------------------ */
class Temperatura {
  #celsius = 0;
  set celsius(v) {
    if (typeof v !== 'number') throw new TypeError('Serve un numero');
    if (v < -273.15) throw new RangeError('Sotto lo zero assoluto');
    this.#celsius = v;
  }
  get celsius() { return this.#celsius; }
  get fahrenheit() { return this.#celsius * 9 / 5 + 32; }
}
const t = new Temperatura();
t.celsius = 25;
console.log(t.celsius);    // => 25
console.log(t.fahrenheit); // => 77

/* ------------------------------------------------------------
   5) PRIVATE STATIC FIELD e PRIVATE STATIC METHOD
   Appartengono alla class, non all'istanza. Utili per contatori
   globali, configurazioni e factory interne.
   ------------------------------------------------------------ */
class Dipendente {
  static #contatore = 0;       // private static field condiviso
  static #prefisso = 'UP';     // configurazione interna
  #badge;
  nome;

  constructor(nome) {
    this.nome = nome;
    Dipendente.#contatore++;
    this.#badge = Dipendente.#generaBadge(Dipendente.#contatore);
  }
  // private static method: factory del codice badge 'UP-001'
  static #generaBadge(n) {
    return `${Dipendente.#prefisso}-${String(n).padStart(3, '0')}`;
  }
  get badge() { return this.#badge; }
  static get totale() { return Dipendente.#contatore; }
}
const d1 = new Dipendente('Mario');
const d2 = new Dipendente('Lucia');
console.log(d1.badge);          // => UP-001
console.log(d2.badge);          // => UP-002
console.log(Dipendente.totale); // => 2

/* ------------------------------------------------------------
   6) PUBLIC STATIC FIELD e PUBLIC STATIC METHOD
   Per confronto: questi sono pubblici (parte dell'API).
   ------------------------------------------------------------ */
class Reparto {
  static SIGLA_DEFAULT = 'XX'; // public static field
  #sigla;
  constructor(sigla) {
    this.#sigla = (sigla ?? Reparto.SIGLA_DEFAULT).toUpperCase().slice(0, 2);
  }
  get sigla() { return this.#sigla; }
  // public static method: factory alternativa
  static daNome(nome) {
    return new Reparto((nome ?? '').slice(0, 2));
  }
}
console.log(Reparto.SIGLA_DEFAULT);          // => XX
console.log(new Reparto('produzione').sigla);// => PR
console.log(new Reparto().sigla);            // => XX
console.log(Reparto.daNome('Magazzino').sigla); // => MA

/* ------------------------------------------------------------
   7) STATIC INITIALIZATION BLOCK (ES2022)
   Blocco eseguito una volta sola al caricamento della class:
   utile per inizializzare private static complessi.
   ------------------------------------------------------------ */
class Configurazione {
  static #regole;
  static {
    // logica di inizializzazione eseguita all'avvio
    Configurazione.#regole = { arrotondamento: 5, pausaMin: 30 };
    Object.freeze(Configurazione.#regole);
  }
  static get(chiave) { return Configurazione.#regole[chiave]; }
}
console.log(Configurazione.get('arrotondamento')); // => 5
console.log(Configurazione.get('pausaMin'));       // => 30

/* ------------------------------------------------------------
   8) BRAND CHECK con il campo privato (#campo in obj)
   L'operatore "in" su un private field verifica se un oggetto
   e' davvero un'istanza di quella class (brand check sicuro).
   ------------------------------------------------------------ */
class Timbratura {
  #ts;
  constructor(ts) { this.#ts = ts; }
  static eUnaTimbratura(x) {
    return #ts in x; // true solo per istanze con il private #ts
  }
}
const tb = new Timbratura(Date.now());
console.log(Timbratura.eUnaTimbratura(tb));      // => true
console.log(Timbratura.eUnaTimbratura({}));      // => false
console.log(Timbratura.eUnaTimbratura({ ts: 1 }));// => false

/* ------------------------------------------------------------
   9) ESEMPIO ERP: BadgeAziendale con campi e metodi privati
   Normalizzazione interna del codice badge e validazione regex,
   ispirate al pattern reale (codiceBadge 'UP-001').
   ------------------------------------------------------------ */
class BadgeAziendale {
  static #regex = /^[A-Z]{2}-\d{3}$/;
  #codice;

  constructor(raw) {
    const norm = BadgeAziendale.#normalizza(raw);
    if (!BadgeAziendale.#regex.test(norm)) {
      throw new Error(`Badge non valido: ${raw}`);
    }
    this.#codice = norm;
  }
  // private static: pulizia stringa stile ERP
  static #normalizza(v) {
    return String(v || '').trim().toUpperCase().replace(/\s+/g, '');
  }
  // private method: estrae il numero progressivo
  #progressivo() {
    return Number(this.#codice.match(/-(\d+)$/)[1]);
  }
  get codice() { return this.#codice; }
  get numero() { return this.#progressivo(); }
}
const badge = new BadgeAziendale('  up-007 ');
console.log(badge.codice); // => UP-007
console.log(badge.numero); // => 7

/* ------------------------------------------------------------
   10) ESEMPIO ERP: RegistroTimbrature con stato incapsulato
   Lo stato (le timbrature) e' privato: l'esterno puo' solo
   timbrare e leggere il totale, mai manipolare l'array grezzo.
   Pattern naive-UTC: salviamo l'orario di Roma come stringa.
   ------------------------------------------------------------ */
class RegistroTimbrature {
  #eventi = [];                 // stato interno protetto
  #dipendente;
  static #fmt = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false,
  });

  constructor(dipendente) { this.#dipendente = dipendente; }

  timbra(tipo, date = new Date()) {
    this.#eventi.push({ tipo, ora: RegistroTimbrature.#fmt.format(date) });
    return this;
  }
  // private method: somma minuti tra ingresso e uscita
  #minutiTra(a, b) {
    const m = s => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
    return m(b) - m(a);
  }
  get oreLavorate() {
    const ing = this.#eventi.find(e => e.tipo === 'ingresso');
    const usc = this.#eventi.find(e => e.tipo === 'uscita');
    if (!ing || !usc) return 0;
    return +(this.#minutiTra(ing.ora, usc.ora) / 60).toFixed(2);
  }
  get report() {
    return `${this.#dipendente}: ${this.#eventi.length} eventi`;
  }
}
const reg = new RegistroTimbrature('Mario Rossi');
reg.timbra('ingresso', new Date('2026-06-30T07:00:00Z'))  // 09:00 a Roma (estate)
   .timbra('uscita',   new Date('2026-06-30T15:00:00Z')); // 17:00 a Roma
console.log(reg.oreLavorate); // => 8
console.log(reg.report);      // => Mario Rossi: 2 eventi
console.log(Object.keys(reg));// => []  (stato totalmente incapsulato)

/* ------------------------------------------------------------
   11) ESEMPIO ERP: Magazzino DPI con scorta minima privata
   I private method gestiscono regole interne (sotto-scorta);
   l'API pubblica espone solo operazioni controllate.
   ------------------------------------------------------------ */
class ArticoloVestiario {
  #quantita;
  #scortaMinima;
  descrizione;

  constructor(descrizione, quantita, scortaMinima) {
    this.descrizione = descrizione;
    this.#quantita = quantita;
    this.#scortaMinima = scortaMinima;
  }
  preleva(n) {
    if (n > this.#quantita) throw new Error('Scorta insufficiente');
    this.#quantita -= n;
    if (this.#sottoScorta()) this.#allerta();
    return this;
  }
  rifornisci(n) { this.#quantita += n; return this; }
  #sottoScorta() { return this.#quantita < this.#scortaMinima; }
  #allerta() { console.log(`ALLERTA: ${this.descrizione} sotto scorta`); }
  get disponibili() { return this.#quantita; }
}
const guanti = new ArticoloVestiario('Guanti taglia L', 10, 4);
guanti.preleva(7); // => ALLERTA: Guanti taglia L sotto scorta
console.log(guanti.disponibili); // => 3

/* ------------------------------------------------------------
   12) EREDITARIETA' e private field
   I private field NON sono ereditati ne' accessibili dalle
   subclass: restano confinati alla class che li dichiara.
   Per condividere stato con le subclass si usano protected-like
   pattern (campi normali) oppure metodi pubblici/protected.
   ------------------------------------------------------------ */
class Turno {
  #pausaMin;
  constructor(pausaMin) { this.#pausaMin = pausaMin; }
  get pausa() { return this.#pausaMin; }
}
class TurnoP4 extends Turno {
  constructor() { super(30); }      // P4 con pausa di 30'
  descrivi() {
    // return this.#pausaMin;        // SyntaxError: non accede al privato del padre
    return `Turno P4, pausa ${this.pausa}'`; // usa il getter pubblico
  }
}
console.log(new TurnoP4().descrivi()); // => Turno P4, pausa 30'

/* ------------------------------------------------------------
   13) PRIVATE + WEAKMAP (pattern pre-ES2022, ancora utile)
   Prima dei #, la privacy si simulava con una WeakMap esterna.
   Mostrato per completezza storica/concettuale.
   ------------------------------------------------------------ */
const _store = new WeakMap();
class ContoLegacy {
  constructor(saldo) { _store.set(this, { saldo }); }
  deposita(n) { _store.get(this).saldo += n; return this; }
  get saldo() { return _store.get(this).saldo; }
}
const cl = new ContoLegacy(50);
cl.deposita(25);
console.log(cl.saldo); // => 75

/* ------------------------------------------------------------
   14) PATTERN: validazione in #metodo statico riusabile
   Un private static method centralizza una regola usata da piu'
   punti della class, senza esporla all'API pubblica.
   ------------------------------------------------------------ */
class Orario {
  static #valido(s) { return /^\d{2}:\d{2}$/.test(s); }
  #inizio; #fine;
  constructor(inizio, fine) {
    if (!Orario.#valido(inizio) || !Orario.#valido(fine)) {
      throw new Error('Formato orario HH:MM richiesto');
    }
    this.#inizio = inizio; this.#fine = fine;
  }
  toString() { return `${this.#inizio}-${this.#fine}`; }
}
console.log(new Orario('09:00', '17:30').toString()); // => 09:00-17:30

/* ------------------------------------------------------------
   15) ENCAPSULATION COMPLETA: oggetto immutabile dall'esterno
   Combinando private fields + solo getter, lo stato e' di sola
   lettura per chi usa la class.
   ------------------------------------------------------------ */
class DipendenteDTO {
  #nome; #cognome; #badge;
  constructor({ nome, cognome, badge }) {
    this.#nome = nome; this.#cognome = cognome; this.#badge = badge;
  }
  get etichetta() { return `Assegnato a ${this.#nome} ${this.#cognome} (${this.#badge})`; }
}
const dto = new DipendenteDTO({ nome: 'Lucia', cognome: 'Verdi', badge: 'UP-002' });
console.log(dto.etichetta); // => Assegnato a Lucia Verdi (UP-002)
// dto.#nome = 'X';          // SyntaxError: nessuna scrittura possibile

/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   - #campo                  -> private field di istanza
   - #metodo()               -> private method di istanza
   - static #campo           -> private static field
   - static #metodo()        -> private static method
   - static CAMPO = ...      -> public static field
   - static metodo()         -> public static method
   - static { ... }          -> static initialization block (ES2022)
   - #campo in obj           -> brand check (verifica istanza)
   - get / set               -> getter/setter con validazione
   - this.#campo             -> accesso al privato dall'interno
   - super(...)              -> i # NON sono ereditati dalle subclass
   - WeakMap                 -> privacy "soft" pre-ES2022
   - Object.keys / JSON      -> NON vedono i private fields
   - padStart / replace / .match / regex.test -> helper interni ERP
   ============================================================ */
