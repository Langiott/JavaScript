/* ============================================================
   17 JS Loops While
   Questo file spiega i loop con while e do...while in JavaScript.
   A differenza del for, questi loop sono ideali quando NON conosci
   in anticipo il numero di iterazioni, ma dipendi da una condizione
   di uscita (exit condition). Vedremo il pattern dell'accumulatore
   (accumulator), i controlli di sicurezza contro i loop infiniti,
   break/continue e molti esempi ispirati a un gestionale ERP.
   ============================================================ */

// ------------------------------------------------------------
// 1. WHILE BASE
// Il blocco while esegue finche la condition e true (truthy).
// La condition viene valutata PRIMA di ogni iterazione.
// ------------------------------------------------------------

// Contiamo da 0 a 4
let i = 0;
while (i < 5) {
  console.log("i =", i); // => i = 0 ... i = 4
  i++; // fondamentale: aggiorna la variabile, altrimenti loop infinito
}

// ------------------------------------------------------------
// 2. CONTO ALLA ROVESCIA (countdown)
// ------------------------------------------------------------
let n = 3;
while (n > 0) {
  console.log("countdown:", n); // => 3, 2, 1
  n--;
}
console.log("Via!"); // => Via!

// ------------------------------------------------------------
// 3. DO...WHILE
// Esegue il blocco ALMENO UNA VOLTA, poi controlla la condition.
// Utile quando devi eseguire prima e verificare dopo.
// ------------------------------------------------------------
let x = 10;
do {
  console.log("eseguito anche se x non rispetta la condizione:", x); // => 10
  x++;
} while (x < 5); // false subito, ma il blocco e gia stato eseguito una volta

// ------------------------------------------------------------
// 4. PATTERN ACCUMULATORE (accumulator)
// Una variabile fuori dal loop accumula un risultato.
// ------------------------------------------------------------

// Somma dei numeri da 1 a 100
let somma = 0;
let k = 1;
while (k <= 100) {
  somma += k;
  k++;
}
console.log("somma 1..100 =", somma); // => 5050

// Fattoriale di 5 (accumulatore moltiplicativo)
let fattoriale = 1;
let f = 5;
while (f > 1) {
  fattoriale *= f;
  f--;
}
console.log("5! =", fattoriale); // => 120

// ------------------------------------------------------------
// 5. ACCUMULATORE SU STRINGA
// ------------------------------------------------------------
let parola = "ERP";
let rovesciata = "";
let p = parola.length - 1;
while (p >= 0) {
  rovesciata += parola[p];
  p--;
}
console.log("rovesciata:", rovesciata); // => PRE

// ------------------------------------------------------------
// 6. BREAK: esce dal loop immediatamente
// ------------------------------------------------------------
let cerca = 0;
while (true) {
  // loop "infinito" controllato con break
  if (cerca === 4) break; // exit condition interna
  cerca++;
}
console.log("uscito a cerca =", cerca); // => 4

// ------------------------------------------------------------
// 7. CONTINUE: salta all'iterazione successiva
// Stampa solo i numeri dispari sotto 10
// ------------------------------------------------------------
let c = 0;
while (c < 10) {
  c++;
  if (c % 2 === 0) continue; // salta i pari
  console.log("dispari:", c); // => 1, 3, 5, 7, 9
}

// ------------------------------------------------------------
// 8. GUARDIA ANTI-LOOP-INFINITO (safety guard)
// In produzione conviene un contatore massimo per evitare blocchi.
// ------------------------------------------------------------
let tentativi = 0;
let condizioneEsterna = true;
const MAX_ITER = 1000;
let guard = 0;
while (condizioneEsterna && guard < MAX_ITER) {
  tentativi++;
  guard++;
  if (tentativi >= 3) condizioneEsterna = false; // simuliamo il successo
}
console.log("tentativi eseguiti:", tentativi); // => 3

// ------------------------------------------------------------
// 9. WHILE SU ARRAY (consumare una coda - queue)
// shift() rimuove e ritorna il primo elemento; il loop finisce
// quando l'array e vuoto (length === 0, falsy via condizione).
// ------------------------------------------------------------
const coda = ["badge1", "badge2", "badge3"];
while (coda.length > 0) {
  const corrente = coda.shift();
  console.log("processo:", corrente); // => badge1, badge2, badge3
}
console.log("coda vuota:", coda.length === 0); // => true

// ============================================================
// ESEMPI ISPIRATI AL GESTIONALE ERP
// ============================================================

// ------------------------------------------------------------
// 10. ERP: somma minuti lavorati con accumulatore via while
// (pattern reale: filter().reduce() per sommare minuti, qui in while)
// ------------------------------------------------------------
const timbrature = [
  { badge: "UP-001", minuti: 480 },
  { badge: "UP-001", minuti: 30 },
  { badge: "UP-001", minuti: 450 },
];
let totaleMinuti = 0;
let t = 0;
while (t < timbrature.length) {
  totaleMinuti += timbrature[t].minuti;
  t++;
}
console.log("totale minuti:", totaleMinuti); // => 960
console.log("ore lavorate:", (totaleMinuti / 60).toFixed(2)); // => 16.00

// ------------------------------------------------------------
// 11. ERP: generazione progressiva codici badge 'UP-001'..'UP-005'
// padStart per formattare a 3 cifre (pattern reale ERP)
// ------------------------------------------------------------
const badges = [];
let idx = 1;
while (idx <= 5) {
  const codice = `UP-${String(idx).padStart(3, "0")}`;
  badges.push(codice);
  idx++;
}
console.log("badge generati:", badges);
// => [ 'UP-001', 'UP-002', 'UP-003', 'UP-004', 'UP-005' ]

// ------------------------------------------------------------
// 12. ERP: ricerca dipendente in lista (find manuale con while)
// while permette di fermarsi appena trovato (early exit con break)
// ------------------------------------------------------------
const dipendenti = [
  { id: 1, nome: "Mario", codiceBadge: "UP-001" },
  { id: 2, nome: "Lucia", codiceBadge: "UP-002" },
  { id: 3, nome: "Anna", codiceBadge: "UP-003" },
];
let trovato = null;
let d = 0;
while (d < dipendenti.length) {
  if (dipendenti[d].codiceBadge === "UP-002") {
    trovato = dipendenti[d];
    break; // exit condition: trovato il dipendente
  }
  d++;
}
console.log("trovato:", trovato?.nome ?? "nessuno"); // => Lucia

// ------------------------------------------------------------
// 13. ERP: validazione formato orario HH:MM con retry simulato
// regex /^\d{2}:\d{2}$/ (pattern reale ERP) dentro un do...while
// ------------------------------------------------------------
const codaOrari = ["8:0", "08:00"]; // primo non valido, secondo valido
let orarioValido = null;
let j = 0;
do {
  const candidato = codaOrari[j];
  if (/^\d{2}:\d{2}$/.test(candidato)) {
    orarioValido = candidato;
  }
  j++;
} while (orarioValido === null && j < codaOrari.length);
console.log("orario valido:", orarioValido); // => 08:00

// ------------------------------------------------------------
// 14. ERP: contare turni P4 (con pausa) in una settimana
// accumulatore condizionato
// ------------------------------------------------------------
const settimana = ["P4", "P2", "P4", "P4", "P2", "P4", "riposo"];
let countP4 = 0;
let s = 0;
while (s < settimana.length) {
  if (settimana[s] === "P4") countP4++;
  s++;
}
console.log("turni P4:", countP4); // => 4

// ------------------------------------------------------------
// 15. ERP: scorta vestiario/DPI - decremento fino a scorta minima
// simula consumo magazzino finche sopra la scortaMinima
// ------------------------------------------------------------
let quantita = 10;
const scortaMinima = 3;
let consumi = 0;
while (quantita > scortaMinima) {
  quantita--; // consumiamo un pezzo
  consumi++;
}
console.log("consumi possibili:", consumi); // => 7
console.log("quantita residua:", quantita); // => 3

// ------------------------------------------------------------
// 16. WHILE con accumulo in oggetto (raggruppamento per reparto)
// ------------------------------------------------------------
const assegnazioni = [
  { nome: "Mario", reparto: "PR" },
  { nome: "Lucia", reparto: "MG" },
  { nome: "Anna", reparto: "PR" },
];
const perReparto = {};
let a = 0;
while (a < assegnazioni.length) {
  const r = assegnazioni[a].reparto;
  perReparto[r] = (perReparto[r] ?? 0) + 1; // nullish per init
  a++;
}
console.log("conteggio reparti:", perReparto); // => { PR: 2, MG: 1 }

// ------------------------------------------------------------
// 17. WHILE per paginazione (chunking) di una lista lunga
// estrae pagine da 'take' elementi (richiama PRISMA take/skip)
// ------------------------------------------------------------
const tuttiId = [1, 2, 3, 4, 5, 6, 7];
const take = 3;
let skip = 0;
const pagine = [];
while (skip < tuttiId.length) {
  pagine.push(tuttiId.slice(skip, skip + take));
  skip += take;
}
console.log("pagine:", pagine); // => [ [1,2,3], [4,5,6], [7] ]

// ------------------------------------------------------------
// 18. DO...WHILE per menu / input simulato
// utile quando vuoi mostrare almeno una opzione prima di ricontrollare
// ------------------------------------------------------------
const sceltePossibili = ["aggiorna", "esci"];
let sceltaIdx = 0;
let uscita = false;
do {
  const scelta = sceltePossibili[sceltaIdx];
  console.log("menu scelta:", scelta);
  if (scelta === "esci") uscita = true;
  sceltaIdx++;
} while (!uscita && sceltaIdx < sceltePossibili.length);
// => menu scelta: aggiorna / menu scelta: esci

// ------------------------------------------------------------
// 19. ALGORITMO numerico: massimo comun divisore (Euclide) con while
// classico esempio dove il numero di iterazioni e ignoto a priori
// ------------------------------------------------------------
function mcd(x, y) {
  while (y !== 0) {
    [x, y] = [y, x % y]; // destructuring swap (ES6+)
  }
  return x;
}
console.log("mcd(48, 18) =", mcd(48, 18)); // => 6

// ------------------------------------------------------------
// 20. WHILE per somma cifre di un numero (accumulatore + modulo)
// ------------------------------------------------------------
function sommaCifre(num) {
  let tot = 0;
  let v = Math.abs(num);
  while (v > 0) {
    tot += v % 10; // ultima cifra
    v = Math.floor(v / 10); // rimuove l'ultima cifra
  }
  return tot;
}
console.log("sommaCifre(12345) =", sommaCifre(12345)); // => 15

// ------------------------------------------------------------
// 21. ATTENZIONE: errori comuni
// - dimenticare di aggiornare la variabile di controllo -> loop infinito
// - usare = invece di == / === nella condition
// - off-by-one (< vs <=) sui limiti
// Esempio sicuro: contatore con condizione chiara
// ------------------------------------------------------------
let safe = 0;
while (safe < 3) { // chiaro e prevedibile
  safe += 1;
}
console.log("safe finale:", safe); // => 3

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   while (condition) { ... }      -> controlla PRIMA di iterare
   do { ... } while (condition)   -> esegue ALMENO una volta
   break                          -> esce dal loop
   continue                       -> salta all'iterazione successiva
   while (true) { ... break }     -> loop con exit condition interna
   accumulatore: let acc = 0; while(...) acc += valore
   guardia: while (cond && guard < MAX) { guard++ }
   array.shift()                  -> consumare una coda (queue)
   array.length > 0               -> condizione di svuotamento
   array.slice(skip, skip+take)   -> paginazione (chunk)
   String(n).padStart(3, '0')     -> formattare codici (es. UP-001)
   /^\d{2}:\d{2}$/.test(s)        -> validare orario HH:MM
   v % 10 / Math.floor(v / 10)    -> estrarre cifre
   [x, y] = [y, x % y]            -> swap con destructuring (Euclide)
   x ?? 0                         -> nullish coalescing per init accumulatori
   ============================================================ */
