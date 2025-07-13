"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ManageCreditsPage() {
    const [allUsersAmount, setAllUsersAmount] = useState('');
    const [groupAmount, setGroupAmount] = useState('');
    const [groupPosition, setGroupPosition] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (operation: 'set' | 'add', amount: string, filter?: object) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/credits/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ amount, operation, filter }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'An error occurred.');

            toast.success(data.message);
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
        <div>
            <h2 className="text-2xl font-semibold mb-4">Manage User Credits</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Card for updating ALL users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update All Users</CardTitle>
                        <CardDescription>Set or add credit for every user in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="all-users-amount">Amount</Label>
                        <Input
                            id="all-users-amount"
                            type="number"
                            placeholder="e.g., 1000000"
                            value={allUsersAmount}
                            onChange={(e) => setAllUsersAmount(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => handleUpdate('add', allUsersAmount)} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add to Balances
                        </Button>
                        <Button onClick={() => handleUpdate('set', allUsersAmount)} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set Balances
                        </Button>
                    </CardFooter>
                </Card>

                {/* Card for updating users by group */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update by Group</CardTitle>
                        <CardDescription>Set or add credit for all users with a specific position.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="group-position">Position</Label>
                            <Input
                                id="group-position"
                                placeholder="e.g., Developer"
                                value={groupPosition}
                                onChange={(e) => setGroupPosition(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="group-amount">Amount</Label>
                            <Input
                                id="group-amount"
                                type="number"
                                placeholder="e.g., 1500000"
                                value={groupAmount}
                                onChange={(e) => setGroupAmount(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => handleUpdate('add', groupAmount, { position: groupPosition })} disabled={isLoading || !groupPosition}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add to Group
                        </Button>
                        <Button onClick={() => handleUpdate('set', groupAmount, { position: groupPosition })} disabled={isLoading || !groupPosition}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set for Group
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}