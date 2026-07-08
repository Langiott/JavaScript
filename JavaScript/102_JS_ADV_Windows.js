/* ============================================================
   102 JS ADV Windows
   Window & storage: open, postMessage, localStorage/sessionStorage, cookies.
   Questo file raccoglie le API del browser per gestire finestre, comunicazione
   tra finestre/origini (cross-origin) e persistenza dei dati lato client.
   Vedremo window.open / popup, window.postMessage per messaggi sicuri tra
   contesti, lo Web Storage (localStorage e sessionStorage) e i cookies.
   Esempi ispirati a un gestionale ERP (badge 'UP-001', timbrature, turni).
   ============================================================ */

// NOTA: gran parte di queste API esistono SOLO nel browser (oggetto window,
// document, localStorage). In Node.js non esistono: gli esempi browser sono
// racchiusi in funzioni o commentati, cosi' il file resta importabile.

/* ------------------------------------------------------------
   1) window: l'oggetto globale del browser
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
function infoWindow() {
  // window e' il global object: le var globali diventano sue proprieta'.
  console.log(window.location.href);   // URL corrente
  console.log(window.innerWidth);      // larghezza viewport in px
  console.log(window.navigator.language); // es. 'it-IT'
  console.log(window.screen.width);    // risoluzione schermo
}

/* ------------------------------------------------------------
   2) window.open: aprire una nuova finestra/tab o popup
   ------------------------------------------------------------ */

// Esempio browser: apre una nuova tab. Ritorna un riferimento Window (o null).
function apriScheda(url) {
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  // 'noopener' impedisce alla pagina aperta di accedere a window.opener (sicurezza).
  return w;
}

// Esempio browser: popup con dimensioni e posizione (features stringa).
function apriPopupBadge(badge) {
  const features = 'width=420,height=300,left=200,top=120,resizable=yes';
  const w = window.open('/badge/' + badge, 'popupBadge', features);
  if (!w) {
    console.warn('Popup bloccato dal browser'); // i popup non da click vengono bloccati
  }
  return w;
}

// Esempio browser: chiudere una finestra aperta da noi.
function chiudiScheda(w) {
  if (w && !w.closed) w.close(); // close() funziona solo su finestre aperte via script
}

/* ------------------------------------------------------------
   3) window.postMessage: comunicazione sicura tra finestre/iframe
   ------------------------------------------------------------ */

// Esempio browser: invio di un messaggio a una finestra figlia.
// SEMPRE specificare il targetOrigin (mai '*' con dati sensibili).
function inviaMessaggio(win, payload) {
  win.postMessage(payload, 'https://erp.polyuretech.net');
}

// Esempio browser: ricezione. Validare SEMPRE event.origin prima di fidarsi.
function ascoltaMessaggi() {
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://erp.polyuretech.net') return; // anti-spoofing
    const { tipo, dati } = event.data; // i dati sono strutturati (structured clone)
    if (tipo === 'TIMBRATURA_OK') {
      console.log('Timbratura confermata per badge', dati.badge);
    }
  });
}

// Esempio browser: pattern request/response tra finestra padre e popup ERP.
function richiediDipendente(popup, badge) {
  const channel = new MessageChannel(); // canale dedicato bidirezionale
  channel.port1.onmessage = (e) => console.log('Risposta:', e.data);
  popup.postMessage({ tipo: 'GET_DIP', badge }, 'https://erp.polyuretech.net', [channel.port2]);
}

/* ------------------------------------------------------------
   4) localStorage: persistenza permanente (resta dopo chiusura)
   ------------------------------------------------------------ */

// Esempio browser: localStorage memorizza SOLO stringhe (chiave/valore).
function salvaToken(token) {
  localStorage.setItem('authToken', token);     // scrive
  return localStorage.getItem('authToken');     // legge => token
}

// Esempio browser: oggetti vanno serializzati con JSON.
function salvaImpostazioni(imp) {
  localStorage.setItem('impostazioni', JSON.stringify(imp));
}
function leggiImpostazioni() {
  const raw = localStorage.getItem('impostazioni');
  return raw ? JSON.parse(raw) : null; // attenzione: getItem ritorna null se assente
}

// Esempio browser: rimozione e pulizia totale.
function logout() {
  localStorage.removeItem('authToken'); // rimuove una chiave
  // localStorage.clear();              // rimuove TUTTO (anche di altre feature)
}

// Esempio browser: iterare le chiavi salvate.
function elencaChiavi() {
  for (let i = 0; i < localStorage.length; i++) {
    console.log(localStorage.key(i));
  }
}

/* ------------------------------------------------------------
   5) sessionStorage: come localStorage ma vive solo nella tab
   ------------------------------------------------------------ */

// Esempio browser: sessionStorage si svuota alla chiusura della tab,
// e non e' condiviso tra tab diverse (a differenza di localStorage).
function bozzaTimbratura(badge, ora) {
  sessionStorage.setItem('bozza', JSON.stringify({ badge, ora }));
}
function recuperaBozza() {
  return JSON.parse(sessionStorage.getItem('bozza') || 'null');
}

/* ------------------------------------------------------------
   6) Evento 'storage': sincronizzare piu' tab aperte
   ------------------------------------------------------------ */

// Esempio browser: l'evento 'storage' scatta nelle ALTRE tab quando una tab
// modifica localStorage. Utile per fare logout globale su tutte le schede ERP.
function sincronizzaLogout() {
  window.addEventListener('storage', (e) => {
    if (e.key === 'authToken' && e.newValue === null) {
      console.log('Logout rilevato da altra tab -> redirect');
      // window.location.href = '/login';
    }
  });
}

/* ------------------------------------------------------------
   7) Cookies: document.cookie (stringa) + helper
   ------------------------------------------------------------ */

// Esempio browser: scrivere un cookie con attributi (path, max-age, SameSite).
function setCookie(nome, valore, giorni) {
  const maxAge = giorni * 24 * 60 * 60; // in secondi
  document.cookie = `${nome}=${encodeURIComponent(valore)}; max-age=${maxAge}; path=/; SameSite=Strict`;
}

// Esempio browser: leggere un cookie dalla stringa document.cookie.
function getCookie(nome) {
  const parti = document.cookie.split('; '); // "a=1; b=2"
  for (const p of parti) {
    const [k, v] = p.split('=');
    if (k === nome) return decodeURIComponent(v);
  }
  return null;
}

// Esempio browser: cancellare un cookie (max-age=0 nel passato).
function delCookie(nome) {
  document.cookie = `${nome}=; max-age=0; path=/`;
}

// NOTA: i cookie HttpOnly (impostati dal server) NON sono leggibili da JS:
// e' la difesa principale contro il furto di token via XSS.

/* ------------------------------------------------------------
   8) Pattern ERP: wrapper Storage tipizzato e robusto (eseguibile)
   ------------------------------------------------------------ */

// Questo wrapper funziona ovunque: usa un Map come fallback se Storage manca
// (es. in Node o in modalita' privata che lancia QuotaExceededError).
function creaStore() {
  const mem = new Map();
  const has = typeof localStorage !== 'undefined';
  return {
    get(k) {
      const raw = has ? localStorage.getItem(k) : (mem.has(k) ? mem.get(k) : null);
      try { return raw == null ? null : JSON.parse(raw); }
      catch { return null; } // valore non-JSON: ritorna null invece di crashare
    },
    set(k, v) {
      const raw = JSON.stringify(v);
      try { has ? localStorage.setItem(k, raw) : mem.set(k, raw); }
      catch (e) { console.warn('Storage pieno o non disponibile', e); }
    },
    del(k) { has ? localStorage.removeItem(k) : mem.delete(k); },
  };
}

const store = creaStore();
store.set('dipendente', { badge: 'UP-001', nome: 'Mario', reparto: 'UP' });
console.log(store.get('dipendente').badge); // => UP-001
console.log(store.get('inesistente'));      // => null

/* ------------------------------------------------------------
   9) Pattern ERP: cache con scadenza (TTL) sopra lo store
   ------------------------------------------------------------ */

// Salva un valore con timestamp di scadenza: utile per cache di reparti/turni.
function setConTTL(chiave, valore, secondiValidita) {
  const scadenza = Date.now() + secondiValidita * 1000;
  store.set(chiave, { valore, scadenza });
}
function getConTTL(chiave) {
  const box = store.get(chiave);
  if (!box) return null;
  if (Date.now() > box.scadenza) { store.del(chiave); return null; } // scaduto
  return box.valore;
}

setConTTL('reparti', [{ sigla: 'UP' }, { sigla: 'XX' }], 60);
console.log(getConTTL('reparti')); // => [ { sigla: 'UP' }, { sigla: 'XX' } ]

/* ------------------------------------------------------------
   10) Pattern ERP: token Bearer + naive-UTC della timbratura
   ------------------------------------------------------------ */

// Simula il salvataggio del token (come fa l'interceptor axios dell'ERP).
store.set('authToken', 'eyJhbGciOi...FAKE');
function authHeader() {
  const t = store.get('authToken');
  return t ? { Authorization: `Bearer ${t}` } : {}; // header per le fetch
}
console.log(authHeader()); // => { Authorization: 'Bearer eyJhbGciOi...FAKE' }

// Bozza di timbratura salvata come ora di Roma in formato naive-UTC.
function oraRomaNaive() {
  const parts = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('hour')}:${get('minute')}`; // es. "08:30"
}
store.set('bozzaTimbratura', { badge: 'UP-001', ingresso: oraRomaNaive() });
console.log(/^\d{2}:\d{2}$/.test(store.get('bozzaTimbratura').ingresso)); // => true

/* ------------------------------------------------------------
   11) BroadcastChannel: bus tra tab (alternativa a 'storage')
   ------------------------------------------------------------ */

// Esempio browser: invia eventi a tutte le tab della stessa origin.
function busTimbrature() {
  const bc = new BroadcastChannel('erp-timbrature');
  bc.onmessage = (e) => console.log('Nuova timbratura:', e.data.badge);
  bc.postMessage({ badge: 'UP-001', ingresso: '08:30' });
  // bc.close(); // chiudere quando non serve piu'
}

/* ------------------------------------------------------------
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   window.location / innerWidth / navigator / screen
   window.open(url, target, features) -> Window | null
   win.close() / win.closed
   window.postMessage(data, targetOrigin, [transfer])
   window.addEventListener('message', cb) ; event.origin / event.data
   MessageChannel / channel.port1 / port2
   localStorage.setItem / getItem / removeItem / clear / key / length
   sessionStorage.setItem / getItem (vive solo nella tab)
   window.addEventListener('storage', cb) ; e.key / e.newValue
   document.cookie (set/get/del) ; attributi: path, max-age, SameSite, HttpOnly
   encodeURIComponent / decodeURIComponent
   JSON.stringify / JSON.parse (Storage salva solo stringhe)
   BroadcastChannel(name) / postMessage / onmessage / close
   Pattern: store con fallback Map, cache TTL, Bearer token, naive-UTC.
   ------------------------------------------------------------ */
