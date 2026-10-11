import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { supabase } from './supabase'

export const MAX_PHOTOS = 3

// Shrink to max 1280px on the long edge and re-encode as JPEG.
// Phone photos are 4-12MB; this lands around 150-300KB.
function compressFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const max = 1280
      let { width, height } = img
      if (!width || !height) {
        reject(new Error('decode failed'))
        return
      }
      if (width > max || height > max) {
        const scale = max / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))),
        'image/jpeg',
        0.75,
      )
    }
    img.onerror = () => reject(new Error('load failed'))
    img.src = url
  })
}

// Reading through an object URL keeps the canvas same-origin, so toBlob is
// never refused for tainting.
async function compressBlob(raw) {
  const url = URL.createObjectURL(raw)
  try {
    return await compressFromUrl(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Opens the camera or gallery on a phone; falls back to a file picker on web.
export async function pickPhoto() {
  if (Capacitor.isNativePlatform()) {
    // The photo comes back as a data URL, and `width` is what makes that
    // affordable: the native layer resizes to 1600px before encoding, so the
    // string is a few hundred KB rather than the tens of megabytes a full
    // 12MP frame produces. Unbounded DataUrl was the original bug here.
    //
    // It deliberately does NOT ask for a file reference and read it back.
    // CapacitorHttp is enabled in capacitor.config.json, which replaces the
    // global fetch with a native HTTP client that only speaks http(s) — so
    // fetching a capacitor:// file URL fails every single time. Handing the
    // image straight to the <img> avoids the file read altogether.
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      correctOrientation: true,
      width: 1600,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    })
    if (!photo?.dataUrl) throw new Error('camera returned no image')

    const blob = await compressFromUrl(photo.dataUrl)
    return { blob, preview: URL.createObjectURL(blob) }
  }

  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      try {
        const blob = await compressBlob(file)
        resolve({ blob, preview: URL.createObjectURL(blob) })
      } catch (e) {
        reject(e)
      }
    }
    input.click()
  })
}

export async function uploadPhotos(blobs) {
  const paths = []
  for (const blob of blobs) {
    const name = `uploads/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage
      .from('report-photos')
      .upload(name, blob, { contentType: 'image/jpeg', upsert: false })
    if (error) throw error
    paths.push(name)
  }
  return paths
}

export async function attachPhotos(requestId, paths) {
  if (!paths.length) return
  const { error } = await supabase.rpc('attach_report_photos', {
    input_request_id: requestId,
    input_paths: paths,
  })
  if (error) throw error
}
