"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
  userStatus: string;
}

interface Schedule {
  id: number;
  scheduleStart: string;
  scheduleEnd: string;
  scheduleStatus: string;
  scheduleDescription: string;
  user: User[];
}

interface Movement {
  id: number;
  userId: number;
  originStreet: string;
  originCity: string;
  destinationStreet: string;
  destinationCity: string;
  availableOn?: string;
  note?: string;
}

interface GroupedData {
  user: User;
  schedules: Schedule[];
  movements: Movement[];
}

export default function AdminPlanningTrajets() {
  const [grouped, setGrouped] = useState<GroupedData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [schedulesRes, movementsRes, usersRes] = await Promise.all([
          fetch("http://localhost:3001/courier/1/schedule/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/movements", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const schedulesData: Schedule[] = await schedulesRes.json();
        const movementsData: Movement[] = await movementsRes.json();
        const usersData: User[] = await usersRes.json();

        // Créer une map des livreurs uniquement
        const livreursMap = new Map<number, User>();
        usersData.forEach((u) => {
          if (u.userStatus === "livreur") {
            livreursMap.set(u.id, u);
          }
        });

        const userMap: { [userId: number]: GroupedData } = {};

        // Traitement des schedules
        schedulesData.forEach((s) => {
          s.user.forEach((u) => {
            if (!livreursMap.has(u.id)) return;

            if (!userMap[u.id]) {
              userMap[u.id] = { user: u, schedules: [], movements: [] };
            }
            userMap[u.id].schedules.push(s);
          });
        });

        // Traitement des movements
        movementsData.forEach((m) => {
          const u = livreursMap.get(m.userId);
          if (!u) return;

          if (!userMap[u.id]) {
            userMap[u.id] = { user: u, schedules: [], movements: [] };
          }
          userMap[u.id].movements.push(m);
        });

        setGrouped(Object.values(userMap));
      } catch (err) {
        console.error("Erreur chargement données planning+trajets:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🗓️ Planning & Gestion des trajets</h1>

      {grouped.length === 0 ? (
        <p>Aucune donnée trouvée.</p>
      ) : (
        grouped.map((entry) => (
          <div key={entry.user.id} className="mb-6 border p-4 rounded shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-2">
              👤 {entry.user.userFirstName} {entry.user.userLastName} (ID: {entry.user.id})
            </h2>

            <div className="mb-3">
              <h3 className="font-semibold">🕒 Disponibilités</h3>
              {entry.schedules.length === 0 ? (
                <p className="text-sm italic">Aucune disponibilité.</p>
              ) : (
                <ul className="list-disc ml-5 text-sm">
                  {entry.schedules.map((s) => (
                    <li key={s.id}>
                      {new Date(s.scheduleStart).toLocaleString()} →{" "}
                      {new Date(s.scheduleEnd).toLocaleString()} ({s.scheduleStatus}) : {s.scheduleDescription}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold">🚚 Trajets</h3>
              {entry.movements.length === 0 ? (
                <p className="text-sm italic">Aucun trajet.</p>
              ) : (
                <ul className="list-disc ml-5 text-sm">
                  {entry.movements.map((m) => (
                    <li key={m.id}>
                      {m.originStreet}, {m.originCity} → {m.destinationStreet},{" "}
                      {m.destinationCity} ({m.availableOn}) {m.note && ` - ${m.note}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
