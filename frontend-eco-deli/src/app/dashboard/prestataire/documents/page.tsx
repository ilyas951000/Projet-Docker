'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

import { getCurrentTargetYear } from '../../../utils/currentTime';

// Autres imports nécessaires...

type UserData = {
  userId: number;
  userStatus: string;
  valid: boolean;
  prestataireRoleId: number;
};

type Requirement = {
  id: number;
  name: string;
};

type DocumentForm = {
  requirementId: number;
  name: string;
  documentDate: string;
  expirationDate: string;
  format: string;
  file: File | null;
  documentType?: string;
};


type JustificationFormProps = {
  requirements: Requirement[];
  existingDocs: {
    requirementId: number;
    documentValid: string;
    fileName: string;
  }[];
  isUserValid: boolean;
};


function JustificationForm({ requirements, existingDocs, isUserValid }: JustificationFormProps) {

  const [documents, setDocuments] = useState<DocumentForm[]>([
    { requirementId: 0, name: '', documentDate: '', expirationDate: '', format: '', file: null },
  ]);
  const currentYear = getCurrentTargetYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const filledRequirementIds = new Set(
    existingDocs
      .filter((d) => {
        const docYear = d.targetYear || new Date(d.documentDate).getFullYear();
        return docYear === selectedYear;
      })
      .map((d) => d.requirementId)
  );

  const canAddDocument =
  documents.length + filledRequirementIds.size < requirements.length;
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  

  
  const docsByYear = existingDocs.reduce((acc, doc) => {
    const year = doc.targetYear || new Date(doc.documentDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(doc);
    return acc;
  }, {} as Record<number, typeof existingDocs>);



  const handleChange = (index: number, field: keyof DocumentForm, value: any) => {
    const updated = [...documents];
    updated[index][field] = value;

    if (field === 'requirementId') {
      const selectedReq = requirements.find(r => r.id === value);
      updated[index].documentType = selectedReq?.name || '';
    }

    setDocuments(updated);
  };


  const addDocumentForm = () => {
    if (documents.length < requirements.length) {
      setDocuments([
        ...documents,
        {
          requirementId: 0,
          name: '',
          documentDate: '',
          expirationDate: '',
          format: '',
          file: null,
          documentType: '',
        },
      ]);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append(
      'documents',
      JSON.stringify(
        documents.map((d) => ({
          requirementId: d.requirementId,
          documentDate: d.documentDate,
          expirationDate: d.expirationDate,
          format: d.format,
          documentType: d.documentType || '',
          targetYear: selectedYear,
        }))
      )
    );




    documents.forEach((d) => d.file && formData.append('file', d.file));

    try {
      const res = await fetch('http://localhost:3001/documents/multi-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Tous les justificatifs ont été envoyés !');
        setDocuments([
          { documentType: '', documentDate: '', expirationDate: '', format: '', file: null },
        ]);
      } else {
        setMessage(`❌ Erreur : ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur réseau ou serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      

      {Object.entries(docsByYear).map(([year, docs]) => (
        <div key={year} className="mb-6 space-y-4">
          <h3 className="text-xl font-semibold">
            Documents pour l’année {year}
            {parseInt(year) === currentYear && (
              <span className="ml-2 text-blue-600 text-sm">(année courante)</span>
            )}
          </h3>
          <ul className="space-y-2">
            {docs.map((doc) => {
              const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
              }).format(new Date(doc.documentDate + 'T00:00:00Z'));

              return (
                <li
                  key={doc.requirementId + '-' + year}
                  className="flex justify-between items-center border p-2 rounded bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{doc.fileName}</p>
                    <p className="text-sm text-gray-600">
                       Date du document : {formattedDate} — État : {doc.documentValid}
                    </p>
                    <p className="text-sm text-gray-600">
                       Type  de Document: <strong>{doc.documentType || 'Inconnu'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setModalImageUrl(`http://localhost:3001/${doc.filePath}`);
                      setShowModal(true);
                    }}
                    className="text-blue-600 underline text-sm"
                  >
                    Voir
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}


      {!isUserValid && (
        <>
          <h2 className="text-2xl font-semibold mb-6">Déposer plusieurs justificatifs</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-1">
                Sélectionnez l'année :<br />
                <span className="text-gray-600 text-xs">
                  • Si vous choisissez <strong>l'année actuelle</strong>, votre document sera soumis à vérification et vous <strong>n’aurez plus accès</strong> au site jusqu’à validation.<br />
                  • Si vous choisissez <strong>l'année suivante</strong>, votre document sera également soumis à vérification.
                </span>
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[currentYear, currentYear + 1].map((year) => (
                  <option key={year} value={year}>
                    Documents pour l’année {year}
                  </option>
                ))}
              </select>
            </div>
            {documents.map((doc, i) => (
              <div key={i} className="p-4 border rounded space-y-4">
                <select
                  value={doc.requirementId}
                  onChange={(e) => handleChange(i, 'requirementId', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Type de document</option>
                  {requirements.map((req) => (
                    <option
                      key={req.id}
                      value={req.id}
                      disabled={filledRequirementIds.has(req.id)}
                    >
                      {req.name}
                      {filledRequirementIds.has(req.id) ? ' (déjà envoyé)' : ''}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={doc.documentDate}
                  onChange={(e) => handleChange(i, 'documentDate', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="date"
                  value={doc.expirationDate}
                  onChange={(e) => handleChange(i, 'expirationDate', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Format (PDF, JPG...)"
                  value={doc.format}
                  onChange={(e) => handleChange(i, 'format', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleChange(i, 'file', e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded"
                  required
                />
                
              </div>
            ))}
            <h2>pour mettre à jour reconnectez-vous à vôtre compte</h2>
            <div className="relative inline-block group">
              <button
                type="button"
                onClick={addDocumentForm}
                disabled={!canAddDocument}
                title={!canAddDocument ? 'Tous les documents requis ont été fournis' : ''}
                className={`text-sm underline ${
                  !canAddDocument ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'
                }`}
              >
                + Ajouter un autre justificatif
              </button>

              {documents.length >= requirements.length && (
                <div className="absolute z-10 -top-8 left-0 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tous les justificatifs sont déjà couverts.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
            >
              {loading ? 'Envoi...' : 'Envoyer tous les documents'}
            </button>
            {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
          </form>
        </>
      )}

      {isUserValid && (
        <p className="text-green-600 italic mt-4 font-bold text-lg">
          Vous êtes validé – l'ajout de nouveaux documents est désactivé pour l'année en cours.
        </p>
      )}
      {showModal && modalImageUrl && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded shadow-lg max-w-3xl w-full relative">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
          >
            &times;
          </button>
          <img src={modalImageUrl} alt="Document" className="max-h-[80vh] w-auto mx-auto" />
        </div>
      </div>
    )}


    </div>
    
  );
}

const AdminConnexion = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDocuments, setUserDocuments] = useState<DocumentForm[]>([]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:3001/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = res.data;
      setUserData(user);

      const requirementsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/prestataire-requirements/by-role/${user.prestataireRoleId}`
      );
      setRequirements(requirementsRes.data);

      const docsRes = await axios.get(
        `http://localhost:3001/documents/user/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserDocuments(docsRes.data);
    } catch (err) {
      console.error('Erreur API :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  if (loading) return <p>Chargement...</p>;
  if (!userData) return <p>Utilisateur non connecté</p>;

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        {!userData.valid ? (
          <h1 className="text-2xl font-bold">Documents requis pour validation</h1>
        ) : (
          <h1 className="text-2xl font-bold text-green-600">
            Vous êtes validé — voici vos documents envoyés
          </h1>
        )}

        <button
          onClick={handleRefresh}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          🔄 Rafraîchir
        </button>
      </div>

      {!userData.valid && (
        <ul className="list-disc pl-5 text-gray-700">
          {requirements.map((r) => (
            <li key={r.id}>{r.name}</li>
          ))}
        </ul>
      )}

      <JustificationForm
        requirements={requirements}
        existingDocs={userDocuments}
        isUserValid={userData.valid}
      />
    </div>
  );
};


export default AdminConnexion;
