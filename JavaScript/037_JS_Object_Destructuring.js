/* ============================================================
   37 JS Object Destructuring
   Il destructuring degli oggetti permette di estrarre proprieta da
   un object e assegnarle a variabili con una sintassi compatta.
   In questo file vediamo: estrazione base, rename (alias), default
   values, nested destructuring, combinazione con rest, e l'uso del
   destructuring direttamente nei parametri di funzione (pattern
   molto comune nelle API e nei componenti). Tutti gli esempi sono
   eseguibili con Node.js.
   ============================================================ */

// ------------------------------------------------------------
// 1) BASE: estrarre proprieta in variabili
// ------------------------------------------------------------

// Senza destructuring si accede con la dot notation.
const dipendente = { nome: 'Mario', cognome: 'Rossi', badge: 'UP-001' };
const nomeVecchioStile = dipendente.nome;
console.log(nomeVecchioStile); // => Mario

// Con destructuring: il nome della variabile deve combaciare con la key.
const { nome, cognome } = dipendente;
console.log(nome, cognome); // => Mario Rossi

// Si possono estrarre solo alcune key, le altre vengono ignorate.
const { badge } = dipendente;
console.log(badge); // => UP-001

// L'ordine non conta: conta il nome della key, non la posizione.
const { cognome: c1, nome: n1 } = dipendente;
console.log(n1, c1); // => Mario Rossi

// ------------------------------------------------------------
// 2) RENAME (alias): { key: nuovoNome }
// ------------------------------------------------------------

// Utile quando la key non e un nome di variabile valido o crea conflitti.
const reparto = { sigla: 'UP', descrizione: 'Ufficio Produzione' };
const { sigla: siglaReparto, descrizione: descReparto } = reparto;
console.log(siglaReparto); // => UP
console.log(descReparto);  // => Ufficio Produzione

// Esempio: mappare un record DB in un DTO con nomi diversi.
const row = { articolo_poly: 'ART-77', q_ta: 12 };
const { articolo_poly: codiceArticolo, q_ta: quantita } = row;
console.log(codiceArticolo, quantita); // => ART-77 12

// ------------------------------------------------------------
// 3) DEFAULT VALUES: { key = valoreDefault }
// ------------------------------------------------------------

// Il default scatta SOLO se la proprieta e undefined (non per null o 0).
const impostazioni = { regola: 'arrotonda5' };
const { regola = 'nessuna', soglia = 15 } = impostazioni;
console.log(regola); // => arrotonda5
console.log(soglia); // => 15 (mancava: usa il default)

// Attenzione: null NON attiva il default.
const cfg = { timeout: null };
const { timeout = 3000 } = cfg;
console.log(timeout); // => null

// Default + rename insieme: { key: nuovoNome = default }
const turno = {};
const { tipo: tipoTurno = 'P4' } = turno;
console.log(tipoTurno); // => P4

// ------------------------------------------------------------
// 4) DEFAULT che usa altre variabili estratte
// ------------------------------------------------------------

// I default possono riferirsi a variabili dichiarate prima nello stesso pattern.
const range = { inizio: '08:00' };
const { inizio, fine = inizio } = range;
console.log(inizio, fine); // => 08:00 08:00

// ------------------------------------------------------------
// 5) NESTED DESTRUCTURING: oggetti dentro oggetti
// ------------------------------------------------------------

const timbratura = {
  id: 1,
  dipendente: { nome: 'Anna', reparto: { sigla: 'MG', piano: 2 } },
  oreLavorate: 8,
};

// Si "scende" nella struttura replicandone la forma.
const { dipendente: { nome: nomeDip } } = timbratura;
console.log(nomeDip); // => Anna

// Nested su piu livelli + rename.
const { dipendente: { reparto: { sigla: siglaNested } } } = timbratura;
console.log(siglaNested); // => MG

// Nota: il nested NON crea la variabile intermedia 'dipendente'.
// Per averla, va estratta esplicitamente:
const { dipendente: dipObj, oreLavorate } = timbratura;
console.log(dipObj.nome, oreLavorate); // => Anna 8

// ------------------------------------------------------------
// 6) NESTED con default a piu livelli
// ------------------------------------------------------------

// Se il ramo intermedio puo mancare, mettere un default {} evita errori.
const recordParziale = { id: 5 };
const { dettagli: { note = 'nessuna' } = {} } = recordParziale;
console.log(note); // => nessuna

// ------------------------------------------------------------
// 7) REST in destructuring: { a, ...resto }
// ------------------------------------------------------------

// Raccoglie tutte le key NON estratte in un nuovo object.
const assegnazione = { vestiario: 'tuta', taglia: 'L', quantita: 2, badge: 'UP-002' };
const { vestiario, ...rest } = assegnazione;
console.log(vestiario);    // => tuta
console.log(rest);         // => { taglia: 'L', quantita: 2, badge: 'UP-002' }

// Pattern utile per rimuovere una key da un object (immutabile).
const { badge: _scartato, ...senzaBadge } = assegnazione;
console.log(senzaBadge); // => { vestiario: 'tuta', taglia: 'L', quantita: 2 }

// ------------------------------------------------------------
// 8) DESTRUCTURING NEI PARAMETRI DI FUNZIONE
// ------------------------------------------------------------

// Invece di ricevere un object e accedere alle key dentro, si destruttura
// direttamente nella firma. Rende esplicito cosa serve alla funzione.
function saluta({ nome, cognome }) {
  return `Buongiorno ${nome} ${cognome}`;
}
console.log(saluta(dipendente)); // => Buongiorno Mario Rossi

// Con default per i singoli campi.
function creaBadge({ prefisso = 'UP', numero }) {
  return `${prefisso}-${String(numero).padStart(3, '0')}`;
}
console.log(creaBadge({ numero: 7 }));            // => UP-007
console.log(creaBadge({ prefisso: 'MG', numero: 42 })); // => MG-042

// ------------------------------------------------------------
// 9) PARAMETRO OGGETTO OPZIONALE: default = {}
// ------------------------------------------------------------

// Se la funzione puo essere chiamata senza argomenti, il default {}
// evita "Cannot destructure property of undefined".
function configuraTurno({ tipo = 'P4', pausa = true } = {}) {
  return { tipo, pausa };
}
console.log(configuraTurno());                 // => { tipo: 'P4', pausa: true }
console.log(configuraTurno({ tipo: 'P2', pausa: false })); // => { tipo: 'P2', pausa: false }

// ------------------------------------------------------------
// 10) NESTED nei parametri di funzione
// ------------------------------------------------------------

function nomeDipendente({ dipendente: { nome, reparto: { sigla } } }) {
  return `${nome} (${sigla})`;
}
console.log(nomeDipendente(timbratura)); // => Anna (MG)

// ------------------------------------------------------------
// 11) DESTRUCTURING + REST nei parametri
// ------------------------------------------------------------

// Separa una key "speciale" dal resto delle opzioni.
function applicaFiltro({ reparto, ...filtri }) {
  return { repartoSelezionato: reparto, altriFiltri: filtri };
}
console.log(applicaFiltro({ reparto: 'UP', attivo: true, anno: 2026 }));
// => { repartoSelezionato: 'UP', altriFiltri: { attivo: true, anno: 2026 } }

// ------------------------------------------------------------
// 12) MERGE di default + override (pattern impostazioni ERP)
// ------------------------------------------------------------

// Spread per costruire l'object, poi destructuring per leggerlo.
const DEFAULT = { regolaArrotondamento: 'nessuna', tolleranza: 5, turni: [] };
function leggiImpostazioni(impostazioni = {}) {
  const merged = { ...DEFAULT, ...impostazioni };
  const { regolaArrotondamento, tolleranza, turni } = merged;
  return { regolaArrotondamento, tolleranza, numTurni: turni.length };
}
console.log(leggiImpostazioni({ tolleranza: 10 }));
// => { regolaArrotondamento: 'nessuna', tolleranza: 10, numTurni: 0 }

// ------------------------------------------------------------
// 13) DESTRUCTURING in cicli e iterazioni
// ------------------------------------------------------------

const dipendenti = [
  { nome: 'Mario', reparto: { sigla: 'UP' } },
  { nome: 'Anna', reparto: { sigla: 'MG' } },
];

// Direttamente nel for...of.
for (const { nome, reparto: { sigla } } of dipendenti) {
  console.log(`${nome} -> ${sigla}`);
}
// => Mario -> UP
// => Anna -> MG

// Nel callback di map (parametro destrutturato).
const sigle = dipendenti.map(({ reparto: { sigla } }) => sigla);
console.log(sigle); // => [ 'UP', 'MG' ]

// Object.entries + destructuring dell'entry [key, value].
const scorte = { tuta: 5, guanti: 0, mascherina: 12 };
for (const [articolo, qta] of Object.entries(scorte)) {
  console.log(`${articolo}: ${qta}`);
}
// => tuta: 5 / guanti: 0 / mascherina: 12

// ------------------------------------------------------------
// 14) RIASSEGNARE variabili esistenti (servono le parentesi)
// ------------------------------------------------------------

let x = 0, y = 0;
// Le () evitano che { } sia interpretato come blocco di codice.
({ x, y } = { x: 10, y: 20 });
console.log(x, y); // => 10 20

// ------------------------------------------------------------
// 15) DESTRUCTURING + optional chaining + nullish coalescing
// ------------------------------------------------------------

// Spesso il dato dal DB ha relazioni opzionali: si combina destructuring
// per la parte sicura e ?. / ?? per quella incerta.
function descriviRiga(riga) {
  const { id, dipendente } = riga;
  const nome = dipendente?.nome ?? 'sconosciuto';
  const sigla = dipendente?.reparto?.sigla ?? 'XX';
  return `#${id} ${nome} [${sigla}]`;
}
console.log(descriviRiga({ id: 1, dipendente: { nome: 'Lia' } })); // => #1 Lia [XX]
console.log(descriviRiga({ id: 2 }));                              // => #2 sconosciuto [XX]

// ------------------------------------------------------------
// 16) RITORNARE PIU VALORI come object e destrutturarli
// ------------------------------------------------------------

// Pattern "named return": piu chiaro di un array quando i valori hanno senso.
function calcolaOre(timbrature) {
  const minuti = timbrature.reduce((s, t) => s + t.minuti, 0);
  return { ore: Math.floor(minuti / 60), minuti: minuti % 60 };
}
const { ore, minuti: min } = calcolaOre([{ minuti: 90 }, { minuti: 75 }]);
console.log(`${ore}h ${min}m`); // => 2h 45m

// ------------------------------------------------------------
// 17) ESEMPIO PRATICO COMPLETO (gestionale): normalizza assegnazione DPI
// ------------------------------------------------------------

function normalizzaAssegnazioneDPI({
  dipendente: { nome = '?', cognome = '?' } = {},
  articolo: { codice, descrizione = 'DPI generico' } = {},
  taglia = 'U',
  quantita = 1,
  scortaMinima = 0,
} = {}) {
  const sottoScorta = quantita < scortaMinima;
  return {
    intestatario: `${nome} ${cognome}`.trim(),
    codice,
    descrizione,
    taglia,
    quantita,
    sottoScorta,
  };
}

console.log(normalizzaAssegnazioneDPI({
  dipendente: { nome: 'Mario', cognome: 'Rossi' },
  articolo: { codice: 'DPI-09', descrizione: 'Guanti antitaglio' },
  taglia: 'L',
  quantita: 1,
  scortaMinima: 3,
}));
// => {
//      intestatario: 'Mario Rossi', codice: 'DPI-09',
//      descrizione: 'Guanti antitaglio', taglia: 'L',
//      quantita: 1, sottoScorta: true
//    }

// Chiamata senza argomenti: tutti i default coprono i campi mancanti.
console.log(normalizzaAssegnazioneDPI());
// => { intestatario: '?', codice: undefined, descrizione: 'DPI generico',
//      taglia: 'U', quantita: 1, sottoScorta: false }

// ------------------------------------------------------------
// 18) NOTE / TRAPPOLE COMUNI
// ------------------------------------------------------------

// - Destrutturare da null/undefined lancia TypeError: usare = {} come default.
// - Il default scatta SOLO su undefined, non su null/0/'' (sono valori validi).
// - Il nested NON crea le variabili intermedie, solo quelle "foglia" richieste.
// - Per riassegnare a variabili gia dichiarate servono le parentesi tonde.

/* ============================================================
   RIEPILOGO COMANDI (scheda memoria rapida)
   ------------------------------------------------------------
   const { a, b } = obj            -> estrazione base
   const { a: x } = obj            -> rename / alias
   const { a = 1 } = obj           -> default value (solo se undefined)
   const { a: x = 1 } = obj        -> rename + default
   const { a: { b } } = obj        -> nested destructuring
   const { a: { b } = {} } = obj   -> nested con ramo opzionale
   const { a, ...rest } = obj      -> rest object (raccoglie il resto)
   function f({ a, b } = {}) {}    -> destructuring nei parametri
   ({ a, b } = obj)                -> riassegnare variabili esistenti
   for (const { a } of arr)        -> destructuring nei cicli
   for (const [k, v] of entries)   -> destructuring entry [key, value]
   obj?.a ?? def                   -> optional chaining + nullish coalescing
   return { a, b }                 -> named return (object da destrutturare)
   Object.entries / Object.keys    -> sorgenti tipiche per destructuring
   ============================================================ */
