import React, { useEffect, useState } from 'react';
import { CloudService } from '@/services/cloud-service';
import { TrendingUp, BarChart3, Users } from 'lucide-react';

export const MetaDashboard: React.FC = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await CloudService.getGlobalMeta();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="animate-pulse bg-slate-800/50 rounded-2xl h-64 w-full" />;

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="text-cyan-400" />
                    Global Meta Analysis
                </h3>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                    Real-time Cloud Data
                </div>
            </div>

            <div className="space-y-4">
                {stats.map((item, i) => (
                    <div key={item.name} className="group relative">
                        <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">
                                {item.name}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Users size={12} /> {item.total_plays}
                                </span>
                                <span className={`text-sm font-bold ${item.win_rate > 0.55 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                    {(item.win_rate * 100).toFixed(1)}% WR
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div
                                className={`h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(6,182,212,0.4)] ${item.win_rate > 0.55 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-cyan-500 to-blue-400'
                                    }`}
                                style={{ width: `${item.win_rate * 100}%` }}
                            />
                        </div>

                        {/* Rank indicator */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-4 bg-cyan-400 transition-all rounded-full" />
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center gap-2 text-[10px] text-slate-500 border-t border-white/5 pt-4">
                <TrendingUp size={14} className="text-emerald-500" />
                Aggregated from 4,200+ simulated matches across all regions.
            </div>
        </div>
    );
};
