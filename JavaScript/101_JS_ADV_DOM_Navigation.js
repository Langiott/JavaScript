/* ============================================================
   101 JS ADV DOM Navigation
   La navigazione del DOM (Document Object Model) permette di
   spostarsi tra i nodi di una pagina HTML partendo da un elemento
   e raggiungendone genitori, figli, fratelli (siblings) o antenati.
   Conoscere i metodi di traversal (parentNode, children,
   firstElementChild, nextElementSibling, closest, querySelector...)
   e' fondamentale per leggere e manipolare interfacce reali, come
   le righe di una tabella timbrature o le card dei dipendenti di
   un gestionale ERP. Distinguere "node" da "element" evita i bug
   piu' comuni (whitespace text node, commenti, ecc.).
   ============================================================ */

// Esempio browser: gira nel browser, non in Node.
// In Node non esistono document/window: gli esempi sono in funzioni o commentati.

/* ------------------------------------------------------------
   1) NODE vs ELEMENT
   Il DOM e' un albero di "node". Gli elementi (tag) sono solo un
   tipo di node; esistono anche text node, comment node, ecc.
   Le proprieta' che iniziano con "child*"/"*Sibling" senza
   "Element" includono anche i text node (spazi, a-capo).
   ------------------------------------------------------------ */

// nodeType: 1 = ELEMENT_NODE, 3 = TEXT_NODE, 8 = COMMENT_NODE
function spiegaNodeType(node) {
  // => 1 per un tag, 3 per testo, 8 per commento
  return node.nodeType;
}

/* ------------------------------------------------------------
   2) RISALIRE: parentNode e parentElement
   parentNode ritorna il genitore (qualsiasi node);
   parentElement ritorna il genitore solo se e' un Element.
   ------------------------------------------------------------ */

// Esempio browser
function risaliAlGenitore() {
  const cella = document.querySelector('.ora-ingresso');
  const riga = cella.parentNode;        // <tr> contenitore
  const tabella = riga.parentElement;   // <tbody> o <table>
  return { riga, tabella };
}

// parentElement e' null sulla radice <html>; parentNode punta a document
// document.documentElement.parentNode  // => #document
// document.documentElement.parentElement // => null

/* ------------------------------------------------------------
   3) SCENDERE: childNodes vs children
   childNodes -> NodeList con TUTTI i node (anche testo/spazi);
   children   -> HTMLCollection con i soli Element. Preferire children.
   ------------------------------------------------------------ */

// Esempio browser
function contaFigli() {
  const lista = document.querySelector('#lista-dipendenti');
  // childNodes include i text node degli a-capo: numero gonfiato
  const tuttiNode = lista.childNodes.length;     // es. 11
  // children conta solo gli <li>: numero "vero"
  const soliElementi = lista.children.length;    // es. 5
  return { tuttiNode, soliElementi };
}

/* ------------------------------------------------------------
   4) PRIMO e ULTIMO figlio
   firstChild/lastChild -> qualsiasi node (occhio agli spazi!)
   firstElementChild/lastElementChild -> solo Element.
   ------------------------------------------------------------ */

// Esempio browser
function primoUltimoFiglio() {
  const ul = document.querySelector('#turni');
  const primo = ul.firstElementChild;  // primo <li> reale
  const ultimo = ul.lastElementChild;  // ultimo <li> reale
  // ul.firstChild potrebbe essere un text node "\n  "
  return { primo, ultimo };
}

/* ------------------------------------------------------------
   5) FRATELLI (siblings)
   nextSibling/previousSibling -> qualsiasi node
   nextElementSibling/previousElementSibling -> solo Element
   ------------------------------------------------------------ */

// Esempio browser: dato un <td>, trovo la cella successiva
function cellaSuccessiva(td) {
  const dopo = td.nextElementSibling;   // td seguente o null
  const prima = td.previousElementSibling;
  return { dopo, prima };
}

// Iterare tutti i fratelli successivi di un elemento
function fratelliSuccessivi(el) {
  // Esempio browser
  const risultato = [];
  let cur = el.nextElementSibling;
  while (cur) {
    risultato.push(cur);
    cur = cur.nextElementSibling;
  }
  return risultato;
}

/* ------------------------------------------------------------
   6) closest(): risale fino al primo antenato che matcha
   Utilissimo nei click handler: dal bottone risalgo alla riga.
   ------------------------------------------------------------ */

// Esempio browser: badge 'UP-001' cliccato -> trovo la card del dipendente
function gestisciClickBadge(event) {
  const card = event.target.closest('.card-dipendente');
  if (!card) return; // click fuori da una card
  const badge = card.dataset.badge; // es. 'UP-001'
  return badge;
}

// closest controlla anche l'elemento di partenza stesso
// div.closest('div') // => il div stesso se matcha

/* ------------------------------------------------------------
   7) matches(): true/false se l'elemento soddisfa un selettore
   Spesso usato dentro closest manuale o event delegation.
   ------------------------------------------------------------ */

// Esempio browser
function eRigaApprovata(tr) {
  return tr.matches('tr.approvata'); // => true/false
}

/* ------------------------------------------------------------
   8) contains(): un nodo discende da un altro?
   ------------------------------------------------------------ */

// Esempio browser
function dentroAlMenu(node) {
  const menu = document.querySelector('#menu-reparti');
  return menu.contains(node); // => true se node e' dentro il menu
}

/* ------------------------------------------------------------
   9) querySelector / querySelectorAll su un elemento
   La ricerca puo' partire da un elemento, non solo da document:
   limita lo scope al sottoalbero di quell'elemento.
   ------------------------------------------------------------ */

// Esempio browser: dentro una sola riga timbrature
function oreDellaRiga(tr) {
  const celle = tr.querySelectorAll('td.ora'); // NodeList
  // NodeList ha forEach; per map/filter conviene Array.from
  return Array.from(celle).map((td) => td.textContent.trim());
}

/* ------------------------------------------------------------
   10) DA COLLECTION AD ARRAY: pattern ERP autonomi
   children/querySelectorAll non sono Array veri: convertiamoli
   con Array.from o lo spread per usare map/filter/reduce.
   Qui simuliamo i node come oggetti per girare anche in Node.
   ------------------------------------------------------------ */

// Simulazione: ogni "riga" e' un oggetto con dataset e textContent
const righeTimbrature = [
  { dataset: { badge: 'UP-001' }, minuti: 480, stato: 'approvata' },
  { dataset: { badge: 'UP-002' }, minuti: 300, stato: 'in-attesa' },
  { dataset: { badge: 'UP-003' }, minuti: 510, stato: 'approvata' },
];

// filter + reduce: totale minuti delle sole righe approvate
const totaleApprovate = righeTimbrature
  .filter((r) => r.stato === 'approvata')
  .reduce((s, r) => s + r.minuti, 0);
console.log(totaleApprovate); // => 990

// map: estrai solo i badge (come farebbe Array.from(nodes).map(...))
const badge = righeTimbrature.map((r) => r.dataset.badge);
console.log(badge); // => [ 'UP-001', 'UP-002', 'UP-003' ]

/* ------------------------------------------------------------
   11) EVENT DELEGATION + traversal (pattern professionale)
   Un solo listener sul contenitore; con closest() capisco quale
   riga e' stata cliccata. Evita N listener su N righe.
   ------------------------------------------------------------ */

// Esempio browser
function abilitaDelegation() {
  const tabella = document.querySelector('#tabella-timbrature');
  tabella.addEventListener('click', (e) => {
    const btn = e.target.closest('button.approva');
    if (!btn) return;                 // non era un bottone approva
    const riga = btn.closest('tr');   // risalgo alla riga
    const badge = riga.dataset.badge; // 'UP-001'
    riga.classList.add('approvata');
    console.log('Approvata riga', badge);
  });
}

/* ------------------------------------------------------------
   12) COSTRUIRE e INSERIRE node (traversal in scrittura)
   createElement + append; insertAdjacentElement per posizioni
   relative a un sibling.
   ------------------------------------------------------------ */

// Esempio browser: aggiungo una riga dipendente alla tabella
function aggiungiRigaDipendente(nome, cognome, badge) {
  const tbody = document.querySelector('#tabella-dipendenti tbody');
  const tr = document.createElement('tr');
  tr.dataset.badge = badge;
  tr.innerHTML = `<td>${nome} ${cognome}</td><td>${badge}</td>`;
  tbody.append(tr);              // in fondo
  // tbody.prepend(tr);          // in testa
  // altraRiga.before(tr);       // prima di un sibling
  // altraRiga.after(tr);        // dopo un sibling
  return tr;
}

/* ------------------------------------------------------------
   13) RISALIRE n livelli con un helper riutilizzabile
   Higher-order: funzione che risale finche' una condizione e' vera.
   ------------------------------------------------------------ */

// Esempio browser
function risaliFinche(el, predicato) {
  let cur = el;
  while (cur && !predicato(cur)) {
    cur = cur.parentElement;
  }
  return cur; // il primo antenato che matcha, o null
}
// uso: risaliFinche(td, (n) => n.classList.contains('reparto'))

/* ------------------------------------------------------------
   14) RACCOGLIERE tutti gli antenati (catena dei parent)
   Pattern utile per breadcrumb o per capire il contesto di un nodo.
   ------------------------------------------------------------ */

// Esempio browser
function catenaAntenati(el) {
  const out = [];
  let cur = el.parentElement;
  while (cur) {
    out.push(cur.tagName.toLowerCase());
    cur = cur.parentElement;
  }
  return out; // es. ['td','tr','tbody','table','div','body','html']
}

/* ------------------------------------------------------------
   15) childElementCount e controllo "lista vuota"
   ------------------------------------------------------------ */

// Esempio browser: mostro placeholder se non ci sono reparti
function listaVuota() {
  const ul = document.querySelector('#reparti');
  if (ul.childElementCount === 0) {
    ul.append(Object.assign(document.createElement('li'), {
      textContent: 'Nessun reparto',
    }));
  }
}

/* ------------------------------------------------------------
   16) TROVARE l'indice di un figlio tra i siblings
   Non esiste un .index nativo: lo ricaviamo dai children.
   ------------------------------------------------------------ */

// Esempio browser
function indiceTraSiblings(el) {
  const figli = el.parentElement.children;       // HTMLCollection
  return Array.from(figli).indexOf(el);          // 0-based, -1 se assente
}

/* ------------------------------------------------------------
   17) NodeList LIVE vs STATIC (gotcha avanzato)
   - element.children e getElementsByClassName -> LIVE (si aggiornano)
   - querySelectorAll -> STATIC (fotografia al momento della chiamata)
   ------------------------------------------------------------ */

// Esempio browser
function liveVsStatic() {
  const cont = document.querySelector('#lista');
  const live = cont.getElementsByTagName('li');   // LIVE
  const statica = cont.querySelectorAll('li');     // STATIC
  cont.append(document.createElement('li'));
  // live.length e' aumentato; statica.length e' rimasto invariato
  return { live: live.length, statica: statica.length };
}

/* ------------------------------------------------------------
   18) closest + dataset: leggere dati di dominio dal markup
   Pattern ricorrente: il bottone non sa nulla, risale alla card
   che porta i data-attribute (badge, reparto, turno).
   ------------------------------------------------------------ */

// Esempio browser
function leggiContestoDipendente(target) {
  const card = target.closest('[data-badge]');
  if (!card) return null;
  return {
    badge: card.dataset.badge,                 // 'UP-001'
    reparto: card.dataset.reparto ?? 'XX',     // nullish fallback
    turno: card.dataset.turno?.toUpperCase(),  // optional chaining
  };
}

/* ------------------------------------------------------------
   19) TRAVERSAL ricorsivo: visitare tutto il sottoalbero
   Esempio: contare quanti elementi di un certo tag esistono
   sotto un nodo, scritto a mano per capire la struttura ad albero.
   ------------------------------------------------------------ */

// Esempio browser
function contaTag(root, tag) {
  let totale = 0;
  for (const figlio of root.children) {
    if (figlio.tagName.toLowerCase() === tag) totale += 1;
    totale += contaTag(figlio, tag); // ricorsione sui nipoti
  }
  return totale;
}

/* ------------------------------------------------------------
   20) MINI SIMULAZIONE eseguibile in Node
   Riproduciamo un piccolo albero DOM con oggetti per dimostrare
   la logica di parent/children/siblings senza un browser.
   ------------------------------------------------------------ */

function nodo(tag, figli = []) {
  const n = { tag, children: figli, parent: null };
  figli.forEach((f) => (f.parent = n));
  return n;
}

const albero = nodo('table', [
  nodo('tr', [nodo('td'), nodo('td')]),
  nodo('tr', [nodo('td'), nodo('td')]),
]);

// firstElementChild simulato
console.log(albero.children[0].tag); // => tr
// parentElement simulato
console.log(albero.children[0].parent.tag); // => table
// nextElementSibling simulato (indice tra i fratelli)
const prima = albero.children[0];
const idx = prima.parent.children.indexOf(prima);
console.log(prima.parent.children[idx + 1]?.tag); // => tr

/* ============================================================
   RIEPILOGO COMANDI
   - node.nodeType (1 element, 3 text, 8 comment)
   - parentNode / parentElement
   - childNodes (tutti) / children (solo element)
   - firstChild / lastChild
   - firstElementChild / lastElementChild
   - nextSibling / previousSibling
   - nextElementSibling / previousElementSibling
   - closest(selettore)
   - matches(selettore)
   - contains(node)
   - querySelector / querySelectorAll (anche su un elemento)
   - childElementCount
   - getElementsByTagName / getElementsByClassName (LIVE)
   - Array.from(collection) / [...collection]
   - createElement / append / prepend / before / after
   - insertAdjacentElement
   - element.dataset (data-* attributes)
   - classList.add / contains
   - event delegation con e.target.closest(...)
   ============================================================ */
