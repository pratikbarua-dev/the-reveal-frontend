'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import LoginButton from '@/components/auth/LoginButton';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-28 md:py-36 px-6 overflow-hidden">
      {/* Background — return to hero imagery for visual bookend */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/images/istockphoto-505673826-612x612.jpg"
          alt="Intimate background"
          fill
          className="object-cover opacity-50 brightness-[0.6] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-5 items-center"
        >
          <h2 className="text-3xl md:text-5xl font-black text-contrast uppercase tracking-tight leading-tight">
            Ready to discover<br />what&rsquo;s underneath?
          </h2>
          <p className="text-xs md:text-sm text-white/50 font-light leading-relaxed max-w-sm">
            Begin your journey of intimate discovery. Solo or together — every card is a new conversation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full"
        >
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
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-[10px] text-white/25 uppercase tracking-widest font-sans font-semibold"
        >
          Free to play &bull; Google Sign-In &bull; No credit card
        </motion.p>
      </div>
    </section>
  );
}
