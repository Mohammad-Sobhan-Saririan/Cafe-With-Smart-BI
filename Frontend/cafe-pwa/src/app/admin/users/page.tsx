"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFormDialog } from "@/components/admin/UserFormDialog"; // Import the renamed dialog
import { useDebounce } from "@/hooks/useDebounce";
import type { User } from "@/types"; // 1. Import the shared User type
import { Loader2 } from "lucide-react";



export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            // Add the search term to the API call
            const url = `/api/admin/users?search=${debouncedSearchTerm}`;
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    const handleAddUser = () => {
        setSelectedUser(null); // Setting user to null means we are in "create" mode
        setIsDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    return (
        <>
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 text-white" style={{ direction: 'rtl' }}>
                <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <CardTitle className="text-2xl font-bold">مدیریت کاربران</CardTitle>
                    <div className="flex flex-row-reverse items-center gap-2 w-full md:w-auto">
                        <Input
                            placeholder="جستجو بر اساس نام یا شماره کارمندی..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Button onClick={handleAddUser} className="bg-[#E91227] hover:bg-red-700">
                            {/* <PlusCircle className="ml-2 h-4 w-4" /> */}
                            افزودن کاربر جدید
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-white/10">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-white/10 hover:bg-transparent">
                                    <TableHead className="text-right text-white">نام</TableHead>
                                    <TableHead className="text-right text-white">شماره کارمندی</TableHead>
                                    <TableHead className="text-right text-white">نقش</TableHead>
                                    <TableHead className="text-right text-white">اعتبار باقیمانده</TableHead>
                                    <TableHead className="text-right text-white">اقدامات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium text-right">{user.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-right">{user.employeeNumber}</TableCell>
                                            <TableCell className="text-right">{user.role}</TableCell>
                                            <TableCell className="text-right font-mono">{user.creditBalance.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button className="bg-[#E91227] hover:bg-red-700 hover:text-white" variant="ghost" size="sm" onClick={() => handleEditUser(user)}>ویرایش</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <UserFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                user={selectedUser}
                onUpdate={() => {
                    fetchUsers();
                    setIsDialogOpen(false);
                }}
            />
        </>
    );
}