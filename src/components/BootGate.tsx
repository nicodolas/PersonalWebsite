"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { registerInteractionUnlock } from "@/lib/useAudioManager";

// BootSequence dùng Date.now() + random → phải disable SSR
const BootSequence = dynamic(() => import("@/components/BootSequence"), { ssr: false });

interface BootGateProps {
    children: React.ReactNode;
}

export default function BootGate({ children }: BootGateProps) {
    const [isBooted, setIsBooted] = useState(false);

    // Đăng ký interaction unlock sớm — trước khi LayoutWrapper mount
    // Quan trọng: BootGate render trước LayoutWrapper, nếu không đăng ký ở đây
    // thì neko:interaction từ BootSequence sẽ bị bỏ qua vì chưa có listener nào
    useEffect(() => {
        registerInteractionUnlock();
    }, []);

    // Đăng ký interaction unlock sớm — trước khi LayoutWrapper mount
    // Quan trọng: BootGate render trước LayoutWrapper, nếu không đăng ký ở đây
    // thì neko:interaction từ BootSequence sẽ bị bỏ qua vì chưa có listener nào
    useEffect(() => {
        registerInteractionUnlock();
    }, []);

    const handleBootComplete = () => {
        setIsBooted(true);
    };

    if (!isBooted) {
        return <BootSequence onComplete={handleBootComplete} />;
    }

    return <>{children}</>;
}
