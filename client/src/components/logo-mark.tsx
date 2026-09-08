export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Servis110 logosu"
    >
      <defs>
        <linearGradient id="servis110-logo" x1="8" y1="5" x2="40" y2="43">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#servis110-logo)" />
      <path
        d="M32 12H21.5C17.36 12 14 14.91 14 18.5S17.36 25 21.5 25h5C30.64 25 34 27.91 34 31.5S30.64 38 26.5 38H16"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="12" r="2.5" fill="#c7d2fe" />
      <circle cx="16" cy="38" r="2.5" fill="#c7d2fe" />
    </svg>
  );
}
