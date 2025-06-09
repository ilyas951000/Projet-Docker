// app/dashboard/shopkeeper/ClientLayout.tsx
"use client"

import { LanguageProvider, useLang } from '../../context/LanguageContext'
import { useState } from "react"
import { Moon, Sun, Menu, X, PlusCircle, User, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Globe } from "lucide-react"


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LayoutContent>{children}</LayoutContent>
    </LanguageProvider>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 p-5
            flex flex-col justify-between transform transition-transform duration-300
            ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static
          `}
        >
          <div>
            <div className="flex justify-between items-center md:hidden mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EcoDeli</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="text-gray-700 dark:text-white" />
              </button>
            </div>

            <Link href="/dashboard/client" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold inline-block mb-4">
              <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
            </Link>

            <nav>
              <ul className="space-y-3">
                <NavItem title="Accueil" link="/dashboard/shopkeeper" />
                <NavItem title="Mes Annonces" link="/dashboard/shopkeeper/advertisement" />
                <NavItem title="Mon contrat" link="/dashboard/shopkeeper/contrat" />
                <NavItem title="Mes facturations" link="/dashboard/shopkeeper/facturation" />
                <NavItem title="Mes paiement" link="/dashboard/shopkeeper/paiement" />
                <NavItem title="Annonce des autres" link="/dashboard/shopkeeper/otherAnnouncements" />
                <NavItem title="message avec un livreur" link="/dashboard/shopkeeper/clientMessagesPage" />
                <NavItem title="mes gains" link="/dashboard/shopkeeper/earnings" />
                <NavItem title="historique de paiement" link="/dashboard/shopkeeper/historyannonce" />
                <NavItem title="mes paiements en cours" link="/dashboard/shopkeeper/payementpackage" />
                <NavItem title="News" link="/dashboard/shopkeeper/news" />
                <NavItem title="À propos" link="/a-propos" />
                <NavItem title="Nous contacter" link="/contact" />
              </ul>
            </nav>
          </div>

          <div className="flex items-center space-x-3 mt-10">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Mon compte</span>
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-300 cursor-pointer" />
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="ml-0 md:ml-64 flex-1 p-5 md:p-10 w-full">
          <div className="flex justify-between items-center md:hidden mb-5">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-900" />
              )}
            </button>
          </div>
          {children}
        </main>

        <button
          className="hidden md:block absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-900" />
          )}
        </button>
        <div className="hidden md:block absolute top-5 right-20">
  <div className="relative">
    <button
      onClick={() => setOpen(prev => !prev)}
      className="p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full"
      title="Choisir la langue"
    >
      <Globe className="w-5 h-5" />
    </button>

    {open && (
      <ul className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50">
        {['fr', 'en', 'es'].map((code) => (
          <li key={code}>
            <button
              onClick={() => {
                setLang(code);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {getLangLabel(code)}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>


      </div>
    </div>
  )
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li>
      <Link
        href={link}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{title}</span>
      </Link>
    </li>
  )
}

function getLangLabel(code: string) {
  switch (code) {
    case "fr": return "Français"
    case "en": return "English"
    case "es": return "Español"
    default: return code
  }
}
