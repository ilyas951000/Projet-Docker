"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface IPackage {
  id: number;
  packageName?: string;
  packageWeight?: number;
  packageDimension?: string;
  packageDescription?: string;
  senderAddress?: string;
  recipientAddress?: string;
  packageRequirements?: string;
  isPaid?: boolean;
}

export default function ClientPackagesPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientAndPackages = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      try {
        // Récupérer l'utilisateur
        const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();

        if (!resUser.ok || !userData.userId) {
          throw new Error("Utilisateur non valide.");
        }

        const userId = userData.userId;
        setClientId(userId);

        // Récupérer les colis non payés du client
        const resPackages = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/client/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const packageData = await resPackages.json();
        if (!resPackages.ok) throw new Error(packageData.message || "Erreur de récupération des colis.");

        const unpaidPackages = packageData.filter((pkg: IPackage) => !pkg.isPaid);
        setPackages(unpaidPackages);
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientAndPackages();
  }, []);

  if (loading) return <p className="text-center mt-6">Chargement des colis...</p>;
  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Colis à payer</h1>
      {packages.length === 0 ? (
        <p className="text-gray-500">Aucun colis en attente de paiement.</p>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{pkg.packageName}</h2>
              <p><strong>Poids :</strong> {pkg.packageWeight} kg</p>
              <p><strong>Dimension :</strong> {pkg.packageDimension}</p>
              <p><strong>Description :</strong> {pkg.packageDescription}</p>
              <p><strong>Adresse d'envoi :</strong> {pkg.senderAddress}</p>
              <p><strong>Adresse de réception :</strong> {pkg.recipientAddress}</p>
              <p><strong>Exigences :</strong> {pkg.packageRequirements}</p>
              <p className="text-red-600 mt-2 font-medium">💳 Paiement requis</p>

              <Link href={`/dashboard/shopkeeper/payments/${pkg.id}`}>
                <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Payer
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
