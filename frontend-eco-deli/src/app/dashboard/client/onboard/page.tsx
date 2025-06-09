"use client";

import { useState } from "react";

export default function OnboardPage() {
  const [link, setLink] = useState<string>("");
  const [error, setError] = useState<string>("");
  // TODO : récupérer dynamiquement l'ID du prestataire authentifié
  const providerId = 36;

  const handleOnboard = async () => {
    setError("");
    try {
      // 1) Créer ou récupérer le compte Connect
      const res1 = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/connect/${providerId}/create-account`,
        { method: "POST" }
      );
      if (!res1.ok) throw new Error(`Erreur ${res1.status}`);
      await res1.json();

      // 2) Générer le lien d’onboarding
      const res2 = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/connect/${providerId}/onboard-link`
      );
      if (!res2.ok) throw new Error(`Erreur ${res2.status}`);
      const { url } = await res2.json();
      setLink(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Onboarding Stripe Connect</h1>

      {!link ? (
        <>
          <button
            onClick={handleOnboard}
            className="w-full bg-green-600 text-white p-3 rounded"
          >
            Démarrer l’onboarding
          </button>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </>
      ) : (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="w-full block text-center bg-blue-600 text-white p-3 rounded"
        >
          Remplir vos informations Stripe
        </a>
      )}
    </div>
  );
}
