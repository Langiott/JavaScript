/* ============================================================
   20 JS String Methods
   In questo file vediamo i principali metodi delle stringhe in
   JavaScript: slice, substring, replace/replaceAll, split, trim,
   padStart/padEnd e repeat. Sono tutti metodi NON mutativi: le
   stringhe in JS sono immutable, quindi ogni metodo RITORNA una
   nuova string senza modificare l'originale. Imparare questi
   metodi e' fondamentale per pulire input, formattare codici
   (badge, orari), generare output leggibili e fare parsing.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   0) PROMEMORIA: le stringhe sono immutable
   ------------------------------------------------------------ */

// Un metodo ritorna una nuova string, l'originale resta intatta
const originale = 'Polyuretech';
const maiusc = originale.toUpperCase();
console.log(originale); // => Polyuretech
console.log(maiusc);    // => POLYURETECH

/* ------------------------------------------------------------
   1) slice(start, end)
   Estrae una porzione. end e' ESCLUSIVO. Accetta indici negativi
   (contano dalla fine). E' il metodo piu' flessibile.
   ------------------------------------------------------------ */

const testo = 'JavaScript';

// Dal carattere 0 al 4 (escluso il 4)
console.log(testo.slice(0, 4));   // => Java

// Da indice 4 fino alla fine
console.log(testo.slice(4));      // => Script

// Indice negativo: ultimi 6 caratteri
console.log(testo.slice(-6));     // => Script

// start e end entrambi negativi
console.log(testo.slice(-6, -3)); // => Scr

// Se start >= end ritorna stringa vuota
console.log(testo.slice(5, 2));   // => (vuoto)

// ERP: estrarre il numero da un codice badge 'UP-001'
const badge = 'UP-001';
console.log(badge.slice(0, 2));   // => UP   (sigla reparto)
console.log(badge.slice(-3));     // => 001  (progressivo)

/* ------------------------------------------------------------
   2) substring(start, end)
   Simile a slice ma: NON accetta indici negativi (li tratta come 0)
   e se start > end SCAMBIA i due argomenti.
   ------------------------------------------------------------ */

console.log(testo.substring(0, 4)); // => Java
console.log(testo.substring(4));    // => Script

// Differenza 1: i negativi diventano 0
console.log(testo.substring(-6));   // => JavaScript (start=0)

// Differenza 2: argomenti scambiati automaticamente
console.log(testo.substring(5, 2)); // => vaSc  (come substring(2,5))

// slice invece NON scambia: torna vuoto
console.log(testo.slice(5, 2));     // => (vuoto)

/* ------------------------------------------------------------
   3) replace(cerca, sostituisci)
   Sostituisce la PRIMA occorrenza (se cerca e' una string) oppure
   tutte se usi una regex con flag /g. Supporta funzioni callback.
   ------------------------------------------------------------ */

const frase = 'turno P4, pausa P4';

// Solo la prima occorrenza con una string
console.log(frase.replace('P4', 'P2')); // => turno P2, pausa P4

// Tutte le occorrenze con regex globale
console.log(frase.replace(/P4/g, 'P2')); // => turno P2, pausa P2

// Pattern speciali: $& = match trovato
console.log('UP-001'.replace(/\d+/, '[$&]')); // => UP-[001]

// replace con CALLBACK: l'argomento e' ogni match trovato
const orario = '8:5';
const padded = orario.replace(/\d+/g, (n) => n.padStart(2, '0'));
console.log(padded); // => 08:05

// ERP: normalizzare spazi multipli in un solo spazio
const nomeSporco = 'Mario   Rossi';
console.log(nomeSporco.replace(/\s+/g, ' ')); // => Mario Rossi

/* ------------------------------------------------------------
   4) replaceAll(cerca, sostituisci)
   Sostituisce TUTTE le occorrenze anche con una string semplice
   (ES2021). Con regex e' OBBLIGATORIO il flag /g.
   ------------------------------------------------------------ */

console.log('a,b,c,d'.replaceAll(',', ' | ')); // => a | b | c | d

// Senza regex e' piu' leggibile di replace(/.../g)
console.log('P4 P4 P4'.replaceAll('P4', 'P2')); // => P2 P2 P2

// Rimuovere tutti i trattini da un badge
console.log('UP-00-1'.replaceAll('-', '')); // => UP001

/* ------------------------------------------------------------
   5) split(separatore, limite)
   Spezza la string in un ARRAY usando il separatore. Con '' separa
   per singoli caratteri. Accetta anche regex e un limite opzionale.
   ------------------------------------------------------------ */

// Per virgola
console.log('nome,cognome,ruolo'.split(',')); // => ['nome','cognome','ruolo']

// Per carattere singolo
console.log('ciao'.split('')); // => ['c','i','a','o']

// String intera senza separatore -> array con un solo elemento
console.log('ciao'.split()); // => ['ciao']

// Con limite: prende solo i primi N pezzi
console.log('a-b-c-d'.split('-', 2)); // => ['a','b']

// Con regex: separa su uno o piu' spazi
console.log('a  b   c'.split(/\s+/)); // => ['a','b','c']

// ERP: parsing di un range orario 'turno' tipo '08:00 - 17:00'
const range = '08:00 - 17:00';
const [inizio, fine] = range.split(/\s*-\s*/);
console.log(inizio); // => 08:00
console.log(fine);   // => 17:00

// ERP: estrarre HH e MM da un orario
const [hh, mm] = '08:05'.split(':');
console.log(Number(hh), Number(mm)); // => 8 5

/* ------------------------------------------------------------
   6) trim, trimStart, trimEnd
   Rimuove gli spazi (e whitespace) all'inizio/fine. Fondamentale
   per pulire input utente prima di salvarli o confrontarli.
   ------------------------------------------------------------ */

const input = '   UP-001   ';
console.log(input.trim());          // => 'UP-001'
console.log(input.trimStart());     // => 'UP-001   '
console.log(input.trimEnd());       // => '   UP-001'
console.log(input.length);          // => 12
console.log(input.trim().length);   // => 6

// ERP: normalizzazione completa di un codice badge inserito a mano
function normalizzaBadge(v) {
  return String(v || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .slice(0, 8);
}
console.log(normalizzaBadge('  up-001 ')); // => UP-001
console.log(normalizzaBadge('  up 0 0 1 extra ')); // => UP001EXT

/* ------------------------------------------------------------
   7) padStart(targetLen, padString) e padEnd(...)
   Allungano la string fino a targetLen aggiungendo padString
   all'inizio (padStart) o alla fine (padEnd). Usatissimi per
   formattare numeri con zeri davanti.
   ------------------------------------------------------------ */

// Zero davanti: classico per ore/minuti
console.log(String(5).padStart(2, '0'));  // => 05
console.log(String(45).padStart(2, '0')); // => 45

// padEnd per allineare colonne in un report testuale
console.log('Mario'.padEnd(10, '.') + '|'); // => Mario.....|

// Se la string e' gia' lunga abbastanza non cambia nulla
console.log('123'.padStart(2, '0')); // => 123

// ERP: comporre un orario naive da ore e minuti
function formattaOrario(h, m) {
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm}`;
}
console.log(formattaOrario(8, 5));  // => 08:05
console.log(formattaOrario(17, 0)); // => 17:00

// ERP: generare un codice badge progressivo a 3 cifre
function generaBadge(sigla, progressivo) {
  return `${sigla}-${String(progressivo).padStart(3, '0')}`;
}
console.log(generaBadge('UP', 1));  // => UP-001
console.log(generaBadge('MG', 42)); // => MG-042

/* ------------------------------------------------------------
   8) repeat(n)
   Ripete la string n volte. Utile per separatori, indentazione,
   barre di avanzamento testuali.
   ------------------------------------------------------------ */

console.log('='.repeat(20)); // => ====================
console.log('ab'.repeat(3));  // => ababab
console.log('x'.repeat(0));   // => (vuoto)

// ERP: barra di avanzamento scorta vestiario (quantita/scortaMinima)
function barraScorta(quantita, scortaMinima) {
  const perc = Math.min(1, quantita / scortaMinima);
  const pieni = Math.round(perc * 10);
  return '[' + '#'.repeat(pieni) + '-'.repeat(10 - pieni) + ']';
}
console.log(barraScorta(8, 10));  // => [########--]
console.log(barraScorta(3, 10));  // => [###-------]
console.log(barraScorta(20, 10)); // => [##########]

/* ------------------------------------------------------------
   9) Metodi a confronto: slice vs substring vs substr
   substr e' DEPRECATO: preferisci sempre slice.
   ------------------------------------------------------------ */

const s = 'abcdef';
console.log(s.slice(1, 3));     // => bc
console.log(s.substring(1, 3)); // => bc
// console.log(s.substr(1, 3)); // 'bcd' ma deprecato: NON usare

/* ------------------------------------------------------------
   10) Esempi combinati / pratici (stile ERP)
   ------------------------------------------------------------ */

// Iniziali di nome e cognome (es. avatar testuale)
function iniziali(nome, cognome) {
  return (nome.slice(0, 1) + cognome.slice(0, 1)).toUpperCase();
}
console.log(iniziali('mario', 'rossi')); // => MR

// Mascherare un codice fiscale lasciando solo gli ultimi 4
function maschera(cf) {
  const visibili = cf.slice(-4);
  return '*'.repeat(cf.length - 4) + visibili;
}
console.log(maschera('RSSMRA80A01H501U')); // => ************501U

// CSV -> array di oggetti dipendente
const csv = 'UP-001;Mario;Rossi\nUP-002;Luca;Bianchi';
const dipendenti = csv
  .split('\n')
  .map((riga) => riga.split(';'))
  .map(([badge, nome, cognome]) => ({ badge: badge.trim(), nome, cognome }));
console.log(dipendenti[1]); // => { badge: 'UP-002', nome: 'Luca', cognome: 'Bianchi' }

// Estrarre il progressivo numerico da un badge con replace + Number
function numeroBadge(badge) {
  return Number(badge.replace(/^\D+-?/, ''));
}
console.log(numeroBadge('UP-007')); // => 7

// Validare formato orario HH:MM e normalizzarlo
function normalizzaOrario(raw) {
  const pulito = raw.trim();
  if (!/^\d{1,2}:\d{1,2}$/.test(pulito)) return null;
  const [h, m] = pulito.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}
console.log(normalizzaOrario(' 8:5 ')); // => 08:05
console.log(normalizzaOrario('ore 8')); // => null

// Comporre una riga di report allineata a colonne
function rigaReport(badge, nome, ore) {
  return (
    badge.padEnd(8, ' ') +
    nome.padEnd(15, ' ') +
    String(ore).padStart(5, ' ') + 'h'
  );
}
console.log(rigaReport('UP-001', 'Mario Rossi', 7.5));
// => 'UP-001  Mario Rossi      7.5h'

// Titolo decorato con repeat
function titolo(testo) {
  const linea = '='.repeat(testo.length + 4);
  return `${linea}\n  ${testo}\n${linea}`;
}
console.log(titolo('REPARTI'));

/* ------------------------------------------------------------
   11) Catene di metodi (method chaining)
   I metodi ritornano string, quindi si possono concatenare.
   ------------------------------------------------------------ */

const sporco = '  Reparto Magazzino  ';
const sigla = sporco
  .trim()              // 'Reparto Magazzino'
  .split(' ')          // ['Reparto','Magazzino']
  .map((w) => w[0])    // ['R','M']
  .join('')            // 'RM'
  .toUpperCase();      // 'RM'
console.log(sigla); // => RM

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   slice(start, end)        -> porzione; end escluso; ammette negativi
   substring(start, end)    -> come slice ma niente negativi; scambia args
   replace(cerca, val)      -> 1a occorrenza (o tutte con regex /g); callback
   replaceAll(cerca, val)   -> tutte le occorrenze; regex richiede /g
   split(sep, limite)       -> string -> array; '' = per carattere; regex ok
   trim() / trimStart()/trimEnd() -> rimuove whitespace ai bordi
   padStart(len, pad)       -> riempie a sinistra (zeri davanti)
   padEnd(len, pad)         -> riempie a destra (allineamento colonne)
   repeat(n)                -> ripete la string n volte
   NOTE: le stringhe sono immutable; i metodi ritornano sempre
   una nuova string. substr e' deprecato: usa slice.
   ============================================================ */
