import { useState, useMemo } from 'react'
import { 
  Save, User, Sword, Heart, Brain, BookOpen, Star, 
  Plus, Trash2, Zap, Sparkles, Target,
  Copy, AlertTriangle
} from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { useCharacterForm } from '../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../hooks/useCharacterCalculations'
import type { PlayerCharacter, SkillName, WeaponMasteryProperty, SpellcastingAbility } from '../../types/character'
import { 
  ALL_SKILLS, 
  ALL_ABILITIES, 
  SKILL_ABILITY_MAP, 
  WEAPON_MASTERY_PROPERTIES, 
  WEAPON_MASTERY_LABELS,
  getAbilityModifier,
} from '../../types/character'
import { cn } from '@/shared/utils/cn'
import { 
  getAllSpecies, 
  getAllBackgrounds, 
  getAllClasses, 
  getSubclasses
} from '@/shared/data'

interface CharacterBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  initialCharacter?: PlayerCharacter
  onSaved: (character: PlayerCharacter) => void
  onDuplicate?: () => void
}

const SECTIONS = [
  { id: 'identity', label: 'Identité', icon: User },
  { id: 'abilities', label: 'Attributs', icon: Target },
  { id: 'skills', label: 'Compétences', icon: Brain },
  { id: 'vitals', label: 'Vitales', icon: Heart },
  { id: 'feats', label: 'Dons/Armes', icon: Star },
  { id: 'spells', label: 'Magie', icon: BookOpen },
] as const

type SectionId = typeof SECTIONS[number]['id']

export function CharacterBuilderModal({ isOpen, onClose, initialCharacter, onSaved }: CharacterBuilderModalProps) {
  const form = useCharacterForm(initialCharacter)
  const calculations = useCharacterCalculations(form.character)
  const [activeSection, setActiveSection] = useState<SectionId>('identity')
  const [showPreview] = useState(true)

  // Validation state
  const isValid = form.isValid

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Niveau *</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={c.level}
              onChange={e => form.setField('level', parseInt(e.target.value) || 1)}
              error={form.errors.level}
              className="w-full"
            />
          </div>
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
            <p className="text-sm text-text-muted">Calculé automatiquement selon le niveau (RG-8-1-01)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => form.setAbility(ability, score - 1)}
                      disabled={score <= 1}
                    >−</Button>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={score}
                      onChange={e => form.setAbility(ability, parseInt(e.target.value) || 1)}
                      className="w-20 text-center text-2xl font-bold font-serif bg-transparent border-none p-0"
                      error={form.errors.abilities?.[ability]}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => form.setAbility(ability, score + 1)}
                      disabled={score >= 30}
                    >+</Button>
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

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <Brain className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-medium text-text-main">Perception Passive: <span className="text-blue-500">{calculations.skills.passivePerception}</span></p>
            <p className="text-sm text-text-muted">10 + modificateur Perception final (RG-8-1-06)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_SKILLS.map(skill => {
            const ability = SKILL_ABILITY_MAP[skill]
            const abilityMod = abilityModifiers[ability]
            const proficiency = c.skills[skill]
            const totalMod = skillModifiers[skill]

            const skillLabels: Record<SkillName, string> = {
              acrobatics: 'Acrobaties (DEX)',
              animal_handling: 'Dressage (SAG)',
              arcana: 'Arcanes (INT)',
              athletics: 'Athlétisme (FOR)',
              deception: 'Tromperie (CHA)',
              history: 'Histoire (INT)',
              insight: 'Perspicacité (SAG)',
              intimidation: 'Intimidation (CHA)',
              investigation: 'Investigation (INT)',
              medicine: 'Médecine (SAG)',
              nature: 'Nature (INT)',
              perception: 'Perception (SAG)',
              performance: 'Représentation (CHA)',
              persuasion: 'Persuasion (CHA)',
              religion: 'Religion (INT)',
              sleight_of_hand: 'Prestidigitation (DEX)',
              stealth: 'Discrétion (DEX)',
            }

            return (
              <Card key={skill} className={cn(
                'p-3',
                proficiency === 'expertise' && 'bg-amber-main/10 border-amber-main/30',
                proficiency === 'proficient' && 'bg-amber-main/5 border-amber-main/20'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-main truncate pr-2">
                      {skillLabels[skill]}
                    </div>
                    <div className="text-xs text-text-muted">
                      Mod {ability}: {abilityMod >= 0 ? '+' : ''}{abilityMod} | PB: +{proficiencyBonus}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div className={cn(
                      'text-xl font-bold font-serif w-12 text-right',
                      totalMod >= 0 ? 'text-amber-main' : 'text-red-500'
                    )}>
                      {totalMod >= 0 ? '+' : ''}{totalMod}
                    </div>
                    <Select
                      value={proficiency}
                      onChange={e => form.setSkill(skill, e.target.value as 'none' | 'proficient' | 'expertise')}
                      className="w-20"
                    >
                      {proficiencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            DEX ({calculations.abilities.modifiers.dex >= 0 ? '+' : ''}{calculations.abilities.modifiers.dex}) + Divers ({c.initiative_misc_bonus >= 0 ? '+' : ''}{c.initiative_misc_bonus}) = {initiative >= 0 ? '+' : ''}{initiative} (RG-8-1-07)
          </p>
        </div>
      </div>
    )
  }

  // ===== SECTION 5: DONS & MAÎTRISES D'ARMES =====
  function renderFeatsSection() {
    const c = form.character

    return (
      <div className="space-y-6">
        {/* Don d'Origine */}
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-main" />
              Don d'Origine (Historique)
            </h4>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Input
              label="Nom du don"
              value={c.origin_feat.name}
              onChange={e => form.setOriginFeat({ ...c.origin_feat, name: e.target.value })}
              placeholder="Ex: Robuste, Alerte, Magicien..."
            />
            <Input
              label="Description"
              value={c.origin_feat.description}
              onChange={e => form.setOriginFeat({ ...c.origin_feat, description: e.target.value })}
              placeholder="Effet du don..."
            />
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
      </div>
    )
  }

  // ===== SECTION 6: MAGIE =====
  function renderSpellsSection() {
    const c = form.character
    const spellcasting = calculations.spellcasting
    const isSpellcaster = c.spellcasting_ability !== 'none'

    if (!isSpellcaster) {
      return (
        <div className="space-y-4">
          <Card className="border-dashed border-border-main">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-text-dark mx-auto mb-4 opacity-50" />
              <h4 className="font-medium text-text-main mb-2">Pas de lanceur de sorts</h4>
              <p className="text-text-muted mb-4">
                Sélectionnez une caractéristique d'incantation ci-dessous pour activer la section magie.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Caractéristique d'incantation */}
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Configuration du Lanceur de Sorts
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Select
                label="Caractéristique d'incantation"
                value={c.spellcasting_ability}
                onChange={e => form.setField('spellcasting_ability', e.target.value as SpellcastingAbility)}
                error={form.errors.spellcasting_ability}
              >
                <option value="none">Aucun (Non-lanceur)</option>
                <option value="int">Intelligence (Magicien, Ensorceleur...)</option>
                <option value="wis">Sagesse (Clerc, Druide, Rôdeur...)</option>
                <option value="cha">Charisme (Barde, Paladin, Démoniste...)</option>
                <option value="str">Force (rare)</option>
                <option value="dex">Dextérité (rare)</option>
                <option value="con">Constitution (rare)</option>
              </Select>
              {spellcasting.spellSaveDC !== null && (
                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                  <div className="text-xs text-text-muted uppercase tracking-wider">DD Sorts</div>
                  <div className="text-3xl font-bold text-purple-500 font-serif">{spellcasting.spellSaveDC}</div>
                </div>
              )}
              {spellcasting.spellAttackBonus !== null && (
                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                  <div className="text-xs text-text-muted uppercase tracking-wider">Attaque Magique</div>
                  <div className="text-3xl font-bold text-text-main font-serif">
                    {spellcasting.spellAttackBonus >= 0 ? '+' : ''}{spellcasting.spellAttackBonus}
                  </div>
                </div>
              )}
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                <div className="text-xs text-text-muted uppercase tracking-wider">Sorts Préparés Max</div>
                <div className="text-3xl font-bold text-text-main font-serif">
                  {c.spellcasting_ability !== 'none' 
                    ? Math.max(1, c.level + getAbilityModifier(c.abilities[c.spellcasting_ability as keyof typeof c.abilities]))
                    : '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emplacements de sorts */}
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Emplacements de Sorts (Slots)
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(c.spell_slots)
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
          </CardContent>
        </Card>

        {/* Sorts Préparés */}
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Sorts Préparés ({c.prepared_spells.length})
            </h4>
            <Button variant="secondary" size="sm" onClick={() => form.addPreparedSpell({
              name: '',
              level: 1,
              casting_time: 'Action',
              components: 'V, S',
              concentration: false,
              range: '9m',
            })}>
              <Plus className="h-4 w-4 mr-1" /> Préparer
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 max-h-96 overflow-y-auto">
            {c.prepared_spells.length === 0 ? (
              <p className="text-text-muted text-center py-4">Aucun sort préparé. Cliquez sur "Préparer" pour ajouter.</p>
            ) : (
              c.prepared_spells.map((spell, index) => (
                <div key={index} className="p-3 bg-bg-surface border border-border-main rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-2">
                    <Input
                      label="Nom"
                      value={spell.name}
                      onChange={e => form.updatePreparedSpell(index, { ...spell, name: e.target.value })}
                      placeholder="Nom du sort"
                    />
                    <Select
                      label="Niveau"
                      value={spell.level}
                      onChange={e => form.updatePreparedSpell(index, { ...spell, level: parseInt(e.target.value) })}
                    >
                      <option value={0}>Truc (Niv. 0)</option>
                      {[1,2,3,4,5,6,7,8,9].map(l => (
                        <option key={l} value={l}>Niveau {l}</option>
                      ))}
                    </Select>
                    <Input
                      label="Temps d'incantation"
                      value={spell.casting_time}
                      onChange={e => form.updatePreparedSpell(index, { ...spell, casting_time: e.target.value })}
                      placeholder="Action, Action Bonus, Réaction..."
                    />
                    <Input
                      label="Portée"
                      value={spell.range}
                      onChange={e => form.updatePreparedSpell(index, { ...spell, range: e.target.value })}
                      placeholder="9m, Contact, 36m..."
                    />
                    <Input
                      label="Composantes"
                      value={spell.components}
                      onChange={e => form.updatePreparedSpell(index, { ...spell, components: e.target.value })}
                      placeholder="V, S, M"
                    />
                    <label className="flex items-center gap-2 cursor-pointer self-end">
                      <input
                        type="checkbox"
                        checked={spell.concentration}
                        onChange={e => form.updatePreparedSpell(index, { ...spell, concentration: e.target.checked })}
                        className="h-4 w-4 rounded border-border-main text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-sm text-text-muted">Concentration</span>
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => form.removePreparedSpell(index)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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

          {/* Origin Feat */}
          {c.origin_feat.name && (
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-text-main flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-main" /> Don d'Origine
                </h4>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm">
                  <span className="font-medium">{c.origin_feat.name}</span>
                  <p className="text-text-muted mt-1">{c.origin_feat.description}</p>
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
              {SECTIONS.map(({ id, label, icon: Icon }) => (
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
