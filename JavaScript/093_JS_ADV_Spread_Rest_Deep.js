/* ============================================================
   93 JS ADV Spread Rest Deep
   Approfondimento avanzato su spread (...) e rest (...): come usarli
   per scrivere immutable updates (aggiornamenti senza mutare l'originale),
   per eseguire merge profondi (deep merge) di oggetti annidati, e per
   raccogliere argomenti variabili nelle funzioni (rest parameters).
   Vediamo le insidie (shallow copy vs deep copy), i pattern professionali
   tipici di uno stato applicativo (state) e casi reali ispirati a un
   gestionale ERP (dipendenti, timbrature, turni, reparti, vestiario).
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) BASI: spread su array
   Lo spread "srotola" gli elementi di un iterable.
   ------------------------------------------------------------ */

// Copia superficiale (shallow copy) di un array
const badge = ['UP-001', 'UP-002', 'UP-003'];
const copiaBadge = [...badge];
console.log(copiaBadge); // => [ 'UP-001', 'UP-002', 'UP-003' ]
console.log(copiaBadge === badge); // => false (nuovo array)

// Concatenare array senza concat()
const reparti1 = ['PR', 'MG'];
const reparti2 = ['UF', 'QC'];
const tuttiReparti = [...reparti1, ...reparti2];
console.log(tuttiReparti); // => [ 'PR', 'MG', 'UF', 'QC' ]

// Inserire elementi in mezzo (immutable insert)
const conNuovo = [...reparti1, 'TS', ...reparti2];
console.log(conNuovo); // => [ 'PR', 'MG', 'TS', 'UF', 'QC' ]

/* ------------------------------------------------------------
   2) BASI: spread su oggetti
   ------------------------------------------------------------ */

const dipendente = { id: 1, nome: 'Mario', cognome: 'Rossi' };
const copiaDip = { ...dipendente };
console.log(copiaDip); // => { id: 1, nome: 'Mario', cognome: 'Rossi' }

// Aggiungere/sovrascrivere proprietita: l'ultima vince
const conRuolo = { ...dipendente, ruolo: 'operaio', nome: 'Marco' };
console.log(conRuolo.nome); // => Marco
console.log(conRuolo.ruolo); // => operaio

/* ------------------------------------------------------------
   3) IMMUTABLE UPDATES (pattern centrale dello stato applicativo)
   Mai mutare l'originale: si crea sempre un nuovo oggetto/array.
   ------------------------------------------------------------ */

// Aggiornare un campo di un oggetto senza mutarlo
const turno = { id: 'P4', conPausa: true, oreNominali: 8 };
const turnoMod = { ...turno, oreNominali: 7.5 };
console.log(turno.oreNominali); // => 8 (intatto)
console.log(turnoMod.oreNominali); // => 7.5

// Aggiungere un elemento a un array di stato (immutable push)
const stato = { dipendenti: [{ id: 1, nome: 'Mario' }] };
const nuovoStato = {
  ...stato,
  dipendenti: [...stato.dipendenti, { id: 2, nome: 'Lucia' }],
};
console.log(stato.dipendenti.length); // => 1
console.log(nuovoStato.dipendenti.length); // => 2

// Rimuovere un elemento per id (immutable remove con filter)
function rimuoviDipendente(lista, id) {
  return lista.filter((d) => d.id !== id);
}
console.log(rimuoviDipendente(nuovoStato.dipendenti, 1));
// => [ { id: 2, nome: 'Lucia' } ]

// Aggiornare un elemento di una lista per id (immutable update con map)
function aggiornaDipendente(lista, id, patch) {
  return lista.map((d) => (d.id === id ? { ...d, ...patch } : d));
}
const dopoPatch = aggiornaDipendente(nuovoStato.dipendenti, 2, { ruolo: 'capoturno' });
console.log(dopoPatch[1]); // => { id: 2, nome: 'Lucia', ruolo: 'capoturno' }

/* ------------------------------------------------------------
   4) LA TRAPPOLA: shallow copy con oggetti annidati
   Lo spread copia un solo livello: gli oggetti nidificati restano
   condivisi per riferimento (reference).
   ------------------------------------------------------------ */

const config = { regola: 'arrotonda', soglie: { ingresso: 5, uscita: 10 } };
const configShallow = { ...config };
configShallow.soglie.ingresso = 99; // muta ANCHE l'originale!
console.log(config.soglie.ingresso); // => 99 (effetto collaterale indesiderato)

// Soluzione 1: spread anche del livello annidato
const base = { regola: 'arrotonda', soglie: { ingresso: 5, uscita: 10 } };
const sicuro = { ...base, soglie: { ...base.soglie, ingresso: 7 } };
sicuro.soglie.ingresso = 7;
console.log(base.soglie.ingresso); // => 5 (intatto)

// Soluzione 2: structuredClone() per una vera deep copy (ES2022+, Node 17+)
const profondo = structuredClone(base);
profondo.soglie.uscita = 0;
console.log(base.soglie.uscita); // => 10 (intatto)

/* ------------------------------------------------------------
   5) DEEP MERGE: unione profonda di oggetti annidati
   {...a, ...b} fa solo un merge superficiale. Per il merge profondo
   serve una funzione ricorsiva.
   ------------------------------------------------------------ */

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (isPlainObject(tv) && isPlainObject(sv)) {
      out[key] = deepMerge(tv, sv); // ricorsione sui sotto-oggetti
    } else {
      out[key] = sv; // valori primitivi/array: sovrascrive
    }
  }
  return out;
}

const DEFAULT = {
  arrotondamento: { regola: 'matematico', minuti: 5 },
  turni: { P4: { pausa: 30 }, P2: { pausa: 0 } },
};
const impostazioniUtente = {
  arrotondamento: { minuti: 1 }, // modifica solo "minuti"
  turni: { P4: { pausa: 45 } },  // modifica solo P4.pausa
};
const merged = deepMerge(DEFAULT, impostazioniUtente);
console.log(merged.arrotondamento); // => { regola: 'matematico', minuti: 1 }
console.log(merged.turni.P4.pausa); // => 45
console.log(merged.turni.P2.pausa); // => 0 (preservato)

// Differenza con merge superficiale: P2 e regola andrebbero PERSI
const shallowMerge = { ...DEFAULT, ...impostazioniUtente };
console.log(shallowMerge.turni.P2); // => undefined (P4 ha sovrascritto tutto turni)

/* ------------------------------------------------------------
   6) REST in destructuring: separare "una parte" dal "resto"
   ------------------------------------------------------------ */

// Object rest: estrai una chiave, raccogli il resto
const assegnazione = { id: 9, dipendenteId: 1, vestiario: 'tuta', taglia: 'L', quantita: 2 };
const { vestiario, ...restoAssegnazione } = assegnazione;
console.log(vestiario); // => tuta
console.log(restoAssegnazione); // => { id: 9, dipendenteId: 1, taglia: 'L', quantita: 2 }

// Pattern utile: rimuovere una chiave in modo immutable (omit)
function omit(obj, chiave) {
  const { [chiave]: _scartato, ...rest } = obj;
  return rest;
}
console.log(omit(assegnazione, 'quantita'));
// => { id: 9, dipendenteId: 1, vestiario: 'tuta', taglia: 'L' }

// Array rest: testa + coda
const [primoBadge, ...altriBadge] = badge;
console.log(primoBadge); // => UP-001
console.log(altriBadge); // => [ 'UP-002', 'UP-003' ]

// Rest annidato dentro parametri funzione (sanificazione DTO)
function toDTO({ id, nome, cognome, ...campiInterni }) {
  // campiInterni viene scartato: espone solo cio' che serve al client
  return { id, label: `${nome} ${cognome}` };
}
console.log(toDTO({ id: 1, nome: 'Mario', cognome: 'Rossi', passwordHash: 'xxx' }));
// => { id: 1, label: 'Mario Rossi' }

/* ------------------------------------------------------------
   7) REST PARAMETERS: raccolta argomenti variabili
   Sostituisce il vecchio "arguments" ed e' un vero Array.
   ------------------------------------------------------------ */

// Somma di minuti lavorati di un numero variabile di timbrature
function sommaMinuti(...minuti) {
  return minuti.reduce((s, m) => s + m, 0);
}
console.log(sommaMinuti(60, 30, 15)); // => 105
console.log(sommaMinuti()); // => 0

// Argomenti fissi + rest: il rest deve essere l'ultimo
function log(prefisso, ...valori) {
  return `${prefisso}: ${valori.join(', ')}`;
}
console.log(log('REPARTI', 'PR', 'MG', 'UF')); // => REPARTI: PR, MG, UF

// Spread di un array dentro una chiamata (l'opposto del rest)
const minutiTurno = [480, -30, 12]; // lavoro, pausa, straordinario
console.log(sommaMinuti(...minutiTurno)); // => 462

// Math.max/min con spread
console.log(Math.max(...[7.5, 8, 6.25, 9])); // => 9

/* ------------------------------------------------------------
   8) PATTERN: default params + merge per opzioni di funzione
   ------------------------------------------------------------ */

function calcolaOre(timbrature, opzioni = {}) {
  const cfg = { arrotonda: true, minuti: 5, ...opzioni };
  const tot = timbrature.reduce((s, t) => s + t, 0);
  if (!cfg.arrotonda) return tot;
  return Math.round(tot / cfg.minuti) * cfg.minuti;
}
console.log(calcolaOre([62, 121])); // => 185 (arrotondato a 5)
console.log(calcolaOre([62, 121], { minuti: 1 })); // => 183
console.log(calcolaOre([62, 121], { arrotonda: false })); // => 183

/* ------------------------------------------------------------
   9) PATTERN: builder immutable a catena (ERP query where)
   Ogni step ritorna un nuovo oggetto where senza mutare il precedente.
   ------------------------------------------------------------ */

const conData = (where, da, a) => ({ ...where, data: { gte: da, lte: a } });
const conReparto = (where, sigla) => ({ ...where, repartoSigla: sigla });
const conApprovate = (where) => ({ ...where, stato: 'APPROVATA' });

let where = {};
where = conData(where, '2026-06-01', '2026-06-30');
where = conReparto(where, 'PR');
where = conApprovate(where);
console.log(where);
// => { data: { gte: '2026-06-01', lte: '2026-06-30' }, repartoSigla: 'PR', stato: 'APPROVATA' }

/* ------------------------------------------------------------
   10) SPREAD con stringhe, Set e Map (iterables)
   ------------------------------------------------------------ */

// Stringa -> array di caratteri
console.log([...'UP-001']); // => [ 'U', 'P', '-', '0', '0', '1' ]

// Deduplicare un array via Set
const conDoppioni = ['PR', 'MG', 'PR', 'UF', 'MG'];
const unici = [...new Set(conDoppioni)];
console.log(unici); // => [ 'PR', 'MG', 'UF' ]

// Map -> array di coppie [chiave, valore]
const scorte = new Map([['tuta', 5], ['guanti', 0]]);
console.log([...scorte]); // => [ [ 'tuta', 5 ], [ 'guanti', 0 ] ]

/* ------------------------------------------------------------
   11) CASO REALE ERP: aggiornare la scorta di vestiario in modo immutable
   ------------------------------------------------------------ */

const magazzino = {
  tuta: { taglia: 'L', quantita: 5, scortaMinima: 3 },
  guanti: { taglia: 'U', quantita: 2, scortaMinima: 10 },
};

// Scarica N pezzi di un articolo restituendo un nuovo magazzino
function scarica(mag, articolo, n) {
  const corrente = mag[articolo];
  return {
    ...mag,
    [articolo]: { ...corrente, quantita: corrente.quantita - n },
  };
}
const dopoScarico = scarica(magazzino, 'tuta', 2);
console.log(dopoScarico.tuta.quantita); // => 3
console.log(magazzino.tuta.quantita); // => 5 (originale intatto)

// Articoli sotto scorta (filter + spread per il report)
const sottoScorta = Object.entries(dopoScarico)
  .filter(([, v]) => v.quantita < v.scortaMinima)
  .map(([nome, v]) => ({ nome, ...v }));
console.log(sottoScorta);
// => [ { nome: 'guanti', taglia: 'U', quantita: 2, scortaMinima: 10 } ]

/* ------------------------------------------------------------
   12) CASO REALE ERP: comporre un DTO timbratura (naive-UTC)
   Raccogliamo campi opzionali con rest e li uniamo a un default.
   ------------------------------------------------------------ */

const TIMBRATURA_DEFAULT = {
  ingresso: null,
  uscitaPranzo: null,
  rientroPranzo: null,
  uscita: null,
  oreLavorate: 0,
};

function creaTimbratura({ dipendenteId, data, ...orari }) {
  return { dipendenteId, data, ...TIMBRATURA_DEFAULT, ...orari };
}
console.log(
  creaTimbratura({ dipendenteId: 1, data: '2026-06-30', ingresso: '08:00', uscita: '17:00' })
);
// => { dipendenteId: 1, data: '2026-06-30', ingresso: '08:00',
//      uscitaPranzo: null, rientroPranzo: null, uscita: '17:00', oreLavorate: 0 }

/* ------------------------------------------------------------
   13) ATTENZIONE: spread e ordine delle chiavi
   In {...a, ...b} le chiavi di b vincono SOLO se gia' presenti;
   spread di null/undefined e' sicuro (ignorato).
   ------------------------------------------------------------ */

const patchNullo = null;
console.log({ id: 1, ...patchNullo }); // => { id: 1 } (nessun errore)

// Spread condizionale: includi una chiave solo se una condizione e' vera
const includiBonus = true;
const buste = {
  base: 1500,
  ...(includiBonus && { bonus: 200 }), // se false => {} => niente
};
console.log(buste); // => { base: 1500, bonus: 200 }

/* ------------------------------------------------------------
   14) deepMerge con array: strategia "concat" vs "replace"
   ------------------------------------------------------------ */

function deepMergeConcat(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (Array.isArray(tv) && Array.isArray(sv)) {
      out[key] = [...tv, ...sv]; // unisce gli array
    } else if (isPlainObject(tv) && isPlainObject(sv)) {
      out[key] = deepMergeConcat(tv, sv);
    } else {
      out[key] = sv;
    }
  }
  return out;
}
const permessiA = { ruoli: ['operaio'], settore: { PR: true } };
const permessiB = { ruoli: ['capoturno'], settore: { MG: true } };
console.log(deepMergeConcat(permessiA, permessiB));
// => { ruoli: [ 'operaio', 'capoturno' ], settore: { PR: true, MG: true } }

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   - [...arr]                      copia superficiale array
   - [...a, ...b]                  concatenazione array
   - {...obj}                      copia superficiale oggetto
   - {...obj, k: v}                immutable update di un campo
   - {...a, ...b}                  shallow merge (b vince)
   - [...lista, nuovo]            immutable push
   - lista.filter(...)            immutable remove
   - lista.map(d => d.id===id ? {...d,...p} : d)  immutable update lista
   - const {k, ...rest} = obj      object rest (omit)
   - const [primo, ...resto] = arr array rest (head/tail)
   - function f(...args)           rest parameters (Array reale)
   - f(...arr)                     spread di argomenti
   - Math.max(...arr)              spread in chiamata
   - {...(cond && {k:v})}          spread condizionale
   - structuredClone(obj)          deep copy (ES2022+/Node 17+)
   - [...new Set(arr)]             dedup array
   - [...map] / [...'str']         spread di iterables
   - deepMerge(a, b)               merge profondo ricorsivo
   - isPlainObject(v)              guard per oggetti "semplici"
   ============================================================ */
