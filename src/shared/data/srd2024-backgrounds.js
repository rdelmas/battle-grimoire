/**
 * SRD 2024 - Historiques (Backgrounds) officiels D&D 2024 (5.5e)
 * Source: SRD 2024 / Player's Handbook 2024
 * Dans D&D 2024, les historiques donnent : compétences, outils, langues, équipement, et un don d'origine
 */
/**
 * Liste des historiques officiels SRD 2024
 * Chaque historique donne un don d'origine (Origin Feat)
 */
export const SRD2024_BACKGROUNDS = [
    {
        id: 'acolyte',
        name: 'Acolyte',
        description: 'Vous avez passé votre vie au service d\'un temple, apprenant les rites sacrés et offrant des sacrifices.',
        skillProficiencies: ['insight', 'religion'],
        toolProficiencies: ['calligrapher\'s supplies'],
        languages: 2,
        equipment: ['Vêtements religieux', 'Kit de calligraphie', 'Livre de prières', 'Encens (5 bâtons)', 'Vêtements de voyage', 'Ceinture à pochettes (15 po)'],
        originFeat: {
            name: 'Magic Initiate (Cleric)',
            description: 'Vous apprenez deux tours de magie et un sort de niveau 1 de la liste des sorts de clerc. Vous pouvez lancer ce sort de niveau 1 une fois sans dépenser d\'emplacement de sort, et vous récupérez cette capacité au terme d\'un repos long. La Sagesse est votre caractéristique d\'incantation pour ces sorts.',
        },
        feature: {
            name: 'Abris des fidèles',
            description: 'Vous et vos compagnons pouvez vous attendre à recevoir gratuitement les soins et l\'hospitalité dans tout établissement religieux de votre foi.',
        },
    },
    {
        id: 'charlatan',
        name: 'Charlatan',
        description: 'Vous avez passé votre vie à tromper les autres pour votre profit personnel.',
        skillProficiencies: ['deception', 'sleight_of_hand'],
        toolProficiencies: ['forgery kit', 'disguise kit'],
        equipment: ['Vêtements fins', 'Kit de déguisement', 'Kit de faussaire', 'Jeu de cartes truqué', 'Ceinture à pochettes (15 po)'],
        originFeat: {
            name: 'Actor',
            description: 'Vous avez l\'avantage aux tests de Charisme (Tromperie) et de Charisme (Représentation) quand vous essayez de vous faire passer pour quelqu\'un d\'autre. Vous pouvez imiter la parole d\'autrui ou les sons d\'animaux.',
        },
        feature: {
            name: 'Fausse identité',
            description: 'Vous avez créé une seconde identité avec documentation, accoutrements et déguisements.',
        },
    },
    {
        id: 'criminal',
        name: 'Criminel',
        description: 'Vous avez passé votre vie à enfreindre la loi, que ce soit comme voleur, contrebandier ou exécuteur.',
        skillProficiencies: ['stealth', 'sleight_of_hand'],
        toolProficiencies: ['thieves\' tools'],
        equipment: ['Vêtements sombres', 'Outils de voleur', 'Pied-de-biche', 'Vêtements de voyage', 'Ceinture à pochettes (15 po)'],
        originFeat: {
            name: 'Alert',
            description: 'Vous gagnez un bonus de +5 à l\'initiative. Vous ne pouvez pas être surpris tant que vous êtes conscient. Les créatures ne gagnent pas d\'avantage aux jets d\'attaque contre vous en raison d\'être invisibles pour vous.',
        },
        feature: {
            name: 'Contact criminel',
            description: 'Vous avez un contact fiable au sein du milieu criminel local.',
        },
    },
    {
        id: 'entertainer',
        name: 'Artiste',
        description: 'Vous avez passé votre vie à divertir les foules par la musique, la danse, le théâtre ou l\'humour.',
        skillProficiencies: ['acrobatics', 'performance'],
        toolProficiencies: ['disguise kit', 'musical instrument (one of your choice)'],
        equipment: ['Vêtements de spectacle', 'Instrument de musique', 'Costume', 'Ceinture à pochettes (15 po)'],
        originFeat: {
            name: 'Musician',
            description: 'Vous gagnez la maîtrise de trois instruments de musique de votre choix. Lorsque vous jouez d\'un instrument dont vous êtes maître, vous pouvez ajouter votre bonus de maîtrise aux tests de caractéristique que vous faites en utilisant cet instrument.',
        },
        feature: {
            name: 'Par la foule admirée',
            description: 'Vous pouvez toujours trouver un endroit pour vous produire, et vous recevez un hébergement et des repas gratuits tant que vous vous produisez chaque soir.',
        },
    },
    {
        id: 'folk-hero',
        name: 'Héros du peuple',
        description: 'Vous venez d\'humble origine, mais quelque chose vous a propulsé vers la grandeur aux yeux du peuple.',
        skillProficiencies: ['animal_handling', 'survival'],
        toolProficiencies: ['artisan\'s tools (one of your choice)', 'vehicles (land)'],
        equipment: ['Outils d\'artisan', 'Pelle', 'Pot en fer', 'Vêtements communs', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Tough',
            description: 'Votre maximum de points de vie augmente de 2, et il augmente de 2 à chaque fois que vous gagnez un niveau.',
        },
        feature: {
            name: 'Admiration rustique',
            description: 'Vous pouvez trouver un abri et de la nourriture parmi les gens du commun, qui vous cachent de la loi ou de quiconque vous recherche.',
        },
    },
    {
        id: 'guild-artisan',
        name: 'Artisan de guilde',
        description: 'Vous avez appris un métier au sein d\'une guilde, maîtrisant une compétence artisanale particulière.',
        skillProficiencies: ['insight', 'persuasion'],
        toolProficiencies: ['artisan\'s tools (one of your choice)'],
        languages: 1,
        equipment: ['Outils d\'artisan', 'Lettre de recommandation de votre guilde', 'Vêtements de voyage', 'Ceinture à pochettes (15 po)'],
        originFeat: {
            name: 'Crafter',
            description: 'Vous gagnez la maîtrise de trois outils d\'artisan de votre choix. Vous bénéficiez d\'un rabais de 20 % sur l\'achat d\'objets non magiques. Vous pouvez fabriquer un objet non magique pendant un repos long.',
        },
        feature: {
            name: 'Membre de guilde',
            description: 'Vos collègues de guilde vous fourniront un abri et de la nourriture si nécessaire, et peuvent payer des rançons pour vous.',
        },
    },
    {
        id: 'hermit',
        name: 'Ermite',
        description: 'Vous avez vécu en solitude, loin de la société, peut-être pour une raison spirituelle ou pour fuir un passé douloureux.',
        skillProficiencies: ['medicine', 'religion'],
        toolProficiencies: ['herbalism kit'],
        languages: 1,
        equipment: ['Kit d\'herboristerie', 'Livre de prières ou parchemin', 'Vêtements communs', 'Ceinture à pochettes (5 po)'],
        originFeat: {
            name: 'Healer',
            description: 'Vous gagnez la maîtrise du kit d\'herboristerie. Vous pouvez utiliser un kit d\'herboristerie pour soigner 1d6 + 4 PV à une créature. Vous pouvez le faire un nombre de fois égal à votre bonus de maîtrise par repos long.',
        },
        feature: {
            name: 'Découverte',
            description: 'Votre isolement vous a permis de faire une découverte unique : un secret, un lieu, une vérité oubliée.',
        },
    },
    {
        id: 'noble',
        name: 'Noble',
        description: 'Vous êtes né dans le luxe et le privilège, élevé pour diriger et porter le poids du nom de votre famille.',
        skillProficiencies: ['history', 'persuasion'],
        toolProficiencies: ['gaming set (one of your choice)'],
        languages: 1,
        equipment: ['Vêtements fins', 'Signeet de famille', 'Parchemin de pedigree', 'Ceinture à pochettes (25 po)'],
        originFeat: {
            name: 'Skilled',
            description: 'Vous gagnez la maîtrise de trois compétences de votre choix.',
        },
        feature: {
            name: 'Position de privilège',
            description: 'Les gens supposent le meilleur de vous. Vous êtes bienvenu dans la haute société, et les gens font des efforts pour vous plaire.',
        },
    },
    {
        id: 'sage',
        name: 'Sage',
        description: 'Vous avez passé des années à étudier les connaissances du monde, dans des bibliothèques, des universités ou auprès de mentors.',
        skillProficiencies: ['arcana', 'history'],
        toolProficiencies: ['calligrapher\'s supplies'],
        languages: 2,
        equipment: ['Encre et plume', 'Kit de calligraphie', 'Livre de savoir', 'Vêtements de voyage', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Magic Initiate (Wizard)',
            description: 'Vous apprenez deux tours de magie et un sort de niveau 1 de la liste des sorts de magicien. Vous pouvez lancer ce sort de niveau 1 une fois sans dépenser d\'emplacement de sort, et vous récupérez cette capacité au terme d\'un repos long. L\'Intelligence est votre caractéristique d\'incantation pour ces sorts.',
        },
        feature: {
            name: 'Chercheur de connaissances',
            description: 'Quand vous essayez de vous souvenir d\'un morceau de connaissance, si vous ne le connaissez pas, vous savez souvent où le trouver.',
        },
    },
    {
        id: 'sailor',
        name: 'Marin',
        description: 'Vous avez passé des années sur les mers, affrontant tempêtes et monstres marins.',
        skillProficiencies: ['athletics', 'perception'],
        toolProficiencies: ['navigator\'s tools', 'vehicles (water)'],
        equipment: ['Gaf', 'Vêtements de voyage', 'Talisman de chance', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Tavern Brawler',
            description: 'Vous gagnez la maîtrise des armes improvisées et des armes de corps-à-corps simples. Vos coups de poing infligent 1d4 + modificateur de Force. Quand vous touchez avec un coup de poing, vous pouvez tenter de saisir la cible.',
        },
        feature: {
            name: 'Passage maritime',
            description: 'Vous pouvez obtenir un passage gratuit sur un navire pour vous et vos compagnons, en échange de votre travail à bord.',
        },
    },
    {
        id: 'soldier',
        name: 'Soldat',
        description: 'Vous avez servi dans une armée, apprenant la discipline, la tactique et le maniement des armes.',
        skillProficiencies: ['athletics', 'intimidation'],
        toolProficiencies: ['gaming set (one of your choice)', 'vehicles (land)'],
        equipment: ['Insigne de grade', 'Osselet ou jeu de cartes', 'Vêtements de voyage', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Savage Attacker',
            description: 'Une fois par tour, quand vous faites un jet de dégâts d\'arme au corps-à-corps, vous pouvez relancer les dés de dégâts et utiliser le meilleur résultat.',
        },
        feature: {
            name: 'Grade militaire',
            description: 'Les soldats loyaux à votre ancienne organisation militaire vous reconnaissent et vous traitent avec le respect dû à votre grade.',
        },
    },
    {
        id: 'urchin',
        name: 'Gamin des rues',
        description: 'Vous avez grandi dans les rues, apprenant à survivre par la ruse, le vol et la fuite.',
        skillProficiencies: ['sleight_of_hand', 'stealth'],
        toolProficiencies: ['disguise kit', 'thieves\' tools'],
        equipment: ['Petit couteau', 'Carte de la ville', 'Jeton de jeu', 'Vêtements communs', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Lucky',
            description: 'Vous avez 3 points de chance. Quand vous faites un jet d\'attaque, un test de caractéristique ou un jet de sauvegarde, vous pouvez dépenser un point de chance pour relancer le d20. Vous pouvez aussi dépenser un point de chance quand une créature fait un jet d\'attaque contre vous. Vous récupérez tous les points de chance dépensés au terme d\'un repos long.',
        },
        feature: {
            name: 'Secrets de la ville',
            description: 'Vous connaissez les passages secrets et les raccourcis dans les villes, vous permettant de vous déplacer deux fois plus vite entre deux endroits.',
        },
    },
    {
        id: 'farmer',
        name: 'Fermier',
        description: 'Vous avez travaillé la terre, élevé du bétail et connu le rythme des saisons.',
        skillProficiencies: ['animal_handling', 'nature'],
        toolProficiencies: ['artisan\'s tools (one of your choice)', 'vehicles (land)'],
        equipment: ['Outils d\'artisan', 'Faucille', 'Vêtements communs', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Tough',
            description: 'Votre maximum de points de vie augmente de 2, et il augmente de 2 à chaque fois que vous gagnez un niveau.',
        },
        feature: {
            name: 'Main-d\'œuvre',
            description: 'Vous pouvez toujours trouver du travail agricole temporaire, et les fermiers locaux vous offrent l\'hospitalité.',
        },
    },
    {
        id: 'merchant',
        name: 'Marchand',
        description: 'Vous avez acheté et vendu des marchandises, négocié des contrats et voyagé sur les routes commerciales.',
        skillProficiencies: ['insight', 'persuasion'],
        toolProficiencies: ['navigator\'s tools'],
        languages: 2,
        equipment: ['Balance de marchand', 'Vêtements de voyage', 'Ceinture à pochettes (20 po)'],
        originFeat: {
            name: 'Skilled',
            description: 'Vous gagnez la maîtrise de trois compétences de votre choix.',
        },
        feature: {
            name: 'Caravane',
            description: 'Vous avez des contacts commerciaux dans la plupart des villes, vous permettant d\'acheter et vendre à de meilleurs prix.',
        },
    },
    {
        id: 'scribe',
        name: 'Scribe',
        description: 'Vous avez passé votre vie à copier des manuscrits, tenir des registres et gérer la paperasserie.',
        skillProficiencies: ['investigation', 'insight'],
        toolProficiencies: ['calligrapher\'s supplies'],
        languages: 2,
        equipment: ['Kit de calligraphie', 'Encre et plume', 'Parchemin', 'Vêtements de voyage', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Skilled',
            description: 'Vous gagnez la maîtrise de trois compétences de votre choix.',
        },
        feature: {
            name: 'Recherche rapide',
            description: 'Vous pouvez trouver l\'information recherchée dans un livre ou un registre en moitié moins de temps.',
        },
    },
    {
        id: 'guard',
        name: 'Garde',
        description: 'Vous avez passé votre temps à protéger des lieux, des personnes ou des marchandises.',
        skillProficiencies: ['athletics', 'perception'],
        toolProficiencies: ['gaming set (one of your choice)'],
        equipment: ['Corne d\'alarme', 'Manchettes', 'Uniforme', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Alert',
            description: 'Vous gagnez un bonus de +5 à l\'initiative. Vous ne pouvez pas être surpris tant que vous êtes conscient. Les créatures ne gagnent pas d\'avantage aux jets d\'attaque contre vous en raison d\'être invisibles pour vous.',
        },
        feature: {
            name: 'Veille',
            description: 'Vous pouvez rester éveillé et alerte pendant un repos long, ne nécessitant que 4 heures de sommeil léger.',
        },
    },
    {
        id: 'guide',
        name: 'Guide',
        description: 'Vous avez guidé des voyageurs à travers des terres dangereuses, connaissant les chemins, les dangers et les ressources.',
        skillProficiencies: ['survival', 'nature'],
        toolProficiencies: ['cartographer\'s tools'],
        languages: 1,
        equipment: ['Outils de cartographe', 'Boussole', 'Vêtements de voyage', 'Ceinture à pochettes (10 po)'],
        originFeat: {
            name: 'Magic Initiate (Druid)',
            description: 'Vous apprenez deux tours de magie et un sort de niveau 1 de la liste des sorts de druide. Vous pouvez lancer ce sort de niveau 1 une fois sans dépenser d\'emplacement de sort, et vous récupérez cette capacité au terme d\'un repos long. La Sagesse est votre caractéristique d\'incantation pour ces sorts.',
        },
        feature: {
            name: 'Connaissance du terrain',
            description: 'Vous ne pouvez pas vous perdre, sauf par magie, et vous remarquez toujours les dangers naturels avant qu\'ils ne vous surprennent.',
        },
    },
];
/**
 * Option "Autre" pour les historiques personnalisés non-SRD
 */
export const CUSTOM_BACKGROUND_OPTION = {
    id: 'custom',
    name: 'Autre',
    description: 'Historique personnalisé non listé dans le SRD 2024',
    skillProficiencies: [],
    toolProficiencies: [],
    languages: 0,
    equipment: [],
    originFeat: {
        name: 'Personnalisé',
        description: 'Définissez votre propre don d\'origine avec votre MJ.',
    },
    isCustom: true,
};
/**
 * Obtenir tous les historiques avec l'option "Autre"
 */
export function getAllBackgrounds() {
    return [...SRD2024_BACKGROUNDS, CUSTOM_BACKGROUND_OPTION];
}
/**
 * Obtenir un historique par son ID
 */
export function getBackgroundById(id) {
    if (id === 'custom')
        return CUSTOM_BACKGROUND_OPTION;
    return SRD2024_BACKGROUNDS.find(b => b.id === id);
}
/**
 * Obtenir la liste des noms d'historiques pour les listes déroulantes
 */
export function getBackgroundNames() {
    return SRD2024_BACKGROUNDS.map(b => ({ id: b.id, name: b.name }));
}
//# sourceMappingURL=srd2024-backgrounds.js.map