import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { supabase } from './supabase'

export const MAX_PHOTOS = 3

// Shrink to max 1280px on the long edge and re-encode as JPEG.
// Phone photos are 4-12MB; this lands around 150-300KB.
function compress(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const max = 1280
      let { width, height } = img
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
        (blob) => (blob ? resolve(blob) : reject(new Error('compress failed'))),
        'image/jpeg',
        0.75,
      )
    }
    img.onerror = () => reject(new Error('load failed'))
    img.src = dataUrl
  })
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// Opens the camera or gallery on a phone; falls back to a file picker on web.
export async function pickPhoto() {
  if (Capacitor.isNativePlatform()) {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    })
    const blob = await compress(photo.dataUrl)
    return { blob, preview: URL.createObjectURL(blob) }
  }

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const dataUrl = await fileToDataUrl(file)
      const blob = await compress(dataUrl)
      resolve({ blob, preview: URL.createObjectURL(blob) })
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