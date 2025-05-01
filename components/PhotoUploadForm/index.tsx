'use client'

import { useState, useRef } from 'react'
import { uploadToPinata } from '@/utils/pinata'

export default function PhotoUploadForm() {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ ipfsHash: string; pinataUrl: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!photo) {
      alert('Please select a photo')
      return
    }

    try {
      setIsUploading(true)
      setUploadResult(null)
      const result = await uploadToPinata(photo)
      setUploadResult(result)
      console.log('Uploaded to IPFS:', { ...result, title, caption })
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Error uploading image to IPFS')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setUploadResult(null) // Clear previous upload result when new file selected
    }
  }

  const handleChoosePhotoClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <form style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }} onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Photo</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={handleChoosePhotoClick}
            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            Choose Photo
          </button>
          <button 
            type="button" 
            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            Take Photo
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
                objectFit: 'contain' 
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
            borderRadius: '4px' 
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
            borderRadius: '4px' 
          }} 
        />
      </div>

      {uploadResult && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #bae6fd',
          borderRadius: '4px'
        }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 'bold' }}>Upload Success!</h3>
          <p style={{ marginBottom: '4px' }}>IPFS Hash: {uploadResult.ipfsHash}</p>
          <p style={{ wordBreak: 'break-all' }}>
            URL: <a 
              href={uploadResult.pinataUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
              {uploadResult.pinataUrl}
            </a>
          </p>
        </div>
      )}

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
          cursor: isUploading ? 'not-allowed' : 'pointer'
        }}
      >
        {isUploading ? 'Uploading...' : 'Create Content Coin'}
      </button>
    </form>
  )
}
