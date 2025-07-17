"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Trash2, MapPin } from 'lucide-react';
import { Floor } from '@/types'; // Ensure this import matches your types file

export default function ManageFloorsPage() {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [loading, setLoading] = useState(true);
    const [newFloorName, setNewFloorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const fetchFloors = useCallback(async () => {

        try {
            const res = await fetch('/api/floors', { credentials: 'include' });
            if (!res.ok) throw new Error("Failed to fetch floors.");
            const data = await res.json();
            setFloors(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFloors(); }, [fetchFloors]);

    const handleAddFloor = async () => {
        if (!newFloorName.trim()) {
            toast.warning("لطفا نام طبقه را وارد کنید.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/floors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newFloorName }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Could not add floor.");

            toast.success(`طبقه '${newFloorName}' با موفقیت اضافه شد.`);
            setNewFloorName('');
            fetchFloors(); // Refresh the list
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFloor = async (floorId: number) => {
        if (!confirm("آیا از حذف این طبقه مطمئن هستید؟ این عمل قابل بازگشت نیست.")) return;

        // To provide instant feedback, we can optimistically remove the floor from the UI
        const originalFloors = [...floors];
        setFloors(currentFloors => currentFloors.filter(f => f.id !== floorId));

        try {
            const res = await fetch(`/api/floors/${floorId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error("Deletion failed on the server.");
            toast.success("طبقه با موفقیت حذف شد.");
        } catch (error) {
            toast.error("خطا در حذف طبقه. بازگردانی لیست.");
            setFloors(originalFloors); // If deletion fails, restore the original list
        }
    };


    return (
        <div style={{ direction: 'rtl' }}>
            <Card className="bg-white/5 backdrop-blur-lg border border-white/20 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2"><MapPin /> مدیریت طبقات</CardTitle>
                    <CardDescription className="text-white/60 pt-1">طبقاتی که سفارشات به آن‌ها ارسال می‌شود را در اینجا اضافه یا حذف کنید.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-6 pb-6 border-b border-white/10">
                        <Input
                            placeholder="نام طبقه جدید (مثال: طبقه دوم - واحد مالی)"
                            value={newFloorName}
                            onChange={(e) => setNewFloorName(e.target.value)}
                            className="bg-white/10 border-white/20 placeholder:text-white/40"
                        />
                        <Button onClick={handleAddFloor} disabled={isSubmitting} className="bg-[#E91227] hover:bg-red-700">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="ml-2 h-4 w-4" />}
                            افزودن
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">لیست طبقات موجود</h3>
                        {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> :
                            floors.length > 0 ? floors.map(floor => (
                                <div key={floor.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-transparent hover:border-white/20 transition-colors">
                                    <span className="font-semibold">{floor.name}</span>
                                    <Button size="icon" variant="ghost" className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteFloor(floor.id)}>
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            )) : <p className="text-white/60">هیچ طبقه‌ای ثبت نشده است.</p>
                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}