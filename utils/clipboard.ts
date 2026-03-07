/**
 * Clipboard utility functions
 */

export const copyToClipboard = (text: string): Promise<void> => {
  return navigator.clipboard.writeText(text).catch((err) => {
    console.error('[v0] Failed to copy to clipboard:', err)
    throw err
  })
}

export const copyToClipboardSync = (text: string): void => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  
  try {
    textarea.select()
    document.execCommand('copy')
  } catch (err) {
    console.error('[v0] Failed to copy to clipboard:', err)
    throw err
  } finally {
    document.body.removeChild(textarea)
  }
}
