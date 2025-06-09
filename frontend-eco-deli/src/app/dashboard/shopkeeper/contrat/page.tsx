"use client"

import { useEffect, useState } from "react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { useLang } from '../../../context/LanguageContext'

interface CompanyDetail {
  id: number
  companyName: string
  legalStructure: string
  siren: string
  dateOfIncorporation: string
  registeredOfficeAddressStreet: string
  registeredOfficeAddressCity: string
  registeredOfficeAddressPostalCode: string
  startDateOfActivity: string
  currentYear: string
}

export default function PDFDownloader() {
  const [usersId, setUserId] = useState<number | null>(null)
  const [userError, setUserError] = useState<string | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [loadingIds, setLoadingIds] = useState<number[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const currentYear = new Date().getFullYear().toString()
  const [companies, setCompanies] = useState<CompanyDetail[]>([])
  const { t, setLang, lang } = useLang();
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur récupération utilisateur")
        const data = await res.json()
        setUserId(data.userId)
      } catch (err: any) {
        setUserError(err.message)
      } finally {
        setUserLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (usersId === null) return
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-detail/user/${usersId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Impossible de charger les contrats")
        const data: CompanyDetail[] = await res.json()
        setCompanies(data)
      } catch (err: any) {
        setUserError(err.message)
      }
    }
    fetchCompanies()
  }, [usersId])

  const drawWrappedText = (
    page: any,
    text: string,
    x: number,
    yStart: number,
    size: number,
    font: any,
    maxWidth: number | null,
    lineHeight: number,
  ) => {
    let cursorY = yStart
    if (!maxWidth) {
      page.drawText(text, { x, y: cursorY, size, font })
      return cursorY - lineHeight
    }
    const words = text.split(" ")
    let line = words[0]
    for (let i = 1; i < words.length; i++) {
      const testLine = line + " " + words[i]
      if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
        page.drawText(line, { x, y: cursorY, size, font })
        cursorY -= lineHeight
        line = words[i]
      } else {
        line = testLine
      }
    }
    page.drawText(line, { x, y: cursorY, size, font })
    return cursorY - lineHeight
  }

  const updateCompanyDetail = async (company: CompanyDetail) => {
    setSavingId(company.id)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token manquant")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-detail/${company.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(company),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erreur lors de la mise à jour")
      }

      // Notification de succès plus élégante
      const updatedCompanies = [...companies]
      setCompanies(updatedCompanies)
    } catch (err: any) {
      setUserError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  const generatePDFFor = async (data: CompanyDetail) => {
    setLoadingIds((ids) => [...ids, +data.currentYear])
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595.28, 841.89])
      const { height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      const incDate = new Date(data.dateOfIncorporation).toLocaleDateString("fr-FR")
      const startDate = new Date(data.startDateOfActivity).toLocaleDateString("fr-FR")
      const today = new Date().toLocaleDateString("fr-FR")

      page.drawText(`Contrat EcoDeli – Exercice ${data.currentYear}`, {
        x: 50,
        y: height - 80,
        size: 20,
        font,
        color: rgb(0, 0.53, 0.21),
      })

      const entries = [
        { text: `Société: ${data.companyName}`, size: 14, maxWidth: null, lh: 16 },
        { text: `Forme Juridique: ${data.legalStructure}`, size: 14, maxWidth: null, lh: 16 },
        { text: `SIREN: ${data.siren}`, size: 14, maxWidth: null, lh: 16 },
        { text: `Date d'incorporation: ${incDate}`, size: 14, maxWidth: null, lh: 16 },
        {
          text: `Adresse du siège: ${data.registeredOfficeAddressStreet}, ${data.registeredOfficeAddressPostalCode} ${data.registeredOfficeAddressCity}`,
          size: 12,
          maxWidth: 500,
          lh: 14,
        },
        { text: `Début d'activité: ${startDate}`, size: 14, maxWidth: null, lh: 16 },
        { text: `Exercice en cours: ${data.currentYear}`, size: 14, maxWidth: null, lh: 16 },
        { text: `Généré le: ${today}`, size: 12, maxWidth: null, lh: 14 },
        { text: `Objet du contrat :`, size: 20, maxWidth: null, lh: 22 },
        {
          text: `Chaque commerçant souhaitant collaborer avec EcoDeli doit disposer d'un espace sécurisé et personnalisé...`,
          size: 12,
          maxWidth: 500,
          lh: 16,
        },
      ]

      let cursorY = height - 120
      const spacing = 4
      entries.forEach(({ text, size, maxWidth, lh }) => {
        cursorY = drawWrappedText(page, text, 50, cursorY, size, font, maxWidth, lh) - spacing
      })

      drawWrappedText(
        page,
        `Ce contrat est établi entre EcoDeli et le commerçant pour l'usage des services de livraison.`,
        50,
        cursorY - spacing,
        12,
        font,
        500,
        16,
      )

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `contrat-ecodeli-${data.currentYear}.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      console.error(`Erreur génération PDF pour ${data.currentYear} :`, err)
      setUserError(`Erreur lors de la génération du PDF pour ${data.currentYear}`)
    } finally {
      setLoadingIds((ids) => ids.filter((y) => y !== +data.currentYear))
    }
  }

  const handleInputChange = (companyId: number, field: keyof CompanyDetail, value: string) => {
    setCompanies((prev) => prev.map((company) => (company.id === companyId ? { ...company, [field]: value } : company)))
  }

  if (userLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 w-3/4 mb-6 bg-gray-200 animate-pulse rounded"></div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="w-full bg-white rounded-lg shadow-md p-6">
                <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <p>{t('computer')}</p>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-green-600"
          >
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M8 10h.01" />
            <path d="M16 10h.01" />
            <path d="M12 10h.01" />
            <path d="M8 14h.01" />
            <path d="M16 14h.01" />
            <path d="M12 14h.01" />
          </svg>
          <h1 className="text-3xl font-bold">
            <span className="text-black">Eco</span>
            <span className="text-green-600">Deli</span>
            <span className="text-gray-700 ml-2 font-normal">Gestion des contrats</span>
          </h1>
        </div>

        {userError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-red-500 mr-2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p className="text-red-700">{userError}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {companies.length === 0 && !userError ? (
            <div className="bg-white rounded-lg shadow-md p-12">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12 text-gray-400 mx-auto mb-4"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
                <p className="text-gray-500">Aucun contrat disponible</p>
              </div>
            </div>
          ) : (
            companies.map((data) => {
              const editable = data.currentYear === currentYear
              const isGenerating = loadingIds.includes(+data.currentYear)
              const isSaving = savingId === data.id

              return (
                <div key={data.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          Exercice {data.currentYear}
                          {editable && (
                            <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              Éditable
                            </span>
                          )}
                        </h2>
                        <p className="text-gray-500 text-sm">{data.companyName || "Nom de l'entreprise non défini"}</p>
                      </div>
                      <button
                        onClick={() => generatePDFFor(data)}
                        disabled={isGenerating}
                        className={`px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 ${
                          isGenerating ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-gray-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Génération...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" x2="12" y1="15" y2="3" />
                            </svg>
                            Télécharger PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="p-6">
                    {!editable ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Nom de l'entreprise</p>
                            <p className="text-gray-900">{data.companyName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Forme juridique</p>
                            <p className="text-gray-900">{data.legalStructure}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">SIREN</p>
                            <p className="text-gray-900">{data.siren}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Adresse</p>
                            <p className="text-gray-900">
                              {data.registeredOfficeAddressStreet}, {data.registeredOfficeAddressPostalCode}{" "}
                              {data.registeredOfficeAddressCity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 italic">
                          Les informations des exercices précédents ne sont pas modifiables.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor={`company-name-${data.id}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nom de l'entreprise
                            </label>
                            <input
                              id={`company-name-${data.id}`}
                              type="text"
                              value={data.companyName}
                              onChange={(e) => handleInputChange(data.id, "companyName", e.target.value)}
                              placeholder="Nom de l'entreprise"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor={`legal-structure-${data.id}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Forme juridique
                            </label>
                            <input
                              id={`legal-structure-${data.id}`}
                              type="text"
                              value={data.legalStructure}
                              onChange={(e) => handleInputChange(data.id, "legalStructure", e.target.value)}
                              placeholder="SARL, SAS, etc."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor={`siren-${data.id}`} className="block text-sm font-medium text-gray-700">
                              SIREN
                            </label>
                            <input
                              id={`siren-${data.id}`}
                              type="text"
                              value={data.siren}
                              onChange={(e) => handleInputChange(data.id, "siren", e.target.value)}
                              placeholder="Numéro SIREN"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor={`street-${data.id}`} className="block text-sm font-medium text-gray-700">
                              Rue du siège
                            </label>
                            <input
                              id={`street-${data.id}`}
                              type="text"
                              value={data.registeredOfficeAddressStreet}
                              onChange={(e) =>
                                handleInputChange(data.id, "registeredOfficeAddressStreet", e.target.value)
                              }
                              placeholder="Adresse"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor={`city-${data.id}`} className="block text-sm font-medium text-gray-700">
                              Ville du siège
                            </label>
                            <input
                              id={`city-${data.id}`}
                              type="text"
                              value={data.registeredOfficeAddressCity}
                              onChange={(e) =>
                                handleInputChange(data.id, "registeredOfficeAddressCity", e.target.value)
                              }
                              placeholder="Ville"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor={`postal-code-${data.id}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Code postal du siège
                            </label>
                            <input
                              id={`postal-code-${data.id}`}
                              type="text"
                              value={data.registeredOfficeAddressPostalCode}
                              onChange={(e) =>
                                handleInputChange(data.id, "registeredOfficeAddressPostalCode", e.target.value)
                              }
                              placeholder="Code postal"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {editable && (
                    <div className="px-6 py-4 bg-gray-50 flex justify-end">
                      <button
                        onClick={() => updateCompanyDetail(data)}
                        disabled={isSaving}
                        className={`px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 ${
                          isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Sauvegarder
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
