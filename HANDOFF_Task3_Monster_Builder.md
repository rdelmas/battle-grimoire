# HANDOFF - Task 3: Monster Builder

## Contexte
Le **Player Character Builder (Task 2)** est **terminé et validé** (build réussi).  
Prochaine étape : **Monster Builder (Task 3)** selon la spec `docs/features/monster-builder.md`.

---

## Ce qui est fait (Task 2 - Player Character Builder)

### Architecture feature-based
```
src/features/player-character-builder/
├── types/character.ts              # Modèle complet D&D 2024 (PlayerCharacter)
├── hooks/
│   ├── useCharacterCalculations.ts # RG-8-1-01 à RG-8-1-08 (calculs purs, memoized)
│   └── useCharacterForm.ts         # Form state, validation RG-8-2-01, IndexedDB persistence
├── components/
│   ├── CharacterList.tsx           # Header, recherche, état vide, lignes expandables
│   ├── CharacterRow.tsx            # Ligne + actions Edit/Duplicate/Delete/Expand
│   ├── CharacterPreview.tsx        # Statblock tactique condensé (HP, CA, Init, Saves, Weapon Masteries, Spells)
│   └── builder/
│       └── CharacterBuilderModal.tsx # Modal 2 colonnes, 6 sections (Identité, Attributs, Compétences, Vitales, Dons/Armes, Magie)
└── PlayerCharacterPage.tsx         # Point d'entrée route /app/personnages
```

### Règles D&D 2024 implémentées (RG-8-1-xx)
| Règle | Description | Hook |
|-------|-------------|------|
| RG-8-1-01 | Bonus de maîtrise par niveau (2→6) | `getProficiencyBonus()` |
| RG-8-1-02 | Modificateur d'attribut standard | `getAbilityModifier()` |
| RG-8-1-03 | Jets de sauvegarde = mod + PB si maîtrisé | `useCalculatedSavingThrows` |
| RG-8-1-04 | Niveaux maîtrise compétence (none/proficient/expertise) | `SkillProficiency` type |
| RG-8-1-05 | Modificateur compétence selon niveau | `useCalculatedSkills` |
| RG-8-1-06 | Perception passive = 10 + mod Perception final | `usePassivePerception` |
| RG-8-1-07 | Initiative = DEX + bonus divers | `useInitiative` |
| RG-8-1-08 | DD Sorts = 8 + PB + mod carac magique / Attaque = PB + mod | `useCalculatedSpellcasting` |

### Validation formulaire (RG-8-2-01)
Champs obligatoires : `character_name`, `class_name`, `hit_points_max`, `armor_class`, `level` (1-20), `abilities` (1-30), `spellcasting_ability` si lanceur.

### Persistance
- IndexedDB via `window.api.storage` (IPC → main process → electron-store)
- Clé store : `'characters'`
- Nettoyage entrées vides avant sauvegarde (RG-8-2-04)

### Design System "Grimoire"
- Couleurs : `amber-main` (accent), `zinc` (neutres), `red-500` (PV), `blue-500` (CA), `yellow-500` (Init), `purple-500` (Magie)
- Polices : `font-serif` (titres/nombres), `font-sans` (UI)
- Composants réutilisés : `Button`, `Input`, `Select`, `Card`, `Badge`, `Modal`

### Route enregistrée
- `/app/personnages` → `PlayerCharacterPage` dans `src/app/App.tsx`
- Navigation via `AppLayout` sidebar

---

## Spécifications Task 3 - Monster Builder

### Fichier de référence
`docs/features/monster-builder.md` (à lire en premier)

### Modèle de données cible (`types/monster.ts`)
Interface `Monster` alignée sur **D&D 2024 Monster Manual** :
- Identité : `name`, `size` (Tiny→Gargantuan), `type` (Aberration, Beast, Celestial, Construct, Dragon, Elemental, Fey, Fiend, Giant, Humanoid, Monstrosity, Ooze, Plant, Undead), `alignment`, `level` (CR 0-30), `xp`
- Vitales : `armor_class`, `hit_points` (formule `XdY+Z`), `speed` (walk, fly, swim, climb, hover)
- Attributs : 6 abilities + modificateurs calculés
- Sauvegardes : proficiencies par attribut
- Compétences : bonus par skill
- Immunités/Résistances/Vulnérabilités : damage types + conditions
- Sens : `darkvision`, `passive_perception`, `special_senses`
- Langues : string[]
- CR / PB : `challenge_rating`, `proficiency_bonus` (calculé depuis CR)
- Traits : `Trait[]` { name, description }
- Actions : `Action[]` { name, description, attack_bonus?, damage?, save_dc?, usage? }
- Actions légendaires : `LegendaryAction[]` { name, description, cost? }
- Réactions : `Reaction[]`
- Source : `source` (SRD, Custom, Module), `tags`[]

### Calculs dérivés (RG-9-1-xx)
- PB depuis CR (table D&D 2024)
- HP average depuis formule dés
- Modificateurs d'attributs
- DD sorts / Attack bonus si spellcaster
- Perception passive

### Composants à créer
```
src/features/monster-builder/
├── types/monster.ts
├── hooks/
│   ├── useMonsterCalculations.ts   # RG-9-1-xx
│   └── useMonsterForm.ts           # Form + validation + IndexedDB ('monsters')
├── components/
│   ├── MonsterList.tsx
│   ├── MonsterRow.tsx
│   ├── MonsterPreview.tsx          # Statblock tactique (HP, CA, Init, Traits, Actions, Legendary)
│   └── builder/
│       └── MonsterBuilderModal.tsx # Sections: Identité, Vitales, Attributs, Traits, Actions, Légendaires
└── MonsterBuilderPage.tsx          # Route /app/monstres
```

### Réutiliser
- `src/shared/components/ui/*` (Button, Input, Select, Card, Badge, Modal)
- `src/main/services/storage.ts` (IndexedDB déjà opérationnel)
- Patterns `useCharacterCalculations` / `useCharacterForm` / `CharacterBuilderModal`

### Points d'attention
1. **CR → PB mapping** : table exacte D&D 2024 (CR 0-4→+2, 5-10→+3, 11-16→+4, 17-22→+5, 23-30→+6, etc.)
2. **HP parsing** : accepter "22 (4d8+4)" → calculer average + stocker formule
3. **Multi-speed** : objet `{ walk: 9, fly: 18, swim: 9 }`
4. **Damage types** : enum complet D&D (acid, bludgeoning, cold, fire, force, lightning, necrotic, piercing, poison, psychic, radiant, slashing, thunder)
5. **Conditions** : enum D&D 2024 (blinded, charmed, deafened, frightened, grappled, incapacitated, invisible, paralyzed, petrified, poisoned, prone, restrained, stunned, unconscious, exhaustion)
6. **Legendary Actions** : coût en actions (1-3), reset start of turn
7. **Validation** : nom, type, taille, CR, CA, PV obligatoires

### Route & Navigation
- Ajouter `/app/monstres` → `MonsterBuilderPage`
- Entry dans `AppLayout` sidebar (icône `Skull` ou `Dragon`)

---

## Commandes utiles
```bash
# Build complet
npm run build

# Dev renderer
npm run dev:renderer

# Lint
npm run lint

# Typecheck
npm run typecheck
```

---

## Prochaines étapes après Task 3
| Task | Description |
|------|-------------|
| 4 | Encounter Builder (associer monstres + PJ, calcul XP budget, difficulté) |
| 5 | Combat Tracker + LLM (initiative, tours, HP tracking, IA narration) |
| 6 | Polish + Build (icônes, splash, installers, tests E2E) |

---

**Prêt à démarrer Task 3.**  
Lire `docs/features/monster-builder.md` → créer `types/monster.ts` en premier.