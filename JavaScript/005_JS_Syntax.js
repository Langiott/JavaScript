/* ============================================================
   5 JS Syntax
   La sintassi di JavaScript e' l'insieme di regole che definiscono
   come scrivere programmi validi. In questo file vediamo i mattoni
   fondamentali: i values (valori fissi e variabili), i literals
   (valori scritti letteralmente), gli identifiers (i nomi che
   diamo a variabili e funzioni), la case-sensitivity (JS distingue
   maiuscole e minuscole) e le keywords riservate che non possiamo
   usare come nomi. Tutto con esempi eseguibili in Node.js.
   ============================================================ */

// ============================================================
// 1) VALUES: JavaScript distingue due tipi di values
//    - Fixed values (literals): valori scritti direttamente nel codice
//    - Variable values: valori conservati in variabili
// ============================================================

// Un fixed value (literal) usato direttamente
console.log(42);        // => 42
console.log("ciao");    // => ciao

// Variable values: salvati in una variabile tramite assignment
let dipendenti = 6;
console.log(dipendenti); // => 6


// ============================================================
// 2) LITERALS: come si scrivono i valori letteralmente
// ============================================================

// -- Number literals --
const intero = 100;            // intero
const decimale = 3.14;         // floating point
const esponente = 1.5e3;       // notazione esponenziale => 1500
const esadecimale = 0xff;      // hex => 255
const binario = 0b1010;        // binary => 10
const ottale = 0o17;           // octal => 15
const grande = 1_000_000;      // separatore di migliaia (ES2021)
console.log(esponente, esadecimale, binario, ottale, grande);
// => 1500 255 10 15 1000000

// -- BigInt literal (per interi enormi, suffisso n) --
const enorme = 9007199254854775807n;
console.log(typeof enorme); // => bigint

// -- String literals: apici singoli, doppi o backtick --
const apiceSingolo = 'UP-001';
const apiceDoppio  = "Reparto Produzione";
const template     = `Badge: ${apiceSingolo}`; // template literal
console.log(template); // => Badge: UP-001

// -- Boolean literals --
const attivo = true;
const archiviato = false;
console.log(attivo, archiviato); // => true false

// -- Array literal --
const reparti = ["PR", "MG", "UF"];
console.log(reparti.length); // => 3

// -- Object literal --
const dipendente = { nome: "Mario", cognome: "Rossi", badge: "UP-001" };
console.log(dipendente.nome); // => Mario

// -- Regular expression literal --
const formatoOrario = /^\d{2}:\d{2}$/;
console.log(formatoOrario.test("08:30")); // => true

// -- null e undefined: valori speciali --
const nessunReparto = null;       // assenza intenzionale di valore
let nonAssegnato;                 // undefined: dichiarata ma non inizializzata
console.log(nessunReparto, nonAssegnato); // => null undefined


// ============================================================
// 3) IDENTIFIERS: i nomi di variabili, funzioni, parametri
//    Regole:
//      - primo carattere: lettera, _ oppure $
//      - caratteri successivi: lettere, cifre, _ , $
//      - NON puo' iniziare con una cifra
//      - NON puo' essere una reserved keyword
// ============================================================

// Identifiers validi
let nomeDipendente = "Anna";   // camelCase (convenzione JS)
let _privato = "interno";      // underscore iniziale ammesso
let $elemento = "jq-style";    // dollaro ammesso
let codiceBadge2 = "UP-002";   // cifre ammesse dopo la prima lettera
const REPARTO_DEFAULT = "XX";  // UPPER_SNAKE_CASE per costanti
console.log(nomeDipendente, _privato, $elemento, codiceBadge2, REPARTO_DEFAULT);

// Identifiers NON validi (qui solo come commento, romperebbero il codice):
// let 1badge = "x";      // ERRORE: non puo' iniziare con cifra
// let nome-dip = "x";    // ERRORE: il trattino non e' ammesso
// let let = 5;           // ERRORE: 'let' e' una reserved keyword

// Convenzioni d'uso comuni:
// camelCase  -> variabili e funzioni:  oreLavorate, calcolaTotale
// PascalCase -> classi e costruttori:  Dipendente, GestoreTurni
// UPPER_CASE -> costanti globali:      SCORTA_MINIMA, API_URL


// ============================================================
// 4) CASE-SENSITIVITY: JavaScript distingue maiuscole/minuscole
//    Due identifier che differiscono solo per il case sono DIVERSI.
// ============================================================

let badge = "UP-001";
let Badge = "UP-999";
let BADGE = "UP-000";
console.log(badge, Badge, BADGE); // => UP-001 UP-999 UP-000

// Anche keywords e metodi sono case-sensitive
console.log(typeof badge);        // => string  (corretto, minuscolo)
// console.log(TypeOf badge);     // ERRORE: 'TypeOf' non esiste

const testo = "Reparto";
console.log(testo.toUpperCase()); // => REPARTO   (corretto)
// testo.TOUPPERCASE();           // ERRORE: metodo inesistente


// ============================================================
// 5) RESERVED KEYWORDS: parole riservate del linguaggio
//    Non possono essere usate come identifiers.
//    Elenco principale (ES2020+):
//      break, case, catch, class, const, continue, debugger,
//      default, delete, do, else, export, extends, false, finally,
//      for, function, if, import, in, instanceof, new, null,
//      return, super, switch, this, throw, true, try, typeof,
//      var, void, while, with, yield, let, static, await, async,
//      enum, implements, interface, package, private, protected, public
// ============================================================

// Esempi d'uso CORRETTO delle keyword (non come nomi):
class Dipendente {                 // 'class' keyword
  constructor(nome) {
    this.nome = nome;              // 'this' keyword
  }
}
const d = new Dipendente("Lucia"); // 'new' keyword
console.log(d instanceof Dipendente); // 'instanceof' => true

for (const r of reparti) {         // 'for' / 'of' / 'const'
  if (r === "MG") console.log("Magazzino trovato"); // 'if'
}
// => Magazzino trovato

function calcolaOre() {            // 'function' keyword
  return 8;                        // 'return' keyword
}
console.log(calcolaOre()); // => 8


// ============================================================
// 6) WHITESPACE, INDENTAZIONE e PUNTO E VIRGOLA
//    Gli spazi extra sono ignorati; l'indentazione e' per leggibilita'.
//    Il punto e virgola termina uno statement (consigliato sempre).
// ============================================================

let a = 5;            // gli spazi attorno a '=' sono opzionali
let b=10;             // valido ma meno leggibile
console.log(a + b);   // => 15

// Statement multipli sulla stessa riga richiedono il ';'
let x = 1; let y = 2; console.log(x + y); // => 3

// Riga lunga spezzata: JS ignora il newline dentro l'espressione
const messaggioLungo = "Turno P4 con pausa pranzo " +
                       "dalle 12:30 alle 13:00";
console.log(messaggioLungo);


// ============================================================
// 7) ESPRESSIONI vs STATEMENT
//    Expression: produce un valore.  Statement: esegue un'azione.
// ============================================================

const espressione = 5 * 8 + 2;     // expression => 42
console.log(espressione);          // => 42

// Statement (if) non produce valore, esegue codice
if (espressione > 40) {
  console.log("ore sufficienti"); // => ore sufficienti
}

// L'operatore ternario e' un'expression (utile negli assignment)
const stato = dipendenti > 0 ? "attivo" : "vuoto";
console.log(stato); // => attivo


// ============================================================
// 8) ESEMPIO PRATICO ISPIRATO AL GESTIONALE ERP
//    Sintassi reale: literals, identifiers, template literals,
//    regex literal e case-sensitivity in un caso autentico.
// ============================================================

// Object literal che rappresenta una timbratura (orari naive-UTC)
const timbratura = {
  badge: "UP-001",
  ingresso: "08:00",
  uscitaPranzo: "12:30",
  rientroPranzo: "13:00",
  uscita: "17:00",
};

// Regex literal per validare il formato HH:MM
const FORMATO_HHMM = /^\d{2}:\d{2}$/;

// Funzione che valida e calcola: identifiers in camelCase
function validaTimbratura(t) {
  const campi = [t.ingresso, t.uscitaPranzo, t.rientroPranzo, t.uscita];
  // every() controlla che TUTTI gli orari rispettino il formato
  const tuttiValidi = campi.every((ora) => FORMATO_HHMM.test(ora));
  return tuttiValidi;
}
console.log(validaTimbratura(timbratura)); // => true

// Converte "HH:MM" in minuti totali (number literal + parseInt)
function inMinuti(hhmm) {
  const [h, m] = hhmm.split(":").map((v) => parseInt(v, 10));
  return h * 60 + m;
}

// Ore lavorate = (fine pausa - inizio) - durata pausa, in ore decimali
const lavoratiMin =
  inMinuti(timbratura.uscita) - inMinuti(timbratura.ingresso) -
  (inMinuti(timbratura.rientroPranzo) - inMinuti(timbratura.uscitaPranzo));
console.log(`Ore lavorate: ${lavoratiMin / 60}`); // => Ore lavorate: 8.5

// Case-sensitivity in pratica: normalizziamo la sigla reparto
const repartoInput = "pr";
const SIGLA = repartoInput.toUpperCase().slice(0, 2); // => "PR"
console.log(`Reparto normalizzato: ${SIGLA}`); // => Reparto normalizzato: PR


// ============================================================
// 9) NOTA DOM/BROWSER (non eseguibile in Node)
//    La sintassi e' identica; cambiano solo le API disponibili.
// ============================================================

// Esempio browser: gira nel browser, non in Node
function mostraBadge() {
  // document e' un identifier definito solo nel browser
  // document.getElementById("badge").textContent = timbratura.badge;
  return "vedi commento sopra";
}
console.log(mostraBadge()); // => vedi commento sopra


/* ============================================================
   RIEPILOGO COMANDI / CONCETTI VISTI
   ------------------------------------------------------------
   VALUES         : fixed values (literals) vs variable values
   LITERALS       : number, BigInt (n), string, boolean,
                    array [], object {}, regex /.../, null, undefined
   NUMERI         : 0xff (hex), 0b1010 (bin), 0o17 (oct),
                    1.5e3 (exp), 1_000_000 (separatore)
   STRINGHE       : '...'  "..."  `...${}` (template literal)
   IDENTIFIERS    : iniziano con lettera, _ o $ ; case-sensitive
   CONVENZIONI    : camelCase / PascalCase / UPPER_SNAKE_CASE
   CASE-SENSITIVE : badge !== Badge !== BADGE
   KEYWORDS       : const, let, var, function, class, this, new,
                    return, if, for, of, in, instanceof, typeof,
                    async, await, yield, ...
   DICHIARAZIONI  : let, const (var sconsigliato)
   OPERATORI      : =  +  *  ===  ?: (ternario)
   METODI USATI   : toUpperCase(), slice(), split(), map(),
                    every(), test() (regex), parseInt()
   STATEMENT/EXPR : expression produce un valore; statement agisce
   ============================================================ */
