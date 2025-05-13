import ChatBot from "../../../components/ui/PdfChatbot"; 

export default function HomePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenue sur l'application médicale</h1>
      <ChatBot />
    </div>
  );
}
