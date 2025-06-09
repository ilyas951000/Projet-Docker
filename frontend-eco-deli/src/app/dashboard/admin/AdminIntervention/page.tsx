"use client";

import { useEffect, useState, ChangeEvent } from 'react';

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface Intervention {
  id: number;
  prestataireId: number;
  clientId?: number;
  type: string;
  description?: string;
  date: string;
  statut: string;
  prix: number;
  commentaireClient?: string;
  createdAt: string;
  updatedAt: string;
  prestataire?: User;
  client?: User;
}

export default function InterventionTracking() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'type' | 'prix' | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/intervention', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setInterventions(data);
        } else {
          console.error("Format inattendu :", data);
        }
      } catch (err) {
        console.error("Erreur récupération des interventions :", err);
      }
    };

    fetchInterventions();
  }, []);

  const filtered = interventions.filter((intervention) => {
    return filterStatus === 'all' || intervention.statut === filterStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    let aValue = a[sortKey];
    let bValue = b[sortKey];

    if (sortKey === 'prix') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }

    if (aValue < bValue) return sortAsc ? -1 : 1;
    if (aValue > bValue) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: 'type' | 'prix') => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getSortArrow = (key: 'type' | 'prix') => {
    if (sortKey !== key) return null;
    return <span className="ml-1">{sortAsc ? '▲' : '▼'}</span>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧹 Suivi des prestations de services à la personne</h1>

      <div className="mb-4">
        <label htmlFor="statut" className="mr-2 font-medium">Filtrer par statut :</label>
        <select
          id="statut"
          value={filterStatus}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">Tous</option>
          <option value="en_attente">En attente</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p>Aucune intervention trouvée.</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Prestataire</th>
              <th className="border px-4 py-2">Client</th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => toggleSort('type')}>
                Type{getSortArrow('type')}
              </th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Statut</th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => toggleSort('prix')}>
                Prix (€){getSortArrow('prix')}
              </th>
              <th className="border px-4 py-2">Commentaire client</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(inter => (
              <tr key={inter.id}>
                <td className="border px-4 py-2">{inter.id}</td>
                <td className="border px-4 py-2">
                  {inter.prestataire
                    ? `${inter.prestataire.userFirstName} ${inter.prestataire.userLastName} (ID: ${inter.prestataire.id})`
                    : `ID: ${inter.prestataireId}`}
                </td>
                <td className="border px-4 py-2">
                  {inter.client
                    ? `${inter.client.userFirstName} ${inter.client.userLastName} (ID: ${inter.client.id})`
                    : inter.clientId ? `ID: ${inter.clientId}` : '—'}
                </td>
                <td className="border px-4 py-2">{inter.type}</td>
                <td className="border px-4 py-2">{inter.description ?? '—'}</td>
                <td className="border px-4 py-2">{new Date(inter.date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{inter.statut}</td>
                <td className="border px-4 py-2">{Number(inter.prix).toFixed(2)}</td>
                <td className="border px-4 py-2">{inter.commentaireClient ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
