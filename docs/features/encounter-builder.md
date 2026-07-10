# Feature: Encounter Builder
## Purpose
Permet de construire, évaluer et stocker les affrontements à venir dans vos parties de D&D
## User outcome
**Construire une rencontre**
- Rechercher et importer des joueurs (PC) depuis la bibliotheque dédiée (fonctionnalité "Players")
- Rechercher et importer des monstres homebrew depuis la bibliotheque dédiée (fonctionnalité "Monster")
- Rechercher et importer des monstres depuis la liste des monstres officiels (via les API)
- Filtrer les monstres par critères (CR, Environnement, Nom, provenance ...)
- Ajoutez plusieurs monstres du même type avec compteur de quantité soit avec les HP moyen, soit lancés aux dés.

**Evaluer la difficulté et les récompense**
- Calcul automatique du niveau de la difficulté basé sur le niveau moyen des joueurs et leur nombres
- Respect des règles officielles pour la difficultés
- Calcul automatique de l'XP du combat
- Définition d'un butin éditable pour la rencontre ou calcul randomisé de la récompense en se basant sur le matériel officiel

**Affichage de la rencontre**
- Affichage des participants à la rencontre dans un tableau dédié
- Affichage d'un détail des monstres et joueur par utilisation soit des API externes de D&D soit des informations de la librairies des monstres/joueurs

**Sauvegarde**
- Sauvegarder les rencontres dans une librairies de rencontre
- Possibilité de créér une nouvelle rencontre en dupliquant une rencontre existante
- Affichage et édition des rencontres sauvegardées
## Entry points
- Sur la landing page : encart Rencontres
- Dans le menu lateral : Rencontres (avec icone)
- Dans l'écran de gestion des combats > selection d'une rencontre > si aucune Rencontre n'existe dans la librairie de Rencontre un bouton permet de lancer l'écran de création de rencontre

# Spécification Technique : Feature Encounter Builder

## 1. Modèles de Données & Gestion de l'État

### 1.1 Modèle d'une Rencontre (Encounter Model)
Chaque rencontre enregistrée dans la bibliothèque est un objet autonome. Afin d'éviter les ruptures de liens (par exemple, si un utilisateur supprime un monstre ou un personnage de la bibliothèque globale), la rencontre doit cloner et figer les données des combattants au moment de l'enregistrement.

**Propriétés de l'objet Rencontre :**
*   **Identifiant unique** : Un UUID généré automatiquement.
*   **Titre** : Une chaîne de caractères (Saisie utilisateur ou valeur par défaut dynamique).
*   **Environnement** : Une chaîne de caractères optionnelle (ex: "Donjon", "Forêt").
*   **Dates** : Horodatages de création et de mise à jour (format ISO 8601).
*   **Groupe (Party)** :
    *   Nombre total de joueurs (PJ).
    *   Niveau moyen du groupe (calculé).
    *   **Liste des joueurs importés**, chaque joueur contenant :
        *   Identifiant unique (UUID ou référence d'origine).
        *   Nom du personnage (String).
        *   Nom du joueur (String).
        *   Classe (String).
        *   Niveau (Nombre entier).
        *   Points de vie maximum (Nombre entier).
        *   Classe d'armure / CA (Nombre entier).
*   **Monstres** : Liste des instances de monstres présentes. Chaque monstre possède un identifiant unique propre à son instance dans cette rencontre (permettant d'avoir plusieurs fois le même monstre sur des lignes distinctes).
*   **Butin (Loot)** : Une zone de saisie libre sous forme de texte brut (String) uniquement.
*   **Calculs dynamiques stockés** :
    *   XP de base (Somme des XP bruts).
    *   XP ajusté (Calculé selon les règles de calcul de l'application).
    *   XP par PJ (XP ajusté divisé par le nombre de PJ).
    *   Niveau de difficulté (Valeurs autorisées : Triviale, Facile, Moyenne, Difficile, Mortelle).

---

## 2. Architecture des Écrans & Layouts

Cette section décrit l'agencement structurel de l'interface sans imposer de choix graphiques stricts (couleurs, polices), afin de permettre sa portabilité.

### 2.1 Écran Principal : Liste des Rencontres (EncountersView)

#### 2.1.1 Conteneur Supérieur : En-tête (Header)
*   **Titre Principal** : Libellé "Rencontres".
*   **Sous-titre** : Libellé "Gérez vos rencontres et créez des combats équilibrés".
*   **Action Principale** : Bouton "Nouvelle rencontre" avec une icône de type `Plus` (déclenche l'ouverture du Modal Builder).

#### 2.1.2 Zone Centrale : Recherche et Filtres
*   **Barre de Recherche** : Un champ de saisie de texte unique doté d'une icône `Loupe`.
    *   *Texte d'invite (Placeholder)* : "Rechercher une rencontre...".
    *   *Comportement* : Filtrage dynamique en temps réel sur la liste inférieure.

#### 2.1.3 Zone Basse : Liste des Rencontres
*   **État Vide (Aucune donnée en base)** : Affichage centré dans l'espace disponible (visible dans image_ce9828.png) :
    *   Une icône sémantique de type `Livre ouvert`.
    *   Un message principal : "Aucune rencontre".
    *   Un message secondaire : "Créez votre première rencontre pour commencer".
*   **État Liste (Une ou plusieurs rencontres)** : Liste verticale composée de lignes interactives individuelles. Chaque ligne de rencontre présente l'anatomie suivante :
    *   **Section Gauche (Informations)** :
        *   Nom ou titre de la rencontre.
        *   Un Badge de difficulté (portant la mention de la difficulté calculée : Triviale, Facile, etc.).
        *   Une ligne de métadonnées secondaires textuelles formatée ainsi : `X monstre(s) • Y XP ajusté • Groupe: A × Niv.B`.
    *   **Section Droite (Actions)** : Alignement horizontal de boutons d'actions rapides (icônes seules) dans l'ordre strict suivant :
        *   Bouton `Éditer` (icône Crayon) : Ouvre le modal en mode édition.
        *   Bouton `Dupliquer` (icône Copie) : Clone la rencontre.
        *   Bouton `Démarrer` (icône Épée/Play) : Lance le module de combat.
        *   Bouton `Supprimer` (icône Poubelle) : Déclenche la modale de confirmation.
        *   Bouton `Développer/Réduire` (icône Flèche/Chevron) : Déplie le volet inférieur.
    *   **Sous-panneau de Détail (Dépliable)** : Masqué par défaut, s'affiche sous la ligne lors d'un clic sur le chevron ou sur la ligne. Il présente une grille responsive contenant les vignettes des monstres inclus :
        *   *Anatomie d'une vignette monstre* : Nom du monstre, son type, sa taille, son Facteur de Puissance (CR), ses points de vie maximum (HP), sa Classe d'Armure (CA), et un badge numérique affichant sa quantité (ex: "X2").

---

### 2.2 Écran Modal : Création & Édition (EncounterBuilder)
Basé sur la structure à 3 colonnes et la ligne d'information inférieure visible dans le fichier image_ce98a2.png. Cet écran s'affiche en superposition plein écran.

#### 2.2.1 Bandeau Supérieur (Header Modal)
*   **Titre de l'action** : "Créer une rencontre".
*   **Champ d'édition du Titre** : Zone textuelle permettant de renommer la rencontre. Valeur par défaut dynamique : `Rencontre_dd/MM/yyyy_<incrément>` si aucun nom n'est saisi à l'enregistrement.
*   **Compteurs Globaux** : Un indicateur textuel au format `X combattant • Y PJ` mis à jour dynamiquement selon le contenu de la colonne centrale.
*   **Fermeture** : Un bouton de fermeture (icône `Cross`) dans l'angle supérieur droit.

#### 2.2.2 Corps Principal (Grille à 3 Colonnes Responsives)

##### A. Colonne Gauche : Module de Recherche (1/3 de la largeur)
Un système d'onglets commutables : **"Personnages (X)"** et **"Monstres (Y)"** avec barre de recherche textuelle globale par onglet.

*   **Anatomie d'une ligne dans l'Onglet Personnages** :
    *   *Informations* : Nom du personnage, Classe, Niveau (affiché `Niv. <niveau>`), Points de vie maximum (icône `Cœur` + `<pv_max> PV`), Classe d'armure (affiché `CA <ca>`).
    *   *Action* : Un bouton d'action `Plus`.
    *   *Comportement d'état* : Si le joueur est déjà présent dans la liste centrale (colonne centrale), le bouton `Plus` est remplacé par un badge statique **"Ajouté"** et l'intégralité de la carte passe en affichage grisé (`disabled`), empêchant un double ajout.

*   **Anatomie d'une ligne dans l'Onglet Monstres** :
    *   *Informations* : Nom complet du monstre, Facteur de puissance (CR rating), Type, Abréviation de la taille (ex: M, L, G), Étiquette ou tag de provenance (ex: "SRD 2024", "Homebrew").
    *   *Actions* : Deux boutons d'action distincts placés en bout de ligne :
        1.  Bouton `Plus` : Ajoute le monstre à la liste centrale avec ses **HP moyens**.
        2.  Bouton `Dés` (icône Dice) : Ajoute le monstre à la liste centrale avec un **calcul de PV max lancés aux dés** (basé sur sa formule de dés de vie).

##### B. Colonne Centrale : Liste des Combattants Sélectionnés (1/3 de la largeur)
Affichage vertical ordonné des combattants ajoutés à la rencontre, séparés par une distinction visuelle subtile entre PJ et Monstres.

*   **Carte Joueur (PJ)** :
    *   *Visuel* : Nom, Classe, Niveau (`Niv. <niveau>`), indicateur HP max (icône `Cœur` + valeur), indicateur CA (icône `Bouclier` + valeur).
    *   *Action* : Un bouton de suppression unique (icône `Poubelle` ou `X`).

*   **Carte Monstre** :
    *   *Visuel* : Nom du monstre, Facteur de puissance (CR), indicateur HP Max (icône `Cœur` + valeur), indicateur CA (icône `Bouclier` + valeur numérique entière). Chaque monstre ajouté possède sa propre carte individuelle (pas de regroupement par quantité dans cette colonne).
    *   *Actions* (Alignement horizontal d'icônes) :
        1.  Bouton `Visibilité` (icône `Œil`) : Gère le statut pour les joueurs. Bascule cyclique au clic : État "Visible" (icône œil ouvert) $\leftrightarrow$ État "Caché" (icône œil barré). Statut par défaut : "Visible".
        2.  Bouton `Dupliquer Monstre` (icône `Plus`) : Ajoute instantanément une nouvelle carte de ce monstre identique avec les mêmes caractéristiques de base au combat (+1 monstre identique).
        3.  Bouton `Suppression` (icône `Poubelle` ou `X`) : Retire ce monstre de la rencontre.

##### C. Colonne Droite : Fiche de Détail Dynamique (1/3 de la largeur)
*   Prend toute la hauteur disponible. Affiche la fiche technique complète du combattant actuellement sélectionné dans la colonne centrale.
*   **Comportement selon le type de combattant** :
    *   **Si c'est un Joueur (PJ)** : Afficher l'ensemble des informations du joueur stockées en base de données. Pour la structure exacte de cet affichage, l'agent devra strictement **se référer au document de spécification globale des Joueurs (Players/Characters)**.
    *   **Si c'est un Monstre** : Afficher la fiche technique complète en exploitant l'ensemble des données récupérées via l'API Open5e (ou les données équivalentes de la base locale si le filtre *Homebrew* est actif) : caractéristiques (FOR, DEX, etc.), actions, capacités spéciales, résistances, et descriptifs.
*   *État par défaut* : Si aucun combattant n'est sélectionné, affiche une icône d'œil centrée avec le message "Pas de combattant sélectionné. Cliquez sur un combattant dans la liste centrale".

#### 2.2.3 Section Basse d'Information (Grille à 2 Colonnes)
Disposée horizontalement sur toute la largeur, sous la grille des 3 colonnes.
*   **Colonne Gauche : Module Statistiques & Difficulté**
    *   Indicateur textuel du niveau moyen calculé du groupe.
    *   Indicateurs numériques : "XP de base", "XP par PJ".
    *   Composant visuel de type `Jauge de progression` ou `Barre de seuil` affichant graphiquement le niveau de difficulté globale (Triviale à Mortelle).
*   **Colonne Droite : Module Butin (Loot)**
    *   Une zone de saisie de texte libre multi-lignes (Textarea).
    *   Un bouton d'action "Générer aléatoirement" doté d'une icône représentant un `Dé`.

#### 2.2.4 Barre d'Actions Fixe (Footer)
Bandeau horizontal ancré tout en bas de l'écran contenant deux boutons alignés à droite :
*   Bouton `Annuler` (icône `Cross`).
*   Bouton `Créer la rencontre` / `Enregistrer` (icône `Disquette`).



# Business rules
## 1. Règles Métier & Logique de Calcul : Module Statistiques et Difficulté (Moteur D&D 5.5e / 2024)

Le moteur de calcul doit appliquer strictement les règles d'équilibrage du *Dungeon Master's Guide 2024 (D&D 5.5e)*. Le système de multiplicateur d'XP basé sur le nombre de monstres est supprimé[cite: 1].

### 1.1 Calcul des Niveaux et Budgets du Groupe
1. **Niveau Moyen du Groupe** : Somme des niveaux de tous les PJ divisée par le nombre total de PJ, arrondie à l'entier supérieur (ex: un groupe composé de deux niveaux 1 et un niveau 2 donne : $(1+1+2)/3 = 1.33 \rightarrow$ Arrondi au supérieur = Niveau 2)[cite: 1]. Si aucun PJ n'est présent, le niveau affiche "N/A"[cite: 1].
2. **Seuils de Difficulté par Joueur (Tableau DMG 2024)** : Chaque niveau de PJ apporte un "budget" d'XP à la rencontre selon quatre paliers de difficulté (Facile, Moyen, Difficile, Mortel)[cite: 1]. L'agent doit intégrer le tableau officiel complet issu du DMG 2024 (Exemple pour le Niveau 1 : Facile = 25 XP, Moyen = 50 XP, Difficile = 75 XP, Mortel = 100 XP)[cite: 1].
3. **Budget Global de la Rencontre** : L'application calcule les 4 seuils globaux du combat en additionnant les budgets individuels de chaque PJ présent[cite: 1].

### 1.2 Calculs Écran Bas et Affichage IHM
*   **XP de base** : Somme mathématique brute de la valeur d'XP de chaque monstre individuel ajouté dans la colonne centrale[cite: 1].
*   **XP par PJ** : `XP de base` divisé par le `Nombre de PJ`[cite: 1].
*   **Calcul et Jauge de Difficulté** :
    *   L'application compare l'**XP de base** de la rencontre avec les 4 Seuils Globaux calculés pour le groupe[cite: 1].
    *   **Triviale** : Inférieur au Seuil Facile Global[cite: 1].
    *   **Facile** : Égal ou supérieur au Seuil Facile, mais inférieur au Seuil Moyen[cite: 1].
    *   **Moyenne** : Égal ou supérieur au Seuil Moyen, mais inférieur au Seuil Difficile[cite: 1].
    *   **Difficile** : Égal ou supérieur au Seuil Difficile, mais inférieur au Seuil Mortel[cite: 1].
    *   **Mortelle** : Égal ou supérieur au Seuil Mortel Global[cite: 1].

### 1.3 Génération des Points de Vie (HP) des Monstres
*   **Bouton "+" (HP Moyen)** : L'instance du monstre est créée avec la valeur entière fixe stockée dans le champ `hp` de base[cite: 1]. Seule cette valeur finale de points de vie maximum est affichée sur la carte[cite: 1].
*   **Bouton "Dés" (HP Lançés)** : L'application doit parser la chaîne de caractères de la formule de dés du monstre (ex: `3d8 + 6`)[cite: 1]. Elle effectue un tirage aléatoire simulé pour chaque dé, ajoute le modificateur fixe, et assigne le résultat comme le score de points de vie maximum de cette instance précise[cite: 1].

## 2. Module butin

### 2.2 Générateur de Butin Aléatoire
*   Le butin est saisi en texte libre dans la zone prévu à cet effet
*   Le bouton "Générer aléatoirement" (icône Dé) du composant Butin ouvre un nouvel onglet vers l'adresse externe externe `https://grimoire-loot.vercel.app/generator`[cite: 1].


## 3. MODULE DE RECHERCHE & FILTRES (COLONNE GAUCHE)

### 3.1 Structure Commune & Navigation
*   **[RG-3-1-01] Persistance de la recherche entre onglets** : Lorsqu'un utilisateur saisit un mot-clé dans la barre de recherche d'un onglet (ex: "Orc" dans l'onglet Monstres), puis bascule vers l'onglet Personnages, la barre de recherche s'adapte à l'onglet Personnages. S'il revient ensuite sur l'onglet Monstres, il doit retrouver le mot-clé "Orc" et les résultats correspondants. Le changement d'onglet désélectionne tout combattant actif (perte du focus et réinitialisation de la colonne droite à l'état par défaut).
*   **[RG-3-1-02] Comportement du Clavier** : L'appui sur la touche `Échap` (`Escape`) lorsque le focus est dans le champ de recherche de la colonne gauche doit vider l'intégralité du texte saisi.

### 3.2 Onglet "Personnages (PJ)"
*   **[RG-3-2-01] Hydratation des Données** : La liste est alimentée exclusivement par la base de données locale des personnages. Les personnages marqués comme "morts" en BDD ne doivent pas être listés.
*   **[RG-3-2-02] Logique de Recherche Full-Text** : La recherche textuelle applique un filtre insensible à la casse et aux accents. Elle doit tester uniquement les propriétés visibles sur la carte : `nom du personnage`, `classe`.
*   **[RG-3-2-03] Remplissage Automatique à l'Ajout (Bouton Plus)** : Au clic sur le bouton `Plus`, l'application clone les valeurs de l'instant T de la BDD (`nom`, `classe`, `niveau`, `hp_max`, `ca`) et les injecte dans le modèle de la rencontre. 
*   **[RG-3-2-04] Synchronisation d'État Univoque** : Si un personnage est présent dans la colonne centrale (détecté par son `Character_ID` d'origine), sa carte dans l'onglet de gauche passe immédiatement en mode `disabled` (opacité 50%), le bouton `Plus` devient invisible et est remplacé par un badge texte statique `"Ajouté"`. Dès que le personnage est retiré de la colonne centrale, sa carte gauche redevient instantanément interactive.
*   **[RG-3-2-05] Absence de donnée en bibliothèque** :  Si pas de personnage dans la liste, icone Personne +  avec le message "Aucun Joueur en librairie".
*   **[RG-3-2-06] Compteur onglet** : Le compteur de l'onglet "Personnage (<nombre>)" compte le nombre de résultat retourné dans la liste (nombre de personnages)

### 3.3 Onglet "Monstres" - Commutateur Standard (homebrew=false)
*   **[RG-3-3-01] Gestion du filtre Recherche** : La recherche agit comme un filtre sur le nom des monstres sur l'ensemble des monstres en bdd issus de l'API.
*   **[RG-3-3-02] Stratégie de gestion de la donnée** : Les informations de l'API open5e doivent être appelée une première fois au premier besoin (condition a voir ci après), les données obtenues seront enregistrée en base, mais séparée des monstres homebrew créé depuis le module de monstre de l'application. Un timestamp est posé pour tracer la dernière mise à jour de la base de monstre depuis l'API. L'api est appellé pour remplir les données, si cette dernière est vide, ou si le dernier appel pour remplir la bdd date de plus de 10jours
*   **[RG-3-3-03] Pagination Obligatoire (API)** : Le nombre de monstres étant volumineux, l'interface doit afficher les monstres par blocs de **20 résultats**. Deux boutons ("Précédent" / "Suivant") sont ancrés en bas de la colonne :
    *   Le bouton "Précédent" est `disabled` si `page == 1`.
    *   Le bouton "Suivant" est `disabled` s'il n'y a pas de page suivante.
    *   Changement de page : Remonte automatiquement le défilement (scroll) de la colonne gauche tout en haut.
*   **[RG-3-3-04] Ajout d'un monstre** Au clic sur le bouton `Plus`, l'application clone les valeurs de l'instant T de la BDD du monstre et les injecte dans le modèle de la rencontre. (Ajout du monstre à la rencontre) (cf  1.3 Génération des Points de Vie (HP) des Monstres)
*   **[RG-3-3-05] Ajout d'un monstre hp calculés** Au clic sur le bouton `Dice`, l'application clone les valeurs de l'instant T de la BDD hors PV du monstre et les injecte dans le modèle de la rencontre. Les PV eux sont calculés selon la formule de calcul des PV D&D5.5e du monstre. (cf 1.3 Génération des Points de Vie (HP) des Monstres)
*   **[RG-3-3-06] Compteur onglet** le compteur de l'onglet monstre dans le cas ou homebrew = false, renvoit le nombre de monstre total dans la liste.  
*   **[RG-3-4-04] Liste monstre vide** Si aucun monstre n'est disponible en bdd (monstre non homebrew), afficher l'icone 'Erreur' et le message : "Aucun monstre disponible dans la BDD" et en dessous le commentaire "Verifiez la disponibilité de l'API."
### 3.4 Onglet "Monstres" - Commutateur Standard (homebrew=true)
*   ** Isolation des Sources** : Lorsque le bouton à bascule (*Toggle*) "Homebrew" est activé (ON) :
    *   La pagination disparaît.
    *   La liste est hydratée à 100% par la table locale des monstres personnalisés créés par l'utilisateur en BDD, affichant leur étiquette "Homebrew".
*   **[RG-3-4-01] Compteur onglet** le compteur de l'onglet monstre dans le cas ou homebrew = true, renvoit le nombre de monstre homebrew disponible en base. 
*   **[RG-3-4-02] idem [RG-3-3-04]**
*   **[RG-3-4-03] idem [RG-3-3-05]**
*   **[RG-3-4-04] Liste monstre homebrew vide** Si aucun monstre n'est disponible en bdd, afficher l'icone 'epee' et le message : "Aucun monstre homebrew disponible"

## 4. GESTION DES COMBATTANTS SÉLECTIONNÉS (COLONNE CENTRALE)

### 4.1 Cycle de vie & Unicité des Instances
*   **[RG-4-1-01] Unicité des Personnages (PJ)** : Un personnage joueur (`Character_ID` unique) ne peut être présent qu'une seule et unique fois dans la colonne centrale. Son ajout bloque sa carte à gauche (voir `[RG-3-2-04]`).
*   **[RG-4-1-02] Multi-instanciation des Monstres** : Un même monstre issu de la colonne gauche peut être ajouté un nombre infini de fois dans la colonne centrale.
*   **[RG-4-1-03] Auto-incrémentation des Noms de Monstres** : Pour éviter les confusions lors du combat, chaque nouvelle instance d'un même monstre ajouté doit automatiquement recevoir un suffixe numérique incrémental basé sur le nombre d'instances de ce monstre déjà présentes.
    *   *Exemple* : Ajout de 3 Gobelins $\rightarrow$ "Gobelin 1", "Gobelin 2", "Gobelin 3".
    *   *Recyclage des index* : Si "Gobelin 2" est supprimé de la liste et qu'un nouveau Gobelin est ajouté, le système lui attribue le premier index disponible (ici "Gobelin 2").

### 4.2 Actions sur les Cartes
*   **[RG-4-2-01] Action de Focus (Sélection)** : Au clic direct sur le corps de n'importe quelle carte (PJ ou Monstre) dans la colonne centrale, celle-ci passe à l'état "Sélectionnée" (surbrillance de sa bordure) et charge instantanément sa fiche technique complète dans la colonne de droite.
*   **[RG-4-2-02] Action Visibilité (Monstres uniquement)** : Le clic sur le bouton `Visibilité` (icône `Œil`) bascule cycliquement le statut du monstre pour les joueurs : État "Visible" (icône œil ouvert) $\leftrightarrow$ État "Caché" (icône œil barré). Le statut par défaut est "Visible".
*   **[RG-4-2-03] Action Dupliquer Monstre (Monstres uniquement)** : Le clic sur le bouton `Dupliquer Monstre` (icône `Plus`) ajoute instantanément une nouvelle carte de ce monstre, identique avec les mêmes caractéristiques de base, juste en dessous dans la liste centrale.
*   **[RG-4-04] Action Suppression** : Le clic sur le bouton de suppression (icône `Poubelle` ou `X`) retire immédiatement le combattant de la colonne centrale. S'il s'agissait d'un PJ, sa carte dans l'onglet gauche redevient active. S'il avait le focus, la colonne de droite est réinitialisée à l'état vide par défaut.

### 4.3 États de Sélection et Actions (Focus / Suppression)
*   **[RG-4-3-01] Comportement de l'Œil de Focus** : Un seul combattant peut avoir le focus à la fois dans toute l'application.
    *   Au clic sur l'icône "Œil" d'un combattant, sa ligne passe en état actif (surbrillance visuelle). L'application envoie son identifiant à la colonne de droite pour hydrater la fiche technique.
    *   Si on clique sur l'œil d'un combattant déjà actif, cela désactive le focus, nettoie la ligne et réinitialise la colonne de droite à l'état par défaut (Œil central neutre).
*   **[RG-4-3-02] Suppression d'une Instance** : Le clic sur le bouton de suppression (icône poubelle / croix) retire immédiatement et définitivement le combattant de la liste centrale.
    *   Si le combattant supprimé possédait le focus actif (Œil), la colonne de droite est instantanément réinitialisée à l'état par défaut.
    *   S'il s'agissait d'un PJ, sa carte dans la colonne gauche redevient immédiatement disponible à l'ajout (opacité 100%, réapparition du bouton `Plus`).

## 5. FICHE DE DÉTAIL DYNAMIQUE (COLONNE DROITE)

### 5.1 États de Surface & Hydratation
*   **[RG-5-01] État Initial / Neutre** : Tant qu'aucun combattant de la colonne centrale n'est sélectionné (ou si le combattant sélectionné est supprimé), la colonne droite doit afficher exclusivement un œil central neutre texturé en fond, avec le texte : "Pas de combattant sélectionné" et le sous texte : "Cliquez sur un combattant dans la liste centrale".
*   **[RG-5-02] Hydratation sur Focus** : Au clic sur une carte de la colonne centrale, la colonne droite efface instantanément l'état neutre pour charger les données du combattant sélectionné. L'interface s'adapte dynamiquement selon le type de cible (Fiche PJ ou Fiche Monstre).

### 5.2 Rendu de la Fiche Personnage (PJ)
*   **[RG-5-03] Structure Simplifiée PJ** : La fiche technique d'un personnage joueur affiche uniquement ses données de référence importées de la base locale pour un personnage Joueur. Aucun bouton d'action ou d'édition n'est disponible sur cette fiche dans cette colonne.

### 5.3 Rendu de la Fiche Monstre (API ou Homebrew)
*   **[RG-5-04] Monstre non homebrew** : La fiche technique du monstre est structurée de haut en bas et reprends les informations mises à disposition par l'API d'open5e lorsque l'on effectue une recherche sur ce monstre.
*   **[RG-5-04] Monstre homebrew** : La fiche technique affiche les informations présente en BDD en respectant si possible le même layout que pour les details de monstres recu via l'api.

## 6. ÉCRAN PRINCIPAL : LISTE DES RENCONTRES (ENCOUNTERSVIEW)

### 6.1 Actions de l'En-tête & Barre de Recherche
*   **[RG-6-1-01] Déclenchement du Builder Modal** : Le clic sur le bouton "Nouvelle rencontre" (icône `Plus`) ouvre le Modal Builder de création de rencontre dans son état initial (champs vides, listes réinitialisées).
*   **[RG-6-1-02] Recherche Textuelle Dynamique** : La saisie dans le champ "Rechercher une rencontre..." applique un filtre synchrone et insensible à la casse et aux accents sur la liste des rencontres affichée. Le filtrage s'exécute exclusivement sur la propriété `nom ou titre de la rencontre`. 
*   **[RG-6-1-03] Comportement du Clavier (Recherche)** : L'appui sur la touche `Échap` (`Escape`) lorsque le focus est dans la barre de recherche vide instantanément le texte saisi et réaffiche l'intégralité de la liste des rencontres.

### 6.2 Gestion de l'État Vide et Hydratation
*   **[RG-6-2-01] Condition d'affichage de l'État Vide** : Si la base de données locale ne contient aucune rencontre ou si le filtre de recherche de la règle `[RG-6-02]` ne renvoie aucun résultat, l'application masque la liste et affiche le composant centré contenant l'icône `Livre ouvert`, le message principal "Aucune rencontre" et le sous-message associé.
*   **[RG-6-2-02] Hydratation depuis la Base de Données** : Au chargement de l'écran `EncountersView`, l'application effectue une requête synchrone ou asynchrone sur la base de données locale pour récupérer l'intégralité des rencontres sauvegardées. Par défaut, la liste est triée par ordre antéchronologique (la rencontre créée ou modifiée la plus récemment apparaît en haut).

### 6.3 Actions Rapides de la Ligne de Rencontre (Section Droite)
*   **[RG-6-3-01] Action Éditer (Crayon)** : Ouvre le Modal Builder de rencontre en lui injectant l'état et les données de la rencontre sélectionnée pour permettre sa modification.
*   **[RG-6-3-02] Action Dupliquer (Copie)** : Clone immédiatement la rencontre sélectionnée en base de données avec l'ensemble de ses monstres et caractéristiques. La nouvelle rencontre est insérée en haut de la liste avec le suffixe `" - Copie"` ajouté à son nom d'origine.
*   **[RG-6-3-03] Action Démarrer (Épée/Play)** : Ferme ou quitte l'écran de liste pour charger l'état de la rencontre sélectionnée et propulser l'utilisateur dans le module de combat actif.
*   **[RG-6-3-04] Action Supprimer (Poubelle)** : Interdit la suppression directe. Le clic doit obligatoirement ouvrir une modale de confirmation. Si l'utilisateur valide, la rencontre est définitivement supprimée de la BDD et la liste se met à jour.

### 6.4 Comportement du Sous-panneau de Détail Dépliable
*   **[RG-6-4-01] Déclenchement du Volet** : Le sous-panneau de détail d'une rencontre est masqué par défaut. Il se déplie (ou se replie) via une animation fluide soit au clic sur le bouton `Développer/Réduire` (Chevron), soit au clic direct sur une zone neutre de la section gauche (Informations) de la ligne.
*   **[RG-6-4-02] Indépendance des Volets** : L'ouverture du sous-panneau d'une rencontre n'interfère pas avec les autres. L'utilisateur peut développer plusieurs sous-panneaux simultanément.
*   **[RG-6-4-03] Agrégation des Vignettes de Monstres** : Contrairement à la colonne centrale du Builder, le sous-panneau regroupe obligatoirement les monstres identiques. Si une rencontre contient trois fois le même monstre, l'interface n'affiche qu'une seule vignette de ce monstre dotée du badge numérique `"X3"`.

### 6.5 Logique d'Affichage des Métadonnées (Sans Recalcul)
*   **[RG-6-5-01] Rendu Passif des Données Sauvegardées** : L'Écran Principal ne calcule rien dynamiquement. Les badges et textes de la section gauche de chaque ligne sont alimentés directement par les valeurs brutes stockées dans l'objet Rencontre lors de sa dernière sauvegarde en BDD :
    *   Le Badge de difficulté affiche la chaîne de caractères enregistrée (ex: `"Difficile"`).
    *   La ligne de métadonnées injecte directement les variables lues : `${encounter.total_monsters} monstre(s) • ${encounter.adjusted_xp} XP ajusté • Groupe: ${encounter.party_size} × Niv.${encounter.party_level}`.

----
 
## Technical notes
- [dette, contrainte, dépendance]
## Out of scope
- [à définir]

## Visualisation des Ecrans (ASCII)
1. ÉCRAN PRINCIPAL : Liste des Rencontres (EncountersView)
========================================================================================================================
 RENCONTRES                                                                                       [ + Nouvelle rencontre ]
 Gérez vos rencontres et créez des combats équilibrés
------------------------------------------------------------------------------------------------------------------------
 [ 🔍 Rechercher une rencontre...                                                                                     ]
========================================================================================================================

 📄 ÉTAT VIDE (AUCUNE DONNÉE EN BASE OU FILTRE SANS RÉSULTAT)
 ---------------------------------------------------------------------------------------------------------------------
                                                    📖
                                             Aucune rencontre
                                Créez votre première rencontre pour commencer
 ---------------------------------------------------------------------------------------------------------------------

 📄 ÉTAT LISTE (EXEMPLE DE LIGNES DE RENCONTRE : CONTRACTÉE ET DÉVELOPPÉE)
 ---------------------------------------------------------------------------------------------------------------------
  Embuscade sur la route                         [ Difficile ]  |    [ ✏️ ]   [ 📋 ]   [ ⚔️ ]   [ 🗑️ ]   [ 🔽 ]
  3 monstre(s) • 600 XP ajusté • Groupe: 4 × Niv.2              |     Edit     Dupl.   Démarrer  Suppr.   Chevron
 ---------------------------------------------------------------------------------------------------------------------
  Le Repaire du Dragon                           [ Mortelle ]   |    [ ✏️ ]   [ 📋 ]   [ ⚔️ ]   [ 🗑️ ]   [ 🔼 ]
  1 monstre(s) • 3900 XP ajusté • Groupe: 4 × Niv.5             |     Edit     Dupl.   Démarrer  Suppr.   Chevron
 .....................................................................................................................
 :  SOUS-PANNEAU DE DÉTAIL DÉPLIABLE (GRILLE RESPONSIVE DES VIGNETTES MONSTRES)                                      :
 :                                                                                                                    :
 :  ┌───────────────────────────────────┐                                                                             :
 :  │ Dragon Rouge Jeune        [ X1 ]  │                                                                             :
 :  │ Large Dragon, Neutral Evil        │                                                                             :
 :  │ CR 10 | HP: 178 | CA: 18          │                                                                             :
 :  └───────────────────────────────────┘                                                                             :
 :....................................................................................................................

 2. ÉCRAN MODAL : Création & Édition (EncounterBuilder)
 ========================================================================================================================
 CRÉER UNE RENCONTRE  |  Nom : [ Rencontre_06/07/2026_01          ]           📊 5 combattants • 4 PJ            [ X ]
========================================================================================================================
 COL. GAUCHE : RECHERCHE (1/3)        | COL. CENTRALE : SÉLECTION (1/3)     | COL. DROITE : DETAIL DYNAMIQUE (1/3)
--------------------------------------|-------------------------------------|-------------------------------------------
 [ Personnages (4) ] [ Monstres (22) ]| 👥 JOUEURS                          |  👁️ ÉTAT PAR DÉFAUT (SI RIEN DE SÉLECTIONNÉ)
                                      | ----------------------------------- | 
 [ 🔍 Filtrer...                    ] | ┌─────────────────────────────────┐ |                     👁️
                                      | │ Thorgar (Guerrier - Niv.3)      │ |         Pas de combattant sélectionné.
  👤 ONGLET PERSONNAGES               | │ ❤️ 28 HP          🛡️ 16 CA  [ 🗑️ ] │ |      Cliquez sur un combattant dans la
  ----------------------------------  | └─────────────────────────────────┘ |               liste centrale.
  Thorgar (Guerrier)                  |                                     | 
  Niv.3 | ❤️ 28 PV | CA 16  [ Ajouté ] | 👾 MONSTRES (CARTES INDIVIDUELLES)  | -------------------------------------------
  ----------------------------------  | ----------------------------------- | 📝 FICHE DE DETAIL (SI SELECTION VISUELLE)
  Lyra (Magicien)                     | ┌─────────────────────────────────┐ | 
  Niv.3 | ❤️ 18 PV | CA 12    [ + ]   | │ Gobelin 1             [ CR 1/4 ]  │ |  Gobelin
  ----------------------------------  | │ [🟢] ❤️ 7 HP      🛡️ 15 CA  [ 🗑️ ] │ |  Small Humanoid, Neutral Evil
                                      | └─────────────────────────────────┘ |  -----------------------------------------
  👾 ONGLET MONSTRES                  | ┌─────────────────────────────────┐ |  Classe d'Armure : 15 (Armure de cuir)
  [ Toggle Homebrew: OFF ⚪ ]         | │ Gobelin 2             [ CR 1/4 ]  │ |  Points de vie   : 7 (2d6)
  ----------------------------------  | │ [🔴] ❤️ 12 HP     🛡️ 15 CA  [ 🗑️ ] │ |  Vitesse         : 9m
  Gobelin                             | └─────────────────────────────────┘ |  -----------------------------------------
  CR 1/4 | Small Humanoid | [+][🎲]   | ┌─────────────────────────────────┐ |    FOR     DEX     CON     INT     SAG     CHA
  ----------------------------------  | │ Gobelin 3             [ CR 1/4 ]  │ |   8(-1)  14(+2)  10(+0)  10(+0)   8(-1)   8(-1)
  Orque                               | │ [🟢] ❤️ 7 HP      🛡️ 15 CA  [ 🗑️ ] │ |  -----------------------------------------
  CR 1/2 | Medium Humanoid| [+][🎲]   | └─────────────────────────────────┘ |  ACTIONS
                                      |                                     |  • Cimeterre : Attaque au corps à corps,
  [<< Préc.] [Suiv. >>]       Page 1  |                                     |    +4 au toucher. Touché : 5 (1d6+2) perc.
------------------------------------------------------------------------------------------------------------------------
 SECTION BASSE D'INFORMATION (GRILLE HORIZONTALE SUR TOUTE LA LARGEUR)
------------------------------------------------------------------------------------------------------------------------
 COLONNE GAUCHE : STATISTIQUES & DIFFICULTÉ                           | COLONNE DROITE : MODULE BUTIN (LOOT)
---------------------------------------------------------------------|--------------------------------------------------
  Niveau moyen du groupe : 3                                         |  [ Saisir le butin textuel ici...              ]
  XP de base : 150                                                   |  [                                             ]
  XP par PJ  : 37.5                                                  |  [                                             ]
                                                                     | 
  DIFFICULTÉ GLOBALE : [ Facile ]                                    | 
  [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ]               |  [ 🎲 Générer aléatoirement ]
  Triviale     Facile     Moyenne     Difficile     Mortelle         | 
------------------------------------------------------------------------------------------------------------------------
 FOOTER FIXE                                                                                   [ Annuler ] [ Enregistrer ]
========================================================================================================================

3. APPARENCE DE L'ONGLET MONSTRES EN MODE HOMEBREW
👾 ONGLET MONSTRES
  [ Toggle Homebrew: ON ⚫ ]         <-- La pagination disparaît automatiquement[cite: 1]
  ----------------------------------
  Spectre du Volcan  [Homebrew]
  CR 4 | Medium Undead    | [+][🎲]
  ----------------------------------
  Gorgone de Feu     [Homebrew]
  CR 5 | Large Monster    | [+][🎲]