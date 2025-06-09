"use client";

import { useEffect, useState, ChangeEvent } from "react";

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface Virement {
  id: number;
  amount: number;
  stripePayoutId: string;
  createdAt: string;
  status: string;
  provider: User;
}

export default function AdminVirements() {
  const [virements, setVirements] = useState<Virement[]>([]);

  useEffect(() => {
    const fetchVirements = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/virements", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setVirements(data);
        } else {
          console.error("Réponse inattendue:", data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des virements:", err);
      }
    };

    fetchVirements();
  }, []);

  const updateStatus = async (id: number, status: 'accepte' | 'refuse') => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/virements/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Échec de la mise à jour du statut");

      const updated = await res.json();
      setVirements((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: updated.status } : v))
      );
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💸 Gestion des virements</h1>

      {virements.length === 0 ? (
        <p>Aucun virement trouvé.</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Prestataire</th>
              <th className="border px-3 py-2">Montant (€)</th>
              <th className="border px-3 py-2">Stripe ID</th>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Statut</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {virements.map((v) => (
              <tr key={v.id}>
                <td className="border px-3 py-2">{v.id}</td>
                <td className="border px-3 py-2">
                  {v.provider
                    ? `${v.provider.userFirstName} ${v.provider.userLastName} (ID: ${v.provider.id})`
                    : `ID ${v.provider?.id}`}
                </td>
                <td className="border px-3 py-2">{Number(v.amount).toFixed(2)}</td>
                <td className="border px-3 py-2">{v.stripePayoutId}</td>
                <td className="border px-3 py-2">{new Date(v.createdAt).toLocaleString()}</td>
                <td className="border px-3 py-2">{v.status}</td>
                <td className="border px-3 py-2 space-x-2 text-center">
                  <button
                    onClick={() => updateStatus(v.id, 'accepte')}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => updateStatus(v.id, 'refuse')}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Refuser
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
