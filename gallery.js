/* ============================================================
   gallery.js — galerie avec sections par année + scroll
   ============================================================ */

"use strict";

const COULEUR_ORDER = ["rouge","jaune","vert","bleu","violet","rose","noir"];

const etat = {
  pancartes: [],
  filtrees: [],
  filtres: {
    annee: [],
    ville: [],
    pays: [],
    langue: [],
    categorie: [],
    couleur: [],
    recherche: "",
  },
  indexModal: -1,
};

async function initialiser() {
  await chargerDonnees();
  // Pré-remplir filtres / recherche depuis l'URL — ex. depuis la page chiffres
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) etat.filtres.recherche = q;
  ["annee", "ville", "pays", "langue", "categorie", "couleur"].forEach(cle => {
    const v = params.get(cle);
    if (v) etat.filtres[cle] = [v];
  });

  construireFiltres();

  // Refléter l'état des filtres pré-remplis dans les menus déroulants
  ["annee", "ville", "pays", "langue", "categorie", "couleur"].forEach(cle => {
    if (!etat.filtres[cle].length) return;
    const dd = document.querySelector(`.filtre-dropdown[data-cle="${cle}"]`);
    if (!dd) return;
    etat.filtres[cle].forEach(val => {
      const opt = dd.querySelector(`.dd-option[data-val="${(window.CSS && CSS.escape) ? CSS.escape(val) : val}"]`);
      if (opt) opt.classList.add("selectionne");
    });
    const btn = dd.querySelector(".dd-btn");
    if (btn && typeof mettreAJourBoutonDropdown === "function") mettreAJourBoutonDropdown(cle, btn);
  });

  appliquerFiltres();
  brancherEvenements();
  if (q) {
    const champ = document.getElementById("champ-recherche");
    if (champ) champ.value = q;
  }
}

async function chargerDonnees() {
  try {
    const reponse = await fetch("data/pancartes.json?v=" + Date.now());
    if (!reponse.ok) throw new Error("Impossible de charger les données.");
    etat.pancartes = await reponse.json();
  } catch (err) {
    console.error("Erreur chargement :", err);
    afficherMessage("impossible de charger les pancartes. vérifiez que le serveur local est lancé.");
  }
}

function construireFiltres() {
  const annees     = [...new Set(etat.pancartes.map((p) => p.annee))].sort((a, b) => b - a);
  const villes     = [...new Set(etat.pancartes.map((p) => p.ville))].filter(Boolean).sort();
  const pays       = [...new Set(etat.pancartes.map((p) => p.pays))].filter(Boolean).sort();
  const langues    = [...new Set(etat.pancartes.map((p) => p.langue))].filter(Boolean).sort();
  const categories = [...new Set(etat.pancartes.map((p) => p.categorie))].filter(Boolean).sort();
  const couleurs   = COULEUR_ORDER.filter(c => etat.pancartes.some(p => p.couleur === c));

  peuplerDropdown("dd-annee",     annees,     "annee");
  peuplerDropdown("dd-ville",     villes,     "ville");
  peuplerDropdown("dd-pays",      pays,       "pays");
  peuplerDropdown("dd-langue",    langues,    "langue");
  peuplerDropdown("dd-categorie", categories, "categorie");
  peuplerDropdown("dd-couleur",   couleurs,   "couleur");

  if (!villes.length)   document.getElementById("dd-ville").style.display   = "none";
  if (!pays.length)     document.getElementById("dd-pays").style.display    = "none";
  if (!langues.length)  document.getElementById("dd-langue").style.display  = "none";
  if (!couleurs.length) document.getElementById("dd-couleur").style.display = "none";
}

function peuplerDropdown(ddId, valeurs, cle) {
  const dd = document.getElementById(ddId);
  if (!dd) return;
  const panel = dd.querySelector(".dd-panel");
  const btn   = dd.querySelector(".dd-btn");

  valeurs.forEach((val) => {
    const opt = document.createElement("div");
    opt.className   = "dd-option";
    opt.dataset.val = val;
    opt.setAttribute("role", "option");

    // Point coloré pour le filtre couleur
    const dot = (cle === "couleur") ? `<span class="couleur-dot couleur-dot--${val}"></span>` : "";
    const tv0 = (v) => window.tradVille ? window.tradVille(v) : v;
    const tp0 = (v) => window.tradPays  ? window.tradPays(v)  : v;
    const displayVal = cle === "ville" ? tv0(String(val))
                     : cle === "pays"  ? tp0(String(val))
                     : String(val).toLowerCase();
    opt.innerHTML = `${dot}<span class="dd-option-label">${displayVal}</span><span class="dd-check">✓</span>`;

    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleOption(cle, val, opt, btn);
    });
    panel.appendChild(opt);
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const ouvert = dd.classList.contains("ouvert");
    fermerTousDropdowns();
    if (!ouvert) dd.classList.add("ouvert");
    btn.setAttribute("aria-expanded", !ouvert);
  });
}

function toggleOption(cle, val, opt, btn) {
  const sel    = etat.filtres[cle];
  const valStr = String(val);
  const idx    = sel.indexOf(valStr);
  if (idx === -1) sel.push(valStr);
  else            sel.splice(idx, 1);
  opt.classList.toggle("selectionne", idx === -1);
  mettreAJourBoutonDropdown(cle, btn);
  appliquerFiltres();
}

function mettreAJourBoutonDropdown(cle, btn) {
  const labels = { annee: "année", ville: "ville", pays: "pays", langue: "langue", categorie: "catégorie", couleur: "couleur" };
  const sel = etat.filtres[cle];
  if (!sel.length) {
    btn.textContent = labels[cle];
    btn.classList.remove("actif");
  } else {
    btn.textContent = `${labels[cle]} (${sel.length})`;
    btn.classList.add("actif");
  }
}

function fermerTousDropdowns() {
  document.querySelectorAll(".filtre-dropdown.ouvert").forEach((d) => {
    d.classList.remove("ouvert");
    d.querySelector(".dd-btn").setAttribute("aria-expanded", "false");
  });
}

// Supprime les accents et met en minuscules
function normaliser(str) {
  return (str || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
// Retire le 's' final pour gérer les pluriels simples
function stem(mot) { return mot.replace(/s$/, ""); }

function rechercheTolerante(terme, haystack) {
  const t = normaliser(terme);
  const h = normaliser(haystack);
  if (h.includes(t)) return true;                          // correspondance directe
  const ts = stem(t);
  if (ts.length < 3) return false;
  return h.split(/\s+/).some(m => stem(m) === ts || stem(m).startsWith(ts));
}

function appliquerFiltres() {
  const { annee, ville, pays, langue, categorie, couleur, recherche } = etat.filtres;
  const terme = recherche.trim();

  etat.filtrees = etat.pancartes.filter((p) => {
    if (annee.length     && !annee.includes(String(p.annee)))  return false;
    if (ville.length     && !ville.includes(p.ville))          return false;
    if (pays.length      && !pays.includes(p.pays))            return false;
    if (langue.length    && !langue.includes(p.langue))        return false;
    if (categorie.length && !categorie.includes(p.categorie))  return false;
    if (couleur.length   && !couleur.includes(p.couleur))      return false;
    if (terme) {
      const haystack = [p.texte, p.ville, p.pays, p.description, p.categorie, p.sous_categorie, ...(p.themes || [])].join(" ");
      if (!rechercheTolerante(terme, haystack)) return false;
    }
    return true;
  });

  afficherGalerie();
  mettreAJourCompteur(etat.filtrees.length);
  mettreAJourBtnEffacer();
  mettreAJourFiltresActifs();
  document.dispatchEvent(new Event('galerie-chargee'));
}

function afficherGalerie() {
  const galerie = document.getElementById("galerie-grille");
  if (!galerie) return;
  galerie.innerHTML = "";

  if (etat.filtrees.length === 0) {
    galerie.innerHTML = `
      <div class="vide-message" role="status" aria-live="polite">
        <h3>aucun résultat</h3>
        <p>essayez d'autres filtres ou termes de recherche.</p>
      </div>`;
    return;
  }

  const avecIndex = etat.filtrees.map((p, i) => ({ p, index: i })).reverse();
  const parAnnee  = {};
  avecIndex.forEach(({ p, index }) => {
    if (!parAnnee[p.annee]) parAnnee[p.annee] = [];
    parAnnee[p.annee].push({ p, index });
  });

  const anneesTriees = Object.keys(parAnnee).sort((a, b) => b - a);
  const isMobile = window.innerWidth <= 600;
  const nbCol = isMobile ? 2 : (document.querySelector(".col-num-actif")?.dataset.col || document.getElementById("curseur-col")?.value || 6);

  anneesTriees.forEach((annee) => {
    const section = document.createElement("section");
    section.className = "annee-section";
    section.id = `annee-${annee}`;

    const titre = document.createElement("h2");
    titre.className = "annee-titre";
    titre.textContent = annee;
    section.appendChild(titre);

    const grille = document.createElement("div");
    grille.className = "annee-grille";
    grille.setAttribute("role", "list");
    grille.style.gridTemplateColumns = `repeat(${nbCol}, 1fr)`;

    parAnnee[annee].forEach(({ p, index }) => {
      grille.appendChild(creerCartePancarte(p, index));
    });

    section.appendChild(grille);
    galerie.appendChild(section);
  });
}

function creerCartePancarte(p, index) {
  const article = document.createElement("article");
  article.className = "carte-pancarte";
  article.setAttribute("role", "button");
  article.setAttribute("tabindex", "0");
  article.setAttribute("aria-label", p.texte ? `voir la pancarte : ${p.texte}` : `pancarte ${p.id}`);

  const tv = (v) => window.tradVille ? window.tradVille(v) : v;
  const villeBadge        = p.ville       ? `<span class="badge badge-ville" data-ville-raw="${p.ville}">${tv(p.ville)}</span>` : "";
  const texteLine         = p.texte       ? `<p class="carte-texte">${p.texte.toLowerCase()}</p>` : "";
  const nomFichier = p.image.split("/").pop();

  article.innerHTML = `
    <img class="carte-image" src="${p.image}"
      alt="${p.texte ? `pancarte : ${p.texte}` : `pancarte ${p.id}`}" />
    <div class="carte-corps">
      ${texteLine}
      <div class="carte-meta-row">
        <div class="carte-meta">
          <span class="badge badge-annee">${p.annee}</span>
          ${villeBadge}
        </div>
        <a class="carte-btn-telecharger" href="${p.image}" download="${nomFichier}"
          aria-label="Télécharger" title="télécharger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v13M7 11l5 5 5-5"/><line x1="4" y1="20" x2="20" y2="20"/>
          </svg>
        </a>
      </div>
    </div>`;

  // Fondu à l'apparition une fois l'image chargée
  const img = article.querySelector(".carte-image");
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add("chargee");
  } else {
    img.addEventListener("load", () => img.classList.add("chargee"), { once: true });
    img.addEventListener("error", () => img.classList.add("chargee"), { once: true });
  }

  article.querySelector(".carte-btn-telecharger").addEventListener("click", (e) => { e.stopPropagation(); });
  article.addEventListener("click", () => ouvrirModal(index));
  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ouvrirModal(index); }
  });

  return article;
}

function ouvrirModal(index) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const total = etat.filtrees.length;
  // Même ordre que la galerie : inverser comme afficherGalerie()
  const ordreGalerie = [...etat.filtrees.map((p, i) => ({ p, i }))].reverse();

  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <button class="modal-fermer" aria-label="Fermer">✕ fermer</button>
    <div class="modal-scroll-liste" id="modal-scroll-liste">
      ${ordreGalerie.map(({ p, i }) => {
        const tv = (v) => window.tradVille ? window.tradVille(v) : v;
        const tp = (v) => window.tradPays  ? window.tradPays(v)  : v;
        const lieu = [p.ville ? tv(p.ville) : null, p.pays ? tp(p.pays) : null].filter(Boolean).map(s => s.toLowerCase()).join(", ");
        const themes = (p.themes || []).map(t => `<span class="badge badge-theme">${t}</span>`).join("");
        return `
        <div class="modal-item" data-index="${i}" id="modal-item-${i}">
          <div class="modal-image-wrap">
            <img src="${p.image}" alt="${p.texte ? `pancarte : ${p.texte}` : `pancarte ${p.id}`}" />
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

  // Scroll jusqu'à la pancarte cliquée
  const target = overlay.querySelector(`#modal-item-${index}`);
  if (target) {
    setTimeout(() => target.scrollIntoView({ behavior: "instant", block: "start" }), 0);
  }

  overlay.querySelector(".modal-fermer").addEventListener("click", fermerModal);
  // Clic sur image = fermer
  overlay.querySelectorAll(".modal-image-wrap img").forEach(img => {
    img.addEventListener("click", fermerModal);
  });
  overlay.querySelector(".modal-fermer").focus();
}

function fermerModal() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  etat.indexModal = -1;
}

function mettreAJourCompteur(n) {
  const el = document.getElementById("resultats-count");
  if (el) el.textContent = `${n} pancarte${n !== 1 ? "s" : ""}`;
  const count = document.getElementById("pancartes-count");
  if (count) count.textContent = `${n} pancarte${n !== 1 ? "s" : ""}`;
}

function appliquerColonnes(n) {
  const cols = window.innerWidth <= 600 ? 2 : n;
  document.querySelectorAll(".annee-grille").forEach((g) => {
    g.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  });
}

function aFiltresActifs() {
  const { annee, ville, pays, langue, categorie, couleur, recherche } = etat.filtres;
  return annee.length || ville.length || pays.length || langue.length || categorie.length || couleur.length || recherche;
}

const LABELS_FILTRES = { annee: "année", ville: "ville", pays: "pays", langue: "langue", categorie: "catégorie", couleur: "couleur" };

function mettreAJourFiltresActifs() {
  const bar = document.getElementById("filtres-actifs-bar");
  if (!bar) return;
  const chips = [];
  ["annee","ville","pays","langue","categorie","couleur"].forEach(cle => {
    etat.filtres[cle].forEach(val => {
      const tv = (v) => window.tradVille ? window.tradVille(v) : v;
      const tp = (v) => window.tradPays  ? window.tradPays(v)  : v;
      const label = cle === "ville" ? tv(String(val))
                  : cle === "pays"  ? tp(String(val))
                  : String(val).toLowerCase();
      chips.push(`<button class="filtre-actif-tag" data-cle="${cle}" data-val="${val}">${label} <span class="tag-close">✕</span></button>`);
    });
  });
  if (etat.filtres.recherche) {
    chips.push(`<button class="filtre-actif-tag" data-cle="recherche" data-val="">${etat.filtres.recherche} <span class="tag-close">✕</span></button>`);
  }
  bar.hidden = chips.length === 0;
  bar.innerHTML = chips.join("");
  bar.querySelectorAll(".filtre-actif-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      const cle = tag.dataset.cle;
      const val = tag.dataset.val;
      if (cle === "recherche") {
        etat.filtres.recherche = "";
        const champ = document.getElementById("champ-recherche");
        if (champ) champ.value = "";
        document.querySelectorAll(".mot-cle-chip").forEach(c => c.classList.remove("actif"));
      } else {
        const idx = etat.filtres[cle].indexOf(val);
        if (idx !== -1) etat.filtres[cle].splice(idx, 1);
        const dd = document.querySelector(`.filtre-dropdown[data-cle="${cle}"]`);
        if (dd) {
          const opt = dd.querySelector(`.dd-option[data-val="${val}"]`);
          if (opt) opt.classList.remove("selectionne");
          mettreAJourBoutonDropdown(cle, dd.querySelector(".dd-btn"));
        }
      }
      appliquerFiltres();
    });
  });
}

function mettreAJourBtnEffacer() {
  const btn = document.getElementById("btn-effacer");
  if (!btn) return;
  btn.hidden = !aFiltresActifs();
}

function effacerTout() {
  ["annee","ville","pays","langue","categorie","couleur"].forEach(cle => {
    etat.filtres[cle] = [];
    const dd = document.querySelector(`.filtre-dropdown[data-cle="${cle}"]`);
    if (!dd) return;
    dd.querySelectorAll(".dd-option.selectionne").forEach(opt => opt.classList.remove("selectionne"));
    mettreAJourBoutonDropdown(cle, dd.querySelector(".dd-btn"));
  });
  etat.filtres.recherche = "";
  const champ = document.getElementById("champ-recherche");
  if (champ) champ.value = "";
  document.querySelectorAll(".mot-cle-chip").forEach(c => c.classList.remove("actif"));
  appliquerFiltres();
}

function brancherEvenements() {
  // Sélecteur de colonnes par chiffres
  document.querySelectorAll(".col-num").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".col-num").forEach(b => b.classList.remove("col-num-actif"));
      btn.classList.add("col-num-actif");
      appliquerColonnes(btn.dataset.col);
    });
  });

  const curseur = document.getElementById("curseur-col");
  if (curseur) {
    curseur.addEventListener("input", () => appliquerColonnes(curseur.value));
  }

  const champRecherche = document.getElementById("champ-recherche");
  const strip = document.querySelector(".mots-cles-strip");
  if (champRecherche) {
    let delai;
    champRecherche.addEventListener("input", (e) => {
      clearTimeout(delai);
      delai = setTimeout(() => {
        etat.filtres.recherche = e.target.value;
        syncChips(e.target.value);
        appliquerFiltres();
      }, 250);
    });
    champRecherche.addEventListener("focus", () => strip?.classList.add("visible"));
    champRecherche.addEventListener("blur", () => {
      // Délai pour laisser le clic sur un chip s'exécuter d'abord
      setTimeout(() => strip?.classList.remove("visible"), 150);
    });
  }

  document.querySelectorAll(".mot-cle-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const mot = chip.dataset.mot;
      const champ = document.getElementById("champ-recherche");
      const dejàActif = chip.classList.contains("actif");
      // Désactiver tous les chips
      document.querySelectorAll(".mot-cle-chip").forEach(c => c.classList.remove("actif"));
      if (dejàActif) {
        // Deuxième clic : vider la recherche
        if (champ) champ.value = "";
        etat.filtres.recherche = "";
      } else {
        chip.classList.add("actif");
        if (champ) champ.value = mot;
        etat.filtres.recherche = mot;
      }
      appliquerFiltres();
    });
  });

  function syncChips(valeur) {
    document.querySelectorAll(".mot-cle-chip").forEach(chip => {
      chip.classList.toggle("actif", chip.dataset.mot === valeur.trim().toLowerCase());
    });
  }

  const btnEffacer = document.getElementById("btn-effacer");
  if (btnEffacer) btnEffacer.addEventListener("click", effacerTout);

  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => { if (e.target === overlay) fermerModal(); });
  }

  document.addEventListener("click", () => fermerTousDropdowns());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { fermerTousDropdowns(); fermerModal(); }
    if (etat.indexModal >= 0) {
      if (e.key === "ArrowLeft"  && etat.indexModal > 0)                          { etat.indexModal--; renderModal(); }
      if (e.key === "ArrowRight" && etat.indexModal < etat.filtrees.length - 1)   { etat.indexModal++; renderModal(); }
    }
  });
}

function afficherMessage(texte) {
  const galerie = document.getElementById("galerie-grille");
  if (!galerie) return;
  galerie.innerHTML = `<div class="vide-message"><h3>erreur</h3><p>${texte}</p></div>`;
}

document.addEventListener("langchange", () => {
  const tv = (v) => window.tradVille ? window.tradVille(v) : v;
  const tp = (v) => window.tradPays  ? window.tradPays(v)  : v;
  // Mettre à jour les badges ville dans les cartes
  document.querySelectorAll(".badge-ville[data-ville-raw]").forEach(el => {
    el.textContent = tv(el.dataset.villeRaw);
  });
  // Mettre à jour les badges pays dans les cartes
  document.querySelectorAll(".badge-pays[data-pays-raw]").forEach(el => {
    el.textContent = tp(el.dataset.paysRaw);
  });
  // Mettre à jour les labels dans le dropdown ville
  document.querySelectorAll("#dd-ville .dd-option").forEach(opt => {
    const label = opt.querySelector(".dd-option-label");
    if (label && opt.dataset.val) label.textContent = tv(opt.dataset.val);
  });
  // Mettre à jour les labels dans le dropdown pays
  document.querySelectorAll("#dd-pays .dd-option").forEach(opt => {
    const label = opt.querySelector(".dd-option-label");
    if (label && opt.dataset.val) label.textContent = tp(opt.dataset.val);
  });
  // Mettre à jour les filtres actifs si des villes/pays sont sélectionnés
  if (etat.filtres.ville.length || etat.filtres.pays.length) mettreAJourFiltresActifs();
});

document.addEventListener("DOMContentLoaded", () => {
  // Lire le paramètre ?q= dans l'URL (liens depuis le nuage de mots)
  const params = new URLSearchParams(window.location.search);
  const qUrl = params.get("q");
  if (qUrl) {
    etat.filtres.recherche = qUrl;
  }
  initialiser();
  if (qUrl) {
    const champ = document.getElementById("champ-recherche");
    if (champ) { champ.value = qUrl; }
  }
});
