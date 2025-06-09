'use client';

import { useState } from 'react';

interface ReservationModalProps {
  providerId: number;
  clientId: number;
  prestationType: string;
  onClose: () => void;
}

export default function ReservationModal({ providerId, clientId, prestationType, onClose }: ReservationModalProps) {
  const [prix, setPrix] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/intervention', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prestataireId: providerId,
            clientId,
            type: prestationType,
            prix: parseFloat(prix),
            commentaireClient: description, // ✅ bon champ
        }),
      });

      if (!res.ok) throw new Error('Échec de la réservation');

      setSuccess(true);
    } catch (err) {
      setError('Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 text-xl">&times;</button>

        <h2 className="text-xl font-semibold mb-4">Réserver cette prestation</h2>

        {success ? (
          <p className="text-green-600 font-medium">✅ Réservation envoyée avec succès !</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block font-medium">Prix proposé (€)</label>
              <input
                type="number"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="border p-2 w-full rounded"
                min={0}
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium">Message pour le prestataire</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 w-full rounded"
                rows={4}
              />
            </div>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
