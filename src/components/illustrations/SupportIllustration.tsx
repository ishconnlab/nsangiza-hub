export function SupportIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 300" fill="none" role="img" aria-label="A calm landscape with two people talking under a warm sun" className={className}>
      <circle cx="304" cy="88" r="68" fill="#F5C77E" opacity="0.12" />
      <circle cx="300" cy="92" r="42" fill="#F5C77E" opacity="0.85" />

      <path d="M40 84c8-10 22-10 30 0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M96 58c6-8 18-8 24 0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.35" />

      <path d="M0 244c58-42 132-42 196-8s150 30 224-16v100H0v-76Z" fill="#ffffff" opacity="0.10" />
      <path d="M0 276c74-30 150-22 224 8s140 12 196-10v46H0v-44Z" fill="#ffffff" opacity="0.16" />

      <g opacity="0.95">
        <circle cx="150" cy="190" r="17" fill="#ffffff" />
        <path d="M120 246c0-21 13-33 30-33s30 12 30 33h-60Z" fill="#ffffff" />
        <circle cx="212" cy="196" r="15" fill="#F5C77E" />
        <path d="M187 246c0-19 11-29 25-29s25 10 25 29h-50Z" fill="#F5C77E" />
      </g>

      <path d="M150 216c8 6 20 6 28 0" stroke="#2F6B4F" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

      <rect x="40" y="308" width="340" height="2" rx="1" fill="#ffffff" opacity="0.25" />
    </svg>
  )
}
