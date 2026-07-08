/* ============================================================
   100 JS ADV TypedArrays
   I Typed Arrays permettono di lavorare con dati binari grezzi
   in JavaScript in modo efficiente. Un ArrayBuffer e' un blocco
   contiguo di memoria (in byte); le "views" tipizzate
   (Uint8Array, Int32Array, Float64Array, ...) interpretano quei
   byte come numeri di un certo tipo. DataView consente letture
   miste con controllo dell'endianness. Sono fondamentali per file
   binari, protocolli di rete, WebGL, audio, hashing e parsing.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) ARRAYBUFFER: il contenitore di byte
   ------------------------------------------------------------ */

// Crea un buffer di 16 byte (tutti inizializzati a 0)
const buf = new ArrayBuffer(16);
console.log(buf.byteLength); // => 16

// L'ArrayBuffer da solo non e' leggibile: serve una "view" tipizzata
// Non si possono leggere/scrivere byte direttamente sul buffer

/* ------------------------------------------------------------
   2) TYPED ARRAYS: le view sul buffer
   ------------------------------------------------------------ */

// Uint8Array: interi senza segno 0..255, 1 byte ciascuno
const u8 = new Uint8Array(buf); // condivide il buffer "buf"
console.log(u8.length); // => 16 (16 byte / 1 byte per elemento)

u8[0] = 255;
u8[1] = 256;          // overflow: 256 % 256 = 0
u8[2] = -1;           // wrap: -1 diventa 255
console.log(u8[0], u8[1], u8[2]); // => 255 0 255

// Int8Array: interi con segno -128..127
const i8 = new Int8Array(4);
i8[0] = 200;          // overflow con segno -> 200-256 = -56
console.log(i8[0]); // => -56

// Uint8ClampedArray: "clampa" invece di fare wrap (usato per canvas/pixel)
const clamped = new Uint8ClampedArray(3);
clamped[0] = 300;     // clamp a 255
clamped[1] = -10;     // clamp a 0
console.log(clamped[0], clamped[1]); // => 255 0

/* ------------------------------------------------------------
   3) TIPI NUMERICI: dimensioni in byte (BYTES_PER_ELEMENT)
   ------------------------------------------------------------ */

console.log(Uint8Array.BYTES_PER_ELEMENT);   // => 1
console.log(Int16Array.BYTES_PER_ELEMENT);   // => 2
console.log(Int32Array.BYTES_PER_ELEMENT);   // => 4
console.log(Float32Array.BYTES_PER_ELEMENT); // => 4
console.log(Float64Array.BYTES_PER_ELEMENT); // => 8

// Un buffer da 16 byte visto come Int32Array -> 4 elementi
const i32 = new Int32Array(buf); // riusa lo stesso buffer
console.log(i32.length); // => 4

// Float64Array: numeri a virgola mobile a doppia precisione
const f64 = new Float64Array(2); // crea internamente un buffer da 16 byte
f64[0] = 3.14159;
f64[1] = 1234.5678;
console.log(f64[0], f64[1]); // => 3.14159 1234.5678

/* ------------------------------------------------------------
   4) PIU' VIEW SULLO STESSO BUFFER (aliasing della memoria)
   ------------------------------------------------------------ */

// Le view condividono i byte: scrivere con una si vede con l'altra
const shared = new ArrayBuffer(4);
const asU8 = new Uint8Array(shared);
const asU32 = new Uint32Array(shared);

asU8[0] = 0x01;
asU8[1] = 0x00;
asU8[2] = 0x00;
asU8[3] = 0x00;
// Su sistemi little-endian (la maggioranza) i byte 01 00 00 00 = 1
console.log(asU32[0]); // => 1 (little-endian)

/* ------------------------------------------------------------
   5) COSTRUTTORI E INIZIALIZZAZIONE
   ------------------------------------------------------------ */

// Da lunghezza
const a = new Uint8Array(3); // [0,0,0]

// Da array normale
const b = new Uint8Array([10, 20, 30]);
console.log(b[1]); // => 20

// Da iterable / .from() con mapping
const c = Uint8Array.from([1, 2, 3], x => x * 2);
console.log(Array.from(c)); // => [ 2, 4, 6 ]

// .of() come Array.of
const d = Int16Array.of(100, 200, 300);
console.log(d.length); // => 3

/* ------------------------------------------------------------
   6) METODI DI ARRAY DISPONIBILI SUI TYPED ARRAYS
   ------------------------------------------------------------ */

const nums = new Int32Array([5, 1, 9, 3, 7]);

// map / filter / reduce funzionano (filter su typed array ritorna typed array)
console.log(Array.from(nums.map(n => n + 1)));        // => [ 6, 2, 10, 4, 8 ]
console.log(Array.from(nums.filter(n => n > 4)));     // => [ 5, 9, 7 ]
console.log(nums.reduce((s, n) => s + n, 0));         // => 25

// sort numerico nativo (NON lessicografico come negli Array)
console.log(Array.from(nums.slice().sort()));         // => [ 1, 3, 5, 7, 9 ]

// find / some / every / includes
console.log(nums.find(n => n > 6)); // => 9
console.log(nums.some(n => n > 8)); // => true
console.log(nums.every(n => n > 0)); // => true

// set(): copia valori in una posizione (offset)
const dest = new Uint8Array(5);
dest.set([1, 2, 3], 1); // scrive a partire dall'indice 1
console.log(Array.from(dest)); // => [ 0, 1, 2, 3, 0 ]

// subarray(): view (condivide memoria) vs slice(): copia
const orig = new Uint8Array([0, 1, 2, 3, 4]);
const sub = orig.subarray(1, 4); // view su [1,2,3]
sub[0] = 99;
console.log(orig[1]);  // => 99 (modificato! e' una view)
const copy = orig.slice(1, 4);
copy[0] = 7;
console.log(orig[1]);  // => 99 (slice e' una copia, orig invariato)

/* ------------------------------------------------------------
   7) DATAVIEW: letture/scritture miste e controllo endianness
   ------------------------------------------------------------ */

// DataView e' la via piu' flessibile: scegli tipo, offset ed endianness
const dvBuf = new ArrayBuffer(8);
const dv = new DataView(dvBuf);

dv.setUint8(0, 0xFF);
dv.setInt16(1, -1000, true);     // true = little-endian
dv.setFloat32(3, 9.81, false);   // false = big-endian (default)

console.log(dv.getUint8(0));            // => 255
console.log(dv.getInt16(1, true));      // => -1000
console.log(dv.getFloat32(3, false).toFixed(2)); // => 9.81

// Verificare l'endianness del sistema corrente
function isLittleEndian() {
  const probe = new Uint16Array([0x0102]);
  return new Uint8Array(probe.buffer)[0] === 0x02;
}
console.log(isLittleEndian()); // => true (su x86/ARM tipici)

/* ------------------------------------------------------------
   8) BIGINT TYPED ARRAYS (interi a 64 bit)
   ------------------------------------------------------------ */

const big = new BigInt64Array(2);
big[0] = 9007199254740993n; // oltre Number.MAX_SAFE_INTEGER, qui esatto
console.log(big[0]); // => 9007199254740993n

/* ------------------------------------------------------------
   9) TESTO <-> BYTE: TextEncoder / TextDecoder
   ------------------------------------------------------------ */

// In Node sono globali (come nel browser). UTF-8 di default.
const enc = new TextEncoder();
const bytes = enc.encode('Reparto: Verniciatura');
console.log(bytes instanceof Uint8Array); // => true
console.log(bytes.length); // => 21 (numero di byte UTF-8)

const decoded = new TextDecoder('utf-8').decode(bytes);
console.log(decoded); // => Reparto: Verniciatura

/* ------------------------------------------------------------
   10) CONVERSIONI UTILI: hex e base64
   ------------------------------------------------------------ */

// Uint8Array -> stringa esadecimale
function toHex(u8arr) {
  return Array.from(u8arr, b => b.toString(16).padStart(2, '0')).join('');
}
console.log(toHex(new Uint8Array([255, 16, 1]))); // => ff1001

// stringa hex -> Uint8Array
function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}
console.log(Array.from(fromHex('ff1001'))); // => [ 255, 16, 1 ]

// base64 in Node usa Buffer (Buffer e' una sottoclasse di Uint8Array)
const b64 = Buffer.from('UP-001').toString('base64');
console.log(b64); // => VVAtMDAx
console.log(Buffer.from(b64, 'base64').toString()); // => UP-001

/* ------------------------------------------------------------
   11) ESEMPIO ERP: serializzare una timbratura in formato binario
   ------------------------------------------------------------ */

// Pattern naive-UTC del gestionale: salviamo l'orario di Roma "come UTC".
// Qui impacchettiamo un record timbratura compatto (12 byte):
//   [4 byte] idDipendente (Uint32)
//   [4 byte] dataYYYYMMDD come Uint32 (es 20260630)
//   [1 byte] oraIngresso (0..23)
//   [1 byte] minIngresso (0..59)
//   [1 byte] oraUscita
//   [1 byte] minUscita
function packTimbratura({ id, data, oraIn, minIn, oraOut, minOut }) {
  const buffer = new ArrayBuffer(12);
  const view = new DataView(buffer);
  view.setUint32(0, id, true);
  view.setUint32(4, data, true);
  view.setUint8(8, oraIn);
  view.setUint8(9, minIn);
  view.setUint8(10, oraOut);
  view.setUint8(11, minOut);
  return new Uint8Array(buffer);
}

function unpackTimbratura(u8arr) {
  const view = new DataView(u8arr.buffer, u8arr.byteOffset, u8arr.byteLength);
  const oraIn = view.getUint8(8);
  const minIn = view.getUint8(9);
  const oraOut = view.getUint8(10);
  const minOut = view.getUint8(11);
  const hhmm = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return {
    id: view.getUint32(0, true),
    data: view.getUint32(4, true),
    ingresso: hhmm(oraIn, minIn),
    uscita: hhmm(oraOut, minOut),
    minutiLavorati: (oraOut * 60 + minOut) - (oraIn * 60 + minIn),
  };
}

const packed = packTimbratura({ id: 1, data: 20260630, oraIn: 8, minIn: 5, oraOut: 17, minOut: 30 });
console.log(packed.byteLength); // => 12
console.log(unpackTimbratura(packed));
// => { id: 1, data: 20260630, ingresso: '08:05', uscita: '17:30', minutiLavorati: 565 }

/* ------------------------------------------------------------
   12) ESEMPIO ERP: bitmask DPI/vestiario con un singolo byte
   ------------------------------------------------------------ */

// Ogni bit rappresenta un capo assegnato (flag booleani compatti).
const DPI = {
  SCARPE: 1 << 0,   // 1
  TUTA:   1 << 1,   // 2
  GUANTI: 1 << 2,   // 4
  CASCO:  1 << 3,   // 8
  CUFFIE: 1 << 4,   // 16
};

function assegna(stato, capo) { return stato | capo; }     // accende il bit
function rimuovi(stato, capo) { return stato & ~capo; }    // spegne il bit
function possiede(stato, capo) { return (stato & capo) !== 0; }

let dotazione = 0;
dotazione = assegna(dotazione, DPI.SCARPE);
dotazione = assegna(dotazione, DPI.GUANTI);
console.log(possiede(dotazione, DPI.SCARPE)); // => true
console.log(possiede(dotazione, DPI.CASCO));  // => false
dotazione = rimuovi(dotazione, DPI.SCARPE);
console.log(possiede(dotazione, DPI.SCARPE)); // => false

// Salviamo la dotazione di piu' dipendenti in un Uint8Array compatto
const dotazioniReparto = new Uint8Array([
  DPI.SCARPE | DPI.TUTA,
  DPI.SCARPE | DPI.GUANTI | DPI.CASCO,
  DPI.CUFFIE,
]);
console.log(dotazioniReparto.byteLength); // => 3 (3 dipendenti in 3 byte)

/* ------------------------------------------------------------
   13) ESEMPIO ERP: somma rapida ore con Float64Array
   ------------------------------------------------------------ */

// Le ore lavorate in un mese, una per giorno, in un buffer numerico denso.
const oreGiornaliere = Float64Array.from([8, 8.5, 0, 7.75, 8, 8, 0]);
const totaleSettimana = oreGiornaliere.reduce((s, h) => s + h, 0);
console.log(totaleSettimana); // => 40.25

const mediaLavorativa = oreGiornaliere
  .filter(h => h > 0)
  .reduce((s, h, _i, arr) => s + h / arr.length, 0);
console.log(mediaLavorativa.toFixed(2)); // => 8.05

/* ------------------------------------------------------------
   14) PERFORMANCE: typed array vs array normale (concettuale)
   ------------------------------------------------------------ */

// I typed array hanno layout di memoria contiguo e tipo fisso:
// niente boxing, accesso piu' veloce, footprint minore. Ideali per
// grandi volumi numerici (segnali, immagini, dataset, hashing).
const grande = new Float64Array(1_000_000); // ~8 MB contigui
grande.fill(1.5);                            // fill() come negli Array
console.log(grande[999_999]); // => 1.5

/* ------------------------------------------------------------
   15) COPIA E TRASFERIMENTO DI BUFFER
   ------------------------------------------------------------ */

const src = new Uint8Array([1, 2, 3, 4]);
// copyWithin(target, start, end): copia interna in-place
const cw = src.slice();
cw.copyWithin(0, 2); // copia [3,4] all'inizio
console.log(Array.from(cw)); // => [ 3, 4, 3, 4 ]

// slice del buffer sottostante per duplicare la memoria
const bufCopy = src.buffer.slice(0); // copia indipendente dei byte
const view2 = new Uint8Array(bufCopy);
view2[0] = 100;
console.log(src[0]); // => 1 (originale intatto)

/* ------------------------------------------------------------
   16) BROWSER: leggere un file binario (pseudo-eseguibile)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function leggiFileBinario(file) {
  // file proviene da <input type="file">
  return file.arrayBuffer().then(buffer => {
    const bytes = new Uint8Array(buffer);
    // controllo "magic number" di un PNG: 89 50 4E 47
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 &&
                  bytes[2] === 0x4E && bytes[3] === 0x47;
    return { size: bytes.byteLength, isPng };
  });
}
// Uso (browser): leggiFileBinario(input.files[0]).then(console.log);
void leggiFileBinario;

/* ============================================================
   RIEPILOGO COMANDI
   - new ArrayBuffer(n)              -> blocco di n byte
   - .byteLength                     -> dimensione in byte
   - new Uint8Array / Int8Array / Uint8ClampedArray
   - new Int16Array / Uint16Array / Int32Array / Uint32Array
   - new Float32Array / Float64Array
   - new BigInt64Array / BigUint64Array
   - TypedArray.BYTES_PER_ELEMENT   -> byte per elemento
   - TypedArray.from(iter, mapFn)   -> costruzione con map
   - TypedArray.of(...vals)
   - .set(arr, offset)              -> scrive valori a offset
   - .subarray(s, e)                -> view (condivide memoria)
   - .slice(s, e)                   -> copia indipendente
   - .map / .filter / .reduce / .find / .some / .every / .includes
   - .sort()  (numerico nativo) / .fill() / .copyWithin()
   - new DataView(buffer, offset?, len?)
   - dv.setUint8/setInt16/setUint32/setFloat32/setFloat64(off, val, le?)
   - dv.getUint8/getInt16/getUint32/getFloat32/getFloat64(off, le?)
   - new TextEncoder().encode(str)  -> Uint8Array
   - new TextDecoder('utf-8').decode(bytes)
   - Buffer.from(...).toString('base64')   (Node)
   - .buffer / .byteOffset          -> accesso al buffer sottostante
   - Operatori bit a bit: | & ~ << >> per bitmask compatte
   ============================================================ */
