/* ============================================================
   86 JS ADV Async Promises
   Una Promise e' un oggetto che rappresenta il risultato (futuro)
   di un'operazione asincrona. Puo' trovarsi in tre stati: pending
   (in attesa), fulfilled (risolta con successo) o rejected (fallita).
   In questo file vediamo: new Promise con resolve/reject, i metodi
   then/catch/finally, il chaining (concatenazione) di Promise e
   soprattutto la error propagation lungo la catena. Esempi base ed
   avanzati, con casi reali ispirati a un gestionale ERP.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) CREARE UNA PROMISE: new Promise(executor)
   L'executor riceve due callback: resolve e reject.
   ------------------------------------------------------------ */

// Promise gia' risolta con un valore
const pOk = new Promise((resolve, reject) => {
  resolve(42);
});
pOk.then((v) => console.log('risolta con:', v)); // => risolta con: 42

// Promise rifiutata con un Error
const pErr = new Promise((resolve, reject) => {
  reject(new Error('qualcosa e andato storto'));
});
pErr.catch((e) => console.log('catturato:', e.message)); // => catturato: qualcosa e andato storto

/* ------------------------------------------------------------
   2) ASINCRONIA REALE: resolve dopo un timer
   La Promise resta 'pending' finche' non viene risolta.
   ------------------------------------------------------------ */

function ritardo(ms, valore) {
  // Risolve con 'valore' dopo 'ms' millisecondi
  return new Promise((resolve) => setTimeout(() => resolve(valore), ms));
}

ritardo(50, 'fatto').then((v) => console.log('dopo 50ms:', v)); // => dopo 50ms: fatto

/* ------------------------------------------------------------
   3) SCORCIATOIE: Promise.resolve e Promise.reject
   Creano al volo Promise gia' risolte/rifiutate.
   ------------------------------------------------------------ */

Promise.resolve('badge UP-001').then((b) => console.log('badge:', b)); // => badge: UP-001
Promise.reject(new Error('badge mancante')).catch((e) => console.log('err:', e.message)); // => err: badge mancante

/* ------------------------------------------------------------
   4) then() RICEVE DUE ARGOMENTI: onFulfilled e onRejected
   Ma e' piu' leggibile usare .catch() separato.
   ------------------------------------------------------------ */

Promise.resolve(8)
  .then(
    (v) => console.log('successo a due rami:', v), // => successo a due rami: 8
    (e) => console.log('errore a due rami:', e)
  );

/* ------------------------------------------------------------
   5) finally(): eseguito SEMPRE (sia successo che errore)
   Utile per chiudere uno spinner / loading nel gestionale.
   ------------------------------------------------------------ */

function caricaConSpinner(promise) {
  console.log('loading = true');
  return promise.finally(() => console.log('loading = false'));
}
caricaConSpinner(ritardo(30, 'dati'))
  .then((d) => console.log('ricevuti:', d)); // => ricevuti: dati

/* ------------------------------------------------------------
   6) CHAINING: ogni then ritorna una nuova Promise
   Il valore ritornato passa allo step successivo.
   ------------------------------------------------------------ */

Promise.resolve(2)
  .then((n) => n + 3)        // 5
  .then((n) => n * 10)       // 50
  .then((n) => console.log('catena valore:', n)); // => catena valore: 50

/* ------------------------------------------------------------
   7) CHAINING con ritorno di Promise (flattening automatico)
   Se un then ritorna una Promise, la catena ASPETTA che si risolva.
   ------------------------------------------------------------ */

ritardo(20, 1)
  .then((n) => ritardo(20, n + 1)) // ritorna un'altra Promise -> attesa
  .then((n) => ritardo(20, n + 1))
  .then((n) => console.log('catena async:', n)); // => catena async: 3

/* ------------------------------------------------------------
   8) ERROR PROPAGATION: un errore salta tutti i then
   fino al primo catch della catena.
   ------------------------------------------------------------ */

Promise.resolve('start')
  .then(() => { throw new Error('crash allo step 1'); })
  .then(() => console.log('questo NON viene eseguito'))
  .then(() => console.log('neanche questo'))
  .catch((e) => console.log('propagato fino al catch:', e.message)); // => propagato fino al catch: crash allo step 1

/* ------------------------------------------------------------
   9) RECUPERO DOPO CATCH: la catena continua
   Un catch che non rilancia "guarisce" la catena.
   ------------------------------------------------------------ */

Promise.reject(new Error('rete giu'))
  .catch((e) => {
    console.log('gestito:', e.message); // => gestito: rete giu
    return 'valore di fallback';
  })
  .then((v) => console.log('continua con:', v)); // => continua con: valore di fallback

/* ------------------------------------------------------------
   10) RILANCIARE NEL CATCH: re-throw per propagare oltre
   ------------------------------------------------------------ */

Promise.reject(new Error('errore critico'))
  .catch((e) => {
    console.log('log locale:', e.message);
    throw e; // rilancia: il prossimo catch lo riceve
  })
  .catch((e) => console.log('catch finale:', e.message)); // => catch finale: errore critico

/* ------------------------------------------------------------
   11) CASO ERP: lettura timbratura come operazione async
   Simuliamo una query che ritorna ore lavorate del badge.
   ------------------------------------------------------------ */

function getTimbratura(badge) {
  // Simula una findFirst del DB: risolve o rifiuta
  return new Promise((resolve, reject) => {
    const db = {
      'UP-001': { ingresso: '08:00', uscita: '17:00', oreLavorate: 8 },
      'UP-002': { ingresso: '09:00', uscita: '18:00', oreLavorate: 8 },
    };
    setTimeout(() => {
      const row = db[badge];
      if (row) resolve(row);
      else reject(new Error(`Timbratura non trovata per ${badge}`));
    }, 25);
  });
}

getTimbratura('UP-001')
  .then((t) => `Badge UP-001 ha lavorato ${t.oreLavorate}h`)
  .then((msg) => console.log(msg)) // => Badge UP-001 ha lavorato 8h
  .catch((e) => console.log('errore timbratura:', e.message));

getTimbratura('UP-999')
  .then((t) => console.log(t))
  .catch((e) => console.log('errore timbratura:', e.message)); // => errore timbratura: Timbratura non trovata per UP-999

/* ------------------------------------------------------------
   12) CASO ERP: catena di passi dipendenti
   trova dipendente -> carica turno -> calcola pausa.
   ------------------------------------------------------------ */

function trovaDipendente(badge) {
  return ritardo(15, { badge, nome: 'Mario', turno: 'P4' });
}
function caricaTurno(dip) {
  const turni = { P4: { pausa: 30 }, P2: { pausa: 0 } };
  return ritardo(15, { ...dip, ...turni[dip.turno] });
}

trovaDipendente('UP-001')
  .then(caricaTurno) // si puo' passare la funzione direttamente
  .then((d) => console.log(`${d.nome} turno ${d.turno}, pausa ${d.pausa}min`))
  // => Mario turno P4, pausa 30min
  .catch((e) => console.log('errore:', e.message));

/* ------------------------------------------------------------
   13) PROMISIFICARE una API a callback (pattern classico)
   Trasformiamo una funzione callback-based in Promise-based.
   ------------------------------------------------------------ */

function leggiConfigCb(chiave, callback) {
  // stile Node: callback(err, dato)
  setTimeout(() => {
    if (chiave === 'regolaArrotondamento') callback(null, 5);
    else callback(new Error('chiave inesistente'));
  }, 10);
}

function leggiConfig(chiave) {
  return new Promise((resolve, reject) => {
    leggiConfigCb(chiave, (err, dato) => {
      if (err) reject(err);
      else resolve(dato);
    });
  });
}

leggiConfig('regolaArrotondamento')
  .then((v) => console.log('arrotondamento ogni', v, 'min')); // => arrotondamento ogni 5 min

/* ------------------------------------------------------------
   14) ERRORE ASINCRONO dentro l'executor
   ATTENZIONE: un throw DENTRO un setTimeout NON viene catturato
   dalla Promise. Bisogna chiamare reject() esplicitamente.
   ------------------------------------------------------------ */

function operazioneCorretta() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        throw new Error('errore interno');
      } catch (e) {
        reject(e); // CORRETTO: si propaga alla catena
      }
    }, 10);
  });
}
operazioneCorretta().catch((e) => console.log('gestito async:', e.message)); // => gestito async: errore interno

/* ------------------------------------------------------------
   15) then NON ritorna nulla -> il valore diventa undefined
   Errore comune: dimenticare il return nella catena.
   ------------------------------------------------------------ */

Promise.resolve(10)
  .then((n) => { n * 2; }) // manca il return!
  .then((v) => console.log('senza return:', v)); // => senza return: undefined

Promise.resolve(10)
  .then((n) => n * 2) // con return implicito (arrow senza graffe)
  .then((v) => console.log('con return:', v)); // => con return: 20

/* ------------------------------------------------------------
   16) PATTERN RETRY: riprova N volte prima di arrendersi
   Utile per chiamate di rete instabili nel gestionale.
   ------------------------------------------------------------ */

function conRetry(fnPromise, tentativi) {
  return fnPromise().catch((e) => {
    if (tentativi <= 1) throw e;
    console.log('retry, rimasti', tentativi - 1);
    return conRetry(fnPromise, tentativi - 1);
  });
}

let conta = 0;
function chiamataInstabile() {
  conta += 1;
  return conta < 3
    ? Promise.reject(new Error('timeout'))
    : Promise.resolve('OK al tentativo ' + conta);
}
conRetry(chiamataInstabile, 5).then((v) => console.log(v)); // => OK al tentativo 3

/* ------------------------------------------------------------
   17) PATTERN TIMEOUT con Promise.race
   "Corre" la promise reale contro un timer: vince la prima.
   ------------------------------------------------------------ */

function conTimeout(promise, ms) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout dopo ' + ms + 'ms')), ms)
  );
  return Promise.race([promise, timer]);
}

conTimeout(ritardo(10, 'veloce'), 100)
  .then((v) => console.log('race vinta da:', v)); // => race vinta da: veloce

conTimeout(ritardo(200, 'lento'), 30)
  .catch((e) => console.log('race persa:', e.message)); // => race persa: Timeout dopo 30ms

/* ------------------------------------------------------------
   18) SEQUENZA con reduce: eseguire promise IN SERIE
   Utile per salvare assegnazioni vestiario una dopo l'altra.
   ------------------------------------------------------------ */

const articoli = ['DPI guanti', 'DPI casco', 'tuta'];
function salvaArticolo(nome) {
  return ritardo(10, `salvato: ${nome}`);
}

articoli
  .reduce(
    (catena, art) => catena.then((acc) =>
      salvaArticolo(art).then((res) => [...acc, res])
    ),
    Promise.resolve([])
  )
  .then((risultati) => console.log('in serie:', risultati));
  // => in serie: [ 'salvato: DPI guanti', 'salvato: DPI casco', 'salvato: tuta' ]

/* ------------------------------------------------------------
   19) ROLLBACK con le Promise (compensazione errore)
   Crea il dipendente; se il passo dopo fallisce, lo elimina.
   ------------------------------------------------------------ */

function creaDipendente(nome) {
  return ritardo(10, { id: 7, nome });
}
function eliminaDipendente(id) {
  return ritardo(5, console.log('rollback: eliminato id', id));
}
function assegnaBadge(dip) {
  return Promise.reject(new Error('badge gia in uso')); // simuliamo fallimento
}

creaDipendente('Luigi')
  .then((dip) =>
    assegnaBadge(dip).catch((e) => {
      // compensazione: annulla la creazione e ripropaga
      return eliminaDipendente(dip.id).then(() => { throw e; });
    })
  )
  .catch((e) => console.log('operazione annullata:', e.message)); // => rollback: eliminato id 7 / operazione annullata: badge gia in uso

/* ------------------------------------------------------------
   20) ESEMPIO BROWSER: fetch ritorna una Promise
   // Esempio browser: gira nel browser, non in Node
   ------------------------------------------------------------ */

function caricaDipendentiBrowser() {
  // fetch e' un'API del browser; qui solo come pattern
  return fetch('/api/dipendenti')
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((lista) => lista.map((d) => ({ badge: d.codiceBadge, nome: d.nome })))
    .catch((e) => {
      console.error('errore caricamento:', e.message);
      return []; // fallback: lista vuota
    });
}
void caricaDipendentiBrowser; // riferimento per evitare warning, non eseguito

/* ------------------------------------------------------------
   21) PROMISE come "cache" lazy (memoization di un caricamento)
   La prima chiamata crea la Promise, le successive la riusano.
   ------------------------------------------------------------ */

let cacheReparti = null;
function getReparti() {
  if (!cacheReparti) {
    cacheReparti = ritardo(20, [{ sigla: 'UP' }, { sigla: 'MG' }]);
  }
  return cacheReparti;
}
getReparti().then((r) => console.log('reparti (1a):', r.length)); // => reparti (1a): 2
getReparti().then((r) => console.log('reparti (2a, cache):', r.length)); // => reparti (2a, cache): 2

/* ------------------------------------------------------------
   22) UNHANDLED REJECTION: ricordarsi SEMPRE un catch
   Una Promise rifiutata senza catch genera un warning a runtime.
   ------------------------------------------------------------ */

// SBAGLIATO (genererebbe UnhandledPromiseRejection):
// Promise.reject(new Error('dimenticata'));
// CORRETTO:
Promise.reject(new Error('gestita')).catch((e) => console.log('ok gestita:', e.message)); // => ok gestita: gestita

/* ============================================================
   RIEPILOGO COMANDI
   - new Promise((resolve, reject) => { ... })
   - resolve(valore) / reject(errore)
   - Promise.resolve(v) / Promise.reject(e)
   - .then(onFulfilled[, onRejected])
   - .catch(onRejected)
   - .finally(onSettled)
   - chaining: return valore o return Promise dentro .then
   - error propagation: throw salta i then fino al primo catch
   - re-throw nel catch per propagare oltre
   - Promise.race([...]) per timeout
   - reduce + Promise.resolve([]) per esecuzione in serie
   - promisificazione di API a callback (resolve/reject)
   - pattern: retry, timeout, rollback/compensazione, cache lazy
   - fetch(...).then(res => res.json()) (browser)
   ============================================================ */
