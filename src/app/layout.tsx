import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atlas de Riesgo para Mujeres Buscadoras - Guanajuato",
  description: "Mapa interactivo de factores de riesgo por municipio en Guanajuato para el trabajo de mujeres buscadoras",
  keywords: "guanajuato, mujeres buscadoras, atlas de riesgo, municipios, seguridad",
  authors: [{ name: "Gobierno del Estado de Guanajuato" }],
  openGraph: {
    title: "Atlas de Riesgo - Guanajuato",
    description: "Mapa interactivo de factores de riesgo municipales",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
