/* ============================================================
   28 JS Function Params
   Guida ai parametri delle funzioni in JavaScript moderno.
   Vedremo i default parameters (valori di default), i rest
   parameters (...args) per raccogliere argomenti variabili, il
   destructuring direttamente nei parametri (oggetti e array) e
   il vecchio "arguments" object. Capiremo quando usare ciascuno,
   le differenze tra parametri e argomenti e gli errori comuni.
   ============================================================ */


/* ============================================================
   1) BASI: parametri vs argomenti
   ============================================================ */

// I "parameters" sono i nomi nella definizione; gli "arguments"
// sono i valori passati alla chiamata.
function saluta(nome) {        // nome = parameter
  return `Ciao ${nome}`;
}
console.log(saluta('Mario'));  // => Ciao Mario  ('Mario' = argument)

// Se non passi un argomento, il parametro vale undefined (no error).
function eco(x) {
  return x;
}
console.log(eco());            // => undefined

// Argomenti in eccesso vengono semplicemente ignorati.
function somma2(a, b) {
  return a + b;
}
console.log(somma2(1, 2, 3, 4)); // => 3


/* ============================================================
   2) DEFAULT PARAMETERS (ES2015+)
   ============================================================ */

// Valore usato quando l'argomento manca o e' undefined.
function potenza(base, esp = 2) {
  return base ** esp;
}
console.log(potenza(5));     // => 25  (esp = 2 di default)
console.log(potenza(5, 3));  // => 125

// ATTENZIONE: il default scatta solo per undefined, NON per null.
function ciao(nome = 'Anonimo') {
  return `Ciao ${nome}`;
}
console.log(ciao(undefined)); // => Ciao Anonimo
console.log(ciao(null));      // => Ciao null
console.log(ciao());          // => Ciao Anonimo

// Il default puo' essere un'espressione, anche una chiamata a funzione.
function ora() {
  return new Date().getUTCHours();
}
function logEvento(messaggio, h = ora()) {
  return `[${h}] ${messaggio}`;
}
console.log(typeof logEvento('avvio')); // => string

// Un parametro di default puo' riferirsi ai parametri precedenti.
function rettangolo(larghezza, altezza = larghezza) {
  return larghezza * altezza; // se manca altezza -> quadrato
}
console.log(rettangolo(4));    // => 16
console.log(rettangolo(4, 2)); // => 8

// I default si combinano col destructuring (vedi sezione 4).
function configura({ debug = false, retry = 3 } = {}) {
  return `debug=${debug} retry=${retry}`;
}
console.log(configura());               // => debug=false retry=3
console.log(configura({ retry: 5 }));   // => debug=false retry=5


/* ============================================================
   3) REST PARAMETERS (...args)
   ============================================================ */

// Raccoglie un numero variabile di argomenti in un vero Array.
function sommaTutti(...numeri) {
  return numeri.reduce((s, n) => s + n, 0);
}
console.log(sommaTutti(1, 2, 3));       // => 6
console.log(sommaTutti(10, 20, 30, 40)); // => 100
console.log(sommaTutti());               // => 0

// A differenza di arguments, e' un vero Array: ha map, filter, reduce.
function media(...valori) {
  if (valori.length === 0) return 0;
  return valori.reduce((s, v) => s + v, 0) / valori.length;
}
console.log(media(2, 4, 6)); // => 4

// Il rest deve essere SEMPRE l'ultimo parametro.
function intestazione(titolo, ...righe) {
  return `${titolo}\n${righe.join('\n')}`;
}
console.log(intestazione('Lista', 'a', 'b', 'c'));
// => Lista
//    a
//    b
//    c

// Rest + spread: "espandere" un array come argomenti.
function massimo(...nums) {
  return Math.max(...nums);
}
const valori = [3, 9, 1, 7];
console.log(massimo(...valori)); // => 9


/* ============================================================
   4) DESTRUCTURING NEI PARAMETRI
   ============================================================ */

// Destrutturare un oggetto: utile per "named arguments".
function creaUtente({ nome, ruolo = 'operatore', attivo = true }) {
  return `${nome} (${ruolo}) attivo=${attivo}`;
}
console.log(creaUtente({ nome: 'Anna', ruolo: 'admin' }));
// => Anna (admin) attivo=true
console.log(creaUtente({ nome: 'Luca' }));
// => Luca (operatore) attivo=true

// Destrutturare un array nei parametri.
function distanza([x1, y1], [x2, y2]) {
  return Math.hypot(x2 - x1, y2 - y1);
}
console.log(distanza([0, 0], [3, 4])); // => 5

// Rinominare le chiavi durante il destructuring.
function stampaProdotto({ cd: codice, descr: descrizione }) {
  return `${codice} - ${descrizione}`;
}
console.log(stampaProdotto({ cd: 'A1', descr: 'Vite' })); // => A1 - Vite

// Destructuring + rest dentro i parametri.
function dividi({ id, ...resto }) {
  return { id, resto };
}
console.log(dividi({ id: 1, nome: 'X', peso: 2 }));
// => { id: 1, resto: { nome: 'X', peso: 2 } }

// Default dell'intero oggetto per evitare crash se non passi nulla.
function paginazione({ page = 1, size = 20 } = {}) {
  return { page, size, offset: (page - 1) * size };
}
console.log(paginazione());            // => { page: 1, size: 20, offset: 0 }
console.log(paginazione({ page: 3 }));  // => { page: 3, size: 20, offset: 40 }


/* ============================================================
   5) ARGUMENTS OBJECT (legacy)
   ============================================================ */

// arguments e' un oggetto array-like disponibile nelle function
// classiche (NON nelle arrow function). Oggi si preferisce ...args.
function vecchiaSomma() {
  let totale = 0;
  for (let i = 0; i < arguments.length; i++) {
    totale += arguments[i];
  }
  return totale;
}
console.log(vecchiaSomma(1, 2, 3)); // => 6

// arguments NON e' un Array: niente map/reduce diretti.
function tipoArguments() {
  return Array.isArray(arguments);
}
console.log(tipoArguments(1, 2)); // => false

// Convertirlo in array (se proprio devi usarlo).
function comeArray() {
  return Array.from(arguments).map((x) => x * 2);
}
console.log(comeArray(1, 2, 3)); // => [ 2, 4, 6 ]

// Le arrow function NON hanno arguments: ereditano quello esterno.
const senzaArguments = () => {
  try {
    return arguments.length; // ReferenceError in Node module scope
  } catch (e) {
    return 'no arguments nelle arrow';
  }
};
console.log(senzaArguments()); // => no arguments nelle arrow


/* ============================================================
   6) ESEMPI AVANZATI ISPIRATI A UN GESTIONALE ERP
   ============================================================ */

// 6.1 Default param da una costante di configurazione (regola arrotondamento turni).
const DEFAULT_TURNO = { regolaArrotondamento: 15, pausa: true };
function arrotondaMinuti(minuti, regola = DEFAULT_TURNO.regolaArrotondamento) {
  return Math.round(minuti / regola) * regola;
}
console.log(arrotondaMinuti(52));     // => 45
console.log(arrotondaMinuti(52, 30)); // => 60

// 6.2 Rest params per registrare piu' timbrature insieme e sommare i minuti.
function totaleMinuti(...timbrature) {
  return timbrature
    .filter((t) => t.approvata)
    .reduce((s, t) => s + t.minuti, 0);
}
console.log(
  totaleMinuti(
    { minuti: 120, approvata: true },
    { minuti: 90, approvata: false },
    { minuti: 60, approvata: true }
  )
); // => 180

// 6.3 Destructuring nei parametri per creare un DTO dipendente.
function dipendenteDTO({ nome, cognome, codiceBadge = 'UP-000', reparto }) {
  const sigla = reparto?.sigla ?? 'XX';
  return `${codiceBadge} ${nome} ${cognome} [${sigla}]`;
}
console.log(
  dipendenteDTO({ nome: 'Anna', cognome: 'Rossi', codiceBadge: 'UP-001', reparto: { sigla: 'PR' } })
); // => UP-001 Anna Rossi [PR]
console.log(dipendenteDTO({ nome: 'Luca', cognome: 'Bianchi' }));
// => UP-000 Luca Bianchi [XX]

// 6.4 Merge di impostazioni con destructuring + rest (pattern {...DEFAULT, ...input}).
function applicaImpostazioni({ turni = [], ...impostazioni } = {}) {
  const base = { regola: 15, pausa: true };
  return { ...base, ...impostazioni, turni };
}
console.log(applicaImpostazioni({ pausa: false, turni: ['P4', 'P2'] }));
// => { regola: 15, pausa: false, turni: [ 'P4', 'P2' ] }

// 6.5 Higher-order function: default param che e' una funzione (callback).
function applicaFiltroData(query, trasforma = (q) => q) {
  return trasforma({ ...query, filtrato: true });
}
console.log(applicaFiltroData({ data: '2026-06-30' }));
// => { data: '2026-06-30', filtrato: true }
console.log(
  applicaFiltroData({ data: '2026-06-30' }, (q) => ({ ...q, limit: 1000 }))
); // => { data: '2026-06-30', filtrato: true, limit: 1000 }

// 6.6 Rest + destructuring per validare una taglia di vestiario/DPI.
function assegnaVestiario(dipendente, ...capi) {
  const valido = capi.every(({ taglia, quantita = 1 }) => taglia && quantita > 0);
  return `${dipendente}: ${capi.length} capi, validi=${valido}`;
}
console.log(
  assegnaVestiario('UP-001', { taglia: 'L', quantita: 2 }, { taglia: 'M' })
); // => UP-001: 2 capi, validi=true

// 6.7 "Named arguments" con default per costruire una query timbrature.
function cercaTimbrature({ badge, dal, al, take = 100, ordine = 'asc' } = {}) {
  return `WHERE badge=${badge} AND data BETWEEN ${dal} AND ${al} ORDER BY data ${ordine} LIMIT ${take}`;
}
console.log(cercaTimbrature({ badge: 'UP-001', dal: '2026-06-01', al: '2026-06-30' }));
// => WHERE badge=UP-001 AND data BETWEEN 2026-06-01 AND 2026-06-30 ORDER BY data asc LIMIT 100


/* ============================================================
   7) TRAPPOLE E BUONE PRATICHE
   ============================================================ */

// 7.1 length di una funzione: conta solo i parametri PRIMA del primo
//     default e prima del rest.
function f1(a, b, c) {}
function f2(a, b = 1, c) {}
function f3(a, ...rest) {}
console.log(f1.length); // => 3
console.log(f2.length); // => 1
console.log(f3.length); // => 1

// 7.2 Evita oggetti/array come default "condivisi": ogni chiamata ne crea uno NUOVO.
function aggiungi(item, lista = []) {
  lista.push(item);
  return lista;
}
console.log(aggiungi('a')); // => [ 'a' ]
console.log(aggiungi('b')); // => [ 'b' ]  (lista non condivisa, ok)

// 7.3 Combinare default + rest per API flessibili.
function logger(livello = 'info', ...messaggi) {
  return `[${livello.toUpperCase()}] ${messaggi.join(' ')}`;
}
console.log(logger('warn', 'badge', 'mancante')); // => [WARN] badge mancante
console.log(logger());                            // => [INFO]

// 7.4 Destructuring con default annidato.
function report({ totale = 0, dettagli: { count = 0 } = {} } = {}) {
  return `tot=${totale} count=${count}`;
}
console.log(report({ totale: 5, dettagli: { count: 3 } })); // => tot=5 count=3
console.log(report());                                      // => tot=0 count=0


/* ============================================================
   RIEPILOGO COMANDI
   - param = valore           -> default parameter (scatta su undefined)
   - function f(...args) {}    -> rest parameter (vero Array)
   - f(...array)              -> spread di un array come argomenti
   - function f({a, b = 1}) {} -> destructuring di oggetto nei parametri
   - function f([x, y]) {}     -> destructuring di array nei parametri
   - function f({a} = {}) {}   -> default dell'intero oggetto (anti-crash)
   - { id, ...resto }          -> rest dentro destructuring di oggetto
   - { cd: codice }            -> rinomina in destructuring
   - arguments                 -> oggetto array-like (solo function classiche)
   - Array.from(arguments)     -> converte arguments in Array
   - fn.length                 -> numero parametri prima di default/rest
   - reduce / filter / every   -> usati su rest params (Array reale)
   - { ...DEFAULT, ...input }  -> merge impostazioni con spread
   - a ?? b                    -> nullish coalescing per default sicuri
   - obj?.prop                 -> optional chaining nei parametri
   ============================================================ */
