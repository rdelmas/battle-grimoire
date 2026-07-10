import { Edit, Copy, Trash2, ChevronDown, ChevronUp, Sword, Shield, Heart, Zap, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import type { PlayerCharacter } from '../types/character'
import { CharacterPreview } from './CharacterPreview'
import { useCharacterCalculations } from '../hooks/useCharacterCalculations'


interface CharacterRowProps {
  character: PlayerCharacter
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function CharacterRow({
  character,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDuplicate,
  onDelete,
}: CharacterRowProps) {
  const calculations = useCharacterCalculations(character)
  const initiative = calculations.initiative.initiative
  const passivePerception = calculations.skills.passivePerception

  const initiativeSign = initiative >= 0 ? '+' : ''

  return (
    <Card hover className="overflow-hidden">
      {/* Ligne principale du personnage */}
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Section Gauche : Infos principales */}
          <div className="flex-1 min-w-0 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-main/10 flex items-center justify-center">
                <Sword className="h-6 w-6 text-amber-main" />
              </div>
              <div>
                <h3 className="font-semibold text-text-main truncate">{character.character_name}</h3>
                <p className="text-sm text-text-muted">
                  {character.species} {character.class_name}
                  {character.subclass_name && ` (${character.subclass_name})`}
                  {' '}
                  <span className="text-text-dark">•</span> Joueur: {character.player_name}
                </p>
              </div>
            </div>

            {/* Badges niveau et classe */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="difficulty" size="sm">
                Niv. {character.level}
              </Badge>
              <Badge variant="rarity" size="sm" rarity={character.level >= 17 ? 'legendary' : character.level >= 11 ? 'very-rare' : character.level >= 5 ? 'rare' : 'uncommon'}>
                {character.class_name}
              </Badge>
            </div>
          </div>

          {/* Section Droite : Stats rapides + Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            {/* Vitals rapides */}
            <div className="flex items-center gap-4 text-sm hidden sm:flex">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium text-text-main">{character.hit_points_max}</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-text-main">{character.armor_class}</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-text-main">{initiativeSign}{initiative}</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-text-main">PP {passivePerception}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Button variant="ghost" size="sm" onClick={onEdit} title="Éditer">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDuplicate} title="Dupliquer">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} title="Supprimer" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                title={isExpanded ? 'Réduire' : 'Développer'}
                className="text-text-muted hover:text-amber-main"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Panneau développé : Fiche tactique complète */}
      {isExpanded && (
        <div className="border-t border-border-main bg-bg-surface/50 animate-slide-down">
          <CardContent className="p-6">
            <CharacterPreview character={character} />
          </CardContent>
        </div>
      )}
    </Card>
  )
}