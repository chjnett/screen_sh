"use client";

import RAGChat from "@/components/RAGChat";
import { motion, Variants } from "framer-motion";

export default function Home() {
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
    <motion.main
      className="min-h-screen flex flex-col items-center justify-center bg-[#101113] p-4 md:p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="w-full max-w-2xl mb-8 space-y-2 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">LogMind AI</h1>
        <p className="text-gray-400 text-lg"> 투자 인텔리전스</p>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <RAGChat />
      </motion.div>
    </motion.main>
  );
}
