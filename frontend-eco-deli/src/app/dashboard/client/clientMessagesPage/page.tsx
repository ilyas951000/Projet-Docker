"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, User, Clock, Package, ExternalLink, Search, AlertCircle } from "lucide-react"
import Image from "next/image"

interface IMessage {
  id: number
  fromUserId: number
  toUserId: number
  content: string
  timestamp: string
  packageId?: number
}

interface IUser {
  id: number
  userFirstName: string
  userLastName: string
  userPhoto?: string
}

interface IConversation {
  userId: number
  lastMessage: IMessage
  packageId?: number
  advertisementId?: number
}

export default function LivreurConversationsPage() {
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [usersMap, setUsersMap] = useState<Record<number, IUser>>({})
  const [livreurId, setLivreurId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Utilisateur non connecté.")
        return
      }

      try {
        const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await resUser.json()
        if (!resUser.ok || !userData.userId) throw new Error("Erreur utilisateur.")
        const livreurId = userData.userId
        setLivreurId(livreurId)

        const resMessages = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/all/${livreurId}`)
        const allMessages: IMessage[] = await resMessages.json()
        if (!resMessages.ok) throw new Error("Erreur récupération messages.")

        const convMap: Record<string, IMessage> = {}

        allMessages.forEach((msg) => {
          const otherId = msg.fromUserId === livreurId ? msg.toUserId : msg.fromUserId
          const pkgId = msg.packageId || "noPkg"
          const key = `${otherId}-${pkgId}`

          if (!convMap[key] || new Date(msg.timestamp) > new Date(convMap[key].timestamp)) {
            convMap[key] = msg
          }
        })

        const conversations: IConversation[] = await Promise.all(
          Object.entries(convMap).map(async ([key, lastMessage]) => {
            const [userIdStr, pkgIdStr] = key.split("-")
            const userId = Number.parseInt(userIdStr, 10)
            const packageId = pkgIdStr !== "noPkg" ? Number.parseInt(pkgIdStr, 10) : undefined
            let advertisementId: number | undefined

            if (packageId) {
              try {
                const resPkg = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${packageId}`)
                const pkgData = await resPkg.json()
                if (resPkg.ok && pkgData?.advertisementId) {
                  advertisementId = pkgData.advertisementId
                }
              } catch {
                // Ne rien faire si erreur
              }
            }

            return {
              userId,
              lastMessage,
              packageId,
              advertisementId,
            }
          }),
        )

        const userIds = conversations.map((conv) => conv.userId)
        const fetchedUsers: Record<number, IUser> = {}
        for (const id of userIds) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`)
          const data = await res.json()
          fetchedUsers[id] = data
        }

        setUsersMap(fetchedUsers)
        setConversations(conversations)
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.")
      }
    }

    fetchConversations()
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Aujourd'hui - afficher l'heure
      return `Aujourd'hui à ${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    } else if (diffDays === 1) {
      // Hier
      return "Hier"
    } else if (diffDays < 7) {
      // Cette semaine - afficher le jour
      const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
      return days[date.getDay()]
    } else {
      // Plus ancien - afficher la date complète
      return date.toLocaleDateString("fr-FR")
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const user = usersMap[conv.userId]
    if (!user) return false
    const fullName = `${user.userFirstName} ${user.userLastName}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes Conversations</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune conversation</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore de conversations.</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun résultat</h3>
          <p className="text-gray-500 mb-6">Aucune conversation ne correspond à votre recherche "{searchTerm}".</p>
          <button
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {filteredConversations.map((conv) => {
              const user = usersMap[conv.userId]
              const chatUrl = `/dashboard/client/chat/${conv.userId}${
                conv.packageId ? `?packageId=${conv.packageId}` : ""
              }`

              return (
                <motion.div
                  key={`${conv.userId}-${conv.packageId || "noPkg"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={chatUrl} className="block">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          {user?.userPhoto ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.userPhoto}`}
                              alt={`${user.userFirstName} ${user.userLastName}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {user ? `${user.userFirstName} ${user.userLastName}` : `Utilisateur #${conv.userId}`}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimestamp(conv.lastMessage.timestamp)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{conv.lastMessage.content}</p>

                          {(conv.packageId || conv.advertisementId) && (
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              {conv.packageId && (
                                <span className="inline-flex items-center mr-3">
                                  <Package className="w-3 h-3 mr-1" />
                                  Colis #{conv.packageId}
                                </span>
                              )}
                              {conv.advertisementId && (
                                <span className="inline-flex items-center text-green-600 font-medium">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Voir l'annonce
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {conv.advertisementId && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-right">
                      <Link
                        href={`/annonces/${conv.advertisementId}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Voir l'annonce complète
                      </Link>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
