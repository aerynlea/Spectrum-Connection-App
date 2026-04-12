import { useId } from "react";

type BrandMarkProps = {
  className?: string;
  size?: number;
};

export function BrandMark({ className, size = 72 }: BrandMarkProps) {
  const id = useId().replace(/:/g, "");
  const glowId = `${id}-glow`;
  const sparkId = `${id}-spark`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 210 190"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={glowId} cx="0" cy="0" gradientTransform="translate(104 84) rotate(53.13) scale(115)" gradientUnits="userSpaceOnUse" r="1">
          <stop stopColor="#8FD5FF" />
          <stop offset="0.55" stopColor="#8C7BEA" />
          <stop offset="1" stopColor="#4A60C8" />
        </radialGradient>
        <radialGradient id={sparkId} cx="0" cy="0" gradientTransform="translate(161 46) rotate(90) scale(36)" gradientUnits="userSpaceOnUse" r="1">
          <stop stopColor="#FFF7C8" />
          <stop offset="0.6" stopColor="#FFB458" />
          <stop offset="1" stopColor="#FF8F5A" />
        </radialGradient>
      </defs>
      <circle cx="96" cy="86" fill={`url(#${glowId})`} r="68" />
      <path
        d="M24 122C54.5 144.5 94.2 153.5 144 135"
        opacity="0.95"
        stroke="#73BAFF"
        strokeLinecap="round"
        strokeWidth="10"
      />
      <path
        d="M35 141C79 173 137 172 184.5 133"
        opacity="0.82"
        stroke="#4D61C8"
        strokeLinecap="round"
        strokeWidth="10"
      />
      <path
        d="M58 82L82 74.5L110.5 87L145 61"
        stroke="#FFF9FF"
        strokeLinecap="round"
        strokeWidth="4.5"
      />
      <circle cx="58" cy="82" fill="#FFFFFF" r="12" />
      <circle cx="82" cy="74.5" fill="#FFFFFF" r="9" />
      <circle cx="110.5" cy="87" fill="#FFFFFF" r="10.5" />
      <circle cx="133.5" cy="59" fill="#FFFFFF" opacity="0.8" r="3" />
      <circle cx="123" cy="44" fill="#FFF6F8" opacity="0.6" r="2.5" />
      <circle cx="140" cy="38" fill="#FFF6F8" opacity="0.7" r="2" />
      <circle cx="117" cy="33" fill="#FFF6F8" opacity="0.5" r="1.8" />
      <path
        d="M161 22L166.636 37.364L182 43L166.636 48.636L161 64L155.364 48.636L140 43L155.364 37.364L161 22Z"
        fill={`url(#${sparkId})`}
      />
    </svg>
  );
}
