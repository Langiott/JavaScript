/* ============================================================
   27 JS Functions
   Le functions sono blocchi di codice riutilizzabili che eseguono
   un compito e (opzionalmente) restituiscono un valore con return.
   In questo file vediamo: function declaration vs function
   expression, parametri (default, rest, destructuring), il valore
   di ritorno, lo scope (global/function/block), la closure e
   l'hoisting delle funzioni. Esempi dal semplice all'avanzato,
   con spunti da un gestionale ERP (dipendenti, timbrature, turni).
   ============================================================ */

// ------------------------------------------------------------
// 1) FUNCTION DECLARATION
// ------------------------------------------------------------

// Dichiarazione classica: ha un nome ed e' soggetta a hoisting.
function saluta(nome) {
  return `Ciao ${nome}`;
}
console.log(saluta('Mario')); // => Ciao Mario

// Funzione senza return: restituisce implicitamente undefined.
function logga(msg) {
  console.log('[LOG]', msg);
}
console.log(logga('test')); // => [LOG] test  poi  undefined

// ------------------------------------------------------------
// 2) FUNCTION EXPRESSION
// ------------------------------------------------------------

// La funzione e' assegnata a una variabile. NON e' hoisted come declaration.
const somma = function (a, b) {
  return a + b;
};
console.log(somma(2, 3)); // => 5

// Named function expression (il nome interno serve per la ricorsione/debug).
const fattoriale = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};
console.log(fattoriale(5)); // => 120

// ------------------------------------------------------------
// 3) ARROW FUNCTION (sintassi moderna)
// ------------------------------------------------------------

// Sintassi compatta; con corpo a singola espressione il return e' implicito.
const doppio = (x) => x * 2;
console.log(doppio(10)); // => 20

// Con piu' istruzioni servono le graffe e return esplicito.
const classifica = (voto) => {
  if (voto >= 60) return 'sufficiente';
  return 'insufficiente';
};
console.log(classifica(72)); // => sufficiente

// Per restituire un object literal va racchiuso tra parentesi.
const makeDipendente = (nome, badge) => ({ nome, badge });
console.log(makeDipendente('Anna', 'UP-001')); // => { nome: 'Anna', badge: 'UP-001' }

// ------------------------------------------------------------
// 4) PARAMETRI: default, rest, destructuring
// ------------------------------------------------------------

// Default parameters: usati quando l'argomento e' undefined.
function arrotonda(minuti, regola = 5) {
  return Math.round(minuti / regola) * regola;
}
console.log(arrotonda(13));    // => 15
console.log(arrotonda(13, 1)); // => 13

// Rest parameters: raccoglie un numero variabile di argomenti in un array.
function sommaTutti(...numeri) {
  return numeri.reduce((acc, n) => acc + n, 0);
}
console.log(sommaTutti(1, 2, 3, 4)); // => 10

// Destructuring dei parametri (object): comodo per "named arguments".
function creaTurno({ nome, conPausa = true, durata = 8 } = {}) {
  return `${nome}: ${durata}h, pausa=${conPausa}`;
}
console.log(creaTurno({ nome: 'P4' }));                 // => P4: 8h, pausa=true
console.log(creaTurno({ nome: 'P2', conPausa: false })); // => P2: 8h, pausa=false

// Destructuring di un array come parametro.
function minMax([min, max]) {
  return `range ${min}-${max}`;
}
console.log(minMax([2, 10])); // => range 2-10

// ------------------------------------------------------------
// 5) RETURN: uscita anticipata e valori multipli
// ------------------------------------------------------------

// return interrompe subito la funzione (early return / guard clause).
function validaBadge(badge) {
  if (!badge) return 'badge mancante';
  if (!/^UP-\d{3}$/.test(badge)) return 'formato non valido';
  return 'ok';
}
console.log(validaBadge(''));       // => badge mancante
console.log(validaBadge('XX-1'));   // => formato non valido
console.log(validaBadge('UP-007')); // => ok

// Per restituire piu' valori si usa un object o un array.
function statistiche(numeri) {
  const totale = numeri.reduce((s, n) => s + n, 0);
  return { totale, media: totale / numeri.length };
}
const { totale, media } = statistiche([10, 20, 30]);
console.log(totale, media); // => 60 20

// ------------------------------------------------------------
// 6) SCOPE: global, function, block
// ------------------------------------------------------------

// Una variabile dichiarata in una funzione NON e' visibile fuori (function scope).
function contatoreLocale() {
  let interno = 42;
  return interno;
}
console.log(contatoreLocale()); // => 42
// console.log(interno);        // ReferenceError: interno is not defined

// let/const hanno block scope: vivono solo dentro il blocco { } in cui nascono.
function esempioBlock() {
  if (true) {
    let dentro = 'visibile solo qui';
    console.log(dentro); // => visibile solo qui
  }
  // console.log(dentro); // ReferenceError
}
esempioBlock();

// Le funzioni interne vedono lo scope esterno (lexical scope).
function esterna() {
  const messaggio = 'dallo scope esterno';
  function interna() {
    return messaggio; // accede a "messaggio" definito sopra
  }
  return interna();
}
console.log(esterna()); // => dallo scope esterno

// ------------------------------------------------------------
// 7) HOISTING delle funzioni
// ------------------------------------------------------------

// Le function DECLARATION sono "sollevate" (hoisted): si possono chiamare prima.
console.log(salutaAnticipato('Luca')); // => Salve Luca
function salutaAnticipato(nome) {
  return `Salve ${nome}`;
}

// Le function EXPRESSION e le arrow NON sono utilizzabili prima della definizione,
// perche' la variabile (const/let) e' in "temporal dead zone".
// console.log(nonAncora()); // ReferenceError
const nonAncora = () => 'ora si';
console.log(nonAncora()); // => ora si

// ------------------------------------------------------------
// 8) CLOSURE: una funzione che "ricorda" lo scope in cui e' nata
// ------------------------------------------------------------

// La closure permette di mantenere uno stato privato tra le chiamate.
function creaContatore() {
  let count = 0;
  return () => ++count;
}
const next = creaContatore();
console.log(next()); // => 1
console.log(next()); // => 2

// Closure per generare codici badge progressivi (spunto ERP).
function generatoreBadge(prefisso = 'UP') {
  let n = 0;
  return () => `${prefisso}-${String(++n).padStart(3, '0')}`;
}
const nuovoBadge = generatoreBadge();
console.log(nuovoBadge()); // => UP-001
console.log(nuovoBadge()); // => UP-002

// ------------------------------------------------------------
// 9) HIGHER-ORDER FUNCTIONS e CALLBACK
// ------------------------------------------------------------

// Una HOF riceve e/o restituisce funzioni. Qui riceve una callback.
function applica(valori, callback) {
  return valori.map(callback);
}
console.log(applica([1, 2, 3], (x) => x * 10)); // => [ 10, 20, 30 ]

// HOF che RESTITUISCE una funzione preconfigurata (factory).
function moltiplicatorePer(fattore) {
  return (x) => x * fattore;
}
const perTre = moltiplicatorePer(3);
console.log(perTre(4)); // => 12

// Spunto ERP: filtro componibile che modifica e ritorna un object "where".
function applicaFiltroData(where, dataDa) {
  return { ...where, data: { gte: dataDa } };
}
console.log(applicaFiltroData({ reparto: 'PR' }, '2026-06-01'));
// => { reparto: 'PR', data: { gte: '2026-06-01' } }

// ------------------------------------------------------------
// 10) FUNZIONI E ARRAY: pattern reali da gestionale
// ------------------------------------------------------------

const richieste = [
  { dip: 'UP-001', minuti: 480, approvata: true },
  { dip: 'UP-002', minuti: 300, approvata: false },
  { dip: 'UP-001', minuti: 120, approvata: true },
];

// Funzione che somma i minuti delle sole richieste approvate.
function minutiApprovati(lista) {
  return lista
    .filter((r) => r.approvata)
    .reduce((s, r) => s + r.minuti, 0);
}
console.log(minutiApprovati(richieste)); // => 600

// Funzione che trasforma le righe in DTO (map) per la UI.
function toDTO(lista) {
  return lista.map((r) => ({ badge: r.dip, ore: r.minuti / 60 }));
}
console.log(toDTO(richieste));
// => [ { badge: 'UP-001', ore: 8 }, { badge: 'UP-002', ore: 5 }, { badge: 'UP-001', ore: 2 } ]

// some()/every() per validazioni rapide.
const taglie = [{ q: 3 }, { q: 0 }, { q: 5 }];
console.log(taglie.some((t) => t.q === 0));  // => true  (almeno una scorta vuota)
console.log(taglie.every((t) => t.q >= 0));  // => true

// ------------------------------------------------------------
// 11) FUNZIONI ASYNC (cenno, vedi file dedicati)
// ------------------------------------------------------------

// Una async function restituisce sempre una Promise.
async function caricaDipendente(id) {
  // simulazione di una query: in produzione sarebbe await prisma...
  return { id, nome: 'Anna', badge: 'UP-001' };
}
caricaDipendente(1).then((d) => console.log(d.nome)); // => Anna  (asincrono)

// async/await con try/catch (gestione errori tipica).
async function timbra(badge) {
  try {
    if (!badge) throw new Error('badge assente');
    return `timbrato ${badge}`;
  } catch (err) {
    return `errore: ${err.message}`;
  }
}
timbra('').then(console.log); // => errore: badge assente

// ------------------------------------------------------------
// 12) IIFE (Immediately Invoked Function Expression)
// ------------------------------------------------------------

// Funzione definita ed eseguita subito: utile per isolare lo scope.
const config = (() => {
  const segreto = 'token-123';
  return { ambiente: 'test', haToken: Boolean(segreto) };
})();
console.log(config); // => { ambiente: 'test', haToken: true }

// ------------------------------------------------------------
// 13) ESEMPIO BROWSER (pseudo-eseguibile)
// ------------------------------------------------------------

// Esempio browser: gira nel browser, non in Node.
// Le callback sono comunissime nei gestori di eventi del DOM.
function registraClickBadge() {
  // const btn = document.querySelector('#timbra');
  // btn.addEventListener('click', () => console.log('timbratura inviata'));
}
console.log(typeof registraClickBadge); // => function

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   function nome(){}        -> function declaration (hoisted)
   const f = function(){}   -> function expression
   const f = () => {}       -> arrow function
   return                   -> restituisce un valore / esce
   param = valore           -> default parameter
   ...args                  -> rest parameters
   ({a,b}) / ([a,b])        -> destructuring dei parametri
   let/const                -> block scope
   var                      -> function scope (evitare)
   closure                  -> funzione che ricorda lo scope esterno
   higher-order function    -> riceve/ritorna funzioni
   callback                 -> funzione passata come argomento
   async function / await   -> funzioni asincrone (Promise)
   (() => {})()             -> IIFE
   .map() .filter() .reduce() .some() .every()  -> HOF su array
   ============================================================ */
