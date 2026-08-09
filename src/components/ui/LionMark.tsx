export default function LionMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="shrink-0">
      <defs>
        <clipPath id="lion-shield">
          <path d="M50,8 C40,8 34,15 22,17 C9,19 3,29 3,42 C3,66 22,86 50,97 C78,86 97,66 97,42 C97,29 91,19 78,17 C66,15 60,8 50,8 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#lion-shield)">
        <path d="M0,0 L100,0 L0,100 Z" fill="var(--accent)" />
        <path d="M100,0 L100,100 L0,100 Z" fill="var(--accent-hover)" />
      </g>
      <g fill="#fff">
        <path d="M24,30 L40,25 L38,50 Z" />
        <path d="M76,30 L60,25 L62,50 Z" />
        <path d="M50,24 L64,32 L66,47 L58,60 L50,70 L42,60 L34,47 L36,32 Z" />
        <path d="M45,40 L50,45 L45,50 L40,45 Z" fill="var(--accent-hover)" />
        <path d="M55,40 L60,45 L55,50 L50,45 Z" fill="var(--accent-hover)" />
        <path d="M46,51 L54,51 L50,57 Z" fill="var(--accent-hover)" />
        <path d="M45,68 L55,68 L50,82 Z" />
      </g>
    </svg>
  );
}
