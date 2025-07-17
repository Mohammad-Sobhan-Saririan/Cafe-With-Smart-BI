"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import { getDistanceInMeters } from '@/lib/location'; // Import our new helper

// import icon for resume order from lucide-react
import { Loader2, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Floor } from '@/types'; // Ensure this import matches your types file
import { glassInputStyle } from '@/components/admin/UserFormDialog';


const ORGANIZATION_LAT = 35.798784201925315; // Example: Tehran
const ORGANIZATION_LON = 51.47636585505412

const ALLOWED_RADIUS_METERS = 500; // e.g., 500 meters

export default function CartPage() {
    const { user } = useAuthStore();
    const { cart, clearCart } = useCartStore();
    const router = useRouter();
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [selectedFloorId, setSelectedFloorId] = useState(user?.defaultFloorId || ''); // Default to user's preferred floor if available

    if (cart.length === 0 && !isPlacingOrder) {
        return <EmptyCart />;
    }
    useEffect(() => {
        // Fetch the list of available floors when the page loads
        const fetchFloors = async () => {
            const res = await fetch('http://localhost:5001/api/floors');
            const data = await res.json();
            setFloors(data);
            // If user is logged in and has a default floor, pre-select it
            if (user?.defaultFloorId) {
                setSelectedFloorId(user.defaultFloorId);
            }
        };
        fetchFloors();
    }, [user]);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // --- This is the new, corrected function ---
    const handleCreateOrder = async () => {
        setIsPlacingOrder(true); // 1. Show the overlay immediately

        try {
            const res = await fetch('http://localhost:5001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    items: cart,
                    totalAmount: total,
                    employeeNumber: employeeNumber || user?.employeeNumber || '',
                    deliveryFloorId: selectedFloorId // Send the selected floor
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'مشکلی در ثبت سفارش بوجود آمده است.');
            }
            const { order, CreditSystemEnabled } = await res.json();

            // On success:
            toast.success(`سفارش #${order.id} با موفقیت ثبت شد!`);
            clearCart();
            // update user credit balance if credit system is enabled
            if (CreditSystemEnabled && user) {
                const updatedUser = { ...user, creditBalance: user.creditBalance - total };
                useAuthStore.setState({ user: updatedUser }); // Update the global user state
            }

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

    const handleCheckout = async () => {
        setIsPlacingOrder(true); // Show overlay immediately

        // If user is logged in, they can order from anywhere.
        if (user) {
            await handleCreateOrder();
            return;
        }

        // If user is a GUEST, check their location first.
        if (!navigator.geolocation) {
            toast.error("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند. لطفا وارد شوید.");
            setIsPlacingOrder(false);
            return;
        }

        toast.info("برای ثبت سفارش مهمان، موقعیت مکانی شما بررسی می‌شود...");
        navigator.geolocation.getCurrentPosition(
            // Success Callback: User approved location access
            async (position) => {
                const distance = getDistanceInMeters(
                    position.coords.latitude, position.coords.longitude,
                    ORGANIZATION_LAT, ORGANIZATION_LON
                );

                if (distance <= ALLOWED_RADIUS_METERS) {
                    await handleCreateOrder(); // Location is valid, proceed with the order
                } else {
                    toast.error("شما خارج از محدوده سازمان هستید. برای ثبت سفارش لطفا وارد حساب کاربری خود شوید.");
                    setTimeout(() => router.push('/login'), 1000);
                    setIsPlacingOrder(false);
                }
            },
            // Error Callback: User denied location access
            () => {
                toast.error("دسترسی به موقعیت مکانی رد شد. شما به صفحه ورود منتقل می‌شوید.");
                // As you requested, redirect to login if permission is denied.
                setTimeout(() => router.push('/login'), 2000);
                setIsPlacingOrder(false);
            }
        );
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

                        <Separator className="my-2 sm:my-3 bg-white/20" />
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="floor" className="text-white/80 text-lg">طبقه تحویل</Label>
                            <Select value={selectedFloorId.toString()} onValueChange={setSelectedFloorId} dir="rtl">
                                <SelectTrigger className={glassInputStyle}><SelectValue placeholder="یک طبقه را انتخاب کنید..." /></SelectTrigger>
                                <SelectContent className='bg-white/5 backdrop-blur-lg border border-white/20 text-white'>
                                    {floors.map(floor => (
                                        <SelectItem key={floor.id} value={(floor.id.toString())}>{floor.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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
                            onClick={handleCheckout}
                            disabled={isPlacingOrder || !selectedFloorId}
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