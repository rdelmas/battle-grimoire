import { useState, useMemo, useEffect, useRef } from 'react'
import { 
  Save, User, Sword, Heart, Brain, BookOpen, Star, 
  Plus, Trash2, Zap, Sparkles, Target,
  Copy, AlertTriangle, Wrench, PlusCircle, Wand2
} from 'lucide-react'
import { getClassIcon } from '../../utils/classIcons'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { useCharacterForm } from '../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../hooks/useCharacterCalculations'
import type { PlayerCharacter, SkillName, WeaponMasteryProperty, SpellcastingAbility, AbilityScores, SpellcastingSource, PreparedSpell } from '../../types/character'
import { 
  ALL_SKILLS, 
  ALL_ABILITIES, 
  SKILL_ABILITY_MAP, 
  WEAPON_MASTERY_PROPERTIES, 
  WEAPON_MASTERY_LABELS,
} from '../../types/character'
import { 
  autoConfigureSpellcasting, 
  createPrimarySpellcastingSource,
  createFeatSpellcastingSource,
  createRaceSpellcastingSource,
  createItemSpellcastingSource,
  combineSpellSlots,
  getSpellSaveDC,
  getSpellAttackBonus,
  getMaxPreparedSpellsForSource,
  SPELLCASTING_FEATS,
  RACE_SPELLCASTING_CONFIG,
  type SpellcastingFeatConfig,
  type ItemSpellcastingInput
} from '../../utils/spellcasting'
import { SRD2024_SPELLS } from '@/shared/data/srd2024-spells'
import { cn } from '@/shared/utils/cn'
import { 
  getAllSpecies, 
  getAllBackgrounds, 
  getAllClasses, 
  getSubclasses
} from '@/shared/data'

/**
 * Obtient tous les sorts disponibles pour une source d'incantation
 * (classe, don, race, objet)
 */
function getAvailableSpellsForSource(source: SpellcastingSource, characterClass: string): typeof SRD2024_SPELLS {
  // Pour les sources de type classe, filtrer par la classe du personnage
  if (source.type === 'class') {
    return SRD2024_SPELLS.filter(spell => 
      spell.classes?.includes(characterClass.toLowerCase())
    )
  }
  // Pour les dons (Magic Initiate, etc.), le don définit sa propre liste
  if (source.type === 'feat') {
    // Les dons comme Magic Initiate permettent de choisir n'importe quelle liste
    // On retourne tous les sorts pour laisser l'utilisateur choisir
    return SRD2024_SPELLS
  }
  // Pour les races et objets, on retourne tous les sorts (saisie libre assistée)
  return SRD2024_SPELLS
}

/**
 * Composant sélecteur de sort avec filtre depuis la BDD SRD
 * Remplace la saisie libre par une liste déroulante filtrée
 * Structure alignée sur le composant Select pour cohérence visuelle dans la grille
 */
function SpellSelector({ 
  spell, 
  source, 
  characterClass, 
  onChange 
}: { 
  spell: PreparedSpell
  source: SpellcastingSource
  characterClass: string
  onChange: (spell: PreparedSpell) => void
}) {
  // Obtenir les sorts disponibles pour cette source
  const availableSpells = getAvailableSpellsForSource(source, characterClass)
  
  // Filtrer par niveau du sort sélectionné
  const filteredSpells = availableSpells.filter(s => s.level === spell.level)
  
  // Trouver le sort correspondant dans la BDD pour auto-remplissage
  const matchedSpell = availableSpells.find(s => s.name.toLowerCase() === spell.name.toLowerCase())
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value
    if (selectedName === '__custom__') {
      // Mode saisie libre - on garde le nom actuel mais on permet l'édition
      return
    }
    const selectedSpell = availableSpells.find(s => s.name === selectedName)
    if (selectedSpell) {
      // Auto-remplir tous les champs depuis la BDD
      onChange({
        ...spell,
        name: selectedSpell.name,
        level: selectedSpell.level,
        casting_time: selectedSpell.castingTime,
        range: selectedSpell.range,
        components: selectedSpell.components,
        concentration: selectedSpell.concentration,
        description: selectedSpell.description,
      })
    }
  }

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customName = e.target.value
    // Si l'utilisateur tape un nom qui existe dans la BDD, proposer l'auto-remplissage
    const matched = availableSpells.find(s => s.name.toLowerCase() === customName.toLowerCase())
    if (matched) {
      onChange({
        ...spell,
        name: matched.name,
        level: matched.level,
        casting_time: matched.castingTime,
        range: matched.range,
        components: matched.components,
        concentration: matched.concentration,
        description: matched.description,
      })
    } else {
      // Sinon juste mettre à jour le nom
      onChange({ ...spell, name: customName })
    }
  }

  // Déterminer si le sort actuel correspond à un sort de la BDD
  const isCustomSpell = !matchedSpell

  // Structure IDENTIQUE au composant Select : wrapper w-full > label + select/input + badge
  // Padding py-2.5 pour alignement parfait avec Select/Input
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-muted mb-1.5">Nom</label>
      <div className="relative">
        {isCustomSpell ? (
          // Mode saisie libre avec datalist pour autocomplétion
          <>
            <input
              type="text"
              list={`spell-suggestions-${spell.level}`}
              value={spell.name}
              onChange={handleCustomInputChange}
              placeholder="Nom du sort"
              className="w-full px-3 py-2.5 bg-bg-surface border border-border-main rounded-lg text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 pr-20"
            />
            <datalist id={`spell-suggestions-${spell.level}`}>
              {filteredSpells.map(s => (
                <option key={s.name} value={s.name} />
              ))}
              <option value="__custom__">✏️ Autre (personnalisé)</option>
            </datalist>
          </>
        ) : (
          // Mode sélection depuis la BDD - select natif avec MÊMES classes que Select
          <select
            value={spell.name}
            onChange={handleSelectChange}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-main rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-amber-main focus:border-amber-main appearance-none pr-20"
          >
            <option value="">— Choisir un sort —</option>
            {filteredSpells.map(s => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.school})
              </option>
            ))}
            <option value="__custom__">✏️ Autre (personnalisé)</option>
          </select>
        )}
        
        {/* Indicateur visuel si le sort vient de la BDD - même positionnement */}
        {matchedSpell && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded pointer-events-none">
            ✓ SRD
          </div>
        )}
      </div>
    </div>
  )
}

interface CharacterBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  initialCharacter?: PlayerCharacter
  onSaved: (character: PlayerCharacter) => void
  onDuplicate?: () => void
}

// Sections de navigation - l'icône pour "feats" sera dynamique selon la classe sélectionnée
const getSections = (className: string) => [
  { id: 'identity' as const, label: 'Identité', icon: User },
  { id: 'abilities' as const, label: 'Attributs', icon: Target },
  { id: 'skills' as const, label: 'Compétences', icon: Brain },
  { id: 'vitals' as const, label: 'Vitales', icon: Heart },
  { id: 'feats' as const, label: 'Dons/Armes', icon: getClassIcon(className) || Sword },
  { id: 'spells' as const, label: 'Magie', icon: BookOpen },
] as const

type SectionId = 'identity' | 'abilities' | 'skills' | 'vitals' | 'feats' | 'spells'

export function CharacterBuilderModal({ isOpen, onClose, initialCharacter, onSaved }: CharacterBuilderModalProps) {
  const form = useCharacterForm(initialCharacter)
  const calculations = useCharacterCalculations(form.character)
  const [activeSection, setActiveSection] = useState<SectionId>('identity')
  const [showPreview] = useState(true)

  // État local pour l'UI de la section sorts (doit être au niveau du composant pour respecter les Rules of Hooks)
  const [showAddSourceModal, setShowAddSourceModal] = useState(false)
  const [selectedFeatForSource, setSelectedFeatForSource] = useState<SpellcastingFeatConfig | null>(null)
  const [selectedFeatAbility, setSelectedFeatAbility] = useState<SpellcastingAbility>('int')
  
  // États pour les nouveaux modaux Race et Objet
  const [showAddRaceSourceModal, setShowAddRaceSourceModal] = useState(false)
  const [selectedRaceForSource, setSelectedRaceForSource] = useState<string>('')
  const [selectedRaceCantrip, setSelectedRaceCantrip] = useState<string>('')
  
  const [showAddItemSourceModal, setShowAddItemSourceModal] = useState(false)
  const [itemSourceForm, setItemSourceForm] = useState<ItemSpellcastingInput>({
    name: '',
    ability: 'int',
    cantripsKnown: 0,
    preparedSpells: [],
    alwaysPrepared: [],
    charges: 1,
    rechargeType: 'long',
    spellcastingLevel: 1,
  })

  // Track previous initialCharacter to avoid infinite loop
  const prevInitialCharacterRef = useRef<PlayerCharacter | undefined>(initialCharacter)

  // Reset form when initialCharacter changes (e.g., when editing a different character)
  useEffect(() => {
    // Only reset if initialCharacter actually changed (by reference)
    if (prevInitialCharacterRef.current !== initialCharacter) {
      prevInitialCharacterRef.current = initialCharacter
      form.reset(initialCharacter)
    }
  }, [initialCharacter, form])

  // Validation state
  const isValid = form.isValid

  // Auto-configuration de la magie quand la classe change
  useEffect(() => {
    const c = form.character
    if (c.class_name) {
      const config = autoConfigureSpellcasting(
        c.class_name,
        c.level,
        c.abilities as unknown as Record<string, number>,
        c.spellcasting_ability
      )
      
      // Seulement appliquer si l'auto-config suggère des changements
      if (config.spellcasting_ability !== c.spellcasting_ability) {
        form.setField('spellcasting_ability', config.spellcasting_ability)
      }
      if (JSON.stringify(config.spell_slots) !== JSON.stringify(c.spell_slots)) {
        form.setField('spell_slots', config.spell_slots)
      }
      if (config.cantrips_known !== c.cantrips_known) {
        form.setField('cantrips_known', config.cantrips_known)
      }
    }
  }, [form.character.class_name, form.character.level, form.character.abilities, form])

  // Memoized data from SRD2024
  const speciesList = useMemo(() => getAllSpecies(), [])
  const backgroundList = useMemo(() => getAllBackgrounds(), [])
  const classList = useMemo(() => getAllClasses(), [])
  
  // Get subclasses for the selected class
  const availableSubclasses = useMemo(() => {
    if (!form.character.class_name) return []
    return getSubclasses(form.character.class_name)
  }, [form.character.class_name])
  
  // Check if subclass should be enabled (class selected && level 3+)
  const isSubclassEnabled = form.character.class_name && form.character.level >= 3

  // Memoized skills grouped by ability (static data, never changes)
  const skillsByAbility = useMemo(() => {
    const groups: Record<keyof AbilityScores, SkillName[]> = {
      str: [],
      dex: [],
      con: [],
      int: [],
      wis: [],
      cha: [],
    }
    ALL_SKILLS.forEach(skill => {
      const ability = SKILL_ABILITY_MAP[skill]
      groups[ability].push(skill)
    })
    return groups
  }, [])

  // Ordre d'affichage des attributs (FOR, DEX, CON, INT, SAG, CHA)
  const abilityOrder: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

  // Labels complets des compétences
  const skillLabels: Record<SkillName, string> = {
    acrobatics: 'Acrobaties',
    animal_handling: 'Dressage',
    arcana: 'Arcanes',
    athletics: 'Athlétisme',
    deception: 'Tromperie',
    history: 'Histoire',
    insight: 'Perspicacité',
    intimidation: 'Intimidation',
    investigation: 'Investigation',
    medicine: 'Médecine',
    nature: 'Nature',
    perception: 'Perception',
    performance: 'Représentation',
    persuasion: 'Persuasion',
    religion: 'Religion',
    sleight_of_hand: 'Prestidigitation',
    stealth: 'Discrétion',
    survival: 'Survie',
  }

  // Mapping abrégé des attributs pour l'affichage
  const abilityLabels: Record<keyof AbilityScores, string> = {
    str: 'FOR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'SAG',
    cha: 'CHA',
  }

  // Handlers
  const handleSave = async () => {
    if (form.validate()) {
      const result = await form.save()
      if (result.success) {
        onSaved(form.character)
        onClose()
      }
    }
  }

  const handleDuplicate = async () => {
    const duplicated = await form.duplicate()
    onSaved(duplicated)
    onClose()
  }

  // Render section content
  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'identity':
        return renderIdentitySection()
      case 'abilities':
        return renderAbilitiesSection()
      case 'skills':
        return renderSkillsSection()
      case 'vitals':
        return renderVitalsSection()
      case 'feats':
        return renderFeatsSection()
      case 'spells':
        return renderSpellsSection()
    }
  }

  // ===== SECTION 1: IDENTITÉ =====
  function renderIdentitySection() {
    const c = form.character

    return (
      <div className="space-y-6">
        {/* Nom du personnage & Joueur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom du personnage *"
            value={c.character_name}
            onChange={e => form.setField('character_name', e.target.value)}
            error={form.errors.character_name}
            placeholder="Ex: Thorgar Pied-Lourd"
          />
          <Input
            label="Nom du joueur *"
            value={c.player_name}
            onChange={e => form.setField('player_name', e.target.value)}
            placeholder="Ex: Thomas"
          />
        </div>

        {/* Niveau, Espèce, Historique - 3 colonnes égales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Niveau *"
            type="number"
            min={1}
            max={20}
            value={c.level}
            onChange={e => form.setField('level', parseInt(e.target.value) || 1)}
            error={form.errors.level}
            placeholder="1–20"
          />
          <Select
            label="Espèce (SRD 2024)"
            value={c.species}
            onChange={e => form.setField('species', e.target.value)}
          >
            <option value="">— Choisir une espèce —</option>
            {speciesList.map(species => (
              <option key={species.id} value={species.name}>
                {species.name} {species.isCustom ? '(Personnalisée)' : ''}
              </option>
            ))}
          </Select>
          <Select
            label="Historique (SRD 2024)"
            value={c.background}
            onChange={e => form.setField('background', e.target.value)}
          >
            <option value="">— Choisir un historique —</option>
            {backgroundList.map(bg => (
              <option key={bg.id} value={bg.name}>
                {bg.name} {bg.isCustom ? '(Personnalisé)' : ''}
              </option>
            ))}
          </Select>
        </div>

        {/* Classe & Sous-classe - 2 colonnes égales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Classe * (SRD 2024)"
            value={c.class_name}
            onChange={e => form.setField('class_name', e.target.value)}
            error={form.errors.class_name}
            required
          >
            <option value="">Classe *</option>
            {classList.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>
          <Select
            label="Sous-classe"
            value={c.subclass_name ?? ''}
            onChange={e => form.setField('subclass_name', e.target.value || undefined)}
            disabled={!isSubclassEnabled}
          >
            <option value="">— Aucune —</option>
            {!isSubclassEnabled && c.level < 3 && (
              <option value="" disabled>Disponible au niveau 3</option>
            )}
            {!isSubclassEnabled && c.level >= 3 && availableSubclasses.length === 0 && (
              <option value="" disabled>Pas de sous-classe pour cette classe</option>
            )}
            {availableSubclasses.map(subclass => (
              <option key={subclass.id} value={subclass.name}>
                {subclass.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
    )
  }

  // ===== SECTION 2: ATTRIBUTS & SAUVEGARDES =====
  function renderAbilitiesSection() {
    const c = form.character
    const proficiencyBonus = calculations.abilities.proficiencyBonus
    const abilityModifiers = calculations.abilities.modifiers

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
          <Target className="h-5 w-5 text-amber-main" />
          <div>
            <p className="font-medium text-text-main">Bonus de Maîtrise: <span className="text-amber-main">+{proficiencyBonus}</span></p>
            <p className="text-sm text-text-muted">Calculé automatiquement selon le niveau</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {ALL_ABILITIES.map(ability => {
            const score = c.abilities[ability]
            const mod = abilityModifiers[ability]
            const isSaveProficient = c.saving_throw_proficiencies.includes(ability)
            const saveMod = mod + (isSaveProficient ? proficiencyBonus : 0)
            const labels = { str: 'FOR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'SAG', cha: 'CHA' }
            const fullLabels = { str: 'Force', dex: 'Dextérité', con: 'Constitution', int: 'Intelligence', wis: 'Sagesse', cha: 'Charisme' }

            return (
              <Card key={ability} className={cn(
                'p-4',
                isSaveProficient && 'bg-amber-main/5 border-amber-main/30'
              )}>
                <div className="text-center">
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                    {fullLabels[ability]} ({labels[ability]})
                  </div>
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-2">
                    <button 
                      type="button"
                      className="h-8 w-8 p-0 flex-shrink-0 text-text-main bg-bg-surface border border-border-main rounded-lg hover:bg-amber-main/10 hover:border-amber-main/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => form.setAbility(ability, score - 1)}
                      disabled={score <= 1}
                    >−</button>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={score}
                      onChange={e => form.setAbility(ability, parseInt(e.target.value) || 1)}
                      className="w-full max-w-24 text-center text-2xl font-bold font-serif bg-transparent border-none p-0 mx-auto"
                      error={form.errors.abilities?.[ability]}
                    />
                    <button 
                      type="button"
                      className="h-8 w-8 p-0 flex-shrink-0 text-text-main bg-bg-surface border border-border-main rounded-lg hover:bg-amber-main/10 hover:border-amber-main/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => form.setAbility(ability, score + 1)}
                      disabled={score >= 30}
                    >+</button>
                  </div>
                  <div className={cn(
                    'text-3xl font-bold font-serif',
                    mod >= 0 ? 'text-amber-main' : 'text-red-500'
                  )}>
                    {mod >= 0 ? '+' : ''}{mod}
                  </div>
                  <label className="flex items-center justify-center gap-1.5 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSaveProficient}
                      onChange={e => form.setSavingThrowProficiency(ability, e.target.checked)}
                      className="h-4 w-4 rounded border-border-main text-amber-main focus:ring-amber-main"
                    />
                    <span className="text-xs text-text-muted">Maîtrise JDS</span>
                  </label>
                  {isSaveProficient && (
                    <div className="text-xs text-text-dark mt-1">JDS: {saveMod >= 0 ? '+' : ''}{saveMod}</div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

// ===== SECTION 3: COMPÉTENCES =====
  function renderSkillsSection() {
    const c = form.character
    const skillModifiers = calculations.skills.modifiers
    const proficiencyBonus = calculations.abilities.proficiencyBonus
    const abilityModifiers = calculations.abilities.modifiers

    const proficiencyOptions = [
      { value: 'none', label: '—', desc: 'Aucune' },
      { value: 'proficient', label: 'M', desc: 'Maîtrise (+PB)' },
      { value: 'expertise', label: 'E', desc: 'Expertise (+2×PB)' },
    ] as const

    const fullAbilityLabels: Record<keyof AbilityScores, string> = {
      str: 'Force',
      dex: 'Dextérité',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Sagesse',
      cha: 'Charisme',
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <Brain className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-medium text-text-main">Perception Passive: <span className="text-blue-500">{calculations.skills.passivePerception}</span></p>
            <p className="text-sm text-text-muted">10 + modificateur Perception final</p>
          </div>
        </div>

        <div className="space-y-6">
          {abilityOrder.map(ability => {
            const skills = skillsByAbility[ability]
            if (skills.length === 0) return null

            const abilityMod = abilityModifiers[ability]
            const abilityLabel = abilityLabels[ability]

            return (
              <Card key={ability} className="bg-bg-surface/50 border-border-main/50">
                <CardHeader className="pb-2 bg-amber-main/5 border-b border-amber-main/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-text-main flex items-center gap-2">
                      <span className="text-amber-main font-mono text-sm">{abilityLabel}</span>
                      <span className="text-text-muted text-sm">{fullAbilityLabels[ability]}</span>
                    </h4>
                    <div className={cn(
                      'text-xl font-bold font-serif px-3 py-0.5 rounded bg-bg-surface border border-border-main',
                      abilityMod >= 0 ? 'text-amber-main' : 'text-red-500'
                    )}>
                      {abilityMod >= 0 ? '+' : ''}{abilityMod}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Grille 3 colonnes pour les compétences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skills.map(skill => {
                      const proficiency = c.skills[skill]
                      const totalMod = skillModifiers[skill]

                      return (
                        <div
                          key={skill}
                          className={cn(
                            'flex flex-col gap-2 p-3 rounded-lg transition-colors',
                            proficiency === 'expertise' && 'bg-amber-main/10 border border-amber-main/20',
                            proficiency === 'proficient' && 'bg-amber-main/5 border border-amber-main/10',
                            proficiency === 'none' && 'bg-bg-surface/50 border border-border-main/50 hover:border-border-main/50'
                          )}
                        >
                          {/* Ligne 1: Nom de la compétence + Modificateur total */}
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-text-main min-w-0">{skillLabels[skill]}</div>
                            <div className={cn(
                              'text-xl font-bold font-serif shrink-0',
                              totalMod >= 0 ? 'text-amber-main' : 'text-red-500'
                            )}>
                              {totalMod >= 0 ? '+' : ''}{totalMod}
                            </div>
                          </div>
                          
                          {/* Ligne 2: Détail du calcul */}
                          <div className="text-xs text-text-muted font-mono">
                            {(() => {
                              const profValue = proficiency === 'expertise' ? proficiencyBonus * 2 : proficiency === 'proficient' ? proficiencyBonus : 0
                              return `Mod ${abilityLabel}: ${abilityMod >= 0 ? '+' : ''}${abilityMod}  |  B.Maitrise: ${profValue >= 0 ? '+' : ''}${profValue}  =  ${totalMod >= 0 ? '+' : ''}${totalMod}`
                            })()}
                          </div>
                          
                          {/* Ligne 3: Sélecteur de maîtrise */}
                          <Select
                            value={proficiency}
                            onChange={e => form.setSkill(skill, e.target.value as 'none' | 'proficient' | 'expertise')}
                            className="w-full max-w-[100px]"
                          >
                            {proficiencyOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </Select>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ===== SECTION 4: STATISTIQUES VITALES =====
  function renderVitalsSection() {
    const c = form.character
    const initiative = calculations.initiative.initiative

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Points de vie max *"
            type="number"
            min={1}
            value={c.hit_points_max}
            onChange={e => form.setField('hit_points_max', parseInt(e.target.value) || 1)}
            error={form.errors.hit_points_max}
          />
          <Input
            label="Classe d'armure *"
            type="number"
            min={1}
            value={c.armor_class}
            onChange={e => form.setField('armor_class', parseInt(e.target.value) || 10)}
            error={form.errors.armor_class}
          />
          <Input
            label="Vitesse"
            value={c.speed}
            onChange={e => form.setField('speed', e.target.value)}
            placeholder="Ex: 9m, 9m vol 9m"
          />
          <Input
            label="Bonus Initiative (hors DEX)"
            type="number"
            value={c.initiative_misc_bonus}
            onChange={e => form.setField('initiative_misc_bonus', parseInt(e.target.value) || 0)}
            placeholder="Ex: +5 (Don Alerte)"
          />
        </div>

        <div className="p-4 bg-amber-main/5 border border-amber-main/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-text-main">Initiative calculée: </span>
            <span className={cn('text-2xl font-bold font-serif', initiative >= 0 ? 'text-yellow-500' : 'text-red-500')}>
              {initiative >= 0 ? '+' : ''}{initiative}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            DEX ({calculations.abilities.modifiers.dex >= 0 ? '+' : ''}{calculations.abilities.modifiers.dex}) + Divers ({c.initiative_misc_bonus >= 0 ? '+' : ''}{c.initiative_misc_bonus}) = {initiative >= 0 ? '+' : ''}{initiative}
          </p>
        </div>
      </div>
    )
  }

  // ===== SECTION 5: DONS & MAÎTRISES D'ARMES =====
  function renderFeatsSection() {
    const c = form.character
    const originFeats = c.origin_feats ?? []

    return (
      <div className="space-y-6">
        {/* Dons d'Origine */}
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-main" />
              Dons d'Origine (Historique + Espèce)
            </h4>
            <Button variant="secondary" size="sm" onClick={() => form.addOriginFeat({ name: '', description: '', category: 'origin' })}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter un don
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {originFeats.length === 0 ? (
              <p className="text-text-muted text-center py-4">Aucun don d'origine. Les dons d'origine viennent de l'historique (1) et de l'espèce (Humain = +1).</p>
            ) : (
              originFeats.map((feat, index) => (
                <div key={index} className="flex gap-3 p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
                  <div className="flex-1">
                    <Input
                      label="Nom"
                      value={feat.name}
                      onChange={e => form.updateOriginFeat(index, { ...feat, name: e.target.value })}
                      placeholder="Nom du don"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Description"
                      value={feat.description}
                      onChange={e => form.updateOriginFeat(index, { ...feat, description: e.target.value })}
                      placeholder="Description"
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 mt-8" onClick={() => form.removeOriginFeat(index)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Dons Généraux */}
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              Dons Généraux / Évolution
            </h4>
            <Button variant="secondary" size="sm" onClick={() => form.addGeneralFeat({ name: '', description: '', category: 'general' })}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter un don
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {c.general_feats.length === 0 ? (
              <p className="text-text-muted text-center py-4">Aucun don général. Les dons sont obtenus aux niveaux 4, 8, 12, 16, 19.</p>
            ) : (
              c.general_feats.map((feat, index) => (
                <div key={index} className="flex gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex-1">
                    <Input
                      label="Nom"
                      value={feat.name}
                      onChange={e => form.updateGeneralFeat(index, { ...feat, name: e.target.value })}
                      placeholder="Nom du don"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Description"
                      value={feat.description}
                      onChange={e => form.updateGeneralFeat(index, { ...feat, description: e.target.value })}
                      placeholder="Description"
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 mt-8" onClick={() => form.removeGeneralFeat(index)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Maîtrises d'Armes */}
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Sword className="h-5 w-5 text-amber-main" />
              Maîtrises d'Armes (Weapon Mastery D&D 2024)
            </h4>
            <Button variant="secondary" size="sm" onClick={() => form.addWeaponMastery('', 'cleave')}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {c.weapon_masteries.length === 0 ? (
              <p className="text-text-muted text-center py-4">
                Aucune maîtrise d'arme. Propriétés disponibles: Cleave, Graze, Nick, Push, Sap, Slow, Topple, Vex
              </p>
            ) : (
              c.weapon_masteries.map((wm, index) => (
                <div key={index} className="flex gap-3 p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
                  <div className="flex-1">
                    <Input
                      label="Arme"
                      value={wm.weapon}
                      onChange={e => {
                        const updated = [...c.weapon_masteries]
                        updated[index] = { ...wm, weapon: e.target.value }
                        form.setField('weapon_masteries', updated)
                      }}
                      placeholder="Ex: Épée longue, Dague..."
                    />
                  </div>
                  <div className="flex-1">
                    <Select
                      label="Propriété"
                      value={wm.property}
                      onChange={e => {
                        const updated = [...c.weapon_masteries]
                        updated[index] = { ...wm, property: e.target.value as WeaponMasteryProperty }
                        form.setField('weapon_masteries', updated)
                      }}
                    >
                      {WEAPON_MASTERY_PROPERTIES.map(prop => (
                        <option key={prop} value={prop}>{WEAPON_MASTERY_LABELS[prop]}</option>
                      ))}
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 mt-8" onClick={() => form.removeWeaponMastery(index)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Maîtrises d'Outils */}
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-main" />
              Maîtrises d'Outils
            </h4>
            <Button variant="secondary" size="sm" onClick={() => form.setField('tool_proficiencies', [...(c.tool_proficiencies ?? []), ''])}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {(!c.tool_proficiencies || c.tool_proficiencies.length === 0) ? (
              <p className="text-text-muted text-center py-4">Aucune maîtrise d'outil. Viennent de l'historique, de la classe ou des dons.</p>
            ) : (
              c.tool_proficiencies.map((tool, index) => (
                <div key={index} className="flex gap-3 p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
                  <div className="flex-1">
                    <Input
                      label="Outil"
                      value={tool}
                      onChange={e => {
                        const updated = [...(c.tool_proficiencies ?? [])]
                        updated[index] = e.target.value
                        form.setField('tool_proficiencies', updated)
                      }}
                      placeholder="Ex: Outils de voleur, Kit d'herboristerie..."
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 mt-8" onClick={() => {
                    const updated = [...(c.tool_proficiencies ?? [])]
                    updated.splice(index, 1)
                    form.setField('tool_proficiencies', updated)
                  }}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ===== SECTION 6: MAGIE (Sources multiples) =====
  function renderSpellsSection() {
    const c = form.character
    const isSpellcaster = c.spellcasting_ability !== 'none'
    const proficiencyBonus = calculations.abilities.proficiencyBonus

    // Sources d'incantation : principale + additionnelles
    const allSources: SpellcastingSource[] = []
    
    // Source principale (classe)
    if (isSpellcaster && c.class_name) {
      const primarySource = createPrimarySpellcastingSource(c.class_name, c.level, c.abilities as unknown as Record<string, number>)
      if (primarySource) {
        // Synchroniser les sorts préparés existants
        primarySource.preparedSpells = c.prepared_spells
        allSources.push(primarySource)
      }
    }
    
    // Sources additionnelles (dons, race, objets)
    allSources.push(...(c.additional_spellcasting_sources ?? []))

    // Calculer les slots combinés
    const combinedSlots = combineSpellSlots(allSources)

    const handleAddFeatSource = () => {
      if (selectedFeatForSource && selectedFeatAbility) {
        const newSource = createFeatSpellcastingSource(
          selectedFeatForSource.id,
          selectedFeatAbility
        )
        if (newSource) {
          form.setField('additional_spellcasting_sources', [...(c.additional_spellcasting_sources ?? []), newSource])
        }
      }
      setShowAddSourceModal(false)
      setSelectedFeatForSource(null)
    }

    const handleRemoveSource = (sourceId: string) => {
      form.setField('additional_spellcasting_sources', (c.additional_spellcasting_sources ?? []).filter(s => s.id !== sourceId))
    }

    const handleAddPreparedSpellToSource = (sourceId: string) => {
      const updatedSources = (c.additional_spellcasting_sources ?? []).map(source => {
        if (source.id === sourceId) {
          return {
            ...source,
            preparedSpells: [...source.preparedSpells, {
              name: '',
              level: 1,
              casting_time: 'Action',
              components: 'V, S',
              concentration: false,
              range: '9m',
            }]
          }
        }
        return source
      })
      form.setField('additional_spellcasting_sources', updatedSources)
    }

    const handleRemovePreparedSpellFromSource = (sourceId: string, spellIndex: number) => {
      const updatedSources = (c.additional_spellcasting_sources ?? []).map(source => {
        if (source.id === sourceId) {
          return {
            ...source,
            preparedSpells: source.preparedSpells.filter((_, i) => i !== spellIndex)
          }
        }
        return source
      })
      form.setField('additional_spellcasting_sources', updatedSources)
    }

    const handleUpdatePreparedSpellInSource = (sourceId: string, spellIndex: number, spell: PreparedSpell) => {
      const updatedSources = (c.additional_spellcasting_sources ?? []).map(source => {
        if (source.id === sourceId) {
          const updatedSpells = [...source.preparedSpells]
          updatedSpells[spellIndex] = spell
          return { ...source, preparedSpells: updatedSpells }
        }
        return source
      })
      form.setField('additional_spellcasting_sources', updatedSources)
    }

    // Pour la source principale, on utilise les champs existants du personnage
    const handleUpdatePrimaryPreparedSpell = (index: number, spell: PreparedSpell) => {
      form.updatePreparedSpell(index, spell)
    }
    const handleRemovePrimaryPreparedSpell = (index: number) => {
      form.removePreparedSpell(index)
    }
    const handleAddPrimaryPreparedSpell = () => {
      form.addPreparedSpell({
        name: '',
        level: 1,
        casting_time: 'Action',
        components: 'V, S',
        concentration: false,
        range: '9m',
      })
    }

    return (
      <div className="space-y-6">
        {/* ===== CARTE 1: Sources d'incantation (Cartes empilées) ===== */}
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Sources d'Incantation
            </h4>
            <Button variant="secondary" size="sm" onClick={() => setShowAddSourceModal(true)}>
              <PlusCircle className="h-4 w-4 mr-1" /> Ajouter une source
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {allSources.length === 0 && !isSpellcaster && (
              <div className="text-center py-8 text-text-muted border-2 border-dashed border-border-main rounded-lg">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="mb-2">Aucune source d'incantation configurée</p>
                <p className="text-sm">Sélectionnez une classe lanceuse de sorts ou ajoutez un don magique</p>
              </div>
            )}
            
            {allSources.map((source) => (
              <div 
                key={source.id} 
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  source.type === 'class' 
                    ? 'bg-purple-500/5 border-purple-500/30' 
                    : source.type === 'feat'
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : source.type === 'race'
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-blue-500/5 border-blue-500/30'
                )}
              >
                {/* Header de la source */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      source.type === 'class' && 'bg-purple-500/10 text-purple-500',
                      source.type === 'feat' && 'bg-amber-500/10 text-amber-500',
                      source.type === 'race' && 'bg-green-500/10 text-green-500',
                      source.type === 'item' && 'bg-blue-500/10 text-blue-500'
                    )}>
                      {source.type === 'class' && <BookOpen className="h-5 w-5" />}
                      {source.type === 'feat' && <Wand2 className="h-5 w-5" />}
                      {source.type === 'race' && <Sparkles className="h-5 w-5" />}
                      {source.type === 'item' && <Star className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-semibold text-text-main truncate">{source.name}</h5>
                        <Badge variant="rarity" size="sm" className={cn(
                          source.type === 'class' && 'rarity-legendary',
                          source.type === 'feat' && 'rarity-rare',
                          source.type === 'race' && 'rarity-uncommon',
                          source.type === 'item' && 'rarity-common'
                        )}>
                          {source.type === 'class' && 'Classe'}
                          {source.type === 'feat' && 'Don'}
                          {source.type === 'race' && 'Race'}
                          {source.type === 'item' && 'Objet'}
                        </Badge>
                      </div>
                      <div className="text-sm text-text-muted flex items-center gap-2 flex-wrap">
                        <span>Carac: <strong className="text-text-main">{source.ability.toUpperCase()}</strong></span>
                        <span>•</span>
                        <span>Niv. lanceur: <strong className="text-text-main">{source.spellcastingLevel}</strong></span>
                        {source.sourceDetail && (
                          <>
                            <span>•</span>
                            <span className="text-text-dark">{source.sourceDetail}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bouton supprimer pour sources additionnelles seulement */}
                  {source.type !== 'class' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 flex-shrink-0"
                      onClick={() => handleRemoveSource(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Stats calculées pour cette source */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-bg-surface border border-border-main rounded-lg text-center">
                    <div className="text-xs text-text-muted uppercase tracking-wider">DD Sorts</div>
                    <div className="text-2xl font-bold text-purple-500 font-serif">
                      {getSpellSaveDC(source, proficiencyBonus, c.abilities as unknown as Record<string, number>)}
                    </div>
                  </div>
                  <div className="p-3 bg-bg-surface border border-border-main rounded-lg text-center">
                    <div className="text-xs text-text-muted uppercase tracking-wider">Attaque Magique</div>
                    <div className="text-2xl font-bold text-text-main font-serif">
                      {getSpellAttackBonus(source, proficiencyBonus, c.abilities as unknown as Record<string, number>) >= 0 ? '+' : ''}
                      {getSpellAttackBonus(source, proficiencyBonus, c.abilities as unknown as Record<string, number>)}
                    </div>
                  </div>
                  <div className="p-3 bg-bg-surface border border-border-main rounded-lg text-center">
                    <div className="text-xs text-text-muted uppercase tracking-wider">Sorts Préparés Max</div>
                    <div className="text-2xl font-bold text-text-main font-serif">
                      {getMaxPreparedSpellsForSource(source, c.abilities as unknown as Record<string, number>)}
                    </div>
                  </div>
                </div>

                {/* Cantrips connus */}
                {source.cantripsKnown > 0 && (
                  <div className="mb-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-text-main">Cantrips connus: </span>
                      <span className="font-bold text-amber-500">{source.cantripsKnown}</span>
                    </div>
                  </div>
                )}

                {/* Sorts toujours préparés (domaines, dons) */}
                {source.alwaysPrepared && source.alwaysPrepared.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Sorts toujours préparés (gratuits)</div>
                    <div className="flex flex-wrap gap-2">
                      {source.alwaysPrepared.map((spell, i) => (
                        <Badge key={i} variant="rarity" size="sm" rarity="legendary" className="gap-1">
                          <span className="text-xs">{spell.name}</span>
                          <span className="text-xs text-text-muted">Niv.{spell.level}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sorts accordés par le don (Magic Initiate, etc.) */}
                {source.grantedSpells && source.grantedSpells.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Sorts accordés par le don</div>
                    <div className="flex flex-wrap gap-2">
                      {source.grantedSpells.map((spell, i) => (
                        <Badge key={i} variant="rarity" size="sm" rarity="rare" className="gap-1">
                          <span className="text-xs">{spell.name}</span>
                          <span className="text-xs text-text-muted">Niv.{spell.level}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sorts préparés pour cette source */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h6 className="font-medium text-text-main flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Sorts préparés ({source.preparedSpells.length} / {getMaxPreparedSpellsForSource(source, c.abilities as unknown as Record<string, number>)})
                    </h6>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => source.type === 'class' ? handleAddPrimaryPreparedSpell() : handleAddPreparedSpellToSource(source.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                  </div>

                  {source.preparedSpells.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-2">Aucun sort préparé pour cette source</p>
                  ) : (
                    source.preparedSpells.map((spell, spellIndex) => (
                      <div key={spellIndex} className="p-3 bg-bg-surface border border-border-main rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-2">
                          <SpellSelector
                            spell={spell}
                            source={source}
                            characterClass={c.class_name}
                            onChange={updatedSpell => {
                              if (source.type === 'class') {
                                handleUpdatePrimaryPreparedSpell(spellIndex, updatedSpell)
                              } else {
                                handleUpdatePreparedSpellInSource(source.id, spellIndex, updatedSpell)
                              }
                            }}
                          />
                          <Select
                            label="Niveau"
                            value={spell.level}
                            onChange={e => {
                              const updatedSpell = { ...spell, level: parseInt(e.target.value) }
                              if (source.type === 'class') {
                                handleUpdatePrimaryPreparedSpell(spellIndex, updatedSpell)
                              } else {
                                handleUpdatePreparedSpellInSource(source.id, spellIndex, updatedSpell)
                              }
                            }}
                          >
                            <option value={0}>Cantrip (Level 0)</option>
                            {[1,2,3,4,5,6,7,8,9].map(l => (
                              <option key={l} value={l}>Level {l}</option>
                            ))}
                          </Select>
                          <Input
                            label="Temps d'incantation"
                            value={spell.casting_time}
                            onChange={e => {
                              const updatedSpell = { ...spell, casting_time: e.target.value }
                              if (source.type === 'class') {
                                handleUpdatePrimaryPreparedSpell(spellIndex, updatedSpell)
                              } else {
                                handleUpdatePreparedSpellInSource(source.id, spellIndex, updatedSpell)
                              }
                            }}
                            placeholder="Action, Action Bonus, Réaction..."
                          />
                          <Input
                            label="Portée"
                            value={spell.range}
                            onChange={e => {
                              const updatedSpell = { ...spell, range: e.target.value }
                              if (source.type === 'class') {
                                handleUpdatePrimaryPreparedSpell(spellIndex, updatedSpell)
                              } else {
                                handleUpdatePreparedSpellInSource(source.id, spellIndex, updatedSpell)
                              }
                            }}
                            placeholder="9m, Contact, 36m..."
                          />
                          <Input
                            label="Composantes"
                            value={spell.components}
                            onChange={e => {
                              const updatedSpell = { ...spell, components: e.target.value }
                              if (source.type === 'class') {
                                handleUpdatePrimaryPreparedSpell(spellIndex, updatedSpell)
                              } else {
                                handleUpdatePreparedSpellInSource(source.id, spellIndex, updatedSpell)
                              }
                            }}
                            placeholder="V, S, M"
                          />
                          <label className="flex items-center gap-2 cursor-pointer self-end">
                            <input
                              type="checkbox"
                              checked={spell.concentration}
                              onChange={e => {
                                const updatedSpell = { ...spell, concentration: e.target.checked }
                                if (source.type === 'class') {
                                  handleUpdatePrimaryPreparedSpell(spellIndex, updatedSpell)
                                } else {
                                  handleUpdatePreparedSpellInSource(source.id, spellIndex, updatedSpell)
                                }
                              }}
                              className="h-4 w-4 rounded border-border-main text-purple-500 focus:ring-purple-500"
                            />
                            <span className="text-sm text-text-muted">Concentration</span>
                          </label>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400" 
                            onClick={() => source.type === 'class' ? handleRemovePrimaryPreparedSpell(spellIndex) : handleRemovePreparedSpellFromSource(source.id, spellIndex)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            {/* Message si pas de source principale mais sources additionnelles */}
            {!isSpellcaster && allSources.length > 0 && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-text-main">Vous avez des sources de sorts (dons, race) mais aucune classe lanceuse de sorts.</span>
                </div>
                <p className="text-text-muted text-sm mt-1">Les sorts de ces sources utilisent leurs propres caractéristiques d'incantation.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== CARTE 2: Emplacements de sorts combinés ===== */}
        {allSources.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <h4 className="font-semibold text-text-main flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Emplacements de Sorts Combinés
              </h4>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(combinedSlots)
                  .filter(([, slot]) => slot.max > 0)
                  .map(([level, slot]) => (
                    <div key={level} className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                      <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Niveau {level}</div>
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={9}
                          value={slot.max}
                          onChange={e => form.updateSpellSlot(parseInt(level) as 1|2|3|4|5|6|7|8|9, parseInt(e.target.value) || 0, slot.current)}
                          className="w-16 text-center"
                        />
                        <span className="text-text-muted">/</span>
                        <Input
                          type="number"
                          min={0}
                          max={9}
                          value={slot.current}
                          onChange={e => form.updateSpellSlot(parseInt(level) as 1|2|3|4|5|6|7|8|9, slot.max, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                        />
                      </div>
                      <div className="text-xs text-text-dark mt-1">Max / Actuels</div>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-text-muted mt-3 text-center">
                Calculés selon la table D&D 2024 (somme des niveaux de lanceur effectifs)
              </p>
            </CardContent>
          </Card>
        )}

        {/* ===== MODAL: Ajouter une source (4 types) ===== */}
        {showAddSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-bg-surface border border-border-main rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-border-main flex items-center justify-between">
                <h3 className="font-semibold text-text-main">Ajouter une source d'incantation</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddSourceModal(false)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Type de source</label>
                  <Select
                    value={selectedFeatForSource ? 'feat' : selectedRaceForSource ? 'race' : itemSourceForm.name ? 'item' : ''}
                    onChange={e => {
                      const value = e.target.value
                      if (value === 'feat') {
                        setSelectedFeatForSource(SPELLCASTING_FEATS[0])
                        setSelectedFeatAbility(SPELLCASTING_FEATS[0].abilityChoices[0])
                        setShowAddRaceSourceModal(false)
                        setShowAddItemSourceModal(false)
                      } else if (value === 'race') {
                        setShowAddRaceSourceModal(true)
                        setShowAddSourceModal(false)
                      } else if (value === 'item') {
                        setShowAddItemSourceModal(true)
                        setShowAddSourceModal(false)
                      } else {
                        setSelectedFeatForSource(null)
                      }
                    }}
                  >
                    <option value="">— Choisir —</option>
                    <option value="feat">Don (Magic Initiate, Ritual Caster, etc.)</option>
                    <option value="race">Race / Lignée (sorts innés PHB 2024)</option>
                    <option value="item">Objet magique (saisie libre)</option>
                  </Select>
                </div>

                {selectedFeatForSource && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">Don</label>
                      <Select
                        value={selectedFeatForSource.id}
                        onChange={e => {
                          const feat = SPELLCASTING_FEATS.find(f => f.id === e.target.value)
                          if (feat) {
                            setSelectedFeatForSource(feat)
                            setSelectedFeatAbility(feat.abilityChoices[0])
                          }
                        }}
                      >
                        {SPELLCASTING_FEATS.map(feat => (
                          <option key={feat.id} value={feat.id}>{feat.name}</option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">Caractéristique d'incantation</label>
                      <Select
                        value={selectedFeatAbility}
                        onChange={e => setSelectedFeatAbility(e.target.value as SpellcastingAbility)}
                      >
                        {selectedFeatForSource.abilityChoices.map(ab => (
                          <option key={ab} value={ab}>{ab.toUpperCase()}</option>
                        ))}
                      </Select>
                    </div>

                    <div className="p-3 bg-bg-surface/50 border border-border-main rounded-lg text-sm">
                      <p className="font-medium text-text-main mb-1">{selectedFeatForSource.name}</p>
                      <p className="text-text-muted">{selectedFeatForSource.description}</p>
                      <div className="mt-2 text-xs text-text-dark">
                        <span>Cantrips: </span><strong>{selectedFeatForSource.grantedCantrips}</strong>
                        <span className="ml-2">Sorts niv.1: </span><strong>{selectedFeatForSource.grantedSpellsLevel1}</strong>
                        {selectedFeatForSource.alwaysPrepared && selectedFeatForSource.alwaysPrepared.length > 0 && (
                          <span className="ml-2">Toujours préparés: </span>
                        )}
                        {selectedFeatForSource.alwaysPrepared?.map(s => <span key={s.name} className="ml-1">{s.name}</span>)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="secondary" onClick={() => setShowAddSourceModal(false)} className="flex-1">
                        Annuler
                      </Button>
                      <Button onClick={handleAddFeatSource} className="flex-1">
                        Ajouter la source
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: Ajouter source Race ===== */}
        {showAddRaceSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-bg-surface border border-border-main rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-border-main flex items-center justify-between">
                <h3 className="font-semibold text-text-main">Ajouter une source d'incantation (Race)</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowAddRaceSourceModal(false); setShowAddSourceModal(true) }}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Espèce / Lignée</label>
                  <Select
                    value={selectedRaceForSource}
                    onChange={e => {
                      setSelectedRaceForSource(e.target.value)
                      setSelectedRaceCantrip('')
                    }}
                  >
                    <option value="">— Choisir une espèce —</option>
                    {Object.entries(RACE_SPELLCASTING_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')} 
                        ({config.ability.toUpperCase()})
                      </option>
                    ))}
                  </Select>
                </div>

                {selectedRaceForSource && RACE_SPELLCASTING_CONFIG[selectedRaceForSource]?.cantripChoice === 'sorcerer' && (
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Choisir un tour de magie (liste Sorcier)</label>
                    <Select
                      value={selectedRaceCantrip}
                      onChange={e => setSelectedRaceCantrip(e.target.value)}
                    >
                      <option value="">— Choisir un cantrip —</option>
                      {SRD2024_SPELLS
                        .filter(s => s.level === 0 && s.classes?.includes('sorcerer'))
                        .map(spell => (
                          <option key={spell.name} value={spell.name}>{spell.name}</option>
                        ))}
                    </Select>
                    <p className="text-xs text-text-muted mt-1">PHB 2024 : Haut-Elfe choisit 1 cantrip liste Sorcier</p>
                  </div>
                )}

                {selectedRaceForSource && (
                  <div className="p-3 bg-bg-surface/50 border border-border-main rounded-lg text-sm">
                    <p className="font-medium text-text-main mb-1">
                      {selectedRaceForSource.charAt(0).toUpperCase() + selectedRaceForSource.slice(1).replace('-', ' ')}
                    </p>
                    <p className="text-text-muted mb-2">Caractéristique: {RACE_SPELLCASTING_CONFIG[selectedRaceForSource].ability.toUpperCase()}</p>
                    <div className="text-xs text-text-dark">
                      <div>Cantrips: <strong>{RACE_SPELLCASTING_CONFIG[selectedRaceForSource].cantrips.join(', ') || '—'}</strong></div>
                      <div>Sorts innés: <strong>{RACE_SPELLCASTING_CONFIG[selectedRaceForSource].spells.map(s => `${s.name} (Niv.${s.level})`).join(', ') || '—'}</strong></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" onClick={() => { setShowAddRaceSourceModal(false); setShowAddSourceModal(true) }} className="flex-1">
                    Retour
                  </Button>
                  <Button 
                    onClick={() => {
                      if (selectedRaceForSource) {
                        const newSource = createRaceSpellcastingSource(selectedRaceForSource, selectedRaceCantrip || undefined)
                        if (newSource) {
                          form.setField('additional_spellcasting_sources', [...(c.additional_spellcasting_sources ?? []), newSource])
                        }
                      }
                      setShowAddRaceSourceModal(false)
                      setSelectedRaceForSource('')
                      setSelectedRaceCantrip('')
                    }} 
                    disabled={!selectedRaceForSource || (RACE_SPELLCASTING_CONFIG[selectedRaceForSource]?.cantripChoice === 'sorcerer' && !selectedRaceCantrip)}
                    className="flex-1"
                  >
                    Ajouter la source
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: Ajouter source Objet ===== */}
        {showAddItemSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-bg-surface border border-border-main rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-border-main flex items-center justify-between">
                <h3 className="font-semibold text-text-main">Ajouter une source d'incantation (Objet)</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowAddItemSourceModal(false); setShowAddSourceModal(true) }}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Nom de l'objet</label>
                  <Input
                    value={itemSourceForm.name}
                    onChange={e => setItemSourceForm({ ...itemSourceForm, name: e.target.value })}
                    placeholder="Ex: Bâton de feu, Anneau de protection..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Caractéristique d'incantation</label>
                  <Select
                    value={itemSourceForm.ability}
                    onChange={e => setItemSourceForm({ ...itemSourceForm, ability: e.target.value as SpellcastingAbility })}
                  >
                    <option value="str">FOR</option>
                    <option value="dex">DEX</option>
                    <option value="con">CON</option>
                    <option value="int">INT</option>
                    <option value="wis">SAG</option>
                    <option value="cha">CHA</option>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Niveau de lanceur"
                    type="number"
                    min={1}
                    max={20}
                    value={itemSourceForm.spellcastingLevel}
                    onChange={e => setItemSourceForm({ ...itemSourceForm, spellcastingLevel: parseInt(e.target.value) || 1 })}
                  />
                  <Input
                    label="Cantrips connus"
                    type="number"
                    min={0}
                    max={10}
                    value={itemSourceForm.cantripsKnown}
                    onChange={e => setItemSourceForm({ ...itemSourceForm, cantripsKnown: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Charges"
                    type="number"
                    min={1}
                    max={10}
                    value={itemSourceForm.charges}
                    onChange={e => setItemSourceForm({ ...itemSourceForm, charges: parseInt(e.target.value) || 1 })}
                  />
                  <Select
                    label="Recharge"
                    value={itemSourceForm.rechargeType}
                    onChange={e => setItemSourceForm({ ...itemSourceForm, rechargeType: e.target.value as 'long' | 'short' | 'dawn' | 'none' })}
                  >
                    <option value="long">Repos long</option>
                    <option value="short">Repos court</option>
                    <option value="dawn">Aube</option>
                    <option value="none">Aucune (unique)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Sorts préparés (optionnel)</label>
                  <div className="space-y-2">
                    {itemSourceForm.preparedSpells.map((spell, index) => (
                      <div key={index} className="flex gap-2 p-2 bg-bg-surface/50 border border-border-main rounded-lg">
                        <Input
                          label="Nom"
                          value={spell.name}
                          onChange={e => {
                            const updated = [...itemSourceForm.preparedSpells]
                            updated[index] = { ...spell, name: e.target.value }
                            setItemSourceForm({ ...itemSourceForm, preparedSpells: updated })
                          }}
                          placeholder="Nom du sort"
                          className="flex-1"
                        />
                        <Select
                          label="Niv."
                          value={spell.level}
                          onChange={e => {
                            const updated = [...itemSourceForm.preparedSpells]
                            updated[index] = { ...spell, level: parseInt(e.target.value) }
                            setItemSourceForm({ ...itemSourceForm, preparedSpells: updated })
                          }}
                          className="w-24"
                        >
                          <option value={0}>Cantrip</option>
                          {[1,2,3,4,5,6,7,8,9].map(l => <option key={l} value={l}>Level {l}</option>)}
                        </Select>
                        <Button variant="ghost" size="sm" className="text-red-400 mt-8" onClick={() => {
                          const updated = itemSourceForm.preparedSpells.filter((_, i) => i !== index)
                          setItemSourceForm({ ...itemSourceForm, preparedSpells: updated })
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => setItemSourceForm({ ...itemSourceForm, preparedSpells: [...itemSourceForm.preparedSpells, { name: '', level: 1, casting_time: 'Action', components: 'V, S', concentration: false, range: '9m' }] })}>
                      <Plus className="h-3 w-3 mr-1" /> Ajouter un sort
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Sorts toujours préparés (optionnel)</label>
                  <div className="space-y-2">
                    {itemSourceForm.alwaysPrepared?.map((spell, index) => (
                      <div key={index} className="flex gap-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <Input
                          label="Nom"
                          value={spell.name}
                          onChange={e => {
                            const updated = [...(itemSourceForm.alwaysPrepared ?? [])]
                            updated[index] = { ...spell, name: e.target.value }
                            setItemSourceForm({ ...itemSourceForm, alwaysPrepared: updated })
                          }}
                          placeholder="Nom du sort"
                          className="flex-1"
                        />
                        <Select
                          label="Niv."
                          value={spell.level}
                          onChange={e => {
                            const updated = [...(itemSourceForm.alwaysPrepared ?? [])]
                            updated[index] = { ...spell, level: parseInt(e.target.value) }
                            setItemSourceForm({ ...itemSourceForm, alwaysPrepared: updated })
                          }}
                          className="w-24"
                        >
                          <option value={0}>Cantrip</option>
                          {[1,2,3,4,5,6,7,8,9].map(l => <option key={l} value={l}>Level {l}</option>)}
                        </Select>
                        <Button variant="ghost" size="sm" className="text-red-400 mt-8" onClick={() => {
                          const updated = (itemSourceForm.alwaysPrepared ?? []).filter((_, i) => i !== index)
                          setItemSourceForm({ ...itemSourceForm, alwaysPrepared: updated })
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => setItemSourceForm({ ...itemSourceForm, alwaysPrepared: [...(itemSourceForm.alwaysPrepared ?? []), { name: '', level: 1, casting_time: 'Action', components: 'V, S', concentration: false, range: '9m' }] })}>
                      <Plus className="h-3 w-3 mr-1" /> Ajouter un sort toujours préparé
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" onClick={() => { setShowAddItemSourceModal(false); setShowAddSourceModal(true) }} className="flex-1">
                    Retour
                  </Button>
                  <Button 
                    onClick={() => {
                      if (itemSourceForm.name) {
                        const newSource = createItemSpellcastingSource(itemSourceForm)
                        form.setField('additional_spellcasting_sources', [...(c.additional_spellcasting_sources ?? []), newSource])
                      }
                      setShowAddItemSourceModal(false)
                      setItemSourceForm({ name: '', ability: 'int', cantripsKnown: 0, preparedSpells: [], alwaysPrepared: [], charges: 1, rechargeType: 'long', spellcastingLevel: 1 })
                    }} 
                    disabled={!itemSourceForm.name}
                    className="flex-1"
                  >
                    Ajouter la source
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== PANNEAU DE PRÉVISUALISATION (Colonne droite) =====
  const renderPreview = () => {
    if (!showPreview) return null

    const c = form.character
    const initiative = calculations.initiative.initiative
    const passivePerception = calculations.skills.passivePerception
    const isSpellcaster = c.spellcasting_ability !== 'none'
    const spellcasting = calculations.spellcasting

    return (
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="space-y-4">
          {/* Header Preview */}
          <Card className="bg-bg-surface border-amber-main/30">
            <CardContent className="p-4">
              <div className="font-bold text-text-main font-serif">{c.character_name || 'Nouveau Personnage'}</div>
              <div className="text-sm text-text-muted mt-1">
                Niv. {c.level} • {c.species} {c.class_name}
                {c.subclass_name && ` (${c.subclass_name})`}
              </div>
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <div className="text-xs text-text-muted uppercase tracking-wider">PV Max</div>
                  <div className="text-2xl font-bold text-red-500 font-serif">{c.hit_points_max}</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                  <div className="text-xs text-text-muted uppercase tracking-wider">CA</div>
                  <div className="text-2xl font-bold text-blue-500 font-serif">{c.armor_class}</div>
                </div>
                <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                  <div className="text-xs text-text-muted uppercase tracking-wider">Initiative</div>
                  <div className="text-2xl font-bold text-yellow-500 font-serif">
                    {initiative >= 0 ? '+' : ''}{initiative}
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                  <div className="text-xs text-text-muted uppercase tracking-wider">Per. Passive</div>
                  <div className="text-2xl font-bold text-purple-500 font-serif">{passivePerception}</div>
                </div>
              </div>
              <div className="text-xs text-text-dark text-center">Vitesse: {c.speed}</div>
            </CardContent>
          </Card>

          {/* Saves */}
          <Card>
            <CardHeader className="pb-2">
              <h4 className="font-semibold text-text-main">Jets de Sauvegarde</h4>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                {ALL_ABILITIES.map(ability => {
                  const mod = calculations.savingThrows.modifiers[ability]
                  const prof = calculations.savingThrows.proficient[ability]
                  const labels = { str: 'FOR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'SAG', cha: 'CHA' }
                  return (
                    <div key={ability} className={cn(
                      'p-2 rounded text-center text-sm',
                      prof ? 'bg-amber-main/10 text-amber-main' : 'bg-bg-surface'
                    )}>
                      <div className="font-medium">{labels[ability]}</div>
                      <div className="font-bold">{mod >= 0 ? '+' : ''}{mod}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Spellcasting */}
          {isSpellcaster && (
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-text-main flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" /> Magie
                </h4>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="text-sm">
                  <span className="text-text-muted">Caractéristique: </span>
                  <span className="font-medium text-purple-500">{c.spellcasting_ability.toUpperCase()}</span>
                </div>
                {spellcasting.spellSaveDC !== null && (
                  <div className="text-sm">
                    <span className="text-text-muted">DD Sorts: </span>
                    <span className="font-bold">{spellcasting.spellSaveDC}</span>
                  </div>
                )}
                {spellcasting.spellAttackBonus !== null && (
                  <div className="text-sm">
                    <span className="text-text-muted">Attaque: </span>
                    <span className="font-bold">{spellcasting.spellAttackBonus >= 0 ? '+' : ''}{spellcasting.spellAttackBonus}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-text-muted">Sorts préparés: </span>
                  <span className="font-bold">{c.prepared_spells.length}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(c.spell_slots)
                    .filter(([, slot]) => slot.max > 0)
                    .map(([level, slot]) => (
                      <Badge key={level} variant="rarity" size="sm" className="gap-1">
                        N{level}: {slot.current}/{slot.max}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weapon Masteries */}
          {c.weapon_masteries.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-text-main flex items-center gap-2">
                  <Sword className="h-4 w-4 text-amber-main" /> Maîtrises d'Armes
                </h4>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {c.weapon_masteries.map((wm, i) => (
                    <Badge key={i} variant="rarity" size="sm" rarity="uncommon">
                      {wm.weapon}: {WEAPON_MASTERY_LABELS[wm.property]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Origin Feats */}
          {c.origin_feats?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-text-main flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-main" /> Dons d'Origine
                </h4>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {c.origin_feats.map((feat, index) => (
                    <div key={index} className="p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
                      <div className="font-medium text-text-main">{feat.name}</div>
                      <p className="text-text-muted mt-1 text-sm">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tool Proficiencies */}
          {c.tool_proficiencies?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-text-main flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-main" /> Maîtrises d'Outils
                </h4>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {c.tool_proficiencies.map((tool, i) => (
                    <Badge key={i} variant="rarity" size="sm" rarity="common">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Status */}
          <Card className={cn('border-2', isValid ? 'border-green-500/50' : 'border-red-500/50')}>
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {isValid ? (
                  <span className="text-green-500 mt-0.5">✓</span>
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <span className={cn('text-sm font-medium', isValid ? 'text-green-500' : 'text-red-500')}>
                    {isValid ? 'Formulaire valide' : 'Champs obligatoires manquants'}
                  </span>
                  {!isValid && (
                    <ul className="mt-2 text-xs text-red-400 space-y-1">
                      {form.errors.character_name && <li>• Nom du personnage</li>}
                      {form.errors.class_name && <li>• Classe</li>}
                      {form.errors.hit_points_max && <li>• Points de vie max</li>}
                      {form.errors.armor_class && <li>• Classe d'armure</li>}
                      {form.errors.level && <li>• Niveau</li>}
                      {form.errors.abilities && (
                        <li>• Attributs: {Object.keys(form.errors.abilities).map(k => k.toUpperCase()).join(', ')}</li>
                      )}
                      {form.errors.spellcasting_ability && <li>• Caractéristique d'incantation</li>}
                      {form.errors.general && <li>• {form.errors.general}</li>}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={initialCharacter ? 'Modifier Personnage' : 'Créer un Personnage'}
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col h-full w-full max-w-7xl">
        {/* Main Content: 2 columns */}
        <div className="flex-1 overflow-hidden flex">
          {/* Colonne Gauche: Formulaire (2/3) */}
          <div className="w-full lg:w-2/3 flex flex-col overflow-hidden z-10">
            {/* Navigation des sections */}
            <div className="flex flex-wrap gap-1 p-3 border-b border-border-main bg-bg-surface/50">
              {getSections(form.character.class_name).map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeSection === id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveSection(id)}
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Contenu de la section active */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {renderSection(activeSection)}
            </div>
          </div>

          {/* Colonne Droite: Prévisualisation (1/3) */}
          <div className="hidden lg:block w-80 flex-shrink-0 z-0 overflow-hidden">
            <div className="h-full overflow-y-auto max-h-[calc(90vh-120px)]">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border-main bg-bg-surface/50 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="secondary" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-1" /> Dupliquer
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid || form.isSaving}
            loading={form.isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {initialCharacter ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
