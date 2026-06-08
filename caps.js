"use strict";
/* Majuscule en début de phrase pour la prose du site.
   S'applique aux paragraphes / slogans / intros, jamais à la nav ni aux boutons.
   Gère le text-transform:lowercase, le multilingue et le contenu dynamique. */
(function () {
  // Sélecteurs de prose à capitaliser (pas la nav, ni les filtres, ni les badges)
  const SELECTORS = [
    ".apropos-intro", ".apropos-slogan", ".apropos-p", ".licence-texte",
    ".temoignages-intro", ".temoignage-texte", ".temoignage-slogan", ".temoignage-section-titre",
    ".contribuer-intro", ".contribuer-note",
    ".stats-intro", ".stats-eyebrow", ".stats-section-note",
    "#ecran-2 span"
  ];

  const UP = c => c.toLocaleUpperCase("fr");
  // ouvre-guillemets / parenthèses qu'on saute avant la 1re lettre
  const OUVRANTS = "\\s«»\"'‘’“”(\\[";

  function process(el) {
    el.style.textTransform = "none";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let premier = true;
    nodes.forEach(node => {
      let t = node.nodeValue;
      // après une ponctuation de fin de phrase (. ! ? …) + espace(s) + éventuels guillemets
      t = t.replace(
        new RegExp("([.!?…]\\s+[" + OUVRANTS + "]*)(\\p{Ll})", "gu"),
        (m, p, c) => p + UP(c)
      );
      // tout début du bloc (1er nœud texte)
      if (premier && /\S/.test(t)) {
        t = t.replace(
          new RegExp("^([" + OUVRANTS + "]*)(\\p{Ll})", "u"),
          (m, p, c) => p + UP(c)
        );
        premier = false;
      }
      node.nodeValue = t;
    });
  }

  function run() {
    SELECTORS.forEach(sel => document.querySelectorAll(sel).forEach(process));
  }

  window.capitaliserPhrases = run;
  document.addEventListener("DOMContentLoaded", () => setTimeout(run, 0));
  document.addEventListener("langchange", () => setTimeout(run, 0));
})();
