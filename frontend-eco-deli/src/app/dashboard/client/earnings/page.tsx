"use client";

import { useState, useEffect } from "react";

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<
    { id: number; amount: number; status: string }[]
  >([]);
  const [error, setError] = useState<string>("");
  // TODO : remplacer par l'ID du prestataire authentifié
  const providerId = 36;

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/provider/${providerId}/earnings`
        );
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        setEarnings(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchEarnings();
  }, [providerId]);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Vos gains</h1>
      {error && <p className="text-red-600">{error}</p>}
      {!error && (
        <ul className="space-y-2">
          {earnings.map((tx) => (
            <li key={tx.id} className="border-b pb-2">
              Montant : €{tx.amount.toFixed(2)} — Statut : {tx.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
