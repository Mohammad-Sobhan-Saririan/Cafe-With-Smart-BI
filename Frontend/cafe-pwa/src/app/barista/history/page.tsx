"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Archive } from "lucide-react";
import { OrderTicket } from "@/components/barista/OrderTicket";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";
import type { Order } from '@/types';

export default function BaristaHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPastOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/barista/history?page=${currentPage}`, { credentials: 'include' });
            if (!res.ok) throw new Error("Failed to fetch order history.");
            const data = await res.json();
            setOrders(data.orders || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch {
            toast.error("خطایی در بارگزاری تاریخچه سفارشات بوجود آمده است!");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => { fetchPastOrders(); }, [fetchPastOrders]);

    if (loading) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
    }

    return (
        <div style={{ direction: 'rtl' }}>
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-white mb-6">
                <Archive /> تاریخچه سفارشات
            </h2>
            {orders.length === 0 ? (
                <EmptyState title="تاریخچه خالی است" description="هنوز سفارشی تکمیل یا لغو نشده است." />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map(order => (
                            <OrderTicket status={order.status} key={order.id} order={order} onUpdate={fetchPastOrders} />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => p - 1)} isActive={currentPage > 1} /></PaginationItem>
                                    <PaginationItem><span className="p-2 font-medium text-white">صفحه {currentPage} از {totalPages}</span></PaginationItem>
                                    <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => p + 1)} isActive={currentPage < totalPages} /></PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}