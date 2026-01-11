export default function MemosPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-6">나의 메모</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#1a1b1e] rounded-2xl p-6 border border-[#2a2b2e] min-h-[200px] flex flex-col justify-between hover:border-[#3182f6] transition-colors cursor-pointer group">
                    <h3 className="text-xl font-semibold text-white group-hover:text-[#3182f6] transition-colors">새로운 메모</h3>
                    <div className="w-10 h-10 rounded-full bg-[#2a2b2e] flex items-center justify-center self-end group-hover:bg-[#3182f6] transition-colors">
                        <span className="text-2xl text-white">+</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

