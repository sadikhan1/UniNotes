import { createContext, useContext, useState, useEffect } from 'react'
import { en } from '../locales/en'
import { tr } from '../locales/tr'

const LocaleContext = createContext()

const translations = { en, tr }

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export const LocaleProvider = ({ children }) => {
  // Get initial locale from localStorage or default to 'en'
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale')
    return saved && translations[saved] ? saved : 'en'
  })

  // Update document language attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('locale', locale)
  }, [locale])

  // Translation function
  const t = (key) => {
    const translation = translations[locale]?.[key]
    return translation || key // Fallback to key if translation not found
  }

  const value = {
    locale,
    setLocale,
    t,
    availableLocales: ['en', 'tr']
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}