import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/providers/Privy'

const appUrl = 'https://coinaroid.xyz'

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/images/erica_coinaroid_iconURL_1024.png`,
  button: {
    title: 'Join Coinaroid',
    action: {
      type: 'launch_frame',
      name: 'Coinaroid',
      url: appUrl,
      splashImageUrl: `${appUrl}/images/erica_splashImageUrl_200.png`,
      splashBackgroundColor: '#F1EDDA',
    },
  },
}

export const metadata: Metadata = {
  title: 'Coinaroid',
  description: 'Cast your coins',
  openGraph: {
    title: 'Coinaroid',
    description: 'Cast your coins',
  },
  other: {
    'fc:frame': JSON.stringify(frame),
  },
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
