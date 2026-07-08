/* ============================================================
   34 JS IIFE
   IIFE (Immediately Invoked Function Expression) e' una function
   definita ed eseguita immediatamente. Serve a creare uno scope
   privato e isolato, evitando di inquinare lo scope globale.
   E' la base del classico "module pattern": una closure che
   espone solo cio' che vuoi (API pubblica) e tiene nascosto il
   resto (stato privato). Storicamente fondamentale prima dei
   moduli ES (import/export). Vediamo dalla sintassi base fino al
   module pattern avanzato, con esempi ispirati a un gestionale ERP.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) SINTASSI BASE: cosa e' una IIFE
   ------------------------------------------------------------ */

// Una function expression normale: definita ma non eseguita.
const saluta = function () { return 'ciao'; };

// IIFE: la wrappiamo tra parentesi e la invochiamo subito con ().
(function () {
  console.log('Sono una IIFE, eseguita subito'); // => Sono una IIFE, eseguita subito
})();

// Variante con le parentesi esterne che includono anche la chiamata.
(function () {
  console.log('Variante con () esterne'); // => Variante con () esterne
}());

// IIFE che ritorna un valore assegnato a una variabile.
const risultato = (function () {
  return 40 + 2;
})();
console.log(risultato); // => 42

/* ------------------------------------------------------------
   2) PERCHE' LE PARENTESI: function statement vs expression
   ------------------------------------------------------------ */

// Senza wrapping, "function" a inizio riga e' una dichiarazione e
// NON puo' essere invocata subito (errore di sintassi).
// function () {}();  // SyntaxError
// Le parentesi forzano il parser a leggerla come expression.

// Altri "operatori" che forzano l'interpretazione come expression:
!function () { console.log('IIFE con !'); }();   // => IIFE con !
+function () { console.log('IIFE con +'); }();   // => IIFE con +
void function () { console.log('IIFE con void'); }(); // => IIFE con void

/* ------------------------------------------------------------
   3) ISOLAMENTO DELLO SCOPE
   ------------------------------------------------------------ */

// Le variabili dentro la IIFE non escono: niente pollution globale.
(function () {
  const segreto = 'non visibile fuori';
  console.log(segreto); // => non visibile fuori
})();
// console.log(segreto); // ReferenceError: segreto is not defined

// Caso classico: isolare un calcolo evitando nomi che collidono.
const oreTotali = (function () {
  const minuti = [480, 510, 420]; // minuti lavorati in 3 giorni
  const somma = minuti.reduce((s, m) => s + m, 0);
  return (somma / 60).toFixed(1);
})();
console.log(oreTotali); // => 23.5

/* ------------------------------------------------------------
   4) IIFE CON PARAMETRI
   ------------------------------------------------------------ */

// Si possono passare argomenti tra le parentesi finali.
(function (nome, cognome) {
  console.log(`Dipendente: ${nome} ${cognome}`); // => Dipendente: Mario Rossi
})('Mario', 'Rossi');

// Pattern storico: passare oggetti globali con alias locale sicuro.
(function (global) {
  global.APP_VERSION = '1.0.0';
})(globalThis);
console.log(globalThis.APP_VERSION); // => 1.0.0

// Passare un default tramite parametro (utile per fallback).
const sigla = (function (reparto) {
  return reparto?.sigla ?? 'XX';
})({ nome: 'Produzione' });
console.log(sigla); // => XX

/* ------------------------------------------------------------
   5) IIFE E CLOSURE: stato privato persistente
   ------------------------------------------------------------ */

// La IIFE crea una closure: la variabile "count" sopravvive,
// ma e' raggiungibile SOLO tramite la function ritornata.
const contatore = (function () {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
})();
console.log(contatore()); // => 1
console.log(contatore()); // => 2
console.log(contatore()); // => 3

// Generatore di codici badge progressivi (stato nascosto).
const prossimoBadge = (function (prefisso) {
  let n = 0;
  return function () {
    n += 1;
    return `${prefisso}-${String(n).padStart(3, '0')}`;
  };
})('UP');
console.log(prossimoBadge()); // => UP-001
console.log(prossimoBadge()); // => UP-002

/* ------------------------------------------------------------
   6) MODULE PATTERN CLASSICO
   ------------------------------------------------------------ */

// Una IIFE ritorna un oggetto con i soli metodi pubblici.
// Lo stato (lista) resta privato: non e' modificabile dall'esterno.
const RegistroDipendenti = (function () {
  // stato privato
  const dipendenti = [];

  // funzione privata (helper)
  function valida(d) {
    return Boolean(d && d.nome && d.codiceBadge);
  }

  // API pubblica
  return {
    aggiungi(d) {
      if (!valida(d)) throw new Error('Dipendente non valido');
      dipendenti.push(d);
      return dipendenti.length;
    },
    conteggio() {
      return dipendenti.length;
    },
    elenco() {
      // ritorna una copia: protegge lo stato interno
      return dipendenti.map((d) => ({ ...d }));
    },
  };
})();

RegistroDipendenti.aggiungi({ nome: 'Anna', codiceBadge: 'UP-010' });
RegistroDipendenti.aggiungi({ nome: 'Luca', codiceBadge: 'UP-011' });
console.log(RegistroDipendenti.conteggio()); // => 2
console.log(RegistroDipendenti.elenco().length); // => 2
// RegistroDipendenti.dipendenti // => undefined (privato)

/* ------------------------------------------------------------
   7) REVEALING MODULE PATTERN
   ------------------------------------------------------------ */

// Variante: definisci tutto come funzioni locali e nel return
// "riveli" solo i riferimenti pubblici. Piu' leggibile.
const Timbrature = (function () {
  const registrate = [];

  function nowRomeNaiveUTC() {
    // pattern ERP: ora di Roma salvata come stringa HH:MM
    const parts = new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return `${get('hour')}:${get('minute')}`;
  }

  function timbra(badge, tipo) {
    const record = { badge, tipo, orario: nowRomeNaiveUTC() };
    registrate.push(record);
    return record;
  }

  function quante() {
    return registrate.length;
  }

  // riveliamo solo cio' che serve fuori
  return { timbra, quante };
})();

const t = Timbrature.timbra('UP-001', 'ingresso');
console.log(/^\d{2}:\d{2}$/.test(t.orario)); // => true
console.log(Timbrature.quante()); // => 1

/* ------------------------------------------------------------
   8) NAMESPACE PATTERN con IIFE
   ------------------------------------------------------------ */

// Raggruppare funzionalita' sotto un unico oggetto globale,
// estendendolo con piu' IIFE (pattern pre-moduli ES).
const ERP = {};

(function (ns) {
  ns.reparti = {
    sigle: ['PR', 'MG', 'UF'],
    isValida(s) {
      return ns.reparti.sigle.includes(s);
    },
  };
})(ERP);

(function (ns) {
  ns.utils = {
    normalizzaBadge(v) {
      return String(v || '').trim().toUpperCase().replace(/\s+/g, '');
    },
  };
})(ERP);

console.log(ERP.reparti.isValida('PR'));       // => true
console.log(ERP.utils.normalizzaBadge(' up-01 ')); // => UP-01

/* ------------------------------------------------------------
   9) IIFE PER COSTANTI CONFIGURATE UNA SOLA VOLTA
   ------------------------------------------------------------ */

// Calcolo "una tantum" di una config derivata, congelata.
const CONFIG = (function () {
  const DEFAULT = { regolaArrotondamento: 5, turno: 'P4' };
  const override = { turno: 'P2' };
  return Object.freeze({ ...DEFAULT, ...override });
})();
console.log(CONFIG.turno);               // => P2
console.log(CONFIG.regolaArrotondamento); // => 5

/* ------------------------------------------------------------
   10) IIFE ASINCRONA (async IIFE)
   ------------------------------------------------------------ */

// Permette di usare await al top-level dove non e' disponibile.
(async function () {
  const dato = await Promise.resolve('caricato');
  console.log(dato); // => caricato
})();

// Async IIFE con gestione errori e "rollback" simulato (pattern ERP).
(async function () {
  const creato = { id: 99, nome: 'Temp' };
  try {
    await Promise.reject(new Error('insert turno fallita'));
  } catch (e) {
    // rollback: annulla la creazione precedente
    console.log(`Rollback dipendente ${creato.id}: ${e.message}`);
    // => Rollback dipendente 99: insert turno fallita
  }
})();

/* ------------------------------------------------------------
   11) IIFE PER EVITARE IL PROBLEMA DELLA CLOSURE NEL LOOP
   ------------------------------------------------------------ */

// Con var, tutte le callback condividono la stessa i.
// La IIFE "cattura" il valore corrente di i in ogni iterazione.
const callbacks = [];
for (var i = 0; i < 3; i++) {
  (function (idx) {
    callbacks.push(() => idx);
  })(i);
}
console.log(callbacks.map((cb) => cb())); // => [ 0, 1, 2 ]
// Nota: con let questo problema non esiste (block scope), ma e'
// utile conoscere il pattern storico con la IIFE.

/* ------------------------------------------------------------
   12) MODULE PATTERN CON DIPENDENZE INIETTATE
   ------------------------------------------------------------ */

// Pattern "import" stile vecchio: passi le dipendenze alla IIFE.
const Calcolo = (function (cfg) {
  function arrotonda(minuti) {
    const r = cfg.regolaArrotondamento;
    return Math.round(minuti / r) * r;
  }
  return { arrotonda };
})(CONFIG);

console.log(Calcolo.arrotonda(487)); // => 485

/* ------------------------------------------------------------
   13) IIFE vs MODULI ES (contesto storico)
   ------------------------------------------------------------ */

// Oggi i moduli ES (export/import) danno scope isolato nativamente,
// quindi le IIFE di isolamento sono meno necessarie. Restano utili
// per: async top-level rapido, init una-tantum, librerie UMD/bundle.
// Esempio moderno equivalente al module pattern (commentato):
// export function aggiungi() {}  // file modulo -> scope gia' isolato

/* ============================================================
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - (function(){...})()        IIFE base (wrap + invocazione)
   - (function(){...}())         variante parentesi esterne
   - !function(){}()             IIFE con operatore unario (! + void)
   - (function(arg){...})(val)   IIFE con parametri
   - return da IIFE              esporre valore / oggetto / function
   - closure                     stato privato persistente
   - module pattern              IIFE -> oggetto con API pubblica
   - revealing module pattern    return { fn1, fn2 } rivelando i ref
   - namespace pattern           estendere un oggetto con piu' IIFE
   - Object.freeze({...})        config immutabile una-tantum
   - (async function(){})()      async IIFE con await/try-catch
   - IIFE nel loop (var)         catturare il valore per iterazione
   - dependency injection        passare config/deps alla IIFE
   - Intl.DateTimeFormat         ora di Roma (pattern naive-UTC ERP)
   - padStart / replace / trim   normalizzazione stringhe (badge)
   ============================================================ */
