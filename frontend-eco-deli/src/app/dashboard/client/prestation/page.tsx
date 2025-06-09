"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Search,
  User,
  MessageSquare,
  CalendarIcon,
  Star,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Euro,
  Briefcase,
  FileText,
  ChevronRight,
} from "lucide-react"

// ---- Interfaces ----
interface IProfile {
  id: number
  prestationType: string
  price: number
  description: string
  user: {
    id: number
    userFirstName: string
    userLastName: string
    userPhoto?: string
  }
}

// ---- Modal réservation ----
function ReservationModal({
  providerId,
  clientId,
  prestationType,
  onClose,
}: {
  providerId: number
  clientId: number
  prestationType: string
  onClose: () => void
}) {
  const [prix, setPrix] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!prix.trim()) {
      setError("Veuillez indiquer un prix")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await axios.post("http://localhost:3001/intervention", {
        prestataireId: providerId,
        clientId,
        type: prestationType,
        prix: Number.parseFloat(prix),
        description: message,
      })
      if (res.status === 201 || res.status === 200) {
        setSuccess(true)
      } else {
        setError("Une erreur est survenue")
      }
    } catch (err) {
      setError("Erreur lors de la réservation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-lg max-w-md w-full relative overflow-hidden"
      >
        <div className="bg-green-500 p-4 text-white">
          <h2 className="text-xl font-semibold">Réserver cette prestation</h2>
          <button onClick={onClose} className="absolute top-3 right-3 text-white hover:bg-green-600 rounded-full p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Demande envoyée avec succès</h3>
              <p className="text-gray-600 mb-6">
                Votre demande de réservation a été envoyée au prestataire. Vous serez notifié dès qu'il y répondra.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-center mb-1">
                  <Euro className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="block font-medium text-gray-700">Prix proposé (€)</label>
                </div>
                <input
                  type="number"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Entrez votre prix"
                />
              </div>

              <div className="mb-5">
                <div className="flex items-center mb-1">
                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="block font-medium text-gray-700">Message au prestataire</label>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  rows={4}
                  placeholder="Décrivez vos besoins spécifiques..."
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="mr-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-70 flex items-center"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">
                        <Clock className="w-4 h-4" />
                      </span>
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer la demande"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ---- Page principale ----
export default function ListePrestataires() {
  const [profiles, setProfiles] = useState<IProfile[]>([])
  const [clientId, setClientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [requestSent, setRequestSent] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<{
    providerId: number
    prestationType: string
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // 🔒 Date du jour pour bloquer les dates passées
  const today = new Date().toISOString().split("T")[0]


  // --- Fetch client ID ---
  useEffect(() => {
    const fetchClientId = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const userData = await res.json()

        if (!res.ok || !userData.userId) {
          throw new Error("Utilisateur non valide.")
        }

        setClientId(userData.userId)
      } catch (err) {
        console.error("Erreur lors de la récupération du client connecté.")
      }
    }

    fetchClientId()
  }, [])

  // --- Fetch profils prestataires ---
  const fetchProfiles = (start?: string, end?: string) => {
    const token = localStorage.getItem("token")
    let url = "http://localhost:3001/public-profile"
    if (start && end) {
      url = `http://localhost:3001/public-profile/available?start=${encodeURIComponent(start)}&end=${encodeURIComponent(
        end,
      )}`
    }

    setLoading(true)
    setError(null)
    setRequestSent(true)

    axios
      .get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .then((res) => {
        setProfiles(res.data)
      })
      .catch(() => {
        setError("Erreur lors du chargement des profils")
        setProfiles([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleSearch = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError("Veuillez renseigner les deux dates")
      return
    }
    fetchProfiles(startDate, endDate)
  }

  const filteredProfiles = profiles.filter((profile) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      profile.prestationType.toLowerCase().includes(searchLower) ||
      profile.description.toLowerCase().includes(searchLower) ||
      `${profile.user.userFirstName} ${profile.user.userLastName}`.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Prestataires disponibles</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un prestataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
      </div>

      {/* Filtres de date */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-500" />
          Filtrer par disponibilité
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                min={today} // ⬅️ Blocage des dates passées
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                min={today} // ⬅️ Blocage des dates passées
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Rechercher
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && requestSent && profiles.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>Aucun prestataire disponible pour cette période.</p>
          </div>
        )}

        {!loading && !requestSent && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>Utilisez les filtres ci-dessus pour affiner votre recherche.</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {filteredProfiles.length > 0 ? (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredProfiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl font-bold">
                            {profile.user.userFirstName[0]}
                            {profile.user.userLastName[0]}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {profile.user.userFirstName} {profile.user.userLastName}
                          </h2>

                          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Briefcase className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                              <span>{profile.prestationType}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Euro className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                              <span className="font-medium">{profile.price} € / heure</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end gap-2 mt-4 md:mt-0">
                          <Link
                            href={`/dashboard/client/profil-prestation/${profile.user.id}`}
                            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                          >
                            Voir le profil
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600 text-sm">{profile.description}</p>
                      </div>

                      {clientId && (
                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href={`/dashboard/client/chat/${profile.user.id}?from=${clientId}`}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                            Contacter
                          </Link>

                          <button
                            onClick={() =>
                              setSelectedReservation({
                                providerId: profile.user.id,
                                prestationType: profile.prestationType,
                              })
                            }
                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Réserver
                          </button>

                          <Link
                            href={`/dashboard/client/note-prestataire/${profile.user.id}`}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            Noter
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            !loading &&
            requestSent &&
            !error && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun prestataire trouvé</h3>
                <p className="text-gray-500 mb-6">Aucun prestataire ne correspond à vos critères de recherche.</p>
                <button
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                    setSearchTerm("")
                    fetchProfiles()
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )
          )}
        </>
      )}

      {selectedReservation && clientId && (
        <ReservationModal
          providerId={selectedReservation.providerId}
          clientId={clientId}
          prestationType={selectedReservation.prestationType}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  )
}
