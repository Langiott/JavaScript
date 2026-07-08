/* ============================================================
   55 JS Array Some Every
   Questo file spiega i metodi di validazione su collezioni:
   Array.prototype.some(), Array.prototype.every() e
   Array.prototype.includes(). Sono metodi che NON modificano
   l'array originale e restituiscono un boolean (o, per includes,
   verificano la presenza di un valore). Sono perfetti per
   convalidare regole di business: "almeno uno", "tutti",
   "contiene". Vedremo callback, short-circuit, casi limite e
   pattern reali ispirati a un gestionale ERP.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) some(): TRUE se ALMENO UN elemento supera il test
   La callback riceve (element, index, array) e ritorna boolean.
   ------------------------------------------------------------ */

// Esempio base: esiste almeno un numero negativo?
const numeri = [3, 7, -2, 10];
const haNegativi = numeri.some((n) => n < 0);
console.log(haNegativi); // => true

// some() su array vuoto e' SEMPRE false (non trova nulla)
console.log([].some((x) => true)); // => false

/* ------------------------------------------------------------
   2) every(): TRUE se TUTTI gli elementi superano il test
   ------------------------------------------------------------ */

// Tutti i numeri sono positivi?
const tuttiPositivi = [3, 7, 10].every((n) => n > 0);
console.log(tuttiPositivi); // => true

// every() su array vuoto e' SEMPRE true (vacuita' logica)
console.log([].every((x) => false)); // => true

/* ------------------------------------------------------------
   3) includes(): TRUE se l'array CONTIENE un valore
   Confronto con SameValueZero: NON usa una callback.
   ------------------------------------------------------------ */

const reparti = ['UP', 'MG', 'AM'];
console.log(reparti.includes('MG')); // => true
console.log(reparti.includes('xx')); // => false

// includes() trova NaN (a differenza di indexOf)
console.log([NaN].includes(NaN)); // => true
console.log([NaN].indexOf(NaN)); // => -1

// includes() con fromIndex: parte da una posizione
console.log([1, 2, 3, 2].includes(2, 2)); // => true (la 2 in posizione 3)
console.log([1, 2, 3].includes(1, 1)); // => false

/* ------------------------------------------------------------
   4) Short-circuit: some/every si fermano appena possibile
   ------------------------------------------------------------ */

// some() si ferma al PRIMO true
[1, 2, 3, 4].some((n) => {
  console.log('controllo some', n);
  return n === 2;
});
// => controllo some 1
// => controllo some 2  (si ferma qui)

// every() si ferma al PRIMO false
[1, 2, 3, 4].every((n) => {
  console.log('controllo every', n);
  return n < 2;
});
// => controllo every 1
// => controllo every 2  (si ferma qui, 2<2 e' false)

/* ------------------------------------------------------------
   5) Indice e array nella callback
   ------------------------------------------------------------ */

// L'elemento e' uguale al suo indice?
console.log([0, 1, 2, 9].every((v, i) => v === i)); // => false
console.log([0, 1, 2, 3].every((v, i) => v === i)); // => true

/* ------------------------------------------------------------
   6) some() su array di oggetti
   ------------------------------------------------------------ */

const dipendenti = [
  { nome: 'Anna', reparto: 'UP', attivo: true },
  { nome: 'Marco', reparto: 'MG', attivo: false },
  { nome: 'Luca', reparto: 'UP', attivo: true },
];

// Esiste almeno un dipendente non attivo?
console.log(dipendenti.some((d) => !d.attivo)); // => true

// Tutti i dipendenti hanno un reparto valorizzato?
console.log(dipendenti.every((d) => Boolean(d.reparto))); // => true

/* ------------------------------------------------------------
   7) includes() vs some() con oggetti
   includes() confronta per RIFERIMENTO, non per contenuto:
   per gli oggetti serve some().
   ------------------------------------------------------------ */

const a1 = { id: 1 };
const lista = [a1, { id: 2 }];
console.log(lista.includes(a1)); // => true (stesso riferimento)
console.log(lista.includes({ id: 1 })); // => false (oggetto diverso)
console.log(lista.some((o) => o.id === 1)); // => true (confronto per valore)

/* ------------------------------------------------------------
   8) Validazione di stringhe con includes()
   ------------------------------------------------------------ */

const turno = 'P4-pausa';
console.log(turno.includes('p4')); // => false (case-sensitive)
console.log(turno.toLowerCase().includes('p4')); // => true

/* ------------------------------------------------------------
   9) Combinare some/every: NIENTE corrisponde
   "nessuno" = !some(...)
   ------------------------------------------------------------ */

const nessunNegativo = !numeri.some((n) => n < 0);
console.log(nessunNegativo); // => false (c'e' il -2)

// every(predicato) equivale a !some(!predicato) (De Morgan)
const arr = [2, 4, 6];
console.log(arr.every((n) => n % 2 === 0)); // => true
console.log(!arr.some((n) => n % 2 !== 0)); // => true (stesso risultato)

/* ============================================================
   PARTE INTERMEDIA: validazioni componibili
   ============================================================ */

/* ------------------------------------------------------------
   10) Validatore generico di campi obbligatori
   ------------------------------------------------------------ */

const campiObbligatori = ['nome', 'cognome', 'codiceBadge'];

function recordCompleto(record) {
  return campiObbligatori.every((campo) => {
    const v = record[campo];
    return v !== undefined && v !== null && String(v).trim() !== '';
  });
}

console.log(recordCompleto({ nome: 'Anna', cognome: 'Bo', codiceBadge: 'UP-001' })); // => true
console.log(recordCompleto({ nome: 'Anna', cognome: '', codiceBadge: 'UP-002' })); // => false

/* ------------------------------------------------------------
   11) some() per cercare duplicati semplici
   ------------------------------------------------------------ */

function haDuplicati(values) {
  return values.some((v, i) => values.indexOf(v) !== i);
}
console.log(haDuplicati(['UP-001', 'UP-002', 'UP-001'])); // => true
console.log(haDuplicati(['UP-001', 'UP-002'])); // => false

/* ------------------------------------------------------------
   12) includes() come whitelist / enum check
   ------------------------------------------------------------ */

const RUOLI_VALIDI = ['operaio', 'impiegato', 'responsabile'];

function ruoloValido(ruolo) {
  return RUOLI_VALIDI.includes(ruolo);
}
console.log(ruoloValido('operaio')); // => true
console.log(ruoloValido('stagista')); // => false

/* ============================================================
   PARTE ADVANCED: spunti dal gestionale ERP
   ============================================================ */

/* ------------------------------------------------------------
   13) Validare le timbrature di una giornata
   Una timbratura completa deve avere ingresso e uscita;
   usiamo every() su un set di marcature attese.
   ------------------------------------------------------------ */

const marcature = {
  ingresso: '08:00',
  uscitaPranzo: '12:30',
  rientroPranzo: '13:30',
  uscita: '17:00',
};

const formatoOk = /^\d{2}:\d{2}$/;
const tappeAttese = ['ingresso', 'uscitaPranzo', 'rientroPranzo', 'uscita'];

// Tutte le tappe sono presenti e nel formato HH:MM?
const giornataValida = tappeAttese.every(
  (t) => typeof marcature[t] === 'string' && formatoOk.test(marcature[t])
);
console.log(giornataValida); // => true

// Esiste almeno una marcatura mancante?
const marcatureParziali = { ingresso: '08:00', uscita: '' };
const mancaQualcosa = tappeAttese.some(
  (t) => !marcatureParziali[t] || !formatoOk.test(marcatureParziali[t])
);
console.log(mancaQualcosa); // => true

/* ------------------------------------------------------------
   14) Badge: validare un lotto di codici 'UP-001'
   ------------------------------------------------------------ */

const badge = ['UP-001', 'MG-014', 'AM-003'];
const formatoBadge = /^[A-Z]{2}-\d{3}$/;

// Tutti i badge rispettano il formato?
console.log(badge.every((b) => formatoBadge.test(b))); // => true

// Esiste un badge del reparto UP?
console.log(badge.some((b) => b.startsWith('UP'))); // => true

/* ------------------------------------------------------------
   15) Turni: controllare la copertura di un reparto
   ------------------------------------------------------------ */

const turniGiornata = [
  { dipendente: 'Anna', turno: 'P4', reparto: 'UP' },
  { dipendente: 'Luca', turno: 'P2', reparto: 'UP' },
  { dipendente: 'Sara', turno: 'P4', reparto: 'MG' },
];

// Il reparto UP ha almeno un turno P4 (con pausa)?
const upCopertoP4 = turniGiornata.some(
  (t) => t.reparto === 'UP' && t.turno === 'P4'
);
console.log(upCopertoP4); // => true

// Tutti i turni appartengono a reparti noti?
const repartiNoti = ['UP', 'MG', 'AM'];
console.log(turniGiornata.every((t) => repartiNoti.includes(t.reparto))); // => true

/* ------------------------------------------------------------
   16) Vestiario / DPI: controllo scorta minima
   ------------------------------------------------------------ */

const magazzinoDPI = [
  { articolo: 'guanti', taglia: 'M', quantita: 40, scortaMinima: 20 },
  { articolo: 'occhiali', taglia: 'U', quantita: 5, scortaMinima: 10 },
  { articolo: 'scarpe', taglia: '42', quantita: 12, scortaMinima: 8 },
];

// Esiste almeno un articolo sotto scorta? (alert)
const articoliSottoScorta = magazzinoDPI.some((a) => a.quantita < a.scortaMinima);
console.log(articoliSottoScorta); // => true (occhiali)

// Tutto il magazzino e' a posto?
const magazzinoOk = magazzinoDPI.every((a) => a.quantita >= a.scortaMinima);
console.log(magazzinoOk); // => false

/* ------------------------------------------------------------
   17) some/every annidati: validare richieste con piu' righe
   Una richiesta e' valida se TUTTE le sue righe hanno minuti > 0.
   ------------------------------------------------------------ */

const richieste = [
  { id: 1, righe: [{ minuti: 30 }, { minuti: 60 }] },
  { id: 2, righe: [{ minuti: 0 }, { minuti: 15 }] },
];

const tutteRigheValide = (r) => r.righe.every((riga) => riga.minuti > 0);

// Esiste una richiesta interamente valida?
console.log(richieste.some(tutteRigheValide)); // => true (id 1)

// Tutte le richieste sono interamente valide?
console.log(richieste.every(tutteRigheValide)); // => false (id 2 ha minuti 0)

/* ------------------------------------------------------------
   18) Higher-order: costruire un validatore "almeno N corrispondenze"
   ------------------------------------------------------------ */

function almenoN(predicato, n) {
  return (collezione) =>
    collezione.filter(predicato).length >= n;
}

const almenoDueUP = almenoN((d) => d.reparto === 'UP', 2);
console.log(almenoDueUP(dipendenti)); // => true (Anna e Luca)

/* ------------------------------------------------------------
   19) Differenza con find()/filter()
   some/every restituiscono boolean; find restituisce l'elemento.
   Usa some() solo per il "esiste?", find() per ottenere il dato.
   ------------------------------------------------------------ */

console.log(dipendenti.some((d) => d.reparto === 'MG')); // => true (esiste?)
console.log(dipendenti.find((d) => d.reparto === 'MG')); // => { nome: 'Marco', ... }

/* ------------------------------------------------------------
   20) includes() con Array.from / Set per performance
   Per molte ricerche ripetute, un Set e' piu' veloce di includes().
   ------------------------------------------------------------ */

const setReparti = new Set(repartiNoti);
console.log(setReparti.has('UP')); // => true (O(1), equivalente logico di includes)

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - arr.some(cb)            -> true se ALMENO uno passa il test
   - arr.every(cb)           -> true se TUTTI passano il test
   - arr.includes(val)       -> true se contiene val (SameValueZero)
   - arr.includes(val, from) -> ricerca a partire da fromIndex
   - str.includes(sub)       -> sottostringa (case-sensitive)
   - set.has(val)            -> alternativa O(1) a includes
   - !arr.some(p)            -> "nessuno" (negazione)
   - !arr.some(!p)           -> equivale a arr.every(p) (De Morgan)
   - cb(element, index, arr) -> firma della callback di some/every
   - some([]) === false      -> array vuoto
   - every([]) === true      -> array vuoto (vacuita' logica)
   ============================================================ */
