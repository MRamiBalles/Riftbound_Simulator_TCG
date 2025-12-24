import { getCards } from '@/services/card-service';
import { CardGrid } from '@/components/CardGrid';
import { Search } from 'lucide-react';
import EnergyWidget from "@/components/layout/EnergyWidget";

export default async function Home() {
  const cards = await getCards();

  return (
    <main className="min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <EnergyWidget />
      {/* Header Section */}
      <header className="flex flex-col items-center justify-center mb-12 space-y-4 relative z-10">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest font-serif" style={{ fontFamily: 'Beaufort' }}>
          RIFTBOUND
        </h1>
        <p className="text-[#a09b8c] tracking-[0.3em] uppercase text-sm font-bold border-t border-b border-[#a09b8c]/30 py-2 px-8">
          League of Legends TCG Simulator
        </p>

        {/* Search Bar Placeholder */}
        <div className="relative mt-8 w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#c8aa6e] group-focus-within:text-[#f0e6d2] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-[#7a5c29] rounded-none leading-5 bg-[#010a13]/80 text-[#f0e6d2] placeholder-[#7a5c29] focus:outline-none focus:ring-1 focus:ring-[#c8aa6e] focus:border-[#c8aa6e] transition-all shadow-lg backdrop-blur-sm"
            placeholder="SEARCH CHAMPIONS..."
          />
        </div>

        <div className="flex gap-4 mt-6">
          <a href="/play" className="btn-hextech-primary">
            PLAY SIMULATOR
          </a>
          <a href="/decks" className="btn-hextech">
            DECK BUILDER
          </a>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 px-6">
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
            Trending Cards
          </h2>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View All Market Data &rarr;
          </button>
        </div>

        <CardGrid cards={cards} />
      </section>
    </main>
  );
}
