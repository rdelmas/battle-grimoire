# Feature: Monster Builder

## Purpose
Permet de concevoir et de gérer des monstres personnalisés (Homebrew) de toutes pièces ou en modifiant un monstre officiel existant issu de l'API Open5e, afin d'alimenter la base de données locale utilisable par le module de rencontre.

## User outcome
**Créer et éditer un monstre personnalisé**
- Créer une créature à partir d'un formulaire vierge.
- Rechercher et importer un monstre officiel depuis la base API locale/distante pour l'utiliser comme gabarit (remplissage automatique de tous les champs).
- Configurer l'identité, les caractéristiques, les points de vie (valeur fixe ou lancée aux dés), et les attributs de combat (CA, vitesses).
- Ajouter des capacités dynamiques modulaires (Traits passifs, Actions, Actions Bonus, Réactions).
- Ajouter des modules pour les boss et créatures majeures (Actions Légendaires, Actions de Repaire / Lair Actions).

**Visualiser et Sauvegarder**
- Consulter le rendu visuel final de la fiche technique (Statblock) en temps réel via un volet de prévisualisation dynamique.
- Stocker les créations dans la bibliothèque locale sous l'étiquette "Homebrew".
- Cloner, modifier ou supprimer définitivement les monstres du catalogue personnalisé.

## Entry points
- Sur la page d'accueil (Landing Page) : Encart "Monstres" ou "Bestiaire".
- Dans le menu de navigation latéral : Onglet "Bestiaire Homebrew" (avec icône dédiée).

---

# Spécification Technique : Feature Monster Builder

## 1. Modèles de Données & Gestion de l'État

### 1.1 Modèle d'un Monstre Homebrew (HomebrewMonster Model)
Pour garantir une compatibilité totale avec la Fiche de Détail Dynamique de l'Encounter Builder, l'objet doit reproduire la structure et le typage des entités de l'API Open5e.

**Propriétés de l'objet :**
*   **Identifiant unique** : Un UUID généré côté client.
*   **Identité de base** :
    *   `name` (String, obligatoire).
    *   `size` (String, ex: "M", "L").
    *   `type` (String, ex: "Fiend", "Humanoid").
    *   `alignment` (String, ex: "Chaotic Evil", "Neutral").
*   **Statistiques de Combat** :
    *   `armor_class` (Nombre entier, obligatoire).
    *   `armor_desc` (String optionnel, ex: "Natural Armor").
    *   `hit_points` (Nombre entier, obligatoire).
    *   `hit_dice` (String optionnel, ex: "3d8 + 6").
    *   `speed` (String ou Objet, ex: "9m, fly 18m").
*   **Caractéristiques (Attributs)** :
    *   `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma` (Nombres entiers compris entre 1 et 30, obligatoires).
*   **Résistances, Sens & Compétences** :
    *   `damage_vulnerabilities`, `damage_resistances`, `damage_immunities`, `condition_immunities` (String).
    *   `senses` (String), `languages` (String), `skills` (Objet ou String).
*   **Facteur de Puissance** :
    *   `challenge_rating` (String, ex: "1/4", "5", "23").
*   **Blocs de Capacités (Tableaux d'objets `[{ name: String, desc: String }]`)** :
    *   `special_abilities` (Traits passifs / Capacités spéciales).
    *   `actions` (Actions principales / Attaques).
    *   `bonus_actions` (Actions bonus).
    *   `reactions` (Réactions).
    *   `legendary_actions` (Actions légendaires).
    *   `lair_actions` (Actions de repaire).
*   **Marqueurs d'état** :
    *   `is_homebrew` (Boolean, toujours `true`).
    *   `created_at`, `updated_at` (Horodatages ISO 8601).

---

## 2. Architecture des Écrans & Layouts

### 2.1 Écran Principal : Liste des Monstres Homebrew (MonstersView)

#### 2.1.1 Conteneur Supérieur : En-tête (Header)
*   **Titre Principal** : Libellé "Bestiaire Homebrew".
*   **Sous-titre** : Libellé "Créez et gérez vos propres créatures".
*   **Action Principale** : Bouton "Nouveau Monstre" avec une icône de type `Plus` (déclenche l'ouverture du Modal Builder à l'état vierge).

#### 2.1.2 Zone Centrale : Recherche et Filtres
*   **Barre de Recherche** : Un champ de saisie de texte unique doté d'une icône `Loupe`.
    *   *Texte d'invite (Placeholder)* : "Rechercher un monstre...".
    *   *Comportement* : Filtrage dynamique en temps réel sur la liste inférieure.

#### 2.1.3 Zone Basse : Liste des Monstres
*   **État Vide** : Affichage centré si aucune donnée locale n'est présente :
    *   Une icône sémantique représentant une créature ou une épée.
    *   Un message principal : "Aucun monstre personnalisé".
    *   Un message secondaire : "Créez votre première créature pour l'utiliser en combat".
*   **État Liste** : Liste verticale composée de lignes interactives individuelles. Chaque ligne présente l'anatomie suivante :
    *   **Section Gauche (Informations)** :
        *   Nom du monstre.
        *   Un Badge indiquant le Facteur de puissance (`CR`).
        *   Une ligne de métadonnées secondaires textuelles formatée ainsi : `${size} ${type}, ${alignment}`.
    *   **Section Droite (Actions)** : Alignement horizontal de boutons d'actions rapides (icônes seules) :
        *   Bouton `Éditer` (icône Crayon) : Ouvre le modal de création en mode édition.
        *   Bouton `Dupliquer` (icône Copie) : Clone instantanément la créature.
        *   Bouton `Supprimer` (icône Poubelle) : Déclenche le modal de confirmation de suppression.
        *   Bouton `Développer/Réduire` (icône Flèche/Chevron) : Déplie le volet inférieur de prévisualisation.
    *   **Sous-panneau de Détail (Dépliable)** : Masqué par défaut. Lors d'un clic sur la ligne ou le chevron, il intègre en pleine largeur le composant *Fiche de Détail Dynamique* configuré en mode lecture seule.

---

### 2.2 Écran Modal : Création & Édition (MonsterBuilder)
Affichage en superposition plein écran (Full-screen Modal) calqué sur le layout asymétrique de l'Encounter Builder.

#### 2.2.1 Bandeau Supérieur (Header Modal)
*   **Titre de l'action** : "Créer un monstre" ou "Éditer le monstre : [Nom]".
*   **Action d'importation** : Bouton "Importer depuis l'API" doté d'une icône de téléchargement (`Cloud` / `Download`), ancré à gauche du titre.
*   **Fermeture** : Un bouton de fermeture (icône `Cross`) dans l'angle supérieur droit.

#### 2.2.2 Corps Principal (Grille à 2 Colonnes)

##### A. Colonne Gauche : Formulaire de Saisie (2/3 de la largeur, défilement vertical indépendant)
Conteneur structuré en accordéons ou sections thématiques :
*   **Section 1 : Identité** : Champs textuels (`name`, `type`, `alignment`), sélecteurs natifs pour `size` (Tiny, Small, Medium, Large, Huge, Gargantuan) et `challenge_rating`.
*   **Section 2 : Combat** : Inputs numériques pour `armor_class` et `hit_points`. Inputs textuels pour `armor_desc`, `hit_dice` (formule) et `speed`.
*   **Section 3 : Caractéristiques** : Grille de 6 inputs numériques (valeurs de 1 à 30). Chaque champ affiche à sa droite immédiate le modificateur calculé automatiquement en lecture seule (ex: `14 (+2)`).
*   **Section 4 : Profil Technique** : Zones de texte multi-lignes (Textarea) pour lister les résistances, immunités, compétences, sens et langues.
*   **Section 5 : Capacités & Actions** : Modules répétables pour chaque type d'action (Traits, Actions, Actions Bonus, Réactions, Actions Légendaires, Actions de Repaire).
    *   Chaque sous-section possède un bouton "+ Ajouter une entrée".
    *   Chaque entrée génère un sous-ensemble de deux champs : un input `Nom` et une zone de texte `Description`, accompagnés d'un bouton individuel de suppression (icône poubelle).

##### B. Colonne Droite : Prévisualisation Dynamique (1/3 de la largeur, position fixe / sticky)
*   Intègre le composant standard *Fiche de Détail Dynamique*.
*   Réagit en temps réel à chaque modification (`onChange` / `Input event`) effectuée dans le formulaire de gauche, offrant un rendu visuel immédiat de la *Statblock* finale.

#### 2.2.3 Barre d'Actions Fixe (Footer Modal)
Bandeau horizontal ancré au bas de l'écran contenant deux boutons alignés à droite :
*   Bouton `Annuler` (icône `Cross`).
*   Bouton `Enregistrer` / `Sauvegarder` (icône `Disquette`).

---

### 2.3 Modal Secondaire : Recherche & Sélection d'Import
S'ouvre en superposition centrée au clic sur le bouton "Importer depuis l'API".
*   **En-tête** : Titre "Sélectionner un monstre de référence" et barre de recherche textuelle.
*   **Corps** : Liste compacte paginée par blocs de 15 résultats présentant les monstres de la table officielle (Nom, CR, Type).
*   **Comportement** : Le clic sur une ligne déclenche un avertissement : *"Cette action écrasera l'intégralité des champs actuels du formulaire. Confirmer ?"*. Si l'utilisateur accepte, le modal se ferme et le formulaire est injecté.

---

# Business rules

## 1. Logique d'Importation & Remplissage
*   **[RG-7-1-01] Source des Monstres Officiels** : La recherche du sous-modal d'import interroge la table locale des monstres issus de l'API Open5e (base de référence non-homebrew).
*   **[RG-7-1-02] Extraction et Mapping** : Lors de l'importation d'une créature officielle, l'application extrait l'intégralité de ses champs JSON et écrase les valeurs courantes du formulaire. L'identifiant unique d'origine (`id` / `slug`) est impérativement rejeté et remplacé par un nouvel UUID généré localement pour sanctuariser la donnée officielle. Le drapeau `is_homebrew` est explicitement assigné à `true`.

## 2. Validation & Calculs du Formulaire
*   **[RG-7-2-01] Calcul du Modificateur de Caractéristique** : Les modificateurs affichés à côté des caractéristiques obéissent à la formule réglementaire D&D 5e : 
$$\lfloor(\text{Score} - 10) / 2\rfloor$$
L'interface doit recalculer et afficher instantanément la valeur formatée (ex: `+3` ou `-1`) dès que le champ numérique associé change.
*   **[RG-7-2-02] Nettoyage des Entrées Vides** : Lors du clic sur le bouton `Enregistrer`, l'application doit passer en revue tous les tableaux d'actions dynamiques (Actions, Actions Légendaires, etc.). Toute entrée dont le champ `Nom` est resté vide est automatiquement purgée et ignorée avant l'insertion en base de données.
*   **[RG-7-2-03] Validation des Saisies Obligatoires** : Le bouton `Enregistrer` reste inactif (`disabled`) tant que les champs obligatoires `name`, `armor_class`, et `hit_points` ne contiennent pas de valeurs valides (Chaîne non vide et nombres supérieurs à 0).

## 3. Gestion du Catalogue Local (MonstersView)
*   **[RG-7-3-01] Isolation Complète** : L'écran `MonstersView` affiche uniquement les lignes de données dont la propriété `is_homebrew` est égale à `true`. Les monstres officiels importés de l'API Open5e n'y apparaissent jamais en tant que lignes autonomes.
*   **[RG-7-3-02] Tri par Défaut** : La liste des monstres Homebrew est triée automatiquement par ordre alphabétique croissant basé sur la propriété `name`.
*   **[RG-7-3-03] Action Dupliquer** : Le bouton de duplication effectue un clone parfait de l'objet en base. Le champ `name` du clone reçoit obligatoirement le suffixe `" - Copie"`. Si le nom d'origine se termine déjà par `" - Copie"`, le système incrémente un compteur numérique (ex: `" - Copie (2)"`).
*   **[RG-7-3-04] Intégrité Référentielle des Rencontres** : La suppression d'un monstre personnalisé de la base de données via le bouton Poubelle n'altère en rien les rencontres créées précédemment. Le module Encounter Builder effectuant une copie physique des données lors de l'ajout, le monstre survit au sein de l'objet Rencontre contenant son instance clonée.

## 4. Intégration Écosystème (Encounter Builder)
*   **[RG-7-4-01] Visibilité Immédiate** : Tout monstre validé et sauvegardé au sein du Monster Builder doit être immédiatement indexé et rendu disponible dans le panneau gauche du créateur de rencontres lorsque le commutateur `Homebrew=true` est activé.

---

## Technical notes
- Le modèle de données doit respecter l'arborescence exacte des clés Open5e (notamment pour l'imbrication des tableaux d'actions) afin que le composant de lecture de la fiche technique droite n'ait besoin d'aucune modification ou surcharge de code pour basculer d'un monstre API à un monstre Homebrew.

## Out of scope
- La gestion des versions ou l'historique des modifications d'un monstre Homebrew.
- Le partage ou l'exportation de fichiers de monstres au format JSON/XML vers l'extérieur de l'application locale.

## Visualisation des IHM (ascii)
1. ÉCRAN PRINCIPAL : Bestiaire Homebrew (MonstersView)
========================================================================================================================
 BESTIAIRE HOMEBREW                                                                               [ + Nouveau Monstre ]
 Gérez vos rencontres et créez des combats équilibrés
------------------------------------------------------------------------------------------------------------------------
 [ 🔍 Rechercher un monstre...                                                                                        ]
========================================================================================================================

 📄 LIGNE DE MONSTRE (ÉTAT STANDARD)
 ---------------------------------------------------------------------------------------------------------------------
  Gorgone de Feu                                 [ CR 5 ]     |    [ ✏️ ]   [ 📋 ]   [ 🗑️ ]   [ 🔽 ]
  Large Monster, Neutral Evil                                 |     Edit     Dupl.    Suppr.   Détail
 ---------------------------------------------------------------------------------------------------------------------

 📄 LIGNE DE MONSTRE (ÉTAT DÉVELOPPÉ)
 ---------------------------------------------------------------------------------------------------------------------
  liche d'Ombre                                  [ CR 21 ]    |    [ ✏️ ]   [ 📋 ]   [ 🗑️ ]   [ 🔼 ]
  Medium Undead, Any Evil Alignment                           |     Edit     Dupl.    Suppr.   Détail
 .....................................................................................................................
 :  FICHE DE DÉTAIL DYNAMIQUE (VOLET DÉPLIÉ)                                                                          :
 :                                                                                                                    :
 :  Liche d'Ombre                                                                                                     :
 :  Medium Undead, Any Evil Alignment                                                                                 :
 :  ----------------------------------------------------------------------------------------------------------------- :
 :  Classe d'Armure : 17 (Armure naturelle)                                                                           :
 :  Points de vie   : 135 (18d8 + 54)                                                                                 :
 :  Vitesse         : 9m                                                                                              :
 :  ----------------------------------------------------------------------------------------------------------------- :
 :    FOR       DEX       CON       INT       SAG       CHA                                                           :
 :  11 (+0)   16 (+3)   16 (+3)   20 (+5)   14 (+2)   16 (+3)                                                         :
 :  ----------------------------------------------------------------------------------------------------------------- :
 :  ACTIONS                                                                                                           :
 :  • Toucher Paralysant : Attaque au corps à corps, +12 au toucher. Touché : 10 (3d6) dégâts de froid.               :
 :  • Distorsion Temporelle : (Recharge 5-6). La liche ralentit le temps autour d'elle...                             :
 :                                                                                                                    :
 :  ACTIONS LÉGENDAIRES                                                                                               :
 :  • Regard d'Effroi (1 Action) : La liche fixe une créature à moins de 10 mètres...                                 :
 :....................................................................................................................

 2. MODAL : Création & Édition (MonsterBuilder)
 ========================================================================================================================
 [ ☁️ Importer depuis l'API ]        CRÉER UN MONSTRE                                                              [ X ]
========================================================================================================================
 COLONNE GAUCHE : FORMULAIRE DE SAISIE (2/3)                   | COLONNE DROITE : PRÉVISUALISATION EN TEMPS RÉEL (1/3)
 (Scrollable verticalement et indépendant)                      | (Position fixe / Sticky Statblock)
---------------------------------------------------------------|--------------------------------------------------------
 ▼ SECTION 1 : IDENTITÉ                                        |  Nouvelle Créature
   Nom :     [ Gorgone de Feu                        ]         |  Taille, Type, Alignement
   Taille :  [ Large     ▼ ]  Type : [ Monster       ▼ ]       |  ------------------------------------------------------
   Align. :  [ Neutral Evil                          ▼ ]         Classe d'Armure : 0
   CR :      [ 5         ▼ ]                                   |  Points de vie   : 0
                                                               |  Vitesse         : --
 ▼ SECTION 2 : COMBAT                                          |  ------------------------------------------------------
   CA :      [ 18 ]  Type d'armure : [ Armure naturelle        ] |    FOR       DEX       CON       INT       SAG       CHA  
   HP :      [ 120 ] Formule Dés :   [ 12d10 + 48              ] |  10 (+0)   10 (+0)   10 (+0)   10 (+0)   10 (+0)   10 (+0) 
   Vitesse : [ 12m, vol 18m                                    ] |  ------------------------------------------------------
                                                               |  ACTIONS
 ▼ SECTION 3 : CARACTÉRISTIQUES                                |  • Piétinement Enflammé
   FOR : [ 18 ] (+4)    DEX : [ 12 ] (+1)    CON : [ 16 ] (+3) |    La créature se déplace de toute sa vitesse en...
   INT : [ 6  ] (-2)    SAG : [ 12 ] (+1)    CHA : [ 7  ] (-2) | 
                                                               |  ACTIONS DE REPAIRE
 ▼ SECTION 4 : PROFIL TECHNIQUE                                |  • Éruption de Magma
   Sens :    [ Vision dans le noir 18m, Perception passive 14  ] |    À l'initiative 20, le volcan entre en éruption...
   Langues : [ Commun, Primordial                              ] | 
   Immunités:[ Feu, Poison                                     ] | 
                                                               | 
 ▼ SECTION 5 : CAPACITÉS & ACTIONS                             | 
   [►] Traits Passifs (0)                                      | 
   ▼ Actions Principales (1)                                   | 
       ┌─ Entrée #1 ─────────────────────────────────────────┐ | 
       │ Nom :  [ Piétinement Enflammé                     ] │ | 
       │ Desc : [ La créature se déplace de toute sa vites ] │ | 
       │        [ se en piétinant les cibles au sol...     ] │ | 
       │                                         [ 🗑️ Suppr ] │ | 
       └─────────────────────────────────────────────────────┘ | 
       [ + Ajouter une Action ]                                | 
   [►] Actions Bonus (0)                                       | 
   [►] Réactions (0)                                           | 
   [►] Actions Légendaires (0)                                 | 
   ▼ Actions de Repaire (1)                                    | 
       ┌─ Entrée #1 ─────────────────────────────────────────┐ | 
       │ Nom :  [ Éruption de Magma                        ] │ | 
       │ Desc : [ À l'initiative 20, le volcan entre en ér ] │ | 
       │                                         [ 🗑️ Suppr ] │ | 
       └─────────────────────────────────────────────────────┘ | 
       [ + Ajouter une Action de Repaire ]                     | 
------------------------------------------------------------------------------------------------------------------------
 FOOTER MODAL FIXE                                                                             [ Annuler ] [ Enregistrer ]
========================================================================================================================

3. MODAL SECONDAIRE : Import de Référence (Import API)
===========================================================================
   SELECTIONNER UN MONSTRE DE RÉFÉRENCE                                  [ X ]
   ---------------------------------------------------------------------------
   [ 🔍 Gobelin                                                              ]
   ---------------------------------------------------------------------------
    Nom                           CR            Type
   ---------------------------------------------------------------------------
   > Gobelin                      1/4           Humanoid
     Chef de bande gobelin        1             Humanoid
     Gobelin de la nuit           1/2           Humanoid
     Rôdeur gobelin               2             Humanoid
   ---------------------------------------------------------------------------
   [<< Précédent]                                              [Suivant >>] Page 1
   ===========================================================================