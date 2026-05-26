export function FormizoLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22a7f2" />
          <stop offset="100%" stopColor="#007acc" />
        </linearGradient>
        <linearGradient id="logo-grad-comp-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#007acc" />
          <stop offset="100%" stopColor="#005691" />
        </linearGradient>
      </defs>
      {/* Main F shape */}
      <path d="M6 6L12 3L26 7L23 13L12 10V12L21 15L19 20L12 18V29L6 26V6Z" fill="url(#logo-grad-comp)" />
      {/* Overlapping folds for 3D ribbon effect */}
      <path d="M6 6L12 3V10L6 6Z" fill="url(#logo-grad-comp-dark)" />
      <path d="M6 14L12 12V18L6 14Z" fill="url(#logo-grad-comp-dark)" />
    </svg>
  );
}

export const VsCodeLogo = FormizoLogo;
