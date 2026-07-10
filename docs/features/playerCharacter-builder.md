# Feature: Player Character Builder

## Purpose
Permet de créer, configurer et stocker les Personnages Joueurs (PJ) selon les règles de D&D 2024 (5.5e), afin d'alimenter la bibliothèque locale utilisée par le module de gestion des rencontres et le tracker de combat.

## User outcome
**Créer et gérer un personnage joueur**
- Configurer l'identité du personnage (Nom, Joueur, Classe, Sous-classe, Espèce, Historique).
- Assigner les caractéristiques et calculer automatiquement les modificateurs, le bonus de maîtrise et les jets de sauvegarde.
- Déterminer les statistiques vitales de combat : Points de vie max, Classe d'Armure (CA), Initiative, et Vitesses de déplacement.
- Sélectionner les maîtrises et expertises de compétences (Acrobaties, Histoire, Perception, etc.) et gérer automatiquement les sens passifs.
- Configurer l'arsenal magique : choix de la caractéristique d'incantation, calcul automatique du DD/Bonus d'attaque, suivi des emplacements de sorts (slots) et liste des sorts préparés (avec marqueurs tactiques : Concentration, Action Bonus, Réaction).
- Sélectionner et afficher les propriétés de **Maîtrise d'Armes (Weapon Mastery)** actives pour optimiser les actions en combat.
- Répertorier les Dons d'Origine (Origin Feats) et les Dons Généraux (General Feats) acquis au fil des niveaux.

**Visualiser et Sauvegarder**
- Consulter instantanément le rendu d'une fiche de combat simplifiée (Combat Statblock / Fiche Tactique) via un volet de prévisualisation en temps réel.
- Sauvegarder, cloner (changement de niveau/évolution) ou archiver/supprimer les personnages.

## Entry points
- Sur la page d'accueil (Landing Page) : Encart "Personnages".
- Dans le menu de navigation latéral : Onglet "Feuilles de Personnages" (icône `User`).

---

# Spécification Technique : Feature Player Character Builder

## 1. Modèles de Données & Gestion de l'État

### 1.1 Modèle d'un Personnage Joueur (Character Model)
Le modèle doit capturer l'ensemble des variables dynamiques requises pour automatiser les calculs à l'écran et fournir au MJ les informations tactiques cruciales pendant un combat.

**Propriétés de l'objet :**
*   **Identifiants** : `id` (UUID unique), `player_name` (String), `character_name` (String, obligatoire).
*   **Feuille d'Identité (D&D 2024)** :
    *   `level` (Nombre entier entre 1 et 20, par défaut 1).
    *   `species` (String, ex: "Elf", "Human").
    *   `background` (String, ex: "Soldier", "Acolyte" - détermine le don d'origine).
    *   `class_name` (String, obligatoire, ex: "Fighter", "Wizard").
    *   `subclass_name` (String optionnel, choisi généralement au niveau 3 en 2024).
*   **Combat Vitals** :
    *   `armor_class` (Nombre entier, obligatoire).
    *   `hit_points_max` (Nombre entier, obligatoire).
    *   `speed` (String, ex: "9m" ou "9m, fly 9m").
    *   `initiative_misc_bonus` (Nombre entier, par défaut 0, pour les bonus hors DEX comme le don Alert).
*   **Caractéristiques & Sauvegardes** :
    *   `abilities` : Objet contenant le score brut (1 à 30) pour `str`, `dex`, `con`, `int`, `wis`, `cha`.
    *   `saving_throw_proficiencies` : Tableau de chaînes identifiant les caractéristiques maîtrisées (ex: `["str", "con"]`).
*   **Compétences (Skills - D&D 2024)** :
    *   `skills` : Objet associant chaque compétence à son niveau d'expertise (`"none"`, `"proficient"`, `"expertise"`).
    *   `passive_perception` : Nombre entier calculé automatiquement.
*   **Arsenal Tactique & Maîtrises (D&D 2024)** :
    *   `weapon_masteries` : Tableau d'objets `[{ weapon: String, property: String }]` (ex: `[{ weapon: "Longsword", property: "Sap" }]`).
    *   `origin_feat` : Objet `{ name: String, desc: String }` (Don octroyé par l'historique au niveau 1).
    *   `general_feats` : Tableau d'objets `[{ name: String, category: String, desc: String }]` pour stocker les dons obtenus aux niveaux supérieurs.
*   **Module de Magie & Sorts** :
    *   `spellcasting_ability` (String, ex: "int", "wis", "cha" ou "none").
    *   `spell_slots` : Objet décrivant pour chaque niveau de sort (1 à 9) la configuration `{ max: Number, current: Number }`.
    *   `prepared_spells` : Tableau d'objets pour les sorts mémorisés :
        ```json
        [{
          "name": "Projectiles Magiques",
          "level": 1,
          "casting_time": "Action", 
          "components": "V, S",
          "concentration": false,
          "range": "36m"
        }]
        ```
*   **Métadonnées** : `is_dead` (Boolean, par défaut `false`), `created_at`, `updated_at`.

---

## 2. Architecture des Écrans & Layouts

### 2.1 Écran Principal : Liste des Personnages (`PlayersView`)

#### 2.1.1 En-tête & Recherche
*   **Titre Principal** : Libellé "Personnages".
*   **Sous-titre** : Libellé "Gérez les fiches techniques et l'arsenal de combat de vos héros".
*   **Action Principale** : Bouton "Nouveau Personnage" (icône `Plus`).
*   **Barre de Recherche** : Saisie textuelle filtrant dynamiquement sur le `nom du personnage` ou sa `classe`.

#### 2.1.2 Structure de la Liste
*   **État Vide** : Icône `User`, message "Aucun personnage en bibliothèque", sous-texte "Ajoutez vos PJ pour pouvoir construire des rencontres équilibrées".
*   **Lignes de Personnage** :
    *   **Section Gauche** : Nom du personnage, Badge de Niveau (`Niv. X`), texte secondaire : `${Species} ${Class} (${Subclass}) • Joueur: ${player_name}`.
    *   **Section Droite** : Boutons d'actions alignés horizontalement : `Éditer` (Crayon) > `Dupliquer` (Copie) > `Supprimer` (Poubelle) > `Développer/Réduire` (Chevron).
    *   **Sous-panneau Dépliable** : Affiche la fiche de prévisualisation tactique complète en pleine largeur.

---

### 2.2 Écran Modal : Création & Édition (`PlayerBuilder`)
Superposition plein écran divisée en deux colonnes asymétriques.

#### 2.2.1 Colonne Gauche : Formulaire par Sections (2/3 de la largeur)
*   **Section 1 : Identité** : Inputs textuels simples, sélecteurs pour `level`, `species`, `background`, `class_name`, et `subclass_name`.
*   **Section 2 : Attributs & Sauvegardes** : Grille affichant les 6 caractéristiques avec le score brut, le modificateur calculé automatiquement, et une checkbox pour marquer la maîtrise du jet de sauvegarde.
*   **Section 3 : Compétences & Maîtrises (D&D 2024)** : Grille à deux colonnes listant les 18 compétences officielles. Chaque ligne permet de définir le niveau de compétence : Maîtrise ordinaire (M) ou Expertise (E). Affiche en temps réel le modificateur final calculé et la perception passive en lecture seule.
*   **Section 4 : Statistiques Vitales** : Inputs pour les points de vie max, la classe d'armure de base, la vitesse, et le modificateur d'initiative bonus.
*   **Section 5 : Dons & Maîtrises d'Armes** :
    *   Sous-section "Don d'Origine" : Inputs textuels (Nom, Description) associés à l'historique.
    *   Module répétable "Dons Généraux & Évolution" : Bouton permettant d'empiler les dons obtenus au fil des niveaux (Nom, Description).
    *   Module répétable "Maîtrise d'Arme" : Permet d'associer une arme à sa propriété de maîtrise exclusive 2024 (*Cleave, Graze, Nick, Push, Sap, Slow, Topple, Vex*).
*   **Section 6 : Grimoire & Magie** :
    *   Sélecteur d'Aptitude de Sort (`spellcasting_ability` : none, int, wis, cha). Si `none`, toute la section reste masquée.
    *   Grille des emplacements de sorts (Niveaux 1 à 9) : Deux inputs numériques par niveau actif (Slots Max / Slots Actuels).
    *   Module répétable "Sorts Préparés" : Bouton "+ Préparer un sort". Génère les champs : Nom, Niveau du sort (Sélecteur 0-9), Temps d'incantation (Action, Action Bonus, Réaction, etc.), Portée, et une Checkbox "Concentration".

#### 2.2.2 Colonne Droite : Fiche de Combat Tactique (1/3 de la largeur, Sticky)
*   Affiche une version condensée et ultra-lisible orientée combat de la fiche du personnage, mise à jour en temps réel.

---

# Business rules

## 1. Moteur de Calcul Automatique (Règles D&D 2024)

*   **[RG-8-1-01] Bonus de Maîtrise Dynamique** : Le bonus de maîtrise est calculé automatiquement en fonction du niveau saisi dans le formulaire selon l'échelle officielle :
    *   Niveaux 1-4 : `+2` | Niveaux 5-8 : `+3` | Niveaux 9-12 : `+4` | Niveaux 13-16 : `+5` | Niveaux 17-20 : `+6`.
*   **[RG-8-1-02] Modificateur d'Attribut** : Calculé instantanément via la formule standard : `Math.floor((Score - 10) / 2)`.
*   **[RG-8-1-03] Calcul des Jets de Sauvegarde** : Le modificateur final est égal au modificateur de la caractéristique correspondante. Si la case de maîtrise est cochée, on y ajoute le Bonus de Maîtrise.
*   **[RG-8-1-04] Niveaux de Maîtrise de Compétence** : Chaque compétence possède trois états exclusifs : `none` (Aucune), `proficient` (Maîtrisé), `expertise` (Expertise).
*   **[RG-8-1-05] Calcul des Modificateurs de Compétence** : Le score final d'une compétence est calculé automatiquement selon son état :
    *   `none` : `Modificateur d'Attribut`
    *   `proficient` : `Modificateur d'Attribut + Bonus de Maîtrise`
    *   `expertise` : `Modificateur d'Attribut + (2 * Bonus de Maîtrise)`
*   **[RG-8-1-06] Perception Passive** : Calculée automatiquement et affichée en lecture seule via la formule : `10 + Modificateur Final de la compétence Perception`.
*   **[RG-8-1-07] Calcul de l'Initiative Tactique** : Égal au *Modificateur de Dextérité* auquel s'ajoute la valeur du champ `initiative_misc_bonus`.
*   **[RG-8-1-08] Calculs Magiques** : Si `spellcasting_ability` n'est pas "none", la fiche calcule automatiquement :
    *   Le DD de sauvegarde des sorts : `8 + Bonus de Maîtrise + Modificateur de la Caractéristique Magique`.
    *   Le Bonus d'attaque magique : `Bonus de Maîtrise + Modificateur de la Caractéristique Magique`.

## 2. Intégrité & Cycle de vie

*   **[RG-8-2-01] Validation Minimale** : Le bouton d'enregistrement est bloqué tant que les champs `character_name`, `class_name`, `hit_points_max` (>0) et `armor_class` (>0) ne sont pas complétés.
*   **[RG-8-2-02] Catégorisation des Dons** : L'application séparera structurellement le Don d'Origine (niveau 1) des Dons Généraux / Épiques (niveaux 4, 8, 12, 16, 19).
*   **[RG-8-2-03] Suffixe de Clonage** : L'action de duplication crée une copie identique en BDD en ajoutant le suffixe `" - Copie"`.
*   **[RG-8-2-04] Nettoyage à la Sauvegarde** : Les entrées vides (noms de dons vides, sorts sans nom, maîtrises d'armes non spécifiées) sont automatiquement purgées avant l'écriture en base de données.

---


# Visuels de l'IHM (Wireframes ASCII)

1. ÉCRAN PRINCIPAL : Liste des Personnages (PlayersView)
========================================================================================================================
 PERSONNAGES                                                                                      [ + Nouveau Personnage ]
 Gérez les fiches techniques et l'arsenal de combat de vos héros
------------------------------------------------------------------------------------------------------------------------
 [ 🔍 Rechercher un personnage ou une classe...                                                                       ]
========================================================================================================================

 👤 LIGNE DE PERSONNAGE Joueur (ÉTAT STANDARD)
 ---------------------------------------------------------------------------------------------------------------------
  Thorgar Pied-Lourd                            [ Niv. 3 ]   |    [ ✏️ ]   [ 📋 ]   [ 🗑️ ]   [ 🔽 ]
  Halfling Fighter (Champion) • Joueur: Thomas               |     Edit     Dupl.    Suppr.   Détail
 ---------------------------------------------------------------------------------------------------------------------

 👤 LIGNE DE PERSONNAGE Joueur (ÉTAT DÉVELOPPÉ)
 ---------------------------------------------------------------------------------------------------------------------
  Lyra Sombre-Éclat                             [ Niv. 3 ]   |    [ ✏️ ]   [ 📋 ]   [ 🗑️ ]   [ 🔼 ]
  Elf Wizard (Evoker) • Joueur: Julie                        |     Edit     Dupl.    Suppr.   Détail
 .....................................................................................................................
 :  FICHE TACTIQUE DÉPLIÉE (VOLET DE LECTURE)                                                                         :
 :                                                                                                                    :
 :  Lyra Sombre-Éclat | Niveau 3 Elf Wizard | Maîtrise: +2                                                            :
 :  ----------------------------------------------------------------------------------------------------------------- :
 :  ❤️ HP Max : 18      🛡️ CA : 12      ⚡ Initiative : +2      🏃 Vitesse : 9m                                        :
 :  ----------------------------------------------------------------------------------------------------------------- :
 :  JETS DE SAUVEGARDE :                                                                                              :
 :  FOR: -1  | DEX: +2  | CON: +1  |  [⚙️] INT: +5  |  [⚙️] SAG: +4  | CHA: +0                                             :
 :  ----------------------------------------------------------------------------------------------------------------- :
 :  TACTIQUE & PROFIL                                                                                                 :
 :  • Don d'Origine : Alerte (Peut intervertir son initiative avec un allié consentant au début du combat).           :
 :  • Maîtrises d'Armes (Weapon Mastery) :                                                                            :
 :    - Dague [Propriété: Nick] | - Quart de tonneau [Propriété: Topple]                                              :
 :  ----------------------------------------------------------------------------------------------------------------- :
 :  COMPÉTENCES MAGIQUES                                                                                              :
 :  • Caractéristique : INT  |  🔮 DD des Sorts : 13  |  ⚔️ Attaque Magique : +5                                       :
 :....................................................................................................................

 2. MODAL : Création & Édition (PlayerBuilder)
 ========================================================================================================================
 CRÉER UN PERSONNAGE                                                                                               [ X ]
========================================================================================================================
 COLONNE GAUCHE : FORMULAIRE DE CONFIGURATION (2/3)            | COLONNE DROITE : APPERÇU TACTIQUE TEMPS RÉEL (1/3)
 (Scrollable verticalement et indépendant)                      | (Fiche de combat condensée / Sticky)
---------------------------------------------------------------|--------------------------------------------------------
 ▼ SECTION 1 : IDENTITÉ                                        |  [Nom du personnage]
   Nom Perso : [ Thorgar Pied-Lourd          ]                  |  Niveau 3 • Fighter
   Nom Joueur: [ Thomas                      ]                  |  -----------------------------------------------------
   Niveau :    [ 3   ▼ ] Espèce : [ Halfling     ▼ ]            |  ❤️ HP Max : 28          🛡️ CA : 16
   Classe :    [ Fighter ▼ ] Sous-Cl: [ Champion     ▼ ]        |  ⚡ Initiative : +1      🏃 Vitesse : 9m
                                                               |  -----------------------------------------------------
 ▼ SECTION 2 : CARACTÉRISTIQUES & SAUVEGARDES                   |  JETS DE SAUVEGARDE
   FOR : [ 16 ] (+3)  [⚙️] Maîtrise Sauvegarde                   |  [⚙️] FOR: +5   |      DEX: +1   | [⚙️] CON: +4
   DEX : [ 12 ] (+1)  [ ] Maîtrise Sauvegarde                   |       INT: -1   |      SAG: +1   |      CHA: +0
   CON : [ 14 ] (+2)  [⚙️] Maîtrise Sauvegarde                   |  -----------------------------------------------------
   INT : [ 8  ] (-1)  [ ] Maîtrise Sauvegarde                   |  MAÎTRISES D'ARMES (WEAPON MASTERY)
   SAG : [ 12 ] (+1)  [ ] Maîtrise Sauvegarde                   |  • Épée longue [Sap]
   CHA : [ 10 ] (+0)  [ ] Maîtrise Sauvegarde                   |  • Hache d'armes [Topple]
                                                               |  -----------------------------------------------------
 ▼ SECTION 3 : VITAL COMBAT                                    |  DON D'ORIGINE
   HP Max : [ 28 ]   CA : [ 16 ]                                |  • Tough (+2 HP par niveau, inclus)
   Vitesse: [ 9m       ]   Bonus Init. Hor DEX : [ 0  ]         | 
                                                               |  SORTILÈGES
 ▼ SECTION 4 : DON & MAÎTRISES D'ARMES (2024)                  |  Non-lanceur de sorts
   Aptitude Magique : [ Aucune (none)   ▼ ]                    | 
                                                               | 
   > Don d'Origine (Background Feat)                           | 
     Nom : [ Tough                                    ]        | 
     Desc: [ Donne +2 PV max par niveau du personnage ]        | 
                                                               | 
   > Maîtrises d'Armes Unlocked                                | 
     ┌─ Arme #1 ─────────────────────────────────────────────┐ | 
     │ Arme :     [ Épée longue                            ] │ | 
     │ Propriété: [ Sap (Désavantage sur la prox attaque) ▼ ]│ | 
     │                                           [ 🗑️ Suppr ] │ | 
     └───────────────────────────────────────────────────────┘ | 
     ┌─ Arme #2 ─────────────────────────────────────────────┐ | 
     │ Arme :     [ Hache d'armes                          ] │ | 
     │ Propriété: [ Topple (Met la cible à terre)         ▼ ]│ | 
     │                                           [ 🗑️ Suppr ] │ | 
     └───────────────────────────────────────────────────────┘ | 
     [ + Ajouter une Maîtrise d'Arme ]                         | 
------------------------------------------------------------------------------------------------------------------------
 FOOTER MODAL FIXE                                                                             [ Annuler ] [ Enregistrer ]
========================================================================================================================