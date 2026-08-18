"use client";

import Image from "next/image";
import { useBranding } from "@/components/SettingsProvider";

export default function Logo({
  collapsed = false,
  textColor = "var(--sidebar-text)",
}: {
  collapsed?: boolean;
  textColor?: string;
}) {
  const { logoDataUri } = useBranding();

  return (
    <div className="flex items-center gap-2.5">
      {logoDataUri ? (
        // Custom uploaded logo is a data: URI -- next/image's optimizer
        // doesn't handle those, so this renders as a plain <img>.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoDataUri} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
      ) : (
        <Image
          src="/lions-share-logo-192x172.png"
          alt="Lion's Share Digital"
          width={192}
          height={172}
          style={{ width: 32, height: "auto" }}
          className="shrink-0"
          priority
        />
      )}
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
