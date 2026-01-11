import React from 'react';
import { BookOpen, Share2, Star, LayoutGrid, Heart, Search, Filter, RefreshCw, Smartphone, Copy, CheckCircle2 } from 'lucide-react';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { useUserStore } from '@/store/user-store';
import { CloudService } from '@/services/cloud-service';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import Link from 'next/link';

export default function VaultPage() {
    const { userId, lastSyncTime, setLastSyncTime, linkAccount, loadFullState } = useUserStore();
    const [syncing, setSyncing] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [linkInput, setLinkInput] = React.useState('');

    const handleSync = async () => {
        setSyncing(true);
        try {
            const fullState = useUserStore.getState();
            await CloudService.syncPlayerData(userId, fullState);
            setLastSyncTime(Date.now());
        } catch (e) {
            console.error(e);
        } finally {
            setSyncing(false);
        }
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLink = async () => {
        if (!linkInput.startsWith('RIFT-')) return;
        setSyncing(true);
        try {
            const remoteState = await CloudService.fetchPlayerData(linkInput);
            if (remoteState) {
                loadFullState(remoteState);
                linkAccount(linkInput);
                alert('Account Linked Successfully!');
            } else {
                alert('Rift ID not found on Nexus.');
            }
        } finally {
            setSyncing(false);
        }
    };

    // Mock user collection for preview
    const mockCollection = Array.from({ length: 8 }, (_, i) => ({
        id: `card-${i}`,
        name: i % 2 === 0 ? 'Lux: Final Spark' : 'Garen: Judgement',
        cost: 6,
        type: 'Unit' as const,
        subtypes: ['Demacia'],
        region: 'Demacia',
        rarity: 'Legendary' as const,
        text: 'The ultimate showcase card.',
        image_url: i % 2 === 0 ? 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/bltb968846c243881ca/5db0a5a3bd244a6ab0664ee6/01DE042-full.png' : 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/bltc5d4c8f041697268/5db0a5a0bd244a6ab0664ee2/01DE012-full.png',
        set_id: 'CORE',
        collector_number: '001'
    }));

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <HextechNavbar />
            <HextechSidebar />

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in slide-in-from-top duration-700">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="text-[#c8aa6e]" size={24} />
                            <span className="text-[10px] font-black text-[#a09b8c] uppercase tracking-[0.4em]">Personal Archives</span>
                        </div>
                        <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            THE VAULT
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/60 border border-white/10 rounded-2xl px-6 py-4 flex flex-col items-end">
                            <span className="text-[8px] font-black text-[#a09b8c] uppercase tracking-widest mb-1">Nexus Status</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#c8aa6e]">{userId}</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <div className="space-y-8">
                        <section className="bg-gradient-to-br from-black/60 to-transparent border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8aa6e]/5 blur-3xl -z-10" />
                            <div className="flex items-center gap-3 mb-6">
                                <RefreshCw className={syncing ? "text-[#c8aa6e] animate-spin" : "text-[#c8aa6e]"} size={20} />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">NEXUS CONNECT</h3>
                            </div>
                            <p className="text-[10px] text-[#a09b8c] leading-relaxed uppercase tracking-widest font-bold mb-8">
                                Sync your Rift ID to the cloud to continue your legend on any device.
                            </p>
                            <div className="space-y-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center group-hover:border-[#c8aa6e]/30 transition-colors">
                                    <div>
                                        <div className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">YOUR RIFT ID</div>
                                        <div className="text-xs font-bold text-white font-mono">{userId}</div>
                                    </div>
                                    <button onClick={handleCopyId} className="p-2 text-[#a09b8c] hover:text-white transition-colors">
                                        {copied ? <CheckCircle2 size={16} className="text-[#0ac8b9]" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <button onClick={handleSync} disabled={syncing} className="w-full btn-hextech-primary py-4 text-[10px] flex items-center justify-center gap-2">
                                    <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                                    {syncing ? 'SINCRO EN PROGRESO...' : 'BACKUP TO CLOUD'}
                                </button>
                                {lastSyncTime && (
                                    <div className="text-center text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">
                                        Last Synced: {new Date(lastSyncTime).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="bg-gradient-to-br from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/20 p-8 rounded-3xl">
                            <Star className="text-[#c8aa6e] mb-4" size={24} />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Vault Statistics</h4>
                            <div className="space-y-2">
                                <div className="text-[10px] text-[#a09b8c] uppercase font-black tracking-widest">COLLECTION POWER: S-RANK</div>
                                <div className="text-[10px] text-[#a09b8c] uppercase font-black tracking-widest">NEXUS VERIFIED: YES</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <div className="flex gap-8">
                                <button className="text-[10px] font-black text-[#c8aa6e] border-b-2 border-[#c8aa6e] pb-4 uppercase tracking-widest">Showcase Cards</button>
                                <button className="text-[10px] font-black text-[#5c5b57] hover:text-[#a09b8c] pb-4 uppercase tracking-widest">Wishlist</button>
                            </div>
                            <button className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#a09b8c]">
                                <Filter size={12} /> Filter Gallery
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {mockCollection.map(card => (
                                <div key={card.id} className="animate-in fade-in zoom-in duration-500">
                                    <ImmersiveCard card={card as any} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-24 text-center">
                <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                    EXIT VAULT
                </Link>
            </div>
        </main>
    );
}
