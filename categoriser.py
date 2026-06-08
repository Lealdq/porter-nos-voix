"""
Analyse chaque pancarte avec Claude Vision et assigne une catégorie + sous-catégorie.
Met à jour data/pancartes.json avec les champs texte, themes, langue.
"""

import json, os, base64, time, sys
from pathlib import Path

import anthropic

CATEGORIES = {
    "VIOLENCES SEXUELLES":       ["féminicide", "agression", "viol"],
    "ÉMANCIPATION CORPORELLE":   ["IVG", "consentement", "sexualité"],
    "FIERTÉ COLLECTIVE":         ["affirmation positive", "solidarité", "empowerment"],
    "INÉGALITÉS ÉCONOMIQUES":    ["salaires", "travail", "conditions"],
    "CULTURE ET MÉDIAS":         ["référence culturelle", "imaginaire collectif", "pop culture"],
    "CRITIQUE DU SYSTÈME":       ["patriarcat", "critique globale", "normes sociales"],
    "CONVERGENCE DES LUTTES":    ["intersectionnalité", "LGBTQIA+", "racisme"],
}

SYSTEM = """Tu analyses des photos de pancartes de manifestations féministes du 8 mars.
Pour chaque pancarte, réponds UNIQUEMENT en JSON valide avec ces champs :
{
  "texte": "texte exact visible sur la pancarte (en minuscules, tel quel)",
  "langue": "fr|es|en|it|de|pt|ar|autre",
  "categorie": "UNE des 7 catégories exactes",
  "sous_categorie": "UNE des sous-catégories correspondante"
}

Les 7 catégories et leurs sous-catégories :
- VIOLENCES SEXUELLES : féminicide / agression / viol
- ÉMANCIPATION CORPORELLE : IVG / consentement / sexualité
- FIERTÉ COLLECTIVE : affirmation positive / solidarité / empowerment
- INÉGALITÉS ÉCONOMIQUES : salaires / travail / conditions
- CULTURE ET MÉDIAS : référence culturelle / imaginaire collectif / pop culture
- CRITIQUE DU SYSTÈME : patriarcat / critique globale / normes sociales
- CONVERGENCE DES LUTTES : intersectionnalité / LGBTQIA+ / racisme

Si la pancarte est illisible ou vide, utilise "FIERTÉ COLLECTIVE" / "affirmation positive".
Ne réponds qu'avec le JSON, sans markdown, sans explication."""

DATA_PATH = Path(__file__).parent / "data" / "pancartes.json"
IMAGES_BASE = Path("/Users/lealeducq/Library/CloudStorage/OneDrive-HESSO/CV3/memoire/pratique/images")

client = anthropic.Anthropic()

def encode_image(path: Path) -> str:
    return base64.standard_b64encode(path.read_bytes()).decode("utf-8")

def analyser(pancarte: dict) -> dict:
    img_path = IMAGES_BASE / "/".join(pancarte["image"].split("/")[1:])
    if not img_path.exists():
        return pancarte

    b64 = encode_image(img_path)
    for tentative in range(3):
        try:
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=256,
                system=SYSTEM,
                messages=[{
                    "role": "user",
                    "content": [{
                        "type": "image",
                        "source": {"type": "base64", "media_type": "image/png", "data": b64},
                    }, {
                        "type": "text",
                        "text": "Analyse cette pancarte.",
                    }]
                }]
            )
            raw = msg.content[0].text.strip()
            # nettoyer le JSON si entouré de backticks
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            result = json.loads(raw)
            pancarte["texte"]          = result.get("texte", "").strip()
            pancarte["langue"]         = result.get("langue", "fr")
            pancarte["categorie"]      = result.get("categorie", "FIERTÉ COLLECTIVE")
            pancarte["sous_categorie"] = result.get("sous_categorie", "affirmation positive")
            # mettre la catégorie aussi dans themes pour compatibilité filtres
            pancarte["themes"] = [result.get("sous_categorie", "")]
            return pancarte
        except (json.JSONDecodeError, KeyError) as e:
            print(f"  ⚠ parse error: {e} — retrying ({tentative+1}/3)")
            time.sleep(1)
        except anthropic.RateLimitError:
            print("  ⏳ rate limit — waiting 30s")
            time.sleep(30)
        except Exception as e:
            print(f"  ✗ {e}")
            break
    return pancarte

def main():
    with open(DATA_PATH) as f:
        data = json.load(f)

    # reprendre là où on s'est arrêté (si "categorie" déjà présent → skip)
    total = len(data)
    todo  = [p for p in data if not p.get("categorie")]
    done  = total - len(todo)
    print(f"→ {total} pancartes, {done} déjà traitées, {len(todo)} à analyser")

    for i, p in enumerate(todo):
        pct = (done + i + 1) / total * 100
        print(f"[{done+i+1}/{total} {pct:.0f}%] {p['id']}", end=" ... ")
        sys.stdout.flush()
        analyser(p)
        print(p.get("categorie", "?"), "/", p.get("sous_categorie", "?"))

        # sauvegarder toutes les 10 pancartes
        if (i + 1) % 10 == 0:
            with open(DATA_PATH, "w") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

    # sauvegarde finale
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n✓ terminé — {DATA_PATH}")

if __name__ == "__main__":
    main()
