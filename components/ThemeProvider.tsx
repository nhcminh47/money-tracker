'use client'

import { applyTheme, getSettings } from '@/lib/services/settings'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme on mount
    async function initializeTheme() {
      try {
        const settings = await getSettings()
        applyTheme(settings.theme)
      } catch (error) {
        console.error('Failed to initialize theme:', error)
        // Fallback to auto theme
        applyTheme('auto')
      }
    }

    initializeTheme()

    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleThemeChange = async () => {
      const settings = await getSettings()
      if (settings.theme === 'auto') {
        applyTheme('auto')
      }
    }

    mediaQuery.addEventListener('change', handleThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [])

  return <>{children}</>
}
