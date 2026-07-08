/* ============================================================
   116 JS ADV State Machine
   Una macchina a stati finiti (FSM) applicata a un caso reale:
   il ciclo di vita di una RICHIESTA DI FERIE in un gestionale.
   Stati: bozza -> inviata -> approvata / rifiutata -> archiviata.
   Impariamo a modellare transizioni valide, a bloccare quelle
   illegali e a tenere uno storico immutabile degli eventi.
   Tutto in JavaScript moderno (ES2020+), eseguibile con Node.js,
   senza librerie esterne.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. DEFINIZIONE DELLA MACCHINA A STATI
   ------------------------------------------------------------
   Una FSM e' fatta di: stati, evento che scatena la transizione,
   e stato di destinazione. La rappresentiamo come una mappa:
   { statoCorrente: { evento: statoSuccessivo } }.
   Cosi' le transizioni NON previste semplicemente non esistono. */

const TRANSIZIONI = {
  bozza: { invia: 'inviata', elimina: 'eliminata' },
  inviata: { approva: 'approvata', rifiuta: 'rifiutata', ritira: 'bozza' },
  approvata: { archivia: 'archiviata' },
  rifiutata: { archivia: 'archiviata', riapri: 'bozza' },
  archiviata: {}, // stato finale: nessuna uscita
  eliminata: {},  // stato finale
};

// Uno stato e' "finale" se non ha transizioni in uscita.
const isStatoFinale = (stato) => Object.keys(TRANSIZIONI[stato] ?? {}).length === 0;
console.log(isStatoFinale('archiviata')); // => true
console.log(isStatoFinale('inviata'));    // => false

/* ------------------------------------------------------------
   2. LA FUNZIONE DI TRANSIZIONE (cuore della FSM)
   ------------------------------------------------------------
   Dato uno stato e un evento, restituisce il nuovo stato oppure
   lancia un errore se la transizione non e' ammessa. */

function transizione(statoCorrente, evento) {
  const ammesse = TRANSIZIONI[statoCorrente];
  if (!ammesse) throw new Error(`Stato sconosciuto: ${statoCorrente}`);
  const prossimo = ammesse[evento];
  if (!prossimo) {
    const validi = Object.keys(ammesse).join(', ') || '(nessuno)';
    throw new Error(`Transizione '${evento}' non valida da '${statoCorrente}'. Ammesse: ${validi}`);
  }
  return prossimo;
}

console.log(transizione('bozza', 'invia'));       // => 'inviata'
console.log(transizione('inviata', 'approva'));   // => 'approvata'

/* ------------------------------------------------------------
   3. UNA RICHIESTA COME OGGETTO CON STORICO IMMUTABILE
   ------------------------------------------------------------
   Usiamo una closure (factory) per incapsulare lo stato e lo
   storico. L'esterno puo' solo leggere, mai modificare a mano. */

function creaRichiesta(id, dipendente) {
  let stato = 'bozza';
  const storico = [{ evento: 'crea', stato, quando: 0 }];
  let tick = 1; // contatore deterministico (niente Date.now per riproducibilita')

  return {
    get id() { return id; },
    get dipendente() { return dipendente; },
    get stato() { return stato; },
    // Ritorna una COPIA dello storico: l'originale resta protetto.
    get storico() { return storico.map((e) => ({ ...e })); },

    // Applica un evento; aggiorna stato e storico oppure propaga l'errore.
    applica(evento) {
      const nuovo = transizione(stato, evento); // puo' lanciare
      stato = nuovo;
      storico.push({ evento, stato, quando: tick++ });
      return stato;
    },

    // Quali eventi sono possibili adesso? Utile per abilitare/disabilitare bottoni UI.
    eventiPossibili() {
      return Object.keys(TRANSIZIONI[stato] ?? {});
    },
  };
}

const r1 = creaRichiesta(101, 'Mario Rossi');
console.log(r1.stato);            // => 'bozza'
console.log(r1.eventiPossibili()); // => ['invia', 'elimina']

r1.applica('invia');
r1.applica('approva');
console.log(r1.stato);            // => 'approvata'
console.log(r1.eventiPossibili()); // => ['archivia']

/* ------------------------------------------------------------
   4. GESTIONE DEGLI ERRORI (transizioni illegali)
   ------------------------------------------------------------
   Provare ad approvare una richiesta gia' approvata deve fallire
   in modo controllato, non corrompere lo stato. */

try {
  r1.applica('approva'); // da 'approvata' non esiste 'approva'
} catch (err) {
  console.log('Bloccato:', err.message);
  // => Bloccato: Transizione 'approva' non valida da 'approvata'. Ammesse: archivia
}
console.log(r1.stato); // => 'approvata'  (stato NON corrotto)

/* ------------------------------------------------------------
   5. LO STORICO COMPLETO (audit trail)
   ------------------------------------------------------------
   In un gestionale reale vuoi sapere chi ha fatto cosa e quando.
   Qui lo simuliamo con il contatore 'quando'. */

r1.applica('archivia');
console.table
  ? console.table(r1.storico)
  : console.log(r1.storico);
/* Storico atteso:
   crea      -> bozza      (0)
   invia     -> inviata    (1)
   approva   -> approvata  (2)
   archivia  -> archiviata (3) */

/* ------------------------------------------------------------
   6. VALIDARE UN INTERO PERCORSO
   ------------------------------------------------------------
   Data una sequenza di eventi, verifichiamo se porta a uno stato
   finale valido SENZA modificare nulla (dry-run funzionale). */

function simulaPercorso(statoIniziale, eventi) {
  return eventi.reduce(
    (acc, ev) => {
      if (acc.errore) return acc; // gia' fallito: propaga
      try {
        return { stato: transizione(acc.stato, ev), errore: null };
      } catch (e) {
        return { stato: acc.stato, errore: e.message };
      }
    },
    { stato: statoIniziale, errore: null }
  );
}

console.log(simulaPercorso('bozza', ['invia', 'approva', 'archivia']));
// => { stato: 'archiviata', errore: null }
console.log(simulaPercorso('bozza', ['invia', 'archivia']));
// => { stato: 'inviata', errore: "Transizione 'archivia' non valida da 'inviata'. ..." }

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - Una FSM rende ESPLICITE le regole di business: cosa e' lecito.
   - La mappa TRANSIZIONI e' l'unica fonte di verita'.
   - La closure protegge lo stato interno (incapsulamento).
   - Lo storico immutabile = audit trail per un gestionale.
   - Il dry-run permette di validare senza effetti collaterali.
   ============================================================ */
