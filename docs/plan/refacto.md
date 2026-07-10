RÈGLES D'ARCHITECTURE ET DE CODAGE (À RESPECTER STRICTEMENT) :

1. Single Responsibility Principle (SRP) : 
   Un fichier = une seule tâche. Ne mélange pas la gestion d'état complexe et le rendu HTML dans le même fichier.

2. Extraction de la logique métier (Hooks / Composables) :
   Toute la logique algorithmique (ex: calculs de difficulté D&D 2024, gestion des timers, filtres de recherche) doit être extraite dans des fichiers de logique dédiés (ex: `useEncounterBudget.js`, `useCombatInitiative.js`).

3. Composants "Dumb" réutilisables :
   Découpe l'IHM de manière atomique. Par exemple, pour l'Encounter Builder, isole :
   - `MonsterRow` (la ligne d'un monstre)
   - `BudgetSidebar` (le panneau de calcul XP)
   - `EncounterTable` (le tableau principal)
   Ces composants doivent être "purs" (présentationnels) et ne dépendre que des props.

4. Limite de taille de fichier :
   Aucun fichier de composant UI ne doit dépasser 150 lignes de code. Si tu approches de cette limite, arrête-toi et extrait un sous-composant ou un hook avant de continuer.

5. Code auto-documenté :
   Préfère un code explicite et modulaire plutôt que des commentaires massifs dans un fichier géant.


   ----
   CONSIGNES DE SÉPARATION DES COUCHES (ELECTRON + REACT + TAILWIND) :

1. Architecture des dossiers :
   - Organise le code par "feature" dans `src/renderer/features/[nom-du-module]`.
   - Pas de fichier unique pour un module complet. Extrais systématiquement les sous-composants dans un dossier `components/` local à la feature.

2. Isolation Electron (IPC) :
   - Interdiction d'appeler le bridge Electron (`window.api` ou `ipcRenderer`) directement dans l'IHM.
   - Crée des fonctions de service dans un fichier `services/storage.ts` (ou équivalent) et consomme-les via des React Hooks.

3. Logique vs Rendu :
   - Un composant de vue ne doit pas contenir plus de 15 lignes de fonctions pures (handlers, calculs).
   - Tout calcul complexe (ex: vérifier les seuils d'XP D&D 2024, filtrer le bestiaire) doit vivre dans un Custom Hook (ex: `useEncounterBudget.ts`).

4. Lisibilité Tailwind :
   - Si une chaîne de caractères Tailwind dépasse 8 classes, isole le composant ou passe à la ligne pour chaque élément enfant afin de maintenir la scannabilité du fichier JSX.
   - Limite stricte : 150 lignes maximum par fichier `.jsx` / `.tsx`.
----


Adopter une structure par "Feature" (Fonctionnalité)
Au lieu de tout ranger dans un dossier components/ générique qui va vite devenir un cimetière de 50 fichiers, force Cline à utiliser une approche par domaine.
La structure cible :
   src/
└── renderer/
    └── features/
        ├── encounter-builder/
        │   ├── components/       # Sous-composants (MonsterRow, BudgetSidebar)
        │   ├── hooks/            # Logique D&D (useEncounterCalculations)
        │   └── EncounterPage.jsx # Le point d'entrée du module
        └── combat-tracker/