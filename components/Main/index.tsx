'use client'

import frameSdk from '@farcaster/frame-sdk'
import { usePrivy } from '@privy-io/react-auth'
import { useLoginToFrame } from '@privy-io/react-auth/farcaster'
import { useEffect } from 'react'
import PhotoUploadForm from '../PhotoUploadForm'
import { useAccount } from 'wagmi'

import { Address } from 'viem'
import { useWriteContract } from 'wagmi'
import { createCoin } from '@/lib/createCoin'

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

  const { isConnected, address } = useAccount()

  useEffect(() => {
    if (isConnected) {
      console.log('Connected', address)
    }
  }, [isConnected, address])

  const { writeContract, status } = useWriteContract()

  if (!authenticated) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div>
        <h1>Welcome to Coinaroid, {user?.farcaster?.displayName}!</h1>
        <div>
          <div>You&apos;re connected!</div>
          <div>Address: {address}</div>

          <button
            onClick={async () => {
              createCoin({
                address: address as Address,
                name: 'My Awesome Coin',
                symbol: 'MAC',
                uri: 'ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy',
                writeContract,
              })
            }}
          >
            {status === 'pending' ? 'Creating...' : 'Create Coin'}
          </button>
        </div>
        <PhotoUploadForm />
      </div>
    </>
  )
}
