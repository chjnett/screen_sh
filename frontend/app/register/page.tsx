"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; api?: string }>({})

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: typeof errors = {}

        if (!validateEmail(email)) {
            newErrors.email = "올바른 이메일 형식을 입력해주세요"
        }

        if (password.length < 6) {
            newErrors.password = "비밀번호는 6자 이상이어야 합니다"
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true)

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || "회원가입에 실패했습니다.");
                }

                router.push("/login?registered=true");
            } catch (err: any) {
                setErrors({ ...newErrors, api: err.message });
            } finally {
                setIsLoading(false);
            }
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
        <motion.div
            className="w-full max-w-sm mx-auto px-6 h-screen flex flex-col justify-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* 로고 영역 */}
            <motion.div variants={itemVariants} className="text-center mb-10">
                <h1 className="text-2xl font-bold text-foreground">LogMind</h1>
                <p className="text-muted-foreground text-sm mt-2">투자, 쉽게 시작하세요</p>
            </motion.div>

            {/* 탭 네비게이션 */}
            <motion.div variants={itemVariants} className="flex bg-card rounded-xl p-1 mb-8">
                <Link
                    href="/login"
                    className="flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-center text-muted-foreground hover:text-foreground"
                >
                    로그인
                </Link>
                <button
                    className="flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-primary text-primary-foreground"
                >
                    회원가입
                </button>
            </motion.div>

            {/* 폼 영역 */}
            <form onSubmit={handleSubmit}>
                <motion.div className="space-y-4">
                    {/* 이메일 입력 */}
                    <motion.div variants={itemVariants}>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (errors.email) setErrors({ ...errors, email: undefined })
                                }}
                                className={`w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-4 py-4 rounded-xl border ${errors.email ? "border-destructive" : "border-transparent"
                                    } focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                            />
                        </div>
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-destructive text-xs mt-2 ml-1"
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* 비밀번호 입력 */}
                    <motion.div variants={itemVariants}>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (errors.password) setErrors({ ...errors, password: undefined })
                                }}
                                className={`w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-12 py-4 rounded-xl border ${errors.password ? "border-destructive" : "border-transparent"
                                    } focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-destructive text-xs mt-2 ml-1"
                            >
                                {errors.password}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* 비밀번호 확인 */}
                    <motion.div variants={itemVariants}>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="비밀번호 확인"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                                }}
                                className={`w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-12 py-4 rounded-xl border ${errors.confirmPassword ? "border-destructive" : "border-transparent"
                                    } focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-destructive text-xs mt-2 ml-1"
                            >
                                {errors.confirmPassword}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* API 에러 메시지 */}
                    <AnimatePresence>
                        {errors.api && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg border border-destructive/20"
                            >
                                {errors.api}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 제출 버튼 */}
                    <motion.div variants={itemVariants} className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>처리 중...</span>
                                </>
                            ) : "가입하기"}
                        </button>
                    </motion.div>

                </motion.div>
            </form>

            {/* 이용약관 */}
            <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground mt-8">
                계속 진행하면 <span className="text-primary cursor-pointer hover:underline">이용약관</span> 및{" "}
                <span className="text-primary cursor-pointer hover:underline">개인정보처리방침</span>에 동의하는 것으로
                간주됩니다.
            </motion.p>
        </motion.div>
    )
}
