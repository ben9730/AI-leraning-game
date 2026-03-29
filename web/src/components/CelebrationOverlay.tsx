import { useState } from 'react'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

interface Particle {
  id: number
  color: string
  left: string
  delay: string
  duration: string
}

function generateParticles(): Particle[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${0.8 + Math.random() * 0.6}s`,
  }))
}

export function CelebrationOverlay() {
  const [particles] = useState(() => generateParticles())

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: 8,
            height: 8,
            borderRadius: 2,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
