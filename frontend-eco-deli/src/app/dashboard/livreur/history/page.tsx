'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from "next/link"
import { MessageCircle } from 'lucide-react'

interface IPackage {
  id: number;
  packageName: string;
  packageWeight: number;
  packageDimension: string;
  packageDescription: string;
  senderAddress: string;
  recipientAddress: string;
  packageRequirements: string;
  deliveryStatus: string;
  advertisementId?: number; // Ajouter cette ligne
}

export default function DeliveryHistory() {
  const [history, setHistory] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [livreurId, setLivreurId] = useState<number | null>(null);
  const [clientIds, setClientIds] = useState<{ [key: number]: number | null }>({});

  // Récupération de l'utilisateur connecté via l'endpoint /auth/me
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non connecté. Token manquant.');
      setLoading(false);
      return;
    }
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.userId) {
          setLivreurId(res.data.userId);
        } else {
          setError('Utilisateur non valide ou ID manquant dans la réponse.');
        }
      } catch (err: any) {
        setError('Erreur lors de la récupération de l’utilisateur. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Charger l'historique des livraisons une fois que l'ID du livreur est disponible
  useEffect(() => {
    if (livreurId !== null) {
      fetchHistory();
    }
  }, [livreurId]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3001/packages/history', {
        params: { userId: livreurId },
      });
      setHistory(response.data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération de l\'historique :', err);
      setError('Impossible de charger l\'historique des livraisons.');
    }
  };

  const getClientIdFromAdvertisement = async (advertisementId: number): Promise<number | null> => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:3001/advertisements/${advertisementId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.usersId || null;
    } catch (err) {
      console.error("Erreur récupération client depuis annonce :", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchClientIds = async () => {
      const newClientIds: { [key: number]: number | null } = {};
      
      for (const pkg of history) {
        if (pkg.advertisementId) {
          const clientId = await getClientIdFromAdvertisement(pkg.advertisementId);
          newClientIds[pkg.id] = clientId;
        }
      }
      
      setClientIds(newClientIds);
    };

    if (history.length > 0) {
      fetchClientIds();
    }
  }, [history]);

  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Historique de Mes Livraisons</h1>
      {history.length === 0 ? (
        <p>Aucune livraison historique à afficher.</p>
      ) : (
        <ul>
          {history.map((pkg) => (
            <li key={pkg.id} className="border p-4 mb-4 rounded shadow">
              <h2 className="text-lg font-semibold">{pkg.packageName}</h2>
              <p><strong>Poids :</strong> {pkg.packageWeight}</p>
              <p><strong>Dimension :</strong> {pkg.packageDimension}</p>
              <p><strong>Description :</strong> {pkg.packageDescription}</p>
              <p><strong>Statut :</strong> {pkg.deliveryStatus}</p>
              {clientIds[pkg.id] && (
                <Link
                  href={`/dashboard/livreur/chat/${clientIds[pkg.id]}?packageId=${pkg.id}`}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contacter le client
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}