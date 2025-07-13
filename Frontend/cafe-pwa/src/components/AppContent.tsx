"use client";

import { useAuthStore } from "@/store/authStore";
import { SplashScreen } from "./SplashScreen";
import { Header } from "./Header";

export const AppContent = ({ children }: { children: React.ReactNode }) => {
    const { authStatus } = useAuthStore();

    // If we are still checking the user's auth status, show the splash screen
    if (authStatus === 'loading') {
        return <SplashScreen />;
    }

    // Otherwise, show the normal app layout with the header and page content
    return (
        <>
            <Header />
            {children}
        </>
    );
};