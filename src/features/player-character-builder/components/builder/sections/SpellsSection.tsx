import { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent, Input, Select, Button, Badge } from '@/shared/components/ui'
import { useCharacterForm } from '../../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../../hooks/useCharacterCalculations'
import type { PlayerCharacter, SpellcastingSource, PreparedSpell, SpellcastingAbility } from '../../../types/character'
import type { ItemSpellcastingInput } from '../../../utils/spellcasting'
import { 
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
} from '../../../utils/spellcasting'
import { SpellSelector } from '../SpellSelector'
import { Plus, Trash2, Sparkles, Target, Wand2, BookOpen } from 'lucide-react'
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
        primarySource.preparedSpells = character.prepared_spells
        sources.push(primarySource)
      }
    }
    
    sources.push(...(character.additional_spellcasting_sources ?? []))
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

  const handleAddPreparedSpellToSource = (sourceId: string) => {
    const newSpell: PreparedSpell = {
      name: '',
      level: 1,
      casting_time: 'Action',
      components: 'V, S',
      concentration: false,
      range: '9m',
      description: '',
      isFromSRD: false,
      srdId: undefined,
    }
    if (isPrimarySource(sourceId)) {
      form.setField('prepared_spells', [...(character.prepared_spells ?? []), newSpell])
      return
    }
    const updatedSources = (character.additional_spellcasting_sources ?? []).map(source => {
      if (source.id === sourceId) {
        return {
          ...source,
          preparedSpells: [...source.preparedSpells, newSpell]
        }
      }
      return source
    })
    form.setField('additional_spellcasting_sources', updatedSources)
  }

  const handleRemovePreparedSpellFromSource = (sourceId: string, spellIndex: number) => {
    if (isPrimarySource(sourceId)) {
      form.setField('prepared_spells', (character.prepared_spells ?? []).filter((_, i) => i !== spellIndex))
      return
    }
    const updatedSources = (character.additional_spellcasting_sources ?? []).map(source => {
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

  const handleUpdatePreparedSpellInSource = (sourceId: string, spellIndex: number, updatedSpell: PreparedSpell) => {
    if (isPrimarySource(sourceId)) {
      form.setField('prepared_spells', (character.prepared_spells ?? []).map((spell, i) => i === spellIndex ? updatedSpell : spell))
      return
    }
    const updatedSources = (character.additional_spellcasting_sources ?? []).map(source => {
      if (source.id === sourceId) {
        return {
          ...source,
          preparedSpells: source.preparedSpells.map((spell, i) => i === spellIndex ? updatedSpell : spell)
        }
      }
      return source
    })
    form.setField('additional_spellcasting_sources', updatedSources)
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
          const maxPrepared = getMaxPreparedSpellsForSource(source, character.abilities as unknown as Record<string, number>)
          const spellSaveDC = getSpellSaveDC(source, proficiencyBonus, character.abilities as unknown as Record<string, number>)
          const spellAttackBonus = getSpellAttackBonus(source, proficiencyBonus, character.abilities as unknown as Record<string, number>)

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
                    <span>Préparés max: <strong className="text-text-main">{maxPrepared}</strong></span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Cantrips connus</label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={source.cantripsKnown}
                      onChange={e => {
                        const updatedSources = [...allSources]
                        updatedSources[sourceIndex] = { ...source, cantripsKnown: parseInt(e.target.value) || 0 }
                        form.setField('additional_spellcasting_sources', updatedSources.filter(s => s.type !== 'class'))
                        if (source.type === 'class') {
                          form.setField('cantrips_known', parseInt(e.target.value) || 0)
                        }
                      }}
                      className="w-full max-w-[100px]"
                    />
                  </div>
                  {source.type !== 'class' && (
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1.5">Caractéristique d'incantation</label>
                      <Select
                        value={source.ability}
                        onChange={e => {
                          const updatedSources = [...allSources]
                          updatedSources[sourceIndex] = { ...source, ability: e.target.value as SpellcastingAbility }
                          form.setField('additional_spellcasting_sources', updatedSources.filter(s => s.type !== 'class'))
                        }}
                        className="w-full max-w-[150px]"
                      >
                        <option value="int">Intelligence</option>
                        <option value="wis">Sagesse</option>
                        <option value="cha">Charisme</option>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Sorts toujours préparés */}
                {source.alwaysPrepared && source.alwaysPrepared.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Sorts toujours préparés</label>
                    <div className="flex flex-wrap gap-2">
                      {source.alwaysPrepared.map((spell, i) => (
                        <Badge key={i} variant="status" className="bg-purple-500/10 text-purple-400">
                          {spell.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sorts préparés */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-text-muted">Sorts Préparés ({source.preparedSpells.length}/{maxPrepared})</label>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleAddPreparedSpellToSource(source.id)}
                      disabled={source.preparedSpells.length >= maxPrepared}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                  
                  {source.preparedSpells.length === 0 ? (
                    <p className="text-text-muted text-center py-4">Aucun sort préparé</p>
                  ) : (
                    <div className="space-y-3">
                      {source.preparedSpells.map((spell, spellIndex) => (
                        <div key={spellIndex} className="p-3 bg-bg-surface border border-border-main rounded-lg">
                          {/* Sélecteur de sort : gère les 2 modes (fiche SRD lecture seule / saisie custom) */}
                          <SpellSelector
                            spell={spell}
                            source={source}
                            characterClass={character.class_name ?? ''}
                            onChange={updatedSpell => handleUpdatePreparedSpellInSource(source.id, spellIndex, updatedSpell)}
                            onSwitchToCustom={() => {
                              handleUpdatePreparedSpellInSource(source.id, spellIndex, {
                                ...spell,
                                name: '',
                                level: spell.level,
                                casting_time: 'Action',
                                components: 'V, S',
                                concentration: false,
                                range: '9m',
                                description: '',
                                isFromSRD: false,
                                srdId: undefined,
                              })
                            }}
                          />

                          {/* Champs éditables uniquement pour les sorts personnalisés (non-SRD) */}
                          {!spell.isFromSRD && (
                            <>
                              {/* Ligne 2 : Niveau (1/3) + Temps (1/3) + Portée (1/3) */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-text-muted mb-1.5">Niveau</label>
                                  <Select
                                    value={spell.level}
                                    onChange={e => handleUpdatePreparedSpellInSource(source.id, spellIndex, { ...spell, level: parseInt(e.target.value) })}
                                    className="w-full"
                                  >
                                    {[0,1,2,3,4,5,6,7,8,9].map(l => (
                                      <option key={l} value={l}>{l === 0 ? 'Cantrip' : `Niveau ${l}`}</option>
                                    ))}
                                  </Select>
                                </div>
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-text-muted mb-1.5">Temps d'incantation</label>
                                  <Input
                                    value={spell.casting_time}
                                    onChange={e => handleUpdatePreparedSpellInSource(source.id, spellIndex, { ...spell, casting_time: e.target.value })}
                                    placeholder="Action"
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-text-muted mb-1.5">Portée</label>
                                  <Input
                                    value={spell.range}
                                    onChange={e => handleUpdatePreparedSpellInSource(source.id, spellIndex, { ...spell, range: e.target.value })}
                                    placeholder="9m"
                                  />
                                </div>
                              </div>

                              {/* Ligne 3 : Composantes (1/2) + Concentration (1/2) */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-text-muted mb-1.5">Composantes</label>
                                  <Input
                                    value={spell.components}
                                    onChange={e => handleUpdatePreparedSpellInSource(source.id, spellIndex, { ...spell, components: e.target.value })}
                                    placeholder="V, S"
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={spell.concentration}
                                      onChange={e => handleUpdatePreparedSpellInSource(source.id, spellIndex, { ...spell, concentration: e.target.checked })}
                                      className="h-4 w-4 rounded border-border-main text-amber-main focus:ring-amber-main mt-1.5"
                                    />
                                    <span className="text-sm font-medium text-text-muted">Concentration</span>
                                  </label>
                                </div>
                              </div>

                              {/* Ligne 4 : Description (pleine largeur) */}
                              <div className="w-full mt-3">
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Description</label>
                                <textarea
                                  value={spell.description ?? ''}
                                  onChange={e => handleUpdatePreparedSpellInSource(source.id, spellIndex, { ...spell, description: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-amber-main/50 focus:border-amber-main resize-none"
                                  placeholder="Description du sort..."
                                />
                              </div>

                              {/* Bouton supprimer (sorts custom : pas de bouton dans le sélecteur) */}
                              <div className="flex justify-end mt-3">
                                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleRemovePreparedSpellFromSource(source.id, spellIndex)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}

                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              {selectedRaceForSource && (
                <>
                  <Select
                    label="Cantrip racial"
                    value={selectedRaceCantrip}
                    onChange={e => setSelectedRaceCantrip(e.target.value)}
                  >
                    <option value="">— Choisir un cantrip —</option>
                    {RACE_SPELLCASTING_CONFIG[selectedRaceForSource as keyof typeof RACE_SPELLCASTING_CONFIG]?.cantrips.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </>
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
