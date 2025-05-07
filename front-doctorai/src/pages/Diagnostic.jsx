
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Diagnostic() {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState(null);

  const fakeData = {
    poids: 65,
    taille: 165,
    tension: "120/80",
    frequenceCardiaque: 72,
    temperature: 36.8,
    tabac: "Non",
    alcool: "Occasionnel",
    pathologies: "Asthme chronique"
  };

  const handleAnalyze = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setDiagnostic("Selon vos données, aucun risque aigu détecté. Suivi régulier conseillé pour l'asthme.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-xl"
      >
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">🧠 Diagnostic IA</h1>
        <p className="mb-6 text-gray-600">Analyse intelligente à partir de vos dernières données :</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(fakeData).map(([key, value], i) => (
            <div key={i} className="p-3 bg-indigo-100 rounded-md text-gray-800">
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            🔍 Lancer le diagnostic
          </button>
        </div>

        {isLoading && <p className="mt-4 text-sm text-gray-500">Analyse en cours...</p>}

        {diagnostic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg"
          >
            ✅ {diagnostic}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
