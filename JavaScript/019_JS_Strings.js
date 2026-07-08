/* ============================================================
   19 JS Strings
   Le strings (stringhe) sono sequenze di caratteri usate per
   rappresentare testo. In JavaScript sono un tipo primitivo,
   sono IMMUTABILI (immutable) e supportano Unicode.
   In questo file vediamo: creazione, length, concatenazione,
   immutabilita', escape sequences e gestione Unicode, con molti
   esempi pratici fino a spunti da un gestionale ERP.
   ============================================================ */


/* ------------------------------------------------------------
   1) CREAZIONE DI STRINGHE
   ------------------------------------------------------------ */

// Apici singoli, doppi e backtick (template literals): equivalenti
const a = 'ciao';
const b = "ciao";
const c = `ciao`;
console.log(a === b, b === c); // => true true

// Stringa vuota
const vuota = '';
console.log(vuota.length); // => 0

// Apici dentro la stringa: alternare il tipo di apice
const frase1 = "L'operaio timbra";
const frase2 = 'Reparto "Montaggio"';
console.log(frase1); // => L'operaio timbra
console.log(frase2); // => Reparto "Montaggio"

// String() come funzione converte qualsiasi valore in stringa
console.log(String(42));        // => 42
console.log(String(true));      // => true
console.log(String(null));      // => null
console.log(String(undefined)); // => undefined

// Wrapper object (sconsigliato): typeof diverso da primitivo
const primitiva = 'x';
const oggetto = new String('x');
console.log(typeof primitiva); // => string
console.log(typeof oggetto);   // => object


/* ------------------------------------------------------------
   2) LENGTH: la lunghezza in code units (UTF-16)
   ------------------------------------------------------------ */

// length conta le UTF-16 code units, non sempre i "caratteri" percepiti
const nome = 'Polyuretech';
console.log(nome.length); // => 11

// Stringa con spazi: contano anch'essi
console.log('a b c'.length); // => 5

// length su un emoji puo' sorprendere (vedi sezione Unicode)
console.log('A'.length);  // => 1
console.log('e'.length);  // => 1


/* ------------------------------------------------------------
   3) ACCESSO AI CARATTERI
   ------------------------------------------------------------ */

const badge = 'UP-001';

// Notazione a indice (index): zero-based
console.log(badge[0]); // => U
console.log(badge[3]); // => 0

// charAt(): come l'indice ma ritorna '' se fuori range
console.log(badge.charAt(1));  // => P
console.log(badge.charAt(99)); // => (stringa vuota)

// at(): supporta indici negativi (ultimo carattere = -1)
console.log(badge.at(-1)); // => 1
console.log(badge.at(-2)); // => 0

// charCodeAt() / codePointAt(): valori numerici del carattere
console.log('A'.charCodeAt(0));   // => 65
console.log('A'.codePointAt(0));  // => 65


/* ------------------------------------------------------------
   4) CONCATENAZIONE
   ------------------------------------------------------------ */

// Operatore + : il modo classico
const primo = 'Mario';
const secondo = 'Rossi';
console.log(primo + ' ' + secondo); // => Mario Rossi

// concat(): metodo equivalente, accetta piu' argomenti
console.log('a'.concat('b', 'c')); // => abc

// += per accumulare (attenzione: crea ogni volta una nuova stringa)
let log = '';
log += 'ingresso ';
log += 'uscita';
console.log(log); // => ingresso uscita

// Template literals: interpolazione con ${ }
const ore = 8;
const reparto = 'Montaggio';
console.log(`Lavorate ${ore}h nel reparto ${reparto}`);
// => Lavorate 8h nel reparto Montaggio

// Espressioni dentro i template literals
const minuti = 90;
console.log(`Totale: ${Math.floor(minuti / 60)}h ${minuti % 60}m`);
// => Totale: 1h 30m

// Template literals multilinea (le newline sono mantenute)
const report = `Dipendente: ${primo} ${secondo}
Reparto: ${reparto}
Ore: ${ore}`;
console.log(report);


/* ------------------------------------------------------------
   5) IMMUTABILITA' (immutability)
   ------------------------------------------------------------ */

// Le stringhe NON si possono modificare in-place
let s = 'badge';
s[0] = 'B';           // assegnazione ignorata (in strict mode darebbe errore)
console.log(s);        // => badge (invariato)

// Per "modificare" si crea una NUOVA stringa
let s2 = 'B' + s.slice(1);
console.log(s2);       // => Badge

// I metodi di string ritornano SEMPRE una nuova stringa
const orig = 'ciao';
const up = orig.toUpperCase();
console.log(orig, up); // => ciao CIAO (l'originale resta invariato)


/* ------------------------------------------------------------
   6) METODI DI RICERCA E TEST
   ------------------------------------------------------------ */

const testo = 'turno P4 con pausa';

console.log(testo.includes('P4'));   // => true
console.log(testo.startsWith('turno')); // => true
console.log(testo.endsWith('pausa'));   // => true
console.log(testo.indexOf('P4'));    // => 6
console.log(testo.indexOf('P9'));    // => -1 (non trovato)
console.log(testo.lastIndexOf('a')); // => 17


/* ------------------------------------------------------------
   7) ESTRAZIONE DI SOTTOSTRINGHE
   ------------------------------------------------------------ */

const codice = 'UP-001';

// slice(start, end): supporta indici negativi
console.log(codice.slice(0, 2)); // => UP
console.log(codice.slice(3));    // => 001
console.log(codice.slice(-3));   // => 001

// substring(start, end): non accetta negativi (li tratta come 0)
console.log(codice.substring(0, 2)); // => UP

// split(): da stringa ad array
console.log('UP-001'.split('-'));   // => [ 'UP', '001' ]
console.log('a,b,c'.split(','));    // => [ 'a', 'b', 'c' ]
console.log('ciao'.split(''));      // => [ 'c', 'i', 'a', 'o' ]


/* ------------------------------------------------------------
   8) TRASFORMAZIONE E PULIZIA
   ------------------------------------------------------------ */

console.log('ciao'.toUpperCase()); // => CIAO
console.log('CIAO'.toLowerCase()); // => ciao

// trim / trimStart / trimEnd: rimuovono spazi ai bordi
console.log('  spazi  '.trim());      // => spazi
console.log('  x'.trimStart());        // => x
console.log('x  '.trimEnd());          // => x

// padStart / padEnd: riempiono fino a una lunghezza data
console.log('5'.padStart(2, '0'));    // => 05
console.log('7'.padEnd(3, '*'));      // => 7**

// repeat: ripete la stringa
console.log('ab'.repeat(3));          // => ababab

// replace / replaceAll
console.log('a-b-c'.replace('-', '_'));    // => a_b-c (solo il primo)
console.log('a-b-c'.replaceAll('-', '_')); // => a_b_c (tutti)


/* ------------------------------------------------------------
   9) ESCAPE SEQUENCES
   ------------------------------------------------------------ */

// \n newline, \t tab, \\ backslash, \' \" apici, \r carriage return
console.log('riga1\nriga2');   // => due righe
console.log('col1\tcol2');     // => col1 <tab> col2
console.log('percorso C:\\dir'); // => percorso C:\dir
console.log('apice \' e doppio \"'); // => apice ' e doppio "

// \uXXXX : carattere Unicode tramite code point a 4 cifre hex
console.log('è');   // => e (e accentata)
console.log('€');   // => simbolo euro

// \u{...} : code point esteso (oltre il BMP)
console.log('\u{1F600}'); // => emoji faccina sorridente

// \xXX : escape esadecimale a 2 cifre
console.log('\x41'); // => A


/* ------------------------------------------------------------
   10) UNICODE E CARATTERI "LARGHI"
   ------------------------------------------------------------ */

// Alcuni caratteri (emoji, simboli) usano 2 code units (surrogate pair)
const emoji = '\u{1F680}'; // razzo
console.log(emoji.length); // => 2 (NON 1!)

// Iterare con [...str] o for...of usa i code points (corretto)
console.log([...emoji].length);    // => 1
console.log([...'aeb'].length);    // => 3

// for...of itera per code point, non per code unit
let conteggio = 0;
for (const ch of '\u{1F600}ab') conteggio++;
console.log(conteggio); // => 3

// codePointAt vs charCodeAt sui caratteri estesi
console.log('\u{1F600}'.codePointAt(0)); // => 128512 (code point reale)
console.log('\u{1F600}'.charCodeAt(0));  // => 55357 (solo meta' surrogate)

// fromCharCode / fromCodePoint: da numero a stringa
console.log(String.fromCharCode(65, 66, 67)); // => ABC
console.log(String.fromCodePoint(128512));    // => emoji

// normalize(): forme equivalenti Unicode (es. accenti precomposti vs combinati)
const composta = 'é';            // e' precomposta
const decomposta = 'é';          // e + accento combinante
console.log(composta === decomposta);  // => false
console.log(composta.normalize() === decomposta.normalize()); // => true


/* ------------------------------------------------------------
   11) CONVERSIONI NUMERO <-> STRINGA
   ------------------------------------------------------------ */

console.log((255).toString(16)); // => ff (esadecimale)
console.log((5).toString(2));    // => 101 (binario)
console.log(Number('42'));       // => 42
console.log(parseInt('08px', 10)); // => 8
console.log(parseFloat('3.14m')); // => 3.14
console.log('3' + 1);            // => 31 (concatenazione!)
console.log('3' - 1);            // => 2  (coercion a numero)


/* ------------------------------------------------------------
   12) CONFRONTO E ORDINAMENTO
   ------------------------------------------------------------ */

console.log('a' < 'b');               // => true (ordine lessicografico)
console.log('Z' < 'a');               // => true (maiuscole prima)
console.log('a'.localeCompare('b'));  // => -1
console.log(['Rossi', 'Bianchi', 'Aldi'].sort()); // ordinamento alfabetico


/* ------------------------------------------------------------
   13) SPUNTI DAL GESTIONALE ERP
   ------------------------------------------------------------ */

// Template literal per comporre il nome completo di un dipendente
const dip = { nome: 'Anna', cognome: 'Verdi' };
const nomeCompleto = `${dip.nome} ${dip.cognome}`;
console.log(`Assegnato a ${nomeCompleto}`); // => Assegnato a Anna Verdi

// Normalizzazione di un input badge: trim, maiuscolo, niente spazi, max 8 char
function normalizzaBadge(v) {
  return String(v || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
}
console.log(normalizzaBadge('  up 001 ')); // => UP001
console.log(normalizzaBadge(null));         // => (stringa vuota)

// Formattazione di un orario naive-UTC come HH:MM con padStart
function formattaOrario(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
console.log(formattaOrario(8, 5));  // => 08:05
console.log(formattaOrario(13, 30)); // => 13:30

// Estrarre la sigla reparto (2 lettere) con fallback se mancante
function siglaReparto(reparto) {
  return (reparto?.sigla ?? 'XX').toUpperCase();
}
console.log(siglaReparto({ sigla: 'mo' })); // => MO
console.log(siglaReparto(null));            // => XX

// Estrarre il numero progressivo da un codice badge
function numeroBadge(codice) {
  const m = codice.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}
console.log(numeroBadge('UP-001')); // => 1
console.log(numeroBadge('UP-042')); // => 42

// Validare un orario nel formato HH:MM con una semplice ricerca
function orarioValido(orario) {
  return /^\d{2}:\d{2}$/.test(orario);
}
console.log(orarioValido('07:45')); // => true
console.log(orarioValido('7:45'));  // => false

// Comporre una riga di log timbratura leggibile
function rigaTimbratura(badge, evento, ora) {
  return `[${badge}] ${evento.padEnd(8, ' ')} -> ${ora}`;
}
console.log(rigaTimbratura('UP-001', 'ingresso', '08:00'));
// => [UP-001] ingresso -> 08:00


/* ------------------------------------------------------------
   14) RAW STRINGS E TAGGED TEMPLATES (avanzato)
   ------------------------------------------------------------ */

// String.raw: ignora le escape sequences (utile per regex/percorsi)
console.log(String.raw`C:\dir\new`); // => C:\dir\new (\n non interpretato)

// Tagged template: una funzione che riceve parti e valori
function evidenzia(parti, ...valori) {
  return parti.reduce((acc, p, i) =>
    acc + p + (valori[i] !== undefined ? `<<${valori[i]}>>` : ''), '');
}
console.log(evidenzia`Dip ${nomeCompleto} reparto ${reparto}`);
// => Dip <<Anna Verdi>> reparto <<Montaggio>>


/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   ------------------------------------------------------------
   Creazione      : '', "", ``, String(x), new String(x)
   Lunghezza      : .length
   Accesso        : str[i], charAt, at, charCodeAt, codePointAt
   Concatenazione : +, +=, concat(), `${...}`
   Ricerca        : includes, indexOf, lastIndexOf, startsWith, endsWith
   Estrazione     : slice, substring, split
   Trasformazione : toUpperCase, toLowerCase, trim/trimStart/trimEnd,
                    padStart, padEnd, repeat, replace, replaceAll
   Escape         : \n \t \\ \' \" \r \uXXXX \u{...} \xXX
   Unicode        : [...str], for...of, normalize, fromCharCode,
                    fromCodePoint, codePointAt
   Conversioni    : toString(base), Number, parseInt, parseFloat
   Confronto      : <, >, localeCompare, sort
   Avanzato       : String.raw, tagged templates
   ============================================================ */
