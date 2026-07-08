/* ============================================================
   39 JS This
   La keyword `this` e' un riferimento dinamico che dipende da
   COME una funzione viene chiamata, non da dove e' definita.
   Cambia valore in: contesto globale, metodo di oggetto,
   costruttore/classe, callback, e funzioni invocate con
   call/apply/bind. Le arrow function fanno eccezione: NON hanno
   un proprio `this`, lo ereditano dallo scope lessicale esterno.
   Questo file copre tutti questi casi da base ad avanzato.
   ============================================================ */

'use strict';

// ============================================================
// 1) THIS NEL CONTESTO GLOBALE
// ============================================================

// In una funzione normale chiamata "da sola", in strict mode
// this e' undefined (in sloppy mode sarebbe l'oggetto globale).
function mostraThis() {
  return this;
}
console.log(mostraThis()); // => undefined (strict mode)

// In Node, al top-level di un modulo CommonJS, this === module.exports
console.log(this === module.exports); // => true

// Negli arrow al top-level this eredita dal contesto del modulo
const arrowTop = () => this;
console.log(arrowTop() === module.exports); // => true

// ============================================================
// 2) THIS COME METODO DI UN OGGETTO
// ============================================================

// Quando chiami obj.metodo(), this === obj (l'oggetto a sinistra del punto)
const dipendente = {
  nome: 'Mario',
  cognome: 'Rossi',
  nomeCompleto() {
    return `${this.nome} ${this.cognome}`;
  },
};
console.log(dipendente.nomeCompleto()); // => "Mario Rossi"

// ATTENZIONE: conta chi invoca, non dove e' definito il metodo.
const fnStaccata = dipendente.nomeCompleto;
// fnStaccata(); // => TypeError: this e' undefined (chiamata "nuda")

// Riassegnando il metodo a un altro oggetto, this cambia
const altro = { nome: 'Luigi', cognome: 'Verdi', nomeCompleto: dipendente.nomeCompleto };
console.log(altro.nomeCompleto()); // => "Luigi Verdi"

// Metodi annidati: this segue sempre l'ultimo "punto"
const reparto = {
  sigla: 'UP',
  badge: {
    sigla: 'BG',
    stampa() {
      return this.sigla;
    },
  },
};
console.log(reparto.badge.stampa()); // => "BG"

// ============================================================
// 3) THIS NEL COSTRUTTORE (new) E NELLE CLASSI
// ============================================================

// Con `new`, this e' il nuovo oggetto appena creato
function Dipendente(nome, badge) {
  this.nome = nome;
  this.badge = badge;
}
Dipendente.prototype.descrivi = function () {
  return `${this.nome} (${this.badge})`;
};
const d1 = new Dipendente('Anna', 'UP-001');
console.log(d1.descrivi()); // => "Anna (UP-001)"

// Stessa cosa con la sintassi class (piu' moderna)
class Timbratura {
  constructor(badge, ingresso) {
    this.badge = badge;
    this.ingresso = ingresso; // stringa "HH:MM"
  }
  riepilogo() {
    return `${this.badge} entrato alle ${this.ingresso}`;
  }
}
const t1 = new Timbratura('UP-002', '08:30');
console.log(t1.riepilogo()); // => "UP-002 entrato alle 08:30"

// ============================================================
// 4) IL PROBLEMA: PERDITA DI THIS NEI CALLBACK
// ============================================================

// Passando un metodo come callback, perde il binding all'oggetto
const contatore = {
  totale: 0,
  aggiungi() {
    this.totale += 1;
  },
};
// [1, 2, 3].forEach(contatore.aggiungi); // => TypeError: this undefined

// Soluzione classica: wrapper arrow che preserva this
[1, 2, 3].forEach(() => contatore.aggiungi());
console.log(contatore.totale); // => 3

// ============================================================
// 5) CALL e APPLY: invocano subito cambiando this
// ============================================================

// call(thisArg, arg1, arg2, ...) -> argomenti separati
function saluta(prefisso, suffisso) {
  return `${prefisso} ${this.nome}${suffisso}`;
}
const persona = { nome: 'Giulia' };
console.log(saluta.call(persona, 'Ciao', '!')); // => "Ciao Giulia!"

// apply(thisArg, [args]) -> argomenti in un array
console.log(saluta.apply(persona, ['Salve', '.'])); // => "Salve Giulia."

// apply utile per "spalmare" array (anche se oggi si usa lo spread)
const minuti = [120, 30, 480];
console.log(Math.max.apply(null, minuti)); // => 480
console.log(Math.max(...minuti)); // => 480 (versione moderna)

// Prendere in prestito un metodo (method borrowing)
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr); // => ["a", "b"]

// ============================================================
// 6) BIND: crea una NUOVA funzione con this fissato
// ============================================================

// bind non invoca: restituisce una copia legata permanentemente
const salutaGiulia = saluta.bind(persona);
console.log(salutaGiulia('Hey', '?')); // => "Hey Giulia?"

// Risolve la perdita di this nei callback in modo pulito
const contatore2 = {
  totale: 0,
  aggiungi() {
    this.totale += 1;
  },
};
[1, 2, 3, 4].forEach(contatore2.aggiungi.bind(contatore2));
console.log(contatore2.totale); // => 4

// Partial application: bind fissa anche gli argomenti iniziali
function moltiplica(a, b) {
  return a * b;
}
const doppio = moltiplica.bind(null, 2);
console.log(doppio(21)); // => 42

// ============================================================
// 7) ARROW FUNCTION vs FUNZIONE NORMALE
// ============================================================

// L'arrow NON ha un proprio this: lo eredita dallo scope esterno.
// Questo la rende perfetta per i callback dentro i metodi.
const turno = {
  nome: 'P4',
  pause: [15, 30, 15],
  totalePauseSbagliato() {
    // funzione normale dentro map -> this NON e' turno
    return this.pause.map(function (p) {
      // return `${this.nome}:${p}`; // this undefined qui
      return p;
    });
  },
  totalePauseGiusto() {
    // arrow eredita this da totalePauseGiusto -> this === turno
    return this.pause.map((p) => `${this.nome}:${p}`);
  },
};
console.log(turno.totalePauseGiusto()); // => ["P4:15","P4:30","P4:15"]

// ATTENZIONE: un metodo definito come arrow NON lega all'oggetto,
// ma allo scope di definizione (qui il modulo).
const oggettoArrow = {
  nome: 'X',
  saluta: () => `Ciao ${this?.nome}`, // this NON e' oggettoArrow
};
console.log(oggettoArrow.saluta()); // => "Ciao undefined"

// call/apply/bind NON cambiano il this di un'arrow (e' lessicale)
const arrowFissa = () => this;
console.log(arrowFissa.call({ x: 1 }) === module.exports); // => true

// ============================================================
// 8) ARROW NELLE CLASSI: class fields auto-bindati
// ============================================================

// Un campo arrow nella classe cattura this dell'istanza:
// utile per passare il metodo come callback senza perdere this.
class RegistroTimbrature {
  constructor() {
    this.records = [];
  }
  // campo arrow: this resta sempre l'istanza
  registra = (badge, ora) => {
    this.records.push({ badge, ora });
  };
}
const reg = new RegistroTimbrature();
const callback = reg.registra; // staccato, ma resta legato
callback('UP-003', '09:00');
console.log(reg.records); // => [{ badge: "UP-003", ora: "09:00" }]

// ============================================================
// 9) ESEMPIO ERP: somma minuti lavorati con this corretto
// ============================================================

// Pattern reale: filter().reduce() su richieste, mantenendo this
const calcolatore = {
  soglia: 0,
  approvata(r) {
    return r.minuti > this.soglia;
  },
  totaleApprovate(richieste) {
    // arrow nel filter eredita this -> usa this.soglia
    return richieste
      .filter((r) => this.approvata(r))
      .reduce((acc, r) => acc + r.minuti, 0);
  },
};
const richieste = [{ minuti: 120 }, { minuti: 0 }, { minuti: 480 }];
console.log(calcolatore.totaleApprovate(richieste)); // => 600

// ============================================================
// 10) ESEMPIO ERP: orario naive-UTC con this in una classe
// ============================================================

// Lettura ora di Roma e formattazione HH:MM (pattern timbrature).
class OrologioRoma {
  constructor(timeZone = 'Europe/Rome') {
    this.timeZone = timeZone;
    this.fmt = new Intl.DateTimeFormat('it-IT', {
      timeZone: this.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  oraCorrente(data = new Date()) {
    // this.fmt e' l'istanza Intl legata alla classe
    return this.fmt.format(data);
  }
}
const orologio = new OrologioRoma();
console.log(typeof orologio.oraCorrente()); // => "string" (es. "14:35")

// padStart per HH:MM da numeri (pattern naive-UTC)
function hhmm(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
console.log(hhmm(8, 5)); // => "08:05"

// ============================================================
// 11) ESEMPIO ERP: badge e method borrowing
// ============================================================

// Normalizza un codice badge tipo 'UP-001' (pattern stringa ERP)
const normalizzatore = {
  prefisso: 'UP',
  formatta(numero) {
    return `${this.prefisso}-${String(numero).padStart(3, '0')}`;
  },
};
console.log(normalizzatore.formatta(7)); // => "UP-007"

// Riuso del metodo su un altro reparto via call
const repartoBG = { prefisso: 'BG' };
console.log(normalizzatore.formatta.call(repartoBG, 12)); // => "BG-012"

// ============================================================
// 12) RIASSUNTO REGOLE DI PRIORITA' DI THIS
// ============================================================

// Ordine di precedenza nello stabilire this:
// 1. new Foo()        -> il nuovo oggetto
// 2. call/apply/bind  -> il thisArg esplicito
// 3. obj.metodo()     -> obj (l'oggetto chiamante)
// 4. chiamata nuda    -> undefined (strict) / globalThis (sloppy)
// 5. arrow function   -> this lessicale (ignora tutto il resto)
const provaPriorita = {
  v: 'metodo',
  leggi() {
    return this.v;
  },
};
console.log(provaPriorita.leggi()); // => "metodo"
console.log(provaPriorita.leggi.call({ v: 'forzato' })); // => "forzato"

/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   ------------------------------------------------------------
   this (globale)            -> undefined (strict) / module.exports (Node)
   obj.metodo()              -> this === obj
   new Costruttore()         -> this === nuova istanza
   class { metodo() }        -> this === istanza
   fn.call(thisArg, a, b)    -> invoca con this e args separati
   fn.apply(thisArg, [a,b])  -> invoca con this e args in array
   fn.bind(thisArg, ...args) -> nuova funzione con this fissato
   () => {}                  -> arrow: this lessicale (non rilegabile)
   campo = () => {}          -> class field auto-bindato all'istanza
   Array.prototype.x.call()  -> method borrowing
   Math.max.apply(null, arr) -> spalmare array (oggi: Math.max(...arr))
   ============================================================ */
