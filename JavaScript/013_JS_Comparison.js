/* ============================================================
   13 JS Comparison
   Gli operatori di confronto (comparison) e logici (logical) sono
   la base di ogni decisione nel codice: stabiliscono se due valori
   sono uguali, diversi, maggiori o minori. In JavaScript esistono
   due famiglie di uguaglianza: loose (==, !=) che applica la type
   coercion, e strict (===, !==) che confronta valore E type senza
   conversioni. Gli operatori logici (&&, ||, !, ??) combinano
   condizioni e sfruttano lo short-circuit. Capire bene queste regole
   evita la maggior parte dei bug "misteriosi".
   ============================================================ */

// ============================================================
// 1) STRICT EQUALITY: === e !==  (la scelta consigliata)
// ============================================================

// === confronta valore E type, senza conversioni (no coercion)
console.log(5 === 5);        // => true
console.log(5 === "5");      // => false (number vs string)
console.log(true === 1);     // => false (boolean vs number)
console.log(null === null);  // => true

// !== è la negazione di === (diverso per valore o type)
console.log(5 !== "5");      // => true
console.log("UP-001" !== "UP-001"); // => false

// ============================================================
// 2) LOOSE EQUALITY: == e !=  (con type coercion)
// ============================================================

// == converte i type prima di confrontare: spesso fonte di sorprese
console.log(5 == "5");       // => true  (la stringa diventa number)
console.log(true == 1);      // => true  (true -> 1)
console.log(false == 0);     // => true  (false -> 0)
console.log("" == 0);        // => true  ("" -> 0)
console.log(" \t\n" == 0);   // => true  (whitespace -> 0)

// != è la versione loose di "diverso"
console.log(5 != "5");       // => false (dopo coercion sono uguali)
console.log(0 != "");        // => false

// ============================================================
// 3) IL CASO null / undefined (la trappola classica)
// ============================================================

// null e undefined sono == tra loro ma NON con altri valori
console.log(null == undefined);  // => true
console.log(null === undefined); // => false
console.log(null == 0);          // => false (null non si converte a 0 con ==)
console.log(undefined == 0);     // => false

// Pattern utile: controllare "assente" (null OPPURE undefined)
const reparto = null;
console.log(reparto == null);    // => true  (cattura sia null che undefined)

// ============================================================
// 4) NaN: il valore che non è uguale a se stesso
// ============================================================

console.log(NaN === NaN);        // => false (!)
console.log(NaN == NaN);         // => false
// Per testare NaN si usa Number.isNaN
console.log(Number.isNaN(NaN));  // => true
console.log(Number.isNaN("x" / 2)); // => true ("x"/2 è NaN)

// ============================================================
// 5) Object.is: confronto "sameValue"
// ============================================================

// Quasi come === ma gestisce i casi limite di NaN e -0
console.log(Object.is(NaN, NaN));  // => true
console.log(Object.is(-0, 0));     // => false
console.log(-0 === 0);             // => true (=== non distingue gli zeri)

// ============================================================
// 6) CONFRONTO DI RIFERIMENTI (object, array)
// ============================================================

// Object e array si confrontano per reference, non per contenuto
const a = { id: 1 };
const b = { id: 1 };
const c = a;
console.log(a === b); // => false (due oggetti distinti in memoria)
console.log(a === c); // => true  (stesso reference)
console.log([1, 2] === [1, 2]); // => false

// ============================================================
// 7) OPERATORI RELAZIONALI: <  >  <=  >=
// ============================================================

console.log(10 > 5);    // => true
console.log(3 <= 3);    // => true
console.log(2 >= 7);    // => false

// Con le stringhe il confronto è lessicografico (ordine Unicode)
console.log("apple" < "banana"); // => true
console.log("UP-002" > "UP-001"); // => true
console.log("Z" < "a");          // => true (maiuscole hanno codice < minuscole)

// Attenzione: i relazionali fanno coercion a number con misti
console.log("10" > 9);  // => true  ("10" -> 10)
console.log("10" > "9"); // => false (confronto string: "1" < "9")

// ============================================================
// 8) OPERATORI LOGICI: &&  ||  !
// ============================================================

// && (AND): true solo se entrambe le condizioni sono vere
console.log(true && true);   // => true
console.log(true && false);  // => false

// || (OR): true se almeno una è vera
console.log(false || true);  // => true
console.log(false || false); // => false

// ! (NOT): inverte il valore booleano
console.log(!true);          // => false
console.log(!0);             // => true (0 è falsy)

// ============================================================
// 9) TRUTHY e FALSY
// ============================================================

// Valori falsy: false, 0, -0, 0n, "", null, undefined, NaN
// Tutto il resto è truthy (compresi "0", [], {}, "false")
console.log(Boolean(""));     // => false
console.log(Boolean("0"));    // => true (stringa non vuota)
console.log(Boolean([]));     // => true (array vuoto è truthy)
console.log(Boolean({}));     // => true
console.log(Boolean(0));      // => false

// ============================================================
// 10) SHORT-CIRCUIT EVALUATION
// ============================================================

// && ritorna il primo valore falsy, oppure l'ultimo se tutti truthy
console.log(0 && "mai");        // => 0
console.log("ok" && "ultimo");  // => "ultimo"

// || ritorna il primo valore truthy, oppure l'ultimo se tutti falsy
console.log("" || "fallback");  // => "fallback"
console.log("valore" || "x");   // => "valore"

// Uso pratico: default value
function saluta(nome) {
  nome = nome || "ospite";
  return `Ciao ${nome}`;
}
console.log(saluta());       // => "Ciao ospite"
console.log(saluta("Anna")); // => "Ciao Anna"

// ============================================================
// 11) NULLISH COALESCING (??) e confronto con ||
// ============================================================

// ?? usa il fallback SOLO se il valore è null o undefined
// (a differenza di || che scatta anche su 0, "" e false)
const quantita = 0;
console.log(quantita || 5); // => 5  (0 è falsy, sbagliato!)
console.log(quantita ?? 5); // => 0  (0 è valido, corretto)

const sigla = undefined;
console.log(sigla ?? "XX"); // => "XX"

// ============================================================
// 12) OPTIONAL CHAINING (?.) combinato con i confronti
// ============================================================

const riga = { dipendente: { nome: "Luca" } };
console.log(riga.dipendente?.nome === "Luca"); // => true
console.log(riga.turno?.codice === "P4");      // => false (turno è undefined)
// Nessun errore "Cannot read property of undefined" grazie a ?.

// ============================================================
// 13) ESEMPI PRATICI ISPIRATI A UN GESTIONALE ERP
// ============================================================

// --- Validazione formato badge tipo 'UP-001' ---
function badgeValido(codice) {
  return typeof codice === "string" && /^UP-\d{3}$/.test(codice);
}
console.log(badgeValido("UP-001")); // => true
console.log(badgeValido("UP-1"));   // => false
console.log(badgeValido(123));      // => false

// --- Filtrare dipendenti di un reparto usando === ---
const dipendenti = [
  { nome: "Anna", reparto: "PR", ore: 8 },
  { nome: "Marco", reparto: "MG", ore: 6 },
  { nome: "Sara", reparto: "PR", ore: 0 },
];
const produzione = dipendenti.filter((d) => d.reparto === "PR");
console.log(produzione.length); // => 2

// --- Distinguere "0 ore registrate" da "dato mancante" con ?? ---
function oreDaMostrare(record) {
  // se ore è null/undefined mostriamo "n/d", se è 0 mostriamo 0
  return record.ore ?? "n/d";
}
console.log(oreDaMostrare({ ore: 0 }));      // => 0
console.log(oreDaMostrare({ ore: null }));   // => "n/d"
console.log(oreDaMostrare({}));              // => "n/d"

// --- Verifica scorta minima di vestiario/DPI con relazionali ---
function sottoScorta(articolo) {
  return articolo.quantita < articolo.scortaMinima;
}
console.log(sottoScorta({ quantita: 3, scortaMinima: 5 })); // => true
console.log(sottoScorta({ quantita: 10, scortaMinima: 5 })); // => false

// --- Validare un orario timbratura con && e regex ---
function orarioAccettabile(orario) {
  // deve essere stringa, nel formato HH:MM, ed entro l'orario di lavoro
  return (
    typeof orario === "string" &&
    /^\d{2}:\d{2}$/.test(orario) &&
    orario >= "06:00" &&
    orario <= "22:00"
  );
}
console.log(orarioAccettabile("08:30")); // => true
console.log(orarioAccettabile("23:15")); // => false
console.log(orarioAccettabile("8:30"));  // => false (manca lo zero iniziale)

// --- Turno con o senza pausa: short-circuit per la descrizione ---
const turno = { codice: "P4", pausa: true };
const descrizione = (turno.pausa && "con pausa") || "senza pausa";
console.log(descrizione); // => "con pausa"

// --- some()/every() restituiscono boolean: usali nei confronti ---
const timbrature = [
  { tipo: "ingresso", ok: true },
  { tipo: "uscita", ok: true },
];
console.log(timbrature.every((t) => t.ok === true)); // => true
console.log(timbrature.some((t) => t.tipo === "errore")); // => false

// ============================================================
// 14) CONFRONTI IN CATENA E PRECEDENZA
// ============================================================

// NON scrivere 1 < x < 10: viene valutato da sinistra e dà risultati assurdi
console.log(1 < 5 < 10);  // => true (1<5 -> true -> 1, 1<10 -> true)
console.log(1 < 5 < 0);   // => true (!) (true -> 1, 1<0 falso? no: 1<0 false)
// Modo corretto: usare &&
const x = 5;
console.log(x > 1 && x < 10); // => true

// && ha precedenza maggiore di || (come * rispetto a +)
console.log(true || false && false); // => true  (&& valutato prima)

// ============================================================
// 15) CONVERSIONE ESPLICITA PER CONFRONTI SICURI
// ============================================================

// Meglio convertire i type a mano e poi usare ===
const input = "42";
console.log(Number(input) === 42); // => true (esplicito e leggibile)

// Confronto case-insensitive normalizzando le stringhe
const a1 = "  UP-001 ";
const a2 = "up-001";
console.log(a1.trim().toUpperCase() === a2.toUpperCase()); // => true

/* ============================================================
   RIEPILOGO COMANDI
   - ===            uguaglianza strict (valore + type)
   - !==            disuguaglianza strict
   - ==             uguaglianza loose (con type coercion)
   - !=             disuguaglianza loose
   - <  >  <=  >=   operatori relazionali (number e string)
   - &&             AND logico / short-circuit (ritorna primo falsy)
   - ||             OR logico / short-circuit (ritorna primo truthy)
   - !              NOT logico (inverte il boolean)
   - ??             nullish coalescing (fallback solo su null/undefined)
   - ?.             optional chaining (accesso sicuro)
   - Number.isNaN() test affidabile per NaN
   - Object.is()    confronto sameValue (gestisce NaN e -0)
   - Boolean(v)     conversione esplicita truthy/falsy
   - Number(v)      conversione esplicita a number per confronti
   - .every() / .some()  predicati che ritornano boolean
   ============================================================ */
