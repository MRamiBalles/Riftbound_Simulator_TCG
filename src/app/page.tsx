import { getCards } from '@/services/card-service';
import { CardGrid } from '@/components/CardGrid';
import Link from 'next/link';
import { Sparkles, Trophy, Zap, Sword, Crown, Box, Scroll, Wand2 } from 'lucide-react';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import MissionWidget from '@/components/layout/MissionWidget';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';

export default async function Home() {
  const cards = await getCards();
  const featuredCard = cards[0]; // Just for show

  return (
    <main className="min-h-screen bg-[#010a13] font-serif text-[#f0e6d2] overflow-x-hidden pt-16 flex">
      <HextechNavbar />
      <HextechSidebar />

      {/* Main Client Content */}
      <div className="flex-1 flex flex-col relative">

        {/* Cinematic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#010a13] via-transparent to-[#010a13] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(10,200,185,0.1)_0%,transparent_60%)] z-10" />
          <img
            src="https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png"
            alt="Client Background"
            className="w-full h-full object-cover opacity-30 blur-sm scale-105"
          />
        </div>

        {/* Dynamic Content Scrollable */}
        <div className="relative z-10 p-8 lg:p-12 overflow-y-auto w-full max-w-[calc(100vw-18rem)]">
          <div className="grid grid-cols-12 gap-8">

            {/* FEATURED: Big Hero Card for Ranked */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="relative p-12 rounded-[2rem] border-magic-gold glass-hextech overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <img
                    src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-crest-challenger.png"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(10,200,185,0.3)]"
                    alt="Ranked"
                  />
                </div>

                <div className="relative z-10 space-y-6 max-w-md">
                  <div className="inline-block px-3 py-1 bg-[#0ac8b9]/20 border border-[#0ac8b9]/40 text-[#0ac8b9] text-[10px] font-black uppercase tracking-widest rounded-sm">
                    Season 1: Neural Nexus
                  </div>
                  <h2 className="text-6xl font-black italic tracking-tighter" style={{ fontFamily: 'Beaufort' }}>
                    EVOLVE THE RIFT
                  </h2>
                  <p className="text-[#a09b8c] text-lg leading-relaxed">
                    Participate in the first AI-driven tournament. Master the core of the Rift and claim Hextech rewards.
                  </p>

                  <div className="flex gap-4 pt-4">
                    <Link href="/play" className="btn-hextech-primary px-12 py-4 text-center">
                      SOLO QUEUE
                    </Link>
                    <Link href="/arena" className="btn-hextech px-12 py-4">
                      DRAFT ARENA
                    </Link>
                  </div>
                </div>

                {/* Visual Accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c8aa6e]/50 to-transparent" />
              </div>

              {/* TABS / TRENDING */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="text-2xl font-bold text-[#c8aa6e]">TRENDING COLLECTIONS</h3>
                  <div className="flex gap-6">
                    <span className="text-xs font-black text-white cursor-pointer border-b-2 border-[#0ac8b9] pb-4 -mb-4">NEW</span>
                    <span className="text-xs font-black text-[#a09b8c] hover:text-white cursor-pointer transition-colors pb-4 -mb-4">LEGACY</span>
                    <span className="text-xs font-black text-[#a09b8c] hover:text-white cursor-pointer transition-colors pb-4 -mb-4">PRO DECKS</span>
                  </div>
                </div>
                <CardGrid cards={cards.slice(0, 4)} />
              </div>
            </div>

            {/* SIDEBAR: Missions & Loot */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <MissionWidget />

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-2 gap-4">
                <Link href="/shop" className="group glass-hextech p-6 border border-white/5 hover:border-[#c8aa6e]/30 transition-all rounded-2xl flex flex-col items-center justify-center text-center">
                  <Zap size={24} className="text-[#c8aa6e] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">Booster Shop</span>
                </Link>
                <Link href="/vault" className="group glass-hextech p-6 border border-white/5 hover:border-[#c8aa6e]/30 transition-all rounded-2xl flex flex-col items-center justify-center text-center">
                  <Sword size={24} className="text-[#c8aa6e] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">My Vault</span>
                </Link>
                <Link href="/decks" className="group glass-hextech p-6 border border-white/5 hover:border-[#c8aa6e]/30 transition-all rounded-2xl flex flex-col items-center justify-center text-center">
                  <Box size={24} className="text-[#c8aa6e] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">Forge Decks</span>
                </Link>
                <Link href="/battle-pass" className="group glass-hextech p-6 border border-white/5 hover:border-[#c8aa6e]/30 transition-all rounded-2xl flex flex-col items-center justify-center text-center">
                  <Crown size={24} className="text-[#c8aa6e] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">Rift Pass</span>
                </Link>
              </div>

              {/* SHOP PREVIEW SECTION */}
              <div className="glass-hextech rounded-2xl p-6 border border-white/5 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] to-transparent z-10" />
                <img
                  src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/hextech-chest.png"
                  className="w-full h-32 object-contain group-hover:scale-125 transition-transform duration-500"
                  alt="Loot"
                />
                <div className="relative z-20 text-center space-y-1">
                  <h4 className="text-xl font-bold text-[#c8aa6e]">LOOT CRATE</h4>
                  <p className="text-[10px] text-[#a09b8c] uppercase font-black tracking-widest">Available in Store</p>
                </div>
              </div>
            </div>

          </div>

          <footer className="mt-24 pt-12 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-[#5c5b57] uppercase tracking-[0.4em]">
            <div>© 2026 Riftbound Simulator // Neural Nexus Project</div>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer">Support</span>
              <span className="hover:text-white cursor-pointer">API Docs</span>
              <span className="hover:text-white cursor-pointer">Status</span>
            </div>
          </footer>
        </div>

      </div>
    </main>
  );
}
