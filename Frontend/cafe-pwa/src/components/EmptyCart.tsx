"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Player } from "@lottiefiles/react-lottie-player";

export const EmptyCart = () => {
    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col items-center justify-center text-center h-[80vh] text-white">
                <Player
                    autoplay
                    loop
                    // Change the src from the http://... URL to the local path
                    src="/animations/empty-cart.json"
                    style={{ height: '300px', width: '300px' }}
                />
                {/* space for the animation to load */}
                <div className="h-8"></div>

                <h2 className="text-2xl sm:text-3xl font-bold -mt-8">سبد خرید شما خالی است</h2>
                <p className="text-white/60 mt-2 max-w-sm text-sm sm:text-base">
                    به نظر می‌رسد هنوز چیزی به سبد خرید خود اضافه نکرده‌اید. به منو بروید و آیتم‌های مورد علاقه خود را انتخاب کنید.
                </p>
                <Button asChild size="lg" className="mt-8 bg-[#E91227] text-white hover:bg-red-700 font-bold">
                    <Link href="/">بازگشت به منو</Link>
                </Button>
            </div>
        </div >
    );
};