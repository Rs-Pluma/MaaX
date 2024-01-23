import type { SystemTheme, Theme } from '@type/misc'
import { defineStore } from 'pinia'

export interface ThemeState {
  theme: Theme
  systemTheme: SystemTheme
  themeColorOpacity: number
  bgFollowTheme: boolean
  acrylic: boolean
  bgLight: {
    url?: string
    opacity: number
  }
  bgDark: {
    url?: string
    opacity: number
  }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ThemeGetter = {
  currentTheme: () => SystemTheme
}

export interface ThemeAction {
  updateTheme: (theme: Theme) => void
  updateSystemTheme: (theme: SystemTheme) => void
  updateColorOpacity: (opacity: number) => void
  updateBgFollowTheme: (isFollow: boolean) => void
  updateAcrylic: (isAcrylic: boolean) => void
  updateBgLight: (bgLight: { url?: string; opacity: number }) => void
  updateBgDark: (bgDark: { url?: string; opacity: number }) => void
}

const useThemeStore = defineStore<'theme', ThemeState, ThemeGetter, ThemeAction>('theme', {
  state: () => {
    return {
      theme: 'maa-light',
      systemTheme: 'maa-light',
      themeColorOpacity: 1,
      bgFollowTheme: false,
      acrylic: false,
      bgLight: {
        url: undefined,
        opacity: 1,
      },
      bgDark: {
        url: undefined,
        opacity: 1,
      },
    }
  },
  getters: {
    currentTheme() {
      if (this.theme === 'system') {
        return this.systemTheme
      }
      return this.theme
    },
  },
  actions: {
    updateTheme(theme) {
      this.theme = theme
      window.main.AppearanceManager.themeUpdated(this.currentTheme === 'maa-dark')
    },
    updateSystemTheme(theme) {
      this.systemTheme = theme
      window.main.AppearanceManager.themeUpdated(this.currentTheme === 'maa-dark')
    },
    updateColorOpacity(opacity) {
      this.themeColorOpacity = opacity
    },
    updateBgFollowTheme(isFollow: boolean) {
      this.bgFollowTheme = isFollow
    },
    updateAcrylic(isAcrylic: boolean) {
      this.acrylic = isAcrylic
    },
    updateBgLight(bgLight: { url?: string; opacity: number }) {
      this.bgLight = bgLight
    },
    updateBgDark(bgDark: { url?: string; opacity: number }) {
      this.bgDark = bgDark
    },
  },
})

export default useThemeStore
