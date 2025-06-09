"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Eye, Loader2 } from "lucide-react"
import Link from "next/link"

interface Annonce {
  id: number
  title: string
  additionalInformation: string
  advertisementPhoto: string
  advertisementPrice: number
  advertisementBeginning: string
  advertisementEnd: string
  publicationDate: string
  status: string
  users: {
    id: number
    userFirstName: string
    userLastName: string
    email: string
  }
}

export default function AdminAnnonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [filtered, setFiltered] = useState<Annonce[]>([])

  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchAnnonces = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token manquant")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Erreur lors du chargement des annonces")

        setAnnonces(Array.isArray(data) ? data : [])
        setFiltered(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err.message || "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnonces()
  }, [])

  useEffect(() => {
    const filteredList = annonces.filter((a) => {
      const matchesStatus = selectedStatus === "all" || a.status === selectedStatus
      const matchesUser =
        !userFilter ||
        a.users?.email?.toLowerCase().includes(userFilter.toLowerCase()) ||
        `${a.users?.userFirstName} ${a.users?.userLastName}`.toLowerCase().includes(userFilter.toLowerCase())
      const matchesDate =
        !dateFilter || new Date(a.publicationDate).toISOString().slice(0, 10) === dateFilter
      return matchesStatus && matchesUser && matchesDate
    })

    setFiltered(filteredList)
  }, [selectedStatus, userFilter, dateFilter, annonces])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Toutes les annonces</h1>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
            <option value="pending">En attente</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par utilisateur</label>
          <input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Nom, prénom ou email"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin w-10 h-10 text-green-500" />
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center mb-6">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="text-center text-gray-500 py-8">Aucune annonce trouvée avec ces filtres.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((annonce) => (
          <div key={annonce.id} className="bg-white shadow-sm rounded-xl p-5 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Annonce #{annonce.id} – {annonce.title}
            </h2>

            {/* Photo */}
            {annonce.advertisementPhoto && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${annonce.advertisementPhoto}`}
                alt="photo"
                className="w-full h-48 object-cover rounded mb-3"
              />
            )}

            {/* Infos utilisateur */}
            <p className="text-sm text-gray-600 mb-1">
              Client : <strong>{annonce.users?.userFirstName} {annonce.users?.userLastName}</strong> (ID: {annonce.users?.id})
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Email : {annonce.users?.email}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-1">
              Description : {annonce.additionalInformation || "—"}
            </p>

            {/* Prix */}
            <p className="text-sm text-gray-600 mb-1">
              Prix : <strong>{annonce.advertisementPrice} €</strong>
            </p>

            {/* Dates */}
            <p className="text-sm text-gray-600 mb-1">
              Période de livraison : du {annonce.advertisementBeginning} au {annonce.advertisementEnd}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Publiée le : {new Date(annonce.publicationDate).toLocaleDateString("fr-FR")}
            </p>

            {/* Statut */}
            <p className="text-sm text-gray-600 mb-4">
              Statut : <span className="capitalize font-medium">{annonce.status}</span>
            </p>

            {/* Lien vers détail */}
            <Link
              href={`/dashboard/admin/annonces/${annonce.id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir détail
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
