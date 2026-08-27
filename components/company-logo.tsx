type CompanyLogoProps = {
  initials: string;
  color: string;
  size?: "sm" | "md";
};

export function CompanyLogo({ initials, color, size = "md" }: CompanyLogoProps) {
  const dimensions = size === "sm" ? "h-10 w-10 rounded-[11px] text-[11px]" : "h-12 w-12 rounded-[14px] text-xs";

  return (
    <span
      className={`grid shrink-0 place-items-center font-extrabold tracking-[-0.02em] text-white shadow-sm ${dimensions}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
