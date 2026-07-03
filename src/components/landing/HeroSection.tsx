'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import LoginButton from '@/components/auth/LoginButton';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';

type AuthMode = 'login' | 'guest' | 'hybrid';

export default function HeroSection() {
  const titleWords = ['THE', 'REVEAL'];
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  useEffect(() => {
    async function fetchAuthMode() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setAuthMode(data.authMode || 'hybrid');
        } else {
          setAuthMode('hybrid');
        }
      } catch {
        setAuthMode('hybrid');
      }
    }
    fetchAuthMode();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Immersive Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/images/istockphoto-505673826-612x612.jpg"
          alt="Intimate background"
          fill
          priority
          className="object-cover opacity-70 brightness-[0.7] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center gap-8">
        {/* Staggered Title */}
        <div className="flex flex-col items-center leading-[0.85]">
          {titleWords.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30 uppercase select-none"
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Flirty Tagline with App Purpose explanation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-white/70 text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed font-sans font-light italic"
        >
          Some things are better&hellip; uncovered slowly. The Reveal is a playful, interactive scratch-card game for partners to explore intimacy, communicate desires, and build connection together.
        </motion.p>

        {/* CTA — adapts to auth mode */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-4 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md"
        >
          {/* Login Required mode: show login button and a learn more button */}
          {authMode === 'login' && (
            <>
              <div className="w-full sm:w-auto hover:scale-105 transition-transform duration-500">
                <LoginButton />
              </div>
              <button 
                onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-48 bg-white/10 hover:bg-white/15 border border-white/20 text-contrast font-bold text-sm tracking-widest uppercase py-3.5 px-6 rounded-2xl transition-all duration-300"
              >
                Learn More
              </button>
            </>
          )}

          {/* Guest Only mode: only show "Start Playing" to go straight to play */}
          {authMode === 'guest' && (
            <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-primary/50 via-primary/20 to-secondary/40 shadow-glow-intense animate-glow-pulse hover:scale-105 transition-transform duration-500 w-full sm:w-auto">
              <Link href="/play" className="block w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-48 font-bold text-sm tracking-widest uppercase"
                >
                  Start Playing
                </Button>
              </Link>
            </div>
          )}

          {/* Hybrid mode: show both options */}
          {(authMode === 'hybrid' || authMode === null) && (
            <>
              <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-primary/50 via-primary/20 to-secondary/40 shadow-glow-intense animate-glow-pulse hover:scale-105 transition-transform duration-500 w-full sm:w-auto">
                <Link href="/play" className="block w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-48 font-bold text-sm tracking-widest uppercase"
                  >
                    Host a Game
                  </Button>
                </Link>
              </div>

              <div className="w-full sm:w-auto hover:scale-105 transition-transform duration-500">
                <LoginButton />
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 z-10 pointer-events-none"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-sans font-bold">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-white/20" />
        </motion.div>
      </motion.div>
    </section>
  );
}
