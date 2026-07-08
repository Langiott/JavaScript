/* ============================================================
   57 JS Array Spread
   Lo spread operator (...) "spande" gli elementi di un iterabile
   (array, string, Set, Map, NodeList) nei singoli valori che lo
   compongono. E' uno strumento ES2015+ fondamentale per clonare
   array in modo shallow, concatenarli, passare un array come lista
   di argomenti (es. Math.max(...arr)), convertire iterabili in array
   e, nella forma rest, raccogliere piu' valori in un solo array.
   In questo file vediamo dal caso base ai pattern avanzati, con
   esempi ispirati a un gestionale ERP (badge, turni, timbrature).
   ============================================================ */

// ------------------------------------------------------------
// 1) BASE: spread in un array literal
// ------------------------------------------------------------

// Spande gli elementi di un array dentro un nuovo array
const nums = [1, 2, 3];
const copia = [...nums];
console.log(copia); // => [ 1, 2, 3 ]

// Lo spread NON e' lo stesso oggetto: e' un nuovo array
console.log(copia === nums); // => false

// Inserire elementi prima/dopo lo spread
const conEstremi = [0, ...nums, 4];
console.log(conEstremi); // => [ 0, 1, 2, 3, 4 ]

// ------------------------------------------------------------
// 2) CLONE (shallow copy)
// ------------------------------------------------------------

// Clone superficiale di un array di primitivi: indipendente
const reparti = ['UP', 'MG', 'AM'];
const cloneReparti = [...reparti];
cloneReparti.push('QC');
console.log(reparti);      // => [ 'UP', 'MG', 'AM' ]
console.log(cloneReparti); // => [ 'UP', 'MG', 'AM', 'QC' ]

// ATTENZIONE: e' SHALLOW. Gli oggetti interni restano condivisi
const dipendenti = [{ nome: 'Anna', reparto: 'UP' }];
const cloneDip = [...dipendenti];
cloneDip[0].reparto = 'MG'; // modifica anche l'originale!
console.log(dipendenti[0].reparto); // => 'MG'

// Per un clone profondo di livello 1 sugli oggetti, spread anche loro
const dip2 = [{ nome: 'Anna', reparto: 'UP' }];
const cloneVero = dip2.map(d => ({ ...d }));
cloneVero[0].reparto = 'MG';
console.log(dip2[0].reparto); // => 'UP' (originale intatto)

// ------------------------------------------------------------
// 3) CONCAT: unire piu' array
// ------------------------------------------------------------

// Spread sostituisce concat() in modo piu' leggibile
const turnoMattina = ['Anna', 'Luca'];
const turnoPomeriggio = ['Maria', 'Sara'];
const tuttiITurni = [...turnoMattina, ...turnoPomeriggio];
console.log(tuttiITurni); // => [ 'Anna', 'Luca', 'Maria', 'Sara' ]

// Equivalente con concat()
console.log(turnoMattina.concat(turnoPomeriggio)); // => stesso risultato

// Unire tre o piu' array
const a = [1], b = [2, 3], c = [4];
console.log([...a, ...b, ...c]); // => [ 1, 2, 3, 4 ]

// Inserire un array nel mezzo di un altro
const base = ['inizio', 'fine'];
const conMezzo = [base[0], ...['x', 'y'], base[1]];
console.log(conMezzo); // => [ 'inizio', 'x', 'y', 'fine' ]

// ------------------------------------------------------------
// 4) SPREAD come ARGOMENTI di funzione (function call spread)
// ------------------------------------------------------------

// Math.max / Math.min accettano una lista, non un array: usa spread
const oreLavorate = [7.5, 8, 6.25, 8.5, 4];
console.log(Math.max(...oreLavorate)); // => 8.5
console.log(Math.min(...oreLavorate)); // => 4

// Prima di ES2015 si usava apply()
console.log(Math.max.apply(null, oreLavorate)); // => 8.5 (vecchio stile)

// Passare un array a una funzione che vuole argomenti separati
function sommaTre(x, y, z) {
  return x + y + z;
}
const valori = [10, 20, 30];
console.log(sommaTre(...valori)); // => 60

// Combinare spread con argomenti fissi
function logBadge(prefisso, ...codici) {
  return `${prefisso}: ${codici.join(', ')}`;
}
const listaBadge = ['UP-001', 'UP-002'];
console.log(logBadge('Reparto UP', ...listaBadge)); // => 'Reparto UP: UP-001, UP-002'

// ------------------------------------------------------------
// 5) CONVERSIONE di iterabili in array
// ------------------------------------------------------------

// String -> array di caratteri
const sigla = 'UP-001';
console.log([...sigla]); // => [ 'U', 'P', '-', '0', '0', '1' ]

// Set -> array (utile per de-duplicare)
const rePartiDup = ['UP', 'MG', 'UP', 'AM', 'MG'];
const unici = [...new Set(rePartiDup)];
console.log(unici); // => [ 'UP', 'MG', 'AM' ]

// Map -> array di coppie [chiave, valore]
const tagliaScorta = new Map([['M', 12], ['L', 8]]);
console.log([...tagliaScorta]); // => [ [ 'M', 12 ], [ 'L', 8 ] ]
console.log([...tagliaScorta.keys()]);   // => [ 'M', 'L' ]
console.log([...tagliaScorta.values()]); // => [ 12, 8 ]

// arguments (array-like) -> array vero
function raccogli() {
  return [...arguments];
}
console.log(raccogli('a', 'b', 'c')); // => [ 'a', 'b', 'c' ]

// Nota: Array.from() fa la stessa conversione e accetta array-like
// che non sono iterabili (con length). Spread richiede un iterable.
console.log(Array.from('UP')); // => [ 'U', 'P' ]

// ------------------------------------------------------------
// 6) REST: il "fratello" dello spread
// ------------------------------------------------------------
// Stessa sintassi ... ma RACCOGLIE invece di SPANDERE.
// Lo riconosci dalla POSIZIONE: a sinistra (parametri/destructuring) e' rest.

// Rest nei parametri: cattura un numero variabile di argomenti
function sommaTutto(...numeri) {
  return numeri.reduce((s, n) => s + n, 0);
}
console.log(sommaTutto(1, 2, 3, 4)); // => 10

// Rest nel destructuring di array: primo + il resto
const [primo, ...altri] = [10, 20, 30, 40];
console.log(primo); // => 10
console.log(altri); // => [ 20, 30, 40 ]

// Rest deve essere SEMPRE l'ultimo elemento
const [testa, secondo, ...coda] = ['a', 'b', 'c', 'd'];
console.log(coda); // => [ 'c', 'd' ]

// ------------------------------------------------------------
// 7) PATTERN UTILI con lo spread
// ------------------------------------------------------------

// Rimuovere un elemento per indice senza mutare l'originale
const lista = ['a', 'b', 'c', 'd'];
const i = 1;
const senzaB = [...lista.slice(0, i), ...lista.slice(i + 1)];
console.log(senzaB); // => [ 'a', 'c', 'd' ]

// Aggiungere in testa in modo immutabile (push immutabile in coda)
const codaImmutabile = [...lista, 'e'];
console.log(codaImmutabile); // => [ 'a', 'b', 'c', 'd', 'e' ]
const testaImmutabile = ['z', ...lista];
console.log(testaImmutabile); // => [ 'z', 'a', 'b', 'c', 'd' ]

// Riempire/duplicare con spread + Array
const treZeri = [...Array(3).fill(0)];
console.log(treZeri); // => [ 0, 0, 0 ]

// Trovare max/min su una proprieta' di oggetti
const timbrature = [
  { badge: 'UP-001', ore: 7.5 },
  { badge: 'UP-002', ore: 8.5 },
  { badge: 'UP-003', ore: 6 },
];
const maxOre = Math.max(...timbrature.map(t => t.ore));
console.log(maxOre); // => 8.5

// Appiattire un livello di array annidati (alternativa a flat)
const annidato = [[1, 2], [3, 4], [5]];
console.log([].concat(...annidato)); // => [ 1, 2, 3, 4, 5 ]

// ------------------------------------------------------------
// 8) ESEMPI ISPIRATI ALL'ERP (Advanced)
// ------------------------------------------------------------

// 8a) Unione di liste badge da piu' reparti, deduplicata e ordinata
const badgeUP = ['UP-001', 'UP-003'];
const badgeMG = ['MG-001', 'UP-001']; // 'UP-001' duplicato
const tuttiBadge = [...new Set([...badgeUP, ...badgeMG])].sort();
console.log(tuttiBadge); // => [ 'MG-001', 'UP-001', 'UP-003' ]

// 8b) Totale minuti lavorati: spread + reduce su DTO trasformati
const richieste = [
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 120 },
  { approvata: true, minuti: 300 },
];
const minutiApprovati = richieste
  .filter(r => r.approvata)
  .map(r => r.minuti);
const totaleMinuti = [...minutiApprovati].reduce((s, m) => s + m, 0);
console.log(totaleMinuti); // => 780

// 8c) Merge immutabile di impostazioni turno con default (oggetti via spread)
const DEFAULT_TURNO = { pausa: true, durataPausa: 30, arrotonda: 5 };
function creaTurno(impostazioni = {}) {
  return { ...DEFAULT_TURNO, ...impostazioni };
}
console.log(creaTurno({ pausa: false }));
// => { pausa: false, durataPausa: 30, arrotonda: 5 }

// 8d) Inserire una nuova timbratura in cima alla lista senza mutare lo stato
function aggiungiTimbratura(stato, nuova) {
  return [nuova, ...stato]; // pattern tipico di update immutabile (es. setState)
}
const stato0 = [{ badge: 'UP-002', ore: 8 }];
const stato1 = aggiungiTimbratura(stato0, { badge: 'UP-001', ore: 7.5 });
console.log(stato1.length); // => 2
console.log(stato0.length); // => 1 (stato originale invariato)

// 8e) Min/max orari da una lista di stringhe HH:MM convertite in minuti
const orari = ['08:00', '13:30', '17:15'];
const inMinuti = orari.map(o => {
  const [h, m] = o.split(':').map(Number); // destructuring + map
  return h * 60 + m;
});
console.log(Math.min(...inMinuti)); // => 480  (08:00)
console.log(Math.max(...inMinuti)); // => 1035 (17:15)

// 8f) Combinare DPI assegnati con scorte minime (array di oggetti)
const dpiBase = [{ taglia: 'M', quantita: 5 }];
const dpiExtra = [{ taglia: 'L', quantita: 3 }];
const magazzino = [...dpiBase, ...dpiExtra];
console.log(magazzino.length); // => 2

// ------------------------------------------------------------
// 9) GOTCHA ed errori comuni
// ------------------------------------------------------------

// Spread funziona solo su ITERABILI: un oggetto semplice NON e' iterabile in array
// const x = [...{ a: 1 }]; // => TypeError: object is not iterable
// (Lo spread di oggetti { ...obj } esiste ma e' un'altra cosa, vedi file Object Spread)

// null / undefined non sono iterabili: proteggiti con ?? []
const forse = null;
const sicuro = [...(forse ?? [])];
console.log(sicuro); // => []

// Spread su tantissimi elementi come argomenti puo' superare il limite
// dello stack di chiamata: per array enormi preferisci reduce o un ciclo.

// ------------------------------------------------------------
// 10) Esempio browser: gira nel browser, non in Node
// ------------------------------------------------------------
// NodeList e HTMLCollection sono iterabili/array-like: lo spread li
// converte in un array vero su cui usare map/filter.
function esempioDom() {
  // const items = [...document.querySelectorAll('.badge')];
  // const testi = items.map(el => el.textContent.trim());
  // return testi;
}
void esempioDom;

/* ============================================================
   RIEPILOGO COMANDI
   - [...arr]                 clone shallow di un array
   - [...a, ...b]             concat di array
   - [x, ...arr, y]           inserire elementi attorno allo spread
   - fn(...arr)               passare array come lista di argomenti
   - Math.max(...arr)         max/min su un array
   - Math.min(...arr)
   - [...stringa]             string -> array di caratteri
   - [...new Set(arr)]        de-duplicare un array
   - [...map] / .keys()/.values()  Map -> array di coppie/chiavi/valori
   - [...arguments]           array-like -> array
   - Array.from(iterabile)    alternativa allo spread (anche array-like)
   - function f(...rest){}    rest: raccoglie argomenti in un array
   - const [a, ...resto] = arr  rest nel destructuring
   - [...arr.slice(0,i), ...arr.slice(i+1)]  rimozione immutabile
   - [nuovo, ...stato]        update immutabile (prepend)
   - [].concat(...annidato)   appiattire un livello
   - { ...DEFAULT, ...over }  merge immutabile di oggetti
   ============================================================ */
