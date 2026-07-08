/* ============================================================
   66 JS RegExp
   Le Regular Expressions (regex) sono pattern usati per cercare,
   testare e manipolare stringhe. In JavaScript sono oggetti di tipo
   RegExp: si creano con la sintassi letterale /pattern/flags oppure
   con il costruttore new RegExp(stringa, flags). Le useremo per
   validazioni reali tipiche di un gestionale ERP: orari HH:MM,
   email, codici badge ('UP-001') e range di turni.
   ============================================================ */

/* ------------------------------------------------------------
   1) CREAZIONE DI UNA REGEXP
   ------------------------------------------------------------ */

// Sintassi letterale: la piu' comune, compilata a parse-time.
const re1 = /ciao/;
console.log(re1.test("ciao mondo")); // => true

// Costruttore: utile quando il pattern e' dinamico (da variabile).
const parola = "mondo";
const re2 = new RegExp(parola);
console.log(re2.test("ciao mondo")); // => true

// Attenzione: nel costruttore i backslash vanno raddoppiati.
const reCifra1 = /\d/;            // letterale
const reCifra2 = new RegExp("\\d"); // costruttore
console.log(reCifra1.test("a5"), reCifra2.test("a5")); // => true true

/* ------------------------------------------------------------
   2) I FLAGS (g, i, m, s, u, y)
   ------------------------------------------------------------ */

// i = case-insensitive (ignora maiuscole/minuscole)
console.log(/up/i.test("UP-001")); // => true

// g = global: trova TUTTE le occorrenze, non solo la prima
console.log("a-a-a".match(/a/g)); // => [ 'a', 'a', 'a' ]

// m = multiline: ^ e $ matchano inizio/fine di ogni riga
const testo = "riga1\nriga2";
console.log(testo.match(/^riga\d/gm)); // => [ 'riga1', 'riga2' ]

// s = dotAll: il punto . matcha anche il newline
console.log(/a.b/s.test("a\nb")); // => true

// La proprieta' .flags mostra i flag attivi
console.log(/abc/gi.flags); // => gi

/* ------------------------------------------------------------
   3) METACARATTERI E CLASSI DI BASE
   ------------------------------------------------------------ */

// \d cifra, \D non-cifra, \w word char, \s spazio
console.log(/\d/.test("badge 7"));  // => true
console.log(/\w/.test("_"));        // => true (underscore e' word char)
console.log(/\s/.test("a b"));      // => true

// . qualsiasi carattere (tranne newline senza flag s)
console.log(/c.t/.test("cat"));     // => true

// [] classe personalizzata, [^] negazione
console.log(/[aeiou]/.test("xyz"));   // => false (nessuna vocale)
console.log(/[^0-9]/.test("12a34"));  // => true (c'e' una non-cifra)

// Ancore: ^ inizio stringa, $ fine stringa
console.log(/^UP/.test("UP-001"));  // => true
console.log(/001$/.test("UP-001")); // => true

/* ------------------------------------------------------------
   4) QUANTIFICATORI
   ------------------------------------------------------------ */

// * zero o piu', + uno o piu', ? zero o uno
console.log(/ab*/.test("a"));    // => true (zero b va bene)
console.log(/ab+/.test("a"));    // => false (serve almeno una b)
console.log(/colou?r/.test("color")); // => true (u opzionale)

// {n} esattamente n, {n,} almeno n, {n,m} da n a m
console.log(/\d{4}/.test("2026"));    // => true
console.log(/\d{2,4}/.test("12345")); // => true (matcha 4 cifre)

// Quantificatori greedy vs lazy (? rende lazy)
console.log("<a><b>".match(/<.+>/)[0]);  // => <a><b>  (greedy)
console.log("<a><b>".match(/<.+?>/)[0]); // => <a>     (lazy)

/* ------------------------------------------------------------
   5) test() — ritorna true/false
   ------------------------------------------------------------ */

// Il metodo piu' usato per validare: c'e' match si/no?
const reBadge = /^UP-\d{3}$/;
console.log(reBadge.test("UP-001")); // => true
console.log(reBadge.test("XX-1"));   // => false

/* ------------------------------------------------------------
   6) String.match() — estrae i match
   ------------------------------------------------------------ */

// Senza flag g: ritorna il primo match con gruppi e index
const m = "Turno P4 alle 08:30".match(/(\d{2}):(\d{2})/);
console.log(m[0]); // => 08:30  (match intero)
console.log(m[1]); // => 08     (gruppo 1)
console.log(m[2]); // => 30     (gruppo 2)

// Con flag g: ritorna array di tutti i match (senza gruppi)
console.log("08:30 e 17:00".match(/\d{2}:\d{2}/g)); // => [ '08:30', '17:00' ]

// matchAll: iteratore con gruppi per OGNI occorrenza (serve flag g)
for (const x of "08:30 17:00".matchAll(/(\d{2}):(\d{2})/g)) {
  console.log(x[1], x[2]); // => 08 30  poi  17 00
}

/* ------------------------------------------------------------
   7) GRUPPI: catturanti, nominati, non catturanti
   ------------------------------------------------------------ */

// Gruppi nominati (?<nome>...) leggibili e robusti
const orario = "08:45".match(/(?<ore>\d{2}):(?<min>\d{2})/);
console.log(orario.groups.ore, orario.groups.min); // => 08 45

// Gruppo non catturante (?:...) raggruppa senza creare un match
console.log("abab".match(/(?:ab)+/)[0]); // => abab

/* ------------------------------------------------------------
   8) ALTERNANZA E OR
   ------------------------------------------------------------ */

// | funziona come OR logico tra alternative
const reTurno = /^(P2|P4)$/;
console.log(reTurno.test("P4")); // => true
console.log(reTurno.test("P3")); // => false

/* ------------------------------------------------------------
   9) replace() e replaceAll() con regex
   ------------------------------------------------------------ */

// replace con flag g sostituisce tutte le occorrenze
console.log("a b  c".replace(/\s+/g, "_")); // => a_b_c

// $1 nel replacement riusa un gruppo catturato
console.log("30/06/2026".replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
// => 2026-06-30

// replace con funzione di callback: trasforma ogni match
const evidenzia = "UP-001 UP-002".replace(/UP-\d{3}/g, (b) => `[${b}]`);
console.log(evidenzia); // => [UP-001] [UP-002]

// split con regex: separatore flessibile
console.log("a, b ,c".split(/\s*,\s*/)); // => [ 'a', 'b', 'c' ]

/* ------------------------------------------------------------
   10) ESCAPE DEI CARATTERI SPECIALI
   ------------------------------------------------------------ */

// Per cercare un carattere speciale letteralmente va escapato con \
console.log(/\./.test("3.14"));  // => true (punto letterale)
console.log(/\$/.test("10$"));   // => true (dollaro letterale)

// Helper per escapare input utente da inserire in una regex dinamica
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ricerca = escapeRegex("a.b(c)");
console.log(new RegExp(ricerca).test("xa.b(c)y")); // => true

/* ============================================================
   PARTE PRATICA — VALIDAZIONI STILE ERP
   ============================================================ */

/* ------------------------------------------------------------
   A) VALIDAZIONE ORARIO HH:MM (timbrature)
   ------------------------------------------------------------ */

// Versione semplice: due cifre, due punti, due cifre
const reOrarioBase = /^\d{2}:\d{2}$/;
console.log(reOrarioBase.test("08:30")); // => true
console.log(reOrarioBase.test("8:30"));  // => false (servono 2 cifre)

// Versione rigorosa: 00-23 ore e 00-59 minuti
const reOrario = /^([01]\d|2[0-3]):([0-5]\d)$/;
console.log(reOrario.test("23:59")); // => true
console.log(reOrario.test("24:00")); // => false (ora non valida)
console.log(reOrario.test("12:60")); // => false (minuti non validi)

// Uso in una funzione di validazione timbratura
function validaTimbratura(ingresso, uscita) {
  if (!reOrario.test(ingresso) || !reOrario.test(uscita)) {
    return { ok: false, errore: "Formato orario non valido (HH:MM)" };
  }
  return { ok: true };
}
console.log(validaTimbratura("08:00", "17:00")); // => { ok: true }
console.log(validaTimbratura("08:00", "17.00")); // => { ok: false, ... }

/* ------------------------------------------------------------
   B) VALIDAZIONE CODICE BADGE 'UP-001'
   ------------------------------------------------------------ */

// Prefisso UP, trattino, 3 cifre. Estraiamo anche il numero progressivo.
const reCodiceBadge = /^UP-(\d{3})$/;
function parseBadge(codice) {
  const m = codice.match(reCodiceBadge);
  if (!m) return null;
  return { codice, progressivo: Number(m[1]) };
}
console.log(parseBadge("UP-007")); // => { codice: 'UP-007', progressivo: 7 }
console.log(parseBadge("up-007")); // => null  (case sensitive)

// Estrarre il numero finale da un badge generico con match(/-(\d+)$/)
console.log("REP-12".match(/-(\d+)$/)[1]); // => 12

/* ------------------------------------------------------------
   C) VALIDAZIONE EMAIL (dipendenti)
   ------------------------------------------------------------ */

// Regex email pragmatica: locale@dominio.tld (no spazi, una @, tld 2+)
const reEmail = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
console.log(reEmail.test("mario.rossi@polyuretech.com")); // => true
console.log(reEmail.test("mario@@x.com"));                // => false
console.log(reEmail.test("mario@dominio"));               // => false (no tld)

/* ------------------------------------------------------------
   D) RANGE DI TURNO "08:00 - 17:00"
   ------------------------------------------------------------ */

// Cattura inizio e fine di un range, accettando trattino o en-dash.
const reRange = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/;
function parseRangeTurno(testo) {
  const m = testo.match(reRange);
  if (!m) return null;
  const [, oi, mi, of_, mf] = m;
  return {
    inizio: `${oi.padStart(2, "0")}:${mi}`,
    fine: `${of_.padStart(2, "0")}:${mf}`,
  };
}
console.log(parseRangeTurno("Turno P4: 8:00 – 17:00"));
// => { inizio: '08:00', fine: '17:00' }

/* ------------------------------------------------------------
   E) NORMALIZZAZIONE SIGLA REPARTO (2 lettere)
   ------------------------------------------------------------ */

// Pulizia input utente: trim, upper, niente spazi interni, tronca a 2.
function normalizzaSigla(v) {
  const sigla = String(v || "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 2);
  return /^[A-Z]{2}$/.test(sigla) ? sigla : null;
}
console.log(normalizzaSigla("  pr "));  // => PR
console.log(normalizzaSigla("p"));      // => null (serve 2 lettere)

/* ------------------------------------------------------------
   F) ESTRARRE TUTTI GLI ORARI DA UN TESTO LIBERO
   ------------------------------------------------------------ */

const nota = "Ingresso 08:05, pausa 12:30-13:00, uscita 17:10";
const orari = [...nota.matchAll(/\b([01]\d|2[0-3]):([0-5]\d)\b/g)].map((m) => m[0]);
console.log(orari); // => [ '08:05', '12:30', '13:00', '17:10' ]

/* ------------------------------------------------------------
   G) LOOKAHEAD: validazione password DPI (esempio avanzato)
   ------------------------------------------------------------ */

// (?=...) lookahead positivo: almeno una cifra, una lettera, min 6 char.
const rePwd = /^(?=.*\d)(?=.*[a-zA-Z]).{6,}$/;
console.log(rePwd.test("abc123"));  // => true
console.log(rePwd.test("abcdef"));  // => false (manca una cifra)

/* ------------------------------------------------------------
   H) lastIndex con flag g (insidia da ricordare)
   ------------------------------------------------------------ */

// Una regex con g e' "stateful": exec() avanza lastIndex tra le chiamate.
const reG = /\d+/g;
console.log(reG.exec("a1b22")[0], reG.lastIndex); // => 1 2
console.log(reG.exec("a1b22")[0], reG.lastIndex); // => 22 5
// Riusare la stessa regex /g in test() dentro un loop puo' dare risultati
// inattesi: meglio ricrearla o azzerare reG.lastIndex = 0.

/* ============================================================
   RIEPILOGO COMANDI
   - /pattern/flags ........ sintassi letterale RegExp
   - new RegExp(str, flags)  costruttore per pattern dinamici
   - flag g i m s u y ...... global, ignoreCase, multiline, dotAll, unicode, sticky
   - regex.test(str) ....... true/false se c'e' match
   - str.match(re) ......... primo match (o array con flag g)
   - str.matchAll(re) ...... iteratore con gruppi (richiede g)
   - re.exec(str) .......... match + lastIndex (stateful con g)
   - str.replace/replaceAll  sostituzione ($1, callback)
   - str.split(re) ......... split con separatore regex
   - \d \w \s . [] [^] ^ $   metacaratteri e ancore
   - * + ? {n} {n,m} ....... quantificatori (greedy / lazy con ?)
   - (...) (?:...) (?<n>...)  gruppi: catturante, non catturante, nominato
   - | ..................... alternanza (OR)
   - (?=...) (?!...) ....... lookahead positivo / negativo
   - .flags .lastIndex ..... proprieta' dell'oggetto RegExp
   ============================================================ */
