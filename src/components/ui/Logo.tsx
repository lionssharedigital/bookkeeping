import Image from "next/image";

export default function Logo({
  collapsed = false,
  textColor = "var(--sidebar-text)",
}: {
  collapsed?: boolean;
  textColor?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/lions-share-logo-192x172.png"
        alt="Lion's Share Digital"
        width={192}
        height={172}
        style={{ width: 32, height: "auto" }}
        className="shrink-0"
        priority
      />
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
