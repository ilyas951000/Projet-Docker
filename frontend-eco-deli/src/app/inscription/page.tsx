'use client';

import React, { useState } from 'react';

const Inscription: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('client'); 

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserRole(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      userFirstName: formData.get('userFirstName') as string,
      userLastName: formData.get('userLastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      userAddress: formData.get('userAddress') as string,
      userRole: userRole, 
    };

    if (data.password !== data.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || "Inscription réussie !");
        form.reset();
        setUserRole("client"); 
      } else {
        setMessage(result.message || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      setMessage("Erreur lors de la connexion au serveur.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-800 to-green-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="text-white text-xl font-bold">
          <span className="text-green-500">Eco</span>
          <span className="text-black">Deli</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">S’inscrire</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="text" name="userFirstName" placeholder="Prénom" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input type="text" name="userLastName" placeholder="Nom" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input type="email" name="email" placeholder="Adresse e-mail" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input type="password" name="password" placeholder="Mot de passe" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input type="text" name="userAddress" placeholder="Adresse" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />

          <div className="mb-4">
            <label className="block font-semibold text-gray-700">Type de compte</label>
            <select
              name="userRole"
              value={userRole}
              onChange={handleRoleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            >
              <option value="client">Client</option>
              <option value="prestataire">Prestataire</option>
              <option value="commercant">Commerçant</option>
              <option value="livreur">Livreur</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-green-800 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            Continuer
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-red-600">{message}</p>
        )}

        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>
            Déjà inscrit ?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Connectez-vous
            </a>
          </p>
          <p>
            Une question ?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              Nous contacter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
