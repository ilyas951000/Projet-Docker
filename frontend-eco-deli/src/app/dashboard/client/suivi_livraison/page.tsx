"use client"
import { useEffect, useState } from "react"
import { MapPin, Calendar, Package, Truck, Clock, ChevronRight, Menu } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { AlertTriangle, X } from "lucide-react"

interface Localisation {
  currentStreet: string
  currentCity: string
  currentPostalCode: number
  destinationStreet: string
  destinationCity: string
  destinationPostalCode: number
}

interface PackageType {
    id: number
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

export default function DeliveryTracking() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [errorAds, setErrorAds] = useState<string | null>(null)
  const [expandedAdId, setExpandedAdId] = useState<number | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedAdForReport, setSelectedAdForReport] = useState<Ad | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

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

  const toggleExpandAd = (id: number) => {
    setExpandedAdId(expandedAdId === id ? null : id)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "livré":
        return "text-green-600 bg-green-50"
      case "en transit":
        return "text-blue-600 bg-blue-50"
      case "pris en charge":
        return "text-orange-600 bg-orange-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleReportIssue = (ad: Ad) => {
    setSelectedAdForReport(ad)
    setShowReportModal(true)
    setReportReason("")
    setReportError(null)
  }

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !selectedAdForReport) {
        setReportError("Veuillez saisir une raison pour le signalement.")
        return
    }

    setReportLoading(true)
    setReportError(null)

    try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant")

        // 1. Créer le signalement
        const reportData = {
        packageId: selectedAdForReport.packages?.[0]?.id || selectedAdForReport.id,
        advertisementId: selectedAdForReport.id,
        reason: reportReason.trim(),
        status: "en_attente",
        clientId: userId, // ✅ AJOUTE CECI
        }

        const reportRes = await fetch("http://localhost:3001/reports", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
        })

        if (!reportRes.ok) {
        throw new Error("Erreur lors de la création du signalement")
        }

        // 2. Récupérer tous les admins
        const adminRes = await fetch("http://localhost:3001/users/admins", {
        headers: { Authorization: `Bearer ${token}` },
        })

        if (!adminRes.ok) throw new Error("Erreur récupération des administrateurs")
        const admins = await adminRes.json()
        if (!admins.length) throw new Error("Aucun administrateur trouvé")

        // 3. Construire le message
        const packageId = selectedAdForReport.packages?.[0]?.id || selectedAdForReport.id
        const content = `🚨 SIGNALEMENT COLIS #${selectedAdForReport.id}\n\nRaison: ${reportReason.trim()}\n\nColis: ${selectedAdForReport.packages?.[0]?.packageName || selectedAdForReport.advertisementItem}\nDe: ${selectedAdForReport.packages?.[0]?.localisations?.[0]?.currentCity} → ${selectedAdForReport.packages?.[0]?.localisations?.[0]?.destinationCity}`

        // 4. Envoyer le message à chaque admin
        for (const admin of admins) {
        await fetch("http://localhost:3001/messages", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            fromUserId: userId,
            toUserId: admin.id,
            content,
            packageId,
            }),
        })
        }

        // 5. Fermer le modal
        setShowReportModal(false)
        setSelectedAdForReport(null)

        // 6. Rediriger vers le chat avec le premier admin
        router.push(`/dashboard/client/chat/${admins[0].id}?packageId=${packageId}`)
    } catch (err: any) {
        setReportError(err.message || "Une erreur est survenue")
    } finally {
        setReportLoading(false)
    }
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
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              <span className="text-black">Eco</span>
              <span className="text-green-500">Deli</span> - Suivi des Livraisons
            </h2>
            <p className="text-gray-600 mt-2">Suivez l'état de vos colis en temps réel</p>
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun colis à suivre</h3>
            <p className="text-gray-500">Vous n'avez pas encore de colis en cours de livraison.</p>
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
                          alt="Colis"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {(() => {
                                        const firstPackage = ad.packages?.[0];
                                        const name = firstPackage?.packageName || ad.advertisementItem || "Colis";
                                        const quantity = firstPackage?.packageQuantity;
                                        return quantity && quantity > 1 ? `${name} (x${quantity})` : name;
                                    })()}
                                    </h3>

                                    {ad.isPriority && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        ⭐ Prioritaire
                                    </span>
                                    )}
                                </div>
                                </div>
                            <p className="text-sm text-gray-500">
                              Colis #{ad.id} • Publié le {formatDate(ad.publicationDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ad.advertisementStatus || "en attente")}`}
                            >
                              {(ad.advertisementStatus || "en attente").charAt(0).toUpperCase() +
                                (ad.advertisementStatus || "en attente").slice(1)}
                            </span>
                            <ChevronRight
                              className={`w-5 h-5 text-gray-400 transition-transform ${expandedAdId === ad.id ? "rotate-90" : ""}`}
                            />
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      <div className="mb-6">
                        <StatusStepper status={ad.advertisementStatus || "en attente"} />
                      </div>

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
                                    <span className="font-medium ml-1">{pkg.packageName || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Quantité:</span>
                                    <span className="font-medium ml-1">{pkg.packageQuantity}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Dimensions:</span>
                                    <span className="font-medium ml-1">{pkg.packageDimension || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Poids:</span>
                                    <span className="font-medium ml-1">{pkg.packageWeight || "N/A"} kg</span>
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
                            Itinéraire de livraison
                          </h4>
                          <div className="space-y-4 text-sm">
                            <div className="flex items-start">
                              <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                                <MapPin className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Point de départ</p>
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
                                <p className="font-medium text-gray-900">Destination</p>
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
                              <h4 className="font-medium text-gray-900 mb-2">Informations complémentaires</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {ad.additionalInformation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nouveau bouton signaler */}
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => handleReportIssue(ad)}
                          className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                        >
                          <span className="mr-2">⚠️</span>
                          Signaler une information
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        )}
        {/* Modal de signalement */}
        {showReportModal && selectedAdForReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Signaler un problème
                </h3>
                <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Colis:</strong>{" "}
                  {selectedAdForReport.packages?.[0]?.packageName || selectedAdForReport.advertisementItem}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> #{selectedAdForReport.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Statut:</strong> {selectedAdForReport.advertisementStatus || "en attente"}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmitReport()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Raison du signalement *</label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-h-[120px]"
                    placeholder="Décrivez le problème rencontré avec ce colis..."
                    required
                  />
                </div>

                {reportError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{reportError}</div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={reportLoading || !reportReason.trim()}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {reportLoading ? "Signalement..." : "Signaler et contacter l'admin"}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 Après avoir soumis ce signalement, vous serez redirigé vers un chat avec l'administrateur pour
                  résoudre le problème.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
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
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center space-y-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
            ${index <= currentStep ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}
          `}
          >
            {statusIcons[step as keyof typeof statusIcons]}
          </div>
          <div className="text-center">
            <span className={`text-xs font-medium ${index <= currentStep ? "text-green-700" : "text-gray-400"}`}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`absolute w-16 h-0.5 mt-5 ${index < currentStep ? "bg-green-500" : "bg-gray-300"}`}
              style={{ left: `${(index + 1) * 25}%`, transform: "translateX(-50%)" }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
