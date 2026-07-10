import { useState, useEffect, useCallback } from 'react'
import { CharacterList } from './components/CharacterList'
import { CharacterBuilderModal } from './components/builder/CharacterBuilderModal'
import { useCharacterForm } from './hooks/useCharacterForm'
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
    // Créer une copie temporaire pour la duplication
    const tempForm = useCharacterForm(character)
    await tempForm.duplicate()
    await loadCharacters()
  }

  const handleDeleteCharacter = async (character: PlayerCharacter) => {
    if (!confirm(`Supprimer "${character.character_name}" ? Cette action est irréversible.`)) return
    
    const tempForm = useCharacterForm(character)
    await tempForm.delete()
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
      />
    </div>
  )
}
