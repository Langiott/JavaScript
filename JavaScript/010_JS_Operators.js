/* ============================================================
   10 JS Operators
   Panoramica completa degli operators in JavaScript.
   Gli operators sono simboli che eseguono operazioni su uno o piu
   valori (gli "operands"): aritmetici, di assegnazione, di confronto
   (comparison), logici (logical) e il ternary operator. Vedremo anche
   la operator precedence (priorita) e l'associativita, che decidono
   in quale ordine vengono valutate le espressioni complesse.
   ============================================================ */

// ------------------------------------------------------------
// 1) ARITHMETIC OPERATORS (operatori aritmetici)
// ------------------------------------------------------------

// Addizione, sottrazione, moltiplicazione, divisione
console.log(7 + 3);   // => 10
console.log(7 - 3);   // => 4
console.log(7 * 3);   // => 21
console.log(7 / 3);   // => 2.3333333333333335

// Modulo (resto della divisione): utile per pari/dispari o cicli
console.log(7 % 3);   // => 1
console.log(10 % 2);  // => 0  (numero pari)

// Esponente (ES2016): base ** esponente
console.log(2 ** 10); // => 1024
console.log(9 ** 0.5);// => 3  (radice quadrata)

// Operatori unari: negazione e conversione a number
const x = 5;
console.log(-x);      // => -5
console.log(+"42");   // => 42 (string -> number)
console.log(+"ciao"); // => NaN

// Increment (++) e decrement (--): prefisso vs postfisso
let i = 1;
console.log(i++);     // => 1  (ritorna poi incrementa)
console.log(i);       // => 2
console.log(++i);     // => 3  (incrementa poi ritorna)

// Attenzione: + con string fa concatenazione, non somma
console.log(1 + 2 + "3"); // => "33" (1+2=3, poi "3"+"3")
console.log("1" + 2 + 3); // => "123"

// ------------------------------------------------------------
// 2) ASSIGNMENT OPERATORS (operatori di assegnazione)
// ------------------------------------------------------------

let a = 10;       // assegnazione base
a += 5;  console.log(a); // => 15  (a = a + 5)
a -= 3;  console.log(a); // => 12
a *= 2;  console.log(a); // => 24
a /= 4;  console.log(a); // => 6
a %= 4;  console.log(a); // => 2
a **= 3; console.log(a); // => 8

// Logical assignment (ES2021): assegna solo a certe condizioni
let nome = "";
nome ||= "Anonimo";        // assegna se falsy
console.log(nome);          // => "Anonimo"

let config = { tema: "scuro" };
config.tema &&= "chiaro";   // assegna solo se gia truthy
console.log(config.tema);   // => "chiaro"

let reparto = null;
reparto ??= "XX";           // assegna solo se null/undefined
console.log(reparto);       // => "XX"

// ------------------------------------------------------------
// 3) COMPARISON OPERATORS (operatori di confronto)
// ------------------------------------------------------------

// Uguaglianza loose (==) fa type coercion: da evitare
console.log(5 == "5");   // => true  (converte i tipi)
console.log(null == undefined); // => true

// Uguaglianza strict (===) confronta valore E tipo: da preferire
console.log(5 === "5");  // => false
console.log(5 === 5);    // => true

// Disuguaglianza
console.log(5 != "5");   // => false (loose)
console.log(5 !== "5");  // => true  (strict)

// Maggiore / minore / uguale-o
console.log(8 > 3);      // => true
console.log(8 >= 8);     // => true
console.log(3 < 1);      // => false
console.log(3 <= 3);     // => true

// Confronto tra string (ordine lessicografico, code point)
console.log("a" < "b");  // => true
console.log("UP-002" > "UP-001"); // => true

// ------------------------------------------------------------
// 4) LOGICAL OPERATORS (operatori logici)
// ------------------------------------------------------------

// AND (&&): true se entrambi truthy; ritorna il primo falsy o l'ultimo
console.log(true && false);  // => false
console.log("ok" && 42);     // => 42

// OR (||): ritorna il primo truthy o l'ultimo
console.log(false || "fallback"); // => "fallback"
console.log(0 || "" || "primo");  // => "primo"

// NOT (!): inverte il valore booleano
console.log(!true);   // => false
console.log(!!"x");   // => true (doppia negazione: coercion a boolean)

// Short-circuit: la seconda parte non viene valutata se inutile
function effetto() { console.log("eseguita!"); return true; }
false && effetto();   // effetto() NON viene chiamata
true  || effetto();   // effetto() NON viene chiamata

// Nullish coalescing (??): fallback solo su null/undefined (non su 0 o "")
console.log(0 ?? 99);     // => 0   (0 e' valido)
console.log(null ?? 99);  // => 99
console.log("" ?? "x");   // => ""  (string vuota e' valida)

// Optional chaining (?.) abbinato a ??: accesso sicuro a proprieta
const row = { dipendente: { nome: "Mario" } };
console.log(row.dipendente?.nome ?? "N/D"); // => "Mario"
console.log(row.timbratura?.ora ?? "N/D");  // => "N/D"

// ------------------------------------------------------------
// 5) TERNARY OPERATOR (operatore condizionale)
// ------------------------------------------------------------

// condizione ? valoreSeVero : valoreSeFalso
const eta = 20;
const stato = eta >= 18 ? "maggiorenne" : "minorenne";
console.log(stato); // => "maggiorenne"

// Ternary annidato (usare con parsimonia per leggibilita)
const voto = 75;
const esito = voto >= 90 ? "A" : voto >= 70 ? "B" : "C";
console.log(esito); // => "B"

// Spesso usato per default inline
const quantita = 0;
console.log(quantita ? `${quantita} pezzi` : "scorta esaurita");
// => "scorta esaurita"

// ------------------------------------------------------------
// 6) OPERATOR PRECEDENCE (precedenza e associativita)
// ------------------------------------------------------------

// La moltiplicazione ha precedenza sull'addizione
console.log(2 + 3 * 4);     // => 14
console.log((2 + 3) * 4);   // => 20 (le parentesi forzano l'ordine)

// ** e' right-associative (si valuta da destra)
console.log(2 ** 3 ** 2);   // => 512  (2 ** (3 ** 2) = 2 ** 9)

// && ha precedenza maggiore di ||
console.log(true || false && false); // => true (|| ... (false && false))

// Confronto prima di logico
console.log(5 > 3 && 2 < 4); // => true

// Assegnazione e' right-associative
let p, q;
p = q = 7;
console.log(p, q); // => 7 7

// ------------------------------------------------------------
// 7) ESEMPI PRATICI ISPIRATI A UN GESTIONALE ERP
// ------------------------------------------------------------

// Calcolo ore lavorate (minuti) usando aritmetici e modulo per HH:MM
const minutiLavorati = 8 * 60 + 27; // 8h27
const ore = Math.floor(minutiLavorati / 60);
const min = minutiLavorati % 60;
console.log(`${String(ore).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
// => "08:27"

// Validazione badge: ternary + optional chaining + nullish
function etichettaBadge(dip) {
  const codice = dip?.codiceBadge ?? "SENZA-BADGE";
  return dip?.attivo ? `Attivo (${codice})` : `Inattivo (${codice})`;
}
console.log(etichettaBadge({ codiceBadge: "UP-001", attivo: true }));
// => "Attivo (UP-001)"
console.log(etichettaBadge(null)); // => "Inattivo (SENZA-BADGE)"

// Turno con pausa: il tipo 'P4' include pausa, 'P2' no (logical + ternary)
function pausaMinuti(turno) {
  return turno === "P4" ? 30 : 0;
}
console.log(pausaMinuti("P4")); // => 30
console.log(pausaMinuti("P2")); // => 0

// Scorta vestiario/DPI: comparison + logical per alert
function statoScorta(quantita, scortaMinima) {
  const sottoSoglia = quantita <= scortaMinima;
  return sottoSoglia && quantita > 0
    ? "DA RIORDINARE"
    : quantita === 0
      ? "ESAURITO"
      : "OK";
}
console.log(statoScorta(2, 5));  // => "DA RIORDINARE"
console.log(statoScorta(0, 5));  // => "ESAURITO"
console.log(statoScorta(20, 5)); // => "OK"

// Somma minuti delle richieste approvate (aritmetici dentro reduce)
const richieste = [
  { minuti: 60, approvata: true },
  { minuti: 30, approvata: false },
  { minuti: 90, approvata: true },
];
const totaleApprovato = richieste
  .filter((r) => r.approvata)
  .reduce((s, r) => s + r.minuti, 0);
console.log(totaleApprovato); // => 150

// Sigla reparto con fallback (nullish) e maiuscolo
function siglaReparto(reparto) {
  return (reparto?.sigla ?? "XX").toUpperCase();
}
console.log(siglaReparto({ sigla: "mt" })); // => "MT"
console.log(siglaReparto(null));            // => "XX"

// ------------------------------------------------------------
// 8) TRABOCCHETTI COMUNI (gotcha)
// ------------------------------------------------------------

console.log(0.1 + 0.2);          // => 0.30000000000000004 (floating point)
console.log(0.1 + 0.2 === 0.3);  // => false
console.log(NaN === NaN);        // => false (NaN non e' uguale a se stesso)
console.log(Number.isNaN(NaN));  // => true  (modo corretto di testare NaN)
console.log([] + []);            // => "" (coercion a string)
console.log(typeof (null === undefined)); // => "boolean"

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   Arithmetic:  +  -  *  /  %  **  ++  --  (+unario, -unario)
   Assignment:  =  +=  -=  *=  /=  %=  **=  ||=  &&=  ??=
   Comparison:  ==  ===  !=  !==  >  >=  <  <=
   Logical:     &&  ||  !  ??  ?.  (optional chaining)
   Ternary:     cond ? a : b
   Precedenza:  ()  >  **  >  * / %  >  + -  >  confronti  >  && >  ||
   Utility:     Math.floor()  String.padStart()  Number.isNaN()
                .filter()  .reduce()  .toUpperCase()
   ============================================================ */
