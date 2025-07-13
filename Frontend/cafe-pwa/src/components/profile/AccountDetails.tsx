"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, Edit, KeyRound } from "lucide-react";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChangePasswordDialog } from './ChangePasswordDialog'; // Import the new dialog

const glassInputStyle = "bg-white/5 border-white/10 read-only:border-transparent read-only:bg-transparent read-only:p-0 read-only:h-auto read-only:cursor-default focus-visible:ring-indigo-400";

export const AccountDetails = () => {
    const { user, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(user);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false); // State to control the dialog
    // const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { setFormData(user); }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => prev ? { ...prev, [e.target.id]: e.target.value } : null);
    };

    const handleSaveChanges = async () => {
        // setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/users/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUser(data.user);
            toast.success("پروفایل با موفقیت بروز شد!");
            setIsEditing(false);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("خطایی رخ داده است!");
            }
        } finally {
            // setIsLoading(false);
        }
    };


    if (!user) return null;

    return (
        <>
            <Card className={cn(
                "bg-white/5 backdrop-blur-lg border border-white/20 text-white transition-all duration-300",
                isEditing && "ring-2 ring-indigo-500 border-indigo-500/50" // Visual cue for edit mode
            )}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">اطلاعات حساب</CardTitle>
                            <CardDescription className="text-white/60 pt-1">
                                {isEditing ? "اطلاعات خود را در زیر ویرایش کنید." : "اطلاعات شخصی شما."}
                            </CardDescription>
                        </div>
                        {!isEditing ? (
                            <Button variant="outline" className="bg-white/10 hover:bg-white/20" onClick={() => setIsEditing(true)}>
                                <Edit className="ml-2 h-4 w-4" /> ویرایش
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData(user); }}><X className="ml-2 h-4 w-4" /> انصراف</Button>
                                <Button onClick={handleSaveChanges} className="bg-[#E91227] hover:bg-red-700"><Save className="ml-2 h-4 w-4" /> ذخیره</Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="border-t border-white/10 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2 border border-white/40 p-3 rounded-lg ">
                            <Label className="text-white/80">نام کامل</Label>
                            <Input
                                id="name"
                                value={formData?.name || ''}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={cn(glassInputStyle, "border border-white/20 focus-visible:ring-indigo-400")}
                            />
                        </div>
                        <div className="space-y-2 border border-white/40 p-3 rounded-lg ">
                            <Label className="text-white/80">شماره تماس</Label>
                            <Input
                                id="phone"
                                value={formData?.phone || ''}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={cn(glassInputStyle, "border border-white/20 focus-visible:ring-indigo-400")}
                            />
                        </div>
                        <div className="space-y-2 border border-white/40 p-3 rounded-lg ">
                            <Label className="text-white/80">ایمیل</Label>
                            <Input
                                id="email"
                                value={formData?.email || ''}
                                readOnly
                                className={`${glassInputStyle} opacity-60 cursor-not-allowed`}
                            />
                        </div>
                        <div className="space-y-2 border border-white/40 p-3 rounded-lg ">
                            <Label className="text-white/80">موقعیت شغلی</Label>
                            <Input
                                id="position"
                                value={formData?.position || ''}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={cn(glassInputStyle, "border border-white/20 focus-visible:ring-indigo-400")}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-white/10 pt-4 flex justify-end">
                    <Button variant="secondary" onClick={() => setIsPasswordDialogOpen(true)}>
                        <KeyRound className="ml-2 h-4 w-4" /> تغییر رمز عبور
                    </Button>
                </CardFooter>
            </Card>

            {/* The password dialog is now completely separate and only appears when needed */}
            <ChangePasswordDialog
                isOpen={isPasswordDialogOpen}
                onClose={() => setIsPasswordDialogOpen(false)}
            />
        </>
    );
};