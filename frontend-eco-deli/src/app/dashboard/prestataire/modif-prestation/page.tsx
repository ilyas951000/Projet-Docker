'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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

const PRESTATION_OPTIONS = [
  'taxi', 'nourriture', 'bricolage', 'jardinage',
  'cours particulier', 'ménage',
];

export default function ProfilPrestataire() {
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [prestationType, setPrestationType] = useState(PRESTATION_OPTIONS[0]);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [zoneIntervention, setZoneIntervention] = useState('');
  const [disponibilites, setDisponibilites] = useState('');
  const [biographie, setBiographie] = useState('');
  const [langues, setLangues] = useState('');
  const [delaiReponse, setDelaiReponse] = useState('');
  const [tempsMoyenIntervention, setTempsMoyenIntervention] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Récupération de l'userId
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }
    axios.get('http://localhost:3001/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUserId(r.data.userId))
      .catch(e => setError('Impossible de récupérer l’utilisateur'))
      .finally(() => setLoading(false));
  }, []);

  // Récupération du profil existant
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const token = localStorage.getItem('token')!;
    axios.get(`http://localhost:3001/public-profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      if (res.data.length) {
        const p: IProfile = res.data[0];
        setProfile(p);
        setPrestationType(p.prestationType);
        setPrice(p.price);
        setDescription(p.description);
        setZoneIntervention(p.zoneIntervention || '');
        setDisponibilites(p.disponibilites || '');
        setBiographie(p.biographie || '');
        setLangues(p.langues || '');
        setDelaiReponse(p.delaiReponse || '');
        setTempsMoyenIntervention(p.tempsMoyenIntervention || '');
      }
    })
    .catch(() => setError('Impossible de charger le profil'))
    .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const token = localStorage.getItem('token')!;
    const payload = {
      prestationType, price, description,
      zoneIntervention, disponibilites, biographie,
      langues, delaiReponse, tempsMoyenIntervention,
    };

    try {
      if (profile) {
        await axios.put(
          `http://localhost:3001/public-profile/${profile.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Profil mis à jour');
      } else {
        await axios.post(
          `http://localhost:3001/public-profile/${userId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Profil créé');
      }
      // raffraîchir
      setProfile({ id: profile?.id ?? -1, ...payload });
    } catch {
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mon Profil Prestataire</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type de prestation */}
        <label className="block">
          <span className="font-semibold">Type de prestation</span>
          <select
            value={prestationType}
            onChange={e => setPrestationType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {PRESTATION_OPTIONS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>

        {/* Prix & Description courte */}
        <label className="block">
          <span className="font-semibold">Prix</span>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(+e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>
        <label className="block">
          <span className="font-semibold">Description courte</span>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>

        {/* Nouveaux champs */}
        <label className="block">
          <span className="font-semibold">Zone d’intervention</span>
          <input
            type="text"
            value={zoneIntervention}
            onChange={e => setZoneIntervention(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Disponibilités</span>
          <textarea
            value={disponibilites}
            onChange={e => setDisponibilites(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Biographie</span>
          <textarea
            value={biographie}
            onChange={e => setBiographie(e.target.value)}
            className="w-full h-24 border p-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Langues parlées</span>
          <input
            type="text"
            placeholder="Ex: français, anglais"
            value={langues}
            onChange={e => setLangues(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Délai de réponse</span>
          <input
            type="text"
            placeholder="Ex: 24h, 2h"
            value={delaiReponse}
            onChange={e => setDelaiReponse(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Temps moyen d’intervention</span>
          <input
            type="text"
            placeholder="Ex: 1h30"
            value={tempsMoyenIntervention}
            onChange={e => setTempsMoyenIntervention(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {profile ? 'Mettre à jour' : 'Créer le profil'}
        </button>
      </form>
    </div>
  );
}
