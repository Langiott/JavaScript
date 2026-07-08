/* ============================================================
   104 JS ADV WebAPI Storage
   Il Web Storage (localStorage e sessionStorage) permette di
   salvare dati key/value direttamente nel browser, in modo
   persistente (localStorage) o per la sola sessione di tab
   (sessionStorage). Si scambiano sempre STRINGHE, quindi per
   oggetti serve JSON.stringify / JSON.parse. In questo file
   vediamo API base, persistenza JSON, pattern token/auth in
   stile interceptor axios di un gestionale ERP, scadenza dati,
   eventi 'storage' cross-tab e wrapper sicuri (try/catch).
   ============================================================ */

// NB: localStorage/sessionStorage sono Web API: girano nel BROWSER.
// In Node non esistono. Qui creiamo un polyfill minimale per poter
// ESEGUIRE gli esempi e mostrare gli output con node.

// ----- Polyfill didattico (solo per far girare in Node) -----
class MemoryStorage {
  constructor() { this._data = new Map(); }
  setItem(k, v) { this._data.set(String(k), String(v)); }
  getItem(k) { return this._data.has(String(k)) ? this._data.get(String(k)) : null; }
  removeItem(k) { this._data.delete(String(k)); }
  clear() { this._data.clear(); }
  key(i) { return [...this._data.keys()][i] ?? null; }
  get length() { return this._data.size; }
}
const localStorage = (typeof globalThis.localStorage !== 'undefined')
  ? globalThis.localStorage : new MemoryStorage();
const sessionStorage = (typeof globalThis.sessionStorage !== 'undefined')
  ? globalThis.sessionStorage : new MemoryStorage();

/* ------------------------------------------------------------
   1) API BASE: setItem / getItem / removeItem / clear
   ------------------------------------------------------------ */

// Salvare e leggere una stringa
localStorage.setItem('tema', 'scuro');
console.log(localStorage.getItem('tema')); // => scuro

// Chiave inesistente => null (NON undefined)
console.log(localStorage.getItem('inesistente')); // => null

// Tutto viene convertito in stringa automaticamente
localStorage.setItem('contatore', 42);
console.log(localStorage.getItem('contatore')); // => "42" (stringa!)
console.log(typeof localStorage.getItem('contatore')); // => string

// Rimuovere una singola chiave
localStorage.removeItem('tema');
console.log(localStorage.getItem('tema')); // => null

/* ------------------------------------------------------------
   2) length e key(): iterare lo storage
   ------------------------------------------------------------ */

localStorage.setItem('a', '1');
localStorage.setItem('b', '2');
console.log(localStorage.length); // => 2 (almeno)

// Iterare tutte le chiavi presenti
for (let i = 0; i < localStorage.length; i++) {
  const k = localStorage.key(i);
  console.log('chiave:', k, '=>', localStorage.getItem(k));
}

/* ------------------------------------------------------------
   3) PERSIST DI OGGETTI con JSON.stringify / JSON.parse
   ------------------------------------------------------------ */

// Salvare un oggetto dipendente: serve serializzare in JSON
const dipendente = { id: 7, nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001' };
localStorage.setItem('dipendente', JSON.stringify(dipendente));

// Rileggere: parse riconverte la stringa in oggetto
const letto = JSON.parse(localStorage.getItem('dipendente'));
console.log(letto.codiceBadge); // => UP-001
console.log(typeof letto); // => object

// Salvare un array (es. lista reparti)
const reparti = [{ sigla: 'UP' }, { sigla: 'P4' }, { sigla: 'XX' }];
localStorage.setItem('reparti', JSON.stringify(reparti));
const repartiLetti = JSON.parse(localStorage.getItem('reparti'));
console.log(repartiLetti.map(r => r.sigla).join(',')); // => UP,P4,XX

/* ------------------------------------------------------------
   4) WRAPPER SICURO: get/set JSON con try/catch
   JSON.parse lancia su input invalido => sempre proteggere.
   ------------------------------------------------------------ */

function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    // dati corrotti o non-JSON: torno il fallback invece di crashare
    return fallback;
  }
}
function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    // es. QuotaExceededError quando lo storage e' pieno
    return false;
  }
}

storageSet('impostazioni', { regola: 'arrotonda', turno: 'P4' });
console.log(storageGet('impostazioni').turno); // => P4
console.log(storageGet('mancante', { regola: 'default' }).regola); // => default

// Simulazione dato corrotto: il wrapper non esplode
localStorage.setItem('rotto', '{non-json');
console.log(storageGet('rotto', [])); // => [] (fallback)

/* ------------------------------------------------------------
   5) MERGE di impostazioni con defaults (pattern ERP)
   ------------------------------------------------------------ */

const DEFAULT_IMPOSTAZIONI = { regolaArrotondamento: 'nessuna', turno: 'P2', pausa: false };
function caricaImpostazioni() {
  const salvate = storageGet('cfg', {});
  // spread: i salvati sovrascrivono i default, i mancanti restano
  return { ...DEFAULT_IMPOSTAZIONI, ...salvate };
}
storageSet('cfg', { turno: 'P4', pausa: true });
console.log(caricaImpostazioni());
// => { regolaArrotondamento: 'nessuna', turno: 'P4', pausa: true }

/* ------------------------------------------------------------
   6) sessionStorage: vive solo finche' il tab e' aperto
   Stessa API di localStorage, ma scope di sessione.
   ------------------------------------------------------------ */

sessionStorage.setItem('filtroTemporaneo', JSON.stringify({ reparto: 'UP' }));
console.log(JSON.parse(sessionStorage.getItem('filtroTemporaneo')).reparto); // => UP
// Caso d'uso: filtri di una pagina che NON devono sopravvivere alla chiusura.

/* ------------------------------------------------------------
   7) PATTERN TOKEN: salvataggio JWT e interceptor (stile axios ERP)
   Il token di login viene salvato e riallegato ad ogni request.
   ------------------------------------------------------------ */

const AUTH_KEY = 'erp_token';
function setToken(token) { localStorage.setItem(AUTH_KEY, token); }
function getToken() { return localStorage.getItem(AUTH_KEY); }
function clearToken() { localStorage.removeItem(AUTH_KEY); }

setToken('eyJhbGciOi.fakeJWT.payload');

// Interceptor: funzione higher-order che arricchisce la config request
function authInterceptor(config = {}) {
  const token = getToken();
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}
const reqConfig = authInterceptor({ url: '/api/dipendenti', headers: { Accept: 'application/json' } });
console.log(reqConfig.headers.Authorization); // => Bearer eyJhbGciOi.fakeJWT.payload

// Logout: ripulire token e cache utente
function logout() {
  clearToken();
  localStorage.removeItem('dipendente');
}
logout();
console.log(getToken()); // => null

/* ------------------------------------------------------------
   8) DECODE payload JWT (base64url) salvato in storage
   Solo lettura claim lato client: NON e' validazione sicura.
   ------------------------------------------------------------ */

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = (typeof atob !== 'undefined')
      ? atob(b64)                                   // browser
      : Buffer.from(b64, 'base64').toString('utf8'); // Node
    return JSON.parse(json);
  } catch { return null; }
}
const fakePayload = Buffer.from(JSON.stringify({ sub: 7, ruolo: 'admin' })).toString('base64');
const fakeToken = `h.${fakePayload}.s`;
console.log(decodeJwtPayload(fakeToken)); // => { sub: 7, ruolo: 'admin' }

/* ------------------------------------------------------------
   9) TTL / SCADENZA: storage con expiry (cache locale ERP)
   localStorage non scade da solo: lo gestiamo noi col timestamp.
   ------------------------------------------------------------ */

function setConScadenza(key, value, ttlMs) {
  const record = { value, expiry: Date.now() + ttlMs };
  localStorage.setItem(key, JSON.stringify(record));
}
function getConScadenza(key) {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    const { value, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {        // scaduto: pulizia lazy
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch { return null; }
}
setConScadenza('cacheReparti', reparti, 60_000); // valido 60s
console.log(getConScadenza('cacheReparti')?.length); // => 3
setConScadenza('giaScaduto', { x: 1 }, -1);          // gia' scaduto
console.log(getConScadenza('giaScaduto')); // => null

/* ------------------------------------------------------------
   10) NAMESPACE delle chiavi (evitare collisioni)
   Prefisso per separare i dati della nostra app.
   ------------------------------------------------------------ */

const NS = 'erp:';
const ns = {
  set: (k, v) => storageSet(NS + k, v),
  get: (k, fb) => storageGet(NS + k, fb),
  del: (k) => localStorage.removeItem(NS + k),
  // pulisce solo le chiavi del namespace, non tutto lo storage
  clearAll() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(NS)) localStorage.removeItem(key);
    }
  },
};
ns.set('utente', { nome: 'Mario' });
console.log(ns.get('utente').nome); // => Mario

/* ------------------------------------------------------------
   11) EVENTO 'storage': sincronia cross-tab (browser)
   Si attiva negli ALTRI tab quando lo storage cambia.
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
function setupSyncCrossTab() {
  window.addEventListener('storage', (e) => {
    // e.key, e.oldValue, e.newValue, e.storageArea
    if (e.key === 'erp_token' && e.newValue === null) {
      console.log('Logout effettuato in un altro tab -> redirect login');
      // location.href = '/login';
    }
  });
}
// setupSyncCrossTab(); // da chiamare nel browser

/* ------------------------------------------------------------
   12) CARRELLO / BOZZA persistente (timbrature offline ERP)
   Accodare voci in un array salvato, da sincronizzare poi.
   ------------------------------------------------------------ */

function accodaTimbratura(t) {
  const coda = storageGet('coda_timbrature', []);
  coda.push({ ...t, ts: Date.now() });
  storageSet('coda_timbrature', coda);
}
function svuotaCoda() {
  const coda = storageGet('coda_timbrature', []);
  localStorage.removeItem('coda_timbrature');
  return coda; // da inviare al server con Promise.all
}
accodaTimbratura({ badge: 'UP-001', tipo: 'ingresso' });
accodaTimbratura({ badge: 'UP-001', tipo: 'uscita' });
console.log(storageGet('coda_timbrature').length); // => 2
console.log(svuotaCoda().map(x => x.tipo).join(',')); // => ingresso,uscita
console.log(storageGet('coda_timbrature', [])); // => [] (svuotata)

/* ------------------------------------------------------------
   13) FEATURE DETECTION: lo storage e' disponibile?
   In private mode o con cookie bloccati puo' lanciare.
   ------------------------------------------------------------ */

function storageDisponibile(tipo = 'localStorage') {
  try {
    const s = globalThis[tipo] || localStorage; // fallback al polyfill
    const test = '__test__';
    s.setItem(test, '1');
    s.removeItem(test);
    return true;
  } catch { return false; }
}
console.log(storageDisponibile()); // => true

/* ------------------------------------------------------------
   14) GESTIONE QUOTA: stimare la dimensione usata
   Limite tipico ~5MB per origin. Utile per pulizie.
   ------------------------------------------------------------ */

function dimensioneStorage() {
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    bytes += (k.length + (localStorage.getItem(k) || '').length) * 2; // UTF-16
  }
  return bytes;
}
console.log('byte usati circa:', dimensioneStorage());

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   - localStorage.setItem(k, v) / getItem(k) / removeItem(k) / clear()
   - localStorage.length / localStorage.key(i)
   - sessionStorage.* (stessa API, scope di tab)
   - JSON.stringify(obj) / JSON.parse(str)  -> persist oggetti
   - try/catch attorno a JSON.parse e setItem (QuotaExceededError)
   - { ...DEFAULT, ...salvate }              -> merge impostazioni
   - pattern token: setToken/getToken/clearToken + `Bearer ${token}`
   - interceptor: { ...config, headers: { ...h, Authorization } }
   - TTL fai-da-te: { value, expiry: Date.now()+ttl }
   - namespace con prefisso (NS + key), startsWith per pulizie mirate
   - window.addEventListener('storage', e => ...) -> sync cross-tab
   - feature detection con set/remove di una chiave di test
   - atob / Buffer.from(b64,'base64') -> decode base64url (JWT)
   ============================================================ */
