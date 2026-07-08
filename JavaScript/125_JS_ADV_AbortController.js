/* ============================================================
   125 JS ADV AbortController
   Annullare operazioni asincrone: AbortController e AbortSignal.
   Caso reale: il gestionale avvia una sincronizzazione lunga verso
   un server; l'utente clicca "Annulla", o scatta un timeout, o parte
   una nuova richiesta che rende inutile la precedente. Dobbiamo poter
   FERMARE l'operazione in modo pulito, senza sprecare risorse.
   Eseguibile con: node 125_JS_ADV_AbortController.js
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. L'IDEA: controller (telecomando) + signal (ricevitore)
   ------------------------------------------------------------
   AbortController ha:
     - .signal  -> lo passi all'operazione asincrona
     - .abort() -> premuto, il signal diventa "aborted" e avvisa tutti
   E' lo stesso meccanismo che usa fetch() nel browser e in Node. */

const controller = new AbortController();
const signal = controller.signal;

console.log('Abortito all inizio?', signal.aborted); // => false
signal.addEventListener('abort', () => {
  console.log('  [evento] operazione annullata, motivo:', signal.reason);
});
controller.abort('richiesta dall utente');
console.log('Abortito ora?', signal.aborted);        // => true

/* ------------------------------------------------------------
   2. UN'OPERAZIONE ASINCRONA CHE RISPETTA IL SIGNAL
   ------------------------------------------------------------
   La chiave: l'operazione deve "ascoltare" il signal e interrompersi.
   Creiamo una sleep annullabile: se abortita, il reject e' immediato. */

function sleepAnnullabile(ms, signal) {
  return new Promise((resolve, reject) => {
    // Se il signal e' GIA' abortito, fallisci subito.
    if (signal?.aborted) {
      return reject(new DOMException('Annullato prima di iniziare', 'AbortError'));
    }
    const timer = setTimeout(resolve, ms);

    // Quando arriva l'abort: ferma il timer e rifiuta la promise.
    signal?.addEventListener('abort', () => {
      clearTimeout(timer); // libera la risorsa!
      reject(new DOMException('Operazione annullata', 'AbortError'));
    }, { once: true });
  });
}

/* ------------------------------------------------------------
   3. ANNULLAMENTO MANUALE (es. bottone "Annulla")
   ------------------------------------------------------------ */

async function demoAnnullamentoManuale() {
  const c = new AbortController();

  // Simuliamo il click su "Annulla" dopo 30ms.
  setTimeout(() => c.abort('utente ha annullato'), 30);

  try {
    console.log('\n[manuale] avvio operazione da 200ms...');
    await sleepAnnullabile(200, c.signal);
    console.log('[manuale] completata'); // non arriviamo qui
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('[manuale] fermata correttamente:', err.message);
    } else {
      throw err;
    }
  }
}

/* ------------------------------------------------------------
   4. TIMEOUT AUTOMATICO con AbortSignal.timeout()
   ------------------------------------------------------------
   Node/browser moderni offrono una scorciatoia: un signal che si
   auto-aborta dopo N ms. Perfetto per "non aspettare oltre X". */

async function demoTimeout() {
  try {
    console.log('\n[timeout] operazione da 500ms con limite di 50ms...');
    await sleepAnnullabile(500, AbortSignal.timeout(50));
    console.log('[timeout] completata');
  } catch (err) {
    console.log('[timeout] scaduta:', err.name); // => TimeoutError (o AbortError)
  }
}

/* ------------------------------------------------------------
   5. COMBINARE PIU' SIGNAL con AbortSignal.any()
   ------------------------------------------------------------
   Vuoi annullare se: l'utente clicca Annulla OPPURE scatta il timeout.
   any() crea un signal che si aborta appena UNO dei due si aborta. */

async function demoCombinato() {
  const utente = new AbortController();
  const timeout = AbortSignal.timeout(100);
  const combinato = AbortSignal.any([utente.signal, timeout]);

  // Qui vince il timeout (100ms) perche' non clicchiamo Annulla.
  try {
    console.log('\n[combinato] annulla se utente O timeout(100ms)...');
    await sleepAnnullabile(300, combinato);
  } catch (err) {
    console.log('[combinato] interrotta da:', err.name);
  }
}

/* ------------------------------------------------------------
   6. CASO REALE: nuova richiesta annulla la precedente
   ------------------------------------------------------------
   Pattern tipico nelle ricerche "mentre digiti": ogni nuova ricerca
   annulla quella ancora in corso, cosi' non arrivano risultati vecchi. */

function creaRicercatore() {
  let controllerCorrente = null;

  return async function cerca(termine) {
    // Annulla la ricerca precedente, se c'e'.
    controllerCorrente?.abort('nuova ricerca avviata');
    controllerCorrente = new AbortController();

    try {
      await sleepAnnullabile(80, controllerCorrente.signal); // simula la query
      return `risultati per "${termine}"`;
    } catch (err) {
      if (err.name === 'AbortError') return `(ricerca "${termine}" annullata)`;
      throw err;
    }
  };
}

async function demoRicerca() {
  console.log('\n[ricerca] l utente digita in fretta: "M", "Ma", "Mario"');
  const cerca = creaRicercatore();

  // Lanciamo 3 ricerche quasi insieme: solo l'ultima deve "sopravvivere".
  const p1 = cerca('M');
  const p2 = cerca('Ma');
  const p3 = cerca('Mario');

  console.log(' ', await p1); // annullata da p2
  console.log(' ', await p2); // annullata da p3
  console.log(' ', await p3); // completata
}

/* ------------------------------------------------------------
   7. NOTA su fetch: stesso identico signal
   ------------------------------------------------------------ */

console.log('\nCon fetch e uguale:');
console.log('  fetch(url, { signal }) -> controller.abort() interrompe la richiesta di rete.');

/* ------------------------------------------------------------
   8. ORCHESTRAZIONE
   ------------------------------------------------------------ */

async function main() {
  await demoAnnullamentoManuale();
  await demoTimeout();
  await demoCombinato();
  await demoRicerca();
  console.log('\n--- fine demo AbortController ---');
}

main().catch((err) => {
  console.error('Errore:', err);
  process.exit(1);
});

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - AbortController = telecomando; .signal = ricevitore da passare in giro.
   - L'operazione deve ASCOLTARE il signal e interrompersi (+ pulire risorse).
   - AbortError e' l'errore convenzionale dell'annullamento (controlla err.name).
   - AbortSignal.timeout(ms) = signal che si auto-aborta (limite di tempo).
   - AbortSignal.any([...]) = si aborta se UNO qualsiasi si aborta.
   - Pattern chiave: una nuova richiesta annulla la precedente (search-as-you-type).
   - Stesso meccanismo per fetch: fetch(url, { signal }).
   ============================================================ */
