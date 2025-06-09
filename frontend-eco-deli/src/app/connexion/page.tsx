"use client";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth(); 
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      await login(email, password);
      router.push("/dashboard"); 
    } catch (err) {
      console.error(err);
      setError("Email ou mot de passe incorrect.");
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-800 to-green-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        <div className="text-white text-xl font-bold">
          <span className="text-green-500">Eco</span>
          <span className="text-black">Deli</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Me connecter</h2>

        {error && <p className="text-red-500">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Connexion
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>
            Toujours pas inscrit?{" "}
            <a href="/inscription" className="text-blue-600 hover:underline">
              Inscrivez-vous
            </a>
          </p>
          <p>
            <a href="#" className="text-blue-600 hover:underline">
              Mot de passe oublié ?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
