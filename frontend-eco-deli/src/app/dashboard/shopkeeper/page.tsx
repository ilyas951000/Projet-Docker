"use client"
import { useState } from "react"
import { Moon, Sun, Settings, PlusCircle, User, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            Bienvenue Chez <span className="text-black">Eco</span>
            <span className="text-green-500">Deli</span> - partie Commerçant
          </h2>
  )
}

