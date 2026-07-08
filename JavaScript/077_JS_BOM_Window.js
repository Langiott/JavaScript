/* ============================================================
   77 JS BOM Window
   Il BOM (Browser Object Model) e' l'insieme di oggetti che il
   browser espone per interagire con la finestra e l'ambiente:
   window (oggetto globale), location (URL corrente), history
   (cronologia di navigazione), navigator (info sul browser),
   screen (info sullo schermo) e i metodi di dialogo alert(),
   confirm() e prompt(). Diversamente dal DOM (che modella il
   documento), il BOM modella la finestra che lo contiene.
   NOTA: quasi tutto qui gira SOLO nel browser, non in Node.
   ============================================================ */

// ============================================================
// 1) window: l'oggetto globale del browser
// ============================================================

// Esempio browser: gira nel browser, non in Node
// Nel browser "window" e' l'oggetto globale: le variabili globali
// e le funzioni built-in (alert, setTimeout...) sono sue proprieta'.
function esempioWindowGlobale() {
  // window === globalThis nel browser
  console.log(typeof window); // => "object"
  // Una proprieta' messa su window e' visibile globalmente
  window.appNomeGestionale = "ERP Polyuretech";
  console.log(appNomeGestionale); // => "ERP Polyuretech"
}

// In Node.js l'equivalente portabile e' globalThis (ES2020+)
globalThis.versioneApp = "1.0.0";
console.log(globalThis.versioneApp); // => "1.0.0"

// Esempio browser: gira nel browser, non in Node
// Dimensioni della finestra (viewport) e posizione
function dimensioniWindow() {
  console.log(window.innerWidth, window.innerHeight);   // viewport
  console.log(window.outerWidth, window.outerHeight);   // finestra intera
  console.log(window.screenX, window.screenY);          // posizione su schermo
  console.log(window.scrollX, window.scrollY);          // scroll corrente
}

// Esempio browser: gira nel browser, non in Node
// open() apre una nuova finestra/scheda; close() la chiude
function apriPopupReport() {
  const win = window.open(
    "/report/timbrature",
    "reportTimbrature",
    "width=800,height=600"
  );
  // win.close(); // chiude la finestra appena aperta
  return win;
}

// ============================================================
// 2) Timers su window: setTimeout / setInterval
// ============================================================

// Questi esistono anche in Node, quindi sono eseguibili ovunque.
// setTimeout esegue una callback DOPO un ritardo (in ms)
const idTimeout = setTimeout(() => {
  console.log("Eseguito dopo 50ms");
}, 50);
clearTimeout(idTimeout); // annulla prima che scatti

// setInterval ripete una callback a intervalli regolari
let battiti = 0;
const idInterval = setInterval(() => {
  battiti++;
  if (battiti >= 3) clearInterval(idInterval); // ferma dopo 3 volte
}, 30);

// ============================================================
// 3) window.location: leggere e cambiare l'URL
// ============================================================

// Esempio browser: gira nel browser, non in Node
// location espone le parti dell'URL corrente
function leggiLocation() {
  console.log(location.href);     // URL completo
  console.log(location.protocol); // "https:"
  console.log(location.host);     // "polytools.polyuretech.net:443"
  console.log(location.hostname); // "polytools.polyuretech.net"
  console.log(location.port);     // "443"
  console.log(location.pathname); // "/dipendenti"
  console.log(location.search);   // "?reparto=UP"
  console.log(location.hash);     // "#anagrafica"
}

// In Node possiamo simulare/parsare un URL con la classe URL (ES2020+)
const u = new URL("https://polytools.polyuretech.net/dipendenti?reparto=UP&attivo=1#top");
console.log(u.pathname);                       // => /dipendenti
console.log(u.searchParams.get("reparto"));    // => UP
console.log(u.searchParams.get("attivo"));     // => 1
console.log(u.hash);                           // => #top

// Costruire una query string per filtrare timbrature (pattern ERP)
function buildQueryTimbrature(filtri) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filtri)) {
    if (v != null && v !== "") params.set(k, String(v));
  }
  return "?" + params.toString();
}
console.log(buildQueryTimbrature({ reparto: "UP", data: "2026-06-30", attivo: 1 }));
// => ?reparto=UP&data=2026-06-30&attivo=1

// Esempio browser: gira nel browser, non in Node
// Navigare e ricaricare
function naviga() {
  location.href = "/timbrature";        // naviga (aggiunge alla history)
  location.assign("/reparti");          // come sopra
  location.replace("/login");           // naviga SENZA aggiungere alla history
  location.reload();                    // ricarica la pagina
}

// ============================================================
// 4) window.history: navigazione nella cronologia
// ============================================================

// Esempio browser: gira nel browser, non in Node
function usaHistory() {
  console.log(history.length); // numero di voci nella cronologia
  history.back();              // come il tasto "indietro"
  history.forward();           // come il tasto "avanti"
  history.go(-2);              // due passi indietro
}

// Esempio browser: gira nel browser, non in Node
// pushState/replaceState: cambiano URL senza ricaricare (SPA)
function routerSpa() {
  // aggiunge una nuova voce nella history
  history.pushState({ vista: "dipendenti" }, "", "/dipendenti");
  // sostituisce la voce corrente (no nuova entry)
  history.replaceState({ vista: "reparti" }, "", "/reparti");
  // popstate scatta quando l'utente usa back/forward
  window.addEventListener("popstate", (e) => {
    console.log("Stato ripristinato:", e.state); // => { vista: ... }
  });
}

// ============================================================
// 5) window.navigator: informazioni sul browser e l'ambiente
// ============================================================

// Esempio browser: gira nel browser, non in Node
function leggiNavigator() {
  console.log(navigator.userAgent);   // stringa identificativa del browser
  console.log(navigator.language);    // "it-IT"
  console.log(navigator.languages);   // ["it-IT", "it", "en"]
  console.log(navigator.onLine);      // true se connesso
  console.log(navigator.platform);    // piattaforma (deprecato ma usato)
  console.log(navigator.cookieEnabled);
}

// Esempio browser: gira nel browser, non in Node
// Reagire allo stato online/offline (utile per sincronizzare timbrature)
function gestisciConnessione() {
  window.addEventListener("online", () => console.log("Connesso: sincronizzo"));
  window.addEventListener("offline", () => console.log("Offline: salvo in coda"));
}

// Esempio browser: gira nel browser, non in Node
// API moderne sotto navigator (Promise-based)
async function copiaBadgeNeglAppunti(codiceBadge) {
  await navigator.clipboard.writeText(codiceBadge); // copia "UP-001"
  console.log("Badge copiato");
}

// Esempio browser: gira nel browser, non in Node
// Geolocalizzazione (callback-based)
function posizioneSede() {
  navigator.geolocation.getCurrentPosition(
    (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
    (err) => console.error("Errore geo:", err.message)
  );
}

// ============================================================
// 6) window.screen: informazioni sullo schermo fisico
// ============================================================

// Esempio browser: gira nel browser, non in Node
function leggiScreen() {
  console.log(screen.width, screen.height);             // risoluzione totale
  console.log(screen.availWidth, screen.availHeight);   // area disponibile
  console.log(screen.colorDepth);                       // profondita' colore
  console.log(screen.orientation?.type);                // "landscape-primary"
}

// ============================================================
// 7) Dialoghi: alert / confirm / prompt
// ============================================================

// Esempio browser: gira nel browser, non in Node
// alert(): mostra un messaggio, non ritorna nulla
function avvisaSalvataggio() {
  alert("Timbratura salvata con successo");
}

// Esempio browser: gira nel browser, non in Node
// confirm(): ritorna true/false (OK / Annulla)
function confermaEliminazione(nome) {
  const ok = confirm(`Eliminare il dipendente ${nome}?`);
  if (ok) console.log("Eliminato");
  else console.log("Annullato");
  return ok;
}

// Esempio browser: gira nel browser, non in Node
// prompt(): chiede un input, ritorna stringa o null se Annulla
function chiediCodiceBadge() {
  const code = prompt("Inserisci codice badge:", "UP-");
  if (code === null) return null;        // utente ha annullato
  return code.trim().toUpperCase();      // normalizza input
}

// Nota didattica: alert/confirm/prompt sono BLOCCANTI (fermano lo script).
// Nei gestionali moderni si preferiscono modali custom non bloccanti.

// ============================================================
// 8) Esempio pratico ERP: validazione badge da prompt + redirect
// ============================================================

// Pattern: normalizzo l'input come nel modulo dipendenti, valido con
// regex e costruisco l'URL della scheda. Logica pura testabile in Node.
function normalizzaBadge(v) {
  return String(v || "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 8);
}
function urlSchedaDipendente(badgeRaw) {
  const badge = normalizzaBadge(badgeRaw);
  if (!/^[A-Z]{2}-\d{3}$/.test(badge)) {
    throw new Error(`Badge non valido: ${badge}`);
  }
  return `/dipendenti?badge=${encodeURIComponent(badge)}`;
}
console.log(urlSchedaDipendente("  up-001 ")); // => /dipendenti?badge=UP-001

// Esempio browser: gira nel browser, non in Node
// Flusso completo nel browser: prompt -> valida -> location.assign
function vaiASchedaDaPrompt() {
  const raw = prompt("Codice badge?");
  try {
    const url = urlSchedaDipendente(raw);
    location.assign(url);
  } catch (e) {
    alert(e.message);
  }
}

// ============================================================
// 9) Esempio pratico ERP: conferma prima di chiudere con modifiche
// ============================================================

// Esempio browser: gira nel browser, non in Node
// beforeunload avvisa se ci sono modifiche non salvate al form turni
function proteggiModificheNonSalvate(getDirty) {
  window.addEventListener("beforeunload", (e) => {
    if (getDirty()) {
      e.preventDefault();
      e.returnValue = ""; // richiesto da alcuni browser per mostrare l'avviso
    }
  });
}

// ============================================================
// RIEPILOGO COMANDI
// ------------------------------------------------------------
// window, globalThis
// window.innerWidth / innerHeight / outerWidth / outerHeight
// window.screenX / screenY / scrollX / scrollY
// window.open() / window.close()
// setTimeout() / clearTimeout() / setInterval() / clearInterval()
// location.href / protocol / host / hostname / port / pathname / search / hash
// location.assign() / location.replace() / location.reload()
// new URL() / url.searchParams.get() / URLSearchParams
// history.length / back() / forward() / go() / pushState() / replaceState()
// evento popstate
// navigator.userAgent / language / languages / onLine / platform / cookieEnabled
// navigator.clipboard.writeText() / navigator.geolocation.getCurrentPosition()
// eventi online / offline
// screen.width / height / availWidth / availHeight / colorDepth / orientation
// alert() / confirm() / prompt()
// evento beforeunload (e.preventDefault / e.returnValue)
// ============================================================
