"use client";

import { Player } from "@lottiefiles/react-lottie-player";

export const PlacingOrderOverlay = () => {
    return (
        // This div creates the full-screen semi-transparent backdrop
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#002561]/90 backdrop-blur-sm"
            style={{ direction: 'rtl' }}>
            <div className="text-center">
                <Player
                    autoplay
                    loop
                    // Point this to your new local animation file
                    src="/animations/placing-order.json"
                    style={{ height: '50vh', width: '50vw' }}
                />
                <h2 className="text-2xl font-bold text-white -mt-4">
                    در حال ثبت سفارش شما...
                </h2>
                <p className="text-white/70">لطفا کمی صبر کنید.</p>
            </div>
        </div>
    );
};