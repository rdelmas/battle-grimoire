import { useState, useMemo } from 'react'
import { Search, Plus, User } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Badge } from '@/shared/components/ui/Badge'
import type { PlayerCharacter } from '../types/character'
import { CharacterRow } from './CharacterRow'

interface CharacterListProps {
  characters: PlayerCharacter[]
  onEdit: (character: PlayerCharacter) => void
  onDuplicate: (character: PlayerCharacter) => void
  onDelete: (character: PlayerCharacter) => void
  onNew: () => void
}

export function CharacterList({ characters, onEdit, onDuplicate, onDelete, onNew }: CharacterListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filtrer les personnages selon la recherche
  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return characters
    const query = searchQuery.toLowerCase()
    return characters.filter(
      c =>
        c.character_name.toLowerCase().includes(query) ||
        c.class_name.toLowerCase().includes(query) ||
        c.player_name.toLowerCase().includes(query) ||
        c.species.toLowerCase().includes(query)
    )
  }, [characters, searchQuery])

  // Trier les personnages par date de mise à jour (plus récent en premier)
  const sortedCharacters = useMemo(() => {
    return [...filteredCharacters].sort((a, b) => b.updated_at - a.updated_at)
  }, [filteredCharacters])

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-main font-serif">Personnages</h1>
          <p className="text-text-muted mt-1">
            Gérez les fiches techniques et l'arsenal de combat de vos héros
          </p>
        </div>
        <Button onClick={onNew} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nouveau Personnage
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dark" />
              <Input
                placeholder="Rechercher un personnage ou une classe..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
                iconLeft={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="status" size="sm">
                {characters.length} personnage{characters.length > 1 ? 's' : ''}
              </Badge>
              <Badge variant="status" size="sm">
                {filteredCharacters.length} résultat{filteredCharacters.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des personnages */}
      <div className="flex-1 overflow-y-auto">
        {sortedCharacters.length === 0 ? (
          /* État vide */
          <Card className="h-[300px] flex items-center justify-center">
            <CardContent className="text-center p-8">
              <User className="h-16 w-16 text-text-dark mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-main mb-2">Aucun personnage en bibliothèque</h3>
              <p className="text-text-muted mb-6">
                Ajoutez vos PJ pour pouvoir construire des rencontres équilibrées
              </p>
              <Button onClick={onNew} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Créer un personnage
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedCharacters.map(character => (
              <CharacterRow
                key={character.id}
                character={character}
                isExpanded={expandedId === character.id}
                onToggleExpand={() => toggleExpand(character.id)}
                onEdit={() => onEdit(character)}
                onDuplicate={() => onDuplicate(character)}
                onDelete={() => onDelete(character)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
