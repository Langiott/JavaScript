/* ============================================================
   14 JS Conditions
   Le condizioni permettono di eseguire codice diverso a seconda
   che un'espressione sia true o false. In JavaScript abbiamo
   if / else if / else, l'operatore ternary (? :), le guard
   clauses (return/continue anticipati per evitare nesting) e le
   condizioni annidate. Capire bene questi costrutti e la
   truthiness dei valori e' fondamentale per scrivere logica
   chiara, leggibile e priva di bug nel flusso di controllo.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) if semplice
   Esegue il blocco solo se la condizione e' truthy.
------------------------------------------------------------ */
const oreLavorate = 9;
if (oreLavorate > 8) {
  console.log('Straordinario'); // => Straordinario
}

/* ------------------------------------------------------------
   2) if / else
   Due rami mutuamente esclusivi.
------------------------------------------------------------ */
const eta = 17;
if (eta >= 18) {
  console.log('Maggiorenne');
} else {
  console.log('Minorenne'); // => Minorenne
}

/* ------------------------------------------------------------
   3) if / else if / else
   Catena di condizioni: si valutano in ordine, la prima true vince.
------------------------------------------------------------ */
const voto = 75;
if (voto >= 90) {
  console.log('Ottimo');
} else if (voto >= 60) {
  console.log('Sufficiente'); // => Sufficiente
} else {
  console.log('Insufficiente');
}

/* ------------------------------------------------------------
   4) Condizione senza graffe (sconsigliata ma valida)
   Una sola istruzione puo' stare sulla stessa riga.
------------------------------------------------------------ */
const attivo = true;
if (attivo) console.log('Utente attivo'); // => Utente attivo

/* ------------------------------------------------------------
   5) Operatori di confronto
   === confronto stretto (tipo + valore), == confronto debole (coercion).
------------------------------------------------------------ */
console.log(5 === 5);   // => true
console.log(5 === '5'); // => false (tipi diversi)
console.log(5 == '5');  // => true  (coercion, da evitare)
console.log(5 !== '5'); // => true

/* ------------------------------------------------------------
   6) Operatori logici: && (and), || (or), ! (not)
------------------------------------------------------------ */
const haBadge = true;
const haTurno = false;
console.log(haBadge && haTurno); // => false
console.log(haBadge || haTurno); // => true
console.log(!haTurno);           // => true

/* ------------------------------------------------------------
   7) Truthy e Falsy
   Falsy: false, 0, '', null, undefined, NaN. Tutto il resto e' truthy.
------------------------------------------------------------ */
if ('') console.log('non stampa');
if ('ciao') console.log('stringa non vuota e truthy'); // => stringa non vuota e truthy
if (0) console.log('non stampa');
if ([]) console.log('array vuoto e truthy'); // => array vuoto e truthy

/* ------------------------------------------------------------
   8) Operatore ternary ( condizione ? seVero : seFalso )
   Forma compatta di if/else che RITORNA un valore.
------------------------------------------------------------ */
const numero = 7;
const parita = numero % 2 === 0 ? 'pari' : 'dispari';
console.log(parita); // => dispari

/* ------------------------------------------------------------
   9) Ternary annidato (usare con parsimonia per leggibilita')
------------------------------------------------------------ */
const punteggio = 82;
const fascia =
  punteggio >= 90 ? 'A' :
  punteggio >= 80 ? 'B' :
  punteggio >= 70 ? 'C' : 'D';
console.log(fascia); // => B

/* ------------------------------------------------------------
   10) Ternary per assegnazioni condizionali e in template literals
------------------------------------------------------------ */
const numeroPezzi = 1;
console.log(`${numeroPezzi} element${numeroPezzi === 1 ? 'o' : 'i'}`); // => 1 elemento

/* ------------------------------------------------------------
   11) Short-circuit con || per valori di default (attenzione ai falsy)
------------------------------------------------------------ */
function saluta(nome) {
  const n = nome || 'Ospite';
  return `Ciao ${n}`;
}
console.log(saluta('Anna'));  // => Ciao Anna
console.log(saluta(''));      // => Ciao Ospite (string vuota e' falsy)

/* ------------------------------------------------------------
   12) Nullish coalescing ?? (default solo per null/undefined)
   Differenza chiave rispetto a || : 0 e '' restano validi.
------------------------------------------------------------ */
const quantita = 0;
console.log(quantita || 5); // => 5  (0 e' falsy)
console.log(quantita ?? 5); // => 0  (0 non e' null/undefined)

/* ------------------------------------------------------------
   13) Optional chaining ?. combinato con ?? (pattern ERP reparti)
------------------------------------------------------------ */
const dipendente = { nome: 'Luca', reparto: { sigla: 'UP' } };
const dipendente2 = { nome: 'Mara' }; // senza reparto
console.log(dipendente?.reparto?.sigla ?? 'XX');  // => UP
console.log(dipendente2?.reparto?.sigla ?? 'XX'); // => XX

/* ------------------------------------------------------------
   14) Guard clause (early return)
   Si esce subito dai casi invalidi, evitando if annidati profondi.
------------------------------------------------------------ */
function calcolaOreLavorate(timbratura) {
  if (!timbratura) return 0;              // guard: oggetto mancante
  if (!timbratura.ingresso) return 0;     // guard: nessun ingresso
  if (!timbratura.uscita) return 0;       // guard: turno non chiuso
  return timbratura.uscita - timbratura.ingresso;
}
console.log(calcolaOreLavorate(null));                  // => 0
console.log(calcolaOreLavorate({ ingresso: 8 }));       // => 0
console.log(calcolaOreLavorate({ ingresso: 8, uscita: 17 })); // => 9

/* ------------------------------------------------------------
   15) Confronto: codice annidato (NESTED) vs guard clause
   Lo stesso risultato, ma le guard clauses sono piu' piatte e leggibili.
------------------------------------------------------------ */
// Versione annidata (piu' difficile da leggere)
function badgeValidoNested(badge) {
  if (badge) {
    if (typeof badge === 'string') {
      if (badge.startsWith('UP-')) {
        return true;
      }
    }
  }
  return false;
}
// Versione con guard clauses (preferibile)
function badgeValido(badge) {
  if (!badge) return false;
  if (typeof badge !== 'string') return false;
  if (!badge.startsWith('UP-')) return false;
  return true;
}
console.log(badgeValidoNested('UP-001')); // => true
console.log(badgeValido('UP-001'));       // => true
console.log(badgeValido('XY-9'));         // => false

/* ------------------------------------------------------------
   16) Condizioni annidate legittime (quando servono davvero)
------------------------------------------------------------ */
function statoTurno(t) {
  if (t.aperto) {
    if (t.inPausa) {
      return 'in pausa';
    } else {
      return 'al lavoro';
    }
  }
  return 'chiuso';
}
console.log(statoTurno({ aperto: true, inPausa: true }));  // => in pausa
console.log(statoTurno({ aperto: true, inPausa: false })); // => al lavoro
console.log(statoTurno({ aperto: false }));                // => chiuso

/* ------------------------------------------------------------
   17) Combinare piu' condizioni con && e ||
------------------------------------------------------------ */
function puoTimbrare(d) {
  return d.attivo && (d.ruolo === 'operaio' || d.ruolo === 'impiegato');
}
console.log(puoTimbrare({ attivo: true, ruolo: 'operaio' }));  // => true
console.log(puoTimbrare({ attivo: false, ruolo: 'operaio' })); // => false

/* ------------------------------------------------------------
   18) Esempio ERP: classificare un turno per ore lavorate
   P4 = turno lungo con pausa, P2 = turno corto senza pausa.
------------------------------------------------------------ */
function classificaTurno(ore) {
  if (ore <= 0) return 'assente';
  if (ore < 4) return 'P2';           // turno corto, senza pausa
  if (ore <= 8) return 'P4';          // turno standard, con pausa
  return 'P4 + straordinario';
}
console.log(classificaTurno(0));   // => assente
console.log(classificaTurno(3));   // => P2
console.log(classificaTurno(8));   // => P4
console.log(classificaTurno(10));  // => P4 + straordinario

/* ------------------------------------------------------------
   19) Esempio ERP: validazione formato orario con regex e guard
------------------------------------------------------------ */
function validaOrario(orario) {
  if (typeof orario !== 'string') return false;
  if (!/^\d{2}:\d{2}$/.test(orario)) return false; // formato HH:MM
  const [h, m] = orario.split(':').map(Number);
  if (h > 23 || m > 59) return false;              // range valido
  return true;
}
console.log(validaOrario('08:30')); // => true
console.log(validaOrario('25:00')); // => false
console.log(validaOrario('8:3'));   // => false

/* ------------------------------------------------------------
   20) Esempio ERP: controllo scorta minima del vestiario/DPI
------------------------------------------------------------ */
function statoScorta(quantita, scortaMinima) {
  if (quantita <= 0) return 'esaurito';
  if (quantita < scortaMinima) return 'sotto scorta';
  return 'ok';
}
console.log(statoScorta(0, 5));  // => esaurito
console.log(statoScorta(3, 5));  // => sotto scorta
console.log(statoScorta(10, 5)); // => ok

/* ------------------------------------------------------------
   21) Ternary per badge ERP: assegnato vs libero
------------------------------------------------------------ */
const assegnazione = { badge: 'UP-001', nome: null };
const etichetta = assegnazione.nome
  ? `Assegnato a ${assegnazione.nome}`
  : `Badge ${assegnazione.badge} libero`;
console.log(etichetta); // => Badge UP-001 libero

/* ------------------------------------------------------------
   22) Confronto fra date naive-UTC (pattern timbrature)
   Si confrontano timestamp numerici per capire ingresso/uscita.
------------------------------------------------------------ */
function turnoChiusoBene(ingressoMs, uscitaMs) {
  if (ingressoMs == null || uscitaMs == null) return false; // guard
  return uscitaMs > ingressoMs;
}
console.log(turnoChiusoBene(100, 200)); // => true
console.log(turnoChiusoBene(200, 100)); // => false
console.log(turnoChiusoBene(null, 100)); // => false

/* ------------------------------------------------------------
   23) Operatore in per verificare proprieta' prima di accedervi
------------------------------------------------------------ */
const richiesta = { tipo: 'ferie', approvata: true };
if ('approvata' in richiesta && richiesta.approvata) {
  console.log('Richiesta approvata'); // => Richiesta approvata
}

/* ------------------------------------------------------------
   24) Assegnazione condizionale con &&= ||= ??= (logical assignment)
------------------------------------------------------------ */
let config = { regola: null };
config.regola ??= 'arrotonda5min'; // assegna solo se null/undefined
console.log(config.regola); // => arrotonda5min

let flags = { debug: true };
flags.debug &&= false; // assegna solo se attualmente truthy
console.log(flags.debug); // => false

/* ------------------------------------------------------------
   25) Pattern: normalizzare un input e poi decidere
------------------------------------------------------------ */
function normalizzaBadge(v) {
  const pulito = String(v || '').trim().toUpperCase();
  return pulito.length === 0 ? 'N/D' : pulito;
}
console.log(normalizzaBadge('  up-001 ')); // => UP-001
console.log(normalizzaBadge(null));        // => N/D

/* ------------------------------------------------------------
   26) Esempio browser: gira nel browser, non in Node
   Mostra condizioni applicate al DOM (qui dentro una funzione,
   cosi' non viene eseguito a import-time).
------------------------------------------------------------ */
function aggiornaUI(loading, error) {
  // const box = document.getElementById('stato');
  // if (loading) box.textContent = 'Caricamento...';
  // else if (error) box.textContent = 'Errore: ' + error;
  // else box.textContent = 'Pronto';
  return loading ? 'Caricamento...' : error ? `Errore: ${error}` : 'Pronto';
}
console.log(aggiornaUI(true, null));   // => Caricamento...
console.log(aggiornaUI(false, 'x'));   // => Errore: x
console.log(aggiornaUI(false, null));  // => Pronto

/* ============================================================
   RIEPILOGO COMANDI
   - if (cond) { ... }
   - if / else
   - if / else if / else
   - operatori confronto: === !== == != > >= < <=
   - operatori logici: && || !
   - truthy / falsy (false,0,'',null,undefined,NaN)
   - ternary: cond ? a : b
   - ternary annidato
   - short-circuit: ||  (default falsy)
   - nullish coalescing: ??  (default solo null/undefined)
   - optional chaining: ?.
   - logical assignment: &&=  ||=  ??=
   - operatore in (proprieta' presente)
   - guard clause / early return
   - condizioni annidate
   ============================================================ */
