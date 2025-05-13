"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, User } from "@/stores/data-users";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const setUser = useStore((state) => state.updateUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsLoading(true);
    console.log(formRef);
    const formData = new FormData(formRef.current as HTMLFormElement);
    const data = {
      firstName: formData.get("firstName") || "",
      lastName: formData.get("lastName") || "",
      email: formData.get("email") || "",
      password: formData.get("password") || "",
      confirmPassword: formData.get("confirmPassword") || "",
    };
    console.log(data);

    // Verifier si le mot de passe et la confirmation du mot de passe correspondent
    if (data.password !== data.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    // function BearCounter() {
    //   const bears = useStore((state) => state.bears);
    //   return <h1>{bears} bears around here...</h1>;
    // }
    setUser({
      prenom: data.firstName,
      nom: data.lastName,
      email: data.email,
      password: data.password,
      date_naissance: new Date(),
      genre: "",
      adresse: "",
      ville: "",
      code_postal: "",
      telephone: "",
      profession: "",
      terms: false,
      data: false,
    } as User);

    // const user = useStore.getState().user;
    // console.log(user);


    setTimeout(() => {
      setIsLoading(false);
      router.push("/onboarding/step-1");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-teal-700 hover:text-teal-900 hover:bg-teal-50"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </Button>

        <Card className="w-full border-teal-200">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Stethoscope className="h-12 w-12 text-teal-600" />
            </div>
            <CardTitle className="text-2xl text-center text-teal-900">
              Créer un compte
            </CardTitle>
            <CardDescription className="text-center text-teal-700">
              Inscrivez-vous pour commencer votre analyse médicale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" ref={formRef}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-teal-700">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-teal-700">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-teal-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-teal-700">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-teal-700">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  required
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-center w-full text-sm text-teal-700">
              Vous avez déjà un compte?{" "}
              <Link
                href="/auth/login"
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
