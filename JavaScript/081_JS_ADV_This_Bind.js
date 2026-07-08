/* ============================================================
   81 JS ADV This Bind
   In questo file approfondiamo il valore di "this" e i tre metodi
   che permettono di controllarlo esplicitamente: call, apply e bind.
   Vedremo come "this" cambia in base al call-site (chi chiama la
   funzione), come avviene la "perdita di this" (this binding loss)
   quando passiamo un metodo come callback, e come usare bind per il
   currying / partial application. Le arrow function non hanno un
   proprio "this" (lexical this) e questo le rende utili per evitare
   il binding loss. Tutti i concetti tecnici restano in inglese.
   ============================================================ */

'use strict';

// ------------------------------------------------------------
// 1) RIPASSO: da cosa dipende "this" (regola del call-site)
// ------------------------------------------------------------
// "this" NON dipende da dove la funzione e' definita, ma da COME
// viene chiamata (il call-site). Quattro regole principali:
//  a) chiamata come metodo: obj.fn()  -> this = obj
//  b) chiamata "libera": fn()         -> this = undefined (strict) / global
//  c) chiamata con new: new Fn()      -> this = nuovo oggetto
//  d) chiamata con call/apply/bind     -> this = quello che imponi

const dipendente = {
  nome: 'Mario',
  cognome: 'Rossi',
  saluta() {
    return `Ciao, sono ${this.nome} ${this.cognome}`;
  },
};
console.log(dipendente.saluta()); // => Ciao, sono Mario Rossi

// chiamata libera: perdiamo il contesto
const f = dipendente.saluta;
try {
  f(); // this = undefined in strict mode -> errore
} catch (e) {
  console.log('Errore (this perso):', e.constructor.name); // => TypeError
}

// ------------------------------------------------------------
// 2) call(thisArg, ...args): invoca subito, args separati
// ------------------------------------------------------------
function descrivi(prefisso, suffisso) {
  return `${prefisso} ${this.nome} ${this.cognome}${suffisso}`;
}
console.log(descrivi.call(dipendente, 'Dip:', '!')); // => Dip: Mario Rossi!

// "prestare" un metodo a un oggetto diverso (method borrowing)
const altro = { nome: 'Luigi', cognome: 'Verdi' };
console.log(dipendente.saluta.call(altro)); // => Ciao, sono Luigi Verdi

// ------------------------------------------------------------
// 3) apply(thisArg, [args]): come call, ma args in un array
// ------------------------------------------------------------
console.log(descrivi.apply(dipendente, ['Badge:', ' UP-001'])); // => Badge: Mario Rossi UP-001

// Caso classico: passare un array dove serve una lista di argomenti.
const minuti = [480, 30, 455, 12];
console.log(Math.max.apply(null, minuti)); // => 480
// Versione moderna con spread (preferita):
console.log(Math.max(...minuti)); // => 480

// method borrowing classico: trasformare un array-like in array
function argomentiInArray() {
  return Array.prototype.slice.call(arguments);
}
console.log(argomentiInArray('a', 'b', 'c')); // => [ 'a', 'b', 'c' ]

// ------------------------------------------------------------
// 4) bind(thisArg, ...args): NON invoca, ritorna una nuova funzione
// ------------------------------------------------------------
const salutaMario = dipendente.saluta.bind(dipendente);
console.log(salutaMario()); // => Ciao, sono Mario Rossi
// Ora possiamo passarla in giro senza perdere "this":
const callbacks = [salutaMario, salutaMario];
callbacks.forEach((cb) => console.log(cb())); // => Ciao, sono Mario Rossi (x2)

// ------------------------------------------------------------
// 5) PERDITA DI THIS (this binding loss) nei callback
// ------------------------------------------------------------
// Pattern reale: un "registratore timbrature" con stato interno.
const registroTimbrature = {
  badge: 'UP-001',
  eventi: [],
  // metodo che usa this.badge -> fragile se passato come callback
  timbra(tipo) {
    this.eventi.push(`${this.badge}:${tipo}`);
    return this.eventi.length;
  },
};

// PROBLEMA: passando il metodo "nudo" a un iteratore, this si perde.
const tipi = ['ingresso', 'uscita'];
try {
  tipi.forEach(registroTimbrature.timbra); // this = undefined dentro timbra
} catch (e) {
  console.log('Binding loss:', e.constructor.name); // => TypeError
}

// SOLUZIONE A: bind
tipi.forEach(registroTimbrature.timbra.bind(registroTimbrature));
console.log(registroTimbrature.eventi); // => [ 'UP-001:ingresso', 'UP-001:uscita' ]

// SOLUZIONE B: arrow wrapper (lexical this non c'entra, ma chiudiamo su obj)
registroTimbrature.eventi = [];
tipi.forEach((t) => registroTimbrature.timbra(t));
console.log(registroTimbrature.eventi); // => [ 'UP-001:ingresso', 'UP-001:uscita' ]

// SOLUZIONE C: secondo argomento di forEach (thisArg)
registroTimbrature.eventi = [];
['rientro'].forEach(function (t) {
  this.timbra(t);
}, registroTimbrature);
console.log(registroTimbrature.eventi); // => [ 'UP-001:rientro' ]

// ------------------------------------------------------------
// 6) Arrow function e LEXICAL this
// ------------------------------------------------------------
// Le arrow NON hanno proprio this: lo ereditano dallo scope esterno.
// Quindi call/apply/bind NON cambiano il loro this.
const reparto = {
  sigla: 'PR',
  membri: ['Mario', 'Luigi'],
  // arrow dentro map: this resta quello di stampaMembri
  stampaMembri() {
    return this.membri.map((m) => `[${this.sigla}] ${m}`);
  },
};
console.log(reparto.stampaMembri()); // => [ '[PR] Mario', '[PR] Luigi' ]

const arrowThis = () => this;
// bind non ha effetto sulle arrow:
console.log(arrowThis.call({ x: 1 }) === arrowThis.call({ x: 2 })); // => true

// ------------------------------------------------------------
// 7) PARTIAL APPLICATION con bind (pre-impostare argomenti)
// ------------------------------------------------------------
// bind congela non solo this ma anche i primi argomenti.
function arrotonda(step, minuti) {
  return Math.round(minuti / step) * step;
}
// creiamo varianti specializzate fissando "step":
const arrotonda5 = arrotonda.bind(null, 5);
const arrotonda15 = arrotonda.bind(null, 15);
console.log(arrotonda5(13)); // => 15
console.log(arrotonda15(7)); // => 0
console.log(arrotonda15(8)); // => 15

// partial application con un logger di reparto
function logEvento(reparto, livello, messaggio) {
  return `[${reparto}][${livello}] ${messaggio}`;
}
const logProduzione = logEvento.bind(null, 'PRODUZIONE');
const logProdError = logProduzione.bind(null, 'ERROR');
console.log(logProdError('macchina ferma')); // => [PRODUZIONE][ERROR] macchina ferma

// ------------------------------------------------------------
// 8) bind + new: i preset di bind restano, ma this viene ignorato
// ------------------------------------------------------------
function Badge(prefisso, numero) {
  this.codice = `${prefisso}-${String(numero).padStart(3, '0')}`;
}
const BadgeUP = Badge.bind(null, 'UP');
const b = new BadgeUP(7); // "null" viene ignorato perche' usiamo new
console.log(b.codice); // => UP-007
console.log(b instanceof Badge); // => true

// ------------------------------------------------------------
// 9) Implementare una bind "fatta a mano" (per capire come funziona)
// ------------------------------------------------------------
function myBind(fn, thisArg, ...preset) {
  return function (...later) {
    return fn.apply(thisArg, [...preset, ...later]);
  };
}
const sommaMin = (a, b) => a + b;
const piu480 = myBind(sommaMin, null, 480);
console.log(piu480(30)); // => 510

// ------------------------------------------------------------
// 10) Caso pratico ERP: contatore con this perso negli eventi
// ------------------------------------------------------------
// Simuliamo un "timer" che ogni tick incrementa ore lavorate.
class CronometroTurno {
  constructor(badge) {
    this.badge = badge;
    this.minuti = 0;
  }
  // se passassimo this.tick a setInterval, this si perderebbe:
  tick() {
    this.minuti += 1;
    return `${this.badge}: ${this.minuti} min`;
  }
  // arrow come property: lega this all'istanza (class field)
  tickArrow = () => {
    this.minuti += 1;
    return `${this.badge}: ${this.minuti} min`;
  };
}
const cron = new CronometroTurno('UP-001');
// tick "nudo" perde this:
const tickNudo = cron.tick;
try {
  tickNudo();
} catch (e) {
  console.log('tick perde this:', e.constructor.name); // => TypeError
}
// soluzioni: bind oppure usare la versione arrow (class field)
const tickOk = cron.tick.bind(cron);
console.log(tickOk()); // => UP-001: 1 min
const tickArrowNudo = cron.tickArrow; // arrow field: this gia' legato
console.log(tickArrowNudo()); // => UP-001: 2 min

// ------------------------------------------------------------
// 11) call per ereditarieta' "vecchio stile" (constructor stealing)
// ------------------------------------------------------------
function Persona(nome, cognome) {
  this.nome = nome;
  this.cognome = cognome;
}
function Operaio(nome, cognome, reparto) {
  Persona.call(this, nome, cognome); // riusa il costruttore base
  this.reparto = reparto;
}
const op = new Operaio('Mario', 'Rossi', 'PR');
console.log(op); // => Operaio { nome: 'Mario', cognome: 'Rossi', reparto: 'PR' }

// ------------------------------------------------------------
// 12) apply per concatenare/spalmare (pre-spread), ancora utile a sapere
// ------------------------------------------------------------
const base = [1, 2];
Array.prototype.push.apply(base, [3, 4]); // push multiplo da array
console.log(base); // => [ 1, 2, 3, 4 ]

// ------------------------------------------------------------
// 13) Confronto rapido call vs apply vs bind
// ------------------------------------------------------------
function tot(a, b) {
  return this.label + ': ' + (a + b);
}
const ctx = { label: 'TOT' };
console.log(tot.call(ctx, 10, 5)); // => TOT: 15  (invoca, args separati)
console.log(tot.apply(ctx, [10, 5])); // => TOT: 15  (invoca, args in array)
const totLegata = tot.bind(ctx, 10); // ritorna funzione, fissa a=10
console.log(totLegata(5)); // => TOT: 15

// ------------------------------------------------------------
// 14) Errore comune: bind a catena -> vince solo il PRIMO bind
// ------------------------------------------------------------
function chiSono() {
  return this.id;
}
const legataA = chiSono.bind({ id: 'A' });
const legataB = legataA.bind({ id: 'B' }); // ignorato!
console.log(legataB()); // => A

/* ============================================================
   RIEPILOGO COMANDI (scheda memoria rapida)
   ------------------------------------------------------------
   fn.call(thisArg, a, b)      -> invoca subito, args separati
   fn.apply(thisArg, [a, b])   -> invoca subito, args in array
   fn.bind(thisArg, ...preset) -> ritorna nuova funzione (this fisso)
   spread Math.max(...arr)     -> alternativa moderna ad apply
   Array.prototype.slice.call  -> array-like -> array (method borrowing)
   () => {}                     -> arrow: lexical this, ignora call/apply/bind
   class field = () => {}       -> metodo con this legato all'istanza
   Base.call(this, ...)         -> constructor stealing (ereditarieta')
   bind(null, x)                -> partial application / currying
   - perdita di this: metodo passato come callback "nudo" -> usa bind/arrow
   - bind a catena: vince il primo bind, i successivi sono ignorati
   - new su funzione bound: ignora il this legato, mantiene i preset
   ============================================================ */
