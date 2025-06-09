"use client"
import '../globals.css'
import { useEffect, useState } from "react";
import { PlusCircle, Menu, X, Moon, Sun, User, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Ad {
  id: number;
  usersId: number;
  advertisementPhoto?: string;
  advertisementQuantity: number;
  advertisementItem: string;
  publicationDate: string;
  advertisementDimension?: string;
  advertisementWeight?: number;
  additionalInformation?: string;
  advertisementPrice: number;
  advertisementStatus?: string;
}

export default function OtherAnnouncements() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Récupérer l’ID du user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token manquant");
        const res = await fetch('http://localhost:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur récupération utilisateur");
        const { userId } = await res.json();
        setUserId(userId);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUser();
  }, []);

  // 2. Dès qu’on a userId, on récupère les annonces des autres
  useEffect(() => {
    if (userId === null) return;
    const fetchOthers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/advertisements/others', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        setAds(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOthers();
  }, [userId]);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        

        <main className="flex-1 p-5 md:p-10 overflow-auto w-full">
          <div className="flex justify-between items-center md:hidden mb-5">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
            </button>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            Les annonces des autres utilisateurs
          </h2>

          {loading ? (
            <p>Chargement des annonces…</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Objet</th>
                  <th className="px-4 py-2">Prix (€)</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{ad.advertisementItem}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{ad.advertisementPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{new Date(ad.publicationDate).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2">
                      <Link href={`/announcements/${ad.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        Voir plus
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>

        
      </div>
    </div>
  );
}

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  )
}
