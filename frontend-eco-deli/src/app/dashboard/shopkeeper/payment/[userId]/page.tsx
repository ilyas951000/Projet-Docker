"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function ClientPaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { userId } = useParams(); // ✅ Récupère le providerId depuis l'URL

  const [clientId, setClientId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(50);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Récupérer l'ID du client connecté
  useEffect(() => {
    const fetchClient = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Utilisateur non connecté.");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.userId) {
          setClientId(data.userId);
        } else {
          throw new Error("Utilisateur non valide.");
        }
      } catch (err: any) {
        setMessage(err.message || "Erreur de connexion.");
      }
    };

    fetchClient();
  }, []);

  // Récupérer l'ID du prestataire depuis l'URL
  useEffect(() => {
    if (userId) {
      const id = parseInt(userId as string, 10);
      setProviderId(id);
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!stripe || !elements) {
      setMessage("Le module de paiement n'est pas prêt.");
      return;
    }
    if (!clientId || !providerId) {
      setMessage("Utilisateur introuvable.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, providerId, amount }),
      });

      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.message || "Erreur de paiement.");
      }

      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Champ carte introuvable.");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card },
      });

      if (result.error) throw new Error(result.error.message!);

      if (result.paymentIntent?.status === "succeeded") {
        setMessage("✅ Paiement réussi !");
        setAmount(0);
        elements.getElement(CardElement)?.clear();
      }
    } catch (err: any) {
      setMessage(err.message || "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Paiement vers le prestataire #{providerId}</h2>

      <label className="block mb-4 text-sm">
        Montant (€)
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="w-full border p-2 rounded"
          required
        />
      </label>

      <div className="mb-4">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>

      <button
        type="submit"
        disabled={loading || !clientId || !providerId}
        className="w-full bg-blue-600 text-white p-3 rounded disabled:opacity-50"
      >
        {loading ? "Traitement…" : `Payer ${amount.toFixed(2)} €`}
      </button>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </form>
  );
}
