// src/components/AuthInitializer.tsx
"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthInitializer() {
    const { setUser } = useAuthStore(); // We'll use the new setUser action
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            const checkAuthStatus = async () => {
                try {
                    const res = await fetch('http://localhost:5001/api/auth/profile', { credentials: 'include' });
                    if (res.ok) {
                        const { user } = await res.json();
                        setUser(user); // Sets status to 'authenticated'
                    } else {
                        setUser(null); // Sets status to 'unauthenticated'
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    setUser(null); // Sets status to 'unauthenticated'
                }
            };
            checkAuthStatus();
        }
    }, [setUser]);

    return null;
}