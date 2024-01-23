/* eslint-disable import/no-duplicates */
import type { BooleanDisplayOption } from '@type/i18n/boolean'
import type { I18nKey } from '@type/i18n/utils'
import type { GetFnRemoveFirstParams } from '@type/utils'
import { dateZhCN as NDateZhCN, zhCN as NZhCN } from 'naive-ui'
import { dateEnUS as NDateEnUS, enUS as NEnUS } from 'naive-ui'
import { createI18n, useI18n as useNativeI18n } from 'vue-i18n'

import EnUS from './enUS.json'
import ZhCN from './zhCN.json'

export const naiveUiLocale = {
  NZhCN,
  NDateZhCN,
  NEnUS,
  NDateEnUS,
}

export const appLocale = {
  ZhCN,
  EnUS,
}

export const i18n = createI18n({
  legacy: false, // must set to `false`
  locale: 'EnUS',
  messages: appLocale,
})

/**
 * 添加了键名检查的 `useI18n`
 */
export const useI18n = () => {
  const { t: _t, ...rest } = useNativeI18n()
  const t = (key: I18nKey, ...rest: GetFnRemoveFirstParams<typeof _t>) => _t(key, ...rest)
  return { t, ...rest }
}

export const showBoolean = (value: boolean, option: BooleanDisplayOption = 'Yes/No'): string => {
  switch (option) {
    case 'Right/Wrong':
      return value ? i18n.global.t('Common.Boolean.Right') : i18n.global.t('Common.Boolean.Wrong')
    case 'Yes/No':
      return value ? i18n.global.t('Common.Boolean.Yes') : i18n.global.t('Common.Boolean.No')
  }
}
