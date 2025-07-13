"use client";

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface Widget {
    id: string;
    reportName: string;
    chartType: 'bar' | 'line' | 'pie';
    chartConfig: {
        data: Array<{ name: string; value: number }>;
    };
}

const COLORS = ['#E91227', '#002561', '#FFBB28', '#FF8042'];

export const ChartWidget = ({ widget }: { widget: Widget }) => {
    const renderChart = () => {
        if (widget.chartType === 'bar') {
            return (
                <BarChart data={widget.chartConfig.data}>
                    <XAxis dataKey="name" stroke="#FFFFFF" />
                    <YAxis stroke="#FFFFFF" />
                    <Tooltip contentStyle={{ backgroundColor: '#001233', border: '1px solid rgba(255,255,255,0.2)' }} />
                    <Legend />
                    <Bar dataKey="value" fill="#E91227" />
                </BarChart>
            );
        }

        if (widget.chartType === 'pie') {
            return (
                <PieChart>
                    <Pie
                        data={widget.chartConfig.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {widget.chartConfig.data.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#001233', border: '1px solid rgba(255,255,255,0.2)' }} />
                    <Legend />
                </PieChart>
            );
        }

        return <div>No chart available</div>;
    };

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="font-semibold mb-4 text-center">{widget.reportName}</h3>
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};
