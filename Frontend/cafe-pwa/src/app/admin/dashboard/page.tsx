"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { toast } from "sonner";
// We will create this component in the next step
import { ChartWidget } from "@/components/admin/reporting/ChartWidget";

// Tell react-grid-layout where to find its CSS files
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define the types for our dashboard items
interface LayoutItem {
    i: string; x: number; y: number; w: number; h: number;
}
interface Widget {
    id: string;
    reportName: string;
    chartType: 'bar' | 'line' | 'pie';
    // This 'config' would come from your backend API
    chartConfig: {
        data: { name: string; value: number }[];
    };
}

export default function DashboardPage() {
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);

    // In a real app, you would fetch this data from your backend
    useEffect(() => {
        // --- MOCK DATA FOR DEMONSTRATION ---
        const savedWidgets: Widget[] = [
            { id: '1', reportName: 'سفارشات روزانه', chartType: 'bar', chartConfig: { data: [{ name: 'بار گرم', value: 40 }, { name: 'بار سرد', value: 60 }] } },
            { id: '2', reportName: 'اعتبار کاربران', chartType: 'pie', chartConfig: { data: [{ name: 'مصرف شده', value: 75 }, { name: 'باقیمانده', value: 25 }] } },
        ];
        const savedLayout: LayoutItem[] = [
            { i: '1', x: 0, y: 0, w: 6, h: 4 },
            { i: '2', x: 6, y: 0, w: 6, h: 4 },
        ];
        setWidgets(savedWidgets);
        setLayout(savedLayout);
        // --- END MOCK DATA ---
    }, []);

    const handleLayoutChange = (newLayout: LayoutItem[]) => {
        setLayout(newLayout);
        // In a real app, you would save this newLayout to your backend here
        // e.g., fetch('/api/dashboard/layout', { method: 'POST', body: JSON.stringify(newLayout) });
        toast.info("Layout updated! (In a real app, this would be saved)");
    };

    return (
        <div className="text-white" style={{ direction: 'rtl' }}>
            <h2 className="text-2xl font-bold mb-4">داشبورد گزارشات</h2>
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                onLayoutChange={handleLayoutChange}
            >
                {widgets.map(widget => (
                    <div key={widget.id} className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4 overflow-hidden">
                        <ChartWidget widget={widget} />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}