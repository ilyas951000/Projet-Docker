"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Package,
  MapPin,
  TruckIcon,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Weight,
  Box,
  Home,
  Navigation,
  Map,
  List,
  Layers,
} from "lucide-react"

// Import dynamique de la carte pour éviter les erreurs SSR
const PackageMap = dynamic(() => import("@/components/PackageMap"), { ssr: false })

interface IPackage {
  id: number
  packageName: string
  packageWeight: number
  packageDimension: string
  packageDescription: string
  senderAddress: string
  recipientAddress: string
  senderPostalCode?: string
  recipientPostalCode?: string
  senderCity?: string
  recipientCity?: string
  packageRequirements: string
  advertisementId?: number
  advertisementPhoto?: string
  advertisementPrice?: number
  advertisementBeginning?: string
  advertisementEnd?: string
  currentCity?: string
  destinationCity?: string
  clientId?: number
  distanceFromStart?: number
  distanceToEnd?: number
  currentLatitude?: number
  currentLongitude?: number
  destinationLatitude?: number
  destinationLongitude?: number
}

type FilterMode = "all" | "nearby" | "onRoute"
type ViewMode = "list" | "map" | "split"

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

export default function LivreurDashboard() {
  const [mounted, setMounted] = useState(false)
  const [packages, setPackages] = useState<IPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [livreurId, setLivreurId] = useState<number | null>(null)
  const [filter, setFilter] = useState<FilterMode>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Utilisateur non connecté. Token manquant.")
      setLoading(false)
      return
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:3001/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data?.userId) {
          setLivreurId(res.data.userId)
        } else {
          setError("Utilisateur non valide ou ID manquant.")
        }
      } catch (err: any) {
        setError("Erreur utilisateur : " + (err.response?.data?.message || err.message))
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (livreurId !== null) {
      fetchPackages()
    }
  }, [livreurId, filter, maxDistanceKm])

  const fetchPackages = async () => {
    setRefreshing(true)
    try {
      const url = "http://127.0.0.1:3001/packages/available"
      const response = await axios.get<IPackage[]>(url)
      const pkgs = response.data

      const movementRes = await axios.get(`http://127.0.0.1:3001/movements/active?userId=${livreurId}`)
      const movement = movementRes.data

      const updated = await Promise.all(
        pkgs.map(async (pkg) => {
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
              currentLatitude: loc.currentLatitude,
              currentLongitude: loc.currentLongitude,
              destinationLatitude: loc.destinationLatitude,
              destinationLongitude: loc.destinationLongitude,
              advertisementPhoto: loc.advertisementPhoto,
              advertisementPrice: loc.advertisementPrice,
              advertisementBeginning: loc.advertisementBeginning,
              advertisementEnd: loc.advertisementEnd,
              currentCity: loc.currentCity,
              destinationCity: loc.destinationCity,
              senderPostalCode: loc.currentPostalCode,
              recipientPostalCode: loc.destinationPostalCode,
              senderCity: loc.currentCity,
              recipientCity: loc.destinationCity,
            }
          } catch (err) {
            console.error("Erreur localisation colis", err)
            return pkg
          }
        }),
      )

      let filtered = updated

      if (filter === "nearby") {
        filtered = updated.filter((pkg) => (pkg.distanceFromStart ?? Number.POSITIVE_INFINITY) < maxDistanceKm)
      } else if (filter === "onRoute") {
        filtered = updated.filter(
          (pkg) =>
            (pkg.distanceFromStart ?? Number.POSITIVE_INFINITY) <= 10 &&
            (pkg.distanceToEnd ?? Number.POSITIVE_INFINITY) <= 10,
        )
      }

      setPackages(filtered)
    } catch (err) {
      setError("Impossible de charger les colis.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleTakePackage = async (packageId: number) => {
    if (!livreurId) {
      alert("Utilisateur non connecté.")
      return
    }
    try {
      await axios.post(`http://127.0.0.1:3001/packages/${packageId}/take`, {
        userId: livreurId,
      })
      alert("Colis pris en charge !")
      fetchPackages()
    } catch (error: any) {
      alert("Erreur : " + (error.response?.data?.message || error.message))
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Livreur</h1>
          <p className="text-gray-500 mt-1">Trouvez et gérez vos livraisons</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchPackages}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </button>

          <Link
            href="/dashboard/livreur/mydeliveries"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <TruckIcon className="h-4 w-4" />
            Mes Livraisons
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium">Erreur</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et contrôles */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="bg-gray-100 p-1 rounded-lg grid grid-cols-3 w-full max-w-md">
            <button
              onClick={() => setFilter("all")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                filter === "all" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Tous les colis</span>
            </button>
            <button
              onClick={() => setFilter("nearby")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                filter === "nearby" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Autour de moi</span>
            </button>
            <button
              onClick={() => setFilter("onRoute")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                filter === "onRoute" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Navigation className="h-4 w-4" />
              <span>Sur mon trajet</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-lg grid grid-cols-3 w-full">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === "split" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Layers className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === "map" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filter === "nearby" && (
            <div className="flex items-center gap-4 w-full max-w-xs">
              <span className="text-sm font-medium whitespace-nowrap">Distance: {maxDistanceKm} km</span>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucun colis disponible</h3>
              <p className="text-gray-500">Aucun colis ne correspond à vos critères actuels.</p>
            </div>
          ) : (
            <div className={`${viewMode === "split" ? "lg:flex gap-6" : ""}`}>
              {/* Carte */}
              {(viewMode === "map" || viewMode === "split") && packages.length > 0 && (
                <div className={viewMode === "split" ? "lg:w-1/2 mb-6 lg:mb-0" : "mb-6"}>
                  <PackageMap packages={packages} />
                </div>
              )}

              {/* Liste des colis */}
              {(viewMode === "list" || viewMode === "split") && (
                <div className={viewMode === "split" ? "lg:w-1/2" : "w-full"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col h-full hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-40 bg-gray-100">
                          {pkg.advertisementPhoto ? (
                            <img
                              src={`http://localhost:3001/uploads/${pkg.advertisementPhoto}`}
                              alt={pkg.packageName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-100 to-slate-200">
                              <Package className="h-12 w-12 text-slate-400" />
                            </div>
                          )}

                          {pkg.advertisementPrice !== undefined && (
                            <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded">
                              {pkg.advertisementPrice.toFixed(2)} €
                            </span>
                          )}

                          {pkg.advertisementId && (
                            <span className="absolute top-3 left-3 bg-white/80 text-gray-700 text-xs font-medium px-2.5 py-1 rounded border border-gray-200">
                              Annonce #{pkg.advertisementId}
                            </span>
                          )}
                        </div>

                        <div className="p-4 pb-2">
                          <h3 className="text-lg font-medium">{pkg.packageName}</h3>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                              <Weight className="h-3 w-3" />
                              {pkg.packageWeight} kg
                            </span>
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                              <Box className="h-3 w-3" />
                              {pkg.packageDimension}
                            </span>
                          </div>
                        </div>

                        <div className="px-4 pb-4 flex-grow">
                          <div className="space-y-3 text-sm">
                            <p className="line-clamp-2 text-gray-500">{pkg.packageDescription}</p>

                            <div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
                              <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium">Départ</p>
                                <p className="text-gray-500 line-clamp-1">{pkg.senderAddress}</p>
                                <p className="text-gray-500">
                                  {pkg.senderCity} {pkg.senderPostalCode}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium">Arrivée</p>
                                <p className="text-gray-500 line-clamp-1">{pkg.recipientAddress}</p>
                                <p className="text-gray-500">
                                  {pkg.recipientCity} {pkg.recipientPostalCode}
                                </p>
                              </div>
                            </div>

                            {pkg.distanceFromStart !== undefined && pkg.distanceToEnd !== undefined && (
                              <div className="mt-3 p-2 bg-slate-50 rounded-md border">
                                <div className="flex items-center gap-2 text-xs">
                                  <Navigation className="h-3 w-3 text-slate-500" />
                                  <span>
                                    <span className="font-medium">{pkg.distanceFromStart.toFixed(1)} km</span> du
                                    départ, <span className="font-medium">{pkg.distanceToEnd.toFixed(1)} km</span> de
                                    l'arrivée
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-4 pb-4 pt-0 flex gap-2">
                          <button
                            onClick={() => handleTakePackage(pkg.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <TruckIcon className="h-4 w-4" />
                            Prendre
                          </button>

                          {pkg.clientId && (
                            <Link
                              href={`/dashboard/livreur/chat/${pkg.clientId}?packageId=${pkg.id}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Contacter
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
