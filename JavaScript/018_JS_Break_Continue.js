/* ============================================================
   18 JS Break Continue
   In JavaScript le istruzioni "break" e "continue" controllano il
   flusso dei loop (for, while, for...of, ecc.). "break" interrompe
   completamente il loop, "continue" salta solo l'iterazione corrente
   passando alla successiva. Con i "labeled statements" (etichette)
   possiamo riferirci a un loop esterno specifico per uscire o
   continuare da loop annidati (nested loops). break funziona anche
   per uscire da uno switch.
   ============================================================ */

// ------------------------------------------------------------
// 1. BREAK base in un loop for
// ------------------------------------------------------------

// Interrompe il loop appena trova il numero 3
for (let i = 0; i < 10; i++) {
  if (i === 3) break;
  console.log("break base:", i);
}
// => 0
// => 1
// => 2

// ------------------------------------------------------------
// 2. CONTINUE base: salta l'iterazione corrente
// ------------------------------------------------------------

// Stampa solo i numeri dispari saltando i pari
for (let i = 0; i < 6; i++) {
  if (i % 2 === 0) continue; // salta i pari
  console.log("continue dispari:", i);
}
// => 1
// => 3
// => 5

// ------------------------------------------------------------
// 3. BREAK in un while
// ------------------------------------------------------------

// Cerca il primo valore > 100 nella sequenza di potenze di 2
let n = 1;
while (true) {
  n *= 2;
  if (n > 100) break; // condizione di uscita esplicita
}
console.log("primo >100:", n); // => 128

// ------------------------------------------------------------
// 4. CONTINUE in un while (attenzione all'incremento!)
// ------------------------------------------------------------

// In un while il continue NON salta l'incremento: va gestito a mano
let k = 0;
let somma = 0;
while (k < 5) {
  k++;
  if (k === 3) continue; // salta il 3
  somma += k;
}
console.log("somma senza 3:", somma); // => 12 (1+2+4+5)

// ------------------------------------------------------------
// 5. BREAK e CONTINUE in for...of
// ------------------------------------------------------------

const numeri = [10, 20, -1, 30, 40];

// continue: ignora i valori negativi
let totale = 0;
for (const v of numeri) {
  if (v < 0) continue;
  totale += v;
}
console.log("totale positivi:", totale); // => 100

// break: ferma alla prima sentinella negativa
let parziale = 0;
for (const v of numeri) {
  if (v < 0) break; // -1 ferma tutto
  parziale += v;
}
console.log("parziale fino al negativo:", parziale); // => 30

// ------------------------------------------------------------
// 6. BREAK dentro switch (uso classico)
// ------------------------------------------------------------

// Senza break i case "cadono" (fall-through) sul successivo
function descriviTurno(codice) {
  let descr;
  switch (codice) {
    case "P4":
      descr = "Turno con pausa pranzo";
      break;
    case "P2":
      descr = "Turno senza pausa";
      break;
    default:
      descr = "Turno sconosciuto";
  }
  return descr;
}
console.log(descriviTurno("P4")); // => Turno con pausa pranzo
console.log(descriviTurno("XX")); // => Turno sconosciuto

// ------------------------------------------------------------
// 7. Loop annidati SENZA etichetta: break esce solo dall'interno
// ------------------------------------------------------------

// Il break interrompe solo il loop piu interno
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    if (c === 1) break; // esce solo dal loop interno
    console.log(`cella r${r} c${c}`);
  }
}
// => cella r0 c0
// => cella r1 c0
// => cella r2 c0

// ------------------------------------------------------------
// 8. LABELED STATEMENT: break con etichetta su loop esterno
// ------------------------------------------------------------

// "esterno:" e un label; break esterno esce da ENTRAMBI i loop
esterno: for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    if (r === 1 && c === 1) break esterno; // esce dal loop esterno
    console.log(`labeled break r${r} c${c}`);
  }
}
// => labeled break r0 c0
// => labeled break r0 c1
// => labeled break r0 c2
// => labeled break r1 c0

// ------------------------------------------------------------
// 9. LABELED STATEMENT: continue con etichetta
// ------------------------------------------------------------

// continue esterno salta al prossimo giro del loop esterno
righe: for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    if (c === 1) continue righe; // salta resto riga, va alla prossima r
    console.log(`labeled continue r${r} c${c}`);
  }
}
// => labeled continue r0 c0
// => labeled continue r1 c0
// => labeled continue r2 c0

// ------------------------------------------------------------
// 10. Trovare una coppia in matrice (uscita da nested loop)
// ------------------------------------------------------------

const matrice = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

let trovato = null;
ricerca: for (let i = 0; i < matrice.length; i++) {
  for (let j = 0; j < matrice[i].length; j++) {
    if (matrice[i][j] === 5) {
      trovato = { i, j };
      break ricerca; // esce subito da tutta la ricerca
    }
  }
}
console.log("posizione del 5:", trovato); // => { i: 1, j: 1 }

// ------------------------------------------------------------
// 11. break/continue NON funzionano in forEach
// ------------------------------------------------------------

// forEach non supporta break/continue: usare return (= continue) o for...of
const lista = [1, 2, 3, 4];
lista.forEach((x) => {
  if (x === 2) return; // si comporta come "continue", NON come "break"
  console.log("forEach (return=continue):", x);
});
// => 1
// => 3
// => 4
// Per un vero break in stile funzionale: usare some()
const haNegativo = [1, -2, 3].some((x) => {
  if (x < 0) return true; // interrompe l'iterazione
  return false;
});
console.log("some come break:", haNegativo); // => true

// ------------------------------------------------------------
// 12. ESEMPIO ERP: somma minuti delle richieste fino a un limite
// ------------------------------------------------------------

// Pattern ERP: accumulare minuti di permesso, fermarsi al budget mensile
const richieste = [
  { tipo: "permesso", minuti: 120, approvata: true },
  { tipo: "permesso", minuti: 90, approvata: false },
  { tipo: "permesso", minuti: 200, approvata: true },
  { tipo: "permesso", minuti: 300, approvata: true },
];

const BUDGET_MINUTI = 480; // 8 ore
let minutiUsati = 0;
for (const r of richieste) {
  if (!r.approvata) continue; // ignora le non approvate
  if (minutiUsati + r.minuti > BUDGET_MINUTI) break; // budget superato
  minutiUsati += r.minuti;
}
console.log("minuti usati entro budget:", minutiUsati); // => 320

// ------------------------------------------------------------
// 13. ESEMPIO ERP: prima timbratura di uscita non valida
// ------------------------------------------------------------

// Pattern ERP: validare orari "HH:MM" naive-UTC, fermarsi al primo errore
const timbrature = ["08:00", "12:30", "13:0x", "17:00"];
const regexOrario = /^\d{2}:\d{2}$/;

let primoErrore = null;
for (let i = 0; i < timbrature.length; i++) {
  if (regexOrario.test(timbrature[i])) continue; // formato valido, prosegui
  primoErrore = { indice: i, valore: timbrature[i] };
  break; // ferma al primo orario malformato
}
console.log("primo orario errato:", primoErrore);
// => { indice: 2, valore: '13:0x' }

// ------------------------------------------------------------
// 14. ESEMPIO ERP: trovare un dipendente per codiceBadge in piu reparti
// ------------------------------------------------------------

// Pattern ERP: badge tipo 'UP-001'; uscita da nested loop con label
const reparti = [
  { sigla: "UP", dipendenti: [{ badge: "UP-001" }, { badge: "UP-002" }] },
  { sigla: "MG", dipendenti: [{ badge: "MG-010" }, { badge: "MG-011" }] },
];

const badgeCercato = "MG-011";
let risultato = null;
scan: for (const reparto of reparti) {
  for (const dip of reparto.dipendenti) {
    if (dip.badge === badgeCercato) {
      risultato = { reparto: reparto.sigla, badge: dip.badge };
      break scan; // esce da entrambi i loop
    }
  }
}
console.log("badge trovato in:", risultato);
// => { reparto: 'MG', badge: 'MG-011' }

// ------------------------------------------------------------
// 15. ESEMPIO ERP: saltare reparti senza scorta da riordinare
// ------------------------------------------------------------

// Pattern ERP: vestiario/DPI con scortaMinima; continue sui reparti ok
const magazzino = [
  { reparto: "UP", articolo: "Guanti", quantita: 50, scortaMinima: 20 },
  { reparto: "MG", articolo: "Scarpe", quantita: 5, scortaMinima: 10 },
  { reparto: "UP", articolo: "Occhiali", quantita: 8, scortaMinima: 15 },
];

const daRiordinare = [];
for (const art of magazzino) {
  if (art.quantita >= art.scortaMinima) continue; // scorta ok, salta
  daRiordinare.push(`${art.reparto}/${art.articolo}`);
}
console.log("da riordinare:", daRiordinare);
// => [ 'MG/Scarpe', 'UP/Occhiali' ]

// ------------------------------------------------------------
// 16. break con label su un blocco (non solo loop)
// ------------------------------------------------------------

// Un label puo etichettare anche un blocco: break label esce dal blocco
function elaboraBadge(badge) {
  let stato = "init";
  blocco: {
    if (!badge) {
      stato = "vuoto";
      break blocco; // salta il resto del blocco
    }
    if (!badge.startsWith("UP-")) {
      stato = "reparto-non-UP";
      break blocco;
    }
    stato = "valido";
  }
  return stato;
}
console.log(elaboraBadge("UP-005")); // => valido
console.log(elaboraBadge("MG-001")); // => reparto-non-UP
console.log(elaboraBadge(""));       // => vuoto

// ------------------------------------------------------------
// 17. continue in for...in (iterazione su chiavi oggetto)
// ------------------------------------------------------------

const config = { regola: "arrotonda", soglia: 5, _interno: "skip", attiva: true };
for (const chiave in config) {
  if (chiave.startsWith("_")) continue; // salta le chiavi private
  console.log("config:", chiave, "=", config[chiave]);
}
// => config: regola = arrotonda
// => config: soglia = 5
// => config: attiva = true

// ------------------------------------------------------------
// 18. Pattern "early exit" combinato: break appena risolto
// ------------------------------------------------------------

// Cerca il primo turno P4 e calcola le ore al netto della pausa
const turniGiorno = [
  { codice: "P2", ore: 6 },
  { codice: "P4", ore: 8, pausa: 1 },
  { codice: "P4", ore: 8, pausa: 1 },
];

let oreNettoPrimoP4 = 0;
for (const t of turniGiorno) {
  if (t.codice !== "P4") continue;     // non e P4, vai avanti
  oreNettoPrimoP4 = t.ore - (t.pausa ?? 0);
  break;                                // trovato il primo P4, basta
}
console.log("ore nette primo P4:", oreNettoPrimoP4); // => 7

/* ============================================================
   RIEPILOGO COMANDI
   - break                  -> interrompe il loop/switch corrente
   - continue               -> salta all'iterazione successiva
   - label: for (...)       -> etichetta un loop o un blocco
   - break label            -> esce dal loop/blocco etichettato
   - continue label         -> prosegue il loop esterno etichettato
   - break in switch        -> evita il fall-through tra i case
   - return (in forEach)    -> equivale a continue, NON a break
   - Array.some()           -> simula "break" in stile funzionale
   - for / while / for...of / for...in supportano break e continue
   - Note: break/continue NON funzionano dentro forEach/map
   ============================================================ */
