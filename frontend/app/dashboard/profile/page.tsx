"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideUser, FileText, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { User as BaseUser } from "@/stores/data-users";

interface Conversation {
  id: number;
  titre: string;
}

interface User extends BaseUser {
  conversations?: Conversation[];
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Récupérer les données utilisateur
  useEffect(() => {
    console.log("token:", localStorage.getItem("token"));

    if (!localStorage.getItem("token")) {
      // Rediriger vers la page de connexion si le token n'est pas présent
      router.push("/auth/login");
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/me",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données utilisateur"
          );
        }

        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen min-w-[80vw]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Si les données n'ont pas été chargées correctement
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Information!</strong>
          <span className="block sm:inline">
            {" "}
            Aucune donnée utilisateur disponible.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-[80vw] py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-teal-900 mb-2">Mon profil</h1>
        <p className="text-gray-600">Vos informations personnelles</p>
      </motion.div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <LucideUser className="h-4 w-4" />
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger
            value="conversations"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Conversations</span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Dossier médical</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">
                      Prénom
                    </h3>
                    <p className="text-base font-medium">
                      {userData.prenom || "Non renseigné"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                    <p className="text-base font-medium">
                      {userData.nom || "Non renseigné"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-base font-medium">
                      {userData.email || "Non renseigné"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">
                      Téléphone
                    </h3>
                    <p className="text-base font-medium">
                      {userData.telephone || "Non renseigné"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">
                      Date de naissance
                    </h3>
                    <p className="text-base font-medium">
                      {userData.date_naissance
                        ? new Date(userData.date_naissance).toLocaleDateString(
                            "fr-FR"
                          )
                        : "Non renseigné"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                    <p className="text-base font-medium">
                      {userData.genre === "male"
                        ? "Homme"
                        : userData.genre === "female"
                        ? "Femme"
                        : userData.genre === "other"
                        ? "Autre"
                        : userData.genre === "prefer-not-to-say"
                        ? "Non précisé"
                        : userData.genre || "Non renseigné"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">
                      Profession
                    </h3>
                    <p className="text-base font-medium">
                      {userData.profession || "Non renseigné"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Adresse
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-base font-medium">
                      {userData.adresse || "Non renseigné"}
                    </p>
                    {(userData.code_postal || userData.ville) && (
                      <p className="text-base font-medium mt-1">
                        {userData.code_postal || ""} {userData.ville || ""}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="conversations">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Mes conversations</CardTitle>
                <CardDescription>
                  Historique de vos conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userData.conversations && userData.conversations.length > 0 ? (
                  <div className="space-y-4">
                    {userData.conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-teal-600" />
                          <p className="font-medium">{conversation.titre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Aucune conversation enregistrée
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="medical">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Dossier médical</CardTitle>
                <CardDescription>Vos informations médicales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">
                      Allergies
                    </h3>
                    <p className="text-base font-medium">
                      {userData.allergies || "Aucune allergie renseignée"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">
                      Médicaments
                    </h3>
                    <p className="text-base font-medium">
                      {userData.medicaments || "Aucun médicament renseigné"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Antécédents médicaux
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-base font-medium">
                      {userData.antecedents ||
                        "Aucun antécédent médical renseigné"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
