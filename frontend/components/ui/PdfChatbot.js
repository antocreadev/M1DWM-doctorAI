"use client";
import { useState } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div style={styles.chatContainer}>
      <h1>Chat IA - Santé</h1>
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              backgroundColor: msg.sender === "user" ? "#f1f1f1" : "#4CAF50",
              color: msg.sender === "user" ? "#000" : "#fff",
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div style={styles.loading}>Analyse en cours...</div>}
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Posez une question"
          style={styles.input}
        />
        <button onClick={handleSendMessage} style={styles.sendButton}>
          Envoyer
        </button>
      </div>

      <div style={{ marginTop: "15px", ...styles.inputContainer }}>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUploadPDF} style={styles.sendButton}>
          Envoyer le PDF
        </button>
      </div>
    </div>
  );
}

const styles = {
  chatContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  messagesContainer: {
    maxHeight: "400px",
    overflowY: "auto",
    marginBottom: "10px",
  },
  message: {
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    fontSize: "16px",
  },
  loading: {
    textAlign: "center",
    color: "#888",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  sendButton: {
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
