'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Star, Plus, Gift, X, Check } from 'lucide-react';

interface QuickStatsProps {
    initialBalance: number;
    initialPoints: number;
}

export default function QuickStats({ initialBalance, initialPoints }: QuickStatsProps) {
    const [showTopUp, setShowTopUp] = useState(false);
    const [showPoints, setShowPoints] = useState(false);
    const [balance, setBalance] = useState(initialBalance);
    const router = useRouter();

    const handleTopUp = (amount: number) => {
        router.push(`/user/top-up?amount=${amount}`);
        setShowTopUp(false);
    };

    return (
        <div className="px-5 -mt-4 relative z-40">
            <div className="bg-white rounded-[32px] p-1 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center">
                {/* Balance Section */}
                <button
                    onClick={() => setShowTopUp(true)}
                    className="flex-1 px-6 py-4 flex items-center gap-3 border-r border-gray-50 hover:bg-gray-50 transition-colors group rounded-l-[32px]"
                >
                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Balance</p>
                        <p className="text-xs font-black">Rp {(balance / 1000000).toFixed(1)}M</p>
                    </div>
                    <Plus className="w-3 h-3 text-emerald-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Points Section */}
                <button
                    onClick={() => setShowPoints(true)}
                    className="flex-1 px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors group rounded-r-[32px]"
                >
                    <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Star className="w-4 h-4 fill-current text-amber-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Points</p>
                        <p className="text-xs font-black">{initialPoints.toLocaleString()}</p>
                    </div>
                    <Gift className="w-3 h-3 text-amber-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {/* Top Up Modal */}
            {showTopUp && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowTopUp(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-black">Top Up Balance</h3>
                            <button onClick={() => setShowTopUp(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            <p className="text-sm text-gray-500 font-medium mb-4">Choose an amount to add to your golf wallet:</p>
                            {[1000000, 5000000, 10000000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => handleTopUp(amt)}
                                    className="w-full p-6 flex items-center justify-between border-2 border-gray-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                                >
                                    <span className="font-black text-gray-900">Rp {(amt / 1000000).toFixed(0)} Million</span>
                                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Check className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Points Modal */}
            {showPoints && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowPoints(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-amber-600 flex items-center gap-2">
                                <Gift className="w-6 h-6" /> Rewards
                            </h3>
                            <button onClick={() => setShowPoints(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                                <Star className="w-10 h-10 fill-current" />
                            </div>
                            <h4 className="text-2xl font-black mb-2">{initialPoints.toLocaleString()} Points</h4>
                            <p className="text-gray-400 font-medium mb-8">You are only 550 points away from a FREE round at Bali National!</p>
                            <button className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-900/20">
                                Browse Rewards
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
