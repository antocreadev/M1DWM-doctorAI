"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calculate progress based on current step
    if (pathname.includes("step-1")) {
      setProgress(25)
    } else if (pathname.includes("step-2")) {
      setProgress(50)
    } else if (pathname.includes("step-3")) {
      setProgress(75)
    } else if (pathname.includes("step-4")) {
      setProgress(100)
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal-900 text-center mb-6">Complétez votre dossier médical</h1>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <motion.div
              className="bg-teal-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-between text-sm text-teal-700">
            <span>Informations</span>
            <span>Santé</span>
            <span>Documents</span>
            <span>Finalisation</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
