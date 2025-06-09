"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"

interface IMovement {
  id: number
  originStreet: string
  originCity: string
  originPostalCode: number
  destinationStreet: string
  destinationCity: string
  destinationPostalCode: number
  active: boolean
}

export default function MovementsPage() {
  const [mounted, setMounted] = useState(false)
  const [livreurId, setLivreurId] = useState<number | null>(null)
  const [movements, setMovements] = useState<IMovement[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    originStreet: "",
    originCity: "",
    originPostalCode: "",
    destinationStreet: "",
    destinationCity: "",
    destinationPostalCode: "",
  })

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Token manquant")
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3001/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setLivreurId(res.data.userId)
      } catch (err) {
        setError("Erreur récupération utilisateur")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (livreurId) fetchMovements()
  }, [livreurId])

  const fetchMovements = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/movements/user/${livreurId}`)
      setMovements(res.data)
    } catch (err) {
      setError("Erreur chargement des trajets")
    }
  }

  const handleDeactivate = async (id: number) => {
    try {
      await axios.patch(`http://localhost:3001/movements/${id}/deactivate`)
      fetchMovements()
    } catch (err) {
      alert("Erreur lors de la désactivation du trajet")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!livreurId) return

    try {
      await axios.post("http://localhost:3001/movements", {
        userId: livreurId,
        ...form,
        originPostalCode: Number.parseInt(form.originPostalCode, 10),
        destinationPostalCode: Number.parseInt(form.destinationPostalCode, 10),
      })
      setForm({
        originStreet: "",
        originCity: "",
        originPostalCode: "",
        destinationStreet: "",
        destinationCity: "",
        destinationPostalCode: "",
      })
      fetchMovements()
    } catch (err) {
      alert("Erreur lors de l'ajout du trajet")
    }
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mes Trajets</h1>
        <p className="text-gray-500">Ajoutez et gérez vos trajets pour trouver des colis sur votre route</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <h3 className="font-medium">Erreur</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="inline-block w-8 h-8 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center mr-2">
                +
              </span>
              Ajouter un Trajet
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="border border-gray-200 p-4 rounded-md bg-gray-50">
                <legend className="font-medium text-sm px-2 bg-gray-50 text-gray-700">Départ</legend>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="originStreet" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      id="originStreet"
                      type="text"
                      name="originStreet"
                      placeholder="Rue, numéro..."
                      value={form.originStreet}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="originCity" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        id="originCity"
                        type="text"
                        name="originCity"
                        placeholder="Ville"
                        value={form.originCity}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="originPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        id="originPostalCode"
                        type="number"
                        name="originPostalCode"
                        placeholder="Code postal"
                        value={form.originPostalCode}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="border border-gray-200 p-4 rounded-md bg-gray-50">
                <legend className="font-medium text-sm px-2 bg-gray-50 text-gray-700">Arrivée</legend>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="destinationStreet" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      id="destinationStreet"
                      type="text"
                      name="destinationStreet"
                      placeholder="Rue, numéro..."
                      value={form.destinationStreet}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="destinationCity" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        id="destinationCity"
                        type="text"
                        name="destinationCity"
                        placeholder="Ville"
                        value={form.destinationCity}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="destinationPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        id="destinationPostalCode"
                        type="number"
                        name="destinationPostalCode"
                        placeholder="Code postal"
                        value={form.destinationPostalCode}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                Ajouter ce trajet
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="inline-block w-8 h-8 bg-green-100 rounded-full text-green-600 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Trajets Actifs
              </h2>

              {movements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">Aucun trajet actif</p>
                  <p className="text-sm">Ajoutez un trajet pour trouver des colis sur votre route</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {movements.map((m) => (
                    <li
                      key={m.id}
                      className="border border-gray-200 p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors relative"
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-start">
                          <div className="bg-blue-100 text-blue-600 rounded-full p-1.5 mr-3 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Départ</p>
                            <p className="text-gray-600 text-sm">
                              {m.originStreet}, {m.originPostalCode} {m.originCity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-green-100 text-green-600 rounded-full p-1.5 mr-3 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Arrivée</p>
                            <p className="text-gray-600 text-sm">
                              {m.destinationStreet}, {m.destinationPostalCode} {m.destinationCity}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => handleDeactivate(m.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Désactiver
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
