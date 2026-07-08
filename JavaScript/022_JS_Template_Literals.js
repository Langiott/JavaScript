/* ============================================================
   22 JS Template Literals
   I template literals (delimitati dai backtick `) sono stringhe
   evolute introdotte in ES6. Permettono interpolation di variabili
   ed espressioni con ${...}, stringhe multiline senza '\n', e i
   tagged templates: funzioni che ricevono pezzi statici e valori
   interpolati per processare il testo (escaping, i18n, query).
   Sostituiscono in modo leggibile la vecchia concatenazione con '+'.
   ============================================================ */

// ------------------------------------------------------------
// 1) BASE: differenza tra stringhe normali e template literal
// ------------------------------------------------------------

// Stringa classica con apici: niente interpolation
const nome = "Mario";
const saluto1 = "Ciao " + nome + "!";
console.log(saluto1); // => Ciao Mario!

// Stessa cosa con template literal: piu leggibile
const saluto2 = `Ciao ${nome}!`;
console.log(saluto2); // => Ciao Mario!

// I backtick possono contenere apici singoli e doppi senza escape
const frase = `Lui ha detto "ok" e lei 'va bene'`;
console.log(frase); // => Lui ha detto "ok" e lei 'va bene'

// ------------------------------------------------------------
// 2) INTERPOLATION: variabili dentro ${ }
// ------------------------------------------------------------

const cognome = "Rossi";
const eta = 30;
console.log(`Dipendente: ${nome} ${cognome}, eta ${eta}`);
// => Dipendente: Mario Rossi, eta 30

// Si possono interpolare anche valori non-stringa: vengono convertiti
const attivo = true;
console.log(`Attivo: ${attivo}`); // => Attivo: true
console.log(`Lista: ${[1, 2, 3]}`); // => Lista: 1,2,3 (Array -> join con virgola)

// ------------------------------------------------------------
// 3) EXPRESSION: dentro ${ } va qualsiasi espressione JS
// ------------------------------------------------------------

// Operazioni aritmetiche
console.log(`Somma: ${2 + 3 * 4}`); // => Somma: 14

// Chiamate a metodi
console.log(`Maiuscolo: ${nome.toUpperCase()}`); // => Maiuscolo: MARIO

// Operatore ternario inline
const ore = 9;
console.log(`Stato: ${ore >= 8 ? "completo" : "parziale"}`); // => Stato: completo

// Optional chaining e nullish dentro l'interpolation
const reparto = { sigla: null };
console.log(`Reparto: ${reparto?.sigla ?? "XX"}`); // => Reparto: XX

// Chiamata a funzione
const iva = (p) => p * 1.22;
console.log(`Prezzo IVA: ${iva(100).toFixed(2)}`); // => Prezzo IVA: 122.00

// ------------------------------------------------------------
// 4) MULTILINE: stringhe su piu righe senza \n manuali
// ------------------------------------------------------------

// La stringa preserva esattamente gli a-capo presenti nel sorgente
const blocco = `Riga 1
Riga 2
Riga 3`;
console.log(blocco);
// => Riga 1
// => Riga 2
// => Riga 3

// ATTENZIONE: anche l'indentazione finisce nella stringa
function reportIndentato() {
  return `Header
  voce indentata`; // i 2 spazi prima di 'voce' fanno parte del testo
}
console.log(reportIndentato());

// Trucco: per evitare l'indentazione si usa trim() o si scrive a sinistra
const pulito = `Header
voce`.trim();
console.log(pulito);

// ------------------------------------------------------------
// 5) NESTING: template literal dentro un altro
// ------------------------------------------------------------

const utenti = ["Anna", "Luca"];
const html = `<ul>${utenti.map((u) => `<li>${u}</li>`).join("")}</ul>`;
console.log(html); // => <ul><li>Anna</li><li>Luca</li></ul>

// ------------------------------------------------------------
// 6) ESEMPI DI FORMATTAZIONE COMUNE
// ------------------------------------------------------------

// padStart per orari HH:MM (pattern timbrature)
const h = 8;
const m = 5;
const orario = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
console.log(orario); // => 08:05

// Costruzione di codice badge tipo 'UP-001'
const progressivo = 1;
const badge = `UP-${String(progressivo).padStart(3, "0")}`;
console.log(badge); // => UP-001

// Data YYYY-MM-DD via slice di toISOString
const giorno = new Date(Date.UTC(2026, 5, 30)).toISOString().slice(0, 10);
console.log(`Data: ${giorno}`); // => Data: 2026-06-30

// ------------------------------------------------------------
// 7) TAGGED TEMPLATES: la funzione tag
// ------------------------------------------------------------

// Una funzione "tag" prefissa il template. Riceve:
//  - strings: array dei pezzi statici (sempre length valori + 1)
//  - ...values: i valori interpolati
function ispeziona(strings, ...values) {
  console.log("strings:", strings); // => [ 'A ', ' B ', '' ]
  console.log("values:", values); // => [ 1, 2 ]
  return "risultato";
}
ispeziona`A ${1} B ${2}`;

// Tag che ricostruisce la stringa upcase sui valori
function evidenzia(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const val = values[i] !== undefined ? `[${values[i]}]` : "";
    return acc + str + val;
  }, "");
}
console.log(evidenzia`Dip. ${nome} reparto ${"P4"}`);
// => Dip. [Mario] reparto [P4]

// ------------------------------------------------------------
// 8) TAGGED TEMPLATE: sanitizzazione (escape HTML)
// ------------------------------------------------------------

// Tag pratico: rende sicuro l'input interpolato in HTML
function safeHtml(strings, ...values) {
  const escape = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? escape(values[i]) : ""),
    ""
  );
}
const inputUtente = "<script>alert(1)</script>";
console.log(safeHtml`Nota: ${inputUtente}`);
// => Nota: &lt;script&gt;alert(1)&lt;/script&gt;

// ------------------------------------------------------------
// 9) String.raw: accedere al testo grezzo (senza interpretare \n)
// ------------------------------------------------------------

// strings.raw contiene le sequenze di escape NON interpretate
console.log(`a\tb`); // => a    b   (tab interpretato)
console.log(String.raw`a\tb`); // => a\tb  (grezzo, utile per path/regex)

// Esempio: path Windows senza dover raddoppiare i backslash
const path = String.raw`C:\Users\report\dati.txt`;
console.log(path); // => C:\Users\report\dati.txt

// ------------------------------------------------------------
// 10) ESEMPIO ERP: riga descrittiva di una timbratura
// ------------------------------------------------------------

const timbratura = {
  dipendente: { nome: "Mario", cognome: "Rossi" },
  ingresso: "08:00",
  uscita: "17:00",
  oreLavorate: 8,
};
const { dipendente, ingresso, uscita, oreLavorate } = timbratura;
const riga = `${dipendente.nome} ${dipendente.cognome}: ${ingresso}-${uscita} (${oreLavorate}h)`;
console.log(riga); // => Mario Rossi: 08:00-17:00 (8h)

// ------------------------------------------------------------
// 11) ESEMPIO ERP: report multiline di un reparto
// ------------------------------------------------------------

const repartoData = {
  sigla: "P4",
  presenti: 12,
  totale: 15,
};
const reportReparto = `
=== Reparto ${repartoData.sigla} ===
Presenti: ${repartoData.presenti}/${repartoData.totale}
Assenti: ${repartoData.totale - repartoData.presenti}
Copertura: ${((repartoData.presenti / repartoData.totale) * 100).toFixed(1)}%
`.trim();
console.log(reportReparto);
// => === Reparto P4 ===
// => Presenti: 12/15
// => Assenti: 3
// => Copertura: 80.0%

// ------------------------------------------------------------
// 12) ESEMPIO ERP: tag per costruire query parametrizzate (sicuro)
// ------------------------------------------------------------

// Tag che NON concatena i valori nel testo ma li raccoglie come params,
// pattern usato dalle librerie SQL per evitare injection.
function sql(strings, ...values) {
  const text = strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""),
    ""
  );
  return { text, values };
}
const idDip = 42;
const sigla = "P4";
const query = sql`SELECT * FROM timbrature WHERE dipendente_id = ${idDip} AND reparto = ${sigla}`;
console.log(query.text);
// => SELECT * FROM timbrature WHERE dipendente_id = $1 AND reparto = $2
console.log(query.values); // => [ 42, 'P4' ]

// ------------------------------------------------------------
// 13) ESEMPIO ERP: lista vestiario/DPI in formato testo
// ------------------------------------------------------------

const vestiario = [
  { capo: "Giacca", taglia: "L", quantita: 3, scortaMinima: 5 },
  { capo: "Scarpe", taglia: "42", quantita: 10, scortaMinima: 4 },
];
const inventario = vestiario
  .map((v) => {
    const alert = v.quantita < v.scortaMinima ? " (SOTTO SCORTA!)" : "";
    return `- ${v.capo} tg.${v.taglia}: ${v.quantita} pz${alert}`;
  })
  .join("\n");
console.log(inventario);
// => - Giacca tg.L: 3 pz (SOTTO SCORTA!)
// => - Scarpe tg.42: 10 pz

// ------------------------------------------------------------
// 14) ESEMPIO ERP: messaggio dinamico con Intl per la valuta
// ------------------------------------------------------------

const totaleOre = 173;
const tariffa = 18.5;
const compenso = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
}).format(totaleOre * tariffa);
console.log(`Compenso mensile: ${compenso}`);
// => Compenso mensile: 3.200,50 €  (formato locale it-IT)

// ------------------------------------------------------------
// 15) TAG PER INTERNAZIONALIZZAZIONE (i18n) semplificata
// ------------------------------------------------------------

// Esempio browser: questo tag puo essere usato anche in Node, qui resta autonomo.
function i18n(dizionario) {
  return (strings, ...values) => {
    const chiave = strings.join("{}").trim();
    const template = dizionario[chiave] || chiave;
    return values.reduce((acc, v) => acc.replace("{}", v), template);
  };
}
const t = i18n({ "Benvenuto {}": "Welcome {}" });
console.log(t`Benvenuto ${nome}`); // => Welcome Mario

// ------------------------------------------------------------
// 16) ATTENZIONE: ${ } esegue subito l'espressione
// ------------------------------------------------------------

// Il template viene valutato al momento della creazione, non e "lazy"
let contatore = 0;
const incr = () => ++contatore;
const messaggio = `Valore: ${incr()}`; // incr() gia chiamata qui
console.log(messaggio); // => Valore: 1
console.log(contatore); // => 1

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   `...`                 -> template literal (backtick)
   ${ espressione }      -> interpolation di variabili/espressioni
   `riga1\nriga2`        -> multiline (a-capo nel sorgente)
   tag`...`              -> tagged template (funzione + template)
   (strings, ...values)  -> firma di una funzione tag
   strings.raw           -> pezzi statici NON interpretati
   String.raw`...`       -> stringa grezza (path, regex)
   .padStart(n, '0')     -> padding orari/badge (HH:MM, UP-001)
   .toFixed(n)           -> arrotondamento numerico in interpolation
   ?. / ??               -> optional chaining e nullish in ${...}
   .map().join('')       -> nesting per liste HTML/testo
   Intl.NumberFormat     -> formattazione valuta/numeri locali
   ============================================================ */
