'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function PlanningPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [courierId, setCourierId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const localizer = momentLocalizer(moment);

  // Récupérer le token depuis le localStorage
  const getToken = () => localStorage.getItem('token');

  // Récupération de l'utilisateur connecté
  useEffect(() => {
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
        console.log('Réponse de auth/me:', res.data);
        if (res.data && res.data.userId) {
          setCourierId(res.data.userId);
        } else {
          setMessage('Utilisateur non valide ou ID manquant dans la réponse.');
        }
      } catch (err: any) {
        console.error('Erreur lors de fetchCurrentUser:', 
          err.response ? JSON.stringify(err.response.data) : err.message
        );
        setMessage(
          'Erreur lors de la récupération de l’utilisateur : ' +
          (err.response?.data?.message || err.message)
        );
      }
    };
    fetchCurrentUser();
  }, []);

  // Récupère les créneaux depuis le backend
  const fetchSchedules = async (courierId: number) => {
    const token = getToken();
    try {
      const response = await axios.get(
        `http://localhost:3001/courier/${courierId}/schedule`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Créneaux récupérés:', response.data);
      const formatted = response.data.map((s: any) => ({
        id: s.id,
        title: s.scheduleDescription,
        start: new Date(s.scheduleStart),
        end: new Date(s.scheduleEnd),
      }));
      setEvents(formatted);
    } catch (error: any) {
      console.error('Erreur lors de la récupération du planning:', 
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      setMessage('Erreur lors de la récupération du planning.');
    }
  };

  // Ajout d'un créneau
  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    const description = prompt('Description du créneau :');
    if (!description || courierId === null) return;

    const token = getToken();
    const payload = {
      scheduleStart: start.toISOString(),
      scheduleEnd: end.toISOString(),
      scheduleStatus: 'disponible',
      scheduleDescription: description,
    };
    console.log('Envoi du payload pour créer un créneau:', payload);
    
    try {
      const res = await axios.post(
        `http://localhost:3001/courier/${courierId}/schedule`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Réponse POST ajout créneau:', res.data);
      setMessage('Créneau ajouté avec succès.');
      fetchSchedules(courierId);
    } catch (error: any) {
      console.error('Erreur lors de la création du créneau:', 
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      setMessage('Erreur lors de l’ajout du créneau.');
    }
  };

  // Suppression d'un créneau
  const handleSelectEvent = async (event: any) => {
    if (confirm('Supprimer ce créneau ?') && courierId !== null) {
      const token = getToken();
      try {
        console.log(`Suppression du créneau avec id ${event.id}`);
        const res = await axios.delete(
          `http://localhost:3001/courier/${courierId}/schedule/${event.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Réponse DELETE créneau:', res.data);
        setMessage('Créneau supprimé avec succès.');
        fetchSchedules(courierId);
      } catch (error: any) {
        console.error('Erreur lors de la suppression du créneau:', 
          error.response ? JSON.stringify(error.response.data) : error.message
        );
        setMessage('Erreur lors de la suppression du créneau.');
      }
    }
  };

  // Charger les schedules dès que le courierId est disponible
  useEffect(() => {
    if (courierId !== null) {
      fetchSchedules(courierId);
    }
  }, [courierId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Gestion du planning</h2>
      {message && <p className="mb-4 text-sm text-red-600">{message}</p>}
      <Calendar
        selectable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />
      <p className="mt-4 text-sm">
        Pour ajouter un créneau, sélectionnez une plage horaire dans le calendrier et saisissez une description.
        Pour supprimer, cliquez sur l’événement.
      </p>
    </div>
  );
}
