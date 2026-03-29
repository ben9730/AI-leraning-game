interface ProgressRingProps {
  fill: number        // 0-1 ratio
  size?: number       // default 40
  strokeWidth?: number // default 4
  level?: number      // optional level number to display in center
}

export function ProgressRing({ fill, size = 40, strokeWidth = 4, level }: ProgressRingProps) {
  const radius = (size / 2) - (strokeWidth / 2)
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Clamp fill between 0 and 1
  const clampedFill = Math.min(1, Math.max(0, fill))

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      {/* Track circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      {/* Fill circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#6366f1"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${clampedFill * circumference} ${circumference}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
      {/* Level number in center */}
      {level !== undefined && (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.32}
          fontWeight="700"
          fill="#6366f1"
        >
          {level}
        </text>
      )}
    </svg>
  )
}
