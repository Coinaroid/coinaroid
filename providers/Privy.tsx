'use client'

import { PrivyProvider } from '@privy-io/react-auth'

import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [miniAppConnector()],
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId="cma5nw0pg0010l10mvzmotmt2"
          clientId="client-WY6L6yVLiwNS5NSCkDdirBzWv1Bi7Htd3DzZ8uqYp9i5e"
          config={{
            loginMethods: ['farcaster'],
          }}
        >
          {children}
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
