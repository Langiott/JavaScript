/* ============================================================
   98 JS ADV Getters Setters
   I getters e setters sono "accessor properties": funzioni che si
   comportano come proprieta'. Un getter (parola chiave get) viene
   eseguito quando si LEGGE la proprieta'; un setter (set) quando la
   si ASSEGNA. Servono per computed properties (valori derivati),
   incapsulamento (proprieta' "private" con # o _), validazione su
   set, lazy evaluation e API pulite. Funzionano in object literals,
   classi, Object.defineProperty e getOwnPropertyDescriptor.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) GETTER/SETTER base in un object literal
   get => calcolato in lettura, set => intercetta la scrittura
   ------------------------------------------------------------ */
const persona = {
  nome: 'Mario',
  cognome: 'Rossi',
  get nomeCompleto() {
    return `${this.nome} ${this.cognome}`;
  },
  set nomeCompleto(valore) {
    [this.nome, this.cognome] = valore.split(' ');
  },
};
console.log(persona.nomeCompleto); // => Mario Rossi
persona.nomeCompleto = 'Luigi Verdi';
console.log(persona.nome);         // => Luigi
console.log(persona.cognome);      // => Verdi

/* ------------------------------------------------------------
   2) Nota: il getter si usa SENZA parentesi (e' una property)
   ------------------------------------------------------------ */
console.log(persona.nomeCompleto);   // => Luigi Verdi  (no parentesi)
// console.log(persona.nomeCompleto()) // TypeError: non e' una funzione

/* ------------------------------------------------------------
   3) Getter computed (valore derivato, sola lettura)
   ------------------------------------------------------------ */
const rettangolo = {
  base: 4,
  altezza: 3,
  get area() {
    return this.base * this.altezza;
  },
};
console.log(rettangolo.area); // => 12
// In strict mode assegnare a un getter senza setter lancia TypeError:
// rettangolo.area = 999; // TypeError: only has a getter
console.log(rettangolo.area); // => 12 (resta calcolato)

/* ------------------------------------------------------------
   4) Getter/Setter in una CLASS
   ------------------------------------------------------------ */
class Temperatura {
  constructor(celsius = 0) {
    this._celsius = celsius;
  }
  get celsius() {
    return this._celsius;
  }
  set celsius(v) {
    this._celsius = v;
  }
  get fahrenheit() {
    return this._celsius * 9 / 5 + 32;
  }
  set fahrenheit(f) {
    this._celsius = (f - 32) * 5 / 9;
  }
}
const t = new Temperatura(25);
console.log(t.fahrenheit); // => 77
t.fahrenheit = 212;
console.log(t.celsius);    // => 100

/* ------------------------------------------------------------
   5) VALIDAZIONE su set (caso d'uso principale)
   Si lancia un Error se il valore non rispetta le regole
   ------------------------------------------------------------ */
class Eta {
  #valore = 0;
  get valore() {
    return this.#valore;
  }
  set valore(v) {
    if (typeof v !== 'number' || Number.isNaN(v)) {
      throw new TypeError('eta deve essere un numero');
    }
    if (v < 0 || v > 130) {
      throw new RangeError('eta fuori range 0-130');
    }
    this.#valore = v;
  }
}
const e = new Eta();
e.valore = 30;
console.log(e.valore); // => 30
try {
  e.valore = -5;
} catch (err) {
  console.log(err.message); // => eta fuori range 0-130
}

/* ------------------------------------------------------------
   6) Private fields (#) + accessor: incapsulamento reale
   Il campo # non e' accessibile dall'esterno
   ------------------------------------------------------------ */
class ContoCorrente {
  #saldo = 0;
  get saldo() {
    return this.#saldo;
  }
  versa(importo) {
    if (importo <= 0) throw new Error('importo non valido');
    this.#saldo += importo;
    return this;
  }
}
const conto = new ContoCorrente();
conto.versa(100).versa(50);
console.log(conto.saldo); // => 150
// console.log(conto.#saldo) // SyntaxError: campo privato non accessibile

/* ------------------------------------------------------------
   7) Object.defineProperty: definire accessor su oggetti esistenti
   ------------------------------------------------------------ */
const prodotto = { prezzoNetto: 100 };
Object.defineProperty(prodotto, 'prezzoLordo', {
  get() {
    return this.prezzoNetto * 1.22; // IVA 22%
  },
  enumerable: true,
  configurable: true,
});
console.log(prodotto.prezzoLordo); // => 122

/* ------------------------------------------------------------
   8) getOwnPropertyDescriptor: ispezionare get/set
   ------------------------------------------------------------ */
const desc = Object.getOwnPropertyDescriptor(prodotto, 'prezzoLordo');
console.log(typeof desc.get); // => function
console.log(desc.set);        // => undefined

/* ------------------------------------------------------------
   9) Getter "lazy" con cache: calcola una volta sola, poi
   sostituisce se stesso con un valore semplice (memoization)
   ------------------------------------------------------------ */
const report = {
  get datiPesanti() {
    console.log('...calcolo pesante eseguito una volta...');
    const valore = Array.from({ length: 5 }, (_, i) => i * i);
    Object.defineProperty(this, 'datiPesanti', { value: valore });
    return valore;
  },
};
console.log(report.datiPesanti); // => calcolo... poi [0,1,4,9,16]
console.log(report.datiPesanti); // => [0,1,4,9,16] (niente ricalcolo)

/* ------------------------------------------------------------
   10) Getter/Setter ereditati: funzionano nella catena prototipale
   ------------------------------------------------------------ */
class Base {
  get tipo() {
    return 'base';
  }
}
class Derivata extends Base {
  get tipo() {
    return `derivata-da-${super.tipo}`; // super dentro un getter
  }
}
console.log(new Derivata().tipo); // => derivata-da-base

/* ------------------------------------------------------------
   11) Computed property name come accessor (nome dinamico)
   ------------------------------------------------------------ */
const campo = 'totale';
const ordine = {
  righe: [10, 20, 30],
  get [campo]() {
    return this.righe.reduce((s, n) => s + n, 0);
  },
};
console.log(ordine.totale); // => 60

/* ------------------------------------------------------------
   12) Static getter: costanti/configurazione a livello di classe
   ------------------------------------------------------------ */
class Config {
  static get VERSIONE() {
    return '1.0.0';
  }
  static get IVA() {
    return 0.22;
  }
}
console.log(Config.VERSIONE); // => 1.0.0
console.log(Config.IVA);      // => 0.22

/* ============================================================
   SPUNTI DAL GESTIONALE ERP (pattern reali adattati a JS puro)
   ============================================================ */

/* ------------------------------------------------------------
   13) ERP - Dipendente: codiceBadge normalizzato e validato su set
   Pattern: String(v||'').trim().toUpperCase().replace(/\s+/g,'')
   ------------------------------------------------------------ */
class Dipendente {
  #badge = '';
  constructor(nome, cognome) {
    this.nome = nome;
    this.cognome = cognome;
  }
  get nomeCompleto() {
    return `${this.nome} ${this.cognome}`;
  }
  get codiceBadge() {
    return this.#badge;
  }
  set codiceBadge(v) {
    const pulito = String(v || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
    if (!/^[A-Z]{2}-\d{3}$/.test(pulito)) {
      throw new Error(`badge non valido: ${pulito} (atteso XX-000)`);
    }
    this.#badge = pulito;
  }
  // numero progressivo estratto dal badge (computed read-only)
  get numeroBadge() {
    const m = this.#badge.match(/-(\d+)$/);
    return m ? Number(m[1]) : null;
  }
}
const dip = new Dipendente('Anna', 'Bianchi');
dip.codiceBadge = '  up-001  ';
console.log(dip.codiceBadge); // => UP-001
console.log(dip.numeroBadge); // => 1
console.log(dip.nomeCompleto); // => Anna Bianchi

/* ------------------------------------------------------------
   14) ERP - Timbratura naive-UTC: setter che valida HH:MM e
   getter che calcola le ore lavorate (valore derivato)
   ------------------------------------------------------------ */
class Timbratura {
  #ingresso = null;
  #uscita = null;
  static #toMinuti(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }
  set ingresso(v) {
    if (!/^\d{2}:\d{2}$/.test(v)) throw new Error('formato HH:MM richiesto');
    this.#ingresso = v;
  }
  set uscita(v) {
    if (!/^\d{2}:\d{2}$/.test(v)) throw new Error('formato HH:MM richiesto');
    this.#uscita = v;
  }
  get ingresso() {
    return this.#ingresso;
  }
  get uscita() {
    return this.#uscita;
  }
  get oreLavorate() {
    if (!this.#ingresso || !this.#uscita) return 0;
    const diff = Timbratura.#toMinuti(this.#uscita) - Timbratura.#toMinuti(this.#ingresso);
    return Math.round((diff / 60) * 100) / 100;
  }
}
const tb = new Timbratura();
tb.ingresso = '08:30';
tb.uscita = '17:00';
console.log(tb.oreLavorate); // => 8.5

/* ------------------------------------------------------------
   15) ERP - Articolo vestiario/DPI: getter sottoScorta deriva
   lo stato dal confronto quantita vs scortaMinima
   ------------------------------------------------------------ */
class ArticoloDPI {
  constructor(descrizione, quantita, scortaMinima) {
    this.descrizione = descrizione;
    this._quantita = quantita;
    this.scortaMinima = scortaMinima;
  }
  get quantita() {
    return this._quantita;
  }
  set quantita(v) {
    if (v < 0) throw new RangeError('quantita non puo essere negativa');
    this._quantita = v;
  }
  get sottoScorta() {
    return this._quantita < this.scortaMinima;
  }
  get stato() {
    return this.sottoScorta ? 'DA RIORDINARE' : 'OK';
  }
}
const guanti = new ArticoloDPI('Guanti antitaglio', 3, 10);
console.log(guanti.sottoScorta); // => true
console.log(guanti.stato);       // => DA RIORDINARE
guanti.quantita = 25;
console.log(guanti.stato);       // => OK

/* ------------------------------------------------------------
   16) ERP - Turno: setter con default e validazione regola
   pausa; getter durataNetta toglie la pausa
   ------------------------------------------------------------ */
class Turno {
  #orarioRange = '';
  constructor(nome, conPausa = true) {
    this.nome = nome;
    this.conPausa = conPausa;
  }
  set orario(v) {
    // accetta "08:00-17:00" o con trattino lungo
    const m = v.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (!m) throw new Error('range orario non valido');
    this.#orarioRange = v;
  }
  get orario() {
    return this.#orarioRange;
  }
  get durataNetta() {
    const m = this.#orarioRange.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (!m) return 0;
    const minuti = (Number(m[3]) * 60 + Number(m[4])) - (Number(m[1]) * 60 + Number(m[2]));
    const pausa = this.conPausa ? 60 : 0;
    return (minuti - pausa) / 60;
  }
}
const p4 = new Turno('P4', true);
p4.orario = '08:00-17:00';
console.log(p4.durataNetta); // => 8
const p2 = new Turno('P2', false);
p2.orario = '09:00–13:00';
console.log(p2.durataNetta); // => 4

/* ------------------------------------------------------------
   17) Pattern: oggetto "validato" via Proxy + accessor (avanzato)
   Quando i campi sono dinamici, Object.defineProperty in loop
   ------------------------------------------------------------ */
function creaModello(regole) {
  const dati = {};
  const modello = {};
  for (const [campo, valida] of Object.entries(regole)) {
    Object.defineProperty(modello, campo, {
      get() {
        return dati[campo];
      },
      set(v) {
        if (!valida(v)) throw new Error(`campo ${campo} non valido: ${v}`);
        dati[campo] = v;
      },
      enumerable: true,
    });
  }
  return modello;
}
const reparto = creaModello({
  sigla: (v) => /^[A-Z]{2}$/.test(v),
  nome: (v) => typeof v === 'string' && v.length > 0,
});
reparto.sigla = 'UP';
reparto.nome = 'Ufficio Produzione';
console.log(reparto.sigla); // => UP
try {
  reparto.sigla = 'xyz';
} catch (err) {
  console.log(err.message); // => campo sigla non valido: xyz
}

/* ------------------------------------------------------------
   18) Setter che mantiene invarianti tra piu' campi
   (es: data fine sempre >= data inizio)
   ------------------------------------------------------------ */
class Periodo {
  #inizio;
  #fine;
  set inizio(v) {
    this.#inizio = v;
  }
  set fine(v) {
    if (this.#inizio && v < this.#inizio) {
      throw new Error('fine non puo precedere inizio');
    }
    this.#fine = v;
  }
  get giorni() {
    if (!this.#inizio || !this.#fine) return 0;
    return Math.round((new Date(this.#fine) - new Date(this.#inizio)) / 86400000);
  }
}
const ferie = new Periodo();
ferie.inizio = '2026-08-01';
ferie.fine = '2026-08-15';
console.log(ferie.giorni); // => 14

/* ============================================================
   RIEPILOGO COMANDI
   - get prop() {}            getter in object/class
   - set prop(v) {}           setter in object/class
   - #campo                   private field (incapsulamento)
   - this._campo              convenzione backing field
   - get/set static prop()    accessor a livello di classe
   - super.prop               accesso al getter del padre
   - get [nomeDinamico]()     computed property name
   - Object.defineProperty(obj, k, { get, set, enumerable, configurable })
   - Object.getOwnPropertyDescriptor(obj, k)  ispeziona get/set
   - throw new TypeError/RangeError/Error      validazione su set
   - Object.defineProperty(this,k,{value})     getter lazy/memoized
   ============================================================ */
