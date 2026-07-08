/* ============================================================
   99 JS ADV Descriptors
   I property descriptor descrivono COME una proprietA' di un object si
   comporta: se e' scrivibile (writable), se compare nei cicli (enumerable),
   se puo' essere ridefinita o cancellata (configurable), e se ha un value
   diretto oppure un accessor (get/set). Con Object.defineProperty possiamo
   creare proprietA' "blindate", campi calcolati, costanti interne e API
   robuste. getOwnPropertyDescriptor(s) ci permette di ispezionarle.
   Strumenti chiave in un ERP per proteggere dati come il codiceBadge.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1) DESCRIPTOR DI BASE: cosa c'e' dietro una proprietA' normale
   ------------------------------------------------------------ */

// Una proprietA' creata con l'assegnazione classica ha tutti i flag a true.
const dip = { nome: 'Marco' };
console.log(Object.getOwnPropertyDescriptor(dip, 'nome'));
// => { value: 'Marco', writable: true, enumerable: true, configurable: true }

/* ------------------------------------------------------------
   2) Object.defineProperty: i flag DI DEFAULT sono false
   ------------------------------------------------------------ */

// Attenzione: con defineProperty i flag NON specificati valgono false.
const badge = {};
Object.defineProperty(badge, 'codice', { value: 'UP-001' });
console.log(badge.codice); // => 'UP-001'
console.log(Object.getOwnPropertyDescriptor(badge, 'codice'));
// => { value: 'UP-001', writable: false, enumerable: false, configurable: false }

/* ------------------------------------------------------------
   3) writable: false -> proprietA' in sola lettura
   ------------------------------------------------------------ */

const config = {};
Object.defineProperty(config, 'versione', { value: '1.0.0', writable: false });
config.versione = '2.0.0'; // ignorato silenziosamente (in strict mode lancia TypeError)
console.log(config.versione); // => '1.0.0'

// In strict mode l'assegnazione su writable:false lancia errore.
function provaScrittura() {
  'use strict';
  try {
    config.versione = '9.9.9';
  } catch (e) {
    return e.constructor.name; // 'TypeError'
  }
}
console.log(provaScrittura()); // => 'TypeError'

/* ------------------------------------------------------------
   4) enumerable: false -> proprietA' "nascosta" dai cicli
   ------------------------------------------------------------ */

const dipendente = { nome: 'Anna', cognome: 'Rossi' };
Object.defineProperty(dipendente, '_idInterno', {
  value: 42,
  enumerable: false,
  writable: true,
  configurable: true,
});

console.log(Object.keys(dipendente));        // => [ 'nome', 'cognome' ]
console.log(JSON.stringify(dipendente));     // => {"nome":"Anna","cognome":"Rossi"}
for (const k in dipendente) process.stdout.write(k + ' '); // nome cognome
console.log();
// Ma la proprietA' esiste ed e' accessibile direttamente:
console.log(dipendente._idInterno); // => 42
// E si vede comunque con getOwnPropertyNames:
console.log(Object.getOwnPropertyNames(dipendente)); // => [ 'nome', 'cognome', '_idInterno' ]

/* ------------------------------------------------------------
   5) configurable: false -> non si puo' ridefinire ne' cancellare
   ------------------------------------------------------------ */

const sistema = {};
Object.defineProperty(sistema, 'azienda', {
  value: 'Polyuretech',
  configurable: false,
  enumerable: true,
});
console.log(delete sistema.azienda); // => false (in strict mode lancia TypeError)
console.log(sistema.azienda);        // => 'Polyuretech'

// Ridefinire una proprietA' configurable:false lancia errore:
try {
  Object.defineProperty(sistema, 'azienda', { value: 'Altra' });
} catch (e) {
  console.log(e.constructor.name); // => 'TypeError'
}

// Eccezione: se configurable e' false ma writable e' true, si puo' cambiare il value.
const semiBloccato = {};
Object.defineProperty(semiBloccato, 'contatore', {
  value: 0, writable: true, configurable: false,
});
semiBloccato.contatore = 5;
console.log(semiBloccato.contatore); // => 5

/* ------------------------------------------------------------
   6) ACCESSOR DESCRIPTOR: get / set (proprietA' calcolate)
   ------------------------------------------------------------ */

// Un descriptor puo' essere "data" (value/writable) OPPURE "accessor" (get/set).
// I due tipi si escludono a vicenda.
const persona = { nome: 'Luca', cognome: 'Bianchi' };
Object.defineProperty(persona, 'nomeCompleto', {
  get() {
    return `${this.nome} ${this.cognome}`;
  },
  set(valore) {
    [this.nome, this.cognome] = valore.split(' ');
  },
  enumerable: true,
  configurable: true,
});
console.log(persona.nomeCompleto); // => 'Luca Bianchi'
persona.nomeCompleto = 'Sara Verdi';
console.log(persona.nome);         // => 'Sara'
console.log(persona.cognome);      // => 'Verdi'

/* ------------------------------------------------------------
   7) Getter di sola lettura: campo derivato (oreLavorate)
   ------------------------------------------------------------ */

// Timbratura: l'orario e' salvato in minuti naive-UTC; oreLavorate e' DERIVATO.
function creaTimbratura(ingressoMin, uscitaMin) {
  const t = { ingressoMin, uscitaMin };
  Object.defineProperty(t, 'oreLavorate', {
    get() {
      return ((this.uscitaMin - this.ingressoMin) / 60).toFixed(2);
    },
    enumerable: true,
  });
  return t;
}
const turno = creaTimbratura(8 * 60, 17 * 60); // 08:00 -> 17:00
console.log(turno.oreLavorate); // => '9.00'
turno.uscitaMin = 18 * 60;      // aggiorno solo l'uscita
console.log(turno.oreLavorate); // => '10.00' (ricalcolato al volo)

/* ------------------------------------------------------------
   8) Object.defineProperties: piu' proprietA' in un colpo solo
   ------------------------------------------------------------ */

const articolo = {};
Object.defineProperties(articolo, {
  cdAr: { value: 'VST-TS-L', enumerable: true, writable: false },
  descrizione: { value: 'T-shirt taglia L', enumerable: true, writable: true },
  quantita: { value: 50, enumerable: true, writable: true },
  sottoScorta: {
    get() { return this.quantita < this.scortaMinima; },
    enumerable: true,
  },
  scortaMinima: { value: 20, enumerable: false, writable: true },
});
console.log(articolo.sottoScorta); // => false
articolo.quantita = 10;
console.log(articolo.sottoScorta); // => true

/* ------------------------------------------------------------
   9) getOwnPropertyDescriptors: snapshot completo (clonazione fedele)
   ------------------------------------------------------------ */

// Object.assign NON copia getter/setter (li valuta). getOwnPropertyDescriptors si'.
const sorgente = {
  base: 100,
  get conIva() { return this.base * 1.22; },
};
const cloneSbagliato = Object.assign({}, sorgente);
console.log(Object.getOwnPropertyDescriptor(cloneSbagliato, 'conIva').get); // => undefined (getter perso)

const cloneCorretto = Object.create(
  Object.getPrototypeOf(sorgente),
  Object.getOwnPropertyDescriptors(sorgente)
);
console.log(typeof Object.getOwnPropertyDescriptor(cloneCorretto, 'conIva').get); // => 'function'
console.log(cloneCorretto.conIva); // => 122 (getter preservato)

/* ------------------------------------------------------------
   10) Pattern reale ERP: codiceBadge immutabile e normalizzato
   ------------------------------------------------------------ */

// Creiamo un dipendente il cui badge e' bloccato (writable:false) e
// normalizzato a creazione. L'id interno e' non-enumerable (non finisce nei DTO).
function nuovoDipendente(nome, cognome, badgeRaw, id) {
  const d = { nome, cognome };
  const badgeNorm = String(badgeRaw || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
  Object.defineProperty(d, 'codiceBadge', {
    value: badgeNorm,
    writable: false,    // un badge non si modifica dopo l'assegnazione
    enumerable: true,
    configurable: false,
  });
  Object.defineProperty(d, '_id', {
    value: id,
    enumerable: false,  // escluso da Object.keys / JSON / DTO esposti
    writable: false,
  });
  return d;
}
const d1 = nuovoDipendente('Anna', 'Rossi', '  up-001 ', 7);
console.log(d1.codiceBadge);          // => 'UP-001'
console.log(JSON.stringify(d1));      // => {"nome":"Anna","cognome":"Rossi","codiceBadge":"UP-001"}
d1.codiceBadge = 'XX-999';            // ignorato (non strict)
console.log(d1.codiceBadge);          // => 'UP-001'

/* ------------------------------------------------------------
   11) Lazy property: calcola una volta, poi memorizza (memoization)
   ------------------------------------------------------------ */

// Getter che si "auto-sostituisce" con un data property dopo il primo accesso.
function conReportPesante(obj) {
  Object.defineProperty(obj, 'report', {
    configurable: true,
    enumerable: true,
    get() {
      console.log('  ...calcolo report una sola volta...');
      const valore = Object.keys(obj).length * 10; // finto calcolo costoso
      // sostituisco l'accessor con un value statico:
      Object.defineProperty(obj, 'report', {
        value: valore, writable: false, enumerable: true, configurable: false,
      });
      return valore;
    },
  });
  return obj;
}
const r = conReportPesante({ a: 1, b: 2 });
console.log(r.report); // log "...calcolo..." poi => 30
console.log(r.report); // => 30 (nessun ricalcolo)

/* ------------------------------------------------------------
   12) Validazione tramite setter (guard su un campo)
   ------------------------------------------------------------ */

// Un reparto la cui sigla deve essere di 2 lettere maiuscole.
function creaReparto() {
  let _sigla = 'XX';
  const reparto = {};
  Object.defineProperty(reparto, 'sigla', {
    get() { return _sigla; },
    set(v) {
      const s = String(v).toUpperCase();
      if (!/^[A-Z]{2}$/.test(s)) throw new Error('Sigla non valida: ' + v);
      _sigla = s;
    },
    enumerable: true,
  });
  return reparto;
}
const rep = creaReparto();
rep.sigla = 'pr';
console.log(rep.sigla); // => 'PR'
try { rep.sigla = 'PROD'; } catch (e) { console.log(e.message); } // => 'Sigla non valida: PROD'

/* ------------------------------------------------------------
   13) Interazione con Object.freeze / seal (descriptor dietro le quinte)
   ------------------------------------------------------------ */

// freeze rende tutte le proprietA' non-writable e non-configurable.
const frozen = Object.freeze({ regola: 'arrotonda5min' });
console.log(Object.getOwnPropertyDescriptor(frozen, 'regola'));
// => { value: 'arrotonda5min', writable: false, enumerable: true, configurable: false }
console.log(Object.isFrozen(frozen)); // => true

// seal: configurable:false ma writable resta true (si modificano i valori, non la struttura).
const sealed = Object.seal({ totaleMinuti: 0 });
sealed.totaleMinuti = 480; // ok
console.log(sealed.totaleMinuti); // => 480
console.log(Object.getOwnPropertyDescriptor(sealed, 'totaleMinuti').configurable); // => false

/* ------------------------------------------------------------
   14) Definire proprietA' sul prototype (metodo condiviso non-enumerable)
   ------------------------------------------------------------ */

// I metodi sul prototype sono per convenzione non-enumerable: imitiamolo.
function Turno(codice, conPausa) {
  this.codice = codice;
  this.conPausa = conPausa;
}
Object.defineProperty(Turno.prototype, 'descrizione', {
  value() { return `Turno ${this.codice}${this.conPausa ? ' (con pausa)' : ''}`; },
  enumerable: false, // non comparira' nei for..in delle istanze
});
const p4 = new Turno('P4', true);
console.log(p4.descrizione());     // => 'Turno P4 (con pausa)'
console.log(Object.keys(p4));      // => [ 'codice', 'conPausa' ]

/* ------------------------------------------------------------
   15) Enumerable e spread: lo spread copia solo gli OWN enumerable
   ------------------------------------------------------------ */

const conNascosto = {};
Object.defineProperty(conNascosto, 'visibile', { value: 1, enumerable: true });
Object.defineProperty(conNascosto, 'segreto', { value: 2, enumerable: false });
const copia = { ...conNascosto };
console.log(copia); // => { visibile: 1 } ('segreto' non viene copiato)

/* ------------------------------------------------------------
   16) Reflect.defineProperty: variante che ritorna boolean
   ------------------------------------------------------------ */

// A differenza di Object.defineProperty (che lancia), Reflect ritorna true/false.
const target = {};
const ok = Reflect.defineProperty(target, 'x', { value: 1, configurable: false });
console.log(ok); // => true
const ok2 = Reflect.defineProperty(target, 'x', { value: 2 }); // non puo' ridefinire
console.log(ok2); // => false (nessuna eccezione)
console.log(target.x); // => 1

/* ------------------------------------------------------------
   RIEPILOGO COMANDI
   ------------------------------------------------------------
   - Object.defineProperty(obj, key, descriptor)
   - Object.defineProperties(obj, { key: descriptor, ... })
   - Object.getOwnPropertyDescriptor(obj, key)
   - Object.getOwnPropertyDescriptors(obj)
   - Descriptor data: { value, writable, enumerable, configurable }
   - Descriptor accessor: { get, set, enumerable, configurable }
   - Default flag con defineProperty: writable/enumerable/configurable = false
   - Object.create(proto, descriptors) -> clonazione fedele con getter/setter
   - Object.getOwnPropertyNames(obj) -> include anche le non-enumerable
   - Object.keys / JSON.stringify / for..in / spread -> solo own enumerable
   - Object.freeze / Object.seal / Object.isFrozen
   - Reflect.defineProperty(obj, key, descriptor) -> ritorna boolean
   - Pattern: sola lettura (writable:false), nascosto (enumerable:false),
     blindato (configurable:false), campo calcolato (get), validazione (set),
     lazy/memoized property (getter auto-sostituente).
   ============================================================ */
