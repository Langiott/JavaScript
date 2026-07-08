/* ============================================================
   26 JS Booleans
   In JavaScript il tipo Boolean ha solo due valori: true e false.
   I Booleans nascono dai confronti, dagli operatori logici e dalla
   conversione (coercion) di qualsiasi valore in true/false.
   Ogni valore JS e' "truthy" o "falsy": capire questa distinzione
   e' fondamentale per scrivere condizioni, default e validazioni.
   In questo file vediamo Boolean(), la doppia negazione !!,
   l'elenco completo dei falsy e i pattern di coercion piu' usati.
   ============================================================ */

// ------------------------------------------------------------
// 1) I due valori primitivi
// ------------------------------------------------------------

// I literal boolean
let attivo = true;
let archiviato = false;
console.log(attivo, archiviato); // => true false
console.log(typeof attivo);      // => boolean

// I boolean nascono spesso da confronti
console.log(5 > 3);   // => true
console.log(5 === 6); // => false
console.log("a" < "b"); // => true (ordine lessicografico)

// ------------------------------------------------------------
// 2) La funzione Boolean(): converte qualsiasi valore
// ------------------------------------------------------------

// Boolean(x) restituisce true se x e' "truthy", false se "falsy"
console.log(Boolean(1));     // => true
console.log(Boolean(0));     // => false
console.log(Boolean("ciao"));// => true
console.log(Boolean(""));    // => false

// NB: NON usare new Boolean(...) -> crea un oggetto (sempre truthy!)
const sbagliato = new Boolean(false);
console.log(typeof sbagliato);     // => object
console.log(Boolean(sbagliato));   // => true (un oggetto e' sempre truthy!)

// ------------------------------------------------------------
// 3) Elenco COMPLETO dei valori falsy
// ------------------------------------------------------------

// In JS esistono SOLO 8 valori falsy. Tutto il resto e' truthy.
console.log(Boolean(false));     // => false
console.log(Boolean(0));         // => false
console.log(Boolean(-0));        // => false
console.log(Boolean(0n));        // => false  (BigInt zero)
console.log(Boolean(""));        // => false  (stringa vuota)
console.log(Boolean(null));      // => false
console.log(Boolean(undefined)); // => false
console.log(Boolean(NaN));       // => false

// ------------------------------------------------------------
// 4) Valori TRUTHY che spesso ingannano
// ------------------------------------------------------------

// Attenzione: questi sono TUTTI truthy anche se "sembrano" vuoti
console.log(Boolean("0"));       // => true  (stringa "0" non e' vuota)
console.log(Boolean(" "));       // => true  (spazio)
console.log(Boolean("false"));   // => true  (stringa "false")
console.log(Boolean([]));        // => true  (array vuoto)
console.log(Boolean({}));        // => true  (oggetto vuoto)
console.log(Boolean(function(){}));// => true (funzione)
console.log(Boolean(Infinity));  // => true
console.log(Boolean(-1));        // => true  (qualsiasi numero != 0)

// ------------------------------------------------------------
// 5) La doppia negazione !! (idioma di conversione)
// ------------------------------------------------------------

// ! nega e converte in boolean; !! applica due volte -> stesso risultato di Boolean()
console.log(!"ciao");  // => false
console.log(!!"ciao"); // => true
console.log(!!0);      // => false
console.log(!!null);   // => false

// Utile per normalizzare un valore in vero boolean
const noteDipendente = "";
const haNote = !!noteDipendente;
console.log(haNote); // => false

const numeroBadge = "UP-001";
console.log(!!numeroBadge); // => true

// ------------------------------------------------------------
// 6) Boolean nei contesti condizionali (if, while, ?:)
// ------------------------------------------------------------

// Un if valuta automaticamente la "truthiness", non serve === true
const listaTimbrature = [];
if (listaTimbrature.length) {
  console.log("ci sono timbrature");
} else {
  console.log("nessuna timbratura"); // => nessuna timbratura
}

// Operatore ternario
const oreLavorate = 0;
const stato = oreLavorate ? "lavorato" : "assente";
console.log(stato); // => assente (0 e' falsy)

// ------------------------------------------------------------
// 7) Operatori logici e short-circuit (cortocircuito)
// ------------------------------------------------------------

// && ritorna il primo falsy oppure l'ultimo valore
console.log(true && "ok");   // => ok
console.log(0 && "mai");     // => 0
console.log("a" && "b");     // => b

// || ritorna il primo truthy oppure l'ultimo valore
console.log("" || "default");// => default
console.log("Mario" || "x"); // => Mario
console.log(0 || null || "fallback"); // => fallback

// ! produce sempre un boolean puro
console.log(!"x"); // => false

// ------------------------------------------------------------
// 8) Coercion implicita: == vs ===
// ------------------------------------------------------------

// == applica coercion (sconsigliato), === confronta tipo + valore
console.log(true == 1);   // => true  (true -> 1)
console.log(false == 0);  // => true
console.log(false == ""); // => true  ("" -> 0, false -> 0)
console.log(true === 1);  // => false (tipi diversi)
console.log(null == undefined); // => true
console.log(null === undefined);// => false

// Regola pratica: usa SEMPRE === / !== per evitare sorprese
console.log(0 == "0");  // => true  (coercion numerica)
console.log(0 === "0"); // => false

// ------------------------------------------------------------
// 9) Nullish coalescing ?? vs ||
// ------------------------------------------------------------

// || scatta su QUALSIASI falsy; ?? scatta solo su null/undefined
const quantitaConfigurata = 0;
console.log(quantitaConfigurata || 10); // => 10 (sbagliato se 0 e' valido!)
console.log(quantitaConfigurata ?? 10); // => 0  (corretto: 0 e' un valore)

const reparto = null;
console.log(reparto ?? "XX"); // => XX

// ------------------------------------------------------------
// 10) Predicati booleani con i metodi degli array
// ------------------------------------------------------------

const tagliePresenti = [42, 44, 46];

// some(): true se ALMENO uno soddisfa
console.log(tagliePresenti.some(t => t > 45)); // => true
// every(): true se TUTTI soddisfano
console.log(tagliePresenti.every(t => t > 40)); // => true
// includes(): true se l'elemento esiste
console.log(tagliePresenti.includes(44)); // => true
// filter() usa la truthiness del predicato
console.log([0, 1, 2, "", "x"].filter(Boolean)); // => [ 1, 2, 'x' ]

// ------------------------------------------------------------
// 11) Esempi pratici ispirati a un gestionale ERP
// ------------------------------------------------------------

// Validazione del formato orario "HH:MM" con regex -> boolean
const isOrarioValido = (o) => /^\d{2}:\d{2}$/.test(o);
console.log(isOrarioValido("08:30")); // => true
console.log(isOrarioValido("8:5"));   // => false

// Un dipendente e' "presente" se ha l'ingresso ma non l'uscita
function isPresente(timbratura) {
  return !!timbratura.ingresso && !timbratura.uscita;
}
console.log(isPresente({ ingresso: "08:00", uscita: null })); // => true
console.log(isPresente({ ingresso: "08:00", uscita: "17:00" })); // => false

// Filtrare le richieste approvate (campo boolean)
const richieste = [
  { id: 1, approvata: true, minuti: 480 },
  { id: 2, approvata: false, minuti: 120 },
  { id: 3, approvata: true, minuti: 60 },
];
const totaleMinuti = richieste
  .filter(r => r.approvata)
  .reduce((s, r) => s + r.minuti, 0);
console.log(totaleMinuti); // => 540

// Verifica scorta DPI sotto la soglia minima
const articoli = [
  { nome: "guanti", quantita: 3, scortaMinima: 5 },
  { nome: "occhiali", quantita: 10, scortaMinima: 5 },
];
const sottoScorta = articoli.some(a => a.quantita < a.scortaMinima);
console.log(sottoScorta); // => true

// Badge valido: deve esistere e rispettare il pattern "SIG-NNN"
function badgeValido(codice) {
  return Boolean(codice) && /^[A-Z]{2}-\d{3}$/.test(codice);
}
console.log(badgeValido("UP-001")); // => true
console.log(badgeValido(""));       // => false
console.log(badgeValido("up-1"));   // => false

// Turno con pausa pranzo? (P4 ha pausa, P2 no) -> normalizzato a boolean
const turni = { P4: { pausa: true }, P2: { pausa: false } };
const haPausa = (cod) => !!turni[cod]?.pausa;
console.log(haPausa("P4"));  // => true
console.log(haPausa("P2"));  // => false
console.log(haPausa("PX"));  // => false (optional chaining -> undefined -> false)

// Flag combinati: dipendente attivo E con reparto assegnato
function puoTimbrare(dip) {
  return dip.attivo === true && !!dip.reparto;
}
console.log(puoTimbrare({ attivo: true, reparto: "MG" }));  // => true
console.log(puoTimbrare({ attivo: true, reparto: null }));  // => false
console.log(puoTimbrare({ attivo: false, reparto: "MG" })); // => false

// ------------------------------------------------------------
// 12) Boolean come default / guardia in funzioni
// ------------------------------------------------------------

// Default param booleano
function creaDipendente(nome, attivo = true) {
  return { nome, attivo };
}
console.log(creaDipendente("Mario"));        // => { nome: 'Mario', attivo: true }
console.log(creaDipendente("Luca", false));  // => { nome: 'Luca', attivo: false }

// Guard clause: esci subito se i dati non sono validi
function salvaTurno(turno) {
  if (!turno || !turno.codice) return false; // falsy -> blocca
  return true;
}
console.log(salvaTurno(null));          // => false
console.log(salvaTurno({ codice: "" })); // => false
console.log(salvaTurno({ codice: "P4" }));// => true

// ------------------------------------------------------------
// 13) toString e confronti tra boolean
// ------------------------------------------------------------

console.log(true.toString());   // => "true"
console.log(String(false));     // => "false"
console.log(true && false);     // => false
console.log(true || false);     // => true
console.log(true ^ false);      // => 1 (XOR bit a bit: true->1, false->0)

// ------------------------------------------------------------
// 14) Conta i truthy in un array (somma con coercion)
// ------------------------------------------------------------

const presenze = [true, false, true, true, false];
const numPresenti = presenze.filter(Boolean).length;
console.log(numPresenti); // => 3
// oppure con reduce sommando i boolean coercizzati a numero
const conteggio = presenze.reduce((s, p) => s + (p ? 1 : 0), 0);
console.log(conteggio); // => 3

/* ============================================================
   RIEPILOGO COMANDI
   - true / false                  : i due valori boolean
   - Boolean(x)                    : converte in boolean (truthy/falsy)
   - !x  /  !!x                    : negazione / doppia negazione (coercion a boolean)
   - Falsy: false 0 -0 0n "" null undefined NaN
   - Truthy: tutto il resto ("0", " ", "false", [], {}, function)
   - == / ===                      : confronto con/senza coercion (usa ===)
   - && / ||                       : short-circuit (primo falsy / primo truthy)
   - ?? (nullish)                  : default solo su null/undefined
   - ?. (optional chaining)        : accesso sicuro -> undefined se manca
   - arr.some(fn) / arr.every(fn)  : predicati true/false su array
   - arr.includes(v)               : true se v presente
   - arr.filter(Boolean)           : rimuove i falsy
   - regex.test(str)               : ritorna boolean
   - String(bool) / bool.toString(): boolean -> stringa
   - default params (= true)       : valori boolean di default
   - new Boolean()                 : EVITARE (crea oggetto sempre truthy)
   ============================================================ */
