'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NewsDetailPage() {
  const { id } = useParams();
  const { data, error } = useSWR(
    id ? `http://localhost:3001/news/${id}` : null,
    fetcher
  );

  if (error) return <div className="p-4 text-red-600">Erreur lors du chargement</div>;
  if (!data) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Publié le {new Date(data.createdAt).toLocaleString()}
      </p>
      <div className="text-lg">{data.content}</div>
    </div>
  );
}
