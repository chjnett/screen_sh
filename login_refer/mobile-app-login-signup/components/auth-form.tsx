"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"

type Tab = "login" | "signup"

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<Tab>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})

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

    if (activeTab === "signup" && password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      // 시뮬레이션: 2초 후 로딩 종료
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsLoading(false)
    }
  }

  const containerVariants = {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      className="w-full max-w-sm mx-auto px-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 로고 영역 */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <h1 className="text-2xl font-bold text-foreground">토스증권</h1>
        <p className="text-muted-foreground text-sm mt-2">투자, 쉽게 시작하세요</p>
      </motion.div>

      {/* 탭 네비게이션 */}
      <motion.div variants={itemVariants} className="flex bg-card rounded-xl p-1 mb-8">
        {(["login", "signup"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setErrors({})
            }}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </motion.div>

      {/* 폼 영역 */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
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
                  className={`w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-4 py-4 rounded-xl border ${
                    errors.email ? "border-destructive" : "border-transparent"
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
                  className={`w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-12 py-4 rounded-xl border ${
                    errors.password ? "border-destructive" : "border-transparent"
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

            {/* 비밀번호 확인 (회원가입 시에만) */}
            {activeTab === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
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
                    className={`w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-12 py-4 rounded-xl border ${
                      errors.confirmPassword ? "border-destructive" : "border-transparent"
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
            )}

            {/* 로그인 시 추가 옵션 */}
            {activeTab === "login" && (
              <motion.div variants={itemVariants} className="flex justify-end">
                <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  비밀번호 찾기
                </button>
              </motion.div>
            )}

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
                ) : activeTab === "login" ? (
                  "로그인"
                ) : (
                  "가입하기"
                )}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </form>

      {/* 하단 구분선 및 소셜 로그인 */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-4 text-muted-foreground">또는</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {["카카오", "네이버", "애플"].map((provider) => (
            <button
              key={provider}
              type="button"
              className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              {provider[0]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 이용약관 */}
      <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground mt-8">
        계속 진행하면 <span className="text-primary cursor-pointer hover:underline">이용약관</span> 및{" "}
        <span className="text-primary cursor-pointer hover:underline">개인정보처리방침</span>에 동의하는 것으로
        간주됩니다.
      </motion.p>
    </motion.div>
  )
}
