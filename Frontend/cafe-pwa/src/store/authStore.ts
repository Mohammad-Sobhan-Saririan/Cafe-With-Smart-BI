// src/store/authStore.ts
import { create } from 'zustand';
import type { User } from "@/types"; // 1. Import the shared User type


interface AuthState {
    user: User | null;
    // Replace isAuthenticated with a more descriptive status
    authStatus: 'loading' | 'authenticated' | 'unauthenticated';
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    authStatus: 'loading', // Start in a 'loading' state
    setUser: (user) => {
        if (user) {
            set({ user, authStatus: 'authenticated' });
        } else {
            set({ user: null, authStatus: 'unauthenticated' });
        }
    },
}));