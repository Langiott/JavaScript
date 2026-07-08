/* ============================================================
   71 JS Dom Intro
   Il DOM (Document Object Model) e' la rappresentazione ad
   albero che il browser costruisce a partire dall'HTML. Ogni
   tag, attributo e testo diventa un "node" dell'albero, e il
   punto di ingresso e' l'oggetto globale `document`. In questa
   scheda vediamo cosa sono i node, la differenza tra "node" ed
   "element", come e' fatto l'albero (parent, child, sibling) e
   come navigarlo. NOTA: il DOM esiste solo nel BROWSER, in Node
   l'oggetto `document` non esiste (a meno di librerie come jsdom).
   ============================================================ */

// ------------------------------------------------------------
// 0) DOVE GIRA QUESTO CODICE
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// In Node `document` e `window` non esistono: gli esempi qui sotto
// sono "pseudo-eseguibili", li racchiudiamo in funzioni cosi' il
// file e' importabile in Node senza crashare a import-time.

// Possiamo pero' rilevare l'ambiente in modo sicuro anche in Node:
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
console.log('Siamo nel browser?', isBrowser); // => false (in Node)

// ------------------------------------------------------------
// 1) IL PUNTO DI INGRESSO: document
// ------------------------------------------------------------
// `document` rappresenta l'intero documento HTML caricato.
// E' la radice da cui parte ogni selezione e navigazione.
function esempioDocument() {
  // Esempio browser: gira nel browser, non in Node.
  console.log(document.nodeType);     // => 9  (DOCUMENT_NODE)
  console.log(document.nodeName);     // => "#document"
  console.log(document.documentElement.tagName); // => "HTML"
  console.log(document.head, document.body);      // i due figli principali
  console.log(document.title);        // titolo della pagina
}

// ------------------------------------------------------------
// 2) NODE vs ELEMENT (la distinzione chiave)
// ------------------------------------------------------------
// - Un "Node" e' QUALSIASI cosa nell'albero: elementi, testo,
//   commenti, il documento stesso.
// - Un "Element" e' un tipo SPECIFICO di node: un tag HTML.
// Quindi: ogni Element e' un Node, ma non ogni Node e' un Element.
//
// nodeType piu' comuni:
//   1  -> ELEMENT_NODE   (<div>, <p>, <span>...)
//   3  -> TEXT_NODE      (il testo dentro i tag)
//   8  -> COMMENT_NODE   (<!-- ... -->)
//   9  -> DOCUMENT_NODE  (document)
const NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
};
console.log(NODE_TYPES.ELEMENT_NODE); // => 1

function differenzaNodeElement() {
  // Esempio browser: gira nel browser, non in Node.
  // Dato <p>Ciao <b>mondo</b></p>
  const p = document.querySelector('p');
  // childNodes include ANCHE i text node; children solo gli element.
  console.log(p.childNodes.length); // => 2 (text "Ciao " + <b>)
  console.log(p.children.length);   // => 1 (solo <b>)
  console.log(p.firstChild.nodeType);        // => 3 (TEXT_NODE)
  console.log(p.firstElementChild.nodeType); // => 1 (ELEMENT_NODE)
}

// ------------------------------------------------------------
// 3) L'ALBERO: parent, child, sibling
// ------------------------------------------------------------
// Ogni node (tranne la radice) ha UN parent e zero o piu' child.
// I node con lo stesso parent sono "sibling" (fratelli).
function navigazioneAlbero() {
  // Esempio browser: gira nel browser, non in Node.
  const el = document.querySelector('#badge');

  // Verso l'alto
  console.log(el.parentNode);     // node genitore (anche document/fragment)
  console.log(el.parentElement);  // element genitore (null se non e' un element)

  // Verso il basso (versione "Node", include text/commenti)
  console.log(el.childNodes);     // NodeList di tutti i node figli
  console.log(el.firstChild);
  console.log(el.lastChild);

  // Verso il basso (versione "Element", solo tag)
  console.log(el.children);          // HTMLCollection di soli element
  console.log(el.firstElementChild);
  console.log(el.lastElementChild);
  console.log(el.childElementCount); // numero di element figli

  // Di lato (sibling)
  console.log(el.nextSibling);            // node successivo (anche text)
  console.log(el.previousSibling);
  console.log(el.nextElementSibling);     // element successivo
  console.log(el.previousElementSibling);
}

// ------------------------------------------------------------
// 4) SIMULIAMO L'ALBERO IN NODE (per capire la struttura)
// ------------------------------------------------------------
// Per ragionare sull'albero senza browser, modelliamo i node
// con semplici oggetti JS. E' utile per fissare il concetto.
const alberoFinto = {
  nodeName: 'BODY',
  nodeType: 1,
  children: [
    { nodeName: 'HEADER', nodeType: 1, children: [] },
    {
      nodeName: 'MAIN', nodeType: 1, children: [
        { nodeName: 'H1', nodeType: 1, children: [] },
        { nodeName: 'TABLE', nodeType: 1, children: [] },
      ],
    },
    { nodeName: 'FOOTER', nodeType: 1, children: [] },
  ],
};

// Visita ricorsiva dell'albero (depth-first), pattern fondamentale.
function visita(node, livello = 0) {
  console.log('  '.repeat(livello) + node.nodeName);
  for (const figlio of node.children) {
    visita(figlio, livello + 1);
  }
}
visita(alberoFinto);
// => BODY
//      HEADER
//      MAIN
//        H1
//        TABLE
//      FOOTER

// Conta tutti i node element dell'albero (ricorsione + reduce).
function contaNode(node) {
  return node.children.reduce((tot, figlio) => tot + contaNode(figlio), 1);
}
console.log(contaNode(alberoFinto)); // => 6

// ------------------------------------------------------------
// 5) COLLECTIONS: NodeList vs HTMLCollection
// ------------------------------------------------------------
// Selezionando piu' element si ottengono "collezioni" simili ad
// array ma NON array veri. Per usare map/filter si convertono.
function collezioni() {
  // Esempio browser: gira nel browser, non in Node.
  const lista = document.querySelectorAll('li'); // NodeList (statica)
  const live = document.getElementsByTagName('li'); // HTMLCollection (live)

  // Conversione ad array per usare i metodi degli array:
  const arr = Array.from(lista);
  const arr2 = [...live];
  console.log(arr.length, arr2.length);

  // map() per estrarre dati: pattern "trasforma node in DTO"
  const testi = Array.from(lista).map((li) => li.textContent.trim());
  console.log(testi);
}

// ------------------------------------------------------------
// 6) ESEMPIO ERP: render badge dipendenti (pattern map -> DOM)
// ------------------------------------------------------------
// Pattern reale: una query restituisce dipendenti, li trasformo
// in righe DOM. Qui prima la parte "pura" (eseguibile in Node),
// poi la parte DOM (solo browser).
const dipendenti = [
  { id: 1, nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001', reparto: 'PR' },
  { id: 2, nome: 'Lucia', cognome: 'Bianchi', codiceBadge: 'UP-014', reparto: 'MG' },
  { id: 3, nome: 'Anna', cognome: 'Verdi', codiceBadge: 'UP-007', reparto: null },
];

// Parte pura: trasformo i record in DTO da mostrare (map + nullish).
const righeBadge = dipendenti.map((d) => ({
  badge: d.codiceBadge,
  etichetta: `${d.nome} ${d.cognome}`, // template literal
  reparto: d.reparto ?? 'XX',          // nullish coalescing
}));
console.log(righeBadge[2]); // => { badge: 'UP-007', etichetta: 'Anna Verdi', reparto: 'XX' }

function renderBadgeNelDom(righe) {
  // Esempio browser: gira nel browser, non in Node.
  const ul = document.querySelector('#elenco-badge');
  ul.innerHTML = ''; // svuoto i node esistenti
  for (const r of righe) {
    const li = document.createElement('li');   // creo un nuovo Element node
    li.textContent = `${r.badge} - ${r.etichetta} (${r.reparto})`;
    ul.appendChild(li);                         // lo attacco come child
  }
  console.log(ul.childElementCount); // => numero di righe
}

// ------------------------------------------------------------
// 7) ATTRIBUTI E PROPRIETA' DI UN ELEMENT NODE
// ------------------------------------------------------------
function attributi() {
  // Esempio browser: gira nel browser, non in Node.
  const el = document.querySelector('#badge');
  console.log(el.tagName);              // => "DIV"  (sempre maiuscolo)
  console.log(el.id);                   // => "badge"
  console.log(el.className);            // stringa delle classi
  console.log(el.classList);            // API comoda: add/remove/toggle
  console.log(el.getAttribute('data-codice')); // attributo grezzo
  el.setAttribute('data-codice', 'UP-001');
  console.log(el.dataset.codice);       // => "UP-001" (accesso ai data-*)
  console.log(el.textContent);          // testo (tutti i text node concatenati)
  console.log(el.innerHTML);            // markup interno come stringa
}

// ------------------------------------------------------------
// 8) VERIFICARE IL TIPO DI UN NODE (pattern difensivo)
// ------------------------------------------------------------
// Funzione helper che descrive un node a partire dal nodeType.
function descriviNode(nodeType) {
  switch (nodeType) {
    case 1: return 'Element';
    case 3: return 'Text';
    case 8: return 'Comment';
    case 9: return 'Document';
    default: return 'Altro';
  }
}
console.log(descriviNode(1)); // => "Element"
console.log(descriviNode(3)); // => "Text"
console.log(descriviNode(9)); // => "Document"

// In browser si usa instanceof per discriminare i tipi:
function controlloTipo(node) {
  // Esempio browser: gira nel browser, non in Node.
  if (node instanceof Element) console.log('e un element');
  else if (node.nodeType === 3) console.log('e un text node');
}

// ------------------------------------------------------------
// 9) FILTRARE I NODE FIGLI (solo element, ignorando il testo)
// ------------------------------------------------------------
// childNodes contiene anche i text node "vuoti" (spazi/indent):
// spesso vogliamo solo gli element. Mostriamo il pattern.
function soloElementFigli() {
  // Esempio browser: gira nel browser, non in Node.
  const ul = document.querySelector('ul');
  const elementi = [...ul.childNodes].filter((n) => n.nodeType === 1);
  // equivalente piu' diretto: [...ul.children]
  console.log(elementi.length);
}

// ------------------------------------------------------------
// 10) ESEMPIO ERP: contare turni "attivi" e dipingere lo stato
// ------------------------------------------------------------
// Parte pura: filtro/some come nei pattern ERP (validazione turni).
const timbrature = [
  { badge: 'UP-001', ingresso: '08:00', uscita: null },
  { badge: 'UP-014', ingresso: '08:05', uscita: '17:00' },
  { badge: 'UP-007', ingresso: '09:00', uscita: null },
];
const ancoraDentro = timbrature.filter((t) => t.uscita === null);
console.log(ancoraDentro.length); // => 2
const ceQualcunoDentro = timbrature.some((t) => t.uscita === null);
console.log(ceQualcunoDentro);    // => true

function dipingiStatoPresenze(timb) {
  // Esempio browser: gira nel browser, non in Node.
  for (const t of timb) {
    const cella = document.querySelector(`[data-badge="${t.badge}"]`);
    if (!cella) continue;
    // toggle di classe in base allo stato del node
    cella.classList.toggle('presente', t.uscita === null);
    cella.textContent = t.uscita === null ? 'In sede' : 'Uscito';
  }
}

// ------------------------------------------------------------
// 11) RIASSUNTO MENTALE DELLA GERARCHIA
// ------------------------------------------------------------
// window  -> oggetto globale del browser (NON e' parte del DOM)
//   document        (nodeType 9, la radice del DOM)
//     documentElement -> <html>
//       <head> ... </head>
//       <body>
//         <element> ... </element>   (nodeType 1)
//           "testo"                  (nodeType 3)
//           <!-- commento -->        (nodeType 8)
console.log('window > document > html > body > element > text');

// ------------------------------------------------------------
// RIEPILOGO COMANDI
// ------------------------------------------------------------
// document, document.documentElement, document.head, document.body, document.title
// node.nodeType, node.nodeName, element.tagName
// nodeType: 1 Element, 3 Text, 8 Comment, 9 Document
// parentNode, parentElement
// childNodes, children, firstChild, lastChild, firstElementChild, lastElementChild
// childElementCount
// nextSibling, previousSibling, nextElementSibling, previousElementSibling
// querySelector, querySelectorAll, getElementsByTagName
// NodeList vs HTMLCollection, Array.from(...), [...collection]
// createElement, appendChild, innerHTML, textContent
// id, className, classList (add/remove/toggle), getAttribute, setAttribute, dataset
// instanceof Element, typeof window/document (rilevamento ambiente)
// map / filter / some / reduce per trasformare e contare i node
