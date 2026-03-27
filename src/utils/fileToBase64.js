export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result || '')
      const [, base64 = ''] = result.split(',')

      resolve({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        base64,
      })
    }

    reader.onerror = () => {
      reject(new Error('Nao foi possivel converter o arquivo para Base64.'))
    }

    reader.readAsDataURL(file)
  })
}
