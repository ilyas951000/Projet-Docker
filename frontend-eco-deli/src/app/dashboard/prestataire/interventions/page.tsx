'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface IIntervention {
  id: number;
  type: string;
  description: string;
  prix: number;
  statut: string;
}

export default function PrestataireInterventionsPage() {
  const [mounted, setMounted] = useState(false);
  const [interventions, setInterventions] = useState<IIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatut, setSelectedStatut] = useState<string>(''); // Statut sélectionné pour filtrer

  const possibleStatus = ['en_attente', 'en_cours', 'terminee', 'annulee'];

  useEffect(() => {
    setMounted(true);

    const fetchInterventions = async () => {
      try {
        const url = selectedStatut
          ? `http://localhost:3001/interventions/statut/${selectedStatut}`
          : 'http://localhost:3001/interventions'; // Si aucun filtre, récupérer toutes les interventions
        const response = await axios.get(url);
        setInterventions(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des interventions :', err);
        setError('Impossible de charger les interventions.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, [selectedStatut]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:3001/interventions/${id}/statut`, {
        statut: newStatus,
      });

      setInterventions((prev) =>
        prev.map((intervention) =>
          intervention.id === id ? { ...intervention, statut: newStatus } : intervention
        )
      );

      alert('Statut mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut :', err);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  if (!mounted) return null;
  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Mes Interventions</h1>

      {/* Filtre par statut */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Filtrer par statut :</label>
        <select
          value={selectedStatut}
          onChange={(e) => setSelectedStatut(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">Tous les statuts</option>
          {possibleStatus.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {interventions.length === 0 ? (
        <p>Aucune intervention pour le moment.</p>
      ) : (
        <ul className="space-y-6">
          {interventions.map((intervention) => (
            <li key={intervention.id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{intervention.type}</h2>
              <p className="text-gray-700">{intervention.description}</p>
              <p className="font-semibold">Prix : {intervention.prix} €</p>

              <div className="mt-4">
                <label className="block mb-2 font-semibold">
                  Statut actuel : {intervention.statut}
                </label>

                <select
                  value={intervention.statut}
                  onChange={(e) => handleStatusChange(intervention.id, e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  {possibleStatus.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
