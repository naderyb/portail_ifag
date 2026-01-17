import "./globals.css";
import type { ReactNode } from "react";
import ChatbotWidget from "@/components/ui/ChatbotWidget";

export const metadata = {
  title: "Portail IFAG",
  description: "Portail universitaire privé IFAG",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
