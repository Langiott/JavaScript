/* ============================================================
   111 JS ADV TS Basics
   Introduzione a TypeScript: il superset tipizzato di JavaScript.
   Vedremo le annotazioni di tipo (type annotations), la differenza
   tra "type" e "interface", gli union types, le proprieta opzionali
   con "?", e la type inference (deduzione automatica dei tipi).
   NB: questo file usa sintassi TypeScript dentro un .js a scopo
   didattico: il codice TS NON gira direttamente con Node (serve
   "tsc" o "ts-node"). Gli esempi puramente JS sono eseguibili.
   ============================================================ */

// ------------------------------------------------------------
// 1) ANNOTAZIONI DI TIPO (type annotations)
// ------------------------------------------------------------
// In TypeScript dichiari il tipo di una variabile dopo i due punti.

// let nome: string = "Mario";
// let eta: number = 42;
// let attivo: boolean = true;
// console.log(nome, eta, attivo); // => Mario 42 true

// I tipi primitivi base: string, number, boolean, null, undefined, bigint, symbol.
// let pi: number = 3.14;
// let big: bigint = 9007199254740993n;
// let id: symbol = Symbol("id");

// ------------------------------------------------------------
// 2) TYPE INFERENCE (deduzione automatica)
// ------------------------------------------------------------
// Se inizializzi una variabile, TypeScript deduce il tipo da solo:
// niente annotazione necessaria.

// let citta = "Roma";   // inferito come string
// citta = 123;          // ERRORE TS: number non assegnabile a string

// La inference vale anche per i valori di ritorno delle funzioni:
// function somma(a: number, b: number) {
//   return a + b;       // ritorno inferito: number
// }
// const r = somma(2, 3); // r e' number => 5

// Best practice: annota i PARAMETRI e lascia inferire il RITORNO.

// ------------------------------------------------------------
// 3) ANNOTAZIONI SU FUNZIONI
// ------------------------------------------------------------
// Parametri e tipo di ritorno esplicito.

// function badgeLabel(nome: string, cognome: string): string {
//   return `${nome} ${cognome}`;
// }
// console.log(badgeLabel("Anna", "Verdi")); // => Anna Verdi

// Funzione che non ritorna nulla: tipo "void".
// function logEvento(msg: string): void {
//   console.log("[LOG]", msg);
// }

// Arrow function tipizzata.
// const doppio = (n: number): number => n * 2;

// ------------------------------------------------------------
// 4) TYPE ALIAS (la parola chiave "type")
// ------------------------------------------------------------
// "type" crea un alias riutilizzabile per una forma di dato.

// type Dipendente = {
//   id: number;
//   nome: string;
//   cognome: string;
//   codiceBadge: string; // es. 'UP-001'
// };
//
// const dip: Dipendente = {
//   id: 1, nome: "Luca", cognome: "Bianchi", codiceBadge: "UP-001"
// };
// console.log(dip.codiceBadge); // => UP-001

// "type" puo aliasare anche primitivi, union, tuple, funzioni:
// type ID = number | string;
// type Coppia = [number, number];
// type Validatore = (val: string) => boolean;

// ------------------------------------------------------------
// 5) INTERFACE
// ------------------------------------------------------------
// "interface" descrive la forma di un oggetto, simile a "type".

// interface Reparto {
//   sigla: string;   // 2 lettere, es 'XX'
//   nome: string;
//   attivo: boolean;
// }
//
// const rep: Reparto = { sigla: "PR", nome: "Produzione", attivo: true };

// ------------------------------------------------------------
// 6) TYPE vs INTERFACE: differenze pratiche
// ------------------------------------------------------------
// - Entrambi descrivono oggetti.
// - "interface" supporta il "declaration merging" (riapertura):
//
// interface Turno { codice: string; }
// interface Turno { conPausa: boolean; }  // si fonde con la precedente
// const t: Turno = { codice: "P4", conPausa: true };
//
// - "type" NON si puo riaprire, ma puo fare union/intersection di
//   primitivi e tuple (cosa che interface non puo fare direttamente).
//
// - Estensione:
//   interface A { x: number }
//   interface B extends A { y: number }    // interface usa "extends"
//
//   type A2 = { x: number };
//   type B2 = A2 & { y: number };          // type usa intersection "&"
//
// Regola pratica: usa "interface" per le forme di oggetti pubblici/
// estendibili, "type" per union, tuple e composizioni.

// ------------------------------------------------------------
// 7) PROPRIETA OPZIONALI con "?"
// ------------------------------------------------------------
// Il "?" rende un campo opzionale (puo mancare => undefined).

// interface Vestiario {
//   articolo: string;
//   taglia: string;
//   quantita: number;
//   scortaMinima?: number; // opzionale
// }
//
// const dpi1: Vestiario = { articolo: "Guanti", taglia: "L", quantita: 50 };
// const dpi2: Vestiario = { articolo: "Casco", taglia: "U", quantita: 3, scortaMinima: 5 };
// // dpi1.scortaMinima e' undefined: gestiscilo con nullish.
// // const soglia = dpi1.scortaMinima ?? 0; // => 0

// Parametri di funzione opzionali:
// function saluta(nome: string, titolo?: string): string {
//   return titolo ? `${titolo} ${nome}` : nome;
// }
// console.log(saluta("Rossi"));          // => Rossi
// console.log(saluta("Rossi", "Dott."));  // => Dott. Rossi

// Default params (alternativa all'opzionale con valore di fallback):
// function arrotonda(min: number, regola: number = 15): number {
//   return Math.round(min / regola) * regola;
// }

// ------------------------------------------------------------
// 8) UNION TYPES (un valore tra piu tipi)
// ------------------------------------------------------------
// L'operatore "|" crea un union: il valore puo essere uno dei tipi.

// type Tab = "dipendenti" | "reparti" | "archiviati";
// let tabAttiva: Tab = "dipendenti";
// tabAttiva = "reparti";    // OK
// tabAttiva = "altro";      // ERRORE TS: non e' nel union

// Union di tipi diversi:
// type Esito = number | string;
// function leggiId(x: Esito) {
//   if (typeof x === "number") return x.toFixed(0); // qui x e' number
//   return x.trim();                                // qui x e' string
// }
// Questo controllo runtime si chiama "narrowing" (restringimento del tipo).

// Union per stati di una richiesta (pattern reale):
// type StatoRichiesta = "in_attesa" | "approvata" | "respinta";

// ------------------------------------------------------------
// 9) NARROWING: typeof, in, instanceof, discriminated union
// ------------------------------------------------------------
// typeof guard (gia visto). "in" guard verifica una proprieta:
//
// type Ingresso = { tipo: "ingresso"; ora: string };
// type Uscita = { tipo: "uscita"; ora: string; oreLavorate: number };
// type Timbratura = Ingresso | Uscita;   // discriminated union (campo "tipo")
//
// function descrivi(t: Timbratura): string {
//   if (t.tipo === "uscita") {
//     return `Uscita dopo ${t.oreLavorate}h`; // TS sa che oreLavorate esiste
//   }
//   return `Ingresso alle ${t.ora}`;
// }

// ------------------------------------------------------------
// 10) ARRAY E TIPI GENERICI BASE
// ------------------------------------------------------------
// Due notazioni equivalenti per array tipizzati:
// let numeri: number[] = [1, 2, 3];
// let nomi: Array<string> = ["a", "b"];
//
// Array di oggetti tipizzati:
// const dipendenti: Dipendente[] = [];
//
// Tuple (lunghezza e tipi fissi):
// let punto: [number, number] = [10, 20];

// ------------------------------------------------------------
// 11) ESEMPIO ESEGUIBILE (solo JS, gira con Node)
// ------------------------------------------------------------
// I "tipi" sono cancellati a runtime: la logica e' normale JavaScript.
// Qui riproduciamo il pattern ERP "somma minuti delle richieste approvate".

const richieste = [
  { id: 1, stato: "approvata", minuti: 480 },
  { id: 2, stato: "respinta", minuti: 120 },
  { id: 3, stato: "approvata", minuti: 60 },
];

const totaleMinuti = richieste
  .filter((r) => r.stato === "approvata")
  .reduce((s, r) => s + r.minuti, 0);

console.log("Totale minuti approvati:", totaleMinuti); // => 540

// Trasformazione in DTO con map (come "articoli -> {cdAr, descrizione}"):
const articoli = [
  { articolo_poly: "AP-1", descrizione: "Tuta", interno: true },
  { articolo_poly: "AP-2", descrizione: "Guanti", interno: false },
];
const dto = articoli.map((a) => ({ cdAr: a.articolo_poly, descrizione: a.descrizione }));
console.log(dto[0]); // => { cdAr: 'AP-1', descrizione: 'Tuta' }

// Optional chaining + nullish: gestire campi opzionali a runtime.
const row = { dipendente: { nome: "Sara" }, reparto: null };
const nome = row.dipendente?.nome ?? "N/D";
const sigla = row.reparto?.sigla ?? "XX";
console.log(nome, sigla); // => Sara XX

// ------------------------------------------------------------
// 12) NORMALIZZAZIONE CODICE BADGE (pattern reale, eseguibile)
// ------------------------------------------------------------
// In TS la firma sarebbe: function normBadge(v: string): string
function normBadge(v) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .slice(0, 8);
}
console.log(normBadge("  up-001 ")); // => UP-001

// ------------------------------------------------------------
// 13) FUNZIONI HIGHER-ORDER TIPIZZATE
// ------------------------------------------------------------
// type Predicato<T> = (x: T) => boolean;  (generico, vedi file avanzati)
// In TS: function filtra<T>(arr: T[], p: (x: T) => boolean): T[]
function filtra(arr, p) {
  return arr.filter(p);
}
console.log(filtra([1, 2, 3, 4], (n) => n % 2 === 0)); // => [ 2, 4 ]

// ------------------------------------------------------------
// 14) ANY, UNKNOWN, NEVER (i tipi speciali)
// ------------------------------------------------------------
// - "any": disabilita il controllo dei tipi (da evitare quando possibile).
//     let libero: any = 5; libero = "x"; libero.qualsiasi(); // nessun errore TS
// - "unknown": come any ma SICURO: prima di usarlo devi fare narrowing.
//     let dato: unknown = JSON.parse("{}");
//     if (typeof dato === "string") dato.trim(); // serve il controllo
// - "never": tipo dei valori che non accadono mai (funzioni che lanciano).
//     function errore(msg: string): never { throw new Error(msg); }

// ------------------------------------------------------------
// 15) LITERAL TYPES E READONLY
// ------------------------------------------------------------
// type Lato = "L" | "R";                 // literal union
// interface Config { readonly versione: string; }  // readonly = sola lettura
// const c: Config = { versione: "1.0" };
// c.versione = "2.0";  // ERRORE TS: proprieta readonly

// "as const" rende un oggetto letterale immutabile e literal:
const TURNI = ["P2", "P4"];
// In TS: const TURNI = ["P2","P4"] as const; // tipo: readonly ["P2","P4"]
console.log(TURNI.includes("P4")); // => true

// ------------------------------------------------------------
// 16) ESEMPIO BROWSER (gira nel browser, non in Node)
// ------------------------------------------------------------
// Esempio browser: gira nel browser, non in Node.
// In TS gli elementi DOM hanno tipi: HTMLInputElement, HTMLButtonElement...
//
// function leggiInput(): string {
//   const el = document.getElementById("badge") as HTMLInputElement;
//   return el.value;  // "as" fa un type assertion: dico a TS che tipo e'
// }

// ------------------------------------------------------------
// 17) PATTERN: validare un orario "HH:MM" (eseguibile)
// ------------------------------------------------------------
// In TS: function isOrario(s: string): boolean
function isOrario(s) {
  return /^\d{2}:\d{2}$/.test(s);
}
console.log(isOrario("08:30")); // => true
console.log(isOrario("8:30"));  // => false

/* ============================================================
   RIEPILOGO COMANDI / CONCETTI (memoria rapida)
   ------------------------------------------------------------
   ANNOTAZIONI:      let x: string / number / boolean
   FUNZIONE:         (a: number, b: number): number => ...
   INFERENCE:        let c = "Roma"  // tipo dedotto da TS
   TYPE ALIAS:       type Dipendente = { id: number; nome: string }
   INTERFACE:        interface Reparto { sigla: string }
   ESTENDERE:        interface B extends A {}  /  type B = A & {}
   MERGING:          interface riaperta (solo interface)
   OPZIONALE:        campo?: tipo  /  param?: tipo  /  default = val
   UNION:            type T = "a" | "b"  /  number | string
   NARROWING:        typeof, in, instanceof, discriminated union (campo "tipo")
   ARRAY:            number[]  /  Array<string>  /  tuple [number, number]
   SPECIALI:         any, unknown (sicuro), never, void
   LITERAL/READONLY: "L"|"R", readonly, as const
   ASSERTION:        valore as Tipo
   RUNTIME JS:       filter/reduce/map, ?., ??, regex .test()
   ============================================================ */
