import type { Metadata } from "next";
import { Observability } from "@/components/observability";
import "./globals.css";

export const metadata: Metadata = {
  title: "LBM App Starter",
  description: "Base automatizada para crear y validar productos digitales.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Observability />
      </body>
    </html>
  );
}
