"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

type Overview = {
  totalRevenue: number
  totalTransfers: number
}

type PlatformFee = {
  id: number
  packageId: number
  amount: number
  createdAt: string
}

type Transfer = {
  id: number
  clientName: string
  providerName: string
  amount: number
  status: string
  requestedAt: string
}

export default function AdminFinancePage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [fees, setFees] = useState<PlatformFee[]>([])
  const [totalPlatformFees, setTotalPlatformFees] = useState<number>(0)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTransfersAmount, setTotalTransfersAmount] = useState<number>(0)

  useEffect(() => {
    const token = localStorage.getItem("token")

    const fetchData = async () => {
      try {
        const [revenueRes, feesRes, totalFeesRes, transfersRes, totalTransfersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/provider/admin/total-revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/finance/platform-fees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/platform-fees-overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/finance/transfers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/provider/admin/total-transfers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const revenueData = await revenueRes.json()
        const feesData = await feesRes.json()
        const totalFeesData = await totalFeesRes.json()
        const transfersData = await transfersRes.json()
        const transfersTotal = await totalTransfersRes.json()

        setOverview({
          totalRevenue: parseFloat(revenueData),
          totalTransfers: parseFloat(transfersTotal),
        })

        setFees(Array.isArray(feesData) ? feesData : feesData.data || [])
        setTotalPlatformFees(parseFloat(totalFeesData?.total || 0))
        setTransfers(Array.isArray(transfersData) ? transfersData : transfersData.data || [])
      } catch (err) {
        console.error("Erreur chargement finance admin:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        Chargement des données...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Tableau de bord financier</h1>

      {/* Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Revenus totaux" value={overview?.totalRevenue ?? 0} />
        <StatCard title="Frais de plateforme + Abonnements" value={totalPlatformFees} />
        <StatCard title="Virements envoyés" value={overview?.totalTransfers ?? 0} />
      </div>

      {/* Frais de plateforme */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Frais de plateforme</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Colis</th>
                <th className="px-4 py-2">Montant (€)</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? (
                fees.map((fee) => (
                  <tr key={fee.id} className="border-t">
                    <td className="px-4 py-2">#{fee.packageId}</td>
                    <td className="px-4 py-2">{fee.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{new Date(fee.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                    Aucun frais enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Virements */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Virements prestataires</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Prestataire</th>
                <th className="px-4 py-2">Montant (€)</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length > 0 ? (
                transfers.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-2">{t.clientName}</td>
                    <td className="px-4 py-2">{t.providerName}</td>
                    <td className="px-4 py-2">{t.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 capitalize">{t.status}</td>
                    <td className="px-4 py-2">{new Date(t.requestedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    Aucun virement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-green-600 mt-1">{value.toFixed(2)} €</p>
    </div>
  )
}
