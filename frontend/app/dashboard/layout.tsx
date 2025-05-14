"use client";

import type React from "react";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = useState([
    { id: 1, title: "Analyse sanguine", date: "12 mai 2025" },
    { id: 2, title: "Suivi cardiaque", date: "15 mai 2025" },
    { id: 3, title: "Consultation neurologie", date: "18 mai 2025" },
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar>
          <SidebarHeader className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-3">
              <Stethoscope className="h-6 w-6 text-teal-600" />
              <h1
                className="text-xl font-bold text-teal-900"
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

                  {conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          pathname === `/dashboard/chat/${conversation.id}`
                        }
                        className={
                          pathname === `/dashboard/chat/${conversation.id}`
                            ? "bg-teal-100 text-teal-900"
                            : "text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                        }
                      >
                        <Link href={`/dashboard/chat/${conversation.id}`}>
                          <HeartPulse className="h-4 w-4" />
                          <span>{conversation.title}</span>
                        </Link>
                      </SidebarMenuButton>
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
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full justify-start border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                asChild
              >
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
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
