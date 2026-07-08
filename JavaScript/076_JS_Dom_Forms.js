/* ============================================================
   76 JS Dom Forms
   I form sono il cuore dell'input utente nel DOM. In questo file
   vediamo come leggere e scrivere i valori dei campi (value, checked),
   gestire i diversi tipi di input (text, checkbox, radio, select),
   intercettare gli eventi (input, change, submit), validare i dati
   (built-in validation e validazione custom) e raccogliere tutti i
   campi in un colpo solo con l'oggetto FormData prima di inviarli
   al server. Esempi ispirati a un gestionale ERP (dipendenti, badge,
   timbrature, turni, reparti, vestiario).
   ============================================================ */

// Esempio browser: gira nel browser, non in Node (document, addEventListener, ecc.)
// In Node useremo funzioni pure per mostrare la LOGICA di validazione.


/* ------------------------------------------------------------
   1. SELEZIONARE UN FORM E I SUOI CAMPI
   ------------------------------------------------------------ */

// Esempio browser: selezione del form e accesso ai campi tramite .elements
function selezioneCampi() {
  const form = document.querySelector('#formDipendente'); // <form id="formDipendente">
  // form.elements espone i campi per name o per indice
  const nome = form.elements['nome'];          // <input name="nome">
  const badge = form.elements.namedItem('badge');
  console.log(nome.value, badge.value);
  // shortcut: form.nome.value funziona se l'input ha name="nome"
}


/* ------------------------------------------------------------
   2. LEGGERE E SCRIVERE value (input text, number, textarea)
   ------------------------------------------------------------ */

// Esempio browser: .value e' sempre una STRING, anche per type="number"
function leggiValue() {
  const input = document.querySelector('#badge');
  console.log(input.value);          // => "UP-001" (string)
  input.value = 'UP-002';            // scrive nel campo
  const eta = document.querySelector('#eta');
  console.log(typeof eta.value);     // => "string"
  console.log(Number(eta.value));    // converti in numero quando serve
}

// Logica pura (Node): normalizzazione di un codice badge come nell'ERP
function normalizzaBadge(v) {
  return String(v || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 8);
}
console.log(normalizzaBadge('  up-001 ')); // => "UP-001"
console.log(normalizzaBadge('up 12'));     // => "UP12"


/* ------------------------------------------------------------
   3. checkbox: la proprieta' .checked (boolean)
   ------------------------------------------------------------ */

// Esempio browser: .checked dice se la checkbox e' spuntata
function leggiCheckbox() {
  const consenso = document.querySelector('#consensoPrivacy');
  console.log(consenso.checked);   // => true / false
  consenso.checked = true;         // spunta da codice
  // attenzione: .value di una checkbox NON cambia se la spunti,
  // resta il value dell'attributo HTML; usa .checked per lo stato.
}

// Esempio browser: piu' checkbox (es. DPI assegnati) -> array dei selezionati
function dpiSelezionati() {
  const checks = document.querySelectorAll('input[name="dpi"]:checked');
  const valori = [...checks].map((c) => c.value);
  console.log(valori); // => ["guanti", "occhiali"]
}


/* ------------------------------------------------------------
   4. radio: un solo valore tra molti
   ------------------------------------------------------------ */

// Esempio browser: leggere il radio selezionato (es. tipo turno P4/P2)
function turnoSelezionato() {
  const form = document.querySelector('#formTurno');
  const scelto = form.querySelector('input[name="turno"]:checked');
  console.log(scelto ? scelto.value : null); // => "P4" oppure null se nessuno
  // alternativa moderna:
  console.log(new FormData(form).get('turno'));
}


/* ------------------------------------------------------------
   5. select: value, selectedOptions, multiple
   ------------------------------------------------------------ */

// Esempio browser: <select> singola e multipla
function letturaSelect() {
  const reparto = document.querySelector('#reparto');
  console.log(reparto.value);                 // => "MO" (value option selezionata)
  console.log(reparto.selectedIndex);         // => 2

  const repartiMulti = document.querySelector('#repartiMulti'); // <select multiple>
  const sigle = [...repartiMulti.selectedOptions].map((o) => o.value);
  console.log(sigle); // => ["MO", "AS"]
}

// Esempio browser: popolare una select da dati (pattern map -> <option>)
function popolaReparti(reparti) {
  const sel = document.querySelector('#reparto');
  sel.innerHTML = reparti
    .map((r) => `<option value="${r.sigla}">${r.nome}</option>`)
    .join('');
}


/* ------------------------------------------------------------
   6. EVENTI: input vs change
   ------------------------------------------------------------ */

// Esempio browser:
//  - 'input'  -> scatta ad OGNI carattere digitato (live)
//  - 'change' -> scatta quando il campo perde focus / cambia valore confermato
function eventiInput() {
  const badge = document.querySelector('#badge');
  badge.addEventListener('input', (e) => {
    e.target.value = normalizzaBadge(e.target.value); // live formatting
  });

  const reparto = document.querySelector('#reparto');
  reparto.addEventListener('change', (e) => {
    console.log('Reparto scelto:', e.target.value);
  });
}


/* ------------------------------------------------------------
   7. SUBMIT: intercettare e bloccare l'invio
   ------------------------------------------------------------ */

// Esempio browser: e.preventDefault() impedisce il reload della pagina
function gestisciSubmit() {
  const form = document.querySelector('#formDipendente');
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // niente navigazione: gestiamo noi i dati
    const dati = Object.fromEntries(new FormData(form));
    console.log('Invio:', dati);
    // qui: fetch('/api/dipendenti', { method:'POST', body: JSON.stringify(dati) })
  });
}


/* ------------------------------------------------------------
   8. VALIDAZIONE BUILT-IN (HTML5 Constraint Validation API)
   ------------------------------------------------------------ */

// Esempio browser: required, pattern, min/max e i metodi nativi
function validazioneNativa() {
  const form = document.querySelector('#formDipendente');
  const badge = document.querySelector('#badge'); // pattern="UP-\d{3}" required

  console.log(badge.validity.valid);       // => true/false
  console.log(badge.validity.valueMissing);// => true se vuoto e required
  console.log(badge.validity.patternMismatch);
  console.log(badge.checkValidity());      // => true/false (e dispara evento 'invalid')
  console.log(form.checkValidity());       // valida tutto il form

  // messaggio di errore personalizzato
  if (badge.validity.patternMismatch) {
    badge.setCustomValidity('Il badge deve essere tipo UP-001');
  } else {
    badge.setCustomValidity(''); // stringa vuota = campo valido
  }
  // form.reportValidity(); // mostra i tooltip di errore del browser
}


/* ------------------------------------------------------------
   9. VALIDAZIONE CUSTOM (logica pura, eseguibile in Node)
   ------------------------------------------------------------ */

// Regex dell'ERP per orario timbratura HH:MM
const RE_ORARIO = /^\d{2}:\d{2}$/;
function orarioValido(v) {
  if (!RE_ORARIO.test(v)) return false;
  const [h, m] = v.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}
console.log(orarioValido('08:30')); // => true
console.log(orarioValido('25:00')); // => false
console.log(orarioValido('8:5'));   // => false

// Validatore di un dipendente: ritorna { ok, errori } (oggetto campo->messaggio)
function validaDipendente(d) {
  const errori = {};
  if (!d.nome?.trim()) errori.nome = 'Nome obbligatorio';
  if (!/^UP-\d{3}$/.test(d.badge || '')) errori.badge = 'Badge tipo UP-001';
  if (!['P4', 'P2'].includes(d.turno)) errori.turno = 'Turno non valido';
  if (Number(d.eta) < 16) errori.eta = 'Eta minima 16 anni';
  return { ok: Object.keys(errori).length === 0, errori };
}
console.log(validaDipendente({ nome: 'Mario', badge: 'UP-001', turno: 'P4', eta: 30 }));
// => { ok: true, errori: {} }
console.log(validaDipendente({ nome: '', badge: 'X', turno: 'P9', eta: 12 }));
// => { ok: false, errori: { nome:..., badge:..., turno:..., eta:... } }

// Validazione di una riga vestiario (scorta minima) con every/some
function vestiarioOk(righe) {
  return righe.every((r) => r.taglia && r.quantita >= 0 && r.quantita >= r.scortaMinima);
}
console.log(vestiarioOk([{ taglia: 'L', quantita: 5, scortaMinima: 2 }])); // => true
console.log(vestiarioOk([{ taglia: 'M', quantita: 1, scortaMinima: 3 }])); // => false


/* ------------------------------------------------------------
   10. FormData: raccogliere tutti i campi
   ------------------------------------------------------------ */

// Esempio browser: costruire FormData dal form e leggerne i valori
function usaFormData() {
  const form = document.querySelector('#formDipendente');
  const fd = new FormData(form);

  console.log(fd.get('nome'));            // => "Mario"
  console.log(fd.getAll('dpi'));          // => ["guanti","occhiali"] (campi multipli)
  fd.append('reparto', 'MO');             // aggiungere campi a mano
  fd.set('badge', 'UP-002');             // sovrascrivere
  console.log(fd.has('turno'));           // => true

  // iterare tutte le coppie
  for (const [chiave, valore] of fd.entries()) {
    console.log(chiave, '=', valore);
  }

  // -> oggetto semplice (perde i campi multipli, tiene l'ultimo)
  const obj = Object.fromEntries(fd);
  console.log(obj); // => { nome:"Mario", badge:"UP-002", ... }
}

// Esempio browser: FormData puo' essere mandato direttamente in fetch
async function inviaFormData(form) {
  const res = await fetch('/api/dipendenti', { method: 'POST', body: new FormData(form) });
  // niente Content-Type manuale: il browser imposta multipart/form-data + boundary
  return res.json();
}

// FormData lato Node: si puo' costruire programmaticamente (Node 18+)
const fdNode = new FormData();
fdNode.append('badge', 'UP-007');
fdNode.append('turno', 'P4');
console.log(fdNode.get('badge')); // => "UP-007"


/* ------------------------------------------------------------
   11. RESET, FOCUS, DISABILITARE I CAMPI
   ------------------------------------------------------------ */

// Esempio browser: gestione UX del form
function utilitaForm() {
  const form = document.querySelector('#formDipendente');
  form.reset();                              // riporta ai valori iniziali
  form.querySelector('#nome').focus();       // sposta il focus
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;                 // disabilita durante l'invio
  // i campi disabled NON entrano in FormData (i readonly invece si')
}


/* ------------------------------------------------------------
   12. ESEMPIO COMPLETO (browser): form dipendente con submit + validazione
   ------------------------------------------------------------ */

// Esempio browser: flusso completo input -> validazione -> invio
function setupFormDipendente() {
  const form = document.querySelector('#formDipendente');

  // formattazione live del badge
  form.badge.addEventListener('input', (e) => {
    e.target.value = normalizzaBadge(e.target.value);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dati = Object.fromEntries(new FormData(form));
    const { ok, errori } = validaDipendente(dati);

    // mostra/azzera messaggi di errore custom
    for (const campo of ['nome', 'badge', 'turno', 'eta']) {
      form[campo]?.setCustomValidity(errori[campo] || '');
    }

    if (!ok) {
      form.reportValidity(); // mostra il primo errore
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch('/api/dipendenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dati),
      });
      if (!res.ok) throw new Error('Errore server');
      form.reset();
    } catch (err) {
      console.error(err);
    } finally {
      btn.disabled = false;
    }
  });
}


/* ============================================================
   RIEPILOGO COMANDI (scheda rapida)
   - form.elements / form.elements['name'] / form.namedInput.value
   - input.value (string), input.checked (boolean)
   - select.value, select.selectedIndex, select.selectedOptions, multiple
   - querySelectorAll('input[name="x"]:checked') -> [...].map(c=>c.value)
   - element.addEventListener('input' | 'change' | 'submit', handler)
   - event.preventDefault()  (blocca il submit/reload)
   - Constraint Validation API: input.validity, input.validity.valueMissing,
       input.validity.patternMismatch, checkValidity(), reportValidity(),
       setCustomValidity(msg)
   - new FormData(form): get, getAll, set, append, has, delete, entries()
   - Object.fromEntries(formData)  (FormData -> oggetto)
   - fetch(url, { method:'POST', body: new FormData(form) })
   - form.reset(), input.focus(), input.disabled, input.readOnly
   - Validazione custom: regex.test(), every(), some(), includes()
   ============================================================ */
