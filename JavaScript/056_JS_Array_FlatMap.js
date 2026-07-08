/* ============================================================
   56 JS Array FlatMap
   I metodi flat() e flatMap() servono per "appiattire" gli array,
   cioe' trasformare array annidati (nested arrays) in un array piu'
   piatto. flat() rimuove i livelli di annidamento fino a una certa
   profondita' (depth), mentre flatMap() combina una map() seguita da
   un flat() di profondita' 1 in un'unica operazione efficiente.
   Sono utili per espandere elementi, scartare valori e srotolare
   risultati di query in un gestionale ERP.
   ============================================================ */

/* ------------------------------------------------------------
   1) flat() BASE: appiattire un livello
   Di default flat() appiattisce di profondita' 1.
   ------------------------------------------------------------ */
const annidato = [1, 2, [3, 4]];
console.log(annidato.flat()); // => [1, 2, 3, 4]

// Senza argomenti, depth = 1: i livelli piu' profondi restano array
const profondo = [1, [2, [3, [4]]]];
console.log(profondo.flat()); // => [1, 2, [3, [4]]]

/* ------------------------------------------------------------
   2) flat(depth): specificare la profondita'
   ------------------------------------------------------------ */
console.log(profondo.flat(2)); // => [1, 2, 3, [4]]
console.log(profondo.flat(3)); // => [1, 2, 3, 4]

// Infinity appiattisce QUALSIASI livello di annidamento
const moltoProfondo = [1, [2, [3, [4, [5, [6]]]]]];
console.log(moltoProfondo.flat(Infinity)); // => [1, 2, 3, 4, 5, 6]

/* ------------------------------------------------------------
   3) flat() rimuove gli slot vuoti (empty slots)
   Gli array "sparsi" (sparse arrays) perdono i buchi.
   ------------------------------------------------------------ */
const sparso = [1, , 3, , 5];
console.log(sparso.flat()); // => [1, 3, 5]

/* ------------------------------------------------------------
   4) flat() NON modifica l'array originale (non mutating)
   Ritorna sempre un nuovo array.
   ------------------------------------------------------------ */
const orig = [1, [2, 3]];
const piatto = orig.flat();
console.log(orig);   // => [1, [2, 3]]
console.log(piatto); // => [1, 2, 3]

/* ------------------------------------------------------------
   5) flatMap() BASE: map + flat(1)
   La callback trasforma ogni elemento; il risultato viene
   appiattito di un livello.
   ------------------------------------------------------------ */
const numeri = [1, 2, 3];
console.log(numeri.flatMap(n => [n, n * 2]));
// => [1, 2, 2, 4, 3, 6]

// Equivalente verboso con map().flat()
console.log(numeri.map(n => [n, n * 2]).flat());
// => [1, 2, 2, 4, 3, 6]

/* ------------------------------------------------------------
   6) flatMap() appiattisce SOLO un livello
   Se la callback ritorna array annidati, restano annidati.
   ------------------------------------------------------------ */
console.log([1, 2].flatMap(n => [[n]]));
// => [[1], [2]]  (un solo livello rimosso)

/* ------------------------------------------------------------
   7) flatMap() per ESPANDERE elementi
   Da una frase a una lista di parole.
   ------------------------------------------------------------ */
const frasi = ["ciao mondo", "buongiorno a tutti"];
console.log(frasi.flatMap(f => f.split(" ")));
// => ["ciao", "mondo", "buongiorno", "a", "tutti"]

/* ------------------------------------------------------------
   8) flatMap() per FILTRARE (mappa + filtra in un colpo)
   Ritornando [] si scarta l'elemento, [valore] lo si tiene.
   E' un trucco molto comune: map + filter insieme.
   ------------------------------------------------------------ */
const valori = [1, -2, 3, -4, 5];
const soloPositivi = valori.flatMap(v => (v > 0 ? [v] : []));
console.log(soloPositivi); // => [1, 3, 5]

// Filtrare e trasformare contemporaneamente: pari raddoppiati
const misti = [1, 2, 3, 4, 5, 6];
console.log(misti.flatMap(n => (n % 2 === 0 ? [n * 10] : [])));
// => [20, 40, 60]

/* ------------------------------------------------------------
   9) flatMap() con indice (callback (elemento, indice, array))
   ------------------------------------------------------------ */
const lettere = ["a", "b", "c"];
console.log(lettere.flatMap((lett, i) => [i, lett]));
// => [0, "a", 1, "b", 2, "c"]

/* ------------------------------------------------------------
   10) flatMap() per INTERCALARE (inserire separatori)
   Aggiunge un separatore tra gli elementi, tranne il primo.
   ------------------------------------------------------------ */
const parole = ["uno", "due", "tre"];
const conTrattini = parole.flatMap((p, i) => (i === 0 ? [p] : ["-", p]));
console.log(conTrattini.join("")); // => "uno-due-tre"

/* ------------------------------------------------------------
   11) flat() per concatenare array di array
   Utile per unire risultati raggruppati.
   ------------------------------------------------------------ */
const gruppi = [[1, 2], [3, 4], [5, 6]];
console.log(gruppi.flat()); // => [1, 2, 3, 4, 5, 6]

/* ============================================================
   ESEMPI AVANZATI ISPIRATI A UN GESTIONALE ERP
   ============================================================ */

/* ------------------------------------------------------------
   12) Espandere le timbrature di piu' dipendenti
   Ogni dipendente ha un array di timbrature; con flatMap
   otteniamo un'unica lista piatta di eventi.
   ------------------------------------------------------------ */
const dipendenti = [
  { badge: "UP-001", nome: "Mario", timbrature: ["08:00", "12:00", "13:00", "17:00"] },
  { badge: "UP-002", nome: "Lucia", timbrature: ["09:00", "18:00"] },
  { badge: "UP-003", nome: "Anna", timbrature: [] },
];

const tutteLeTimbrature = dipendenti.flatMap(d =>
  d.timbrature.map(ora => ({ badge: d.badge, ora }))
);
console.log(tutteLeTimbrature);
// => [{badge:'UP-001', ora:'08:00'}, ... {badge:'UP-002', ora:'18:00'}]
// I dipendenti senza timbrature (Anna) spariscono automaticamente.

/* ------------------------------------------------------------
   13) Estrarre tutti i capi di vestiario assegnati
   Ogni assegnazione contiene un array di capi: srotoliamoli.
   ------------------------------------------------------------ */
const assegnazioni = [
  { badge: "UP-001", vestiario: [{ capo: "Giacca", taglia: "L" }, { capo: "Scarpe", taglia: "42" }] },
  { badge: "UP-002", vestiario: [{ capo: "Giacca", taglia: "M" }] },
];
const capiTotali = assegnazioni.flatMap(a =>
  a.vestiario.map(v => `${a.badge}: ${v.capo} (${v.taglia})`)
);
console.log(capiTotali);
// => ['UP-001: Giacca (L)', 'UP-001: Scarpe (42)', 'UP-002: Giacca (M)']

/* ------------------------------------------------------------
   14) flatMap come filter+map: turni P4 (con pausa) validi
   Teniamo solo i turni che hanno una pausa pranzo definita.
   ------------------------------------------------------------ */
const turni = [
  { tipo: "P4", pausa: "12:00-13:00" },
  { tipo: "P2", pausa: null },
  { tipo: "P4", pausa: "13:00-14:00" },
];
const pause = turni.flatMap(t => (t.pausa ? [t.pausa] : []));
console.log(pause); // => ['12:00-13:00', '13:00-14:00']

/* ------------------------------------------------------------
   15) Parsing di range orari con regex + flatMap
   Da una stringa con piu' range otteniamo coppie [inizio, fine].
   ------------------------------------------------------------ */
const fasce = ["08:00-12:00", "13:00-17:00"];
const estremi = fasce.flatMap(f => f.split("-"));
console.log(estremi); // => ['08:00', '12:00', '13:00', '17:00']

/* ------------------------------------------------------------
   16) Appiattire reparti -> dipendenti annidati a piu' livelli
   Struttura: azienda -> reparti -> dipendenti. flat(Infinity)
   srotola tutto in un'unica lista di nomi.
   ------------------------------------------------------------ */
const azienda = [
  ["Produzione", [["Mario"], ["Lucia"]]],
  ["Magazzino", [["Anna"], ["Paolo"]]],
];
const tuttiINomi = azienda.flat(Infinity).filter(x => /^[A-Z]/.test(x) && x !== "Produzione" && x !== "Magazzino");
console.log(tuttiINomi); // => ['Mario', 'Lucia', 'Anna', 'Paolo']

/* ------------------------------------------------------------
   17) Calcolo: minuti lavorati appiattendo coppie ingresso/uscita
   flatMap genera segmenti, poi reduce somma i minuti.
   ------------------------------------------------------------ */
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const giornate = [
  { ingresso: "08:00", uscita: "12:00" },
  { ingresso: "13:00", uscita: "17:30" },
];
const minutiSegmenti = giornate.flatMap(g => [toMin(g.uscita) - toMin(g.ingresso)]);
const totaleMinuti = minutiSegmenti.reduce((s, m) => s + m, 0);
console.log(totaleMinuti); // => 510  (4h + 4h30m)

/* ------------------------------------------------------------
   18) flatMap con Set per ottenere taglie uniche del magazzino
   ------------------------------------------------------------ */
const articoli = [
  { capo: "Giacca", taglie: ["S", "M", "L"] },
  { capo: "Scarpe", taglie: ["42", "43"] },
  { capo: "Guanti", taglie: ["M", "L"] },
];
const taglieUniche = [...new Set(articoli.flatMap(a => a.taglie))];
console.log(taglieUniche); // => ['S', 'M', 'L', '42', '43']

/* ------------------------------------------------------------
   19) flatMap NON e' ricorsivo: attenzione alla profondita'
   Per appiattire piu' livelli serve flat() esplicito.
   ------------------------------------------------------------ */
const matrice = [[1, [2]], [3, [4]]];
console.log(matrice.flatMap(x => x));      // => [1, [2], 3, [4]]
console.log(matrice.flat(Infinity));        // => [1, 2, 3, 4]

/* ------------------------------------------------------------
   20) flatMap() su stringhe -> array di caratteri di parole lunghe
   Combinazione espansione + filtro.
   ------------------------------------------------------------ */
const testo = ["si", "produzione", "no", "magazzino"];
const lettereParoleLunghe = testo.flatMap(p => (p.length > 3 ? p.split("") : []));
console.log(lettereParoleLunghe.length); // => 19

/* ------------------------------------------------------------
   21) Implementazione "manuale" di flat (per capire il meccanismo)
   ------------------------------------------------------------ */
function flatManuale(arr, depth = 1) {
  return depth < 1
    ? arr.slice()
    : arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatManuale(val, depth - 1) : val),
        []
      );
}
console.log(flatManuale([1, [2, [3, [4]]]], Infinity)); // => [1, 2, 3, 4]

/* ------------------------------------------------------------
   22) flatMap restituisce sempre un array piatto di un livello,
   anche se la callback ritorna un valore non-array (viene
   trattato come elemento singolo).
   ------------------------------------------------------------ */
console.log([1, 2, 3].flatMap(n => n * 2)); // => [2, 4, 6]

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - arr.flat()                  -> appiattisce 1 livello
   - arr.flat(depth)             -> appiattisce fino a depth livelli
   - arr.flat(Infinity)          -> appiattisce tutti i livelli
   - arr.flatMap(cb)             -> map + flat(1) in un'unica passata
   - flatMap(v => [v])           -> tiene l'elemento
   - flatMap(v => [])            -> scarta l'elemento (filter)
   - flatMap(v => [a, b])        -> espande in piu' elementi
   - flat() / flatMap()          -> NON mutano l'originale
   - flat()                      -> rimuove gli empty slots
   - cb riceve (elemento, indice, array)
   - utili con: .reduce(), new Set([...]), .split(), .join()
   ============================================================ */
