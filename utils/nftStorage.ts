import { NFTStorage, File } from 'nft.storage'

const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY

if (!NFT_STORAGE_KEY) {
  throw new Error('NFT_STORAGE_KEY is not configured in environment variables')
}

const client = new NFTStorage({ token: NFT_STORAGE_KEY })

export async function uploadToNFTStorage(file: File | Blob, name: string = 'file') {
  try {
    const nftFile = new File([file], name, { type: file.type })
    const cid = await client.storeBlob(nftFile)
    return {
      ipfsHash: cid,
      url: `https://nftstorage.link/ipfs/${cid}`
    }
  } catch (error) {
    console.error('Error uploading to NFT.Storage:', error)
    throw error
  }
} 