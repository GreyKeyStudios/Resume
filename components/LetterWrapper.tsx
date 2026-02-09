"use client"

import type React from "react"
import { useEffect, useRef } from "react"

// Global counter so each letter on the page gets a unique sequential index
let globalLetterIndex = 0

export function resetGlobalLetterIndex() {
  globalLetterIndex = 0
}

interface LetterWrapperProps {
  text: string
  className?: string
  animated?: boolean
}

const LetterWrapper: React.FC<LetterWrapperProps> = ({
  text,
  className = "",
  animated = false,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const assignedRef = useRef(false)

  useEffect(() => {
    // Only assign CSS variables when switching to animated mode
    if (!animated || !containerRef.current) return

    // Reset assignment tracking when animated changes
    assignedRef.current = false

    if (!assignedRef.current) {
      assignedRef.current = true
      const letters =
        containerRef.current.querySelectorAll<HTMLElement>(".letter-outer")

      letters.forEach((letter) => {
        const idx = globalLetterIndex++
        const randomDelay = Math.random() * 1.5
        const randomX = Math.floor(Math.random() * 60) - 30
        const randomRotation = Math.random() * 2 - 1

        letter.style.setProperty("--letter-index", String(idx))
        letter.style.setProperty("--random-delay", String(randomDelay))
        letter.style.setProperty("--random-x", String(randomX))
        letter.style.setProperty("--random-rotation", String(randomRotation))
      })
    }
  }, [animated, text])

  // When not animated, just render plain text - no spans, minimal DOM
  if (!animated) {
    return <span className={className}>{text}</span>
  }

  // When animated, wrap each character in spans for individual animation
  return (
    <span ref={containerRef} className={`letter-container ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") {
          return (
            <span key={index} className="space">
              &nbsp;
            </span>
          )
        }
        return (
          <span key={index} className="letter-outer">
            <span className="letter-inner">{char}</span>
          </span>
        )
      })}
    </span>
  )
}

export default LetterWrapper
