/* ============================================================
   103 JS ADV WebAPI Fetch
   La Fetch API è l'interfaccia moderna per effettuare richieste HTTP
   (network requests) dal browser e da Node.js (>=18). Restituisce una
   Promise che si risolve in un oggetto Response. In questo file vediamo
   GET/POST, gli headers, il body in JSON, il controllo di response.ok,
   l'error handling robusto e l'uso di async/await, con pattern reali
   ispirati a un gestionale ERP (dipendenti, timbrature, badge).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) BASE: cos'è fetch e cosa ritorna
   ------------------------------------------------------------ */

// fetch() ritorna SEMPRE una Promise<Response>, anche per gli errori HTTP.
// La Promise si rigetta SOLO per errori di rete, non per status 404/500.
// Nota: in Node >=18 fetch è globale; nel browser è sempre disponibile.

function mostraTipo() {
  // typeof fetch === 'function' in ambienti moderni
  console.log(typeof fetch); // => function (in Node 18+ / browser)
}

/* ------------------------------------------------------------
   2) GET con .then() (stile Promise classico)
   ------------------------------------------------------------ */

// GET semplice: fetch -> Response -> .json() (anch'esso una Promise).
function getConThen() {
  fetch('https://api.example.com/dipendenti')
    .then((response) => response.json()) // parse del body JSON
    .then((dati) => console.log(dati))   // dati = array/oggetto
    .catch((err) => console.error('Errore rete:', err.message));
}

/* ------------------------------------------------------------
   3) GET con async/await (stile moderno, preferito)
   ------------------------------------------------------------ */

// async/await rende il codice asincrono leggibile come fosse sincrono.
async function getDipendenti() {
  const response = await fetch('https://api.example.com/dipendenti');
  const dipendenti = await response.json();
  return dipendenti;
}

/* ------------------------------------------------------------
   4) response.ok e controllo dello status
   ------------------------------------------------------------ */

// response.ok è true SOLO se lo status è 200-299.
// fetch NON lancia per 404/500: devi controllare tu response.ok!
async function getConControllo(url) {
  const response = await fetch(url);
  console.log(response.ok);     // => true / false
  console.log(response.status); // => 200, 404, 500, ...

  if (!response.ok) {
    // Lancio un errore per gestirlo a monte (throw -> catch)
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/* ------------------------------------------------------------
   5) Le proprietà dell'oggetto Response
   ------------------------------------------------------------ */

async function ispezionaResponse(url) {
  const r = await fetch(url);
  console.log(r.status);     // codice numerico, es => 200
  console.log(r.statusText); // testo, es => "OK"
  console.log(r.ok);         // boolean
  console.log(r.url);        // URL finale (dopo redirect)
  console.log(r.redirected); // boolean
  console.log(r.type);       // 'basic' | 'cors' | 'opaque'...
  console.log(r.headers.get('content-type')); // => application/json
}

/* ------------------------------------------------------------
   6) Metodi per leggere il body (consumabili UNA sola volta)
   ------------------------------------------------------------ */

// Il body di una Response è uno stream: puoi leggerlo UNA volta sola.
// Metodi: .json(), .text(), .blob(), .arrayBuffer(), .formData()
async function leggiBody(url) {
  const r = await fetch(url);
  const testo = await r.text(); // utile per debug o risposte non-JSON
  console.log(testo);
  // ATTENZIONE: dopo .text() non puoi chiamare .json() sullo stesso r!
  // Per riusarlo: const r2 = r.clone(); prima di consumarlo.
}

// clone() per leggere il body due volte (es. log + parse)
async function leggiDueVolte(url) {
  const r = await fetch(url);
  const copia = r.clone();
  const testoGrezzo = await copia.text();
  const json = await r.json();
  console.log(testoGrezzo.length, json);
}

/* ------------------------------------------------------------
   7) POST con body JSON (creazione risorsa)
   ------------------------------------------------------------ */

// Per POST: method, headers (Content-Type) e body come stringa JSON.
async function creaDipendente(dip) {
  const response = await fetch('https://api.example.com/dipendenti', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // dice al server: body = JSON
      Accept: 'application/json',
    },
    body: JSON.stringify(dip), // SEMPRE stringify: il body è testo
  });

  if (!response.ok) {
    throw new Error(`Creazione fallita: HTTP ${response.status}`);
  }
  return response.json();
}

// Esempio d'uso (spunto ERP: badge tipo 'UP-001')
async function esempioCrea() {
  const nuovo = {
    nome: 'Mario',
    cognome: 'Rossi',
    codiceBadge: 'UP-001',
    reparto: 'PR',
  };
  const creato = await creaDipendente(nuovo);
  console.log(`Creato ${creato.nome} ${creato.cognome}`);
}

/* ------------------------------------------------------------
   8) Headers: oggetto Headers e Authorization Bearer
   ------------------------------------------------------------ */

// Gli headers possono essere un oggetto literal o un'istanza Headers.
function costruisciHeaders(token) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`); // auth pattern ERP
  console.log(headers.has('Authorization')); // => true
  console.log(headers.get('content-type'));   // => application/json (case-insensitive)
  return headers;
}

// Pattern reale ERP: token preso da uno "store" e iniettato in ogni richiesta.
async function fetchAutenticato(url, token, opzioni = {}) {
  const response = await fetch(url, {
    ...opzioni,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opzioni.headers || {}), // merge: gli header passati hanno priorità
    },
  });
  return response;
}

/* ------------------------------------------------------------
   9) PUT / PATCH / DELETE (aggiornamento e cancellazione)
   ------------------------------------------------------------ */

// PUT: sostituisce l'intera risorsa
async function aggiornaDipendente(id, dati) {
  const r = await fetch(`https://api.example.com/dipendenti/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  });
  return r.json();
}

// PATCH: aggiorna solo alcuni campi (es. solo il reparto)
async function patchReparto(id, reparto) {
  const r = await fetch(`https://api.example.com/dipendenti/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reparto }),
  });
  return r.json();
}

// DELETE: spesso ritorna 204 No Content (body vuoto, niente .json()!)
async function eliminaDipendente(id) {
  const r = await fetch(`https://api.example.com/dipendenti/${id}`, {
    method: 'DELETE',
  });
  if (r.status === 204) return true; // nessun body da leggere
  return r.json();
}

/* ------------------------------------------------------------
   10) Query string e URL params (GET con filtri)
   ------------------------------------------------------------ */

// URLSearchParams costruisce la query string in modo sicuro (encoding).
function buildUrl(base, filtri) {
  const params = new URLSearchParams(filtri);
  return `${base}?${params.toString()}`;
}

function esempioQuery() {
  const url = buildUrl('https://api.example.com/timbrature', {
    dataInizio: '2026-06-01',
    dataFine: '2026-06-30',
    reparto: 'PR',
  });
  console.log(url);
  // => https://api.example.com/timbrature?dataInizio=2026-06-01&dataFine=2026-06-30&reparto=PR
}

/* ------------------------------------------------------------
   11) Error handling robusto (rete + HTTP + parsing)
   ------------------------------------------------------------ */

// Wrapper completo: distingue errore di rete, errore HTTP e body errore.
async function apiRequest(url, opzioni = {}) {
  let response;
  try {
    response = await fetch(url, opzioni);
  } catch (err) {
    // Errore di RETE (offline, DNS, CORS bloccato): fetch rigetta qui
    throw new Error(`Rete non raggiungibile: ${err.message}`);
  }

  if (!response.ok) {
    // Provo a leggere un messaggio di errore dal body JSON del server
    let dettaglio = '';
    try {
      const corpo = await response.json();
      dettaglio = corpo.message || corpo.error || '';
    } catch {
      dettaglio = await response.text().catch(() => '');
    }
    throw new Error(`HTTP ${response.status}: ${dettaglio}`);
  }

  // 204 / body vuoto: niente parse
  if (response.status === 204) return null;
  return response.json();
}

/* ------------------------------------------------------------
   12) Timeout con AbortController
   ------------------------------------------------------------ */

// fetch non ha timeout nativo: si usa AbortController + setTimeout.
async function fetchConTimeout(url, ms = 5000, opzioni = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { ...opzioni, signal: controller.signal });
    return await r.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Timeout dopo ${ms}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer); // pulizia SEMPRE, anche in caso di errore
  }
}

/* ------------------------------------------------------------
   13) Richieste parallele con Promise.all
   ------------------------------------------------------------ */

// Pattern ERP: dashboard che carica più risorse insieme (8 query parallele).
async function caricaDashboard() {
  const [dipendenti, reparti, turni] = await Promise.all([
    apiRequest('https://api.example.com/dipendenti'),
    apiRequest('https://api.example.com/reparti'),
    apiRequest('https://api.example.com/turni'),
  ]);
  return { dipendenti, reparti, turni };
}

// allSettled: non fallisce se una sola richiesta va in errore
async function caricaTollerante(urls) {
  const risultati = await Promise.allSettled(urls.map((u) => apiRequest(u)));
  const ok = risultati.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const ko = risultati.filter((r) => r.status === 'rejected');
  console.log(`OK: ${ok.length}, KO: ${ko.length}`);
  return ok;
}

/* ------------------------------------------------------------
   14) Retry con backoff (resilienza)
   ------------------------------------------------------------ */

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Riprova la richiesta con attesa crescente (utile su 503/timeout temporanei).
async function fetchConRetry(url, tentativi = 3, opzioni = {}) {
  for (let i = 0; i < tentativi; i++) {
    try {
      return await apiRequest(url, opzioni);
    } catch (err) {
      const ultimo = i === tentativi - 1;
      if (ultimo) throw err;
      const attesa = 2 ** i * 500; // 500ms, 1000ms, 2000ms (backoff esponenziale)
      console.warn(`Tentativo ${i + 1} fallito, riprovo tra ${attesa}ms`);
      await sleep(attesa);
    }
  }
}

/* ------------------------------------------------------------
   15) Trasformazione della risposta (map a DTO) — spunto ERP
   ------------------------------------------------------------ */

// Pattern ERP: la API ritorna record grezzi -> li mappo in DTO puliti.
async function getArticoliDTO() {
  const grezzi = await apiRequest('https://api.example.com/vestiario');
  // map() per normalizzare i campi e dare default sicuri
  return grezzi.map((a) => ({
    codice: a.articolo_poly,
    descrizione: a.descrizione,
    taglia: a.taglia ?? 'U',
    sottoScorta: (a.quantita ?? 0) < (a.scortaMinima ?? 0), // boolean
  }));
}

/* ------------------------------------------------------------
   16) POST di una timbratura (spunto ERP naive-UTC)
   ------------------------------------------------------------ */

// Pattern ERP: l'ora di Roma viene letta e salvata come naive-UTC.
function nowRomeNaiveUTC() {
  const parts = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  // Salvo i numeri di Roma "dentro" un timestamp UTC (naive-UTC)
  return new Date(Date.UTC(
    +get('year'), +get('month') - 1, +get('day'),
    +get('hour'), +get('minute'), +get('second'),
  )).toISOString();
}

async function timbra(codiceBadge, tipo) {
  return apiRequest('https://api.example.com/timbrature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codiceBadge,            // es. 'UP-001'
      tipo,                   // 'ingresso' | 'uscita'
      orario: nowRomeNaiveUTC(),
    }),
  });
}

/* ------------------------------------------------------------
   17) Esempio browser: fetch da evento (NON gira in Node)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
// Mostra loading/errore in un componente con stato.
function setupBottoneSalva() {
  // const btn = document.querySelector('#salva');
  // btn.addEventListener('click', async () => {
  //   btn.disabled = true;
  //   try {
  //     const r = await fetch('/api/dipendenti', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ nome: 'Anna', codiceBadge: 'UP-002' }),
  //     });
  //     if (!r.ok) throw new Error('Salvataggio fallito');
  //     alert('Salvato!');
  //   } catch (e) {
  //     alert(e.message);
  //   } finally {
  //     btn.disabled = false;
  //   }
  // });
}

/* ------------------------------------------------------------
   18) Upload di file con FormData (multipart) — browser
   ------------------------------------------------------------ */

// Esempio browser: con FormData NON impostare Content-Type a mano
// (il browser aggiunge il boundary multipart automaticamente).
function uploadFile(file, token) {
  const fd = new FormData();
  fd.append('documento', file);
  fd.append('codiceBadge', 'UP-001');
  return fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // niente Content-Type!
    body: fd,
  });
}

/* ------------------------------------------------------------
   19) credentials e mode (cookie e CORS)
   ------------------------------------------------------------ */

// credentials: 'include' invia i cookie anche cross-origin (sessioni).
// mode: 'cors' (default cross-origin), 'same-origin', 'no-cors'.
async function fetchConCookie(url) {
  return fetch(url, {
    credentials: 'include', // manda i cookie di sessione
    mode: 'cors',
  });
}

/* ------------------------------------------------------------
   ESEMPIO ESEGUIBILE (demo locale senza rete)
   ------------------------------------------------------------ */

(function demo() {
  mostraTipo();
  esempioQuery();
  console.log(nowRomeNaiveUTC()); // => 2026-06-30T..:..:..Z (naive-UTC Roma)
  console.log(buildUrl('https://x/api', { q: 'a b', p: 2 }));
  // => https://x/api?q=a+b&p=2
})();

/* ============================================================
   RIEPILOGO COMANDI
   - fetch(url, options) -> Promise<Response>
   - response.ok / .status / .statusText / .url / .redirected / .type
   - response.json() / .text() / .blob() / .arrayBuffer() / .formData()
   - response.clone() (leggere il body due volte)
   - response.headers.get/set/append/has
   - options: method, headers, body, signal, credentials, mode
   - JSON.stringify(body) / JSON.parse
   - new Headers() ; Authorization: `Bearer ${token}`
   - new URLSearchParams(obj).toString()
   - new FormData() ; fd.append()
   - AbortController + controller.abort() + signal (timeout)
   - try / catch / finally per error handling
   - throw new Error(`HTTP ${status}`) quando !response.ok
   - Promise.all([...]) / Promise.allSettled([...])
   - retry con backoff (2 ** i * 500)
   - async / await
   ============================================================ */
