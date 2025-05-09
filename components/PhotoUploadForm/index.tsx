'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadToPinata } from '@/utils/pinata'
import { uploadToCloudinary } from '@/utils/cloudinary'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { createCoin } from '@/lib/createCoin'
import { saveCoinToSupabase } from '@/lib/saveCoin'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import sdk from '@farcaster/frame-sdk'
import { getCoinCreateFromLogs } from '@zoralabs/coins-sdk'
import { usePrivy } from '@privy-io/react-auth'

// Define the type for our metadata
type MintConfig = {
  name: string;
  description: string;
  symbol: string;
  image: string;
  properties: {
    category: string;
  };
}



export default function PhotoUploadForm() {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fid, setFid] = useState<number>(0)
  const [mintConfig, setMintConfig] = useState<MintConfig>({
    name: '',
    description: '',
    symbol: '',
    image: '',
    properties: {
      category: 'social'
    }
  })
  const [imageUrl, setImageUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { writeContract, data: hash } = useWriteContract()
  const {
    isLoading,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  })
  const { address } = useAccount()
  const { user } = usePrivy()

  useEffect(() => {
    if (user?.farcaster?.fid) {
      setFid(user.farcaster.fid)
    }
  }, [user])

  useEffect(() => {
    const cast = async () => {
      const coinDeployment = getCoinCreateFromLogs(receipt!)
      
      if (!coinDeployment) {
        console.error('No coin deployment data found')
        setIsUploading(false)
        return
      }
      
      try {
        await saveCoinToSupabase({
          fid: fid,
          wallet_address: address!,
          zora_mint_url: `https://zora.co/coin/base:${coinDeployment.coin.toLowerCase()}`,
          zora_token_id: coinDeployment.coin.toLowerCase(),
          zora_contract_address: coinDeployment.coin.toLowerCase(),
          name: title,
          description: caption,
          image_url: imageUrl,
          transaction_hash: hash!,
          mint_config: mintConfig,
          raw_zora_response: coinDeployment
        })
      } catch (error) {
        // Error occurred while saving to Supabase, log and continue
        console.error('Error saving to Supabase:', error instanceof Error ? error.message : 'Unknown error occurred')
      }

      setTimeout(() => {
        sdk.actions.composeCast({
          text: `${title}\n${caption}\n\nposted by @coinaroid\n\nhttps://zora.co/coin/base:${coinDeployment.coin.toLowerCase()}`,
          embeds: [
            `https://zora.co/coin/base:${coinDeployment.coin.toLowerCase()}`,
          ],
        })
        setIsUploading(false)
      }, 3000)
    }
    if (isConfirmed) {
      cast()
    }
  }, [isConfirmed, fid, mintConfig, imageUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photo) {
      alert('Please select a photo')
      return
    }

    if (!address) {
      alert('Please connect your wallet')
      return
    }

    try {
      setIsUploading(true)

      // Upload the image to Cloudinary b/c Zora requires a hosted image and didnt support Pinata/IPFS
      // alert('Starting image upload to Cloudinary...')
      const imageResult = await uploadToCloudinary(photo)
      setImageUrl(imageResult.url)
      console.log('Uploaded to Cloudinary:', { ...imageResult, title, caption })

      // Create metadata JSON for the coin to be hosted on Pinata/IPFS
      const metadata = {
        name: title || 'Untitled Coin',
        description: caption || 'A coin created from an image',
        symbol: `Coinaroid_${imageResult.publicId.substring(0, 4)}`,
        image: imageResult.url,
        properties: {
          category: 'social',
        },
      }

      // Convert metadata to File
      const metadataFile = new File(
        [JSON.stringify(metadata)],
        'metadata.json',
        { type: 'application/json' },
      )

      // Upload metadata to IPFS
      // alert('Starting metadata upload to IPFS...')
      const metadataResult = await uploadToPinata(metadataFile)
      setMintConfig(metadata)
      console.log('Uploaded metadata to IPFS:', metadataResult)

      // Create the coin with the metadata IPFS hash
      // alert('Starting coin creation...')
      await createCoin({
        address: address as Address,
        name: title || 'Untitled Coin',
        symbol: `Coinaroid_${imageResult.publicId.substring(0, 4)}`,
        uri: `https://teal-uptight-sloth-224.mypinata.cloud/ipfs/${metadataResult.ipfsHash}`,
        writeContract,
      })
      // alert('Coin creation transaction sent!')

      console.log('Created coin with metadata:', {
        ...metadataResult,
        title,
        caption,
      })
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while creating your coin. Transaction reverted.Please try again.')
      setIsUploading(false)
    } finally {
      // Commening out to prevent the button from getting renabled for a brief moment, can be deleted later
      //setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
    }
  }

  const handleChoosePhotoClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <form
      style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}
      onSubmit={handleSubmit}
    >
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Photo</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleChoosePhotoClick}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            Choose Photo
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
        {photo && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '14px' }}>Selected: {photo.name}</p>
            <img
              src={URL.createObjectURL(photo)}
              alt="Selected"
              style={{
                marginTop: '8px',
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
              }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
          className="bg-white"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Caption</label>
        <textarea
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
          className="bg-white"
        />
      </div>

      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading || isLoading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isUploading || isLoading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isUploading || isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isUploading || isLoading ? 'Uploading...' : 'Create Content Coin'}
      </button>
    </form>
  )
}
