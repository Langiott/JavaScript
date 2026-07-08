/* ============================================================
   74 JS Dom Create
   Creazione e rimozione di elementi nel DOM (Document Object Model).
   In questo file vediamo come generare nuovi nodi con createElement,
   come inserirli con append/prepend/before/after, come rimuoverli con
   remove(), come duplicarli con cloneNode e come usare un DocumentFragment
   per inserimenti efficienti in batch. Esempi ispirati a un gestionale
   ERP (badge dipendenti, timbrature, reparti, vestiario/DPI).
   NB: il DOM esiste solo nel browser; in Node questi esempi non girano,
   ma il PATTERN resta valido e riutilizzabile.
   ============================================================ */

// Esempio browser: gira nel browser, non in Node.
// Tutto il codice DOM qui sotto e' incapsulato in funzioni o commentato,
// cosi' il file puo' essere caricato senza errori a import-time.

/* ------------------------------------------------------------
   1) createElement: creare un nuovo nodo elemento
   ------------------------------------------------------------ */
function esempioCreateElement() {
  // Esempio browser
  const div = document.createElement('div'); // crea <div></div> staccato dal DOM
  div.textContent = 'Reparto: Produzione';
  div.className = 'card';
  // l'elemento esiste in memoria ma NON e' ancora nel documento
  document.body.appendChild(div); // ora e' visibile
}

/* ------------------------------------------------------------
   2) Impostare attributi e contenuto
   ------------------------------------------------------------ */
function creaBadge() {
  // Esempio browser: crea un badge dipendente tipo 'UP-001'
  const span = document.createElement('span');
  span.id = 'badge-up-001';
  span.setAttribute('data-codice', 'UP-001'); // attributo custom
  span.dataset.reparto = 'PR';                 // equivale a data-reparto
  span.textContent = 'UP-001 - Mario Rossi';
  return span;
  // => <span id="badge-up-001" data-codice="UP-001" data-reparto="PR">...
}

/* ------------------------------------------------------------
   3) textContent vs innerHTML
   ------------------------------------------------------------ */
function testoVsHtml() {
  // Esempio browser
  const p = document.createElement('p');
  p.textContent = '<b>non interpretato</b>'; // sicuro: mostra i tag come testo
  const q = document.createElement('p');
  q.innerHTML = '<b>interpretato</b>';        // interpreta HTML (attenzione XSS)
  return [p, q];
}

/* ------------------------------------------------------------
   4) appendChild vs append
   ------------------------------------------------------------ */
function appendChildVsAppend() {
  // Esempio browser
  const ul = document.createElement('ul');
  const li = document.createElement('li');
  ul.appendChild(li);          // appendChild: solo UN nodo, ritorna il nodo
  ul.append(li, 'testo libero'); // append: piu' nodi + stringhe, niente return
  return ul;
}

/* ------------------------------------------------------------
   5) prepend, before, after
   ------------------------------------------------------------ */
function inserimentiPosizionali() {
  // Esempio browser
  const lista = document.createElement('ul');
  const primo = document.createElement('li');
  primo.textContent = 'Ingresso';
  lista.append(primo);

  const zero = document.createElement('li');
  zero.textContent = 'Apertura turno';
  lista.prepend(zero); // inserito come PRIMO figlio

  const dopo = document.createElement('li');
  dopo.textContent = 'Uscita pranzo';
  primo.after(dopo);   // inserito subito DOPO 'primo'

  const prima = document.createElement('li');
  prima.textContent = 'Pre-ingresso';
  primo.before(prima); // inserito subito PRIMA di 'primo'
  return lista;
}

/* ------------------------------------------------------------
   6) insertBefore (API classica)
   ------------------------------------------------------------ */
function usoInsertBefore() {
  // Esempio browser
  const ul = document.createElement('ul');
  const a = document.createElement('li');
  ul.append(a);
  const nuovo = document.createElement('li');
  ul.insertBefore(nuovo, a); // inserisce 'nuovo' prima di 'a'
  ul.insertBefore(nuovo, null); // null => come appendChild (in fondo)
  return ul;
}

/* ------------------------------------------------------------
   7) remove(): togliere un nodo dal DOM
   ------------------------------------------------------------ */
function rimuoviNodo() {
  // Esempio browser
  const el = document.getElementById('badge-up-001');
  if (el) el.remove(); // rimuove se stesso, niente riferimento al parent
}

/* ------------------------------------------------------------
   8) removeChild (API classica) e replaceWith / replaceChild
   ------------------------------------------------------------ */
function rimuoviESostituisci() {
  // Esempio browser
  const ul = document.createElement('ul');
  const vecchio = document.createElement('li');
  ul.append(vecchio);

  const nuovo = document.createElement('li');
  vecchio.replaceWith(nuovo);      // sostituisce 'vecchio' con 'nuovo'
  ul.replaceChild(vecchio, nuovo); // API classica: replaceChild(nuovo, vecchio)
  ul.removeChild(vecchio);         // rimuove 'vecchio' dal parent
}

/* ------------------------------------------------------------
   9) cloneNode: duplicare un nodo
   ------------------------------------------------------------ */
function clonaNodi() {
  // Esempio browser
  const card = document.createElement('div');
  card.className = 'card';
  card.append(document.createElement('h3'));

  const shallow = card.cloneNode(false); // copia SOLO l'elemento, senza figli
  const deep = card.cloneNode(true);     // copia ANCHE tutti i figli (deep clone)
  // gli id non vengono auto-rinominati: attenzione ai duplicati
  return [shallow, deep];
}

/* ------------------------------------------------------------
   10) Pattern <template> + cloneNode (riga timbratura)
   ------------------------------------------------------------ */
function rigaDaTemplate(timbratura) {
  // Esempio browser
  // <template id="riga-tpl"><tr><td class="ora"></td></tr></template>
  const tpl = document.getElementById('riga-tpl');
  const riga = tpl.content.firstElementChild.cloneNode(true);
  riga.querySelector('.ora').textContent = timbratura.ingresso;
  return riga;
}

/* ------------------------------------------------------------
   11) DocumentFragment: inserimento efficiente in batch
   Aggiungere 1000 nodi uno a uno causa 1000 reflow.
   Con un fragment si fa un solo inserimento finale.
   ------------------------------------------------------------ */
function listaDipendentiVeloce(dipendenti) {
  // Esempio browser
  const frag = document.createDocumentFragment();
  for (const d of dipendenti) {
    const li = document.createElement('li');
    li.textContent = `${d.codiceBadge} - ${d.nome} ${d.cognome}`;
    frag.append(li); // accumula nel fragment (NON nel DOM vero)
  }
  document.getElementById('lista').append(frag); // un solo reflow
  // dopo l'append il fragment resta vuoto: i nodi sono "spostati"
}

/* ------------------------------------------------------------
   12) Spunto ERP: tabella turni da array di dati
   ------------------------------------------------------------ */
function renderTurni(turni) {
  // Esempio browser
  // turni: [{ sigla:'P4', pausa:true }, { sigla:'P2', pausa:false }]
  const tbody = document.createElement('tbody');
  const frag = document.createDocumentFragment();
  for (const t of turni) {
    const tr = document.createElement('tr');
    const tdSigla = document.createElement('td');
    tdSigla.textContent = t.sigla;
    const tdPausa = document.createElement('td');
    tdPausa.textContent = t.pausa ? 'con pausa' : 'senza pausa';
    tr.append(tdSigla, tdPausa);
    frag.append(tr);
  }
  tbody.append(frag);
  return tbody;
}

/* ------------------------------------------------------------
   13) Spunto ERP: clonare una card vestiario/DPI per ogni taglia
   ------------------------------------------------------------ */
function clonaCardVestiario(modello, taglie) {
  // Esempio browser
  // 'modello' e' un elemento gia' esistente da duplicare per taglia
  const frag = document.createDocumentFragment();
  for (const taglia of taglie) {
    const copia = modello.cloneNode(true); // deep clone
    copia.querySelector('.taglia').textContent = taglia;
    copia.removeAttribute('id'); // evita id duplicati dopo il clone
    frag.append(copia);
  }
  return frag;
}

/* ------------------------------------------------------------
   14) Svuotare un container prima di ri-renderizzare
   ------------------------------------------------------------ */
function svuota(container) {
  // Esempio browser
  // modo 1: replaceChildren() senza argomenti (moderno, pulito)
  container.replaceChildren();
  // modo 2: ciclo classico
  while (container.firstChild) container.removeChild(container.firstChild);
  // modo 3 (sconsigliato per i listener): container.innerHTML = '';
}

/* ------------------------------------------------------------
   15) replaceChildren con nuovi nodi (rimpiazza tutto in un colpo)
   ------------------------------------------------------------ */
function aggiornaReparti(container, reparti) {
  // Esempio browser
  const nodi = reparti.map((r) => {
    const li = document.createElement('li');
    li.textContent = r?.sigla ?? 'XX'; // nullish: sigla mancante => 'XX'
    return li;
  });
  container.replaceChildren(...nodi); // svuota e inserisce in un'unica chiamata
}

/* ------------------------------------------------------------
   16) Creare nodi di testo e commenti separatamente
   ------------------------------------------------------------ */
function nodiVari() {
  // Esempio browser
  const testo = document.createTextNode('UP-001'); // nodo di testo puro
  const commento = document.createComment('badge generato dal seed');
  const frag = document.createDocumentFragment();
  frag.append(commento, testo);
  return frag;
}

/* ------------------------------------------------------------
   17) Verifica appartenenza e parentela
   ------------------------------------------------------------ */
function controlliParentela() {
  // Esempio browser
  const ul = document.createElement('ul');
  const li = document.createElement('li');
  ul.append(li);
  console.log(li.parentNode === ul);       // => true
  console.log(ul.contains(li));            // => true
  console.log(document.body.contains(ul)); // => false (non ancora inserito)
}

/* ------------------------------------------------------------
   18) Funzione helper riutilizzabile (DRY) per creare elementi
   ------------------------------------------------------------ */
function el(tag, props = {}, ...figli) {
  // Esempio browser: piccola factory in stile hyperscript
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('data-')) node.setAttribute(k, v);
    else node[k] = v;
  }
  node.append(...figli);
  return node;
}
// uso: el('li', { class: 'badge' }, 'UP-001 - Mario Rossi')

/* ------------------------------------------------------------
   19) Esempio "eseguibile" in Node: simuliamo la logica dati
   (senza DOM) per dimostrare il pattern di costruzione lista
   ------------------------------------------------------------ */
const dipendentiDemo = [
  { codiceBadge: 'UP-001', nome: 'Mario', cognome: 'Rossi' },
  { codiceBadge: 'UP-002', nome: 'Lucia', cognome: 'Verdi' },
];
const righeTesto = dipendentiDemo.map(
  (d) => `${d.codiceBadge} - ${d.nome} ${d.cognome}`
);
console.log(righeTesto);
// => [ 'UP-001 - Mario Rossi', 'UP-002 - Lucia Verdi' ]

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   - document.createElement(tag)        crea un elemento
   - document.createTextNode(testo)     crea un nodo di testo
   - document.createComment(testo)      crea un nodo commento
   - document.createDocumentFragment()  contenitore leggero off-DOM
   - element.textContent / innerHTML    contenuto testo / HTML
   - element.setAttribute / dataset     attributi e data-*
   - parent.appendChild(node)           aggiunge un nodo (ritorna node)
   - parent.append(...nodi|stringhe)    aggiunge piu' nodi/testo
   - parent.prepend(...)                aggiunge come primo figlio
   - node.before(...) / node.after(...) inserisce prima/dopo il nodo
   - parent.insertBefore(nuovo, rif)    inserisce prima di rif
   - node.remove()                      rimuove se stesso
   - parent.removeChild(node)           rimuove un figlio
   - node.replaceWith(...)              sostituisce se stesso
   - parent.replaceChild(nuovo, vecchio) sostituisce un figlio
   - parent.replaceChildren(...)        svuota e/o rimpiazza tutto
   - node.cloneNode(false|true)         clone shallow / deep
   - tpl.content...cloneNode(true)      clona da <template>
   - parent.contains(node)              verifica appartenenza
   - node.parentNode / node.firstChild  navigazione parentela
   ============================================================ */
