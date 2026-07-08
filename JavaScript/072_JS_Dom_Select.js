/* ============================================================
   72 JS Dom Select
   Selezione degli elementi nel DOM (Document Object Model).
   In questa scheda vediamo come "trovare" gli elementi di una
   pagina HTML per poi leggerli o modificarli: getElementById,
   querySelector / querySelectorAll, getElementsByClassName,
   getElementsByTagName e getElementsByName. Capiremo la
   differenza fondamentale tra NodeList "statica" (querySelectorAll)
   e HTMLCollection "live" (getElementsByClassName).
   NB: il DOM esiste solo nel browser; in Node non c'e' "document".
   ============================================================ */

// ------------------------------------------------------------
// 0) PREMESSA: cos'e' il DOM
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// Il browser trasforma l'HTML in un albero di oggetti (node).
// L'oggetto globale "document" e' la radice da cui partiamo per
// selezionare gli elementi. Tutto cio' che segue presuppone un
// document, quindi lo incapsuliamo in funzioni o lo commentiamo.

/*
  HTML di riferimento usato negli esempi (gestionale dipendenti):

  <input id="badge" name="codiceBadge" value="UP-001">
  <table id="tabella-dipendenti">
    <tr class="riga dipendente" data-reparto="MO"><td>Mario</td></tr>
    <tr class="riga dipendente" data-reparto="UF"><td>Luisa</td></tr>
    <tr class="riga archiviato"><td>Vecchio</td></tr>
  </table>
  <button class="azione" data-id="1">Modifica</button>
  <button class="azione" data-id="2">Elimina</button>
*/

// ------------------------------------------------------------
// 1) getElementById: il piu' veloce e diretto
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// Ritorna UN solo elemento (l'id deve essere unico) oppure null.
function leggiBadge() {
  const input = document.getElementById('badge'); // niente '#'
  return input.value; // => 'UP-001'
}

// Se l'id non esiste, ritorna null: attenzione al crash.
function leggiBadgeSicuro() {
  const input = document.getElementById('badge');
  return input?.value ?? 'NESSUN-BADGE'; // optional chaining + nullish
}

// ------------------------------------------------------------
// 2) querySelector: selettori CSS, ritorna il PRIMO match
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// Accetta qualsiasi selettore CSS: #id, .classe, tag, [attributo].
function selettoriBase() {
  const perId = document.querySelector('#badge');          // per id
  const perClasse = document.querySelector('.dipendente'); // prima .dipendente
  const perTag = document.querySelector('table');          // primo <table>
  const perAttr = document.querySelector('[name="codiceBadge"]');
  return { perId, perClasse, perTag, perAttr };
}

// Selettori combinati (discendenti, figli diretti, multipli).
function selettoriAvanzati() {
  const cella = document.querySelector('#tabella-dipendenti td');    // discendente
  const figlioDiretto = document.querySelector('table > tr');        // figlio diretto
  const primoOppure = document.querySelector('.archiviato, .nuovo'); // OR di selettori
  const conData = document.querySelector('tr[data-reparto="MO"]');   // attributo esatto
  return { cella, figlioDiretto, primoOppure, conData };
}

// Pseudo-classi CSS: :first-child, :last-child, :not(...)
function pseudoClassi() {
  const prima = document.querySelector('#tabella-dipendenti tr:first-child');
  const ultima = document.querySelector('#tabella-dipendenti tr:last-child');
  const nonArchiviati = document.querySelector('tr:not(.archiviato)');
  return { prima, ultima, nonArchiviati };
}

// ------------------------------------------------------------
// 3) querySelectorAll: ritorna TUTTI i match (NodeList statica)
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// La NodeList e' "statica": fotografa il DOM al momento della query.
function contaDipendenti() {
  const righe = document.querySelectorAll('.dipendente');
  return righe.length; // => 2
}

// La NodeList ha forEach() nativo (a differenza di HTMLCollection).
function evidenziaRighe() {
  const righe = document.querySelectorAll('#tabella-dipendenti tr');
  righe.forEach((tr, i) => {
    tr.dataset.indice = String(i); // aggiungo data-indice="0","1",...
  });
}

// Per usare map/filter/reduce serve convertire la NodeList in Array.
function nomiDipendenti() {
  const celle = document.querySelectorAll('.dipendente td');
  // Array.from oppure spread [...celle]
  return Array.from(celle).map((td) => td.textContent.trim());
  // => ['Mario', 'Luisa']
}

// Pattern ERP: trasformare righe DOM in DTO (come si fa con le query).
function righeInDTO() {
  const righe = [...document.querySelectorAll('tr.dipendente')];
  return righe.map((tr) => ({
    nome: tr.querySelector('td')?.textContent.trim() ?? '',
    reparto: tr.dataset.reparto ?? 'XX', // nullish per sigla mancante
  }));
  // => [{ nome:'Mario', reparto:'MO' }, { nome:'Luisa', reparto:'UF' }]
}

// ------------------------------------------------------------
// 4) getElementsByClassName: HTMLCollection LIVE
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// Ritorna una HTMLCollection "live": si aggiorna da sola se il DOM
// cambia. NON ha forEach/map: va convertita o iterata con for.
function contaAzioni() {
  const bottoni = document.getElementsByClassName('azione'); // niente '.'
  return bottoni.length; // numero di bottoni .azione attuali
}

// Dimostrazione del comportamento LIVE vs STATICO.
function liveVsStatico() {
  const live = document.getElementsByClassName('dipendente');     // HTMLCollection
  const statico = document.querySelectorAll('.dipendente');       // NodeList
  const prima = { live: live.length, statico: statico.length };   // es: 2 / 2

  // Aggiungo una nuova riga .dipendente al volo:
  const tr = document.createElement('tr');
  tr.className = 'riga dipendente';
  document.getElementById('tabella-dipendenti').appendChild(tr);

  // live si e' aggiornata, statico no:
  return { prima, dopoLive: live.length, dopoStatico: statico.length };
  // => prima:{2,2}  dopoLive:3  dopoStatico:2
}

// Iterare una HTMLCollection: for...of oppure Array.from.
function iteraAzioni() {
  const bottoni = document.getElementsByClassName('azione');
  const ids = [];
  for (const b of bottoni) ids.push(Number(b.dataset.id));
  return ids; // => [1, 2]
}

// ------------------------------------------------------------
// 5) getElementsByTagName e getElementsByName (anch'esse live)
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
function altreSelezioni() {
  const tutteLeRighe = document.getElementsByTagName('tr');     // HTMLCollection
  const perName = document.getElementsByName('codiceBadge');    // NodeList per name=
  return { righe: tutteLeRighe.length, badge: perName.length };
}

// ------------------------------------------------------------
// 6) Selezione "scoped": cercare DENTRO un elemento
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// I metodi querySelector* esistono anche sui singoli elementi:
// la ricerca parte da quel nodo, non da tutto il document.
function dentroLaTabella() {
  const tabella = document.getElementById('tabella-dipendenti');
  // cerco SOLO dentro la tabella, ignorando il resto della pagina
  const primaCella = tabella.querySelector('td');
  const tutteLeCelle = tabella.querySelectorAll('td');
  return { primaCella, totaleCelle: tutteLeCelle.length };
}

// ------------------------------------------------------------
// 7) Pattern pratici ERP con la selezione
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.

// 7a) Validare il formato badge letto dal DOM (regex come nel gestionale).
function validaBadgeDalDOM() {
  const valore = document.getElementById('badge')?.value ?? '';
  const normalizzato = String(valore).trim().toUpperCase().replace(/\s+/g, '');
  const ok = /^UP-\d{3}$/.test(normalizzato); // es 'UP-001'
  return { normalizzato, ok }; // => { normalizzato:'UP-001', ok:true }
}

// 7b) Sommare i minuti lavorati letti da celle con data-minuti.
function totaleMinutiTurni() {
  const celle = document.querySelectorAll('td[data-minuti]');
  return [...celle]
    .map((td) => Number(td.dataset.minuti))
    .filter((m) => !Number.isNaN(m))
    .reduce((somma, m) => somma + m, 0);
  // => totale minuti di tutti i turni mostrati in tabella
}

// 7c) Filtrare le righe dipendente di un certo reparto.
function righePerReparto(sigla) {
  // selettore con attributo dinamico costruito via template literal
  const righe = document.querySelectorAll(`tr.dipendente[data-reparto="${sigla}"]`);
  return [...righe].map((tr) => tr.querySelector('td')?.textContent.trim());
}
// righePerReparto('MO') => ['Mario']

// 7d) Verificare che TUTTE le taglie vestiario siano selezionate
//     (some/every su elementi del DOM, pattern di validazione form).
function tuttiSelezionati() {
  const select = document.querySelectorAll('select.taglia');
  const tutti = [...select].every((s) => s.value !== '');
  const almenoUno = [...select].some((s) => s.value !== '');
  return { tutti, almenoUno };
}

// ------------------------------------------------------------
// 8) Errori comuni e differenze chiave
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// - getElementById('#x')  -> SBAGLIATO: niente '#', solo l'id.
// - querySelector('badge') -> SBAGLIATO se 'badge' e' un id: serve '#badge'.
// - getElementsByClassName(...).forEach -> ERRORE: non e' un Array.
// - querySelector ritorna 1 elemento o null; querySelectorAll una lista (mai null).
function differenzeChiave() {
  const uno = document.querySelector('.dipendente');       // Element | null
  const tanti = document.querySelectorAll('.dipendente');  // NodeList (length 0 se nulla)
  const live = document.getElementsByClassName('dipendente'); // HTMLCollection live
  return {
    unoEnull: uno === null,
    tantiVuoto: tanti.length === 0,
    liveVuoto: live.length === 0,
  };
}

// ------------------------------------------------------------
// 9) Mini-demo eseguibile in Node (senza DOM) per fissare i concetti
// ------------------------------------------------------------
// Qui simuliamo la differenza statico/live con array normali, cosi'
// vedi un output reale anche fuori dal browser.
const datasetSimulato = ['Mario', 'Luisa'];
const fotoStatica = [...datasetSimulato]; // copia: NON si aggiorna
datasetSimulato.push('Giulia');           // modifico l'originale
console.log('statica (querySelectorAll):', fotoStatica.length);   // => 2
console.log('live (getElementsByClassName):', datasetSimulato.length); // => 3

// ============================================================
// RIEPILOGO COMANDI
// ============================================================
// - document.getElementById('id')              -> 1 elemento o null
// - document.querySelector('selettoreCSS')     -> primo match o null
// - document.querySelectorAll('selettoreCSS')  -> NodeList STATICA (ha forEach)
// - document.getElementsByClassName('classe')  -> HTMLCollection LIVE
// - document.getElementsByTagName('tag')       -> HTMLCollection LIVE
// - document.getElementsByName('name')         -> NodeList per attributo name
// - elemento.querySelector / querySelectorAll  -> ricerca "scoped" nel nodo
// - Array.from(lista) / [...lista]             -> converte in Array (map/filter/reduce)
// - lista.forEach(...)                         -> solo NodeList (non HTMLCollection)
// - el.textContent / el.value / el.dataset.x   -> lettura contenuto/valore/data-attr
// - el?.value ?? 'fallback'                     -> accesso sicuro (optional + nullish)
// - selettori: '#id' '.classe' 'tag' '[attr="v"]' 'a > b' 'a b' ':not()' :first-child
