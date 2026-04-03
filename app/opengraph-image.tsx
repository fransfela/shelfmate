import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Shelfmate — Your Reading Life, Together"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1c1917",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 0%, #78350f33 0%, transparent 70%)",
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "#78350f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            fontSize: 72,
          }}
        >
          📚
        </div>

        {/* Title */}
        <div
          style={{
            color: "#fef3c7",
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          Shelfmate
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#a8a29e",
            fontSize: 32,
            marginTop: 20,
            letterSpacing: "0.5px",
          }}
        >
          Your reading life, together.
        </div>
      </div>
    ),
    { ...size }
  )
}
