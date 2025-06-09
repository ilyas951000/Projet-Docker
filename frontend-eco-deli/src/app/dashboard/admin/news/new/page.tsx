'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNews() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token manquant.");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error(await res.text());
      router.push('/dashboard/admin/news');
    } catch (err: any) {
      setError(err.message || 'Erreur');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Créer une news</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="w-full border p-2 mb-3"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border p-2 mb-3"
        placeholder="Contenu"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={submit}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Publier
      </button>
    </div>
  );
}
