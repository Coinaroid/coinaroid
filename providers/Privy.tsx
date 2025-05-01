'use client'

import { PrivyProvider } from '@privy-io/react-auth'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cma5nw0pg0010l10mvzmotmt2"
      clientId="client-WY6L6yVLiwNS5NSCkDdirBzWv1Bi7Htd3DzZ8uqYp9i5e"
      config={{
        loginMethods: ['farcaster'],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
