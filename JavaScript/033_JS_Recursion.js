/* ============================================================
   33 JS Recursion
   La recursion (ricorsione) e' una tecnica in cui una function
   richiama se stessa per risolvere un problema scomponendolo in
   sottoproblemi piu' piccoli. Ogni function ricorsiva ha bisogno
   di un caso base (base case) che ferma la catena di chiamate e
   di un passo ricorsivo (recursive step) che avvicina il problema
   al caso base. E' lo strumento naturale per fattoriale, fibonacci,
   somma di array e attraversamento di strutture annidate (alberi).
   Attenzione al call stack: senza caso base si ottiene un
   RangeError "Maximum call stack size exceeded" (stack overflow).
   ============================================================ */

// ------------------------------------------------------------
// 1) IL CONCETTO: caso base + passo ricorsivo
// ------------------------------------------------------------

// Conto alla rovescia: il caso base e' n < 0, il passo ricorsivo richiama countdown(n-1)
function countdown(n) {
  if (n < 0) return;            // base case: stop della ricorsione
  console.log(n);
  countdown(n - 1);            // recursive step: ci si avvicina al base case
}
countdown(3); // => 3, 2, 1, 0

// Senza caso base si rompe lo stack (NON eseguire):
// function infinito(n){ return infinito(n+1); } // RangeError: Maximum call stack size exceeded

// ------------------------------------------------------------
// 2) FATTORIALE: n! = n * (n-1)!
// ------------------------------------------------------------

// Versione classica: caso base 0! = 1
function fattoriale(n) {
  if (n <= 1) return 1;        // base case
  return n * fattoriale(n - 1); // recursive step
}
console.log(fattoriale(5)); // => 120
console.log(fattoriale(0)); // => 1

// Espansione mentale: fattoriale(4) = 4 * 3 * 2 * 1 = 24
console.log(fattoriale(4)); // => 24

// ------------------------------------------------------------
// 3) FIBONACCI: F(n) = F(n-1) + F(n-2)
// ------------------------------------------------------------

// Versione naive: due chiamate ricorsive (esponenziale, lenta per n grandi)
function fibNaive(n) {
  if (n < 2) return n;          // base case: F(0)=0, F(1)=1
  return fibNaive(n - 1) + fibNaive(n - 2);
}
console.log(fibNaive(10)); // => 55

// Versione con memoization: cache dei risultati gia' calcolati (closure)
function fibMemo() {
  const cache = new Map();      // la cache vive nella closure
  function fib(n) {
    if (n < 2) return n;
    if (cache.has(n)) return cache.get(n);
    const v = fib(n - 1) + fib(n - 2);
    cache.set(n, v);
    return v;
  }
  return fib;
}
const fib = fibMemo();
console.log(fib(30)); // => 832040 (velocissimo grazie al cache)

// ------------------------------------------------------------
// 4) SOMMA DI UN ARRAY in modo ricorsivo
// ------------------------------------------------------------

// Caso base: array vuoto => 0. Passo: primo elemento + somma del resto
function sommaArray(arr) {
  if (arr.length === 0) return 0;        // base case
  const [primo, ...resto] = arr;         // destructuring: testa e coda
  return primo + sommaArray(resto);      // recursive step
}
console.log(sommaArray([1, 2, 3, 4]));   // => 10
console.log(sommaArray([]));             // => 0

// Variante con indice (evita di creare nuovi array ad ogni passo)
function sommaIdx(arr, i = 0) {
  if (i >= arr.length) return 0;         // base case
  return arr[i] + sommaIdx(arr, i + 1);  // recursive step
}
console.log(sommaIdx([10, 20, 30])); // => 60

// ------------------------------------------------------------
// 5) ALTRI CLASSICI RICORSIVI
// ------------------------------------------------------------

// Potenza: base^exp
function potenza(base, exp) {
  if (exp === 0) return 1;               // base case
  return base * potenza(base, exp - 1);
}
console.log(potenza(2, 10)); // => 1024

// Reverse di una stringa
function reverse(str) {
  if (str === '') return '';             // base case
  return reverse(str.slice(1)) + str[0]; // recursive step
}
console.log(reverse('badge')); // => 'egdab'

// Massimo comun divisore (algoritmo di Euclide)
function gcd(a, b) {
  if (b === 0) return a;                 // base case
  return gcd(b, a % b);                  // recursive step
}
console.log(gcd(48, 18)); // => 6

// Conteggio occorrenze in array annidato (flatten + count concettuale)
function contaElementi(arr) {
  if (arr.length === 0) return 0;
  const [head, ...tail] = arr;
  const n = Array.isArray(head) ? contaElementi(head) : 1; // se array, scendi
  return n + contaElementi(tail);
}
console.log(contaElementi([1, [2, 3], [[4], 5]])); // => 5

// ------------------------------------------------------------
// 6) ATTRAVERSAMENTO DI ALBERI (tree traversal)
// ------------------------------------------------------------

// Albero generico: ogni nodo ha un valore e una lista di figli (children)
const albero = {
  valore: 'azienda',
  children: [
    { valore: 'produzione', children: [
      { valore: 'turno P4', children: [] },
      { valore: 'turno P2', children: [] },
    ] },
    { valore: 'magazzino', children: [
      { valore: 'vestiario', children: [] },
    ] },
  ],
};

// Visita depth-first (DFS): visita il nodo e poi ricorsivamente i figli
function visitaDFS(nodo, livello = 0) {
  console.log('  '.repeat(livello) + nodo.valore);
  for (const figlio of nodo.children) {  // recursive step su ogni figlio
    visitaDFS(figlio, livello + 1);
  }
}
visitaDFS(albero);
// => azienda / produzione / turno P4 / turno P2 / magazzino / vestiario (indentati)

// Conta tutti i nodi dell'albero
function contaNodi(nodo) {
  let totale = 1;                        // conta se stesso
  for (const figlio of nodo.children) {
    totale += contaNodi(figlio);         // somma i nodi dei sottoalberi
  }
  return totale;
}
console.log(contaNodi(albero)); // => 6

// Cerca un valore nell'albero (ritorna true/false)
function cerca(nodo, target) {
  if (nodo.valore === target) return true;        // base case: trovato
  return nodo.children.some(f => cerca(f, target)); // some + ricorsione
}
console.log(cerca(albero, 'turno P4')); // => true
console.log(cerca(albero, 'mensa'));    // => false

// ------------------------------------------------------------
// 7) ESEMPI ISPIRATI AL GESTIONALE ERP
// ------------------------------------------------------------

// Reparti con sotto-reparti (struttura ad albero, sigla 2 lettere)
const reparti = {
  sigla: 'UP', nome: 'Polyuretech', sub: [
    { sigla: 'PR', nome: 'Produzione', sub: [
      { sigla: 'P4', nome: 'Linea P4', sub: [] },
    ] },
    { sigla: 'MG', nome: 'Magazzino', sub: [] },
  ],
};

// Appiattisce l'albero dei reparti in una lista di sigle (DFS ricorsivo)
function elencaSigle(reparto) {
  return [reparto.sigla, ...reparto.sub.flatMap(elencaSigle)];
}
console.log(elencaSigle(reparti)); // => ['UP', 'PR', 'P4', 'MG']

// Somma ricorsiva dei minuti lavorati da una lista di timbrature.
// Pattern ERP: filter(approvata).reduce(sum) reso ricorsivo.
const timbrature = [
  { badge: 'UP-001', minuti: 480, approvata: true },
  { badge: 'UP-002', minuti: 300, approvata: false },
  { badge: 'UP-001', minuti: 120, approvata: true },
];
function sommaMinuti(arr, i = 0) {
  if (i >= arr.length) return 0;                     // base case
  const m = arr[i].approvata ? arr[i].minuti : 0;    // conta solo le approvate
  return m + sommaMinuti(arr, i + 1);                // recursive step
}
console.log(sommaMinuti(timbrature)); // => 600

// Albero gerarchico di dipendenti (responsabile -> sottoposti).
// Conta tutte le persone che dipendono (anche indirettamente) da un capo.
const organigramma = {
  nome: 'Mario', badge: 'UP-001', sottoposti: [
    { nome: 'Luca', badge: 'UP-002', sottoposti: [
      { nome: 'Sara', badge: 'UP-005', sottoposti: [] },
    ] },
    { nome: 'Anna', badge: 'UP-003', sottoposti: [] },
  ],
};
function contaSottoposti(persona) {
  if (persona.sottoposti.length === 0) return 0;     // base case: foglia
  return persona.sottoposti.reduce(
    (tot, s) => tot + 1 + contaSottoposti(s), 0      // 1 (il diretto) + i suoi
  );
}
console.log(contaSottoposti(organigramma)); // => 3

// Trova un dipendente per badge nell'organigramma (ritorna il nodo o null)
function trovaPerBadge(persona, badge) {
  if (persona.badge === badge) return persona;       // base case
  for (const s of persona.sottoposti) {
    const found = trovaPerBadge(s, badge);
    if (found) return found;                         // propaga il risultato
  }
  return null;                                       // non trovato in questo ramo
}
console.log(trovaPerBadge(organigramma, 'UP-005')?.nome); // => 'Sara'

// ------------------------------------------------------------
// 8) RICORSIONE vs ITERAZIONE + tail recursion
// ------------------------------------------------------------

// La maggior parte delle ricorsioni si puo' riscrivere con un loop.
function fattorialeLoop(n) {
  let acc = 1;
  for (let i = 2; i <= n; i++) acc *= i;
  return acc;
}
console.log(fattorialeLoop(5)); // => 120

// Tail recursion: la chiamata ricorsiva e' l'ultima operazione (accumulatore).
// Nota: V8/Node NON ottimizza le tail call, ma il pattern resta utile.
function fattorialeTail(n, acc = 1) {
  if (n <= 1) return acc;                // base case
  return fattorialeTail(n - 1, acc * n); // tail call
}
console.log(fattorialeTail(5)); // => 120

// Attenzione alla profondita': ricorsioni molto profonde superano il call stack.
// Per dataset enormi preferisci l'iterazione o una stack esplicita.

// ------------------------------------------------------------
// 9) DEEP CLONE ricorsivo (oggetti/array annidati)
// ------------------------------------------------------------

function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);          // ricorsione su array
  if (value && typeof value === 'object') {                       // ricorsione su oggetto
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deepClone(v)])
    );
  }
  return value;                                                   // base case: primitivo
}
const originale = { badge: 'UP-001', turni: ['P4', 'P2'], meta: { ore: 8 } };
const copia = deepClone(originale);
copia.meta.ore = 6;
console.log(originale.meta.ore, copia.meta.ore); // => 8 6 (indipendenti)

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   - caso base / base case: if (...) return ...;  (ferma la ricorsione)
   - passo ricorsivo: la function richiama se stessa
   - fattoriale(n): n * fattoriale(n-1)
   - fibonacci: fib(n-1) + fib(n-2); memoization con Map (cache)
   - somma array: [primo, ...resto] destructuring oppure indice (arr, i+1)
   - tree traversal DFS: ricorsione su node.children / persona.sottoposti
   - array methods utili: .some(), .reduce(), .map(), .flatMap()
   - Array.isArray(x): distingue array da primitivi (deep clone/flatten)
   - destructuring: const [head, ...tail] = arr; const {a, ...rest} = obj
   - Object.entries / Object.fromEntries: ricostruire oggetti nel deepClone
   - tail recursion: accumulatore come parametro (acc)
   - rischio: RangeError "Maximum call stack size exceeded" senza base case
   ============================================================ */
