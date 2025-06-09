// context/LanguageContext.tsx
"use client"
import React, { createContext, useState, useContext } from "react"
import fr from '../fr.json'
import en from '../en.json'
import es from '../es.json'

const translations = { fr, en, es };


interface LanguageContextType {
  lang: string
  setLang: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
export const availableLanguages = ['fr', 'en', 'es'] as const;
export type Lang = typeof availableLanguages[number];
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [lang, setLang] = useState<string>('fr')

  const t = (key: string) => translations[lang as 'fr' | 'en'][key] || key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLang must be used within a LanguageProvider")
  return context
}
