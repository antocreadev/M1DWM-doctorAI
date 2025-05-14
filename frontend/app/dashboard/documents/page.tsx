"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
  Eye,
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
import { useRouter } from "next/navigation";

// URL de base de l'API
const API_URL = "https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewBlobs, setPreviewBlobs] = useState({});

  // Référence pour le téléchargement
  const downloadLinkRef = useRef(null);

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token non trouvé dans le localStorage");
      router.push("/auth/login");
      return null;
    }
    return localStorage.getItem("token");
  };

  useEffect(() => {
    if (!getAuthToken()) {
      toast.error("Veuillez vous connecter pour accéder à cette page.");
      return;
    }
    fetchDocuments();
  }, []);

  // Nettoyer les URLs d'objets blob lors du démontage du composant
  useEffect(() => {
    return () => {
      Object.values(previewBlobs).forEach((url) => {
        if (url) window.URL.revokeObjectURL(url);
      });
    };
  }, [previewBlobs]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}fichiers`, {
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
      toast.error("Impossible de récupérer les documents");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    const fileInput = e.target.elements.file;
    if (!fileInput.files || fileInput.files.length === 0) {
      setIsUploading(false);
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
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

      const response = await fetch(`${API_URL}upload`, {
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
      toast.success("Document téléchargé avec succès");

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setIsDialogOpen(false);
        fetchDocuments();
      }, 500);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Échec du téléchargement: " + error.message);
      setIsUploading(false);
    }
  };

  const handleDownload = async (filename) => {
    const token = getAuthToken();
    console.log("Token:", token); // Vérifiez que le token est bien récupéré
    if (!token) {
      toast.error("Token non trouvé");
      return;
    }

    try {
      toast.info("Préparation du téléchargement...");
      console.log("telechargement du fichier ///// token", token);
      const response = await fetch(`${API_URL}fichiers/${filename}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      // Convertir la réponse en blob
      const blob = await response.blob();

      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);

      // Utiliser la référence pour le téléchargement
      if (!downloadLinkRef.current) {
        downloadLinkRef.current = document.createElement("a");
        document.body.appendChild(downloadLinkRef.current);
      }

      downloadLinkRef.current.href = url;
      downloadLinkRef.current.download = filename;
      downloadLinkRef.current.click();

      // Nettoyer l'URL mais garder l'élément pour les téléchargements futurs
      window.URL.revokeObjectURL(url);

      toast.success("Téléchargement démarré");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Impossible de télécharger le fichier");
    }
  };

  const fetchFilePreview = async (filename) => {
    // Si nous avons déjà un blob pour ce fichier, ne pas le récupérer à nouveau
    if (previewBlobs[filename]) {
      return previewBlobs[filename];
    }

    try {
      console.log("voir du fichier ///// token", getAuthToken());
      const response = await fetch(`${API_URL}fichiers/${filename}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      // Convertir la réponse en blob
      const blob = await response.blob();

      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);

      // Stocker l'URL du blob pour éviter de le récupérer à nouveau
      setPreviewBlobs((prev) => ({
        ...prev,
        [filename]: url,
      }));

      return url;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'aperçu:", error);
      toast.error("Impossible de charger l'aperçu");
      return null;
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}fichiers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      // Trouver le document supprimé et nettoyer son blob s'il existe
      const docToDelete = documents.find((doc) => doc.id === id);
      if (docToDelete && previewBlobs[docToDelete.nom]) {
        window.URL.revokeObjectURL(previewBlobs[docToDelete.nom]);
        setPreviewBlobs((prev) => {
          const newBlobs = { ...prev };
          delete newBlobs[docToDelete.nom];
          return newBlobs;
        });
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setDocumentToDelete(null);
      toast.success("Document supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer le document");
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    if (imageExtensions.includes(extension)) {
      return <FileImage className="h-5 w-5 text-teal-600" />;
    }
    return <FileText className="h-5 w-5 text-teal-600" />;
  };

  const isImage = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp"].includes(extension);
  };

  const isPDF = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    return extension === "pdf";
  };

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
      <h1 className="text-2xl font-bold text-teal-900 mb-2">
        Mes documents médicaux
      </h1>
      <p className="text-teal-700">
        Gérez vos documents médicaux et téléchargez de nouveaux fichiers.
      </p>

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
                      className="border-teal-200"
                    />
                  </div>
                  {isUploading && (
                    <div className="space-y-2">
                      <Label className="text-teal-700">Progression</Label>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-teal-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-right text-sm text-teal-600">
                        {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-teal-600 text-white"
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

      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FilePlus2 className="h-5 w-5 text-teal-600" />
            Documents téléchargés
          </CardTitle>
          <CardDescription className="text-teal-700">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={async () => {
                              setSelectedDoc(doc);
                              // Précharger l'aperçu au clic pour éviter l'attente lors de l'ouverture de la boîte de dialogue
                              if (isImage(doc.nom) || isPDF(doc.nom)) {
                                await fetchFilePreview(doc.nom);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl border-teal-200">
                          <DialogHeader>
                            <DialogTitle className="text-teal-900">
                              Aperçu du document
                            </DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[70vh] overflow-auto">
                            {isImage(doc.nom) ? (
                              previewBlobs[doc.nom] ? (
                                <img
                                  src={previewBlobs[doc.nom]}
                                  alt={doc.nom}
                                  className="rounded shadow max-w-full h-auto mx-auto"
                                />
                              ) : (
                                <div className="flex items-center justify-center p-8">
                                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                                  <p className="ml-2 text-teal-600">
                                    Chargement de l'aperçu...
                                  </p>
                                </div>
                              )
                            ) : isPDF(doc.nom) ? (
                              previewBlobs[doc.nom] ? (
                                <iframe
                                  src={previewBlobs[doc.nom]}
                                  className="w-full h-[70vh]"
                                  title="aperçu fichier"
                                />
                              ) : (
                                <div className="flex items-center justify-center p-8">
                                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                                  <p className="ml-2 text-teal-600">
                                    Chargement du PDF...
                                  </p>
                                </div>
                              )
                            ) : (
                              <p className="text-sm text-gray-600 text-center">
                                Aperçu non disponible pour ce type de fichier
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                        onClick={() => handleDownload(doc.nom)}
                      >
                        <Download className="h-4 w-4" />
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
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-teal-200">
                          <DialogHeader>
                            <DialogTitle>Supprimer le document</DialogTitle>
                            <DialogDescription>
                              Êtes-vous sûr de vouloir supprimer ce document ?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDocumentToDelete(null)}
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
    </div>
  );
}
