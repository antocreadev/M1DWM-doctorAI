"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Récupérer les fichiers de l'utilisateur au chargement du composant
  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const response = await fetch(
          "https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/fichiers",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserFiles(data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des fichiers:", err);
      }
    };

    fetchUserFiles();
  }, []);

  // Fonction pour faire défiler vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Ajouter le message de l'utilisateur localement pour affichage immédiat
    const userMessage = { role: "user", contenu: message };
    setMessages((prev) => [...prev, userMessage]);

    // Réinitialiser le champ de saisie
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      if (!conversationId) {
        // Créer une nouvelle conversation
        const convResponse = await fetch(
          "https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/conversations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              titre:
                message.substring(0, 30) + (message.length > 30 ? "..." : ""),
            }),
          }
        );

        if (!convResponse.ok) {
          throw new Error("Erreur lors de la création de la conversation");
        }

        const convData = await convResponse.json();
        setConversationId(convData.id);

        // Envoyer le message à la nouvelle conversation avec les IDs des fichiers
        const msgResponse = await fetch(
          `https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/conversations/${convData.id}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              contenu: message,
              include_files: true, // Nouvelle option pour indiquer d'inclure les fichiers
              file_ids: userFiles.map((file) => file.id), // Envoyer les IDs des fichiers
            }),
          }
        );

        if (!msgResponse.ok) {
          throw new Error("Erreur lors de l'envoi du message");
        }

        const msgData = await msgResponse.json();

        // Ajouter la réponse de l'IA aux messages
        setMessages((prev) => [
          ...prev,
          { role: "ai", contenu: msgData.ai_response },
        ]);

        // Rediriger vers la page de conversation en gardant l'historique
        router.replace(`/dashboard/chat/${convData.id}`);
      } else {
        // Ajouter un message à une conversation existante
        const msgResponse = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ contenu: message }),
          }
        );

        if (!msgResponse.ok) {
          throw new Error("Erreur lors de l'envoi du message");
        }

        const msgData = await msgResponse.json();

        // Ajouter la réponse de l'IA aux messages
        setMessages((prev) => [
          ...prev,
          { role: "ai", contenu: msgData.ai_response },
        ]);
      }
    } catch (err: any) {
      setError(err.message);
      // Afficher le message d'erreur dans les messages
      setMessages((prev) => [
        ...prev,
        { role: "system", contenu: `Erreur: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-w-[80vw]">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="mr-2 text-teal-700 hover:text-teal-900 hover:bg-teal-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-teal-900">
          Nouvelle analyse
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded-lg border border-teal-100">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="mb-2">
              Bienvenue dans votre nouvelle analyse médicale
            </p>
            <p>
              Posez votre question pour commencer la conversation avec
              l'assistant médical
            </p>
            {userFiles.length > 0 && (
              <p className="mt-4 text-teal-600">
                {userFiles.length} document(s) disponible(s) pour l'analyse
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "ml-auto bg-teal-100 text-teal-900"
                    : msg.role === "system"
                    ? "mx-auto bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.contenu}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Posez votre question médicale..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border-teal-200 focus-visible:ring-teal-500"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
