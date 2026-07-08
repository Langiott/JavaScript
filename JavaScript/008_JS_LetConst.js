/* ============================================================
   8 JS LetConst
   Approfondimento su let e const, le due dichiarazioni moderne
   di JavaScript (ES2015+). Vedremo il block scope, la Temporal
   Dead Zone (TDZ), la differenza tra "binding immutabile" e
   "valore immutabile" (const con oggetti e array resta mutabile),
   il confronto con var e gli errori tipici. Esempi progressivi
   dal livello base a quello avanzato, con spunti da un ERP.
   ============================================================ */

// ------------------------------------------------------------
// 1) BASE: let e const
// ------------------------------------------------------------

// let dichiara una variabile riassegnabile
let contatoreTimbrature = 0;
contatoreTimbrature = 1;
contatoreTimbrature = contatoreTimbrature + 1;
console.log(contatoreTimbrature); // => 2

// const dichiara un binding NON riassegnabile (deve avere subito un valore)
const AZIENDA = "Polyuretech";
console.log(AZIENDA); // => Polyuretech

// Riassegnare una const lancia un TypeError (qui solo descritto)
// AZIENDA = "Altro"; // => TypeError: Assignment to constant variable.

// const senza inizializzazione e' un errore di sintassi
// const x; // => SyntaxError: Missing initializer in const declaration

// ------------------------------------------------------------
// 2) BLOCK SCOPE: let/const vivono solo nel blocco { ... }
// ------------------------------------------------------------

{
  let interno = "visibile solo qui";
  const ANCHE_QUESTO = "idem";
  console.log(interno); // => visibile solo qui
  console.log(ANCHE_QUESTO); // => idem
}
// console.log(interno); // => ReferenceError: interno is not defined

// Anche if, for, while creano un blocco
if (true) {
  let messaggio = "dentro l'if";
  console.log(messaggio); // => dentro l'if
}
// console.log(messaggio); // => ReferenceError

// ------------------------------------------------------------
// 3) DIFFERENZA CON var: function scope vs block scope
// ------------------------------------------------------------

function provaScope() {
  if (true) {
    var conVar = "var ignora il blocco";
    let conLet = "let rispetta il blocco";
  }
  console.log(conVar); // => var ignora il blocco
  // console.log(conLet); // => ReferenceError: conLet is not defined
}
provaScope();

// ------------------------------------------------------------
// 4) TDZ (Temporal Dead Zone)
// ------------------------------------------------------------

// var e' soggetta a hoisting e vale undefined prima della riga
console.log(typeof varNonAncora); // => undefined
var varNonAncora = 10;

// let e const SONO hoisted ma restano nella TDZ: accederci prima
// della dichiarazione lancia ReferenceError.
function dimostraTDZ() {
  // console.log(reparto); // => ReferenceError: Cannot access 'reparto' before initialization
  let reparto = "Produzione";
  return reparto;
}
console.log(dimostraTDZ()); // => Produzione

// La TDZ va dall'inizio del blocco fino alla riga della dichiarazione
{
  // qui 'sigla' esiste ma e' inaccessibile (TDZ)
  const sigla = "PR";
  console.log(sigla); // => PR
}

// ------------------------------------------------------------
// 5) NIENTE RIDICHIARAZIONE con let/const nello stesso scope
// ------------------------------------------------------------

let unico = 1;
// let unico = 2; // => SyntaxError: Identifier 'unico' has already been declared
unico = 2; // la riassegnazione invece va bene
console.log(unico); // => 2

// var invece permette ridichiarazioni (fonte di bug)
var doppio = 1;
var doppio = 2; // nessun errore
console.log(doppio); // => 2

// ------------------------------------------------------------
// 6) IL CLASSICO BUG DEL for: let crea un binding per iterazione
// ------------------------------------------------------------

// Con var tutte le closure condividono la stessa variabile
const conVarFns = [];
for (var i = 0; i < 3; i++) {
  conVarFns.push(() => i);
}
console.log(conVarFns.map((f) => f())); // => [ 3, 3, 3 ]

// Con let ogni iterazione ha il proprio binding
const conLetFns = [];
for (let j = 0; j < 3; j++) {
  conLetFns.push(() => j);
}
console.log(conLetFns.map((f) => f())); // => [ 0, 1, 2 ]

// ------------------------------------------------------------
// 7) const CON OGGETTI: il binding e' costante, il contenuto NO
// ------------------------------------------------------------

const dipendente = { nome: "Mario", codiceBadge: "UP-001" };

// Si possono modificare le proprieta' (l'oggetto e' mutabile)
dipendente.ruolo = "Operaio";
dipendente.nome = "Maria";
console.log(dipendente); // => { nome: 'Maria', codiceBadge: 'UP-001', ruolo: 'Operaio' }

// Quello che NON si puo' fare e' riassegnare il binding
// dipendente = {}; // => TypeError: Assignment to constant variable.

// Per rendere l'oggetto davvero immutabile si usa Object.freeze
const turnoP4 = Object.freeze({ codice: "P4", pausa: true, minuti: 480 });
turnoP4.minuti = 999; // ignorato in modalita' non-strict
console.log(turnoP4.minuti); // => 480
console.log(Object.isFrozen(turnoP4)); // => true

// ------------------------------------------------------------
// 8) const CON ARRAY: si puo' mutare il contenuto
// ------------------------------------------------------------

const badge = ["UP-001", "UP-002"];
badge.push("UP-003"); // ok: muto l'array
badge[0] = "UP-099"; // ok: muto un elemento
console.log(badge); // => [ 'UP-099', 'UP-002', 'UP-003' ]

// badge = []; // => TypeError: Assignment to constant variable.

// Pattern ERP: trasformo le righe di una query in DTO senza riassegnare
const articoliRaw = [
  { articolo_poly: "p4-100", descrizione: "Tuta" },
  { articolo_poly: "p2-200", descrizione: "Guanti" },
];
const articoliDTO = articoliRaw.map((a) => ({
  cdAr: a.articolo_poly,
  descrizione: a.descrizione,
}));
console.log(articoliDTO[0]); // => { cdAr: 'p4-100', descrizione: 'Tuta' }

// ------------------------------------------------------------
// 9) const + DESTRUCTURING (pattern molto comune nell'ERP)
// ------------------------------------------------------------

const assegnazione = { vestiario: "Tuta", taglia: "L", quantita: 2, scortaMinima: 5 };

// estraggo vestiario e raccolgo il resto in 'rest'
const { vestiario, ...rest } = assegnazione;
console.log(vestiario); // => Tuta
console.log(rest); // => { taglia: 'L', quantita: 2, scortaMinima: 5 }

// destructuring di array con const
const orari = ["08:00", "12:00", "13:00", "17:00"];
const [ingresso, , , uscita] = orari;
console.log(ingresso, uscita); // => 08:00 17:00

// valori di default nel destructuring
const reparto = { nome: "Produzione" };
const { sigla = "XX" } = reparto;
console.log(sigla); // => XX

// ------------------------------------------------------------
// 10) const NEI parametri e nelle closure
// ------------------------------------------------------------

// I parametri di funzione si comportano come let (riassegnabili).
// Usare const all'interno aiuta a non riassegnare per errore.
function minutiLavorati(timbratura) {
  const { ingresso, uscita } = timbratura;
  const minIn = toMinuti(ingresso);
  const minOut = toMinuti(uscita);
  return minOut - minIn;
}
function toMinuti(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
console.log(minutiLavorati({ ingresso: "08:00", uscita: "17:00" })); // => 540

// ------------------------------------------------------------
// 11) AVANZATO: const e immutabilita' "profonda"
// ------------------------------------------------------------

// Object.freeze e' superficiale (shallow): annida-> non protetto
const config = Object.freeze({
  arrotondamento: { regola: "su", minuti: 15 },
});
config.arrotondamento.minuti = 30; // muta l'oggetto annidato!
console.log(config.arrotondamento.minuti); // => 30

// freeze profondo ricorsivo
function deepFreeze(obj) {
  for (const valore of Object.values(obj)) {
    if (valore && typeof valore === "object") deepFreeze(valore);
  }
  return Object.freeze(obj);
}
const configSicura = deepFreeze({ arrotondamento: { regola: "su", minuti: 15 } });
configSicura.arrotondamento.minuti = 99; // ora ignorato
console.log(configSicura.arrotondamento.minuti); // => 15

// ------------------------------------------------------------
// 12) AVANZATO: const con spread per "copie modificate" (immutabilita' pratica)
// ------------------------------------------------------------

const DEFAULT_IMPOSTAZIONI = { regola: "su", soglia: 15, turni: ["P4"] };

// invece di mutare, creo un nuovo oggetto: pattern reducer-style
const impostazioniUtente = { soglia: 10 };
const impostazioniFinali = { ...DEFAULT_IMPOSTAZIONI, ...impostazioniUtente };
console.log(impostazioniFinali); // => { regola: 'su', soglia: 10, turni: [ 'P4' ] }

// nuovo array senza mutare l'originale
const turni = ["P4", "P2"];
const turniConNotturno = [...turni, "PN"];
console.log(turni); // => [ 'P4', 'P2' ]
console.log(turniConNotturno); // => [ 'P4', 'P2', 'PN' ]

// ------------------------------------------------------------
// 13) AVANZATO: somma minuti con const + array methods (ERP timbrature)
// ------------------------------------------------------------

const richieste = [
  { tipo: "ferie", minuti: 480, approvata: true },
  { tipo: "permesso", minuti: 120, approvata: false },
  { tipo: "ferie", minuti: 240, approvata: true },
];
const totaleApprovato = richieste
  .filter((r) => r.approvata)
  .reduce((somma, r) => somma + r.minuti, 0);
console.log(totaleApprovato); // => 720

// ------------------------------------------------------------
// 14) AVANZATO: const e loop for...of (un nuovo binding per giro)
// ------------------------------------------------------------

// Si puo' usare const nel for...of perche' a ogni iterazione
// viene creato un binding nuovo (nessuna riassegnazione).
const elencoBadge = ["UP-001", "UP-002", "UP-003"];
for (const b of elencoBadge) {
  // b e' const dentro questa iterazione
  console.log(b.slice(3)); // => 001 / 002 / 003
}

// Nel for classico NON si puo' usare const sul contatore (verrebbe riassegnato)
// for (const k = 0; k < 3; k++) {} // => TypeError alla seconda iterazione

// ------------------------------------------------------------
// 15) AVANZATO: TDZ con default params che si riferiscono tra loro
// ------------------------------------------------------------

// I default params hanno la loro TDZ da sinistra a destra
function badgeCompleto(prefix = "UP", numero = 1, codice = `${prefix}-${numero}`) {
  return codice;
}
console.log(badgeCompleto()); // => UP-1
console.log(badgeCompleto("DP", 42)); // => DP-42

// ------------------------------------------------------------
// 16) ESEMPIO BROWSER (pseudo-eseguibile, non gira in Node)
// ------------------------------------------------------------

// Esempio browser: gira nel browser, non in Node
function inizializzaUI() {
  const bottone = document.getElementById("salva"); // const: il riferimento non cambia
  let click = 0; // let: contatore che muta
  bottone.addEventListener("click", () => {
    click++;
    console.log(`Click numero ${click}`);
  });
}
// inizializzaUI(); // da chiamare nel browser

// ------------------------------------------------------------
// 17) REGOLA PRATICA: usa const di default, let solo se devi riassegnare
// ------------------------------------------------------------

const NOME_APP = "ERP"; // non cambiera' mai -> const
let righeProcessate = 0; // verra' incrementato -> let
const buffer = []; // il binding non cambia, riempio l'array -> const
buffer.push("riga1");
righeProcessate += buffer.length;
console.log(NOME_APP, righeProcessate); // => ERP 1

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   let nome = valore           -> variabile riassegnabile, block scope
   const NOME = valore         -> binding non riassegnabile, block scope
   { ... }                     -> blocco che delimita lo scope di let/const
   TDZ                         -> accesso prima della dichiarazione: ReferenceError
   var                         -> function scope + hoisting (evitare nel codice nuovo)
   Object.freeze(obj)          -> rende immutabile (shallow) un oggetto const
   Object.isFrozen(obj)        -> true se l'oggetto e' congelato
   Object.values(obj)          -> usato per deepFreeze ricorsivo
   { a, ...rest } = obj        -> destructuring con resto (rest)
   [a, , b] = arr              -> destructuring di array (skip elementi)
   { x = def } = obj           -> default nel destructuring
   {...A, ...B}                -> merge/copia oggetti (immutabilita' pratica)
   [...arr, nuovo]             -> copia array aggiungendo elementi
   array.map/filter/reduce     -> trasformazioni senza riassegnare il binding
   for (const x of iterabile)  -> nuovo binding const per iterazione
   for (let i=0; ...)          -> contatore: usare let, non const ne' var
   default params (a, b=`...`) -> hanno la propria TDZ sinistra->destra
   ============================================================ */
