/* ============================================================
   70 JS Debugging
   Il debugging è il processo di individuazione e correzione degli
   errori (bug) nel codice. In JavaScript gli strumenti principali
   sono l'oggetto `console` (con i suoi numerosi metodi), lo
   statement `debugger`, la gestione delle eccezioni con try/catch,
   il controllo dei tipi con `typeof` e la conoscenza degli errori
   comuni (TypeError, ReferenceError, SyntaxError). Questo file
   raccoglie pattern pratici per ispezionare, misurare e validare
   il codice, con esempi ispirati a un gestionale ERP.
   ============================================================ */

/* ------------------------------------------------------------
   1. console.log e le sue varianti di base
   ------------------------------------------------------------ */

// console.log: output generico, accetta più argomenti
console.log("Avvio modulo timbrature", 2026, true); // => Avvio modulo timbrature 2026 true

// console.info: semanticamente "informativo" (uguale a log in Node)
console.info("Connessione al database stabilita");

// console.warn: avviso, in molti ambienti appare in giallo
console.warn("Scorta vestiario sotto la soglia minima");

// console.error: errore, appare in rosso e va su stderr in Node
console.error("Timbratura non valida: orario mancante");

// console.debug: messaggi di debug (visibili solo con verbosità alta)
console.debug("payload ricevuto");

/* ------------------------------------------------------------
   2. Formattazione e placeholder
   ------------------------------------------------------------ */

// Placeholder stile printf: %s stringa, %d numero, %o oggetto
console.log("Dipendente %s, badge %s, ore %d", "Mario", "UP-001", 8);
// => Dipendente Mario, badge UP-001, ore 8

// Stampare un oggetto: di default Node lo mostra strutturato
const dipendente = { id: 1, nome: "Mario", reparto: "UP" };
console.log(dipendente); // => { id: 1, nome: 'Mario', reparto: 'UP' }

// Template literal: spesso più leggibile dei placeholder
console.log(`Assegnato a ${dipendente.nome} (${dipendente.reparto})`);
// => Assegnato a Mario (UP)

/* ------------------------------------------------------------
   3. console.table: ottimo per array di oggetti (DTO da query)
   ------------------------------------------------------------ */

const timbrature = [
  { badge: "UP-001", ingresso: "08:00", uscita: "17:00" },
  { badge: "UP-002", ingresso: "09:00", uscita: "18:00" },
];
console.table(timbrature);
// => stampa una tabella con colonne badge | ingresso | uscita

// Si possono limitare le colonne mostrate
console.table(timbrature, ["badge", "ingresso"]);

/* ------------------------------------------------------------
   4. console.dir: ispezione profonda di un oggetto
   ------------------------------------------------------------ */

const turno = { nome: "P4", pausa: true, fasce: [{ da: "08:00", a: "12:00" }] };
// depth:null forza la stampa di tutti i livelli annidati
console.dir(turno, { depth: null, colors: true });

/* ------------------------------------------------------------
   5. Raggruppare i log: console.group / groupEnd
   ------------------------------------------------------------ */

console.group("Elaborazione turno P4");
console.log("Lettura fasce orarie");
console.log("Sottrazione pausa pranzo");
console.groupEnd();

// console.groupCollapsed: gruppo chiuso di default (nel browser)
console.groupCollapsed("Dettagli interni");
console.log("step nascosto");
console.groupEnd();

/* ------------------------------------------------------------
   6. console.count: contare quante volte si passa da un punto
   ------------------------------------------------------------ */

function validaBadge(b) {
  console.count("validaBadge"); // incrementa e stampa un contatore
  return /^UP-\d{3}$/.test(b);
}
validaBadge("UP-001"); // => validaBadge: 1
validaBadge("UP-002"); // => validaBadge: 2
console.countReset("validaBadge"); // azzera il contatore

/* ------------------------------------------------------------
   7. console.time / timeEnd: misurare la durata di un blocco
   ------------------------------------------------------------ */

console.time("calcoloOre");
let totaleMinuti = 0;
for (let i = 0; i < 1_000_000; i++) totaleMinuti += 1;
console.timeEnd("calcoloOre"); // => calcoloOre: X.XXXms

// console.timeLog: stampa il tempo parziale senza chiudere il timer
console.time("batch");
console.timeLog("batch", "primo step"); // tempo parziale + etichetta
console.timeEnd("batch");

/* ------------------------------------------------------------
   8. console.assert: log SOLO se l'asserzione è falsa
   ------------------------------------------------------------ */

const oreLavorate = 8;
console.assert(oreLavorate <= 10, "Troppe ore:", oreLavorate); // nessun output
console.assert(oreLavorate > 10, "Troppe ore:", oreLavorate);
// => Assertion failed: Troppe ore: 8

/* ------------------------------------------------------------
   9. console.trace: stampa lo stack di chiamate corrente
   ------------------------------------------------------------ */

function calcolaOre() {
  console.trace("Traccia calcolo ore");
}
function elaboraTimbratura() {
  calcolaOre();
}
elaboraTimbratura(); // => stampa la catena elaboraTimbratura -> calcolaOre

/* ------------------------------------------------------------
   10. Lo statement `debugger`
   ------------------------------------------------------------ */

// `debugger` mette un breakpoint: se i devtools (o node --inspect)
// sono aperti, l'esecuzione si ferma qui. Senza debugger attaccato
// è un no-op, quindi è sicuro lasciarlo (ma rimuovilo in produzione).
function calcolaPausa(turno) {
  // debugger; // <-- decommenta e lancia: node --inspect-brk file.js
  return turno.pausa ? 30 : 0;
}
console.log(calcolaPausa({ pausa: true })); // => 30

/* ------------------------------------------------------------
   11. typeof: il primo strumento di controllo del tipo
   ------------------------------------------------------------ */

console.log(typeof 42);            // => number
console.log(typeof "ciao");        // => string
console.log(typeof true);          // => boolean
console.log(typeof undefined);     // => undefined
console.log(typeof null);          // => object  (storico bug del linguaggio!)
console.log(typeof {});            // => object
console.log(typeof []);            // => object  (gli array sono object)
console.log(typeof function () {}); // => function
console.log(typeof 10n);           // => bigint
console.log(typeof Symbol("s"));   // => symbol
console.log(typeof NaN);           // => number  (NaN è un number!)

/* ------------------------------------------------------------
   12. Controlli di tipo robusti
   ------------------------------------------------------------ */

// Array: NON usare typeof, usa Array.isArray
console.log(Array.isArray([1, 2]));   // => true
console.log(Array.isArray("non array")); // => false

// Distinguere null da object
const reparto = null;
console.log(reparto === null);        // => true

// Number.isNaN è più sicuro del vecchio isNaN globale
console.log(Number.isNaN(NaN));       // => true
console.log(Number.isNaN("x"));       // => false (isNaN("x") darebbe true!)

// Number.isInteger / Number.isFinite per validare input numerici
console.log(Number.isInteger(8));     // => true
console.log(Number.isFinite(Infinity)); // => false

// Tag preciso del tipo tramite Object.prototype.toString
const tipoEsatto = (v) => Object.prototype.toString.call(v).slice(8, -1);
console.log(tipoEsatto([]));   // => Array
console.log(tipoEsatto(null)); // => Null
console.log(tipoEsatto(new Date())); // => Date

/* ------------------------------------------------------------
   13. Errori comuni: TypeError
   ------------------------------------------------------------ */

// TypeError: accedere a proprietà di undefined/null
const row = { dipendente: undefined };
try {
  console.log(row.dipendente.nome); // boom
} catch (e) {
  console.log(e.constructor.name, "-", e.message);
  // => TypeError - Cannot read properties of undefined (reading 'nome')
}

// Difesa: optional chaining + nullish coalescing (pattern ERP)
console.log(row.dipendente?.nome ?? "sconosciuto"); // => sconosciuto

/* ------------------------------------------------------------
   14. Errori comuni: ReferenceError
   ------------------------------------------------------------ */

try {
  // variabileInesistente non è dichiarata
  console.log(variabileInesistente);
} catch (e) {
  console.log(e.name, "-", e.message);
  // => ReferenceError - variabileInesistente is not defined
}

/* ------------------------------------------------------------
   15. Errori comuni: RangeError e SyntaxError
   ------------------------------------------------------------ */

try {
  const n = 1;
  n.toFixed(500); // più cifre del consentito
} catch (e) {
  console.log(e.name); // => RangeError
}

try {
  JSON.parse("{ badge: 'UP-001' }"); // JSON non valido (chiavi senza virgolette)
} catch (e) {
  console.log(e.name); // => SyntaxError
}

/* ------------------------------------------------------------
   16. Lanciare e creare errori personalizzati
   ------------------------------------------------------------ */

class TimbraturaError extends Error {
  constructor(message, badge) {
    super(message);
    this.name = "TimbraturaError";
    this.badge = badge; // dato extra per il debugging
  }
}

function registraIngresso(badge, orario) {
  if (!/^\d{2}:\d{2}$/.test(orario)) {
    throw new TimbraturaError(`Orario non valido: ${orario}`, badge);
  }
  return { badge, orario };
}

try {
  registraIngresso("UP-001", "8:00"); // formato errato (manca lo zero)
} catch (e) {
  console.log(e.name, e.badge, "-", e.message);
  // => TimbraturaError UP-001 - Orario non valido: 8:00
}

/* ------------------------------------------------------------
   17. try / catch / finally e la clausola opzionale
   ------------------------------------------------------------ */

function leggiConfig() {
  try {
    return JSON.parse('{"regola":"arrotonda"}').regola;
  } catch {
    // ES2019: catch senza parametro se non serve l'errore
    return "default";
  } finally {
    // finally viene SEMPRE eseguito (utile per chiudere risorse)
    console.log("lettura config completata");
  }
}
console.log(leggiConfig()); // => arrotonda (e prima "lettura config completata")

/* ------------------------------------------------------------
   18. Debugging di codice asincrono (async/await + try/catch)
   ------------------------------------------------------------ */

async function caricaDipendente(id) {
  try {
    // simuliamo una query che fallisce per id sconosciuto
    if (id < 0) throw new Error("id negativo");
    return { id, nome: "Mario" };
  } catch (e) {
    console.error("[caricaDipendente] fallita:", e.message);
    throw e; // ri-lancio per non "ingoiare" l'errore silenziosamente
  }
}

caricaDipendente(-1).catch((e) => console.log("gestito a monte:", e.message));
// => [caricaDipendente] fallita: id negativo
// => gestito a monte: id negativo

// Errori non gestiti nelle Promise: agganciare un handler globale
process.on("unhandledRejection", (reason) => {
  console.error("Promise non gestita:", reason);
});

/* ------------------------------------------------------------
   19. Pattern pratico ERP: validazione difensiva con log mirati
   ------------------------------------------------------------ */

function normalizzaBadge(input) {
  // String(v||'') evita TypeError se input è null/undefined/number
  const pulito = String(input || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!pulito) {
    console.warn("Badge vuoto, scartato");
    return null;
  }
  return pulito.slice(0, 8);
}
console.log(normalizzaBadge("  up-001 ")); // => UP-001
console.log(normalizzaBadge(null));        // => null (+ warn)

function sommaMinutiTurni(richieste) {
  console.assert(Array.isArray(richieste), "atteso un array");
  const minuti = (r) => (Number(r.minuti) || 0); // coercizione difensiva
  const totale = richieste
    .filter((r) => r.approvata)
    .reduce((s, r) => s + minuti(r), 0);
  console.log("Totale minuti approvati:", totale);
  return totale;
}
sommaMinutiTurni([
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 60 },
  { approvata: true, minuti: "30" }, // stringa: convertita a 30
]); // => Totale minuti approvati: 510

/* ------------------------------------------------------------
   20. Esempio browser: console nel DevTools
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function evidenziaConStile() {
  // %c applica CSS al messaggio nel browser
  console.log(
    "%cTimbratura salvata",
    "color: white; background: green; padding: 2px 6px;"
  );
}
// evidenziaConStile(); // da chiamare nella console del browser

/* ============================================================
   RIEPILOGO COMANDI
   - console.log / info / warn / error / debug
   - console.table(data, [colonne])
   - console.dir(obj, { depth: null })
   - console.group / groupCollapsed / groupEnd
   - console.count / countReset
   - console.time / timeLog / timeEnd
   - console.assert(condizione, ...messaggi)
   - console.trace(...)
   - debugger;
   - typeof valore
   - Array.isArray(v)
   - Number.isNaN / isInteger / isFinite
   - Object.prototype.toString.call(v)
   - Errori: TypeError, ReferenceError, RangeError, SyntaxError
   - throw new Error(...) / class extends Error
   - try / catch (senza param) / finally
   - async/await + try/catch + .catch()
   - process.on('unhandledRejection', ...)
   - optional chaining ?. e nullish ??
   ============================================================ */
