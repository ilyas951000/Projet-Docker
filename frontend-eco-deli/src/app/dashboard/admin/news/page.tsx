'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface News {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      const res = await fetch('http://localhost:3001/news');
      const data = await res.json();
      setNewsList(data);
    } catch (err) {
      setError("Erreur lors du chargement des news");
    }
  };

  const deleteNews = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3001/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Suppression échouée');
      fetchNews(); // refresh
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des News</h1>
      <Link href="/dashboard/admin/news/new" className="text-blue-600 underline mb-4 block">
        ➕ Ajouter une news
      </Link>

      {error && <p className="text-red-500">{error}</p>}

      {newsList.length === 0 ? (
        <p>Aucune news.</p>
      ) : (
        <div className="space-y-4">
          {newsList.map((news) => (
            <div key={news.id} className="border p-4 rounded shadow flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{news.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(news.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="space-x-2">
                <Link
                  href={`/dashboard/admin/news/edit/${news.id}`}
                  className="bg-yellow-400 text-white px-3 py-1 rounded"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => deleteNews(news.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
