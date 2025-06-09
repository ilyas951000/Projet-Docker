"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    console.log('✔️ Paiement réussi – Session ID :', sessionId)
    // Optionnel : appel API pour rafraîchir les données utilisateur
  }, [sessionId])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Paiement réussi 🎉</h1>
      <p className="mt-4">Merci pour votre abonnement.</p>
      {sessionId && (
        <p className="mt-2 text-sm text-gray-500">Session ID : {sessionId}</p>
      )}
    </main>
  )
}
