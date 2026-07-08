/* ============================================================
   121 JS ADV Node Core
   I moduli fondamentali di Node.js: fs (file system), path (percorsi),
   process (ambiente e CLI). Caso reale: il gestionale deve leggere e
   scrivere file di configurazione e report su disco, in modo portabile
   tra Windows/Linux, leggendo argomenti e variabili d'ambiente.
   Eseguibile con: node 121_JS_ADV_Node_Core.js
   ============================================================ */

'use strict';

// In Node moderno i moduli core si importano col prefisso 'node:'.
const fs = require('node:fs');
const fsp = require('node:fs/promises'); // versione a Promise (async/await)
const path = require('node:path');
const os = require('node:os');
const process = require('node:process');

/* ------------------------------------------------------------
   1. process: informazioni sull'ambiente di esecuzione
   ------------------------------------------------------------ */

console.log('Node version:', process.version);        // es. v24.16.0
console.log('Piattaforma:', process.platform);         // 'win32' | 'linux' | 'darwin'
console.log('Cartella corrente (cwd):', process.cwd()); // da dove hai lanciato node

// Argomenti da riga di comando: process.argv[0]=node, [1]=script, [2+]=i tuoi.
// Prova: node 121_JS_ADV_Node_Core.js --reparto PR
const argomenti = process.argv.slice(2);
console.log('Argomenti CLI:', argomenti);

// Variabili d'ambiente: configurazione senza toccare il codice.
// Prova (Windows): set MODO=produzione && node 121_...
console.log('MODO:', process.env.MODO ?? '(non impostata, uso default)');

/* ------------------------------------------------------------
   2. path: costruire percorsi in modo PORTABILE
   ------------------------------------------------------------
   Non concatenare mai stringhe con '/' o '\' a mano: path lo fa
   giusto su ogni sistema operativo. */

// __dirname = cartella di QUESTO file (assoluta).
console.log('__dirname:', __dirname);
console.log('__filename:', path.basename(__filename)); // solo il nome file

const percorsoReport = path.join(__dirname, 'output', 'report.json');
console.log('Percorso report:', percorsoReport);
console.log('Estensione:', path.extname(percorsoReport)); // => .json
console.log('Cartella:', path.dirname(percorsoReport));    // .../output

/* ------------------------------------------------------------
   3. fs SINCRONO: veloce da scrivere, blocca il thread
   ------------------------------------------------------------
   Va bene per script/avvio, MAI dentro un server sotto carico
   (bloccherebbe tutte le richieste). */

// Usiamo una cartella temporanea del sistema per non sporcare il progetto.
const cartellaLavoro = path.join(os.tmpdir(), 'gestionale-demo');

// Crea la cartella se non esiste (recursive: crea anche i genitori).
fs.mkdirSync(cartellaLavoro, { recursive: true });

const fileSync = path.join(cartellaLavoro, 'dipendenti.txt');
fs.writeFileSync(fileSync, 'UP-001;Mario;Rossi\nUP-002;Anna;Verdi\n', 'utf8');
console.log('\nScritto (sync):', fileSync);

const contenuto = fs.readFileSync(fileSync, 'utf8');
console.log('Letto (sync):\n' + contenuto.trim());

// Esiste? Meglio provare a usarlo e gestire l'errore, ma per demo:
console.log('Il file esiste?', fs.existsSync(fileSync)); // => true

/* ------------------------------------------------------------
   4. fs ASINCRONO (Promise): la scelta giusta nei server
   ------------------------------------------------------------
   Non blocca l'event loop: mentre legge il disco, Node serve altro. */

async function demoAsync() {
  const fileAsync = path.join(cartellaLavoro, 'report.json');

  const report = {
    generato: 'demo',
    dipendenti: 2,
    reparti: { PR: 1, AM: 1 },
  };

  // Scrivi JSON "bello" (indentato di 2 spazi).
  await fsp.writeFile(fileAsync, JSON.stringify(report, null, 2), 'utf8');
  console.log('\nScritto (async):', fileAsync);

  // Rileggi e ri-parsa: round-trip completo.
  const grezzo = await fsp.readFile(fileAsync, 'utf8');
  const riletto = JSON.parse(grezzo);
  console.log('Reparti dal JSON riletto:', riletto.reparti); // => { PR: 1, AM: 1 }

  // Elenca i file della cartella.
  const elenco = await fsp.readdir(cartellaLavoro);
  console.log('File nella cartella:', elenco); // => ['dipendenti.txt', 'report.json']

  // Metadati (dimensione, se e' un file/cartella...).
  const info = await fsp.stat(fileAsync);
  console.log('Dimensione report.json:', info.size, 'byte, e file?', info.isFile());

  // Pulizia: rimuoviamo la cartella demo (recursive + force = non fallisce se manca).
  await fsp.rm(cartellaLavoro, { recursive: true, force: true });
  console.log('Pulizia completata.');
}

/* ------------------------------------------------------------
   5. GESTIONE ERRORI TIPICA (file che non esiste)
   ------------------------------------------------------------
   Gli errori di fs hanno un 'code' (es. 'ENOENT' = file non trovato):
   usalo per reagire in modo specifico. */

async function demoErrore() {
  try {
    await fsp.readFile(path.join(cartellaLavoro, 'inesistente.txt'), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('\nFile non trovato (ENOENT): gestito senza crash.');
    } else {
      throw err; // errore diverso: rilancialo
    }
  }
}

/* ------------------------------------------------------------
   6. process.exit e codici di uscita
   ------------------------------------------------------------
   Uno script CLI comunica il successo (0) o l'errore (!=0) al sistema. */

async function main() {
  await demoAsync();
  await demoErrore();
  console.log('\n--- fine demo Node Core ---');
  // process.exit(0);  // implicito se non ci sono errori; 0 = tutto ok
}

main().catch((err) => {
  console.error('Errore fatale:', err.message);
  process.exit(1); // 1 = uscita con errore (utile in script/CI)
});

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - process: version, platform, cwd, argv (CLI), env (config).
   - path: percorsi portabili (join, basename, extname, dirname).
   - fs sync: semplice, ma BLOCCA -> solo per script/avvio.
   - fs/promises: non blocca -> usalo nei server con async/await.
   - Gli errori fs hanno .code (ENOENT...): reagisci in modo specifico.
   - Codici di uscita: 0 = ok, !=0 = errore (lo legge il sistema/CI).
   ============================================================ */
