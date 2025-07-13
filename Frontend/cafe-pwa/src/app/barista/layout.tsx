"use client";
// This file is very similar to the Admin layout.
// It protects all child pages and provides a shared sidebar.
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BaristaSidebar } from "@/components/barista/BaristaSidebar";

export default function BaristaLayout({ children }: { children: React.ReactNode }) {
    const { authStatus, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (authStatus === 'unauthenticated' || (authStatus === 'authenticated' && user?.role !== 'admin' && user?.role !== 'barista')) {
            router.push('/'); // Redirect non-authorized users
        }
    }, [authStatus, user, router]);

    if (authStatus === 'loading' || !user) {
        return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
                <aside className="md:col-span-1"><BaristaSidebar /></aside>
                <main className="md:col-span-3 lg:col-span-4">{children}</main>
            </div>
        </div>
    );
}