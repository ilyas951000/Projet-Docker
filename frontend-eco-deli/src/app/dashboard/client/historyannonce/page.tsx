"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Receipt,
  Calendar,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CreditCard,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  FileCheck,
  CalendarRange,
  Euro,
} from "lucide-react"

interface Transfer {
  id: number
  amount: number
  status: "pending" | "completed" | "failed" | "paid"
  isValidatedByClient: boolean
  requestedAt: string
}

interface Invoice {
  id: number
  invoiceNumber: string
  totalAmount: string
  issueDate: string
  paymentStatus: boolean
}

export default function HistoriquePaiements() {
  const [clientId, setClientId] = useState<number | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [message, setMessage] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([])
  const [sortBy, setSortBy] = useState<string>("requestedAt")
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC")
  const [loading, setLoading] = useState<boolean>(true)
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"transfers" | "invoices">("transfers")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchClient = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setMessage("Token manquant")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && data.userId) {
          setClientId(data.userId)
        } else {
          throw new Error("Utilisateur non valide.")
        }
      } catch (err: any) {
        setMessage(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [])

  useEffect(() => {
    if (clientId) {
      fetchTransfers()
      fetchInvoices()
    }
  }, [clientId])

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/client/${clientId}/history?sortBy=${sortBy}&order=${order}`,
      )
      const data = await res.json()
      const validData = Array.isArray(data) ? data : []
      setTransfers(validData)

      const months = Array.from(
        new Set(
          validData
            .filter((t: Transfer) => t.isValidatedByClient)
            .map((t: Transfer) => {
              const date = new Date(t.requestedAt)
              return `${date.getMonth() + 1}-${date.getFullYear()}`
            }),
        ),
      ).map((key) => {
        const [month, year] = key.split("-").map(Number)
        return { month, year }
      })
      setAvailableMonths(months)
    } catch {
      setMessage("Erreur lors du chargement des transferts.")
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/client/${clientId}/history?sortBy=issueDate&order=DESC`,
      )
      const data = await res.json()

      const extracted = Array.isArray(data)
        ? data
        : Array.isArray(data.invoices)
          ? data.invoices
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.results)
              ? data.results
              : null

      if (Array.isArray(extracted)) {
        setInvoices(extracted)
      } else {
        setInvoices([])
        setMessage("Format inattendu des données de factures.")
      }
    } catch {
      setMessage("Erreur lors du chargement des factures.")
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (transferId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/validate/${transferId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      setSuccessMessage(data.message || "Transfert validé avec succès !")
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchTransfers()
    } catch {
      setMessage("Erreur lors de la validation.")
    }
  }

  const generateInvoiceForTransfer = async (transferId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/generate/single/${transferId}`, {
        method: "POST",
      })
      const data = await res.json()

      const invoiceId = data?.id
      if (invoiceId) {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${invoiceId}`, "_blank")
        setSuccessMessage("Facture créée avec succès !")
        setTimeout(() => setSuccessMessage(null), 3000)
        fetchInvoices()
      } else {
        setMessage("La facture n'a pas été générée correctement.")
      }
    } catch {
      setMessage("Erreur lors de la création de la facture.")
    }
  }

  const generateMonthlyInvoice = async () => {
    if (!selectedMonth || !selectedYear) {
      setMessage("Veuillez sélectionner un mois et une année")
      return
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/generate/monthly/${clientId}?month=${selectedMonth}&year=${selectedYear}`,
        { method: "POST" },
      )
      const data = await res.json()

      const invoiceId = data?.id
      if (invoiceId) {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${invoiceId}`, "_blank")
        setSuccessMessage("Facture mensuelle créée avec succès !")
        setTimeout(() => setSuccessMessage(null), 3000)
        fetchInvoices()
      } else {
        setMessage("La facture n'a pas été générée.")
      }
    } catch {
      setMessage("Erreur lors de la création de la facture mensuelle.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Complété
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Échoué
          </span>
        )
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CreditCard className="w-3 h-3 mr-1" />
            Payé
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <Receipt className="w-7 h-7 mr-3 text-green-500" />
          Historique des Paiements
        </h1>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <p>{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {message && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{message}</p>
          <button
            onClick={() => setMessage("")}
            className="ml-auto text-red-500 hover:text-red-700"
            aria-label="Fermer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "transfers"
              ? "text-green-600 border-b-2 border-green-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("transfers")}
        >
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Transferts
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "invoices"
              ? "text-green-600 border-b-2 border-green-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("invoices")}
        >
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Factures
          </div>
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div
          className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Filtres et tri</h2>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${filterOpen ? "transform rotate-180" : ""}`}
          />
        </div>

        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                      <option value="requestedAt">Date</option>
                      <option value="amount">Montant</option>
                      <option value="status">Statut</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                    <select
                      value={order}
                      onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                      <option value="DESC">Décroissant</option>
                      <option value="ASC">Croissant</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        fetchTransfers()
                        setFilterOpen(false)
                      }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Appliquer les filtres
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Transfers Tab */}
          {activeTab === "transfers" && (
            <div className="space-y-6">
              {transfers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun transfert trouvé</h3>
                  <p className="text-gray-500 mb-6">Vous n'avez pas encore effectué de transferts.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {transfers.map((transfer) => (
                    <motion.div
                      key={transfer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <CreditCard className="w-6 h-6" />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h2 className="text-lg font-semibold text-gray-900">Transfert #{transfer.id}</h2>
                              {getStatusBadge(transfer.status)}
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Euro className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                                <span className="font-medium">{transfer.amount} €</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                                <span>{formatDate(transfer.requestedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end gap-2 mt-4 md:mt-0">
                            {transfer.isValidatedByClient ? (
                              <>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Validé
                                </span>
                                <button
                                  onClick={() => generateInvoiceForTransfer(transfer.id)}
                                  className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                  <FileCheck className="w-4 h-4 mr-2" />
                                  Générer la facture
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleValidation(transfer.id)}
                                className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Valider le transfert
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              {/* Monthly Invoice Generator */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <CalendarRange className="w-5 h-5 text-green-500 mr-2" />
                    Générer une facture mensuelle
                  </h2>
                </div>
                <div className="p-5">
                  {availableMonths.length === 0 ? (
                    <p className="text-gray-600">Aucun mois disponible pour générer une facture.</p>
                  ) : (
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionner un mois</label>
                        <select
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          value={`${selectedMonth}-${selectedYear}`}
                          onChange={(e) => {
                            const [month, year] = e.target.value.split("-").map(Number)
                            setSelectedMonth(String(month))
                            setSelectedYear(String(year))
                          }}
                        >
                          <option value="">Choisir un mois</option>
                          {availableMonths.map(({ month, year }) => (
                            <option key={`${month}-${year}`} value={`${month}-${year}`}>
                              {new Date(year, month - 1).toLocaleString("fr-FR", { month: "long" })} {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={generateMonthlyInvoice}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
                      >
                        <FileCheck className="w-4 h-4 mr-2" />
                        Générer la facture
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoices List */}
              {invoices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune facture trouvée</h3>
                  <p className="text-gray-500 mb-6">Vous n'avez pas encore de factures générées.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {invoices.map((invoice) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-sm overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <FileText className="w-5 h-5" />
                            </div>
                            {invoice.paymentStatus ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Payée
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Non payée
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Facture n°{invoice.invoiceNumber}
                          </h3>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Euro className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>Montant: {invoice.totalAmount} €</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>Date: {formatDate(invoice.issueDate)}</span>
                            </div>
                          </div>

                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${invoice.id}`}
                            className="inline-flex items-center w-full justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger PDF
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
