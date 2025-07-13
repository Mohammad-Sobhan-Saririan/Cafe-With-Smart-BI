"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/components/CartItem';
import { EmptyCart } from '@/components/EmptyCart';
import { PlacingOrderOverlay } from '@/components/PlacingOrderOverlay'; // Ensure this is the correct import
import { toast } from 'sonner';
// import icon for resume order from lucide-react
import { Loader2, ShoppingCart } from 'lucide-react';



export default function CartPage() {
    const { user } = useAuthStore();
    const { cart, clearCart } = useCartStore();
    const router = useRouter();
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    if (cart.length === 0 && !isPlacingOrder) {
        return <EmptyCart />;
    }

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // --- This is the new, corrected function ---
    const handleCreateOrder = async () => {
        setIsPlacingOrder(true); // 1. Show the overlay immediately

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    items: cart,
                    totalAmount: total,
                    employeeNumber: employeeNumber || user?.employeeNumber
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'مشکلی در ثبت سفارش بوجود آمده است.');
            }

            const { order } = await res.json();

            // On success:
            toast.success(`سفارش #${order.id} با موفقیت ثبت شد!`);
            clearCart();

            // Wait 2 seconds so the user can see the success message, then redirect.
            setTimeout(function () {
                router.push(`/order-success/${order.id}`);
            }, 2000); // 2 seconds

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
                setIsPlacingOrder(false);
            } else {
                toast.error("خطایی رخ داده است!");
            }
        }

    };

    return (
        <>
            {/* This will now render correctly every time */}
            {isPlacingOrder && <PlacingOrderOverlay />}

            <div className="container mx-auto p-4 sm:p-6">
                <h1 className="text-4xl font-bold text-white my-6">سبد خرید شما</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Column 1: Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Column 2: Order Summary */}
                    <div className="lg:col-span-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 sticky top-24 text-white text-sm sm:text-base">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">خلاصه سفارش</h2>

                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between text-base sm:text-lg">
                                <span className="text-white/70">جمع کل</span>
                                <span className="font-bold">{total.toLocaleString()} تومان</span>
                            </div>

                            {/* Optional Credit Display */}
                            {user && (
                                <div className="flex justify-between text-white/70 text-sm sm:text-base">
                                    <span>اعتبار شما</span>
                                    <span className="font-medium">{user.creditBalance.toLocaleString()} تومان</span>
                                </div>
                            )}
                        </div>

                        <Separator className="my-4 sm:my-6 bg-white/20" />
                        {/* Employee Number Section */}
                        <div className="space-y-2">
                            <Label htmlFor="employeeNumber" className="text-white/80 text-sm sm:text-base">شماره پرسنلی (اختیاری)</Label>
                            <Input
                                id="employeeNumber"
                                placeholder="برای ثبت سفارش در پروفایل خود وارد کنید"
                                value={employeeNumber || user?.employeeNumber}
                                disabled={user?.employeeNumber.length != 0}
                                onChange={(e) => setEmployeeNumber(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white text-sm sm:text-base"
                            />
                        </div>

                        <Button
                            onClick={handleCreateOrder}
                            disabled={isPlacingOrder}
                            size="lg"
                            className="w-full mt-4 sm:mt-6 text-sm sm:text-lg bg-[#E91227] text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {isPlacingOrder ? <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : 'تایید و ثبت نهایی سفارش'}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full mt-2 sm:mt-4 text-sm sm:text-base text-white border-white/20 hover:bg-white/10 flex items-center justify-center gap-2"
                            onClick={() => router.push('/')}
                        >
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                            ادامه خرید
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}