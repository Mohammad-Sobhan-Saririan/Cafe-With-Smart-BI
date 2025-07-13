"use client";

import Image from 'next/image';
import { useCartStore, type CartItem as CartItemType } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemProps {
    item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
    const { increaseQuantity, decreaseQuantity, removeFromCart } = useCartStore();

    return (
        // The main container for each cart item
        <div className="flex items-center gap-3 md:gap-4 p-3 bg-white/5 border border-white/10 rounded-xl">

            {/* Image */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.imageUrl || '/default-coffee.jpg'} alt={item.name} fill className="object-cover" />
            </div>

            {/* Product Name and Price (takes up remaining space) */}
            <div className="flex-grow">
                {/* Text is smaller on mobile (text-base), larger on desktop (md:text-lg) */}
                <h3 className="font-semibold text-base md:text-lg text-white mb-3">{item.name}</h3>
                {/* Price is also smaller on mobile (text-sm), larger on desktop (md:text-base) */}
                <p className="text-white/70 text-sm md:text-base">{item.price.toLocaleString()} تومان</p>
            </div>

            {/* --- NEW Action Buttons Container --- */}
            {/* This container stacks the two button groups vertically */}
            <div className="flex flex-col items-center gap-2">

                {/* Quantity Selector */}
                <div className="flex items-center justify-center bg-white/10 border border-white/20 rounded-full">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 md:h-9 md:w-9 rounded-full"
                        onClick={() => increaseQuantity(item.id)}
                        disabled={item.quantity >= item.stock}
                    >
                        <Plus size={16} />
                    </Button>
                    <span className="text-base md:text-lg font-bold w-6 md:w-8 text-center">{item.quantity}</span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 md:h-9 md:w-9 rounded-full"
                        onClick={() => decreaseQuantity(item.id)}
                    >
                        <Minus size={16} />
                    </Button>
                </div>

                {/* Remove Button (now below the quantity selector) */}
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500/70 hover:text-red-500 h-6 px-2 text-xs"
                    onClick={() => removeFromCart(item.id)}
                >
                    حذف
                    <Trash2 size={14} className="ml-1" />
                </Button>
            </div>
        </div>
    );
};