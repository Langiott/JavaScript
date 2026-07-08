/* ============================================================
   75 JS Dom Events
   Gli eventi sono il cuore dell'interattivita nel browser: click,
   input, submit, keypress, ecc. Con addEventListener registriamo
   una callback (event listener) che riceve un event object. In
   questa scheda vediamo bubbling/capturing (le fasi di propagazione),
   la event delegation (un solo listener sul contenitore), e i metodi
   di controllo come preventDefault e stopPropagation.
   NB: il DOM esiste solo nel browser, quindi molti esempi sono
   marcati "Esempio browser" e definiti dentro funzioni: girano nel
   browser, non in Node. Alla fine simuliamo la logica in puro JS.
   ============================================================ */

// ============================================================
// 1) BASE: addEventListener
// ============================================================

// Esempio browser: gira nel browser, non in Node
function esempioBase() {
  const btn = document.querySelector("#salva");
  // Sintassi: target.addEventListener(type, listener, options)
  btn.addEventListener("click", function () {
    console.log("Bottone cliccato!");
  });

  // Con arrow function
  btn.addEventListener("click", () => console.log("Anche io!"));
}

// Esempio browser: gira nel browser, non in Node
function listenerNominato() {
  const btn = document.querySelector("#timbra");
  // Una funzione nominata si puo RIMUOVERE (le anonime no)
  function onTimbra() {
    console.log("Timbratura registrata");
  }
  btn.addEventListener("click", onTimbra);
  // Per rimuovere serve lo STESSO riferimento di funzione
  btn.removeEventListener("click", onTimbra);
}

// ============================================================
// 2) L'EVENT OBJECT
// ============================================================

// Esempio browser: gira nel browser, non in Node
function eventObject() {
  const input = document.querySelector("#badge");
  input.addEventListener("input", (event) => {
    // event.target  -> elemento che ha scatenato l'evento
    // event.type    -> "input"
    // event.currentTarget -> elemento su cui e' registrato il listener
    console.log(event.type);          // => input
    console.log(event.target.value);  // => valore corrente del campo
  });

  document.addEventListener("keydown", (e) => {
    console.log(e.key);        // es. "Enter", "a", "Escape"
    console.log(e.code);       // es. "Enter", "KeyA"
    console.log(e.ctrlKey);    // => true/false
  });
}

// Esempio browser: gira nel browser, non in Node
function mouseEvent() {
  const card = document.querySelector(".card-dipendente");
  card.addEventListener("mousemove", (e) => {
    console.log(e.clientX, e.clientY); // coordinate nel viewport
    console.log(e.button);             // 0 sinistro, 1 centrale, 2 destro
  });
}

// ============================================================
// 3) preventDefault e stopPropagation
// ============================================================

// Esempio browser: gira nel browser, non in Node
function preventDefaultDemo() {
  const form = document.querySelector("#form-timbratura");
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // blocca il reload della pagina (default del submit)
    const fd = new FormData(form);
    console.log("Invio AJAX, niente reload", fd.get("badge"));
  });

  const link = document.querySelector("a.esterno");
  link.addEventListener("click", (e) => {
    e.preventDefault(); // il link NON naviga
    console.log("Navigazione bloccata");
  });
}

// Esempio browser: gira nel browser, non in Node
function stopPropagationDemo() {
  const riga = document.querySelector(".riga");
  const bottone = riga.querySelector(".elimina");

  riga.addEventListener("click", () => console.log("click sulla riga"));
  bottone.addEventListener("click", (e) => {
    e.stopPropagation();      // l'evento NON sale alla riga
    console.log("solo elimina");
    // e.stopImmediatePropagation(); // blocca anche altri listener sullo stesso nodo
  });
}

// ============================================================
// 4) BUBBLING e CAPTURING (le fasi di propagazione)
// ============================================================
// Fase 1 CAPTURING: dall'alto (document) verso il target
// Fase 2 TARGET:    sul nodo cliccato
// Fase 3 BUBBLING:  dal target risale verso l'alto (default)

// Esempio browser: gira nel browser, non in Node
function bubblingVsCapturing() {
  const padre = document.querySelector("#tabella");
  const figlio = document.querySelector("#cella");

  // capture: true -> ascolta in fase di CAPTURING (prima del figlio)
  padre.addEventListener("click", () => console.log("padre CAPTURE"), true);
  // default (false) -> ascolta in fase di BUBBLING (dopo il figlio)
  padre.addEventListener("click", () => console.log("padre BUBBLE"));
  figlio.addEventListener("click", () => console.log("figlio TARGET"));
  // Click sul figlio stampa nell'ordine:
  // => padre CAPTURE
  // => figlio TARGET
  // => padre BUBBLE

  // event.eventPhase: 1=capture, 2=target, 3=bubble
}

// ============================================================
// 5) EVENT DELEGATION (pattern fondamentale)
// ============================================================
// Invece di N listener su N righe, UN solo listener sul contenitore.
// Sfrutta il bubbling + event.target per capire chi e' stato cliccato.

// Esempio browser: gira nel browser, non in Node
function delegation() {
  const lista = document.querySelector("#lista-dipendenti");
  lista.addEventListener("click", (e) => {
    // closest() trova l'antenato piu' vicino che matcha il selettore
    const btn = e.target.closest("button.elimina");
    if (!btn) return; // click fuori dai bottoni: ignora
    const id = btn.dataset.id; // legge data-id="..."
    console.log("Elimino dipendente", id);
  });
  // Vantaggio ERP: le righe aggiunte dopo (AJAX) funzionano gia',
  // senza dover ri-registrare listener.
}

// ============================================================
// 6) options: once, passive, signal
// ============================================================

// Esempio browser: gira nel browser, non in Node
function opzioniListener() {
  const btn = document.querySelector("#scarica");
  // once: il listener si auto-rimuove dopo il primo trigger
  btn.addEventListener("click", () => console.log("una volta sola"), { once: true });

  // passive: promette di non chiamare preventDefault -> scroll piu' fluido
  window.addEventListener("touchstart", () => {}, { passive: true });

  // AbortController + signal: rimuove piu' listener in un colpo
  const ac = new AbortController();
  document.addEventListener("keydown", () => {}, { signal: ac.signal });
  document.addEventListener("mousemove", () => {}, { signal: ac.signal });
  ac.abort(); // rimuove ENTRAMBI i listener
}

// ============================================================
// 7) CUSTOM EVENTS (eventi propri)
// ============================================================

// Esempio browser: gira nel browser, non in Node
function customEvents() {
  const el = document.querySelector("#orologio");
  // CustomEvent con dati in detail; bubbles per farlo salire
  const ev = new CustomEvent("timbratura:salvata", {
    detail: { badge: "UP-001", ora: "08:03" },
    bubbles: true,
  });
  el.addEventListener("timbratura:salvata", (e) => {
    console.log(e.detail.badge, e.detail.ora); // => UP-001 08:03
  });
  el.dispatchEvent(ev); // scatena l'evento manualmente
}

// ============================================================
// 8) DEBOUNCE su input (pattern ERP: ricerca badge live)
// ============================================================

// debounce e' utilizzabile ANCHE in Node, lo testiamo sotto.
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Esempio browser: gira nel browser, non in Node
function ricercaConDebounce() {
  const input = document.querySelector("#cerca-badge");
  const cerca = debounce((q) => console.log("query API:", q), 400);
  input.addEventListener("input", (e) => cerca(e.target.value));
}

// ============================================================
// 9) SIMULAZIONE ESEGUIBILE IN NODE
// ============================================================
// Ricreiamo un mini "event system" per capire bubbling e delegation
// senza browser. Il PATTERN e' lo stesso del DOM.

class NodoFinto {
  constructor(tag, props = {}) {
    this.tag = tag;
    this.props = props;          // es. { className, dataset }
    this.parent = null;
    this.listeners = {};         // { tipo: [fn, ...] }
    this.children = [];
  }
  append(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }
  on(type, fn) {
    (this.listeners[type] ??= []).push(fn);
  }
  // dispatch con bubbling: dal target risale ai parent
  dispatch(type, target = this) {
    const event = { type, target, currentTarget: this, propagationStopped: false };
    event.stopPropagation = () => (event.propagationStopped = true);
    for (const fn of this.listeners[type] ?? []) fn(event);
    if (!event.propagationStopped && this.parent) {
      this.parent.dispatch(type, target); // BUBBLING
    }
  }
}

const tabella = new NodoFinto("ul", { className: "lista-dipendenti" });
const riga1 = tabella.append(new NodoFinto("li", { dataset: { id: "1" } }));
const btnDel = riga1.append(new NodoFinto("button", { className: "elimina" }));

// Event delegation: UN listener sul contenitore
tabella.on("click", (e) => {
  if (e.target.props.className === "elimina") {
    console.log("delego eliminazione id:", e.target.parent.props.dataset.id);
  }
});
btnDel.dispatch("click"); // => delego eliminazione id: 1

// stopPropagation impedisce la risalita
riga1.on("click", (e) => {
  console.log("riga intercetta e ferma");
  e.stopPropagation();
});
tabella.on("click", () => console.log("NON dovrei vedermi"));
riga1.dispatch("click");
// => riga intercetta e ferma   (il listener della tabella non parte)

// ============================================================
// 10) DEBOUNCE testato in Node (timer asincroni)
// ============================================================

const logCerca = debounce((q) => console.log("cerco:", q), 50);
logCerca("U");
logCerca("UP");
logCerca("UP-0"); // solo l'ultima chiamata sopravvive dopo 50ms
// dopo ~50ms => cerco: UP-0

// ============================================================
// 11) VALIDAZIONE su submit (pattern ERP, logica pura)
// ============================================================

// Estratto come funzione pura: validabile in Node e riusabile
// nel listener submit del form.
function validaTimbratura(orario) {
  return /^\d{2}:\d{2}$/.test(orario); // HH:MM
}
console.log(validaTimbratura("08:03")); // => true
console.log(validaTimbratura("8:3"));   // => false

// Esempio browser: gira nel browser, non in Node
function submitConValidazione() {
  const form = document.querySelector("#form-orario");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const orario = form.elements.orario.value;
    if (!validaTimbratura(orario)) {
      console.log("Formato non valido, usa HH:MM");
      return;
    }
    console.log("Salvo turno con orario", orario);
  });
}

// ============================================================
// 12) DELEGATION con dataset (badge UP-001) - logica estratta
// ============================================================

function estraiNumeroBadge(codice) {
  const m = String(codice || "").match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}
console.log(estraiNumeroBadge("UP-001")); // => 1
console.log(estraiNumeroBadge("UP-042")); // => 42

/* ============================================================
   RIEPILOGO COMANDI
   - element.addEventListener(type, listener, options)
   - element.removeEventListener(type, listener)
   - options: { once, passive, capture, signal }
   - event.target / event.currentTarget / event.type
   - event.key / event.code / event.ctrlKey / event.clientX/Y / event.button
   - event.preventDefault()
   - event.stopPropagation() / event.stopImmediatePropagation()
   - event.eventPhase (1 capture, 2 target, 3 bubble)
   - addEventListener(type, fn, true) -> fase capturing
   - event.target.closest(selector) -> event delegation
   - element.dataset.id -> lettura data-*
   - new CustomEvent(type, { detail, bubbles })
   - element.dispatchEvent(event)
   - new AbortController() + signal -> abort() rimuove i listener
   - new FormData(form) / form.elements
   - setTimeout / clearTimeout -> debounce
   ============================================================ */
