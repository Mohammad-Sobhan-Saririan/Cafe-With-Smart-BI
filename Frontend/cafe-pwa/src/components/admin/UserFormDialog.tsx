"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { User } from '@/types';

interface UserFormDialogProps {
    user?: User | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

// A reusable style for our glass inputs
export const glassInputStyle = "bg-white/5 border-white/20 placeholder:text-white/40 focus-visible:ring-indigo-400 focus-visible:ring-offset-0 focus-visible:ring-offset-[#001233]";

export const UserFormDialog = ({ user, isOpen, onClose, onUpdate }: UserFormDialogProps) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = !!user?.id;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData(user);
            } else {
                setFormData({ role: 'user', creditLimit: 1000000, creditBalance: 1000000, name: '', email: '', employeeNumber: '' });
            }
        }
    }, [user, isOpen, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleRoleChange = (value: User['role']) => setFormData(prev => ({ ...prev, role: value }));

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const url = isEditMode ? `http://localhost:5001/api/admin/users/${user.id}` : 'http://localhost:5001/api/admin/users';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(`${url}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            // First, check if the request failed.
            if (!res.ok) {
                // If it failed, try to get the error message from the backend's JSON response.
                const errorData = await res.json();
                // Then, throw an error with that message to be caught by the 'catch' block.
                throw new Error(errorData.message || 'An unknown error occurred.');
            }

            // This part only runs if the request was successful.
            const successData = await res.json();
            toast.success(successData.message);
            onUpdate();
            onClose();

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("خطایی رخ داده است!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="bg-[#001233]/80 backdrop-blur-xl border-white/20 text-white 
                           [&>button]:left-4 [&>button]:top-4 [&>button]:right-auto [&>button]:text-white/70 [&>button:hover]:text-white"
                style={{ direction: 'rtl' }}
            >
                <div className="flex justify-between items-start mb-4" >
                    <DialogHeader className="text-right" style={{ textAlign: 'right' }}>
                        <DialogTitle>{isEditMode ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}</DialogTitle>
                        <DialogDescription className="text-white/60">
                            {isEditMode ? `در حال ویرایش اطلاعات برای ${user?.name}` : "اطلاعات کاربر جدید را وارد کنید."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right text-white/80">نام</Label><Input id="name" value={formData.name || ''} onChange={handleChange} className={`col-span-3 ${glassInputStyle}`} /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right text-white/80">ایمیل</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleChange} className={`col-span-3 ${glassInputStyle}`} /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right text-white/80">شماره پرسنلی</Label><Input id="employeeNumber" value={formData.employeeNumber || ''} onChange={handleChange} className={`col-span-3 ${glassInputStyle}`} /></div>
                    {!isEditMode && (
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right text-white/80">رمز عبور</Label><Input id="password" type="password" placeholder="رمز عبور اولیه را وارد کنید" onChange={handleChange} className={`col-span-3 ${glassInputStyle}`} /></div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right text-white/80">نقش</Label>
                        <Select value={formData.role} onValueChange={handleRoleChange}>
                            <SelectTrigger className={`col-span-3 ${glassInputStyle}`}><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="user">کاربر عادی</SelectItem><SelectItem value="barista">باریستا</SelectItem><SelectItem value="admin">ادمین</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right text-white/80">سقف اعتبار</Label><Input id="creditLimit" type="number" value={formData.creditLimit || 0} onChange={handleChange} className={`col-span-3 ${glassInputStyle}`} /></div>
                </div>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" className="bg-transparent hover:bg-white/10">انصراف</Button></DialogClose>
                    <div className="flex items-center gap-2">
                        {/* {isLoading && <Player autoplay loop src="/animations/loading-spinner.json" style={{ height: '40px', width: '40px' }} />} */}
                        <Button onClick={handleSubmit} disabled={isLoading} className="bg-[#E91227] text-white hover:bg-red-700">
                            {isEditMode ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};