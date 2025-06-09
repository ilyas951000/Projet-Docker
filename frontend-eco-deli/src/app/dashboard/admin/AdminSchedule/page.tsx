"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface Schedule {
  id: number;
  scheduleStart: string;
  scheduleEnd: string;
  scheduleStatus: string;
  scheduleDescription: string;
  user: User[];
}

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/courier/1/schedule/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          console.error("Format inattendu:", data);
        }
      } catch (err) {
        console.error("Erreur chargement planning:", err);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📅 Calendrier & Disponibilités</h1>

      {schedules.length === 0 ? (
        <p>Aucune disponibilité trouvée.</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Début</th>
              <th className="border px-4 py-2">Fin</th>
              <th className="border px-4 py-2">Statut</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Utilisateur(s)</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td className="border px-4 py-2">{s.id}</td>
                <td className="border px-4 py-2">{new Date(s.scheduleStart).toLocaleString()}</td>
                <td className="border px-4 py-2">{new Date(s.scheduleEnd).toLocaleString()}</td>
                <td className="border px-4 py-2">{s.scheduleStatus}</td>
                <td className="border px-4 py-2">{s.scheduleDescription}</td>
                <td className="border px-4 py-2">
                  {s.user?.length > 0
                    ? s.user.map(u => `${u.userFirstName} ${u.userLastName} (ID: ${u.id})`).join(", ")
                    : "Aucun"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
