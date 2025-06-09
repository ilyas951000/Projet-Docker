'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditNews() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/news/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
      })
      .catch(() => setError("Impossible de charger la news"));
  }, [id]);

  const submit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3001/news/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Erreur lors de la mise à jour');
      }

      router.push('/dashboard/admin/news');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Modifier la news</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="w-full border p-2 mb-3"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border p-2 mb-3"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button
        onClick={submit}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>
    </div>
  );
}
