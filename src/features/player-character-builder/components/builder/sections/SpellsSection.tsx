import { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent, Input, Select, Button, Badge } from '@/shared/components/ui'
import { useCharacterForm } from '../../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../../hooks/useCharacterCalculations'
import type { PlayerCharacter, SpellcastingSource, PreparedSpell, SpellcastingAbility, SpellcastingMechanic } from '../../../types/character'
import type { ItemSpellcastingInput } from '../../../utils/spellcasting'
import {
  createPrimarySpellcastingSource,
  createFeatSpellcastingSource,
  createRaceSpellcastingSource,
  createItemSpellcastingSource,
  combineSpellSlots,
  getSpellSaveDC,
  getSpellAttackBonus,
  getMaxPreparedForSource,
  SPELLCASTING_FEATS,
  RACE_SPELLCASTING_CONFIG,
  type SpellcastingFeatConfig,
} from '../../../utils/spellcasting'
import { SRD2024_SPELLS } from '@/shared/data/srd2024-spells'
import { SpellSelector } from '../SpellSelector'
import { Plus, Trash2, Sparkles, Target, Wand2, BookOpen, Lock } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface SpellsSectionProps {
  character: PlayerCharacter
  form: ReturnType<typeof useCharacterForm>
  calculations: ReturnType<typeof useCharacterCalculations>
}

export function SpellsSection({ character, form, calculations }: SpellsSectionProps) {
  const isSpellcaster = character.spellcasting_ability !== 'none'
  const proficiencyBonus = calculations.abilities.proficiencyBonus

  // États locaux pour les modaux
  const [showAddSourceModal, setShowAddSourceModal] = useState(false)
  const [selectedFeatForSource, setSelectedFeatForSource] = useState<SpellcastingFeatConfig | null>(null)
  const [selectedFeatAbility, setSelectedFeatAbility] = useState<SpellcastingAbility>('int')

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

  // Sources d'incantation : principale + additionnelles
  const allSources = useMemo((): SpellcastingSource[] => {
    const sources: SpellcastingSource[] = []

    if (isSpellcaster && character.class_name) {
      const primarySource = createPrimarySpellcastingSource(
        character.class_name,
        character.level
      )
      if (primarySource) {
        // Fusionner avec les données existantes du personnage
        const existingPrimary = character.additional_spellcasting_sources?.find(s => s.id === primarySource.id)
        if (existingPrimary) {
          // Recalculer les champs de configuration (niveau, cantrips, max préparés, mécanique)
          // à partir de la classe + niveau courant, et ne conserver que les listes de sorts
          // gérées par l'utilisateur (sinon les valeurs figées à la sauvegarde restent obsolètes).
          sources.push({
            ...primarySource,
            preparedSpells: existingPrimary.preparedSpells ?? character.prepared_spells,
            knownCantrips: existingPrimary.knownCantrips ?? [],
            spellbook: existingPrimary.spellbook ?? [],
            knownSpells: existingPrimary.knownSpells ?? [],
            alwaysPrepared: existingPrimary.alwaysPrepared ?? [],
            grantedSpells: existingPrimary.grantedSpells ?? [],
          })
        } else {
          primarySource.preparedSpells = character.prepared_spells
          sources.push(primarySource)
        }
      }
    }

    sources.push(...(character.additional_spellcasting_sources ?? []).filter(s => s.id !== `class-${character.class_name?.toLowerCase()}`))
    return sources
  }, [character, isSpellcaster])

  // Calculer les slots combinés
  const combinedSlots = useMemo(() => combineSpellSlots(allSources), [allSources])

  const handleAddFeatSource = () => {
    if (selectedFeatForSource && selectedFeatAbility) {
      const newSource = createFeatSpellcastingSource(
        selectedFeatForSource.id,
        selectedFeatAbility
      )
      if (newSource) {
        form.setField('additional_spellcasting_sources', [...(character.additional_spellcasting_sources ?? []), newSource])
      }
    }
    setShowAddSourceModal(false)
    setSelectedFeatForSource(null)
  }

  const handleAddRaceSource = () => {
    if (selectedRaceForSource) {
      const newSource = createRaceSpellcastingSource(
        selectedRaceForSource,
        selectedRaceCantrip
      )
      if (newSource) {
        form.setField('additional_spellcasting_sources', [...(character.additional_spellcasting_sources ?? []), newSource])
      }
    }
    setShowAddRaceSourceModal(false)
    setSelectedRaceForSource('')
    setSelectedRaceCantrip('')
  }

  const handleAddItemSource = () => {
    if (itemSourceForm.name) {
      const newSource = createItemSpellcastingSource(itemSourceForm)
      if (newSource) {
        form.setField('additional_spellcasting_sources', [...(character.additional_spellcasting_sources ?? []), newSource])
      }
    }
    setShowAddItemSourceModal(false)
    setItemSourceForm({
      name: '',
      ability: 'int',
      cantripsKnown: 0,
      preparedSpells: [],
      alwaysPrepared: [],
      charges: 1,
      rechargeType: 'long',
      spellcastingLevel: 1,
    })
  }

  const handleRemoveSource = (sourceId: string) => {
    form.setField('additional_spellcasting_sources', (character.additional_spellcasting_sources ?? []).filter(s => s.id !== sourceId))
  }

  // Détecte si la source est la source principale de classe (type 'class' à l'index 0)
  const isPrimarySource = (sourceId: string): boolean => {
    const sourceIndex = allSources.findIndex(s => s.id === sourceId)
    return sourceIndex === 0 && allSources[sourceIndex]?.type === 'class'
  }

  // --- Helpers pour manipuler les sources ---

  const updateSource = (sourceId: string, updater: (s: SpellcastingSource) => SpellcastingSource) => {
    if (isPrimarySource(sourceId)) {
      // Source principale : on stocke dans additional_spellcasting_sources
      const existing = character.additional_spellcasting_sources ?? []
      const idx = existing.findIndex(s => s.id === sourceId)
      if (idx >= 0) {
        const updated = [...existing]
        updated[idx] = updater(existing[idx])
        form.setField('additional_spellcasting_sources', updated)
      } else {
        const primarySource = allSources.find(s => s.id === sourceId)
        if (primarySource) {
          form.setField('additional_spellcasting_sources', [...existing, updater(primarySource)])
        }
      }
    } else {
      const updated = (character.additional_spellcasting_sources ?? []).map(s => s.id === sourceId ? updater(s) : s)
      form.setField('additional_spellcasting_sources', updated)
    }
  }

  // Empêche l'ajout d'un sort déjà présent (même nom, insensible à la casse)
  const hasSpell = (list: PreparedSpell[] | undefined, name: string): boolean =>
    (list ?? []).some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase())

  // --- Cantrips ---
  const handleAddCantrip = (sourceId: string, spell: PreparedSpell) => {
    if (hasSpell(character.additional_spellcasting_sources?.find(s => s.id === sourceId)?.knownCantrips, spell.name)) return
    updateSource(sourceId, s => ({ ...s, knownCantrips: [...(s.knownCantrips ?? []), spell] }))
  }
  const handleRemoveCantrip = (sourceId: string, index: number) => {
    updateSource(sourceId, s => ({ ...s, knownCantrips: (s.knownCantrips ?? []).filter((_, i) => i !== index) }))
  }

  // --- Wizard Grimoire ---
  const handleAddToSpellbook = (sourceId: string, spell: PreparedSpell) => {
    if (hasSpell(character.additional_spellcasting_sources?.find(s => s.id === sourceId)?.spellbook, spell.name)) return
    updateSource(sourceId, s => ({ ...s, spellbook: [...(s.spellbook ?? []), spell] }))
  }
  const handleRemoveFromSpellbook = (sourceId: string, index: number) => {
    updateSource(sourceId, s => {
      const book = s.spellbook ?? []
      const removed = book[index]
      return {
        ...s,
        spellbook: book.filter((_, i) => i !== index),
        // Retirer aussi des préparés si coché
        preparedSpells: s.preparedSpells.filter(p => p.name !== removed?.name),
      }
    })
  }

  // --- Toggle prepared (Wizard) ---
  const handleTogglePrepared = (sourceId: string, spell: PreparedSpell, isPrepared: boolean) => {
    updateSource(sourceId, s => {
      if (isPrepared) {
        return { ...s, preparedSpells: [...s.preparedSpells, spell] }
      } else {
        return { ...s, preparedSpells: s.preparedSpells.filter(p => p.name !== spell.name) }
      }
    })
  }

  // --- Known spells (Bard/Sorcerer/Warlock) ---
  const handleAddKnownSpell = (sourceId: string, spell: PreparedSpell) => {
    if (hasSpell(character.additional_spellcasting_sources?.find(s => s.id === sourceId)?.knownSpells, spell.name)) return
    updateSource(sourceId, s => ({ ...s, knownSpells: [...(s.knownSpells ?? []), spell] }))
  }
  const handleRemoveKnownSpell = (sourceId: string, index: number) => {
    updateSource(sourceId, s => ({ ...s, knownSpells: (s.knownSpells ?? []).filter((_, i) => i !== index) }))
  }

  // --- Prepared from class list (Cleric/Druid/Paladin/Ranger) ---
  const handleAddPreparedSpell = (sourceId: string, spell: PreparedSpell) => {
    if (hasSpell(character.additional_spellcasting_sources?.find(s => s.id === sourceId)?.preparedSpells, spell.name)) return
    updateSource(sourceId, s => ({ ...s, preparedSpells: [...s.preparedSpells, spell] }))
  }
  const handleRemovePreparedSpell = (sourceId: string, index: number) => {
    updateSource(sourceId, s => ({ ...s, preparedSpells: s.preparedSpells.filter((_, i) => i !== index) }))
  }

  if (!isSpellcaster) {
    return (
      <div className="space-y-6">
        <Card className="bg-amber-main/5 border-amber-main/20">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-amber-main/50 mx-auto mb-4" />
            <h4 className="font-semibold text-text-main mb-2">Pas de capacité d'incantation</h4>
            <p className="text-text-muted">
              Ce personnage n'a pas de capacité d'incantation configurée.
              Sélectionnez une classe lanceuse de sorts dans l'onglet Identité.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Résumé des slots de sorts combinés */}
      <Card className="bg-amber-main/5 border-amber-main/20">
        <CardHeader className="pb-2">
          <h4 className="font-semibold text-text-main flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-main" />
            Slots de Sorts (Combinés toutes sources)
          </h4>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(combinedSlots).map(([level, slotConfig]) => (
              <Badge key={level} variant="difficulty" className="text-sm px-3 py-1.5">
                Niv {level}: {slotConfig.max}
              </Badge>
            ))}
            {Object.keys(combinedSlots).length === 0 && (
              <span className="text-text-muted text-sm">Aucun slot de sort</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sources d'incantation */}
      <div className="space-y-4">
        {allSources.map((source, sourceIndex) => {
          const isPrimary = sourceIndex === 0 && source.type === 'class'
          const maxPrepared = getMaxPreparedForSource(source)
          const spellSaveDC = getSpellSaveDC(source, proficiencyBonus, character.abilities as unknown as Record<string, number>)
          const spellAttackBonus = getSpellAttackBonus(source, proficiencyBonus, character.abilities as unknown as Record<string, number>)
          const mechanic: SpellcastingMechanic = source.mechanic

          return (
            <Card key={source.id} className={cn(
              isPrimary && 'border-amber-main/30 bg-amber-main/5'
            )}>
              <CardHeader className="pb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-text-main flex items-center gap-2">
                    {source.type === 'class' && <BookOpen className="h-5 w-5 text-amber-main" />}
                    {source.type === 'feat' && <Sparkles className="h-5 w-5 text-purple-500" />}
                    {source.type === 'race' && <Target className="h-5 w-5 text-green-500" />}
                    {source.type === 'item' && <Wand2 className="h-5 w-5 text-blue-500" />}
                    <span>{source.name}</span>
                    {isPrimary && <Badge variant="difficulty" className="text-xs">Principale</Badge>}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span>DD Sorts: <strong className="text-text-main">{spellSaveDC}</strong></span>
                    <span>Attaque: <strong className="text-text-main">+{spellAttackBonus}</strong></span>
                  </div>
                </div>
                {!isPrimary && (
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleRemoveSource(source.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Cantrips connus */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-text-muted">
                      Cantrips ({source.knownCantrips?.length ?? 0}/{source.cantripsKnown})
                    </label>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={(source.knownCantrips?.length ?? 0) >= source.cantripsKnown}
                      onClick={() => handleAddCantrip(source.id, { name: '', level: 0, casting_time: 'Action', components: 'V, S', concentration: false, range: '9m', description: '', isFromSRD: false, srdId: undefined })}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Ajouter cantrip
                    </Button>
                  </div>
                  {(source.knownCantrips ?? []).length === 0 ? (
                    <p className="text-text-muted text-center py-2 text-sm">Aucun cantrip</p>
                  ) : (
                    <div className="space-y-2">
                      {(source.knownCantrips ?? []).map((spell, i) => (
                        <div key={i} className="p-2.5 bg-bg-surface border border-border-main rounded-lg flex items-center justify-between">
                          <SpellSelector
                            spell={spell}
                            source={source}
                            characterClass={character.class_name ?? ''}
                            cantripOnly
                            onChange={updated => updateSource(source.id, s => ({ ...s, knownCantrips: (s.knownCantrips ?? []).map((sp, idx) => idx === i ? updated : sp) }))}
                            onSwitchToCustom={() => {}}
                          />
                          <Button variant="ghost" size="sm" className="text-red-400 ml-2" onClick={() => handleRemoveCantrip(source.id, i)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Couche 2 : Sorts toujours préparés (verrouillés) */}
                {source.alwaysPrepared && source.alwaysPrepared.length > 0 && (
                  <div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Sorts toujours préparés (verrouillés, ne comptent pas)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {source.alwaysPrepared.map((spell, i) => (
                        <Badge key={i} variant="status" className="bg-purple-500/10 text-purple-400">
                          <Lock className="h-3 w-3 mr-1" /> {spell.name} (Niv.{spell.level})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variant A : Wizard (spellbook) */}
                {mechanic === 'prepare-from-spellbook' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-muted">
                        Grimoire ({source.spellbook?.length ?? 0} sorts) — Préparés: {source.preparedSpells.length}/{maxPrepared}
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddToSpellbook(source.id, { name: '', level: 1, casting_time: 'Action', components: 'V, S', concentration: false, range: '9m', description: '', isFromSRD: false, srdId: undefined })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter au grimoire
                      </Button>
                    </div>
                    {(source.spellbook ?? []).length === 0 ? (
                      <p className="text-text-muted text-center py-4">Grimoire vide</p>
                    ) : (
                      <div className="space-y-2">
                        {(source.spellbook ?? []).map((spell, i) => {
                          const isPrepared = source.preparedSpells.some(p => p.name === spell.name)
                          const canCheck = isPrepared || source.preparedSpells.length < maxPrepared
                          return (
                            <div key={i} className="p-3 bg-bg-surface border border-border-main rounded-lg">
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isPrepared}
                                    disabled={!canCheck}
                                    onChange={e => handleTogglePrepared(source.id, spell, e.target.checked)}
                                    className="h-4 w-4 rounded border-border-main text-amber-main focus:ring-amber-main"
                                  />
                                  <span className={cn(
                                    'text-xs font-medium',
                                    isPrepared ? 'text-amber-main' : 'text-text-muted'
                                  )}>
                                    Préparé
                                  </span>
                                </label>
                                <div className="flex-1">
                                  <SpellSelector
                                    spell={spell}
                                    source={source}
                                    characterClass={character.class_name ?? ''}
                                    onChange={updated => updateSource(source.id, s => ({ ...s, spellbook: (s.spellbook ?? []).map((sp, idx) => idx === i ? updated : sp) }))}
                                    onSwitchToCustom={() => {}}
                                  />
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleRemoveFromSpellbook(source.id, i)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Variant B : prepare-from-class-list (Cleric/Druid/Paladin/Ranger) */}
                {mechanic === 'prepare-from-class-list' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-muted">
                        Sorts préparés aujourd'hui ({source.preparedSpells.length}/{maxPrepared})
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={source.preparedSpells.length >= maxPrepared}
                        onClick={() => handleAddPreparedSpell(source.id, { name: '', level: 1, casting_time: 'Action', components: 'V, S', concentration: false, range: '9m', description: '', isFromSRD: false, srdId: undefined })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Préparer un sort
                      </Button>
                    </div>
                    <p className="text-xs text-text-muted mb-2">⚠️ 1 seul échange de sort par Repos Long</p>
                    {source.preparedSpells.length === 0 ? (
                      <p className="text-text-muted text-center py-4">Aucun sort préparé</p>
                    ) : (
                      <div className="space-y-2">
                        {source.preparedSpells.map((spell, i) => (
                          <div key={i} className="p-3 bg-bg-surface border border-border-main rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <SpellSelector
                                  spell={spell}
                                  source={source}
                                  characterClass={character.class_name ?? ''}
                                  onChange={updated => updateSource(source.id, s => ({ ...s, preparedSpells: s.preparedSpells.map((sp, idx) => idx === i ? updated : sp) }))}
                                  onSwitchToCustom={() => {}}
                                />
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleRemovePreparedSpell(source.id, i)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Variant C : prepared-spells-fixed (Bard/Sorcerer/Warlock) */}
                {mechanic === 'prepared-spells-fixed' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-muted">
                        Sorts connus ({(source.knownSpells ?? []).length}/{maxPrepared})
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={(source.knownSpells ?? []).length >= maxPrepared}
                        onClick={() => handleAddKnownSpell(source.id, { name: '', level: 1, casting_time: 'Action', components: 'V, S', concentration: false, range: '9m', description: '', isFromSRD: false, srdId: undefined })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Apprendre un sort
                      </Button>
                    </div>
                    <p className="text-xs text-text-muted mb-2">⚠️ Modification uniquement au Level Up</p>
                    {(source.knownSpells ?? []).length === 0 ? (
                      <p className="text-text-muted text-center py-4">Aucun sort connu</p>
                    ) : (
                      <div className="space-y-2">
                        {(source.knownSpells ?? []).map((spell, i) => (
                          <div key={i} className="p-3 bg-bg-surface border border-border-main rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <SpellSelector
                                  spell={spell}
                                  source={source}
                                  characterClass={character.class_name ?? ''}
                                  onChange={updated => updateSource(source.id, s => ({ ...s, knownSpells: (s.knownSpells ?? []).map((sp, idx) => idx === i ? updated : sp) }))}
                                  onSwitchToCustom={() => {}}
                                />
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleRemoveKnownSpell(source.id, i)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Boutons pour ajouter des sources additionnelles */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border-main">
        <Button variant="ghost" onClick={() => setShowAddSourceModal(true)}>
          <Sparkles className="h-4 w-4 mr-2" /> Ajouter source (Don)
        </Button>
        <Button variant="ghost" onClick={() => setShowAddRaceSourceModal(true)}>
          <Target className="h-4 w-4 mr-2" /> Ajouter source (Race)
        </Button>
        <Button variant="ghost" onClick={() => setShowAddItemSourceModal(true)}>
          <Wand2 className="h-4 w-4 mr-2" /> Ajouter source (Objet)
        </Button>
      </div>

      {/* Modal: Ajouter source depuis un Don */}
      {showAddSourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="font-semibold text-text-main">Ajouter une source d'incantation (Don)</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Don d'incantation"
                value={selectedFeatForSource?.id ?? ''}
                onChange={e => {
                  const feat = SPELLCASTING_FEATS.find(f => f.id === e.target.value)
                  setSelectedFeatForSource(feat ?? null)
                }}
              >
                <option value="">— Choisir un don —</option>
                {SPELLCASTING_FEATS.map(feat => (
                  <option key={feat.id} value={feat.id}>{feat.name}</option>
                ))}
              </Select>
              <Select
                label="Caractéristique d'incantation"
                value={selectedFeatAbility}
                onChange={e => setSelectedFeatAbility(e.target.value as SpellcastingAbility)}
              >
                <option value="int">Intelligence</option>
                <option value="wis">Sagesse</option>
                <option value="cha">Charisme</option>
              </Select>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddSourceModal(false)}>Annuler</Button>
                <Button onClick={handleAddFeatSource} disabled={!selectedFeatForSource}>Ajouter</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Ajouter source depuis une Race */}
      {showAddRaceSourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="font-semibold text-text-main">Ajouter une source d'incantation (Race)</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Race avec incantation innée"
                value={selectedRaceForSource}
                onChange={e => setSelectedRaceForSource(e.target.value)}
              >
                <option value="">— Choisir une race —</option>
                {Object.entries(RACE_SPELLCASTING_CONFIG).map(([raceId]) => (
                  <option key={raceId} value={raceId}>{raceId.charAt(0).toUpperCase() + raceId.slice(1).replace('-', ' ')}</option>
                ))}
              </Select>
              {selectedRaceForSource && RACE_SPELLCASTING_CONFIG[selectedRaceForSource as keyof typeof RACE_SPELLCASTING_CONFIG]?.cantripChoice === 'sorcerer' && (
                <Select
                  label="Cantrip racial (liste Sorcier)"
                  value={selectedRaceCantrip}
                  onChange={e => setSelectedRaceCantrip(e.target.value)}
                >
                  <option value="">— Choisir un cantrip —</option>
                  {SRD2024_SPELLS.filter(s => s.level === 0).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </Select>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddRaceSourceModal(false)}>Annuler</Button>
                <Button onClick={handleAddRaceSource} disabled={!selectedRaceForSource}>Ajouter</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Ajouter source depuis un Objet */}
      {showAddItemSourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <h3 className="font-semibold text-text-main">Ajouter une source d'incantation (Objet Magique)</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nom de l'objet"
                value={itemSourceForm.name}
                onChange={e => setItemSourceForm({ ...itemSourceForm, name: e.target.value })}
                placeholder="Ex: Bâton de feu"
              />
              <Select
                label="Caractéristique d'incantation"
                value={itemSourceForm.ability}
                onChange={e => setItemSourceForm({ ...itemSourceForm, ability: e.target.value as SpellcastingAbility })}
              >
                <option value="int">Intelligence</option>
                <option value="wis">Sagesse</option>
                <option value="cha">Charisme</option>
              </Select>
              <Input
                label="Niveau d'incantation de l'objet"
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
              <Select
                label="Recharge"
                value={itemSourceForm.rechargeType}
                onChange={e => setItemSourceForm({ ...itemSourceForm, rechargeType: e.target.value as 'long' | 'short' | 'dawn' | 'none' })}
              >
                <option value="long">Repos long</option>
                <option value="short">Repos court</option>
                <option value="dawn">Aube</option>
                <option value="none">Aucune</option>
              </Select>
              <Input
                label="Charges max"
                type="number"
                min={1}
                max={20}
                value={itemSourceForm.charges}
                onChange={e => setItemSourceForm({ ...itemSourceForm, charges: parseInt(e.target.value) || 1 })}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddItemSourceModal(false)}>Annuler</Button>
                <Button onClick={handleAddItemSource} disabled={!itemSourceForm.name}>Ajouter</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}