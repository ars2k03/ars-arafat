type IconProps = {
  className?: string;
};

export function LogoMark({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="8" fill="#ffffff" />
      <rect x="1" y="1" width="38" height="38" rx="7" fill="#fbf8f1" />
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="6.5"
        stroke="#1a1a1a"
        strokeWidth="1.75"
      />
      <path
        d="M10 15.5c0-2.5 2.1-4.5 4.7-4.5h6.6c2.6 0 4.7 2 4.7 4.5v5.2c0 2.5-2.1 4.5-4.7 4.5h-3.2L14.5 28v-3.3c-2.5-.3-4.5-2.4-4.5-5V15.5Z"
        stroke="#1a1a1a"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="15.5" cy="18" r="1.4" fill="#1a1a1a" />
      <circle cx="20" cy="18" r="1.4" fill="#1a1a1a" />
      <circle cx="24.5" cy="18" r="1.4" fill="#7a2020" />
      <path
        d="M29.5 11.5v5M27 14h5"
        stroke="#7a2020"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SendIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 11.2 19.2 4.4c.7-.3 1.4.4 1.1 1.1l-6.8 14.7c-.3.7-1.3.6-1.5-.2l-1.4-5.2-5.2-1.4c-.8-.2-.9-1.2-.2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m10.6 13.4 3.4-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EmptyChatIcon({ className = "w-16 h-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="10"
        width="48"
        height="36"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M22 52 32 46h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="28" r="2.2" fill="currentColor" />
      <circle cx="32" cy="28" r="2.2" fill="currentColor" />
      <circle cx="40" cy="28" r="2.2" fill="#7a2020" />
    </svg>
  );
}
