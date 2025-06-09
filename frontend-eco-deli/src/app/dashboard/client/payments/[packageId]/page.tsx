"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Package,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ClientPackagePaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { packageId } = useParams()
  const router = useRouter()

  const [subscription, setSubscription] = useState<any>(null)
  const [discountedFee, setDiscountedFee] = useState<number>(0)
  const [clientId, setClientId] = useState<number | null>(null)
  const [providerId, setProviderId] = useState<number | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [baseAmount, setBaseAmount] = useState<number>(0)
  const [fee, setFee] = useState<number>(0)
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [packageInfo, setPackageInfo] = useState<any>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [freeShippingActivated, setFreeShippingActivated] = useState(false)
  const [discount, setDiscount] = useState<number>(0)
  const [hasPriorityFee, setHasPriorityFee] = useState(false)
  const [remainingFreePriority, setRemainingFreePriority] = useState<number | null>(null)



  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setMessage("Utilisateur non connecté.")
        return
      }

      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await userRes.json()
        if (!userRes.ok || !userData.userId) throw new Error("Utilisateur non valide.")
        setClientId(userData.userId)

        const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${userData.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const subData = await subRes.json()
        if (subRes.ok) {
          setSubscription(subData)
        }

        const packageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const packageData = await packageRes.json()
        if (!packageRes.ok || !packageData.advertisementId) throw new Error("Colis introuvable.")
        setPackageInfo(packageData)

        const delivererRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/deliverer`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const delivererData = await delivererRes.json()
        if (!delivererRes.ok || !delivererData.userId) throw new Error("Livreur introuvable.")
        setProviderId(delivererData.userId)

        const adRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${packageData.advertisementId}`)
        const adData = await adRes.json()
        if (!adRes.ok || adData.advertisementPrice == null) throw new Error("Prix introuvable.")
        const base = parseFloat(adData.advertisementPrice)

        const baseFee = parseFloat((base * 0.2).toFixed(2)) // 20%
        let feeToUse = baseFee
        let discount = 0
        let amountToPay = base + baseFee

        // Cas Premium
        if (subData?.subscriptionTitle === "Premium") {
          const hasFreeSend = base < 150 && !subData.hasUsedFreeShipping;

          if (hasFreeSend) {
            feeToUse = 0;
            amountToPay = base;
            discount = baseFee;
            setFreeShippingActivated(true);
          } else {
            const totalDiscountRate = (subData.shippingDiscount + subData.permanentDiscount) / 100;
            const totalDiscount = (base + baseFee) * totalDiscountRate;

            discount = totalDiscount;
            amountToPay = base + baseFee - totalDiscount;
          }
        }




        // Cas Starter
        else if (subData?.subscriptionTitle === "Starter") {
          // 5% sur frais obligatoires
          const baseReduction = baseFee * 0.05
          feeToUse = baseFee - baseReduction

          // 5% supplémentaire si colis XS ou S
          if (packageData?.packageDimension === "xs" || packageData?.packageDimension === "s") {
            const extraDiscount = (base + feeToUse) * 0.05
            discount += extraDiscount
            amountToPay = base + feeToUse - extraDiscount
          } else {
            amountToPay = base + feeToUse
          }
        }

        // Vérifie si le colis est prioritaire
        if (packageData?.prioritaire) {
          let surchargeApplied = false;

          if (!subData?.subscriptionTitle) {
            // Aucun abonnement → +15%
            const surcharge = amountToPay * 0.15;
            amountToPay += surcharge;
            surchargeApplied = true;
          } else if (subData.subscriptionTitle === "Starter") {
            const surcharge = amountToPay * 0.05;
            amountToPay += surcharge;
            surchargeApplied = true;
          } else if (subData.subscriptionTitle === "Premium") {
            const used = subData.priorityShippingUsed ?? 0;
            const remaining = 3 - used;

            setRemainingFreePriority(remaining > 0 ? remaining : 0);

            if (remaining <= 0) {
              const surcharge = amountToPay * 0.05;
              amountToPay += surcharge;
              surchargeApplied = true;
            }
          }

          if (surchargeApplied) {
            setHasPriorityFee(true);
          }
        }


        setBaseAmount(base)
        setFee(baseFee)
        setDiscountedFee(feeToUse)
        setAmount(parseFloat(amountToPay.toFixed(2)))
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.")
      }
    }

    fetchData()
  }, [packageId])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError(null)

    if (!stripe || !elements) {
      setError("Stripe non prêt.")
      return
    }
    if (!clientId || !providerId || !packageId || !amount) {
      setError("Informations incomplètes.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          providerId,
          amount,
          packageId,
          fee: parseFloat((amount - baseAmount).toFixed(2)),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.message || "Erreur lors de la création du paiement.")
      }

      const card = elements.getElement(CardElement)
      if (!card) throw new Error("Champ carte introuvable.")

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card },
      })

      if (result.error) throw new Error(result.error.message!)

      if (result.paymentIntent?.status === "succeeded") {
        setSuccess(true)
        elements.getElement(CardElement)?.clear()

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}/paid`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        })

        setTimeout(() => {
          router.push("/dashboard/client")
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/client/colis-a-payer"
          className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour aux colis à payer
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center">
            <CreditCard className="w-6 h-6 mr-3" />
            Paiement du colis #{packageId}
          </h1>
          <p className="mt-2 text-green-100">Complétez votre paiement pour finaliser l'envoi de votre colis.</p>
        </div>

        <div className="p-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Paiement réussi !</h2>
              <p className="text-gray-600 mb-6">
                Votre paiement a été traité avec succès. Vous allez être redirigé vers votre tableau de bord.
              </p>
              <Link
                href="/dashboard/client"
                className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Retour au tableau de bord
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-start">
                <Package className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Détails du colis</h3>
                  <p className="text-gray-600 text-sm">
                    {packageInfo?.packageName || `Colis #${packageId}`}
                    {packageInfo?.packageWeight && ` - ${packageInfo.packageWeight} kg`}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant à payer</label>
                <div className="text-sm text-gray-700 space-y-1 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{baseAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de service (20%)</span>
                    <span>
                      {discountedFee < fee ? (
                        <>
                          <s className="text-gray-400">{fee.toFixed(2)} €</s>{" "}
                          <span className="text-green-600">{discountedFee.toFixed(2)} €</span>
                        </>
                      ) : (
                        <>{fee.toFixed(2)} €</>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total à payer</span>
                    <span>{amount.toFixed(2)} €</span>
                  </div>
                    {discount > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Promotions appliquées</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {freeShippingActivated ? (
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Frais offerts (colis &lt; 150€)
                            </li>
                          ) : (
                            <>
                              {subscription?.subscriptionTitle === "Premium" && (
                                <li className="flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  Réduction Premium ({subscription.shippingDiscount + subscription.permanentDiscount}%)
                                </li>
                              )}
                              {subscription?.subscriptionTitle === "Starter" && (
                                <>
                                  <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    Réduction frais 5%
                                  </li>
                                  {["xs", "s"].includes(packageInfo?.packageDimension) && (
                                    <li className="flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                      Réduction XS/S 5%
                                    </li>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                    {packageInfo?.prioritaire && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Frais prioritaire</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {hasPriorityFee ? (
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-yellow-500" />
                              Des frais ont été ajoutés pour livraison prioritaire
                            </li>
                          ) : (
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Livraison prioritaire offerte
                            </li>
                          )}
                          {subscription?.subscriptionTitle === "Premium" && remainingFreePriority !== null && (
                            <li className="text-xs text-gray-500 ml-6">
                              {remainingFreePriority} livraison{remainingFreePriority > 1 ? "s" : ""} prioritaire{remainingFreePriority > 1 ? "s" : ""} gratuite{remainingFreePriority > 1 ? "s" : ""} restante{remainingFreePriority > 1 ? "s" : ""}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  {subscription?.subscriptionTitle === "Premium" && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">
                        Grâce à votre abonnement <strong>Premium</strong>, vous avez bénéficié des réductions suivantes :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mt-1">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Réduction Premium : {subscription.shippingDiscount}%
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Réduction permanente : {subscription.permanentDiscount}%
                        </li>
                      </ul>
                    </div>
                  )}

                  {subscription?.subscriptionTitle === "Starter" &&
                    (packageInfo?.packageDimension === "xs" || packageInfo?.packageDimension === "s") && (
                      <p className="text-sm text-green-600 mt-1">
                        Grâce à votre abonnement <strong>Starter</strong>, vous avez bénéficié de <strong>{subscription.permanentDiscount}% de réduction</strong> sur le total.
                      </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Informations de carte</label>
                <div className="border border-gray-300 p-3 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#9e2146",
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Lock className="w-3 h-3 mr-1" />
                  Vos informations de paiement sont sécurisées
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-green-500 mr-2" />
                  Paiement sécurisé via Stripe
                </div>
                <button
                  type="submit"
                  disabled={loading || !stripe || !clientId || !providerId}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-70 flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payer {amount.toFixed(2)} €
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
