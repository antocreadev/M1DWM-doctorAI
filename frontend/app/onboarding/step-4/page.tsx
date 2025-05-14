"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ArrowRight, ClipboardCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function OnboardingStep4() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const handleBack = () => {
    router.push("/onboarding/step-3");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-xl text-teal-900 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-teal-600" />
            Finalisation
          </CardTitle>
          <CardDescription className="text-teal-700">
            Vous avez presque terminé! Veuillez vérifier les informations et
            accepter les conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-teal-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-teal-800">
                    Informations personnelles
                  </h3>
                  <p className="text-sm text-teal-700 mt-1">
                    Vos informations personnelles ont été enregistrées avec
                    succès.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-teal-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-teal-800">
                    Informations de santé
                  </h3>
                  <p className="text-sm text-teal-700 mt-1">
                    Vos informations de santé ont été enregistrées avec succès.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-teal-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-teal-800">
                    Documents médicaux
                  </h3>
                  <p className="text-sm text-teal-700 mt-1">
                    Vos documents ont été téléchargés avec succès.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  className="border-teal-500 text-teal-600 focus:ring-teal-500"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none text-teal-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    J&apos;accepte les conditions d&apos;utilisation et la
                    politique de confidentialité
                  </Label>
                  <p className="text-sm text-teal-600">
                    En cochant cette case, vous acceptez nos{" "}
                    <a
                      href="#"
                      className="text-teal-600 hover:text-teal-800 underline"
                    >
                      Conditions d&apos;utilisation
                    </a>{" "}
                    et notre{" "}
                    <a
                      href="#"
                      className="text-teal-600 hover:text-teal-800 underline"
                    >
                      Politique de confidentialité
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="data-processing"
                  className="border-teal-500 text-teal-600 focus:ring-teal-500"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="data-processing"
                    className="text-sm font-medium leading-none text-teal-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    J&apos;autorise le traitement de mes données médicales
                  </Label>
                  <p className="text-sm text-teal-600">
                    Vos données seront traitées conformément à notre politique
                    de confidentialité et uniquement dans le but de vous fournir
                    des analyses médicales personnalisées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button
            onClick={handleComplete}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Terminer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
