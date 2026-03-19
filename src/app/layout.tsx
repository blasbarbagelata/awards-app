import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Los Premios | Gala de Amigos',
  description:
    'La ceremonia de premiación más esperada del año. Vota por tus amigos en las categorías más divertidas de la gala.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-dark text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
