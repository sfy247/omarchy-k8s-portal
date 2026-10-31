import { useBrand } from './brand';

// The emblem: an initial with the number in a gold ring (K247 for KINDELL247)
export const LogoIcon = ({ size = 44 }: { size?: number }) => {
  const { initial, number } = useBrand();
  const label = `${initial}${number}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={label}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d08a" />
          <stop offset="0.5" stopColor="#d4943a" />
          <stop offset="1" stopColor="#7a4f16" />
        </linearGradient>
      </defs>
      <path
        d="M52 14 A26 26 0 1 0 56 40"
        fill="none"
        stroke="url(#logo-gold)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <text
        x="25"
        y="44"
        textAnchor="middle"
        fontSize="32"
        fontWeight="900"
        fontStyle="italic"
        fill="url(#logo-gold)"
        fontFamily="Arial Black, Helvetica, sans-serif"
      >
        {initial}
      </text>
      {number && (
        <text
          x="47"
          y="46"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fontStyle="italic"
          fill="#ffffff"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {number}
        </text>
      )}
    </svg>
  );
};
