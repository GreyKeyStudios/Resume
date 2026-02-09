"use client"

interface OceanBackgroundProps {
  active: boolean
  fillLevel?: number
  isThunderstorm?: boolean
}

export default function OceanBackground({ active, fillLevel = 0, isThunderstorm = false }: OceanBackgroundProps) {
  if (!active) return null

  return (
    <div
      className="fixed bottom-0 left-0 w-full pointer-events-none"
      style={{
        height: `${fillLevel}vh`,
        opacity: fillLevel > 0 ? 1 : 0,
        transition: "height 10s ease-out, opacity 3s ease-out",
        zIndex: 50,
      }}
    >
      {/* Main water body */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isThunderstorm
            ? "rgba(15, 40, 100, 0.9)"
            : fillLevel >= 60
              ? "rgba(20, 60, 140, 0.85)"
              : "rgba(30, 80, 180, 0.7)",
          transition: "background-color 5s ease",
        }}
      />

      {/* Depth gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(10, 40, 100, 0.5) 0%, rgba(40, 80, 160, 0.3) 40%, rgba(80, 130, 200, 0.15) 70%, transparent 100%)",
          transition: "all 5s ease",
        }}
      />

      {/* Surface marker for JS water detection */}
      <div id="ocean-surface" className="absolute top-0 left-0 w-full" style={{ height: 1, pointerEvents: "none" }} />

      {/* Wave surface 1 */}
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          height: isThunderstorm ? "20px" : "8px",
          backgroundImage: isThunderstorm
            ? "linear-gradient(90deg, transparent 0%, rgba(140, 190, 240, 0.6) 20%, transparent 40%, rgba(160, 210, 250, 0.5) 60%, transparent 80%, rgba(140, 190, 240, 0.55) 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(180, 220, 255, 0.5) 25%, transparent 50%, rgba(180, 220, 255, 0.4) 75%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: isThunderstorm ? "wave-surface 1.2s ease-in-out infinite" : "wave-surface 3s ease-in-out infinite",
          transition: "height 3s ease",
        }}
      />

      {/* Wave surface 2 (offset) */}
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          height: isThunderstorm ? "14px" : "6px",
          marginTop: isThunderstorm ? "3px" : "2px",
          backgroundImage: "linear-gradient(90deg, transparent 10%, rgba(200, 230, 255, 0.3) 30%, transparent 55%, rgba(200, 230, 255, 0.25) 80%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: isThunderstorm ? "wave-surface-alt 0.9s ease-in-out infinite" : "wave-surface-alt 4s ease-in-out infinite",
          transition: "height 3s ease",
        }}
      />

      {/* Whitecap foam during storm */}
      {isThunderstorm && (
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: "6px",
            backgroundImage: "linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.45) 15%, transparent 25%, rgba(255, 255, 255, 0.35) 45%, transparent 55%, rgba(255, 255, 255, 0.5) 75%, transparent 90%)",
            backgroundSize: "300% 100%",
            animation: "whitecap-foam 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Light rays when submerged */}
      {fillLevel >= 80 && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute top-0"
              style={{
                left: `${15 + i * 14}%`,
                width: isThunderstorm ? "1px" : "2px",
                height: "100%",
                backgroundImage: `linear-gradient(to bottom, rgba(180, 220, 255, ${isThunderstorm ? 0.1 : 0.25}) 0%, transparent 70%)`,
                animationName: "light-ray-shimmer",
                animationDuration: `${3.5 + i * 0.5}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.4}s`,
                transform: `rotate(${-2 + i * 0.8}deg)`,
                transition: "width 3s ease, opacity 3s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: isThunderstorm ? 20 : 12 }, (_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${3 + i * (isThunderstorm ? 5 : 8)}%`,
              bottom: "0",
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1))",
              animationName: "bubble-rise",
              animationDuration: `${isThunderstorm ? 2 + (i % 3) : 4 + (i % 4) * 1.5}s`,
              animationTimingFunction: "ease-out",
              animationIterationCount: "infinite",
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Lightning flash overlay */}
      {isThunderstorm && (
        <div
          className="absolute inset-0"
          style={{
            animation: "lightning-flash 4s infinite",
          }}
        />
      )}

      {/* Rain streaks overlay (fills entire screen above water) */}
      {isThunderstorm && (
        <div
          className="fixed top-0 left-0 w-full pointer-events-none"
          style={{
            height: "100vh",
            backgroundImage: `repeating-linear-gradient(
              95deg,
              transparent,
              transparent 98px,
              rgba(180, 210, 240, 0.15) 98px,
              rgba(180, 210, 240, 0.15) 99px
            )`,
            backgroundSize: "100px 100%",
            animation: "rain-fall 0.3s linear infinite",
            zIndex: 51,
          }}
        />
      )}

      <style jsx>{`
        @keyframes wave-surface {
          0% { background-position: 0% 0; transform: translateY(0); }
          50% { background-position: 100% 0; transform: translateY(${isThunderstorm ? "-4px" : "-2px"}); }
          100% { background-position: 0% 0; transform: translateY(0); }
        }
        @keyframes wave-surface-alt {
          0% { background-position: 100% 0; transform: translateY(0); }
          50% { background-position: 0% 0; transform: translateY(${isThunderstorm ? "-3px" : "-1px"}); }
          100% { background-position: 100% 0; transform: translateY(0); }
        }
        @keyframes whitecap-foam {
          0% { background-position: 0% 0; opacity: 0.6; }
          50% { background-position: 100% 0; opacity: 1; }
          100% { background-position: 200% 0; opacity: 0.6; }
        }
        @keyframes light-ray-shimmer {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes bubble-rise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-${Math.max(fillLevel, 50)}vh) translateX(${Math.random() > 0.5 ? "" : "-"}15px); opacity: 0; }
        }
        @keyframes lightning-flash {
          0%, 92%, 100% { background-color: transparent; }
          93% { background-color: rgba(200, 220, 255, 0.2); }
          94% { background-color: transparent; }
          96% { background-color: rgba(220, 235, 255, 0.35); }
          97% { background-color: rgba(200, 220, 255, 0.15); }
          98% { background-color: transparent; }
        }
        @keyframes rain-fall {
          0% { background-position: 0 -10px; }
          100% { background-position: -5px 100vh; }
        }
      `}</style>
    </div>
  )
}
