'use client'

import frameSdk from '@farcaster/frame-sdk'
import { usePrivy } from '@privy-io/react-auth'
import { useLoginToFrame } from '@privy-io/react-auth/farcaster'
import { useEffect } from 'react'
import PhotoUploadForm from '../PhotoUploadForm'
import { useAccount } from 'wagmi'
import { usePublicClient } from 'wagmi'
import { withdrawRewards } from '@zoralabs/protocol-sdk'
import { Loader } from 'lucide-react'

import { Address } from 'viem'
import { useWriteContract } from 'wagmi'

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
  const publicClient = usePublicClient()!

  const {
    writeContract: withdrawRewardsWriteContract,
    status: withdrawRewardsStatus,
  } = useWriteContract()

  if (!authenticated) {
    return (
      <div className="text-center my-4">
        <Loader className="animate-spin m-4 mx-auto" />
      </div>
    )
  }

  return (
    <>
      <div className="my-4">
        <div className="flex flex-col gap-2 items-center justify-center">
          <img
            src="http://coinaroid.xyz/images/coinaroid-logo.png"
            alt=""
            className="w-24 h-24"
          />
          <h1>Welcome to Coinaroid, {user?.farcaster?.displayName}!</h1>

          {address && (
            <div>
              <div className="flex gap-2">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={async () => {
                    const { parameters } = await withdrawRewards({
                      withdrawFor: address as Address,
                      claimSecondaryRoyalties: false,
                      account: address as Address,
                      publicClient,
                    })

                    // simulate the transaction
                    const hash = withdrawRewardsWriteContract?.(parameters)

                    // execute the transaction
                    const receipt =
                      await publicClient.waitForTransactionReceipt({
                        hash: hash!,
                      })

                    if (receipt.status !== 'success') {
                      throw new Error('transaction failed')
                    }
                  }}
                >
                  {withdrawRewardsStatus === 'pending'
                    ? 'Claiming...'
                    : 'Claim'}
                </button>
              </div>
            </div>
          )}
        </div>
        <PhotoUploadForm />
      </div>
    </>
  )
}
