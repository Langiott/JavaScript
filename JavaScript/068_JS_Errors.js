/* ============================================================
   68 JS Errors
   La gestione degli errori (error handling) permette di intercettare
   e gestire situazioni anomale senza far crashare il programma.
   In JavaScript si usa il blocco try/catch/finally per "provare" del
   codice rischioso, catturare l'eccezione e ripulire le risorse.
   Con throw si lancia un errore (anche personalizzato), mentre gli
   oggetti Error, TypeError, RangeError, ecc. descrivono il problema
   tramite proprieta' come error.message, error.name e error.stack.
   ============================================================ */

// ------------------------------------------------------------
// 1) try / catch: la struttura base
// ------------------------------------------------------------

// Il codice "rischioso" sta nel try; se lancia un errore si passa al catch.
try {
  const risultato = 10 / 0;        // in JS non lancia: e' Infinity
  console.log(risultato);          // => Infinity
  null.proprieta;                  // QUESTO lancia un TypeError
  console.log("non verra' mai eseguito");
} catch (error) {
  console.log("Errore catturato:", error.message);
  // => Errore catturato: Cannot read properties of null (reading 'proprieta')
}

// ------------------------------------------------------------
// 2) try / catch / finally: il finally gira SEMPRE
// ------------------------------------------------------------

// finally viene eseguito sia in caso di successo sia in caso di errore.
function leggiValore(obj) {
  try {
    return obj.valore;             // potrebbe lanciare
  } catch (e) {
    return "default";
  } finally {
    console.log("finally: pulizia risorse eseguita");
  }
}
console.log(leggiValore({ valore: 42 }));  // => finally... poi 42
console.log(leggiValore(null));            // => finally... poi default

// ------------------------------------------------------------
// 3) throw: lanciare un errore
// ------------------------------------------------------------

// Si puo' lanciare qualsiasi valore, ma la best practice e' un oggetto Error.
function dividi(a, b) {
  if (b === 0) {
    throw new Error("Divisione per zero non consentita");
  }
  return a / b;
}
try {
  dividi(10, 0);
} catch (e) {
  console.log(e.message);          // => Divisione per zero non consentita
}

// ------------------------------------------------------------
// 4) Le proprieta' di un oggetto Error
// ------------------------------------------------------------

const err = new Error("Qualcosa e' andato storto");
console.log(err.name);             // => Error
console.log(err.message);          // => Qualcosa e' andato storto
console.log(typeof err.stack);     // => string (lo stack trace)

// ------------------------------------------------------------
// 5) Tipi di errore nativi (built-in error types)
// ------------------------------------------------------------

// TypeError: operazione su un tipo non valido.
try {
  const n = undefined;
  n.toFixed(2);
} catch (e) {
  console.log(e.name);             // => TypeError
}

// RangeError: valore fuori dall'intervallo consentito.
try {
  const arr = new Array(-1);       // lunghezza negativa
} catch (e) {
  console.log(e.name);             // => RangeError
}

// ReferenceError: variabile non definita.
try {
  console.log(variabileInesistente);
} catch (e) {
  console.log(e.name);             // => ReferenceError
}

// SyntaxError: tipico di JSON.parse su stringa malformata.
try {
  JSON.parse("{ non valido }");
} catch (e) {
  console.log(e.name);             // => SyntaxError
}

// ------------------------------------------------------------
// 6) Distinguere i tipi con instanceof
// ------------------------------------------------------------

function gestisci(fn) {
  try {
    fn();
  } catch (e) {
    if (e instanceof TypeError) {
      console.log("Problema di tipo:", e.message);
    } else if (e instanceof RangeError) {
      console.log("Valore fuori range:", e.message);
    } else {
      console.log("Errore generico:", e.message);
    }
  }
}
gestisci(() => null.x);                       // => Problema di tipo: ...
gestisci(() => { throw new RangeError("ko"); }); // => Valore fuori range: ko

// ------------------------------------------------------------
// 7) Lanciare un RangeError personalizzato
// ------------------------------------------------------------

function setVolume(v) {
  if (v < 0 || v > 100) {
    throw new RangeError(`Volume ${v} fuori dal range 0-100`);
  }
  return v;
}
try {
  setVolume(150);
} catch (e) {
  console.log(`${e.name}: ${e.message}`);  // => RangeError: Volume 150 fuori dal range 0-100
}

// ------------------------------------------------------------
// 8) catch senza parametro (optional catch binding, ES2019)
// ------------------------------------------------------------

// Se non ci serve l'oggetto errore possiamo ometterlo.
function isJsonValido(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
console.log(isJsonValido('{"ok":true}'));  // => true
console.log(isJsonValido("rotto"));        // => false

// ------------------------------------------------------------
// 9) Custom Error: estendere la classe Error
// ------------------------------------------------------------

// Creare errori di dominio rende il catch piu' espressivo.
class ValidationError extends Error {
  constructor(message, campo) {
    super(message);
    this.name = "ValidationError";   // utile per i log
    this.campo = campo;              // proprieta' extra di contesto
  }
}
try {
  throw new ValidationError("Campo obbligatorio", "email");
} catch (e) {
  console.log(e.name, "-", e.campo, "-", e.message);
  // => ValidationError - email - Campo obbligatorio
  console.log(e instanceof ValidationError); // => true
  console.log(e instanceof Error);           // => true
}

// ------------------------------------------------------------
// 10) Re-throw: rilanciare cio' che non sappiamo gestire
// ------------------------------------------------------------

function elabora(dato) {
  try {
    if (typeof dato !== "number") {
      throw new TypeError("Atteso un numero");
    }
    return dato * 2;
  } catch (e) {
    if (e instanceof TypeError) {
      console.log("Gestisco il TypeError localmente");
      return 0;
    }
    throw e;  // gli altri errori li rilancio al chiamante
  }
}
console.log(elabora("x"));  // => Gestisco... poi 0

// ------------------------------------------------------------
// 11) Errori e async/await
// ------------------------------------------------------------

// Con async/await si usa il classico try/catch attorno all'await.
function fetchFinto(ok) {
  return new Promise((resolve, reject) => {
    setTimeout(() => ok ? resolve("dati") : reject(new Error("rete giu'")), 10);
  });
}
async function caricaDati(ok) {
  try {
    const d = await fetchFinto(ok);
    console.log("OK:", d);
  } catch (e) {
    console.log("Fallito:", e.message);
  } finally {
    console.log("richiesta terminata");
  }
}
caricaDati(true);   // => OK: dati ... richiesta terminata
caricaDati(false);  // => Fallito: rete giu' ... richiesta terminata

// ------------------------------------------------------------
// 12) Promise.catch (alternativa senza await)
// ------------------------------------------------------------

fetchFinto(false)
  .then((d) => console.log(d))
  .catch((e) => console.log("catch su promise:", e.message));
// => catch su promise: rete giu'

// ------------------------------------------------------------
// 13) Error cause (ES2022): incatenare la causa originale
// ------------------------------------------------------------

function leggiConfig() {
  try {
    JSON.parse("{ rotto }");
  } catch (originale) {
    throw new Error("Config non leggibile", { cause: originale });
  }
}
try {
  leggiConfig();
} catch (e) {
  console.log(e.message);            // => Config non leggibile
  console.log(e.cause.name);         // => SyntaxError
}

// ============================================================
// SPUNTI DAL GESTIONALE ERP
// ============================================================

// 14) Validazione codice badge con errore di dominio
// Il badge deve avere il formato 'UP-001' (lettere-numero).
class BadgeError extends Error {
  constructor(message, valore) {
    super(message);
    this.name = "BadgeError";
    this.valore = valore;
  }
}
function validaBadge(codice) {
  const pulito = String(codice || "").trim().toUpperCase();
  if (!/^[A-Z]{2}-\d{3}$/.test(pulito)) {
    throw new BadgeError(`Badge non valido: '${pulito}'`, pulito);
  }
  return pulito;
}
try {
  console.log(validaBadge(" up-001 "));  // => UP-001
  console.log(validaBadge("xx123"));     // lancia
} catch (e) {
  console.log(`${e.name}: ${e.message}`);  // => BadgeError: Badge non valido: 'XX123'
}

// 15) Validazione orario timbratura HH:MM con RangeError
function validaOrario(orario) {
  if (!/^\d{2}:\d{2}$/.test(orario)) {
    throw new TypeError(`Formato orario errato: ${orario}`);
  }
  const [h, m] = orario.split(":").map(Number);
  if (h > 23 || m > 59) {
    throw new RangeError(`Orario fuori range: ${orario}`);
  }
  return { h, m };
}
try {
  console.log(validaOrario("08:30"));  // => { h: 8, m: 30 }
  validaOrario("25:00");               // lancia RangeError
} catch (e) {
  console.log(`${e.name}: ${e.message}`);  // => RangeError: Orario fuori range: 25:00
}

// 16) Pattern crea-con-rollback (try/catch attorno a operazioni dipendenti)
// Simula: crea dipendente, poi assegna vestiario; se fallisce, rollback.
async function creaDipendenteConVestiario(dip, vestiario) {
  let creato = null;
  try {
    creato = { id: Math.floor(Math.random() * 1000), ...dip };
    console.log("Dipendente creato:", creato.id);
    if (!vestiario || vestiario.taglia == null) {
      throw new ValidationError("Taglia vestiario mancante", "taglia");
    }
    console.log("Vestiario assegnato:", vestiario.taglia);
    return creato;
  } catch (e) {
    if (creato) {
      console.log(`Rollback: elimino dipendente ${creato.id}`);
    }
    throw e;  // propago l'errore al chiamante
  }
}
creaDipendenteConVestiario({ nome: "Mario" }, null)
  .catch((e) => console.log("Operazione annullata:", e.message));
// => Dipendente creato... Rollback... Operazione annullata: Taglia vestiario mancante

// 17) Somma minuti turni con guardia sugli input non validi
function totaleMinuti(timbrature) {
  if (!Array.isArray(timbrature)) {
    throw new TypeError("Atteso un array di timbrature");
  }
  return timbrature.reduce((somma, t) => {
    if (typeof t.minuti !== "number" || Number.isNaN(t.minuti)) {
      throw new ValidationError(`Minuti non validi per turno ${t.id}`, "minuti");
    }
    return somma + t.minuti;
  }, 0);
}
try {
  console.log(totaleMinuti([{ id: 1, minuti: 480 }, { id: 2, minuti: 60 }])); // => 540
  totaleMinuti([{ id: 3, minuti: "x" }]); // lancia
} catch (e) {
  console.log(`${e.name}: ${e.message}`);  // => ValidationError: Minuti non validi per turno 3
}

// 18) Validazione scorta minima DPI con piu' controlli in cascata
function controllaScorta(articolo) {
  const { descrizione, quantita, scortaMinima } = articolo || {};
  if (quantita == null || scortaMinima == null) {
    throw new ValidationError("Quantita o scorta minima mancante", "scorta");
  }
  if (quantita < 0) {
    throw new RangeError("La quantita' non puo' essere negativa");
  }
  if (quantita < scortaMinima) {
    console.log(`ATTENZIONE: ${descrizione} sotto scorta (${quantita}/${scortaMinima})`);
  }
  return true;
}
try {
  controllaScorta({ descrizione: "Guanti", quantita: 3, scortaMinima: 10 });
  // => ATTENZIONE: Guanti sotto scorta (3/10)
  controllaScorta({ descrizione: "Caschi", quantita: -1, scortaMinima: 5 });
} catch (e) {
  console.log(`${e.name}: ${e.message}`);  // => RangeError: La quantita' non puo' essere negativa
}

/* ============================================================
   RIEPILOGO COMANDI
   - try { } catch (e) { } finally { }   // struttura base
   - catch { }                            // optional catch binding (ES2019)
   - throw new Error("msg")               // lanciare un errore
   - new Error(msg, { cause })            // error cause (ES2022)
   - error.name / error.message / error.stack
   - error.cause                          // causa incatenata
   - new TypeError(msg)                   // tipo non valido
   - new RangeError(msg)                  // valore fuori range
   - new ReferenceError / SyntaxError     // var inesistente / sintassi
   - e instanceof TypeError               // distinguere il tipo
   - class X extends Error { super(msg) } // custom error di dominio
   - throw e                              // re-throw
   - async/await + try/catch              // errori asincroni
   - promise.then().catch()               // gestione su Promise
   ============================================================ */
