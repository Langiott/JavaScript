# Corso di Programmazione — ERP_WEB

Corso pratico in **JavaScript (Node.js 22)**, pensato per chi programma sul gestionale
Polyuretech. Ogni file è **autonomo ed eseguibile**:

```bash
cd backend/corso-programmazione
node 001-paradigmi.js
```

Struttura di ogni file:
1. **Riepilogo descrittivo** dei concetti (commento in testa) — semplice ma puntuale.
2. **Codice eseguibile** con esempi (molti legati al dominio ERP: articoli, movimenti, distinta base).
3. **Elenco delle funzioni create** (in fondo al file e ricapitolato qui sotto).

`(T)` = teoria · `(E)` = esempio pratico eseguibile.

---

## Parte 1 — Paradigmi di programmazione (focus: funzionale)

| File | Argomenti |
|---|---|
| [001-paradigmi.js](001-paradigmi.js) | Panoramica paradigmi: imperativo, funzionale, logico, OOP + concorrenza (multi-thread, eventi, attori, reattiva) (T) |
| [002-funzionale-basi.js](002-funzionale-basi.js) | Caratteristiche FP, cenni di lambda calcolo, tipi built-in, higher-order (map/filter/reduce) (T+E) |
| [003-funzionale-avanzato.js](003-funzionale-avanzato.js) | Currying, Functor, Monad (parole difficili spiegate facili), integrazione con OOP (T+E) |
| [004-node-e-fp.js](004-node-e-fp.js) | Introduzione a Node.js + FP in JS/TS applicata all'ERP (E) |

## Parte 2 — Design Pattern (hands on)

| File | Argomenti |
|---|---|
| [005-creational.js](005-creational.js) | Creational: Singleton, Factory, Builder (T+E) |
| [006-structural.js](006-structural.js) | Structural: Adapter, Decorator, Facade (T+E) |
| [007-behavioral.js](007-behavioral.js) | Behavioral: Strategy, Observer, Chain of Responsibility (T+E) |
| [008-pattern-reali-erp.js](008-pattern-reali-erp.js) | Pattern applicati a casi reali dell'ERP: Repository + Service + Strategy movimenti (E) |

## Parte 3 — Programmazione asincrona

| File | Argomenti |
|---|---|
| [009-async-concetti.js](009-async-concetti.js) | Concetti async, sistemi concorrenti, scambio di messaggi (T) |
| [010-event-loop.js](010-event-loop.js) | Event loop e programmazione a eventi (T+E) |
| [011-promise.js](011-promise.js) | Promise, async/await e correlati (T+E) |
| [012-reactive.js](012-reactive.js) | Reactive programming (stile Rx) + esempi front-end/back-end (T+E) |

---

## Elenco completo delle funzioni create (per file)

Vedi il blocco "ELENCO FUNZIONI" in fondo a ciascun file. Riepilogo rapido:

- **001**: `descriviParadigma`, `demoImperativo`, `demoFunzionale`, `demoLogico`, `demoOOP`, `panoramicaConcorrenza`
- **002**: `raddoppia`, `sommaLista`, `demoImmutabilita`, `demoPure`, `demoMap`, `demoFilter`, `demoReduce`, `pipeline`
- **003**: `curry`, `curryManuale`, `Maybe`, `mapMaybe`, `Identity`, `demoFunctor`, `demoMonad`, `Contatore` (OOP+FP)
- **004**: `leggiArticoliMock`, `soloConCodice`, `codiciMaiuscoli`, `raggruppaPerStato`, `report`
- **005**: `getPrisma` (Singleton), `creaArticolo` (Factory), `ArticoloBuilder` (Builder)
- **006**: `ArcaAdapter` (Adapter), `conLog` (Decorator), `MagazzinoFacade` (Facade)
- **007**: `applicaMovimento` (Strategy), `EventiArticolo` (Observer), `pipelineValidazioni` (Chain)
- **008**: `ArticoloRepository`, `ArticoloService`, `strategieMovimento`
- **009**: `descriviModelloConcorrenza`, `demoScambioMessaggi`
- **010**: `demoEventLoop`, `demoSetTimeout`, `emitter` (EventEmitter)
- **011**: `attendi`, `caricaArticolo`, `caricaInSequenza`, `caricaInParallelo`, `conRetry`
- **012**: `Observable`, `fromArray`, `mapOp`, `filterOp`, `subscribe`, `demoStreamMovimenti`
