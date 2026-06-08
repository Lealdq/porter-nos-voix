"use strict";

const EXTRAIT_MAX = 220;
let donneesCache = null;

async function chargerTemoignages() {
  if (donneesCache) return donneesCache;
  try {
    const rep = await fetch("data/temoignages.json?v=" + Date.now());
    if (!rep.ok) throw new Error();
    donneesCache = await rep.json();
    return donneesCache;
  } catch {
    return null;
  }
}

function getLang() {
  return (window.getLang ? window.getLang() : localStorage.getItem("lang")) || "fr";
}

function champLang(t, champ) {
  const lang = getLang();
  if (lang === "en" && t[champ + "_en"]) return t[champ + "_en"];
  return t[champ];
}

function extraire(t) {
  const slogan = champLang(t, "slogan");
  if (slogan) return slogan;
  const sections = champLang(t, "sections");
  if (sections && sections.length) return sections[0].paragraphes[0];
  const paras = champLang(t, "paragraphes");
  if (paras && paras.length) return paras[0];
  if (t.texte && t.texte.length > EXTRAIT_MAX) return t.texte.slice(0, EXTRAIT_MAX).trimEnd() + "…";
  return t.texte || "";
}

function estLong(t) {
  if (t.sections || t.sections_en) return true;
  const paras = t.paragraphes || t.paragraphes_en;
  if (paras && paras.length >= 1) return true;
  if (t.texte && t.texte.length > EXTRAIT_MAX) return true;
  return false;
}

function corpsComplet(t) {
  const sections = champLang(t, "sections");
  if (sections && sections.length) {
    return sections.map(s => `
      <h3 class="temoignage-section-titre">${s.titre}</h3>
      ${s.paragraphes.map(p => `<p class="temoignage-texte temoignage-texte--long">${p}</p>`).join("")}
    `).join("");
  }
  const paras = champLang(t, "paragraphes");
  if (paras && paras.length) {
    return paras.map(p => `<p class="temoignage-texte temoignage-texte--long">${p}</p>`).join("");
  }
  return `<p class="temoignage-texte">« ${t.texte} »</p>`;
}

function rendreTemoignage(t, index) {
  const num = String(index + 1).padStart(2, "0");
  const tvT = (v) => window.tradVille ? window.tradVille(v) : v;
  const lieu = [t.ville ? tvT(t.ville) : null, t.annee ? String(t.annee) : ""].filter(Boolean).join(", ");
  // (pays non affiché dans les témoignages)
  const long  = estLong(t);
  const extrait = extraire(t);

  const prenomHtml = t.lien
    ? `<a class="temoignage-prenom temoignage-lien" href="${t.lien}" target="_blank" rel="noopener">${t.prenom}</a>`
    : `<span class="temoignage-prenom">${t.prenom}</span>`;

  const contexte = champLang(t, "contexte");
  const meta = `
    <div class="temoignage-meta">
      ${t.prenom ? prenomHtml : ""}
      ${contexte ? `<span class="temoignage-separateur">·</span><span class="temoignage-contexte">${contexte}</span>` : ""}
      ${lieu ? `<span class="temoignage-separateur">·</span><span class="temoignage-lieu">${lieu}</span>` : ""}
    </div>`;

  const numHtml = `<span class="temoignage-num">${num}</span>`;

  if (!long) {
    const extraitCourt = t.slogan
      ? `<p class="temoignage-slogan">${extrait}</p>`
      : `<p class="temoignage-texte">« ${extrait} »</p>`;
    return `
      <article class="temoignage">
        ${numHtml}
        <div class="temoignage-corps">
          ${meta}
          ${extraitCourt}
        </div>
      </article>`;
  }

  const extraitHtml = t.slogan
    ? `<p class="temoignage-slogan">${extrait}</p>`
    : t.paragraphes
      ? `<p class="temoignage-texte temoignage-texte--long">${extrait}</p>`
      : `<p class="temoignage-texte">« ${extrait} »</p>`;

  const gt = k => (window.getTrad ? window.getTrad(k) : k);
  return `
    <article class="temoignage temoignage--expandable" aria-expanded="false">
      ${numHtml}
      <div class="temoignage-corps">
        ${meta}
        <div class="temoignage-extrait">
          ${extraitHtml}
          <button class="btn-lire-suite">${gt("lire-suite")}</button>
        </div>
        <div class="temoignage-complet" hidden>
          ${corpsComplet(t)}
          <button class="btn-refermer">${gt("refermer")}</button>
        </div>
      </div>
    </article>`;
}

function brancherExpand(liste) {
  // N'attacher les listeners qu'une seule fois
  if (liste.dataset.expandBranche) return;
  liste.dataset.expandBranche = "1";

  liste.addEventListener("click", (e) => {
    const article = e.target.closest(".temoignage--expandable");
    if (!article) return;

    const extrait = article.querySelector(".temoignage-extrait");
    const complet = article.querySelector(".temoignage-complet");
    const estOuvert = article.getAttribute("aria-expanded") === "true";

    if (estOuvert) {
      extrait.hidden = false;
      complet.hidden = true;
      article.setAttribute("aria-expanded", "false");
      article.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      extrait.hidden = true;
      complet.hidden = false;
      article.setAttribute("aria-expanded", "true");
    }
  });

  liste.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const article = e.target.closest(".temoignage--expandable");
    if (!article || e.target.closest("button")) return;
    e.preventDefault();
    const extrait = article.querySelector(".temoignage-extrait");
    if (!extrait.hidden) {
      extrait.hidden = true;
      article.querySelector(".temoignage-complet").hidden = false;
      article.setAttribute("aria-expanded", "true");
    }
  });
}

function afficherTemoignages(data) {
  const liste = document.getElementById("liste-temoignages");
  if (!liste) return;
  const gt = k => (window.getTrad ? window.getTrad(k) : k);

  liste.innerHTML = data.map((t, i) => rendreTemoignage(t, i)).join("");
  brancherExpand(liste);

  const count = document.getElementById("temoignages-count");
  if (count) {
    count.dataset.nb = data.length;
    const n = data.length;
    count.textContent = `${n} ${n > 1 ? gt("temoignage-pl") : gt("temoignage-sg")}`;
  }

  // Majuscules en début de phrase sur le contenu fraîchement rendu
  if (window.capitaliserPhrases) window.capitaliserPhrases();
}

async function initialiser() {
  const liste = document.getElementById("liste-temoignages");
  if (!liste) return;

  const data = await chargerTemoignages();
  if (!data || !data.length) {
    const gt = k => (window.getTrad ? window.getTrad(k) : k);
    liste.innerHTML = `<p class="vide-message">${gt("temoignages-vide")}</p>`;
    return;
  }

  afficherTemoignages(data);
}

document.addEventListener("DOMContentLoaded", initialiser);
document.addEventListener("langchange", async () => {
  const data = await chargerTemoignages();
  if (data && data.length) afficherTemoignages(data);
});
