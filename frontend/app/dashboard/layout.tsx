"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  User,
  FileText,
  Settings,
  LogOut,
  Plus,
  Stethoscope,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: number;
  titre: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Échec de la récupération des données");
      }

      const userData = await response.json();
      setConversations(userData.conversations || []);
      setLoading(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
    }
  };

  const supprimerConversation = async (id: number) => {
    try {
      const response = await fetch(
        `https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/conversations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Échec de la suppression de la conversation");
      }

      // Mettre à jour la liste des conversations après la suppression
      fetchConversations();

      // Si on est sur la page de la conversation supprimée, rediriger vers le dashboard
      if (pathname === `/dashboard/chat/${id}`) {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Erreur lors de la suppression:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 cursor-pointer">
        <Sidebar>
          <SidebarHeader className="cursor-pointer ">
            <div className="flex items-center gap-2 px-4 py-3 hover:bg-teal-100 rounded-xl transition cursor-pointer">
              <Stethoscope className="h-6 w-6 text-teal-600" />
              <h1
                className="text-xl font-bold text-teal-900 cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                MediAssist
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-teal-700">
                Analyses
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/dashboard/new-chat"
                        className="text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nouvelle analyse</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {conversations.map((conversation: Conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <div className="flex items-center w-full">
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname === `/dashboard/chat/${conversation.id}`
                          }
                          className={`flex-grow ${
                            pathname === `/dashboard/chat/${conversation.id}`
                              ? "bg-teal-100 text-teal-900"
                              : "text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                          }`}
                        >
                          <Link href={`/dashboard/chat/${conversation.id}`}>
                            <HeartPulse className="h-4 w-4" />
                            <span>{conversation.titre}</span>
                          </Link>
                        </SidebarMenuButton>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Supprimer cette analyse ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Voulez-vous vraiment supprimer l'analyse "
                                {conversation.titre}" ? Cette action est
                                irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  supprimerConversation(conversation.id)
                                }
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-teal-700">
                Mon dossier
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/profile"}
                      className={
                        pathname === "/dashboard/profile"
                          ? "bg-teal-100 text-teal-900"
                          : "text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                      }
                    >
                      <Link href="/dashboard/profile">
                        <User className="h-4 w-4" />
                        <span>Profil médical</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/documents"}
                      className={
                        pathname === "/dashboard/documents"
                          ? "bg-teal-100 text-teal-900"
                          : "text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                      }
                    >
                      <Link href="/dashboard/documents">
                        <FileText className="h-4 w-4" />
                        <span>Documents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/settings"}
                      className={
                        pathname === "/dashboard/settings"
                          ? "bg-teal-100 text-teal-900"
                          : "text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                      }
                    >
                      <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4 cursor-pointer">
              <Button
                variant="outline"
                className="w-full justify-start border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 cursor-pointer"
                asChild
              >
                <Link
                  className="cursor-pointer"
                  href="/"
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/auth/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4 cursor-pointer" />
                  Déconnexion
                </Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-teal-100 h-14 flex items-center px-4">
            <SidebarTrigger className="mr-4 text-teal-700 hover:text-teal-900 hover:bg-teal-50" />
            <h2 className="text-lg font-medium text-teal-900">MediAssist</h2>
          </header>

          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
