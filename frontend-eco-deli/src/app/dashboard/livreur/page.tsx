"use client"

import { useState, useEffect } from "react"
import type { NextPage } from "next"
import Link from "next/link"
import axios from "axios"
import { Moon, Sun, Settings, PlusCircle, User, Menu, X, Bell } from "lucide-react"
import Image from "next/image"

type UserData = {
  userId: number
  userStatus: string
  occasionalCourier: boolean
}

interface IPackage {
  id: number
  packageName: string
  distanceFromStart?: number
  distanceToEnd?: number
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const AdminConnexion: NextPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [packagesOnRoute, setPackagesOnRoute] = useState<number>(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    console.log("Token récupéré:", token)

    const fetchUserData = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await axios.get("http://127.0.0.1:3001/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Données utilisateur:", res.data)

        const data = res.data
        const formattedData: UserData = {
          ...data,
          occasionalCourier: Boolean(data.occasionalCourier),
        }

        setUserData(formattedData)
      } catch (err) {
        console.error("Erreur lors de la récupération des infos utilisateur", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Fonction pour récupérer les colis sur le trajet
  const fetchPackagesOnRoute = async () => {
    if (!userData?.userId) return

    try {
      // Récupérer les colis disponibles
      const packagesRes = await axios.get<IPackage[]>("http://127.0.0.1:3001/packages/available")
      const packages = packagesRes.data

      // Récupérer le mouvement actif du livreur
      const movementRes = await axios.get(`http://127.0.0.1:3001/movements/active?userId=${userData.userId}`)
      const movement = movementRes.data

      if (!movement) {
        setPackagesOnRoute(0)
        return
      }

      // Calculer les distances pour chaque colis
      const packagesWithDistances = await Promise.all(
        packages.map(async (pkg) => {
          try {
            const locRes = await axios.get(`http://127.0.0.1:3001/localisation/package/${pkg.id}`)
            const loc = locRes.data

            const distanceFromStart =
              loc?.currentLatitude && loc?.currentLongitude
                ? calculateDistance(
                    movement.originLatitude,
                    movement.originLongitude,
                    loc.currentLatitude,
                    loc.currentLongitude,
                  )
                : undefined

            const distanceToEnd =
              loc?.destinationLatitude && loc?.destinationLongitude
                ? calculateDistance(
                    movement.destinationLatitude,
                    movement.destinationLongitude,
                    loc.destinationLatitude,
                    loc.destinationLongitude,
                  )
                : undefined

            return {
              ...pkg,
              distanceFromStart,
              distanceToEnd,
            }
          } catch (err) {
            console.error("Erreur localisation colis", err)
            return pkg
          }
        }),
      )

      // Filtrer les colis sur le trajet (distance <= 10km du départ ET de l'arrivée)
      const onRoutePackages = packagesWithDistances.filter(
        (pkg) =>
          (pkg.distanceFromStart ?? Number.POSITIVE_INFINITY) <= 10 &&
          (pkg.distanceToEnd ?? Number.POSITIVE_INFINITY) <= 10,
      )

      setPackagesOnRoute(onRoutePackages.length)
    } catch (error) {
      console.error("Erreur lors de la récupération des colis sur le trajet:", error)
      setPackagesOnRoute(0)
    }
  }

  // Récupérer les colis sur le trajet quand l'utilisateur est chargé
  useEffect(() => {
    if (userData?.userId && userData.occasionalCourier) {
      fetchPackagesOnRoute()

      // Actualiser toutes les 30 secondes
      const interval = setInterval(fetchPackagesOnRoute, 30000)
      return () => clearInterval(interval)
    }
  }, [userData])

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>
  }

  if (!userData) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">Utilisateur non connecté ou token invalide.</p>
      </div>
    )
  }

  if (!userData.occasionalCourier) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <h1 className="text-3xl font-bold">Bienvenue sur votre espace livreur</h1>
        <Link href="/dashboard/livreur/documents">
          <button className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition">
            Envoyer mes justificatifs
          </button>
        </Link>
      </div>
    )
  }

  // Affichage du Dashboard si l'utilisateur est "occasionalCourier"
  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <aside
          className={`fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 p-5 flex-col justify-between transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}
        >
          <div>
            <div className="flex justify-between items-center md:hidden mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EcoDeli</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="text-gray-700 dark:text-white" />
              </button>
            </div>

            <Link
              href="/connexion"
              className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold inline-block mb-4"
            >
              <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
            </Link>

            <nav className="mt-5">
              <ul className="space-y-3">
                <NavItem title="Accueil" link="/" />
                <NavItem title="Les Colis Disponible" link="./livreur/available" />
                <NavItem title="Mes Livraisons en Cours" link="/dashboard/livreur/mydeliveries" />
                <NavItem title="Historique De Mes Livraisons" link="/dashboard/livreur/history" />
                <NavItem title="Mes Déplacements" link="/dashboard/livreur/movements" />
                <NavItem title="Mes disponibilités" link="/dashboard/livreur/planning" />
                <NavItem title="Profil / Compte" link="/compte" />
              </ul>
            </nav>

            <div className="mt-10 space-y-3">
              <NavItem title="News" link="/dashboard/livreur/news" />
              <NavItem title="À propos" link="/a-propos" />
              <NavItem title="Nous contacter" link="/contact" />
            </div>
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
            <div className="flex items-center space-x-3">
              {/* Icône de notification avec badge */}
              <div className="relative">
                <Link href="/dashboard/livreur/available">
                  <Bell className="w-6 h-6 text-gray-900 dark:text-white cursor-pointer hover:text-green-500 transition-colors" />
                  {packagesOnRoute > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {packagesOnRoute > 9 ? "9+" : packagesOnRoute}
                    </span>
                  )}
                </Link>
              </div>
              <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Bienvenue Chez <span className="text-black">Eco</span>
              <span className="text-green-500">Deli</span> - partie Livreur
            </h2>

            {/* Icône de notification pour desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <Link href="/dashboard/livreur/available">
                  <Bell className="w-6 h-6 text-gray-900 dark:text-white cursor-pointer hover:text-green-500 transition-colors" />
                  {packagesOnRoute > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {packagesOnRoute > 9 ? "9+" : packagesOnRoute}
                    </span>
                  )}
                </Link>
              </div>
              {packagesOnRoute > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {packagesOnRoute} colis sur votre trajet
                </span>
              )}
            </div>
          </div>

          {/* Notification card pour les colis sur le trajet */}
          {packagesOnRoute > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-green-800 font-medium">
                    {packagesOnRoute} colis disponible{packagesOnRoute > 1 ? "s" : ""} sur votre trajet
                  </h3>
                  <p className="text-green-700 text-sm mt-1">
                    Consultez les colis disponibles pour optimiser vos livraisons.
                  </p>
                </div>
                <Link
                  href="/dashboard/livreur/available"
                  className="ml-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Voir les colis
                </Link>
              </div>
            </div>
          )}
        </main>

        <button
          className="hidden md:block absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
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

export default AdminConnexion
