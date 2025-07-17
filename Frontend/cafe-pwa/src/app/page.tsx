"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'; // Import new Hook
import { ScrollAwareNav } from '@/components/ScrollAwareNav'; // Import new Nav
import { toast } from 'sonner';

// 1. A cleaner Product interface to match our SQLite database
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'بار گرم' | 'بار سرد';
  imageUrl?: string;
  rating: number;
  maxOrderPerUser: number;
  stock: number;
}

// const HOT_BAR_CATEGORY = 'بار گرم';
// const COLD_BAR_CATEGORY = 'بار سرد';

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('http://localhost:5001/api/products', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

// 2. A more polished Skeleton component for the loading state
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="w-full h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    ))}
  </div>
);

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('hot-bar'); // State to track active category

  // Use our custom hook to watch the sections
  useIntersectionObserver(setActiveCategory, ['hot-bar', 'cold-bar']);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("خطایی رخ داده است!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hotBar = products.filter(p => p.category === 'بار گرم');
  const coldBar = products.filter(p => p.category === 'بار سرد');

  return (
    <div className="min-h-screen">
      {/* Render the new sticky navigation */}
      <ScrollAwareNav activeCategory={activeCategory} />

      <main className="container mx-auto p-4 sm:p-6"
        style={{ direction: 'rtl' }}>
        {/* Hot Bar Section */}
        <section id="hot-bar" className="mb-18 scroll-mt-54">
          <h2 className="text-3xl font-bold mb-6 text-white text-center lg:text-center">
            - بار گرم -
          </h2>
          {loading ? <ProductGridSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotBar.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>

        {/* Cold Bar Section */}
        <section id="cold-bar" className="mb-18 scroll-mt-54">
          <h2 className="text-3xl font-bold mb-6 text-white text-center lg:text-center">
            - بار سرد -
          </h2>
          {loading ? <ProductGridSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {coldBar.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}