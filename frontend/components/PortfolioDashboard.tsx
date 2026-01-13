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
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

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
                    // Trigger AI Analysis
                    if (json.items.length > 0) {
                        fetchAIInsight();
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch portfolio", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAIInsight = async () => {
        setAiLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/portfolio/ai-insight`, {
                method: 'POST',
            });
            if (res.ok) {
                const json = await res.json();
                setAiInsight(json.insight);
            }
        } catch (error) {
            console.error("Failed to fetch AI insight", error);
        } finally {
            setAiLoading(false);
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left: Chart */}
                    <div className="h-[320px] relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    paddingAngle={3}
                                    dataKey="value"
                                    animationDuration={1500}
                                    animationBegin={200}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="rgba(0,0,0,0.2)"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(28, 29, 32, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '4px' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none z-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Total Assets</span>
                                <div className="text-white font-bold text-xl drop-shadow-lg">
                                    ${data.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right: List */}
                    <div className="space-y-3 overflow-y-auto max-h-[320px] scrollbar-hide pr-2">
                        {data.items.map((item, idx) => {
                            const marketValue = item.quantity * (item.current_price || item.avg_price);
                            const pl = (item.current_price && item.avg_price)
                                ? ((item.current_price - item.avg_price) / item.avg_price) * 100
                                : 0;
                            const isPositive = pl >= 0;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group flex items-center justify-between p-4 bg-[#2c2d30]/30 rounded-xl hover:bg-[#2c2d30] border border-transparent hover:border-gray-700/50 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg ${isPositive ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30' : 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30'}`}>
                                            {item.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.symbol}</div>
                                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{item.quantity}주 • 평단 ${item.avg_price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-white">${(item.current_price || 0).toLocaleString()}</div>
                                        <div className={`text-xs font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-red-400' : 'text-blue-400'}`}>
                                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                            {Math.abs(pl).toFixed(2)}%
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Review */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                        <span>🤖 AI 장기 투자 분석</span>
                        {aiLoading && <span className="text-xs text-blue-500 animate-pulse">분석 중...</span>}
                    </h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {aiInsight ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {aiInsight}
                            </motion.div>
                        ) : (
                            <span className="text-gray-500 text-xs">포트폴리오 로드 후 AI가 정밀 분석을 시작합니다...</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
