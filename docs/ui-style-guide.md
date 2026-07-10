# Charte Graphique et Guide de Style : Grimoire Design System

Ce document définit l'identité visuelle, les tokens de design, les composants d'interface et les règles de style inspirés de l'application **Grimoire Loot**. Il a été conçu spécifiquement pour servir de référence (système de prompt) à un LLM (comme Nemotron Ultra via Cline) afin de générer de nouvelles interfaces en parfaite continuité visuelle.

---

## 1. Vision & Ambiance Générale
L'identité esthétique est de type **Dark Fantasy Moderne / RPG Épique**. Elle combine le mystère et l'authenticité des vieux grimoires de magie avec la clarté, la fluidité et l'ergonomie des interfaces SaaS modernes.

* **Mots-clés :** Mystique, Sombre (Dark Mode), Épuré, Luminescent (Glow), Premium, Jeu de Rôle (RPG).
* **Contraste Core :** Un fond très sombre, presque abyssal, contrasté par des typographies blanches haut de gamme et des touches de lumière magique vibrante (doré/ambre et couleurs de rareté).
* **Ton éditorial (Micro-copie) :** Un léger ton médiéval-fantastique subtil dans les instructions ("Configure thy encounter settings...", "Generate treasure for thy party"), tout en restant parfaitement lisible et moderne pour l'UX.

---

## 2. Palette de Couleurs (Design Tokens)

La palette repose sur une structure sombre stricte, relevée par des accents dorés et un système chromatique de rareté hérité des grands RPG.

### A. Couleurs de Fond & Neutres (Thème Sombre Principal)
* **Fond Principal (App Background) :** `#030712` (Tailwind `bg-gray-950` ou un noir abyssal `#090d16`)
* **Fond Surface / Cartes (Card Background) :** `#111827` (Tailwind `bg-gray-900`) ou `#0f172a` (`bg-slate-900`) avec une opacité subtile pour laisser deviner le fond.
* **Bordures Neutres :** `#1f2937` (Tailwind `border-gray-800`) ou `#334155` (`border-slate-700`)
* **Texte Principal (Body Text) :** `#f3f4f6` (Tailwind `text-gray-100`) - Très lisible, pas de blanc pur agressif.
* **Texte Secondaire (Muted Text) :** `#9ca3af` (Tailwind `text-gray-400`) pour les labels et descriptions secondaires.

### B. Couleur d'Accent Impérial (Magie / Or)
Utilisée pour les boutons d'action principaux, les focus, et les éléments de marque importants.
* **Or / Ambre Central :** `#fbbf24` (Tailwind `text-amber-400`) / `#f59e0b` (`amber-500`)
* **Glow Or (Ombre portée lumineuse) :** `rgba(245, 158, 11, 0.15)`

### C. Système de Rareté (Item & Loot System)
Chaque niveau de rareté possède sa propre signature chromatique pour créer une hiérarchie visuelle instantanée :
1.  **Common (Commun) :** `#9ca3af` (Gris / Tailwind `gray-400`)
2.  **Uncommon (Inhabituel) :** `#22c55e` (Vert Magique / Tailwind `green-500`)
3.  **Rare (Rare) :** `#3b82f6` (Bleu Azur / Tailwind `blue-500`)
4.  **Very Rare (Très Rare) :** `#a855f7` (Violet Mystique / Tailwind `purple-500`)
5.  **Legendary (Légendaire) :** `#f97316` (Orange Flamboyant / Tailwind `orange-500`)
6.  **Artifact (Artéfact) :** `#eab308` ou `#ef4444` (Or Antique ou Rouge Écarlate / Tailwind `yellow-500` ou `red-500`)

---

## 3. Typographie

L'alliance typographique est cruciale pour équilibrer le côté "historique/fantastique" et le côté "application moderne".

* **Titres Épiques (H1, H2, Noms d'items importants) :**
    * *Police :* Serif avec du caractère, de style médiéval ou romain élégant (ex: `Cinzel`, `Cormorant Garamond`, `Playfair Display`, ou à défaut `Georgia`).
    * *Style :* Souvent en majuscules (`uppercase`), grand espacement des lettres (`tracking-wider`), graisse semi-bold ou bold.
* **Corps de texte & Interface (Formulaires, Filtres, Tableaux) :**
    * *Police :* Sans-serif géométrique ultra-lisible (ex: `Inter`, `Plus Jakarta Sans`, `DM Sans`).
    * *Style :* Régulier, espacement standard, hautement lisible sur fond sombre.

### Échelle Typographique (Tailwind CSS) :
* `H1` (Titre de page comme "Loot Generator") : `font-serif text-3xl md:text-4xl font-bold tracking-tight text-gray-100 uppercase`
* `H2` (Titres de sections comme "Generator Settings") : `font-serif text-xl md:text-2xl font-semibold text-amber-400 tracking-wide mt-6 mb-4`
* `H3` (Sous-sections ou titres de cartes) : `font-sans text-lg font-medium text-gray-200`
* `Body` : `font-sans text-sm md:text-base text-gray-300 leading-relaxed`

---

## 4. Mises en Page & Grid (Structure Global)

* **Le Header (Navigation) :**
    * Fixe ou collé en haut, fond transparent avec un effet flou d'arrière-plan (`backdrop-blur-md bg-gray-950/70`).
    * Bordure inférieure fine et subtile (`border-b border-gray-800`).
    * Logo à gauche (Typographie Serif, ex: `Grimoire Loot` avec le mot "Loot" ou un symbole en couleur ambre), liens minimalistes sans-serif à droite.
* **Mise en page "Générateur / Dashboard" (Layout à 2 colonnes sur desktop) :**
    * *Colonne de Gauche (Paramètres) :* Panneau fixe ou défilant contenant les contrôles (Challenge Rating, Party Size, Filtres). Fond de carte texturé ou légèrement plus sombre.
    * *Colonne de Droite (Résultats / Loot affiché) :* Espace principal plus large où apparaissent les cartes d'items ou l'état vide ("No Loot Generated" avec un message invitant à l'action).
* **Conteneur Principal :** Centré, avec des paddings généreux (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).

---

## 5. Composants UI & Éléments Graphiques Spécifiques

Pour reproduire fidèlement l'interface, les composants doivent suivre ces règles strictes :

### A. Cartes d'Items (Magic Item Cards)
C'est le composant central de l'univers "Grimoire".
* **Structure :** Un rectangle aux angles légèrement arrondis (`rounded-xl` ou `rounded-lg`).
* **Fond :** Noir de surface (`bg-gray-900/50`) avec une bordure fine.
* **Bordure Dynamique :** La bordure de la carte ou un petit indicateur (badge) doit prendre la couleur associée à la rareté de l'item (ex: bordure verte pour un item *Uncommon*).
* **Effet Hover :** Légère élévation, intensification du glow de rareté, ou transition de l'opacité de la bordure.
* *Exemple visuel pour un item (ex: Bag of Holding) :* Un titre propre en haut, un badge indiquant le type d'item ("Uncommon Wondrous Item"), suivi d'une description textuelle claire en gris clair.

### B. Boutons d'Action (Buttons)
* **Bouton Principal ("Generate Loot") :**
    * Doit attirer toute l'attention.
    * *Style :* Fond Ambre/Or (`bg-amber-500 hover:bg-amber-600 text-gray-950 font-semibold font-sans uppercase tracking-wider`).
    * *Animations :* Transition fluide au survol (`transition-all duration-200`), effet d'ombre interne ou de glow externe (`hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]`).
* **Boutons Secondaires :**
    * Bordure ambre ou grise avec fond transparent (`border border-amber-500/30 text-amber-400 hover:bg-amber-500/10`).

### C. Éléments de Formulaire (Inputs, Selects, Sliders)
* **Champs de saisie & Dropdowns :**
    * Fond sombre mat (`bg-gray-950`), texte clair (`text-gray-200`), bordure discrète (`border-gray-800`).
    * Au focus : La bordure devient ambre (`focus:border-amber-500 focus:ring-1 focus:ring-amber-500`).
* **Sliders (Curseurs pour le Challenge Rating / CR) :**
    * Barre de progression sombre, avec la partie active colorée en ambre.
    * Le bouton de glissement (thumb) doit être net, éventuellement une pastille dorée lumineuse.

### D. Badges de Rareté
* Petites capsules (`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide`).
* Fond semi-transparent de la couleur de rareté avec du texte de la même couleur (ex: Rare = fond `bg-blue-500/10`, texte `text-blue-400`).

---

## 6. Effets Visuels & Micro-Interactions

* **Glow Magique (Effet d'aura) :** Utilisation de halos de lumière en arrière-plan (cercles flous à faible opacité placés de manière absolue derrière les sections clés) pour simuler une énergie magique. En CSS : `filter: blur(100px); opacity: 0.05;` avec une couleur violette, ambre ou bleue.
* **Transitions :** Tout changement d'état (survol de bouton, sélection de rareté, apparition de loot) doit s'effectuer avec une transition douce (`transition duration-300 ease-in-out`).
* **États Vides (Empty States) :** Quand aucun loot n'est généré, afficher une typographie soignée au centre, une icône discrète (comme un coffre fermé ou un livre) et une micro-copie immersive invitant l'utilisateur à lancer les dés.

---

## 7. Instructions spécifiques pour le LLM (Prompt System Direct)

*Copie et colle ce bloc directement dans tes instructions système de Cline ou utilise-le pour guider Nemotron Ultra :*

```text
Tu es un développeur front-end expert spécialisé dans les interfaces UI/UX de type Dark Fantasy / RPG. Tu dois coder l'application en respectant strictement le système de design "Grimoire Loot". 

Voici tes directives de codage impératives :
1. APPARENCE GENERALE : Applique un thème exclusivement sombre. Le fond d'écran doit être noir abyssal (#030712). Les surfaces de cartes doivent utiliser un gris-ardoise très sombre (#111827 ou #0f172a).
2. ACCENTS : Utilise la couleur Ambre/Or (#fbbf24) comme couleur d'accentuation principale pour les éléments de branding, les boutons d'action primaires et les états actifs/focus.
3. TYPOGRAPHIE : Utilise une police de caractère Serif élégante de style ancien (Cinzel / Cormorant Garamond / Georgia) pour les titres principaux (H1, H2, noms d'items légendaires) avec un style souvent en capitales et espacé. Utilise une police Sans-serif moderne (Inter / Plus Jakarta Sans) pour tout le texte fonctionnel, les formulaires, et les descriptions.
4. SYSTEME DE RARETÉ : Applique dynamiquement les couleurs de rareté RPG aux badges et aux bordures de cartes : Commun=Gris, Inhabituel=Vert, Rare=Bleu, Très Rare=Violet, Légendaire=Orange, Artéfact=Or/Rouge.
5. GLOW ET LUMIÈRE : Ajoute des effets de lueur subtils (box-shadow ambre discret) sur les boutons principaux au survol, et des dégradés de fond très flous et transparents pour donner une impression de magie ambiante.
6. UX FLUIDE : Les interfaces doivent être réactives, organisées en grilles claires (comme le panneau de configuration à gauche et les résultats à droite), avec des micro-copires immersives inspirées de l'univers des jeux de rôle.