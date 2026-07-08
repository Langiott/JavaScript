/* ============================================================
   53 JS Array Find
   I metodi di ricerca degli array permettono di trovare un
   elemento (o il suo indice) in base a una condizione espressa
   tramite una callback. find() ritorna il primo elemento che
   soddisfa il test; findIndex() ne ritorna l'indice; findLast()
   e findLastIndex() (ES2023) cercano partendo dalla fine.
   A differenza di indexOf()/lastIndexOf(), che cercano per
   valore con uguaglianza stretta (===), i metodi find usano una
   funzione di test ("predicate"), quindi sono adatti a oggetti e
   condizioni complesse.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) find() - BASE
   Ritorna il PRIMO elemento che soddisfa la callback.
   Se nessun elemento soddisfa il test, ritorna undefined.
   ------------------------------------------------------------ */

// Trova il primo numero maggiore di 10
const numeri = [3, 7, 12, 5, 20];
const primoGrande = numeri.find((n) => n > 10);
console.log(primoGrande); // => 12

// Se nessun elemento soddisfa: undefined
const nessuno = numeri.find((n) => n > 100);
console.log(nessuno); // => undefined

// Primo numero pari
const primoPari = numeri.find((n) => n % 2 === 0);
console.log(primoPari); // => 12

/* ------------------------------------------------------------
   2) La callback di find() riceve 3 argomenti
   (element, index, array) come in map/filter/forEach.
   ------------------------------------------------------------ */

const lettere = ['a', 'b', 'c', 'd'];
const trovata = lettere.find((valore, indice, arr) => {
  // valore = elemento corrente, indice = posizione, arr = array intero
  return indice === 2;
});
console.log(trovata); // => 'c'

/* ------------------------------------------------------------
   3) find() su array di oggetti (caso più comune)
   ------------------------------------------------------------ */

const dipendenti = [
  { id: 1, nome: 'Anna', codiceBadge: 'UP-001', reparto: 'PR' },
  { id: 2, nome: 'Luca', codiceBadge: 'UP-002', reparto: 'MG' },
  { id: 3, nome: 'Sara', codiceBadge: 'UP-003', reparto: 'PR' },
];

// Cerca per id
const dip = dipendenti.find((d) => d.id === 2);
console.log(dip.nome); // => 'Luca'

// Cerca per badge (stringa)
const perBadge = dipendenti.find((d) => d.codiceBadge === 'UP-003');
console.log(perBadge.nome); // => 'Sara'

/* ------------------------------------------------------------
   4) findIndex() - ritorna l'INDICE del primo match
   Ritorna -1 se nessun elemento soddisfa il test.
   ------------------------------------------------------------ */

const idx = dipendenti.findIndex((d) => d.codiceBadge === 'UP-002');
console.log(idx); // => 1

const idxAssente = dipendenti.findIndex((d) => d.id === 999);
console.log(idxAssente); // => -1

// Uso tipico: aggiornare un elemento in posizione nota
const i = dipendenti.findIndex((d) => d.id === 3);
if (i !== -1) {
  dipendenti[i] = { ...dipendenti[i], reparto: 'MG' };
}
console.log(dipendenti[i].reparto); // => 'MG'

/* ------------------------------------------------------------
   5) indexOf() vs find()/findIndex()
   - indexOf cerca per VALORE con === (no callback)
   - find/findIndex usano una CALLBACK (condizione)
   ------------------------------------------------------------ */

const valori = [10, 20, 30, 40];

// indexOf: ottimo per primitivi e uguaglianza esatta
console.log(valori.indexOf(30)); // => 2
console.log(valori.indexOf(99)); // => -1

// indexOf NON funziona su oggetti per "contenuto": confronta riferimenti
const lista = [{ id: 1 }, { id: 2 }];
console.log(lista.indexOf({ id: 1 })); // => -1 (oggetto diverso!)

// findIndex risolve cercando per proprietà
console.log(lista.findIndex((o) => o.id === 1)); // => 0

// includes(): variante booleana di indexOf per primitivi
console.log(valori.includes(20)); // => true
console.log(valori.includes(99)); // => false

/* ------------------------------------------------------------
   6) findLast() e findLastIndex() (ES2023)
   Cercano partendo dalla FINE dell'array verso l'inizio.
   ------------------------------------------------------------ */

const serie = [1, 8, 3, 8, 5];

// Primo dalla fine maggiore di 4
console.log(serie.findLast((n) => n > 4)); // => 5
console.log(serie.findLastIndex((n) => n > 4)); // => 4

// Ultimo 8 nell'array: utile quando find() prenderebbe il primo
console.log(serie.find((n) => n === 8)); // => 8 (indice 1)
console.log(serie.findIndex((n) => n === 8)); // => 1
console.log(serie.findLastIndex((n) => n === 8)); // => 3

/* ------------------------------------------------------------
   7) Differenza con filter()
   filter() ritorna TUTTI i match (un array); find() solo il primo.
   ------------------------------------------------------------ */

const tuttiPR = dipendenti.filter((d) => d.reparto === 'PR');
console.log(tuttiPR.length); // => 1 (dopo l'update sopra)

const primoPR = dipendenti.find((d) => d.reparto === 'PR');
console.log(primoPR ? primoPR.nome : 'nessuno'); // => 'Anna'

/* ------------------------------------------------------------
   8) Default value con find() + nullish coalescing
   Gestire il caso "non trovato" senza errori.
   ------------------------------------------------------------ */

const cercato = dipendenti.find((d) => d.id === 42);
// optional chaining + nullish: evita "Cannot read properties of undefined"
const nomeSicuro = cercato?.nome ?? 'Sconosciuto';
console.log(nomeSicuro); // => 'Sconosciuto'

/* ------------------------------------------------------------
   9) thisArg (secondo parametro di find/findIndex)
   Permette di fissare il valore di `this` nella callback.
   ------------------------------------------------------------ */

const filtro = { soglia: 15 };
const sopraSoglia = valori.find(function (n) {
  return n > this.soglia;
}, filtro);
console.log(sopraSoglia); // => 20

/* ------------------------------------------------------------
   10) find() su stringhe trasformate in array
   ------------------------------------------------------------ */

const badge = 'UP-007';
const primaCifra = [...badge].find((c) => /\d/.test(c));
console.log(primaCifra); // => '0'

/* ============================================================
   ESEMPI AVANZATI - SPUNTI DAL GESTIONALE ERP
   ============================================================ */

/* ------------------------------------------------------------
   A1) Trovare la timbratura di oggi (orari naive-UTC)
   Le timbrature sono salvate come stringhe ISO; cerchiamo per data.
   ------------------------------------------------------------ */

const timbrature = [
  { dip: 'UP-001', giorno: '2026-06-29', ingresso: '08:02', uscita: '17:00' },
  { dip: 'UP-001', giorno: '2026-06-30', ingresso: '07:58', uscita: null },
  { dip: 'UP-002', giorno: '2026-06-30', ingresso: '09:05', uscita: null },
];

const oggi = '2026-06-30';
const miaTimbraturaOggi = timbrature.find(
  (t) => t.dip === 'UP-001' && t.giorno === oggi
);
console.log(miaTimbraturaOggi?.ingresso); // => '07:58'

// Chi non ha ancora timbrato l'uscita oggi (primo trovato)
const ancoraDentro = timbrature.find((t) => t.giorno === oggi && t.uscita === null);
console.log(ancoraDentro?.dip); // => 'UP-001'

/* ------------------------------------------------------------
   A2) findIndex per aggiornare una timbratura esistente o crearla
   Pattern "upsert" lato client.
   ------------------------------------------------------------ */

function registraUscita(elenco, dip, giorno, ora) {
  const pos = elenco.findIndex((t) => t.dip === dip && t.giorno === giorno);
  if (pos !== -1) {
    elenco[pos] = { ...elenco[pos], uscita: ora };
  } else {
    elenco.push({ dip, giorno, ingresso: null, uscita: ora });
  }
  return elenco;
}

registraUscita(timbrature, 'UP-001', '2026-06-30', '17:10');
console.log(timbrature.find((t) => t.dip === 'UP-001' && t.giorno === oggi).uscita); // => '17:10'

/* ------------------------------------------------------------
   A3) Trovare il reparto di un dipendente con fallback sigla
   ------------------------------------------------------------ */

const reparti = [
  { sigla: 'PR', nome: 'Produzione' },
  { sigla: 'MG', nome: 'Magazzino' },
];

function nomeReparto(sigla) {
  const r = reparti.find((rep) => rep.sigla === sigla);
  return r?.nome ?? 'Reparto sconosciuto';
}

console.log(nomeReparto('MG')); // => 'Magazzino'
console.log(nomeReparto('XX')); // => 'Reparto sconosciuto'

/* ------------------------------------------------------------
   A4) findLast: ultima timbratura cronologica di un dipendente
   Le righe sono in ordine di inserimento; l'ultima è la più recente.
   ------------------------------------------------------------ */

const storico = [
  { dip: 'UP-002', giorno: '2026-06-28', ingresso: '08:00' },
  { dip: 'UP-002', giorno: '2026-06-29', ingresso: '08:10' },
  { dip: 'UP-002', giorno: '2026-06-30', ingresso: '09:05' },
];

const ultimaUP002 = storico.findLast((t) => t.dip === 'UP-002');
console.log(ultimaUP002.giorno); // => '2026-06-30'

/* ------------------------------------------------------------
   A5) Vestiario/DPI: trovare il primo articolo sotto scorta minima
   ------------------------------------------------------------ */

const magazzinoDPI = [
  { articolo: 'Guanti', taglia: 'L', quantita: 12, scortaMinima: 10 },
  { articolo: 'Camice', taglia: 'M', quantita: 3, scortaMinima: 5 },
  { articolo: 'Scarpe', taglia: '42', quantita: 1, scortaMinima: 2 },
];

const sottoScorta = magazzinoDPI.find((a) => a.quantita < a.scortaMinima);
console.log(sottoScorta?.articolo); // => 'Camice'

const idxSottoScorta = magazzinoDPI.findIndex((a) => a.quantita < a.scortaMinima);
console.log(idxSottoScorta); // => 1

/* ------------------------------------------------------------
   A6) Estrarre cifra dal codice badge con regex + findIndex
   ------------------------------------------------------------ */

const codici = ['UP-001', 'UP-015', 'UP-100'];
const idxBadge15 = codici.findIndex((c) => c.match(/-(\d+)$/)?.[1] === '015');
console.log(idxBadge15); // => 1

/* ------------------------------------------------------------
   A7) Turni: trovare il turno applicabile a un orario
   P4 con pausa, P2 senza. Si cerca il primo turno che "copre" l'ora.
   ------------------------------------------------------------ */

const turni = [
  { codice: 'P2', inizio: 6, fine: 14 },
  { codice: 'P4', inizio: 14, fine: 22 },
];

function turnoPerOra(ora) {
  return turni.find((t) => ora >= t.inizio && ora < t.fine)?.codice ?? 'FUORI';
}

console.log(turnoPerOra(9)); // => 'P2'
console.log(turnoPerOra(15)); // => 'P4'
console.log(turnoPerOra(23)); // => 'FUORI'

/* ------------------------------------------------------------
   A8) Combinare find con altri metodi: mappare poi cercare
   ------------------------------------------------------------ */

const dto = dipendenti.map((d) => ({ id: d.id, badge: d.codiceBadge }));
const target = dto.find((x) => x.badge === 'UP-001');
console.log(target); // => { id: 1, badge: 'UP-001' }

/* ------------------------------------------------------------
   B1) Esempio browser: gira nel browser, non in Node
   Trovare il primo elemento DOM visibile in una NodeList.
   ------------------------------------------------------------ */
function primoVisibile() {
  // Esempio browser: gira nel browser, non in Node
  const card = [...document.querySelectorAll('.dipendente-card')];
  return card.find((el) => el.offsetParent !== null);
}
void primoVisibile; // evita warning "non usata"

/* ------------------------------------------------------------
   11) Attenzione: find() su array sparsi e tipi falsy
   find() NON salta i "buchi" come forEach: la callback può
   ricevere undefined. Inoltre ritorna l'ELEMENTO, anche se falsy.
   ------------------------------------------------------------ */

const conZero = [0, false, '', 5];
const primoTruthy = conZero.find((v) => Boolean(v));
console.log(primoTruthy); // => 5

// Distinguere "non trovato" da "trovato un valore falsy":
const trovatoZero = conZero.find((v) => v === 0);
console.log(trovatoZero === undefined); // => false (ha trovato 0!)
console.log(conZero.findIndex((v) => v === 0)); // => 0

/* ============================================================
   RIEPILOGO COMANDI
   - arr.find(callback[, thisArg])        -> primo elemento o undefined
   - arr.findIndex(callback[, thisArg])   -> indice del primo o -1
   - arr.findLast(callback)               -> primo dalla fine (ES2023)
   - arr.findLastIndex(callback)          -> indice dalla fine o -1
   - arr.indexOf(valore)                  -> indice per === o -1
   - arr.lastIndexOf(valore)              -> ultimo indice per === o -1
   - arr.includes(valore)                 -> boolean (per primitivi)
   - arr.filter(callback)                 -> TUTTI i match (array)
   - callback(element, index, array)      -> firma della funzione di test
   - obj?.prop ?? default                 -> gestire "non trovato"
   ============================================================ */
