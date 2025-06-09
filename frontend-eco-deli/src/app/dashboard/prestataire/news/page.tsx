'use client';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NewsListPage() {
  const { data, error } = useSWR('http://localhost:3001/news', fetcher);

  if (error) return <div className="p-4 text-red-600">Erreur lors du chargement</div>;
  if (!data) return <div className="p-4">Chargement...</div>;
  if (data.length === 0) return <div className="p-4">Aucune actualité pour le moment.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Actualités</h1>
      <div className="space-y-4">
        {data.map((news: any) => (
          <div key={news.id} className="border-b pb-3">
            <Link href={`/dashboard/prestataire/news/${news.id}`}>
              <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                {news.title}
              </h2>
            </Link>
            <p className="text-sm text-gray-500">
              Publié le {new Date(news.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
