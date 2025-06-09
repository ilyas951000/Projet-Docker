"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaiementInterventionPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaiementForm />
    </Elements>
  );
}

function PaiementForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { interventionId } = useParams();

  const [amount, setAmount] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || !interventionId) {
        setMessage("Utilisateur ou intervention invalide.");
        return;
      }

      try {
        // Authentifier utilisateur
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (!userRes.ok || !userData.userId) {
          throw new Error("Utilisateur non valide.");
        }

        // Créer PaymentIntent
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/intervention/${interventionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok || !data.clientSecret || !data.amount) {
          throw new Error(data.message || "Erreur de préparation du paiement.");
        }

        setClientSecret(data.clientSecret);
        setAmount(data.amount / 100); // Stripe utilise des centimes
      } catch (err: any) {
        setMessage(err.message || "Erreur inattendue.");
      }
    };

    fetchData();
  }, [interventionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!stripe || !elements) {
      setMessage("Stripe non prêt.");
      return;
    }
    if (!clientSecret || !amount || !interventionId) {
      setMessage("Données manquantes.");
      return;
    }

    setLoading(true);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Champ carte introuvable.");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) throw new Error(result.error.message!);

      if (result.paymentIntent?.status === "succeeded") {
        setMessage("✅ Paiement réussi !");
        elements.getElement(CardElement)?.clear();

        // Marquer l'intervention comme payée dans la base
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intervention/${interventionId}/paid`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err: any) {
      setMessage(err.message || "Erreur de paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-4">
        Paiement intervention #{interventionId}
      </h2>

      <label className="block mb-4 text-sm">
        Montant (€)
        <input
          type="number"
          value={amount}
          readOnly
          className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
        />
      </label>

      <div className="mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#32325d",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#fa755a" },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !clientSecret}
        className="w-full bg-blue-600 text-white p-3 rounded disabled:opacity-50"
      >
        {loading ? "Paiement en cours…" : `Payer ${amount.toFixed(2)} €`}
      </button>

      {message && (
        <p className={`mt-4 text-center ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
