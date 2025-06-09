"use client";
import { useState } from "react";
import { Moon, Sun, Settings, PlusCircle, User, ChevronDown, ChevronUp, FileText } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white dark:bg-gray-800 p-5 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <Link href="/connexion" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold mr-2">
                <Image src="/logo1.png" alt="EcoDeli Logo" width={120} height={20} className="h-10 w-auto" />
              </Link>
            </h1>

            <nav className="mt-5">
              <ul className="space-y-3">
                <DropdownMenu 
                  title="Gestion utilisateur" 
                  menuKey="gestionUtilisateur" 
                  isOpen={openMenus["gestionUtilisateur"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Visuel sur les utilisateurs", link: "/dashboard/admin/userManagement" },
                    { title: "Facture des Utilisateurs", link: "/dashboard/admin/AdminFacture" },
                  ]} 
                />

                <DropdownMenu 
                  title="Gestion commerçant" 
                  menuKey="gestionCommercant" 
                  isOpen={openMenus["gestionCommercant"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Gestion du contrat//", link: "./admin/contract" },
                    { title: "Gestion des annonces//", link: "./admin/announcement" },
                    { title: "Tableau de bord//", link: "./admin/dashboard" },
                    { title: "Support et communication", link: "./admin/support" }
                  ]} 
                />


                <DropdownMenu 
                  title="Gestion prestataire" 
                  menuKey="gestionPrestataire" 
                  isOpen={openMenus["gestionPrestataire"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Validation et vérification//", link: "./admin/ValidationUser" },
                    { title: "Calendrier et disponibilités//", link: "./admin/AdminSchedule" },
                    { title: "Suivi des interventions", link: "./admin/AdminIntervention" },
                    { title: "Avis des Prestataires", link: "./admin/AdminAvis" },
                    { title: "Gestion tarifaire//", link: "./admin/pricing" }
                  ]} 
                />

                <DropdownMenu 
                  title="Gestion livreur" 
                  menuKey="gestionLivreur" 
                  isOpen={openMenus["gestionLivreur"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Validation et vérification//", link: "./admin/ValidationUser" },
                    { title: "Suivi des livraisons", link: "./admin/AdminPackages" },
                    { title: "Planning et gestion des trajets", link: "./admin/AdminPlanningTrajets" },
                  ]} 
                />


                <DropdownMenu 
                  title="Gestion Client" 
                  menuKey="gestionClient" 
                  isOpen={openMenus["gestionClient"]} 
                  toggleMenu={toggleMenu} 
                  subItems={[
                    { title: "Dépôt et gestion des annonces de transport", link: "./admin/AdminAnnonces" },
                    { title: "Suivi des livraisons en cours", link: "./admin/AdminPackages" },
                    { title: "Gestion des box de stockage temporaire", link: "./admin/boxes" },
                  ]} 
                />
                <NavItem title="Virement Pour les Utilisateurs" link="./admin/AdminVirement" />
                <NavItem title="Service client et Signalement" link="./admin/admin_message_signalement" />
                <NavItem title="Partie monétaire de Ecodeli" link="./admin/AdminFinance" />
              </ul>
            </nav>

            <div className="mt-10 space-y-3">
              <NavItem title="À propos" link="/a-propos" />
              <NavItem title="Nous contacter" link="/contact" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Mon compte</span>
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-300 cursor-pointer" />
          </div>
        </aside>

        <main className="flex-1 p-10">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Bienvenue Chez <span className="text-black">Eco</span>
            <span className="text-green-500">Deli</span> - partie admin
          </h2>
          {/* Ici tu pourras ajouter le contenu spécifique de chaque page */}
        </main>

        <button
          className="absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-900" />}
        </button>
      </div>
    </div>
  );
}

function DropdownMenu({ title, menuKey, isOpen, toggleMenu, subItems }: { 
  title: string; 
  menuKey: string; 
  isOpen: boolean; 
  toggleMenu: (menu: string) => void; 
  subItems: { title: string; link: string }[]; 
}) {
  return (
    <li>
      <button 
        className="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md"
        onClick={() => toggleMenu(menuKey)}
      >
        <span className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>{title}</span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <ul className="ml-6 mt-2 space-y-2">
          {subItems.map((item, index) => (
            <SubNavItem key={index} title={item.title} link={item.link} />
          ))}
        </ul>
      )}
    </li>
  );
}

function NavItem({ title, link }: { title: string; link: string; }) {
  return (
    <li className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 cursor-pointer p-2 rounded-md">
      <PlusCircle className="w-4 h-4" />
      <Link href={link}>
        <span>{title}</span>
      </Link>
    </li>
  );
}

function SubNavItem({ title, link }: { title: string; link: string; }) {
  return (
    <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 cursor-pointer p-2">
      <Link href={link}>
        <span>• {title}</span>
      </Link>
    </li>
  );
}

