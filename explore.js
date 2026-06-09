"use strict";

/* ── Constantes ───────────────────────────────────────── */
const CANVAS_W   = 12000;
const CANVAS_H   = 10000;
const IMG_W      = 160;
const IMG_H      = 200;
const IMG_GAP    = 28;
const GRP_GAP    = 140;
const COLS_FREE  = 30;
const ROWS_FRISE = 12;
const BUFFER     = 200;
// Navigation infinie : grande boîte centrée (±OFF_TILES tuiles) au lieu de déborder
const OFF_TILES  = 25;
let offX = 0, offY = 0;   // décalage des pancartes dans la boîte (freeform)

const LOD_NONE  = "none";
const LOD_THUMB = "thumb";
const LOD_FULL  = "full";

// Seuils LOD ajustés : pas d'images sous 0.25 (évite le chargement massif au départ)


/* ── État ─────────────────────────────────────────────── */
let pancartes      = [];
let positions      = [];
let freePositions  = [];
let frisePositions = [];
let rendered       = new Map();
let modeFrise      = false;
let modalIndex     = -1;
let currentLOD     = LOD_NONE;

// Viewport courant (appliqué au DOM)
let tx = 0, ty = 0, scale = 1;
// Cibles pour le zoom smooth
let targetTx = 0, targetTy = 0, targetScale = 1;

// Pan
let panning = false, panStartX = 0, panStartY = 0, panTx0 = 0, panTy0 = 0;
let panMoved = false;
let clickIndex = -1;

// Pinch
let pinchDist0 = 0, pinchScale0 = 1, pinchTx0 = 0, pinchTy0 = 0;
let pinchMidX  = 0, pinchMidY   = 0;

let lastFrame = 0, lastCheck = 0;

/* ── LOD ──────────────────────────────────────────────── */
// Vraies vignettes à tous les zooms ; pleine def en gros plan.
// (blocs colorés seulement en cas de dézoom extrême, rarement atteint)
function getLOD() {
  if (scale < 0.10) return LOD_NONE;
  if (scale < 0.85) return LOD_THUMB;  // vignettes
  return LOD_FULL;                      // pleine définition
}
function thumbPath(src) { return src.replace(/^images\//, "images/thumbs/"); }
function imgSrc(p, lod) {
  if (lod === LOD_FULL)  return p.image;
  if (lod === LOD_THUMB) return thumbPath(p.image);
  return null;
}

// Couleur dominante -> bloc coloré (mêmes teintes que la page chiffres)
const COULEURS_BLOC = {
  rouge: "#e8000d", bleu: "#3b6fd4", vert: "#16a34a", noir: "#1a1a1a",
  rose: "#db2777", violet: "#7c3aed", jaune: "#ca8a04",
  blanc: "#cccccc", gris: "#9aa3b2", marron: "#92400e",
};
function couleurBloc(p) { return COULEURS_BLOC[(p.couleur || "").toLowerCase()] || "#b9b9c8"; }

/* ── Init ─────────────────────────────────────────────── */
async function init() {
  const resp = await fetch("data/pancartes.json");
  const all  = await resp.json();
  pancartes  = [...all].sort((a, b) => a.annee - b.annee || (a.id > b.id ? 1 : -1));

  computeFreePositions();
  computeFrisePositions();
  positions = freePositions.map(p => ({ ...p }));

  // Précharger toutes les thumbnails en arrière-plan
  pancartes.forEach(p => { const img = new Image(); img.src = thumbPath(p.image); });

  const scene  = document.getElementById("scene");
  const canvas = document.getElementById("canvas");
  // Grande boîte centrée : les pancartes (décalées de +offX/+offY) restent
  // toujours à l'intérieur, donc rien n'est écrêté quel que soit le déplacement.
  offX = OFF_TILES * CANVAS_W;
  offY = OFF_TILES * CANVAS_H;
  canvas.style.width  = (2 * OFF_TILES + 1) * CANVAS_W + "px";
  canvas.style.height = (2 * OFF_TILES + 1) * CANVAS_H + "px";

  scale = targetScale = 0.18;
  currentLOD = getLOD();
  tx = targetTx = (scene.clientWidth  - CANVAS_W * scale) / 2;
  ty = targetTy = (scene.clientHeight - CANVAS_H * scale) / 2;
  applyTransform();

  requestAnimationFrame(rafLoop);

  // Écouteurs sur #scene (couvre tout l'écran) et non #canvas,
  // sinon on ne peut pas attraper le vide hors de la boîte du canvas.
  scene.addEventListener("mousedown",  onCanvasMouseDown);
  scene.addEventListener("touchstart", onCanvasTouchStart, { passive: false });
  scene.addEventListener("wheel",       onWheel, { passive: false });
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup",   onMouseUp);
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend",  onTouchEnd);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { fermerModal(); return; }
    if (modalIndex < 0) return;
    if (e.key === "ArrowRight") {
      modalIndex = (modalIndex + 1) % pancartes.length;
      afficherDansModal(modalIndex);
    }
    if (e.key === "ArrowLeft") {
      modalIndex = (modalIndex - 1 + pancartes.length) % pancartes.length;
      afficherDansModal(modalIndex);
    }
  });

  // ── Tooltip survol ───────────────────────────────────────────────
  const tooltip = document.getElementById("explore-tooltip");
  if (tooltip) {
    scene.addEventListener("mousemove", (e) => {
      const el = e.target.closest(".affiche");
      if (!el || panning) { tooltip.classList.remove("visible"); return; }
      const idx = parseInt(el.dataset.index);
      const p   = pancartes[idx];
      if (!p) { tooltip.classList.remove("visible"); return; }

      const texte = p.texte ? `<span class="tt-texte">${p.texte.toLowerCase()}</span>` : "";
      const meta  = [p.ville, p.annee].filter(Boolean).join(" · ").toLowerCase();
      tooltip.innerHTML = texte + `<span class="tt-meta">${meta}</span>`;

      const ox = 14, oy = 14;
      let x = e.clientX + ox;
      let y = e.clientY + oy;
      // Éviter de déborder à droite / en bas
      if (x + 270 > window.innerWidth)  x = e.clientX - 270 - ox;
      if (y + 80  > window.innerHeight) y = e.clientY - 80  - oy;
      tooltip.style.left = x + "px";
      tooltip.style.top  = y + "px";
      tooltip.classList.add("visible");
    });

    scene.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
  }

  document.getElementById("explore-modal").addEventListener("click", e => {
    if (e.target === document.getElementById("explore-modal")) fermerModal();
  });

  document.getElementById("btn-vue").addEventListener("click", basculerVue);

  // Dropdown année
  document.getElementById("btn-annee-dd").addEventListener("click", (e) => {
    e.stopPropagation();
    const dd = document.getElementById("dd-annee");
    const isOpen = dd.classList.toggle("ouvert");
    e.currentTarget.setAttribute("aria-expanded", isOpen);
  });
  document.addEventListener("click", () => {
    const dd = document.getElementById("dd-annee");
    if (dd && dd.classList.contains("ouvert")) {
      dd.classList.remove("ouvert");
      document.getElementById("btn-annee-dd").setAttribute("aria-expanded", "false");
    }
  });

  const curseur = document.getElementById("curseur-zoom");
  curseur.addEventListener("input", () => {
    const ns    = parseFloat(curseur.value);
    const sc    = document.getElementById("scene");
    const mx    = sc.clientWidth  / 2;
    const my    = sc.clientHeight / 2;
    tx = targetTx = mx - (mx - tx) * (ns / scale);
    ty = targetTy = my - (my - ty) * (ns / scale);
    scale = targetScale = ns;
    applyTransform();
  });

  function changerZoom(delta) {
    const ns = Math.max(parseFloat(curseur.min), Math.min(parseFloat(curseur.max), parseFloat(curseur.value) + delta));
    curseur.value = ns;
    curseur.dispatchEvent(new Event("input"));
  }
  document.getElementById("btn-zoom-moins")?.addEventListener("click", () => changerZoom(-0.1));
  document.getElementById("btn-zoom-plus")?.addEventListener("click",  () => changerZoom(+0.1));
}

/* ── Positions ────────────────────────────────────────── */
function computeFreePositions() {
  const ROWS  = Math.ceil(pancartes.length / COLS_FREE);
  // Remplir tout le pavé bord à bord pour une répétition infinie sans trous
  const cellW = CANVAS_W / COLS_FREE;
  const cellH = CANVAS_H / ROWS;
  freePositions = pancartes.map((_, i) => ({
    x: (i % COLS_FREE) * cellW + Math.random() * cellW * 0.55,
    y: Math.floor(i / COLS_FREE) * cellH + Math.random() * cellH * 0.55,
  }));
}

function computeFrisePositions() {
  const years  = [...new Set(pancartes.map(p => p.annee))].sort((a, b) => a - b);
  const groups = {};
  pancartes.forEach((p, i) => { if (!groups[p.annee]) groups[p.annee] = []; groups[p.annee].push(i); });
  frisePositions = new Array(pancartes.length);
  const startX = {};
  const originY = 300;
  let curX = 300;
  years.forEach(year => {
    startX[year] = curX;
    groups[year].forEach((gi, i) => {
      frisePositions[gi] = {
        x: curX + Math.floor(i / ROWS_FRISE) * (IMG_W + IMG_GAP),
        y: originY + (i % ROWS_FRISE) * (IMG_H + IMG_GAP),
      };
    });
    const cols = Math.ceil(groups[year].length / ROWS_FRISE);
    curX += cols * (IMG_W + IMG_GAP) + GRP_GAP;
  });
  const friseH = originY + ROWS_FRISE * (IMG_H + IMG_GAP);
  frisePositions._years   = years;
  frisePositions._groups  = groups;
  frisePositions._startX  = startX;
  frisePositions._originY = originY;
  frisePositions._totalW  = curX;
  frisePositions._totalH  = friseH;
}

/* ── Rendu virtuel ────────────────────────────────────── */
function getViewportBounds() {
  const scene = document.getElementById("scene");
  return {
    left:   (-tx / scale) - BUFFER,
    top:    (-ty / scale) - BUFFER,
    right:  (scene.clientWidth  - tx) / scale + BUFFER,
    bottom: (scene.clientHeight - ty) / scale + BUFFER,
  };
}

let lastSig = "";
function updateVisible() {
  const lod        = getLOD();
  const lodChanged = lod !== currentLOD;
  // Sauter le travail si la vue n'a pas bougé (et pas de changement de LOD)
  const sig = Math.round(tx) + "|" + Math.round(ty) + "|" + scale.toFixed(3) + "|" + modeFrise;
  if (sig === lastSig && !lodChanged) return;
  lastSig = sig;
  currentLOD       = lod;
  const bounds     = getViewportBounds();
  const canvas     = document.getElementById("canvas");
  const toRemove   = new Set(rendered.keys());

  // Tuiles à afficher : une seule en frise, répétition infinie en freeform.
  const tiles = [];
  if (modeFrise) {
    tiles.push([0, 0]);
  } else {
    const minTX = Math.floor(bounds.left   / CANVAS_W) - 1;
    const maxTX = Math.floor(bounds.right  / CANVAS_W) + 1;
    const minTY = Math.floor(bounds.top    / CANVAS_H) - 1;
    const maxTY = Math.floor(bounds.bottom / CANVAS_H) + 1;
    for (let tX = minTX; tX <= maxTX; tX++)
      for (let tY = minTY; tY <= maxTY; tY++)
        tiles.push([tX, tY]);
  }

  pancartes.forEach((p, i) => {
    const pos = positions[i];
    tiles.forEach(([tX, tY]) => {
      const x = pos.x + tX * CANVAS_W;
      const y = pos.y + tY * CANVAS_H;
      const inView = x + IMG_W > bounds.left && x < bounds.right &&
                     y + IMG_H > bounds.top  && y < bounds.bottom;
      if (!inView) return;
      const key = i + "|" + tX + "|" + tY;
      toRemove.delete(key);
      if (!rendered.has(key)) {
        const el = creerEl(p, i, { x, y }, lod);
        canvas.appendChild(el);
        rendered.set(key, { el, lod, idx: i });
      } else if (lodChanged) {
        const entry = rendered.get(key);
        if (entry.lod !== lod) { updateElLOD(entry.el, p, lod); entry.lod = lod; }
      }
    });
  });

  toRemove.forEach(key => {
    const entry = rendered.get(key);
    if (entry.el.parentNode) entry.el.parentNode.removeChild(entry.el);
    rendered.delete(key);
  });
}

function creerEl(p, i, pos, lod) {
  const el = document.createElement("div");
  el.className = "affiche";
  el.dataset.index = i;
  el.style.cssText = `left:${pos.x + offX}px;top:${pos.y + offY}px;z-index:${i + 1}`;
  if (lod === LOD_NONE) {
    // Dézoom extrême : petit bloc de couleur (rare)
    el.classList.add("affiche-vide");
    el.style.background = couleurBloc(p);
  } else {
    const src = imgSrc(p, lod);
    el.innerHTML = `<img src="${src}" decoding="async" draggable="false" onerror="this.onerror=null;this.src='${p.image}'">`;
  }
  return el;
}

function updateElLOD(el, p, lod) {
  if (lod === LOD_NONE) {
    el.innerHTML = "";
    el.classList.add("affiche-vide");
    el.style.background = couleurBloc(p);
  } else {
    el.classList.remove("affiche-vide");
    el.style.background = "";
    let img = el.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      img.decoding = "async"; img.draggable = false;
      img.onerror = () => { img.onerror = null; img.src = p.image; };
      el.appendChild(img);
    }
    img.src = imgSrc(p, lod);
  }
}

/* ── RAF ──────────────────────────────────────────────── */
function rafLoop(now) {
  const dt    = Math.min((now - lastFrame) / 16, 4);
  lastFrame   = now;

  if (!panning) {
    const k  = 1 - Math.pow(0.65, dt);
    const ds = (targetScale - scale) * k;
    const dx = (targetTx - tx) * k;
    const dy = (targetTy - ty) * k;

    if (Math.abs(ds) > 0.0001 || Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      scale += ds; tx += dx; ty += dy;
      applyTransform();
    }
  }

  if (now - lastCheck > 120) { updateVisible(); lastCheck = now; }
  requestAnimationFrame(rafLoop);
}

/* ── Événements canvas ────────────────────────────────── */
function onCanvasMouseDown(e) {
  const el = e.target.closest(".affiche");
  clickIndex = el ? parseInt(el.dataset.index) : -1;
  panMoved  = false;
  panning   = true;
  panStartX = e.clientX; panStartY = e.clientY;
  panTx0    = tx;        panTy0    = ty;
  document.getElementById("scene").classList.add("panning");
}

function onCanvasTouchStart(e) {
  if (e.touches.length === 2) {
    pinchDist0  = getDist(e.touches); pinchScale0 = targetScale;
    pinchTx0 = targetTx; pinchTy0 = targetTy;
    const mid = getMid(e.touches, document.getElementById("scene"));
    pinchMidX = mid.x; pinchMidY = mid.y;
    panning = false;
    return;
  }
  const el = e.target.closest(".affiche");
  clickIndex = el ? parseInt(el.dataset.index) : -1;
  panMoved  = false;
  panning   = true;
  panStartX = e.touches[0].clientX; panStartY = e.touches[0].clientY;
  panTx0    = tx; panTy0 = ty;
}

/* ── Mouse ────────────────────────────────────────────── */
const PAN_SPEED = 1.6;
function onMouseMove(e) {
  if (!panning) return;
  const dx = e.clientX - panStartX;
  const dy = e.clientY - panStartY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) panMoved = true;
  tx = targetTx = panTx0 + dx * PAN_SPEED;
  ty = targetTy = panTy0 + dy * PAN_SPEED;
  clampTarget(); tx = targetTx; ty = targetTy;
  applyTransform();
}

function onMouseUp(e) {
  if (panning) {
    panning = false;
    document.getElementById("scene").classList.remove("panning");
    if (!panMoved && clickIndex >= 0) ouvrirModal(clickIndex);
  }
}

/* ── Touch ────────────────────────────────────────────── */
function onTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const ns = Math.max(0.15, Math.min(4, pinchScale0 * (getDist(e.touches) / pinchDist0)));
    const mid = getMid(e.touches, document.getElementById("scene"));
    targetTx = mid.x - (pinchMidX - pinchTx0) * (ns / pinchScale0) - (pinchMidX - mid.x);
    targetTy = mid.y - (pinchMidY - pinchTy0) * (ns / pinchScale0) - (pinchMidY - mid.y);
    targetScale = ns;
    return;
  }
  if (panning && e.touches.length === 1) {
    e.preventDefault();
    const dx = e.touches[0].clientX - panStartX;
    const dy = e.touches[0].clientY - panStartY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) panMoved = true;
    tx = targetTx = panTx0 + dx * PAN_SPEED;
    ty = targetTy = panTy0 + dy * PAN_SPEED;
    clampTarget(); tx = targetTx; ty = targetTy;
    applyTransform();
  }
}

function onTouchEnd(e) {
  if (e.touches.length === 0) {
    if (panning) {
      panning = false;
      document.getElementById("scene").classList.remove("panning");
      if (!panMoved && clickIndex >= 0) ouvrirModal(clickIndex);
    }
  }
}

/* ── Zoom molette ─────────────────────────────────────── */
function onWheel(e) {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 0.9;
  const ns     = Math.max(0.15, Math.min(1.5, targetScale * factor));
  const rect   = document.getElementById("scene").getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  targetTx = mx - (mx - targetTx) * (ns / targetScale);
  targetTy = my - (my - targetTy) * (ns / targetScale);
  targetScale = ns;
  clampTarget();
  syncCurseur(ns);
}

function syncCurseur(ns) {
  const c = document.getElementById("curseur-zoom");
  if (c) c.value = Math.max(0.06, Math.min(1.5, ns));
}

function clampTarget() {
  // Freeform : navigation infinie (toroïdale), aucun bornage.
  if (!modeFrise) return;

  const scene   = document.getElementById("scene");
  const sw      = scene.clientWidth;
  const sh      = scene.clientHeight;
  const MARGIN  = 100;
  const scaledW = (frisePositions._totalW + 2000) * targetScale;
  const scaledH = (frisePositions._totalH + 2000) * targetScale;

  if (scaledW > sw) {
    targetTx = Math.max(sw - scaledW - MARGIN, Math.min(MARGIN, targetTx));
  }
  if (scaledH > sh) {
    targetTy = Math.max(sh - scaledH - MARGIN, Math.min(MARGIN, targetTy));
  }
}

function applyTransform() {
  // Le décalage offX/offY des pancartes est compensé ici pour garder
  // le même rendu visuel (screen = tx + worldX*scale).
  const txc = tx - offX * scale;
  const tyc = ty - offY * scale;
  document.getElementById("canvas").style.transform = `translate(${txc}px,${tyc}px) scale(${scale})`;
  if (modeFrise) {
    const labelPx = Math.round(18 / scale);
    const topPx   = frisePositions._originY - labelPx - Math.round(12 / scale);
    document.querySelectorAll(".frise-label").forEach(el => {
      el.style.fontSize = labelPx + "px";
      el.style.top      = topPx + "px";
    });
  }
}

/* ── Bascule frise ────────────────────────────────────── */
function basculerVue() {
  modeFrise = !modeFrise;
  const btn    = document.getElementById("btn-vue");
  const canvas = document.getElementById("canvas");
  canvas.querySelectorAll(".frise-label").forEach(el => el.remove());

  // Purger le rendu : les clés/positions diffèrent entre les deux modes
  // (le freeform est tuilé à l'infini), on reconstruit proprement.
  rendered.forEach(entry => { if (entry.el.parentNode) entry.el.parentNode.removeChild(entry.el); });
  rendered.clear();

  if (modeFrise) {
    btn.textContent = "freeform";
    // Frise = bornée, pas de décalage infini
    offX = 0; offY = 0;
    canvas.style.width  = (frisePositions._totalW + 2000) + "px";
    canvas.style.height = (frisePositions._totalH + 2000) + "px";
    pancartes.forEach((_, i) => { positions[i].x = frisePositions[i].x; positions[i].y = frisePositions[i].y; });

    frisePositions._years.forEach(year => {
      const label = document.createElement("div");
      label.className = "frise-label";
      label.textContent = year;
      label.style.left = frisePositions._startX[year] + "px";
      label.style.top  = (frisePositions._originY - 52) + "px";
      label.addEventListener("mousedown", e => e.stopPropagation());
      label.addEventListener("click", () => zoomerSurAnnee(year));
      canvas.appendChild(label);
    });

    // Vue libre de la frise : on cadre toute la hauteur et on se place au début,
    // pour pouvoir se déplacer librement à la souris (glisser) et cliquer sur les
    // pancartes — exactement comme en mode freeform.
    const scene = document.getElementById("scene");
    const fitH  = (scene.clientHeight * 0.85) / frisePositions._totalH;
    targetScale = Math.max(0.16, Math.min(fitH, 0.6));
    targetTx = 140 - frisePositions._startX[frisePositions._years[0]] * targetScale;
    targetTy = (scene.clientHeight - frisePositions._totalH * targetScale) / 2;
    syncCurseur(targetScale);
    anneeActive = frisePositions._years[0];
    mettreAJourNavAnnee();
    document.getElementById("dd-annee").style.display = "";
  } else {
    btn.textContent = "frise chronologique";
    // Freeform = navigation infinie : grande boîte centrée
    offX = OFF_TILES * CANVAS_W;
    offY = OFF_TILES * CANVAS_H;
    canvas.style.width  = (2 * OFF_TILES + 1) * CANVAS_W + "px";
    canvas.style.height = (2 * OFF_TILES + 1) * CANVAS_H + "px";
    pancartes.forEach((_, i) => { positions[i].x = freePositions[i].x; positions[i].y = freePositions[i].y; });
    const scene = document.getElementById("scene");
    targetScale = 0.18;
    targetTx = (scene.clientWidth  - CANVAS_W * targetScale) / 2;
    targetTy = (scene.clientHeight - CANVAS_H * targetScale) / 2;
    syncCurseur(0.18);
    document.getElementById("dd-annee").style.display = "none";
    anneeActive = null;
  }

  // Reconstruire immédiatement pour le nouveau mode
  scale = targetScale; tx = targetTx; ty = targetTy;
  applyTransform();
  lastSig = "";
  updateVisible();
}

/* ── Zoom sur une année ───────────────────────────────── */
let anneeActive = null;

function zoomerSurAnnee(year) {
  const scene  = document.getElementById("scene");
  const sx     = frisePositions._startX[year];
  const cols   = Math.ceil(frisePositions._groups[year].length / ROWS_FRISE);
  const yearW  = cols * (IMG_W + IMG_GAP);
  const yearH  = frisePositions._totalH - frisePositions._originY;
  const ns     = Math.min(
    (scene.clientWidth  * 0.88) / yearW,
    (scene.clientHeight * 0.82) / yearH,
    1.2
  );
  targetScale = Math.max(0.06, ns);
  targetTx = scene.clientWidth  / 2 - (sx + yearW / 2) * targetScale;
  targetTy = (scene.clientHeight - frisePositions._totalH * targetScale) / 2;
  syncCurseur(targetScale);
  anneeActive = year;
  mettreAJourNavAnnee();
}

function mettreAJourNavAnnee() {
  const dd    = document.getElementById("dd-annee");
  const btn   = document.getElementById("btn-annee-dd");
  const panel = document.getElementById("dd-annee-panel");
  if (!dd || !frisePositions._years) return;

  const years = frisePositions._years;
  btn.textContent = (anneeActive || years[0]) + " ▾";

  panel.innerHTML = "";
  years.forEach(year => {
    const opt = document.createElement("div");
    opt.className = "annee-option" + (year === anneeActive ? " actif" : "");
    opt.textContent = year;
    opt.setAttribute("role", "option");
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      zoomerSurAnnee(year);
      dd.classList.remove("ouvert");
      btn.setAttribute("aria-expanded", "false");
    });
    panel.appendChild(opt);
  });
}

/* ── Helpers ──────────────────────────────────────────── */
function getDist(t) { const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.sqrt(dx*dx+dy*dy); }
function getMid(t, el) { const r = el.getBoundingClientRect(); return { x: (t[0].clientX+t[1].clientX)/2-r.left, y: (t[0].clientY+t[1].clientY)/2-r.top }; }

/* ── Modal plein écran ────────────────────────────────── */
function ouvrirModal(index) {
  modalIndex = index;
  const overlay = document.getElementById("explore-modal");
  if (!overlay) return;

  afficherDansModal(index);

  overlay.classList.add("visible", "explore-plein-ecran");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("controles-bas").style.display = "none";
  const ddAnnee = document.getElementById("dd-annee");
  if (ddAnnee) ddAnnee.style.display = "none";
}

function afficherDansModal(index) {
  const overlay = document.getElementById("explore-modal");
  const p = pancartes[index];
  if (!p) return;

  const tvE = (v) => window.tradVille ? window.tradVille(v) : v;
  const tpE = (v) => window.tradPays  ? window.tradPays(v)  : v;
  const lieu = [p.ville ? tvE(p.ville) : null, p.pays ? tpE(p.pays) : null]
    .filter(Boolean).map(s => s.toLowerCase()).join(", ");

  overlay.innerHTML = `
    <button class="modal-fermer" aria-label="Fermer">✕ fermer</button>
    <div class="explore-plein-img">
      <img src="${p.image}" alt="${p.texte ? `pancarte : ${p.texte}` : `pancarte ${p.id}`}"/>
    </div>
    <div class="explore-plein-meta">
      ${p.texte ? `<span class="explore-plein-texte">${p.texte.toLowerCase()}</span>` : ""}
      ${lieu || p.annee ? `<span class="explore-plein-lieu">${[lieu, p.annee].filter(Boolean).join(" · ")}</span>` : ""}
    </div>
    <button class="explore-nav explore-nav-prev" aria-label="Précédent">←</button>
    <button class="explore-nav explore-nav-next" aria-label="Suivant">→</button>`;

  overlay.querySelector(".modal-fermer").addEventListener("click", fermerModal);
  overlay.querySelector(".explore-nav-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    const prev = (modalIndex - 1 + pancartes.length) % pancartes.length;
    modalIndex = prev;
    afficherDansModal(prev);
  });
  overlay.querySelector(".explore-nav-next").addEventListener("click", (e) => {
    e.stopPropagation();
    const next = (modalIndex + 1) % pancartes.length;
    modalIndex = next;
    afficherDansModal(next);
  });
  overlay.querySelector(".modal-fermer").focus();
}

function fermerModal() {
  const overlay = document.getElementById("explore-modal");
  if (!overlay) return;
  overlay.classList.remove("visible", "explore-plein-ecran");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.getElementById("controles-bas").style.display = "";
  if (modeFrise) {
    const ddAnnee = document.getElementById("dd-annee");
    if (ddAnnee) ddAnnee.style.display = "";
  }
  modalIndex = -1;
}

document.addEventListener("DOMContentLoaded", init);
