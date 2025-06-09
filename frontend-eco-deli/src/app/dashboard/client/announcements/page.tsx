"use client"
import "../globals.css"
import type React from "react"

import { useEffect, useState } from "react"
import {
  PlusCircle,
  Menu,
  X,
  MapPin,
  Calendar,
  Package,
  Truck,
  Info,
  Clock,
  ChevronRight,
  Edit,
  Trash2,
  Box,
} from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation" // ✅ correct

interface Localisation {
  currentStreet: string
  currentCity: string
  currentPostalCode: number
  destinationStreet: string
  destinationCity: string
  destinationPostalCode: number
}

interface PackageType {
  packageName: string
  packageWeight: number
  packageQuantity: number
  packageDimension: string
  localisations: Localisation[]
}

interface Ad {
  id: number
  advertisementPhoto?: string
  advertisementQuantity: number
  advertisementItem: string
  publicationDate: string
  advertisementDimension?: string
  advertisementWeight?: number
  additionalInformation?: string
  advertisementPrice: number
  advertisementStatus?: string
  advertisementBeginning?: string
  advertisementEnd?: string
  isPriority?: boolean
  packages?: PackageType[]
}

export default function Dashboard() {
  const router = useRouter()

  const handleRedirect = () => {
    // Par exemple, rediriger vers "/box-reservation"
    router.push("/dashboard/client/boxes")
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [objects, setObjects] = useState([
    {
      quantity: 1,
      item: "",
      dimension: "",
      weight: 0,
    },
  ])

  // États pour le formulaire
  const [advertisementQuantity, setAdvertisementQuantity] = useState(0)
  const [advertisementPrice, setAdvertisementPrice] = useState(0)
  const [advertisementWeight, setAdvertisementWeight] = useState(0)
  const [advertisementDimension, setAdvertisementDimension] = useState("")
  const [advertisementItem, setAdvertisementItem] = useState("")
  const [additionalInformation, setAdditionalInformation] = useState("")
  const [advertisementStatus, setAdvertisementStatus] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errorAdd, setErrorAdd] = useState<string | null>(null)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [isPriority, setIsPriority] = useState(false)

  const [currentStreet, setcurrentStreet] = useState("")
  const [currentCity, setcurrentCity] = useState("")
  const [currentPostalCode, setcurrentPostalCode] = useState("")
  const today = new Date().toISOString().split("T")[0]
  const [destinationStreet, setdestinationStreet] = useState("")
  const [destinationCity, setdestinationCity] = useState("")
  const [destinationPostalCode, setdestinationPostalCode] = useState("")

  const [departurePostalCode, setDeparturePostalCode] = useState("")

  const [advertisementBeginning, setadvertisementBeginning] = useState("")
  const [advertisementEnd, setadvertisementEnd] = useState("")

  const [arrivalStreet, setArrivalStreet] = useState("")
  const [arrivalCity, setArrivalCity] = useState("")
  const [arrivalPostalCode, setArrivalPostalCode] = useState("")

  const [userId, setUserId] = useState<number | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  const [ads, setAds] = useState<Ad[]>([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [errorAds, setErrorAds] = useState<string | null>(null)

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [expandedAdId, setExpandedAdId] = useState<number | null>(null)

  const [showBoxReservationModal, setShowBoxReservationModal] = useState(false)
  const [boxReservationType, setBoxReservationType] = useState<"departure" | "arrival">("departure")
  const [boxReservationCity, setBoxReservationCity] = useState("")

  const handleAddObject = () => {
    setObjects([...objects, { quantity: 1, item: "", dimension: "", weight: 0 }])
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant")
        const res = await fetch("http://localhost:3001/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur récupération utilisateur")
        const data = await res.json()
        setUserId(data.userId)
      } catch (err: any) {
        setUserError(err.message)
      } finally {
        setUserLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!userLoading && typeof userId === "number" && !isNaN(userId)) {
      const fetchAds = async () => {
        try {
          const token = localStorage.getItem("token")
          const res = await fetch("http://localhost:3001/advertisements/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) throw new Error(await res.text())
          setAds(await res.json())
        } catch (err: any) {
          setErrorAds(err.message)
        } finally {
          setLoadingAds(false)
        }
      }
      fetchAds()
    }
  }, [userLoading, userId])

  const handleDeleteAd = async (adId: number) => {
    const confirmDelete = confirm(
      "Voulez-vous vraiment supprimer cette annonce ? Cela supprimera aussi les colis liés.",
    )
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:3001/advertisements/${adId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error(await res.text())

      setAds((prevAds) => prevAds.filter((ad) => ad.id !== adId))
      setSelectedAd(null)
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message)
    }
  }

  const handleOpenBoxReservation = (type: "departure" | "arrival", city: string) => {
    setBoxReservationType(type)
    setBoxReservationCity(city)
    setShowBoxReservationModal(true)
  }

  const handleBoxReservationComplete = (data: {
    localId: number
    boxId: number
    city: string
    address: string
    postalCode: string
    date: string
  }) => {
    // Mettre à jour les champs en fonction du type de réservation
    if (boxReservationType === "departure") {
      setcurrentCity(data.city)
      setcurrentStreet(data.address)
      setcurrentPostalCode(data.postalCode)
    } else {
      setdestinationCity(data.city)
      setdestinationStreet(data.address)
      setdestinationPostalCode(data.postalCode)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAdd(true)
    setErrorAdd(null)
    if (!file) {
      setErrorAdd("Veuillez sélectionner une photo.")
      setLoadingAdd(false)
      return
    }
    if (userLoading || userError || userId === null) {
      setErrorAdd("Impossible de récupérer l'utilisateur.")
      setLoadingAdd(false)
      return
    }

    const fileName = file.name

    try {
      const formData = new FormData()
      formData.append("photo", file)
      formData.append("additionalInformation", additionalInformation)

      formData.append("advertisementPrice", advertisementPrice.toString())
      formData.append("creatorRole", "client")

      formData.append("advertisementStatus", advertisementStatus)
      formData.append("advertisementBeginning", advertisementBeginning)
      formData.append("advertisementEnd", advertisementEnd)
      formData.append("isPriority", isPriority.toString())

      formData.append("photoName", file.name)
      formData.append("publicationDate", new Date().toISOString())
      if (typeof userId !== "number" || isNaN(userId)) {
        setErrorAdd("ID utilisateur invalide.")
        setLoadingAdd(false)
        return
      }
      formData.append("usersId", userId.toString())

      const packageData = objects.map((obj) => ({
        quantity: obj.quantity,
        item: obj.item,
        dimension: obj.dimension,
        weight: obj.weight,
        prioritaire: isPriority, // ✅ ajoute ça
        localisations: [
          {
            currentStreet,
            currentCity,
            currentPostalCode: Number.parseInt(currentPostalCode) || 0,
            destinationStreet,
            destinationCity,
            destinationPostalCode: Number.parseInt(destinationPostalCode) || 0,
          },
        ],
      }))

      formData.append("packages", JSON.stringify(packageData))

      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3001/advertisements", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())
      setAds([])
      setLoadingAds(true)
      setShowAddModal(false)
      setAdvertisementQuantity(0)
      setAdvertisementPrice(0)
      setAdvertisementWeight(0)
      setAdvertisementDimension("")
      setAdvertisementItem("")
      setAdditionalInformation("")
      setAdvertisementStatus("")
      setFile(null)
      setIsPriority(false)
    } catch (err: any) {
      setErrorAdd(err.message)
    } finally {
      setLoadingAdd(false)
    }
  }

  const toggleExpandAd = (id: number) => {
    setExpandedAdId(expandedAdId === id ? null : id)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="p-5 md:p-10 overflow-auto w-full max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-center md:hidden mb-5">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            <span className="text-black">Eco</span>
            <span className="text-green-500">Deli</span> - Mes Colis
          </h2>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Nouvelle annonce
            </button>
          </div>
        </div>

        {loadingAds ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : errorAds ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="flex items-center">
              <span className="mr-2">⚠️</span>
              {errorAds}
            </p>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune annonce</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore créé d'annonce de colis.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Créer ma première annonce
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {ads.map((ad) => (
              <AnimatePresence key={ad.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpandAd(ad.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={`http://localhost:3001/uploads/${ad.advertisementPhoto}`}
                          alt="Annonce"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {ad.packages?.[0]?.item || ad.advertisementItem || "Colis"}
                                {ad.packages?.[0]?.quantity > 1 ? ` (x${ad.packages[0].quantity})` : ""}
                              </h3>
                              {ad.isPriority && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  ⭐ Prioritaire
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Publié le {new Date(ad.publicationDate).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-green-600">
                              {ad.advertisementPrice.toFixed(2)} €
                            </span>
                            <ChevronRight
                              className={`w-5 h-5 ml-2 text-gray-400 transition-transform ${expandedAdId === ad.id ? "rotate-90" : ""}`}
                            />
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {ad.packages?.[0]?.localisations?.[0]?.currentCity || "N/A"} →{" "}
                              {ad.packages?.[0]?.localisations?.[0]?.destinationCity || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                            <span>
                              {formatDate(ad.advertisementBeginning)} - {formatDate(ad.advertisementEnd)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <StatusStepperCompact status={ad.advertisementStatus || "en attente"} />
                    </div>
                  </div>

                  {expandedAdId === ad.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100 px-5 py-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Package className="w-4 h-4 mr-2 text-green-500" />
                            Détails du colis
                          </h4>
                          <div className="space-y-2 text-sm">
                            {ad.packages?.map((pkg, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-500">Objet:</span>
                                    <span className="font-medium ml-1">{pkg.packageName || pkg.item || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Quantité:</span>
                                    <span className="font-medium ml-1">{pkg.packageQuantity}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Dimensions:</span>
                                    <span className="font-medium ml-1">
                                      {pkg.packageDimension || ad.advertisementDimension || "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Poids:</span>
                                    <span className="font-medium ml-1">
                                      {pkg.packageWeight || ad.advertisementWeight || "N/A"} kg
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {!ad.packages?.length && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-500">Objet:</span>
                                    <span className="font-medium ml-1">{ad.advertisementItem || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Quantité:</span>
                                    <span className="font-medium ml-1">{ad.advertisementQuantity}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Dimensions:</span>
                                    <span className="font-medium ml-1">{ad.advertisementDimension || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Poids:</span>
                                    <span className="font-medium ml-1">{ad.advertisementWeight || "N/A"} kg</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Truck className="w-4 h-4 mr-2 text-green-500" />
                            Itinéraire
                          </h4>
                          <div className="space-y-4 text-sm">
                            <div className="flex items-start">
                              <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                                <MapPin className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Départ</p>
                                <p className="text-gray-600">
                                  {ad.packages?.[0]?.localisations?.[0]?.currentStreet || "N/A"}, <br />
                                  {ad.packages?.[0]?.localisations?.[0]?.currentCity || "N/A"}{" "}
                                  {ad.packages?.[0]?.localisations?.[0]?.currentPostalCode || ""}
                                </p>
                              </div>
                            </div>

                            <div className="ml-5 border-l-2 border-dashed border-gray-300 h-6"></div>

                            <div className="flex items-start">
                              <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                                <MapPin className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Arrivée</p>
                                <p className="text-gray-600">
                                  {ad.packages?.[0]?.localisations?.[0]?.destinationStreet || "N/A"}, <br />
                                  {ad.packages?.[0]?.localisations?.[0]?.destinationCity || "N/A"}{" "}
                                  {ad.packages?.[0]?.localisations?.[0]?.destinationPostalCode || ""}
                                </p>
                              </div>
                            </div>
                          </div>

                          {ad.additionalInformation && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-2 text-green-500" />
                                Informations complémentaires
                              </h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {ad.additionalInformation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                        <button
                          onClick={() => setSelectedAd(ad)}
                          className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-colors md:hidden"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Ajouter une annonce</h3>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div>
                <h4 className="text-lg font-semibold mb-2">Les photos</h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              {objects.map((obj, index) => (
                <div key={index} className="border p-3 rounded-lg space-y-3 bg-gray-50">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={obj.quantity}
                      onChange={(e) => {
                        const newObjects = [...objects]
                        newObjects[index].quantity = +e.target.value
                        setObjects(newObjects)
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Objet</label>
                    <input
                      type="text"
                      value={obj.item}
                      onChange={(e) => {
                        const newObjects = [...objects]
                        newObjects[index].item = e.target.value
                        setObjects(newObjects)
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      placeholder="Nom de l'objet"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Dimensions</label>
                    <select
                      value={obj.dimension}
                      onChange={(e) => {
                        const newObjects = [...objects]
                        newObjects[index].dimension = e.target.value
                        setObjects(newObjects)
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      required
                    >
                      <option value="">Sélectionner une taille</option>
                      <option value="XS">xs</option>
                      <option value="S">s</option>
                      <option value="M">m</option>
                      <option value="L">l</option>
                      <option value="XL">xl</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={obj.weight}
                      onChange={(e) => {
                        const newObjects = [...objects]
                        newObjects[index].weight = +e.target.value
                        setObjects(newObjects)
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      required
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddObject} className="text-sm text-green-600 hover:underline">
                + Ajouter un objet
              </button>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={advertisementPrice}
                  onChange={(e) => setAdvertisementPrice(+e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <h1>Ville de départ:</h1>
              <div className="flex gap-1 mb-2">
                <div className="flex-2">
                  <label className="block text-sm text-gray-700 mb-1">Rue et numéro</label>
                  <input
                    type="text"
                    value={currentStreet}
                    onChange={(e) => setcurrentStreet(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setcurrentCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-1">Code postal</label>
                  <input
                    type="text"
                    value={currentPostalCode}
                    onChange={(e) => setcurrentPostalCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleRedirect}
                className="mb-4 text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg inline-flex items-center"
              >
                <Box className="w-4 h-4 mr-1" />
                Réserver une box pour déposer votre colis ou bien chercher votre colis en toute sécurité (Noubliez pas
                de renseigner l'adresse de la box)
              </button>

              <h1 className="mt-4">Ville d'arrivée :</h1>
              <div className="flex gap-1 mb-2">
                <div className="flex-2">
                  <label className="block text-sm text-gray-700 mb-1">Rue et numéro</label>
                  <input
                    type="text"
                    value={destinationStreet}
                    onChange={(e) => setdestinationStreet(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setdestinationCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-1">Code postal</label>
                  <input
                    type="text"
                    value={destinationPostalCode}
                    onChange={(e) => setdestinationPostalCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date de livraison début</label>
                <input
                  type="date"
                  min={today}
                  value={advertisementBeginning}
                  onChange={(e) => setadvertisementBeginning(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Date de livraison fin de délais</label>
                <input
                  type="date"
                  min={today}
                  value={advertisementEnd}
                  onChange={(e) => setadvertisementEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Informations complémentaires global</label>
                <textarea
                  value={additionalInformation}
                  onChange={(e) => setAdditionalInformation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annonce prioritaire</label>
                  <p className="text-xs text-gray-500">Les annonces prioritaires sont mises en avant</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPriority}
                    onChange={(e) => setIsPriority(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${isPriority ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${isPriority ? "translate-x-5" : "translate-x-0"} mt-0.5 ml-0.5`}
                    ></div>
                  </div>
                </label>
              </div>

              {errorAdd && <p className="text-red-500">{errorAdd}</p>}
              <button
                type="submit"
                disabled={loadingAdd}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full transition-colors"
              >
                {loadingAdd ? "En cours..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedAd && (
        <EditAdModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          onSave={(ads) => setAds((a) => ads.map((a) => (a.id === a.id ? a : a)))}
          onDelete={handleDeleteAd}
        />
      )}
      {showBoxReservationModal && (
        <BoxReservationModal
          type={boxReservationType}
          initialCity={boxReservationCity}
          onClose={() => setShowBoxReservationModal(false)}
          onComplete={handleBoxReservationComplete}
        />
      )}
    </div>
  )
}

function StatusStepperCompact({ status }: { status: string }) {
  const steps = ["en attente", "pris en charge", "en transit", "livré"]
  const currentStep = steps.indexOf(status)

  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full ${
              index < currentStep
                ? "bg-green-500"
                : index === currentStep
                  ? "bg-green-500 ring-2 ring-green-100"
                  : "bg-gray-200"
            }`}
          />
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${index < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs font-medium text-gray-700">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  )
}

function StatusStepper({ status }: { status: string }) {
  const steps = ["en attente", "pris en charge", "en transit", "livré"]
  const currentStep = steps.indexOf(status)

  const statusIcons = {
    "en attente": <Clock className="w-4 h-4" />,
    "pris en charge": <Package className="w-4 h-4" />,
    "en transit": <Truck className="w-4 h-4" />,
    livré: <MapPin className="w-4 h-4" />,
  }

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center space-x-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center
            ${index <= currentStep ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}
          `}
          >
            {statusIcons[step as keyof typeof statusIcons]}
          </div>
          <div className="flex flex-col">
            <span className={`text-xs ${index <= currentStep ? "text-green-700 font-semibold" : "text-gray-400"}`}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-6 h-0.5 mx-1 ${index < currentStep ? "bg-green-500" : "bg-gray-300"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function EditAdModal({
  ad,
  onClose,
  onSave,
  onDelete,
}: {
  ad: Ad
  onClose: () => void
  onSave: (ad: Ad) => void
  onDelete: (id: number) => void
}) {
  const [quantity, setQuantity] = useState(ad.advertisementQuantity)
  const [price, setPrice] = useState(ad.advertisementPrice)
  const [weight, setWeight] = useState(ad.advertisementWeight || 0)
  const [dimension, setDimension] = useState(ad.advertisementDimension || "")
  const [item, setItem] = useState(ad.advertisementItem)
  const [info, setInfo] = useState(ad.additionalInformation || "")
  const [status, setStatus] = useState(ad.advertisementStatus || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:3001/advertisements/${ad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          advertisementQuantity: quantity,
          advertisementPrice: price,
          advertisementWeight: weight,
          advertisementDimension: dimension,
          advertisementItem: item,
          additionalInformation: info,
          advertisementStatus: status,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated = await res.json()
      onSave(updated)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Modifier l'annonce #{ad.id}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(+e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(+e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            >
              <option value="">Sélectionner une taille</option>
              <option value="XS">XS - Très petit</option>
              <option value="S">S - Petit</option>
              <option value="M">M - Moyen</option>
              <option value="L">L - Grand</option>
              <option value="XL">XL - Très grand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objet</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="en attente">En attente</option>
              <option value="pris en charge">Pris en charge</option>
              <option value="en transit">En transit</option>
              <option value="livré">Livré</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Informations complémentaires</label>
            <textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none min-h-[100px]"
            />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => onDelete(ad.id)}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-70"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

interface BoxReservationModalProps {
  type: "departure" | "arrival"
  initialCity: string
  onClose: () => void
  onComplete: (data: {
    localId: number
    boxId: number
    city: string
    address: string
    postalCode: string
    date: string
  }) => void
}
const today = new Date().toISOString().split("T")[0];
function BoxReservationModal({ type, initialCity, onClose, onComplete }: BoxReservationModalProps) {
  const [city, setCity] = useState(initialCity)
  const [date, setDate] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [localId, setLocalId] = useState<number | null>(null)
  const [boxId, setBoxId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation des champs
    if (!city || !date || !address || !postalCode || !localId || !boxId) {
      setError("Veuillez remplir tous les champs.")
      setLoading(false)
      return
    }

    try {
      // Simuler une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Préparer les données à renvoyer
      const reservationData = {
        localId,
        boxId,
        city,
        address,
        postalCode,
        date,
      }

      // Appeler la fonction de callback pour mettre à jour les champs
      onComplete(reservationData)

      // Fermer le modal
      onClose()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la réservation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Réserver une box ({type === "departure" ? "Départ" : "Arrivée"})</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local ID</label>
            <input
              type="number"
              value={localId || ""}
              onChange={(e) => setLocalId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box ID</label>
            <input
              type="number"
              value={boxId || ""}
              onChange={(e) => setBoxId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-70"
            >
              {loading ? "Réservation…" : "Réserver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
