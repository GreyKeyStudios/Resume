"use client"

import { useRouter } from "next/navigation"

export default function PortfolioButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.push("/404")} className="futuristic-portfolio-btn" aria-label="View Portfolio">
      <div className="futuristic-btn-content">
        <span className="btn-text">PORTFOLIO</span>
      </div>

      {/* Corner brackets */}
      <div className="corner-bracket top-left"></div>
      <div className="corner-bracket top-right"></div>
      <div className="corner-bracket bottom-left"></div>
      <div className="corner-bracket bottom-right"></div>

      {/* Circuit traces */}
      <div className="circuit-trace trace-1"></div>
      <div className="circuit-trace trace-2"></div>
      <div className="circuit-trace trace-3"></div>
      <div className="circuit-trace trace-4"></div>

      {/* HUD elements */}
      <div className="hud-element hud-1"></div>
      <div className="hud-element hud-2"></div>
      <div className="hud-element hud-3"></div>
      <div className="hud-element hud-4"></div>

      {/* Data stream lines */}
      <div className="data-stream stream-1"></div>
      <div className="data-stream stream-2"></div>
      <div className="data-stream stream-3"></div>

      {/* Scanning line */}
      <div className="scan-line"></div>
    </button>
  )
}
