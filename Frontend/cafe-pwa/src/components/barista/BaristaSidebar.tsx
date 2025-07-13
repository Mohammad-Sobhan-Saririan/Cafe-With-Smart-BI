"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Archive, ClipboardList } from "lucide-react";

const navItems = [
    { href: "/barista", label: "سفارشات در حال انتظار", icon: Clock },
    { href: "/barista/menu", label: "مدیریت منوی محصولات", icon: ClipboardList },
    { href: "/barista/history", label: "خلاصه سفارشات", icon: Archive },
];

export const BaristaSidebar = () => {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
                <Button
                    key={item.label}
                    asChild
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={`justify-start text-base p-6 text-white hover:text-white ${pathname === item.href ? "bg-[#E91227] hover:bg-red-700" : "hover:bg-white/10"}`}
                >
                    <Link href={item.href}>
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.label}
                    </Link>
                </Button>
            ))}
        </nav>
    );
};