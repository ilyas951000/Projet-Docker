'use client'

import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useEffect, useState } from 'react';
import axios from 'axios';

const localizer = momentLocalizer(moment);

export type ScheduleType = {
  id: number;
  scheduleStart: string;
  scheduleEnd: string;
  scheduleStatus: string;
  scheduleDescription: string;
};

export default function ScheduleCalendar({ courierId }: { courierId: number }) {
  const [events, setEvents] = useState<any[]>([]);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get<ScheduleType[]>(`/api/courier/${courierId}/schedule`);
      const formattedEvents = res.data.map((s) => ({
        id: s.id,
        title: s.scheduleDescription,
        start: new Date(s.scheduleStart),
        end: new Date(s.scheduleEnd),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erreur lors de la récupération des plannings :', error);
    }
  };

  // Ajoute un créneau en sélectionnant une plage de temps
  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    const description = prompt('Description du créneau :');
    if (!description) return;
    try {
      await axios.post(`/api/courier/${courierId}/schedule`, {
        scheduleStart: start,
        scheduleEnd: end,
        scheduleStatus: 'disponible',
        scheduleDescription: description,
      });
      fetchSchedules();
    } catch (error) {
      console.error('Erreur lors de la création du créneau :', error);
    }
  };

  // Supprime un créneau en cliquant dessus
  const handleSelectEvent = async (event: any) => {
    if (confirm('Supprimer ce créneau ?')) {
      try {
        await axios.delete(`/api/courier/${courierId}/schedule/${event.id}`);
        fetchSchedules();
      } catch (error) {
        console.error('Erreur lors de la suppression du créneau :', error);
      }
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
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
  );
}
