import Arweave from 'arweave'

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

export async function uploadToArweave(file: File | Blob, name: string = 'file') {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)

    // Create a transaction
    const transaction = await arweave.createTransaction({
      data: data
    })

    // Add tags
    transaction.addTag('Content-Type', file.type)
    transaction.addTag('File-Name', name)

    // Sign and post the transaction
    // Note: In a real app, you'd need to handle wallet signing here
    // For now, we'll use a dummy wallet
    const wallet = await arweave.wallets.generate()
    await arweave.transactions.sign(transaction, wallet)
    const response = await arweave.transactions.post(transaction)

    if (response.status === 200) {
      return {
        arweaveId: transaction.id,
        url: `ar://${transaction.id}`
      }
    } else {
      throw new Error('Failed to upload to Arweave')
    }
  } catch (error) {
    console.error('Error uploading to Arweave:', error)
    throw error
  }
} 