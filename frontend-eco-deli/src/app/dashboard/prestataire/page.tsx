"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { Moon, Sun, Settings, PlusCircle, User, Menu, X } from "lucide-react";

type UserData = {
  userId: number;
  userStatus: string;
  valid: boolean;
  prestataireRoleId: number;
};




const AdminConnexion: NextPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token récupéré:", token);

    const fetchUserData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:3001/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Données utilisateur:", res.data);

        const data = res.data;
        const formattedData: UserData = {
          ...data,
          valid: Boolean(data.valid),
        };

        setUserData(formattedData);
        const requirementsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/prestataire-requirements/by-role/${data.prestataireRoleId}`);
        setRequirements(requirementsRes.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des infos utilisateur", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  if (!userData) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">Utilisateur non connecté ou token invalide.</p>
      </div>
    );
  }

  if (!userData.valid) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <h1 className="text-3xl font-bold">Bienvenue sur votre espace livreur</h1>
        <div className="text-left space-y-2">
          <h2 className="text-xl font-semibold">Documents requis :</h2>
          <ul className="list-disc pl-5">
            {requirements.map((doc) => (
              <li key={doc.id}>{doc.name}</li>
            ))}
          </ul>
        </div>
        <Link href="/dashboard/livreur/documents">
          <button className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition">
            Envoyer mes justificatifs
          </button>
        </Link>
      </div>
    );
  }

  // Si l'utilisateur est validé, on affiche le dashboard complet
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

          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Bienvenue Chez <span className="text-black">Eco</span>
            <span className="text-green-500">Deli</span> - partie Client
          </h2>
        </main>

        <button
          className="hidden md:block absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
        </button>
      </div>
    </div>
  );
};

export default AdminConnexion;

function NavItem({ title, link }: { title: string; link: string }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  );
}
