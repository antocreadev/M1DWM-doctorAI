
import React from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-blue-700 mb-6">👋 Bonjour Manal</h1>
        <p className="text-gray-600 mb-6">Voici un résumé de vos dernières données de santé :</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-700">Tension</h3>
            <p className="text-2xl font-bold text-blue-600">120 / 80</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-700">Poids</h3>
            <p className="text-2xl font-bold text-blue-600">65 kg</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-700">Fréquence cardiaque</h3>
            <p className="text-2xl font-bold text-blue-600">72 bpm</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-700">Saturation O₂</h3>
            <p className="text-2xl font-bold text-blue-600">98%</p>
          </div>
        </div>

        <div className="mt-10">
          <a
            href="/chatbot"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow"
          >
            💬 Parler au chatbot médecin
          </a>
        </div>
      </motion.div>
    </div>
  );
}
