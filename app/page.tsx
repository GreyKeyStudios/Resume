"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MineShaft from "@/components/MineShaft"
import OceanBackground from "@/components/OceanBackground"
import CRTOverlay from "@/components/CRTOverlay"

import PortfolioButton from "@/components/PortfolioButton"
import LinkedInButton from "@/components/LinkedInButton"
import ExperienceModal from "@/components/ExperienceModal"
import { useTheme } from "next-themes"
import "../styles/animations.css"

export default function CloudResume() {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const previousThemeRef = useRef<string>("light")
  const [visits, setVisits] = useState(1)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [currentChoice, setCurrentChoice] = useState<"calm" | "chaos" | null>(null)
  const [oceanFillLevel, setOceanFillLevel] = useState(0)
  const [isThunderstorm, setIsThunderstorm] = useState(false)
  const [animationState, setAnimationState] = useState({
    active: false,
    mode: null as "calm" | "chaos" | null,
    stage: null as string | null,
  })
  const [showVideo, setShowVideo] = useState(false)
  const [showEpilepsyWarning, setShowEpilepsyWarning] = useState(false)

  const calmAudioRef = useRef<HTMLAudioElement>(null)
  const chaosAudioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const [audioInitialized, setAudioInitialized] = useState(false)
  const chaosHeatRAF = useRef<number | null>(null)
  const chaosStartTime = useRef<number>(0)

  // Chaos-only word wrapper: splits text nodes into per-word spans with nested shake/fall
  const wrapWordsForChaos = () => {
    const targets = document.querySelectorAll(
      ".section-title, .paragraph-block p, .paragraph-block, li, .work-section h3, .work-section p, .tech-section, .button-group, .download-buttons, header p, .copyright"
    )
    const allWords: HTMLElement[] = []
    targets.forEach((el) => {
      if ((el as HTMLElement).dataset.chaosOrigHtml) return
      ;(el as HTMLElement).dataset.chaosOrigHtml = el.innerHTML
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
      const textNodes: Text[] = []
      let node: Text | null
      while ((node = walker.nextNode() as Text | null)) {
        if (node.textContent && node.textContent.trim().length > 0) {
          textNodes.push(node)
        }
      }
      textNodes.forEach((textNode) => {
        const parts = textNode.textContent!.split(/(\s+)/)
        const frag = document.createDocumentFragment()
        parts.forEach((part) => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part))
          } else if (part.length > 0) {
            // Outer: handles falling. Inner: handles shaking.
            const outer = document.createElement("span")
            outer.className = "chaos-word-outer"
            const inner = document.createElement("span")
            inner.className = "chaos-word-inner"
            inner.textContent = part
            outer.appendChild(inner)
            frag.appendChild(outer)
            allWords.push(outer)
          }
        })
        textNode.parentNode!.replaceChild(frag, textNode)
      })
    })

    // Randomize fall order with easing curve (slow start, rapid finish)
    // tStage2=35s, tGlitch=100s, fallDuration=2.5s, buffer=1.5s
    // maxDelay = 65 - 1.5 - 2.5 = 61s
    const maxDelay = 61000
    const n = allWords.length
    if (n === 0) return

    // Shuffle indices
    const indices = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }

    // Easing: quadratic (slow early = "holding on", fast late = "giving up")
    indices.forEach((shuffledIdx, arrayPos) => {
      const t = arrayPos / (n - 1 || 1) // 0 to 1
      const eased = t * t // quadratic: most fall later
      const delay = eased * maxDelay
      const rot = (Math.random() - 0.5) * 30 // random rotation -15 to +15
      const xDrift = (Math.random() - 0.5) * 80 // random x drift -40 to +40
      const el = allWords[shuffledIdx]
      el.style.setProperty("--fall-delay", `${delay.toFixed(0)}ms`)
      el.style.setProperty("--fall-rot", `${rot.toFixed(1)}deg`)
      el.style.setProperty("--fall-x", `${xDrift.toFixed(0)}px`)
    })
  }

  // Restore original HTML after chaos word wrapping
  const unwrapChaosWords = () => {
    document.querySelectorAll("[data-chaos-orig-html]").forEach((el) => {
      el.innerHTML = (el as HTMLElement).dataset.chaosOrigHtml!
      delete (el as HTMLElement).dataset.chaosOrigHtml
    })
  }

  // Heat ramp: drives --chaos-heat from 0 to 1 over the chaos duration
  // Also sets body background color as inline style (color-mix not well supported with vars)
  const startHeatRamp = () => {
    chaosStartTime.current = performance.now()
    const HEAT_DURATION = 100000 // 0-100s (up to glitch start)
    const tick = () => {
      const elapsed = performance.now() - chaosStartTime.current
      const heat = Math.min(elapsed / HEAT_DURATION, 1)
      // Set CSS variable for overlays
      document.body.style.setProperty("--chaos-heat", heat.toFixed(3))
      // Interpolate background: #111111 -> #1a0a0a (dark gray to deep blood red)
      const r = Math.round(17 + (26 - 17) * heat)
      const g = Math.round(17 + (10 - 17) * heat)
      const b = Math.round(17 + (10 - 17) * heat)
      document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
      if (heat < 1) {
        chaosHeatRAF.current = requestAnimationFrame(tick)
      }
    }
    chaosHeatRAF.current = requestAnimationFrame(tick)
  }

  const stopHeatRamp = () => {
    if (chaosHeatRAF.current) {
      cancelAnimationFrame(chaosHeatRAF.current)
      chaosHeatRAF.current = null
    }
    document.body.style.removeProperty("--chaos-heat")
    document.body.style.removeProperty("background-color")
  }

  useEffect(() => {
    // Initialize visitor counter
    const storedVisits = localStorage.getItem("visits") || "0"
    const newVisits = Number.parseInt(storedVisits) + 1
    setVisits(newVisits)
    localStorage.setItem("visits", newVisits.toString())

    // Handle scroll for back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)

    // Initialize audio with user interaction
    const initializeAudio = () => {
      console.log("Initializing audio...")
      if (calmAudioRef.current) {
        calmAudioRef.current.volume = 0.7
        calmAudioRef.current.load()
        console.log("Calm audio initialized")
      }
      if (chaosAudioRef.current) {
        chaosAudioRef.current.volume = 0.7
        chaosAudioRef.current.load()
        console.log("Chaos audio initialized")
      }
      setAudioInitialized(true)
    }

    // Add click listener to initialize audio
    document.addEventListener("click", initializeAudio, { once: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("click", initializeAudio)
    }
  }, [])

  // Audio ended events are handled via inline onEnded on the <audio> elements

  // Water-reactive: toggle .water-touching / .water-submerged on marked elements
  useEffect(() => {
    if (!animationState.active || animationState.mode !== "calm") return

    const update = () => {
      const surface = document.getElementById("ocean-surface")
      if (!surface) return
      const surfaceY = surface.getBoundingClientRect().top
      // Toggle on large container sections
      document.querySelectorAll<HTMLElement>("[data-water-reactive]").forEach((el) => {
        const r = el.getBoundingClientRect()
        const isSubmerged = r.top >= surfaceY + 20
        const isTouching = r.bottom >= surfaceY && r.top < surfaceY + 20
        el.classList.toggle("water-submerged", isSubmerged)
        el.classList.toggle("water-touching", isTouching)
      })

      // Also toggle on individual .swap elements for precise per-element triggers
      document.querySelectorAll<HTMLElement>(".swap").forEach((el) => {
        const r = el.getBoundingClientRect()
        const isSubmerged = r.top >= surfaceY
        el.classList.toggle("water-submerged", isSubmerged)
      })
    }

    let raf = 0
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    const interval = setInterval(update, 500)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      clearInterval(interval)
      // Clean up classes from both container sections and individual swap elements
      document.querySelectorAll<HTMLElement>("[data-water-reactive]").forEach((el) => {
        el.classList.remove("water-submerged", "water-touching")
      })
      document.querySelectorAll<HTMLElement>(".swap").forEach((el) => {
        el.classList.remove("water-submerged")
      })
    }
  }, [animationState.active, animationState.mode, oceanFillLevel])

  // Apply animation classes to body
  useEffect(() => {
    const bodyClasses = getBodyClasses()
      .split(" ")
      .filter((c) => c)

    // Remove all animation and dark-mode classes first
    document.body.classList.remove(
      "dark-mode",
      "animation-active",
      "calm-mode",
      "chaos-mode",
      "calm-stage-1",
      "calm-stage-2",
      "calm-stage-3",
      "chaos-stage-1",
      "chaos-stage-2",
      "chaos-stage-3",
      "chaos-stage-4",
      "chaos-stage-5",
    )

    // Add current classes to body
    // Calm stage classes with transforms stay off body (breaks position:fixed for OceanBackground)
    // But chaos stage classes AND calm-mode go on body since chaos CSS needs .chaos-mode.chaos-stage-N on same element
    const bodyAllowedClasses = [
      "dark-mode", "animation-active", "calm-mode", "chaos-mode",
      "chaos-stage-1", "chaos-stage-2", "chaos-stage-3", "chaos-stage-4", "chaos-stage-5"
    ]
    bodyClasses.forEach((cls) => {
      if (cls && bodyAllowedClasses.includes(cls)) {
        document.body.classList.add(cls)
      }
    })

    return () => {
      document.body.classList.remove(
        "dark-mode",
        "animation-active",
        "calm-mode",
        "chaos-mode",
        "calm-stage-1",
        "calm-stage-2",
        "calm-stage-3",
        "chaos-stage-1",
        "chaos-stage-2",
        "chaos-stage-3",
        "chaos-stage-4",
        "chaos-stage-5",
        "chaos-ramp-2",
        "chaos-ramp-3",
        "chaos-swap-on",
        "chaos-clear",
        "calm-swap-on",
      )
    }
  }, [animationState])

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    setTheme(next ? "dark" : "light")
  }

  const printResume = () => {
    window.print()
  }

  const scrollToContact = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleButtonActivation = () => {
    setShowExperienceModal(true)
  }

  const handleConfirmChoice = (choice: "calm" | "chaos") => {
    console.log(`Choice confirmed: ${choice}`)
    setCurrentChoice(choice)
    setShowExperienceModal(false)

    // Add a small delay to ensure modal is closed and audio can start properly
    setTimeout(() => {
      console.log(`Starting ${choice} experience...`)
      startExperience(choice)
    }, 200)
  }

  const clearTimeouts = () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current = []
  }

  const playAudio = async (audioRef: React.RefObject<HTMLAudioElement>) => {
    console.log("[v0] Attempting to play audio...")

    if (!audioInitialized) {
      console.log("[v0] Audio not initialized yet, initializing now...")
      if (calmAudioRef.current) {
        calmAudioRef.current.volume = 0.7
      }
      if (chaosAudioRef.current) {
        chaosAudioRef.current.volume = 0.7
      }
      setAudioInitialized(true)
    }

    if (!audioRef.current) {
      console.error("[v0] Audio ref is null!")
      return
    }

    try {
      // Check if the audio has a media error already (corrupt file)
      if (audioRef.current.error) {
        console.warn("[v0] Audio has a pre-existing error, skipping playback. Code:", audioRef.current.error.code, "Message:", audioRef.current.error.message)
        return
      }

      audioRef.current.currentTime = 0
      console.log("[v0] Audio readyState:", audioRef.current.readyState, "src:", audioRef.current.currentSrc)

      // Force load if needed, with a timeout to avoid hanging
      if (audioRef.current.readyState < 2) {
        console.log("[v0] Audio not ready, forcing load...")
        audioRef.current.load()
        await Promise.race([
          new Promise<void>((resolve) => {
            const onCanPlay = () => {
              audioRef.current!.removeEventListener("canplay", onCanPlay)
              resolve()
            }
            audioRef.current!.addEventListener("canplay", onCanPlay)
          }),
          new Promise<void>((resolve) => {
            const onError = () => {
              audioRef.current!.removeEventListener("error", onError)
              console.warn("[v0] Audio failed to load, continuing without audio")
              resolve()
            }
            audioRef.current!.addEventListener("error", onError)
          }),
          new Promise<void>((resolve) => setTimeout(() => {
            console.warn("[v0] Audio load timed out after 5s, continuing without audio")
            resolve()
          }, 5000)),
        ])
      }

      // Check again after load attempt
      if (audioRef.current.error) {
        console.warn("[v0] Audio has error after load attempt, skipping playback")
        return
      }

      console.log("[v0] Attempting to play...")
      await audioRef.current.play()
      console.log("[v0] Audio playing successfully!")
    } catch (error) {
      console.error("[v0] Audio play failed:", error)

      // Create user interaction prompt for audio
      const audioPrompt = document.createElement("div")
      audioPrompt.innerHTML = `
        <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                    background:rgba(0,0,0,0.9);color:white;padding:20px;border-radius:10px;
                    z-index:10002;text-align:center;">
          <p>Audio blocked by browser. Click to enable:</p>
          <button style="padding:10px 20px;background:#007acc;color:white;border:none;border-radius:5px;cursor:pointer;">
            Enable Audio
          </button>
        </div>
      `
      document.body.appendChild(audioPrompt)

      audioPrompt.querySelector("button")?.addEventListener("click", async () => {
        try {
          await audioRef.current?.play()
          audioPrompt.remove()
        } catch (e) {
          console.error("[v0] Manual audio play failed:", e)
          audioPrompt.remove()
        }
      })
    }
  }

  const startExperience = (choice: "calm" | "chaos") => {
    clearTimeouts()


    setAnimationState({
      active: true,
      mode: choice,
      stage: choice === "calm" ? "letter-sway" : "frightened-letters",
    })

    if (choice === "calm") {
      startCalmExperience()
    } else {
      startChaosExperience()
    }
  }

  const calmStageRef = useRef<number>(0)
  const calmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCalmExperience = () => {
    console.log("[v0] Starting calm experience...")
    document.body.classList.add("calm-swap-on")
    // Store user's current theme so we can restore it on reset
    previousThemeRef.current = isDarkMode ? "dark" : "light"

    playAudio(calmAudioRef)
    calmStageRef.current = 1
    setOceanFillLevel(20)

    // Stage 1: wrap visible text into word-spans for per-word animation
    requestAnimationFrame(() => {
      document.querySelectorAll("h1, h2, h3, p, li").forEach((el) => {
        if (el.closest(".swap") || el.querySelector(".swap")) return // skip swap elements
        if (el.getAttribute("data-word-wrapped")) return
        const nodes = Array.from(el.childNodes)
        nodes.forEach((node) => {
          if (node.nodeType !== Node.TEXT_NODE) return
          const text = node.textContent || ""
          if (!text.trim()) return
          const frag = document.createDocumentFragment()
          text.split(/(\s+)/).forEach((part, i) => {
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part))
            } else if (part) {
              const span = document.createElement("span")
              span.className = "word-float"
              span.style.animationDelay = `${-(i * 0.15)}s`
              span.textContent = part
              frag.appendChild(span)
            }
          })
          node.replaceWith(frag)
        })
        el.setAttribute("data-word-wrapped", "true")
      })
    })

    // Poll audio.currentTime every 250ms to drive stage transitions
    // This stays synced even if tab is backgrounded or audio buffers
    calmIntervalRef.current = setInterval(() => {
      const audio = calmAudioRef.current
      if (!audio || audio.paused) return

      const t = audio.currentTime

      if (t >= 145 && calmStageRef.current < 3) {
        // Stage 3: Storm
        calmStageRef.current = 3
        console.log("[v0] Entering calm stage 3 - storm at", t.toFixed(1), "s")
        setAnimationState((prev) => ({ ...prev, stage: "ocean-sway" }))
        setIsThunderstorm(true)
        setIsDarkMode(true)
      } else if (t >= 32 && calmStageRef.current < 2) {
        // Stage 2: Paragraph sway -- unwrap word-spans
        calmStageRef.current = 2
        console.log("[v0] Entering calm stage 2 - paragraph sway at", t.toFixed(1), "s")
        document.querySelectorAll(".word-float").forEach((span) => {
          span.replaceWith(document.createTextNode(span.textContent || ""))
        })
        document.querySelectorAll("[data-word-wrapped]").forEach((el) => {
          el.removeAttribute("data-word-wrapped")
          el.normalize() // merge adjacent text nodes
        })
        setAnimationState((prev) => ({ ...prev, stage: "paragraph-sway" }))
        setOceanFillLevel(60)
      }
    }, 250)
  }

  const startChaosExperience = () => {
    // LOCK TO TOP AND DISABLE SCROLLING
    window.scrollTo({ top: 0, behavior: "smooth" })
    document.body.style.overflow = "hidden"

    // Start chaos audio
    playAudio(chaosAudioRef)

    // Start progressive heat ramp (drives --chaos-heat 0->1 over 100s)
    startHeatRamp()

    // Re-enable scrolling after initial lock (20s)
    timeoutsRef.current.push(
      setTimeout(() => {
        document.body.style.overflow = "auto"
      }, 20000),
    )

    // STAGE 1 RAMP: Gradually increase trembling intensity
    // Ramp 2 at 12s (medium shaking)
    timeoutsRef.current.push(
      setTimeout(() => {
        document.body.classList.add("chaos-ramp-2")
      }, 12000),
    )
    // Ramp 3 at 24s (intense shaking)
    timeoutsRef.current.push(
      setTimeout(() => {
        document.body.classList.remove("chaos-ramp-2")
        document.body.classList.add("chaos-ramp-3")
      }, 24000),
    )

    // CHAOS SWAP: Trigger "Hire Me" and all swaps at 30s (before falling starts)
    timeoutsRef.current.push(
      setTimeout(() => {
        document.body.classList.add("chaos-swap-on")
      }, 30000),
    )

    // STAGE 2: Falling words (35s-100s)
    timeoutsRef.current.push(
      setTimeout(() => {
        document.body.classList.remove("chaos-ramp-2", "chaos-ramp-3")
        wrapWordsForChaos() // Split text into per-word spans with randomized delays
        setAnimationState((prev) => ({ ...prev, stage: "falling-letters" }))
      }, 35000),
    )

    // Show epilepsy warning 5s before glitch (95s)
    timeoutsRef.current.push(
      setTimeout(() => {
        setShowEpilepsyWarning(true)
      }, 95000),
    )

    // SAFETY CLEAR: Force-hide any remaining visible elements at glitch-1s (99s)
    timeoutsRef.current.push(
      setTimeout(() => {
        document.body.classList.add("chaos-clear")
      }, 99000),
    )

    // STAGE 3: Intense Glitch (100s-110s)
    timeoutsRef.current.push(
      setTimeout(() => {
        document.body.classList.remove("chaos-clear")
        unwrapChaosWords() // Restore original HTML before glitch
        stopHeatRamp() // Heat maxed out, stop RAF
        setAnimationState((prev) => ({ ...prev, stage: "intense-glitch" }))
      }, 100000),
    )

    // STAGE 4: CRT Shutdown (110s-132s)
    timeoutsRef.current.push(
      setTimeout(() => {
        setAnimationState((prev) => ({ ...prev, stage: "crt-shutdown" }))
        setShowEpilepsyWarning(false)
      }, 110000),
    )

    // STAGE 5: Video Stage (132s+)
    timeoutsRef.current.push(
      setTimeout(() => {
        setAnimationState((prev) => ({ ...prev, stage: "video-stage" }))
        document.body.style.overflow = "hidden"
        window.scrollTo({ top: 0, behavior: "smooth" })
        setShowVideo(true)

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load()
            videoRef.current.currentTime = 0
            videoRef.current.play().catch(() => {})
          }
        }, 500)
      }, 132000),
    )

    // Backup reset
    timeoutsRef.current.push(
      setTimeout(() => {
        resetExperience()
      }, 200000),
    )
  }

  const resetExperience = () => {
    // Guard against double calls
    if (!animationState.active && !animationState.mode) return
    console.log("[v0] resetExperience called")
    clearTimeouts()

    // Re-enable scrolling
    document.body.style.overflow = "auto"

    // Stop all audio
    if (calmAudioRef.current) {
      calmAudioRef.current.pause()
      calmAudioRef.current.currentTime = 0
    }
    if (chaosAudioRef.current) {
      chaosAudioRef.current.pause()
      chaosAudioRef.current.currentTime = 0
    }

    // Stop and hide video
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    setShowVideo(false)

    // Reset all state
    setAnimationState({ active: false, mode: null, stage: null })
    setOceanFillLevel(0)
    setIsThunderstorm(false)
    setCurrentChoice(null)
    setShowEpilepsyWarning(false)

    // Clean up chaos word wrapping + heat + inline styles
    unwrapChaosWords()
    stopHeatRamp()
    // Force-remove any leftover chaos inline styles on all elements
    document.querySelectorAll(".chaos-word-outer, .chaos-word-inner").forEach((el) => {
      (el as HTMLElement).replaceWith(document.createTextNode(el.textContent || ""))
    })

    // Clean up word-float spans from calm stage 1
    document.querySelectorAll(".word-float").forEach((span) => {
      span.replaceWith(document.createTextNode(span.textContent || ""))
    })
    document.querySelectorAll("[data-word-wrapped]").forEach((el) => {
      el.removeAttribute("data-word-wrapped")
      el.normalize()
    })

    // Clean up calm audio polling interval
    if (calmIntervalRef.current) {
      clearInterval(calmIntervalRef.current)
      calmIntervalRef.current = null
    }
    calmStageRef.current = 0

    // Restore the user's previous theme preference (not force light)
    document.body.style.backgroundColor = ""
    document.body.classList.remove("dark-mode")
    const wasInDark = previousThemeRef.current === "dark"
    setIsDarkMode(wasInDark)
    if (wasInDark) {
      setTheme("dark")
    } else {
      document.documentElement.classList.remove("dark")
      setTheme("light")
    }

  }

  const getBodyClasses = () => {
    let classes = ""
    if (isDarkMode) classes += " dark-mode"
    if (animationState.active) {
      classes += " animation-active"
      if (animationState.mode === "calm") {
        classes += " calm-mode"
        if (animationState.stage === "letter-sway") classes += " calm-stage-1"
        if (animationState.stage === "paragraph-sway") classes += " calm-stage-2"
        if (animationState.stage === "ocean-sway") classes += " calm-stage-3"
      } else if (animationState.mode === "chaos") {
        classes += " chaos-mode"
        if (animationState.stage === "frightened-letters") classes += " chaos-stage-1"
        if (animationState.stage === "falling-letters") classes += " chaos-stage-2"
        if (animationState.stage === "intense-glitch") classes += " chaos-stage-3"
        if (animationState.stage === "crt-shutdown") classes += " chaos-stage-4"
        if (animationState.stage === "video-stage") classes += " chaos-stage-5"
      }
    }
    return classes
  }

  return (
    <>
    {/* Ocean rendered OUTSIDE the animated wrapper so no parent transform traps it */}
    <OceanBackground
      active={animationState.mode === "calm"}
      fillLevel={oceanFillLevel}
      isThunderstorm={isThunderstorm}
    />

    <div className={`min-h-screen${getBodyClasses()}`}>
      {/* Epilepsy Warning */}
      {showEpilepsyWarning && <div className="epilepsy-warning">⚠️ FLASHING CONTENT WARNING ⚠️</div>}

      {/* Video element */}
      {showVideo && (
        <div
          id="video-overlay"
          style={{
            position: "fixed",
            top: "0px",
            left: "0px",
            width: "100vw",
            height: "100vh",
            zIndex: 999999,
            backgroundColor: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={() => {
              // Video ended - add shrink class, then reset after 2s
              if (videoRef.current) {
                videoRef.current.style.transition = "transform 2s ease-in, opacity 2s ease-in"
                videoRef.current.style.transform = "scale(0.05)"
                videoRef.current.style.opacity = "0"
              }
              setTimeout(() => {
                resetExperience()
              }, 2200)
            }}
            style={{
              width: "80vw",
              height: "auto",
              maxWidth: "800px",
              maxHeight: "600px",
              borderRadius: "8px",
              boxShadow: "0 0 50px rgba(255,255,255,0.3)",
              transition: "transform 0.3s, opacity 0.3s",
            }}
          >
            <source
              src="/chaos-vid.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes videoShrinkToPoint {
          0% { 
            transform: scale(1);
            opacity: 1;
          }
          85% { 
            transform: scale(1);
            opacity: 1;
          }
          95% {
            transform: scale(0.3);
            opacity: 0.5;
          }
          100% { 
            transform: scale(0);
            opacity: 0;
          }
        }
      `}</style>

      {/* Audio elements - using src directly on audio tag for more reliable loading */}
      <audio
        ref={calmAudioRef}
        src="/button-calm.mp3"
        preload="auto"
        loop={false}
        onError={(e) => {
          const target = e.currentTarget as HTMLAudioElement
          const mediaError = target?.error
          console.error("[v0] Calm audio error:", mediaError?.message || "unknown", "code:", mediaError?.code)
        }}
        onLoadStart={() => console.log("[v0] Calm audio load started")}
        onCanPlay={() => console.log("[v0] Calm audio can play")}
        onEnded={() => {
          console.log("[v0] Calm audio ended event fired, resetting")
          resetExperience()
        }}
      />
      <audio
        ref={chaosAudioRef}
        src="/button-chaos.mp3"
        preload="auto"
        loop={false}
        onError={(e) => {
          const target = e.currentTarget as HTMLAudioElement
          const mediaError = target?.error
          console.error("[v0] Chaos audio error:", mediaError?.message || "unknown", "code:", mediaError?.code)
        }}
        onLoadStart={() => console.log("[v0] Chaos audio load started")}
        onCanPlay={() => console.log("[v0] Chaos audio can play")}
        onEnded={() => {
          console.log("[v0] Chaos audio ended event fired, resetting")
          resetExperience()
        }}
      />

      {/* Background effects */}
      <CRTOverlay active={animationState.stage === "crt-shutdown"} />

      {/* Header controls */}
      <div className="toggle-container">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{isDarkMode ? "🌙" : "☀️"} Dark Mode</span>
          <div className="toggle-switch" onClick={toggleDarkMode}>
            <div className={`toggle-slider ${isDarkMode ? "active" : ""}`}>
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>
        <Button onClick={printResume} className="print-button">
          🖨️ Print PDF
        </Button>
      </div>

      {/* Main content */}
      <Card className="container">
        <CardContent className="p-6 md:p-10">
          <header>
            <h1 className="section-title text-4xl font-bold text-blue-600 mb-4 text-center" data-water-reactive>Michael Walton</h1>

            <div className="button-group">
              <div data-water-reactive>
                <Button onClick={scrollToContact} className="contact-button swap">
                  <span className="above-water">Contact Me</span>
                  <span className="under-water">Hire Me</span>
                  <span className="chaos-water">Hire Me</span>
                </Button>
              </div>
              <div className="download-buttons" data-water-reactive>
                <a href="/Michael Walton Tech Resume - 2026.pdf" download className="btn swap">
                  <span className="above-water">Download PDF</span>
                  <span className="under-water">Print Me. Frame Me.</span>
                  <span className="chaos-water">The Artifact</span>
                </a>
                <a href="/Michael Walton Tech Resume - 2026.docx" download className="btn swap">
                  <span className="above-water">Download DOCX</span>
                  <span className="under-water">Recruiter Mode</span>
                  <span className="chaos-water">Editable Evidence</span>
                </a>
              </div>
            </div>

            <p className="paragraph-block whitespace-normal break-words text-gray-600 italic mb-4">
              Contact information available in downloadable resume
            </p>
            <p className="paragraph-block whitespace-normal break-words mb-2" data-water-reactive>
              [<a href="https://www.linkedin.com/in/michael-walton84" target="_blank" className="text-blue-600 hover:underline swap" rel="noreferrer"><span className="above-water">LinkedIn</span><span className="under-water">Corporate Version Of Me</span><span className="chaos-water">The Suit Version</span></a>]{' | ['}
              <a href="https://github.com/GreyKeyStudios" target="_blank" className="text-blue-600 hover:underline swap" rel="noreferrer"><span className="above-water">GitHub</span><span className="under-water">C0de Receipts</span><span className="chaos-water">Secret Vault</span></a>{']'}
            </p>
            <p className="paragraph-block whitespace-normal break-words" id="visitor-counter">
              {`You are visitor #${visits}`}
            </p>
          </header>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">{'Information Technology Professional | Security+ Certified'}</span><span className="under-water">Very Hirable IT Human</span><span className="chaos-water">Very Hirable IT Human</span></h2>
            <p className="paragraph-block whitespace-normal break-words">
              {'Security+ certified IT professional with 10 years of experience supporting enterprise users and troubleshooting hardware/software/network issues. Built hands-on Cybersecurity portfolio projects including Splunk SIEM dashboards, incident case-files, and Python-based threat intelligence automation using VirusTotal, AbuseIPDB, and AlienVault OTX. Strong customer service skills, documentation, ticket-driven workflows, and clear communication of technical findings to both users and technical teams.'}
            </p>
          </section>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">{'Certifications / Technical Proficiency'}</span><span className="under-water">Yes, I Actually Studied</span><span className="chaos-water">Paper Armor</span></h2>
            <div className="paragraph-block whitespace-normal break-words grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">CERTIFICATIONS</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>CompTIA Security+</strong></li>
                  <li><strong>{'Cisco Certified Support Technician (CCST) \u2013 Cybersecurity'}</strong></li>
                  <li><strong>CompTIA A+</strong></li>
                  <li><strong>{'Microsoft Azure Fundamentals (AZ-900)'}</strong> - <em>In progress</em></li>
                  <li><strong>{'Microsoft SC-900'}</strong> - <em>Planned</em></li>
                  <li><strong>{'AWS Cloud Practitioner (CLF-C02)'}</strong> - <em>Planned</em></li>
                  <li><strong>{'ITIL 4 Foundation'}</strong> - <em>Planned</em></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">TECHNICAL SKILLS</h3>
                <div className="space-y-1">
                  <div className="tech-section"><strong>Operating Systems:</strong> Windows, Linux (basic), macOS (basic)</div>
                  <div className="tech-section"><strong>{'Ticketing / ITSM:'}</strong> ServiceNow, Salesforce, Jira</div>
                  <div className="tech-section"><strong>{'Endpoint / Admin Tools:'}</strong> Active Directory, Azure Portal (Entra ID), Intune, SCCM</div>
                  <div className="tech-section"><strong>Remote Support:</strong> Bomgar, Dameware, TeamViewer, Zoom, NextThink</div>
                  <div className="tech-section"><strong>{'Backup & Recovery:'}</strong> Veritas NetBackup</div>
                  <div className="tech-section"><strong>{'Networking / Platforms:'}</strong> Cisco, Meraki Dashboard</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">Work Experience</span><span className="under-water">Proof I've Survived IT</span><span className="chaos-water">Battle Scars</span></h2>

            <div className="paragraph-block whitespace-normal break-words mb-6">
              <div className="work-section">
                <h3 className="text-xl font-semibold">{`Amplifon \u2013 Minneapolis, Minnesota`}</h3>
                <p className="font-semibold">Store Support Specialist</p>
                <p className="italic text-gray-600">{'July 2025 \u2013 Present'}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>{'Provide front-line IT and operational support for store leaders and franchise teams, resolving system issues impacting daily workflows.'}</li>
                  <li>{'Troubleshoot mobile applications, internal web tools, account access issues, and device connectivity (Bluetooth hearing aids, store tablets).'}</li>
                  <li>{'Perform Tier 1 triage for escalations including system access requests, training platform issues, account creation, and foundation/complaints routing.'}</li>
                  <li>{'Maintain HIPAA compliance by securely handling PHI/PII and sending encrypted communications when required.'}</li>
                  <li>{'Escalate complex issues to internal teams while ensuring clear documentation, follow-up, and resolution tracking.'}</li>
                  <li>{'Identify recurring issues and recommend workflow/documentation improvements to increase first-call resolution.'}</li>
                </ul>
              </div>
            </div>

            <div className="paragraph-block whitespace-normal break-words mb-6">
              <div className="work-section">
                <h3 className="text-xl font-semibold">{`NTT Data \u2013 Remote, Minnesota`}</h3>
                <p className="font-semibold">{'Senior Helpdesk Support Analyst (Managed Services / US Bank)'}</p>
                <p className="italic text-gray-600">{'June 2023 \u2013 December 2024'}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>{'Provided Tier 2 technical support for enterprise banking users, resolving escalated hardware, software, and network issues beyond Tier 1 scope.'}</li>
                  <li>{'Supported users in a regulated financial environment, following strict identity verification, access control, and compliance procedures.'}</li>
                  <li>{'Documented incidents and escalations in ServiceNow with audit-ready notes, proper categorization, and accurate resolution tracking.'}</li>
                  <li>{'Troubleshot Windows systems, VPN access, authentication issues, and application outages using remote support tools.'}</li>
                  <li>{'Assisted with account access recovery including password resets, MFA support, and access restoration.'}</li>
                  <li>{'Maintained high-volume ticket performance while meeting KPIs for quality documentation, first-call resolution, and customer satisfaction.'}</li>
                </ul>
              </div>
            </div>

            <div className="paragraph-block whitespace-normal break-words mb-6">
              <div className="work-section">
                <h3 className="text-xl font-semibold">{`Veritas Technologies \u2013 Roseville, Minnesota`}</h3>
                <p className="font-semibold">Technical Support Engineer</p>
                <p className="italic text-gray-600">{'Nov 2022 \u2013 Nov 2023'}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>{'Provided enterprise technical support for Veritas NetBackup customers, resolving backup, recovery, and storage incidents in production environments.'}</li>
                  <li>{'Troubleshot backup failures, restore issues, policy misconfigurations, and client/server communication problems across Windows and Linux.'}</li>
                  <li>{'Supported secure backup practices including encryption configuration, access control considerations, and data retention best practices.'}</li>
                  <li>{'Partnered with engineering/escalation teams to investigate product defects, performance issues, and vulnerability patching efforts.'}</li>
                  <li>{'Assisted disaster recovery workflows including restore testing, recovery validation, and incident documentation.'}</li>
                  <li>{'Maintained detailed case notes, logs, and troubleshooting documentation to support escalations and resolution tracking.'}</li>
                  <li>{'Recommended best practices for system hardening, patch management, and backup integrity validation.'}</li>
                  <li>{'Analyzed system logs and NetBackup debug output to isolate root cause and confirm remediation.'}</li>
                </ul>
              </div>
            </div>

            <div className="paragraph-block whitespace-normal break-words mb-6">
              <div className="work-section">
                <h3 className="text-xl font-semibold">{`Compucom Systems Inc \u2013 Edina, Minnesota`}</h3>
                <p className="font-semibold">{'Configuration Associate (Managed Services / Ameriprise Financial)'}</p>
                <p className="italic text-gray-600">{'March 2016 \u2013 Nov 2022'}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>{'Supported Ameriprise franchise offices with workstation deployments, hardware replacements, and end-user setup in a financial services environment.'}</li>
                  <li>{'Provisioned and configured new/replacement computers, assisting with login, peripherals, software installation, and workstation readiness.'}</li>
                  <li>{'Supported enterprise Windows 10 migration efforts and device refresh workflows.'}</li>
                  <li>{'Managed Surface Pro refurbishment program by re-imaging devices, validating configurations, and coordinating shipment logistics.'}</li>
                  <li>{'Configured and supported Cisco Meraki routers, assisting with circuit setup, connectivity troubleshooting, and deployment readiness.'}</li>
                  <li>{'Created internal training documentation and workflow guides to standardize processes and reduce repeat issues.'}</li>
                  <li>{'Trained and on-boarded new team members on imaging, deployment procedures, and customer support workflows.'}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">Education</span><span className="under-water">The Knowledge Vault</span><span className="chaos-water">The Lore</span></h2>

            <div className="paragraph-block whitespace-normal break-words mb-4">
              <h3 className="text-lg font-semibold">CompTIA Security+ Certification</h3>
              <p className="italic text-gray-600">2025</p>
            </div>

            <div className="paragraph-block whitespace-normal break-words mb-4">
              <h3 className="text-lg font-semibold">{'IT Career Lab, National Able Network \u2013 Chicago, IL'}</h3>
              <p className="italic text-gray-600">2025 - Cisco Academy CCST Cybersecurity</p>
              <ul className="list-disc pl-6 mt-1">
                <li>Completed hands-on, instructor-led training in cybersecurity essentials.</li>
                <li>Obtained Cisco CCST Cybersecurity certification</li>
              </ul>
            </div>

            <div className="paragraph-block whitespace-normal break-words mb-4">
              <h3 className="text-lg font-semibold">CompTIA A+ Certification</h3>
              <p className="italic text-gray-600">2017</p>
            </div>

            <div className="paragraph-block whitespace-normal break-words mb-4">
              <h3 className="text-lg font-semibold">{'Minneapolis Community and Technical College \u2013 Minneapolis, MN'}</h3>
              <p className="italic text-gray-600">2010-2014 - A.S. in Sound Arts (incomplete)</p>
            </div>

            <div className="paragraph-block whitespace-normal break-words mb-4">
              <h3 className="text-lg font-semibold">{'High School for Recording Arts \u2013 St. Paul, MN'}</h3>
              <p className="italic text-gray-600">2004-2006 - HS Diploma</p>
            </div>
          </section>

          <div className="paragraph-block whitespace-normal break-words mb-6" data-water-reactive>
            <p className="italic">{'Experienced in AI-assisted software development workflows, using tools such as Claude, Cursor, and v0 to accelerate prototyping and troubleshooting while maintaining ownership of architecture, testing, and final implementation.'}</p>
          </div>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">Projects and Labs</span><span className="under-water">Receipts (Scroll Below)</span><span className="chaos-water">The Laboratory</span></h2>
            <ul className="paragraph-block whitespace-normal break-words list-disc pl-6 space-y-3">
              <li><strong>Home Security Lab</strong>{' \u2013 Deployed a Splunk SIEM to monitor and analyze network traffic for threats.'}</li>
              <li><strong>TryHackMe Blue Team Labs</strong>{' \u2013 Completed hands-on labs in log analysis, threat detection, and incident response.'}</li>
              <li><strong>{'Firewall & VPN Setup'}</strong>{' \u2013 Configured and tested firewall rules & VPN tunneling for secure network access.'}</li>
              <li><strong>{'Packet Capture & Analysis'}</strong>{' \u2013 Captured and analyzed network traffic using Wireshark to identify anomalies.'}</li>
              <li><strong>Log Analysis with SIEM</strong>{' \u2013 Ingested and analyzed real-world attack logs in Splunk to detect security incidents.'}</li>
              <li><strong>Malware Detection Lab</strong>{' \u2013 Used Any.Run sandbox to analyze malware behavior and identify malicious indicators.'}</li>
              <li><strong>{'Phishing Detection & Response'}</strong>{' \u2013 Designed a phishing awareness training simulation to educate users on email security.'}</li>
              <li><strong>{'Firewall & IDS/IPS Setup'}</strong>{' \u2013 Implemented pfSense firewall & Suricata IDS to detect and block security threats. '}<em>(In Progress)</em></li>
              <li><strong>Automated Threat Intelligence</strong>{' \u2013 Developed a Python script to pull and log threat data from VirusTotal, AlienVault, and AbuseIPDB.'}</li>
              <li><strong>Docker Security Lab</strong>{' \u2013 Built & deployed secure web applications using Docker & Docker Compose, configured multi-container environments, implemented container security best practices, deployed to cloud platforms (AWS/GCP) with Kubernetes, and integrated CI/CD pipelines for automated deployment. '}<em>(in progress)</em></li>
              <li className="mt-4">
                <strong>SOC Portfolio:</strong>{' '}
                <span style={{ whiteSpace: "nowrap" }}>[<a href="https://soc.greykeystudios.dev" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">https://soc.greykeystudios.dev</a>]</span>
                {' '}
                <strong>GitHub:</strong>{' '}
                <span style={{ whiteSpace: "nowrap" }}>[<a href="https://github.com/CyberSecurity-Projects.git" target="_blank" className="text-blue-600 hover:underline swap" rel="noreferrer"><span className="above-water">CyberSecurity-Projects</span><span className="under-water">Receipts</span><span className="chaos-water">Receipts</span></a>]</span>
              </li>
              <li>
                <strong>Cloud Resume Challenge:</strong>{' Hey, you made it! '}
                <span style={{ whiteSpace: "nowrap" }}>[<a href="https://resume.greykeystudios.dev" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">https://resume.greykeystudios.dev</a>]</span>
              </li>
              <li>
                <strong>Challenge Reference:</strong>{' '}
                <span style={{ whiteSpace: "nowrap" }}>[<a href="https://cloudresumechallenge.dev/docs/the-challenge/azure/" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">The Cloud Resume Challenge (Azure)</a>]</span>
              </li>
            </ul>
          </section>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">{'Web Development & Digital Presence'}</span><span className="under-water">Internet Wizardry Section</span><span className="chaos-water">Internet Wizardry Section</span></h2>
            <div className="paragraph-block whitespace-normal break-words space-y-3">
              <p>{'Designed, built, and deployed multiple real-world websites using modern web stacks, focusing on performance, branding, accessibility, and secure deployment. Experienced with Cloudflare Pages hosting, Cloudflare DNS/subdomain management, Cloudflare R2 media storage, automated content workflows, API integrations, and e-commerce tools.'}</p>
              <h3 className="font-semibold mt-4">{'Websites Built / In Progress'}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Grey Key Studios</strong>{' \u2013 GreyKeyStudios.com'}<br /><span className="text-sm text-gray-600">{'Next.js + Cloudflare Pages + R2 media hosting + automation workflows'}</span><br />[<a href="https://www.greykeystudios.com/" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">https://www.greykeystudios.com</a>]</li>
                <li><strong>SBM Inc.</strong>{' \u2013 SBMinc.org'}<br /><span className="text-sm text-gray-600">{'Nonprofit site rebuild with accessibility + modern UI'}</span><br />[<a href="https://www.sbminc.org/" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">https://www.sbminc.org</a>]</li>
                <li><strong>Zachardee Holdings</strong>{' \u2013 ZachardeeHoldings.com'}<br /><span className="text-sm text-gray-600">{'Business site w/ branding + professional landing structure'}</span><br />[<a href="https://www.zachardeeholdings.com/" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">https://www.zachardeeholdings.com</a>]</li>
                <li><strong>{"D Lee's Cuisine"}</strong>{' \u2013 DLeesCuisine.com'}<br /><span className="text-sm text-gray-600">{'First website built \u2013 Google Sites + Square + Ecwid e-commerce'}</span><br />[<a href="https://www.dleescuisine.com/" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">https://www.dleescuisine.com</a>]</li>
                <li><strong>{"Papa Vaughn's BBQ"}</strong> <em>(in progress)</em></li>
                <li><strong>Me To We LLC</strong> <em>(in progress)</em></li>
                <li><strong>Stack House Portfolio</strong> <em>(in progress)</em></li>
              </ul>
            </div>
          </section>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">{'Founder & Creative Director, Grey Key Studios'}</span><span className="under-water">I Make Music Too</span><span className="chaos-water">I Make Music Too</span></h2>
            <p className="paragraph-block whitespace-normal break-words">
              Established and manage Grey Key Studios, an independent music label and creative platform. Oversee all aspects of music production, branding, and digital presence, including website development, artist identity creation, and release strategy.
            </p>
          </section>

          <section className="mb-8" data-water-reactive>
            <h2 className="section-title text-2xl font-semibold text-blue-600 mb-4 swap"><span className="above-water">{'Advanced Music Education & Production Suite'}</span><span className="under-water">What Did I Get Myself Into?</span><span className="chaos-water">Nerdy Music Wizardry</span></h2>
            <p className="paragraph-block whitespace-normal break-words mb-3"><em>(in development)</em></p>
            <div className="paragraph-block whitespace-normal break-words space-y-3">
              <p>A digital audio workstation (DAW) and interactive music education platform integrating real-time audio processing, visualization, and adaptive learning. Developed using AI-assisted coding (Claude, ChatGPT, Cursor, v0) for architecture and implementation.</p>
              <p><strong>Technologies:</strong> TypeScript, React.js, Web Audio API, JUCE, WebAssembly, Node.js</p>
              <p>{'Project available on '}[<a href="https://github.com/GreyKeyStudios/DreamVST.git" target="_blank" className="text-blue-600 hover:underline swap" rel="noreferrer"><span className="above-water">GitHub</span><span className="under-water">Receipts</span><span className="chaos-water">Receipts</span></a>]</p>
              <p>Various other projects in the works. Portfolio will be available shortly.</p>
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Bottom section with buttons */}
      <div className="bottom-section flex justify-between items-center w-full px-8">
        {/* Portfolio button on the left */}
        <div className="flex-1 flex justify-start">
          <PortfolioButton />
        </div>

        {/* Copyright and LinkedIn in the middle */}
        <div className="flex-1 flex flex-col items-center gap-2" data-water-reactive>
          <p className="copyright">{'© 2026 Michael Walton'}</p>
          <LinkedInButton />
        </div>

        {/* THE BUTTON on the right */}
        <div className="flex-1 flex justify-end">
          <MineShaft onButtonActivation={handleButtonActivation} />
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700"
        >
          ↑
        </Button>
      )}

      {/* Modals */}
      <ExperienceModal
        isOpen={showExperienceModal}
        onClose={() => setShowExperienceModal(false)}
        onConfirmChoice={handleConfirmChoice}
      />
    </div>
    </>
  )
}
