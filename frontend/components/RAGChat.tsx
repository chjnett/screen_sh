"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, X, Paperclip } from "lucide-react";

export default function RAGChat() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("image/")) {
                setSelectedImage(file);
            } else {
                alert("이미지 파일만 업로드 가능합니다.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() && !selectedImage) return;

        const userMsg = query;
        // If image is selected, add a special message or handling (placeholder logic)
        setMessages(prev => [...prev, {
            role: 'user',
            content: userMsg + (selectedImage ? ` [이미지: ${selectedImage.name}]` : "")
        }]);

        setQuery("");
        setSelectedImage(null);
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
        <div
            className="w-full max-w-2xl mx-auto bg-[#1c1d20] rounded-3xl shadow-2xl min-h-[600px] flex flex-col border border-gray-800 overflow-hidden relative"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[#3182f6]/90 flex flex-col items-center justify-center text-white backdrop-blur-sm"
                    >
                        <div className="p-4 bg-white/20 rounded-full mb-4">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">이미지를 여기에 놓으세요</h3>
                        <p className="text-white/80 mt-2">포트폴리오 스크린샷 분석</p>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <div className="relative flex-1">
                        {/* Image Preview */}
                        {selectedImage && (
                            <div className="absolute bottom-full mb-3 left-0 w-full bg-[#2c2d30] border border-gray-700 rounded-xl p-3 flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <Upload size={16} className="text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-white max-w-[150px] truncate">{selectedImage.name}</span>
                                        <span className="text-[10px] text-gray-400">{(selectedImage.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1.5 hover:bg-gray-600 rounded-full text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={selectedImage ? "이미지에 대해 질문하세요..." : "메시지를 입력하세요 (또는 이미지를 드래그)"}
                            className={`w-full bg-[#101113] border border-gray-700 text-white px-5 py-4 pl-12 pr-12 rounded-2xl focus:outline-none focus:border-[#3182f6] focus:ring-1 focus:ring-[#3182f6] transition-all placeholder:text-gray-600 ${selectedImage ? 'rounded-t-none border-t-0' : ''}`}
                        />

                        {/* Paperclip Button */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="image-upload-input"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setSelectedImage(e.target.files[0]);
                                    }
                                }}
                            />
                            <label
                                htmlFor="image-upload-input"
                                className="p-2 text-gray-400 hover:text-white cursor-pointer transition-colors block rounded-full hover:bg-white/5"
                            >
                                <Paperclip size={20} />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (!query.trim() && !selectedImage)}
                        className="p-4 bg-[#3182f6] hover:bg-blue-600 text-white rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-[#3182f6] shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}
