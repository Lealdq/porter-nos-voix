"use strict";
/* Envoi du formulaire de contribution.
   ─────────────────────────────────────────────────────────────────────
   • En local  (localhost) → serveur Ruby serve.rb sur le port 8787
   • En ligne              → Formspree  https://formspree.io/f/xdavgrdd  */
(function () {
  const IS_LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const ENDPOINT = IS_LOCAL
    ? "http://localhost:8787/api/soumettre"
    : "/";

  const form   = document.getElementById("formulaire-soumission");
  if (!form) return;
  const succes = document.getElementById("message-succes");
  const erreur = document.getElementById("message-erreur");
  const btn    = form.querySelector(".contribuer-submit");

  const EN = () => ((window.getLang ? window.getLang() : "fr") === "en");
  const T = {
    envoi:   () => EN() ? "sending…" : "envoi en cours…",
    ok:      () => EN()
      ? "Thank you! Your sign has been submitted and will be reviewed before publication."
      : "Merci ! Votre pancarte a été envoyée et sera vérifiée avant publication.",
    err:     () => EN()
      ? "Something went wrong. Please try again later."
      : "Une erreur est survenue. Veuillez réessayer plus tard.",
    champs:  () => EN()
      ? "Please fill in city, country, year and add a photo."
      : "Veuillez renseigner ville, pays, année et ajouter une photo.",
    cle:     () => EN()
      ? "The form is not configured yet. Contact the administrator."
      : "Le formulaire n'est pas encore configuré. Contactez l'administratrice.",
    serveur: () => EN()
      ? "The local server is not running. Start it with: ruby serve.rb"
      : "Le serveur local n'est pas démarré. Lancez : ruby serve.rb",
  };

  function montrer(el, msg) {
    el.textContent = msg;
    el.style.display = "block";
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function cacher() {
    if (succes) succes.style.display = "none";
    if (erreur) erreur.style.display = "none";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    cacher();

    const ville = form.ville.value.trim();
    const pays  = form.pays.value.trim();
    const annee = form.annee.value.trim();
    // L'input photo n'a pas de name= pour éviter les blocages des services tiers
    const photo = document.getElementById("champ-photo").files[0];

    if (!ville || !pays || !annee || !photo) { montrer(erreur, T.champs()); return; }

    const labelOrig = btn.textContent;
    btn.disabled    = true;
    btn.textContent = T.envoi();

    try {
      // ── Étape 1 : uploader la photo sur imgBB ──────────────────────────
      let photoUrl = "";
      if (!IS_LOCAL) {
        const imgData = new FormData();
        imgData.append("image", photo);
        const imgR = await fetch(
          "https://api.imgbb.com/1/upload?key=f2f0f75f5aaab536133f5435fdaf7b8b",
          { method: "POST", body: imgData }
        );
        const imgJ = await imgR.json();
        if (!imgR.ok || !imgJ.success) throw new Error("Échec de l'upload photo.");
        photoUrl = imgJ.data.url;
      }

      // ── Étape 2 : envoyer les données texte + lien photo à Netlify Forms ─
      const data = new FormData();
      data.append("form-name",    "contribution");
      data.append("ville",        form.ville.value.trim());
      data.append("pays",         form.pays.value.trim());
      data.append("annee",        form.annee.value.trim());
      data.append("texte",        form.texte?.value.trim() || "");
      data.append("langue",       form.langue?.value || "");
      data.append("description",  form.description?.value.trim() || "");
      data.append("photographe",  form.photographe?.value.trim() || "");
      // Thèmes cochés
      const themes = [...form.querySelectorAll(".theme-check:checked")].map(c => c.value).join(", ");
      if (themes) data.append("themes", themes);
      // Photo : fichier en local, lien imgBB en ligne
      if (IS_LOCAL) {
        data.append("photo", photo, photo.name);
      } else {
        data.append("photo_lien", photoUrl);
      }

      const r = await fetch(ENDPOINT, { method: "POST", body: data });

      if (r.ok) {
        montrer(succes, T.ok());
        form.reset();
        const apercu = document.getElementById("apercu-photo");
        if (apercu) { apercu.src = ""; apercu.style.display = "none"; }
      } else {
        montrer(erreur, T.err());
      }
    } catch (err) {
      if (err instanceof TypeError) {
        montrer(erreur, T.serveur());
      } else {
        montrer(erreur, err.message || T.err());
      }
    } finally {
      btn.disabled    = false;
      btn.textContent = labelOrig;
    }
  });
})();
