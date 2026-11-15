// The Openpath mark: a shield around a payment's route, with a node at each end and a check between them.
export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path d="M32 4 L56 12.5 V31 C56 46 45.5 55.5 32 60.5 C18.5 55.5 8 46 8 31 V12.5 Z" fill="#4338ca" />
      <path d="M21 33 L29 41 L43 25" fill="none" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="33" r="5" fill="#a5b4fc" />
      <circle cx="43" cy="25" r="5" fill="#a5b4fc" />
    </svg>
  );
}
