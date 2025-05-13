"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, FileText, User, HeartPulse, Loader2 } from "lucide-react";

export default function ChatBot() {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: inputMessage }]);
    setInputMessage("");
    setLoading(true);

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      body: JSON.stringify({ text: inputMessage }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    const botResponse = data.summary || "Erreur ou réponse vide de l'IA.";
    setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    setLoading(false);
  };

  const handleUploadPDF = async () => {
    if (!file) return alert("Veuillez choisir un fichier PDF.");

    setMessages((prev) => [...prev, { sender: "user", text: `Fichier envoyé : ${file.name}` }]);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/uploadpdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const botResponse = data.summary || "Erreur pendant l'analyse du fichier.";
    setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    setLoading(false);
    setFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 bg-white rounded-lg shadow-md border border-teal-100">
      <h1 className="text-2xl font-semibold text-teal-700 text-center">Assistant médical IA</h1>

      {/* Messages */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start gap-2 max-w-[80%]">
                {msg.sender === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
                    <HeartPulse className="h-4 w-4 text-white" />
                  </div>
                )}
                <Card
                  className={`p-3 border-teal-200 ${
                    msg.sender === "user" ? "bg-teal-100 text-teal-900" : "bg-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </Card>
                {msg.sender === "user" && (
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-teal-600" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start items-center gap-2 text-teal-600 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyse en cours...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input message */}
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Posez une question"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 min-h-[80px] resize-none border-teal-200 focus:border-teal-500 focus:ring-teal-500"
        />
        <Button
          className="h-10 w-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white"
          onClick={handleSendMessage}
          disabled={inputMessage.trim() === ""}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* PDF Upload */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="flex-1 border border-teal-200 rounded px-3 py-2 text-sm text-teal-800 bg-teal-50"
        />
        <Button
          onClick={handleUploadPDF}
          className="bg-teal-500 hover:bg-teal-600 text-white"
          disabled={!file}
        >
          <FileText className="h-4 w-4 mr-2" />
          Envoyer le PDF
        </Button>
      </div>
    </div>
  );
}
