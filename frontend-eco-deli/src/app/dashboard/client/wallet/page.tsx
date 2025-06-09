"use client";

import { useState, useEffect } from "react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: string;
  issueDate: string;
  paymentStatus: boolean;
}

export default function WalletPage() {
  const [providerId, setProviderId] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [hasIban, setHasIban] = useState<boolean>(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Utilisateur non connecté.");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.userId) {
          setProviderId(data.userId);
          if (!data.stripeAccountId) {
            setHasIban(false);
          }
        } else {
          setMessage("Utilisateur invalide.");
        }
      })
      .catch(() => setMessage("Erreur lors de la récupération de l'utilisateur."));
  }, []);

  useEffect(() => {
    if (!providerId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/provider/${providerId}/balance`)
      .then((res) => res.json())
      .then((data) => {
        if (data.balance !== undefined) setBalance(data.balance);
      })
      .catch(() => setMessage("Erreur lors du chargement du solde."));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/provider/${providerId}/pending-balance`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pending !== undefined) setPendingBalance(data.pending);
      })
      .catch(() => setMessage("Erreur lors du chargement du solde en attente."));

    fetchInvoices();
  }, [providerId]);

  const fetchInvoices = () => {
    if (!providerId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/provider/${providerId}/history`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data);
        else setMessage("⚠️ Aucune facture disponible ou réponse inattendue.");
      })
      .catch(() => setMessage("Erreur lors du chargement des factures."));
  };

  const handleTransfer = async () => {
    if (!providerId || amount <= 0) return;
    setMessage("Envoi en cours...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/provider/${providerId}/transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const result = await res.json();
      setMessage(`✅ ${result.message || "Virement effectué avec succès."}`);
      setBalance((b) => b - amount);
      setAmount(0);
    } catch (err: any) {
      setMessage(err.message || "Erreur inattendue.");
    }
  };

  

  const generateMonthlyInvoice = async () => {
    if (!selectedMonth || !selectedYear) {
      alert("Veuillez remplir mois et année");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/generate/monthly/provider/${providerId}?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();

      if (data?.invoiceId) {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${data.invoiceId}`, "_blank");
        fetchInvoices(); // mise à jour
      } else {
        alert("Aucune facture créée.");
      }
    } catch (err) {
      alert("Erreur lors de la génération de la facture.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">💼 Mon Portefeuille</h1>

      {providerId ? (
        <>
          <p className="mb-2 text-lg">
            Solde disponible : <strong>€{balance.toFixed(2)}</strong>
          </p>
          <p className="mb-4 text-sm text-gray-600">
            Solde en attente : <strong>€{pendingBalance.toFixed(2)}</strong>
          </p>

          {!hasIban && (
            <div className="mb-4 bg-yellow-50 p-4 rounded">
              <p className="mb-2 text-sm">
                📎 Vous devez compléter vos informations Stripe pour recevoir des virements.
              </p>
              <button
                onClick={async () => {
                  setMessage("Redirection vers Stripe...");
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-express-account`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({ userId: providerId }),
                    });

                    if (!res.ok) throw new Error(await res.text());

                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      setMessage("Erreur : lien Stripe non reçu.");
                    }
                  } catch (err: any) {
                    setMessage(err.message || "Erreur lors de la redirection.");
                  }
                }}
                className="w-full bg-blue-600 text-white p-2 rounded"
              >
                Compléter mes infos de paiement
              </button>
            </div>
          )}


          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full border p-2 rounded mb-4"
            placeholder="Montant à virer"
          />

          <button
            onClick={handleTransfer}
            disabled={amount <= 0 || amount > balance || !hasIban}
            className="w-full bg-green-600 text-white p-3 rounded disabled:opacity-50"
          >
            Demander virement
          </button>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">📜 Mes Factures</h2>
            {invoices.length === 0 ? (
              <p>Aucune facture trouvée.</p>
            ) : (
              <ul className="space-y-4">
                {invoices.map((inv) => (
                  <li key={inv.id} className="border p-4 rounded shadow">
                    <p>Facture n°{inv.invoiceNumber}</p>
                    <p>Montant : {inv.totalAmount} €</p>
                    <p>Date : {new Date(inv.issueDate).toLocaleDateString()}</p>
                    <p>Statut : {inv.paymentStatus ? "✅ Payé" : "❌ Non payé"}</p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/invoices/pdf/${inv.id}`}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Télécharger PDF
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Génération mensuelle */}
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Générer une facture mensuelle</h3>
            <div className="flex space-x-4 mb-4">
              <input
                type="number"
                min="1"
                max="12"
                placeholder="Mois (1-12)"
                className="border px-2 py-1 rounded"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                placeholder="Année"
                className="border px-2 py-1 rounded"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              />
              <button
                onClick={generateMonthlyInvoice}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Générer
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>Chargement du profil...</p>
      )}

      {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
    </div>
  );
}
