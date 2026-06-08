"use strict";

const TRAD = {
  fr: {
    // Navigation
    "nav-archive":       "archive",
    "nav-carte":         "carte",
    "nav-explorer":      "explorer",
    "nav-temoignages":   "témoignage",
    "nav-chiffres":      "chiffre",
    "nav-contribuer":    "contribuer",
    "nav-apropos":       "à propos",
    // Filtres archive
    "filtrer":           "filtrer",
    "recherche":         "recherche par mot…",
    "tout-effacer":      "tout effacer",
    "filtre-annee":      "année",
    "filtre-ville":      "ville",
    "filtre-pays":       "pays",
    "filtre-langue":     "langue",
    "filtre-categorie":  "catégorie",
    "filtre-couleur":    "couleur",
    // Splash
    "splash-hint":       "↑ choisir une section",
    // Galerie
    "telecharger":       "télécharger",
    // Divers
    "fermer":            "✕ fermer",
    "lire-suite":        "lire la suite →",
    "refermer":          "refermer",
    // Témoignages
    "temoignages-intro": "des femmes racontent — leur rapport aux manifestations du 8 mars, ce qu'elles y portent, ce qu'elles en gardent.",
    "temoignages-vide":  "aucun témoignage pour l'instant.",
    "temoignage-sg":     "témoignage",
    "temoignage-pl":     "témoignages",
    // Stats
    "stats-titre":           "chiffres",
    "stats-total":           "pancartes dans l'archive",
    "stats-pays":            "pays représentés",
    "stats-annees":          "années couvertes",
    "stats-villes":          "villes",
    "stats-categories":      "catégories",
    "stats-langues":         "langues",
    "stats-intro":           "données de l'archive — pancartes féministes du 8 mars à travers le monde.",
    "stats-section-overview":"vue d'ensemble",
    "stats-section-annee":   "le champ des pancartes",
    "stats-eyebrow":         "une archive en expansion",
    "stats-mosaique":        "Chaque carré représente une pancarte, classée par année et colorée selon sa couleur dominante. Cliquez sur une année pour la détailler.",
    "stats-legende":         "couleurs dominantes",
    "stats-click-hint":      "← cliquer sur une année pour voir le détail",
    "stats-global-pancartes":"toutes les pancartes",
    "stats-global-annees":   "années documentées",
    "stats-global-villes":   "villes représentées",
    "stats-global-pays":     "pays représentés",
    "stats-detail-themes":   "thèmes",
    "stats-detail-couleurs": "couleurs",
    "stats-detail-villes":   "villes",
    "stats-detail-langues":  "langues",
    "stats-detail-mots":     "mots les plus fréquents",
    "stats-detail-repartition": "répartition",
    "stats-no-data":         "données non renseignées",
    "stats-label-pancartes": "pancartes",
    "stats-label-annees":    "années",
    "stats-label-villes":    "villes",
    "stats-label-pays":      "pays",
    // Carte
    "panneau-fermer":    "✕ fermer",
    // Explorer
    "btn-vue-frise":     "frise chronologique",
    "btn-vue-free":      "freeform",
    // Contribuer (page soumettre)
    "contribuer-titre":       "contribuer",
    "contribuer-intro":       "vous avez photographié une pancarte lors d'une manifestation du 8 mars ? Contribuez à l'archive.",
    "contribuer-bar-note":    "toutes les soumissions sont vérifiées avant publication",
    "form-section-01":        "la pancarte",
    "form-texte":             "texte de la pancarte",
    "form-texte-placeholder": "ex : mon corps, mes règles",
    "form-themes-label":      "thèmes",
    "form-section-02":        "le contexte",
    "form-ville":             "ville",
    "form-ville-placeholder": "ex : paris",
    "form-pays":              "pays",
    "form-pays-placeholder":  "ex : france",
    "form-annee":             "année",
    "form-annee-placeholder": "ex : 2025",
    "form-langue-label":      "langue de la pancarte",
    "form-description-label": "contexte ou lieu précis (optionnel)",
    "form-description-placeholder": "ex : place de la République, lors du rassemblement principal.",
    "form-section-03":        "la photo",
    "form-depot-label":       "glisser une image ou cliquer pour parcourir",
    "form-section-04":        "attribution",
    "form-photographe-label": "nom ou pseudonyme",
    "form-mention-legale":    "en soumettant, vous confirmez être l'auteur·e de la photo ou disposer de l'autorisation de la diffuser sous licence libre.",
    "form-envoyer":           "envoyer →",
    // À propos
    "apropos-titre":          "à propos",
    "apropos-bar-intro":      "archive participative de pancartes du 8 mars — journée internationale des droits des femmes et des minorités de genre",
    "apropos-01-titre":       "le projet",
    "apropos-01-slogan":      "chaque pancarte est un acte de langage collectif.",
    "apropos-01-p1":          "cette archive rassemble des photographies de pancartes portées lors des manifestations du 8 mars à travers le monde. les rassembler, les indexer, les rendre accessibles — c'est préserver une mémoire militante qui disparaît souvent après le passage des cortèges.",
    "apropos-01-p2":          "les pancartes ne sont pas de simples slogans. elles condensent une colère, une revendication, parfois de l'humour ou de la poésie. portées en foule, elles constituent un langage visuel collectif qui mérite d'être documenté et étudié.",
    "apropos-02-titre":       "la démarche",
    "apropos-02-p1":          "porter nos voix est un projet de mémoire en communication visuelle. il s'inscrit dans une réflexion sur les formes d'expression militante et la constitution de mémoires collectives par l'image.",
    "apropos-02-p2":          "l'archive est organisée par année, ville et thème. chaque entrée renseigne le texte de la pancarte, sa couleur dominante, sa langue, et son contexte de prise de vue. les données sont ouvertes et téléchargeables.",
    "apropos-03-titre":       "contribuer",
    "apropos-03-p1":          "vous avez photographié des pancartes lors d'une manifestation du 8 mars ? toutes les contributions sont les bienvenues — chaque image compte.",
    "apropos-03-p2":          "vous pouvez également partager un témoignage sur votre rapport aux manifestations : ce que vous y portez, ce que vous en gardent.",
    "apropos-03-cta":         "soumettre une pancarte →",
    // Home
    "home-sous-titre":  "Archive de pancartes féministes",
    "home-date":        "8 mars",
    "home-ecran2-1":    "Porter nos voix est une archive photographique de pancartes issues des manifestations du 8 mars, journée internationale des droits des femmes et des minorités de genre.",
    "home-ecran2-2":    "Quand les voix se lèvent ensemble, elles déplacent ce qui semblait immobile. Elles occupent l'espace, le saturent, le transforment en lieu de prise de parole.",
    "home-ecran2-3":    "Ce qui reste, ce sont des traces : une mémoire collective en mouvement, faite de ce qui s'expose, se transmet et persiste.",
  },
  en: {
    // Navigation
    "nav-archive":       "archive",
    "nav-carte":         "map",
    "nav-explorer":      "explore",
    "nav-temoignages":   "testimonies",
    "nav-chiffres":      "figures",
    "nav-contribuer":    "contribute",
    "nav-apropos":       "about",
    // Filtres archive
    "filtrer":           "filter",
    "recherche":         "search by word…",
    "tout-effacer":      "clear all",
    "filtre-annee":      "year",
    "filtre-ville":      "city",
    "filtre-pays":       "country",
    "filtre-langue":     "language",
    "filtre-categorie":  "category",
    "filtre-couleur":    "colour",
    // Splash
    "splash-hint":       "↑ choose a section",
    // Galerie
    "telecharger":       "download",
    // Divers
    "fermer":            "✕ close",
    "lire-suite":        "read more →",
    "refermer":          "close",
    // Témoignages
    "temoignages-intro": "women recount — their relationship to the March 8th demonstrations, what they carry there, what they keep from it.",
    "temoignages-vide":  "no testimonies yet.",
    "temoignage-sg":     "testimony",
    "temoignage-pl":     "testimonies",
    // Stats
    "stats-titre":           "figures",
    "stats-total":           "signs in the archive",
    "stats-pays":            "countries represented",
    "stats-annees":          "years covered",
    "stats-villes":          "cities",
    "stats-categories":      "categories",
    "stats-langues":         "languages",
    "stats-intro":           "archive data — feminist signs from march 8th around the world.",
    "stats-section-overview":"overview",
    "stats-section-annee":   "the field of signs",
    "stats-eyebrow":         "an expanding archive",
    "stats-mosaique":        "Each square is one sign, sorted by year and coloured by its dominant colour. Click a year to see details.",
    "stats-legende":         "dominant colours",
    "stats-click-hint":      "← click a year to see details",
    "stats-global-pancartes":"all signs",
    "stats-global-annees":   "years documented",
    "stats-global-villes":   "cities represented",
    "stats-global-pays":     "countries represented",
    "stats-detail-themes":   "themes",
    "stats-detail-couleurs": "colours",
    "stats-detail-villes":   "cities",
    "stats-detail-langues":  "languages",
    "stats-detail-mots":     "most frequent words",
    "stats-detail-repartition": "distribution",
    "stats-no-data":         "no data available",
    "stats-label-pancartes": "signs",
    "stats-label-annees":    "years",
    "stats-label-villes":    "cities",
    "stats-label-pays":      "countries",
    // Carte
    "panneau-fermer":    "✕ close",
    // Explorer
    "btn-vue-frise":     "chronological",
    "btn-vue-free":      "freeform",
    // Contribuer (page soumettre)
    "contribuer-titre":       "contribute",
    "contribuer-intro":       "have you photographed a sign at a march 8th demonstration? Contribute to the archive.",
    "contribuer-bar-note":    "all submissions are reviewed before publication",
    "form-section-01":        "the sign",
    "form-texte":             "sign text",
    "form-texte-placeholder": "e.g.: my body, my rules",
    "form-themes-label":      "themes",
    "form-section-02":        "the context",
    "form-ville":             "city",
    "form-ville-placeholder": "e.g.: geneva",
    "form-pays":              "country",
    "form-pays-placeholder":  "e.g.: switzerland",
    "form-annee":             "year",
    "form-annee-placeholder": "e.g.: 2025",
    "form-langue-label":      "sign language",
    "form-description-label": "context or specific location (optional)",
    "form-description-placeholder": "e.g.: République square, during the main rally.",
    "form-section-03":        "the photo",
    "form-depot-label":       "drag an image or click to browse",
    "form-section-04":        "attribution",
    "form-photographe-label": "name or pseudonym",
    "form-mention-legale":    "by submitting, you confirm that you are the author of the photo or have permission to share it under a free licence.",
    "form-envoyer":           "send →",
    // À propos
    "apropos-titre":          "about",
    "apropos-bar-intro":      "participatory archive of march 8th signs — international day for women's and gender minorities' rights",
    "apropos-01-titre":       "the project",
    "apropos-01-slogan":      "every sign is an act of collective language.",
    "apropos-01-p1":          "this archive gathers photographs of signs carried at march 8th demonstrations around the world. collecting them, indexing them, making them accessible — it is preserving activist memory that often disappears after the marches pass.",
    "apropos-01-p2":          "signs are not mere slogans. they condense anger, a demand, sometimes humour or poetry. carried in crowds, they form a collective visual language that deserves to be documented and studied.",
    "apropos-02-titre":       "the approach",
    "apropos-02-p1":          "porter nos voix is a visual communication memory project. it reflects on forms of activist expression and the construction of collective memory through images.",
    "apropos-02-p2":          "the archive is organised by year, city and theme. each entry records the sign's text, its dominant colour, its language, and the context in which it was photographed. the data is open and downloadable.",
    "apropos-03-titre":       "contribute",
    "apropos-03-p1":          "have you photographed signs at a march 8th demonstration? all contributions are welcome — every image counts.",
    "apropos-03-p2":          "you can also share a testimony about your relationship to the demonstrations: what you bring to them, what you take away.",
    "apropos-03-cta":         "submit a sign →",
    // Home
    "home-sous-titre":  "Feminist sign archive",
    "home-date":        "march 8",
    "home-ecran2-1":    "Porter nos voix is a photographic archive of signs from march 8th demonstrations, the international day for women's rights and gender minorities.",
    "home-ecran2-2":    "When voices rise together, they move what seemed immovable. They occupy space, saturate it, transform it into a place of speech.",
    "home-ecran2-3":    "What remains are traces: a collective memory in motion, made of what is shown, passed on and endures.",
  }
};

function appliquerLang(lang) {
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang === "fr" ? "fr" : "en";
  const t = TRAD[lang];

  // Boutons langue
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("actif", btn.dataset.lang === lang);
  });

  // Tous les éléments avec data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Placeholders avec data-i18n-placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Placeholder recherche
  const champ = document.getElementById("champ-recherche");
  if (champ) champ.placeholder = t["recherche"];

  // Bouton vue dans explorer
  const btnVue = document.getElementById("btn-vue");
  if (btnVue) {
    const isFrise = btnVue.textContent.trim() === TRAD.fr["btn-vue-frise"] || btnVue.textContent.trim() === TRAD.en["btn-vue-frise"];
    btnVue.textContent = isFrise ? t["btn-vue-frise"] : t["btn-vue-free"];
  }

  // Bouton fermer dans le panneau carte
  const panneauFermer = document.getElementById("panneau-fermer");
  if (panneauFermer) panneauFermer.textContent = t["panneau-fermer"];

  // Mettre à jour les boutons lire la suite / refermer générés dynamiquement
  document.querySelectorAll(".btn-lire-suite").forEach(b => b.textContent = t["lire-suite"]);
  document.querySelectorAll(".btn-refermer").forEach(b => b.textContent = t["refermer"]);

  // Émettre un event pour que les scripts puissent réagir
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang, t } }));
}

// Traduction des noms de villes
const VILLES_EN = {
  "bruxelles": "brussels",
  "genève":    "geneva",
};

// Traduction des noms de pays
const PAYS_EN = {
  "france":     "france",
  "suisse":     "switzerland",
  "belgique":   "belgium",
  "espagne":    "spain",
  "indonesie":  "indonesia",
};

// Exposer globalement
window.getLang = () => localStorage.getItem("lang") || "fr";
window.getTrad = (key) => {
  const lang = window.getLang();
  return (TRAD[lang] && TRAD[lang][key]) || TRAD.fr[key] || key;
};
window.tradVille = (nom) => {
  if (!nom) return nom;
  const lang = window.getLang();
  if (lang === "en") return VILLES_EN[nom.toLowerCase()] || nom;
  return nom;
};
window.tradPays = (nom) => {
  if (!nom) return nom;
  const lang = window.getLang();
  if (lang === "en") return PAYS_EN[nom.toLowerCase()] || nom;
  return nom;
};

// Init au chargement
document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "fr";

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => appliquerLang(btn.dataset.lang));
  });

  appliquerLang(lang);
});
