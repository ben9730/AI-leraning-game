interface XPFloatUpProps {
  amount: number
}

export function XPFloatUp({ amount }: XPFloatUpProps) {
  return (
    <span className="absolute -top-6 start-1/2 -translate-x-1/2 text-sm font-bold text-indigo-600 animate-float-up">
      +{amount} XP
    </span>
  )
}
