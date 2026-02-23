import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'OdinBOT - Painel de Controle',
  description: 'Painel de gerenciamento do OdinBOT para WhatsApp. Gerencie grupos, alugueis, advertencias e muito mais.',
}

export const viewport: Viewport = {
  themeColor: '#06b6d4',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
