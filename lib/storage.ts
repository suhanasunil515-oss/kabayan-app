import { createClient } from '@supabase/supabase-js'

// Lazy initialization of Supabase clients
let supabase: any = null
let supabaseAdmin: any = null

function getSuapabaseClient() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.warn('[v0] Supabase anon key missing, using fallback storage')
      return null
    }

    supabase = createClient(url, key)
  }
  return supabase
}

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      console.warn('[v0] Supabase service role key missing, using fallback storage')
      return null
    }

    supabaseAdmin = createClient(url, key)
  }
  return supabaseAdmin
}

const KYC_BUCKET = 'kyc-documents'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  isMock?: boolean
}

async function ensureBucketExists(): Promise<boolean> {
  const admin = getSupabaseAdmin()
  if (!admin) return false

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await admin.storage.listBuckets()

    if (listError) {
      console.error('[v0] Failed to list buckets:', listError)
      return false
    }

    const bucketExists = buckets?.some((b: any) => b.name === KYC_BUCKET)

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await admin.storage.createBucket(
        KYC_BUCKET,
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB in bytes
          allowedMimeTypes: ALLOWED_TYPES,
        }
      )

      if (createError) {
        console.error('[v0] Failed to create bucket:', createError)
        return false
      }

      console.log('[v0] Bucket created successfully')
    }

    return true
  } catch (err) {
    console.error('[v0] Error ensuring bucket exists:', err)
    return false
  }
}

async function uploadToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

export async function uploadKYCImage(
  file: File,
  type: 'front' | 'back' | 'selfie',
  userId: number,
  applicationId: number
): Promise<UploadResult> {
  console.log('[v0] Starting upload for', type)

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: 'File size must be less than 5MB',
    }
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Only JPG and PNG images are allowed',
    }
  }

  const admin = getSupabaseAdmin()

  // If admin client is not available, use base64 fallback
  if (!admin) {
    console.log('[v0] Using base64 fallback for upload')
    try {
      const base64 = await uploadToBase64(file)
      return {
        success: true,
        url: base64,
        isMock: true,
      }
    } catch (err) {
      console.error('[v0] Base64 conversion failed:', err)
      return {
        success: false,
        error: 'Failed to process file. Please try again.',
      }
    }
  }

  try {
    // Ensure bucket exists
    const bucketReady = await ensureBucketExists()
    if (!bucketReady) {
      console.warn('[v0] Bucket not ready, falling back to base64')
      const base64 = await uploadToBase64(file)
      return {
        success: true,
        url: base64,
        isMock: true,
      }
    }

    // Create unique filename with proper folder structure
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'png'
    const fileName = `${userId}/${applicationId}/${type}-${timestamp}.${ext}`

    console.log('[v0] Uploading file:', fileName)

    // Upload file to Supabase Storage using admin client
    const { data, error } = await admin.storage
      .from(KYC_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('[v0] Upload error:', error)
      // Fallback to base64 if Supabase upload fails
      console.log('[v0] Falling back to base64 after Supabase error')
      const base64 = await uploadToBase64(file)
      return {
        success: true,
        url: base64,
        isMock: true,
      }
    }

    // Get public URL
    const { data: publicData } = admin.storage
      .from(KYC_BUCKET)
      .getPublicUrl(data.path)

    console.log('[v0] Upload successful, URL:', publicData.publicUrl)

    return {
      success: true,
      url: publicData.publicUrl,
    }
  } catch (err) {
    console.error('[v0] Upload exception:', err)
    // Final fallback to base64
    try {
      const base64 = await uploadToBase64(file)
      return {
        success: true,
        url: base64,
        isMock: true,
      }
    } catch (b64Err) {
      return {
        success: false,
        error: 'Failed to upload file. Please try again.',
      }
    }
  }
}
