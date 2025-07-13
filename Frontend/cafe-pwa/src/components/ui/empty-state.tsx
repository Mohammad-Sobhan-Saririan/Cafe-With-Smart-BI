"use client";

import { Player } from "@lottiefiles/react-lottie-player";

interface EmptyStateProps {
    title: string;
    description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
    return (
        <div className="text-center py-16 px-4 border-2 border-dashed border-white/20 rounded-lg">
            <div className="flex flex-col items-center text-center text-white">
                <Player
                    autoplay
                    loop
                    // A nice "all done" or "relaxing" animation
                    src="/animations/successfully-done.json"
                    style={{ height: '200px', width: '200px' }}
                />
                <h3 className="text-xl font-semibold -mt-4">{title}</h3>
                <p className="text-white/60 mt-2 max-w-sm">{description}</p>
            </div>
        </div >
    );
};