export interface User {
    id: string;
    name: string;
    email: string;
    employeeNumber: string; // The required property
    role: 'admin' | 'barista' | 'user';
    city?: string;
    country?: string;
    phone?: string; // Optional for forms
    age?: number; // Optional for forms
    position?: string;
    creditLimit: number;
    creditBalance: number;
    password?: string; // Optional for forms
}

export interface Product {
    id?: string; name: string; price: number; category: string; description?: string; stock: number; isDisabled: boolean, imageUrl?: string;
}

export interface Order {
    id: string;
    items: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    createdAt: string;
    userName: string | null;
}