"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Archive, ClipboardList, MapPin } from "lucide-react"; // 1. Import MapPin icon

const navItems = [
    { href: "/barista", label: "سفارش‌های در انتظار", icon: Clock },
    { href: "/barista/menu", label: "مدیریت منو", icon: ClipboardList },
    { href: "/barista/history", label: "تاریخچه سفارشات", icon: Archive },
    // 2. Add the new link for the floors page
    { href: "/barista/floors", label: "مدیریت طبقات", icon: MapPin },
];

export const BaristaSidebar = () => {
    const pathname = usePathname();

    return (
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 p-4">
            <nav className="flex flex-col space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Button
                            key={item.label}
                            asChild
                            variant={isActive ? "secondary" : "ghost"}
                            className={`justify-start text-white text-base p-6 ${isActive ? "bg-[#E91227] text-white hover:bg-red-700" : "hover:bg-white/10"
                                }`}
                        >
                            <Link href={item.href}>
                                <item.icon className="ml-2 h-5 w-5" />
                                {item.label}
                            </Link>
                        </Button>
                    )
                })}
            </nav>
        </Card>
    );
};