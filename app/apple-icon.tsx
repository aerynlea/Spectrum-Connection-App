import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at top left, rgba(143, 213, 255, 0.95), transparent 42%), linear-gradient(145deg, #5a7be8 0%, #8572e9 62%, #ff9c73 100%)",
          borderRadius: 40,
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            border: "4px solid rgba(255,255,255,0.92)",
            borderRadius: 999,
            display: "flex",
            fontSize: 70,
            fontWeight: 800,
            height: 110,
            justifyContent: "center",
            letterSpacing: "-0.08em",
            lineHeight: 1,
            paddingTop: 10,
            width: 110,
          }}
        >
          GL
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: 999,
            height: 16,
            left: 38,
            opacity: 0.95,
            position: "absolute",
            top: 118,
            width: 104,
          }}
        />
        <div
          style={{
            color: "#fff7c8",
            fontSize: 34,
            position: "absolute",
            right: 30,
            top: 22,
          }}
        >
          ✦
        </div>
      </div>
    ),
    size,
  );
}
