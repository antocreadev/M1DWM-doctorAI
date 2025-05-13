"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowRight,
  Calendar,
  User,
  MapPin,
  Phone,
  Briefcase,
} from "lucide-react";
import { useStore } from "@/stores/data-users";

export default function OnboardingStep1() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const user = useStore.getState().user;
  // const setUser = useStore((state) => state.updateUser);

  const handleNext = (event: React.FormEvent) => {
    event.preventDefault();
    // console.log(user);
    const formData = new FormData(formRef.current as HTMLFormElement);
    const data = {
      birthdate: formData.get("birthdate") || "",
      gender: formData.get("gender") || "",
      address: formData.get("address") || "",
      city: formData.get("city") || "",
      postalCode: formData.get("postalCode") || "",
      phone: formData.get("phone") || "",
      occupation: formData.get("occupation") || "",
    };

    console.log(data);

    // router.push("/onboarding/step-2");
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
            <User className="h-5 w-5 text-teal-600" />
            Informations personnelles
          </CardTitle>
          <CardDescription className="text-teal-700">
            Ces informations nous aideront à personnaliser votre expérience et à
            adapter nos analyses à votre profil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" ref={formRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="birthdate"
                  className="text-teal-700 flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" /> Date de naissance
                </Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  required
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-teal-700 flex items-center gap-1"
                >
                  <User className="h-4 w-4" /> Genre
                </Label>
                <Select
                  name="gender"
                >
                  <SelectTrigger className="border-teal-200 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Je préfère ne pas répondre
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-teal-700 flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" /> Adresse
              </Label>
              <Input
                name="address"
                id="address"
                placeholder="Votre adresse"
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-teal-700">
                  Ville
                </Label>
                <Input
                  name="city"
                  id="city"
                  placeholder="Votre ville"
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-teal-700">
                  Code postal
                </Label>
                <Input
                  name="postalCode"
                  id="postalCode"
                  placeholder="Code postal"
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-teal-700 flex items-center gap-1"
              >
                <Phone className="h-4 w-4" /> Numéro de téléphone
              </Label>
              <Input
                name="phone"
                id="phone"
                type="tel"
                placeholder="Votre numéro de téléphone"
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="occupation"
                className="text-teal-700 flex items-center gap-1"
              >
                <Briefcase className="h-4 w-4" /> Profession
              </Label>
              <Input
                name="occupation"
                id="occupation"
                placeholder="Votre profession"
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleNext}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
