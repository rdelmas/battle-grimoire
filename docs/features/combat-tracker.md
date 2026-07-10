# Architecture du Module
src/renderer/features/combat-tracker/

combat-tracker/
├── types.ts                    # Contrats de données et énumérations des phases
├── hooks/
│   └── useCombatEngine.ts      # Machine à états (State engine) du combat complet
├── components/
│   ├── SurprisePhase.tsx       # Écran de configuration de la surprise (Étape 1)
│   ├── InitiativePhase.tsx     # Écran de saisie/calcul des initiatives (Étape 2)
│   ├── CombatDashboard.tsx     # L'IHM principale du combat actif (Étapes 3 & 4)
│   ├── CombatantCard.tsx       # Ligne/carte d'un acteur dans la liste d'initiative
│   └── ActionModal.tsx         # Fenêtre contextuelle de résolution d'actions/dés


# CONTEXTE ARCHITECTURAL : Electron, React, TypeScript, Tailwind CSS. 
# STYLE GRAPHIQUE : docs/ui-style-guide.md

CONSIGNES POUR CLINE :
1. Crée d'abord le fichier `types.ts` comme décrit dans la spécification technique fournie.
2. Écris le hook d'état `useCombatEngine.ts` séparément pour isoler l'algorithmique.
3. Ne crée pas une seule page UI géante. Découpe ton interface en 3 composants de vues étanches basés sur la valeur de `state.phase` ('SURPRISE' | 'INITIATIVE' | 'RUNNING').
4. Chaque action offensive dans l'interface de combat actif doit proposer un élément `<select>` ou un mapping sur les ID des autres combattants pour permettre l'exécution de la fonction `updateHp`.


# RETCON de conception
Ce document est à analyser et confronter à ce qui existe deja et soumis à modification. 
Si tu estimes que des modifications sont pertinente propose les pour validation en mode plan.
Cela vaut pour chaque élement de la spécification : écrans, règles métiers, implémentations technique. 
Si tu trouves des façon plus ergonomique de faire propose les pour analyse et validation et si validées met à jour cette spécification.


# Contrat de données (POC)
Inspire toi de ce prototype et enrichi le si nécéssaire.
``` TypeScript
export type CombatPhase = 'SURPRISE' | 'INITIATIVE' | 'RUNNING';

export type CombatantType = 'PLAYER' | 'MONSTER';

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  initiativeModifier: number;
  initiativeScore?: number;
  isSurprised: boolean;
  hasMissedFirstTurn: boolean;
  reactionUsed: boolean;
  conditions: string[]; // e.g., ['Prone', 'Paralyzed']
  stats: {
    stealth: number;
    perception: number;
    dexterity: number;
  };
}

export interface CombatState {
  encounterId: string;
  phase: CombatPhase;
  currentRound: number;
  activeCombatantIndex: number;
  combatants: Combatant[];
  logs: LogEntry[];
  currentNarration: string;
  isNarrating: boolean;
}

export interface LogEntry {
  id: string;
  round: number;
  timestamp: string; // ex: "11:45:22"
  combatantName: string;
  message: string;
  type: 'DAMAGE' | 'HEAL' | 'STATUS' | 'SYSTEM' | 'ACTION';
}


``` 
---

## 3. Le Moteur Logique (`useCombatEngine.ts`)

Ce Custom Hook isole la logique métier globale et la manipulation de l'état de l'interface graphique.
Ce code doit être challengé lors de la création il ne s'agit que d'un exemple de comportement cible.

```typescript
import { useState } from 'react';
import { CombatState, Combatant, LogEntry } from '../types';

export const useCombatEngine = (initialCombatants: Combatant[], encounterId: string) => {
  const [state, setState] = useState<CombatState>({
    encounterId,
    phase: 'SURPRISE',
    currentRound: 0,
    activeCombatantIndex: 0,
    combatants: initialCombatants.map(c => ({
      ...c,
      isSurprised: false,
      hasMissedFirstTurn: false,
      reactionUsed: false,
      actionUsed: false,
      bonusActionUsed: false,
      conditions: []
    })),
    logs: [],
    currentNarration: '',
    isNarrating: false
  });

  const addLog = (message: string, combatantName: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      round: state.currentRound,
      timestamp: new Date().toLocaleTimeString(),
      combatantName,
      message,
      type
    };
    setState(prev => ({ ...prev, logs: [...prev.logs, newLog] }));
  };

  const toggleSurprise = (id: string) => {
    setState(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id === id) {
          const nextSurprised = !c.isSurprised;
          return { ...c, isSurprised: nextSurprised, hasMissedFirstTurn: nextSurprised };
        }
        return c;
      })
    }));
  };

  const startInitiativePhase = () => {
    setState(prev => ({ ...prev, phase: 'INITIATIVE' }));
    addLog("Phase d'initiative commencée.", "Système", 'SYSTEM');
  };

  const submitInitiatives = (playerRolls: { [id: string]: number }) => {
    const updated = state.combatants.map(c => {
      if (c.type === 'MONSTER') {
        const monsterRoll = Math.floor(Math.random() * 20) + 1;
        return { ...c, initiativeScore: monsterRoll + c.initiativeModifier };
      } else {
        const roll = playerRolls[c.id] || 0;
        return { ...c, initiativeScore: roll + c.initiativeModifier };
      }
    });

    const sorted = [...updated].sort((a, b) => {
      if ((b.initiativeScore || 0) !== (a.initiativeScore || 0)) {
        return (b.initiativeScore || 0) - (a.initiativeScore || 0);
      }
      if (b.stats.dexterity !== a.stats.dexterity) {
        return b.stats.dexterity - a.stats.dexterity;
      }
      return a.type === 'PLAYER' ? -1 : 1;
    });

    setState(prev => ({
      ...prev,
      combatants: sorted,
      phase: 'RUNNING',
      currentRound: 1,
      activeCombatantIndex: 0
    }));

    sorted.forEach(c => {
      addLog(`Initiative validée : ${c.initiativeScore}`, c.name, 'SYSTEM');
    });
  };

  const nextTurn = () => {
    setState(prev => {
      let nextIndex = prev.activeCombatantIndex + 1;
      let nextRound = prev.currentRound;

      if (nextIndex >= prev.combatants.length) {
        nextIndex = 0;
        nextRound += 1;
      }

      const updatedCombatants = prev.combatants.map((c, idx) => {
        if (idx === nextIndex) {
          return { 
            ...c, 
            reactionUsed: false, 
            actionUsed: false, 
            bonusActionUsed: false,
            hasMissedFirstTurn: false 
          };
        }
        return c;
      });

      return {
        ...prev,
        currentRound: nextRound,
        activeCombatantIndex: nextIndex,
        combatants: updatedCombatants
      };
    });
  };

  const updateHp = (id: string, amount: number) => {
    setState(prev => {
      const target = prev.combatants.find(c => c.id === id);
      if (!target) return prev;
      
      const updatedCombatants = prev.combatants.map(c => {
        if (c.id === id) {
          const nextHp = Math.max(0, Math.min(c.maxHp, c.currentHp + amount));
          return { ...c, currentHp: nextHp };
        }
        return c;
      });

      return { ...prev, combatants: updatedCombatants };
    });
  };

  const toggleAction = (id: string, actionType: 'action' | 'bonus' | 'reaction') => {
    setState(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id === id) {
          if (actionType === 'action') return { ...c, actionUsed: !c.actionUsed };
          if (actionType === 'bonus') return { ...c, bonusActionUsed: !c.bonusActionUsed };
          if (actionType === 'reaction') return { ...c, reactionUsed: !c.reactionUsed };
        }
        return c;
      })
    }));
  };

  return {
    state,
    setState,
    toggleSurprise,
    startInitiativePhase,
    submitInitiatives,
    nextTurn,
    updateHp,
    toggleAction,
    addLog
  };
};
```

---

## 4. Spécifications des Écrans & Règles Métier

## 4. Spécifications des Écrans & Règles Métier

### Écran 1 : Phase de Surprise (`SurprisePhase.tsx`)

#### Layout Fil-de-fer (ASCII Wireframe)
```text
+-----------------------------------------------------------------------------------+
| 🎯 BATTLE GRIMOIRE  | Étape 1 : Détermination de la Surprise   [ Passer à l'initiative ] |
+----------------+------------------------------------------------------------------+
| 🏠 Dashboard   |                                                                  |
| 👤 Personnages |  Nom              | Furtivité | Percep. Passive | Surpris ?      |
| 👾 Bestiaire   | ------------------+-----------+-----------------+--------------- |
| ⚔️ Rencontres  |  [PJ] Valeros     |    +2     |       14        | [ Toggle: OFF ]|
| 📊 Tracker     |  [PJ] Mialee      |    +4     |       12        | [ Toggle: OFF ]|
|                |  [M]  Goule (A)   |    15     |       10        | [ Toggle: ON  ]|
|                |  [M]  Goule (B)   |    15     |       10        | [ Toggle: ON  ]|
+----------------+------------------------------------------------------------------+
```

* **Description Visuelle** : Tableau comparatif à fond sombre (`bg-zinc-950`).
* **Composants** : Une liste tabulaire affichant le nom, la valeur de Furtivité (Stealth) et la Perception Passive de chaque entité. Un commutateur d'état (Toggle) interactif flanque chaque ligne.
* **Règles Métier** :
    * **[BR-COMBAT-101] Aide à la décision** : L'interface affiche la Perception Passive et le modificateur de Discrétion de chaque entité en lecture seule pour assister l'arbitrage du MJ.
    * **[BR-COMBAT-102] Statut Surpris** : L'activation manuelle du toggle applique au combattant ciblé les drapeaux `hasMissedFirstTurn = true` et `isSurprised = true`.
    * **[BR-COMBAT-103] Validation** : Le bouton de confirmation final fige la configuration de la surprise et bascule le module vers la phase d'initiative.

---

### Écran 2 : Phase d'Initiative (`InitiativePhase.tsx`)

#### Layout Fil-de-fer (ASCII Wireframe)
```text
+-----------------------------------------------------------------------------------+
| 🎯 BATTLE GRIMOIRE  | Étape 2 : Recueil de l'Initiative              [ ⚡ Lancer le Combat ]|
+----------------+------------------------------------------------------------------+
| 🏠 Dashboard   | JOUEURS (Saisie Manuelle)      | ENNEMIS (Auto-Roll)             |
| 👤 Personnages | ------------------------------ + --------------------------------|
| 👾 Bestiaire   | Valeros  [ input: 12 ] (Mod:+2) | Goule (A)  Score: 18  [🎲 (15+3)]|
| ⚔️ Rencontres  | Total : 14                     |                                  |
| 📊 Tracker     |                                | Goule (B)  Score: 9   [🎲 (6+3)] |
|                | Mialee   [ input: 8  ] (Mod:+3) |                                  |
|                | Total : 11                     |                                  |
+----------------+------------------------------------------------------------------+
```

* **Description Visuelle** : Mise en page scindée en deux colonnes équilibrées (Joueurs à gauche, Ennemis à droite).
* **Composants** : 
    * *Côté Joueur* : Listage nominatif accompagné d'un champ d'entrée numérique pour y intégrer le résultat physique du dé de l'aventurier. Le modificateur est juxtaposé à l'input.
    * *Côté Monstre* : Chiffres pré-remplis ornés d'un pictogramme graphique matérialisant un jet automatique.
* **Règles Métier** :
    * **[BR-COMBAT-201] Initiative des Monstres** : À l'initialisation de l'écran, le système exécute de manière autonome la formule : `1d20 + initiativeModifier` pour chaque monstre.
    * **[BR-COMBAT-202] Saisie des Joueurs** : Le MJ saisit la valeur brute du dé de l'aventurier (1 à 20). Le programme résout dynamiquement la somme arithmétique globale.
    * **[BR-COMBAT-203] Tri & Ordonnancement** : La validation finale applique un algorithme de tri décroissant basé sur les initiatives globales.
    * **[BR-COMBAT-204] Résolution des Égalités** : En cas d'équivalence absolue de score, l'entité possédant le score de Dextérité brut le plus élevé prend l'ascendant. Si le cas d'égalité perdure, les entités de type `PLAYER` se positionnent systématiquement avant les entités de type `MONSTER`.

---

### Écran 3 : Tableau de Bord Actif (`CombatDashboard.tsx`)

#### Layout Fil-de-fer (ASCII Wireframe)
```text
+-----------------------------------------------------------------------------------+
| 🎯 BATTLE GRIMOIRE  | [ROUND 1]  Combat Tracker                         [⚙️ Options]       |
+----------------+------------------------------------------------------------------+
| 🏠 Dashboard   | TRACKER (25%)  | CONTROL PANEL (50%)       | LOGS & NARRATION(25%)|
| 👤 Personnages | ---------------+---------------------------+----------------------|
| 👾 Bestiaire   | > Goule A (M)  | Acteur: GOULE A           | [🔮 Chronique Round] |
| ⚔️ Rencontres  |   HP: [====]   | STAT BLOCK MONSTRE        |                      |
| 📊 Tracker     |   AC: 12       | (Lecture seule)           | Le combat s'engage   |
|                |   [REACTION]   | FP 1 • 200 XP             | dans la pénombre...  |
|                |                | Actions rapides...        |                      |
|                | Valeros (PJ)   |                           | -------------------- |
|                |   HP: [======] |                           | [11:45] Combat lancé |
|                |   AC: 18       |                           | [11:46] Goule A mort |
|                |   [REACTION]   | [ ➡️ Fin du Tour ]        |                      |
+----------------+------------------------------------------------------------------+
```

#### Zoom sur le "Control Panel" quand c'est le tour d'un Joueur (PJ)
```text
+-------------------------------------------------------------------------+
| Acteur Actif : VALEROS (Niv. 2)                                         |
| ----------------------------------------------------------------------- |
| Vitesse de déplacement : 30 ft   [ X ] Déplacement Complété             |
|                                                                         |
| ACTIONS COMPLÈTES :             | ACTION BONUS :                        |
|  [⚔️ Attaquer]  [🔥 Lancer Sort] |  [◽ Action utilisée ]               |
|  [🛡️ Esquiver]  [🏃 Foncer]      |                                       |
|  [💨 Se Déseng] [🩹 Secourir]    | RÉACTION : [◽ Réaction Consommée]    |
+-------------------------------------------------------------------------+
```

* **Description Visuelle** : Structure asymétrique à trois colonnes optimisée pour écran PC.
    * *Volet Gauche (25%)* : File chronologique verticale indexant les combattants ordonnés. L'entité active bénéficie d'une bordure colorée (`border-amber-500`). Chaque ligne affiche l'identité textuelle, la jauge graphique de points de vie, la classe d'armure (CA) et les jetons d'états.
    * *Volet Central (50%)* : Tableau de bord de l'acteur courant. Structure l'organisation des ressources (Vitesse de déplacement, Grille d'actions).
    * *Volet Droit (25%)* : Modules connexes de narration et journalisation.
* **Règles Métier** :
    * **[BR-COMBAT-301] Cycle Évolutif** : L'activation de l'élément "Fin du tour" incrémente l'index de la liste. Le dépassement de l'index maximal réinitialise la boucle à 0 et applique l'incrémentation `currentRound += 1`.
    * **[BR-COMBAT-302] Traitement de la Surprise** : Si l'entité active possède le statut `hasMissedFirstTurn = true`, l'interface applique un calque restrictif indiquant l'impossibilité d'agir. L'activation du bouton "Fin du tour" efface le drapeau pour les rounds subséquents.
    * **[BR-COMBAT-303] Réinitialisation des Réactions** : L'accès au tour de jeu d'une entité réinitialise obligatoirement son flag `reactionUsed` à sa valeur d'origine (`false`).
    * **[BR-COMBAT-304] Mort et Inconscience** : La chute des points de vie d'un monstre à 0 réduit l'opacité graphique de sa fiche (opacity-30) et le retire du cycle algorithmique des tours. Un aventurier à 0 point de vie hérite de l'état `Inconscient` mais conserve son rang d'initiative pour exécuter ses jets de sauvegarde contre la mort.
    * **[BR-COMBAT-305] Action : Esquiver (Dodge)** : Le clic applique le badge temporaire `[🛡️ Esquive]`. Ce badge s'efface automatiquement au début de son prochain tour de jeu.
    * **[BR-COMBAT-306] Actions : Foncer & Désengager** : Actions à portée purement narrative. Déclenchent l'émission d'une alerte visuelle (Toast) et modifient l'état d'activation du bouton pour la durée du tour.
    * **[BR-COMBAT-307] Action : Secourir (First Aid)** : Ouvre une boîte de ciblage restreinte aux alliés à 0 HP. Valider supprime le statut `Dying` pour lui substituer l'état `Stable`.
    * **[BR-COMBAT-308] Consommation des Ressources** : L'activation d'un bouton d'action ou d'action bonus modifie visuellement l'état du bouton (opacité réduite) pour signifier son utilisation.

---

### Modale 4 : Résolution d'Action & Ciblage (`ActionResolutionModal.tsx`)

#### Layout Fil-de-fer (ASCII Wireframe)
```text
+-------------------------------------------------------------------+
|  [⚔️] Attaque de mêlée - Goule de l'Ombre                      (X) |
+-------------------------------------------------------------------+
| CIBLES : [X] Valeros     [ ] Mialee     [ ] Goule (B)             |
+-------------------------------------------------------------------+
| MODE DE RÉSOLUTION :                                              |
|   [ Saisie Manuelle ]  |  [* Lancer pour moi (Dés virtuels) *]     |
|                                                                   |
|   Dégâts / Soins à appliquer : [ 8 ] HP                           |
+-------------------------------------------------------------------+
| TYPE : [ Perforation     v ]                                      |
| MODIFICATEURS :  [ Normal ]  [ Résistance (1/2) ]  [ Vulnérabilité ]|
+-------------------------------------------------------------------+
|                                             [ Annuler ] [ Appliquer ]|
+-------------------------------------------------------------------+
```

* **Description Visuelle** : Fenêtre modale centrée s'affichant au-dessus de l'interface principale via un arrière-plan flouté (`backdrop-blur-sm`).
* **Composants** : Liste de sélection multiple pour désigner les cibles de l'effet, sélecteur d'onglets pour basculer entre l'intégration manuelle d'une valeur numérique ou la génération assistée par dé virtuel, menu de sélection des modificateurs de dégâts (Normal, Résistance, Vulnérabilité).
* **Règles Métier** :
    * **[BR-COMBAT-401] Mutation des PV** : L'enregistrement applique les valeurs mathématiques de manière soustractive (dégâts) ou additive (soins) sur la propriété `currentHp` des entités sélectionnées.
    * **[BR-COMBAT-402] Bornage Strict** : Le score de points de vie est contraint de manière absolue entre la valeur plancher `0` et la valeur plafond `maxHp`.
    * **[BR-COMBAT-403] Modificateurs D&D 2024** : L'activation de la case "Résistance" divise l'enveloppe de dégâts par 2 (arrondi à l'unité inférieure) avant son application. Le choix de la "Vulnérabilité" applique un multiplicateur égal à 2.

---

### Journal Tactique (`CombatLog.tsx`)
* **Description Visuelle** : Fenêtre terminale à défilement textuel vertical intégrée dans le volet droit.
* **Règles Métier** :
    * **[BR-LOG-501] Automatisme** : Chaque modification d'état opérée par le MJ génère l'émission instantanée d'un objet de type `LogEntry`.
    * **[BR-LOG-502] Formatage** : Les chaînes textuelles se conforment au modèle : `[Round X] Nom : Description`.
    * **[BR-LOG-503] Alignement Visuel** : L'insertion d'une nouvelle ligne force l'alignement vertical du composant vers sa valeur maximale inférieure (`Scroll to bottom`).

---

### Chroniqueur Épique (`CombatNarration.tsx`)
* **Description Visuelle** : Panneau d'affichage stylisé au rendu parcheminé ou italique sombre, doté d'un déclencheur "Générer la chronique".
* **Règles Métier** :
    * **[BR-LLM-601] Routage Réseau** : Le composant graphique délègue la responsabilité de l'appel au processus principal d'Electron via l'exposition d'un canal de communication IPC dédié (`window.api.generateNarration`).
    * **[BR-LLM-602] Composition du Message** : Le payload de transmission extrait l'échantillon exclusif des logs du round actif.
    * **[BR-LLM-603] Verrouillage** : L'attente du flux asynchrone désactive le bouton d'appel et positionne la variable de chargement `isNarrating` à `true`.

---

## 5. Directives Systèmes du Chroniqueur (Processus Main Electron)

Le processus principal d'Electron doit utiliser ce prompt système pour instruire l'API de traitement du langage lors de la réception des logs du round :

```text
Tu es le Chroniqueur du Grimoire Loot, un MJ virtuel au ton sombre, viscéral et épique, inspiré de Darkest Dungeon et de la fantasy gritty.
Ton rôle est de traduire un journal de combat (Combat Log) technique et brut en une narration littéraire immersive de deux ou trois paragraphes maximum.

CONSIGNES DE STYLE :
1. Ne mentionne JAMAIS de termes techniques de règles de jeu (Pas de "HP", "Round", "Dés", "Classe d'Armure", "Sauvegarde").
2. Traduis les chiffres en sensations physiques : "12 dégâts de tranchant" devient "une estafilade sanglante qui déchire le cuir", "0 HP" devient "s'effondre dans la poussière, l'esprit embrumé par l'appel de la mort".
3. Reste concis, percutant, et concentre-toi sur l'action globale du round.

EXEMPLE D'ENTRÉE :
- [Round 1] Valeros utilise son action pour Esquiver.
- [Round 1] Goule de l'Ombre attaque Valeros et inflige 8 dégâts de perforation.
- [Round 1] Mialee lance un sort de Trait de Feu sur Goule de l'Ombre et inflige 14 dégâts de feu. Goule de l'Ombre est éliminé.

EXEMPLE DE SORTIE ATTENDUE :
Le combat s'engage dans la pénombre de la route. Valeros lève son bouclier, adoptant une posture défensive désespérée alors qu'une silhouette décharnée se jette sur lui. Les crocs de la goule trouvent une faille, s'enfonçant cruellement dans son épaule. Mais le sursis de la créature est de courte durée : une lueur incandescente déchire l'obscurité. Le trait de feu invoqué par Mialee frappe le monstre de plein fouet, le réduisant instantanément en cendres hurlantes.
```