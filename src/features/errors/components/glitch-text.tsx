// src/features/errors/components/glitch-text.tsx
// Reusable glitch‑effect heading — used by NotFoundPage & UnauthorizedPage
export interface GlitchTextProps {
  text: string;
  /** Tailwind gradient classes for the main visible span */
  gradient?: string;
  /** Tailwind gradient classes for the first glitch layer */
  glitch1Gradient?: string;
  /** Tailwind color class for the second glitch layer */
  glitch2Color?: string;
}

export function GlitchText({
  text,
  gradient = 'from-primary via-[#00c4ff] to-primary',
  glitch1Gradient = 'from-primary to-[#00c4ff]',
  glitch2Color = 'text-red-500/50',
}: GlitchTextProps) {
  return (
    <div className='relative select-none'>
      <span
        aria-hidden='true'
        className={`absolute inset-0 animate-[glitch1_3s_infinite] bg-gradient-to-r ${glitch1Gradient} bg-clip-text text-transparent opacity-70`}
        style={{ clipPath: 'polygon(0 30%, 100% 30%, 100% 50%, 0 50%)' }}>
        {text}
      </span>
      <span
        aria-hidden='true'
        className={`absolute inset-0 animate-[glitch2_3s_infinite] ${glitch2Color} opacity-50`}
        style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 80%, 0 80%)' }}>
        {text}
      </span>
      <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {text}
      </span>
    </div>
  );
}
