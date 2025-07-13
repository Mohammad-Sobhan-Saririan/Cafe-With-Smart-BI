"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, History, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OrderHistory } from '@/components/OrderHistory';
import { AccountDetails } from '@/components/profile/AccountDetails';

export default function ProfilePage() {
    const [activeView, setActiveView] = useState<'history' | 'details'>('history');
    const { authStatus, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/login');
        }
    }, [authStatus, router]);

    if (authStatus === 'loading' || !user) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 text-white" style={{ direction: 'rtl' }}>
            <h1 className="text-3xl md:text-4xl font-bold my-6">
                خوش آمدید، {user?.name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                {/* The new, glassy sidebar */}
                <aside className="md:col-span-1  top-24">
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 p-4">
                        <nav className="flex flex-col space-y-2">
                            <Button
                                variant={activeView === 'history' ? 'secondary' : 'ghost'}
                                onClick={() => setActiveView('history')}
                                className={`justify-start text-base p-6 text-white hover:text-white ${activeView === 'history' ? "bg-[#E91227] hover:bg-red-700" : "hover:bg-white/10"
                                    }`}
                            >
                                <History className="ml-2 h-5 w-5" />
                                تاریخچه سفارشات
                            </Button>
                            <Button
                                variant={activeView === 'details' ? 'secondary' : 'ghost'}
                                onClick={() => setActiveView('details')}
                                className={`justify-start text-base p-6 text-white hover:text-white ${activeView === 'details' ? "bg-[#E91227] hover:bg-red-700" : "hover:bg-white/10"
                                    }`}
                            >
                                <User className="ml-2 h-5 w-5" />
                                اطلاعات حساب
                            </Button>
                        </nav>
                    </Card>
                </aside>

                <main className="w-full grid grid-cols-1 md:col-span-3">

                    {activeView === 'history' ? <OrderHistory /> : <AccountDetails />}
                </main>
            </div>
        </div>
    );
}