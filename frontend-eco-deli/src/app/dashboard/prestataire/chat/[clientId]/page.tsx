'use client';

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

interface IMessage {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  timestamp: string;
  packageId?: number;
}

interface IPackage {
  id: number;
  advertisementId?: number;
}

let socket: Socket;

export default function ChatPage() {
  const { clientId } = useParams();
  const searchParams = useSearchParams();
  const packageIdFromQuery = searchParams.get("packageId");

  const [livreurId, setLivreurId] = useState<number | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [packageInfo, setPackageInfo] = useState<IPackage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchLivreur = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non connecté.");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.userId) setLivreurId(data.userId);
    };

    fetchLivreur();
  }, []);

  useEffect(() => {
    if (!livreurId || !clientId) return;

    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket"],
    });

    socket.on(`message-${livreurId}`, (newMsg: IMessage) => {
      if (
        (newMsg.fromUserId === Number(clientId) || newMsg.toUserId === Number(clientId)) &&
        (!packageIdFromQuery || String(newMsg.packageId) === packageIdFromQuery)
      ) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    });

    const fetchMessagesAndPackage = async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/messages/conversation?from=${livreurId}&to=${clientId}${
        packageIdFromQuery ? `&packageId=${packageIdFromQuery}` : ""
      }`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de chargement.");
      setMessages(data);
      scrollToBottom();

      const lastPkgId =
        [...data].reverse().find((msg: IMessage) => msg.packageId)?.packageId ||
        (packageIdFromQuery ? parseInt(packageIdFromQuery) : null);

      if (lastPkgId) {
        const pkgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${lastPkgId}`);
        const pkgData = await pkgRes.json();
        if (pkgRes.ok) setPackageInfo(pkgData);
      }
    };

    fetchMessagesAndPackage();

    return () => {
      socket.disconnect();
    };
  }, [livreurId, clientId, packageIdFromQuery]);

  const handleSend = async () => {
    if (!newMessage.trim() || !livreurId || !clientId) return;

    const msgToSend = {
      fromUserId: livreurId,
      toUserId: parseInt(clientId as string),
      content: newMessage.trim(),
      packageId: packageInfo?.id || (packageIdFromQuery ? parseInt(packageIdFromQuery) : undefined),
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msgToSend),
    });

    const savedMessage = await res.json();
    if (res.ok) {
      socket.emit("sendMessage", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
      scrollToBottom();
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto p-4 h-[80vh] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Chat avec le client #{clientId}</h1>

      {packageInfo?.advertisementId && (
        <div className="mb-4 text-right">
          <Link
            href={`/annonces/${packageInfo.advertisementId}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Voir l'annonce liée
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto border p-4 rounded bg-gray-100 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded max-w-[70%] ${
              msg.fromUserId === livreurId
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-white text-black self-start"
            }`}
          >
            <p>{msg.content}</p>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="mt-4 flex justify-between gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Envoyer
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-red-600 text-center">{error}</p>}
    </div>
  );
}
