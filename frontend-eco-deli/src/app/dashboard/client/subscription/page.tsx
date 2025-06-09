"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'


const plans = [
  {
    name: 'Starter',
    price: 10,
    planId: 'starter_plan',
    priceId: 'price_1RR8liENhvkcPeq4meFzZRrU',
  },
  {
    name: 'Premium',
    price: 20,
    planId: 'premium_plan',
    priceId: 'price_1RR8mQENhvkcPeq4wyYK9q2a',
  },
]

export default function SubscriptionPage() {
  const [userId, setUserId] = useState(null)
  const [email, setEmail] = useState('')
  const [subscription, setSubscription] = useState(null)
  const [loading, setUserLoading] = useState(true)
  const [error, setUserError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token manquant')

        const res = await fetch('http://localhost:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur récupération utilisateur")
        const authData = await res.json()
        const id = authData.userId
        setUserId(id)

        const userRes = await fetch(`http://localhost:3001/users/${id}`)
        if (!userRes.ok) throw new Error("Erreur récupération infos utilisateur")
        const userData = await userRes.json()

        if (typeof userData.userSubscription === 'number') {
          setSubscription(userData.userSubscription)
          setEmail(userData.email)
        }
      } catch (err) {
        setUserError(err.message)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSubscribe = async (priceId, plan) => {
    try {
      const res = await axios.post('http://localhost:3001/payments/subscription-checkout', {
        userId,
        priceId,
        plan,
      })
      window.location.href = res.data.url
    } catch (err) {
      alert("Erreur lors de la souscription")
    }
  }

  const handleCancel = async () => {
    try {
      await axios.post('http://localhost:3001/payments/cancel-subscription', {
        email,
      })
      alert('Abonnement annulé')
      setSubscription(0)
    } catch (err) {
      alert("Erreur lors de l'annulation")
    }
  }

  const getPlanName = () => {
    switch (subscription) {
      case 1:
        return 'Starter'
      case 2:
        return 'Premium'
      default:
        return 'Aucun'
    }
  }

  if (loading) return <p>Chargement...</p>
  if (error) return <p>Erreur : {error}</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Votre abonnement actuel : {getPlanName()}</h2>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {plans.map((plan) => (
          <div key={plan.planId} style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <h3>{plan.name}</h3>
            <p>{plan.price} €/mois</p>
            <button onClick={() => handleSubscribe(plan.priceId, plan.planId)}>
              Choisir ce plan
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleCancel}>Annuler mon abonnement</button>
      </div>
    </div>
  )
}
