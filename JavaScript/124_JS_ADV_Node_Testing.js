/* ============================================================
   124 JS ADV Node Testing
   Testing NATIVO con il test runner di Node (node:test) e le
   asserzioni (node:assert). Da Node 18+ non servono librerie come
   Jest/Mocha per iniziare. Caso reale: testiamo le funzioni di
   calcolo ore del gestionale per essere sicuri che siano corrette.
   Eseguibile in DUE modi:
     node --test 124_JS_ADV_Node_Testing.js   (modo consigliato)
     node 124_JS_ADV_Node_Testing.js          (funziona comunque)
   ============================================================ */

'use strict';

const { test, describe, it, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict'); // 'strict' = usa === nei confronti

/* ------------------------------------------------------------
   1. IL CODICE DA TESTARE (in reale starebbe in un altro file)
   ------------------------------------------------------------ */

// Converte 'HH:MM' in minuti. Valida l'input: un test verifichera' l'errore.
function oraInMinuti(hhmm) {
  if (typeof hhmm !== 'string' || !/^\d{2}:\d{2}$/.test(hhmm)) {
    throw new TypeError(`Formato ora non valido: ${hhmm}`);
  }
  const [h, m] = hhmm.split(':').map(Number);
  if (h > 23 || m > 59) throw new RangeError(`Ora fuori range: ${hhmm}`);
  return h * 60 + m;
}

function minutiLavorati(t) {
  const lordo = oraInMinuti(t.uscita) - oraInMinuti(t.ingresso);
  const pausa = (t.uscitaPranzo && t.rientroPranzo)
    ? oraInMinuti(t.rientroPranzo) - oraInMinuti(t.uscitaPranzo)
    : 0;
  return lordo - pausa;
}

/* ------------------------------------------------------------
   2. TEST BASE con assert.equal
   ------------------------------------------------------------
   Struttura tipica: test('descrizione', () => { ...asserzioni... }).
   Se un'asserzione fallisce, il test fallisce con un messaggio chiaro. */

test('oraInMinuti converte correttamente', () => {
  assert.equal(oraInMinuti('00:00'), 0);
  assert.equal(oraInMinuti('08:30'), 510);
  assert.equal(oraInMinuti('23:59'), 1439);
});

/* ------------------------------------------------------------
   3. RAGGRUPPARE i test con describe/it (leggibilita')
   ------------------------------------------------------------ */

describe('minutiLavorati', () => {
  it('sottrae la pausa pranzo quando presente', () => {
    const t = { ingresso: '08:00', uscita: '17:30', uscitaPranzo: '12:30', rientroPranzo: '13:15' };
    assert.equal(minutiLavorati(t), 525); // 9h30 - 45min = 8h45 = 525
  });

  it('non sottrae nulla se la pausa manca', () => {
    const t = { ingresso: '08:00', uscita: '16:00', uscitaPranzo: null, rientroPranzo: null };
    assert.equal(minutiLavorati(t), 480); // 8h piene
  });
});

/* ------------------------------------------------------------
   4. TESTARE GLI ERRORI: assert.throws
   ------------------------------------------------------------
   Un buon test verifica anche che il codice FALLISCA quando deve. */

describe('oraInMinuti validazione', () => {
  it('lancia TypeError su formato sbagliato', () => {
    assert.throws(() => oraInMinuti('8:5'), TypeError);
    assert.throws(() => oraInMinuti('abc'), TypeError);
    assert.throws(() => oraInMinuti(830), TypeError); // non e' stringa
  });

  it('lancia RangeError su ore impossibili', () => {
    assert.throws(() => oraInMinuti('25:00'), RangeError);
    assert.throws(() => oraInMinuti('10:99'), RangeError);
  });

  it('il messaggio di errore contiene il valore sbagliato', () => {
    assert.throws(() => oraInMinuti('99:99'), { message: /99:99/ }); // regex sul messaggio
  });
});

/* ------------------------------------------------------------
   5. CONFRONTARE OGGETTI/ARRAY: deepEqual
   ------------------------------------------------------------
   Ricorda il file sul '===': gli oggetti NON sono uguali per valore.
   Nei test usa deepEqual, che confronta il CONTENUTO ricorsivamente. */

test('deepEqual confronta il contenuto, non l identita', () => {
  const atteso = { badge: 'UP-001', reparti: ['PR', 'AM'] };
  const ottenuto = { badge: 'UP-001', reparti: ['PR', 'AM'] };
  // assert.equal(ottenuto, atteso) FALLIREBBE (oggetti diversi in memoria).
  assert.deepEqual(ottenuto, atteso); // OK: stesso contenuto
});

/* ------------------------------------------------------------
   6. MOCK: sostituire una dipendenza durante il test
   ------------------------------------------------------------
   A volte una funzione dipende da qualcosa di lento/esterno (DB, rete).
   Il mock la sostituisce con una finta e verifica come viene usata. */

describe('mock di una dipendenza', () => {
  it('conta le chiamate e controlla gli argomenti', () => {
    // Finta funzione "salvaSulDB" che non tocca nessun database.
    const salvaSulDB = mock.fn((record) => ({ ok: true, id: record.badge }));

    // Codice che la usa:
    function registra(dip) {
      return salvaSulDB({ badge: dip.badge });
    }

    const esito = registra({ badge: 'UP-007' });

    assert.deepEqual(esito, { ok: true, id: 'UP-007' });
    assert.equal(salvaSulDB.mock.calls.length, 1);                 // chiamata 1 volta
    assert.deepEqual(salvaSulDB.mock.calls[0].arguments[0], { badge: 'UP-007' }); // con questi args
  });
});

/* ------------------------------------------------------------
   7. beforeEach: preparare uno stato pulito prima di ogni test
   ------------------------------------------------------------ */

describe('con stato condiviso', () => {
  let registro;
  beforeEach(() => { registro = []; }); // reset prima di OGNI it()

  it('parte vuoto', () => {
    assert.equal(registro.length, 0);
  });

  it('aggiunge una voce', () => {
    registro.push('UP-001');
    assert.equal(registro.length, 1); // non "inquinato" dal test precedente
  });
});

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - node:test + node:assert = testing NATIVO, zero dipendenze.
   - Lancia con: node --test file.js  (raccoglie e riporta i risultati).
   - assert.equal usa === ; per oggetti/array usa assert.deepEqual.
   - assert.throws verifica che il codice fallisca QUANDO DEVE.
   - describe/it organizzano; beforeEach da uno stato pulito.
   - mock.fn() sostituisce dipendenze lente e traccia chiamate/argomenti.
   - Testare = documentare il comportamento atteso e prevenire regressioni.
   ============================================================ */
