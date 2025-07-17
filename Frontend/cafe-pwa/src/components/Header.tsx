"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Shield, ShoppingCart, User as UserIcon, LogOut, LogIn, Coffee } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CafeLogo from './icons/CafeLogo'; // Assuming you have this component

export const Header = () => {
    const { cart } = useCartStore();
    const { user, setUser, authStatus } = useAuthStore();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            router.push('/');
        }
    };

    return (
        // The header uses your glass theme and is sticky
        <header
            className="sticky top-0 z-50 w-full bg-[#002561]"
            style={{ direction: 'ltr' }}
        >
            <div className="container mx-auto">
                <nav className="flex items-center justify-between h-18 px-4">

                    {/* LEFT SIDE: Logo */}
                    <Link href="/" className="text-2xl font-bold flex items-center gap-2">
                        {/* Responsive logo size */}
                        <CafeLogo className="w-32 md:w-40 h-auto text-white" />
                    </Link>

                    {/* RIGHT SIDE: Action Buttons */}
                    <div className="flex items-center gap-2">

                        {/* Cart Button */}
                        <Button asChild variant="ghost" className="relative h-12 px-4 rounded-full hover:bg-white/10 text-white font-semibold hover:text-white">
                            <Link href="/cart" aria-label="Shopping Cart">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-6 w-6" />
                                    {/* The text is hidden on the smallest screens to prevent crowding */}
                                    <span className="hidden sm:inline">سبد خرید</span>
                                    {totalItems > 0 && (
                                        <span className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#E91227] text-xs font-bold">
                                            {totalItems}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </Button>
                        {/* Conditional Auth Button */}
                        {authStatus === 'authenticated' && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/10 transition-colors">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-white/30 text-white font-bold hover:scale-110 transition-transform">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-[#001233]/90 backdrop-blur-xl border-white/20 text-white"
                                >
                                    <DropdownMenuLabel className="font-normal" style={{ direction: 'rtl' }}>
                                        <div className="flex flex-col space-y-1 p-1">
                                            <p className="text-sm font-medium leading-none mb-3">نام کاربری: {user.name}</p>
                                            <p className="text-xs leading-none text-white/70">شماره کارمندی: {user.employeeNumber}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/20" />

                                    {/* Admin and Barista Links */}
                                    {(user.role === 'admin' || user.role === 'barista') && (
                                        <>
                                            {user.role === 'admin' && (
                                                <DropdownMenuItem onClick={() => router.push('/admin')} className="focus:bg-white/10 cursor-pointer flex justify-between focus:text-white">
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    <span>پنل مدیریت</span>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => router.push('/barista')} className="focus:bg-white/10 cursor-pointer flex justify-between focus:text-white">
                                                <Coffee className="mr-2 h-4 w-4" />
                                                <span>پنل باریستا</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/20" />
                                        </>
                                    )}

                                    <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-white/10 cursor-pointer flex justify-between focus:text-white">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>پروفایل و سفارش‌ها</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer flex justify-between ">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>خروج</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild variant="default" className="bg-white/90 text-[#002561] hover:bg-white font-bold flex items-center px-2 py-1 text-xs sm:px-2 sm:py-1 sm:text-sm">
                                <Link href="/login" className="flex items-center">
                                    <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />ورود
                                </Link>
                            </Button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};