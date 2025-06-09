"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminAnnonceDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [annonce, setAnnonce] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Erreur de chargement de l'annonce")
        setAnnonce(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnonce()
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce et ses colis ?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erreur lors de la suppression")
      alert("Annonce supprimée avec succès")
      router.push("/dashboard/admin/annonces")
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <p className="p-4">Chargement...</p>
  if (error) return <p className="p-4 text-red-600">Erreur : {error}</p>
  if (!annonce) return <p className="p-4">Annonce introuvable.</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Détail de l'annonce #{annonce.id}</h1>

      {/* Photo */}
      {annonce.advertisementPhoto ? (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${annonce.advertisementPhoto}`}
          alt="photo"
          className="w-full max-h-96 object-cover rounded-lg"
        />
      ) : (
        <p className="text-gray-500">Aucune photo disponible.</p>
      )}

      {/* Informations générales */}
      <div className="space-y-1 text-gray-700">
        <p><strong>Titre :</strong> {annonce.title || "—"}</p>
        <p><strong>Description :</strong> {annonce.additionalInformation || "—"}</p>
        <p><strong>Prix :</strong> {annonce.advertisementPrice ?? "N/A"} €</p>
        <p><strong>Date de publication :</strong> {new Date(annonce.publicationDate).toLocaleDateString("fr-FR")}</p>
        <p><strong>Début :</strong> {annonce.advertisementBeginning || "N/A"}</p>
        <p><strong>Fin :</strong> {annonce.advertisementEnd || "N/A"}</p>
        <p><strong>Statut :</strong> {annonce.advertisementStatus || "—"}</p>
        <p><strong>Validée :</strong> {annonce.isValidated ? "Oui" : "Non"}</p>
        <p><strong>Rôle créateur :</strong> {annonce.creatorRole || "N/A"}</p>
      </div>

      {/* Utilisateur */}
      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-2">Informations du client</h2>
        {annonce.users ? (
          <div className="text-gray-700 space-y-1">
            <p><strong>Nom :</strong> {annonce.users.userFirstName} {annonce.users.userLastName}</p>
            <p><strong>Email :</strong> {annonce.users.email}</p>
            <p><strong>ID utilisateur :</strong> {annonce.users.id}</p>
          </div>
        ) : (
          <p className="text-gray-500">Aucun utilisateur lié à cette annonce.</p>
        )}
      </div>

      {/* Colis */}
      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-2">Colis associés</h2>
        {annonce.packages?.length > 0 ? (
          annonce.packages.map((pkg: any) => (
            <div key={pkg.id} className="bg-gray-50 border rounded-lg p-4 mb-3 text-sm">
              <p><strong>Objet :</strong> {pkg.packageName}</p>
              <p><strong>Quantité :</strong> {pkg.packageQuantity}</p>
              <p><strong>Poids :</strong> {pkg.packageWeight} kg</p>
              <p><strong>Dimensions :</strong> {pkg.packageDimension}</p>
              <p>
                <strong>Trajet :</strong>{" "}
                {pkg.localisations?.[0]?.currentCity || "?"} →{" "}
                {pkg.localisations?.[0]?.destinationCity || "?"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun colis associé.</p>
        )}
      </div>

      {/* Boutons actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Link
          href="/dashboard/admin/annonces"
          className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
        >
          ← Retour à la liste
        </Link>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Supprimer l'annonce
        </button>
      </div>
    </div>
  )
}
