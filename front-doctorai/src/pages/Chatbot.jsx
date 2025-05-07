import React, { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour, je suis votre assistant santé. Que puis-je faire pour vous ?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: "Merci pour votre message. Je vais analyser cela." }]);
    }, 1000);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-xl p-4 h-[80vh] flex flex-col">
        <h2 className="text-2xl font-bold text-green-700 mb-4">💬 Chatbot Médecin</h2>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg w-fit max-w-[75%] ${
                msg.from === "bot"
                  ? "bg-green-100 text-green-900 self-start"
                  : "bg-blue-100 text-blue-900 self-end"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
          <button onClick={sendMessage} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
