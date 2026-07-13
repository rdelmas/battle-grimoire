import { useState, useEffect, useCallback } from 'react'
import { CharacterList } from './components/CharacterList'
import { CharacterBuilderModal } from './components/builder/CharacterBuilderModal'
import type { PlayerCharacter } from './types/character'

export function PlayerCharacterPage() {
  const [characters, setCharacters] = useState<PlayerCharacter[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<PlayerCharacter | null>(null)

  // Charger les personnages au montage
  const loadCharacters = useCallback(async () => {
    try {
      const loaded = await window.api.storage.getCharacters()
      setCharacters(loaded as unknown as PlayerCharacter[])
    } catch (error) {
      console.error('Erreur chargement personnages:', error)
    }
  }, [])

  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  const handleNewCharacter = () => {
    setEditingCharacter(null)
    setIsModalOpen(true)
  }

  const handleEditCharacter = (character: PlayerCharacter) => {
    setEditingCharacter(character)
    setIsModalOpen(true)
  }

  const handleDuplicateCharacter = async (character: PlayerCharacter) => {
    // Dupliquer directement via l'API de stockage sans utiliser de hook
    const duplicated: PlayerCharacter = {
      ...character,
      id: crypto.randomUUID(),
      character_name: `${character.character_name} - Copie`,
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    await window.api.storage.put('characters', duplicated)
    await loadCharacters()
  }

  const handleDeleteCharacter = async (character: PlayerCharacter) => {
    if (!confirm(`Supprimer "${character.character_name}" ? Cette action est irréversible.`)) return
    
    await window.api.storage.delete('characters', character.id)
    await loadCharacters()
  }

  const handleSaved = async () => {
    await loadCharacters()
    setIsModalOpen(false)
    setEditingCharacter(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCharacter(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* CharacterList avec toutes les props */}
      <CharacterList
        characters={characters}
        onNew={handleNewCharacter}
        onEdit={handleEditCharacter}
        onDuplicate={handleDuplicateCharacter}
        onDelete={handleDeleteCharacter}
      />

      {/* Modal Builder */}
      <CharacterBuilderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialCharacter={editingCharacter ?? undefined}
        onSaved={handleSaved}
        onDuplicate={() => handleDuplicateCharacter(editingCharacter!)}
      />
    </div>
  )
}