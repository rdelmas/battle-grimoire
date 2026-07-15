import { useState, useEffect, useRef, useMemo } from 'react'
import { 
  Save, User, Sword, Heart, Brain, BookOpen, Target,
  Copy, AlertTriangle, ChevronDown,
  Axe, Guitar, Church, Leaf, Swords, Hand, Shield, PocketKnife, Sparkles, Eye
} from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { useCharacterForm } from '../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../hooks/useCharacterCalculations'
import type { PlayerCharacter } from '../../types/character'
import { 
  autoConfigureSpellcasting,
} from '../../utils/spellcasting'
import { cn } from '@/shared/utils/cn'
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card'
import { IdentitySection } from './sections/IdentitySection'
import { AbilitiesSection } from './sections/AbilitiesSection'
import { SkillsSection } from './sections/SkillsSection'
import { VitalsSection } from './sections/VitalsSection'
import { FeatsSection } from './sections/FeatsSection'
import { SpellsSection } from './sections/SpellsSection'
import { AttacksSection } from './sections/AttacksSection'
import { 
  ALL_ABILITIES, 
  DAMAGE_TYPE_LABELS,
} from '../../types/character'
import { Star } from 'lucide-react'

interface CharacterBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  initialCharacter?: PlayerCharacter
  onSaved: (character: PlayerCharacter) => void
  onDuplicate?: () => void
}

// Sections de navigation - utilisation d'identifiants de chaîne pour éviter les problèmes de réconciliation React
const SECTION_CONFIG = [
  { id: 'identity' as const, label: 'Identité', iconKey: 'user' },
  { id: 'abilities' as const, label: 'Attributs', iconKey: 'target' },
  { id: 'skills' as const, label: 'Compétences', iconKey: 'brain' },
  { id: 'vitals' as const, label: 'Vitales', iconKey: 'heart' },
  { id: 'feats' as const, label: 'Dons/Armes', iconKey: 'class' }, // Résolu dynamiquement au render
  { id: 'spells' as const, label: 'Magie', iconKey: 'bookOpen' },
  { id: 'attacks' as const, label: 'Attaques', iconKey: 'swords' },
] as const

const ICON_MAP = {
  user: User,
  target: Target,
  brain: Brain,
  heart: Heart,
  bookOpen: BookOpen,
  sword: Sword,
  axe: Axe,
  guitar: Guitar,
  church: Church,
  leaf: Leaf,
  swords: Swords,
  hand: Hand,
  shield: Shield,
  pocketKnife: PocketKnife,
  sparkles: Sparkles,
  eye: Eye,
} as const

// Icônes de classe pour résolution au render time
const CLASS_ICON_KEYS = {
  barbarian: 'axe',
  bard: 'guitar',
  cleric: 'church',
  druid: 'leaf',
  fighter: 'swords',
  monk: 'hand',
  paladin: 'shield',
  ranger: 'target',
  rogue: 'pocketKnife',
  sorcerer: 'sparkles',
  warlock: 'eye',
  wizard: 'bookOpen',
} as const

// Composant stable pour rendre l'icône selon la clé - évite les problèmes de réconciliation React
function TabIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const Icon = ICON_MAP[iconKey as keyof typeof ICON_MAP] ?? Sword
  return <Icon className={className} />
}

type SectionId = 'identity' | 'abilities' | 'skills' | 'vitals' | 'feats' | 'spells' | 'attacks'

// Sections de navigation - référence stable
const SECTIONS = SECTION_CONFIG

export function CharacterBuilderModal({ isOpen, onClose, initialCharacter, onSaved, onDuplicate }: CharacterBuilderModalProps) {
  const form = useCharacterForm(initialCharacter)
  const calculations = useCharacterCalculations(form.character)
  const [activeSection, setActiveSection] = useState<SectionId>('identity')
  const [showPreview] = useState(true)
  const [isSavesExpanded, setIsSavesExpanded] = useState(false)
  const [isSpellcastingExpanded, setIsSpellcastingExpanded] = useState(false)
  const [isAttacksExpanded, setIsAttacksExpanded] = useState(false)

  // Track previous initialCharacter to avoid infinite loop
  const prevInitialCharacterRef = useRef<PlayerCharacter | undefined>(initialCharacter)

  // Reset form when initialCharacter changes (e.g., when editing a different character)
  useEffect(() => {
    if (prevInitialCharacterRef.current !== initialCharacter) {
      prevInitialCharacterRef.current = initialCharacter
      form.reset(initialCharacter)
    }
  }, [initialCharacter, form])

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

  // Validation state
  const isValid = form.isValid

  // Memoize navigation tabs to prevent React reconciliation issues
  const navTabs = useMemo(() => {
    const className = form.character.class_name
    const classIconKey = className ? CLASS_ICON_KEYS[className as keyof typeof CLASS_ICON_KEYS] ?? 'sword' : 'sword'
    
    return SECTIONS.map(section => ({
      ...section,
      iconKey: section.iconKey === 'class' ? classIconKey : section.iconKey
    }))
  }, [form.character.class_name])

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

  // ===== PANNEAU DE PRÉVISUALISATION (Colonne droite) - ORIGINAL =====
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

          {/* Saves - Collapsible */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsSavesExpanded(!isSavesExpanded)}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-text-main">Jets de Sauvegarde</h4>
                <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', isSavesExpanded ? 'rotate-180' : '')} />
              </div>
            </CardHeader>
            {isSavesExpanded && (
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
            )}
          </Card>

          {/* Spellcasting - Collapsible */}
          {isSpellcaster && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsSpellcastingExpanded(!isSpellcastingExpanded)}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-text-main flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-500" /> Magie
                  </h4>
                  <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', isSpellcastingExpanded ? 'rotate-180' : '')} />
                </div>
              </CardHeader>
              {isSpellcastingExpanded && (
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
              )}
            </Card>
          )}

          {/* Attaques unifiées - repliable, fermé par défaut */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsAttacksExpanded(!isAttacksExpanded)}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-text-main flex items-center gap-2">
                  <Sword className="h-4 w-4 text-amber-main" /> Attaques ({calculations.attacks.options.length})
                </h4>
                <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', isAttacksExpanded ? 'rotate-180' : '')} />
              </div>
            </CardHeader>
            {isAttacksExpanded && (
              <CardContent className="pt-0 space-y-2">
                {calculations.attacks.options.length === 0 ? (
                  <p className="text-text-muted text-center py-2">Aucune attaque dérivée.</p>
                ) : (
                  calculations.attacks.options.map(a => (
                    <div key={a.id} className="p-2 bg-bg-surface border border-border-main rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-main text-sm">{a.name}</span>
                        <span className="text-xs text-text-muted">
                          {a.attack_bonus >= 0 ? '+' : ''}{a.attack_bonus}
                        </span>
                      </div>
                      {a.damage_dice && (
                        <div className="text-xs text-text-muted mt-0.5">
                          {a.damage_dice}{a.damage_bonus ? `+${a.damage_bonus}` : ''} {DAMAGE_TYPE_LABELS[a.damage_type]}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>

          {/* Origin Feat */}
          {c.origin_feats && c.origin_feats.length > 0 && c.origin_feats[0].name && (
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-text-main flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-main" /> Don d'Origine
                </h4>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm">
                  <span className="font-medium">{c.origin_feats[0].name}</span>
                  <p className="text-text-muted mt-1">{c.origin_feats[0].description}</p>
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

  // Render section content
  const renderSection = (sectionId: SectionId) => {
    const c = form.character
    switch (sectionId) {
      case 'identity':
        return <IdentitySection character={c} form={form} />
      case 'abilities':
        return <AbilitiesSection character={c} form={form} calculations={calculations} />
      case 'skills':
        return <SkillsSection character={c} form={form} calculations={calculations} />
      case 'vitals':
        return <VitalsSection character={c} form={form} calculations={calculations} />
      case 'feats':
        return <FeatsSection character={c} form={form} />
      case 'spells':
        return <SpellsSection character={c} form={form} calculations={calculations} />
      case 'attacks':
        return <AttacksSection character={c} form={form} />
    }
  }

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
        {/* Main Content: 2 columns - FLEXBOX */}
        <div className="flex-1 overflow-hidden flex">
          {/* Colonne Gauche: Formulaire (2/3) */}
          <div className="w-full lg:w-2/3 flex flex-col overflow-hidden z-10">
            {/* Navigation des sections - dans la colonne gauche */}
            <div className="flex flex-wrap gap-1 p-3 border-b border-border-main bg-bg-surface/50">
              {navTabs.map(section => {
                const isActive = activeSection === section.id
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveSection(section.id)}
                    className="gap-1.5"
                  >
                    <TabIcon iconKey={section.iconKey} className="h-4 w-4" />
                    <span>{section.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* Contenu de la section (scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderSection(activeSection)}
            </div>
          </div>

          {/* Colonne Droite: Preview (fixe 320px, lg seulement) - SIBLING FLEX */}
          {renderPreview()}
        </div>

        {/* Footer FIXE en bas */}
        <div className="flex items-center justify-between p-4 border-t border-border-main bg-bg-surface/50">
          <div className="flex items-center gap-2">
            <Badge variant="status" className={cn(
              isValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            )}>
              {isValid ? '✓ Valide' : '✗ Incomplet'}
            </Badge>
            {!isValid && form.errors && Object.keys(form.errors).length > 0 && (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div className="flex items-center gap-3">
            {initialCharacter && onDuplicate && (
              <Button variant="ghost" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" /> Dupliquer
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              <Save className="h-4 w-4 mr-2" />
              {initialCharacter ? 'Sauvegarder' : 'Créer'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
