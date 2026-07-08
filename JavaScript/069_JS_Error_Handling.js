/* ============================================================
   69 JS Error Handling
   La gestione degli errori (error handling) permette di
   intercettare condizioni anomale senza far crashare il
   programma. In JavaScript si usano try/catch/finally, l'oggetto
   Error e le sue sottoclassi, il rilancio (re-throw), il blocco
   finally per il cleanup e pattern specifici per il codice async
   (Promise, async/await). Una buona validazione dell'input e
   messaggi di errore chiari rendono il codice robusto.
   ============================================================ */

// ------------------------------------------------------------
// 1) try / catch base
// ------------------------------------------------------------

// Se il codice nel try lancia, il controllo passa al catch.
try {
  const dati = JSON.parse("{ non valido }"); // lancia SyntaxError
  console.log(dati);
} catch (err) {
  console.log("Errore catturato:", err.name); // => Errore catturato: SyntaxError
}

// L'oggetto Error ha proprietà utili: name, message, stack.
try {
  throw new Error("qualcosa e' andato storto");
} catch (err) {
  console.log(err.name);    // => Error
  console.log(err.message); // => qualcosa e' andato storto
  // console.log(err.stack); // traccia completa (verbosa)
}

// ------------------------------------------------------------
// 2) Lanciare errori con throw
// ------------------------------------------------------------

// Si puo' lanciare qualsiasi valore, ma e' best practice lanciare Error.
function dividi(a, b) {
  if (b === 0) {
    throw new Error("Divisione per zero");
  }
  return a / b;
}

try {
  console.log(dividi(10, 2)); // => 5
  console.log(dividi(10, 0)); // lancia
} catch (err) {
  console.log("Catch:", err.message); // => Catch: Divisione per zero
}

// ------------------------------------------------------------
// 3) Tipi di Error nativi
// ------------------------------------------------------------

// TypeError, RangeError, ReferenceError, SyntaxError, ecc.
try {
  null.foo; // TypeError: cannot read properties of null
} catch (err) {
  console.log(err instanceof TypeError); // => true
}

try {
  const arr = [];
  arr.length = -1; // RangeError: invalid array length
} catch (err) {
  console.log(err instanceof RangeError); // => true
}

// ------------------------------------------------------------
// 4) Validazione input (esempio ERP: dipendente / badge)
// ------------------------------------------------------------

// Validare i parametri all'inizio della funzione (fail fast).
function creaDipendente({ nome, cognome, codiceBadge }) {
  if (typeof nome !== "string" || nome.trim() === "") {
    throw new TypeError("nome obbligatorio");
  }
  if (typeof cognome !== "string" || cognome.trim() === "") {
    throw new TypeError("cognome obbligatorio");
  }
  // formato badge tipo 'UP-001'
  if (!/^[A-Z]{2}-\d{3}$/.test(codiceBadge)) {
    throw new RangeError(`codiceBadge non valido: ${codiceBadge}`);
  }
  return { nome: nome.trim(), cognome: cognome.trim(), codiceBadge };
}

try {
  console.log(creaDipendente({ nome: "Mario", cognome: "Rossi", codiceBadge: "UP-001" }));
  // => { nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001' }
  creaDipendente({ nome: "Anna", cognome: "Bianchi", codiceBadge: "X1" });
} catch (err) {
  console.log(`${err.name}: ${err.message}`); // => RangeError: codiceBadge non valido: X1
}

// ------------------------------------------------------------
// 5) Validazione orario timbratura (formato HH:MM)
// ------------------------------------------------------------

// Pattern reale: i campi turno devono rispettare /^\d{2}:\d{2}$/.
function parseOrario(orario) {
  if (!/^\d{2}:\d{2}$/.test(orario)) {
    throw new Error(`Orario non valido (atteso HH:MM): ${orario}`);
  }
  const [hh, mm] = orario.split(":").map(Number);
  if (hh > 23 || mm > 59) {
    throw new RangeError(`Orario fuori range: ${orario}`);
  }
  return hh * 60 + mm; // minuti dalla mezzanotte
}

console.log(parseOrario("08:30")); // => 510
try {
  parseOrario("25:00");
} catch (err) {
  console.log(err.message); // => Orario fuori range: 25:00
}

// ------------------------------------------------------------
// 6) finally per il cleanup
// ------------------------------------------------------------

// finally viene SEMPRE eseguito, sia in caso di successo che di errore.
function leggiRisorsa(fallisce) {
  console.log("apertura risorsa");
  try {
    if (fallisce) throw new Error("lettura fallita");
    return "dati";
  } finally {
    console.log("chiusura risorsa (cleanup)"); // sempre eseguito
  }
}

console.log(leggiRisorsa(false));
// => apertura risorsa
// => chiusura risorsa (cleanup)
// => dati
try {
  leggiRisorsa(true);
} catch (err) {
  console.log("errore:", err.message);
}
// => apertura risorsa
// => chiusura risorsa (cleanup)
// => errore: lettura fallita

// ------------------------------------------------------------
// 7) Re-throw: rilanciare dopo aver loggato
// ------------------------------------------------------------

// A volte si vuole loggare e poi propagare l'errore al chiamante.
function caricaConfig(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.log("Log interno: config corrotta");
    throw err; // re-throw: il chiamante decide cosa fare
  }
}

try {
  caricaConfig("{ rotto");
} catch (err) {
  console.log("Gestito a monte:", err.name); // => Gestito a monte: SyntaxError
}

// ------------------------------------------------------------
// 8) Re-throw selettivo: gestisco solo alcuni errori
// ------------------------------------------------------------

function elabora(valore) {
  try {
    if (valore < 0) throw new RangeError("negativo");
    if (typeof valore !== "number") throw new TypeError("non numero");
    return valore * 2;
  } catch (err) {
    if (err instanceof RangeError) {
      return 0; // gestisco il RangeError
    }
    throw err; // ogni altro errore lo rilancio
  }
}

console.log(elabora(5));   // => 10
console.log(elabora(-3));  // => 0
try {
  elabora("ciao");
} catch (err) {
  console.log("rilanciato:", err.name); // => rilanciato: TypeError
}

// ------------------------------------------------------------
// 9) Custom Error class (estendere Error)
// ------------------------------------------------------------

// Creare errori di dominio per distinguerli nel catch.
class ValidationError extends Error {
  constructor(campo, messaggio) {
    super(messaggio);
    this.name = "ValidationError";
    this.campo = campo; // metadato extra
  }
}

function validaTaglia(taglia) {
  const valide = ["S", "M", "L", "XL"];
  if (!valide.includes(taglia)) {
    throw new ValidationError("taglia", `taglia non valida: ${taglia}`);
  }
  return taglia;
}

try {
  validaTaglia("XXXL");
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`campo=${err.campo} msg=${err.message}`);
    // => campo=taglia msg=taglia non valida: XXXL
  }
}

// ------------------------------------------------------------
// 10) Error cause (ES2022): incatenare gli errori
// ------------------------------------------------------------

// L'opzione { cause } conserva l'errore originale.
function salvaTimbratura(orario) {
  try {
    parseOrario(orario);
  } catch (err) {
    throw new Error("Timbratura non salvata", { cause: err });
  }
}

try {
  salvaTimbratura("99:99");
} catch (err) {
  console.log(err.message);       // => Timbratura non salvata
  console.log(err.cause.message); // => Orario fuori range: 99:99
}

// ------------------------------------------------------------
// 11) Errori con le Promise (.catch)
// ------------------------------------------------------------

// Una Promise rifiutata si gestisce con .catch().
function trovaReparto(sigla) {
  return new Promise((resolve, reject) => {
    const reparti = { UF: "Ufficio", PR: "Produzione" };
    if (reparti[sigla]) resolve(reparti[sigla]);
    else reject(new Error(`Reparto inesistente: ${sigla}`));
  });
}

trovaReparto("UF").then((r) => console.log("ok:", r)); // => ok: Ufficio
trovaReparto("ZZ").catch((err) => console.log("ko:", err.message)); // => ko: Reparto inesistente: ZZ

// ------------------------------------------------------------
// 12) Errori con async/await (try/catch)
// ------------------------------------------------------------

// Con async/await si usa il classico try/catch.
async function caricaDipendente(badge) {
  try {
    const reparto = await trovaReparto(badge.slice(0, 2));
    return `Badge ${badge} -> ${reparto}`;
  } catch (err) {
    return `Errore: ${err.message}`;
  }
}

caricaDipendente("UF-007").then(console.log); // => Badge UF-007 -> Ufficio
caricaDipendente("ZZ-001").then(console.log); // => Errore: Reparto inesistente: ZZ

// ------------------------------------------------------------
// 13) finally async + rollback (pattern ERP)
// ------------------------------------------------------------

// Pattern reale: crea risorsa, se uno step fallisce esegui rollback.
async function creaConRollback(deveFallire) {
  let creato = false;
  try {
    creato = true; // simula INSERT dipendente
    console.log("dipendente creato");
    if (deveFallire) throw new Error("assegnazione vestiario fallita");
    return "completato";
  } catch (err) {
    if (creato) console.log("ROLLBACK: elimino dipendente"); // compensazione
    throw err;
  } finally {
    console.log("fine transazione"); // cleanup connessione
  }
}

creaConRollback(false).then(console.log).catch((e) => console.log(e.message));
// => dipendente creato / fine transazione / completato
creaConRollback(true).catch((e) => console.log("catturato:", e.message));
// => dipendente creato / ROLLBACK... / fine transazione / catturato: assegnazione vestiario fallita

// ------------------------------------------------------------
// 14) Promise.all e gestione del primo errore
// ------------------------------------------------------------

// Promise.all rigetta appena UNA delle promise fallisce.
async function caricaDashboard() {
  try {
    const [a, b] = await Promise.all([
      Promise.resolve("turni ok"),
      Promise.reject(new Error("query reparti fallita")),
    ]);
    return [a, b];
  } catch (err) {
    return "Dashboard parziale: " + err.message;
  }
}
caricaDashboard().then(console.log); // => Dashboard parziale: query reparti fallita

// ------------------------------------------------------------
// 15) Promise.allSettled: non si ferma al primo errore
// ------------------------------------------------------------

// allSettled restituisce status 'fulfilled' o 'rejected' per ciascuna.
async function caricaTutto() {
  const esiti = await Promise.allSettled([
    Promise.resolve("dipendenti"),
    Promise.reject(new Error("badge")),
  ]);
  return esiti.map((e) => (e.status === "fulfilled" ? e.value : `KO:${e.reason.message}`));
}
caricaTutto().then(console.log); // => [ 'dipendenti', 'KO:badge' ]

// ------------------------------------------------------------
// 16) unhandled rejection (da evitare)
// ------------------------------------------------------------

// Ogni Promise che puo' fallire DEVE avere un .catch o essere in try/catch.
// MALE: Promise.reject(new Error("x")); // unhandledRejection
// BENE:
Promise.reject(new Error("gestita")).catch((e) => console.log("ok:", e.message));
// => ok: gestita

// ------------------------------------------------------------
// 17) Helper: wrapper sicuro che ritorna [errore, dato]
// ------------------------------------------------------------

// Pattern "Go style": evita try/catch ripetuti.
async function safe(promise) {
  try {
    const dato = await promise;
    return [null, dato];
  } catch (err) {
    return [err, null];
  }
}

(async () => {
  const [err, val] = await safe(trovaReparto("PR"));
  if (err) console.log("errore:", err.message);
  else console.log("valore:", val); // => valore: Produzione
})();

// ------------------------------------------------------------
// 18) Validazione aggregata: raccogliere piu' errori
// ------------------------------------------------------------

// Invece di fermarsi al primo errore, raccogliere tutti i problemi.
function validaTurno({ inizio, fine }) {
  const errori = [];
  if (!/^\d{2}:\d{2}$/.test(inizio)) errori.push("inizio non valido");
  if (!/^\d{2}:\d{2}$/.test(fine)) errori.push("fine non valida");
  if (errori.length > 0) {
    throw new ValidationError("turno", errori.join("; "));
  }
  return true;
}

try {
  validaTurno({ inizio: "8", fine: "xx" });
} catch (err) {
  console.log(err.message); // => inizio non valido; fine non valida
}

// ------------------------------------------------------------
// RIEPILOGO COMANDI
// ------------------------------------------------------------
/*
  try { } catch (err) { }      -> intercetta errori sincroni
  try { } finally { }          -> cleanup sempre eseguito
  throw new Error(msg)         -> lancia un errore
  throw err                    -> re-throw (rilancio)
  new Error(msg, { cause })    -> incatena l'errore originale (ES2022)
  err.name / err.message       -> tipo e messaggio
  err.stack                    -> traccia dello stack
  err instanceof TypeError     -> controlla il tipo di errore
  class X extends Error { }     -> custom error di dominio
  Error nativi: TypeError, RangeError, ReferenceError, SyntaxError
  Promise.reject(err)          -> promise rifiutata
  .then() / .catch()           -> gestione Promise
  async / await + try/catch    -> errori in codice asincrono
  Promise.all([...])           -> fallisce al primo reject
  Promise.allSettled([...])    -> status fulfilled/rejected per tutte
  e.status / e.value / e.reason-> esiti di allSettled
  .catch() su ogni Promise     -> evita unhandledRejection
*/
