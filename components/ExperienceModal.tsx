"use client"

import { useState, useEffect } from "react"

interface ExperienceModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmChoice: (choice: "calm" | "chaos") => void
}

export default function ExperienceModal({ isOpen, onClose, onConfirmChoice }: ExperienceModalProps) {
  // Modal state management
  const [currentView, setCurrentView] = useState<"choice" | "confirm" | "success" | "decline">("choice")
  const [hoveredSide, setHoveredSide] = useState<"calm" | "chaos" | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<"calm" | "chaos" | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Get character image based on current view (used for src and reset effect)
  const getCharacterImage = () => {
    if (currentView === "confirm") return "/sinister-character.png"
    if (currentView === "success") return "/grinning-character.png"
    if (currentView === "decline") return "/disappointed-character.png"
    return ""
  }
  const characterImageSrc = getCharacterImage()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentView("choice")
      setSelectedChoice(null)
      setHoveredSide(null)
      setIsTransitioning(false)
      setImageLoaded(false)
      setImageError(false)
    }
  }, [isOpen])

  // Reset image load state when the character image src changes (confirm/success/decline)
  useEffect(() => {
    if (characterImageSrc) {
      setImageLoaded(false)
      setImageError(false)
    }
  }, [characterImageSrc])

  if (!isOpen) return null

  // Handle choice selection
  const handleChoiceSelect = (choice: "calm" | "chaos") => {
    setSelectedChoice(choice)
    setIsTransitioning(true)

    // Smooth transition to confirmation view
    setTimeout(() => {
      setCurrentView("confirm")
      setIsTransitioning(false)
    }, 400)
  }

  // Handle confirmation
  const handleConfirm = () => {
    setIsTransitioning(true)
    setCurrentView("success")
    setIsTransitioning(false) // Remove this line since we want to show success immediately

    // Show success state for full duration, THEN call onConfirmChoice
    setTimeout(() => {
      if (selectedChoice) {
        onConfirmChoice(selectedChoice)
      }
    }, 1000) // Changed from 4000 to 2000
  }

  // Handle decline
  const handleDecline = () => {
    setIsTransitioning(true)
    setCurrentView("decline")
    setIsTransitioning(false) // Remove this line since we want to show decline immediately

    // Show decline state for full duration, THEN return to choice
    setTimeout(() => {
      setCurrentView("choice")
      setIsTransitioning(false)
    }, 1000) // Changed from 4000 to 2000
  }

  // Get confirmation text based on selected choice
  const getConfirmationText = () => {
    if (currentView === "confirm") {
      return `Are you ready for the ${selectedChoice} experience?`
    } else if (currentView === "success") {
      return "Excellent choice! Preparing your experience..."
    } else if (currentView === "decline") {
      return "No problem. Feel free to choose again."
    }
    return ""
  }

  return (
    <div className="modal active" onClick={(e) => e.target === e.currentTarget && !isTransitioning && onClose()}>
      <div
        className={`modal-content transition-all duration-500 ${
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Choice View */}
        {currentView === "choice" && (
          <div className={`transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <h2>Choose Your Experience</h2>

            {/* Interactive split image */}
            <div className="choice-image-container">
              <div className="relative w-full h-96 rounded-lg overflow-hidden cursor-pointer">
                {/* The choice card split-screen image */}
                <img
                  src="/choice-card.png"
                  alt="Choose between Calm Ocean and Digital Chaos"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Choice card image failed to load:", e)
                    // Fallback to a gradient background if image fails
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement!.style.background =
                      "linear-gradient(45deg, #4facfe 0%, #00f2fe 50%, #ff416c 50%, #ff4b2b 100%)"
                  }}
                />

                {/* Left side - Calm Ocean */}
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-start pl-16 transition-all duration-300 ${
                    hoveredSide === "calm" ? "bg-blue-500/30" : "hover:bg-blue-500/20"
                  }`}
                  style={{
                    clipPath: "polygon(0% 0%, 64% 0%, 25% 100%, 0% 100%)",
                  }}
                  onMouseEnter={() => setHoveredSide("calm")}
                  onMouseLeave={() => setHoveredSide(null)}
                  onClick={() => handleChoiceSelect("calm")}
                >
                  <div
                    className={`text-center transition-all duration-300 ${
                      hoveredSide === "calm" ? "transform scale-125" : ""
                    }`}
                  >
                    <div className="text-white font-bold text-3xl drop-shadow-lg">Calm</div>
                  </div>
                </div>

                {/* Right side - Chaos */}
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-end pr-16 transition-all duration-300 ${
                    hoveredSide === "chaos" ? "bg-orange-500/30" : "hover:bg-orange-500/20"
                  }`}
                  style={{
                    clipPath: "polygon(66% 0%, 100% 0%, 100% 100%, 28% 100%)",
                  }}
                  onMouseEnter={() => setHoveredSide("chaos")}
                  onMouseLeave={() => setHoveredSide(null)}
                  onClick={() => handleChoiceSelect("chaos")}
                >
                  <div
                    className={`text-center transition-all duration-300 ${
                      hoveredSide === "chaos" ? "transform scale-125" : ""
                    }`}
                  >
                    <div className="text-white font-bold text-3xl drop-shadow-lg">Chaos</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-gray-600 text-sm">Click on either side to choose your experience</div>
          </div>
        )}

        {/* Confirmation View */}
        {(currentView === "confirm" || currentView === "success" || currentView === "decline") && (
          <div className={`transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
            {/* Full background image for success/decline states */}
            {/* Regular image container for confirm state */}
            <div className="character-image-container mb-6 relative">
              <img
                key={characterImageSrc}
                src={characterImageSrc || "/placeholder.svg"}
                alt="Character"
                className={`w-96 h-96 mx-auto object-cover transition-opacity duration-500 rounded-lg shadow-lg ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />

              {!imageLoaded && !imageError && (
                <div className="w-96 h-96 mx-auto flex items-center justify-center absolute inset-0">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Text content with relative positioning for overlay states */}
            <div>
              <p className={`text-center text-lg mb-6 mt-4`}>{getConfirmationText()}</p>

              {currentView === "confirm" && (
                <div className="flex gap-4 justify-center">
                  <button
                    className="btn btn-success px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    onClick={handleConfirm}
                  >
                    Yes, I'm Ready!
                  </button>
                  <button
                    className="btn btn-danger px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    onClick={handleDecline}
                  >
                    No, Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
