/* ============================================================
   35 JS Objects
   Gli object sono la struttura dati fondamentale di JavaScript:
   collezioni di coppie key/value (proprieta') che modellano
   entita' del mondo reale, come un dipendente o un reparto.
   In questo file vediamo: object literal, proprieta' e metodi,
   accesso dot vs bracket, object nested (annidati), property
   shorthand, computed property name, method shorthand e i
   metodi statici piu' utili di Object.
   ============================================================ */

// ============================================================
// 1) OBJECT LITERAL — la sintassi base
// ============================================================

// Object literal: si crea con le graffe { } e coppie key: value
const dipendente = {
  nome: "Mario",
  cognome: "Rossi",
  codiceBadge: "UP-001",
  attivo: true,
};
console.log(dipendente); // => { nome: 'Mario', cognome: 'Rossi', codiceBadge: 'UP-001', attivo: true }

// Object vuoto: si popola dopo
const reparto = {};
reparto.sigla = "UP";
reparto.descrizione = "Ufficio Produzione";
console.log(reparto); // => { sigla: 'UP', descrizione: 'Ufficio Produzione' }

// Le key sono stringhe (o symbol). Se la key ha spazi/trattini va tra apici
const config = {
  "max-ore": 8,
  "scorta minima": 5,
};
console.log(config["max-ore"]); // => 8

// ============================================================
// 2) ACCESSO ALLE PROPRIETA' — dot vs bracket notation
// ============================================================

// Dot notation: comoda quando la key e' un identificatore valido
console.log(dipendente.nome); // => Mario

// Bracket notation: obbligatoria con key dinamiche o non-identificatori
console.log(dipendente["codiceBadge"]); // => UP-001

// Bracket con key calcolata a runtime (la differenza chiave col dot)
const campo = "cognome";
console.log(dipendente[campo]); // => Rossi
// dipendente.campo cercherebbe la key letterale "campo" => undefined

// Proprieta' inesistente => undefined (non lancia errore)
console.log(dipendente.eta); // => undefined

// ============================================================
// 3) MODIFICARE, AGGIUNGERE, ELIMINARE PROPRIETA'
// ============================================================

const turno = { codice: "P4", pausa: true };
turno.oreNominali = 8;      // aggiunge
turno.pausa = false;        // modifica
delete turno.codice;        // elimina
console.log(turno); // => { pausa: false, oreNominali: 8 }

// Verificare l'esistenza di una key
console.log("pausa" in turno);            // => true
console.log("codice" in turno);           // => false
console.log(turno.hasOwnProperty("pausa")); // => true

// ============================================================
// 4) METODI — funzioni come valore di una proprieta'
// ============================================================

const badge = {
  prefisso: "UP",
  numero: 1,
  // method shorthand (ES6): niente "function"
  etichetta() {
    // "this" punta all'object che chiama il metodo
    return `${this.prefisso}-${String(this.numero).padStart(3, "0")}`;
  },
};
console.log(badge.etichetta()); // => UP-001

// Metodo definito come arrow: ATTENZIONE, l'arrow non ha "this" proprio
const contatore = {
  valore: 10,
  // qui this NON e' contatore (arrow eredita this esterno) -> evitare per metodi
  leggiSbagliato: () => this?.valore,
  // forma corretta per usare this:
  leggi() {
    return this.valore;
  },
};
console.log(contatore.leggi()); // => 10

// ============================================================
// 5) OBJECT NESTED — proprieta' che contengono altri object/array
// ============================================================

const cartellino = {
  dipendente: {
    nome: "Anna",
    reparto: { sigla: "PR", descrizione: "Produzione" },
  },
  timbrature: [
    { tipo: "ingresso", ora: "08:00" },
    { tipo: "uscita", ora: "17:00" },
  ],
};

// Accesso a piu' livelli concatenando dot/bracket
console.log(cartellino.dipendente.reparto.sigla); // => PR
console.log(cartellino.timbrature[0].ora);        // => 08:00

// Optional chaining (?.) evita errori se un livello manca
console.log(cartellino.dipendente?.reparto?.sigla);   // => PR
console.log(cartellino.azienda?.indirizzo?.via);      // => undefined (niente crash)

// Nullish coalescing (??) per un default quando il valore e' null/undefined
const siglaReparto = cartellino.dipendente?.reparto?.sigla ?? "XX";
console.log(siglaReparto); // => PR

// ============================================================
// 6) PROPERTY SHORTHAND — key uguale al nome della variabile
// ============================================================

const nome = "Luca";
const cognome = "Bianchi";
// invece di { nome: nome, cognome: cognome }
const nuovoDip = { nome, cognome };
console.log(nuovoDip); // => { nome: 'Luca', cognome: 'Bianchi' }

// Pattern tipico: costruire un DTO da query result usando shorthand
function toDTO(row) {
  const { id, nome, codiceBadge } = row;
  return { id, nome, codiceBadge };
}
console.log(toDTO({ id: 7, nome: "Ivo", codiceBadge: "UP-007", interno: true }));
// => { id: 7, nome: 'Ivo', codiceBadge: 'UP-007' }

// ============================================================
// 7) COMPUTED PROPERTY NAME — key dinamica nel literal
// ============================================================

const chiave = "reparto";
const valore = "UP";
const filtro = { [chiave]: valore, [`${chiave}Attivo`]: true };
console.log(filtro); // => { reparto: 'UP', repartoAttivo: true }

// Utile per costruire un oggetto-mappa indicizzato per badge
const dipendenti = [
  { codiceBadge: "UP-001", nome: "Mario" },
  { codiceBadge: "UP-002", nome: "Anna" },
];
const perBadge = {};
for (const d of dipendenti) {
  perBadge[d.codiceBadge] = d.nome; // computed via bracket
}
console.log(perBadge["UP-002"]); // => Anna

// ============================================================
// 8) SPREAD e MERGE di object
// ============================================================

const DEFAULT_IMPOSTAZIONI = { regolaArrotondamento: "su", tolleranza: 5 };
const impostazioniUtente = { tolleranza: 10 };
// le proprieta' a destra sovrascrivono quelle a sinistra
const impostazioni = { ...DEFAULT_IMPOSTAZIONI, ...impostazioniUtente, turni: ["P4"] };
console.log(impostazioni);
// => { regolaArrotondamento: 'su', tolleranza: 10, turni: [ 'P4' ] }

// Rest in destructuring: estrarre una key e tenere il resto
const assegnazione = { id: 3, vestiario: "giacca", taglia: "L", quantita: 2 };
const { vestiario, ...rest } = assegnazione;
console.log(vestiario); // => giacca
console.log(rest);      // => { id: 3, taglia: 'L', quantita: 2 }

// ============================================================
// 9) DESTRUCTURING avanzato — rename e default
// ============================================================

const r = { sigla: "PR" };
// rinomina sigla -> codice; descrizione con default se assente
const { sigla: codice, descrizione = "N/D" } = r;
console.log(codice);       // => PR
console.log(descrizione);  // => N/D

// Destructuring annidato
const ordine = { cliente: { nome: "ACME", citta: "Roma" } };
const { cliente: { citta } } = ordine;
console.log(citta); // => Roma

// ============================================================
// 10) METODI STATICI di Object
// ============================================================

const dip = { nome: "Sara", reparto: "UP", attivo: true };

// Object.keys -> array delle key
console.log(Object.keys(dip));   // => [ 'nome', 'reparto', 'attivo' ]
// Object.values -> array dei value
console.log(Object.values(dip)); // => [ 'Sara', 'UP', true ]
// Object.entries -> array di coppie [key, value]
console.log(Object.entries(dip)); // => [ ['nome','Sara'], ['reparto','UP'], ['attivo',true] ]

// Iterare con entries
for (const [k, v] of Object.entries(dip)) {
  console.log(`${k} = ${v}`);
}
// => nome = Sara / reparto = UP / attivo = true

// Object.assign: copia/merge in un target (muta il primo argomento)
const base = { taglia: "M" };
Object.assign(base, { quantita: 1 }, { scortaMinima: 3 });
console.log(base); // => { taglia: 'M', quantita: 1, scortaMinima: 3 }

// Object.freeze: rende l'object immutabile (in modalita' non-strict ignora le modifiche)
const COSTANTI = Object.freeze({ ORE_GIORNO: 8 });
COSTANTI.ORE_GIORNO = 12;
console.log(COSTANTI.ORE_GIORNO); // => 8 (modifica ignorata)
console.log(Object.isFrozen(COSTANTI)); // => true

// Object.fromEntries: costruisce un object da coppie [key, value]
const coppie = [["sigla", "PR"], ["ore", 8]];
console.log(Object.fromEntries(coppie)); // => { sigla: 'PR', ore: 8 }

// ============================================================
// 11) ESEMPIO PRATICO ERP — riepilogo timbrature per reparto
// ============================================================

// Dataset di timbrature gia' calcolate (oreLavorate per dipendente)
const giornata = [
  { badge: "UP-001", reparto: "UP", oreLavorate: 8 },
  { badge: "UP-002", reparto: "UP", oreLavorate: 7 },
  { badge: "PR-001", reparto: "PR", oreLavorate: 8 },
];

// Costruiamo un object-mappa { reparto -> oreTotali } con computed property
function oreTotaliPerReparto(records) {
  const acc = {};
  for (const t of records) {
    acc[t.reparto] = (acc[t.reparto] ?? 0) + t.oreLavorate;
  }
  return acc;
}
console.log(oreTotaliPerReparto(giornata)); // => { UP: 15, PR: 8 }

// Normalizzare un badge come fa il gestionale (object con metodo)
const normalizzatore = {
  normalizza(raw) {
    return String(raw || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .slice(0, 8);
  },
};
console.log(normalizzatore.normalizza("  up-001 ")); // => UP-001

// Object come "record" di dominio con metodi di comodo
const turnoP4 = {
  codice: "P4",
  inizio: "08:00",
  fine: "17:00",
  pausaMinuti: 60,
  // metodo che calcola le ore nette del turno
  oreNette() {
    const [hi, mi] = this.inizio.split(":").map(Number);
    const [hf, mf] = this.fine.split(":").map(Number);
    const lordoMin = (hf * 60 + mf) - (hi * 60 + mi);
    return (lordoMin - this.pausaMinuti) / 60;
  },
};
console.log(turnoP4.oreNette()); // => 8

// ============================================================
// 12) COPIA: shallow vs deep
// ============================================================

const originale = { nome: "Eva", reparto: { sigla: "UP" } };

// Shallow copy (spread): i nested restano CONDIVISI per riferimento
const shallow = { ...originale };
shallow.reparto.sigla = "PR";
console.log(originale.reparto.sigla); // => PR (modificato anche l'originale!)

// Deep copy con structuredClone (Node 17+): copia completa e indipendente
const fonte = { nome: "Eva", reparto: { sigla: "UP" } };
const deep = structuredClone(fonte);
deep.reparto.sigla = "MG";
console.log(fonte.reparto.sigla); // => UP (originale intatto)

// ============================================================
// RIEPILOGO COMANDI
// ============================================================
/*
  { key: value }            object literal
  obj.prop                  accesso dot notation
  obj["prop"] / obj[var]    accesso bracket (key dinamica)
  obj.prop = x              aggiungi/modifica proprieta'
  delete obj.prop           elimina proprieta'
  "prop" in obj             verifica esistenza key
  obj.hasOwnProperty(k)     key propria (non ereditata)
  metodo() { }              method shorthand
  this                      riferimento all'object chiamante
  obj.a.b.c                 accesso nested
  obj?.a?.b                 optional chaining
  valore ?? default         nullish coalescing
  { nome }                  property shorthand
  { [k]: v }                computed property name
  { ...a, ...b }            spread / merge
  { x, ...rest }            rest in destructuring
  { a: b }                  destructuring con rename
  { a = def }               destructuring con default
  Object.keys(obj)          array delle key
  Object.values(obj)        array dei value
  Object.entries(obj)       array di [key, value]
  Object.fromEntries(arr)   object da coppie
  Object.assign(t, ...src)  merge in target (muta)
  Object.freeze(obj)        rende immutabile
  Object.isFrozen(obj)      controlla immutabilita'
  structuredClone(obj)      deep copy
*/
