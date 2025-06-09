"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface Invoice {
  id: number;
  totalAmount: number | string;
  paymentStatus: string;
  paymentMethod: string;
  serviceTitle: string;
  issueDate: string;
  paymentDate: string;
  userType: string;
  userId: number;
  invoiceNumber: string;
  user?: User; // Nouvelle propriété liée via relation
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sortKey, setSortKey] = useState<keyof Invoice | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/invoices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setInvoices(data);
        } else {
          console.error("Réponse inattendue:", data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des factures:", err);
      }
    };

    fetchInvoices();
  }, []);

  const toggleSort = (key: keyof Invoice) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getSortArrow = (key: keyof Invoice) => {
    if (sortKey !== key) return null;
    return <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>;
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchTerm.trim()) return true;
    const name = inv.user ? `${inv.user.userFirstName} ${inv.user.userLastName}`.toLowerCase() : "";
    return name.includes(searchTerm.toLowerCase());
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortKey) return 0;

    let aValue: any = a[sortKey];
    let bValue: any = b[sortKey];

    if (sortKey === "totalAmount") {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else if (sortKey === "user") {
      aValue = a.user ? `${a.user.userFirstName} ${a.user.userLastName}` : "";
      bValue = b.user ? `${b.user.userFirstName} ${b.user.userLastName}` : "";
    } else {
      aValue = aValue?.toString().toLowerCase();
      bValue = bValue?.toString().toLowerCase();
    }

    if (aValue < bValue) return sortAsc ? -1 : 1;
    if (aValue > bValue) return sortAsc ? 1 : -1;
    return 0;
  });

  const downloadPdf = async (invoiceId: number) => {
    try {
      const res = await fetch(`http://localhost:3001/invoices/pdf/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("PDF introuvable");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${invoiceId}.pdf`;
      a.click();
    } catch (err) {
      console.error("Erreur lors du téléchargement du PDF:", err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📄 Gestion des factures</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full max-w-sm"
        />
      </div>

      {sortedInvoices.length === 0 ? (
        <p>Aucune facture trouvée.</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">#</th>
              <th
                className="border px-3 py-2 cursor-pointer"
                onClick={() => toggleSort("user")}
              >
                Utilisateur {getSortArrow("user")}
              </th>
              <th
                className="border px-3 py-2 cursor-pointer"
                onClick={() => toggleSort("userType")}
              >
                Type {getSortArrow("userType")}
              </th>
              <th
                className="border px-3 py-2 cursor-pointer"
                onClick={() => toggleSort("totalAmount")}
              >
                Montant (€) {getSortArrow("totalAmount")}
              </th>
              <th className="border px-3 py-2">Méthode</th>
              <th className="border px-3 py-2">Statut</th>
              <th className="border px-3 py-2">Date émission</th>
              <th className="border px-3 py-2">Date paiement</th>
              <th className="border px-3 py-2">Titre</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="border px-3 py-2">{inv.invoiceNumber}</td>
                <td className="border px-3 py-2">
                  {inv.user
                    ? `${inv.user.userFirstName} ${inv.user.userLastName} (ID: ${inv.user.id})`
                    : `ID ${inv.userId}`}
                </td>
                <td className="border px-3 py-2">{inv.userType}</td>
                <td className="border px-3 py-2">
                  {Number(inv.totalAmount).toFixed(2)}
                </td>
                <td className="border px-3 py-2">{inv.paymentMethod}</td>
                <td className="border px-3 py-2">{inv.paymentStatus}</td>
                <td className="border px-3 py-2">
                  {new Date(inv.issueDate).toLocaleString()}
                </td>
                <td className="border px-3 py-2">
                  {new Date(inv.paymentDate).toLocaleString()}
                </td>
                <td className="border px-3 py-2">{inv.serviceTitle}</td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => downloadPdf(inv.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Télécharger PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
