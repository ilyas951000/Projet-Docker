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
                <NavItem title="Accueil" link="/dashboard/client" />
                
                {/* MENU DEROULANT POUR MES ANNONCES */}
                <NavItem
                  title="Les Annonces de livraison"
                  subLinks={[
                    { title: "Mes Annonces", link: "/dashboard/client/announcements" },
                    { title: "Le Suivi de mes livraisons", link: "/dashboard/client/suivi_livraison" },
                    { title: "Les annonces des autres...", link: "/dashboard/client/otherAnnouncements" },
                    { title: "Payer mes livraisons", link: "/dashboard/client/payementpackage" },
                  ]}
                  
                />
                <NavItem
                  title="Les Prestations"
                  subLinks={[
                    { title: "Mes Reservations", link: "/dashboard/client/MesReservations" },
                    { title: "Les Prestataires", link: "/dashboard/client/prestation" },
                  ]}
                  
                />

                <NavItem title="Les Boxes" link="/dashboard/client/boxes" />
                <NavItem title="Mes Messages" link="/dashboard/client/clientMessagesPage" />
                <NavItem
                  title="Les Payements"
                  subLinks={[
                    { title: "Mon Wallet", link: "/dashboard/client/wallet" },
                    { title: "Validation des payements", link: "/dashboard/client/historyannonce" },
                  ]}SSSS
                />
                <NavItem title="Abonnement" link="/dashboard/client/subscription" />
                <NavItem title="News" link="/dashboard/client/news" />
                <NavItem title="Profil / Compte" link="/dashboard/client/compte" />
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

function NavItem({
  title,
  link,
  subLinks,
}: {
  title: string
  link?: string
  subLinks?: { title: string; link: string }[]
}) {
  const [open, setOpen] = useState(false)

  if (subLinks && subLinks.length > 0) {
    return (
      <li>
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md"
        >
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <span>{open ? "▲" : "▼"}</span>
        </div>
        {open && (
          <ul className="ml-6 mt-1 space-y-2">
            {subLinks.map((subItem) => (
              <li key={subItem.link}>
                <Link
                  href={subItem.link}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-green-500"
                >
                  {subItem.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <Link
        href={link || "#"}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{title}</span>
      </Link>
    </li>
  )
}
