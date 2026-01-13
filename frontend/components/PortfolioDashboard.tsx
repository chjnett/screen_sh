"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface PortfolioItem {
    symbol: string;
    name: string;
    quantity: number;
    avg_price: number;
    current_price: number;
    sector: string;
}

interface PortfolioData {
    items: PortfolioItem[];
    total_value: number;
    risk_assessment: string;
}

export default function PortfolioDashboard() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/portfolio`);
            if (res.ok) {
                const json = await res.json();
                if (json.items && json.items.length > 0) {
                    setData(json);
                }
            }
        } catch (error) {
            console.error("Failed to fetch portfolio", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null; // Or skeleton
    if (!data) return null; // No portfolio yet

    // Prepare chart data
    const chartData = data.items.map(item => ({
        name: item.symbol,
        value: item.quantity * (item.current_price || item.avg_price)
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto mt-12 mb-12"
        >
            <div className="bg-[#1c1d20] rounded-3xl border border-gray-800 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-[#3182f6]" />
                            나의 포트폴리오
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">실시간 자산 현황 (yfinance 연동)</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                            ${data.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-sm text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded inline-block mt-1">
                            자산 분석 완료
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Chart */}
                    <div className="h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#2c2d30', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <span className="text-gray-400 text-xs">Total</span>
                            <div className="text-white font-bold">{data.items.length} 종목</div>
                        </div>
                    </div>

                    {/* Right: List */}
                    <div className="space-y-3 overflow-y-auto max-h-[300px] scrollbar-hide pr-2">
                        {data.items.map((item, idx) => {
                            const marketValue = item.quantity * (item.current_price || item.avg_price);
                            const pl = (item.current_price && item.avg_price)
                                ? ((item.current_price - item.avg_price) / item.avg_price) * 100
                                : 0;
                            const isPositive = pl >= 0;

                            return (
                                <div key={idx} className="flex items-center justify-between p-4 bg-[#2c2d30]/50 rounded-xl hover:bg-[#2c2d30] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-xs">
                                            {item.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{item.symbol}</div>
                                            <div className="text-xs text-gray-400">{item.quantity}주 • 평단 ${item.avg_price}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-white">${item.current_price?.toLocaleString() || '-'}</div>
                                        <div className={`text-xs font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                            {pl.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Review */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <h3 className="text-sm font-bold text-gray-400 mb-2">AI 투자 인사이트</h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm leading-relaxed">
                        {data.risk_assessment || "포트폴리오가 안정적으로 구성되어 있습니다."}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
