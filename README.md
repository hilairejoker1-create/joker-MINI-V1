# 𝑱𝒐𝒌𝒆𝒓.𝒎𝒅 𝑩𝑶𝑻 — V1.1

Bot WhatsApp multi-sessions basé sur Baileys, avec interface web de pairage et contrôle Telegram facultatif. Première version de lancement : les commandes affichées dans le menu sont celles réellement présentes dans le code. L'objectif est d'évoluer progressivement vers 200 commandes utiles et testées, sans commandes fictives.

## Installation sur Replit

1. Créer un Replit **Node.js** et importer le contenu de ce ZIP.
2. Dans **Tools → Secrets**, ajouter :
   - `OWNER_NUMBER` : numéro du propriétaire au format international, chiffres uniquement (par défaut `50955550066`).
   - `TELEGRAM_TOKEN` : token de @BotFather (facultatif si Telegram n'est pas utilisé).
   - `BOT_PREFIX` : facultatif, préfixe par défaut `.`.
3. Dans la console, exécuter `npm install`, puis `npm start`.
4. Ouvrir le site Replit, saisir le numéro WhatsApp avec indicatif pays, sans `+`, puis demander le code de connexion.
5. Sur WhatsApp : **Paramètres → Appareils connectés → Connecter un appareil → Connecter avec le numéro de téléphone**, puis saisir le code.
6. À la première connexion, Joker.md bot envoie une image et un message de bienvenue privé.

Ne publie jamais le token Telegram, les Secrets Replit ou les fichiers de session WhatsApp. Ne partage pas un ZIP contenant un dossier `sessions/`.

## Répondeur et salutations

- `.repondre on` : répond automatiquement aux messages texte entrants dans la conversation privée. Dans un groupe, seuls le propriétaire du bot ou un admin du groupe peuvent l'activer.
- `.repondre off` : désactive ce répondeur.
- `.salutations on/off` : active/désactive les réponses ciblées à « bonjour », « bonsoir », « salut », « hello », « merci », « bonne nuit », « sak pase », « kijan ou ye », etc. Les salutations sont activées par défaut.
- Le répondeur général utilise un délai anti-répétition de 20 secondes par personne et conversation pour éviter le spam. Les réponses aux salutations ont leur propre délai de 12 secondes.
- Les réponses sont prédéfinies et localisées ; ce n'est pas une IA qui comprend librement toutes les conversations.

## Langues

- `.language fr` : français
- `.language en` : anglais
- `.language ht` : kreyòl ayisyen

La langue est enregistrée par utilisateur en privé et par groupe. Les menus, salutations et messages automatiques de bienvenue/départ sont disponibles dans les trois langues. Certaines commandes anciennes peuvent encore répondre en français ou en créole.

## Groupes

- `.welcome on/off` : activer/désactiver le message d'arrivée avec le logo.
- `.goodbye on/off` : activer/désactiver le message de départ.
- `.setwelcome texte` : personnaliser le message. Variables disponibles : `{user}`, `{group}`, `{date}`, `{time}`, `{members}`, `{description}`.
- `.setgoodbye texte` : personnaliser le message. Variables : `{user}`, `{group}`.
- Le bot doit être admin du groupe pour que les événements de bienvenue/départ et les commandes de modération fonctionnent correctement.

## Quotas

Les commandes normales ne sont pas limitées. Seules certaines commandes plus coûteuses ont un quota journalier pour les membres :
- Divertissement et jeux : 50 utilisations par jour.
- Outils/médias (ex. QR, URL courte, vue unique) : 20 utilisations par jour.
- Lecture et réactions automatiques aux statuts : **sans limite journalière**.
- Propriétaire du bot et admins des groupes : exemptés des quotas.

Les quotas sont enregistrés dans `data/usage.json`. Les statuts sont gérés par `.reactstatus on/off` (réservé au propriétaire) et ne consomment aucun quota.

## Médias et menu

Le menu envoie une bannière, la liste dynamique des commandes et une piste aléatoire du dossier `assets/music/`. Tu peux ajouter des fichiers `.m4a`, `.mp3` ou `.ogg` dans ce dossier. Les images du bot sont dans `assets/`.

## Version et commandes

Nom : **Joker.md bot** — **V1.0**. Le menu affiche le nombre exact de commandes chargées. Le projet vise 200 commandes utiles, ajoutées et testées progressivement ; il ne prétend pas que 200 fonctions sont déjà disponibles.


## Médias fournis pour le menu

- `assets/banner.png` : affiche Joker.Dev fournie, envoyée automatiquement par `.menu`.
- `assets/menu-gallery.jpg` : montage des cinq autres photos, envoyé automatiquement par `.menu`.
- `assets/menu-video.mp4` : vidéo de présentation fournie, envoyée automatiquement par `.menu`.
- `assets/music/` : musique du menu ; le bot choisit une piste au hasard.
- `assets/gallery/` : copies originales des six images fournies.

Le menu envoie donc l'affiche, le texte avec les commandes réellement chargées, la galerie, la vidéo et une musique. Pour éviter les envois répétitifs, utiliser `.menu` seulement lorsque nécessaire.

## Déploiement sur Railway (V1.1)

1. Mettre le projet sur GitHub, puis sur Railway : **New Project → Deploy from GitHub repo**.
2. Dans **Settings → Root Directory**, mettre `bot`.
3. Ajouter un **Volume** monté sur `/data` (garde les sessions WhatsApp après chaque redémarrage).
4. Dans **Variables** : `DATA_DIR=/data`, `OWNER_NUMBER`, et si besoin `TELEGRAM_TOKEN`, `BOT_PREFIX`.
5. **Settings → Networking → Generate Domain**, ouvrir l'adresse et connecter WhatsApp avec le code.

`railway.json` lance `npm start` et redémarre le bot automatiquement en cas d'arrêt.
Test de toutes les commandes : `npm test`.

## 30 commandes supplémentaires

Ces outils fonctionnent localement, sans clé API. Ils apparaissent dans `.menu` et affichent un exemple si les arguments manquent.

- Texte : `.trimtext`, `.noaccents`, `.initials`, `.camelcase`, `.snakecase`, `.sortwords`, `.uniquewords`, `.wordfreq`, `.extractnumbers`, `.extractemails`.
- Calcul : `.median`, `.range`, `.product`, `.variance`, `.stddev`, `.cbrt`, `.hypot`, `.log10`, `.primefactors`, `.fraction`.
- Conversion : `.cm2in`, `.in2cm`, `.m2ft`, `.ft2m`, `.l2gal`, `.gal2l`, `.kmh2ms`, `.ms2kmh`, `.deg2rad`, `.rad2deg`.

Exemples : `.median 1 9 3`, `.fraction 12 18`, `.hypot 3 4`, `.kmh2ms 36`, `.wordfreq chat chat chien`.
La variance et l'écart-type sont ceux de la population entière. Les gallons sont américains. `.primefactors` accepte les entiers de 2 à 1 000 000 000.

### GitHub et mises à jour

Dans Lovable : **Paramètres du projet → Git → GitHub**, connecter le compte et autoriser la création d'un nouveau dépôt privé. Cette connexion se fait dans l'interface Lovable, pas par une commande du bot. Sur Railway, choisir ce dépôt et suivre les réglages ci-dessus. Les mises à jour du dépôt ne déclenchent un déploiement Railway que si le déploiement automatique est activé sur la branche correspondante.

## 40 commandes populaires supplémentaires

- Création IA : `.imagine description` (photo), `.compose genre, instruments, langue, paroles` (MP3 de 30 secondes), `.aivideo description` (MP4 de 5 secondes). Génération uniquement sur demande, une fois par message. Ces services consomment des crédits.
- Réponses automatiques : `.autoimage on/off`, `.automusic on/off`, `.mediastatus`. Les images et audios entrants sont reconnus et reçoivent un accusé de réception dans la langue choisie, même sans légende. Activé par défaut, délai anti-spam de 20 secondes. Pas d'analyse visuelle, de transcription ou d'identification de chanson implicite, et aucun appel IA automatique.
- Chaîne : https://whatsapp.com/channel/0029VbDxbVnDTkK6xgnh7L1L. `.channel` affiche le lien ; `.setchannel https://whatsapp.com/channel/...` (propriétaire) et `CHANNEL_URL` sur Railway peuvent le remplacer. Le lien accompagne les réponses aux commandes, les photos/vidéos et les musiques (message séparé).
- Les photos, audios et vidéos reçus obtiennent automatiquement un accusé de réception avec suggestions ; `.autoimage off` désactive photos et vidéos, `.automusic off` désactive les audios. Aucune génération payante ne se déclenche automatiquement.
- `.menu` affiche des commandes alphabétiques par catégorie, une commande par ligne avec une ligne vide entre elles, et des suggestions. Le lien est promotionnel : il ne permet pas de lire les publications ou de répondre dans la chaîne WhatsApp.
- Médias fournis : `.music`, `.photo`. Créations personnelles conservées : `.medialist`, `.getmedia nom_du_fichier` ; le second réutilise les octets sauvegardés, sans nouvelle génération.
- Conversion/effets (répondre au média) : `.sticker`, `.toimg`, `.toaudio`, `.bass`, `.nightcore`, `.slowaudio`, `.fastaudio`, `.reverseaudio`, `.volume`, `.grayscale`, `.flipimage`, `.rotateimage`, `.blurimage`, `.mutevideo`, `.compressvideo`, `.thumbnail`. Les vidéos pour stickers sont limitées aux six premières secondes ; les fichiers entrants sont limités à 40 Mo. `.volume` amplifie de 50 %.
- Texte : `.sha256`, `.md5`, `.extractlinks`, `.spoiler`, `.titlecase`, `.kebabcase`, `.charfreq`, `.lines`, `.sentences`, `.removeemoji`, `.nato`, `.readingtime`. MD5 n'est pas adapté aux mots de passe ; le spoiler est du texte, pas une fonction native de WhatsApp.

### Configuration et limites de la création IA sur Railway

Dans Railway → Variables, fournir une `LOVABLE_API_KEY` autorisée à appeler la passerelle depuis ce processus externe. La clé présente dans Lovable n'est pas transférée automatiquement : ne jamais la publier ni la coller dans le chat. Aucune connexion Railway, aucun transfert de clé et aucune connexion réelle WhatsApp ne sont effectués par ce changement. L'accès doit être confirmé sur votre déploiement.

Modèles : `openai/gpt-image-2.5-sunburst`, `google/lyria-3-clip-preview`, `google/gemini-omni-1.1-flash`. Le bot sérialise les créations ; erreurs terminales/refus ne sont jamais rejoués. Erreurs 402/403 mettent toute création en pause dans `/data/data/media/gateway.json`. Après avoir réparé le crédit/l'accès, le propriétaire du déploiement supprime uniquement ce fichier, puis lance une nouvelle commande. Une livraison répétée d'un même message ne crée pas une seconde facturation. Une création interrompue reste marquée et n'est pas relancée automatiquement ; les jobs vidéo restent enregistrés pour diagnostic, mais leur reprise après arrêt n'est pas automatique.

Installer avec `npm install` sur Railway pour télécharger le binaire `ffmpeg-static`. `FFMPEG_PATH` permet d'utiliser un binaire système. Les créations sont stockées sur le volume `DATA_DIR`, jamais exposées par le site de pairage. Les vérifications locales simulent WhatsApp ; la livraison à un vrai compte doit encore être testée après connexion.
