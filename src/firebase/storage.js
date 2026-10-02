const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY || import.meta.env.IMGBB_API_KEY

export async function uploadProfileImage(uid, file) {
  if (!uid) throw new Error('You must be signed in.')
  if (!file) throw new Error('Please choose an image first.')

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or GIF image.')
  }

  if (file.size > 16 * 1024 * 1024) {
    throw new Error('Profile images must be smaller than 16 MB.')
  }

  if (!imgbbApiKey) {
    throw new Error('IMGBB API key is missing. Add VITE_IMGBB_API_KEY or IMGBB_API_KEY to your .env file.')
  }

  const formData = new FormData()
  formData.append('key', imgbbApiKey)
  formData.append('image', file)
  formData.append('name', `${uid}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`)

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  })

  const payload = await response.json()

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || 'Image upload failed.')
  }

  return payload?.data?.url || payload?.data?.display_url || ''
}
