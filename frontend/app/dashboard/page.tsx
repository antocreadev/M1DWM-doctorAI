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
  Calendar,
  Phone,
  Mail,
  MapPin,
  Cake,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  date_naissance?: string;
  genre?: string;
  allergies?: string;
  antecedents?: string;
  medicaments?: string;
  groupe_sanguin?: string;
  derniere_consultation?: string;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setLoading(false);
      // enlevez le token et redirigez vers la page de connexion
      localStorage.removeItem("token");
      router.push("/auth/login");
      return;
    }

    fetch("https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Échec de récupération des données");
        }
        return response.json();
      })
      .then((data) => {
        console.log("User data fetched successfully:", data);
        setUserData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
        // En cas d'erreur, redirigez vers la page de connexion
        localStorage.removeItem("token");
        router.push("/auth/login");
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-w-[80vw]">
        <div className="animate-pulse text-teal-600 text-lg min-w-[80vw]">
          Chargement des données...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-[80vw]">
        <div className="text-red-600 text-lg min-w-[80vw]">
          Impossible de charger vos données. Veuillez vous reconnecter.
        </div>
      </div>
    );
  }

  const userFullName =
    `${userData.prenom || ""} ${userData.nom || ""}`.trim() || "—";
  const userAddress =
    [userData.adresse, userData.ville, userData.code_postal]
      .filter(Boolean)
      .join(", ") || "—";

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto min-w-[80vw]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-teal-50 p-6 rounded-lg shadow-sm border border-teal-100"
      >
        <h1 className="text-2xl font-bold text-teal-900 mb-2">
          Bienvenue, {userData.prenom || ""}
        </h1>
        <p className="text-teal-700">
          Votre assistant médical intelligent est prêt à analyser vos données.
        </p>
      </motion.div>

      {/* Profil utilisateur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-teal-200 overflow-hidden">
          <CardHeader className="bg-teal-50 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Profil Patient
            </CardTitle>
            <CardDescription className="text-teal-700">
              Vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <User className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">Nom:</span>
                  <span className="text-teal-900 ml-auto">{userFullName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <Mail className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">Email:</span>
                  <span className="text-teal-900 ml-auto">
                    {userData.email || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <Phone className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">Téléphone:</span>
                  <span className="text-teal-900 ml-auto">
                    {userData.telephone || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">Adresse:</span>
                  <span className="text-teal-900 ml-auto">{userAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <Cake className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">
                    Date de naissance:
                  </span>
                  <span className="text-teal-900 ml-auto">
                    {userData.date_naissance || "—"}
                  </span>
                </div>
              </div>
              <div className="space-y-1 border-t md:border-t-0 md:border-l border-teal-100 md:pl-4 pt-4 md:pt-0">
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <User className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">Genre:</span>
                  <span className="text-teal-900 ml-auto">
                    {userData.genre || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <AlertCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">Allergies:</span>
                  <span className="text-teal-900 ml-auto">
                    {userData.allergies || "Aucune"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">
                    Antécédents:
                  </span>
                  <span className="text-teal-900 ml-auto">
                    {userData.antecedents || "Aucun"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-teal-50 transition-colors">
                  <Pill className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">
                    Médicaments:
                  </span>
                  <span className="text-teal-900 ml-auto">
                    {userData.medicaments || "Aucun"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-teal-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                asChild
              >
                <Link href="/dashboard/profile">
                  Modifier mon profil
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100 hover:shadow-md transition-shadow">
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
