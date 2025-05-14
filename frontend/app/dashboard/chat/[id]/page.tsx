"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Send,
  User,
  HeartPulse,
  FileText,
  Paperclip,
  X,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Correct props type definition for Next.js App Router
type ChatPageProps = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ChatPage({ params, searchParams }: ChatPageProps) {
  const conversationId = params.id;
  const [messages, setMessages] = useState<
    Array<{ role: string; contenu: string; timestamp?: Date }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Conversation");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Récupérer les messages au chargement
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des messages");
        }

        const messagesData = await response.json();

        // Transformer les données pour ajouter des timestamps fictifs pour l'affichage
        const messagesWithTimestamps = messagesData.map(
          (msg: any, index: number) => ({
            ...msg,
            timestamp: new Date(
              Date.now() - (messagesData.length - index) * 60000
            ),
          })
        );

        setMessages(messagesWithTimestamps);

        // Récupérer aussi les informations de la conversation pour le titre
        const convResponse = await fetch(
          `https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (convResponse.ok) {
          const convData = await convResponse.json();
          setTitle(convData.titre);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "" && attachedFiles.length === 0) return;

    // Ajouter temporairement le message utilisateur pour l'affichage immédiat
    const userMessage = {
      role: "user",
      contenu: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ contenu: input }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const data = await response.json();

      // Ajouter la réponse de l'IA
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          contenu: data.ai_response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      // Afficher l'erreur dans les messages
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          contenu: `Erreur: ${
            err instanceof Error ? err.message : "Erreur inconnue"
          }`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-teal-700 hover:text-teal-900 hover:bg-teal-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-teal-900">{title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2">
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <p className="text-teal-600 mt-2">Chargement des messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">
              Aucun message dans cette conversation
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-start gap-3 max-w-[80%]">
                  {message.role === "ai" && (
                    <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      <HeartPulse className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <Card
                    className={`p-3 border-teal-200 ${
                      message.role === "user"
                        ? "bg-teal-100 text-teal-900"
                        : message.role === "system"
                        ? "bg-red-100 text-red-900"
                        : "bg-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.contenu}
                    </p>
                    {message.timestamp && (
                      <div className="text-xs text-teal-500 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </Card>

                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-teal-600" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
                    <HeartPulse className="h-4 w-4 text-white" />
                  </div>
                  <Card className="p-3 border-teal-200">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {attachedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-teal-100 bg-teal-50">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-white rounded-md border border-teal-200 px-3 py-1"
              >
                <FileText className="h-4 w-4 text-teal-600 mr-2" />
                <span className="text-sm text-teal-700 truncate max-w-[150px]">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 ml-1 text-teal-500 hover:text-teal-700 hover:bg-teal-50"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-teal-100 bg-white">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Joindre un fichier</span>
          </Button>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="flex-1 min-h-[80px] resize-none border-teal-200 focus:border-teal-500 focus:ring-teal-500"
            disabled={isLoading}
          />

          <Button
            className="h-10 w-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleSend}
            disabled={
              isLoading || (input.trim() === "" && attachedFiles.length === 0)
            }
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
