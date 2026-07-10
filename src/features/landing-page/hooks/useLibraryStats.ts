import { useState, useEffect } from 'react'
import type { LibraryStats } from '../types/landing'

export function useLibraryStats() {
  const [stats, setStats] = useState<LibraryStats>({
    totalPCs: 0,
    totalMonsters: 0,
    totalEncounters: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        if (typeof window !== 'undefined' && window.api?.storage?.getLibraryStats) {
          const data = await window.api.storage.getLibraryStats()
          setStats(data)
        } else {
          // Fallback for development without Electron
          setStats({ totalPCs: 0, totalMonsters: 0, totalEncounters: 0 })
        }
        setError(null)
      } catch (err) {
        setError('Impossible de charger les statistiques')
        console.error('Error fetching library stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}