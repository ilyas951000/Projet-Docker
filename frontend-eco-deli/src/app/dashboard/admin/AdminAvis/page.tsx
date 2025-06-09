"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface Rate {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  client: User;
  provider: User;
}

export default function AdminRates() {
  const [rates, setRates] = useState<Rate[]>([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/rates", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setRates(data);
        } else {
          console.error("Réponse inattendue :", data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des évaluations :", err);
      }
    };

    fetchRates();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">⭐ Suivi des évaluations des prestataires</h1>

      {rates.length === 0 ? (
        <p>Aucune évaluation disponible.</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Note</th>
              <th className="border px-3 py-2">Commentaire</th>
              <th className="border px-3 py-2">Client</th>
              <th className="border px-3 py-2">Prestataire</th>
              <th className="border px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id}>
                <td className="border px-3 py-2">{rate.id}</td>
                <td className="border px-3 py-2">{rate.rating} / 5</td>
                <td className="border px-3 py-2">{rate.comment}</td>
                <td className="border px-3 py-2">
                  {rate.client
                    ? `${rate.client.userFirstName} ${rate.client.userLastName} (ID: ${rate.client.id})`
                    : `ID ${rate.client?.id}`}
                </td>
                <td className="border px-3 py-2">
                  {rate.provider
                    ? `${rate.provider.userFirstName} ${rate.provider.userLastName} (ID: ${rate.provider.id})`
                    : `ID ${rate.provider?.id}`}
                </td>
                <td className="border px-3 py-2">
                  {new Date(rate.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
