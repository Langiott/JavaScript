/* ============================================================
   21 JS String Search
   La ricerca all'interno delle string in JavaScript permette di
   localizzare sottostringhe, verificarne la presenza e estrarre
   pattern. I metodi principali sono indexOf, lastIndexOf, includes,
   startsWith, endsWith (ricerca posizionale o booleana) e match /
   matchAll (ricerca basata su regular expression). Sono strumenti
   fondamentali per validare codici, filtrare elenchi e fare parsing.
   ============================================================ */

/* ------------------------------------------------------------
   1. indexOf — posizione della PRIMA occorrenza (o -1)
   ------------------------------------------------------------ */

// indexOf ritorna l'indice (0-based) della prima occorrenza
const frase = "Assegnato a Mario Rossi";
console.log(frase.indexOf("Mario")); // => 12

// Se la sottostringa non esiste ritorna -1
console.log(frase.indexOf("Verdi")); // => -1

// indexOf e' case-sensitive
console.log("Reparto".indexOf("reparto")); // => -1

// Secondo argomento: posizione di partenza della ricerca
const ripetuta = "UP-001-UP-002";
console.log(ripetuta.indexOf("UP", 3)); // => 7

// Pattern tipico: verificare presenza confrontando con -1
const badge = "UP-001";
if (badge.indexOf("UP-") !== -1) {
  console.log("Badge valido del reparto Ufficio Produzione");
}

/* ------------------------------------------------------------
   2. lastIndexOf — posizione dell'ULTIMA occorrenza
   ------------------------------------------------------------ */

// lastIndexOf cerca partendo dalla fine
const percorso = "src/modules/timbrature/index.js";
console.log(percorso.lastIndexOf("/")); // => 20

// Utile per estrarre l'estensione o il nome del file
const nomeFile = percorso.slice(percorso.lastIndexOf("/") + 1);
console.log(nomeFile); // => index.js

// Estrarre l'estensione con lastIndexOf del punto
const estensione = nomeFile.slice(nomeFile.lastIndexOf(".") + 1);
console.log(estensione); // => js

// Anche lastIndexOf ritorna -1 se non trova nulla
console.log("badge".lastIndexOf("z")); // => -1

/* ------------------------------------------------------------
   3. includes — verifica booleana di presenza
   ------------------------------------------------------------ */

// includes ritorna true/false: piu leggibile di indexOf !== -1
const turno = "P4 con pausa pranzo";
console.log(turno.includes("pausa")); // => true
console.log(turno.includes("notturno")); // => false

// Anche includes accetta una posizione di partenza
console.log("p4-p4".includes("p4", 1)); // => true

// Esempio ERP: filtrare dipendenti la cui nota contiene una keyword
const dipendenti = [
  { nome: "Mario", nota: "turno P4 fisso" },
  { nome: "Lucia", nota: "part-time mattina" },
  { nome: "Anna", nota: "turno P4 ridotto" },
];
const conP4 = dipendenti.filter((d) => d.nota.includes("P4"));
console.log(conP4.map((d) => d.nome)); // => [ 'Mario', 'Anna' ]

/* ------------------------------------------------------------
   4. startsWith — verifica del prefisso
   ------------------------------------------------------------ */

// startsWith ritorna true se la string inizia con il valore dato
console.log("UP-001".startsWith("UP")); // => true
console.log("RD-014".startsWith("UP")); // => false

// Con secondo argomento: posizione da cui valutare il prefisso
console.log("REP-UP-001".startsWith("UP", 4)); // => true

// Esempio ERP: raggruppare badge per sigla di reparto (2 lettere)
const badges = ["UP-001", "UP-002", "RD-010", "MG-007"];
const ufficioProd = badges.filter((b) => b.startsWith("UP"));
console.log(ufficioProd); // => [ 'UP-001', 'UP-002' ]

/* ------------------------------------------------------------
   5. endsWith — verifica del suffisso
   ------------------------------------------------------------ */

// endsWith ritorna true se la string termina con il valore dato
console.log("report.csv".endsWith(".csv")); // => true
console.log("report.csv".endsWith(".xlsx")); // => false

// Secondo argomento: tratta la string come se fosse lunga N caratteri
console.log("UP-001-archiviato".endsWith("001", 6)); // => true

// Esempio: distinguere file esportati dal gestionale
const files = ["timbrature.csv", "dipendenti.json", "turni.csv"];
const csvOnly = files.filter((f) => f.endsWith(".csv"));
console.log(csvOnly); // => [ 'timbrature.csv', 'turni.csv' ]

/* ------------------------------------------------------------
   6. Normalizzazione prima della ricerca (case-insensitive)
   ------------------------------------------------------------ */

// I metodi sono case-sensitive: normalizza con toLowerCase/toUpperCase
function contieneInsensitive(testo, ricerca) {
  return testo.toLowerCase().includes(ricerca.toLowerCase());
}
console.log(contieneInsensitive("Reparto Magazzino", "magazzino")); // => true

// Pattern ERP reale: normalizzare un codice badge inserito a mano
const grezzo = "  up-001  ";
const codiceBadge = String(grezzo || "")
  .trim()
  .toUpperCase()
  .replace(/\s+/g, "")
  .slice(0, 8);
console.log(codiceBadge); // => UP-001
console.log(codiceBadge.startsWith("UP")); // => true

/* ------------------------------------------------------------
   7. match — ricerca con regular expression
   ------------------------------------------------------------ */

// match SENZA flag g: ritorna array con primo match + gruppi + index
const orario = "Ingresso alle 08:30 di mattina";
const m = orario.match(/(\d{1,2}):(\d{2})/);
console.log(m[0]); // => 08:30
console.log(m[1]); // => 08   (primo capture group)
console.log(m[2]); // => 30   (secondo capture group)
console.log(m.index); // => 13

// match CON flag g: ritorna array di TUTTE le occorrenze (senza gruppi)
const range = "Turno 08:00 - 17:00";
console.log(range.match(/\d{1,2}:\d{2}/g)); // => [ '08:00', '17:00' ]

// match ritorna null se non trova nulla (occhio prima di usarlo!)
const senzaOra = "Giorno di riposo";
console.log(senzaOra.match(/\d{1,2}:\d{2}/)); // => null

// Estrazione sicura con optional chaining e nullish
const numeroBadge = "UP-042".match(/-(\d+)$/)?.[1] ?? "000";
console.log(numeroBadge); // => 042

// Named capture groups: piu leggibili
const t = "Rientro 14:05".match(/(?<ore>\d{2}):(?<min>\d{2})/);
console.log(t.groups.ore, t.groups.min); // => 14 05

/* ------------------------------------------------------------
   8. matchAll — iterare TUTTE le occorrenze CON i gruppi
   ------------------------------------------------------------ */

// matchAll richiede il flag g e ritorna un iterator di match completi
const giornata = "08:00-12:00 e 13:00-17:00";
const tutti = [...giornata.matchAll(/(\d{2}):(\d{2})/g)];
for (const occ of tutti) {
  console.log(`match ${occ[0]} ore=${occ[1]} min=${occ[2]} @${occ.index}`);
}
// => match 08:00 ore=08 min=00 @0
// => match 12:00 ore=12 min=00 @6  ... ecc.

// Esempio ERP: parsare un range di turno "08:30 - 17:00"
function parseRange(testo) {
  const re = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/;
  const r = testo.match(re);
  if (!r) return null;
  return {
    inizio: `${r[1].padStart(2, "0")}:${r[2]}`,
    fine: `${r[3].padStart(2, "0")}:${r[4]}`,
  };
}
console.log(parseRange("8:30 – 17:00")); // => { inizio: '08:30', fine: '17:00' }

// matchAll con named groups: estrarre tutti i badge da un testo libero
const log = "Timbrature: UP-001, RD-014, MG-007 registrate";
const elenco = [...log.matchAll(/(?<sigla>[A-Z]{2})-(?<num>\d{3})/g)];
console.log(elenco.map((e) => `${e.groups.sigla}/${e.groups.num}`));
// => [ 'UP/001', 'RD/014', 'MG/007' ]

/* ------------------------------------------------------------
   9. search — indice del primo match regex (simile a indexOf)
   ------------------------------------------------------------ */

// search ritorna l'indice del primo match di una regex (o -1)
console.log("Turno P4 alle 08:00".search(/\d/)); // => 14
console.log("Riposo".search(/\d/)); // => -1

/* ------------------------------------------------------------
   10. test — controllo booleano con regex (metodo di RegExp)
   ------------------------------------------------------------ */

// Per un semplice si/no, RegExp.test e' piu diretto di match
const formatoOrarioOk = /^\d{2}:\d{2}$/.test("08:30");
console.log(formatoOrarioOk); // => true
console.log(/^\d{2}:\d{2}$/.test("8:30")); // => false

// Validazione badge ERP completa
function badgeValido(codice) {
  return /^[A-Z]{2}-\d{3}$/.test(codice);
}
console.log(badgeValido("UP-001")); // => true
console.log(badgeValido("up-1")); // => false

/* ------------------------------------------------------------
   11. Casi avanzati e combinazioni pratiche (stile ERP)
   ------------------------------------------------------------ */

// Ricerca di TUTTE le posizioni di una sottostringa con indexOf in loop
function tuttePosizioni(testo, sub) {
  const pos = [];
  let i = testo.indexOf(sub);
  while (i !== -1) {
    pos.push(i);
    i = testo.indexOf(sub, i + 1);
  }
  return pos;
}
console.log(tuttePosizioni("UP-UP-UP", "UP")); // => [ 0, 3, 6 ]

// Contare le occorrenze con matchAll
function conta(testo, regex) {
  return [...testo.matchAll(regex)].length;
}
console.log(conta("P4 P4 P2 P4", /P4/g)); // => 3

// Estrarre dominio email per assegnazione reparto
const email = "mario.rossi@polyuretech.com";
const dominio = email.slice(email.lastIndexOf("@") + 1);
console.log(dominio); // => polyuretech.com
console.log(dominio.endsWith(".com")); // => true

// Filtrare un elenco di articoli vestiario per descrizione
const vestiario = [
  { cdAr: "DPI-01", descrizione: "Guanti antitaglio taglia L" },
  { cdAr: "DPI-02", descrizione: "Scarpe antinfortunistiche 42" },
  { cdAr: "DPI-03", descrizione: "Guanti nitrile taglia M" },
];
const guanti = vestiario.filter((a) =>
  a.descrizione.toLowerCase().includes("guanti")
);
console.log(guanti.map((g) => g.cdAr)); // => [ 'DPI-01', 'DPI-03' ]

// Highlight: avvolgere ogni match con marcatori usando matchAll
function evidenzia(testo, termine) {
  const re = new RegExp(termine, "gi");
  return testo.replace(re, (mm) => `[${mm}]`);
}
console.log(evidenzia("Turno P4 e turno p4 ridotto", "p4"));
// => Turno [P4] e turno [p4] ridotto

// Validazione composita: badge che inizia con sigla nota
const sigleValide = ["UP", "RD", "MG"];
function repartoDaBadge(badge) {
  const sigla = badge.slice(0, 2);
  return sigleValide.includes(sigla) ? sigla : "XX";
}
console.log(repartoDaBadge("MG-007")); // => MG
console.log(repartoDaBadge("ZZ-999")); // => XX

/* ------------------------------------------------------------
   12. Esempio browser (DOM): NON gira in Node
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function evidenziaInput() {
  // const q = document.querySelector("#cerca").value;
  // const righe = document.querySelectorAll(".riga-dipendente");
  // righe.forEach((r) => {
  //   const visibile = r.textContent.toLowerCase().includes(q.toLowerCase());
  //   r.style.display = visibile ? "" : "none";
  // });
}

/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   ------------------------------------------------------------
   str.indexOf(sub[, from])      -> indice prima occorrenza o -1
   str.lastIndexOf(sub[, from])  -> indice ultima occorrenza o -1
   str.includes(sub[, from])     -> true/false presenza
   str.startsWith(pre[, pos])    -> true/false prefisso
   str.endsWith(suf[, len])      -> true/false suffisso
   str.match(regex)              -> 1 match (+gruppi) o array g, o null
   str.matchAll(/regex/g)        -> iterator di match completi (+gruppi)
   str.search(regex)             -> indice primo match regex o -1
   regex.test(str)               -> true/false (metodo di RegExp)
   str.replace(regex, fn)        -> sostituzione/evidenziazione
   Named groups: /(?<nome>...)/  -> match.groups.nome
   Normalizzazione: trim / toLowerCase / toUpperCase / replace
   ============================================================ */
