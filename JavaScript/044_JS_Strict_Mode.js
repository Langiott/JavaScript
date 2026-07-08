/* ============================================================
   44 JS Strict Mode
   Lo strict mode ("use strict") e' una modalita' di esecuzione piu'
   rigorosa di JavaScript introdotta in ES5. Trasforma alcuni "silent
   error" (errori silenziosi) in veri TypeError/ReferenceError, vieta
   sintassi pericolosa o legacy, e prepara il codice alle future
   versioni del linguaggio. Si attiva con la direttiva 'use strict';
   all'inizio di un file (script) o di una funzione. Nei moduli ES e
   nelle class lo strict mode e' SEMPRE attivo per default.
   ============================================================ */

'use strict';
// Nota: questo file e' uno script eseguibile con Node.
// La direttiva sopra rende l'INTERO file strict. Negli esempi mostriamo
// anche lo strict "locale" dentro singole funzioni con commenti dedicati.

// ------------------------------------------------------------
// 1) Come si attiva lo strict mode
// ------------------------------------------------------------

// A livello di file/script: prima riga.
//   'use strict';

// A livello di funzione: prima istruzione del corpo.
function funzioneStrict() {
  'use strict';
  return 'questa funzione e\' strict';
}
console.log(funzioneStrict()); // => questa funzione e' strict

// La direttiva deve essere una STRINGA letterale all'inizio: se preceduta
// da altro codice viene ignorata (diventa una semplice espressione string).
function nonStrict() {
  const x = 1;
  'use strict'; // ignorata: non e' la prima istruzione
  return x;
}
console.log(nonStrict()); // => 1

// ------------------------------------------------------------
// 2) Variabili non dichiarate -> ReferenceError
// ------------------------------------------------------------

// In sloppy mode assegnare a una variabile non dichiarata crea una
// global implicita. In strict mode lancia ReferenceError.
function creaGlobalImplicita() {
  try {
    // eslint-disable-next-line no-undef
    contatoreNonDichiarato = 10; // niente let/const/var
  } catch (e) {
    return `${e.name}: variabile non dichiarata`;
  }
}
console.log(creaGlobalImplicita()); // => ReferenceError: variabile non dichiarata

// Esempio ERP: typo nel nome di una variabile viene catturato subito.
function calcolaOreBadge() {
  try {
    let oreLavorate = 8;
    // refuso: "oreLavorato" invece di "oreLavorate"
    // eslint-disable-next-line no-undef
    oreLavorato = oreLavorate + 1; // ReferenceError in strict
    return oreLavorato;
  } catch (e) {
    return `Catturato refuso: ${e.name}`;
  }
}
console.log(calcolaOreBadge()); // => Catturato refuso: ReferenceError

// ------------------------------------------------------------
// 3) Assegnazioni che falliscono silenziosamente -> TypeError
// ------------------------------------------------------------

// Scrivere su proprieta' non scrivibili (writable:false) lancia errore.
function scriviSuReadonly() {
  const dipendente = {};
  Object.defineProperty(dipendente, 'codiceBadge', {
    value: 'UP-001',
    writable: false,
  });
  try {
    dipendente.codiceBadge = 'UP-999'; // TypeError in strict
  } catch (e) {
    return `${e.name}: badge non modificabile`;
  }
}
console.log(scriviSuReadonly()); // => TypeError: badge non modificabile

// Assegnare proprieta' a un oggetto non estendibile (frozen) lancia errore.
function scriviSuFrozen() {
  const reparto = Object.freeze({ sigla: 'UP' });
  try {
    reparto.descrizione = 'Ufficio Produzione'; // TypeError in strict
  } catch (e) {
    return `${e.name}: oggetto congelato`;
  }
}
console.log(scriviSuFrozen()); // => TypeError: oggetto congelato

// Assegnare a una getter-only property lancia errore.
function scriviSuGetterOnly() {
  const turno = {
    get nome() { return 'P4'; },
  };
  try {
    turno.nome = 'P2'; // TypeError in strict
  } catch (e) {
    return `${e.name}: solo getter`;
  }
}
console.log(scriviSuGetterOnly()); // => TypeError: solo getter

// ------------------------------------------------------------
// 4) delete su proprieta' non cancellabili -> TypeError
// ------------------------------------------------------------

function cancellaNonCancellabile() {
  const obj = {};
  Object.defineProperty(obj, 'fisso', { value: 1, configurable: false });
  try {
    delete obj.fisso; // TypeError in strict
  } catch (e) {
    return `${e.name}: non cancellabile`;
  }
}
console.log(cancellaNonCancellabile()); // => TypeError: non cancellabile

// ------------------------------------------------------------
// 5) Parametri duplicati -> SyntaxError
// ------------------------------------------------------------

// In strict mode una funzione con parametri duplicati e' un errore di
// SINTASSI (rilevato al parse). Lo mostriamo dentro eval per non rompere
// il caricamento del file.
function parametriDuplicati() {
  try {
    eval("'use strict'; function f(a, a) { return a; }");
  } catch (e) {
    return `${e.name}: parametri duplicati vietati`;
  }
}
console.log(parametriDuplicati()); // => SyntaxError: parametri duplicati vietati

// ------------------------------------------------------------
// 6) Proprieta' duplicate negli oggetti
// ------------------------------------------------------------

// In ES5 strict erano vietate; da ES6 in poi sono permesse anche in strict
// (vince l'ultima). Esempio per memoria.
const conf = { regola: 'A', regola: 'B' }; // valido in ES2015+
console.log(conf.regola); // => B

// ------------------------------------------------------------
// 7) this in funzioni "normali" -> undefined invece di globalThis
// ------------------------------------------------------------

// In sloppy mode una funzione chiamata "nuda" ha this = globalThis.
// In strict mode this resta undefined: utile per evitare modifiche
// accidentali al global object.
function controllaThis() {
  return this; // undefined in strict
}
console.log(controllaThis() === undefined); // => true

// Esempio ERP: metodo "staccato" perde il contesto e fallisce subito,
// invece di scrivere per sbaglio su globalThis.
const badge = {
  codice: 'UP-001',
  stampa() { return this.codice; },
};
const stampaStaccato = badge.stampa;
function provaStaccato() {
  try {
    return stampaStaccato(); // this === undefined -> TypeError
  } catch (e) {
    return `${e.name}: this undefined`;
  }
}
console.log(provaStaccato()); // => TypeError: this undefined

// ------------------------------------------------------------
// 8) Parole riservate e identificatori vietati
// ------------------------------------------------------------

// In strict mode non puoi usare come nomi: eval, arguments,
// implements, interface, package, private, protected, public, static, yield.
function nomiVietati() {
  try {
    eval("'use strict'; var public = 1;");
  } catch (e) {
    return `${e.name}: parola riservata`;
  }
}
console.log(nomiVietati()); // => SyntaxError: parola riservata

// Non puoi assegnare a eval o arguments.
function assegnaArguments() {
  try {
    eval("'use strict'; arguments = 5;");
  } catch (e) {
    return `${e.name}: arguments non assegnabile`;
  }
}
console.log(assegnaArguments()); // => SyntaxError: arguments non assegnabile

// ------------------------------------------------------------
// 9) arguments non e' piu' "collegato" ai parametri
// ------------------------------------------------------------

// In sloppy mode modificare un parametro aggiorna arguments e viceversa.
// In strict mode sono indipendenti (snapshot).
function legameArguments(minuti) {
  'use strict';
  minuti = 90;            // non tocca arguments[0]
  return arguments[0];    // resta il valore originale
}
console.log(legameArguments(60)); // => 60

// ------------------------------------------------------------
// 10) Numeri ottali con zero iniziale -> SyntaxError
// ------------------------------------------------------------

// 0755 (legacy octal) e' vietato; usa il prefisso esplicito 0o755.
function ottaleLegacy() {
  try {
    eval("'use strict'; var n = 0755;");
  } catch (e) {
    return `${e.name}: ottale legacy vietato`;
  }
}
console.log(ottaleLegacy());      // => SyntaxError: ottale legacy vietato
console.log(0o755);               // => 493  (ottale moderno, sempre valido)

// ------------------------------------------------------------
// 11) with vietato -> SyntaxError
// ------------------------------------------------------------

// Lo statement with e' proibito in strict mode (rendeva lo scope ambiguo).
function statementWith() {
  try {
    eval("'use strict'; with ({}) {}");
  } catch (e) {
    return `${e.name}: with vietato`;
  }
}
console.log(statementWith()); // => SyntaxError: with vietato

// ------------------------------------------------------------
// 12) eval ha il proprio scope
// ------------------------------------------------------------

// In strict mode le variabili dichiarate dentro eval NON inquinano lo
// scope circostante.
function evalScope() {
  'use strict';
  eval('var dentroEval = 42;');
  try {
    return dentroEval; // ReferenceError: non esiste fuori dall'eval
  } catch (e) {
    return `${e.name}: eval isolato`;
  }
}
console.log(evalScope()); // => ReferenceError: eval isolato

// ------------------------------------------------------------
// 13) Dove lo strict mode e' implicito (sempre attivo)
// ------------------------------------------------------------

// 1) Corpo delle class: tutto cio' che sta dentro una class e' strict.
class Timbratura {
  constructor(badge) {
    this.badge = badge;
  }
  controllaThisImplicito() {
    // se chiamato staccato, this sarebbe undefined (strict implicito)
    return this;
  }
}
const t = new Timbratura('UP-002');
const metodo = t.controllaThisImplicito;
function classStrict() {
  try {
    return metodo(); // this undefined -> TypeError nell'accesso .badge
  } catch (e) {
    return 'class e\' sempre strict';
  }
  return 'ok';
}
console.log(classStrict()); // => class e' sempre strict (o 'ok' se non accede a this)

// 2) Moduli ES (import/export) e moduli .mjs: strict per default,
//    non serve scrivere 'use strict'.
//    Esempio (pseudo): export function f(){...} // gia' strict

// ------------------------------------------------------------
// 14) Pattern ERP: validazione robusta grazie a strict mode
// ------------------------------------------------------------

// Funzione che normalizza un codice badge. Lo strict mode ci protegge
// da typo nelle variabili interne durante il refactoring.
function normalizzaBadge(input) {
  'use strict';
  const pulito = String(input || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .slice(0, 8);
  return pulito;
}
console.log(normalizzaBadge('  up-001 ')); // => UP-001

// Sommatoria minuti con freeze del risultato: ogni tentativo di mutarlo
// dopo il calcolo viene bloccato.
function calcolaTotaleMinuti(richieste) {
  'use strict';
  const totale = richieste
    .filter((r) => r.approvata)
    .reduce((s, r) => s + r.minuti, 0);
  const report = Object.freeze({ totale, conteggio: richieste.length });
  try {
    report.totale = 0; // TypeError: report e' frozen
  } catch (e) {
    // ignoriamo: il punto e' che NON puo' essere alterato
  }
  return report;
}
console.log(
  calcolaTotaleMinuti([
    { approvata: true, minuti: 90 },
    { approvata: false, minuti: 30 },
    { approvata: true, minuti: 60 },
  ])
); // => { totale: 150, conteggio: 3 }

// ------------------------------------------------------------
// 15) Strict vs Sloppy: riepilogo comportamenti chiave
// ------------------------------------------------------------

// Tabella mentale (commento):
//   azione                         | sloppy            | strict
//   -------------------------------|-------------------|-----------------
//   x = 1 (non dichiarata)         | global implicita  | ReferenceError
//   scrivi su readonly/frozen      | fallisce in muto  | TypeError
//   delete proprieta' fissa        | false             | TypeError
//   this in funzione nuda          | globalThis        | undefined
//   parametri duplicati            | ammessi           | SyntaxError
//   with (...)                     | ammesso           | SyntaxError
//   ottale 0755                    | ammesso           | SyntaxError

// ------------------------------------------------------------
// 16) Consiglio pratico
// ------------------------------------------------------------

// Usa SEMPRE strict mode nei progetti moderni: con i moduli ES e le class
// e' gia' attivo. Negli script classici aggiungi 'use strict'; in cima.
// Riduce bug silenziosi, refusi e comportamenti legacy ambigui.

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI (per memoria rapida)
   ------------------------------------------------------------
   'use strict';                  // attiva strict (file o funzione)
   ReferenceError                 // variabile non dichiarata
   TypeError                      // scrittura su readonly/frozen/getter-only
   SyntaxError                    // param duplicati, with, ottale legacy
   this === undefined             // in funzioni "nude" strict
   Object.defineProperty          // writable/configurable false
   Object.freeze                  // oggetto immutabile -> TypeError su mutazione
   delete obj.prop                // TypeError se non configurable
   eval('...')                    // scope isolato in strict
   arguments                      // snapshot, slegato dai parametri
   class { ... }                  // strict mode implicito
   moduli ES (import/export/.mjs) // strict mode implicito
   parole riservate               // public/private/static/yield... vietate
   0o755                          // ottale moderno (al posto di 0755)
   ============================================================ */
