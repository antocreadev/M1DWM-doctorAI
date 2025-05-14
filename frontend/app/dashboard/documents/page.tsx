"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  FilePlus2,
  FileImage,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// URL de base de l'API
const API_URL = "http://127.0.0.1:5000";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Récupérer le token JWT (à adapter selon votre méthode d'authentification)
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Charger la liste des documents au chargement de la page
  useEffect(() => {
    console.log("Token:", localStorage.getItem("token"));
    if (!getAuthToken()) {
      toast.error("Veuillez vous connecter pour accéder à cette page.");

      return;
    }
    fetchDocuments();
  }, []);

  // Fonction pour récupérer la liste des documents depuis l'API
  const fetchDocuments = async () => {
    console.log("Token:", getAuthToken());
    console.log("Fetching documents...");
    try {
      const response = await fetch(`${API_URL}/fichiers`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
    }
  };

  // Fonction pour gérer le téléchargement d'un fichier
  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    const fileInput = e.target.elements.file;
    if (!fileInput.files || fileInput.files.length === 0) {
      setIsUploading(false);
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simuler la progression du téléchargement
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return newProgress;
        });
      }, 100);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur: ${response.status}`);
      }

      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setIsDialogOpen(false);
        fetchDocuments(); // Rafraîchir la liste après le téléchargement
      }, 500);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      setIsUploading(false);
    }
  };

  // Fonction pour télécharger un document
  const handleDownload = async (filename) => {
    try {
      window.open(
        `${API_URL}/fichiers/${filename}?token=${getAuthToken()}`,
        "_blank"
      );
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  // Fonction pour supprimer un document
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/fichiers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setDocumentToDelete(null);
      toast.success("Document supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer le document");
    }
  };

  // Fonction pour obtenir l'icône appropriée en fonction du type de fichier
  const getFileIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];

    if (imageExtensions.includes(extension)) {
      return <FileImage className="h-5 w-5 text-teal-600" />;
    }
    return <FileText className="h-5 w-5 text-teal-600" />;
  };

  // Formatter la taille du fichier en KB, MB, etc.
  const formatFileSize = (bytes) => {
    if (!bytes) return "Taille inconnue";

    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-6 min-w-[80vw]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-teal-900 mb-2">
          Mes documents médicaux
        </h1>
        <p className="text-teal-700">
          Gérez vos documents médicaux et téléchargez de nouveaux fichiers.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-teal-600" />
              Télécharger un nouveau document
            </CardTitle>
            <CardDescription className="text-teal-700">
              Formats acceptés: PDF, DOC, DOCX, JPG, JPEG, PNG, DICOM (max 20MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Télécharger un document
                </Button>
              </DialogTrigger>
              <DialogContent className="border-teal-200">
                <DialogHeader>
                  <DialogTitle className="text-teal-900">
                    Télécharger un document
                  </DialogTitle>
                  <DialogDescription className="text-teal-700">
                    Sélectionnez un fichier à télécharger
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-teal-700">
                        Fichier
                      </Label>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-teal-700">
                        Description (optionnel)
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="Description du document"
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-teal-700">Progression</Label>
                          <span className="text-sm text-teal-600">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-teal-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Téléchargement...
                        </>
                      ) : (
                        "Télécharger"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FilePlus2 className="h-5 w-5 text-teal-600" />
              Documents téléchargés
            </CardTitle>
            <CardDescription className="text-teal-700">
              {documents.length} document{documents.length !== 1 ? "s" : ""} au
              total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-teal-200 mx-auto mb-4" />
                  <p className="text-teal-600">Aucun document téléchargé</p>
                </div>
              ) : (
                <div className="divide-y divide-teal-100">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        {getFileIcon(doc.nom)}
                        <div className="ml-3">
                          <p className="font-medium text-teal-900">{doc.nom}</p>
                          <p className="text-xs text-teal-600">
                            {formatFileSize(doc.taille || 0)} • ID: {doc.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                          onClick={() => handleDownload(doc.nom)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Télécharger</span>
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDocumentToDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="border-teal-200">
                            <DialogHeader>
                              <DialogTitle className="text-teal-900">
                                Supprimer le document
                              </DialogTitle>
                              <DialogDescription className="text-teal-700">
                                Êtes-vous sûr de vouloir supprimer ce document?
                                Cette action est irréversible.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex space-x-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => setDocumentToDelete(null)}
                                className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                              >
                                Annuler
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  documentToDelete &&
                                  handleDelete(documentToDelete)
                                }
                              >
                                Supprimer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
