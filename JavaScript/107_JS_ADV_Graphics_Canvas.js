/* ============================================================
   107 JS ADV Graphics Canvas
   Il Canvas API permette di disegnare grafica 2D (e 3D via WebGL)
   pixel per pixel dentro un elemento <canvas> HTML. Si ottiene un
   "rendering context" con getContext('2d') e si usano metodi
   imperativi: rettangoli, archi, path, colori, gradienti, testo e
   immagini. Con requestAnimationFrame si creano animazioni fluide
   sincronizzate col refresh dello schermo (~60 FPS). In questo file
   ESEGUIBILE in Node simuliamo la logica (geometria, frame loop,
   stato) e mostriamo il vero codice browser nei commenti.
   ============================================================ */

// NOTA: il Canvas API e' un'API del DOM (browser). In Node non esiste
// l'oggetto document, quindi qui simuliamo la logica con oggetti JS e
// marchiamo gli esempi browser con "// Esempio browser".

/* ------------------------------------------------------------
   1) SETUP DEL CANVAS E DEL CONTEXT
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
function setupCanvasBrowser() {
  // Recupero l'elemento e il context 2d (il "pennello").
  const canvas = document.getElementById('grafico');
  const ctx = canvas.getContext('2d'); // -> CanvasRenderingContext2D
  // Dimensioni del canvas (in pixel logici).
  canvas.width = 800;
  canvas.height = 400;
  return ctx;
}

// Simulazione del context in Node: registriamo le operazioni invece di
// disegnarle. Utile per testare la LOGICA del disegno senza un browser.
function creaContextFinto() {
  const operazioni = [];
  return {
    operazioni,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '10px sans-serif',
    fillRect(x, y, w, h) { operazioni.push(['fillRect', x, y, w, h, this.fillStyle]); },
    strokeRect(x, y, w, h) { operazioni.push(['strokeRect', x, y, w, h]); },
    clearRect(x, y, w, h) { operazioni.push(['clearRect', x, y, w, h]); },
    beginPath() { operazioni.push(['beginPath']); },
    moveTo(x, y) { operazioni.push(['moveTo', x, y]); },
    lineTo(x, y) { operazioni.push(['lineTo', x, y]); },
    arc(x, y, r, s, e) { operazioni.push(['arc', x, y, r, s, e]); },
    closePath() { operazioni.push(['closePath']); },
    fill() { operazioni.push(['fill', this.fillStyle]); },
    stroke() { operazioni.push(['stroke', this.strokeStyle]); },
    fillText(t, x, y) { operazioni.push(['fillText', t, x, y]); },
  };
}

const ctx = creaContextFinto();

/* ------------------------------------------------------------
   2) RETTANGOLI: fillRect, strokeRect, clearRect
   ------------------------------------------------------------ */

// fillRect(x, y, width, height): rettangolo pieno.
ctx.fillStyle = '#3498db';
ctx.fillRect(10, 10, 100, 50);
console.log(ctx.operazioni.at(-1)); // => [ 'fillRect', 10, 10, 100, 50, '#3498db' ]

// strokeRect: solo il bordo.
ctx.strokeStyle = '#e74c3c';
ctx.strokeRect(10, 70, 100, 50);

// clearRect: cancella (rende trasparente) un'area. Fondamentale prima
// di ogni frame di un'animazione per non lasciare scie.
ctx.clearRect(0, 0, 800, 400);
console.log(ctx.operazioni.at(-1)); // => [ 'clearRect', 0, 0, 800, 400 ]

/* ------------------------------------------------------------
   3) COLORI: stringhe CSS, rgba, hsl
   ------------------------------------------------------------ */

// Il colore si imposta su fillStyle (riempimento) e strokeStyle (bordo).
const colori = {
  esadecimale: '#2ecc71',
  rgb: 'rgb(231, 76, 60)',
  rgbaTrasparente: 'rgba(52, 152, 219, 0.5)', // alpha 0..1
  hsl: 'hsl(280, 70%, 50%)',
  nome: 'tomato',
};
console.log(Object.values(colori).length); // => 5

// Genero una palette HSL ruotando la tonalita': utile per grafici a barre.
function palette(n) {
  return Array.from({ length: n }, (_, i) => `hsl(${Math.round((360 / n) * i)}, 70%, 50%)`);
}
console.log(palette(4)); // => [ 'hsl(0, 70%, 50%)', 'hsl(90, ...)', ... ]

/* ------------------------------------------------------------
   4) PATH: beginPath, moveTo, lineTo, closePath, fill/stroke
   ------------------------------------------------------------ */

// Un path e' una serie di sub-percorsi. Disegno un triangolo.
function disegnaTriangolo(c, x, y, lato) {
  c.beginPath();
  c.moveTo(x, y);              // vertice in alto
  c.lineTo(x + lato, y);       // a destra
  c.lineTo(x + lato / 2, y - lato); // su
  c.closePath();               // chiude tornando al moveTo
  c.fillStyle = '#f39c12';
  c.fill();
}
disegnaTriangolo(ctx, 200, 200, 60);
console.log(ctx.operazioni.filter(o => o[0] === 'lineTo').length >= 2); // => true

/* ------------------------------------------------------------
   5) ARCHI E CERCHI: arc(x, y, r, startAngle, endAngle)
   ------------------------------------------------------------ */

// Gli angoli sono in RADIANTI: 0 = ore 3, Math.PI*2 = giro completo.
const gradiToRad = (deg) => (deg * Math.PI) / 180;
console.log(gradiToRad(180)); // => 3.141592653589793

// Cerchio pieno.
function disegnaCerchio(c, x, y, r, colore) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = colore;
  c.fill();
}
disegnaCerchio(ctx, 100, 100, 40, '#9b59b6');

// Spicchio (arco parziale) -> base per i grafici a torta.
function disegnaSpicchio(c, cx, cy, r, daRad, aRad) {
  c.beginPath();
  c.moveTo(cx, cy);
  c.arc(cx, cy, r, daRad, aRad);
  c.closePath();
  c.fill();
}
console.log(typeof disegnaSpicchio); // => function

/* ------------------------------------------------------------
   6) TESTO: fillText, font, textAlign
   ------------------------------------------------------------ */

// Esempio browser: ctx.font = '20px Arial'; ctx.textAlign = 'center';
ctx.font = 'bold 16px sans-serif';
ctx.fillStyle = '#2c3e50';
ctx.fillText('Reparto Produzione', 50, 30);
console.log(ctx.operazioni.at(-1)); // => [ 'fillText', 'Reparto Produzione', 50, 30 ]

/* ------------------------------------------------------------
   7) GRADIENTI E OMBRE (vero codice browser)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
function gradienteBrowser(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 200, 0);
  grad.addColorStop(0, '#3498db');
  grad.addColorStop(1, '#2ecc71');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 200, 100);
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
}

/* ------------------------------------------------------------
   8) GRAFICO A BARRE (ERP): ore lavorate per dipendente
   ------------------------------------------------------------ */

// Pattern ERP: trasformo i dati grezzi (timbrature) in barre.
// Qui calcolo solo la GEOMETRIA delle barre, riutilizzabile col vero ctx.
const dipendenti = [
  { badge: 'UP-001', nome: 'Mario', minuti: 480 },
  { badge: 'UP-002', nome: 'Lucia', minuti: 510 },
  { badge: 'UP-003', nome: 'Anna',  minuti: 300 },
];

function calcolaBarre(dati, { larghezzaCanvas = 600, altezzaCanvas = 300, gap = 20 } = {}) {
  const max = Math.max(...dati.map((d) => d.minuti));
  const larghezzaBarra = (larghezzaCanvas - gap * (dati.length + 1)) / dati.length;
  return dati.map((d, i) => {
    const h = (d.minuti / max) * (altezzaCanvas - 40);
    return {
      x: gap + i * (larghezzaBarra + gap),
      y: altezzaCanvas - h,
      w: larghezzaBarra,
      h,
      etichetta: `${d.nome} (${(d.minuti / 60).toFixed(1)}h)`,
    };
  });
}
const barre = calcolaBarre(dipendenti);
console.log(barre[1].etichetta); // => Lucia (8.5h)

// Render delle barre usando il context (finto o reale, stessa interfaccia).
function renderBarre(c, barre, colori) {
  barre.forEach((b, i) => {
    c.fillStyle = colori[i % colori.length];
    c.fillRect(b.x, b.y, b.w, b.h);
    c.fillStyle = '#000';
    c.fillText(b.etichetta, b.x, b.y - 5);
  });
}
renderBarre(ctx, barre, palette(barre.length));
console.log(ctx.operazioni.filter((o) => o[0] === 'fillRect').length >= 3); // => true

/* ------------------------------------------------------------
   9) GRAFICO A TORTA (ERP): distribuzione per reparto
   ------------------------------------------------------------ */

// filter().reduce() per i totali, poi converto in angoli (spicchi).
const assegnazioni = [
  { reparto: 'PR', minuti: 480 },
  { reparto: 'MG', minuti: 240 },
  { reparto: 'UF', minuti: 180 },
];
function calcolaSpicchi(dati) {
  const totale = dati.reduce((s, d) => s + d.minuti, 0);
  let inizio = 0;
  return dati.map((d) => {
    const fetta = (d.minuti / totale) * Math.PI * 2;
    const spicchio = { reparto: d.reparto, daRad: inizio, aRad: inizio + fetta };
    inizio += fetta;
    return spicchio;
  });
}
const spicchi = calcolaSpicchi(assegnazioni);
console.log(spicchi.length, spicchi[0].daRad); // => 3 0

/* ------------------------------------------------------------
   10) ANIMAZIONE: requestAnimationFrame (loop reale browser)
   ------------------------------------------------------------ */

// Esempio browser: gira nel browser, non in Node.
function animazioneBrowser() {
  const canvas = document.getElementById('grafico');
  const ctx = canvas.getContext('2d');
  let x = 0;
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // pulisco il frame
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x, 50, 40, 40);
    x = (x + 2) % canvas.width; // muovo il quadrato
    requestAnimationFrame(frame); // richiama frame al prossimo refresh
  }
  requestAnimationFrame(frame); // avvio il loop
}

// Animazione basata sul TEMPO (delta time) -> velocita' costante a
// qualunque FPS. start/stop con cancelAnimationFrame.
function animazioneConDelta() {
  let id = null;
  function loop(speed = 60) {
    let ultimo = performance.now?.() ?? Date.now();
    let x = 0;
    function frame(ora) {
      const dt = (ora - ultimo) / 1000; // secondi
      ultimo = ora;
      x += speed * dt; // pixel = velocita' * tempo
      id = requestAnimationFrame(frame);
    }
    id = requestAnimationFrame(frame);
  }
  return { loop, stop: () => cancelAnimationFrame(id) };
}
console.log(typeof animazioneConDelta().stop); // => function

// Simulazione del frame loop in Node (senza rAF): calcolo le posizioni
// di N frame. Utile per testare la fisica di un'animazione.
function simulaFrames(numFrame, { x0 = 0, speed = 2, larghezza = 100 } = {}) {
  const posizioni = [];
  let x = x0;
  for (let i = 0; i < numFrame; i++) {
    x = (x + speed) % larghezza;
    posizioni.push(x);
  }
  return posizioni;
}
console.log(simulaFrames(5)); // => [ 2, 4, 6, 8, 10 ]

/* ------------------------------------------------------------
   11) ANIMAZIONE PROGRESS BAR (ERP): caricamento timbrature
   ------------------------------------------------------------ */

// Easing per un movimento morbido (ease-out cubic).
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
console.log(easeOut(0.5).toFixed(3)); // => 0.875

// Calcolo la larghezza animata della barra a una frazione di tempo t (0..1).
function progressoBarra(t, larghezzaPiena = 300) {
  return Math.round(easeOut(Math.min(1, Math.max(0, t))) * larghezzaPiena);
}
console.log(progressoBarra(0), progressoBarra(1)); // => 0 300

/* ------------------------------------------------------------
   12) INTERAZIONE: coordinate del mouse e hit-test
   ------------------------------------------------------------ */

// Esempio browser: converto le coordinate del click in coordinate canvas.
function coordCanvasBrowser(canvas, evento) {
  const rect = canvas.getBoundingClientRect();
  return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
}

// Hit-test puro: il punto e' dentro la barra? (per tooltip sui grafici ERP)
function puntoInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
console.log(puntoInRect(30, 250, barre[0])); // => true/false secondo geometria

/* ------------------------------------------------------------
   13) HiDPI / RETINA: scalare per schermi ad alta densita'
   ------------------------------------------------------------ */

// Esempio browser: evita il disegno sfocato moltiplicando per devicePixelRatio.
function setupHiDPI(canvas, ctx, w, h) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr); // tutte le coordinate restano in pixel logici
}

/* ------------------------------------------------------------
   14) save/restore e trasformazioni (translate, rotate)
   ------------------------------------------------------------ */

// Esempio browser: save() salva lo stato (stili+trasformazioni),
// restore() lo ripristina. Indispensabile con rotate/translate.
function lancettaOrologio(ctx, cx, cy, angolo, lunghezza) {
  ctx.save();
  ctx.translate(cx, cy);  // sposto l'origine al centro
  ctx.rotate(angolo);     // ruoto il sistema di coordinate
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -lunghezza);
  ctx.stroke();
  ctx.restore();          // annullo translate+rotate
}
console.log(typeof lancettaOrologio); // => function

/* ============================================================
   RIEPILOGO COMANDI
   - canvas.getContext('2d') ........ ottiene il context 2D
   - canvas.width / canvas.height ... dimensioni in pixel logici
   - ctx.fillStyle / strokeStyle .... colore riempimento / bordo
   - ctx.fillRect / strokeRect ...... rettangolo pieno / bordo
   - ctx.clearRect .................. cancella un'area (per i frame)
   - ctx.beginPath / closePath ...... apre / chiude un path
   - ctx.moveTo / lineTo ............ sposta penna / traccia linea
   - ctx.arc(x,y,r,da,a) ............ archi e cerchi (radianti)
   - ctx.fill / stroke .............. riempie / disegna il bordo
   - ctx.font / fillText ............ testo
   - ctx.createLinearGradient / addColorStop ... gradienti
   - ctx.shadowColor / shadowBlur ... ombre
   - ctx.save / restore ............. stato del context
   - ctx.translate / rotate / scale . trasformazioni
   - requestAnimationFrame(fn) ...... loop di animazione (~60 FPS)
   - cancelAnimationFrame(id) ....... ferma il loop
   - devicePixelRatio ............... supporto schermi HiDPI/retina
   - getBoundingClientRect .......... coord mouse -> coord canvas
   ============================================================ */
