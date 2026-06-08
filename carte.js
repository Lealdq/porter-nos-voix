"use strict";

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

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  // Placer les marqueurs
  Object.entries(parVille).forEach(([key, groupe]) => {
    const coords = COORDS[key];
    if (!coords) { console.warn("Coordonnées manquantes :", key); return; }

    const n = groupe.pancartes.length;
    const size = Math.max(32, Math.min(56, 28 + Math.log(n) * 8));

    const icon = L.divIcon({
      className: "",
      html: `<div class="marqueur-ville" style="width:${size}px;height:${size}px">${n}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
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
