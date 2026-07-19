// Lightweight line-icon set (no external dependency) used throughout the app
// instead of emoji, for a professional, consistent look.

const Svg = ({ children, size = 18, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

export const IconDashboard = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);

export const IconStudents = (p) => (
  <Svg {...p}>
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
  </Svg>
);

export const IconFaculty = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2.5" />
    <circle cx="12" cy="10" r="2.3" />
    <path d="M7.5 17c.5-2.2 2.4-3 4.5-3s4 .8 4.5 3" />
  </Svg>
);

export const IconAttendance = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M7.5 12l3 3 6-6.5" />
  </Svg>
);

export const IconMarks = (p) => (
  <Svg {...p}>
    <line x1="5" y1="20" x2="5" y2="11" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="19" y1="20" x2="19" y2="15" />
  </Svg>
);

export const IconAssignments = (p) => (
  <Svg {...p}>
    <path d="M6 2.5h8l5 5V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" />
    <path d="M14 2.5V8h5" />
    <line x1="8.5" y1="13" x2="15.5" y2="13" />
    <line x1="8.5" y1="17" x2="15.5" y2="17" />
  </Svg>
);

export const IconMaterials = (p) => (
  <Svg {...p}>
    <path d="M2.5 5.5c3-1.2 6-1.2 9.5.8v12.7c-3.5-2-6.5-2-9.5-.8V5.5z" />
    <path d="M21.5 5.5c-3-1.2-6-1.2-9.5.8v12.7c3.5-2 6.5-2 9.5-.8V5.5z" />
  </Svg>
);

export const IconEvents = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
    <line x1="16" y1="2.5" x2="16" y2="6.5" />
    <line x1="8" y1="2.5" x2="8" y2="6.5" />
    <line x1="3" y1="9.5" x2="21" y2="9.5" />
  </Svg>
);

export const IconVenues = (p) => (
  <Svg {...p}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <line x1="8" y1="7.5" x2="8" y2="7.5" strokeWidth="2.5" />
    <line x1="12" y1="7.5" x2="12" y2="7.5" strokeWidth="2.5" />
    <line x1="16" y1="7.5" x2="16" y2="7.5" strokeWidth="2.5" />
    <line x1="8" y1="11.5" x2="8" y2="11.5" strokeWidth="2.5" />
    <line x1="12" y1="11.5" x2="12" y2="11.5" strokeWidth="2.5" />
    <line x1="16" y1="11.5" x2="16" y2="11.5" strokeWidth="2.5" />
    <path d="M9.5 21v-4h5v4" />
  </Svg>
);

export const IconRegistrations = (p) => (
  <Svg {...p}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="11.5" />
    <line x1="8.5" y1="15.5" x2="15.5" y2="15.5" />
  </Svg>
);

export const IconClubs = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="5.5" />
    <path d="M8.3 13L7 21.5l5-3 5 3-1.3-8" />
  </Svg>
);

export const IconAnnouncements = (p) => (
  <Svg {...p}>
    <path d="M3 10.5v3a1 1 0 001 1h1.8l4.2 4.5v-14L5.8 9.5H4a1 1 0 00-1 1z" />
    <path d="M16.5 8a4.2 4.2 0 010 8" />
  </Svg>
);

export const IconProfile = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21c0-4 3.5-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
  </Svg>
);

export const IconSettings = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.16.4.44.75.8 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </Svg>
);

export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

export const IconSun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <line x1="12" y1="1.5" x2="12" y2="3.8" />
    <line x1="12" y1="20.2" x2="12" y2="22.5" />
    <line x1="4.2" y1="4.2" x2="5.8" y2="5.8" />
    <line x1="18.2" y1="18.2" x2="19.8" y2="19.8" />
    <line x1="1.5" y1="12" x2="3.8" y2="12" />
    <line x1="20.2" y1="12" x2="22.5" y2="12" />
    <line x1="4.2" y1="19.8" x2="5.8" y2="18.2" />
    <line x1="18.2" y1="5.8" x2="19.8" y2="4.2" />
  </Svg>
);

export const IconMoon = (p) => (
  <Svg {...p}>
    <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
  </Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}>
    <line x1="3" y1="6.5" x2="21" y2="6.5" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17.5" x2="21" y2="17.5" />
  </Svg>
);

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <line x1="4" y1="12" x2="18" y2="12" />
    <polyline points="13 6.5 18.5 12 13 17.5" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);