"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface IMessage {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  timestamp: string;
  packageId?: number;
}

interface IUser {
  id: number;
  userFirstName: string;
  userLastName: string;
}

interface IConversation {
  userId: number;
  lastMessage: IMessage;
  packageId?: number;
  advertisementId?: number; // 👈 ajouté
}

export default function LivreurConversationsPage() {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, IUser>>({});
  const [livreurId, setLivreurId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non connecté.");
        return;
      }

      try {
        const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();
        if (!resUser.ok || !userData.userId) throw new Error("Erreur utilisateur.");
        const livreurId = userData.userId;
        setLivreurId(livreurId);

        const resMessages = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/all/${livreurId}`);
        const allMessages: IMessage[] = await resMessages.json();
        if (!resMessages.ok) throw new Error("Erreur récupération messages.");

        const convMap: Record<string, IMessage> = {};

        allMessages.forEach((msg) => {
        const otherId = msg.fromUserId === livreurId ? msg.toUserId : msg.fromUserId;
        const pkgId = msg.packageId || "noPkg";
        const key = `${otherId}-${pkgId}`;

        if (!convMap[key] || new Date(msg.timestamp) > new Date(convMap[key].timestamp)) {
            convMap[key] = msg;
        }
        });


        const conversations: IConversation[] = await Promise.all(
          Object.entries(convMap).map(async ([userId, lastMessage]) => {
            const packageId = lastMessage.packageId;
            let advertisementId: number | undefined;

            if (packageId) {
              try {
                const resPkg = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}`);
                const pkgData = await resPkg.json();
                if (resPkg.ok && pkgData?.advertisementId) {
                  advertisementId = pkgData.advertisementId;
                }
              } catch {
                // Ne rien faire si erreur
              }
            }

            return {
              userId: parseInt(userId, 10),
              lastMessage,
              packageId,
              advertisementId,
            };
          })
        );

        const userIds = conversations.map((conv) => conv.userId);
        const fetchedUsers: Record<number, IUser> = {};
        for (const id of userIds) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
          const data = await res.json();
          fetchedUsers[id] = data;
        }

        setUsersMap(fetchedUsers);
        setConversations(conversations);
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.");
      }
    };

    fetchConversations();
  }, []);

  if (error) return <p className="text-red-600 text-center mt-4">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Conversations</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-500">Aucune conversation trouvée.</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => {
            const user = usersMap[conv.userId];
            const chatUrl = `/dashboard/livreur/chat/${conv.userId}${conv.packageId ? `?packageId=${conv.packageId}` : ""}`;


            return (
              <div
                key={conv.userId}
                className="border rounded p-4 hover:bg-gray-50 transition"
              >
                <Link href={chatUrl} className="block">
                  <div className="font-semibold">
                    {user
                      ? `${user.userFirstName} ${user.userLastName}`
                      : `Utilisateur #${conv.userId}`}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 truncate">
                    {conv.lastMessage.content}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(conv.lastMessage.timestamp).toLocaleString()}
                  </div>
                </Link>

                {conv.advertisementId && (
                  <div className="mt-2 text-right">
                    <Link
                      href={`/annonces/${conv.advertisementId}`}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Voir l'annonce liée
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
