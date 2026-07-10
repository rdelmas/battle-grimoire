/**
 * SRD 2024 - Classes et Sous-classes officielles D&D 2024 (5.5e)
 * Source: SRD 2024 / Player's Handbook 2024
 * Dans D&D 2024, les sous-classes sont choisies au niveau 3 (sauf exceptions)
 */

export interface ClassData {
  id: string
  name: string
  description: string
  hitDie: number
  primaryAbility: string[] // Caractéristiques principales
  savingThrows: string[] // Deux jets de sauvegarde maîtrisés
  skillChoices: {
    choose: number
    from: string[]
  }
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies?: string[]
  subclasses: SubclassData[]
  spellcasting?: {
    ability: string
    level: number // Niveau où la magie commence (1 pour la plupart, 3 pour certains)
  }
}

export interface SubclassData {
  id: string
  name: string
  description: string
  classId: string
  level: number // Niveau d'obtention (généralement 3)
  features: SubclassFeature[]
}

export interface SubclassFeature {
  level: number
  name: string
  description: string
}

/**
 * Liste des classes officielles SRD 2024 avec leurs sous-classes
 */
export const SRD2024_CLASSES: ClassData[] = [
  {
    id: 'barbarian',
    name: 'Barbare',
    description: 'Un guerrier féroce qui puise dans sa rage pour accomplir des exploits de force et de résistance surhumains.',
    hitDie: 12,
    primaryAbility: ['str', 'con'],
    savingThrows: ['str', 'con'],
    skillChoices: {
      choose: 2,
      from: ['animal_handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    },
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    subclasses: [
      {
        id: 'berserker',
        name: 'Berserker',
        description: 'Votre rage est une furie implacable qui vous permet d\'ignorer la douleur et de frapper plus fort.',
        classId: 'barbarian',
        level: 3,
        features: [
          { level: 3, name: 'Furie frénétique', description: 'Quand vous entrez en rage, vous pouvez faire une attaque d\'arme au corps-à-corps par une action bonus. Quand la rage se termine, vous subissez un niveau d\'épuisement.' },
          { level: 6, name: 'Esprit intraitable', description: 'Vous ne pouvez pas être charmé ou effrayé pendant votre rage. Si vous l\'êtes quand vous entrez en rage, l\'effet prend fin.' },
          { level: 10, name: 'Présence intimidante', description: 'Vous pouvez utiliser votre action pour terrifier les créatures à 9m. Elles font un jet de sauvegarde de Sagesse (DD = 8 + bonus de maîtrise + mod. Cha) ou sont effrayées.' },
          { level: 14, name: 'Représailles', description: 'Quand vous subissez des dégâts d\'une créature à 1,5m, vous pouvez utiliser votre réaction pour faire une attaque d\'arme au corps-à-corps contre elle.' },
        ],
      },
      {
        id: 'wild-heart',
        name: 'Cœur Sauvage',
        description: 'Votre rage vous connecte aux esprits de la nature, vous donnant des aspects bestiaux.',
        classId: 'barbarian',
        level: 3,
        features: [
          { level: 3, name: 'Magie sauvage', description: 'Vous pouvez lancer beast sense et speak with animals sans composantes matérielles. Au niveau 3, vous choisissez un esprit animal qui vous donne un avantage pendant la rage.' },
          { level: 6, name: 'Aspect de la bête', description: 'Vous gagnez un avantage basé sur votre esprit animal choisi (Ours: résistance aux dégâts, Aigle: vision, Loup: avantage allié).' },
          { level: 10, name: 'Esprit naturel', description: 'Vous pouvez lancer commune with nature une fois par repos long sans composantes.' },
          { level: 14, name: 'Chef de meute', description: 'Quand vous entrez en rage, vous pouvez accorder les avantages de votre Aspect de la bête à des alliés à 9m.' },
        ],
      },
      {
        id: 'world-tree',
        name: 'Arbre-Monde',
        description: 'Votre rage puise dans la vitalité de l\'Arbre-Monde, vous permettant de protéger vos alliés.',
        classId: 'barbarian',
        level: 3,
        features: [
          { level: 3, name: 'Racines vitales', description: 'Quand vous entrez en rage, vous pouvez choisir des créatures à 3m qui gagnent des PV temporaires égaux à votre niveau de barbare.' },
          { level: 6, name: 'Branches protectrices', description: 'Vous pouvez utiliser votre réaction pour réduire les dégâts subis par un allié à 9m de 1d6 + mod. Con + niveau.' },
          { level: 10, name: 'Feuillage guérisseur', description: 'Au début de votre tour en rage, vous regagnez des PV égaux à votre modificateur de Con.' },
          { level: 14, name: 'Étreinte de l\'Arbre-Monde', description: 'Vos Racines vitales affectent une zone de 9m. Vous pouvez téléporter un allié affecté à 9m de vous.' },
        ],
      },
      {
        id: 'zealot',
        name: 'Zélote',
        description: 'Votre rage est alimentée par une ferveur divine, vous accordant des pouvoirs sacrés.',
        classId: 'barbarian',
        level: 3,
        features: [
          { level: 3, name: 'Fureur divine', description: 'Vos attaques en rage infligent 1d6 dégâts radiants ou nécrotiques supplémentaires (votre choix à chaque rage).' },
          { level: 6, name: 'Guerrier des dieux', description: 'Les sorts de résurrection lancés sur vous ne nécessitent pas de composantes matérielles.' },
          { level: 10, name: 'Fanatisme', description: 'Si vous êtes inconscient en rage, vous pouvez faire un jet de sauvegarde de Con (DD 10 + dégâts subis) pour rester à 1 PV.' },
          { level: 14, name: 'Fureur divine suprême', description: 'Les dégâts supplémentaires de Fureur divine passent à 2d6.' },
        ],
      },
    ],
  },
  {
    id: 'bard',
    name: 'Barde',
    description: 'Un magicien inspirant dont la musique et les mots tissent la magie, soignent les alliés et démoralisent les ennemis.',
    hitDie: 8,
    primaryAbility: ['cha'],
    savingThrows: ['dex', 'cha'],
    skillChoices: {
      choose: 3,
      from: ['acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight_of_hand', 'stealth'],
    },
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple', 'hand_crossbow', 'longsword', 'rapier', 'shortsword'],
    toolProficiencies: ['musical_instrument (three)'],
    spellcasting: { ability: 'cha', level: 1 },
    subclasses: [
      {
        id: 'college-of-dance',
        name: 'Collège de la Danse',
        description: 'Votre performance est une danse mortelle qui confond les ennemis et inspire les alliés.',
        classId: 'bard',
        level: 3,
        features: [
          { level: 3, name: 'Pas éblouissant', description: 'Vous pouvez utiliser l\'Inspiration barde pour ajouter à la CA ou à un jet de sauvegarde. Vous pouvez vous déplacer sans provoquer d\'attaque d\'opportunité.' },
          { level: 6, name: 'Pas du vent', description: 'Vous pouvez voler pendant votre tour si vous avez utilisé Inspiration barde. Vous ne provoquez pas d\'attaque d\'opportunité.' },
          { level: 14, name: 'Danse irresistible', description: 'Vous pouvez forcer une créature à danser, la contraignant à se déplacer et l\'empêchant d\'agir normalement.' },
        ],
      },
      {
        id: 'college-of-glamour',
        name: 'Collège du Glamour',
        description: 'Votre magie captive les sens et enchante les esprits, venue du Feywild.',
        classId: 'bard',
        level: 3,
        features: [
          { level: 3, name: 'Apparence ensorcelante', description: 'Vous pouvez dépenser une Inspiration barde pour charmer des créatures à 18m qui vous voient.' },
          { level: 3, name: 'Manteau de majesté', description: 'Vous pouvez lancer command sans emplacement de sort. En dépensant une Inspiration barde, vous lancez command comme action bonus.' },
          { level: 6, name: 'Manteau inspirant', description: 'Vous pouvez accorder des PV temporaires à des alliés à 18m.' },
          { level: 14, name: 'Apparence irrésistible', description: 'Votre Apparence ensorcelante affecte plus de créatures et dure plus longtemps.' },
        ],
      },
      {
        id: 'college-of-lore',
        name: 'Collège du Savoir',
        description: 'Vous collectionnez des connaissances de partout pour les utiliser comme armes.',
        classId: 'bard',
        level: 3,
        features: [
          { level: 3, name: 'Maîtrise supplémentaire', description: 'Vous gagnez la maîtrise de trois compétences de votre choix.' },
          { level: 3, name: 'Paroles tranchantes', description: 'Vous pouvez utiliser votre réaction et une Inspiration barde pour réduire un jet d\'attaque, un test de caractéristique ou un jet de dégâts d\'une créature à 18m.' },
          { level: 6, name: 'Secrets magiques supplémentaires', description: 'Vous apprenez deux sorts de n\'importe quelle classe.' },
          { level: 14, name: 'Contre-sorts supérieur', description: 'Quand vous contresortez, vous pouvez utiliser une Inspiration barde pour ajouter votre modificateur de Cha au test.' },
        ],
      },
      {
        id: 'college-of-valor',
        name: 'Collège de la Vaillance',
        description: 'Vous inspirez le courage au combat, maniant l\'arme et la magie avec une égale habileté.',
        classId: 'bard',
        level: 3,
        features: [
          { level: 3, name: 'Inspiration au combat', description: 'Les alliés peuvent ajouter votre Inspiration barde aux jets de dégâts ou à la CA.' },
          { level: 3, name: 'Maîtrise martiale', description: 'Vous gagnez la maîtrise des armures intermédiaires, des boucliers et des armes de guerre.' },
          { level: 6, name: 'Attaque supplémentaire', description: 'Vous pouvez attaquer deux fois au lieu d\'une quand vous prenez l\'action Attaquer.' },
          { level: 14, name: 'Maîtrise de la magie de combat', description: 'Quand vous utilisez votre action pour lancer un sort, vous pouvez faire une attaque d\'arme par une action bonus.' },
        ],
      },
    ],
  },
  {
    id: 'cleric',
    name: 'Clerc',
    description: 'Un prêtre guerrier qui canalise le pouvoir divin pour soigner, protéger et smiter les ennemis.',
    hitDie: 8,
    primaryAbility: ['wis'],
    savingThrows: ['wis', 'cha'],
    skillChoices: {
      choose: 2,
      from: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    },
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple'],
    spellcasting: { ability: 'wis', level: 1 },
    subclasses: [
      {
        id: 'life-domain',
        name: 'Domaine de la Vie',
        description: 'Le domaine de la vie se concentre sur l\'énergie positive qui soutient toute vie.',
        classId: 'cleric',
        level: 1,
        features: [
          { level: 1, name: 'Disciple de la vie', description: 'Vos sorts de soin restaurent des PV supplémentaires égaux à 2 + niveau du sort.' },
          { level: 1, name: 'Sorts du domaine: Vie', description: 'Vous avez toujours préparés: bless, cure wounds, lesser restoration, protection from poison, revivify, death ward.' },
          { level: 2, name: 'Canalisation divine: Préservation de la vie', description: 'Vous pouvez utiliser votre Canalisation divine pour soigner des créatures à 9m (PV = 5 × niveau de clerc, répartis).' },
          { level: 6, name: 'Soins bénis', description: 'Quand vous lancez un sort de niveau 1+ qui soigne, vous regagnez des PV égaux à 2 + niveau du sort.' },
          { level: 8, name: 'Frappe divine', description: 'Une fois par tour, vos attaques d\'arme infligent 1d8 dégâts radiants supplémentaires.' },
          { level: 17, name: 'Suprême guérisseur', description: 'Quand vous soignez avec un sort, vous soignez le maximum au lieu de lancer les dés.' },
        ],
      },
      {
        id: 'light-domain',
        name: 'Domaine de la Lumière',
        description: 'Le domaine de la lumière apporte la lumière du divin pour brûler les ténèbres.',
        classId: 'cleric',
        level: 1,
        features: [
          { level: 1, name: 'Lumière du matin', description: 'Vous apprenez le tour de magie light. Il ne compte pas dans votre nombre de tours connus.' },
          { level: 1, name: 'Sorts du domaine: Lumière', description: 'Vous avez toujours préparés: burning hands, flaming sphere, daylight, fire shield, wall of fire.' },
          { level: 2, name: 'Canalisation divine: Radiance du matin', description: 'Vous émettez une lumière brillante. Les créatures hostiles à 9m font un jet de Con ou sont aveuglées.' },
          { level: 6, name: 'Aile de feu', description: 'Quand vous êtes attaqué, vous pouvez utiliser votre réaction pour infliger 2d8+mod dégâts de feu à l\'attaquant.' },
          { level: 8, name: 'Frappe divine', description: 'Une fois par tour, vos attaques d\'arme infligent 1d8 dégâts radiants supplémentaires.' },
          { level: 17, name: 'Couronne de lumière', description: 'Vous émettez une lumière de 18m. Les ennemis dans la lumière ont désavantage aux jets de sauvegarde contre vos sorts de feu/radiant.' },
        ],
      },
      {
        id: 'trickery-domain',
        name: 'Domaine de la Tromperie',
        description: 'Le domaine de la tromperie célèbre le chaos, le mensonge et le subterfuge.',
        classId: 'cleric',
        level: 1,
        features: [
          { level: 1, name: 'Bénédiction du trickster', description: 'Vous pouvez utiliser une action bonus pour accorder l\'avantage aux tests de Dex (Furtivité) à une créature touchée pendant 1 heure.' },
          { level: 1, name: 'Sorts du domaine: Tromperie', description: 'Vous avez toujours préparés: charm person, disguise self, mirror image, nondetection, dimension door, modify memory.' },
          { level: 2, name: 'Canalisation divine: Invocation du duplicata', description: 'Vous créez une illusion parfaite de vous-même que vous pouvez déplacer et faire parler.' },
          { level: 6, name: 'Canalisation divine: Cape d\'ombres', description: 'Vous devenez invisible jusqu\'à la fin de votre prochain tour ou jusqu\'à ce que vous attaquiez/lanciez un sort.' },
          { level: 8, name: 'Frappe divine', description: 'Une fois par tour, vos attaques d\'arme infligent 1d8 dégâts nécrotiques supplémentaires.' },
          { level: 17, name: 'Duplicata amélioré', description: 'Vous pouvez créer jusqu\'à 4 duplicatas avec Invocation du duplicata.' },
        ],
      },
      {
        id: 'war-domain',
        name: 'Domaine de la Guerre',
        description: 'Le domaine de la guerre honore la force martiale et la victoire au combat.',
        classId: 'cleric',
        level: 1,
        features: [
          { level: 1, name: 'Maîtrises bonus', description: 'Vous gagnez la maîtrise des armes de guerre et des armures lourdes.' },
          { level: 1, name: 'Sorts du domaine: Guerre', description: 'Vous avez toujours préparés: divine favor, magic weapon, crusader\'s mantle, freedom of movement, flame strike.' },
          { level: 1, name: 'Prêtre de guerre', description: 'Quand vous prenez l\'action Attaquer, vous pouvez faire une attaque d\'arme par une action bonus (bonus de maîtrise fois par repos long).' },
          { level: 2, name: 'Canalisation divine: Attaque guidée', description: 'Vous pouvez utiliser votre réaction pour donner +10 à un jet d\'attaque (le vôtre ou un allié à 9m).' },
          { level: 6, name: 'Canalisation divine: Frappe de guerre', description: 'Quand vous touchez avec une attaque d\'arme, vous pouvez maximiser les dégâts (au lieu de lancer). Une fois par repos court.' },
          { level: 8, name: 'Frappe divine', description: 'Une fois par tour, vos attaques d\'arme infligent 1d8 dégâts radiants supplémentaires.' },
          { level: 17, name: 'Avatar de bataille', description: 'Vous avez la résistance aux dégâts contondants, perforants et tranchants d\'armes non magiques.' },
        ],
      },
    ],
  },
  {
    id: 'druid',
    name: 'Druide',
    description: 'Un prêtre de la nature qui invoque les forces élémentaires et adopte des formes animales.',
    hitDie: 8,
    primaryAbility: ['wis'],
    savingThrows: ['int', 'wis'],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'animal_handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    },
    armorProficiencies: ['light', 'medium', 'shields'], // Non-metal
    weaponProficiencies: ['simple', 'scimitar', 'sickle', 'club', 'spear', 'dagger', 'dart', 'mace', 'quarterstaff', 'sling'],
    spellcasting: { ability: 'wis', level: 1 },
    subclasses: [
      {
        id: 'circle-of-the-land',
        name: 'Cercle de la Terre',
        description: 'Vous puisez votre pouvoir dans un type de terrain spécifique.',
        classId: 'druid',
        level: 2,
        features: [
          { level: 2, name: 'Récupération naturelle', description: 'Pendant un repos court, vous récupérez des emplacements de sorts (niveau total ≤ niveau de druide / 2, max niveau 6).' },
          { level: 2, name: 'Sorts du cercle', description: 'Vous avez toujours préparés des sorts selon votre terrain (Arctique, Côte, Désert, Forêt, Montagne, Marais, Plaine, Souterrain).' },
          { level: 6, name: 'Pas sur la terre', description: 'Vous ignorez le terrain difficile non magique. Les plantes ne vous ralentissent pas. Vous avez l\'avantage aux jets de sauvegarde contre les plantes magiques.' },
          { level: 10, name: 'Nature\'s Ward', description: 'Vous ne pouvez pas être charmé ou effrayé par les élémentaires et les fées. Vous êtes immunisé au poison et à la maladie.' },
          { level: 14, name: 'Sanctuaire de la nature', description: 'Les bêtes et plantes doivent faire un jet de Sagesse pour vous attaquer.' },
        ],
      },
      {
        id: 'circle-of-the-moon',
        name: 'Cercle de la Lune',
        description: 'Vous maîtrisez la métamorphose sauvage, adoptant des formes bestiales de plus en plus puissantes.',
        classId: 'druid',
        level: 2,
        features: [
          { level: 2, name: 'Forme de combat', description: 'Vous pouvez utiliser Forme sauvage par action bonus. Vous pouvez vous transformer en bêtes de DD ≤ 1 (niv. 2), puis DD ≤ niveau/3.' },
          { level: 2, name: 'Formes du cercle', description: 'Vous pouvez vous transformer en élémentaires (niv. 10). Vos attaques en forme sauvage sont magiques.' },
          { level: 6, name: 'Frappe primordiale', description: 'Vos attaques en forme sauvage infligent des dégâts magiques. Vous pouvez dépenser un emplacement de sort pour soigner en forme sauvage.' },
          { level: 10, name: 'Forme élémentaire', description: 'Vous pouvez utiliser Forme sauvage pour devenir un élémentaire (air, terre, feu, eau).' },
          { level: 14, name: 'Métamorphose infinie', description: 'Vous pouvez utiliser Forme sauvage un nombre illimité de fois. Vous pouvez lancer alter self à volonté.' },
        ],
      },
      {
        id: 'circle-of-the-sea',
        name: 'Cercle de la Mer',
        description: 'Vous êtes lié aux océans et aux tempêtes, maniant l\'eau et le vent.',
        classId: 'druid',
        level: 2,
        features: [
          { level: 2, name: 'Étreinte de la mer', description: 'Vous gagnez une vitesse de nage égale à votre vitesse. Vous pouvez respirer sous l\'eau. Vous avez la résistance au froid.' },
          { level: 2, name: 'Sorts du cercle', description: 'Vous avez toujours préparés: fog cloud, gust of wind, water walk, control water, cone of cold.' },
          { level: 6, name: 'Fureur de la tempête', description: 'Quand vous lancez un sort de niveau 1+, vous pouvez créer une aura de 3m qui inflige des dégâts de froid/éclair aux ennemis.' },
          { level: 10, name: 'Forme de tempête', description: 'Vous gagnez une vitesse de vol de 18m (hover) et la résistance à l\'éclair/tonnerre/froid pendant 1 minute.' },
          { level: 14, name: 'Maître des océans', description: 'Vous pouvez lancer control water sans emplacement. Vous pouvez communiquer avec les bêtes aquatiques.' },
        ],
      },
      {
        id: 'circle-of-the-stars',
        name: 'Cercle des Étoiles',
        description: 'Vous lisez l\'avenir dans les constellations et invoquez la magie stellaire.',
        classId: 'druid',
        level: 2,
        features: [
          { level: 2, name: 'Carte astrale', description: 'Vous avez une carte astrale qui sert de focaliseur. Vous pouvez lancer guiding bolt une fois par repos long sans emplacement.' },
          { level: 2, name: 'Forme astrale', description: 'Par action bonus, vous prenez une forme astrale (Archer, Chalice, Dragon) qui donne des avantages pendant 10 min.' },
          { level: 6, name: 'Orbites cosmiques', description: 'Votre Forme astrale dure 10 min / niveau de druide. Vous pouvez changer de forme par action bonus.' },
          { level: 10, name: 'Constellations changeantes', description: 'Vous pouvez changer la constellation de votre Forme astrale quand vous lancez un sort.' },
          { level: 14, name: 'Corps astral complet', description: 'Vous êtes immunisé aux états charmé, effrayé, paralysé, pétrifié, empoisonné en Forme astrale. Vous gagnez la résistance aux dégâts radiants/nécrotiques.' },
        ],
      },
    ],
  },
  {
    id: 'fighter',
    name: 'Guerrier',
    description: 'Un maître du combat martial, polyvalent et mortel, qui excelle avec toutes les armes et armures.',
    hitDie: 10,
    primaryAbility: ['str', 'dex'],
    savingThrows: ['str', 'con'],
    skillChoices: {
      choose: 2,
      from: ['acrobatics', 'animal_handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    },
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    subclasses: [
      {
        id: 'champion',
        name: 'Champion',
        description: 'Un guerrier qui cherche la perfection physique et martiale par l\'entraînement rigoureux.',
        classId: 'fighter',
        level: 3,
        features: [
          { level: 3, name: 'Amélioration du coup critique', description: 'Vos attaques d\'arme font un coup critique sur 19-20.' },
          { level: 3, name: 'Athlète remarquable', description: 'Vous pouvez ajouter la moitié de votre bonus de maîtrise (arrondi au supérieur) aux tests de For, Dex, Con où vous n\'avez pas la maîtrise. Votre saut en longueur augmente de 1,5m.' },
          { level: 7, name: 'Style de combat supplémentaire', description: 'Vous gagnez une option de Style de combat supplémentaire.' },
          { level: 10, name: 'Survivant héroïque', description: 'Au début de votre tour, si vous avez ≤ 50% PV, vous regagnez 5 + niveau de guerrier PV.' },
          { level: 15, name: 'Coup critique supérieur', description: 'Vos attaques d\'arme font un coup critique sur 18-20.' },
          { level: 18, name: 'Survivant suprême', description: 'Au début de votre tour, si vous avez ≤ 50% PV, vous regagnez 10 + niveau de guerrier PV.' },
        ],
      },
      {
        id: 'battle-master',
        name: 'Maître de Bataille',
        description: 'Un tacticien qui utilise des manœuvres spéciales pour contrôler le champ de bataille.',
        classId: 'fighter',
        level: 3,
        features: [
          { level: 3, name: 'Manœuvres de combat', description: 'Vous apprenez 3 manœuvres (choisies parmi 16). Vous avez 4 dés de supériorité (d8). Vous regagnez tous les dés au repos court/long.' },
          { level: 3, name: 'Connaissance du combat', description: 'Vous pouvez utiliser une action bonus pour analyser une créature, apprenant ses caractéristiques de combat.' },
          { level: 7, name: 'Manœuvres supplémentaires', description: 'Vous apprenez 2 manœuvres de plus. Vos dés de supériorité deviennent d10.' },
          { level: 10, name: 'Manœuvres supplémentaires', description: 'Vous apprenez 2 manœuvres de plus. Vos dés de supériorité deviennent d12.' },
          { level: 15, name: 'Recharge rapide', description: 'Quand vous lancez l\'initiative et n\'avez plus de dés de supériorité, vous en regagnez 1.' },
          { level: 18, name: 'Manœuvre ultime', description: 'Vous apprenez 2 manœuvres de plus. Vous avez 6 dés de supériorité.' },
        ],
      },
      {
        id: 'eldritch-knight',
        name: 'Chevalier Ensorceleur',
        description: 'Un guerrier qui complète sa maîtrise martiale par l\'étude de la magie arcanique.',
        classId: 'fighter',
        level: 3,
        features: [
          { level: 3, name: 'Incantation', description: 'Vous apprenez des sorts de magicien (principalement évocation et abjuration). Vous avez des emplacements de sort comme un lanceur de niveau 1/3.' },
          { level: 3, name: 'Lien d\'arme', description: 'Vous pouvez lier une arme à vous par un rituel de 1h. Vous ne pouvez pas être désarmé de cette arme. Vous pouvez la téléporter à votre main par action bonus.' },
          { level: 7, name: 'Frappe de guerre', description: 'Quand vous utilisez votre action pour lancer un tour de magie, vous pouvez faire une attaque d\'arme par action bonus.' },
          { level: 10, name: 'Charge ensorceleuse', description: 'Vous pouvez téléporter 9m avant ou après l\'action Attaquer (action bonus).' },
          { level: 15, name: 'Frappe de guerre améliorée', description: 'Quand vous utilisez votre action pour lancer un sort de niveau 1+, vous pouvez faire une attaque d\'arme par action bonus.' },
          { level: 18, name: 'Maître de guerre arcanique', description: 'Vous pouvez utiliser Charge ensorceleuse pour vous téléporter et faire une attaque supplémentaire.' },
        ],
      },
      {
        id: 'psi-warrior',
        name: 'Guerrier Psi',
        description: 'Un guerrier qui éveille son potentiel mental pour manifester des pouvoirs psioniques.',
        classId: 'fighter',
        level: 3,
        features: [
          { level: 3, name: 'Puissance psionique', description: 'Vous avez un réservoir de dés psioniques (d6, nombre = 2 × bonus de maîtrise). Vous pouvez les dépenser pour: Bouclier protecteur, Télékinésie, Frappe psi.' },
          { level: 7, name: 'Télékinésie', description: 'Vous pouvez déplacer des objets/créatures par la pensée. Vous pouvez voler (concentration).' },
          { level: 10, name: 'Lames psi', description: 'Vos attaques d\'arme infligent 1d6 dégâts de force supplémentaires. Vous pouvez les rendre à portée 9m.' },
          { level: 15, name: 'Métamorphose psi', description: 'Vous pouvez dépenser des dés psi pour gagner: vol, vision vraie, résistance aux dégâts, ou changer de taille.' },
          { level: 18, name: 'Puissance psi suprême', description: 'Vous avez 12 dés psi (d12). Vous regagnez 1 dé psi au début de chaque tour.' },
        ],
      },
    ],
  },
  {
    id: 'monk',
    name: 'Moine',
    description: 'Un maître des arts martiaux qui canalise le ki pour accomplir des exploits surhumains.',
    hitDie: 8,
    primaryAbility: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    skillChoices: {
      choose: 2,
      from: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    },
    armorProficiencies: [],
    weaponProficiencies: ['simple', 'shortsword'],
    subclasses: [
      {
        id: 'way-of-the-open-hand',
        name: 'Voie de la Main Ouverte',
        description: 'La voie traditionnelle du moine, se concentrant sur la maîtrise pure du corps.',
        classId: 'monk',
        level: 3,
        features: [
          { level: 3, name: 'Technique de la main ouverte', description: 'Quand vous touchez avec Flurry of Blows, vous pouvez: pousser 4,5m, mettre à terre, ou empêcher les réactions.' },
          { level: 6, name: 'Corps sain', description: 'Vous pouvez relancer un jet de sauvegarde raté (1/repos long). Vous êtes immunisé aux maladies et poisons.' },
          { level: 11, name: 'Toucher apaisant', description: 'Vous pouvez dépenser 3 pts de ki pour soigner 1d10 + niveau de moine PV, ou mettre fin à un effet (charme, peur, poison, etc.).' },
          { level: 17, name: 'Toucher de la mort vibrante', description: 'Vous pouvez créer une vibration mortelle dans un corps. La cible fait un jet de Con (DD = 8 + bonus maîtrise + mod. Sag) ou tombe à 0 PV. Sinon 10d10 dégâts nécrotiques.' },
        ],
      },
      {
        id: 'way-of-shadow',
        name: 'Voie de l\'Ombre',
        description: 'Les moines de l\'ombre utilisent la furtivité et la magie noire pour frapper sans être vus.',
        classId: 'monk',
        level: 3,
        features: [
          { level: 3, name: 'Arts de l\'ombre', description: 'Vous pouvez dépenser des pts de ki pour lancer: minor illusion, darkness, darkvision, pass without trace, silence.' },
          { level: 6, name: 'Pas de l\'ombre', description: 'Vous pouvez vous téléporter d\'ombre en ombre (18m) par action bonus dans l\'obscurité/faible lumière.' },
          { level: 11, name: 'Trompe-l\'œil', description: 'Vous pouvez créer une illusion de vous-même quand vous êtes attaqué (réaction, 1 pt ki). L\'attaque touche l\'illusion.' },
          { level: 17, name: 'Maître de l\'ombre', description: 'Vous pouvez devenir invisible par action bonus (1 pt ki/minute). Dans l\'obscurité, vous avez l\'avantage aux jets d\'attaque.' },
        ],
      },
      {
        id: 'way-of-the-four-elements',
        name: 'Voie des Quatre Éléments',
        description: 'Vous harmonisez votre ki avec les éléments pour lancer des sorts élémentaires.',
        classId: 'monk',
        level: 3,
        features: [
          { level: 3, name: 'Disciple des éléments', description: 'Vous apprenez des disciplines élémentaires (sorts) en dépensant des pts de ki. Vous en connaissez 2 au niv. 3, +1 aux niv. 6, 11, 17.' },
          { level: 6, name: 'Maîtrise élémentaire', description: 'Vous pouvez dépenser des pts de ki supplémentaires pour augmenter le niveau des sorts élémentaires.' },
          { level: 11, name: 'Afflux élémentaire', description: 'Vous pouvez ajouter votre modificateur de Sag aux dégâts d\'un sort élémentaire.' },
          { level: 17, name: 'Maître des éléments', description: 'Vous connaissez toutes les disciplines élémentaires. Vous regagnez 4 pts de ki au début du combat si vous n\'en avez plus.' },
        ],
      },
      {
        id: 'way-of-mercy',
        name: 'Voie de la Miséricorde',
        description: 'Vous manipulez l\'énergie vitale pour soigner ou blesser, apportant la miséricorde ou la fin.',
        classId: 'monk',
        level: 3,
        features: [
          { level: 3, name: 'Médecine du ki', description: 'Vous gagnez la maîtrise du kit d\'herboristerie. Vos coups de poing sans arme peuvent soigner (dépense 1 pt ki) ou infliger des dégâts nécrotiques supplémentaires.' },
          { level: 6, name: 'Main de guérison', description: 'Vous pouvez soigner en dépensant des pts de ki (1d10 + niveau par pt). Vous pouvez aussi mettre fin à des états.' },
          { level: 11, name: 'Médecine suprême', description: 'Vos soins de Main de guérison deviennent 1d12 + niveau. Vous pouvez ressusciter (revivify) pour 5 pts ki.' },
          { level: 17, name: 'Main de la mort', description: 'Quand vous réduisez une créature à 0 PV, vous pouvez dépenser 3 pts ki pour la tuer instantanément (jet de Con pour résister).' },
        ],
      },
    ],
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Un chevalier sacré lié par un serment, combinant puissance martiale et magie divine.',
    hitDie: 10,
    primaryAbility: ['str', 'cha'],
    savingThrows: ['wis', 'cha'],
    skillChoices: {
      choose: 2,
      from: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    },
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    spellcasting: { ability: 'cha', level: 2 },
    subclasses: [
      {
        id: 'oath-of-devotion',
        name: 'Serment de Dévouement',
        description: 'Le serment classique du chevalier en armure brillante, dédié à l\'honneur, la justice et la protection des faibles.',
        classId: 'paladin',
        level: 3,
        features: [
          { level: 3, name: 'Serment de dévouement', description: 'Vous gagnez deux options de Canalisation divine: Arme sacrée (arme = magique, +Cha aux jets d\'attaque) et Abjuration des ennemis (effroi).' },
          { level: 7, name: 'Aura de dévotion', description: 'Vous et les alliés à 3m ne pouvez pas être charmés. Au niv. 18, portée 9m.' },
          { level: 15, name: 'Pureté d\'esprit', description: 'Vous êtes immunisé aux maladies et au poison. Vous avez l\'avantage aux jets de sauvegarde contre les sorts.' },
          { level: 20, name: 'Parangon de dévouement', description: 'Pendant 1 minute: lumière 9m, avantage aux jets d\'attaque contre fiélons/morts-vivants, ils font jet de Sagesse ou fuient. 1/repos long.' },
        ],
      },
      {
        id: 'oath-of-the-ancients',
        name: 'Serment des Anciens',
        description: 'Un serment de protéger la vie et la lumière contre les ténèbres, aussi ancien que les fées.',
        classId: 'paladin',
        level: 3,
        features: [
          { level: 3, name: 'Serment des Anciens', description: 'Canalisation divine: Colère de la nature (enracine), Tourne-leur le dos (effroi fées/fiélons).' },
          { level: 7, name: 'Aura de protection', description: 'Vous et alliés à 3m: résistance aux dégâts de sorts. Au niv. 18, portée 9m.' },
          { level: 15, name: 'Vétéran indomptable', description: 'Vous avez toujours l\'avantage aux jets de sauvegarde. Vous régénérez 1d6 PV/round si > 0 PV.' },
          { level: 20, name: 'Champion des Anciens', description: 'Vous pouvez prendre une forme féerique pendant 1 minute: vol, résistance aux dégâts d\'armes non magiques, sorts de fée gratuits. 1/repos long.' },
        ],
      },
      {
        id: 'oath-of-vengeance',
        name: 'Serment de Vengeance',
        description: 'Un serment de punir les coupables sans merci, peu importe le coût personnel.',
        classId: 'paladin',
        level: 3,
        features: [
          { level: 3, name: 'Serment de vengeance', description: 'Canalisation divine: Abjuration des ennemis (effroi), Voeu d\'inimitié (avantage aux attaques contre une cible, 1/min).' },
          { level: 7, name: 'Ame implacable', description: 'Vous avez l\'avantage aux jets de sauvegarde pour éviter d\'être ralenti, paralysé, entravé.' },
          { level: 15, name: 'Châtiment des coupables', description: 'Quand une créature hostile à 3m fait une attaque, vous pouvez utiliser votre réaction pour faire une attaque au corps-à-corps contre elle.' },
          { level: 20, name: 'Avatar de vengeance', description: 'Pendant 1 heure: ailes (vol 18m), aura de terreur 9m, vous regagnez 1d6 PV/round. 1/repos long.' },
        ],
      },
      {
        id: 'oathbreaker',
        name: 'Briseur de Serment',
        description: 'Un paladin qui a rompu son serment, tirant maintenant son pouvoir de l\'obscurité et de l\'ambition personnelle.',
        classId: 'paladin',
        level: 3,
        features: [
          { level: 3, name: 'Serment rompu', description: 'Canalisation divine: Contrôle des morts-vivants (commande), Voeu de haine (avantage attaques, dégâts nécrotiques).' },
          { level: 7, name: 'Aura de haine', description: 'Vous et alliés fiélons/morts-vivants à 3m: bonus aux dégâts de mêlée = mod. Cha. Au niv. 18, portée 9m.' },
          { level: 15, name: 'Seigneur de la corruption', description: 'Vous avez la résistance aux dégâts nécrotiques. Quand vous êtes touché au corps-à-corps, l\'attaquant subit des dégâts nécrotiques = mod. Cha.' },
          { level: 20, name: 'Seigneur des ténèbres', description: 'Pendant 1 minute: aura d\'obscurité 9m, vous voyez dans la magie darkness, avantage aux jets de sauvegarde, dégâts nécrotiques aux ennemis qui vous touchent. 1/repos long.' },
        ],
      },
    ],
  },
  {
    id: 'ranger',
    name: 'Rôdeur',
    description: 'Un guerrier des frontières qui traque ses proies, protège la nature et manie la magie druidique.',
    hitDie: 10,
    primaryAbility: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    skillChoices: {
      choose: 3,
      from: ['animal_handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    },
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    spellcasting: { ability: 'wis', level: 1 },
    subclasses: [
      {
        id: 'hunter',
        name: 'Chasseur',
        description: 'Un maître de la traque et de l\'abattage des menaces, qu\'elles soient monstres ou humanoïdes.',
        classId: 'ranger',
        level: 3,
        features: [
          { level: 3, name: 'Proie du chasseur', description: 'Vous gagnez une caractéristique: Colossus Slayer (dégâts supplémentaires gros monstres), Giant Killer (réaction contre grosses créatures), ou Horde Breaker (attaque supplémentaire vs groupe).' },
          { level: 7, name: 'Tactique défensive', description: 'Vous gagnez: Escape the Horde (désavantage attaques opportunités contre vous), Multiattack Defense (+4 CA vs attaques multiples), ou Steel Will (avantage vs peur).' },
          { level: 11, name: 'Attaque multiple', description: 'Volley (attaque à distance vs toutes créatures 3m), Whirlwind Attack (attaque corps-à-corps vs toutes créatures 1,5m), ou Superior Hunter\'s Defense (évasion/contre-attaque).' },
          { level: 15, name: 'Maître chasseur', description: 'Vous gagnez une deuxième option de Proie du chasseur, Tactique défensive, et Attaque multiple.' },
        ],
      },
      {
        id: 'beast-master',
        name: 'Maître des Bêtes',
        description: 'Vous formez un lien mystique avec une bête qui combat à vos côtés.',
        classId: 'ranger',
        level: 3,
        features: [
          { level: 3, name: 'Compagnon bestial', description: 'Vous avez un compagnon bête (DD 1/4 max). Il agit à votre initiative. Vous pouvez lui donner des ordres par action bonus.' },
          { level: 7, name: 'Lien exceptionnel', description: 'Votre compagnon gagne: PV max = 5 × niveau de rôdeur, maîtrise de tous les jets de sauvegarde, attaques magiques.' },
          { level: 11, name: 'Meute coordonnée', description: 'Quand vous prenez l\'action Attaquer, votre compagnon peut faire une attaque par réaction.' },
          { level: 15, name: 'Partage des sorts', description: 'Vous pouvez cibler votre compagnon avec vos sorts "Soin" ou "Protection" (portée perso).' },
        ],
      },
      {
        id: 'gloom-stalker',
        name: 'Traqueur des Ténèbres',
        description: 'Vous chassez dans l\'obscurité, utilisant les ombres comme arme et bouclier.',
        classId: 'ranger',
        level: 3,
        features: [
          { level: 3, name: 'Disciple des ténèbres', description: 'Vision dans le noir 18m (ou +9m). Vous êtes invisible dans l\'obscurité pour les créatures qui s\'y fient. Vous apprenez: disguise self, rope trick, fear, greater invisibility.' },
          { level: 3, name: 'Embuscade nocturne', description: 'Au premier round de combat, votre vitesse +3m, vous pouvez faire une attaque supplémentaire (1d8 dégâts).' },
          { level: 7, name: 'Furtif fer de lance', description: 'Vous pouvez vous cacher par action bonus. Vos attaques ne révèlent pas votre position.' },
          { level: 11, name: 'Évasion de fer', description: 'Vous avez l\'avantage aux jets de sauvegarde de Dex. Vous pouvez utiliser votre réaction pour imposer désavantage à une attaque contre vous.' },
          { level: 15, name: 'Maître des ombres', description: 'Vous pouvez vous téléporter 18m entre zones d\'ombre par action bonus.' },
        ],
      },
      {
        id: 'drakewarden',
        name: 'Gardien de Drake',
        description: 'Vous êtes lié à un drake, un petit dragon qui grandit en puissance à vos côtés.',
        classId: 'ranger',
        level: 3,
        features: [
          { level: 3, name: 'Drake compagnion', description: 'Vous invoquez un drake (petit dragon). Il grandit avec vous (Taille P au niv. 7, M au niv. 15). Il a un souffle élémentaire.' },
          { level: 7, name: 'Lien du drake', description: 'Vous pouvez parler avec votre drake. Il gagne la résistance à un type de dégâts (feu, froid, acide, poison, éclair).' },
          { level: 11, name: 'Monture draconique', description: 'Votre drake devient taille M. Vous pouvez le monter. Il gagne vol 12m.' },
          { level: 15, name: 'Souffle partagé', description: 'Quand votre drake utilise son souffle, vous pouvez aussi l\'utiliser (réaction).' },
        ],
      },
    ],
  },
  {
    id: 'rogue',
    name: 'Voleur',
    description: 'Un expert en ruse, furtivité et coups précis, qui frappe là où ça fait mal.',
    hitDie: 8,
    primaryAbility: ['dex'],
    savingThrows: ['dex', 'int'],
    skillChoices: {
      choose: 4,
      from: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight_of_hand', 'stealth'],
    },
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple', 'hand_crossbow', 'longsword', 'rapier', 'shortsword'],
    toolProficiencies: ['thieves\' tools'],
    subclasses: [
      {
        id: 'thief',
        name: 'Voleur',
        description: 'Le voleur classique, maître de l\'effraction, de la ruse et de l\'acquisition d\'objets.',
        classId: 'rogue',
        level: 3,
        features: [
          { level: 3, name: 'Mains rapides', description: 'Vous pouvez utiliser l\'action bonus pour: test de Dex (Furtivité), outils de voleur, ou action "Utiliser un objet".' },
          { level: 3, name: 'Grimpeur de second étage', description: 'L\'escalade ne vous coûte pas de mouvement supplémentaire. Vos sauts en longueur/hauteur augmentent de 1,5m.' },
          { level: 9, name: 'Suppléant suprême', description: 'Vous avez l\'avantage aux tests de Dex (Furtivité) et aux tests d\'outils de voleur. Vous pouvez utiliser parchemin/objets magiques sans restriction de classe.' },
          { level: 13, name: 'Réflexes du voleur', description: 'Au premier round de combat, vous prenez deux tours (initiative et initiative - 10).' },
          { level: 17, name: 'Maître voleur', description: 'Vous pouvez refaire un test de caractéristique échoué (1/repos court). Vous avez l\'avantage aux jets de sauvegarde de Dex.' },
        ],
      },
      {
        id: 'assassin',
        name: 'Assassin',
        description: 'Un tueur professionnel spécialisé dans l\'infiltration, le déguisement et l\'élimination ciblée.',
        classId: 'rogue',
        level: 3,
        features: [
          { level: 3, name: 'Attaque sournoise', description: 'Avantage aux jets d\'attaque vs créatures qui n\'ont pas agi. Coup critique auto vs surprises.' },
          { level: 3, name: 'Infiltration', description: 'Vous gagnez la maîtrise du kit de déguisement et du kit d\'empoisonneur. Vous pouvez créer de fausses identités.' },
          { level: 9, name: 'Imitation', description: 'Vous pouvez imiter parfaitement la parole, l\'écriture et le comportement d\'autrui après 3h d\'observation.' },
          { level: 13, name: 'Mort impitoyable', description: 'Vos attaques sournoises ignorent la résistance aux dégâts perforants. Les critiques infligent des dégâts supplémentaires.' },
          { level: 17, name: 'Frappe mortelle', description: 'Si vous touchez une créature surprise, elle fait un jet de Con (DD = 8 + bonus maîtrise + mod. Dex) ou meurt.' },
        ],
      },
      {
        id: 'arcane-trickster',
        name: 'Fripouille Arcanique',
        description: 'Un voleur qui complète ses talents par la magie d\'illusion et d\'enchantement.',
        classId: 'rogue',
        level: 3,
        features: [
          { level: 3, name: 'Incantation', description: 'Vous apprenez des sorts de magicien (illusion, enchantement). Emplacements comme lanceur niveau 1/3.' },
          { level: 3, name: 'Main de mage', description: 'Vous apprenez mage hand (invisible). Vous pouvez: déposer/prendre objets, utiliser outils de voleur, à 9m.' },
          { level: 9, name: 'Vol magique', description: 'Vous pouvez utiliser votre réaction pour annuler un sort qui vous cible (jet de Cha vs DD sort). Vous apprenez le sort.' },
          { level: 13, name: 'Main de mage polyvalente', description: 'Votre main de mage peut porter 5kg. Vous pouvez l\'utiliser pour attaquer (sort).' },
          { level: 17, name: 'Vol de sorts suprême', description: 'Vous pouvez voler un sort de niveau ≤ 5 (réaction). Vous le lancez sans emplacement. 1/repos long.' },
        ],
      },
      {
        id: 'soulknife',
        name: 'Lame d\'Âme',
        description: 'Un voleur psionique qui manifeste des lames d\'énergie mentale pure.',
        classId: 'rogue',
        level: 3,
        features: [
          { level: 3, name: 'Lames psi', description: 'Vous pouvez manifester des lames d\'énergie psychique (1d6 + mod. Dex, psy). Elles ont la propriété "light" et "thrown" (18/36m).' },
          { level: 3, name: 'Télépathie', description: 'Vous pouvez communiquer télépathiquement avec créatures à 18m (langue commune).' },
          { level: 6, name: 'Voile psi', description: 'Vous pouvez devenir invisible (1 pt psi/minute). Vous pouvez dépenser des pts psi pour ajouter aux tests de Dex/Cha.' },
          { level: 11, name: 'Lames psychiques', description: 'Vos lames psi infligent 1d8 + mod. Dex. Vous pouvez les faire ricochetter.' },
          { level: 17, name: 'Lame d\'âme suprême', description: 'Vos lames psi infligent 1d10. Vous pouvez dépenser des pts psi pour: téléportation, domination, planeshift.' },
        ],
      },
    ],
  },
  {
    id: 'sorcerer',
    name: 'Ensorceleur',
    description: 'Un magicien dont le pouvoir inné jaillit de son sang, de son âme ou d\'un événement mystique.',
    hitDie: 6,
    primaryAbility: ['cha'],
    savingThrows: ['con', 'cha'],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    },
    armorProficiencies: [],
    weaponProficiencies: ['dagger', 'dart', 'sling', 'quarterstaff', 'light_crossbow'],
    spellcasting: { ability: 'cha', level: 1 },
    subclasses: [
      {
        id: 'draconic-bloodline',
        name: 'Lignée Draconique',
        description: 'Le sang des dragons coule dans vos veines, vous accordant leur puissance et leur résistance.',
        classId: 'sorcerer',
        level: 1,
        features: [
          { level: 1, name: 'Résilience draconique', description: 'PV max +1/niveau. CA de base = 13 + mod. Dex (sans armure).' },
          { level: 1, name: 'Ancêtre dragon', description: 'Choisissez un type de dragon. Vous parlez draconique. Résistance au type de dégâts associé.' },
          { level: 6, name: 'Afflux élémentaire', description: 'Quand vous lancez un sort du type de votre dragon, vous pouvez ajouter mod. Cha aux dégâts (1 pt sorcellerie).' },
          { level: 14, name: 'Ailes draconiques', description: 'Vous manifestez des ailes spectrales (vol 18m). 1 pt sorcellerie/heure.' },
          { level: 18, name: 'Présence draconique', description: 'Vous pouvez faire peur/charmer dans 18m (5 pts sorcellerie).' },
        ],
      },
      {
        id: 'wild-magic',
        name: 'Magie Sauvage',
        description: 'Votre magie est imprévisible, surgissant de façon chaotique et parfois bénéfique.',
        classId: 'sorcerer',
        level: 1,
        features: [
          { level: 1, name: 'Magie sauvage', description: 'Quand vous lancez un sort de niveau 1+, le MJ peut demander un d20. Sur 1, effet de Surge sauvage (table aléatoire).' },
          { level: 1, name: 'Flux de chaos', description: 'Vous pouvez avoir l\'avantage sur un jet (1 pt sorcellerie). Si vous le faites, le MJ lance sur la table Surge sauvage.' },
          { level: 6, name: 'Tordre le destin', description: 'Vous pouvez dépenser 2 pts sorcellerie pour ajouter 1d4 à un jet d\'attaque, test, ou jet de sauvegarde (après le jet, avant résultat).' },
          { level: 14, name: 'Magie contrôlée', description: 'Quand vous faites un Surge sauvage, vous pouvez lancer deux fois et choisir.' },
          { level: 18, name: 'Maître du chaos', description: 'Vous regagnez 1 pt sorcellerie quand vous lancez un sort de niveau 1+ (1/tour). Surge sauvage: vous choisissez l\'effet.' },
        ],
      },
      {
        id: 'divine-soul',
        name: 'Âme Divine',
        description: 'Votre pouvoir vient d\'une source divine, vous donnant accès à la magie des clercs.',
        classId: 'sorcerer',
        level: 1,
        features: [
          { level: 1, name: 'Magie divine', description: 'Vous apprenez des sorts de clerc (choisis par votre origine divine). Ils comptent comme sorts d\'ensorceleur.' },
          { level: 1, name: 'Faveur divine', description: 'Vous pouvez ajouter 2d4 à un jet raté (1 pt sorcellerie).' },
          { level: 6, name: 'Résilience renforcée', description: 'Vous avez l\'avantage aux jets de sauvegarde (1 pt sorcellerie, 1 minute).' },
          { level: 14, name: 'Ailes divines', description: 'Vous manifestez des ailes (vol 18m). 1 pt sorcellerie/heure. Aspect selon votre origine.' },
          { level: 18, name: 'Forme divine', description: 'Vous pouvez devenir une forme divine (1h): immunité charme/peur, résistance dégâts nécrotiques/radiants, vol, PV temp. 1/repos long.' },
        ],
      },
      {
        id: 'shadow-magic',
        name: 'Magie de l\'Ombre',
        description: 'Votre magie provient du Plan des Ombres, vous donnant des pouvoirs ténébreux.',
        classId: 'sorcerer',
        level: 1,
        features: [
          { level: 1, name: 'Yeux de la nuit', description: 'Vision dans le noir 36m. Vous pouvez voir dans la magie darkness.' },
          { level: 1, name: 'Force de l\'ombre', description: 'Quand vous tombez à 0 PV, vous pouvez faire un jet de Cha (DD = dégâts subis) pour tomber à 1 PV au lieu (1 pt sorcellerie).' },
          { level: 6, name: 'Chien des ombres', description: 'Vous pouvez invoquer un chien des ombres (action bonus, 3 pts sorcellerie). Il attaque pour vous.' },
          { level: 14, name: 'Marche de l\'ombre', description: 'Vous pouvez vous téléporter 36m entre zones d\'ombre (action bonus).' },
          { level: 18, name: 'Forme d\'ombre', description: 'Vous pouvez devenir une ombre (1 pt sorcellerie/minute): vol, résistance dégâts, traverser murs.' },
        ],
      },
    ],
  },
  {
    id: 'warlock',
    name: 'Démoniste',
    description: 'Un chercheur de savoir interdit qui a conclu un pacte avec une entité puissante.',
    hitDie: 8,
    primaryAbility: ['cha'],
    savingThrows: ['wis', 'cha'],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    },
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple'],
    spellcasting: { ability: 'cha', level: 1 },
    subclasses: [
      {
        id: 'archfey-patron',
        name: 'Pacte de l\'Archifey',
        description: 'Votre patron est un seigneur féerique, vous accordant des pouvoirs de glamour et d\'illusion.',
        classId: 'warlock',
        level: 1,
        features: [
          { level: 1, name: 'Magie de l\'Archifey', description: 'Vous apprenez des sorts de fée: faerie fire, sleep, calm emotions, phantasmal force, blink, plant growth, dominate beast, greater invisibility, dominate person.' },
          { level: 1, name: 'Séduction féerique', description: 'Vous pouvez charmer ou effrayer (action, 1/repos court). DD = DD de vos sorts.' },
          { level: 6, name: 'Échappatoire brumeuse', description: 'Quand vous subissez des dégâts, vous pouvez devenir invisible et vous téléporter 18m (réaction, 1/repos court).' },
          { level: 10, name: 'Bouclier féerique', description: 'Vous pouvez imposer le désavantage à une attaque contre vous (réaction). Vous pouvez le faire sur des alliés à 18m.' },
          { level: 14, name: 'Séduction supérieure', description: 'Votre Séduction féerique affecte un rayon de 9m. Les cibles charmées vous obéissent.' },
        ],
      },
      {
        id: 'fiend-patron',
        name: 'Pacte du Fiélon',
        description: 'Votre patron est un démon ou un diable, vous accordant le pouvoir destructeur des enfers.',
        classId: 'warlock',
        level: 1,
        features: [
          { level: 1, name: 'Magie du Fiélon', description: 'Vous apprenez: burning hands, command, blindness/deafness, scorching ray, fireball, stinking cloud, fire shield, wall of fire, hallow.' },
          { level: 1, name: 'Bénédiction sombre', description: 'Quand vous réduisez une créature hostile à 0 PV, vous gagnez PV temporaires = niveau de démoniste + mod. Cha.' },
          { level: 6, name: 'Chance du diable', description: 'Vous pouvez ajouter 1d10 à un jet de sauvegarde ou test de caractéristique (1/repos court).' },
          { level: 10, name: 'Résistance infernale', description: 'Choisissez un type de dégâts (feu, froid, poison, nécrotique, feu, psychique). Vous avez la résistance. Changeable au repos long.' },
          { level: 14, name: 'Frappe du diable', description: 'Vous pouvez infliger 10d10 dégâts de feu à une créature que vous touchez (1/repos long). Elle fait un jet de Con pour moitié.' },
        ],
      },
      {
        id: 'great-old-one-patron',
        name: 'Pacte du Grand Ancien',
        description: 'Votre patron est une entité cosmique incompréhensible, vous accordant des pouvoirs mentaux.',
        classId: 'warlock',
        level: 1,
        features: [
          { level: 1, name: 'Magie du Grand Ancien', description: 'Vous apprenez: dissonant whispers, Tasha\'s hideous laughter, detect thoughts, clairvoyance, dominate beast, Evard\'s black tentacles, telepathic bond, create thrall.' },
          { level: 1, name: 'Télépathie éveillée', description: 'Vous pouvez communiquer télépathiquement avec créatures à 9m (langue connue).' },
          { level: 6, name: 'Esprit entropique', description: 'Vous ne pouvez pas être surpris. Vous avez l\'avantage aux jets de sauvegarde contre le charme/la peur.' },
          { level: 10, name: 'Pensée protectrice', description: 'Vous gagnez PV temporaires = niveau de démoniste + mod. Cha au repos court/long. Vous pouvez les donner à un allié à 9m.' },
          { level: 14, name: 'Créer thrall', description: 'Vous pouvez charmer une créature incapacitée (action, 1/repos long). Elle vous obéit jusqu\'à dispel magic.' },
        ],
      },
      {
        id: 'hexblade-patron',
        name: 'Pacte de la Lame Maudit',
        description: 'Votre patron est une entité mystérieuse du Plan des Ombres, manifestée dans une arme sentiente.',
        classId: 'warlock',
        level: 1,
        features: [
          { level: 1, name: 'Magie de la Lame', description: 'Vous apprenez: shield, wrathful smite, blur, branding smite, blink, elemental weapon, banishment, staggering smite.' },
          { level: 1, name: 'Lame maudite', description: 'Vous pouvez utiliser le Cha au lieu de For/Dex pour les attaques/dégâts avec une arme à une main. Vous gagnez la maîtrise des armures intermédiaires, boucliers, armes de guerre.' },
          { level: 6, name: 'Lien maudit', description: 'Vous pouvez lier une arme (1h). Vous ne pouvez pas être désarmé. L\'arme devient magique. Vous pouvez la faire apparaître (action bonus).' },
          { level: 10, name: 'Maître de la lame', description: 'Vos attaques avec l\'arme liée infligent 1d6 dégâts nécrotiques supplémentaires. Vous pouvez ajouter mod. Cha aux jets de sauvegarde (1/repos court).' },
          { level: 14, name: 'Lame maudite suprême', description: 'Vous pouvez maudire une créature (action bonus): désavantage aux jets de sauvegarde, vous gagnez PV temp quand vous la blessez. 1/repos court.' },
        ],
      },
    ],
  },
  {
    id: 'wizard',
    name: 'Magicien',
    description: 'Un érudit de l\'arcane qui manipule la réalité par l\'étude, la formule et la volonté.',
    hitDie: 6,
    primaryAbility: ['int'],
    savingThrows: ['int', 'wis'],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    },
    armorProficiencies: [],
    weaponProficiencies: ['dagger', 'dart', 'sling', 'quarterstaff', 'light_crossbow'],
    spellcasting: { ability: 'int', level: 1 },
    subclasses: [
      {
        id: 'evoker',
        name: 'Évocateur',
        description: 'Un spécialiste de la magie destructive, façonnant l\'énergie brute en armes dévastatrices.',
        classId: 'wizard',
        level: 2,
        features: [
          { level: 2, name: 'Sculpteur de sorts', description: 'Vous pouvez créer des zones sûres dans vos sorts d\'évocation (alliés réussissent auto jets de sauvegarde, pas de dégâts).' },
          { level: 2, name: 'Évocation puissante', description: 'Vous ajoutez votre mod. Int aux jets de dégâts de vos sorts d\'évocation.' },
          { level: 6, name: 'Évocation surpuissante', description: 'Vous pouvez maximiser les dégâts d\'un sort d\'évocation (1/repos court, 2 au niv. 14).' },
          { level: 10, name: 'Maîtrise de l\'évocation', description: 'Vous pouvez ajouter votre mod. Int aux jets de dégâts de TOUS les sorts (pas seulement évocation).' },
          { level: 14, name: 'Surpuissance', description: 'Vous pouvez maximiser les dégâts de n\'importe quel sort (2/repos court).' },
        ],
      },
      {
        id: 'abjurer',
        name: 'Abjurateur',
        description: 'Un protecteur magique qui repousse le mal et renforce les défenses.',
        classId: 'wizard',
        level: 2,
        features: [
          { level: 2, name: 'Barrière arcanique', description: 'Quand vous lancez un sort d\'abjuration de niveau 1+, vous créez une barrière (PV = 2 × niveau du sort + mod. Int). Elle absorbe les dégâts pour vous.' },
          { level: 2, name: 'Abjuration projetée', description: 'Vous pouvez utiliser votre réaction pour déplacer votre Barrière arcanique sur un allié à 9m.' },
          { level: 6, name: 'Amélioration de l\'abjuration', description: 'Vous ajoutez votre bonus de maîtrise aux tests de caractéristique pour contresorter ou dispell magic.' },
          { level: 10, name: 'Résistance aux sorts', description: 'Vous avez l\'avantage aux jets de sauvegarde contre les sorts. Vous avez la résistance aux dégâts de sorts.' },
          { level: 14, name: 'Maître de la contre-magie', description: 'Quand vous contresortez, vous pouvez dépenser un emplacement pour contresorter automatiquement (sans test). Vous regagnez l\'emplacement si le sort échoue.' },
        ],
      },
      {
        id: 'diviner',
        name: 'Devin',
        description: 'Un magicien qui voit l\'avenir et manipule le destin par la prescience.',
        classId: 'wizard',
        level: 2,
        features: [
          { level: 2, name: 'Portent', description: 'Au repos long, lancez 2d20. Vous pouvez remplacer n\'importe quel jet d\'attaque, test, ou sauvegarde (vous ou créature visible) par un de ces résultats (1/utilisation).' },
          { level: 6, name: 'Devin expert', description: 'Lancer un sort de divination de niveau 2+ ne coûte qu\'un emplacement de niveau inférieur. Vous pouvez lancer identify sans composantes.' },
          { level: 10, name: 'Troisième œil', description: 'Au repos court/long, choisissez: Vision dans le noir 18m, Vision éthérée, Compréhension des langues, ou Vue perçante 9m.' },
          { level: 14, name: 'Prescience supérieure', description: 'Vous lancez 3d20 pour Portent au lieu de 2.' },
        ],
      },
      {
        id: 'illusionist',
        name: 'Illusionniste',
        description: 'Un maître de la tromperie sensorielle, créant des illusions indistinguables de la réalité.',
        classId: 'wizard',
        level: 2,
        features: [
          { level: 2, name: 'Illusionniste amélioré', description: 'Vous apprenez minor illusion (ne compte pas). Vous pouvez le lancer par action bonus. Vous pouvez changer la nature de l\'illusion (son/visuel).' },
          { level: 2, name: 'Réalité malléable', description: 'Quand vous lancez un sort d\'illusion de niveau 1+, vous pouvez créer un objet/éphémère non-magique dans l\'illusion.' },
          { level: 6, name: 'Soi illusoire', description: 'Vous pouvez créer un double illusoire de vous-même (réaction quand attaqué). L\'attaque touche le double. 1/repos court.' },
          { level: 10, name: 'Illusion persistante', description: 'Vos sorts d\'illusion de niveau 1+ durent plus longtemps sans concentration.' },
          { level: 14, name: 'Réalité illusoire', description: 'Vous pouvez rendre une partie de votre illusion réelle (1 minute, 1/repos long). Objet/créature semi-réelle.' },
        ],
      },
    ],
  },
]

/**
 * Obtenir toutes les classes
 */
export function getAllClasses(): ClassData[] {
  return SRD2024_CLASSES
}

/**
 * Obtenir une classe par son ID
 */
export function getClassById(id: string): ClassData | undefined {
  return SRD2024_CLASSES.find(c => c.id === id)
}

/**
 * Obtenir les sous-classes d'une classe
 */
export function getSubclasses(classId: string): SubclassData[] {
  const cls = SRD2024_CLASSES.find(c => c.id === classId)
  return cls?.subclasses ?? []
}

/**
 * Obtenir une sous-classe par son ID
 */
export function getSubclassById(classId: string, subclassId: string): SubclassData | undefined {
  const subclasses = getSubclasses(classId)
  return subclasses.find(s => s.id === subclassId)
}

/**
 * Obtenir la liste des noms de classes pour les listes déroulantes
 */
export function getClassNames(): { id: string; name: string }[] {
  return SRD2024_CLASSES.map(c => ({ id: c.id, name: c.name }))
}

/**
 * Obtenir la liste des noms de sous-classes pour une classe
 */
export function getSubclassNames(classId: string): { id: string; name: string; level: number }[] {
  return getSubclasses(classId).map(s => ({ id: s.id, name: s.name, level: s.level }))
}

/**
 * Vérifier si une sous-classe est disponible pour un niveau donné
 */
export function isSubclassAvailable(classId: string, subclassId: string, characterLevel: number): boolean {
  const subclass = getSubclassById(classId, subclassId)
  if (!subclass) return false
  return characterLevel >= subclass.level
}