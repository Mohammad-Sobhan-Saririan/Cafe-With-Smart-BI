"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';

export const NotificationListener = () => {
    const { authStatus } = useAuthStore();
    const { cart, removeItem } = useCartStore();
    useEffect(() => {
        // Only try to connect if the user is authenticated
        if (authStatus === 'authenticated') {
            // The EventSource API is built into modern browsers
            const eventSource = new EventSource('/api/events', {
                withCredentials: true, // This is crucial to send the auth cookie
            });

            // Listen for messages from the server
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Check for our custom order update event
                if (data.type === 'ORDER_UPDATE') {
                    toast.info(`Your order status has been updated to: ${data.status}`);
                }
                if (data.type === 'STOCK_DEPLETED') {
                    // Check if the depleted item is in the user's current cart
                    const itemInCart = cart.find(item => item.id === data.productId);
                    if (itemInCart) {
                        // If it is, remove it from the cart
                        removeItem(data.productId);
                        // And notify the user
                        toast.warning(`'${data.productName}' just went out of stock and was removed from your cart.`);
                    }
                }
            };

            // Handle connection errors
            eventSource.onerror = (err) => {
                console.error('EventSource failed:', err);
                eventSource.close();
            };

            // This cleanup function is called when the component unmounts
            return () => {
                eventSource.close();
            };
        }
    }, [authStatus, cart, removeItem]); // Rerun this effect when authentication status changes

    return null; // This component doesn't render any UI
};