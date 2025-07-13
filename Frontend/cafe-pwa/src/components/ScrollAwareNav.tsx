"use client";

import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import HotBarIcon from "@/assets/icons/Hot_Bar.svg";
import ColdBarIcon from "@/assets/icons/Cold_Bar.svg";

interface ScrollAwareNavProps {
    activeCategory: string;
}

const navItems = [
    { id: 'hot-bar', label: 'بار گرم', icon: HotBarIcon },
    { id: 'cold-bar', label: 'بار سرد', icon: ColdBarIcon },
];

export const ScrollAwareNav = ({ activeCategory }: ScrollAwareNavProps) => {
    const isScrolled = useScrollPosition();

    return (
        <nav className={cn(
            "sticky top-18 z-10 bg-[#002561]/90 backdrop-blur-xl mb-8 transition-all duration-300 ",
            isScrolled ? "py-2" : "py-4"
        )}>
            <div className="container mx-auto flex h-full justify-center items-center gap-4">
                {navItems.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={cn(
                            "relative h-26 w-24 flex items-center justify-center rounded-2xl transition-colors duration-300 ease-in-out overflow-hidden",
                            activeCategory === item.id
                                ? "bg-[#E91227] text-white shadow-lg"
                                : "text-white bg-white/5 border border-white/10 hover:bg-white/10"
                        )}
                    >
                        {/* The Icon: Always visible */}
                        <item.icon
                            className={cn(
                                "absolute h-24 w-24 transition-all duration-300 ease-in-out"
                            )}
                        />
                    </a>
                ))}
            </div>
            {/* White divider at the end */}
            <div className="h-2 bg-white w-2/3 justify-self-center rounded-full mt-4"></div>
        </nav>
    );
};
