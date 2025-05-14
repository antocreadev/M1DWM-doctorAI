// Supprimer la directive "use client" pour en faire un composant serveur
import { use } from "react";
import ClientChat from "@/components/chat/ClientChat"; // Nous allons créer ce composant

// Correct props type definition for Next.js App Router
type ChatPageProps = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ChatPage({ params, searchParams }: ChatPageProps) {
  // Utiliser React.use() dans un composant serveur
  const resolvedParams = use(Promise.resolve(params));
  const conversationId = resolvedParams.id;

  // Passer l'ID résolu au composant client
  return <ClientChat conversationId={conversationId} />;
}
