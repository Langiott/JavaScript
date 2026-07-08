/* ============================================================
   67 JS RegExp Methods
   RegExp avanzato in JavaScript: il metodo exec() e l'iterazione
   sui match, replace() con i backreference ($1, $&, $`, $') e con
   una funzione di callback, i named capturing groups (?<nome>...),
   e gli assertion avanzati lookahead (?=)(?!) e lookbehind (?<=)(?<!).
   Tutti gli esempi sono eseguibili in Node.js (ES2020+) e mostrano
   l'output atteso come commento. Diversi esempi sono ispirati a un
   gestionale ERP (badge, timbrature, turni, reparti, vestiario).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) RIPASSO VELOCE: test() e match()
   ------------------------------------------------------------ */

// test() ritorna true/false: c'è almeno un match?
console.log(/^\d{2}:\d{2}$/.test('08:30')); // => true
console.log(/^\d{2}:\d{2}$/.test('8:30'));  // => false

// String.match() senza flag g ritorna il primo match con dettagli
const m1 = 'UP-001'.match(/-(\d+)$/);
console.log(m1[0]); // => -001
console.log(m1[1]); // => 001  (primo capturing group)
console.log(m1.index); // => 2

// match() CON flag g ritorna solo l'array dei match completi (niente gruppi)
console.log('a1 b2 c3'.match(/[a-z]\d/g)); // => [ 'a1', 'b2', 'c3' ]

/* ------------------------------------------------------------
   2) RegExp.prototype.exec()
   exec() lavora su una singola regex e, con il flag g, mantiene
   lastIndex per iterare match dopo match in un ciclo while.
   ------------------------------------------------------------ */

// exec() singolo: come match() senza g
const reBadge = /([A-Z]{2})-(\d{3})/;
const ex1 = reBadge.exec('Badge UP-001 attivo');
console.log(ex1[0]); // => UP-001
console.log(ex1[1]); // => UP   (sigla reparto)
console.log(ex1[2]); // => 001  (progressivo)

// exec() in loop con flag g: estrae TUTTI i badge da un testo
const reBadgeG = /([A-Z]{2})-(\d{3})/g;
const testo = 'Presenti: UP-001, RD-014 e UP-205';
let match;
const badges = [];
while ((match = reBadgeG.exec(testo)) !== null) {
  // match.index dice dove inizia; lastIndex avanza da solo
  badges.push({ sigla: match[1], num: match[2], pos: match.index });
}
console.log(badges);
// => [ { sigla:'UP', num:'001', pos:10 }, { sigla:'RD', num:'014', pos:18 }, { sigla:'UP', num:'205', pos:27 } ]

// ATTENZIONE: una regex con g è "stateful" (mantiene lastIndex).
// Riusarla senza azzerare può saltare match. Azzera con lastIndex = 0.
const reStato = /\d/g;
reStato.exec('12');
console.log(reStato.lastIndex); // => 1
reStato.lastIndex = 0; // reset manuale prima di riusarla

/* ------------------------------------------------------------
   3) String.prototype.matchAll()  (ES2020)
   Alternativa moderna al while+exec: ritorna un iterator di match
   COMPLETI di gruppi. Richiede il flag g.
   ------------------------------------------------------------ */

const reTurno = /(\d{1,2}):(\d{2})/g;
const turni = '08:30-12:30 e 13:30-17:30';
for (const t of turni.matchAll(reTurno)) {
  // t[0] match intero, t[1] ore, t[2] minuti, t.index posizione
  console.log(`${t[0]} -> h=${t[1]} m=${t[2]}`);
}
// => 08:30 -> h=8 m=30
// => 12:30 -> h=12 m=30
// => 13:30 -> h=13 m=30
// => 17:30 -> h=17 m=30

// Spread per ottenere un array di match
const orari = [...'09:00 18:00'.matchAll(/\d{2}:\d{2}/g)].map(x => x[0]);
console.log(orari); // => [ '09:00', '18:00' ]

/* ------------------------------------------------------------
   4) replace() con i backreference $1, $2, $&, $`, $'
   - $1, $2...  contenuto dei capturing group
   - $&         l'intero match
   - $`         testo PRIMA del match
   - $'         testo DOPO il match
   - $$         un dollaro letterale
   ------------------------------------------------------------ */

// Riformatta una data da YYYY-MM-DD a DD/MM/YYYY usando $1 $2 $3
const dataISO = '2026-06-30';
console.log(dataISO.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')); // => 30/06/2026

// $& : evidenzia tutti i badge mettendoli tra parentesi quadre
console.log('UP-001 e RD-014'.replace(/[A-Z]{2}-\d{3}/g, '[$&]'));
// => [UP-001] e [RD-014]

// $` e $' : contesto attorno al match
console.log('reparto:UP'.replace(/UP/, "<<$`|$'>>")); // => reparto:<<reparto:|>>

// $$ : dollaro letterale (es. formattazione importi)
console.log('1500'.replace(/\d+/, '$$$&')); // => $1500

/* ------------------------------------------------------------
   5) replace() con FUNZIONE di callback
   La funzione riceve: (matchIntero, gruppo1, gruppo2, ..., offset, stringa)
   Utilissima quando la sostituzione richiede logica/calcoli.
   ------------------------------------------------------------ */

// Converte ogni orario HH:MM in minuti dalla mezzanotte (pattern ERP timbrature)
const calcoloMinuti = '08:30 e 17:00'.replace(/(\d{1,2}):(\d{2})/g, (full, h, m) => {
  return String(Number(h) * 60 + Number(m));
});
console.log(calcoloMinuti); // => 510 e 1020

// Normalizza i badge: forza maiuscolo e padding a 3 cifre
const normBadge = 'up-1, rd-42'.replace(/([a-z]{2})-(\d+)/gi, (full, sig, num) => {
  return `${sig.toUpperCase()}-${num.padStart(3, '0')}`;
});
console.log(normBadge); // => UP-001, RD-042

// Mascheramento dati sensibili: nasconde tutte le cifre tranne le ultime 2
const masked = 'IBAN 12345678'.replace(/\d/g, (d, offset, str) => {
  return offset >= str.length - 2 ? d : '*';
});
console.log(masked); // => IBAN ******78

// Capitalizza nome e cognome (template ERP `${nome} ${cognome}`)
const nomeCompleto = 'mario rossi'.replace(/\b\w/g, c => c.toUpperCase());
console.log(nomeCompleto); // => Mario Rossi

/* ------------------------------------------------------------
   6) NAMED CAPTURING GROUPS  (?<nome>...)
   I gruppi nominati rendono il codice leggibile: si accede via
   match.groups.nome invece che con indici numerici.
   In replace si referenziano con $<nome>.
   ------------------------------------------------------------ */

// Estrae sigla e progressivo del badge con nomi parlanti
const reBadgeNamed = /(?<sigla>[A-Z]{2})-(?<prog>\d{3})/;
const gBadge = 'UP-001'.match(reBadgeNamed).groups;
console.log(gBadge.sigla); // => UP
console.log(gBadge.prog);  // => 001

// Named groups + destructuring: spacchetta un range turno P4 "08:30-12:30"
const reRange = /(?<hi>\d{1,2}):(?<mi>\d{2})\s*[-–]\s*(?<hf>\d{1,2}):(?<mf>\d{2})/;
const { hi, mi, hf, mf } = '08:30-12:30'.match(reRange).groups;
console.log(`inizio ${hi}:${mi} fine ${hf}:${mf}`); // => inizio 08:30 fine 12:30

// Named groups in replace con $<nome>: riformatta data ISO -> italiana
const reDataN = /(?<y>\d{4})-(?<mo>\d{2})-(?<d>\d{2})/;
console.log('2026-06-30'.replace(reDataN, '$<d>/$<mo>/$<y>')); // => 30/06/2026

// matchAll + named groups: tabella dipendenti da testo libero
const righe = 'UP-001:Mario; RD-014:Lucia';
const reRiga = /(?<badge>[A-Z]{2}-\d{3}):(?<nome>\w+)/g;
const dipendenti = [...righe.matchAll(reRiga)].map(r => r.groups);
console.log(dipendenti);
// => [ { badge:'UP-001', nome:'Mario' }, { badge:'RD-014', nome:'Lucia' } ]

// Backreference NOMINATA dentro il pattern: \k<nome> (es. parola raddoppiata)
const reDoppia = /\b(?<w>\w+)\s+\k<w>\b/;
console.log(reDoppia.test('reparto reparto')); // => true
console.log(reDoppia.test('reparto magazzino')); // => false

/* ------------------------------------------------------------
   7) LOOKAHEAD: (?=...) positivo e (?!...) negativo
   Verificano cosa SEGUE il match SENZA consumarlo (zero-width).
   ------------------------------------------------------------ */

// Positive lookahead: numero seguito da " min" (estrae solo il numero)
console.log('45 min'.match(/\d+(?= min)/)[0]); // => 45

// Negative lookahead: parole che NON sono seguite da ":" (no chiavi)
const reNonChiave = /\b\w+\b(?!:)/g;
console.log('nome:Mario reparto:UP attivo'.match(reNonChiave));
// => [ 'Mario', 'UP', 'attivo' ]  (i valori e la parola libera, non le chiavi)

// Inserisce separatore migliaia con lookahead (gruppi di 3 cifre)
const importo = '1234567'.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
console.log(importo); // => 1.234.567

// Validazione password con lookahead multipli (almeno 1 maiuscola, 1 cifra, len>=6)
const rePwd = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
console.log(rePwd.test('Poly26'));  // => true
console.log(rePwd.test('poly26'));  // => false (manca maiuscola)

/* ------------------------------------------------------------
   8) LOOKBEHIND: (?<=...) positivo e (?<!...) negativo  (ES2018)
   Verificano cosa PRECEDE il match SENZA consumarlo.
   ------------------------------------------------------------ */

// Positive lookbehind: estrae il valore dopo "badge:"
console.log('badge:UP-001'.match(/(?<=badge:)[A-Z]{2}-\d{3}/)[0]); // => UP-001

// Negative lookbehind: cifre NON precedute da "$" (quantità, non prezzi)
console.log('$50 scorta 12'.match(/(?<!\$)\b\d+/g)); // => [ '12' ]

// Lookbehind per estrarre l'importo dopo il simbolo euro
console.log('Totale: €1500'.match(/(?<=€)\d+/)[0]); // => 1500

// Combinare lookbehind + lookahead: prendi SOLO il contenuto tra parentesi
console.log('turno (P4) attivo'.match(/(?<=\()[^)]+(?=\))/)[0]); // => P4

/* ------------------------------------------------------------
   9) ESEMPI PRATICI ERP (mettiamo tutto insieme)
   ------------------------------------------------------------ */

// (a) Parser di un orario range turno -> minuti totali lavorati
function durataMinuti(rangeStr) {
  const re = /(?<hi>\d{1,2}):(?<mi>\d{2})\s*[-–]\s*(?<hf>\d{1,2}):(?<mf>\d{2})/;
  const g = rangeStr.match(re)?.groups;
  if (!g) return 0;
  const start = Number(g.hi) * 60 + Number(g.mi);
  const end = Number(g.hf) * 60 + Number(g.mf);
  return end - start;
}
console.log(durataMinuti('08:30-12:30')); // => 240
console.log(durataMinuti('13:30–17:30')); // => 240 (con trattino lungo –)

// (b) Estrai progressivo numerico da un badge per ordinarli
function progressivo(badge) {
  return Number(badge.match(/-(?<n>\d+)$/)?.groups.n ?? 0);
}
console.log(['UP-010', 'UP-002', 'UP-001'].sort((a, b) => progressivo(a) - progressivo(b)));
// => [ 'UP-001', 'UP-002', 'UP-010' ]

// (c) Normalizzazione codice articolo vestiario: upper, no spazi, max 8 char
function normalizzaCodice(v) {
  return String(v || '').toUpperCase().replace(/\s+/g, '').slice(0, 8);
}
console.log(normalizzaCodice('  guanti m 09 ')); // => GUANTIM0

// (d) Validazione formato orario timbratura HH:MM (00-23 : 00-59)
const reOrarioValido = /^(?<h>[01]\d|2[0-3]):(?<m>[0-5]\d)$/;
console.log(reOrarioValido.test('08:30')); // => true
console.log(reOrarioValido.test('25:00')); // => false

// (e) Maschera tutti i badge in un report tranne la sigla reparto
const report = 'Timbrature: UP-001 ingresso, RD-014 uscita';
console.log(report.replace(/([A-Z]{2})-\d{3}/g, '$1-***'));
// => Timbrature: UP-***ingresso, RD-*** uscita  (sigla preservata, prog mascherato)

// (f) Estrai coppie chiave:valore con named groups in oggetto config turno
const cfg = 'pausa:30 tolleranza:5 arrotonda:15';
const reKV = /(?<k>\w+):(?<v>\d+)/g;
const turnoCfg = Object.fromEntries(
  [...cfg.matchAll(reKV)].map(x => [x.groups.k, Number(x.groups.v)])
);
console.log(turnoCfg); // => { pausa: 30, tolleranza: 5, arrotonda: 15 }

/* ------------------------------------------------------------
   10) DETTAGLI UTILI E TRABOCCHETTI
   ------------------------------------------------------------ */

// Flag 'd' (ES2022): aggiunge .indices con start/end di ogni gruppo
const reD = /(?<sigla>[A-Z]{2})-(?<num>\d{3})/d;
const md = 'UP-001'.match(reD);
console.log(md.indices.groups.num); // => [ 3, 6 ]  (posizioni del gruppo num)

// Gruppi NON catturanti (?:...) : raggruppano senza salvare in $1
console.log('abab'.replace(/(?:ab)+/, 'X')); // => X

// replaceAll() (ES2021): sostituisce tutte le occorrenze senza flag g su stringa
console.log('UP UP UP'.replaceAll('UP', 'RD')); // => RD RD RD
// con regex, replaceAll RICHIEDE il flag g
console.log('a1b2'.replaceAll(/\d/g, '#')); // => a#b#

// Escape di caratteri speciali quando il pattern viene da input utente
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const cerca = 'UP-001';
const reSicura = new RegExp(escapeRegExp(cerca));
console.log(reSicura.test('badge UP-001')); // => true

/* ============================================================
   RIEPILOGO COMANDI (scheda memoria rapida)
   ------------------------------------------------------------
   - regex.test(str)              -> boolean, c'è match?
   - str.match(re)                -> primo match (o array con flag g)
   - str.matchAll(re/g)           -> iterator di match completi (ES2020)
   - regex.exec(str)              -> match + gruppi; con g itera via lastIndex
   - regex.lastIndex              -> posizione interna (reset a 0 se riusi)
   - str.replace(re, '$1 $2')     -> backreference $1,$2,$&,$`,$',$$
   - str.replace(re, fn)          -> fn(match, g1.., offset, str)
   - str.replaceAll(str|re/g, x)  -> tutte le occorrenze (ES2021)
   - (?<nome>...)                 -> named capturing group
   - match.groups.nome            -> accesso ai named groups
   - $<nome>                      -> named group dentro replace
   - \k<nome>                     -> backreference nominata nel pattern
   - (?=...) / (?!...)            -> lookahead positivo / negativo
   - (?<=...) / (?<!...)          -> lookbehind positivo / negativo (ES2018)
   - (?:...)                      -> gruppo non catturante
   - flag d                       -> match.indices (ES2022)
   - flag g/i/m/s/u/y             -> global/ignoreCase/multiline/dotAll/unicode/sticky
   ============================================================ */
