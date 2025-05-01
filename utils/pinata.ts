import axios from 'axios'

const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT

export async function uploadToPinata(file: File) {
  if (!pinataJWT) {
    console.error('Pinata JWT is not configured in environment variables')
    throw new Error('Pinata JWT not configured')
  }

  try {
    // Log the first few characters of JWT to verify it's loaded (don't log the whole token)
    console.log('JWT prefix:', pinataJWT.substring(0, 10) + '...')

    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: 'image'
      }
    })
    formData.append('pinataMetadata', metadata)

    // Add options
    const options = JSON.stringify({
      cidVersion: 0
    })
    formData.append('pinataOptions', options)

    // Upload to Pinata
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer ${pinataJWT}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    )

    // Return the IPFS hash
    return {
      ipfsHash: res.data.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
    }
  } catch (error: any) {
    console.error('Error uploading to Pinata:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    throw error
  }
} 