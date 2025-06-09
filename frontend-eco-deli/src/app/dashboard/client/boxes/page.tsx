// Adaptation complète du composant React avec association de package à la réservation et affichage du colis associé dans l'historique

"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface Local {
  id: number
  city: string
  address: string
  capacity: number
  active: boolean
}

interface Box {
  id: number
  size: string
  status: string
  local: Local
}

interface Package {
  id: number
  packageName: string
}

interface Reservation {
  id: number
  startDate: string
  endDate: string
  box: Box
  package?: Package
}

export default function BoxesPage() {
  const [locals, setLocals] = useState<Local[]>([])
  const [boxesMap, setBoxesMap] = useState<Record<number, Box[]>>({})
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null)
  const [selectedBox, setSelectedBox] = useState<Box | null>(null)
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [reservationMessage, setReservationMessage] = useState("")

  const [clientId, setClientId] = useState<number | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [reservationHistory, setReservationHistory] = useState<Reservation[]>([])

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setClientId(data.userId)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchLocalsAndBoxes = async () => {
      const res = await fetch("http://localhost:3001/locals")
      const localsData: Local[] = await res.json()
      setLocals(localsData)
      setSelectedLocalId(localsData[0]?.id || null)

      const map: Record<number, Box[]> = {}
      for (const local of localsData) {
        const resBoxes = await fetch(`http://localhost:3001/boxes/by-local/${local.id}`)
        const boxes = await resBoxes.json()
        map[local.id] = Array.isArray(boxes) ? boxes : []
      }
      setBoxesMap(map)
    }
    fetchLocalsAndBoxes()
  }, [])

  useEffect(() => {
    if (!clientId) return

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:3001/reservations/user/${clientId}`)
        const history = await res.json()
        if (Array.isArray(history)) {
          setReservationHistory(history)
        } else {
          console.error("Réponse invalide :", history)
          setReservationHistory([])
        }
      } catch (error) {
        console.error("Erreur de récupération d'historique :", error)
        setReservationHistory([])
      }
    }

    const fetchPackages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/packages/user/${clientId}`)
        const data = await res.json()
        if (Array.isArray(data)) setPackages(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des colis", error)
      }
    }

    fetchHistory()
    fetchPackages()
  }, [clientId])

  const handleReserve = async () => {
    if (!selectedBox || !startDate || !endDate || !clientId || !selectedPackageId) return

    const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    if (diff > 10) {
      setReservationMessage("⛔ Durée max 10 jours")
      return
    }

    const res = await fetch(`http://localhost:3001/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boxId: selectedBox.id,
        userId: clientId,
        startDate,
        endDate,
        packageId: selectedPackageId,
      }),
    })

    if (res.ok) {
      setReservationMessage("✅ Réservation réussie")
      setSelectedBox(null)
    } else {
      const error = await res.text()
      setReservationMessage("Erreur : " + error)
    }
  }

  const handleCancel = async (reservationId: number) => {
    const res = await fetch(`http://localhost:3001/reservations/${reservationId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: clientId }),
    })
    if (res.ok) {
      setReservationHistory(prev => prev.filter(r => r.id !== reservationId))
    }
  }

  const formatDate = (date: string) => {
    try {
      return new Intl.DateTimeFormat("fr-FR").format(new Date(date))
    } catch {
      return date
    }
  }

  const boxList = boxesMap[selectedLocalId ?? -1]
  const isBoxListValid = Array.isArray(boxList)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Réserver une Box</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          {locals.map(local => (
            <div
              key={local.id}
              onClick={() => setSelectedLocalId(local.id)}
              className={`p-4 rounded border cursor-pointer mb-2 ${selectedLocalId === local.id ? 'border-green-500' : 'border-gray-300'}`}
            >
              <p className="font-semibold">{local.city}</p>
              <p className="text-sm text-gray-500">{local.address}</p>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isBoxListValid ? (
              boxList.map(box => (
                <div key={box.id} className="p-4 bg-white shadow rounded border">
                  <p className="font-semibold">Box #{box.id}</p>
                  <p className="text-sm text-gray-600">Taille : {box.size}</p>
                  <button
                    className="mt-2 w-full bg-green-500 text-white py-1 rounded"
                    onClick={() => setSelectedBox(box)}
                  >
                    Réserver
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Aucune box trouvée.</p>
            )}
          </div>
        </div>
      </div>

      {selectedBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={() => setSelectedBox(null)}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-2">Réserver Box #{selectedBox.id}</h2>
            <label>Début</label>
            <input
              type="date"
              min={today} // ✅ bloque les dates passées
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full mb-2 border rounded p-2"
            />
            <label>Fin</label>
            <input
              type="date"
              min={today} // ✅ bloque les dates passées
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full mb-2 border rounded p-2"
            />
            <label>Colis à associer</label>
            <select
              value={selectedPackageId ?? ''}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
              className="w-full mb-4 border rounded p-2"
            >
              <option value="">-- Sélectionnez un colis --</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.packageName || `Colis #${pkg.id}`}</option>
              ))}
            </select>
            <button
              onClick={handleReserve}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Confirmer
            </button>
            {reservationMessage && <p className="mt-2 text-sm text-center text-red-500">{reservationMessage}</p>}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">📜 Historique</h2>
        {Array.isArray(reservationHistory) && reservationHistory.length === 0 ? (
          <p>Aucune réservation</p>
        ) : Array.isArray(reservationHistory) ? (
          <ul className="space-y-3">
            {reservationHistory.map(r => (
              <li key={r.id} className="bg-white p-4 rounded shadow">
                <p><strong>Box #{r.box.id}</strong> ({r.box.size}) à {r.box.local.city}</p>
                <p>📦 Colis associé : {r.package?.packageName || "Aucun"}</p>
                <p>📅 {formatDate(r.startDate)} → {formatDate(r.endDate)}</p>
                {new Date(r.startDate) > new Date() && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    Annuler
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">Erreur de chargement de l'historique</p>
        )}
      </div>
    </div>
  )
}
