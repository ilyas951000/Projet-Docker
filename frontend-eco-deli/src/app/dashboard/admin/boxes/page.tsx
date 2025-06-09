"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface Local {
  id: number
  city: string
  address: string
}

interface User {
  id: number
  name: string
  email: string
}

interface Package {
  id: number
  packageName: string
}

interface Reservation {
  id: number
  startDate: string
  endDate: string
  client?: User
  package?: Package
}

interface Box {
  id: number
  label: string
  size: string
  status: string
  local: Local
  reservations: Reservation[]
}

const defaultNewBox: Partial<Box> = {
  label: "",
  size: "small",
  status: "available",
  local: { id: 0, city: "", address: "" },
}

export default function AdminBoxesPage() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [locals, setLocals] = useState<Local[]>([])
  const [filterLocalId, setFilterLocalId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBox, setEditingBox] = useState<Partial<Box>>(defaultNewBox)

  const fetchData = async () => {
    const res = await fetch("http://localhost:3001/boxes/admin/all")
    const data = await res.json()
    setBoxes(data)

    const resLocals = await fetch("http://localhost:3001/locals")
    const dataLocals = await resLocals.json()
    setLocals(dataLocals)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Confirmer la suppression ?")
    if (!confirmed) return

    const res = await fetch(`http://localhost:3001/boxes/admin/${id}`, { method: "DELETE" })
    if (res.ok) {
      fetchData()
    } else {
      alert("Erreur : impossible de supprimer cette box.")
    }
  }

  const handleAdminCancel = async (reservationId: number) => {
    const confirmed = window.confirm("Confirmer l'annulation de cette réservation ?")
    if (!confirmed) return

    const res = await fetch(`http://localhost:3001/reservations/admin/${reservationId}/cancel`, {
      method: "POST"
    })

    if (res.ok) {
      alert("Réservation annulée.")
      fetchData()
    } else {
      const text = await res.text()
      alert("Erreur : " + text)
    }
  }

  const handleSubmit = async () => {
    const method = editingBox.id ? "PATCH" : "POST"
    const url = editingBox.id
      ? `http://localhost:3001/boxes/admin/${editingBox.id}`
      : `http://localhost:3001/boxes`

    const body = {
      label: editingBox.label,
      size: editingBox.size,
      status: editingBox.status,
      localId: editingBox.local?.id,
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setShowForm(false)
      setEditingBox(defaultNewBox)
      fetchData()
    } else {
      const text = await res.text()
      alert("Erreur : " + text)
    }
  }

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("fr-FR").format(new Date(date))

  const filteredBoxes = boxes.filter(box =>
    filterLocalId ? box.local.id === filterLocalId : true
  )

  const reservedBoxes = filteredBoxes.filter(box => box.reservations.length > 0)
  const freeBoxes = filteredBoxes.filter(box => box.reservations.length === 0)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Administration des Box</h1>

      <div className="mb-6">
        <label className="block mb-1">Filtrer par local :</label>
        <select
          value={filterLocalId ?? ""}
          onChange={e => setFilterLocalId(Number(e.target.value) || null)}
          className="border rounded p-2"
        >
          <option value="">-- Tous les locaux --</option>
          {locals.map(local => (
            <option key={local.id} value={local.id}>
              {local.city}
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 1 : Box réservées */}
      <h2 className="text-xl font-semibold mb-2">🔒 Box Réservées</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {reservedBoxes.map(box => (
          <div key={box.id} className="border p-4 rounded bg-gray-100 shadow">
            <p><strong>Box #{box.id}</strong> - {box.label}</p>
            <p>📏 Taille : {box.size}</p>
            <p>🏷️ Statut : {box.status}</p>
            <p>🏬 Local : {box.local.city}</p>
            <div className="mt-3">
              {box.reservations.map((r, i) => (
                <div key={i} className="border-t mt-2 pt-2 text-sm">
                  {r.client ? (
                    <p>👤 {r.client.name || r.client.email}</p>
                  ) : (
                    <p className="text-red-500">Client inconnu</p>
                  )}
                  <p>📦 {r.package?.packageName || "Aucun colis"}</p>
                  <p>📅 {formatDate(r.startDate)} → {formatDate(r.endDate)}</p>
                  <button
                    onClick={() => handleAdminCancel(r.id)}
                    className="mt-2 bg-red-600 text-white px-3 py-1 text-sm rounded"
                  >
                    Annuler la réservation
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2 : Gestion des box disponibles */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">🛠️ Gérer les Box Disponibles</h2>
        <button
          onClick={() => {
            setEditingBox(defaultNewBox)
            setShowForm(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Nouvelle Box
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {freeBoxes.map(box => (
          <div key={box.id} className="border p-4 rounded shadow">
            <p><strong>Box #{box.id}</strong> - {box.label}</p>
            <p>📏 Taille : {box.size}</p>
            <p>🏷️ Statut : {box.status}</p>
            <p>🏬 Local : {box.local.city}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setEditingBox(box)
                  setShowForm(true)
                }}
                className="bg-yellow-400 text-black px-3 py-1 rounded text-sm"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(box.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FORMULAIRE AJOUT / MODIF */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingBox.id ? "Modifier Box" : "Ajouter Box"}
            </h2>

            <label>Label :</label>
            <input
              type="text"
              className="w-full mb-3 border rounded p-2"
              value={editingBox.label || ""}
              onChange={e => setEditingBox({ ...editingBox, label: e.target.value })}
            />

            <label>Taille :</label>
            <select
              className="w-full mb-3 border rounded p-2"
              value={editingBox.size || "small"}
              onChange={e => setEditingBox({ ...editingBox, size: e.target.value })}
            >
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
            </select>

            <label>Statut :</label>
            <select
              className="w-full mb-3 border rounded p-2"
              value={editingBox.status || "available"}
              onChange={e => setEditingBox({ ...editingBox, status: e.target.value })}
            >
              <option value="available">Disponible</option>
              <option value="reserved">Réservée</option>
              <option value="occupied">Occupée</option>
            </select>

            <label>Local :</label>
            <select
              className="w-full mb-4 border rounded p-2"
              value={editingBox.local?.id || ""}
              onChange={e =>
                setEditingBox({
                  ...editingBox,
                  local: locals.find(l => l.id === Number(e.target.value)),
                })
              }
            >
              <option value="">-- Sélectionner un local --</option>
              {locals.map(local => (
                <option key={local.id} value={local.id}>
                  {local.city}
                </option>
              ))}
            </select>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              {editingBox.id ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
