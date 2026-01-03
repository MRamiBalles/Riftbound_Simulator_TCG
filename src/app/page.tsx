'use client';

import { useEffect, useState } from 'react';
import { getCards } from '@/services/card-service';
import { CardGrid } from '@/components/CardGrid';
import Link from 'next/link';
import { Sparkles, Trophy, Zap, Sword, Crown, Box, Activity, Cpu, Radio, ShieldAlert } from 'lucide-react';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import MissionWidget from '@/components/layout/MissionWidget';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [cards, setCards] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [neuralStatus, setNeuralStatus] = useState('SYNCING');

  useEffect(() => {
    setIsMounted(true);
    getCards().then(setCards);

    // Simulate Neural Connection
    const timer = setTimeout(() => setNeuralStatus('LINKED'), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-[#010a13]" />;

  return (
    <main className="min-h-screen bg-[#010a13] font-serif text-[#f0e6d2] overflow-x-hidden pt-16 flex">
      {/* Scanline Overlay */}
      <div className="fixed inset-0 z-[100] hextech-scanline opacity-30 pointer-events-none" />

      <HextechNavbar />
      <HextechSidebar />

      {/* Main Client Content */}
      <div className="flex-1 flex flex-col relative">

        {/* Cinematic Background */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-0 pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#010a13] via-transparent to-[#010a13] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(10,200,185,0.1)_0%,transparent_60%)] z-10" />
          <img
            src="https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png"
            alt="Client Background"
            className="w-full h-full object-cover opacity-20 blur-[2px]"
          />
        </motion.div>

        {/* Neural Link Status Bar */}
        <div className="relative z-20 px-8 py-2 glass-hextech border-b border-[#c8aa6e]/10 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-[#0ac8b9]" />
              <span className="text-[9px] font-black tracking-[0.2em] text-[#a09b8c]">SERVER STATUS:</span>
              <span className="text-[9px] font-black tracking-[0.2em] text-[#0ac8b9] animate-pulse">OPERATIONAL</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-amber-500" />
              <span className="text-[9px] font-black tracking-[0.2em] text-[#a09b8c]">NEURAL LINK:</span>
              <span className={`text-[9px] font-black tracking-[0.2em] transition-colors ${neuralStatus === 'LINKED' ? 'text-green-500' : 'text-amber-500'}`}>
                {neuralStatus}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Radio size={12} className="text-red-500 animate-pulse" />
            <span className="text-[9px] font-black tracking-[0.2em] text-red-500">LIVE: ASOL CHAMPION SPOTLIGHT</span>
          </div>
        </div>

        {/* Dynamic Content Scrollable */}
        <div className="relative z-10 p-8 lg:p-12 overflow-y-auto w-full max-w-[calc(100vw-18rem)] scrollbar-hide">
          <div className="grid grid-cols-12 gap-8">

            {/* FEATURED: Champion Spotlight & Big Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="col-span-12 lg:col-span-8 space-y-8"
            >
              <div className="relative p-12 rounded-[2rem] border-magic-gold-bold glass-hextech overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-3/4 h-full opacity-60 group-hover:scale-105 transition-transform duration-1000 pointer-events-none">
                  <img
                    src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/AurelionSol_0.jpg"
                    className="w-full h-full object-cover filter brightness-75 contrast-125"
                    alt="Aurelion Sol"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#010a13]/80 to-[#010a13]" />
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#0ac8b9] flex items-center justify-center bg-black/60 shadow-[0_0_10px_#0ac8b9]">
                      <ShieldAlert size={16} className="text-[#0ac8b9]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0ac8b9]">Sovereign Highlight</span>
                  </div>

                  <h2 className="text-7xl font-black italic tracking-tighter leading-none" style={{ fontFamily: 'Beaufort' }}>
                    THE FORGER <br />
                    <span className="text-[#c8aa6e]">OF STARS</span>
                  </h2>

                  <p className="text-[#a09b8c] text-lg leading-relaxed border-l-2 border-[#c8aa6e]/30 pl-6">
                    Aurelion Sol descends upon the Rift. Master the cosmic power of the stars and dominate the board with unprecedented scale.
                  </p>

                  <div className="flex gap-4 pt-4">
                    <Link href="/play" className="btn-hextech-primary px-12 py-5 text-center group relative overflow-hidden">
                      <span className="relative z-10">SOLO QUEUE</span>
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </Link>
                    <Link href="/collection/aurelion-sol" className="btn-hextech px-12 py-5 backdrop-blur-md">
                      VIEW CHAMPION
                    </Link>
                  </div>
                </div>

                {/* Visual Accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent shadow-[0_0_15px_#c8aa6e]" />
              </div>

              {/* TABS / TRENDING */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="text-2xl font-bold text-[#c8aa6e] flex items-center gap-3">
                    <Sparkles className="text-[#0ac8b9]" size={20} />
                    TRENDING DECKS
                  </h3>
                  <div className="flex gap-6">
                    {['NEW', 'LEGACY', 'PRO DECKS', 'AI GENERATED'].map((tab) => (
                      <span key={tab} className={`text-xs font-black cursor-pointer transition-all pb-4 -mb-4 ${tab === 'NEW' ? 'text-white border-b-2 border-[#0ac8b9]' : 'text-[#a09b8c] hover:text-white'}`}>
                        {tab}
                      </span>
                    ))}
                  </div>
                </div>
                <CardGrid cards={cards.slice(0, 4)} />
              </div>
            </motion.div>

            {/* SIDEBAR: Missions & Loot */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="col-span-12 lg:col-span-4 space-y-8"
            >
              <MissionWidget />

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Booster Shop', icon: Zap, href: '/shop' },
                  { label: 'My Vault', icon: Sword, href: '/vault' },
                  { label: 'Forge Decks', icon: Box, href: '/decks' },
                  { label: 'Rift Pass', icon: Crown, href: '/battle-pass' }
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="group glass-hextech p-6 border border-white/5 hover:border-[#c8aa6e]/40 hover:bg-white/5 transition-all rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c8aa6e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <action.icon size={28} className="text-[#c8aa6e] mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
                    <span className="text-[10px] font-black text-white tracking-widest uppercase relative z-10">{action.label}</span>
                  </Link>
                ))}
              </div>

              {/* SHOP PREVIEW SECTION */}
              <div className="glass-hextech rounded-2xl p-8 border border-white/5 relative overflow-hidden group cursor-pointer border-magic-gold">
                <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] to-transparent z-10" />
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/hextech-chest.png"
                  className="w-full h-40 object-contain group-hover:scale-110 transition-transform duration-500 relative z-10"
                  alt="Loot"
                />
                <div className="relative z-20 text-center space-y-2">
                  <h4 className="text-2xl font-black italic text-[#c8aa6e]">HEX-LOOT</h4>
                  <p className="text-[10px] text-[#0ac8b9] uppercase font-black tracking-widest animate-pulse">LEGENDARY DROP ACTIVE</p>
                </div>
              </div>
            </motion.div>

          </div>

          <footer className="mt-24 pt-12 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-[#5c5b57] uppercase tracking-[0.4em]">
            <div>© 2026 Riftbound Simulator // Neural Nexus Project</div>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">Safety</span>
              <span className="hover:text-white cursor-pointer transition-colors">Neural API</span>
              <span className="hover:text-white cursor-pointer transition-colors">System v1.0.42</span>
            </div>
          </footer>
        </div>

      </div>
    </main>
  );
}
