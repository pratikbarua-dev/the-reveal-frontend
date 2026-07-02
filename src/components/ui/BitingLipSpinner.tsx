'use client';

import { motion } from 'framer-motion';

export default function BitingLipSpinner({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-primary drop-shadow-[0_0_10px_currentColor]"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Upper Lip (Cupid's Bow) */}
        <motion.path
          d="M 10 50 C 20 35, 30 30, 35 30 C 40 30, 45 40, 50 45 C 55 40, 60 30, 65 30 C 70 30, 80 35, 90 50 C 75 45, 60 50, 50 50 C 40 50, 25 45, 10 50 Z"
          initial={{ pathLength: 0, opacity: 0, fill: "currentColor", fillOpacity: 0 }}
          animate={{ pathLength: 1, opacity: 1, fillOpacity: 0.1 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        {/* Lower Lip */}
        <motion.path
          d="M 10 50 C 25 55, 40 55, 50 55 C 60 55, 75 55, 90 50 C 80 75, 60 85, 50 85 C 40 85, 20 75, 10 50 Z"
          initial={{ pathLength: 0, opacity: 0, fill: "currentColor", fillOpacity: 0 }}
          animate={{ pathLength: 1, opacity: 1, fillOpacity: 0.15 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.2 }}
        />
        {/* Teasing Bite Hint */}
        <motion.path
          d="M 42 55 C 46 62, 54 62, 58 55"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.4 }}
        />
      </motion.svg>
    </div>
  );
}
