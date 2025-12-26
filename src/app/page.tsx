import { getCards } from '@/services/card-service';
import { CardGrid } from '@/components/CardGrid';
import Link from 'next/link';
import { Search, Sparkles, Trophy, Zap, Sword, Crown, Medal, Shield, BookOpen, Box, Scroll, Wand2, ShieldCheck, Tv, ShoppingBag } from 'lucide-react';
import EnergyWidget from '@/components/layout/EnergyWidget';
import MissionWidget from '@/components/layout/MissionWidget';
import clsx from 'clsx';

export default async function Home() {
  const cards = await getCards();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#010a13] font-serif text-[#f0e6d2]">
      <EnergyWidget />

      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] via-transparent to-[#010a13] z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_90%)] z-10" />
        <img
          src="https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png"
          alt="Jinx Background"
          className="w-full h-full object-cover animate-pulse-slow"
        />
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center space-y-8 mt-20">
        <MissionWidget />

        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest font-serif" style={{ fontFamily: 'Beaufort' }}>
            RIFTBOUND
          </h1>
          <p className="text-[#a09b8c] tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm font-bold border-t border-b border-[#a09b8c]/30 py-2 px-4 md:px-8 inline-block">
            League of Legends TCG Simulator
          </p>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/shop" className="group">
            <div className="bg-black/40 border border-white/5 p-12 rounded-[2.5rem] backdrop-blur-xl h-64 flex flex-col items-center justify-center group-hover:border-[#c8aa6e]/30 transition-all text-center">
              <Zap size={48} className="text-[#c8aa6e] mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-black text-white uppercase tracking-tighter">BOOSTER SHOP</div>
            </div>
          </Link>

          <Link href="/arena" className="group">
            <div className="bg-black/40 border border-white/5 p-12 rounded-[2.5rem] backdrop-blur-xl h-64 flex flex-col items-center justify-center group-hover:border-[#0ac8b9]/30 transition-all text-center">
              <Sword size={48} className="text-[#0ac8b9] mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-black text-white uppercase tracking-tighter">DRAFT ARENA</div>
            </div>
          </Link>

          <Link href="/battle-pass" className="group">
            <div className="bg-gradient-to-br from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/20 p-12 rounded-[2.5rem] backdrop-blur-xl h-64 flex flex-col items-center justify-center group-hover:border-[#f0e6d2]/50 transition-all text-center relative overflow-hidden">
              <Crown size={48} className="text-[#c8aa6e] mb-4 group-hover:rotate-12 transition-transform" />
              <div className="text-xl font-black text-white uppercase tracking-tighter">RIFT PASS</div>
              <div className="absolute top-4 right-4 text-[8px] font-black text-[#c8aa6e] uppercase">S1 ACTIVE</div>
            </div>
          </Link>

          <Link href="/collection" className="group">
            <div className="bg-black/40 border border-white/5 p-12 rounded-[2.5rem] backdrop-blur-xl h-64 flex flex-col items-center justify-center group-hover:border-white/20 transition-all text-center">
              <Trophy size={48} className="text-[#add8e6] mb-4" />
              <div className="text-xl font-black text-white uppercase tracking-tighter">COLLECTION</div>
            </div>
          </Link>
        </div>

        {/* Search Bar Placeholder */}
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#c8aa6e] group-focus-within:text-[#f0e6d2] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-[#7a5c29] rounded-none leading-5 bg-[#010a13]/80 text-[#f0e6d2] placeholder-[#7a5c29] focus:outline-none focus:ring-1 focus:ring-[#c8aa6e] focus:border-[#c8aa6e] transition-all shadow-lg backdrop-blur-sm"
            placeholder="SEARCH CHAMPIONS..."
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-4xl justify-center z-10">
        <Link href="/play" className="btn-hextech-primary w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> PLAY
        </Link>
        <Link href="/decks" className="btn-hextech w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> DECKS
        </Link>
        <Link href="/packs" className="btn-hextech border-[#0ac8b9] text-[#0ac8b9] hover:shadow-[0_0_20px_rgba(10,200,185,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <Box className="w-4 h-4" /> PACKS
        </Link>
        <Link href="/live" className="btn-hextech border-amber-400 text-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <Zap className="w-4 h-4" /> HORIZON
        </Link>
        <Link href="/genesis" className="btn-hextech border-purple-400 text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <Scroll className="w-4 h-4" /> GENESIS
        </Link>
        <Link href="/forge" className="btn-hextech border-cyan-400 text-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <Wand2 className="w-4 h-4" /> FORGE
        </Link>
        <Link href="/raid" className="btn-hextech border-red-500 text-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <Sword className="w-4 h-4" /> RAID
        </Link>
        <Link href="/vault" className="btn-hextech border-[#0ac8b9] text-[#0ac8b9] hover:shadow-[0_0_20px_rgba(10,200,185,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> VAULT
        </Link>
        <Link href="/tv" className="btn-hextech border-red-600 text-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <Tv className="w-4 h-4" /> APEX TV
        </Link>
        <Link href="/shop" className="btn-hextech border-amber-400 text-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] w-full sm:w-auto text-center justify-center flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> SHOP
        </Link>
      </div>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto w-full z-10 mt-12 px-4">
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          <Link href="/shop" className="group">
            <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl h-48 flex flex-col items-center justify-center group-hover:border-[#c8aa6e]/30 transition-all text-center">
              <Zap size={32} className="text-[#c8aa6e] mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-black text-white uppercase tracking-tighter">BOOSTER SHOP</div>
            </div>
          </Link>

          <Link href="/arena" className="group">
            <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl h-48 flex flex-col items-center justify-center group-hover:border-[#0ac8b9]/30 transition-all text-center">
              <Sword size={32} className="text-[#0ac8b9] mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-black text-white uppercase tracking-tighter">DRAFT ARENA</div>
            </div>
          </Link>

          <Link href="/tournaments" className="group">
            <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl h-48 flex flex-col items-center justify-center group-hover:border-[#c8aa6e]/50 transition-all text-center">
              <Trophy size={32} className="text-[#c8aa6e] mb-3 group-hover:rotate-12 transition-transform" />
              <div className="text-[10px] font-black text-white uppercase tracking-tighter">WORLD CUP</div>
            </div>
          </Link>

          <Link href="/guilds" className="group">
            <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl h-48 flex flex-col items-center justify-center group-hover:border-[#c8aa6e]/50 transition-all text-center">
              <Shield size={32} className="text-[#c8aa6e] mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-black text-white uppercase tracking-tighter">GUILD HALL</div>
            </div>
          </Link>

          <Link href="/battle-pass" className="group">
            <div className="bg-gradient-to-br from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/20 p-6 rounded-[2rem] backdrop-blur-xl h-48 flex flex-col items-center justify-center group-hover:border-[#f0e6d2]/50 transition-all text-center relative overflow-hidden">
              <Crown size={32} className="text-[#c8aa6e] mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-black text-white uppercase tracking-tighter">RIFT PASS</div>
            </div>
          </Link>

          <Link href="/collection" className="group">
            <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl h-48 flex flex-col items-center justify-center group-hover:border-white/20 transition-all text-center">
              <Medal size={32} className="text-[#add8e6] mb-3" />
              <div className="text-[10px] font-black text-white uppercase tracking-tighter">COLLECTION</div>
            </div>
          </Link>
        </div>

        {/* Search Bar Placeholder */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#c8aa6e] flex items-center gap-2" style={{ fontFamily: 'Beaufort' }}>
            <span className="w-1 h-6 bg-[#0ac8b9] rounded-full inline-block" />
            TRENDING CARDS
          </h2>
          <div className="flex items-center">
            <Link href="/social" className="px-6 py-2 text-[10px] font-black text-white hover:text-[#c8aa6e] transition-colors uppercase tracking-[0.2em] border-l border-white/10 first:border-0">Social Hub</Link>
            <Link href="/invasion" className="px-6 py-2 text-[10px] font-black text-red-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em] border-l border-white/10 animate-pulse">Boss Raid</Link>
            <Link href="/shop" className="px-6 py-2 text-[10px] font-black text-white hover:text-[#c8aa6e] transition-colors uppercase tracking-[0.2em] border-l border-white/10">Market</Link>
          </div>
        </div>

        <CardGrid cards={cards.slice(0, 8)} />
      </section>
    </main >
  );
}
