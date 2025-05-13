"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, HeartPulse, Pill, AlertCircle } from "lucide-react"

export default function OnboardingStep2() {
  const router = useRouter()

  const handleNext = () => {
    router.push("/onboarding/step-3")
  }

  const handleBack = () => {
    router.push("/onboarding/step-1")
  }

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
            Ces informations nous aideront à mieux comprendre votre situation médicale et à personnaliser nos analyses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-3">
              <Label className="text-teal-700 flex items-center gap-1">
                <HeartPulse className="h-4 w-4" /> Avez-vous des antécédents médicaux particuliers?
              </Label>
              <RadioGroup defaultValue="no">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="yes"
                    id="medical-history-yes"
                    className="text-teal-600 border-teal-500 focus:ring-teal-500"
                  />
                  <Label htmlFor="medical-history-yes" className="text-teal-700">
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
                placeholder="Décrivez vos antécédents médicaux (maladies chroniques, interventions chirurgicales, etc.)"
                className="min-h-[100px] border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-teal-700 flex items-center gap-1">
                <Pill className="h-4 w-4" /> Prenez-vous actuellement des médicaments?
              </Label>
              <RadioGroup defaultValue="no">
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
                placeholder="Nom du médicament, posologie, fréquence"
                className="min-h-[100px] border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-teal-700 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Avez-vous des allergies?
              </Label>
              <RadioGroup defaultValue="no">
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
                placeholder="Allergènes et réactions observées"
                className="min-h-[100px] border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </form>
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
          <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700 text-white">
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
