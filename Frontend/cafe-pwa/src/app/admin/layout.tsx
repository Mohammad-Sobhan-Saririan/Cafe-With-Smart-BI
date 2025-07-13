"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar"; // 1. Import the sidebar

// We can create a dedicated AdminSidebar component later

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { authStatus, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (authStatus === 'unauthenticated' || (authStatus === 'authenticated' && user?.role !== 'admin')) {
            router.push('/'); // Redirect non-admins to homepage
        }
    }, [authStatus, user, router]);

    if (authStatus === 'loading' || !user || user.role !== 'admin') {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 text-white">
            <h1 className="text-4xl font-bold mb-8">پنل مدیریت</h1>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <aside className="w-full md:w-1/4 lg:w-1/5 md:sticky top-24">
                    <AdminSidebar />
                </aside>
                <main className="w-full md:w-3/4 lg:w-4/5">
                    {children}
                </main>
            </div>
        </div>
    );
}