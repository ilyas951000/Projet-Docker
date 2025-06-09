'use client';

import { useEffect, useState } from 'react';
import { getCurrentTargetYear } from '../../../utils/currentTime';

interface Prestataire {
  id: number;
  prestataireRoleId: number | null;
  userFirstName: string;
  userLastName: string;
  email: string;
  userStatus: string;
  userSubscription: number;
  valid: boolean;

}

interface Document {
  id: number;
  userId: number;
  fileName: string;
  fileUrl: string;
  documentValid: 'yes' | 'no' | 'undetermined';
  requirementId: number;
  documentType: string;
}

interface Requirement {
  id: number;
  name: string;
}

interface UserData {
  user: Prestataire;
  documents: Document[];
  requirements: Requirement[];
}

export default function AdminDocumentVerificationWithRequirements() {
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const currentTargetYear = getCurrentTargetYear();
  const [selectedUser, setSelectedUser] = useState<Prestataire | null>(null);

  const handleDeleteDocument = async (docId: number) => {
    const confirmDelete = confirm('Confirmer la suppression de ce document ?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!res.ok) throw new Error('Échec suppression');

      setUsersData(prev =>
        prev.map(data => ({
          ...data,
          documents: data.documents.filter(d => d.id !== docId),
        }))
      );
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

    

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token') || '';

        const [prestatairesRes, documentsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/prestataires/with-role`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/prestataire`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!prestatairesRes.ok || !documentsRes.ok) throw new Error('Erreur lors de la récupération des données');

        const prestataires: Prestataire[] = await prestatairesRes.json();
        const documents: Document[] = await documentsRes.json();

        const uniqueRoleIds = [...new Set(prestataires.map(p => p.prestataireRoleId).filter(Boolean))];

        const requirementsByRole: Record<number, Requirement[]> = {};
        for (const roleId of uniqueRoleIds) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prestataire-requirements/by-role/${roleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data: Requirement[] = await res.json();
          requirementsByRole[roleId!] = data;
        }

        const combined: UserData[] = prestataires.map(user => {
          const userDocs = documents.filter(doc => doc.userId === user.id);
          const userReqs = user.prestataireRoleId ? requirementsByRole[user.prestataireRoleId] || [] : [];
          return { user, documents: userDocs, requirements: userReqs };
        });

        setUsersData(combined);
      } catch (err) {
        console.error(err);
        setMessage('Erreur réseau lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleValidation = async (doc: Document, action: 'accept' | 'refuse') => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${doc.id}/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (res.ok) {
        setUsersData(prev =>
          prev.map(data => ({
            ...data,
            documents: data.documents.map(d =>
              d.id === doc.id ? { ...d, documentValid: action === 'accept' ? 'yes' : 'no' } : d
            ),
          }))
        );
      } else {
        setMessage("Erreur lors de la validation du document.");
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur réseau lors de la validation.');
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (message) return <div className="p-6 text-red-600">{message}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Vérification des documents (Prestataires)</h1>

      {usersData.map(({ user, documents, requirements }) => {
        const sentReqIds = new Set(documents.map(d => d.requirementId));
        const missingReqs = requirements.filter(req => !sentReqIds.has(req.id));
        const documentsByYear = documents.reduce((acc: Record<number, Document[]>, doc) => {
          const year = doc.targetYear || new Date(doc.documentDate).getFullYear();
          if (!acc[year]) acc[year] = [];
          acc[year].push(doc);
          return acc;
        }, {});
        if (!documentsByYear[currentTargetYear]) {
          documentsByYear[currentTargetYear] = [];
        }


        return (
  <div key={user.id} className="mb-10 border rounded p-4 bg-gray-50">
    <h2 className="text-lg font-semibold mb-2">
      Utilisateur #{user.id} (Rôle: {user.prestataireRoleId ?? '—'})
    </h2>
    <button
      onClick={() => setSelectedUser(user)}
      className="text-sm text-blue-600 underline"
    >
      Voir infos
    </button>

    <div className="mb-2">
      <h3 className="font-medium mb-1">Documents requis :</h3>

      {/* Préparation du tableau complet */}
      {Object.entries(documentsByYear).map(([year, docsInYear]) => {
        const requirementDocPairs = requirements.map((req) => {
          const matchedDocs = docsInYear.filter((doc) => doc.documentType === req.name);
          return { requirement: req, documents: matchedDocs };
        });

        return (
          <div key={year} className="mb-6">
            <h4 className="text-md font-semibold mb-2">
              Documents pour l’année {year}
              {parseInt(year) === currentTargetYear && (
                <span className="ml-2 text-blue-600 text-sm">(année courante)</span>
              )}
            </h4>

            <table className="w-full mb-4 border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Nom</th>
                  <th className="border px-3 py-2">Type</th>
                  <th className="border px-3 py-2">Statut</th>
                  <th className="border px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {requirementDocPairs.map(({ requirement, documents }) => (
                  <tr key={`${requirement.id}-${year}`}>
                    <td className="border px-3 py-2">
                      {requirement.name}
                      {documents.length > 0 && (
                        <span className="text-green-600 font-medium"> (Présent)</span>
                      )}
                    </td>

                    <td className="border px-3 py-2">{requirement.name}</td>
                    <td className="border px-3 py-2">
                      {documents.length > 0 ? (
                        documents.map((doc) => (
                          <div key={doc.id}>
                            {doc.documentValid === 'yes'
                              ? '✅ Accepté'
                              : doc.documentValid === 'no'
                              ? '❌ Refusé'
                              : '⏳ En attente'}
                          </div>
                        ))
                      ) : (
                        '❌ Pas envoyé'
                      )}
                    </td>
                    <td className="border px-3 py-2 space-y-1">
                      {documents.length > 0 ? (
                        documents.map((doc) => (
                          <div key={doc.id} className="space-x-2 flex flex-wrap items-center gap-2">
                            <button
                              className="text-blue-600 underline"
                              onClick={() => setPreviewDoc(doc)}
                            >
                              Voir
                            </button>
                            <button
                              className="text-green-600 underline"
                              onClick={() => handleValidation(doc, 'accept')}
                            >
                              Accepter
                            </button>
                            <button
                              className="text-yellow-600 underline"
                              onClick={() => handleValidation(doc, 'refuse')}
                            >
                              Refuser
                            </button>
                            <button
                              className="text-red-600 underline"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Aucune action</span>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      {selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
      <button
        onClick={() => setSelectedUser(null)}
        className="absolute top-3 right-3 text-red-600 font-bold text-lg"
      >
        ✕
      </button>
      <h2 className="text-xl font-semibold mb-4">Informations du prestataire</h2>
      <div className="space-y-2 text-sm">
        <p><strong>ID :</strong> {selectedUser.id}</p>
        <p><strong>Nom :</strong> {selectedUser.userLastName}</p>
        <p><strong>Prénom :</strong> {selectedUser.userFirstName}</p>
        <p><strong>Email :</strong> {selectedUser.email}</p>
        <p><strong>Statut :</strong> {selectedUser.userStatus}</p>
        <p><strong>Abonnement :</strong> {
          selectedUser.userSubscription === 0 ? 'Gratuit' :
          selectedUser.userSubscription === 1 ? 'Starter' :
          selectedUser.userSubscription === 2 ? 'Premium' : 'Inconnu'
        }</p>
        <p><strong>Validé :</strong> {selectedUser.valid ? '✅ Oui' : '❌ Non'}</p>
      </div>
    </div>
  </div>
)}




    </div>
  </div>
);

      })}

      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-3 right-3 text-red-600 font-bold text-lg"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-2">Aperçu du document</h2>
            <iframe src={previewDoc.fileUrl} className="w-full h-[500px]" />
          </div>
        </div>
      )}
    </div>
  );
}
