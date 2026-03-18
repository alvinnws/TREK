import React, { createContext, useContext, useMemo } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import de from './translations/de'
import en from './translations/en'

const translations = { de, en }
const TranslationContext = createContext({ t: (k) => k, language: 'de', locale: 'de-DE' })

export function TranslationProvider({ children }) {
  const language = useSettingsStore(s => s.settings.language) || 'de'

  const value = useMemo(() => {
    const strings = translations[language] || translations.de
    const fallback = translations.de

    function t(key, params) {
      let val = strings[key] ?? fallback[key] ?? key
      // Arrays/Objects direkt zurückgeben (z.B. Vorschläge-Liste)
      if (typeof val !== 'string') return val
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
        })
      }
      return val
    }

    return { t, language, locale: language === 'en' ? 'en-US' : 'de-DE' }
  }, [language])

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  return useContext(TranslationContext)
}
