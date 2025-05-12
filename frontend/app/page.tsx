"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Stethoscope,
  FileText,
  User,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stethoscope className="h-8 w-8 text-teal-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-teal-900">MediAssist</h1>
        </div>
        <nav>
          <Button
            variant="ghost"
            asChild
            className="text-teal-700 hover:text-teal-900 hover:bg-teal-50"
          >
            <Link href="/auth/login">Se connecter</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-teal-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Votre assistant médical intelligent
            </motion.h2>
            <motion.p
              className="text-lg text-teal-700 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Téléchargez vos documents médicaux, complétez votre profil et
              obtenez des analyses personnalisées basées sur des données
              scientifiques.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg rounded-md"
                asChild
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Link href="/auth/register">
                  <span className="flex items-center gap-2">
                    Commencer
                    <motion.div
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-3 max-w-xs">
                      <p className="text-gray-700">
                        Pouvez-vous analyser mes résultats d&apos;analyses
                        sanguines?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-teal-100 rounded-2xl p-3 max-w-xs">
                      <p className="text-teal-800">
                        Bien sûr. D&apos;après vos résultats, vos taux de
                        cholestérol et de glycémie sont dans les normes. Votre
                        taux de ferritine est légèrement bas, ce qui pourrait
                        indiquer une carence en fer.
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center">
                      <HeartPulse className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-3 max-w-xs">
                      <p className="text-gray-700">
                        Que me recommandez-vous pour augmenter mon taux de fer?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-3">
                      <p className="text-gray-700">resultats_analyses.pdf</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md border border-teal-100">
            <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-teal-900 mb-2">
              Téléchargez vos documents
            </h3>
            <p className="text-teal-700">
              Importez facilement vos résultats d&apos;analyses, imageries
              médicales et ordonnances pour une analyse complète.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-teal-100">
            <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-teal-900 mb-2">
              Complétez votre profil
            </h3>
            <p className="text-teal-700">
              Renseignez vos antécédents médicaux et informations personnelles
              pour des analyses adaptées à votre situation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-teal-100">
            <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <HeartPulse className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-teal-900 mb-2">
              Obtenez des analyses
            </h3>
            <p className="text-teal-700">
              Recevez des interprétations précises et des recommandations basées
              sur les dernières avancées médicales.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mt-24 bg-white p-8 rounded-xl shadow-md border border-teal-100"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h3 className="text-2xl font-bold text-teal-900 mb-6 text-center">
            Approuvé par des professionnels de santé
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <p className="text-teal-700 italic mb-4">
                &quot;MediAssist représente une avancée significative dans
                l&apos;interprétation des données médicales. L&apos;outil
                fournit des analyses précises et des recommandations fondées sur
                des données probantes.&quot;
              </p>
              <div className="flex items-center mt-auto">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-teal-900">
                    Dr. Marie Laurent
                  </p>
                  <p className="text-sm text-teal-600">
                    Médecin généraliste, CHU de Lyon
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-teal-700 italic mb-4">
                &quot;Un outil précieux pour les patients qui souhaitent mieux
                comprendre leurs résultats médicaux. La plateforme est
                rigoureuse dans ses analyses et facilite la communication
                patient-médecin.&quot;
              </p>
              <div className="flex items-center mt-auto">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-teal-900">
                    Pr. Thomas Dubois
                  </p>
                  <p className="text-sm text-teal-600">
                    Professeur en médecine, Université de Paris
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="container mx-auto py-8 mt-20 border-t border-teal-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-teal-600">
            © 2025 MediAssist. Tous droits réservés.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-teal-600 hover:text-teal-800">
              Conditions d&apos;utilisation
            </a>
            <a href="#" className="text-teal-600 hover:text-teal-800">
              Politique de confidentialité
            </a>
            <a href="#" className="text-teal-600 hover:text-teal-800">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
