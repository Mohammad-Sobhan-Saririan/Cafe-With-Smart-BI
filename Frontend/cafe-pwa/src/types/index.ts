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

export type ReportDataRow = Record<string, string | number | null>;

// Represents the configuration for a Recharts graph
export interface ChartConfig {
    chartType: 'bar' | 'line' | 'pie';
    xAxisKey: string;
    dataKeys: string[];
    colors: string[];
    // THIS WAS THE MISSING PIECE: The data the chart will display
    data?: ReportDataRow[];
}

// Represents a saved report object from the database
export interface SavedReport {
    id: string;
    name: string;
    nl_query: string;
    sql_query: string;
    chart_config: string;
    conversation_history: string;
    createdAt: string;
}