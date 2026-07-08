/* ============================================================
   112 JS ADV TS Generics
   I Generics di TypeScript permettono di scrivere funzioni, classi e
   tipi che lavorano con UN tipo variabile (un "parametro di tipo"),
   mantenendo il type-safety senza perdere la riutilizzabilita'.
   Questo file e' SOLO JavaScript eseguibile con Node: gli esempi in
   sintassi TypeScript sono COMMENTATI (servono come riferimento di
   come si scriverebbero in .ts), mentre il codice JS attivo mostra
   l'EQUIVALENTE a runtime (i generics non esistono a runtime: TS li
   usa solo in fase di compilazione per il controllo dei tipi).
   ============================================================ */

'use strict';

// ------------------------------------------------------------
// 0) NOTA FONDAMENTALE
// ------------------------------------------------------------
// I generics sono un costrutto di TYPE-CHECKING: esistono solo a
// compile-time. A runtime (cioe' in JavaScript) spariscono del tutto.
// Quindi qui mostriamo: (a) come si scriverebbe in TypeScript [commento]
// e (b) lo stesso comportamento in JavaScript puro [codice eseguibile].

// ------------------------------------------------------------
// 1) FUNZIONE GENERICA (identity)
// ------------------------------------------------------------
// TypeScript:
//   function identita<T>(valore: T): T { return valore; }
//   identita<number>(42);      // T = number
//   identita("ciao");          // T = string (inferito)
//
// JavaScript equivalente: una normale funzione che ritorna l'argomento.
function identita(valore) {
  return valore;
}
console.log(identita(42));        // => 42
console.log(identita('ciao'));    // => ciao
console.log(identita([1, 2, 3])); // => [ 1, 2, 3 ]

// ------------------------------------------------------------
// 2) PERCHE' NON "any"
// ------------------------------------------------------------
// TypeScript:
//   function identitaAny(valore: any): any { return valore; }
// Con `any` perdi il tipo: il compilatore non ti aiuta piu'.
// Con <T> il tipo "entra ed esce" intatto: chiamando identita("x")
// TypeScript SA che il risultato e' una string.
// A runtime (JS) non cambia nulla: e' solo il check statico a differire.

// ------------------------------------------------------------
// 3) GENERIC SU ARRAY
// ------------------------------------------------------------
// TypeScript:
//   function primoElemento<T>(arr: T[]): T | undefined { return arr[0]; }
//   function ultimo<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }
//
// JavaScript equivalente:
function primoElemento(arr) {
  return arr[0];
}
function ultimo(arr) {
  return arr[arr.length - 1];
}
console.log(primoElemento(['a', 'b', 'c'])); // => a
console.log(ultimo([10, 20, 30]));           // => 30

// ------------------------------------------------------------
// 4) GENERIC CON CONSTRAINT (extends)
// ------------------------------------------------------------
// In TypeScript `T extends ...` LIMITA i tipi accettati.
// TypeScript:
//   function lunghezza<T extends { length: number }>(x: T): number {
//     return x.length;
//   }
//   lunghezza("ciao");      // ok: string ha length
//   lunghezza([1, 2, 3]);   // ok: array ha length
//   lunghezza(42);          // ERRORE TS: number non ha length
//
// JavaScript equivalente (a runtime nessun vincolo, lo emuliamo a mano):
function lunghezza(x) {
  if (x == null || typeof x.length !== 'number') {
    throw new TypeError('Atteso un valore con proprieta length');
  }
  return x.length;
}
console.log(lunghezza('ciao'));    // => 4
console.log(lunghezza([1, 2, 3])); // => 3

// ------------------------------------------------------------
// 5) keyof + GENERIC (accesso sicuro a una proprieta)
// ------------------------------------------------------------
// TypeScript:
//   function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
//     return obj[key];
//   }
//   const dip = { id: 1, nome: "Mario" };
//   getProp(dip, "nome");   // tipo: string
//   getProp(dip, "xxx");    // ERRORE TS: "xxx" non e' una chiave di dip
//
// JavaScript equivalente:
function getProp(obj, key) {
  return obj[key];
}
const dip = { id: 1, nome: 'Mario', codiceBadge: 'UP-001' };
console.log(getProp(dip, 'nome'));        // => Mario
console.log(getProp(dip, 'codiceBadge')); // => UP-001

// ------------------------------------------------------------
// 6) TYPE GENERICO (interfaccia parametrica) — spunto ERP
// ------------------------------------------------------------
// Una risposta API generica che avvolge un payload di tipo T.
// TypeScript:
//   type ApiResponse<T> = { ok: boolean; dati: T; errore?: string };
//   type Dipendente = { id: number; nome: string; codiceBadge: string };
//   const r: ApiResponse<Dipendente> = { ok: true, dati: { id: 1, nome: "Ada", codiceBadge: "UI-001" } };
//   const lista: ApiResponse<Dipendente[]> = { ok: true, dati: [] };
//
// JavaScript equivalente: oggetti normali con la stessa "forma".
function apiOk(dati) {
  return { ok: true, dati };
}
function apiErrore(messaggio) {
  return { ok: false, dati: null, errore: messaggio };
}
console.log(apiOk({ id: 1, nome: 'Ada', codiceBadge: 'UI-001' }));
// => { ok: true, dati: { id: 1, nome: 'Ada', codiceBadge: 'UI-001' } }
console.log(apiErrore('Dipendente non trovato'));
// => { ok: false, dati: null, errore: 'Dipendente non trovato' }

// ------------------------------------------------------------
// 7) DEFAULT TYPE PARAMETER
// ------------------------------------------------------------
// TypeScript:
//   type Box<T = string> = { contenuto: T };
//   const b1: Box = { contenuto: "ciao" };          // T = string (default)
//   const b2: Box<number> = { contenuto: 42 };       // T = number
//
// JavaScript: e' solo un oggetto; il "default" e' un concetto di tipo.
const box1 = { contenuto: 'ciao' };
const box2 = { contenuto: 42 };
console.log(box1, box2); // => { contenuto: 'ciao' } { contenuto: 42 }

// ------------------------------------------------------------
// 8) CLASSE GENERICA (Repository) — spunto ERP
// ------------------------------------------------------------
// TypeScript:
//   class Repository<T extends { id: number }> {
//     private items: T[] = [];
//     add(item: T): T { this.items.push(item); return item; }
//     findById(id: number): T | undefined { return this.items.find(i => i.id === id); }
//     all(): T[] { return [...this.items]; }
//   }
//   const repo = new Repository<Dipendente>();
//
// JavaScript equivalente: stessa classe senza annotazioni di tipo.
class Repository {
  #items = [];
  add(item) {
    this.#items.push(item);
    return item;
  }
  findById(id) {
    return this.#items.find((i) => i.id === id);
  }
  all() {
    return [...this.#items];
  }
}
const repoDip = new Repository();
repoDip.add({ id: 1, nome: 'Ada', codiceBadge: 'UI-001' });
repoDip.add({ id: 2, nome: 'Bruno', codiceBadge: 'UP-002' });
console.log(repoDip.findById(2));  // => { id: 2, nome: 'Bruno', codiceBadge: 'UP-002' }
console.log(repoDip.all().length); // => 2

// ------------------------------------------------------------
// 9) PIU' PARAMETRI DI TIPO (<T, U>)
// ------------------------------------------------------------
// TypeScript:
//   function mapAndFilter<T, U>(arr: T[], trasforma: (x: T) => U, tieni: (u: U) => boolean): U[] {
//     return arr.map(trasforma).filter(tieni);
//   }
//
// JavaScript equivalente:
function mapAndFilter(arr, trasforma, tieni) {
  return arr.map(trasforma).filter(tieni);
}
const oreMese = mapAndFilter(
  [{ ore: 7.5 }, { ore: 0 }, { ore: 8 }],
  (t) => t.ore,          // T (oggetto) -> U (number)
  (ore) => ore > 0       // tieni solo chi ha lavorato
);
console.log(oreMese); // => [ 7.5, 8 ]

// ------------------------------------------------------------
// 10) UTILITY TYPES (solo TypeScript — qui spiegati e emulati in JS)
// ------------------------------------------------------------
// Gli utility types trasformano un tipo esistente. NON esistono a runtime.
//
// Partial<T> -> tutte le proprieta diventano opzionali
//   TypeScript: function aggiorna(id: number, patch: Partial<Dipendente>): void { ... }
//   JS equivalente: una patch e' un oggetto con alcune chiavi.
function aggiornaDipendente(dipendente, patch) {
  return { ...dipendente, ...patch };
}
console.log(aggiornaDipendente(dip, { nome: 'Mario Rossi' }));
// => { id: 1, nome: 'Mario Rossi', codiceBadge: 'UP-001' }

// Required<T> -> tutte le proprieta diventano obbligatorie
//   type DipendenteCompleto = Required<Dipendente>;
//
// Pick<T, K> -> seleziona solo alcune chiavi
//   type DipendenteBadge = Pick<Dipendente, "id" | "codiceBadge">;
function pickKeys(obj, chiavi) {
  const out = {};
  for (const k of chiavi) out[k] = obj[k];
  return out;
}
console.log(pickKeys(dip, ['id', 'codiceBadge'])); // => { id: 1, codiceBadge: 'UP-001' }

// Omit<T, K> -> tutte le chiavi TRANNE alcune
//   type NuovoDipendente = Omit<Dipendente, "id">;
function omitKeys(obj, chiavi) {
  const out = { ...obj };
  for (const k of chiavi) delete out[k];
  return out;
}
console.log(omitKeys(dip, ['id'])); // => { nome: 'Mario', codiceBadge: 'UP-001' }

// Readonly<T> -> proprieta non riassegnabili (compile-time).
//   type Turno = { sigla: string; conPausa: boolean; minuti: number };
//   const turnoP4: Readonly<Turno> = { sigla: "P4", conPausa: true, minuti: 480 };
//   JS equivalente a runtime: Object.freeze.
const turnoP4 = Object.freeze({ sigla: 'P4', conPausa: true, minuti: 480 });
console.log(turnoP4.sigla); // => P4
// turnoP4.minuti = 0;      // in strict mode lancia TypeError (oggetto frozen)

// Record<K, V> -> oggetto con chiavi K e valori V
//   type SiglaReparto = "PR" | "MG" | "QC";
//   const responsabili: Record<SiglaReparto, string> = { PR: "Ada", MG: "Bruno", QC: "Carla" };
const responsabili = { PR: 'Ada', MG: 'Bruno', QC: 'Carla' };
console.log(responsabili.MG); // => Bruno

// ------------------------------------------------------------
// 11) GENERIC "toDTO" (proiezione di un record) — spunto ERP
// ------------------------------------------------------------
// TypeScript:
//   function toDTO<T, K extends keyof T>(row: T, chiavi: K[]): Pick<T, K> {
//     const out = {} as Pick<T, K>;
//     for (const k of chiavi) out[k] = row[k];
//     return out;
//   }
//
// JavaScript equivalente (riusa la logica di pickKeys come DTO mapper):
function toDTO(row, chiavi) {
  const out = {};
  for (const k of chiavi) out[k] = row[k];
  return out;
}
const righe = [
  { id: 1, nome: 'Ada', cognome: 'Lovelace', codiceBadge: 'UI-001', reparto: 'IT' },
  { id: 2, nome: 'Bruno', cognome: 'Bianchi', codiceBadge: 'UP-002', reparto: 'PR' },
];
const dtoList = righe.map((r) => toDTO(r, ['nome', 'codiceBadge']));
console.log(dtoList);
// => [ { nome: 'Ada', codiceBadge: 'UI-001' }, { nome: 'Bruno', codiceBadge: 'UP-002' } ]

// ------------------------------------------------------------
// 12) GENERIC VARIADICO + DEFAULT (factory di liste)
// ------------------------------------------------------------
// TypeScript:
//   function creaLista<T = unknown>(...items: T[]): T[] { return items; }
//
// JavaScript equivalente:
function creaLista(...items) {
  return items;
}
console.log(creaLista(1, 2, 3));  // => [ 1, 2, 3 ]
console.log(creaLista('a', 'b')); // => [ 'a', 'b' ]

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI
   ------------------------------------------------------------
   - Generics TS: <T>, <T, U> (parametri di tipo, solo compile-time)
   - Constraint: <T extends { length: number }>, <K extends keyof T>
   - keyof T, T[K]: accesso tipato a chiavi/valori
   - Default type param: <T = string>
   - Tipi generici: type ApiResponse<T>, type Box<T = ...>
   - Classe generica: class Repository<T extends { id: number }>
   - Utility types: Partial, Required, Pick, Omit, Readonly, Record
   - Equivalenti JS a runtime: spread {...a, ...b}, delete, Object.freeze,
     funzioni pickKeys/omitKeys/toDTO, oggetti-mappa (Record), rest ...args
   - REGOLA: generics e utility types spariscono a runtime; in JS ottieni
     lo stesso comportamento con funzioni e oggetti normali.
   ============================================================ */
