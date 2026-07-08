/* ============================================================
   122 JS ADV Node Streams
   Gli Stream: elaborare dati "a pezzi" (chunk) invece di caricare
   tutto in memoria. Caso reale: un file CSV con 1 milione di
   timbrature non entra in RAM; con gli stream lo processiamo riga
   per riga a memoria costante. Vediamo anche i Buffer e le pipeline.
   Eseguibile con: node 122_JS_ADV_Node_Streams.js
   ============================================================ */

'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const readline = require('node:readline');
const { Readable, Transform, pipeline } = require('node:stream');
const { pipeline: pipelineAsync } = require('node:stream/promises');

/* ------------------------------------------------------------
   1. PERCHE' GLI STREAM: memoria costante vs esplosiva
   ------------------------------------------------------------
   readFile carica TUTTO in RAM. Un file da 2 GB -> 2 GB di RAM.
   Uno stream legge 64 KB alla volta -> RAM costante, anche su 2 GB.
   Concetto chiave: elabori mentre leggi, non dopo aver letto tutto. */

/* ------------------------------------------------------------
   2. BUFFER: i byte grezzi dietro agli stream
   ------------------------------------------------------------
   Un Buffer e' una sequenza di byte. Le stringhe vengono codificate
   in byte (di default UTF-8): i caratteri accentati occupano 2 byte. */

const buf = Buffer.from('caffè', 'utf8');
console.log('Byte di "caffè":', buf.length);      // => 6 (c,a,f,f = 4 byte + è = 2 byte)
console.log('In esadecimale:', buf.toString('hex'));
console.log('Di nuovo stringa:', buf.toString('utf8')); // => caffè

/* ------------------------------------------------------------
   3. PREPARIAMO UN CSV DI ESEMPIO SU DISCO
   ------------------------------------------------------------ */

const cartella = path.join(os.tmpdir(), 'gestionale-streams');
const fileCsv = path.join(cartella, 'timbrature.csv');

async function preparaCsv() {
  await fsp.mkdir(cartella, { recursive: true });
  let contenuto = 'badge;reparto;minuti\n';
  // 10 righe di esempio (in produzione sarebbero milioni).
  const reparti = ['PR', 'AM', 'QU'];
  for (let i = 1; i <= 10; i++) {
    const badge = `UP-${String(i).padStart(3, '0')}`;
    const reparto = reparti[i % reparti.length];
    const minuti = 400 + i * 10;
    contenuto += `${badge};${reparto};${minuti}\n`;
  }
  await fsp.writeFile(fileCsv, contenuto, 'utf8');
  console.log('\nCSV creato:', fileCsv);
}

/* ------------------------------------------------------------
   4. LEGGERE RIGA PER RIGA con readline (il modo piu' comune)
   ------------------------------------------------------------
   readline avvolge uno stream e ci consegna una riga alla volta:
   perfetto per CSV/log. Memoria costante indipendente dalla dimensione. */

async function leggiRigaPerRiga() {
  const rl = readline.createInterface({
    input: fs.createReadStream(fileCsv, { encoding: 'utf8' }),
    crlfDelay: Infinity, // gestisce correttamente i fine-riga di Windows
  });

  let primaRiga = true;
  let totaleMinuti = 0;
  const perReparto = {};

  for await (const riga of rl) { // async iteration: elegante e a memoria costante
    if (primaRiga) { primaRiga = false; continue; } // salta l'intestazione
    if (!riga.trim()) continue;

    const [badge, reparto, minutiStr] = riga.split(';');
    const minuti = Number(minutiStr);
    totaleMinuti += minuti;
    perReparto[reparto] = (perReparto[reparto] ?? 0) + minuti;
  }

  console.log('\nTotale minuti (streaming):', totaleMinuti);
  console.log('Minuti per reparto:', perReparto);
}

/* ------------------------------------------------------------
   5. TRANSFORM STREAM: trasformare i dati "in transito"
   ------------------------------------------------------------
   Un Transform legge da un lato, trasforma, scrive dall'altro.
   Qui: da oggetti timbratura -> righe CSV, in streaming. */

async function scriviConTransform() {
  const dati = [
    { badge: 'UP-001', minuti: 480 },
    { badge: 'UP-002', minuti: 510 },
    { badge: 'UP-003', minuti: 300 },
  ];

  // Sorgente: uno stream che emette i nostri oggetti.
  const sorgente = Readable.from(dati);

  // Il trasformatore: oggetto -> riga di testo. objectMode perche' in ingresso arrivano oggetti.
  const aRigaCsv = new Transform({
    objectMode: true,
    transform(record, _enc, callback) {
      const riga = `${record.badge};${record.minuti};${(record.minuti / 60).toFixed(2)}h\n`;
      callback(null, riga); // callback(errore, datoTrasformato)
    },
  });

  const fileOut = path.join(cartella, 'export.csv');
  const destinazione = fs.createWriteStream(fileOut, { encoding: 'utf8' });

  // pipeline collega sorgente -> transform -> destinazione e gestisce errori/chiusura.
  await pipelineAsync(sorgente, aRigaCsv, destinazione);

  console.log('\nExport via Transform scritto in:', fileOut);
  console.log('Contenuto:\n' + (await fsp.readFile(fileOut, 'utf8')).trim());
  /* Atteso:
     UP-001;480;8.00h
     UP-002;510;8.50h
     UP-003;300;5.00h */
}

/* ------------------------------------------------------------
   6. BACKPRESSURE (il concetto che gli stream risolvono per te)
   ------------------------------------------------------------
   Se leggi piu' veloce di quanto scrivi, la RAM si riempirebbe.
   pipeline() applica la "backpressure": rallenta la lettura finche'
   la scrittura non e' pronta. Con pipeline non devi gestirla a mano. */

console.log('\nNota: pipeline() gestisce automaticamente la backpressure');
console.log('(rallenta la sorgente se la destinazione e piu lenta).');

/* ------------------------------------------------------------
   7. ORCHESTRAZIONE + PULIZIA
   ------------------------------------------------------------ */

async function main() {
  await preparaCsv();
  await leggiRigaPerRiga();
  await scriviConTransform();
  await fsp.rm(cartella, { recursive: true, force: true });
  console.log('\n--- fine demo Streams (pulizia ok) ---');
}

main().catch((err) => {
  console.error('Errore:', err.message);
  process.exit(1);
});

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - Stream = elaborare a chunk: memoria COSTANTE anche su file enormi.
   - Buffer = i byte grezzi; le stringhe si codificano in UTF-8.
   - readline + 'for await' = leggere CSV/log riga per riga, elegante.
   - Transform = modificare i dati mentre "scorrono" (objectMode per oggetti).
   - pipeline() = collega gli stream, gestisce errori, chiusura e backpressure.
   - Regola: file grandi o flussi di rete? Stream, non readFile.
   ============================================================ */
