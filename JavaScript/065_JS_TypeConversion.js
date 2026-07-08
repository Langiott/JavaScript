/* ============================================================
   65 JS TypeConversion
   La type conversion (conversione di tipo) e' il processo con cui
   un valore passa da un tipo a un altro: da string a number, da
   number a boolean, ecc. In JavaScript esistono due forme: la
   conversione esplicita (explicit / type casting), fatta da noi con
   funzioni come Number(), String(), Boolean(), e quella implicita
   (implicit / type coercion), eseguita in automatico dal motore JS
   durante operazioni come +, ==, if(...). Capire la coercion e' la
   chiave per evitare bug classici del linguaggio.
   ============================================================ */

// ------------------------------------------------------------
// 1) RIPASSO: i tipi primitivi e typeof
// ------------------------------------------------------------

// typeof restituisce una string che descrive il tipo del valore
console.log(typeof 42);        // => "number"
console.log(typeof "ciao");    // => "string"
console.log(typeof true);      // => "boolean"
console.log(typeof undefined); // => "undefined"
console.log(typeof null);      // => "object"  (storico bug del linguaggio)
console.log(typeof 10n);       // => "bigint"
console.log(typeof Symbol());  // => "symbol"

// ------------------------------------------------------------
// 2) CONVERSIONE ESPLICITA verso STRING
// ------------------------------------------------------------

// String() converte qualsiasi valore in string
console.log(String(123));       // => "123"
console.log(String(true));      // => "true"
console.log(String(null));      // => "null"
console.log(String(undefined)); // => "undefined"
console.log(String([1, 2, 3])); // => "1,2,3"
console.log(String({ a: 1 }));  // => "[object Object]"

// .toString() funziona sulla maggior parte dei valori (non su null/undefined)
console.log((255).toString());    // => "255"
console.log((255).toString(16));  // => "ff"  (base esadecimale)
console.log((5).toString(2));     // => "101" (base binaria)

// Coercion implicita verso string con l'operatore + e una string
console.log(1 + "2");   // => "12"  (il number 1 diventa "1")
console.log("" + true); // => "true"

// ------------------------------------------------------------
// 3) CONVERSIONE ESPLICITA verso NUMBER
// ------------------------------------------------------------

// Number() converte string/boolean/null in number
console.log(Number("42"));     // => 42
console.log(Number("3.14"));   // => 3.14
console.log(Number("  10  ")); // => 10   (gli spazi ai lati vengono ignorati)
console.log(Number(""));       // => 0    (string vuota -> 0)
console.log(Number("abc"));    // => NaN  (non convertibile)
console.log(Number(true));     // => 1
console.log(Number(false));    // => 0
console.log(Number(null));     // => 0
console.log(Number(undefined));// => NaN

// L'operatore unario + e' un modo veloce e idiomatico per Number()
console.log(+"100");  // => 100
console.log(+true);   // => 1

// parseInt: legge un intero dall'inizio della string, fermandosi al primo
// carattere non valido. ATTENZIONE: specificare sempre la base (radix) 10.
console.log(parseInt("42px", 10));   // => 42
console.log(parseInt("   77 anni")); // => 77
console.log(parseInt("3.99", 10));   // => 3   (tronca, non arrotonda)
console.log(parseInt("ff", 16));     // => 255 (base esadecimale)
console.log(parseInt("abc", 10));    // => NaN

// parseFloat: come parseInt ma conserva la parte decimale
console.log(parseFloat("3.14m"));   // => 3.14
console.log(parseFloat("1.5e3"));   // => 1500 (notazione esponenziale)

// Differenza chiave: Number e' rigido, parseInt e' "tollerante"
console.log(Number("42px"));      // => NaN
console.log(parseInt("42px", 10));// => 42

// ------------------------------------------------------------
// 4) CONVERSIONE ESPLICITA verso BOOLEAN
// ------------------------------------------------------------

// Boolean() segue le regole dei valori falsy e truthy.
// I valori FALSY (diventano false) sono solo 8:
//   false, 0, -0, 0n, "", null, undefined, NaN
console.log(Boolean(0));         // => false
console.log(Boolean(""));        // => false
console.log(Boolean(null));      // => false
console.log(Boolean(undefined)); // => false
console.log(Boolean(NaN));       // => false

// Tutto il resto e' TRUTHY (diventa true)
console.log(Boolean(1));         // => true
console.log(Boolean("0"));       // => true  (string non vuota!)
console.log(Boolean("false"));   // => true  (string non vuota!)
console.log(Boolean([]));        // => true  (array vuoto e' truthy)
console.log(Boolean({}));        // => true  (oggetto vuoto e' truthy)

// La doppia negazione !! e' il modo idiomatico per forzare un boolean
console.log(!!"testo"); // => true
console.log(!!0);       // => false

// ------------------------------------------------------------
// 5) COERCION IMPLICITA con l'operatore +
// ------------------------------------------------------------

// REGOLA: se uno dei due operandi e' string, + concatena (string conversion).
// Altrimenti somma numerica.
console.log(2 + 3);       // => 5      (number + number)
console.log("2" + 3);     // => "23"   (string vince)
console.log(2 + 3 + "1"); // => "51"   (da sinistra: 2+3=5, poi 5+"1")
console.log("1" + 2 + 3); // => "123"  (da sinistra: "1"+2="12", poi +3)

// Gli altri operatori aritmetici ( - * / % ) forzano sempre a number
console.log("10" - 2);  // => 8
console.log("10" * "2");// => 20
console.log("6" / "2"); // => 3
console.log("a" - 1);   // => NaN

// ------------------------------------------------------------
// 6) COERCION nel confronto: == (loose) vs === (strict)
// ------------------------------------------------------------

// === confronta valore E tipo, senza coercion (consigliato)
console.log(1 === "1"); // => false
console.log(1 === 1);   // => true

// == applica coercion prima di confrontare (sorgente di bug)
console.log(1 == "1");      // => true  ("1" -> 1)
console.log(0 == false);    // => true  (false -> 0)
console.log("" == false);   // => true  ("" -> 0, false -> 0)
console.log(null == undefined); // => true (caso speciale)
console.log(null == 0);     // => false (null NON viene convertito a 0 qui)
console.log(NaN == NaN);    // => false (NaN non e' uguale a niente)

// Per testare NaN usa Number.isNaN
console.log(Number.isNaN(NaN));       // => true
console.log(Number.isNaN("ciao" * 1));// => true

// ------------------------------------------------------------
// 7) COERCION negli oggetti: Symbol.toPrimitive / valueOf / toString
// ------------------------------------------------------------

// Quando un oggetto entra in un'operazione, JS lo converte a primitivo
const prezzo = {
  valore: 19.9,
  valueOf() { return this.valore; },   // usato in contesto numerico
  toString() { return `${this.valore} EUR`; }, // usato in contesto string
};
console.log(prezzo * 2);   // => 39.8    (usa valueOf)
console.log(`${prezzo}`);  // => "19.9 EUR" (usa toString)

// ------------------------------------------------------------
// 8) Number conversion: casi limite utili da ricordare
// ------------------------------------------------------------

console.log(Number("0x1A"));  // => 26   (Number capisce l'hex con 0x)
console.log(Number("1e3"));   // => 1000 (notazione esponenziale)
console.log(Number("Infinity")); // => Infinity
console.log(Number([]));       // => 0    (array vuoto -> "" -> 0)
console.log(Number([42]));     // => 42   (array con 1 elemento)
console.log(Number([1, 2]));   // => NaN  (array con piu' elementi)

// toFixed: restituisce una STRING con n decimali (utile per importi)
console.log((19.9).toFixed(2)); // => "19.90"
console.log(typeof (19.9).toFixed(2)); // => "string"

// ------------------------------------------------------------
// 9) ESEMPIO ERP: normalizzare input da form (string) verso tipi giusti
// ------------------------------------------------------------

// I form HTML restituiscono SEMPRE string: vanno convertite con cura.
function normalizzaInputDipendente(raw) {
  return {
    nome: String(raw.nome ?? "").trim(),
    // codiceBadge tipo "UP-001": ripuliamo e uniformiamo
    codiceBadge: String(raw.codiceBadge ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .slice(0, 8),
    // la scorta minima del vestiario arriva come "12" -> number
    scortaMinima: parseInt(raw.scortaMinima, 10) || 0,
    // il flag "attivo" puo' arrivare come "true"/"false"/checkbox
    attivo: raw.attivo === true || raw.attivo === "true",
  };
}
console.log(normalizzaInputDipendente({
  nome: "  Mario ",
  codiceBadge: " up-001 ",
  scortaMinima: "12pz",
  attivo: "true",
}));
// => { nome: 'Mario', codiceBadge: 'UP-001', scortaMinima: 12, attivo: true }

// ------------------------------------------------------------
// 10) ESEMPIO ERP: estrarre il numero progressivo dal badge
// ------------------------------------------------------------

// Dal badge "UP-001" vogliamo il number 1 per ordinare i dipendenti.
function progressivoBadge(codiceBadge) {
  const match = String(codiceBadge).match(/-(\d+)$/);
  // parseInt rimuove anche gli zeri iniziali: "001" -> 1
  return match ? parseInt(match[1], 10) : NaN;
}
console.log(progressivoBadge("UP-001")); // => 1
console.log(progressivoBadge("UP-042")); // => 42
console.log(progressivoBadge("XX"));     // => NaN

// ------------------------------------------------------------
// 11) ESEMPIO ERP: parsing di un orario "HH:MM" in minuti totali
// ------------------------------------------------------------

// Le timbrature arrivano come string "08:30"; per sommarle servono number.
function orarioInMinuti(hhmm) {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return NaN; // validazione con regex
  const [h, m] = hhmm.split(":").map((p) => parseInt(p, 10)); // string -> number
  return h * 60 + m;
}
console.log(orarioInMinuti("08:30")); // => 510
console.log(orarioInMinuti("17:00")); // => 1020
console.log(orarioInMinuti("8.30"));  // => NaN

// Calcolo ore lavorate sommando intervalli (number) e riformattando a string
function oreLavorate(ingresso, uscita) {
  const diff = orarioInMinuti(uscita) - orarioInMinuti(ingresso);
  const ore = Math.floor(diff / 60);
  const min = diff % 60;
  // padStart richiede string: forziamo la conversione con String()
  return `${String(ore).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
console.log(oreLavorate("08:30", "17:00")); // => "08:30"

// ------------------------------------------------------------
// 12) ESEMPIO ERP: somma sicura di quantita' vestiario miste
// ------------------------------------------------------------

// Le quantita' possono arrivare come number o come string dal DB/CSV.
const giacenze = [{ qta: 5 }, { qta: "3" }, { qta: "" }, { qta: null }];
const totale = giacenze.reduce((acc, g) => acc + (Number(g.qta) || 0), 0);
console.log(totale); // => 8  (5 + 3 + 0 + 0)

// ------------------------------------------------------------
// 13) TRAPPOLE COMUNI (gotcha) da ricordare a memoria
// ------------------------------------------------------------

console.log([] + []);        // => ""    (due array vuoti -> "" + "")
console.log([] + {});        // => "[object Object]"
console.log(true + true);    // => 2     (true -> 1)
console.log("5" - - "2");    // => 7     (doppio meno: "2" -> +2)
console.log(null + 1);       // => 1     (null -> 0)
console.log(undefined + 1);  // => NaN   (undefined -> NaN)
console.log(0.1 + 0.2);      // => 0.30000000000000004 (floating point!)
console.log((0.1 + 0.2).toFixed(2)); // => "0.30"

// Nullish coalescing (??) NON fa coercion: distingue null/undefined da 0/""
const reparto = { sigla: "" };
console.log(reparto.sigla ?? "XX"); // => ""   ("" non e' null/undefined)
console.log(reparto.sigla || "XX"); // => "XX" (|| considera "" falsy)

/* ============================================================
   RIEPILOGO COMANDI
   - typeof valore
   - String(x) / x.toString() / x.toString(base)
   - Number(x) / +x (operatore unario)
   - parseInt(str, radix) / parseFloat(str)
   - Boolean(x) / !!x
   - Number.isNaN(x)
   - (n).toFixed(decimali)  -> string
   - valori falsy: false, 0, -0, 0n, "", null, undefined, NaN
   - == (loose, con coercion) vs === (strict, senza coercion)
   - operatore + : string conversion se un operando e' string
   - - * / % : forzano sempre a number
   - valueOf() / toString() / Symbol.toPrimitive per oggetti
   - ?? (nullish) NON fa coercion ; || considera i falsy
   - String(x).trim().toUpperCase().replace(/\s+/g,'').slice(0,n)
   - str.split(':').map(p => parseInt(p, 10))
   - String(n).padStart(2, '0')
   ============================================================ */
