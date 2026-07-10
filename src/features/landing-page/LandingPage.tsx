import { HeroSection } from './components/HeroSection'
import { AnalyticsBadges } from './components/AnalyticsBadges'
import { ModuleGrid } from './components/ModuleGrid'
import { QuickResume } from './components/QuickResume'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <AnalyticsBadges />
      <ModuleGrid />
      <QuickResume />
    </>
  )
}