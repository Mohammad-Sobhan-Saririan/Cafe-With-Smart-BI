"use client";

import Image from 'next/image';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import type { Product } from '@/app/page';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCartStore();

    const itemInCart = cart.find(item => item.id === product.id);
    const quantity = itemInCart ? itemInCart.quantity : 0;

    const isOutOfStock = product.stock === 0;
    // const isMaxOrderReached = quantity >= product.maxOrderPerUser;
    const isStockLimitReached = quantity >= product.stock;

    return (
        // The flex-direction changes based on screen size: row on mobile, column on medium screens up.
        <div className={cn(
            // flex direction and layout
            "bg-white/10 backdrop-blur-xl text-white p-2 md:p-4 border border-white/20 rounded-2xl overflow-hidden shadow-sm flex flex-row md:flex-col group ",
            isOutOfStock && "opacity-50"
        )}>

            {/* Image Container: Takes 1/3 width on mobile, full width on desktop */}
            <div className="relative w-1/3 md:w-full aspect-square md:mb-4 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow duration-300 flex-shrink-0">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => {
                            product.imageUrl = '';
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center bg-[#002561] h-full text-center border border-white rounded-xl">
                        <p className="text-gray-300 text-sm">تصویر موجود نیست</p>
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <p className="text-white font-bold text-lg bg-red-600 px-3 py-1 rounded-md">ناموجود</p>
                    </div>
                )}
            </div>

            {/* Content Container: Takes remaining width on mobile, full width on desktop */}
            <div className="p-2 md:p-4 flex flex-col flex-grow" style={{ direction: 'rtl' }}>
                <h3 className="text-lg md:text-xl font-semibold text-white truncate">{product.name}</h3>

                {product.stock > 0 && product.stock <= 10 && (
                    <p className="text-xs md:text-sm text-orange-400 font-semibold mt-1">
                        فقط {product.stock} عدد باقی مانده!
                    </p>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-auto pt-2">
                    <p className="text-base md:text-lg font-bold text-white mb-2 md:mb-0">
                        {product.price.toLocaleString()}
                        <span className="text-sm font-normal text-white/60"> تومان</span>
                    </p>

                    {/* Button logic remains the same, but will adapt to the new layout */}
                    {quantity === 0 ? (
                        <div className='flex justify-end w-full md:w-auto'>
                            <Button
                                onClick={() => addToCart(product)}
                                disabled={isOutOfStock}
                                className="bg-[#E91227] text-white rounded-full flex items-center justify-center gap-2 hover:bg-[#5c0009] transition-colors w-12 md:w-auto"
                            >
                                <span className="hidden sm:inline">افزودن</span>
                                <ShoppingCart size={20} />
                            </Button>
                        </div>

                    ) : (
                        <div className="flex items-center gap-1 justify-end w-full md:w-auto">
                            <Button size="icon" onClick={() => decreaseQuantity(product.id)} className="bg-[#E91227] rounded-md hover:bg-[#5c0009] transition-colors h-6 w-6 md:h-7 md:w-7">
                                <Minus size={12} className="md:size-5" />
                            </Button>
                            <span className="text-md md:text-lg font-bold w-6 text-center">{quantity}</span>
                            <Button size="icon" onClick={() => increaseQuantity(product.id)} disabled={isStockLimitReached} className="bg-[#E91227] rounded-md hover:bg-[#5c0009] transition-colors h-6 w-6 md:h-7 md:w-7">
                                <Plus size={12} className="md:size-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};