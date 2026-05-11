import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Gwaky — the comment section real estate never had";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0A0A",
          padding: "64px 72px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Amber glow orb */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,77,0,0.18) 0%, rgba(255,77,0,0) 70%)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
            }}
          >
            Gwak<span style={{ color: "#FF4D00" }}>y</span>
          </div>
        </div>

        {/* Main message */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 1000,
            }}
          >
            Real estate finally has a{" "}
            <span style={{ color: "#FF4D00" }}>comment section.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 500,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Real takes from real people. Neighbors, past renters, almost-buyers —
            dropping honest intel on every listing.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            fontSize: 22,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex" }}>gwaky.com</div>
          <div style={{ display: "flex" }}>No agents · No spin · Just the truth</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
