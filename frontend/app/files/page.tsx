"use client";

import { UploadCloud } from "lucide-react";

export default function FilesPage() {
    return (
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-6">파일 보관함</h1>

            <div className="flex-1 bg-[#1a1b1e] rounded-2xl border-2 border-dashed border-[#2a2b2e] flex flex-col items-center justify-center group hover:border-[#3182f6] transition-colors cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-[#2a2b2e] flex items-center justify-center mb-6 group-hover:bg-[#3182f6] transition-colors duration-300">
                    <UploadCloud size={40} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">파일을 이곳에 드래그하세요</h3>
                <p className="text-gray-400">또는 클릭하여 파일을 선택하세요</p>
            </div>
        </div>
    );
}
