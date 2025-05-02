import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/providers/Privy'

export const metadata: Metadata = {
  title: 'Coinaroid',
  description: 'Coinaroid',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-[#F1EDDA]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
