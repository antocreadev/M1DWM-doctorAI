"use client";

import type React from "react";

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
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  FileText,
  Loader2,
  FileImage,
  FilePlus2,
} from "lucide-react";

export default function OnboardingStep3() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleNext = () => {
    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      router.push("/auth/login");
    }, 2000);
  };

  const handleBack = () => {
    router.push("/onboarding/step-2");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Function to get the appropriate icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension || "")) {
      return <FileImage className="h-5 w-5 text-teal-600" />;
    }

    return <FileText className="h-5 w-5 text-teal-600" />;
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
            <FilePlus2 className="h-5 w-5 text-teal-600" />
            Documents médicaux
          </CardTitle>
          <CardDescription className="text-teal-700">
            Téléchargez vos documents médicaux pour une analyse plus précise et
            personnalisée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-2 border-dashed border-teal-200 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dicom"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-10 w-10 text-teal-400 mb-2" />
                <p className="text-sm font-medium text-teal-700">
                  Glissez-déposez vos fichiers ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-teal-600 mt-1">
                  PDF, DOC, DOCX, JPG, JPEG, PNG, DICOM (max 20MB)
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                  type="button"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Parcourir les fichiers
                </Button>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-teal-700">
                  Documents téléchargés
                </h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-teal-50 p-3 rounded-md border border-teal-100"
                    >
                      <div className="flex items-center">
                        {getFileIcon(file.name)}
                        <span className="text-sm text-teal-700 truncate max-w-[200px] ml-2">
                          {file.name}
                        </span>
                        <span className="text-xs text-teal-500 ml-2">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0 text-teal-600 hover:text-teal-800 hover:bg-teal-100"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            onClick={handleNext}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléchargement...
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
