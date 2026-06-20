"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// BootSequence dùng Date.now() + random → phải disable SSR
const BootSequence = dynamic(() => import("@/components/BootSequence"), { ssr: false });

interface BootGateProps {
    children: React.ReactNode;
}

export default function BootGate({ children }: BootGateProps) {
    // Lazy init — đọc localStorage một lần khi mount, không cần effect
    const [isBooted, setIsBooted] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("neko_booted") === "true";
    });

    const handleBootComplete = () => {
        localStorage.setItem("neko_booted", "true");
        setIsBooted(true);
    };

    if (!isBooted) {
        return <BootSequence onComplete={handleBootComplete} />;
    }

    return <>{children}</>;
}
