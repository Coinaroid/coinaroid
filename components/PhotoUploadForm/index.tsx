'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadToPinata } from '@/utils/pinata'
import { uploadToCloudinary } from '@/utils/cloudinary'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { createCoin } from '@/lib/createCoin'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import sdk from '@farcaster/frame-sdk'
import { getCoinCreateFromLogs } from '@zoralabs/coins-sdk'

export default function PhotoUploadForm() {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { writeContract, data: hash } = useWriteContract()
  const { isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({
      hash,
    })
  const { address } = useAccount()

  useEffect(() => {
    if (isConfirmed) {
      const coinDeployment = getCoinCreateFromLogs(receipt!)
      sdk.actions.composeCast({
        text: `${title}\n${caption}\n\nposted by Coinaroid\n\nhttps://zora.co/coin/base:${coinDeployment?.coin}`,
        embeds: [`https://zora.co/coin/base:${coinDeployment?.coin}`],
      })
    }
  }, [isConfirmed])

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

      // Upload the image to Cloudinary
      // alert('Starting image upload to Cloudinary...')
      const imageResult = await uploadToCloudinary(photo)
      // alert(`Image uploaded successfully! URL: ${imageResult.url}`)
      console.log('Uploaded to Cloudinary:', { ...imageResult, title, caption })

      // Create metadata JSON
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
      // alert(
      //   `Metadata uploaded successfully! IPFS Hash: ${metadataResult.ipfsHash}`,
      // )
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
      // alert(
      //   `Error occurred: ${
      //     error instanceof Error ? error.message : String(error)
      //   }`,
      // )
    } finally {
      setIsUploading(false)
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
          {/* <button
            type="button"
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            Take Photo
          </button> */}
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
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isUploading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
        }}
      >
        {isUploading ? 'Uploading...' : 'Create Content Coin'}
      </button>
    </form>
  )
}
