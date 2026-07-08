/* ============================================================
   78 JS Timers
   I timer permettono di eseguire codice in modo differito nel tempo:
   setTimeout esegue una callback UNA volta dopo N millisecondi,
   setInterval la ripete ogni N millisecondi finche' non viene fermata.
   clearTimeout e clearInterval annullano i timer usando il loro id.
   Su queste primitive si costruiscono pattern fondamentali come il
   debounce (rimanda fino a quando l'utente smette) e il throttle
   (limita la frequenza). Tutto e' asincrono ma single-thread.
   ============================================================ */

// ------------------------------------------------------------
// 1) setTimeout: esecuzione differita una sola volta
// ------------------------------------------------------------

// La callback gira DOPO ~1000ms; il codice continua subito (non blocca)
setTimeout(() => {
  console.log("Eseguito dopo 1 secondo");
}, 1000);
console.log("Questo viene stampato PRIMA");
// => Questo viene stampato PRIMA
// => Eseguito dopo 1 secondo   (dopo ~1s)

// Delay 0 NON significa "subito": entra comunque in coda dopo il codice sincrono
setTimeout(() => console.log("timeout 0"), 0);
console.log("sincrono prima del timeout 0");
// => sincrono prima del timeout 0
// => timeout 0

// ------------------------------------------------------------
// 2) Passare argomenti alla callback
// ------------------------------------------------------------

// Gli argomenti extra di setTimeout vengono passati alla callback
function salutaDipendente(nome, badge) {
  console.log(`Benvenuto ${nome} (${badge})`);
}
setTimeout(salutaDipendente, 500, "Mario", "UP-001");
// => Benvenuto Mario (UP-001)

// ------------------------------------------------------------
// 3) clearTimeout: annullare un timer prima che scatti
// ------------------------------------------------------------

// setTimeout ritorna un id (in Node un oggetto Timeout) usabile per annullare
const idAnnullabile = setTimeout(() => {
  console.log("NON dovrei mai apparire");
}, 1000);
clearTimeout(idAnnullabile); // annullato prima dello scadere
console.log("timeout annullato");
// => timeout annullato

// ------------------------------------------------------------
// 4) setInterval: ripetizione periodica
// ------------------------------------------------------------

// Conta da 1 a 3 una volta al secondo, poi si ferma da solo
let contatore = 0;
const idIntervallo = setInterval(() => {
  contatore++;
  console.log(`tick ${contatore}`);
  if (contatore >= 3) {
    clearInterval(idIntervallo); // IMPORTANTE: fermare l'intervallo
    console.log("intervallo fermato");
  }
}, 1000);
// => tick 1
// => tick 2
// => tick 3
// => intervallo fermato

// ------------------------------------------------------------
// 5) setInterval ricostruito con setTimeout ricorsivo
// ------------------------------------------------------------

// Vantaggio: il delay riparte solo a lavoro finito (utile con codice lento)
function pollingRicorsivo(volte) {
  let n = 0;
  function step() {
    n++;
    console.log(`polling ${n}`);
    if (n < volte) setTimeout(step, 1000);
  }
  setTimeout(step, 1000);
}
// pollingRicorsivo(3); // decommenta per vederlo in azione

// ------------------------------------------------------------
// 6) this dentro i timer: usa le arrow function
// ------------------------------------------------------------

// Le arrow function ereditano il this lessicale (closure su this)
const orologio = {
  etichetta: "OROLOGIO",
  avvia() {
    setTimeout(() => {
      // arrow: this === orologio
      console.log(this.etichetta);
    }, 100);
  },
};
orologio.avvia();
// => OROLOGIO

// ------------------------------------------------------------
// 7) Closure e ciclo: il classico errore var vs let
// ------------------------------------------------------------

// Con let ogni iterazione ha il suo binding: stampa 0,1,2 corretti
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(`let i = ${i}`), 10 * i);
}
// => let i = 0
// => let i = 1
// => let i = 2

// ------------------------------------------------------------
// 8) Promisify: trasformare setTimeout in una Promise (sleep/delay)
// ------------------------------------------------------------

// delay restituisce una Promise che si risolve dopo ms: usabile con await
function delay(ms, valore) {
  return new Promise((resolve) => setTimeout(() => resolve(valore), ms));
}

async function esempioSleep() {
  console.log("inizio");
  await delay(300);
  console.log("dopo 300ms");
  const v = await delay(100, "pronto");
  console.log(v); // => pronto
}
esempioSleep();
// => inizio
// => dopo 300ms
// => pronto

// ------------------------------------------------------------
// 9) Timeout di una Promise con Promise.race
// ------------------------------------------------------------

// Se la query supera il limite, rigetta con un errore di timeout
function conTimeout(promise, ms) {
  const scadenza = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout dopo ${ms}ms`)), ms)
  );
  return Promise.race([promise, scadenza]);
}

async function caricaTimbrature() {
  // Simula una query lenta al DB delle timbrature
  const query = delay(500, [{ badge: "UP-001", ore: 8 }]);
  try {
    const dati = await conTimeout(query, 1000);
    console.log("timbrature:", dati.length); // => timbrature: 1
  } catch (e) {
    console.log("errore:", e.message);
  }
}
caricaTimbrature();

// ------------------------------------------------------------
// 10) DEBOUNCE: esegui solo dopo una pausa di inattivita'
// ------------------------------------------------------------

// Ogni chiamata azzera il timer precedente: parte solo quando ci si ferma.
// Tipico per la ricerca dipendenti mentre l'utente digita nel campo badge.
function debounce(fn, attesa) {
  let id;
  return function (...args) {
    clearTimeout(id);
    id = setTimeout(() => fn.apply(this, args), attesa);
  };
}

const cercaDipendente = debounce((testo) => {
  console.log(`Query al DB per: "${testo}"`);
}, 300);

// Simulazione di battitura veloce: solo l'ultima chiamata sopravvive
cercaDipendente("M");
cercaDipendente("Ma");
cercaDipendente("Mar");
cercaDipendente("Mario");
// => Query al DB per: "Mario"   (una sola volta, dopo 300ms)

// ------------------------------------------------------------
// 11) DEBOUNCE con opzione leading (esegui subito, poi ignora)
// ------------------------------------------------------------

// leading=true esegue alla prima chiamata e blocca le successive ravvicinate
function debounceLeading(fn, attesa) {
  let id = null;
  return function (...args) {
    const eseguiOra = id === null;
    clearTimeout(id);
    id = setTimeout(() => {
      id = null;
    }, attesa);
    if (eseguiOra) fn.apply(this, args);
  };
}

const salvaBozza = debounceLeading(() => console.log("bozza salvata"), 200);
salvaBozza(); // => bozza salvata   (subito)
salvaBozza(); // ignorata (troppo ravvicinata)

// ------------------------------------------------------------
// 12) THROTTLE: al massimo una esecuzione ogni N ms
// ------------------------------------------------------------

// A differenza del debounce, garantisce esecuzioni regolari durante eventi
// continui (es. aggiornare un contatore badge mentre si scrolla una lista).
function throttle(fn, intervallo) {
  let ultimo = 0;
  return function (...args) {
    const ora = Date.now();
    if (ora - ultimo >= intervallo) {
      ultimo = ora;
      fn.apply(this, args);
    }
  };
}

const aggiornaContatore = throttle((n) => {
  console.log(`Dipendenti visibili: ${n}`);
}, 1000);

aggiornaContatore(10); // eseguito
aggiornaContatore(11); // ignorato (entro 1s)
aggiornaContatore(12); // ignorato (entro 1s)
// => Dipendenti visibili: 10

// ------------------------------------------------------------
// 13) THROTTLE con trailing call (esegue anche l'ultima)
// ------------------------------------------------------------

// Garantisce che l'ultimo valore non vada perso al termine della raffica
function throttleTrailing(fn, intervallo) {
  let ultimo = 0;
  let timer = null;
  return function (...args) {
    const ora = Date.now();
    const rimanente = intervallo - (ora - ultimo);
    if (rimanente <= 0) {
      ultimo = ora;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        ultimo = Date.now();
        fn.apply(this, args);
      }, rimanente);
    }
  };
}
// uso analogo a throttle ma cattura anche l'ultimo evento della sequenza

// ------------------------------------------------------------
// 14) Esempio ERP: polling stato turni con stop condizionato
// ------------------------------------------------------------

// Controlla periodicamente se ci sono timbrature aperte, poi smette
function controllaTimbratureAperte(maxControlli = 3) {
  let controlli = 0;
  const id = setInterval(() => {
    controlli++;
    // simulazione: nessuna aperta al terzo giro
    const aperte = controlli < 3 ? 1 : 0;
    console.log(`controllo ${controlli}: timbrature aperte = ${aperte}`);
    if (aperte === 0 || controlli >= maxControlli) {
      clearInterval(id);
      console.log("polling turni terminato");
    }
  }, 800);
  return id;
}
// controllaTimbratureAperte(); // decommenta per eseguire

// ------------------------------------------------------------
// 15) Esempio ERP: timestamp naive-UTC ritardato (ora di Roma)
// ------------------------------------------------------------

// La timbratura live deve usare l'ora di Roma salvata come UTC (mai new Date()).
function nowRomeNaiveUTC() {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

// Salva la timbratura solo dopo conferma differita (debounce sul doppio click)
const salvaTimbratura = debounce((badge) => {
  console.log(`Timbratura ${badge} @ ${nowRomeNaiveUTC()}`);
}, 250);
salvaTimbratura("UP-001");
salvaTimbratura("UP-001"); // il doppio scatto ravvicinato salva una sola volta
// => Timbratura UP-001 @ YYYY-MM-DD HH:MM

// ------------------------------------------------------------
// 16) Esempio browser: gira nel browser, non in Node
// ------------------------------------------------------------

// Debounce su input di ricerca e cancellazione timer su unmount
function setupRicerca() {
  // Esempio browser: gira nel browser, non in Node
  const input = document.getElementById("cerca");
  const handler = debounce((e) => {
    console.log("ricerca:", e.target.value);
  }, 300);
  input.addEventListener("input", handler);
}

// requestAnimationFrame: alternativa ai timer per animazioni fluide (browser)
function animaBarra() {
  // Esempio browser: gira nel browser, non in Node
  let larghezza = 0;
  function frame() {
    larghezza += 1;
    if (larghezza < 100) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------
// 17) unref / ref (solo Node): non tenere vivo il processo
// ------------------------------------------------------------

// Con unref() il timer non impedisce a Node di terminare se e' l'unica cosa attiva
const idBg = setTimeout(() => console.log("manutenzione"), 60000);
if (typeof idBg.unref === "function") idBg.unref();

/* ============================================================
   RIEPILOGO COMANDI
   - setTimeout(fn, ms, ...args)   esegue fn una volta dopo ms
   - clearTimeout(id)              annulla un setTimeout
   - setInterval(fn, ms, ...args)  ripete fn ogni ms
   - clearInterval(id)             ferma un setInterval
   - setTimeout(fn, 0)             rimanda dopo il codice sincrono
   - setTimeout ricorsivo          intervallo "sicuro" che attende il lavoro
   - new Promise + setTimeout      delay/sleep awaitable
   - Promise.race([p, timeout])    timeout di una Promise
   - debounce(fn, ms)              esegue dopo la pausa di inattivita'
   - throttle(fn, ms)              al massimo una esecuzione ogni ms
   - leading / trailing            varianti di debounce/throttle
   - requestAnimationFrame(fn)     animazioni fluide (browser)
   - timeoutId.unref()/ref()       gestione lifecycle processo (Node)
   - this + arrow function         closure sul this lessicale nei timer
   ============================================================ */
