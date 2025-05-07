import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Diagnostic from "./pages/Diagnostic";




// Atome : Champ de saisie
const Input = ({ type = "text", placeholder, value, onChange, name }) => (
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
  />
);

// Atome : Select
const Select = ({ name, value, onChange, options, placeholder }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
  >
    <option value="">{placeholder}</option>
    {options.map((opt, index) => (
      <option key={index} value={opt}>{opt}</option>
    ))}
  </select>
);

// Atome : Bouton
const Button = ({ children, onClick, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-full py-2 rounded-md text-white font-semibold transition duration-200 ${className}`}
  >
    {children}
  </motion.button>
);

// Formulaire d’inscription
const AuthForm = ({ formData, setFormData, onSubmit }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-2xl"
  >
    <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">👩‍⚕️ Espace Santé</h2>
    <p className="text-sm text-gray-500 text-center mb-6">Créez votre profil santé sécurisé</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input name="prenom" placeholder="Prénom *" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} />
      <Input name="nom" placeholder="Nom *" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} />
    </div>
    <Input type="number" name="age" placeholder="Âge *" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
    <Select name="sexe" placeholder="Sexe *" value={formData.sexe} onChange={(e) => setFormData({ ...formData, sexe: e.target.value })} options={["Homme", "Femme", "Autre"]} />
    <Input name="email" type="email" placeholder="Adresse e-mail *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
    <Input type="password" name="password" placeholder="Mot de passe *" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
    <Button className="bg-blue-600 hover:bg-blue-700 mt-4" onClick={onSubmit}>S'inscrire</Button>
  </motion.div>
);

// Page d'inscription
function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    age: "",
    sexe: "",
    email: "",
    password: ""
  });

  const handleLogin = () => {
    const { prenom, nom, age, sexe, email, password } = formData;
    if (prenom && nom && age && sexe && email && password) {
      navigate("/data-entry");
    } else {
      alert("Veuillez remplir tous les champs obligatoires.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
      <AuthForm formData={formData} setFormData={setFormData} onSubmit={handleLogin} />
    </div>
  );
}

// Page de données médicales (3 étapes)
function DataEntryPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    poids: "",
    taille: "",
    frequenceCardiaque: "",
    tension: "",
    temperature: "",
    oxygene: "",
    tabac: "",
    alcool: "",
    activite: "",
    sommeil: "",
    pathologies: "",
    traitements: "",
    allergies: "",
    antecedents: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleSubmit = () => {
    console.log("📦 Données à envoyer :", formData);
    alert("Données envoyées !");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl bg-white p-10 rounded-3xl shadow-2xl w-full"
      >
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">🩺 Étape {step} sur 3</h2>
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="poids" placeholder="Poids (kg) *" value={formData.poids} onChange={handleChange} />
            <Input name="taille" placeholder="Taille (cm) *" value={formData.taille} onChange={handleChange} />
            <Input name="frequenceCardiaque" placeholder="Fréquence cardiaque (bpm)" value={formData.frequenceCardiaque} onChange={handleChange} />
            <Input name="tension" placeholder="Tension artérielle (ex : 120/80)" value={formData.tension} onChange={handleChange} />
            <Input name="temperature" placeholder="Température (°C)" value={formData.temperature} onChange={handleChange} />
            <Input name="oxygene" placeholder="Saturation O2 (%)" value={formData.oxygene} onChange={handleChange} />
          </div>
        )}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select name="tabac" placeholder="Tabac *" value={formData.tabac} onChange={handleChange} options={["Oui", "Non"]} />
            <Select name="alcool" placeholder="Alcool *" value={formData.alcool} onChange={handleChange} options={["Jamais", "Occasionnel", "Régulier"]} />
            <Select name="activite" placeholder="Activité physique *" value={formData.activite} onChange={handleChange} options={["Faible", "Modérée", "Élevée"]} />
            <Input name="sommeil" placeholder="Sommeil (heures/nuit)" value={formData.sommeil} onChange={handleChange} />
          </div>
        )}
        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="pathologies" placeholder="Pathologies connues" value={formData.pathologies} onChange={handleChange} />
            <Input name="traitements" placeholder="Traitements en cours" value={formData.traitements} onChange={handleChange} />
            <Input name="allergies" placeholder="Allergies" value={formData.allergies} onChange={handleChange} />
            <Input name="antecedents" placeholder="Antécédents familiaux" value={formData.antecedents} onChange={handleChange} />
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Analyse médicale (PDF)</label>
              <input type="file" accept="application/pdf" className="mb-4 w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        )}
        <div className="flex justify-between mt-6">
          {step > 1 && <Button className="bg-gray-400" onClick={handleBack}>Retour</Button>}
          {step < 3 ? (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleNext}>Suivant</Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Soumettre</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// App principale
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/data-entry" element={<DataEntryPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/diagnostic" element={<Diagnostic />} />


      </Routes>
    </Router>
  );
}

export default App;
