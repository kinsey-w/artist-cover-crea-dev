import "./style.css";
// import { Pane } from "tweakpane";

// Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Chargement des images
const artistImg = new Image();
artistImg.src = "/The-Weeknd2-nobg.png";

const dancerImg = new Image();
dancerImg.src = "/dancer-nobg.png";

const titleImg = new Image();
titleImg.src = "/The_Weeknd_logo.png";

// Paramètres (et valeurs par défaut)
const DEFAULTS = {
  // Motif danseurs
  density: 0.85,     // probabilité d’afficher un danseur dans une cellule (0..1)
  cols: 6,           // nombre de colonnes de la grille (moins = plus grand)
  dancerSize: 1.25,  // multiplicateur de taille des PNG danseurs
  stagger: 0.5,      // décalage d’une rangée sur deux (0..1) -> 0.5 = demi-cellule

  // Couleurs fond
  hue: 350,          // hue coin haut-gauche
  hueBR: 210,        // hue coin bas-droit

  // Filtre global
  saturation: 1.10,
  contrast: 1.10,
};

// L’objet utilisé par le rendu
const P = { ...DEFAULTS };

// helper pour récupérer un élément
const $ = (id) => document.getElementById(id);

// DPR : rendre le canvas net (retina)
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  // canvas.clientWidth = taille CSS réelle du canvas
  const size = Math.floor(canvas.clientWidth * dpr);

  // On évite de réassigner si ce n’est pas nécessaire
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size;
    canvas.height = size;
  }
  return size;
}

// UI : mise à jour des labels (valeurs à droite des sliders)
function updateLabels() {
  $("densityVal").textContent = (+P.density).toFixed(2);
  $("colsVal").textContent = String(P.cols);
  $("sizeVal").textContent = (+P.dancerSize).toFixed(2);
  $("staggerVal").textContent = (+P.stagger).toFixed(2);

  $("hueVal").textContent = String(Math.round(P.hue));
  $("hueBRVal").textContent = String(Math.round(P.hueBR));

  $("satVal").textContent = (+P.saturation).toFixed(2);
  $("conVal").textContent = (+P.contrast).toFixed(2);
}

// Remet les sliders à la valeur de P (utile pour reset)
function setUIFromParams() {
  $("density").value = P.density;
  $("cols").value = P.cols;
  $("size").value = P.dancerSize;
  $("stagger").value = P.stagger;

  $("hue").value = P.hue;
  $("hueBR").value = P.hueBR;

  $("sat").value = P.saturation;
  $("con").value = P.contrast;

  updateLabels();
}

// Dessin : fond (dégradé + vignette)
function drawBackground(size) {
  // Dégradé diagonal (haut-gauche -> bas-droit)
  const g = ctx.createLinearGradient(0, 0, size, size);

  // Coin haut-gauche (contrôlé par hue)
  g.addColorStop(0, `hsl(${P.hue} 70% 45%)`);

  // Coin bas-droit (contrôlé par hueBR)
  g.addColorStop(1, `hsl(${P.hueBR} 60% 30%)`);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Vignette : assombrit les bords pour un look plus “ciné”
  const vg = ctx.createRadialGradient(
    size / 2, size / 2, size * 0.2,
    size / 2, size / 2, size * 0.75
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, size, size);
}

// Dessin : motif des danseurs (grille alternée)
function drawDancers(size) {
  const cols = P.cols;
  const cell = size / cols;          // taille d’une cellule
  const rows = Math.ceil(size / cell);

  // Pour “concert vibe” : on commence plus bas dans l’image
  const stageStart = size * 0.40;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  for (let row = 0; row < rows; row++) {
    const y = row * cell;

    // On ignore les rangées au-dessus de stageStart
    if (y < stageStart) continue;

    // Décalage 1 rangée sur 2 (stagger)
    const offset = (row % 2 === 0) ? 0 : (P.stagger * cell);

    for (let col = 0; col < cols + 1; col++) {
      // “density” = probabilité d’afficher un danseur
      if (Math.random() > P.density) continue;

      const x = col * cell + offset;

      // Taille du danseur (en fonction de la cellule)
      const s = cell * P.dancerSize;

      // Petit bruit (jitter) pour casser l’effet trop parfait
      const jx = (Math.random() * 2 - 1) * cell * 0.08;
      const jy = (Math.random() * 2 - 1) * cell * 0.08;

      // Profondeur : plus on est bas, plus c’est grand et visible
      const depth = (y - stageStart) / (size - stageStart); // 0..1
      const depthScale = 0.85 + depth * 0.35;
      ctx.globalAlpha = 0.20 + depth * 0.55;

      ctx.drawImage(
        dancerImg,
        x - (s * depthScale) / 2 + jx,
        y - (s * depthScale) / 2 + jy,
        s * depthScale,
        s * depthScale
      );
    }
  }

  ctx.restore();
}

// Dessin : titre (PNG) en haut-centre
function drawTitle(size) {
  const w = size * 0.78;
  const h = w * (titleImg.height / titleImg.width);
  const x = size / 2 - w / 2;
  const y = size * 0.06;
  ctx.drawImage(titleImg, x, y, w, h);
}

// Dessin : artiste (PNG) en bas, devant
function drawArtist(size) {
  // “Grand” artiste, ancré en bas
  const scale = 1.05;
  const w = size * scale;
  const h = w * (artistImg.height / artistImg.width);
  const x = size / 2 - w / 2;

  // On le descend un peu pour “déborder” et paraître plus massif
  const y = size - h + size * 0.06;

  ctx.drawImage(artistImg, x, y, w, h);
}

// Rendu principal
function draw() {
  // On s’assure que les images sont prêtes
  if (!artistImg.complete || !dancerImg.complete || !titleImg.complete) return;

  const size = resizeCanvas();
  ctx.clearRect(0, 0, size, size);

  // Filtre global (simple) : saturation + contraste
  // Si tu veux filtrer seulement le fond + danseurs : mets filter,
  // dessine fond + danseurs, puis ctx.filter = "none" avant titre/artiste.
  ctx.filter = `saturate(${P.saturation}) contrast(${P.contrast})`;

  drawBackground(size);
  drawDancers(size);
  drawTitle(size);
  drawArtist(size);

  ctx.filter = "none";

  // Bordure fine
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.lineWidth = Math.max(1, window.devicePixelRatio || 1);
  ctx.strokeRect(0, 0, size, size);
}

// Wiring UI : slider -> update param -> redraw
function bindRange(id, key) {
  $(id).addEventListener("input", (e) => {
    P[key] = +e.target.value;
    updateLabels();
    draw();
  });
}

bindRange("density", "density");
bindRange("cols", "cols");
bindRange("size", "dancerSize");
bindRange("stagger", "stagger");
bindRange("hue", "hue");
bindRange("hueBR", "hueBR");
bindRange("sat", "saturation");
bindRange("con", "contrast");

// Reset : on remet les valeurs par défaut
$("reset").addEventListener("click", () => {
  Object.assign(P, DEFAULTS);
  setUIFromParams();
  draw();
});

// Export PNG : récupère le contenu du canvas en image
$("export").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "album-cover.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

// Redraw si la fenêtre change de taille
window.addEventListener("resize", draw);

// Attendre le chargement complet des images avant le 1er rendu
let loaded = 0;
[artistImg, dancerImg, titleImg].forEach((img) => {
  img.addEventListener("load", () => {
    loaded++;
    if (loaded === 3) {
      setUIFromParams();
      draw();
    }
  });
});
