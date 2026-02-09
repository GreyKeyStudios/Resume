"use client"

import { useState } from "react"

interface MineShaftProps {
  onButtonActivation: () => void
}

export default function MineShaft({ onButtonActivation }: MineShaftProps) {
  const [signRemoved, setSignRemoved] = useState(false)
  const [removedPlanks, setRemovedPlanks] = useState<number[]>([])
  const [isRevealed, setIsRevealed] = useState(false)

  const handleSignClick = () => {
    setSignRemoved(true)
    checkReveal(true, removedPlanks)
  }

  const handlePlankClick = (plankIndex: number) => {
    if (signRemoved && !removedPlanks.includes(plankIndex)) {
      const newRemovedPlanks = [...removedPlanks, plankIndex]
      setRemovedPlanks(newRemovedPlanks)
      checkReveal(signRemoved, newRemovedPlanks)
    }
  }

  const checkReveal = (signGone: boolean, planksGone: number[]) => {
    if (signGone && planksGone.length === 3) {
      setIsRevealed(true)
    }
  }

  const handleButtonClick = () => {
    if (isRevealed) {
      onButtonActivation()
    }
  }

  return (
    <div className="mine-shaft" style={{ position: "relative" }}>
      {/* THE BUTTON - always visible */}
      <button
        className={`danger-btn ${isRevealed ? "revealed" : "covered"}`}
        onClick={handleButtonClick}
        style={{ pointerEvents: isRevealed ? "auto" : "none" }}
      >
        THE BUTTON
      </button>

      {/* Wooden Planks */}
      <div className="wooden-planks">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`wooden-plank plank-${index + 1} ${removedPlanks.includes(index) ? "removed" : ""}`}
            onClick={() => handlePlankClick(index)}
          >
            <div className="plank-texture"></div>
            <div className="plank-grain"></div>
            <div className="wood-knot"></div>
            <div className="nail nail-left"></div>
            <div className="nail nail-right"></div>
            <div className="plank-shadow"></div>
          </div>
        ))}
      </div>

      {/* Wooden Warning Sign - positioned ON TOP of planks */}
      <div className={`wooden-warning-sign ${signRemoved ? "removed" : ""}`} onClick={handleSignClick}>
        <div className="wood-texture"></div>
        <div className="sign-content">
          <div className="danger-text">⚠️ DANGER ⚠️</div>
          <div className="warning-text">AUTHORIZED</div>
          <div className="warning-text">PERSONNEL ONLY</div>
          <div className="instruction-text">KEEP OUT</div>
        </div>
        <div className="corner-nail top-left"></div>
        <div className="corner-nail top-right"></div>
        <div className="corner-nail bottom-left"></div>
        <div className="corner-nail bottom-right"></div>
      </div>
    </div>
  )
}
