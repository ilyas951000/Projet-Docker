"use client";
import { useEffect, useState, ChangeEvent } from 'react';

interface Subscription {
  id: number;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
}

interface User {
  id: number;
  userFirstName: string;
  userLastName: string;
  email: string;
  userRole: string;
  userStatus: string;
  userAddress: string;
  hasAccount: boolean;
  userInsurance: boolean;
  occasionalCourier: boolean;
  valid: boolean;
  userSubscription: number;
  subscription: Subscription[];
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<'id' | 'userLastName'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [formData, setFormData] = useState<Omit<User, 'id' | 'subscription'>>({
    userFirstName: '',
    userLastName: '',
    email: '',
    userRole: '',
    userStatus: '',
    userAddress: '',
    hasAccount: false,
    userInsurance: false,
    occasionalCourier: false,
    valid: false,
    userSubscription: 0,
  });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3001/users');
        const data = await res.json();
        const loadedUsers = data.users || (Array.isArray(data) ? data : []);
        setUsers(loadedUsers);
        setFilteredUsers(loadedUsers);
      } catch (error) {
        console.error("Erreur fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (searchTerm) {
      result = result.filter(user =>
        `${user.userFirstName} ${user.userLastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    result.sort((a, b) => {
      const valueA = sortKey === 'id' ? a.id : a.userLastName.toLowerCase();
      const valueB = sortKey === 'id' ? b.id : b.userLastName.toLowerCase();
      if (valueA < valueB) return sortAsc ? -1 : 1;
      if (valueA > valueB) return sortAsc ? 1 : -1;
      return 0;
    });
    setFilteredUsers(result);
  }, [searchTerm, sortKey, sortAsc, users]);

  const openModal = async (user: User) => {
    const res = await fetch(`http://localhost:3001/users/${user.id}`);
    const fullUser: User = await res.json();
    setSelectedUser(fullUser);
    setFormData({
      userFirstName: fullUser.userFirstName,
      userLastName: fullUser.userLastName,
      email: fullUser.email,
      userRole: fullUser.userRole,
      userStatus: fullUser.userStatus,
      userAddress: fullUser.userAddress,
      hasAccount: fullUser.hasAccount,
      userInsurance: fullUser.userInsurance,
      occasionalCourier: fullUser.occasionalCourier,
      valid: fullUser.valid,
      userSubscription: fullUser.userSubscription,
    });
    setSubscriptions(fullUser.subscription);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setSubscriptions([]);
    setShowModal(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (selectedUser) {
      try {
        const res = await fetch(`http://localhost:3001/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updatedUser = await res.json();
          setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
        }
      } catch (error) {
        console.error("Erreur mise à jour utilisateur", error);
      }
    }
    closeModal();
  };

  const renderSubscriptionLabel = (value: number) => {
    switch (value) {
      case 1:
        return "Starter";
      case 2:
        return "Premium";
      default:
        return "Free";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des Utilisateurs</h1>

      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          className="border px-3 py-2 w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => {
              setSortKey('id');
              setSortAsc(!sortAsc);
            }}
          >
            Trier par ID {sortKey === 'id' && (sortAsc ? '↑' : '↓')}
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => {
              setSortKey('userLastName');
              setSortAsc(!sortAsc);
            }}
          >
            Trier par Nom {sortKey === 'userLastName' && (sortAsc ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Prénom</th>
            <th className="border px-4 py-2">Nom</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Statut</th>
            <th className="border px-4 py-2">Abonnement</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.userFirstName}</td>
              <td className="border px-4 py-2">{user.userLastName}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.userStatus}</td>
              <td className="border px-4 py-2">{renderSubscriptionLabel(user.userSubscription)}</td>
              <td className="border px-4 py-2">
                <button onClick={() => openModal(user)} className="bg-blue-500 text-white py-1 px-3 rounded mr-2">Modifier</button>
                <button onClick={() => openModal(user)} className="bg-red-500 text-white py-1 px-3 rounded">Bannir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Modifier: {selectedUser.userFirstName} {selectedUser.userLastName}
            </h2>
            <form>
              {['userFirstName','userLastName','email','userRole','userStatus','userAddress'].map((field) => (
                <div className="mb-2" key={field}>
                  <label className="block font-bold">{field}:</label>
                  <input
                    type="text"
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleInputChange}
                    className="border px-2 py-1 w-full"
                  />
                </div>
              ))}
              <div className="mb-2">
                <label className="block font-bold">Abonnement:</label>
                <select
                  name="userSubscription"
                  value={formData.userSubscription}
                  onChange={handleInputChange}
                  className="border px-2 py-1 w-full"
                >
                  <option value={0}>Free</option>
                  <option value={1}>Starter</option>
                  <option value={2}>Premium</option>
                </select>
              </div>
              {["hasAccount", "userInsurance", "occasionalCourier", "valid"].map((field) => (
                <div className="mb-2 flex items-center" key={field}>
                  <label className="block font-bold mr-2">{field}:</label>
                  <input
                    type="checkbox"
                    name={field}
                    checked={(formData as any)[field]}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
              <div className="mb-2">
                <label className="block font-bold">Abonnements:</label>
                <ul className="list-disc pl-5">
                  {Array.isArray(subscriptions) && subscriptions.length > 0 ? (
                    subscriptions.map((sub) => (
                      <li key={sub.id}>
                        {sub.name} - {sub.price}€ ({sub.startDate} → {sub.endDate})
                      </li>
                    ))
                  ) : (
                    <li>Aucun abonnement</li>
                  )}
                </ul>
              </div>
              <div className="mt-4">
                <button type="button" onClick={handleUpdate} className="bg-green-500 text-white py-2 px-4 rounded mr-2">Enregistrer</button>
                <button type="button" onClick={closeModal} className="bg-gray-300 text-black py-2 px-4 rounded">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
