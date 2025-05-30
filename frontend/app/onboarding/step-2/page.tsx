"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Pill,
  AlertCircle,
} from "lucide-react";
import { useStore, User } from "@/stores/data-users";
import { Checkbox } from "@/components/ui/checkbox";

export default function OnboardingStep2() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const setUser = useStore((state) => state.updateUser);
  const user = useStore.getState().user;

  const handleNext = () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    // Correct handling of checkbox values
    const termsAccepted = formData.get("terms") === "on";
    const dataProcessingAccepted = formData.get("data-processing") === "on";

    // Update the user object with the new data
    const updatedUser = {
      ...user,
      antecedents: formData.get("medical-details")?.toString() || "",
      medicaments: formData.get("medication-details")?.toString() || "",
      allergies: formData.get("allergies-details")?.toString() || "",
      terms: termsAccepted,
      dataProcessing: dataProcessingAccepted,
    };

    console.log("medical-details", formData.get("medical-details"));
    console.log("medication-details", formData.get("medication-details"));
    console.log("allergies-details", formData.get("allergies-details"));
    console.log("terms", termsAccepted);
    console.log("data-processing", dataProcessingAccepted);
    console.log("updatedUser", updatedUser);

    // First update the local state
    setUser(updatedUser);

    console.log("user", user);

    // Then make the API call with the updated user data
    fetch(
      "https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        if (data.message === "Utilisateur enregistré") {
          router.push("/onboarding/step-3");
        } else {
          alert(data.message || "Une erreur est survenue");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Erreur de connexion au serveur. Veuillez réessayer.");
      });
  };

  const handleBack = () => {
    router.push("/onboarding/step-1");
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
            <HeartPulse className="h-5 w-5 text-teal-600" />
            Informations de santé
          </CardTitle>
          <CardDescription className="text-teal-700">
            Ces informations nous aideront à mieux comprendre votre situation
            médicale et à personnaliser nos analyses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" ref={formRef}>
            <div className="space-y-3">
              <Label className="text-teal-700 flex items-center gap-1">
                <HeartPulse className="h-4 w-4" /> Avez-vous des antécédents
                médicaux particuliers?
              </Label>
              <RadioGroup defaultValue="no" name="medical-history">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="yes"
                    id="medical-history-yes"
                    className="text-teal-600 border-teal-500 focus:ring-teal-500"
                  />
                  <Label
                    htmlFor="medical-history-yes"
                    className="text-teal-700"
                  >
                    Oui
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="no"
                    id="medical-history-no"
                    className="text-teal-600 border-teal-500 focus:ring-teal-500"
                  />
                  <Label htmlFor="medical-history-no" className="text-teal-700">
                    Non
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical-details" className="text-teal-700">
                Si oui, veuillez préciser
              </Label>
              <Textarea
                id="medical-details"
                name="medical-details"
                placeholder="Décrivez vos antécédents médicaux (maladies chroniques, interventions chirurgicales, etc.)"
                className="min-h-[100px] border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-teal-700 flex items-center gap-1">
                <Pill className="h-4 w-4" /> Prenez-vous actuellement des
                médicaments?
              </Label>
              <RadioGroup defaultValue="no" name="medication">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="yes"
                    id="medication-yes"
                    className="text-teal-600 border-teal-500 focus:ring-teal-500"
                  />
                  <Label htmlFor="medication-yes" className="text-teal-700">
                    Oui
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="no"
                    id="medication-no"
                    className="text-teal-600 border-teal-500 focus:ring-teal-500"
                  />
                  <Label htmlFor="medication-no" className="text-teal-700">
                    Non
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medication-details" className="text-teal-700">
                Si oui, veuillez les lister
              </Label>
              <Textarea
                id="medication-details"
                name="medication-details"
                placeholder="Nom du médicament, posologie, fréquence"
                className="min-h-[100px] border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-teal-700 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Avez-vous des allergies?
              </Label>
              <RadioGroup defaultValue="no" name="allergies">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="yes"
                    id="allergies-yes"
                    className="text-teal-600 border-teal-500 focus:ring-teal-500"
                  />
                  <Label htmlFor="allergies-yes" className="text-teal-700">
                    Oui
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="no"
                    id="allergies-no"
                    className="text-teal-600 border-teal-500 focus:ring-teal-500"
                  />
                  <Label htmlFor="allergies-no" className="text-teal-700">
                    Non
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies-details" className="text-teal-700">
                Si oui, veuillez préciser
              </Label>
              <Textarea
                id="allergies-details"
                name="allergies-details"
                placeholder="Allergènes et réactions observées"
                className="min-h-[100px] border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  name="terms"
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
                  name="data-processing"
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
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
            data-cy="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            data-cy="next-button"
          >
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
