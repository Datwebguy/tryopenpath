export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="16" fill="#4338ca" />
      <path d="M14 44 L28 44 L28 20 L50 20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="44" r="5" fill="#fff" />
      <circle cx="50" cy="20" r="5" fill="#a5b4fc" />
    </svg>
  );
}
