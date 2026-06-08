"use strict";
/* Envoi du formulaire de contribution vers le serveur local (serve.rb).
   ─────────────────────────────────────────────────────────────────────
   Les soumissions sont sauvegardées dans data/soumissions.json
   et les photos dans data/soumissions/photos/.
   Le serveur doit tourner : ruby serve.rb                              */
(function () {
  const ENDPOINT = "http://localhost:8787/api/soumettre";

  const form   = document.getElementById("formulaire-soumission");
  if (!form) return;
  const succes = document.getElementById("message-succes");
  const erreur = document.getElementById("message-erreur");
  const btn    = form.querySelector(".contribuer-submit");

  const EN = () => ((window.getLang ? window.getLang() : "fr") === "en");
  const T = {
    envoi:  () => EN() ? "sending…" : "envoi en cours…",
    ok:     () => EN()
      ? "Thank you! Your sign has been submitted and will be reviewed before publication."
      : "Merci ! Votre pancarte a été envoyée et sera vérifiée avant publication.",
    err:    () => EN()
      ? "Something went wrong. Please try again later."
      : "Une erreur est survenue. Veuillez réessayer plus tard.",
    champs: () => EN()
      ? "Please fill in city, country, year and add a photo."
      : "Veuillez renseigner ville, pays, année et ajouter une photo.",
    serveur: () => EN()
      ? "The local server is not running. Start it with: ruby serve.rb"
      : "Le serveur local n'est pas démarré. Lancez : ruby serve.rb",
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
    const photo = form.photo.files[0];

    if (!ville || !pays || !annee || !photo) { montrer(erreur, T.champs()); return; }

    // On envoie le FormData natif (les noms de champs correspondent
    // à ceux du formulaire HTML : texte, ville, pays, annee, langue,
    // description, themes, photographe, photo)
    const data = new FormData(form);

    const labelOrig = btn.textContent;
    btn.disabled    = true;
    btn.textContent = T.envoi();

    try {
      const r = await fetch(ENDPOINT, { method: "POST", body: data });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      const j = await r.json();
      if (j.success) {
        montrer(succes, T.ok());
        form.reset();
        const apercu = document.getElementById("apercu-photo");
        if (apercu) { apercu.src = ""; apercu.style.display = "none"; }
      } else {
        montrer(erreur, (j.message ? `Erreur : ${j.message}` : T.err()));
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        montrer(erreur, T.serveur());
      } else {
        montrer(erreur, T.err());
      }
    } finally {
      btn.disabled    = false;
      btn.textContent = labelOrig;
    }
  });
})();
