// A small inline icon set (24px grid, 1.75 stroke) so we don't ship an icon library.
const paths = {
  cart: (
    <>
      <path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.1" />
      <circle cx="9.5" cy="20" r="1.2" />
      <circle cx="17.5" cy="20" r="1.2" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  whatsapp: (
    <path
      d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.3 20.7l4.4-1.1A8.8 8.8 0 1 0 12 3.2Zm-3.2 5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.4.7 1 1.4 1.6 1.9.7.6 1.3.9 1.8 1.1.2.1.4 0 .5-.1l.6-.8c.2-.2.3-.2.5-.1l1.7.8c.2.1.4.2.4.4 0 .5-.2 1.1-.6 1.4-.5.4-1.2.6-1.8.5-1-.2-2.5-.8-3.8-2-1.3-1.2-2.2-2.7-2.4-3.6-.2-.8.1-1.6.6-2.1.2-.2.4-.2.6-.2h.3Z"
      fill="currentColor"
      stroke="none"
    />
  ),
}

export default function Icon({ name, size = 20, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
