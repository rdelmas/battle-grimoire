import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingLayout } from './layouts/LandingLayout'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from '@/features/landing-page/LandingPage'
import { PlayerCharacterPage } from '@/features/player-character-builder/PlayerCharacterPage'
import { PlaceholderPage } from '@/shared/components/PlaceholderPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
        <Route path="/app/*" element={<AppLayout />}>
          <Route path="personnages" element={<PlayerCharacterPage />} />
          <Route path="bestiaire" element={<PlaceholderPage name="Bestiaire" />} />
          <Route path="rencontres" element={<PlaceholderPage name="Rencontres" />} />
          <Route path="combat-tracker" element={<PlaceholderPage name="Combat Tracker" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
