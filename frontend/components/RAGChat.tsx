"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

export default function RAGChat() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = query;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setQuery("");
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/rag/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMsg }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', content: data.answer || "응답이 없습니다." }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: "AI 연결 중 오류가 발생했습니다." }]);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-[#1c1d20] rounded-3xl shadow-2xl min-h-[600px] flex flex-col border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-[#1c1d20]/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-sm text-gray-400 font-medium">LogMind 애널리스트</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4"
                        >
                            <p>소유한 종목이나 시장 동향에 대해 물어보세요.</p>
                            <div className="flex gap-2">
                                {["애플 분석해줘", "내 포트폴리오 리스크", "시장 전망 알려줘"].map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setQuery(tag)}
                                        className="px-3 py-1.5 bg-[#2c2d30] hover:bg-[#36373a] rounded-full text-xs text-gray-300 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] p-4 rounded-2xl shadow-sm leading-relaxed text-sm ${msg.role === 'user'
                                    ? 'bg-[#3182f6] text-white rounded-tr-sm'
                                    : 'bg-[#2c2d30] text-gray-100 rounded-tl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-[#2c2d30] p-4 rounded-2xl rounded-tl-sm flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-[#1c1d20] border-t border-gray-800">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="w-full bg-[#101113] border border-gray-700 text-white px-5 py-4 pl-5 pr-12 rounded-2xl focus:outline-none focus:border-[#3182f6] focus:ring-1 focus:ring-[#3182f6] transition-all placeholder:text-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="absolute right-2 p-2 bg-[#3182f6] hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-[#3182f6]"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
