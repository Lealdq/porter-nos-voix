"use strict";

// Formes de pancartes personnalisées (exportées depuis Illustrator)
const ICONES = [
  { vb: "0 0 65 65.24",   d: "M55.24,61.81c-.1,1-1.91,2.73-2.91,2.77l-10.17.41-8.68.02-16.12.22c-2.53.03-5.01.13-6.41-2.56l.12-4.68.13-5.95c-4.34-1.04-7.13,1.3-10.68.44-.87-4.03-.37-7.76-.39-11.75l-.04-7.8L0,17.51c-.02-3.29.19-6.25.52-9.54C.7,6.19-.53.76,1.96.21c.76-.17,2.17.03,2.94.02l7.6-.11,11.09.07,5.8-.05,34.54-.13c.89,3.48.67,6.83.73,10.46l.3,21.62c.04,2.68.07,5.2,0,7.85l-.25,9.41-3.64.45-5.15.55-.44,4.06c-.25,2.32,0,4.87-.25,7.41Z" },
  { vb: "0 0 56.19 39.44", d: "M38.48,39.44l-15.68-.05c-3.58-.01-6.13-1.1-9.18-1.48l-5.51-.7-8.12-2.4V3.82S8.59.99,8.59.99c2.04-.67,5.37.28,7.31-.51,1.66-.67,2.19-.44,3.81-.41l17.87.32,8.53.61c3.13.22,6.55,1.95,9.77,2.71l.3,11.64-.06,19.04-4.75,1.64c-8.39,2.89-12.27-.11-12.9,3.43Z" },
  { vb: "0 0 57.25 45.21", d: "M34.6,44.84l-6.44.37-4.55-.05-15.93-.15c-2.32-.02-4.41-.1-6.66-.52l-1.02-4.19L.1,12.38c0-.54.32-1.8.75-1.99l1.98-.89c1.53-.69-.31-5.45,1.08-9.29l10.28.47,14.84-.18c1.46-1.16,3.19.05,4.6.06l23.54.14.09,39.1c0,1.65-.25,2.86-.65,4.56-3.47.61-6.45.86-9.94.54l-3.81-.36-8.25.29Z" },
  { vb: "0 0 80.81 56.8",  d: "M43.06,56.46l-5.04.08-12.42.08-1.29-2.9-7.26.02-.48,2.78-15.83.06C.4,52.91-.02,49.8.04,46.47l.26-15.4-.1-5.95L0,5.49C-.01,3.77.02,1.96,1.06.61c4.88-.18,9.78-.53,14.48.23l5.3.85c2,.32,3.67.18,5.48-.77,1.4-.74,2.93-.78,4.47-.82,6.45-.15,12.5-.11,19.05.18l4.83-.29c1.05,1.14,1.68,1.3,3.14,1.39l5.66.38c.77-.71,2.09-1.61,3.22-1.58l12.36.27c1.22.03,1.63,2.02,1.63,3.17l.13,46.09c0,2.36-.62,4.77-1.79,6.58l-6.13.5-7.71-.29-1.24-2.66-6.94.04-2.44,2.65-11.48-.09Z" },
  { vb: "0 0 60.36 40.62", d: "M56.57,40.56c-1.57.11-4.05.07-5.24-.32-1.8-1.36-3.33-1.76-5.64-1.64-5.11.27-10.14-.26-15.21-.25h-5s-14.84.09-14.84.09l-9.71.06c-.53-1.59-.85-3.32-.89-5.14C-.13,23.41.11,13.8,1.07,3.93l.38-3.93,9.34.52c6.11.34,12.17-.28,18.26-.09,7.63.23,14.93.16,22.5-.14,2.34-.09,4.21.02,6.55.89.2,1.81-.6,4.51-.32,6.06l2.57,11.06-4.02,1.07.24,21.19Z" },
  { vb: "0 0 70.05 48.23", d: "M67.99,42.57c-.29.57-.88,1.77-1.31,2.19l-2.87,2.79-2.88.41-3.51.28-38.53-.1-12.46-.06c-.57,0-1.38.12-1.85-.09-.4-.18-.58-1.12-.64-1.65-.13-1.22-.76-1.83-1.38-2.78C.12,39.72,0,34.3.95,29.81c2.51-3.55,2.66-7.72-.75-10.74l-.1-4.4c-.05-2.28-.2-4.32-.01-6.6l.45-5.55C.7.55,2.53-.07,4.19.03,9.34.35,14.34-.04,19.5,0l5.29.05,13.56.04,21.73.02,7.63.07c1.66.01,2.7,3.02,2.23,4.42-.81,2.38-.72,4.28-.76,6.66l-.07,4.29-.39,3.38c-.82.8-1.33,1.46-1.73,2.41-1.5,3.55-.6,5.99,1.04,9.26,1.07,2.13.82,4.56.58,6.87-.17,1.66.22,3.45-.61,5.09Z" },
];

const COORDS = {
  "paris":        [48.8566,  2.3522],
  "marseille":    [43.2965,  5.3698],
  "nantes":       [47.2184, -1.5536],
  "bruxelles":    [50.8503,  4.3517],
  "lyon":         [45.7640,  4.8357],
  "bordeaux":     [44.8378, -0.5792],
  "lille":        [50.6292,  3.0573],
  "toulouse":     [43.6047,  1.4442],
  "strasbourg":   [48.5734,  7.7521],
  "montpellier":  [43.6108,  3.8767],
  "rennes":       [48.1173, -1.6778],
  "grenoble":     [45.1885,  5.7245],
  "genève":       [46.2044,  6.1432],
  "geneve":       [46.2044,  6.1432],
  "lausanne":     [46.5197,  6.6323],
  "zurich":       [47.3769,  8.5417],
  "berne":        [46.9480,  7.4474],
  "montreal":     [45.5017, -73.5673],
  "london":       [51.5074, -0.1278],
  "berlin":       [52.5200, 13.4050],
  "madrid":       [40.4168, -3.7038],
  "barcelona":    [41.3851,  2.1734],
  "rome":         [41.9028, 12.4964],
  "amsterdam":    [52.3676,  4.9041],
  "mexico":       [19.4326, -99.1332],
  "buenos aires": [-34.6037, -58.3816],
  "new york":     [40.7128, -74.0060],
  "jakarta":      [-6.2088, 106.8456],
};

let map, panneauOuvert = null, groupeModal = null, indexModal = -1;
let coucheTuiles = null;

const TUILES = {
  fr: {
    url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap France</a>',
  },
  en: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
  },
};

function appliquerTuilesLangue() {
  if (!map) return;
  const lang = (window.getLang && window.getLang()) === "en" ? "en" : "fr";
  const t = TUILES[lang];
  if (coucheTuiles) map.removeLayer(coucheTuiles);
  coucheTuiles = L.tileLayer(t.url, { attribution: t.attribution, maxZoom: 19 }).addTo(map);
  document.body.classList.toggle("carte-fr", lang === "fr");
}

async function init() {
  // Charger les données
  const resp = await fetch("data/pancartes.json?v=" + Date.now());
  const pancartes = await resp.json();

  // Grouper par ville
  const parVille = {};
  pancartes.forEach((p) => {
    if (!p.ville) return;
    const key = p.ville.toLowerCase();
    if (!parVille[key]) parVille[key] = { ville: p.ville, pays: p.pays || "", pancartes: [] };
    parVille[key].pancartes.push(p);
  });

  // Initialiser la carte
  map = L.map("map", {
    center: [47, 5],
    zoom: 5,
    zoomControl: false,
  });

  // Tuiles selon la langue : français (OSM France) / anglais (CARTO light)
  appliquerTuilesLangue();
  document.addEventListener("langchange", appliquerTuilesLangue);

  // Placer les marqueurs
  Object.entries(parVille).forEach(([key, groupe]) => {
    const coords = COORDS[key];
    if (!coords) { console.warn("Coordonnées manquantes :", key); return; }

    const n      = groupe.pancartes.length;
    const target = Math.max(36, Math.min(60, 28 + Math.log(n) * 8));
    // Choisir une forme selon la ville (stable, pas aléatoire)
    const icone  = ICONES[Object.keys(parVille).indexOf(key) % ICONES.length];
    const vbNums = icone.vb.split(" ").map(Number);
    const vbW = vbNums[2], vbH = vbNums[3];
    const scale  = target / Math.max(vbW, vbH);
    const w  = Math.round(vbW * scale);
    const h  = Math.round(vbH * scale);
    const cx = vbW / 2;
    const cy = vbH / 2;
    const fs = Math.max(7, Math.round(vbW * 0.22));

    const icon = L.divIcon({
      className: "",
      html: `<svg class="marqueur-ville" xmlns="http://www.w3.org/2000/svg"
        width="${w}" height="${h}" viewBox="${icone.vb}">
        <path d="${icone.d}"/>
        <text x="${cx}" y="${cy}"
          text-anchor="middle" dominant-baseline="central"
          fill="#e2f2fb" font-size="${fs}"
          font-family="'CMM Coda',Helvetica,sans-serif"
          font-weight="700">${n}</text>
      </svg>`,
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2],
    });

    const marker = L.marker(coords, { icon }).addTo(map);
    marker.on("click", () => {
      if (panneauOuvert === groupe) { fermerPanneau(); }
      else { ouvrirPanneau(groupe); }
    });
  });

  // Fermer panneau
  document.getElementById("panneau-fermer").addEventListener("click", fermerPanneau);

  // Clic sur la carte = fermer le panneau
  map.on("click", () => {
    if (panneauOuvert) fermerPanneau();
  });

  // Menu déroulant de zoom
  const VUES = {
    monde:    { center: [20, 10],     zoom: 2, label: "Monde" },
    france:   { center: [46.5, 2.5],  zoom: 6, label: "France" },
    belgique: { center: [50.5, 4.5],  zoom: 8, label: "Belgique" },
    suisse:   { center: [46.8, 8.2],  zoom: 8, label: "Suisse" },
    espagne:  { center: [40.4, -3.7], zoom: 6, label: "Espagne" },
    indonesie: { center: [-6.2, 106.8], zoom: 10, label: "Indonésie" },
  };

  const ddZoom  = document.getElementById("dd-zoom");
  const btnZoom = document.getElementById("btn-zoom");

  btnZoom.addEventListener("click", (e) => {
    e.stopPropagation();
    ddZoom.classList.toggle("ouvert");
    btnZoom.setAttribute("aria-expanded", ddZoom.classList.contains("ouvert"));
  });

  document.querySelectorAll(".zoom-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const vue = VUES[opt.dataset.zone];
      if (!vue) return;
      map.flyTo(vue.center, vue.zoom, { duration: 0.8 });
      btnZoom.textContent = vue.label + " ▾";
      ddZoom.classList.remove("ouvert");
      btnZoom.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", () => {
    ddZoom.classList.remove("ouvert");
    btnZoom.setAttribute("aria-expanded", "false");
  });
}

function ouvrirPanneau(groupe) {
  const panneau = document.getElementById("panneau");
  const titre   = document.getElementById("panneau-titre");
  const grille  = document.getElementById("panneau-grille");

  const tv = (v) => window.tradVille ? window.tradVille(v) : v;
  const tp = (v) => window.tradPays  ? window.tradPays(v)  : v;
  const lieu = [groupe.ville ? tv(groupe.ville) : null, groupe.pays ? tp(groupe.pays) : null].filter(Boolean).map(s => s.toLowerCase()).join(", ");
  titre.textContent = `${lieu} — ${groupe.pancartes.length} pancarte${groupe.pancartes.length > 1 ? "s" : ""}`;

  grille.innerHTML = "";
  groupe.pancartes.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "panneau-carte";
    div.setAttribute("role", "button");
    div.setAttribute("tabindex", "0");
    const nomFichier = p.image.split("/").pop();
    div.innerHTML = `
      <div class="vignette-wrap">
        <img src="${p.image}" alt="${p.texte ? `pancarte : ${p.texte}` : `pancarte ${p.id}`}" loading="lazy">
        <a class="btn-telecharger-vignette" href="${p.image}" download="${nomFichier}"
          aria-label="Télécharger" title="télécharger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v13M7 11l5 5 5-5"/><line x1="4" y1="20" x2="20" y2="20"/>
          </svg>
        </a>
      </div>
      ${p.texte ? `<p class="panneau-carte-texte">${p.texte.toLowerCase()}</p>` : ""}
    `;
    div.querySelector(".btn-telecharger-vignette").addEventListener("click", (e) => e.stopPropagation());
    div.addEventListener("click", () => ouvrirModal(groupe, i));
    div.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ouvrirModal(groupe, i); }
    });
    grille.appendChild(div);
  });

  panneau.classList.add("visible");
  panneauOuvert = groupe;
  const ls = document.querySelector(".lang-switch");
  if (ls) ls.style.visibility = "hidden";
  // Sur mobile : cacher le menu zoom pour ne pas le voir par-dessus le panneau
  const zc = document.getElementById("zoom-controls");
  if (zc && window.innerWidth <= 768) zc.style.display = "none";
}

function fermerPanneau() {
  document.getElementById("panneau").classList.remove("visible");
  panneauOuvert = null;
  const ls = document.querySelector(".lang-switch");
  if (ls) ls.style.visibility = "";
  // Réafficher le menu zoom (mobile)
  const zc = document.getElementById("zoom-controls");
  if (zc) zc.style.display = "";
}

function ouvrirModal(groupe, index) {
  groupeModal = groupe;
  indexModal  = index;
  const overlay = document.getElementById("carte-modal");
  if (!overlay) return;

  const tvC = (v) => window.tradVille ? window.tradVille(v) : v;
  const tpC = (v) => window.tradPays  ? window.tradPays(v)  : v;

  overlay.innerHTML = `
    <button class="modal-fermer" aria-label="Fermer">✕ fermer</button>
    <div class="modal-scroll-liste" id="carte-modal-scroll">
      ${groupe.pancartes.map((p, i) => {
        const lieu = [p.ville ? tvC(p.ville) : null, p.pays ? tpC(p.pays) : null].filter(Boolean).map(s => s.toLowerCase()).join(", ");
        const themes = (p.themes || []).map(t => `<span class="badge badge-theme">${t}</span>`).join("");
        return `
        <div class="modal-item" data-index="${i}" id="carte-modal-item-${i}">
          <div class="modal-image-wrap">
            <img src="${p.image}" alt="${p.texte ? `pancarte : ${p.texte}` : `pancarte ${p.id}`}" loading="lazy"/>
          </div>
          <div class="modal-infos">
            ${p.texte ? `<p class="modal-texte-pancarte">${p.texte.toLowerCase()}</p>` : ""}
            <div class="modal-badges-row">
              <div class="modal-badges">
                <span class="badge badge-annee">${p.annee}</span>
                ${lieu ? `<span class="badge badge-ville">${lieu}</span>` : ""}
                ${themes}
              </div>
              <a class="modal-btn-telecharger" href="${p.image}" download="${p.image.split("/").pop()}" aria-label="Télécharger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3v13M7 11l5 5 5-5"/><line x1="4" y1="20" x2="20" y2="20"/>
                </svg>
              </a>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>`;

  overlay.classList.add("visible");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const target = overlay.querySelector(`#carte-modal-item-${index}`);
  if (target) {
    setTimeout(() => target.scrollIntoView({ behavior: "instant", block: "start" }), 0);
  }

  overlay.querySelector(".modal-fermer").addEventListener("click", fermerModal);
  overlay.querySelectorAll(".modal-image-wrap img").forEach(img => {
    img.addEventListener("click", fermerModal);
  });
  overlay.querySelector(".modal-fermer").focus();
}

function fermerModal() {
  const overlay = document.getElementById("carte-modal");
  if (!overlay) return;
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  groupeModal = null;
  indexModal  = -1;
}

document.addEventListener("DOMContentLoaded", () => {
  init();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerModal();
  });

  document.getElementById("carte-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("carte-modal")) fermerModal();
  });
});
