"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Shield, Bell, Save, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold text-violet-900 mb-2">Mon profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et vos préférences.</p>
      </motion.div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" defaultValue="Jean" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" defaultValue="Dupont" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="jean.dupont@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" defaultValue="+33 6 12 34 56 78" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="birthdate">Date de naissance</Label>
                    <Input id="birthdate" type="date" defaultValue="1980-01-15" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="gender">Genre</Label>
                    <Select defaultValue="male">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                        <SelectItem value="prefer-not-to-say">Je préfère ne pas répondre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea id="address" defaultValue="123 Rue de Paris, 75001 Paris" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} className="ml-auto bg-violet-600 hover:bg-violet-700" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez votre mot de passe et la sécurité de votre compte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-500">
                        Ajoutez une couche de sécurité supplémentaire à votre compte.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} className="ml-auto bg-violet-600 hover:bg-violet-700" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configurez vos préférences de notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Méthode de notification</h4>
                  <RadioGroup defaultValue="email">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="notification-email" />
                      <Label htmlFor="notification-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="notification-sms" />
                      <Label htmlFor="notification-sms">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="notification-both" />
                      <Label htmlFor="notification-both">Email et SMS</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Types de notifications</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-message">Nouveaux messages</Label>
                      <p className="text-sm text-gray-500">Recevez des notifications pour les nouveaux messages.</p>
                    </div>
                    <Switch id="new-message" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="document-updates">Mises à jour de documents</Label>
                      <p className="text-sm text-gray-500">
                        Recevez des notifications lorsque vos documents sont mis à jour.
                      </p>
                    </div>
                    <Switch id="document-updates" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reminders">Rappels</Label>
                      <p className="text-sm text-gray-500">Recevez des rappels pour vos rendez-vous et tâches.</p>
                    </div>
                    <Switch id="reminders" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Communications marketing</Label>
                      <p className="text-sm text-gray-500">
                        Recevez des informations sur nos nouveaux services et offres.
                      </p>
                    </div>
                    <Switch id="marketing" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} className="ml-auto bg-violet-600 hover:bg-violet-700" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
