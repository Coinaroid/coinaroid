'use client'

import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { useEffect } from 'react'

export default function FrameReady() {
  const { setFrameReady, isFrameReady } = useMiniKit()
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])

  return <></>
}
