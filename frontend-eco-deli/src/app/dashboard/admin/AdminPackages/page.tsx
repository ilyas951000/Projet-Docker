"use client";

import { useEffect, useState } from 'react';

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
  email: string;
}

interface Advertisement {
  id: number;
  users: User; // le client est un objet, pas un tableau
}

interface Package {
  id: number;
  packageName: string;
  packageWeight: number;
  packageQuantity: number;
  packageDimension: string;
  deliveryStatus: string;
  isPaid: boolean;
  prioritaire: boolean;
  users: User[]; // livreurs
  advertisement?: Advertisement;
}

export default function AdminTakenPackages() {
  const [takenPackages, setTakenPackages] = useState<Package[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterCourier, setFilterCourier] = useState('');
  const [filterPaid, setFilterPaid] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchTakenPackages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/packages/assigned', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setTakenPackages(data);
        } else {
          console.error("Format inattendu :", data);
        }
      } catch (err) {
        console.error("Erreur récupération colis pris en charge :", err);
      }
    };

    fetchTakenPackages();
  }, []);

  const filteredPackages = takenPackages.filter(pkg => {
    const nameMatch = pkg.packageName?.toLowerCase().includes(filterName);
    const paidMatch =
      filterPaid === 'all' || (filterPaid === 'paid' && pkg.isPaid) || (filterPaid === 'unpaid' && !pkg.isPaid);
    const priorityMatch =
      filterPriority === 'all' || (filterPriority === 'yes' && pkg.prioritaire) || (filterPriority === 'no' && !pkg.prioritaire);
    const statusMatch =
      filterStatus === 'all' || pkg.deliveryStatus?.toLowerCase() === filterStatus.toLowerCase();

    const clientName = `${pkg.advertisement?.users?.userFirstName ?? ''} ${pkg.advertisement?.users?.userLastName ?? ''}`.toLowerCase();
    const clientMatch = clientName.includes(filterClient);

    const couriersNames = pkg.users.map(u => `${u.userFirstName} ${u.userLastName}`).join(' ').toLowerCase();
    const courierMatch = couriersNames.includes(filterCourier);

    return nameMatch && paidMatch && priorityMatch && statusMatch && clientMatch && courierMatch;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Colis pris en charge par les livreurs</h1>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <input
          type="text"
          placeholder="Filtrer par nom de colis..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value.toLowerCase())}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Filtrer par client..."
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value.toLowerCase())}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Filtrer par livreur..."
          value={filterCourier}
          onChange={(e) => setFilterCourier(e.target.value.toLowerCase())}
          className="p-2 border border-gray-300 rounded"
        />
        <select
          value={filterPaid}
          onChange={(e) => setFilterPaid(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">Tous</option>
          <option value="paid">Payé</option>
          <option value="unpaid">Non payé</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">Tous</option>
          <option value="yes">Prioritaire</option>
          <option value="no">Non prioritaire</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">Tous les statuts</option>
          <option value="en attente">En attente</option>
          <option value="pris en charge">Pris en charge</option>
          <option value="en transit">En transit</option>
          <option value="livré">Livré</option>
          <option value="transféré">Transféré</option>
        </select>
      </div>

      {filteredPackages.length === 0 ? (
        <p>Aucun colis correspondant.</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Nom du colis</th>
              <th className="border px-4 py-2">Poids</th>
              <th className="border px-4 py-2">Quantité</th>
              <th className="border px-4 py-2">Dimensions</th>
              <th className="border px-4 py-2">Statut</th>
              <th className="border px-4 py-2">Prioritaire</th>
              <th className="border px-4 py-2">Payé</th>
              <th className="border px-4 py-2">Livreur(s)</th>
              <th className="border px-4 py-2">Client</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="border px-4 py-2">{pkg.id}</td>
                <td className="border px-4 py-2">{pkg.packageName}</td>
                <td className="border px-4 py-2">{pkg.packageWeight} kg</td>
                <td className="border px-4 py-2">{pkg.packageQuantity}</td>
                <td className="border px-4 py-2">{pkg.packageDimension}</td>
                <td className="border px-4 py-2">{pkg.deliveryStatus}</td>
                <td className="border px-4 py-2">{pkg.prioritaire ? "✅" : "❌"}</td>
                <td className="border px-4 py-2">{pkg.isPaid ? "✅" : "❌"}</td>
                <td className="border px-4 py-2">
                  {pkg.users.length > 0
                    ? pkg.users.map(u => `${u.userFirstName} ${u.userLastName}`).join(', ')
                    : 'Aucun'}
                </td>
                <td className="border px-4 py-2">
                  {pkg.advertisement?.users
                    ? `${pkg.advertisement.users.userFirstName} ${pkg.advertisement.users.userLastName}`
                    : 'Inconnu'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
