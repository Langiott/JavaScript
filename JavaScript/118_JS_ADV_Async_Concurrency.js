/* ============================================================
   118 JS ADV Async Concurrency
   Controllo della concorrenza con async/await. Caso reale: dobbiamo
   sincronizzare le timbrature di 100 dipendenti verso un server,
   ma NON possiamo lanciare 100 richieste insieme (rate limit).
   Impariamo: Promise.all vs allSettled, retry con backoff,
   timeout, e un "pool" che limita quante richieste girano insieme.
   JavaScript moderno (ES2020+), eseguibile con Node.js.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. UNA "FINTA API" ASINCRONA (per simulare la rete)
   ------------------------------------------------------------
   sleep() ci da un ritardo; fakeSync() a volte fallisce, cosi'
   possiamo testare retry e allSettled. Deterministico: il fallimento
   dipende dall'id (id divisibile per 4), non dal caso. */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fakeSync(dip) {
  await sleep(20); // latenza simulata
  if (dip.id % 4 === 0) {
    throw new Error(`sync fallita per ${dip.badge}`);
  }
  return `OK ${dip.badge}`;
}

const dipendenti = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  badge: `UP-00${i + 1}`,
}));

/* ------------------------------------------------------------
   2. Promise.all: TUTTE insieme, ma FALLISCE se una fallisce
   ------------------------------------------------------------
   Promise.all e' "tutto o niente": al primo reject, l'intera
   promise viene rifiutata (le altre continuano ma le ignori). */

async function esempioAll() {
  const soloBuoni = dipendenti.filter((d) => d.id % 4 !== 0); // togliamo i falliti
  const risultati = await Promise.all(soloBuoni.map(fakeSync));
  console.log('Promise.all:', risultati);
  // => Promise.all: [ 'OK UP-001', 'OK UP-002', 'OK UP-003', 'OK UP-005', 'OK UP-006', 'OK UP-007' ]
}

/* ------------------------------------------------------------
   3. Promise.allSettled: NON fallisce mai, ti dice esito per esito
   ------------------------------------------------------------
   In un sync di massa vuoi sapere QUALI sono andate bene e quali no,
   non fermarti alla prima. allSettled e' la scelta giusta. */

async function esempioAllSettled() {
  const esiti = await Promise.allSettled(dipendenti.map(fakeSync));
  const ok = esiti.filter((e) => e.status === 'fulfilled').map((e) => e.value);
  const ko = esiti.filter((e) => e.status === 'rejected').map((e) => e.reason.message);
  console.log('Riusciti:', ok.length, '| Falliti:', ko.length);
  // => Riusciti: 6 | Falliti: 2
  console.log('Errori:', ko);
  // => Errori: [ 'sync fallita per UP-004', 'sync fallita per UP-008' ]
}

/* ------------------------------------------------------------
   4. TIMEOUT: abbandonare una promise troppo lenta
   ------------------------------------------------------------
   Promise.race corre due promise e prende la PRIMA che finisce:
   la vera operazione contro un "timer di scadenza". */

function conTimeout(promise, ms, etichetta = 'operazione') {
  const scadenza = sleep(ms).then(() => {
    throw new Error(`${etichetta} scaduta dopo ${ms}ms`);
  });
  return Promise.race([promise, scadenza]);
}

async function esempioTimeout() {
  try {
    await conTimeout(sleep(100).then(() => 'fatto'), 50, 'sync lenta');
  } catch (err) {
    console.log('Timeout:', err.message); // => Timeout: sync lenta scaduta dopo 50ms
  }
}

/* ------------------------------------------------------------
   5. RETRY con BACKOFF: riprovare le operazioni che falliscono
   ------------------------------------------------------------
   Se la rete "traballa", riproviamo N volte aspettando sempre di
   piu' (backoff): 20ms, 40ms, 80ms... Riduce la pressione sul server. */

async function conRetry(fn, tentativi = 3, ritardoBase = 20) {
  let ultimoErrore;
  for (let i = 0; i < tentativi; i++) {
    try {
      return await fn();
    } catch (err) {
      ultimoErrore = err;
      const attesa = ritardoBase * 2 ** i; // 20, 40, 80...
      console.log(`  tentativo ${i + 1} fallito, riprovo tra ${attesa}ms`);
      await sleep(attesa);
    }
  }
  throw new Error(`Falliti tutti i ${tentativi} tentativi: ${ultimoErrore.message}`);
}

async function esempioRetry() {
  // Una funzione che fallisce le prime 2 volte e riesce alla terza.
  let chiamate = 0;
  const instabile = async () => {
    chiamate++;
    if (chiamate < 3) throw new Error('rete instabile');
    return 'sincronizzato al 3o tentativo';
  };
  const esito = await conRetry(instabile);
  console.log('Retry esito:', esito); // => Retry esito: sincronizzato al 3o tentativo
}

/* ------------------------------------------------------------
   6. POOL DI CONCORRENZA: max N operazioni in parallelo
   ------------------------------------------------------------
   Il pattern piu' utile in produzione. Lanciamo tutti gli item ma
   teniamo al massimo 'limite' promise attive contemporaneamente. */

async function mapConLimite(items, limite, worker) {
  const risultati = new Array(items.length);
  let indice = 0;

  // Ogni "operaio" prende il prossimo indice libero finche' ce ne sono.
  async function operaio() {
    while (indice < items.length) {
      const mio = indice++;
      risultati[mio] = await worker(items[mio], mio);
    }
  }

  // Avviamo 'limite' operai in parallelo e aspettiamo che finiscano tutti.
  const operai = Array.from({ length: Math.min(limite, items.length) }, operaio);
  await Promise.all(operai);
  return risultati;
}

async function esempioPool() {
  const esiti = await mapConLimite(dipendenti, 3, async (d) => {
    try {
      return await fakeSync(d);
    } catch (e) {
      return `KO ${d.badge}`;
    }
  });
  console.log('Pool (max 3 in parallelo):', esiti);
  // => [ 'OK UP-001','OK UP-002','OK UP-003','KO UP-004','OK UP-005','OK UP-006','OK UP-007','KO UP-008' ]
}

/* ------------------------------------------------------------
   7. ESECUZIONE DEGLI ESEMPI IN SEQUENZA
   ------------------------------------------------------------
   Una IIFE async orchestra tutto in ordine leggibile. */

(async function main() {
  await esempioAll();
  await esempioAllSettled();
  await esempioTimeout();
  await esempioRetry();
  await esempioPool();
  console.log('--- fine demo concorrenza ---');
})();

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - Promise.all      = tutto-o-niente (fallisce al primo errore).
   - Promise.allSettled = report completo (mai fallisce): ideale per sync massivi.
   - Promise.race     = timeout / "chi arriva primo".
   - retry + backoff  = resilienza a errori transitori di rete.
   - pool di concorrenza = rispetta i rate limit senza perdere parallelismo.
   ============================================================ */
