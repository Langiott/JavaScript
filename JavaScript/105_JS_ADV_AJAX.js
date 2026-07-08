/* ============================================================
   105 JS ADV AJAX
   AJAX (Asynchronous JavaScript And XML) significa caricare dati
   dal server SENZA ricaricare la pagina. Vedremo le due API
   principali: XMLHttpRequest (la storica) e fetch (la moderna,
   basata su Promise). Studieremo gli stati della richiesta
   (readyState, status), il parsing JSON, gestione errori, timeout,
   abort, retry e pattern reali ispirati a un gestionale ERP
   (dipendenti, timbrature, badge 'UP-001', turni, reparti).
   La maggior parte degli esempi sono "browser-only": girano nel
   browser, non in Node, quindi sono incapsulati in funzioni.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) XMLHttpRequest: l'API storica
   readyState: 0 UNSENT, 1 OPENED, 2 HEADERS_RECEIVED,
               3 LOADING, 4 DONE
   status: codice HTTP (200 OK, 404 Not Found, 500 Server Error)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function getDipendentiXHR(onSuccess, onError) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/dipendenti', true); // true = asincrono
  xhr.onreadystatechange = function () {
    // readyState 4 = richiesta completata
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        onSuccess(JSON.parse(xhr.responseText));
      } else {
        onError(new Error('HTTP ' + xhr.status));
      }
    }
  };
  xhr.send();
}

// I valori numerici di readyState sono anche costanti statiche
// XMLHttpRequest.DONE === 4 // => true (nel browser)

/* ------------------------------------------------------------
   2) XHR moderno: eventi onload / onerror al posto di readyState
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function getTimbratureXHR(badge, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/api/timbrature?badge=${encodeURIComponent(badge)}`);
  xhr.responseType = 'json'; // parsing automatico: xhr.response è già oggetto
  xhr.onload = () => {
    if (xhr.status === 200) callback(null, xhr.response);
    else callback(new Error('HTTP ' + xhr.status));
  };
  xhr.onerror = () => callback(new Error('Errore di rete'));
  xhr.send();
}

/* ------------------------------------------------------------
   3) XHR POST con header e body JSON
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function creaDipendenteXHR(dip) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/dipendenti');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer TOKEN');
  xhr.onload = () => console.log('Creato', xhr.status);
  xhr.send(JSON.stringify(dip)); // body serializzato
}
// creaDipendenteXHR({ nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001' });

/* ------------------------------------------------------------
   4) fetch: l'API moderna basata su Promise
   fetch ritorna SEMPRE una Promise che si risolve in un Response.
   Attenzione: fetch NON rifiuta sugli errori HTTP (404/500),
   solo su errori di rete. Va controllato response.ok.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function getReparti() {
  return fetch('/api/reparti')
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json(); // anche json() ritorna una Promise
    })
    .then((reparti) => reparti.map((r) => r.sigla ?? 'XX'));
}
// getReparti().then(console.log); // => ['PR', 'MG', 'XX', ...]

/* ------------------------------------------------------------
   5) fetch con async/await (stile moderno consigliato)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function caricaDipendenti() {
  const res = await fetch('/api/dipendenti');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const lista = await res.json();
  // map per trasformare in DTO leggero (pattern ERP)
  return lista.map((d) => ({
    badge: d.codiceBadge,
    nome: `${d.nome} ${d.cognome}`,
    reparto: d.reparto?.sigla ?? 'XX',
  }));
}

/* ------------------------------------------------------------
   6) fetch POST con JSON + Authorization Bearer (da localStorage)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function salvaTimbratura(timbratura) {
  const token = localStorage.getItem('authToken');
  const res = await fetch('/api/timbrature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(timbratura),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message ?? 'Errore salvataggio');
  }
  return res.json();
}
// salvaTimbratura({ badge: 'UP-001', tipo: 'ingresso', ora: '08:00' });

/* ------------------------------------------------------------
   7) Leggere l'oggetto Response: metodi e proprietà
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function ispezionaResponse() {
  const res = await fetch('/api/dipendenti');
  console.log(res.status);     // => 200
  console.log(res.ok);         // => true (status 200-299)
  console.log(res.statusText); // => 'OK'
  console.log(res.headers.get('Content-Type')); // => 'application/json'
  // Il body si legge UNA sola volta. Metodi disponibili:
  // res.json()  -> oggetto/array
  // res.text()  -> stringa
  // res.blob()  -> dati binari
  // res.arrayBuffer() -> buffer
  const dati = await res.json();
  return dati;
}

/* ------------------------------------------------------------
   8) Query string sicura con URLSearchParams
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function urlTimbrature(filtri) {
  const params = new URLSearchParams(filtri);
  return `/api/timbrature?${params.toString()}`;
}
// In Node URLSearchParams esiste: è uno standard.
console.log(urlTimbrature({ badge: 'UP-001', data: '2026-06-30' }));
// => /api/timbrature?badge=UP-001&data=2026-06-30

/* ------------------------------------------------------------
   9) Caricamenti in parallelo con Promise.all
   Pattern ERP: la dashboard fa 8 query insieme.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function caricaDashboard() {
  const [dipendenti, reparti, turni] = await Promise.all([
    fetch('/api/dipendenti').then((r) => r.json()),
    fetch('/api/reparti').then((r) => r.json()),
    fetch('/api/turni').then((r) => r.json()),
  ]);
  return { dipendenti, reparti, turni };
}

/* ------------------------------------------------------------
   10) Caricamenti tolleranti con Promise.allSettled
   Se una chiamata fallisce, le altre proseguono.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function caricaWidget() {
  const risultati = await Promise.allSettled([
    fetch('/api/dipendenti').then((r) => r.json()),
    fetch('/api/vestiario').then((r) => r.json()),
  ]);
  return risultati.map((r) =>
    r.status === 'fulfilled' ? r.value : { errore: r.reason.message }
  );
}

/* ------------------------------------------------------------
   11) Timeout / annullamento richiesta con AbortController
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function fetchConTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Timeout scaduto');
    throw err;
  } finally {
    clearTimeout(id); // pulizia sempre
  }
}

/* ------------------------------------------------------------
   12) Retry con backoff esponenziale (pattern professionale)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function fetchConRetry(url, tentativi = 3) {
  for (let i = 0; i < tentativi; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      if (i === tentativi - 1) throw err; // ultimo tentativo: rilancia
      const attesa = 2 ** i * 200; // 200ms, 400ms, 800ms...
      await new Promise((r) => setTimeout(r, attesa));
    }
  }
}

/* ------------------------------------------------------------
   13) Wrapper API riutilizzabile (higher-order, stile axios)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
function creaClient(baseURL, getToken) {
  async function richiesta(path, opzioni = {}) {
    const res = await fetch(baseURL + path, {
      ...opzioni,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...opzioni.headers,
      },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.status === 204 ? null : res.json();
  }
  return {
    get: (p) => richiesta(p),
    post: (p, body) => richiesta(p, { method: 'POST', body: JSON.stringify(body) }),
    put: (p, body) => richiesta(p, { method: 'PUT', body: JSON.stringify(body) }),
    del: (p) => richiesta(p, { method: 'DELETE' }),
  };
}
// const api = creaClient('/api', () => localStorage.getItem('authToken'));
// const turni = await api.get('/turni');

/* ------------------------------------------------------------
   14) Pattern UI: stati loading / error / data (come React)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function caricaConStati(setState) {
  setState({ loading: true, error: null, data: null });
  try {
    const res = await fetch('/api/dipendenti');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    setState({ loading: false, error: null, data: await res.json() });
  } catch (err) {
    setState({ loading: false, error: err.message, data: null });
  }
}

/* ------------------------------------------------------------
   15) Mock fetch simulato (ESEGUIBILE anche in Node)
   Mostriamo il flusso completo senza un vero server.
   ------------------------------------------------------------ */

function fakeFetch(url) {
  // Simuliamo una risposta asincrona con i dati ERP
  return new Promise((resolve) => {
    setTimeout(() => {
      const corpo = [
        { codiceBadge: 'UP-001', nome: 'Mario', cognome: 'Rossi', reparto: { sigla: 'PR' } },
        { codiceBadge: 'UP-002', nome: 'Lucia', cognome: 'Bianchi', reparto: null },
      ];
      resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(corpo),
      });
    }, 50);
  });
}

async function demoMock() {
  const res = await fakeFetch('/api/dipendenti');
  const lista = await res.json();
  const dto = lista.map((d) => ({
    badge: d.codiceBadge,
    nome: `${d.nome} ${d.cognome}`,
    reparto: d.reparto?.sigla ?? 'XX',
  }));
  console.log(dto);
  // => [ { badge: 'UP-001', nome: 'Mario Rossi', reparto: 'PR' },
  //      { badge: 'UP-002', nome: 'Lucia Bianchi', reparto: 'XX' } ]
}
demoMock();

/* ------------------------------------------------------------
   16) Parsing difensivo del JSON (response.text + try/catch)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function jsonSicuro(url) {
  const res = await fetch(url);
  const testo = await res.text();
  try {
    return JSON.parse(testo);
  } catch {
    throw new Error('Risposta non JSON: ' + testo.slice(0, 80));
  }
}

/* ------------------------------------------------------------
   17) Upload file (FormData) - NON impostare Content-Type a mano
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node
async function uploadBadge(file) {
  const fd = new FormData();
  fd.append('badge', 'UP-001');
  fd.append('foto', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  return res.json(); // il browser imposta il boundary multipart da solo
}

/* ------------------------------------------------------------
   18) Validazione orario timbratura prima dell'invio (regex ERP)
   ------------------------------------------------------------ */

function validaOrario(orario) {
  return /^\d{2}:\d{2}$/.test(orario);
}
console.log(validaOrario('08:30')); // => true
console.log(validaOrario('8:3'));   // => false

/* ============================================================
   RIEPILOGO COMANDI
   - new XMLHttpRequest()  / xhr.open(metodo, url, async)
   - xhr.send(body) / xhr.setRequestHeader() / xhr.responseType
   - xhr.readyState (0..4) / xhr.status / xhr.responseText / xhr.response
   - xhr.onreadystatechange / xhr.onload / xhr.onerror
   - fetch(url, opzioni) -> Promise<Response>
   - Response: .ok .status .statusText .headers.get()
   - Response body: .json() .text() .blob() .arrayBuffer()
   - opzioni fetch: method, headers, body
   - JSON.stringify() / JSON.parse()
   - URLSearchParams / encodeURIComponent()
   - Promise.all() / Promise.allSettled()
   - AbortController / controller.abort() / signal
   - setTimeout / clearTimeout (timeout, retry/backoff)
   - FormData / fd.append()
   - async / await / try / catch / finally
   - optional chaining ?. / nullish coalescing ??
   ============================================================ */
