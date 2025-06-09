// app/dashboard/evaluations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Rate = {
  id: number;
  rating: number;
  comment: string | null;
  client: { id: number; name: string };
  createdAt: string;
};

export default function EvaluationsPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  const getToken = () => localStorage.getItem('token');

  // 1. on récupère l'utilisateur connecté
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Utilisateur non connecté');
      return;
    }

    axios
      .get('http://localhost:3001/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        if (res.data?.userId) {
          setProviderId(res.data.userId);
        } else {
          setMessage('ID utilisateur manquant dans la réponse.');
        }
      })
      .catch(err => {
        console.error(err);
        setMessage('Erreur lors de la récupération de l’utilisateur.');
      });
  }, []);

  useEffect(() => {
    if (providerId === null) return;

    const token = getToken();
    axios
      .get<Rate[]>(
        `http://localhost:3001/rates/provider/${providerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
        setRates(res.data);
        if (res.data.length === 0) {
          setMessage('Aucune évaluation reçue pour l’instant.');
        }
      })
      .catch(err => {
        console.error(err);
        setMessage('Erreur lors du chargement des évaluations.');
      });
  }, [providerId]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mes évaluations</h1>
      {message && <p className="mb-4 text-sm text-red-600">{message}</p>}

      {rates.length > 0 && (
        <>
          <p className="mb-6">
            Note moyenne:{' '}
            <span className="font-semibold">
              {(rates.reduce((sum, r) => sum + r.rating, 0) / rates.length).toFixed(1)}
              /5
            </span>
          </p>
          <ul className="space-y-4">
            {rates.map(r => (
              <li key={r.id} className="border p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{r.client.name}</span>
                  <span>⭐ {r.rating}/5</span>
                </div>
                {r.comment && <p className="mt-2 italic">“{r.comment}”</p>}
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
