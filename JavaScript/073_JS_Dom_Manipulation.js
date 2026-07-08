/* ============================================================
   73 JS Dom Manipulation
   La DOM manipulation e' la tecnica con cui JavaScript legge e
   modifica il contenuto, la struttura, gli attributi e lo stile
   degli elementi HTML di una pagina. In questo file vediamo i
   metodi/proprieta' fondamentali: textContent, innerHTML,
   classList, setAttribute/getAttribute, la proprieta' style e i
   dataset (attributi data-*). Gli esempi sono in stile browser
   (girano nel browser, non in Node), con simulazioni eseguibili
   dove utile per ripassare la logica anche in console Node.
   ============================================================ */

// ============================================================
// 0) NOTA SULL'AMBIENTE
// ============================================================
// Esempio browser: gira nel browser, non in Node.
// In Node non esiste l'oggetto `document`; per provare questi snippet
// apri un file .html e una <script>, oppure usa la console del browser.
// Dove serve eseguire logica anche in Node, simuleremo gli elementi.

// ============================================================
// 1) SELEZIONARE GLI ELEMENTI (prerequisito alla manipulation)
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function selettoriBase() {
  const perId = document.getElementById('badge');           // singolo elemento
  const primo = document.querySelector('.dipendente');      // primo match CSS
  const tutti = document.querySelectorAll('.dipendente');   // NodeList (tutti)
  return { perId, primo, tutti };
}

// ============================================================
// 2) textContent — testo "puro" (NON interpreta HTML)
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function esempiTextContent() {
  const el = document.getElementById('nome');

  // Leggere il testo
  const testo = el.textContent; // => "Mario Rossi"

  // Scrivere il testo (sovrascrive tutto il contenuto)
  el.textContent = 'Anna Bianchi';

  // textContent NON interpreta i tag: e' sicuro contro injection
  el.textContent = '<b>ciao</b>'; // mostra letteralmente <b>ciao</b>

  return testo;
}

// Simulazione eseguibile in Node del concetto (textContent = testo grezzo):
const fakeNode = { _text: '', set textContent(v) { this._text = v; }, get textContent() { return this._text; } };
fakeNode.textContent = '<b>ciao</b>';
console.log(fakeNode.textContent); // => <b>ciao</b>

// ============================================================
// 3) innerHTML — contenuto come markup (interpreta i tag)
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function esempiInnerHTML() {
  const box = document.getElementById('lista-dipendenti');

  // Inserire markup vero e proprio
  box.innerHTML = '<li>Mario</li><li>Anna</li>';

  // Costruire una lista da un array (pattern map().join(''))
  const dipendenti = [
    { nome: 'Mario', badge: 'UP-001' },
    { nome: 'Anna', badge: 'UP-002' },
  ];
  box.innerHTML = dipendenti
    .map((d) => `<li data-badge="${d.badge}">${d.nome}</li>`)
    .join('');

  // ATTENZIONE: innerHTML con dati non fidati = rischio XSS.
  // Per testo dell'utente preferire textContent.

  // Svuotare un contenitore
  box.innerHTML = '';
}

// Simulazione del pattern map().join('') (eseguibile in Node):
const turni = [
  { sigla: 'P4', pausa: true },
  { sigla: 'P2', pausa: false },
];
const htmlTurni = turni
  .map((t) => `<span class="turno">${t.sigla}${t.pausa ? ' (pausa)' : ''}</span>`)
  .join('');
console.log(htmlTurni);
// => <span class="turno">P4 (pausa)</span><span class="turno">P2</span>

// ============================================================
// 4) textContent vs innerHTML vs innerText (differenze)
// ============================================================
// - textContent : tutto il testo, anche nascosto; veloce; non interpreta HTML.
// - innerHTML   : legge/scrive markup HTML; potente ma a rischio XSS.
// - innerText   : solo testo "visibile" (rispetta CSS); piu' lento; solo browser.

// ============================================================
// 5) classList — gestione delle classi CSS
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function esempiClassList() {
  const riga = document.querySelector('.timbratura');

  riga.classList.add('evidenziata');            // aggiunge una classe
  riga.classList.remove('vecchia');             // rimuove una classe
  riga.classList.toggle('aperta');              // se c'e' la toglie, altrimenti la mette
  riga.classList.toggle('attiva', true);        // forza la presenza (secondo arg)
  const c = riga.classList.contains('aperta');  // => true/false
  riga.classList.replace('p2', 'p4');           // sostituisce una classe

  // Iterare le classi
  riga.classList.forEach((cls) => console.log(cls));
  return c;
}

// Simulazione eseguibile (mini classList con Set):
function makeClassList(...iniziali) {
  const set = new Set(iniziali);
  return {
    add: (c) => set.add(c),
    remove: (c) => set.delete(c),
    toggle: (c) => (set.has(c) ? (set.delete(c), false) : (set.add(c), true)),
    contains: (c) => set.has(c),
    get value() { return [...set].join(' '); },
  };
}
const cl = makeClassList('riga');
cl.add('evidenziata');
console.log(cl.toggle('aperta')); // => true
console.log(cl.value);            // => riga evidenziata aperta

// ============================================================
// 6) setAttribute / getAttribute / removeAttribute / hasAttribute
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function esempiAttributi() {
  const link = document.getElementById('scheda');

  link.setAttribute('href', '/dipendenti/UP-001'); // imposta attributo
  link.setAttribute('aria-label', 'Apri scheda');  // attributi ARIA
  const href = link.getAttribute('href');          // legge il valore
  const ok = link.hasAttribute('target');          // => true/false
  link.removeAttribute('target');                  // rimuove

  // Differenza attributo vs property:
  const input = document.getElementById('badge');
  input.setAttribute('value', 'UP-001'); // valore iniziale (HTML)
  input.value = 'UP-999';                 // valore corrente (DOM property)
  // getAttribute('value') resta 'UP-001', input.value e' 'UP-999'

  return { href, ok };
}

// ============================================================
// 7) style — stile inline elemento per elemento
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function esempiStyle() {
  const card = document.querySelector('.card-reparto');

  // Le proprieta' CSS in JS usano camelCase
  card.style.backgroundColor = '#f0f4ff';  // background-color
  card.style.fontWeight = '600';           // font-weight
  card.style.borderRadius = '8px';
  card.style.display = 'none';             // nascondere
  card.style.display = '';                 // ripristina default

  // Impostare piu' proprieta' insieme con cssText
  card.style.cssText = 'color:red; padding:8px;';

  // Leggere lo stile CALCOLATO (non solo inline)
  const colore = getComputedStyle(card).color;

  // Custom properties (variabili CSS)
  card.style.setProperty('--accent', '#0a7');
  const accent = card.style.getPropertyValue('--accent');

  return { colore, accent };
}

// ============================================================
// 8) dataset — attributi data-* (dati custom sull'elemento)
// ============================================================

// Esempio browser: gira nel browser, non in Node.
// HTML: <tr data-badge="UP-001" data-reparto-sigla="UF" data-ore="7.5">
function esempiDataset() {
  const riga = document.querySelector('tr');

  // Lettura: data-badge -> dataset.badge
  const badge = riga.dataset.badge;             // => "UP-001"
  // data-reparto-sigla (kebab) -> dataset.repartoSigla (camelCase)
  const sigla = riga.dataset.repartoSigla;      // => "UF"
  // I valori sono SEMPRE stringhe: convertire quando serve
  const ore = Number(riga.dataset.ore);         // => 7.5

  // Scrittura: crea/aggiorna l'attributo data-stato="approvata"
  riga.dataset.stato = 'approvata';

  // Rimuovere
  delete riga.dataset.stato;

  return { badge, sigla, ore };
}

// Simulazione del mapping kebab <-> camelCase (eseguibile in Node):
function datasetFromAttrs(attrs) {
  const ds = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (!k.startsWith('data-')) continue;
    const key = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    ds[key] = v;
  }
  return ds;
}
console.log(datasetFromAttrs({ 'data-badge': 'UP-001', 'data-reparto-sigla': 'UF' }));
// => { badge: 'UP-001', repartoSigla: 'UF' }

// ============================================================
// 9) CREARE e INSERIRE nodi (createElement, append, ecc.)
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function creaNodi() {
  const ul = document.getElementById('lista');

  const li = document.createElement('li');
  li.textContent = 'Mario Rossi';
  li.classList.add('dipendente');
  li.dataset.badge = 'UP-001';
  li.setAttribute('title', 'Badge UP-001');

  ul.append(li);                 // in fondo
  ul.prepend(li);                // all'inizio
  ul.insertAdjacentHTML('beforeend', '<li>Anna</li>'); // markup senza svuotare
  li.remove();                   // rimuove l'elemento
}

// ============================================================
// 10) ESEMPIO PRATICO (ispirato al gestionale ERP)
// ============================================================
// Render di una tabella timbrature: trasformiamo dati in righe,
// usiamo dataset per il badge, classList per lo stato, style per
// evidenziare gli straordinari. Pattern map().join('') + textContent
// per i valori che provengono dall'utente (anti-XSS).

// Esempio browser: gira nel browser, non in Node.
function renderTimbrature(timbrature) {
  const tbody = document.getElementById('tbody-timbrature');

  // Costruzione righe con markup (campi controllati dal sistema)
  tbody.innerHTML = timbrature
    .map((t) => {
      const straord = t.oreLavorate > 8 ? ' style="background:#fff3cd"' : '';
      const stato = t.oreLavorate >= 8 ? 'completa' : 'parziale';
      return `<tr data-badge="${t.badge}" class="timbratura ${stato}"${straord}>
        <td class="nome"></td>
        <td>${t.oreLavorate.toFixed(2)}</td>
      </tr>`;
    })
    .join('');

  // I nomi (dato utente) li mettiamo con textContent per sicurezza
  const righe = tbody.querySelectorAll('tr');
  righe.forEach((tr, i) => {
    tr.querySelector('.nome').textContent = timbrature[i].nome;
  });
}

// Logica pura riutilizzabile (eseguibile in Node) per i pattern usati sopra:
function statoTimbratura(oreLavorate) {
  return oreLavorate >= 8 ? 'completa' : 'parziale';
}
console.log(statoTimbratura(7.5)); // => parziale
console.log(statoTimbratura(8.2)); // => completa

// Filtro + somma minuti (pattern ERP) prima di mostrarli nel DOM:
const richieste = [
  { approvata: true, minuti: 480 },
  { approvata: false, minuti: 120 },
  { approvata: true, minuti: 60 },
];
const totaleMinuti = richieste
  .filter((r) => r.approvata)
  .reduce((s, r) => s + r.minuti, 0);
console.log(totaleMinuti); // => 540

// ============================================================
// 11) TOGGLE DI VISIBILITA' / STATO (pattern UI ricorrente)
// ============================================================

// Esempio browser: gira nel browser, non in Node.
function toggleDettaglioReparto(sigla) {
  const card = document.querySelector(`[data-reparto-sigla="${sigla}"]`);
  if (!card) return;                         // guard con optional-like check
  const aperta = card.classList.toggle('aperta');
  card.setAttribute('aria-expanded', String(aperta));
  card.style.maxHeight = aperta ? '500px' : '0px';
}

// ============================================================
// 12) BADGE / NORMALIZZAZIONE prima di scriverla nel DOM
// ============================================================
// Pattern ERP: normalizzare un codice badge prima di renderizzarlo.
function normalizzaBadge(v) {
  return String(v || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
}
console.log(normalizzaBadge('  up-001 ')); // => UP-001

// Esempio browser: gira nel browser, non in Node.
function mostraBadge(input, target) {
  target.textContent = normalizzaBadge(input.value); // textContent = anti-XSS
  target.dataset.badge = normalizzaBadge(input.value);
}

// ============================================================
// RIEPILOGO COMANDI
// ============================================================
// SELEZIONE:    getElementById, querySelector, querySelectorAll
// TESTO:        textContent, innerText
// MARKUP:       innerHTML, insertAdjacentHTML
// CLASSI:       classList.add/remove/toggle/contains/replace/forEach
// ATTRIBUTI:    setAttribute, getAttribute, removeAttribute, hasAttribute
// STILE:        element.style.<camelCase>, style.cssText,
//               style.setProperty / getPropertyValue, getComputedStyle
// DATA-*:       element.dataset.<camelCase>, delete element.dataset.x
// NODI:         createElement, append, prepend, remove
// PATTERN:      map().join('') per liste, textContent per dati utente (anti-XSS),
//               dataset per metadati di riga, classList/style per stato visuale
