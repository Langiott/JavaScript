/* ============================================================
   38 JS Object Spread
   Lo spread operator (...) e il rest pattern applicati agli OGGETTI.
   Con {...obj} possiamo clonare in modo shallow, fare merge di piu
   oggetti, sovrascrivere (override) proprieta e aggiungerne di nuove
   in modo immutabile. Con il rest pattern { a, ...resto } estraiamo
   alcune proprieta e raccogliamo le restanti in un nuovo oggetto.
   Sono pattern centrali per gestire stato e DTO senza mutazioni.
   ============================================================ */

/* ---------- 1. SPREAD: copia shallow di un oggetto ---------- */
// Lo spread copia le proprieta enumerabili "own" in un nuovo oggetto.
const dipendente = { id: 1, nome: 'Mario', cognome: 'Rossi' };
const copia = { ...dipendente };
console.log(copia);              // => { id: 1, nome: 'Mario', cognome: 'Rossi' }
console.log(copia === dipendente); // => false (e un nuovo oggetto)

/* ---------- 2. Clone shallow vs riferimento ---------- */
// "shallow" = i valori annidati restano condivisi per riferimento.
const orig = { nome: 'Anna', indirizzo: { citta: 'Roma' } };
const clone = { ...orig };
clone.indirizzo.citta = 'Milano';
console.log(orig.indirizzo.citta); // => 'Milano' (stesso oggetto annidato!)

/* ---------- 3. Override di proprieta ---------- */
// La proprieta a destra vince: l'ultima dichiarata sovrascrive.
const base = { ruolo: 'operaio', attivo: true };
const aggiornato = { ...base, ruolo: 'capoturno' };
console.log(aggiornato); // => { ruolo: 'capoturno', attivo: true }

/* ---------- 4. Aggiungere nuove proprieta ---------- */
const senzaBadge = { nome: 'Luca' };
const conBadge = { ...senzaBadge, codiceBadge: 'UP-001' };
console.log(conBadge); // => { nome: 'Luca', codiceBadge: 'UP-001' }

/* ---------- 5. Merge di piu oggetti ---------- */
// Le chiavi successive sovrascrivono quelle precedenti.
const a = { x: 1, y: 2 };
const b = { y: 20, z: 30 };
const merge = { ...a, ...b };
console.log(merge); // => { x: 1, y: 20, z: 30 }

/* ---------- 6. Pattern DEFAULT + override (config) ---------- */
// Spread di default e poi delle impostazioni utente: pattern classico.
const DEFAULT_TURNO = { regolaArrotondamento: 'standard', pausaMin: 30, attivo: true };
function creaTurno(impostazioni = {}) {
  return { ...DEFAULT_TURNO, ...impostazioni };
}
console.log(creaTurno());                         // => default completo
console.log(creaTurno({ pausaMin: 0 }));          // => { regola..., pausaMin: 0, attivo: true }
console.log(creaTurno({ regolaArrotondamento: 'p4', pausaMin: 45 }));

/* ---------- 7. REST su oggetti: estrarre + raccogliere ---------- */
// { vestiario, ...resto } separa una proprieta dal resto.
const assegnazione = { id: 9, vestiario: 'tuta', taglia: 'L', quantita: 2 };
const { vestiario, ...resto } = assegnazione;
console.log(vestiario); // => 'tuta'
console.log(resto);     // => { id: 9, taglia: 'L', quantita: 2 }

/* ---------- 8. Rest per "rimuovere" una proprieta (immutabile) ---------- */
// Non c'e delete: si destruttura via la chiave e si tiene il resto.
const utente = { id: 1, nome: 'Sara', password: 'segreta' };
const { password, ...utentePulito } = utente;
console.log(utentePulito); // => { id: 1, nome: 'Sara' }

/* ---------- 9. Rinominare durante l'estrazione + raccogliere ---------- */
const articolo = { articolo_poly: 'AR-12', descrizione: 'guanti', scortaMinima: 5 };
const { articolo_poly: cdAr, ...altriCampi } = articolo;
console.log(cdAr);       // => 'AR-12'
console.log(altriCampi); // => { descrizione: 'guanti', scortaMinima: 5 }

/* ---------- 10. Default value nel destructuring ---------- */
// Se la chiave manca o e undefined, si usa il default.
const reparto = { sigla: 'PR' };
const { sigla = 'XX', responsabile = 'N/D' } = reparto;
console.log(sigla, responsabile); // => 'PR' 'N/D'

/* ---------- 11. Spread + override condizionale ---------- */
// Spread condizionale: aggiunge una chiave solo se una condizione e vera.
function costruisciDipendente(d, includiNote) {
  return {
    ...d,
    ...(includiNote && { note: 'verificato' }),
  };
}
console.log(costruisciDipendente({ id: 1 }, false)); // => { id: 1 }
console.log(costruisciDipendente({ id: 1 }, true));  // => { id: 1, note: 'verificato' }

/* ---------- 12. Ordine conta: default DOPO lo spread ---------- */
// Se vuoi un fallback solo per chiavi mancanti, metti i default a sinistra.
const parziale = { nome: 'Gino', attivo: undefined };
const conFallback = { attivo: true, ...parziale };
console.log(conFallback.attivo); // => undefined (spread sovrascrive anche con undefined!)
// Attenzione: undefined sovrascrive. Per ignorarlo serve filtrare prima.

/* ---------- 13. Merge profondo (deep) fatto a mano ---------- */
// Lo spread e shallow: per oggetti annidati va fatto livello per livello.
const stato = { utente: { nome: 'Eva', reparto: 'PR' }, tema: 'chiaro' };
const nuovoStato = {
  ...stato,
  utente: { ...stato.utente, reparto: 'MG' },
};
console.log(nuovoStato.utente); // => { nome: 'Eva', reparto: 'MG' }
console.log(stato.utente.reparto); // => 'PR' (originale intatto)

/* ---------- 14. Spread di Object.entries/fromEntries (filtrare) ---------- */
// Rimuovere le chiavi con valore undefined prima di un merge.
function senzaUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}
const patch = { nome: 'Tea', cognome: undefined };
const record = { nome: 'X', cognome: 'Y' };
console.log({ ...record, ...senzaUndefined(patch) }); // => { nome: 'Tea', cognome: 'Y' }

/* ---------- 15. Chiavi computate insieme allo spread ---------- */
const campo = 'oreLavorate';
const timbratura = { id: 3, [campo]: 7.5, ...{ data: '2026-06-30' } };
console.log(timbratura); // => { id: 3, oreLavorate: 7.5, data: '2026-06-30' }

/* ---------- 16. Aggiornare un elemento dentro un array (ERP) ---------- */
// Pattern immutabile: mappa e fai spread solo sull'elemento target.
const dipendenti = [
  { id: 1, nome: 'Mario', attivo: true },
  { id: 2, nome: 'Anna', attivo: true },
];
function disattiva(lista, id) {
  return lista.map((d) => (d.id === id ? { ...d, attivo: false } : d));
}
console.log(disattiva(dipendenti, 2));
// => [ {id:1,...attivo:true}, {id:2,...attivo:false} ]
console.log(dipendenti[1].attivo); // => true (originale immutato)

/* ---------- 17. Toggle di una proprieta in modo immutabile ---------- */
const dpi = { codice: 'UP-007', inUso: false };
const toggled = { ...dpi, inUso: !dpi.inUso };
console.log(toggled.inUso); // => true

/* ---------- 18. Estrarre testa e coda di proprieta note ---------- */
const turnoP4 = { sigla: 'P4', inizio: '08:00', fine: '17:00', pausa: true, extra: 5 };
const { sigla: s, inizio, fine, ...metadati } = turnoP4;
console.log(s, inizio, fine); // => 'P4' '08:00' '17:00'
console.log(metadati);        // => { pausa: true, extra: 5 }

/* ---------- 19. Costruire un DTO "ripulito" per il client ---------- */
// Dal record DB tengo solo cio che serve al frontend, via rest + spread.
function toDTO(row) {
  const { passwordHash, internalNote, ...pubblici } = row;
  return { ...pubblici, label: `${row.nome} ${row.cognome}` };
}
console.log(
  toDTO({ id: 1, nome: 'Ada', cognome: 'Bo', passwordHash: 'x', internalNote: 'n' })
); // => { id: 1, nome: 'Ada', cognome: 'Bo', label: 'Ada Bo' }

/* ---------- 20. Merge di default annidati per impostazioni utente ---------- */
const DEFAULT_BADGE = { prefisso: 'UP', cifre: 3, separatore: '-' };
function formattaBadge(numero, opzioni = {}) {
  const o = { ...DEFAULT_BADGE, ...opzioni };
  const num = String(numero).padStart(o.cifre, '0');
  return `${o.prefisso}${o.separatore}${num}`;
}
console.log(formattaBadge(1));                 // => 'UP-001'
console.log(formattaBadge(42, { cifre: 4 }));  // => 'UP-0042'

/* ---------- 21. Spread non copia i metodi del prototype ---------- */
// Solo le proprieta "own" enumerabili vengono copiate, non quelle ereditate.
class Reparto {
  constructor(sigla) { this.sigla = sigla; }
  descrivi() { return `Reparto ${this.sigla}`; }
}
const r = new Reparto('MG');
const plain = { ...r };
console.log(plain.sigla);          // => 'MG'
console.log(typeof plain.descrivi); // => 'undefined' (metodo perso)

/* ---------- 22. Spread vs Object.assign ---------- */
// Object.assign MUTA il target; lo spread crea sempre un nuovo oggetto.
const target = { a: 1 };
Object.assign(target, { b: 2 });
console.log(target);          // => { a: 1, b: 2 } (mutato)
const nuovo = { ...{ a: 1 }, b: 2 }; // nessuna mutazione
console.log(nuovo);           // => { a: 1, b: 2 }

/* ---------- 23. Combinare rest in parametri di funzione ---------- */
// Destructuring con rest direttamente nei parametri.
function registra({ id, ...dati }) {
  console.log(`Registro id=${id}`, dati);
}
registra({ id: 5, nome: 'Ivo', reparto: 'PR' });
// => Registro id=5 { nome: 'Ivo', reparto: 'PR' }

/* ---------- 24. Accumulare patch successive (reducer-like) ---------- */
const patches = [{ attivo: false }, { nome: 'Nuovo' }, { reparto: 'MG' }];
const finale = patches.reduce((acc, p) => ({ ...acc, ...p }), { id: 1 });
console.log(finale); // => { id: 1, attivo: false, nome: 'Nuovo', reparto: 'MG' }

/* ---------- 25. Clone profondo sicuro con structuredClone ---------- */
// Quando serve un vero deep clone (non shallow), usa structuredClone.
const profondo = { utente: { nome: 'Zoe', skills: ['p4', 'p2'] } };
const copiaProfonda = structuredClone(profondo);
copiaProfonda.utente.skills.push('mg');
console.log(profondo.utente.skills);      // => ['p4','p2'] (intatto)
console.log(copiaProfonda.utente.skills); // => ['p4','p2','mg']

/* ============================================================
   RIEPILOGO COMANDI
   - { ...obj }                      clone shallow
   - { ...a, ...b }                  merge (b vince su a)
   - { ...obj, chiave: val }         override / aggiunta proprieta
   - { chiave, ...resto }            rest: estrai + raccogli il resto
   - { chiave: alias, ...resto }     rename in destructuring
   - { chiave = default }            valore di default
   - { ...(cond && { k: v }) }       spread condizionale
   - { ...o, nested: { ...o.nested }} merge "deep" manuale (livello a livello)
   - Object.assign(t, src)           merge che MUTA il target
   - Object.entries / fromEntries    filtrare chiavi prima del merge
   - [campo]: val                    chiave computata
   - structuredClone(obj)            deep clone reale
   ============================================================ */
