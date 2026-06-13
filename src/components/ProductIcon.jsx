// Inline SVG product icons — clearer and more on-brand than emoji,
// especially for paneer (white cubes) and ghee (golden jar).
const ICONS = {
  milk: (
    <>
      <ellipse cx="24" cy="9" rx="9" ry="2.4" fill="#eaf2fb" stroke="#c4d2de" strokeWidth="1.3" />
      <path
        d="M15 9.5c0 2.5-.4 3-1.4 5.5L13 38a3 3 0 0 0 3 3.2h16a3 3 0 0 0 3-3.2l-.6-23c-1-2.5-1.4-3-1.4-5.5"
        fill="#ffffff"
        stroke="#c4d2de"
        strokeWidth="1.5"
      />
      <path d="M14.4 22h19.2l-1 16a2.4 2.4 0 0 1-2.4 2.2H17.8a2.4 2.4 0 0 1-2.4-2.2l-1-16z" fill="#eef5fb" />
    </>
  ),
  paneer: (
    <>
      <rect x="8.5" y="22" width="16" height="13" rx="1.6" fill="#fcfbf6" stroke="#e0d6c1" strokeWidth="1.4" />
      <rect x="23.5" y="22" width="16" height="13" rx="1.6" fill="#f8f4ea" stroke="#e0d6c1" strokeWidth="1.4" />
      <rect x="16" y="11.5" width="16" height="13" rx="1.6" fill="#ffffff" stroke="#e0d6c1" strokeWidth="1.4" />
      <circle cx="20.5" cy="16.5" r="1" fill="#ece2cd" />
      <circle cx="27" cy="19.5" r="1" fill="#ece2cd" />
      <circle cx="13.5" cy="28.5" r="1" fill="#ece2cd" />
      <circle cx="31.5" cy="28" r="1" fill="#ece2cd" />
    </>
  ),
  ghee: (
    <>
      <rect x="12" y="10.5" width="24" height="5.4" rx="2.2" fill="#e6dcc6" stroke="#cabfa6" strokeWidth="1.2" />
      <path
        d="M13.5 16h21v19.5a4.5 4.5 0 0 1-4.5 4.5h-12a4.5 4.5 0 0 1-4.5-4.5V16z"
        fill="#f4b428"
        stroke="#d6970f"
        strokeWidth="1.6"
      />
      <path d="M13.5 16h21v4.6h-21z" fill="#ffd06b" />
      <rect x="16.5" y="24" width="15" height="10" rx="2" fill="#fff7e6" />
      <path d="M19.5 28.5h9M19.5 31h6" stroke="#d6970f" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  khowa: (
    <>
      <ellipse cx="24" cy="35" rx="15" ry="3.6" fill="#ece2cc" />
      <path d="M11.5 34c0-7.2 5.6-12.5 12.5-12.5S36.5 26.8 36.5 34h-25z" fill="#f1e2c1" stroke="#d6c094" strokeWidth="1.5" />
      <ellipse cx="20" cy="28.5" rx="2.1" ry="1.4" fill="#e4d1a6" opacity="0.7" />
      <ellipse cx="28" cy="30.5" rx="2.3" ry="1.5" fill="#e4d1a6" opacity="0.7" />
      <ellipse cx="24" cy="25.5" rx="1.8" ry="1.2" fill="#e4d1a6" opacity="0.6" />
    </>
  ),
  dahi: (
    <>
      <path
        d="M10.5 22.5c0-2.2 6-3.8 13.5-3.8s13.5 1.6 13.5 3.8l-1.5 12a6 6 0 0 1-6 5.2H18a6 6 0 0 1-6-5.2l-1.5-12z"
        fill="#e7d6bd"
        stroke="#c7a87f"
        strokeWidth="1.6"
      />
      <ellipse cx="24" cy="21.5" rx="13.5" ry="4" fill="#fffdf7" stroke="#e6dac2" strokeWidth="1.3" />
      <ellipse cx="24" cy="21" rx="9.5" ry="2.4" fill="#f7f1e4" />
    </>
  ),
};

export default function ProductIcon({ slug, className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-hidden="true">
      {ICONS[slug] || ICONS.milk}
    </svg>
  );
}
