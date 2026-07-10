import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base
        'bg-main': '#030712',
        'bg-surface': '#111827',
        'bg-card': '#0f172a',
        'border-main': '#1f2937',
        'border-hover': '#334155',
        'text-main': '#f3f4f6',
        'text-muted': '#9ca3af',
        'text-dark': '#52525b',
        
        // Accent Ambre/Or
        'amber-main': '#fbbf24',
        'amber-dark': '#f59e0b',
        'amber-glow': 'rgba(245, 158, 11, 0.15)',
        
        // Rarity System
        'rarity-common': '#9ca3af',
        'rarity-uncommon': '#22c55e',
        'rarity-rare': '#3b82f6',
        'rarity-very-rare': '#a855f7',
        'rarity-legendary': '#f97316',
        'rarity-artifact': '#eab308',
      },
      fontFamily: {
        serif: ['Cinzel', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
        'glow-amber-sm': '0 0 8px rgba(245, 158, 11, 0.2)',
      },
      backgroundImage: {
        'magic-glow': 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
export default config