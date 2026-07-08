/* ============================================================
   117 JS ADV Event Emitter
   Costruiamo da zero un EventEmitter (pattern publish/subscribe),
   il cuore di molti framework. Caso reale: un modulo timbrature
   che "emette" eventi (ingresso, uscita, anomalia) e piu' parti
   del gestionale si "iscrivono" per reagire (log, notifiche, KPI).
   Impariamo: on/off/once/emit, gestione errori nei listener,
   e disaccoppiamento tra chi produce e chi consuma gli eventi.
   JavaScript moderno (ES2020+), eseguibile con Node.js.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. L'EMITTER: una mappa evento -> lista di listener
   ------------------------------------------------------------
   Usiamo una Map perche' le chiavi (nomi evento) sono dinamiche
   e Map itera nell'ordine di inserimento in modo prevedibile. */

class EventEmitter {
  constructor() {
    // Map<string, Set<Function>>: Set evita listener duplicati.
    this._listeners = new Map();
  }

  // Iscrive un listener a un evento. Ritorna una funzione di "unsubscribe".
  on(evento, fn) {
    if (typeof fn !== 'function') throw new TypeError('Il listener deve essere una funzione');
    if (!this._listeners.has(evento)) this._listeners.set(evento, new Set());
    this._listeners.get(evento).add(fn);
    // Comodita': ritorno una closure per disiscriversi senza ricordare fn.
    return () => this.off(evento, fn);
  }

  // Disiscrive un listener specifico.
  off(evento, fn) {
    this._listeners.get(evento)?.delete(fn);
    return this;
  }

  // Come on(), ma il listener si auto-rimuove dopo la prima chiamata.
  once(evento, fn) {
    const wrapper = (...args) => {
      this.off(evento, wrapper);
      fn(...args);
    };
    return this.on(evento, wrapper);
  }

  // Emette un evento: chiama tutti i listener con gli argomenti passati.
  // Un errore in un listener NON deve fermare gli altri (robustezza).
  emit(evento, ...args) {
    const set = this._listeners.get(evento);
    if (!set || set.size === 0) return false;
    for (const fn of [...set]) { // copia: un listener puo' disiscriversi durante l'emit
      try {
        fn(...args);
      } catch (err) {
        console.error(`[EventEmitter] errore nel listener di '${evento}':`, err.message);
      }
    }
    return true;
  }

  // Quanti listener per un evento? Utile per test e debug.
  countListeners(evento) {
    return this._listeners.get(evento)?.size ?? 0;
  }
}

/* ------------------------------------------------------------
   2. USO BASE: on / emit
   ------------------------------------------------------------ */

const bus = new EventEmitter();

bus.on('ingresso', (dip) => console.log(`Benvenuto ${dip.nome} (${dip.badge})`));
bus.emit('ingresso', { nome: 'Anna', badge: 'UP-002' });
// => Benvenuto Anna (UP-002)

// Nessun listener su 'uscita' -> emit ritorna false, nessun crash.
console.log(bus.emit('uscita', {})); // => false

/* ------------------------------------------------------------
   3. PIU' LISTENER SULLO STESSO EVENTO (disaccoppiamento)
   ------------------------------------------------------------
   Chi emette non sa quanti ascoltano. Aggiungiamo tre reazioni
   indipendenti all'evento 'timbratura'. */

bus.on('timbratura', (t) => console.log(`[LOG] ${t.badge} @ ${t.ora}`));
bus.on('timbratura', (t) => { if (t.ora > '18:00') console.log(`[STRAORDINARIO] ${t.badge}`); });

let contatoreTimbrature = 0;
bus.on('timbratura', () => { contatoreTimbrature++; }); // KPI

bus.emit('timbratura', { badge: 'UP-001', ora: '08:00' });
bus.emit('timbratura', { badge: 'UP-003', ora: '19:15' });
/* Output:
   [LOG] UP-001 @ 08:00
   [LOG] UP-003 @ 19:15
   [STRAORDINARIO] UP-003 */
console.log('Totale timbrature:', contatoreTimbrature); // => 2

/* ------------------------------------------------------------
   4. once(): reagire UNA sola volta
   ------------------------------------------------------------
   Esempio: mostrare il messaggio di benvenuto solo alla prima
   apertura dell'app in giornata. */

bus.once('apertura', () => console.log('Buongiorno! Prima apertura di oggi.'));
bus.emit('apertura'); // => Buongiorno! Prima apertura di oggi.
bus.emit('apertura'); // (silenzio: il listener si e' gia' rimosso)
console.log(bus.countListeners('apertura')); // => 0

/* ------------------------------------------------------------
   5. UNSUBSCRIBE tramite la closure ritornata da on()
   ------------------------------------------------------------ */

const stopNotifiche = bus.on('anomalia', (msg) => console.log(`[ALERT] ${msg}`));
bus.emit('anomalia', 'Timbratura mancante per UP-004'); // => [ALERT] ...
stopNotifiche(); // disiscrizione
bus.emit('anomalia', 'Questa non verra mostrata');      // (silenzio)
console.log(bus.countListeners('anomalia')); // => 0

/* ------------------------------------------------------------
   6. ROBUSTEZZA: un listener che lancia NON blocca gli altri
   ------------------------------------------------------------ */

bus.on('salva', () => { throw new Error('DB non raggiungibile'); });
bus.on('salva', () => console.log('Backup locale eseguito comunque'));
bus.emit('salva');
/* Output:
   [EventEmitter] errore nel listener di 'salva': DB non raggiungibile
   Backup locale eseguito comunque */

/* ------------------------------------------------------------
   RIEPILOGO
   ------------------------------------------------------------
   - Il pattern pub/sub DISACCOPPIA produttori e consumatori.
   - on() ritorna un "unsubscribe": comodo e sicuro (niente fn da ricordare).
   - once() incapsula la logica di auto-rimozione in un wrapper.
   - emit() e' robusto: isola gli errori dei singoli listener.
   - E' lo stesso modello di Node 'events', del DOM (addEventListener),
     di Redux, RxJS... capirlo qui ti fa capire tutti gli altri.
   ============================================================ */
