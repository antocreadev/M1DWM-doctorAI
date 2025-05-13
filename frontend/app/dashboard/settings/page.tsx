"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save, Loader2, Moon, Sun, Globe, Lock } from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-violet-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">
          Configurez les paramètres de votre application.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-violet-600" />
              Paramètres généraux
            </CardTitle>
            <CardDescription>
              Configurez les paramètres généraux de l&apos;application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Thème</Label>
                <p className="text-sm text-gray-500">
                  Choisissez le thème de l&apos;application.
                </p>
              </div>
              <Select defaultValue="system">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Thème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Clair</span>
                  </SelectItem>
                  <SelectItem value="dark" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Sombre</span>
                  </SelectItem>
                  <SelectItem
                    value="system"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Système</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Langue</Label>
                <p className="text-sm text-gray-500">
                  Choisissez la langue de l&apos;application.
                </p>
              </div>
              <Select defaultValue="fr">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Français</span>
                  </SelectItem>
                  <SelectItem value="en" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>English</span>
                  </SelectItem>
                  <SelectItem value="es" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Español</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-violet-600" />
              Confidentialité
            </CardTitle>
            <CardDescription>
              Configurez vos paramètres de confidentialité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Partage de données</Label>
                <p className="text-sm text-gray-500">
                  Autoriser le partage de vos données pour améliorer nos
                  services.
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Cookies</Label>
                <p className="text-sm text-gray-500">
                  Autoriser l&apos;utilisation de cookies pour personnaliser
                  votre expérience.
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">
                  Historique des conversations
                </Label>
                <p className="text-sm text-gray-500">
                  Conserver l&apos;historique de vos conversations.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSave}
              className="ml-auto bg-violet-600 hover:bg-violet-700"
              disabled={isSaving}
            >
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
    </div>
  );
}
