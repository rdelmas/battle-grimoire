import { Card, CardHeader, CardContent, Input, Select, Button } from '@/shared/components/ui'
import { useCharacterForm } from '../../../hooks/useCharacterForm'
import { WEAPON_MASTERY_PROPERTIES, WEAPON_MASTERY_LABELS, WEAPON_LIST, type WeaponMasteryProperty } from '../../../types/character'
import { Star, Sword, Wrench, Plus, Trash2 } from 'lucide-react'

interface FeatsSectionProps {
  character: ReturnType<typeof useCharacterForm>['character']
  form: ReturnType<typeof useCharacterForm>
}

export function FeatsSection({ character, form }: FeatsSectionProps) {
  const originFeats = character.origin_feats ?? []

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
          {character.general_feats.length === 0 ? (
            <p className="text-text-muted text-center py-4">Aucun don général. Les dons sont obtenus aux niveaux 4, 8, 12, 16, 19.</p>
          ) : (
            character.general_feats.map((feat, index) => (
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
          {character.weapon_masteries.length === 0 ? (
            <p className="text-text-muted text-center py-4">
              Aucune maîtrise d'arme. Propriétés disponibles: Cleave, Graze, Nick, Push, Sap, Slow, Topple, Vex
            </p>
          ) : (
            character.weapon_masteries.map((wm, index) => (
              <div key={index} className="flex gap-3 p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
                <div className="flex-1">
                  <Select
                    label="Arme"
                    value={wm.weapon}
                    onChange={e => {
                      const updated = [...character.weapon_masteries]
                      updated[index] = { ...wm, weapon: e.target.value }
                      form.setField('weapon_masteries', updated)
                    }}
                  >
                    <option value="">— Sélectionner une arme —</option>
                    {WEAPON_LIST.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    label="Propriété"
                    value={wm.property}
                    onChange={e => {
                      const updated = [...character.weapon_masteries]
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
          <Button variant="secondary" size="sm" onClick={() => form.setField('tool_proficiencies', [...(character.tool_proficiencies ?? []), ''])}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {(!character.tool_proficiencies || character.tool_proficiencies.length === 0) ? (
            <p className="text-text-muted text-center py-4">Aucune maîtrise d'outil. Viennent de l'historique, de la classe ou des dons.</p>
          ) : (
            character.tool_proficiencies.map((tool, index) => (
              <div key={index} className="flex gap-3 p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
                <div className="flex-1">
                  <Input
                    label="Outil"
                    value={tool}
                    onChange={e => {
                      const updated = [...(character.tool_proficiencies ?? [])]
                      updated[index] = e.target.value
                      form.setField('tool_proficiencies', updated)
                    }}
                    placeholder="Ex: Outils de voleur, Kit d'herboristerie..."
                  />
                </div>
                <Button variant="ghost" size="sm" className="text-red-400 mt-8" onClick={() => {
                  const updated = [...(character.tool_proficiencies ?? [])]
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