# Feature: Application Landing Page & Dashboard

## Purpose
Offrir une page d'accueil immersive, moderne et engageante dès le lancement de l'application. Elle élimine l'effet "page blanche" en masquant la navigation globale au profit d'une expérience "plein écran" (style Grimoire Loot), guidant le Maître du Donjon (MJ) via des raccourcis d'action directs et un résumé dynamique de ses données locales.

## User outcome
**Entrée simplifiée et engageante**
- Découvrir l'application grâce à une section "Hero" accrocheuse valorisant la compatibilité avec D&D 2024.
- Lancer instantanément la création d'un personnage, d'un monstre ou d'une rencontre via des cartes d'accès rapide graphiques sans l'encombrement visuel du menu latéral.

**Raccourcis tactiques & Changement de contexte**
- Visualiser le volume total de données en bibliothèque (Nombre de PJ actifs, Monstres créés, Rencontres prêtes).
- Reprendre instantanément la dernière rencontre en cours ou charger rapidement un élément récemment modifié, ce qui bascule automatiquement l'interface dans le mode applicatif complet avec son menu de navigation.

## Entry points
- Affiché automatiquement à l'URL racine (`/`) au lancement de l'application.
- Accessible via le logo de l'application ou l'onglet "Tableau de bord" tout en haut du menu latéral gauche depuis n'importe quel autre module.

---

# Spécification Technique : Feature Landing Page

## 1. Modèles de Données & Gestion de l'État Dynamique

### 1.1 Compteurs de Bibliothèque (Analytics Badges)
Pour rendre la page vivante, le système doit interroger les bases locales (IndexedDB / LocalStorage) au chargement de la route `/` pour injecter les variables suivantes :
*   `total_pcs` : Nombre total de fiches de personnages joueurs enregistrées.
*   `total_monsters` : Nombre de monstres Homebrew stockés en base locale.
*   `total_encounters` : Nombre de combats préparés et prêts à l'action.

### 1.2 Raccourcis de Reprise Rapide (Quick Resume)
La section inférieure extrait les métadonnées de la table des Rencontres :
*   Le système liste les 2 dernières rencontres ayant subi une modification récente (`updated_at`).
*   Si une rencontre possède un état "En cours", elle est dotée d'un badge visuel prioritaire.

---

## 2. Architecture des Renders & Layouts Conditionnels

L'application est découpée en deux modes d'affichage exclusifs gérés par le routeur de l'application en fonction de l'URL active.

```text
[URL: / ] ──────────────► [ LandingLayout ] ──► 100% Largeur (Pas de menu latéral)
[URL: /personnages ] ───► [ AppLayout ] ──────► Menu Latéral Fixe (Gauche) + Zone de travail (Droite)
```

### 2.1 Le Conteneur "LandingLayout" (Route racine `/`)
*   **Comportement** : Le menu latéral global est totalement non-monté (unmounted) dans le DOM. Le conteneur principal prend 100% de la largeur de la fenêtre (`w-full` / `min-h-screen`).
*   **Structure visuelle** : 
    *   **Section Hero (Bannière Principale)** : Titre massif, sous-titre immersif ("Aiguisez vos dés...") et un micro-badge technologique indiquant `D&D 2024 (5.5e) Ready`.
    *   **Grille des Modules (4 Feature Cards)** : Cartes responsives au style épuré (Encounter Builder, Combat Tracker, PC Builder, Monster Builder) avec boutons d'action à forte visibilité.
    *   **Section Activité Récente** : Flux asymétrique présentant les derniers fichiers manipulés.

### 2.2 Le Conteneur "AppLayout" (Toutes les autres routes applicatives)
*   **Comportement** : Le menu latéral s'affiche de manière fixe à gauche (largeur fixe, ex: 260px). La zone de travail à droite occupe le reste de l'espace disponible de manière fluide.
*   **État Actif** : Le menu met automatiquement en surbrillance l'onglet correspondant à la route courante (ex: si l'URL est `/personnages`, l'icône `👤 Personnages` s'active).

---

# Business rules

## 1. Flux de Navigation & Transmission d'État (Deep Linking)
*   **[RG-9-1-01] Redirection & Ouverture de Formulaire** : Lorsque l'utilisateur clique sur un bouton d'action directe de création depuis la Landing Page (ex: `[ + Nouveau Personnage ]`), l'application doit effectuer une double action :
    1. Rediriger l'utilisateur vers la route cible (ex: `/personnages`), ce qui provoque l'apparition immédiate du menu latéral via le chargement du `AppLayout`.
    2. Transmettre un paramètre d'état ou une query string (ex: `/personnages?action=create`) pour forcer le module de destination à ouvrir automatiquement son modal de configuration à l'atterrissage.
*   **[RG-9-1-02] Retour à l'Accueil (Reset de Layout)** : Dans le menu latéral du `AppLayout`, le clic sur le logo de l'application ou sur l'onglet `[🏠] Tableau de bord` redirige vers la route racine `/`. L'application démonte alors instantanément le menu latéral et bascule à nouveau en mode immersif plein écran.
*   **[RG-9-1-03] Reprise de Combat** : Le clic sur `[ Charger le combat ]` depuis la section "Activité Récente" redirige vers la route `/combat-tracker`, injecte la rencontre en mémoire vive, et monte le `AppLayout` avec l'onglet `[📊] Combat Tracker` sélectionné.

## 2. Sécurité du Tracker de Combat
*   **[RG-9-2-01] Guardrail d'Initialisation** : Si l'utilisateur clique sur `[ ⚔️ Lancer le Tracker ]` depuis la Landing Page alors qu'aucune rencontre n'est active ou sélectionnée au préalable, le système bloque la navigation vers `/combat-tracker` et le redirige vers l'Encounter Builder (`/rencontres`) avec une notification : *"Veuillez sélectionner ou créer une rencontre avant de démarrer le combat."*

---

# Visuels de l'IHM (Wireframes ASCII)

## 1. ÉCRAN D'ACCUEIL INITIAL : Vue Plein Écran (`LandingLayout`)

### Version sans menu
========================================================================================================================
 [🎯] MONSTER COMBAT COMPANION                                                                    [ D&D 2024 EDITION ]
========================================================================================================================

                                            🛡️ COMPANION ENGINE //
                                         <h1> LE GRIMOIRE TACTIQUE </h1>
               Aiguisez vos dés. Créez, équilibrez et menez vos combats D&D 2024 en quelques clics.
               
             [ 👥 12 Héros en jeu ]          [ 👾 45 Monstres Homebrew ]          [ 📖 8 Rencontres prêtes ]

------------------------------------------------------------------------------------------------------------------------
  ⚡ SÉLECTIONNEZ UN MODULE POUR ENTRER DANS L'APPLICATION
------------------------------------------------------------------------------------------------------------------------
  
  ┌──────────────────────────────────────────────┐    ┌──────────────────────────────────────────────┐
  │ ⚔️ ENCOUNTER BUILDER                         │    │ 📊 COMBAT TRACKER                            │
  │ Planifiez des affrontements tactiques        │    │ Suivez l'initiative, les points de vie       │
  │ équilibrés pour vos groupes de joueurs.      │    │ et les concentrations en temps réel.         │
  │                                              │    │                                              │
  │ [ + Préparer un combat ]                     │    │ [ ⚔️ Lancer le Tracker ]                      │
  └──────────────────────────────────────────────┘    └──────────────────────────────────────────────┘
  
  ┌──────────────────────────────────────────────┐    ┌──────────────────────────────────────────────┐
  │ 👤 PC BUILDER (D&D 2024)                     │    │ 👾 MONSTER BUILDER                           │
  │ Configurez l'arsenal, les expertises,        │    │ Façonnez vos menaces Homebrew sur mesure     │
  │ et les Weapon Masteries de vos héros.        │    │ ou importez des monstres SRD officiels.      │
  │                                              │    │                                              │
  │ [ + Nouveau Personnage ]  ◄─── (CLIC EXEMPLE)│    │ [ + Nouveau Monstre ]                        │
  └──────────────────────────────────────────────┘    └──────────────────────────────────────────────┘

------------------------------------------------------------------------------------------------------------------------
  🕒 REPRENDRE RAPIDEMENT
------------------------------------------------------------------------------------------------------------------------
  > Embuscade sur la route (Niv. 2) ─── [ Difficile ] ─── 3 monstres ────────────────────────── [ Charger le combat ]
  > Le Repaire du Dragon (Niv. 5) ───── [ Mortelle  ] ─── 1 monstre ─────────────────────────── [ Charger le combat ]

========================================================================================================================


### Version avec menu latéral
========================================================================================================================
 [🎯] MONSTER COMBAT COMPANION                                                                    [ D&D 2024 EDITION ]
========================================================================================================================
 MENU LATÉRAL          | ZONE PRINCIPALE : TABLEAU DE BORD D'ACCUEIL (`DashboardView`)
                       |------------------------------------------------------------------------------------------------
 [🏠] Tableau de bord  |
 [👤] Personnages      |   🛡️ COMPANION ENGINE //
 [👾] Bestiaire        |   <h1> LE GRIMOIRE TACTIQUE </h1>
 [⚔️] Rencontres       |   Aiguisez vos dés. Créez, équilibrez et menez vos combats D&D 2024 en quelques clics.
 [📊] Combat Tracker   |   
                       |   [ 👥 %total_pcs% Héros en jeu ]   [ 👾 %total_monsters% Monstres ]   [ 📖 %total_encounters% Rencontres ]
 ----------------------|------------------------------------------------------------------------------------------------
                       |  ⚡ SÉLECTIONNEZ UN OUTIL POUR COMMENCER
                       | -----------------------------------------------------------------------------------------------
                       |  ┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐
                       |  │ ⚔️ ENCOUNTER BUILDER                     │  │ 📊 COMBAT TRACKER                        │
                       |  │ Planifiez des affrontements tactiques    │  │ Suivez l'initiative, les points de vie    │
                       |  │ équilibrés pour vos groupes de joueurs.  │  │ et les concentrations en temps réel.    │
                       |  │                                          │  │                                          │
                       |  │ [ + Préparer un combat ]                 │  │ [ ⚔️ Lancer le Tracker ]                  │
                       |  └──────────────────────────────────────────┘  └──────────────────────────────────────────┘
                       |  ┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐
                       |  │ 👤 PC BUILDER (D&D 2024)                 │  │ 👾 MONSTER BUILDER                       │
                       |  │ Configurez l'arsenal, les expertises,    │  │ Façonnez vos menaces Homebrew sur mesure │
                       |  │ et les Weapon Masteries de vos héros.    │  │ ou importez des monstres SRD officiels.  │
                       |  │                                          │  │                                          │
                       |  │ [ + Nouveau Personnage ]                 │  │ [ + Nouveau Monstre ]                    │
                       |  └──────────────────────────────────────────┘  └──────────────────────────────────────────┘
                       | -----------------------------------------------------------------------------------------------
                       |  🕒 ACTIVITÉ RÉCENTE                                      | 👥 STATUT DU GROUPE ACTIF
                       | ----------------------------------------------------------|------------------------------------
                       |  > Embuscade sur la route (Niv. 2)        [ Difficile ]   |  • Thorgar (Fighter 3) : ❤️ 28/28 PV
                       |    Modifié il y a 10 min • 3 monstres                     |  • Lyra (Wizard 3)      : ❤️ 18/18 PV
                       |                                                           |  • Cadvan (Cleric 3)    : ❤️ 24/24 PV
                       |  > Le Repaire du Dragon (Niv. 5)          [ Mortelle  ]   | 
                       |    Modifié hier • 1 monstre                               | [ 📋 Gérer l'équipe de jeu ]
                       |                                                           | 
                       |  [ 📂 Voir toutes les rencontres ]                        |


---

## 2. CINÉMATIQUE APRÈS CLIC : Transition vers `AppLayout` (Exemple avec PC Builder)

Dès le clic sur `[ + Nouveau Personnage ]`, l'application bascule sur la route `/personnages?action=create`. Le menu latéral apparaît instantanément à gauche, confirmant le changement d'état visuel et l'immersion progressive dans l'outil de gestion.


========================================================================================================================
 [🎯] BATTLE GRIMOIRE  |  CRÉER UN PERSONNAGE  (Modal automatiquement ouvert via ?action=create)                  [ X ]
========================================================================================================================
 [🏠] Tableau de bord |  COLONNE GAUCHE : FORMULAIRE                 | COLONNE DROITE : APPERÇU TACTIQUE
 [👤] Personnages (*) | ---------------------------------------------|--------------------------------------------------
 [👾] Bestiaire       |  ▼ SECTION 1 : IDENTITÉ                      |  [Nom du personnage]
 [⚔️] Rencontres      |    Nom Perso : [                        ]    |  Niveau 1 • Classe
 [📊] Combat Tracker  |    Nom Joueur: [                        ]    |  ------------------------------------------------
                      |    Niveau :    [ 1   ▼ ]                     |  ❤️ HP Max : --          🛡️ CA : --
                      |                                              |
                      |  ▼ SECTION 2 : CARACTÉRISTIQUES              |  JETS DE SAUVEGARDE
                      |    FOR : [ 10 ] (+0) [ ] Sauvegarde          |       FOR: +0   |      DEX: +0   |      CON: +0
                      |    DEX : [ 10 ] (+0) [ ] Sauvegarde          |  ------------------------------------------------
========================================================================================================================