import { useState } from 'react'

export default function CopyButton({ text, label = 'Sao chép' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <button type="button" className="copy-btn" onClick={handleCopy}>
      {copied ? 'Đã sao chép ✓' : label}
    </button>
  )
}
