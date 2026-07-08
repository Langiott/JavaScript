/* ============================================================
   40 JS Optional Chaining
   L'optional chaining (?.) permette di accedere a proprietà annidate
   senza generare errori quando un riferimento intermedio è null o
   undefined: in quei casi l'espressione "corto-circuita" e restituisce
   undefined invece di lanciare un TypeError. Il nullish coalescing (??)
   fornisce un valore di fallback solo quando il valore è null o undefined,
   distinguendolo da valori "falsy" legittimi come 0, '' o false.
   Insieme rendono sicuro e leggibile l'accesso a dati incompleti
   (es. risposte API, record di un gestionale ERP).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) IL PROBLEMA: accesso annidato senza optional chaining
   ------------------------------------------------------------ */

// Senza ?. accedere a una proprietà di un oggetto undefined lancia errore.
const dipendente = { nome: 'Mario', reparto: { sigla: 'UP' } };
console.log(dipendente.reparto.sigla); // => UP

// Se "reparto" mancasse, l'accesso classico esploderebbe:
const dip2 = { nome: 'Luca' };
// console.log(dip2.reparto.sigla); // => TypeError: Cannot read properties of undefined

// Vecchio workaround verboso con &&:
console.log(dip2.reparto && dip2.reparto.sigla); // => undefined

/* ------------------------------------------------------------
   2) OPTIONAL CHAINING DI BASE ?.
   ------------------------------------------------------------ */

// Con ?. l'espressione restituisce undefined invece di lanciare.
console.log(dip2.reparto?.sigla); // => undefined
console.log(dipendente.reparto?.sigla); // => UP

// Funziona a più livelli di profondità.
const ordine = { cliente: { indirizzo: { citta: 'Roma' } } };
console.log(ordine.cliente?.indirizzo?.citta); // => Roma
console.log(ordine.fornitore?.indirizzo?.citta); // => undefined

/* ------------------------------------------------------------
   3) ?. SU PROPRIETÀ null vs undefined
   ------------------------------------------------------------ */

// ?. corto-circuita sia su null sia su undefined.
const a = { sub: null };
const b = { sub: undefined };
console.log(a.sub?.x); // => undefined
console.log(b.sub?.x); // => undefined

// Su un valore presente prosegue normalmente.
const c = { sub: { x: 42 } };
console.log(c.sub?.x); // => 42

/* ------------------------------------------------------------
   4) OPTIONAL CHAINING CON INDICI ?.[ ]
   ------------------------------------------------------------ */

// Per accedere ad array o chiavi dinamiche si usa ?.[indice].
const timbrature = [{ ora: '08:00' }, { ora: '12:30' }];
console.log(timbrature?.[0]?.ora); // => 08:00
console.log(timbrature?.[5]?.ora); // => undefined

// Chiave calcolata dinamicamente.
const tabella = { 'UP-001': { nome: 'Mario' } };
const badge = 'UP-001';
console.log(tabella?.[badge]?.nome); // => Mario
console.log(tabella?.['XX-999']?.nome); // => undefined

/* ------------------------------------------------------------
   5) OPTIONAL CHAINING SU CHIAMATE DI FUNZIONE ?.( )
   ------------------------------------------------------------ */

// ?.() chiama la funzione solo se esiste, utile per callback opzionali.
function eseguiConCallback(valore, onDone) {
  const risultato = valore * 2;
  onDone?.(risultato); // chiamato solo se onDone è una funzione
  return risultato;
}
console.log(eseguiConCallback(10)); // => 20  (nessun errore senza callback)
eseguiConCallback(5, (r) => console.log('done:', r)); // => done: 10

// Metodo opzionale di un oggetto.
const logger = { info: (m) => console.log('INFO', m) };
logger.info?.('avvio'); // => INFO avvio
logger.debug?.('dettaglio'); // non stampa nulla, debug non esiste

/* ------------------------------------------------------------
   6) NULLISH COALESCING ??  (valore di fallback)
   ------------------------------------------------------------ */

// ?? restituisce il destro SOLO se il sinistro è null o undefined.
const sigla = undefined;
console.log(sigla ?? 'XX'); // => XX
console.log('AB' ?? 'XX'); // => AB

// Differenza chiave rispetto a || : 0, '' e false NON attivano il fallback.
const quantita = 0;
console.log(quantita || 10); // => 10  (|| considera 0 falsy: SBAGLIATO qui)
console.log(quantita ?? 10); // => 0   (?? rispetta lo zero: CORRETTO)

const nota = '';
console.log(nota || 'vuoto'); // => vuoto
console.log(nota ?? 'vuoto'); // => '' (stringa vuota è un valore valido)

/* ------------------------------------------------------------
   7) COMBINARE ?. E ??  (pattern più comune)
   ------------------------------------------------------------ */

// Accesso sicuro + fallback in un colpo solo.
const reparto = { sigla: undefined };
console.log(reparto?.sigla ?? 'N/D'); // => N/D

const r2 = null;
console.log(r2?.sigla ?? 'N/D'); // => N/D

const r3 = { sigla: 'PR' };
console.log(r3?.sigla ?? 'N/D'); // => PR

/* ------------------------------------------------------------
   8) NULLISH ASSIGNMENT ??=  (ES2021)
   ------------------------------------------------------------ */

// ??= assegna solo se la proprietà è null o undefined.
const config = { regolaArrotondamento: 5, soglia: undefined };
config.regolaArrotondamento ??= 1; // resta 5 (già definito)
config.soglia ??= 30; // diventa 30 (era undefined)
config.nuovo ??= 'default'; // creata con 'default'
console.log(config); // => { regolaArrotondamento: 5, soglia: 30, nuovo: 'default' }

/* ------------------------------------------------------------
   9) ?. CON METODI DI ARRAY
   ------------------------------------------------------------ */

// Se una lista può essere assente, ?. evita il crash sul metodo.
const risposta = { dati: [{ id: 1 }, { id: 2 }] };
console.log(risposta.dati?.map((x) => x.id)); // => [ 1, 2 ]

const rispostaVuota = {};
console.log(rispostaVuota.dati?.map((x) => x.id)); // => undefined

// Concatenare con ?? per ottenere sempre un array.
const lista = rispostaVuota.dati?.map((x) => x.id) ?? [];
console.log(lista); // => []

/* ------------------------------------------------------------
   10) PRECEDENZA E PARENTESI
   ------------------------------------------------------------ */

// ?? non si può mescolare con || o && senza parentesi (SyntaxError).
// const x = a || b ?? c;        // ERRORE di sintassi
const x = (true || false) ?? 'fb';
console.log(x); // => true

// ?. corto-circuita l'INTERA catena, anche le chiamate successive.
const obj = null;
console.log(obj?.metodo().prop); // => undefined (non valuta .metodo() né .prop)

/* ============================================================
   ESEMPI AVANZATI ISPIRATI A UN GESTIONALE ERP
   ============================================================ */

/* ------------------------------------------------------------
   11) Estrarre dati da un record dipendente con relazioni
   ------------------------------------------------------------ */

// Pattern: query Prisma con include{} che può restituire relazioni mancanti.
const righe = [
  { id: 1, nome: 'Mario', dipendente: { reparto: { sigla: 'UP' } } },
  { id: 2, nome: 'Luca', dipendente: null },
  { id: 3, nome: 'Sara', dipendente: { reparto: null } },
];

const sigle = righe.map((row) => row.dipendente?.reparto?.sigla ?? 'XX');
console.log(sigle); // => [ 'UP', 'XX', 'XX' ]

/* ------------------------------------------------------------
   12) Mapping sicuro di articoli verso un DTO
   ------------------------------------------------------------ */

// Trasforma risultati query in oggetti puliti, con fallback sui campi.
const articoli = [
  { articolo_poly: 'UP-001', descrizione: 'Guanti', taglia: 'M' },
  { articolo_poly: 'UP-002', descrizione: null },
];
const dto = articoli.map((art) => ({
  cdAr: art?.articolo_poly ?? 'SENZA-CODICE',
  descrizione: art?.descrizione ?? '(nessuna descrizione)',
  taglia: art?.taglia ?? 'UNICA',
}));
console.log(dto);
// => [ { cdAr: 'UP-001', descrizione: 'Guanti', taglia: 'M' },
//      { cdAr: 'UP-002', descrizione: '(nessuna descrizione)', taglia: 'UNICA' } ]

/* ------------------------------------------------------------
   13) Lettura timbrature naive-UTC con accesso sicuro
   ------------------------------------------------------------ */

// Una timbratura può avere campi opzionali (pausa pranzo non sempre presente).
function calcolaOreLavorate(t) {
  const ingresso = t?.ingresso ?? null;
  const uscita = t?.uscita ?? null;
  if (ingresso == null || uscita == null) return 0;
  // differenza in ore (timestamp in minuti naive-UTC, semplificato)
  const minuti = uscita - ingresso - (t?.pausaMinuti ?? 0);
  return minuti / 60;
}
console.log(calcolaOreLavorate({ ingresso: 480, uscita: 1020, pausaMinuti: 60 })); // => 8
console.log(calcolaOreLavorate({ ingresso: 480, uscita: 960 })); // => 8 (nessuna pausa)
console.log(calcolaOreLavorate({ ingresso: 480 })); // => 0 (uscita mancante)
console.log(calcolaOreLavorate(null)); // => 0

/* ------------------------------------------------------------
   14) Merge di impostazioni con default e nullish
   ------------------------------------------------------------ */

// Pattern: {...DEFAULT, ...impostazioniUtente} + fallback puntuali con ??.
const DEFAULT = { regola: 'arrotonda', soglia: 5, turno: 'P4' };
function risolviImpostazioni(utente) {
  const merged = { ...DEFAULT, ...(utente ?? {}) };
  return {
    regola: merged.regola ?? DEFAULT.regola,
    soglia: merged.soglia ?? DEFAULT.soglia,
    turno: merged.turno ?? DEFAULT.turno,
  };
}
console.log(risolviImpostazioni({ soglia: 0 }));
// => { regola: 'arrotonda', soglia: 0, turno: 'P4' }  (lo 0 è rispettato)
console.log(risolviImpostazioni(null));
// => { regola: 'arrotonda', soglia: 5, turno: 'P4' }

/* ------------------------------------------------------------
   15) Accesso profondo a una risposta API annidata
   ------------------------------------------------------------ */

// Risposta tipo axios: data.payload.items con livelli che possono mancare.
function primoBadge(apiResponse) {
  return apiResponse?.data?.payload?.dipendenti?.[0]?.codiceBadge ?? 'NESSUNO';
}
console.log(primoBadge({ data: { payload: { dipendenti: [{ codiceBadge: 'UP-001' }] } } })); // => UP-001
console.log(primoBadge({ data: {} })); // => NESSUNO
console.log(primoBadge(undefined)); // => NESSUNO

/* ------------------------------------------------------------
   16) Funzione opzionale dentro una catena (?.( ) su relazione)
   ------------------------------------------------------------ */

// Un repository potrebbe non esporre un metodo: lo chiamiamo solo se esiste.
const repo = {
  trovaDipendente: (id) => ({ id, nome: 'Anna' }),
};
console.log(repo.trovaDipendente?.(7)?.nome ?? 'sconosciuto'); // => Anna
console.log(repo.archivia?.(7) ?? 'metodo non disponibile'); // => metodo non disponibile

/* ------------------------------------------------------------
   17) Normalizzazione badge con accesso sicuro
   ------------------------------------------------------------ */

// Estrae la parte numerica del badge 'UP-001' in modo difensivo.
function numeroBadge(dip) {
  const codice = dip?.codiceBadge ?? '';
  const match = codice.match?.(/-(\d+)$/);
  return match?.[1] ?? null;
}
console.log(numeroBadge({ codiceBadge: 'UP-001' })); // => 001
console.log(numeroBadge({})); // => null
console.log(numeroBadge(null)); // => null

/* ------------------------------------------------------------
   18) Conteggio scorta vestiario con ?? per gestire mancanti
   ------------------------------------------------------------ */

// Calcola quanti articoli sono sotto scorta minima, ignorando campi assenti.
const vestiario = [
  { nome: 'Camice', quantita: 3, scortaMinima: 5 },
  { nome: 'Cuffia', quantita: 0, scortaMinima: 10 },
  { nome: 'Guanti' }, // dati incompleti
];
const sottoScorta = vestiario.filter(
  (v) => (v?.quantita ?? 0) < (v?.scortaMinima ?? 0)
);
console.log(sottoScorta.map((v) => v.nome)); // => [ 'Camice', 'Cuffia' ]

/* ------------------------------------------------------------
   19) ?. con this e metodi concatenati su DOM (browser)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
function leggiValoreInput() {
  // document.querySelector può restituire null se l'elemento non esiste.
  // const el = document.querySelector('#badge');
  // return el?.value?.trim() ?? '';
  return 'pseudo-eseguibile';
}
console.log(typeof leggiValoreInput); // => function

/* ------------------------------------------------------------
   20) Errori comuni da evitare
   ------------------------------------------------------------ */

// ?? NON rimpiazza i falsy: se ti serve trattare anche '' o 0, usa || di proposito.
const inputUtente = '';
console.log(inputUtente ?? 'default'); // => '' (forse non quello che vuoi)
console.log(inputUtente || 'default'); // => default

// ?. NON crea proprietà: serve solo a leggere/chiamare in sicurezza.
// Non puoi assegnare: obj?.prop = 1  -> SyntaxError

/* ============================================================
   RIEPILOGO COMANDI
   - obj?.prop           accesso sicuro a proprietà
   - obj?.[chiave]       accesso sicuro a indice/chiave dinamica
   - fn?.(args)          chiamata sicura di funzione/metodo opzionale
   - obj?.a?.b?.c        catena profonda con corto-circuito
   - valore ?? fallback  nullish coalescing (solo su null/undefined)
   - x ??= valore        nullish assignment (assegna se null/undefined)
   - obj?.prop ?? def    pattern: accesso sicuro + valore di default
   - lista?.map(...) ?? []  garantire sempre un array
   - || vs ??            || scatta sui falsy, ?? solo su null/undefined
   - (a || b) ?? c       parentesi obbligatorie mischiando || / && con ??
   ============================================================ */
