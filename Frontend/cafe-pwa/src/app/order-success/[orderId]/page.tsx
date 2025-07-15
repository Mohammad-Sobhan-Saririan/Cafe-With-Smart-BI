"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, User, Calendar } from 'lucide-react';
import { Player } from '@lottiefiles/react-lottie-player';
import { toast } from 'sonner';

// Define types for our data
interface OrderItem { id: string; name: string; quantity: number; price: number; }
interface Order {
    id: string; items: string; totalAmount: number; createdAt: string; userName: string | null;
}

// --- We create small helper components for a cleaner main component ---

const ReceiptHeader = ({ orderId }: { orderId: string }) => (
    <div className="flex justify-between items-start">
        <div>
            <h2 className="text-xl sm:text-2xl font-bold">فاکتور سفارش</h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1" >
                شماره سفارش: <span className="font-mono" style={{
                    unicodeBidi: "plaintext",
                }}>{orderId}</span>
            </p>
        </div>
        <Package size={32} className="text-white/50 flex-shrink-0" />
    </div>
);

const ReceiptInfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null }) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm sm:text-base text-white/80">
        <span className="font-semibold flex items-center gap-2 mb-1 sm:mb-0">{icon}{label}</span>
        <span className="text-right">{value}</span>
    </div>
);

const ReceiptItemsList = ({ items }: { items: OrderItem[] }) => (
    <div className="space-y-3">
        <h3 className="font-semibold text-lg">اقلام سفارش</h3>
        {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
                <p style={{ direction: "ltr" }} ><span className="text-white/60 font-mono text-xs" >{item.quantity} x </span>{item.name} </p>
                <p className="font-mono">{item.price.toLocaleString()}</p>
            </div>
        ))}
    </div>
);

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) throw new Error('Could not find order details.');
                const data = await res.json();
                setOrder(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    toast.error("خطایی رخ داده است!");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
        );
    }

    if (error || !order) {
        return <div className="text-center text-red-400 mt-20">{error || "Order not found."}</div>;
    }

    const items: OrderItem[] = JSON.parse(order.items);
    const formattedDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(order.createdAt));

    return (
        // Main container with responsive padding
        <div className="container mx-auto max-w-2xl py-8 sm:py-12 px-4 text-white" style={{ direction: 'rtl', marginTop: '-14vh' }}>
            <div className="flex flex-col items-center text-center mt-10 sm:mt-0">
                {/* Lottie player with responsive size */}
                <Player
                    autoplay
                    // no loop
                    loop
                    style={{
                        animationDelay: '0.5s',
                    }}
                    src="/animations/successfully-done.json"
                    className="h-[200px] w-[200px] md:h-[250px] md:w-[250px]"
                />
                {/* Titles with responsive font sizes */}
                <h1 className="text-2xl md:text-4xl font-bold -mt-4 md:-mt-8">سفارش شما با موفقیت ثبت شد</h1>
                <p className="text-base md:text-lg text-white/70 mt-2">از خرید شما متشکریم! رسید شما در زیر آمده است.</p>
            </div>

            {/* The "Factor" or Receipt Card */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl mt-10 p-4 sm:p-8">
                <ReceiptHeader orderId={order.id} />
                <Separator className="my-4 sm:my-6 bg-white/20" />
                <div className="space-y-3">
                    <ReceiptInfoRow icon={<Calendar size={16} />} label="تاریخ ثبت" value={formattedDate} />
                    {order.userName && (
                        <ReceiptInfoRow icon={<User size={16} />} label="نام مشتری" value={order.userName} />
                    )}
                </div>
                <div className="border-t border-dashed border-white/20 my-4 sm:my-6"></div>
                <ReceiptItemsList items={items} />
                <Separator className="my-4 sm:my-6 bg-white/20" />
                <div className="flex justify-between text-xl sm:text-2xl font-bold">
                    <span>مبلغ نهایی:</span>
                    <span>{order.totalAmount.toLocaleString()} تومان</span>
                </div>
            </div>

            {/* Final action button */}
            <div className="text-center mt-8">
                <Button asChild size="lg" className="bg-[#E91227] text-white hover:bg-slate-200 font-bold">
                    <Link href="/">ثبت سفارش جدید</Link>
                </Button>
            </div>
        </div>
    );
}