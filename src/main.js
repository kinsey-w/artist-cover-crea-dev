import "./style.css";
// import { Pane } from "tweakpane";

// setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
const size = Math.floor(canvas.clientWidth * dpr);
canvas.width = size;
canvas.height = size;

// paramètres + valeurs default
const PARAMS = {
  // motif danseurs
  density: 0.85,
  cols: 6,
  dancerSize: 1.25,
  stagger: 0.5,

  // couleurs fond
  hueTL: 350,   // top-left
  hueBR: 210,   // bottom-right

  // filtre image
  saturation: 1.1,
  contrast: 1.1,
};

// images
const artistImg = new Image();
artistImg.src = "/The-Weeknd2-nobg.png";

const dancerImg = new Image();
dancerImg.src = "/dancer-nobg.png";

const titleImg = new Image();
titleImg.src = "/The-Weeknd-logo.png";

let readyCount = 0;
[artistImg, dancerImg, titleImg].forEach((img) => {
  img.onload = () => {
    readyCount += 1;
    if (readyCount === 3) draw();
  };
});

// UI 
function $(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  $(id).textContent = value;
}

function bindRange(inputId, valueId, key, decimals = 2) {
  const input = $(inputId);

  input.addEventListener("input", (e) => {
    PARAMS[key] = +e.target.value;

    // mise à jour du label à droite
    if (valueId) {
      const v = PARAMS[key];
      setText(valueId, decimals === 0 ? String(Math.round(v)) : v.toFixed(decimals));
    }

    draw();
  });
}

// sliders
bindRange("density", "densityVal", "density", 2);
bindRange("cols", "colsVal", "cols", 0);
bindRange("size", "sizeVal", "dancerSize", 2);
bindRange("stagger", "staggerVal", "stagger", 2);
bindRange("hue", "hueVal", "hueTL", 0);
bindRange("hueBR", "hueBRVal", "hueBR", 0);
bindRange("sat", "satVal", "saturation", 2);
bindRange("con", "conVal", "contrast", 2);

// reset
$("reset").addEventListener("click", () => {
  PARAMS.density = 0.85;
  PARAMS.cols = 6;
  PARAMS.dancerSize = 1.25;
  PARAMS.stagger = 0.5;
  PARAMS.hueTL = 350;
  PARAMS.hueBR = 210;
  PARAMS.saturation = 1.1;
  PARAMS.contrast = 1.1;

  $("density").value = PARAMS.density; setText("densityVal", PARAMS.density.toFixed(2));
  $("cols").value = PARAMS.cols;       setText("colsVal", String(PARAMS.cols));
  $("size").value = PARAMS.dancerSize; setText("sizeVal", PARAMS.dancerSize.toFixed(2));
  $("stagger").value = PARAMS.stagger; setText("staggerVal", PARAMS.stagger.toFixed(2));
  $("hue").value = PARAMS.hueTL;       setText("hueVal", String(PARAMS.hueTL));
  $("hueBR").value = PARAMS.hueBR;     setText("hueBRVal", String(PARAMS.hueBR));
  $("sat").value = PARAMS.saturation;  setText("satVal", PARAMS.saturation.toFixed(2));
  $("con").value = PARAMS.contrast;    setText("conVal", PARAMS.contrast.toFixed(2));

  draw();
});

// export
$("export").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "album-cover.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

// dessin
function draw() {
  if (readyCount !== 3) return;

  ctx.filter = `saturate(${PARAMS.saturation}) contrast(${PARAMS.contrast})`;

  // fond gradient
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, `hsl(${PARAMS.hueTL} 70% 45%)`);
  g.addColorStop(1, `hsl(${PARAMS.hueBR} 60% 30%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const vg = ctx.createRadialGradient(
    size / 2, size / 2, size * 0.2,
    size / 2, size / 2, size * 0.75
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, size, size);

  // grille danseurs
  const cols = PARAMS.cols;
  const cell = size / cols;
  const rows = Math.ceil(size / cell);

  const stageStart = size * 0.40;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  for (let row = 0; row < rows; row++) {
    const y = row * cell;
    if (y < stageStart) continue;

    const offset = (row % 2 === 0) ? 0 : (PARAMS.stagger * cell);

    for (let col = 0; col < cols + 1; col++) {
      if (Math.random() > PARAMS.density) continue;

      const x = col * cell + offset;
      const s = cell * PARAMS.dancerSize;

      const jx = (Math.random() * 2 - 1) * cell * 0.08;
      const jy = (Math.random() * 2 - 1) * cell * 0.08;

      const depth = (y - stageStart) / (size - stageStart);
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

  // titre
  {
    const w = size * 0.78;
    const h = w * (titleImg.height / titleImg.width);
    const x = size / 2 - w / 2;
    const y = size * 0.03 - h * 0.35;
    ctx.drawImage(titleImg, x, y, w, h);
  }

  // image artiste
  {
    const scale = 1.05;
    const w = size * scale;
    const h = w * (artistImg.height / artistImg.width);
    const x = size / 2 - w / 2;
    const y = size - h + size * 0.06;
    ctx.drawImage(artistImg, x, y, w, h);
  }

  // reset filtre
  ctx.filter = "none";

  // bordure
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.lineWidth = Math.max(1, dpr);
  ctx.strokeRect(0, 0, size, size);
}



// animations site
const covers = document.querySelectorAll('.cover');

covers.forEach(cover => {
  cover.addEventListener('click', () => {
    const groups = document.querySelectorAll('.groupe'); // tous les groupes
    groups.forEach(group => {
      group.classList.toggle('paused'); // on met en pause ou on reprend
    });
  });
});

anime.timeline({loop: true})
  .add({
    targets: '.new .word',
    scale: [2,1],
    opacity: [0,1],
    easing: "easeOutCirc",
    duration: 2000,
    delay: (el, i) => 800 * i
  }).add({
    targets: '.new',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 100000
  });
  
