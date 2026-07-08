/* ============================================================
   16 JS Loops For
   I loop (cicli) servono a ripetere un blocco di codice piu volte.
   In JavaScript il ciclo piu classico e il "for" con contatore, ma
   esistono varianti moderne: "for...of" per scorrere valori iterabili
   (array, string, Map, Set) e "for...in" per scorrere le chiavi (keys)
   di un oggetto. Vedremo anche i nested loop (cicli annidati), il
   controllo del flusso con break/continue e tanti pattern reali di
   iterazione su array e oggetti, ispirati a un gestionale ERP.
   ============================================================ */

// ------------------------------------------------------------
// 1) FOR CLASSICO: la sintassi base
// ------------------------------------------------------------
// Struttura: for (inizializzazione; condizione; aggiornamento) { ... }
for (let i = 0; i < 5; i++) {
  console.log("iterazione", i); // => iterazione 0 ... iterazione 4
}

// Conteggio all'indietro (decremento)
for (let i = 3; i > 0; i--) {
  console.log("countdown", i); // => 3, 2, 1
}

// Step personalizzato: incremento di 2
for (let i = 0; i <= 10; i += 2) {
  console.log("pari", i); // => 0 2 4 6 8 10
}

// ------------------------------------------------------------
// 2) ITERARE UN ARRAY CON IL FOR CLASSICO (indice)
// ------------------------------------------------------------
const reparti = ["Produzione", "Magazzino", "Uffici"];
for (let i = 0; i < reparti.length; i++) {
  // Cache di length non necessaria qui, ma utile su array enormi
  console.log(i, reparti[i]); // => 0 Produzione ...
}

// ------------------------------------------------------------
// 3) FOR...OF: scorrere i VALORI di un iterabile (consigliato)
// ------------------------------------------------------------
const badge = ["UP-001", "UP-002", "UP-007"];
for (const codice of badge) {
  console.log("badge:", codice); // => badge: UP-001 ...
}

// for...of su una string: itera carattere per carattere
for (const ch of "P4") {
  console.log(ch); // => P, 4
}

// for...of con entries() per avere indice + valore insieme
for (const [indice, valore] of badge.entries()) {
  console.log(indice, valore); // => 0 UP-001 ...
}

// for...of su un Set (valori unici)
const tagliePresenti = new Set(["M", "L", "M", "XL"]);
for (const taglia of tagliePresenti) {
  console.log("taglia:", taglia); // => M, L, XL
}

// for...of su una Map (coppie chiave/valore)
const scorte = new Map([
  ["guanti", 12],
  ["occhiali", 4],
]);
for (const [articolo, quantita] of scorte) {
  console.log(`${articolo} = ${quantita}`); // => guanti = 12 ...
}

// ------------------------------------------------------------
// 4) FOR...IN: scorrere le CHIAVI (keys) di un oggetto
// ------------------------------------------------------------
const dipendente = { nome: "Mario", cognome: "Rossi", badge: "UP-001" };
for (const chiave in dipendente) {
  console.log(chiave, "=>", dipendente[chiave]); // => nome => Mario ...
}

// ATTENZIONE: for...in itera anche proprieta ereditate (prototype).
// Usare hasOwnProperty per restare sicuri su proprieta proprie.
for (const chiave in dipendente) {
  if (Object.hasOwn(dipendente, chiave)) {
    console.log("proprio:", chiave);
  }
}

// for...in su un array restituisce gli INDICI come stringhe: sconsigliato.
// Per gli array preferire sempre for...of o i metodi (forEach/map).

// ------------------------------------------------------------
// 5) BREAK e CONTINUE: controllare il flusso del loop
// ------------------------------------------------------------
// break: esce subito dal loop
for (const codice of badge) {
  if (codice === "UP-002") {
    console.log("trovato, esco");
    break;
  }
  console.log("scarto:", codice); // => scarto: UP-001
}

// continue: salta all'iterazione successiva
for (let i = 0; i < 5; i++) {
  if (i % 2 === 0) continue; // salta i pari
  console.log("dispari:", i); // => 1, 3
}

// ------------------------------------------------------------
// 6) NESTED LOOP (cicli annidati)
// ------------------------------------------------------------
// Tabellina / matrice: per ogni reparto stampo i turni disponibili
const turni = ["P2", "P4"];
for (const reparto of reparti) {
  for (const turno of turni) {
    console.log(`${reparto} - ${turno}`); // => Produzione - P2 ...
  }
}

// Labeled break: uscire dal loop esterno da dentro quello interno
ricerca: for (let r = 0; r < reparti.length; r++) {
  for (let t = 0; t < turni.length; t++) {
    if (reparti[r] === "Magazzino" && turni[t] === "P4") {
      console.log("combinazione trovata, esco da entrambi");
      break ricerca;
    }
  }
}

// Matrice (array di array) scorsa con doppio for...of
const matrice = [
  [1, 2, 3],
  [4, 5, 6],
];
for (const riga of matrice) {
  for (const cella of riga) {
    process.stdout.write(cella + " "); // => 1 2 3 4 5 6
  }
}
console.log();

// ------------------------------------------------------------
// 7) ITERARE OGGETTI CON Object.keys / values / entries + for...of
// ------------------------------------------------------------
const timbratura = {
  ingresso: "08:00",
  uscitaPranzo: "12:30",
  rientroPranzo: "13:00",
  uscita: "17:00",
};

// chiavi
for (const k of Object.keys(timbratura)) console.log("key:", k);
// valori
for (const v of Object.values(timbratura)) console.log("val:", v);
// coppie con destructuring
for (const [evento, ora] of Object.entries(timbratura)) {
  console.log(`${evento} alle ${ora}`); // => ingresso alle 08:00 ...
}

// ------------------------------------------------------------
// 8) ESEMPI ERP: accumulare e trasformare dentro un for
// ------------------------------------------------------------
// Somma minuti lavorati di una lista di richieste approvate
const richieste = [
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 120 },
  { approvata: true, minuti: 240 },
];
let totaleMinuti = 0;
for (const r of richieste) {
  if (!r.approvata) continue; // salta le non approvate
  totaleMinuti += r.minuti;
}
console.log("totale minuti:", totaleMinuti); // => 720

// Helper per formattare HH:MM da minuti, usando padStart
function minutiToHHMM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
console.log("totale ore:", minutiToHHMM(totaleMinuti)); // => 12:00

// Costruire DTO (Data Transfer Object) iterando articoli
const articoli = [
  { articolo_poly: "A1", descrizione: "Guanti", taglia: "M" },
  { articolo_poly: "A2", descrizione: "Occhiali", taglia: null },
];
const dto = [];
for (const a of articoli) {
  dto.push({
    cdAr: a.articolo_poly,
    descrizione: a.descrizione,
    taglia: a.taglia ?? "N/D", // nullish coalescing
  });
}
console.log(dto); // => [{cdAr:'A1',...}, {cdAr:'A2', taglia:'N/D'}]

// ------------------------------------------------------------
// 9) ESEMPIO ERP: raggruppare dipendenti per reparto (mappa)
// ------------------------------------------------------------
const personale = [
  { nome: "Mario", reparto: "PR", badge: "UP-001" },
  { nome: "Luca", reparto: "MG", badge: "UP-002" },
  { nome: "Anna", reparto: "PR", badge: "UP-003" },
];
const perReparto = {};
for (const p of personale) {
  // optional chaining + nullish per sicurezza sulla sigla
  const sigla = p?.reparto ?? "XX";
  if (!perReparto[sigla]) perReparto[sigla] = [];
  perReparto[sigla].push(p.nome);
}
console.log(perReparto); // => { PR: ['Mario','Anna'], MG: ['Luca'] }

// Stampa del raggruppamento con nested loop su oggetto + array
for (const [sigla, nomi] of Object.entries(perReparto)) {
  for (const nome of nomi) {
    console.log(`${sigla}: ${nome}`); // => PR: Mario ...
  }
}

// ------------------------------------------------------------
// 10) ESEMPIO ERP: validazione badge con for + regex
// ------------------------------------------------------------
const candidati = ["UP-001", "up-002", "XX10", "UP-099"];
const validi = [];
for (const c of candidati) {
  const normalizzato = String(c || "").trim().toUpperCase();
  if (/^UP-\d{3}$/.test(normalizzato)) {
    validi.push(normalizzato);
  }
}
console.log("badge validi:", validi); // => ['UP-001','UP-002','UP-099']

// ------------------------------------------------------------
// 11) for...await...of: iterare su valori asincroni (ES2018+)
// ------------------------------------------------------------
async function caricaTurni() {
  // Simuliamo 3 fetch sequenziali con Promise risolte
  const promesse = [Promise.resolve("P2"), Promise.resolve("P4")];
  for await (const turno of promesse) {
    console.log("turno caricato:", turno); // => P2, poi P4
  }
}
caricaTurni();

// ------------------------------------------------------------
// 12) PATTERN UTILI E TRAPPOLE
// ------------------------------------------------------------
// Trappola classica con var + setTimeout: tutti stampano lo stesso valore.
// Con "let" ogni iterazione ha il proprio scope (binding), problema risolto.
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log("let i =", i), 0); // => 0, 1, 2
}

// Cercare l'indice di un elemento senza indexOf, con break
const lista = ["a", "b", "c"];
let trovato = -1;
for (let i = 0; i < lista.length; i++) {
  if (lista[i] === "b") {
    trovato = i;
    break;
  }
}
console.log("indice di b:", trovato); // => 1

// Iterare in ordine inverso su un array
for (let i = lista.length - 1; i >= 0; i--) {
  console.log("reverse:", lista[i]); // => c, b, a
}

// for vuoto / infinito controllato (raro): meglio while, ma esiste
let contatore = 0;
for (;;) {
  if (contatore >= 3) break;
  contatore++;
}
console.log("contatore finale:", contatore); // => 3

// ------------------------------------------------------------
// RIEPILOGO COMANDI
// ------------------------------------------------------------
/*
  for (init; cond; update) {}   -> ciclo classico con contatore
  for (const x of iterabile)    -> scorre i VALORI (array, string, Set, Map)
  for (const k in oggetto)      -> scorre le CHIAVI di un oggetto
  for await (const x of ...)    -> itera valori asincroni (async iterables)
  break                         -> esce dal loop
  continue                      -> salta all'iterazione successiva
  label: for(...) break label   -> esce da loop annidati (labeled break)
  arr.entries()                 -> [indice, valore] in for...of
  Object.keys(obj)              -> array delle chiavi
  Object.values(obj)            -> array dei valori
  Object.entries(obj)           -> array di coppie [chiave, valore]
  Object.hasOwn(obj, k)         -> true se proprieta propria (no prototype)
  String(v).padStart(n, '0')    -> formattazione zero-padding (es. HH:MM)
  ?? (nullish) / ?. (optional)  -> default sicuri durante l'iterazione
*/
