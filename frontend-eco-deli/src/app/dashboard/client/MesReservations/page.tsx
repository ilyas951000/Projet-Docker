"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  FileText,
  Euro,
  Tag,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface Transfer {
  status: "pending" | "completed" | "failed" | "paid"
  isValidatedByClient: boolean
}

interface Intervention {
  id: number
  type: string
  prix: number
  commentaireClient?: string
  statut: string
  createdAt: string
  prestataireId: number
  transfer?: Transfer
}

export default function MesReservations() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [clientId, setClientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Utilisateur non connecté")
        setLoading(false)
        return
      }

      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await userRes.json()

        if (!userRes.ok || !userData.userId) {
          throw new Error("Utilisateur non valide.")
        }

        setClientId(userData.userId)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intervention/client/${userData.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setInterventions(data)
      } catch (err) {
        setError("Erreur lors du chargement des réservations.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (status: string, transfer?: Transfer) => {
    if (status === "accepte" && transfer?.status === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Payée
        </span>
      )
    }

    if (status === "accepte") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Paiement requis
        </span>
      )
    }

    if (status === "refuse") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Refusée
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        En attente
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-7 h-7 mr-3 text-green-500" />
          Mes réservations
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      ) : interventions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune réservation</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore effectué de demande de réservation.</p>
          <Link
            href="/dashboard/client/prestataires"
            className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Trouver un prestataire
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {interventions.map((intervention) => (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <User className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Prestataire #{intervention.prestataireId}
                        </h2>
                        {getStatusBadge(intervention.statut, intervention.transfer)}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Tag className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                          <span>{intervention.type}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Euro className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                          <span className="font-medium">{intervention.prix} €</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                          <span>{formatDate(intervention.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {intervention.statut === "accepte" && (
                      <div className="flex flex-col md:items-end gap-2 mt-4 md:mt-0">
                        {(!intervention.transfer || intervention.transfer.status === "failed") && (
                          <button
                            onClick={() => router.push(`paiementIntervention/${intervention.id}`)}
                            className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payer maintenant
                          </button>
                        )}

                        {clientId && (
                          <Link
                            href={`/dashboard/client/chat/${intervention.prestataireId}?from=${clientId}`}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                            Contacter le prestataire
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {intervention.commentaireClient && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start">
                        <FileText className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Votre message</h3>
                          <p className="text-sm text-gray-600">{intervention.commentaireClient}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
