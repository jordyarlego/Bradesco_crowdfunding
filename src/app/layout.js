// src/app/layout.js

import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Crowdfunding Acadêmico',
  description: 'Invista em pessoas, receba com segurança.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} bg-hero-gradient text-white`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  )
}