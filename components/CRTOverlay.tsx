"use client"

interface CRTOverlayProps {
  active: boolean
}

export default function CRTOverlay({ active }: CRTOverlayProps) {
  return (
    <div className={`crt-overlay ${active ? "active" : ""}`}>
      <div className="crt-scanlines"></div>
      <div className="crt-dot"></div>
    </div>
  )
}
