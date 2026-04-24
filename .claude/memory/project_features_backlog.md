# Backlog fonctionnalités Kaatch

## 💡 Idées futures (pas encore planifiées)

### Programme de la journée
- S'inspirer du design "timeline" style app weddi (horaires, étapes, notes)
- Afficher la météo prévue pour le jour J (API météo)

### Playlist
- Intégration Spotify / Deezer (lien vers une playlist existante)
- Ou accès dédié pour le DJ (lien de partage simple)
- Côté invité : pouvoir suggérer une chanson ?

### Liste de souhaits (wishlist)
- Liste d'objets/cadeaux que les mariés souhaitent
- Possibilité de "réserver" un souhait (invité le coche)
- Option "enveloppe avec un mot" — alternative cadeau simple et élégante

### Landing page
- Ajouter accès à une démo (mariage démo pré-rempli, ou PDF)
- Fix : supprimer la dernière phrase du premier avis ("je ne réponds plus aux messages" — hors sujet)

### Compte & profil
- Accès aux infos du compte : email, mot de passe, suppression
- Futur : changement de langue (i18n)

### Plan de table — côté invité
- Option "dévoiler" le numéro/nom de table à l'invité (choix des mariés)
- Invité voit sa table sur son espace si les mariés ont révélé

---

## 🐛 Bugs connus (à corriger)

- ~~FK guests.table_id → pointait vers wedding_tables au lieu de seating_tables~~ ✅ corrigé
- ~~moment_tag absent de la table photos~~ ✅ corrigé
- RSVP dropdown liste invités : affiche une mauvaise valeur quand on change
- Invité "en attente" voit "Vous avez décliné l'invitation" sur sa page
- Ajout prestataire ne fonctionne pas (à vérifier)
- Champ "genre" absent du formulaire d'ajout invité

---

## ✅ Fait

- Export Excel/CSV liste invités
- Page Partager : WhatsApp / Email / SMS
- Unification vue photos mariés ↔ invités (style crème)
- Fix "null" dans les noms partout (cleanName)
- Autocomplete "qui publie" côté invités
- ZIP multi-photos (deux côtés)
- Filter pills par moment dans les photos
- Faire-part : "LE MOT DES MARIÉS" + guillemets + bouton Imprimer ouvre dans nouvel onglet
- Nav : Prestataires + Mot des mariés dans Préparatifs
- Page Prestataires complète (CRUD, statuts, catégories)
- Plan de table : onDragLeave fix, tap-to-select mobile, filtre RSVP, numéro de table, index alphabétique
