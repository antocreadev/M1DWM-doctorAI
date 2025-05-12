"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Download, Trash2, Loader2, FilePlus2, FileImage } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Simulated documents
const initialDocuments = [
  { id: 1, name: "resultats_analyses.pdf", size: "2.4 MB", date: "12 mai 2025", type: "pdf" },
  { id: 2, name: "imagerie_thorax.jpg", size: "3.8 MB", date: "15 mai 2025", type: "image" },
  { id: 3, name: "ordonnance.pdf", size: "0.5 MB", date: "18 mai 2025", type: "pdf" },
  { id: 4, name: "irm_cerebrale.dicom", size: "12.2 MB", date: "20 mai 2025", type: "dicom" },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(initialDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null)

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)

          // Add new document
          const newDoc = {
            id: Date.now(),
            name: "nouveau_document.pdf",
            size: "1.2 MB",
            date: new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            type: "pdf",
          }

          setDocuments((prev) => [...prev, newDoc])
        }, 500)
      }
    }, 300)
  }

  const handleDelete = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    setDocumentToDelete(null)
  }

  // Function to get the appropriate icon based on file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="h-5 w-5 text-teal-600" />
      default:
        return <FileText className="h-5 w-5 text-teal-600" />
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold text-teal-900 mb-2">Mes documents médicaux</h1>
        <p className="text-teal-700">Gérez vos documents médicaux et téléchargez de nouveaux fichiers.</p>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">Télécharger un document</Button>
              </DialogTrigger>
              <DialogContent className="border-teal-200">
                <DialogHeader>
                  <DialogTitle className="text-teal-900">Télécharger un document</DialogTitle>
                  <DialogDescription className="text-teal-700">Sélectionnez un fichier à télécharger</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-teal-700">
                        Fichier
                      </Label>
                      <Input
                        id="file"
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
                        placeholder="Description du document"
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-teal-700">Progression</Label>
                          <span className="text-sm text-teal-600">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isUploading}>
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
              {documents.length} document{documents.length !== 1 ? "s" : ""} au total
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
                    <div key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        {getFileIcon(doc.type)}
                        <div className="ml-3">
                          <p className="font-medium text-teal-900">{doc.name}</p>
                          <p className="text-xs text-teal-600">
                            {doc.size} • Ajouté le {doc.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
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
                              <DialogTitle className="text-teal-900">Supprimer le document</DialogTitle>
                              <DialogDescription className="text-teal-700">
                                Êtes-vous sûr de vouloir supprimer ce document? Cette action est irréversible.
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
                                onClick={() => documentToDelete && handleDelete(documentToDelete)}
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
  )
}
