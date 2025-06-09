'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface IAdvertisement {
  id: number;
  advertisementItem: string;
  advertisementWeight: number;
  advertisementDimension: string;
  advertisementDescription: string;
  advertisementPrice: number;
  advertisementQuantity: number;
  advertisementPhoto?: string;
}

export default function Advertisements() {
  const [mounted, setMounted] = useState(false);
  const [advertisements, setAdvertisements] = useState<IAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courierId, setCourierId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  // Récupérer le token depuis localStorage
  const getToken = () => localStorage.getItem('token');

  // Récupération de l'utilisateur connecté
  useEffect(() => {
    setMounted(true);

    const token = getToken();
    console.log('Token récupéré depuis localStorage:', token);
    if (!token) {
      setMessage('Utilisateur non connecté. Token manquant.');
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get('http://localhost:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Réponse de /auth/me:', res.data);
        if (res.data && res.data.userId) {
          setCourierId(res.data.userId);
        } else {
          setMessage('Utilisateur non valide ou ID manquant dans la réponse.');
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération de l’utilisateur:', 
          err.response ? JSON.stringify(err.response.data) : err.message
        );
        setMessage('Erreur lors de la récupération de l’utilisateur.');
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchAdvertisements = async () => {
      try {
        console.log('Fetching validated advertisements...');
        const response = await axios.get('http://localhost:3001/advertisements/validated');
        console.log('Advertisements fetched:', response.data);
        setAdvertisements(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des annonces :', err);
        setError('Impossible de charger les annonces.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [mounted]);

  const handleTakeCharge = async (ad: IAdvertisement) => {
    const token = getToken();
    if (!token || courierId === null) {
      alert('Vous devez être connecté pour prendre en charge une annonce.');
      return;
    }

    const payload = {
      prestataireId: courierId,
      advertisementId: ad.id,
      type: ad.advertisementItem,
      description: ad.advertisementDescription,
      prix: ad.advertisementPrice,
    };

    console.log('Envoi du payload à /interventions:', payload);

    try {
      const response = await axios.post('http://localhost:3001/interventions', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Réponse reçue après prise en charge:', response.data);
      alert('Annonce prise en charge avec succès !');
    } catch (err: any) {
      if (err.response) {
        console.error('Erreur serveur:', err.response.data);
        console.error('Status code:', err.response.status);
      } else if (err.request) {
        console.error('Pas de réponse du serveur:', err.request);
      } else {
        console.error('Erreur lors de la configuration de la requête:', err.message);
      }
      alert('Erreur lors de la prise en charge.');
    }
  };

  if (!mounted) return null;
  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link
          href="/dashboard/livreur/myadvertisements"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Mes Annonces
        </Link>
      </div>

      {message && <p className="mb-4 text-red-500">{message}</p>}

      <h1 className="text-xl font-bold mb-4">Annonces Disponibles</h1>
      {advertisements.length === 0 ? (
        <p>Aucune annonce disponible pour le moment.</p>
      ) : (
        <ul>
          {advertisements.map((ad) => (
            <li key={ad.id} className="border p-4 mb-4 rounded shadow">
              <h2 className="text-lg font-semibold">{ad.advertisementItem}</h2>
              <p><strong>Poids :</strong> {ad.advertisementWeight} kg</p>
              <p><strong>Dimension :</strong> {ad.advertisementDimension}</p>
              <p><strong>Quantité :</strong> {ad.advertisementQuantity}</p>
              <p><strong>Prix :</strong> {ad.advertisementPrice} €</p>
              <p><strong>Description :</strong> {ad.advertisementDescription}</p>
              {ad.advertisementPhoto && (
                <img
                  src={`/uploads/${ad.advertisementPhoto}`}
                  alt={ad.advertisementItem}
                  className="mt-2 mb-4 w-full h-auto rounded"
                />
              )}
              <button
                onClick={() => handleTakeCharge(ad)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Prendre en charge
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
