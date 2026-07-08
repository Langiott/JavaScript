/* ============================================================
   7 JS Variables
   Le variabili sono contenitori con nome per i dati. In JavaScript
   esistono tre modi per dichiararle: var (vecchio, function-scoped),
   let (moderno, block-scoped, riassegnabile) e const (moderno,
   block-scoped, non riassegnabile). Questo file copre dichiarazione,
   assegnazione, scope, hoisting, la Temporal Dead Zone e le regole di
   naming, con tanti esempi eseguibili in Node.js.
   ============================================================ */

/* ------------------------------------------------------------
   1) DICHIARAZIONE E ASSEGNAZIONE
   ------------------------------------------------------------ */

// Dichiarazione + assegnazione con let
let nome = "Mario";
console.log(nome); // => Mario

// Dichiarazione senza valore: la variabile vale undefined
let cognome;
console.log(cognome); // => undefined

// Assegnazione successiva
cognome = "Rossi";
console.log(cognome); // => Rossi

// const richiede SEMPRE un valore al momento della dichiarazione
const PI = 3.14159;
console.log(PI); // => 3.14159

// Dichiarazioni multiple sulla stessa riga
let a = 1, b = 2, c = 3;
console.log(a, b, c); // => 1 2 3

/* ------------------------------------------------------------
   2) let vs const: riassegnazione
   ------------------------------------------------------------ */

// let puo' essere riassegnata
let contatore = 0;
contatore = contatore + 1;
contatore += 5;
console.log(contatore); // => 6

// const NON puo' essere riassegnata (questo darebbe TypeError)
const aliquotaIva = 0.22;
// aliquotaIva = 0.10; // => TypeError: Assignment to constant variable.
console.log(aliquotaIva); // => 0.22

// ATTENZIONE: const blocca la RIASSEGNAZIONE, non il contenuto degli oggetti
const dipendente = { nome: "Anna", reparto: "UP" };
dipendente.reparto = "PR"; // OK: muto una proprieta'
console.log(dipendente); // => { nome: 'Anna', reparto: 'PR' }
// dipendente = {}; // => TypeError: non posso riassegnare la reference

// Stesso discorso per gli array dichiarati con const
const badge = ["UP-001", "UP-002"];
badge.push("UP-003"); // OK
console.log(badge); // => [ 'UP-001', 'UP-002', 'UP-003' ]

// Per rendere davvero immutabile un oggetto: Object.freeze
const reparto = Object.freeze({ sigla: "UP", nome: "Ufficio Produzione" });
reparto.sigla = "XX"; // ignorato in modalita' non-strict
console.log(reparto.sigla); // => UP

/* ------------------------------------------------------------
   3) SCOPE: var (function-scoped) vs let/const (block-scoped)
   ------------------------------------------------------------ */

// let e const vivono solo dentro il blocco { ... } in cui sono dichiarate
{
  let interno = "visibile solo qui";
  const anche = "idem";
  console.log(interno, anche); // => visibile solo qui idem
}
// console.log(interno); // => ReferenceError: interno is not defined

// var IGNORA il blocco: "esce" dal blocco e resta visibile nella funzione
function esempioVar() {
  if (true) {
    var fuga = "sono uscita dall'if";
  }
  return fuga; // accessibile qui!
}
console.log(esempioVar()); // => sono uscita dall'if

// Differenza pratica nei cicli for: il classico bug della closure
const funzioniVar = [];
for (var i = 0; i < 3; i++) {
  funzioniVar.push(() => i);
}
console.log(funzioniVar.map((f) => f())); // => [ 3, 3, 3 ]  (var condivisa)

const funzioniLet = [];
for (let j = 0; j < 3; j++) {
  funzioniLet.push(() => j);
}
console.log(funzioniLet.map((f) => f())); // => [ 0, 1, 2 ]  (let nuova ad ogni giro)

/* ------------------------------------------------------------
   4) HOISTING e TEMPORAL DEAD ZONE (TDZ)
   ------------------------------------------------------------ */

// Le dichiarazioni var sono "hoisted" in cima e inizializzate a undefined
function hoistingVar() {
  console.log(x); // => undefined (NON ReferenceError)
  var x = 10;
  return x;
}
console.log(hoistingVar()); // => 10

// let e const sono hoisted ma NON inizializzate: stanno nella TDZ finche'
// non vengono dichiarate. Accederci prima genera un ReferenceError.
function hoistingLet() {
  // console.log(y); // => ReferenceError: Cannot access 'y' before initialization
  let y = 20;
  return y;
}
console.log(hoistingLet()); // => 20

/* ------------------------------------------------------------
   5) REGOLE DI NAMING (nomi delle variabili)
   ------------------------------------------------------------ */

// Validi: lettere, cifre, _ e $ ; NON possono iniziare con una cifra
let _privato = 1;
let $elemento = 2;
let oreLavorate = 8.5;
let codice_badge = "UP-001";
console.log(_privato, $elemento, oreLavorate, codice_badge); // => 1 2 8.5 UP-001

// Case sensitive: queste sono DUE variabili diverse
let turno = "P4";
let Turno = "P2";
console.log(turno, Turno); // => P4 P2

// Convenzione: camelCase per variabili/funzioni, UPPER_SNAKE per costanti globali
const ORE_GIORNALIERE_STANDARD = 8;
let totaleStraordinari = 0;
console.log(ORE_GIORNALIERE_STANDARD, totaleStraordinari); // => 8 0

// Non validi (commentati perche' romperebbero):
// let 1nome;        // non puo' iniziare con cifra
// let let;          // 'let' e' una reserved word
// let mio-nome;     // il trattino non e' ammesso

/* ------------------------------------------------------------
   6) TIPI DI VALORE assegnabili a una variabile
   ------------------------------------------------------------ */

let stringa = "testo";          // string
let numero = 42;                // number
let decimale = 3.14;            // number
let booleano = true;            // boolean
let nulla = null;               // object (quirk storico)
let nonDefinito = undefined;    // undefined
let grande = 9007199254740993n; // bigint
let simbolo = Symbol("id");     // symbol
let oggetto = { k: "v" };       // object
let lista = [1, 2, 3];          // object (array)

console.log(typeof stringa);     // => string
console.log(typeof numero);      // => number
console.log(typeof booleano);    // => boolean
console.log(typeof nulla);       // => object
console.log(typeof nonDefinito); // => undefined
console.log(typeof grande);      // => bigint
console.log(typeof simbolo);     // => symbol
console.log(typeof oggetto);     // => object
console.log(Array.isArray(lista)); // => true

/* ------------------------------------------------------------
   7) DESTRUCTURING (estrarre valori in variabili)
   ------------------------------------------------------------ */

// Da oggetto, con rename e default
const dip = { nome: "Luca", cognome: "Bianchi", ruolo: "operaio" };
const { nome: n, cognome: cog, tipologia = "interno" } = dip;
console.log(n, cog, tipologia); // => Luca Bianchi interno

// Rest: raccogli il resto in un nuovo oggetto
const assegnazione = { id: 7, vestiario: "tuta", taglia: "L", quantita: 2 };
const { vestiario, ...resto } = assegnazione;
console.log(vestiario); // => tuta
console.log(resto);     // => { id: 7, taglia: 'L', quantita: 2 }

// Da array
const orario = [8, 30];
const [ore, minuti] = orario;
console.log(ore, minuti); // => 8 30

/* ------------------------------------------------------------
   8) SWAP e assegnazioni avanzate
   ------------------------------------------------------------ */

// Scambio di due variabili senza variabile temporanea
let primo = "A", secondo = "B";
[primo, secondo] = [secondo, primo];
console.log(primo, secondo); // => B A

// Assegnazione a catena (tutte puntano allo stesso valore)
let p, q, r;
p = q = r = 0;
console.log(p, q, r); // => 0 0 0

// Operatori di assegnazione composti
let saldoMinuti = 480;
saldoMinuti -= 60;  // pausa pranzo
saldoMinuti *= 1;
console.log(saldoMinuti); // => 420

// Logical assignment (ES2021)
let impostazioni = { regolaArrotondamento: null };
impostazioni.regolaArrotondamento ??= "per_difetto"; // assegna se null/undefined
console.log(impostazioni.regolaArrotondamento); // => per_difetto

/* ------------------------------------------------------------
   9) ESEMPIO PRATICO ispirato al gestionale ERP
   ------------------------------------------------------------ */

// Costanti di dominio: non cambiano mai, quindi const + UPPER_SNAKE
const MINUTI_PAUSA_P4 = 30;          // il turno P4 ha una pausa
const FORMATO_BADGE = /^[A-Z]{2}-\d{3}$/;

// Funzione che calcola le ore lavorate da una timbratura.
// Uso let per i valori che variano nel calcolo, const per i fissi.
function calcolaOreLavorate(timbratura) {
  const { ingresso, uscita, turno } = timbratura;
  let minutiTotali = uscita - ingresso; // in minuti
  if (turno === "P4") {
    minutiTotali -= MINUTI_PAUSA_P4; // sottraggo la pausa solo per P4
  }
  const ore = (minutiTotali / 60).toFixed(2);
  return Number(ore);
}

const timbratura = { ingresso: 8 * 60, uscita: 17 * 60, turno: "P4" };
console.log(calcolaOreLavorate(timbratura)); // => 8.5

// Validazione del codice badge tramite costante regex
const badgeDaVerificare = "UP-001";
const badgeValido = FORMATO_BADGE.test(badgeDaVerificare);
console.log(badgeValido); // => true

// Accumulo con reduce: const per il risultato finale immutabile
const richieste = [
  { approvata: true, minuti: 120 },
  { approvata: false, minuti: 90 },
  { approvata: true, minuti: 60 },
];
const totaleApprovato = richieste
  .filter((r) => r.approvata)
  .reduce((somma, r) => somma + r.minuti, 0);
console.log(totaleApprovato); // => 180

/* ------------------------------------------------------------
   10) ERRORI COMUNI da ricordare
   ------------------------------------------------------------ */

// Ridichiarare con let/const nello stesso scope: SyntaxError
// let nome = "x"; let nome = "y"; // => SyntaxError: 'nome' has already been declared

// var permette la ridichiarazione (fonte di bug)
var doppia = 1;
var doppia = 2;
console.log(doppia); // => 2

// Variabile non dichiarata in strict mode => ReferenceError
// "use strict"; nonDichiarata = 5; // => ReferenceError

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - var            dichiarazione function-scoped (legacy, hoisted a undefined)
   - let            dichiarazione block-scoped, riassegnabile
   - const          dichiarazione block-scoped, NON riassegnabile
   - typeof         restituisce il tipo di un valore
   - Array.isArray  verifica se un valore e' un array
   - Object.freeze  rende immutabile un oggetto
   - destructuring  const { a } = obj ; const [x] = arr
   - rest/spread    const { x, ...resto } = obj
   - ??=            logical nullish assignment (ES2021)
   - +=  -=  *=     operatori di assegnazione composti
   - [a,b]=[b,a]    swap senza variabile temporanea
   - Number / toFixed   conversione e formattazione numerica
   - .filter().reduce() pattern di accumulo su array
   - RegExp.test    validazione con espressione regolare
   ============================================================ */
