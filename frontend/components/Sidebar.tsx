"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    PieChart,
    StickyNote,
    FolderOpen,
    Home,
    Settings,
    UploadCloud,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const pathname = usePathname();
    // Initially collapsed
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Hide sidebar on auth pages
    if (pathname === "/login" || pathname === "/register") {
        return null;
    }

    const navItems = [
        { name: "홈", href: "/", icon: Home },
        { name: "나의 투자", href: "/investments", icon: PieChart },
        { name: "나의 메모", href: "/memos", icon: StickyNote },
        { name: "파일 보관함", href: "/files", icon: FolderOpen },
    ];

    return (
        <aside
            // Expand on hover, collapse on leave
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
            className={cn(
                "h-screen bg-[#1a1b1e] border-r border-[#2a2b2e] flex flex-col flex-shrink-0 z-50 transition-all duration-300 relative",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Header / Logo */}
            <div className={cn("flex items-center py-8 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-6")}>
                {isCollapsed ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3182f6] to-[#1B64DA] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        L
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden">
                        LogMind AI
                    </h1>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2 overflow-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center transition-all duration-200 group relative",
                                isCollapsed
                                    ? "justify-center w-10 h-10 mx-auto rounded-xl"
                                    : "gap-3 px-4 py-3.5 rounded-xl w-full",
                                isActive
                                    ? "bg-[#3182f6] text-white shadow-[0_4px_12px_rgba(49,130,246,0.3)]"
                                    : "text-[#B0B8C1] hover:bg-[#2a2b2e] hover:text-white"
                            )}
                        >
                            <item.icon
                                size={22}
                                className={cn(
                                    "flex-shrink-0 transition-colors",
                                    isActive ? "text-white" : "text-[#B0B8C1] group-hover:text-white"
                                )}
                            />

                            {!isCollapsed && (
                                <span className="font-medium text-[15px] whitespace-nowrap overflow-hidden opacity-100 transition-opacity duration-300">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Area / Drop Zone */}
            <div className={cn("pb-8 transition-all duration-300", isCollapsed ? "px-2" : "px-4")}>

                {/* Drop Zone */}


                {/* Settings */}
                <div className={cn(
                    "mt-4 flex items-center text-[#6B7684] hover:text-[#B0B8C1] cursor-pointer transition-colors overflow-hidden",
                    isCollapsed ? "justify-center" : "gap-3 px-2"
                )}>
                    <Settings size={18} />
                    {!isCollapsed && <span className="text-xs font-medium whitespace-nowrap">설정</span>}
                </div>
            </div>
        </aside>
    );
}
