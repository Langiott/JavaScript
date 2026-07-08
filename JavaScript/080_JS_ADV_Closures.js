/* ============================================================
   80 JS ADV Closures
   Una closure e' una funzione che "ricorda" lo scope lessicale in
   cui e' stata creata, anche quando viene eseguita altrove. Grazie
   alle closure possiamo costruire private variables, il module
   pattern, factory configurabili, memoization e contatori isolati.
   In questo file partiamo dalle basi e arriviamo a pattern reali
   usati in un gestionale ERP (badge, turni, timbrature, reparti).
   ============================================================ */

// ------------------------------------------------------------
// 1) Closure base: la funzione interna ricorda la variabile esterna
// ------------------------------------------------------------
function creaSaluto(nome) {
  // 'nome' resta vivo nello scope della funzione ritornata
  return function () {
    return `Ciao ${nome}`;
  };
}
const salutaMario = creaSaluto("Mario");
console.log(salutaMario()); // => Ciao Mario

// ------------------------------------------------------------
// 2) Counter con stato privato: la variabile non e' accessibile fuori
// ------------------------------------------------------------
function creaContatore() {
  let count = 0; // private: nessuno puo' modificarla dall'esterno
  return {
    incr() { return ++count; },
    decr() { return --count; },
    valore() { return count; },
  };
}
const c = creaContatore();
c.incr();
c.incr();
console.log(c.valore()); // => 2
console.log(typeof c.count); // => undefined (count e' privato)

// ------------------------------------------------------------
// 3) Closure dentro un loop: perche' 'let' funziona e 'var' no
// ------------------------------------------------------------
const funzioniLet = [];
for (let i = 0; i < 3; i++) {
  funzioniLet.push(() => i); // ogni iterazione ha il suo 'i'
}
console.log(funzioniLet.map((f) => f())); // => [0, 1, 2]

const funzioniVar = [];
for (var j = 0; j < 3; j++) {
  funzioniVar.push(() => j); // tutte condividono lo stesso 'j'
}
console.log(funzioniVar.map((f) => f())); // => [3, 3, 3]

// ------------------------------------------------------------
// 4) Module pattern (IIFE): espone solo l'API pubblica
// ------------------------------------------------------------
const ContaBadge = (function () {
  let prossimo = 1; // stato privato del modulo
  function format(n) {
    return `UP-${String(n).padStart(3, "0")}`;
  }
  return {
    nuovo() { return format(prossimo++); },
    quantiEmessi() { return prossimo - 1; },
  };
})();
console.log(ContaBadge.nuovo()); // => UP-001
console.log(ContaBadge.nuovo()); // => UP-002
console.log(ContaBadge.quantiEmessi()); // => 2

// ------------------------------------------------------------
// 5) Private vars con getter/setter validanti
// ------------------------------------------------------------
function creaDipendente(nome, cognome) {
  let _ruolo = "operaio"; // private, modificabile solo via setRuolo
  const RUOLI = ["operaio", "impiegato", "responsabile"];
  return {
    nomeCompleto() { return `${nome} ${cognome}`; },
    getRuolo() { return _ruolo; },
    setRuolo(r) {
      if (!RUOLI.includes(r)) throw new Error(`Ruolo non valido: ${r}`);
      _ruolo = r;
    },
  };
}
const dip = creaDipendente("Anna", "Verdi");
dip.setRuolo("responsabile");
console.log(dip.nomeCompleto(), dip.getRuolo()); // => Anna Verdi responsabile

// ------------------------------------------------------------
// 6) Factory configurabile: closure cattura le impostazioni
// ------------------------------------------------------------
const DEFAULT_TURNO = { regolaArrotondamento: 5, pausaMinuti: 0 };
function creaCalcolatoreTurno(impostazioni = {}) {
  // merge: i default valgono se non sovrascritti (pattern ERP)
  const cfg = { ...DEFAULT_TURNO, ...impostazioni };
  // closure: ogni calcolatore "ricorda" la propria cfg
  return function oreLavorate(minutiGrezzi) {
    const netti = minutiGrezzi - cfg.pausaMinuti;
    const arrotondati =
      Math.round(netti / cfg.regolaArrotondamento) * cfg.regolaArrotondamento;
    return arrotondati;
  };
}
const turnoP4 = creaCalcolatoreTurno({ pausaMinuti: 30 }); // turno con pausa
const turnoP2 = creaCalcolatoreTurno(); // turno senza pausa
console.log(turnoP4(488)); // => 460 (488-30=458 arrotondato a 5)
console.log(turnoP2(488)); // => 490

// ------------------------------------------------------------
// 7) Memoization: cache privata via closure
// ------------------------------------------------------------
function memoize(fn) {
  const cache = new Map(); // private, condivisa tra le chiamate
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const res = fn(...args);
    cache.set(key, res);
    return res;
  };
}
let chiamate = 0;
const costoUnitario = memoize((articolo) => {
  chiamate++;
  return articolo.length * 1.5; // calcolo "costoso" simulato
});
console.log(costoUnitario("guanti")); // => 9
console.log(costoUnitario("guanti")); // => 9 (dalla cache)
console.log(chiamate); // => 1

// ------------------------------------------------------------
// 8) Once: una closure che garantisce esecuzione singola
// ------------------------------------------------------------
function once(fn) {
  let eseguita = false;
  let risultato;
  return function (...args) {
    if (!eseguita) {
      risultato = fn(...args);
      eseguita = true;
    }
    return risultato;
  };
}
const inizializzaDB = once(() => {
  console.log("Connessione al DB creata");
  return { connesso: true };
});
inizializzaDB(); // => stampa "Connessione al DB creata"
inizializzaDB(); // (nessuna stampa, ritorna la cache)

// ------------------------------------------------------------
// 9) Currying con closure: applicazione parziale degli argomenti
// ------------------------------------------------------------
function applicaFiltroData(query) {
  // higher-order: ritorna un filtro che ricorda la query
  return function (dataInizio, dataFine) {
    return query.filter(
      (r) => r.data >= dataInizio && r.data <= dataFine
    );
  };
}
const timbrature = [
  { data: "2026-06-01", ore: 8 },
  { data: "2026-06-15", ore: 7 },
  { data: "2026-07-02", ore: 8 },
];
const filtraTimbrature = applicaFiltroData(timbrature);
console.log(filtraTimbrature("2026-06-01", "2026-06-30").length); // => 2

// ------------------------------------------------------------
// 10) Generatore di ID per reparti: stato isolato per istanza
// ------------------------------------------------------------
function creaGeneratoreSigla(prefisso) {
  let n = 0;
  return () => `${prefisso}${String(++n).padStart(2, "0")}`;
}
const siglaReparto = creaGeneratoreSigla("RP");
console.log(siglaReparto()); // => RP01
console.log(siglaReparto()); // => RP02

// ------------------------------------------------------------
// 11) Closure come "namespace" privato con piu' metodi correlati
// ------------------------------------------------------------
const GestioneVestiario = (function () {
  const _scorte = new Map(); // private: nome DPI -> quantita
  function aggiungi(dpi, q) {
    _scorte.set(dpi, (_scorte.get(dpi) ?? 0) + q);
  }
  function preleva(dpi, q) {
    const attuale = _scorte.get(dpi) ?? 0;
    if (attuale < q) throw new Error(`Scorta insufficiente per ${dpi}`);
    _scorte.set(dpi, attuale - q);
  }
  function sottoScorta(min) {
    return [..._scorte].filter(([, q]) => q < min).map(([dpi]) => dpi);
  }
  return { aggiungi, preleva, sottoScorta };
})();
GestioneVestiario.aggiungi("casco", 10);
GestioneVestiario.aggiungi("guanti", 2);
GestioneVestiario.preleva("casco", 3);
console.log(GestioneVestiario.sottoScorta(5)); // => [ 'guanti' ]

// ------------------------------------------------------------
// 12) Closure + setTimeout: cattura del valore al momento giusto
// ------------------------------------------------------------
function pianificaPromemoria(messaggi) {
  messaggi.forEach((msg, idx) => {
    // 'msg' e' catturato per ogni callback (scope del forEach)
    setTimeout(() => console.log(`Promemoria ${idx}: ${msg}`), 0);
  });
}
// pianificaPromemoria(["timbra uscita", "ordina DPI"]);

// ------------------------------------------------------------
// 13) Debounce: pattern reale con closure (es. ricerca dipendenti)
// ------------------------------------------------------------
function debounce(fn, ms) {
  let timer; // private, persiste tra le invocazioni
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
const cercaDipendente = debounce((q) => {
  console.log(`Ricerca: ${q}`);
}, 200);
// cercaDipendente("ann"); cercaDipendente("anna"); // solo l'ultima parte

// ------------------------------------------------------------
// 14) Closure per stato di paginazione (cursore privato)
// ------------------------------------------------------------
function creaPaginatore(elementi, perPagina = 2) {
  let pagina = 0;
  return {
    prossima() {
      const start = pagina * perPagina;
      pagina++;
      return elementi.slice(start, start + perPagina);
    },
    reset() { pagina = 0; },
  };
}
const pag = creaPaginatore(["UP-001", "UP-002", "UP-003"], 2);
console.log(pag.prossima()); // => [ 'UP-001', 'UP-002' ]
console.log(pag.prossima()); // => [ 'UP-003' ]

// ------------------------------------------------------------
// 15) Closure che incapsula una connessione/config immutabile
// ------------------------------------------------------------
function creaClientApi(baseUrl, token) {
  // baseUrl e token restano privati e read-only di fatto
  function header() {
    return { Authorization: `Bearer ${token}` };
  }
  return {
    url(path) { return `${baseUrl}${path}`; },
    auth() { return header(); },
  };
}
const api = creaClientApi("https://erp.local", "abc123");
console.log(api.url("/dipendenti")); // => https://erp.local/dipendenti
console.log(api.auth()); // => { Authorization: 'Bearer abc123' }

// ------------------------------------------------------------
// 16) Trappola comune: condividere accidentalmente lo stesso stato
// ------------------------------------------------------------
function creaBadgeFactory() {
  let contatore = 0;
  // OGNI chiamata a creaBadgeFactory crea un nuovo 'contatore'
  return () => `UP-${String(++contatore).padStart(3, "0")}`;
}
const reparto1 = creaBadgeFactory();
const reparto2 = creaBadgeFactory(); // stato indipendente
console.log(reparto1(), reparto1()); // => UP-001 UP-002
console.log(reparto2()); // => UP-001 (non condivide con reparto1)

// ------------------------------------------------------------
// 17) Closure + Object.freeze per un singleton di configurazione
// ------------------------------------------------------------
const Config = (function () {
  const _valori = Object.freeze({ fuso: "Europe/Rome", lingua: "it-IT" });
  return {
    get(chiave) { return _valori[chiave]; },
  };
})();
console.log(Config.get("fuso")); // => Europe/Rome

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   - function esterna -> return function interna : crea una closure
   - let dentro for-loop : binding per-iterazione (vs var condiviso)
   - IIFE (function(){...})() : module pattern / stato privato
   - getter/setter + variabile _privata : incapsulamento
   - { ...DEFAULT, ...opzioni } : factory configurabile (merge)
   - new Map() in closure : cache per memoize / scorte
   - flag booleano in closure : once() esecuzione singola
   - currying : fn che ritorna fn con argomenti parziali (debounce, filtro)
   - String(n).padStart(2/3,'0') : formattazione codici (UP-001, RP01)
   - clearTimeout/setTimeout in closure : debounce
   - Object.freeze(...) : config immutabile in un singleton
   - ?? (nullish) per default su Map.get
   ============================================================ */
