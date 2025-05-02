export async function uploadToImgur(file: File | Blob) {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID}`
      },
      body: formData
    })

    const data = await response.json()

    if (data.success) {
      return {
        url: data.data.link,
        deleteHash: data.data.deletehash
      }
    } else {
      throw new Error(data.data?.error || 'Failed to upload to Imgur')
    }
  } catch (error) {
    console.error('Error uploading to Imgur:', error)
    throw error
  }
} 