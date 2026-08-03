type AdminIconName =
  | "arrow-left"
  | "chevron-down"
  | "filter"
  | "list-music"
  | "log-out"
  | "moon"
  | "plus"
  | "trash"
  | "sun"
  | "user";

type AdminIconProps = {
  name: AdminIconName;
  size?: number;
};

export function AdminIcon({ name, size = 20 }: AdminIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<AdminIconName, React.ReactNode> = {
    "arrow-left": <path d="m15 18-6-6 6-6M9 12h11" />,
    "chevron-down": <path d="m6 9 6 6 6-6" />,
    filter: <path d="M4 5h16l-6.2 7.1v5.2l-3.6 1.8v-7z" />,
    "list-music": (
      <>
        <path d="M4 6h9M4 10h9M4 14h6" />
        <path d="M16 5v10.5a2.5 2.5 0 1 1-2-2.45V7l6-1.5v8a2.5 2.5 0 1 1-2-2.45" />
      </>
    ),
    "log-out": (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
      </>
    ),
    moon: <path d="M20.6 15.3A8.5 8.5 0 0 1 8.7 3.4 8.5 8.5 0 1 0 20.6 15.3Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}
