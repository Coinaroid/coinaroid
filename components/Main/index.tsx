'use client'

import frameSdk from '@farcaster/frame-sdk'
import { usePrivy } from '@privy-io/react-auth'
import { useLoginToFrame } from '@privy-io/react-auth/farcaster'
import { useEffect } from 'react'

export default function Main() {
  const { ready, authenticated, user } = usePrivy()
  const { initLoginToFrame, loginToFrame } = useLoginToFrame()

  // Login to Mini App with Privy automatically
  useEffect(() => {
    if (!authenticated) {
      console.log('Authenticating')
      const login = async () => {
        // Initialize a new login attempt to get a nonce for the Farcaster wallet to sign
        const { nonce } = await initLoginToFrame()
        // Request a signature from Warpcast
        const result = await frameSdk.actions.signIn({ nonce: nonce })
        // Send the received signature from Warpcast to Privy for authentication
        const user = await loginToFrame({
          message: result.message,
          signature: result.signature,
        })
        console.log('Authenticated', user)
      }
      login()
    }
  }, [ready, authenticated])

  return (
    <div className="text-3xl text-black w-full h-full bg-amber-400">
      Coinaroid {user?.farcaster?.displayName}
    </div>
  )
}
