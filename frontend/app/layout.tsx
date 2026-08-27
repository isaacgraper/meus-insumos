import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGI",
  description: "Sistema Integrado de Governança de Insumos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
