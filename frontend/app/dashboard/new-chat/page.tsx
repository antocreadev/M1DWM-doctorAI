"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, User, HeartPulse, FileText, Paperclip, X, Stethoscope } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewChat() {
  const [messages, setMessages] = useState<
    Array<{
      id: number
      content: string
      sender: "user" | "bot"
      timestamp: Date
    }>
  >([])

  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim() === "" && attachedFiles.length === 0) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: input,
      sender: "user" as const,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachedFiles([])

    // Simulate bot typing
    setIsTyping(true)

    // Simulate bot response after delay
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        content:
          "Après analyse de vos documents et de vos informations médicales, je constate que vos taux de ferritine sont légèrement bas (15 µg/L), ce qui pourrait indiquer une carence en fer. Vos autres paramètres sanguins sont dans les normes. Souhaitez-vous des recommandations nutritionnelles pour augmenter votre taux de fer?",
        sender: "bot" as const,
        timestamp: new Date(),
      }

      setMessages((prevMessages) => [...prevMessages, botMessage])
      setIsTyping(false)

      // Redirect to the chat page after the first message exchange
      setMessages((prevMessages) => {
        if (prevMessages.length === 1) {
          setTimeout(() => {
            router.push("/dashboard/chat/1")
          }, 2000)
        }
        return prevMessages
      })
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Suggested questions for the empty state
  const suggestedQuestions = [
    "Pouvez-vous analyser mes résultats d'analyses sanguines?",
    "Que signifie mon taux de cholestérol à 5.2 mmol/L?",
    "Quelles sont les causes possibles de mes maux de tête fréquents?",
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Stethoscope className="h-16 w-16 text-teal-200 mb-6" />
            <h2 className="text-xl font-bold text-teal-900 mb-4">Nouvelle analyse médicale</h2>
            <p className="text-teal-700 max-w-md mb-8">
              Posez vos questions médicales ou partagez vos symptômes. Notre assistant est là pour vous aider à
              comprendre vos données médicales.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                  onClick={() => {
                    setInput(question)
                    setTimeout(() => handleSend(), 100)
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start gap-3 max-w-[80%]">
                  {message.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      <HeartPulse className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <Card
                    className={`p-3 border-teal-200 ${message.sender === "user" ? "bg-teal-100 text-teal-900" : "bg-white"}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs text-teal-500 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </Card>

                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-teal-600" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
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
              <div key={index} className="flex items-center bg-white rounded-md border border-teal-200 px-3 py-1">
                <FileText className="h-4 w-4 text-teal-600 mr-2" />
                <span className="text-sm text-teal-700 truncate max-w-[150px]">{file.name}</span>
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
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Joindre un fichier</span>
          </Button>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez vos symptômes ou posez une question médicale..."
            className="flex-1 min-h-[80px] resize-none border-teal-200 focus:border-teal-500 focus:ring-teal-500"
          />

          <Button
            className="h-10 w-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleSend}
            disabled={input.trim() === "" && attachedFiles.length === 0}
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
