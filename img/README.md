# EduPilot — Images requises

Placez vos images dans ce dossier (`img/`). Voici la liste complète avec les specs techniques.

---

## 🖼️ Images essentielles (priorité haute)

| Fichier | Dimensions recommandées | Format | Usage |
|---|---|---|---|
| `logo.svg` | Variable (vecteur) | SVG | Logo principal navbar & footer |
| `favicon.ico` | 32×32 px | ICO | Onglet navigateur |
| `apple-touch-icon.png` | 180×180 px | PNG | Icône iOS |
| `og-image.jpg` | 1200×630 px | JPEG | Partage réseaux sociaux (Open Graph) |
| `demo-poster.jpg` | 1280×720 px | JPEG | Poster de la vidéo démo (avant lecture) |

---

## 🎬 Vidéo

| Fichier | Emplacement | Format | Durée recommandée |
|---|---|---|---|
| `demo-edupilot.mp4` | `video/` | MP4 (H.264) | 2–3 minutes |

> ⚠️ Compressez la vidéo avec HandBrake ou ffmpeg pour un poids < 30 Mo. Utilisez `-crf 28` pour un bon compromis qualité/taille.

---

## 👤 Avatars témoignages (index.html)

> Si les photos ne sont pas disponibles, les initiales s'affichent automatiquement (fallback onerror).

| Fichier | Dimensions | Format |
|---|---|---|
| `avatar-amira.jpg` | 80×80 px | JPEG |
| `avatar-karim.jpg` | 80×80 px | JPEG |
| `avatar-fatima.jpg` | 80×80 px | JPEG |

---

## 🏫 Images fonctionnalités (fonctionnalites.html)

> Ces images sont affichées en alternance avec les blocs texte. Le fallback icon s'affiche si l'image est absente.

| Fichier | Dimensions | Contenu suggéré |
|---|---|---|
| `feat-notes.png` | 800×500 px | Capture écran saisie de notes / bulletin |
| `feat-presences.png` | 800×500 px | Interface appel / suivi absences |
| `feat-messagerie.png` | 800×500 px | Interface messagerie école-famille |
| `feat-planning.png` | 800×500 px | Vue emploi du temps hebdomadaire |
| `feat-paiements.png` | 800×500 px | Dashboard paiements / scolarité |
| `feat-dashboard.png` | 800×500 px | Tableau de bord direction |
| `feat-mobile.png` | 400×700 px | Screenshot app mobile parents |
| `feat-securite.png` | 800×500 px | Schéma sécurité / RGPD |

---

## 🎨 Conseils d'optimisation

- **Format** : utilisez WebP quand possible (support navigateurs > 95%). Gardez JPEG/PNG en fallback.
- **Poids** : < 150 Ko par image après compression ([Squoosh.app](https://squoosh.app) ou ImageOptim).
- **Alt text** : déjà renseigné dans le HTML. Vérifiez la pertinence après ajout des vraies images.
- **Lazy loading** : les images `<img loading="lazy">` sont déjà configurées dans le HTML.

---

## 🔧 Commande ffmpeg pour la vidéo

```bash
ffmpeg -i demo-brut.mp4 \
  -vcodec libx264 -crf 28 -preset slow \
  -acodec aac -b:a 128k \
  -movflags +faststart \
  video/demo-edupilot.mp4
```
