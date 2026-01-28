/**
 * Score Tracker Page
 * 
 * Allows users to track their golf scores offline.
 * Uses the offline score tracker utility.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, Cloud, CloudOff, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { getLocalScores, saveScoreLocally, syncScores, updateHoleScore, createScoreCard } from '@/lib/offline/scoreTracker';
import { createClient } from '@/lib/supabase/client';
import type { GolfScore, Profile } from '@/types';

export const dynamic = 'force-dynamic';

export default function ScoreTrackerPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [scores, setScores] = useState<GolfScore[]>([]);
    const [activeScore, setActiveScore] = useState<GolfScore | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        // Check online status
        setIsOnline(navigator.onLine);
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));

        // Load user and scores
        const loadData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data: prof } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(prof);
            setScores(getLocalScores());
        };

        loadData();

        return () => {
            window.removeEventListener('online', () => setIsOnline(true));
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, [router]);

    /**
     * Handle sync click
     */
    const handleSync = async () => {
        if (!isOnline || syncing) return;
        setSyncing(true);
        await syncScores();
        setScores(getLocalScores());
        setSyncing(false);
    };

    /**
     * Start a new round
     */
    const startNewRound = () => {
        if (!profile) return;
        // For MVP, we use a placeholder course ID or pick the first one
        const newScore = createScoreCard(profile.id, 'placeholder-course-id');
        setActiveScore(newScore);
        saveScoreLocally(newScore);
        setScores(getLocalScores());
    };

    /**
     * Update score for a hole
     */
    const handleUpdateScore = (hole: number, strokes: number) => {
        if (!activeScore) return;
        // Default par 4 for now
        const updated = updateHoleScore(activeScore, hole, strokes, 4);
        setActiveScore(updated);
        saveScoreLocally(updated);
        setScores(getLocalScores());
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href="/chat" className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold">Score Tracker</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {isOnline ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                        {isOnline ? 'Online' : 'Offline'}
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={!isOnline || syncing}
                        className={`p-2 rounded-lg transition-all ${syncing ? 'animate-spin' : ''
                            } ${!isOnline ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                    >
                        <Save className={`w-5 h-5 ${syncing ? 'text-emerald-400' : ''}`} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                {!activeScore ? (
                    <div className="space-y-6">
                        {/* Round History */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                Round History
                            </h2>
                            <button
                                onClick={startNewRound}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                New Round
                            </button>
                        </div>

                        {scores.length > 0 ? (
                            <div className="space-y-4">
                                {scores.map((score) => (
                                    <div
                                        key={score.id}
                                        onClick={() => setActiveScore(score)}
                                        className="p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:border-emerald-500/50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-gray-400">{score.date}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${score.sync_status === 'synced' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {score.sync_status}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <p className="text-lg font-bold group-hover:text-emerald-400 transition-colors">
                                                Round at Course
                                            </p>
                                            <p className="text-2xl font-black text-emerald-400">
                                                {score.total_strokes} <span className="text-xs text-gray-500 font-normal">strokes</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-800/50 rounded-3xl border border-dashed border-gray-700">
                                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                <p className="text-gray-400 italic">No rounds recorded yet.</p>
                                <p className="text-gray-500 text-sm mt-1">Start your first game to see it here!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-md mx-auto space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black mb-1">Score Card</h2>
                            <p className="text-gray-400">Enter your strokes for each hole</p>
                        </div>

                        {/* Score Entry Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {Array.from({ length: 18 }).map((_, i) => (
                                <div key={i} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Hole {i + 1}</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <input
                                            type="number"
                                            value={activeScore.scores[i + 1]?.strokes || ''}
                                            onChange={(e) => handleUpdateScore(i + 1, parseInt(e.target.value) || 0)}
                                            className="w-full bg-transparent text-2xl font-black text-center focus:outline-none focus:text-emerald-400 transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="sticky bottom-6 flex gap-4">
                            <button
                                onClick={() => setActiveScore(null)}
                                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold border border-gray-700 transition-all"
                            >
                                Back to History
                            </button>
                            <button
                                onClick={() => setActiveScore(null)}
                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/40"
                            >
                                Save Round
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Minimal Link component for the header since we're in 'use client'
function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}
