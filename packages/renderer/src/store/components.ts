import type { ComponentStatus, ComponentType } from '@type/componentManager'
import type { InstallerStatus } from '@type/misc'
import { defineStore } from 'pinia'

export type ComponentStoreState = {
  [K in ComponentType]: {
    componentStatus: ComponentStatus
    installerStatus: InstallerStatus
    installerProgress: number
    installMirror: string
  }
}

export interface ComponentStoreAction {
  updateComponentStatus: (
    component: ComponentType,
    status: Partial<{
      componentStatus: ComponentStatus
      installerStatus: InstallerStatus
      installerProgress: number
    }>
  ) => void
}

const useComponentStore = defineStore<'component', ComponentStoreState, {}, ComponentStoreAction>(
  'component',
  {
    state: () => {
      return {
        'Maa Core': {
          componentStatus: 'not-installed',
          installerStatus: 'pending',
          installerProgress: 0,
          installMirror: 'GitHub',
        },
        'Android Platform Tools': {
          componentStatus: 'not-installed',
          installerStatus: 'pending',
          installerProgress: 0,
          installMirror: 'Google',
        },
        'Maa App': {
          componentStatus: 'not-installed',
          installerStatus: 'pending',
          installerProgress: 0,
          installMirror: 'GitHub',
        },
      }
    },
    actions: {
      updateComponentStatus(component, status) {
        if (status?.componentStatus === 'installed') {
          status = {
            ...status,
            installerStatus: 'done',
          }
        }
        this[component] = { ...this[component], ...status }
      },
    },
  }
)

export default useComponentStore
