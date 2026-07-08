/* ============================================================
   15 JS Switch
   Lo statement switch valuta una espressione e ne confronta il
   valore con i vari case usando l'uguaglianza stretta (===).
   Quando trova una corrispondenza esegue il blocco relativo finche'
   non incontra un break (che esce dallo switch) oppure la fine.
   Senza break si ha il fall-through: l'esecuzione "cade" nel case
   successivo. Il ramo default gestisce i casi non previsti.
   Esiste anche il pattern switch(true) per condizioni a range.
   ============================================================ */

// ------------------------------------------------------------
// 1) Switch base: case + break + default
// ------------------------------------------------------------

// Mappa un giorno numerico (0-6) al nome del giorno.
function nomeGiorno(n) {
  switch (n) {
    case 0:
      return 'Domenica';
    case 1:
      return 'Lunedi';
    case 2:
      return 'Martedi';
    default:
      return 'Altro giorno';
  }
}
console.log(nomeGiorno(1)); // => Lunedi
console.log(nomeGiorno(9)); // => Altro giorno

// Con break invece di return: lo switch sceglie il ramo, poi prosegue.
let colore = 'rosso';
let semaforo;
switch (colore) {
  case 'rosso':
    semaforo = 'STOP';
    break;
  case 'verde':
    semaforo = 'VAI';
    break;
  default:
    semaforo = 'ATTENZIONE';
}
console.log(semaforo); // => STOP

// ------------------------------------------------------------
// 2) Confronto STRETTO (===): occhio ai tipi
// ------------------------------------------------------------

// '2' (stringa) NON corrisponde a 2 (numero): switch usa ===.
function tipoNumero(x) {
  switch (x) {
    case 2:
      return 'numero due';
    case '2':
      return 'stringa due';
    default:
      return 'sconosciuto';
  }
}
console.log(tipoNumero(2));   // => numero due
console.log(tipoNumero('2')); // => stringa due

// ------------------------------------------------------------
// 3) Fall-through INTENZIONALE: piu' case che condividono codice
// ------------------------------------------------------------

// Senza break i case "cadono" sul blocco successivo: utile per
// raggruppare valori che richiedono lo stesso comportamento.
function isWeekend(giorno) {
  switch (giorno) {
    case 'Sabato':
    case 'Domenica':
      return true;   // entrambi i case finiscono qui
    default:
      return false;
  }
}
console.log(isWeekend('Sabato'));   // => true
console.log(isWeekend('Lunedi'));   // => false

// Fall-through che accumula: senza break si eseguono piu' blocchi.
function regaliNatale(giorno) {
  const doni = [];
  switch (giorno) {
    case 3:
      doni.push('tre galline');
    case 2:
      doni.push('due tortore');
    case 1:
      doni.push('una pernice');
      break;
  }
  return doni;
}
console.log(regaliNatale(3)); // => [ 'tre galline', 'due tortore', 'una pernice' ]
console.log(regaliNatale(1)); // => [ 'una pernice' ]

// ------------------------------------------------------------
// 4) default non deve per forza stare in fondo
// ------------------------------------------------------------

// default puo' stare ovunque; viene valutato solo se nessun case
// combacia. Qui serve break anche dopo default per chiarezza.
function categoria(c) {
  let res;
  switch (c) {
    default:
      res = 'generico';
      break;
    case 'A':
      res = 'priorita alta';
      break;
  }
  return res;
}
console.log(categoria('A')); // => priorita alta
console.log(categoria('Z')); // => generico

// ------------------------------------------------------------
// 5) Block scope nei case: usare { } per let/const
// ------------------------------------------------------------

// Senza graffe, let/const dichiarati in un case sono visibili in
// tutto lo switch e possono dare errori. Le graffe creano uno scope.
function descrivi(tipo) {
  switch (tipo) {
    case 'badge': {
      const prefix = 'UP';
      return `Codice ${prefix}-XXX`;
    }
    case 'reparto': {
      const prefix = 'RP';
      return `Sigla ${prefix}`;
    }
    default:
      return 'n/d';
  }
}
console.log(descrivi('badge')); // => Codice UP-XXX

// ------------------------------------------------------------
// 6) switch(true): pattern per range e condizioni booleane
// ------------------------------------------------------------

// switch(true) confronta true con ogni case-espressione: il primo
// case che vale true viene eseguito. Ottimo per fasce/range.
function fasciaOraria(ora) {
  switch (true) {
    case ora < 6:
      return 'notte';
    case ora < 12:
      return 'mattina';
    case ora < 18:
      return 'pomeriggio';
    default:
      return 'sera';
  }
}
console.log(fasciaOraria(3));  // => notte
console.log(fasciaOraria(9));  // => mattina
console.log(fasciaOraria(20)); // => sera

// ------------------------------------------------------------
// 7) Esempio ERP: tipo turno -> regole pausa
// ------------------------------------------------------------

// Spunto dal gestionale: il turno P4 ha pausa pranzo, P2 no.
// Usiamo fall-through per raggruppare turni con la stessa regola.
function regolaPausa(turno) {
  switch (turno) {
    case 'P4':
    case 'P4-RIDOTTO':
      return { pausa: true, minutiPausa: 30 };
    case 'P2':
    case 'NOTTE':
      return { pausa: false, minutiPausa: 0 };
    default:
      return { pausa: false, minutiPausa: 0 };
  }
}
console.log(regolaPausa('P4')); // => { pausa: true, minutiPausa: 30 }
console.log(regolaPausa('P2')); // => { pausa: false, minutiPausa: 0 }

// ------------------------------------------------------------
// 8) Esempio ERP: stato richiesta ferie -> etichetta UI
// ------------------------------------------------------------

// Mappa lo stato di una richiesta a una etichetta leggibile.
function etichettaStato(stato) {
  switch (stato) {
    case 'APPROVATA':
      return 'Approvata ✓';
    case 'RIFIUTATA':
      return 'Rifiutata ✗';
    case 'IN_ATTESA':
      return 'In attesa…';
    default:
      return `Stato sconosciuto: ${stato}`;
  }
}
console.log(etichettaStato('APPROVATA'));  // => Approvata ✓
console.log(etichettaStato('BOZZA'));      // => Stato sconosciuto: BOZZA

// ------------------------------------------------------------
// 9) Esempio ERP: fascia oraria della timbratura (switch true)
// ------------------------------------------------------------

// Dato l'orario di ingresso (naive-UTC, ore di Roma gia' calcolate
// a monte), classifichiamo la timbratura. getUTCHours sull'orario
// salvato come UTC restituisce l'ora "di Roma" per il pattern naive.
function classificaIngresso(isoNaiveUTC) {
  const ora = new Date(isoNaiveUTC).getUTCHours();
  switch (true) {
    case ora < 5:
      return 'TIMBRATURA ANOMALA';
    case ora < 9:
      return 'TURNO MATTINA';
    case ora < 14:
      return 'TURNO POMERIGGIO';
    default:
      return 'TURNO SERA/NOTTE';
  }
}
console.log(classificaIngresso('2026-06-30T07:30:00.000Z')); // => TURNO MATTINA
console.log(classificaIngresso('2026-06-30T15:00:00.000Z')); // => TURNO SERA/NOTTE

// ------------------------------------------------------------
// 10) Switch su risultato di una espressione
// ------------------------------------------------------------

// L'espressione dello switch puo' essere qualsiasi cosa, anche il
// risultato di una funzione o un calcolo.
function tagliaVestiario(quantita) {
  switch (Math.sign(quantita)) {
    case 1:
      return 'disponibile';
    case 0:
      return 'esaurito';
    case -1:
      return 'errore: quantita negativa';
    default:
      return 'n/d';
  }
}
console.log(tagliaVestiario(5));  // => disponibile
console.log(tagliaVestiario(0));  // => esaurito
console.log(tagliaVestiario(-3)); // => errore: quantita negativa

// ------------------------------------------------------------
// 11) switch(true) con piu' condizioni combinate
// ------------------------------------------------------------

// Verifica scorta minima DPI combinando piu' confronti.
function statoScorta(quantita, scortaMinima) {
  switch (true) {
    case quantita <= 0:
      return 'ESAURITO';
    case quantita < scortaMinima:
      return 'SOTTO SCORTA';
    case quantita < scortaMinima * 2:
      return 'OK';
    default:
      return 'ABBONDANTE';
  }
}
console.log(statoScorta(0, 10));  // => ESAURITO
console.log(statoScorta(5, 10));  // => SOTTO SCORTA
console.log(statoScorta(15, 10)); // => OK
console.log(statoScorta(50, 10)); // => ABBONDANTE

// ------------------------------------------------------------
// 12) Alternativa a switch: object lookup (per memoria)
// ------------------------------------------------------------

// Quando ogni case mappa solo un valore, spesso un oggetto e' piu'
// pulito di uno switch. Lo switch resta migliore per range/logica.
function sigleReparto(codice) {
  const mappa = { 1: 'UF', 2: 'PR', 3: 'MG' }; // ufficio, produzione, magazzino
  return mappa[codice] ?? 'XX'; // nullish coalescing per il default
}
console.log(sigleReparto(2)); // => PR
console.log(sigleReparto(9)); // => XX

// ------------------------------------------------------------
// 13) Errore comune: dimenticare break (bug di fall-through)
// ------------------------------------------------------------

// Senza break il ramo successivo viene eseguito per errore.
function ruoloBuggy(r) {
  let livello;
  switch (r) {
    case 'admin':
      livello = 3; // manca il break: cade in operatore!
    case 'operatore':
      livello = 2;
      break;
    default:
      livello = 1;
  }
  return livello;
}
console.log(ruoloBuggy('admin')); // => 2  (era atteso 3: ecco il bug!)

// ------------------------------------------------------------
// 14) Esempio browser: switch su evento da <select> reparto
// ------------------------------------------------------------

// Esempio browser: gira nel browser, non in Node.
// (definito in funzione cosi' non rompe l'esecuzione in Node)
function gestisciSelectReparto() {
  const select = document.getElementById('reparto');
  select.addEventListener('change', (e) => {
    switch (e.target.value) {
      case 'produzione':
        console.log('Carico turni produzione');
        break;
      case 'ufficio':
        console.log('Carico orari ufficio');
        break;
      default:
        console.log('Reparto generico');
    }
  });
}
// gestisciSelectReparto(); // da chiamare nel browser

/* ============================================================
   RIEPILOGO COMANDI (memoria rapida)
   ------------------------------------------------------------
   switch (expr) { ... }   -> seleziona ramo per === con i case
   case valore:            -> ramo eseguito se expr === valore
   break                   -> esce dallo switch (evita fall-through)
   default:                -> ramo se nessun case combacia
   fall-through            -> case senza break "cade" nel successivo
   case A: case B: ...      -> raggruppa valori con stesso codice
   { } dentro case          -> crea block scope per let/const
   switch (true) { case cond: } -> pattern per range/booleani
   return dentro case       -> esce dalla funzione (no break serve)
   alternativa: object lookup + ?? per mappe valore->valore
   ============================================================ */
