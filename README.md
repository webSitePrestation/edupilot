# Sahliya — Guide de déploiement

Plateforme SaaS de gestion scolaire pour établissements privés en Afrique francophone.

---

## 📁 Structure des fichiers

```
sahliya/
├── index.html              ← Page d'accueil
├── fonctionnalites.html    ← Détail des fonctionnalités
├── tarifs.html             ← Grille tarifaire (TND / DZD / MAD)
├── demo.html               ← Formulaire demande de démo
├── faq.html                ← Questions fréquentes
├── contact.html            ← Formulaire de contact
├── mentions-legales.html   ← Légal, RGPD, CGV
├── merci.html              ← Page de confirmation post-formulaire
│
├── css/
│   ├── style.css           ← Styles principaux
│   └── responsive.css      ← Breakpoints mobile / tablette
│
├── js/
│   ├── main.js             ← Burger, accordion, scroll, animations
│   ├── form.js             ← Validation client-side (demo + contact)
│   └── pricing.js          ← Toggle devise et période (tarifs.html)
│
├── php/
│   ├── config.php          ← Configuration email (⚠️ ne pas committer)
│   ├── send-demo.php       ← Traitement formulaire démo
│   └── send-contact.php    ← Traitement formulaire contact
│
├── img/                    ← Images (voir img/README.md)
│   └── README.md
│
├── video/
│   └── pub-sahliya-vendable-v3.mp4   ← Vidéo de démo
│
├── .htaccess               ← Sécurité, redirections, cache
├── robots.txt
├── sitemap.xml
└── README.md               ← Ce fichier
```

---

## 🚀 Déploiement sur hébergement mutualisé (cPanel / OVH / Hostinger)

### Étape 1 — Prérequis

- PHP 8.0 ou supérieur
- Module Apache `mod_rewrite` activé
- Accès FTP ou gestionnaire de fichiers cPanel
- Certificat SSL actif (Let's Encrypt via cPanel, ou OVH SSL)

### Étape 2 — Upload des fichiers

1. Connectez-vous à votre hébergement via FTP (FileZilla recommandé) ou le gestionnaire de fichiers cPanel.
2. Naviguez jusqu'au dossier racine : `public_html/` (ou `www/` selon l'hébergeur).
3. Uploadez **tous les fichiers** du projet dans ce dossier.

> ⚠️ Vérifiez que `.htaccess` est bien uploadé — il peut être masqué par défaut sous Windows/Mac.

### Étape 3 — Configuration email

Ouvrez `php/config.php` et adaptez :

```php
define('MAIL_TO',      'votre@email.com');    // Destinataire des formulaires
define('MAIL_FROM',    'noreply@votredomaine.com');  // Doit correspondre à votre domaine
define('SITE_URL',     'https://votredomaine.com');
```

> 💡 Sur certains hébergeurs (OVH, Infomaniak), la fonction PHP `mail()` nécessite que `MAIL_FROM` soit un email valide de votre domaine. Sinon, les emails arrivent en spam.

### Étape 4 — Permissions fichiers

Via FTP ou cPanel, vérifiez :

| Ressource | Permission |
|---|---|
| Fichiers `.html`, `.php`, `.css`, `.js` | `644` |
| Dossiers | `755` |
| `php/config.php` | `600` (lecture seule propriétaire) |

### Étape 5 — Test des formulaires

1. Soumettez le formulaire de démo depuis `/demo.html`
2. Vérifiez que vous êtes redirigé vers `/merci.html`
3. Vérifiez la réception de l'email sur `MAIL_TO`
4. Vérifiez l'email de confirmation envoyé à l'adresse saisie

### Étape 6 — Ajouter les images et vidéo

Consultez `img/README.md` pour la liste complète des images requises.

---

## 🔒 Sécurité

- **`.htaccess`** bloque l'accès direct au dossier `php/` et aux fichiers sensibles.
- **Honeypot** : champ caché dans les formulaires pour filtrer les bots.
- **Rate limiting** : maximum 5 soumissions par IP par heure (fichiers temp dans `/tmp`).
- **CSRF** : token généré côté client, validé en longueur côté serveur.
- **Sanitisation** : `strip_tags()` + `htmlspecialchars()` + `mb_substr()` sur tous les champs.
- **Headers de sécurité** : `X-Frame-Options`, `X-Content-Type-Options`, `CSP` définis dans `.htaccess`.

> 🔐 Pour activer HSTS (recommandé après 1 semaine de test HTTPS), décommentez la ligne correspondante dans `.htaccess`.

---

## 📧 En cas de problème d'envoi d'email

Si les emails ne partent pas ou arrivent en spam :

**Option A — Configurer SPF/DKIM** (recommandé)
Ajoutez un enregistrement SPF dans vos DNS :
```
TXT @ v=spf1 mx include:votre-hebergeur.com ~all
```

**Option B — PHPMailer via SMTP**
Installez PHPMailer et modifiez `send-demo.php` / `send-contact.php` pour utiliser SMTP authentifié. Les constantes SMTP sont prêtes dans `config.php` (décommentez les lignes en bas du fichier).

---

## 🌍 SEO

- `sitemap.xml` : mettez à jour les dates `<lastmod>` après chaque modification.
- Soumettez le sitemap dans Google Search Console après mise en ligne.
- Open Graph : ajoutez `img/og-image.jpg` (1200×630 px) pour un beau partage réseaux sociaux.

---

## 📞 Contact développeur

**Sahliya** · contact@sahliya.app · WhatsApp +33 7 44 81 07 84
