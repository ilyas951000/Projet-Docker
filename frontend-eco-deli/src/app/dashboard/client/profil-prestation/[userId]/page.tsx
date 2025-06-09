'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

interface IProfile {
  id: number;
  prestationType: string;
  price: number;
  description: string;
  zoneIntervention?: string;
  disponibilites?: string;
  biographie?: string;
  langues?: string;
  delaiReponse?: string;
  tempsMoyenIntervention?: string;
}

interface IUser {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface IRate {
  id: number;
  rating: number;
  comment: string | null;
  client: { id: number; name: string };
  createdAt: string;
}

export default function PublicProfileVitrine() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [rates, setRates] = useState<IRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('ID utilisateur manquant');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    // Fetch profile
    axios.get(`http://localhost:3001/public-profile/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProfile(res.data[0]);
        } else {
          setError('Profil introuvable');
        }
      })
      .catch(() => setError('Erreur lors du chargement du profil'))
      .finally(() => setLoading(false));

    // Fetch user info
    axios.get(`http://localhost:3001/users/${userId}`)
      .then(res => setUser(res.data))
      .catch(() => console.error('Impossible de charger les informations utilisateur'));

    // Fetch evaluations
    axios.get(`http://localhost:3001/rates/provider/${userId}`)
      .then(res => setRates(res.data))
      .catch(() => console.error('Impossible de charger les évaluations'));
  }, [userId]);

  const averageRating = rates.length
    ? (rates.reduce((sum, r) => sum + r.rating, 0) / rates.length).toFixed(1)
    : null;

  if (loading) return <p>Chargement du profil…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!profile) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">
        {user ? `${user.userFirstName} ${user.userLastName}` : 'Prestataire'}
      </h1>
      <div className="space-y-3 mb-6">
        <p><span className="font-semibold">Type de prestation :</span> {profile.prestationType}</p>
        <p><span className="font-semibold">Prix :</span> {profile.price}€</p>
        <p><span className="font-semibold">Description :</span> {profile.description}</p>
        {profile.zoneIntervention && <p><span className="font-semibold">Zone d’intervention :</span> {profile.zoneIntervention}</p>}
        {profile.disponibilites && <p><span className="font-semibold">Disponibilités :</span> {profile.disponibilites}</p>}
        {profile.biographie && <p><span className="font-semibold">Biographie :</span> {profile.biographie}</p>}
        {profile.langues && <p><span className="font-semibold">Langues parlées :</span> {profile.langues}</p>}
        {profile.delaiReponse && <p><span className="font-semibold">Délai de réponse :</span> {profile.delaiReponse}</p>}
        {profile.tempsMoyenIntervention && <p><span className="font-semibold">Temps moyen d’intervention :</span> {profile.tempsMoyenIntervention}</p>}
      </div>

      {/* Évaluations */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Évaluations</h2>
        {averageRating && (
          <p className="mb-2 text-lg">Note moyenne : <span className="font-bold">{averageRating}/5</span></p>
        )}
        {rates.length === 0 ? (
          <p>Aucune évaluation reçue pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {rates.map(rate => (
              <li key={rate.id} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{rate.client.name}</span>
                  <span>⭐ {rate.rating}/5</span>
                </div>
                {rate.comment && <p className="italic mt-2">“{rate.comment}”</p>}
                <p className="text-sm text-gray-500 mt-1">{new Date(rate.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
