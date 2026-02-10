"use client"

import { Button } from "@/components/ui/button"
import { Linkedin } from "lucide-react"
import LetterWrapper from "./LetterWrapper"

export default function LinkedInButton() {
  const handleLinkedInClick = () => {
    window.open("https://www.linkedin.com/in/michael-walton84", "_blank", "noopener,noreferrer")
  }

  return (
    <Button
      onClick={handleLinkedInClick}
      className="linkedin-button bg-[#0077B5] hover:bg-[#005885] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
    >
      <Linkedin size={20} />
      <span className="swap">
        <span className="above-water"><LetterWrapper animated={false} text="LinkedIn" /></span>
        <span className="under-water">Yes I'm Real</span>
        <span className="chaos-water">Me Again!</span>
      </span>
    </Button>
  )
}
