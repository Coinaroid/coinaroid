export async function uploadToCloudinary(file: File | Blob) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')
  formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '')

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    const data = await response.json()

    if (data.secure_url) {
      return {
        url: data.secure_url,
        publicId: data.public_id
      }
    } else {
      throw new Error(data.error?.message || 'Failed to upload to Cloudinary')
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
} 