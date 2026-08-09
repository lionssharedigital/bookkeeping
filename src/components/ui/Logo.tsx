import LionMark from "./LionMark";

export default function Logo({
  collapsed = false,
  textColor = "var(--sidebar-text)",
}: {
  collapsed?: boolean;
  textColor?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <LionMark size={32} />
      {!collapsed && (
        <span
          className="font-display text-[15px] leading-tight font-semibold tracking-tight"
          style={{ color: textColor }}
        >
          Lion&apos;s Share
          <span className="block text-[11px] font-medium tracking-wide opacity-60">
            Bookkeeping
          </span>
        </span>
      )}
    </div>
  );
}
