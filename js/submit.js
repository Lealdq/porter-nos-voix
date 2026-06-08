"use strict";
/* Envoi du formulaire de contribution.
   ─────────────────────────────────────────────────────────────────────
   • En local  (localhost) → serveur Ruby serve.rb sur le port 8787
   • En ligne  (Netlify)   → Web3Forms  (email à lea94120@icloud.com)

   Pour activer l'envoi en ligne :
   1. Va sur https://web3forms.com
   2. Entre lea94120@icloud.com → reçois ta clé par mail
   3. Remplace VOTRE_CLE_WEB3FORMS ci-dessous par ta clé             */
(function () {
  const IS_LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const ENDPOINT = IS_LOCAL
    ? "http://localhost:8787/api/soumettre"
    : "https://formspree.io/f/xdavgrdd";

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
    const photo = form.photo.files[0];

    if (!ville || !pays || !annee || !photo) { montrer(erreur, T.champs()); return; }

    const data = new FormData(form);

    const labelOrig = btn.textContent;
    btn.disabled    = true;
    btn.textContent = T.envoi();

    try {
      const r = await fetch(ENDPOINT, { method: "POST", body: data });
      const j = await r.json().catch(() => ({ success: false, message: `HTTP ${r.status}` }));

      if (j.success) {
        montrer(succes, T.ok());
        form.reset();
        const apercu = document.getElementById("apercu-photo");
        if (apercu) { apercu.src = ""; apercu.style.display = "none"; }
      } else {
        montrer(erreur, j.message || j.error || T.err());
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
