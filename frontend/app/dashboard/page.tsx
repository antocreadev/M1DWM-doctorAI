"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  FileText,
  User,
  ArrowRight,
  Activity,
  Pill,
  Microscope,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-teal-900 mb-2">
          Bienvenue sur MediAssist
        </h1>
        <p className="text-teal-700">
          Votre assistant médical intelligent est prêt à analyser vos données.
        </p>
      </motion.div>

      {/* Medical stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 font-medium">
                    Tension artérielle
                  </p>
                  <p className="text-2xl font-bold text-teal-900 mt-1">
                    120/80
                  </p>
                  <p className="text-xs text-teal-600 mt-1">
                    Dernière mesure: 10/05/2025
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 font-medium">Glycémie</p>
                  <p className="text-2xl font-bold text-teal-900 mt-1">
                    5.4 mmol/L
                  </p>
                  <p className="text-xs text-teal-600 mt-1">
                    Dernière mesure: 12/05/2025
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Microscope className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 font-medium">
                    Cholestérol
                  </p>
                  <p className="text-2xl font-bold text-teal-900 mt-1">
                    4.2 mmol/L
                  </p>
                  <p className="text-xs text-teal-600 mt-1">
                    Dernière mesure: 08/05/2025
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <HeartPulse className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 font-medium">
                    Médicaments
                  </p>
                  <p className="text-2xl font-bold text-teal-900 mt-1">
                    2 actifs
                  </p>
                  <p className="text-xs text-teal-600 mt-1">
                    Dernière mise à jour: 15/05/2025
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Pill className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-teal-600" />
                Analyses récentes
              </CardTitle>
              <CardDescription className="text-teal-700">
                Consultez vos analyses médicales récentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm text-teal-800 border-l-2 border-teal-600 pl-3 py-1 font-medium">
                  Analyse sanguine
                </li>
                <li className="text-sm text-teal-700 border-l-2 border-teal-200 pl-3 py-1 hover:border-teal-600 transition-colors">
                  Suivi cardiaque
                </li>
                <li className="text-sm text-teal-700 border-l-2 border-teal-200 pl-3 py-1 hover:border-teal-600 transition-colors">
                  Consultation neurologie
                </li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                asChild
              >
                <Link href="/dashboard/new-chat">
                  Nouvelle analyse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Documents
              </CardTitle>
              <CardDescription className="text-teal-700">
                Gérez vos documents médicaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm text-teal-700 flex items-center gap-2 p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <FileText className="h-4 w-4 text-teal-600" />
                  <span className="flex-1">resultats_analyses.pdf</span>
                  <span className="text-xs text-teal-500">12 mai</span>
                </li>
                <li className="text-sm text-teal-700 flex items-center gap-2 p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <FileText className="h-4 w-4 text-teal-600" />
                  <span className="flex-1">imagerie_thorax.jpg</span>
                  <span className="text-xs text-teal-500">15 mai</span>
                </li>
                <li className="text-sm text-teal-700 flex items-center gap-2 p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <FileText className="h-4 w-4 text-teal-600" />
                  <span className="flex-1">ordonnance.pdf</span>
                  <span className="text-xs text-teal-500">18 mai</span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                asChild
              >
                <Link href="/dashboard/documents">
                  Gérer les documents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                Profil médical
              </CardTitle>
              <CardDescription className="text-teal-700">
                Gérez vos informations médicales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <span className="text-teal-600">Nom:</span>
                  <span className="font-medium text-teal-900">Jean Dupont</span>
                </div>
                <div className="flex justify-between text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <span className="text-teal-600">Groupe sanguin:</span>
                  <span className="font-medium text-teal-900">A+</span>
                </div>
                <div className="flex justify-between text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <span className="text-teal-600">Allergies:</span>
                  <span className="font-medium text-teal-900">Pénicilline</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                asChild
              >
                <Link href="/dashboard/profile">
                  Modifier le profil
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              Commencer une nouvelle analyse
            </CardTitle>
            <CardDescription className="text-teal-700">
              Posez vos questions médicales et obtenez des analyses basées sur
              vos données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              asChild
            >
              <Link href="/dashboard/new-chat">
                Nouvelle analyse
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}
