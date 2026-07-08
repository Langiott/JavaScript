/* ============================================================
   12 JS Assignment
   Gli assignment operators (operatori di assegnazione) servono ad
   assegnare un valore a una variabile. Oltre al semplice "=",
   JavaScript offre operatori "compound" (+=, -=, *=, **=, ecc.)
   che combinano un'operazione aritmetica/logica con l'assegnazione,
   rendendo il codice piu' conciso. Da ES2020 sono arrivati anche i
   logical assignment operators (??=, ||=, &&=) molto utili per
   gestire default e valori nullish.
   ============================================================ */

// ------------------------------------------------------------
// 1) "=" : assignment di base
// ------------------------------------------------------------

// Assegna un valore a una variabile dichiarata con let.
let x = 10;
console.log(x); // => 10

// L'assignment e' un'espressione: restituisce il valore assegnato.
let y;
console.log((y = 5)); // => 5

// Chaining: lo stesso valore assegnato a piu' variabili.
let a, b, c;
a = b = c = 0;
console.log(a, b, c); // => 0 0 0

// Con const il valore non puo' essere riassegnato (solo inizializzazione).
const PI = 3.14;
// PI = 3; // => TypeError: Assignment to constant variable.
console.log(PI); // => 3.14

// ------------------------------------------------------------
// 2) "+=" : addition assignment
// ------------------------------------------------------------

// x += y equivale a x = x + y.
let punti = 100;
punti += 50;
console.log(punti); // => 150

// Con le stringhe "+=" fa concatenazione (concatenation).
let messaggio = "Ciao";
messaggio += " mondo";
console.log(messaggio); // => "Ciao mondo"

// Accumulo dentro a un ciclo (somma minuti lavorati).
let totaleMinuti = 0;
for (const m of [480, 30, 450]) {
  totaleMinuti += m;
}
console.log(totaleMinuti); // => 960

// ------------------------------------------------------------
// 3) "-=" : subtraction assignment
// ------------------------------------------------------------

// x -= y equivale a x = x - y.
let scorta = 20;
scorta -= 3;
console.log(scorta); // => 17

// Decremento ripetuto: scalare DPI dal magazzino.
let guanti = 10;
guanti -= 4; // consegnati 4 paia
guanti -= 1; // consegnato 1 paio
console.log(guanti); // => 5

// ------------------------------------------------------------
// 4) "*=" : multiplication assignment
// ------------------------------------------------------------

// x *= y equivale a x = x * y.
let prezzo = 25;
prezzo *= 1.22; // applico IVA 22%
console.log(prezzo.toFixed(2)); // => "30.50"

// Conversione ore -> minuti.
let ore = 8;
ore *= 60;
console.log(ore); // => 480

// ------------------------------------------------------------
// 5) "**=" : exponentiation assignment (ES2016)
// ------------------------------------------------------------

// x **= y equivale a x = x ** y (elevamento a potenza).
let base = 2;
base **= 10;
console.log(base); // => 1024

// Calcolo di un'area (lato al quadrato).
let lato = 5;
lato **= 2;
console.log(lato); // => 25

// ------------------------------------------------------------
// 6) Altri compound assignment aritmetici (per completezza)
// ------------------------------------------------------------

// "/=" division assignment.
let n = 100;
n /= 4;
console.log(n); // => 25

// "%=" remainder assignment (resto della divisione).
let r = 17;
r %= 5;
console.log(r); // => 2

// ------------------------------------------------------------
// 7) "??=" : nullish coalescing assignment (ES2020)
// ------------------------------------------------------------

// x ??= y assegna y a x SOLO se x e' null o undefined.
// Non scatta su valori falsy validi come 0, "" o false.
let reparto = null;
reparto ??= "XX";
console.log(reparto); // => "XX"

let sigla = "UP";
sigla ??= "XX"; // gia' valorizzata: resta "UP"
console.log(sigla); // => "UP"

// Differenza chiave con "||=": qui 0 NON viene sovrascritto.
let quantita = 0;
quantita ??= 5; // 0 non e' nullish -> resta 0
console.log(quantita); // => 0

// ------------------------------------------------------------
// 8) "||=" e "&&=" : logical assignment (ES2020) - confronto
// ------------------------------------------------------------

// "||=" assegna se il valore corrente e' falsy (0, "", null, undefined, NaN, false).
let nome = "";
nome ||= "Sconosciuto";
console.log(nome); // => "Sconosciuto"

// "&&=" assegna SOLO se il valore corrente e' truthy.
let attivo = true;
attivo &&= false;
console.log(attivo); // => false

// Tabella mentale rapida:
//   ??=  scatta se   null/undefined
//   ||=  scatta se   falsy
//   &&=  scatta se   truthy

// ------------------------------------------------------------
// 9) Compound assignment sulle proprieta' degli oggetti
// ------------------------------------------------------------

// Gli operatori funzionano anche su proprieta' e elementi di array.
const carrello = { totale: 0, articoli: 0 };
carrello.totale += 30.5;
carrello.articoli += 1;
console.log(carrello); // => { totale: 30.5, articoli: 1 }

const voti = [4, 5, 3];
voti[0] *= 2;
console.log(voti); // => [8, 5, 3]

// ??= per garantire default su una config (merge difensivo).
const impostazioni = { regolaArrotondamento: undefined, pausa: 30 };
impostazioni.regolaArrotondamento ??= "DIFETTO";
impostazioni.pausa ??= 15; // gia' 30: resta 30
console.log(impostazioni); // => { regolaArrotondamento: "DIFETTO", pausa: 30 }

// ------------------------------------------------------------
// 10) Esempio pratico ERP: riepilogo timbrature dipendenti
// ------------------------------------------------------------

// Aggregazione di ore lavorate per reparto usando += sugli accumulatori,
// e ??= per inizializzare la chiave la prima volta che la incontriamo.
const timbrature = [
  { badge: "UP-001", reparto: "PR", minuti: 480 },
  { badge: "UP-002", reparto: "PR", minuti: 450 },
  { badge: "UP-003", reparto: "MG", minuti: 510 },
];

const orePerReparto = {};
for (const t of timbrature) {
  orePerReparto[t.reparto] ??= 0; // init solo se mancante
  orePerReparto[t.reparto] += t.minuti; // accumulo
}
console.log(orePerReparto); // => { PR: 930, MG: 510 }

// Conversione finale minuti -> ore con *= e arrotondamento.
const oreFormattate = {};
for (const [rep, min] of Object.entries(orePerReparto)) {
  let h = min;
  h /= 60;
  oreFormattate[rep] = Number(h.toFixed(2));
}
console.log(oreFormattate); // => { PR: 15.5, MG: 8.5 }

// ------------------------------------------------------------
// 11) Esempio pratico ERP: normalizzazione badge con default
// ------------------------------------------------------------

// Funzione che normalizza un codice badge e applica un reparto di default.
function preparaDipendente(input) {
  const dip = { ...input };
  dip.codiceBadge ??= "UP-000"; // se manca, badge placeholder
  dip.reparto ??= "XX"; // sigla reparto di default
  dip.codiceBadge = String(dip.codiceBadge).trim().toUpperCase();
  return dip;
}

console.log(preparaDipendente({ nome: "Mario", codiceBadge: " up-007 " }));
// => { nome: "Mario", codiceBadge: "UP-007", reparto: "XX" }

console.log(preparaDipendente({ nome: "Lucia", reparto: "PR" }));
// => { nome: "Lucia", codiceBadge: "UP-000", reparto: "PR" }

// ------------------------------------------------------------
// 12) Esempio pratico ERP: scorta DPI e riordino
// ------------------------------------------------------------

// Gestione magazzino vestiario: consegne (-=), rifornimento (+=)
// e calcolo del valore con *=.
const dpi = { taglia: "L", quantita: 12, scortaMinima: 5, prezzoUnit: 3 };

dpi.quantita -= 8; // consegnati 8 pezzi
console.log(dpi.quantita); // => 4

let valoreResiduo = dpi.quantita;
valoreResiduo *= dpi.prezzoUnit;
console.log(valoreResiduo); // => 12

// Sotto scorta minima: riordino fino a riportarla a 10.
if (dpi.quantita < dpi.scortaMinima) {
  dpi.quantita += 10 - dpi.quantita;
}
console.log(dpi.quantita); // => 10

// ------------------------------------------------------------
// 13) Gotcha ed errori comuni
// ------------------------------------------------------------

// "=" (assegnazione) NON e' "==" o "===" (confronto): errore tipico negli if.
let stato = "OK";
// if (stato = "KO") {...}  // assegna "KO" e risulta sempre truthy! BUG
console.log(stato === "OK"); // => true (uso corretto del confronto)

// "+=" con tipi misti: number + string => string (coercion).
let val = 5;
val += "0";
console.log(val, typeof val); // => "50" string

// ??= valuta il lato destro in modo lazy (short-circuit):
// se il sinistro non e' nullish, il destro non viene nemmeno eseguito.
let cache = "pronto";
cache ??= (() => {
  console.log("calcolo costoso"); // non viene mai stampato
  return "calcolato";
})();
console.log(cache); // => "pronto"

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   =     assignment semplice (anche a catena: a = b = c)
   +=    addition assignment (somma / concatenazione stringhe)
   -=    subtraction assignment
   *=    multiplication assignment
   /=    division assignment
   %=    remainder assignment
   **=   exponentiation assignment (potenza)
   ??=   nullish coalescing assignment (scatta su null/undefined)
   ||=   logical OR assignment (scatta su falsy)
   &&=   logical AND assignment (scatta su truthy)
   ---
   Note: funzionano su variabili, proprieta' oggetto e elementi array.
   ??=, ||=, &&= sono short-circuit (lazy) sul lato destro.
   Non confondere = (assegnazione) con === (confronto).
   ============================================================ */
