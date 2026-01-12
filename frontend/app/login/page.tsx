"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: email,
                    password: password,
                }),
            });

            if (!res.ok) {
                throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.")
            }

            const data = await res.json()
            localStorage.setItem("token", data.access_token)
            router.push("/")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    }

    return (
        <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-sm"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* 로고 영역 */}
                <motion.div variants={itemVariants} className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-white">LogMind</h1>
                    <p className="text-gray-400 text-sm mt-2"> 투자 인사이트</p>
                </motion.div>

                {/* 탭 네비게이션 */}
                <motion.div variants={itemVariants} className="flex bg-[#1a1b1e] rounded-xl p-1 mb-8 border border-[#2a2b2e]">
                    <button
                        className="flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-[#3182f6] text-white shadow-lg"
                    >
                        로그인
                    </button>
                    <Link
                        href="/register"
                        className="flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-center text-gray-400 hover:text-white"
                    >
                        회원가입
                    </Link>
                </motion.div>

                {/* 폼 영역 */}
                <form onSubmit={handleSubmit}>
                    <motion.div className="space-y-4">
                        {/* 이메일 입력 */}
                        <motion.div variants={itemVariants}>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#1a1b1e] text-white placeholder:text-gray-500 pl-12 pr-4 py-4 rounded-xl border border-[#2a2b2e] focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all focus:border-transparent"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* 비밀번호 입력 */}
                        <motion.div variants={itemVariants}>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1a1b1e] text-white placeholder:text-gray-500 pl-12 pr-12 py-4 rounded-xl border border-[#2a2b2e] focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>

                        {/* 로그인 시 추가 옵션 */}
                        <motion.div variants={itemVariants} className="flex justify-end">
                            <button type="button" className="text-sm text-gray-500 hover:text-[#3182f6] transition-colors">
                                비밀번호 찾기
                            </button>
                        </motion.div>

                        {/* 에러 메시지 */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-[#f04438] text-sm text-center bg-[#f04438]/10 p-3 rounded-lg border border-[#f04438]/20"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 제출 버튼 */}
                        <motion.div variants={itemVariants} className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#3182f6] hover:bg-[#2b72d7] text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-blue-900/20 shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>처리 중...</span>
                                    </>
                                ) : "로그인"}
                            </button>
                        </motion.div>

                        {/* 이용약관 */}
                        <motion.p variants={itemVariants} className="text-center text-xs text-gray-500 mt-8">
                            계속 진행하면 <span className="text-[#3182f6] cursor-pointer hover:underline">이용약관</span> 및{" "}
                            <span className="text-[#3182f6] cursor-pointer hover:underline">개인정보처리방침</span>에 동의하는 것으로
                            간주됩니다.
                        </motion.p>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    )
}
