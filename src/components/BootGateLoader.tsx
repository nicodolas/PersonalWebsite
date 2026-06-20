"use client";

import dynamic from "next/dynamic";

// Client Component wrapper — chỉ nơi này mới được dùng dynamic({ ssr: false })
const BootGate = dynamic(() => import("@/components/BootGate"), { ssr: false });

export default function BootGateLoader({ children }: { children: React.ReactNode }) {
    return <BootGate>{children}</BootGate>;
}
