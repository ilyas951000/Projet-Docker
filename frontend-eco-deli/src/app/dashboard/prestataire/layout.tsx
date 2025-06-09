"use client"

import { useState } from "react"
import { Moon, Sun, Menu, X, PlusCircle, User, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
            flex-col justify-between transform transition-transform duration-300
            ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:flex
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
                <NavItem title="Accueil" link="./" />
                <NavItem title="Mes Avis" link="/dashboard/prestataire/avis" />
                <NavItem title="Les Demandes de Prestations" link="/dashboard/prestataire/MesDemandes" />
                <NavItem title="Modifier Mes Prestations" link="/dashboard/prestataire/modif-prestation" />
                <NavItem title="Mes disponibilités" link="/dashboard/prestataire/planning" />
                <NavItem title="Wallet-facture" link="/dashboard/prestataire/wallet" />
                <NavItem title="Les Messages" link="/dashboard/prestataire/prestataireMessagesPage" />
                <NavItem title="Profil / Compte" link="/dashboard/prestataire/compte" />
              </ul>

              <div className="mt-10 space-y-3">
                <NavItem title="News" link="/dashboard/prestataire/news" />
                <NavItem title="À propos" link="/a-propos" />
                <NavItem title="Nous contacter" link="/contact" />
              </div>
            </nav>
          </div>

          <div className="flex items-center space-x-3 mt-10">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Mon compte</span>
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-300 cursor-pointer" />
          </div>
        </aside>

        <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
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
      </div>
    </div>
  )
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  )
}
