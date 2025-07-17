"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Package, LayoutDashboard, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
    { href: "/admin/users", label: "کاربران", icon: Users },
    { href: "/admin/orders", label: "سفارش‌ها", icon: Package },
    { href: "/admin/credits", label: "مدیریت اعتبار", icon: Users },
    // { href: "/admin/floors", label: "مدیریت طبقات", icon: Users },

    { href: "/admin/reporting", label: "گزارشات هوشمند", icon: FileText },
];

export const AdminSidebar = () => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 p-2">
            {/* Show toggle button only in mobile view */}
            <div className="block md:hidden">
                <Button
                    onClick={toggleExpand}
                    variant="ghost"
                    className="flex justify-between items-center w-full text-white text-base p-4"
                >
                    منو
                    <ChevronDown className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </Button>
            </div>
            {/* Always show nav items in desktop view */}
            <nav
                className={`flex flex-col space-y-2 ${isExpanded || "hidden md:flex"
                    }`}
            >
                {navItems.map((item) => {
                    const isActive = item.href === "/admin"
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Button
                            key={item.label}
                            asChild
                            variant={isActive ? "secondary" : "ghost"}
                            className={`justify-start text-base text-white hover:text-white p-6 ${isActive
                                ? "bg-[#E91227] text-white hover:bg-red-700"
                                : "hover:bg-white/10"
                                }`}
                        >
                            <Link href={item.href}>
                                <item.icon className="ml-2 h-5 w-5" />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}
            </nav>
        </Card>
    );
};