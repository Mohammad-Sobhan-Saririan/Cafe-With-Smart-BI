"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';

export const NotificationListener = () => {
    // We get the functions from the store, but not the state, to prevent re-renders
    const { authStatus } = useAuthStore();
    const removeItem = useCartStore((state) => state.removeItem);
    const cartRef = useRef(useCartStore.getState().cart); // Use a ref to get the latest cart state inside the listener

    // Update the ref whenever the cart changes
    useEffect(() => {
        useCartStore.subscribe(
            (state) => (cartRef.current = state.cart)
        );
    }, []);

    useEffect(() => {
        if (authStatus !== 'authenticated') {
            return;
        }

        // The EventSource API is built into modern browsers
        const eventSource = new EventSource('/api/events', {
            withCredentials: true,
        });

        eventSource.onopen = () => {
            console.log("SSE connection established.");
        };

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'ORDER_UPDATE') {
                toast.info(`وضعیت سفارش شما بروز شد: ${data.status}`);
            }

            if (data.type === 'STOCK_DEPLETED') {
                // Use the ref to get the most up-to-date cart
                const itemInCart = cartRef.current.find(item => item.id === data.productId);
                if (itemInCart) {
                    removeItem(data.productId);
                    toast.warning(`'${data.productName}' دیگر موجود نیست و از سبد شما حذف شد.`);
                }
            }
        };

        eventSource.onerror = () => {
            // DO NOT close the connection here. The browser will handle reconnection automatically.
            console.error('SSE connection error. The browser will attempt to reconnect.');
        };

        // This cleanup function is still important
        return () => {
            eventSource.close();
            console.log("SSE connection closed.");
        };
    }, [authStatus, removeItem]); // The dependency array is now cleaner and more stable

    return null; // This component doesn't render any UI
};