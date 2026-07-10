/**
 * SRD 2024 - Espèces (Races) officielles D&D 2024 (5.5e)
 * Source: SRD 2024 / Player's Handbook 2024
 * Note: "Autre" permet aux joueurs d'entrer une espèce personnalisée non-SRD
 */

export interface SpeciesData {
  id: string
  name: string
  description: string
  size: 'Small' | 'Medium'
  speed: number // en mètres (30ft = 9m)
  abilityScoreIncreases: Record<string, number> // ex: { dex: 2, cha: 1 }
  traits: SpeciesTrait[]
  subraces?: SubraceData[]
}

export interface SpeciesTrait {
  name: string
  description: string
}

export interface SubraceData {
  id: string
  name: string
  description: string
  abilityScoreIncreases: Record<string, number>
  traits: SpeciesTrait[]
}

/**
 * Liste des espèces officielles SRD 2024
 * Dans D&D 2024, le terme "Race" a été remplacé par "Species" (Espèce)
 * Les sous-races sont maintenant des options au sein de l'espèce
 */
export const SRD2024_SPECIES: SpeciesData[] = [
  {
    id: 'human',
    name: 'Humain',
    description: 'Les humains sont les plus adaptables et ambitieux parmi les peuples communs.',
    size: 'Medium',
    speed: 9,
    abilityScoreIncreases: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    traits: [
      { name: 'Polyvalence', description: 'Vous gagnez un don d\'origine de votre choix.' },
      { name: 'Compétence', description: 'Vous gagnez la maîtrise d\'une compétence de votre choix.' },
    ],
  },
  {
    id: 'elf',
    name: 'Elfe',
    description: 'Les elfes sont un peuple magique d\'une grâce surnaturelle, vivant dans des lieux d\'une beauté éthérée.',
    size: 'Medium',
    speed: 9,
    abilityScoreIncreases: { dex: 2 },
    traits: [
      { name: 'Sens aiguisés', description: 'Vous avez la maîtrise de la compétence Perception.' },
      { name: 'Lignée fey', description: 'Vous avez l\'avantage aux jets de sauvegarde contre le charmé, et la magie ne peut pas vous endormir.' },
      { name: 'Trance', description: 'Vous n\'avez pas besoin de dormir. Au lieu de cela, vous méditez 4 heures par jour.' },
    ],
    subraces: [
      {
        id: 'high-elf',
        name: 'Haut-Elfe',
        description: 'Les hauts-elfes sont imprégnés de la magie du Feywild.',
        abilityScoreIncreases: { int: 1 },
        traits: [
          { name: 'Tour de magie', description: 'Vous connaissez un tour de magie de votre choix de la liste des sorts de magicien. L\'Intelligence est votre caractéristique d\'incantation.' },
        ],
      },
      {
        id: 'wood-elf',
        name: 'Elfe Sylvestre',
        description: 'Les elfes sylvestres ont une affinité naturelle avec la nature.',
        abilityScoreIncreases: { wis: 1 },
        traits: [
          { name: 'Pas de la forêt', description: 'Votre vitesse de base augmente à 10,5m.' },
          { name: 'Magie de la nature', description: 'Vous connaissez le tour de magie druidcraft. La Sagesse est votre caractéristique d\'incantation.' },
        ],
      },
      {
        id: 'drow',
        name: 'Drow (Elfe Noir)',
        description: 'Les drows sont des elfes qui ont été exilés dans les profondeurs de la terre.',
        abilityScoreIncreases: { cha: 1 },
        traits: [
          { name: 'Vision dans le noir supérieure', description: 'Vous pouvez voir dans le noir jusqu\'à 36m.' },
          { name: 'Sensibilité à la lumière', description: 'Vous avez un désavantage aux jets d\'attaque et aux tests de Perception basés sur la vue en plein soleil.' },
          { name: 'Magie drow', description: 'Vous connaissez le tour de magie dancing lights. Au niveau 3, vous pouvez lancer faerie fire une fois par repos long. Au niveau 5, vous pouvez lancer darkness une fois par repos long. Le Charisme est votre caractéristique d\'incantation.' },
        ],
      },
    ],
  },
  {
    id: 'dwarf',
    name: 'Nain',
    description: 'Les nains sont un peuple robuste et endurant, connu pour leur savoir-faire artisanal et leur résistance.',
    size: 'Medium',
    speed: 7.5,
    abilityScoreIncreases: { con: 2 },
    traits: [
      { name: 'Résistance naine', description: 'Vous avez l\'avantage aux jets de sauvegarde contre le poison, et vous avez la résistance aux dégâts de poison.' },
      { name: 'Vision dans le noir', description: 'Vous pouvez voir dans le noir jusqu\'à 18m.' },
      { name: 'Entraînement aux armes naines', description: 'Vous avez la maîtrise de la hache de guerre, de la hachette, du marteau de guerre et du marteau léger.' },
      { name: 'Connaissance de la pierre', description: 'Lorsque vous faites un test d\'Intelligence (Histoire) lié à l\'origine de la pierre, vous êtes considéré comme maîtrisant la compétence et ajoutez le double de votre bonus de maîtrise.' },
    ],
    subraces: [
      {
        id: 'hill-dwarf',
        name: 'Nain des Collines',
        description: 'Les nains des collines sont résistants et intuitifs.',
        abilityScoreIncreases: { wis: 1 },
        traits: [
          { name: 'Robustesse naine', description: 'Votre maximum de points de vie augmente de 1, et il augmente de 1 à chaque fois que vous gagnez un niveau.' },
        ],
      },
      {
        id: 'mountain-dwarf',
        name: 'Nain des Montagnes',
        description: 'Les nains des montagnes sont forts et endurcis par la vie en altitude.',
        abilityScoreIncreases: { str: 2 },
        traits: [
          { name: 'Entraînement aux armes naines', description: 'Vous avez la maîtrise de la hache de guerre et du marteau de guerre (déjà inclus), ainsi que de la hachette et du marteau léger.' },
        ],
      },
    ],
  },
  {
    id: 'halfling',
    name: 'Halfelin',
    description: 'Les halfelins sont un peuple petit de taille mais grand de cœur, connu pour sa chance et son courage.',
    size: 'Small',
    speed: 7.5,
    abilityScoreIncreases: { dex: 2 },
    traits: [
      { name: 'Chance', description: 'Lorsque vous obtenez un 1 sur un d20 pour un jet d\'attaque, un test de caractéristique ou un jet de sauvegarde, vous pouvez relancer le dé et doit utiliser le nouveau résultat.' },
      { name: 'Brave', description: 'Vous avez l\'avantage aux jets de sauvegarde contre la peur.' },
      { name: 'Agile', description: 'Vous pouvez vous déplacer dans l\'espace d\'une créature de taille plus grande que la vôtre.' },
    ],
    subraces: [
      {
        id: 'lightfoot-halfling',
        name: 'Halfelin Pied-Léger',
        description: 'Les halfelins pieds-légers sont furtifs et sociables.',
        abilityScoreIncreases: { cha: 1 },
        traits: [
          { name: 'Furtivité naturelle', description: 'Vous pouvez tenter de vous cacher même lorsque vous êtes seulement masqué par une créature de taille au moins supérieure à la vôtre.' },
        ],
      },
      {
        id: 'stout-halfling',
        name: 'Halfelin Robuste',
        description: 'Les halfelins robustes sont plus résistants aux poisons.',
        abilityScoreIncreases: { con: 1 },
        traits: [
          { name: 'Résistance robuste', description: 'Vous avez l\'avantage aux jets de sauvegarde contre le poison, et vous avez la résistance aux dégâts de poison.' },
        ],
      },
    ],
  },
  {
    id: 'dragonborn',
    name: 'Dragonné',
    description: 'Les dragonnés sont fiers et majestueux, descendants des dragons.',
    size: 'Medium',
    speed: 9,
    abilityScoreIncreases: { str: 2, cha: 1 },
    traits: [
      { name: 'Ancestrie draconique', description: 'Choisissez un type de dragon. Votre souffle et votre résistance aux dégâts dépendent de ce choix.' },
      { name: 'Souffle draconique', description: 'Vous pouvez utiliser votre action pour exhaler de l\'énergie destructrice. Les créatures dans la zone font un jet de sauvegarde (DD = 8 + bonus de maîtrise + modificateur de Con). Les dégâts augmentent aux niveaux 5, 11, 17.' },
      { name: 'Résistance draconique', description: 'Vous avez la résistance au type de dégâts associé à votre ancestrie draconique.' },
    ],
  },
  {
    id: 'gnome',
    name: 'Gnome',
    description: 'Les gnomes sont petits, curieux et ingénieux, avec un penchant pour l\'illusion et la mécanique.',
    size: 'Small',
    speed: 7.5,
    abilityScoreIncreases: { int: 2 },
    traits: [
      { name: 'Ruse gnome', description: 'Vous avez l\'avantage aux jets de sauvegarde d\'Intelligence, de Sagesse et de Charisme contre la magie.' },
      { name: 'Vision dans le noir', description: 'Vous pouvez voir dans le noir jusqu\'à 18m.' },
    ],
    subraces: [
      {
        id: 'forest-gnome',
        name: 'Gnome des Forêts',
        description: 'Les gnomes des forêts sont doués pour l\'illusion et la furtivité.',
        abilityScoreIncreases: { dex: 1 },
        traits: [
          { name: 'Illusionniste naturel', description: 'Vous connaissez le tour de magie minor illusion. L\'Intelligence est votre caractéristique d\'incantation.' },
          { name: 'Parler aux petites bêtes', description: 'Vous pouvez communiquer des idées simples avec les bêtes de taille TP ou P.' },
        ],
      },
      {
        id: 'rock-gnome',
        name: 'Gnome des Rochers',
        description: 'Les gnomes des rochers sont des inventeurs et artisans nés.',
        abilityScoreIncreases: { con: 1 },
        traits: [
          { name: 'Artificier', description: 'Vous avez la maîtrise des outils d\'artisan (outils de bijoutier). Vous pouvez créer de petits dispositifs mécaniques.' },
        ],
      },
    ],
  },
  {
    id: 'half-elf',
    name: 'Demi-Elfe',
    description: 'Les demi-elfes combinent la curiosité humaine avec la grâce elfique.',
    size: 'Medium',
    speed: 9,
    abilityScoreIncreases: { cha: 2 },
    traits: [
      { name: 'Héritage féerique', description: 'Vous avez l\'avantage aux jets de sauvegarde contre le charmé, et la magie ne peut pas vous endormir.' },
      { name: 'Polyvalence', description: 'Vous gagnez la maîtrise de deux compétences de votre choix.' },
    ],
    subraces: [
      {
        id: 'high-half-elf',
        name: 'Demi-Haut-Elfe',
        description: 'Descendant de haut-elfe, vous avez un don pour la magie arcanique.',
        abilityScoreIncreases: {},
        traits: [
          { name: 'Tour de magie elfique', description: 'Vous connaissez un tour de magie de la liste des sorts de magicien. L\'Intelligence est votre caractéristique d\'incantation.' },
        ],
      },
      {
        id: 'wood-half-elf',
        name: 'Demi-Elfe Sylvestre',
        description: 'Descendant d\'elfe sylvestre, vous êtes à l\'aise dans la nature.',
        abilityScoreIncreases: {},
        traits: [
          { name: 'Pas de la forêt', description: 'Votre vitesse de base augmente à 10,5m.' },
        ],
      },
      {
        id: 'drow-half-elf',
        name: 'Demi-Drow',
        description: 'Descendant de drow, vous avez hérité de leur magie innée.',
        abilityScoreIncreases: {},
        traits: [
          { name: 'Magie drow', description: 'Vous connaissez dancing lights. Au niveau 3, faerie fire. Au niveau 5, darkness. Charisme est votre caractéristique d\'incantation.' },
        ],
      },
    ],
  },
  {
    id: 'half-orc',
    name: 'Demi-Orc',
    description: 'Les demi-orcs combinent la force brute des orcs avec la détermination humaine.',
    size: 'Medium',
    speed: 9,
    abilityScoreIncreases: { str: 2, con: 1 },
    traits: [
      { name: 'Endurance implacable', description: 'Lorsque vous êtes réduit à 0 PV sans être tué, vous pouvez tomber à 1 PV à la place. Une fois par repos long.' },
      { name: 'Attaque sauvage', description: 'Lorsque vous obtenez un coup critique au corps-à-corps, vous pouvez lancer un dé de dégâts d\'arme supplémentaire.' },
      { name: 'Intimidation', description: 'Vous avez la maîtrise de la compétence Intimidation.' },
    ],
  },
  {
    id: 'tiefling',
    name: 'Tieffelin',
    description: 'Les tieffelins portent l\'héritage des plans inférieurs, marqués par leur ascendance fiélonne.',
    size: 'Medium',
    speed: 9,
    abilityScoreIncreases: { int: 1, cha: 2 },
    traits: [
      { name: 'Résistance infernale', description: 'Vous avez la résistance aux dégâts de feu.' },
      { name: 'Héritage infernal', description: 'Vous connaissez le tour de magie thaumaturgy. Au niveau 3, vous pouvez lancer hellish rebuke (niveau 2) une fois par repos long. Au niveau 5, darkness une fois par repos long. Le Charisme est votre caractéristique d\'incantation.' },
    ],
  },
]

/**
 * Option "Autre" pour les espèces personnalisées non-SRD
 */
export const CUSTOM_SPECIES_OPTION = {
  id: 'custom',
  name: 'Autre',
  description: 'Espèce personnalisée non listée dans le SRD 2024',
  size: 'Medium' as const,
  speed: 9,
  abilityScoreIncreases: {},
  traits: [],
  isCustom: true,
}

/**
 * Obtenir toutes les espèces avec l'option "Autre"
 */
export function getAllSpecies(): (SpeciesData & { isCustom?: boolean })[] {
  return [...SRD2024_SPECIES, CUSTOM_SPECIES_OPTION]
}

/**
 * Obtenir une espèce par son ID
 */
export function getSpeciesById(id: string): (SpeciesData & { isCustom?: boolean }) | undefined {
  if (id === 'custom') return CUSTOM_SPECIES_OPTION
  return SRD2024_SPECIES.find(s => s.id === id)
}

/**
 * Obtenir les sous-races d'une espèce
 */
export function getSubraces(speciesId: string): SubraceData[] {
  const species = SRD2024_SPECIES.find(s => s.id === speciesId)
  return species?.subraces ?? []
}