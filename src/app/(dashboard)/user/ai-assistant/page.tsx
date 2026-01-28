/**
 * AI Assistant Page (Light Mode)
 * 
 * Full-screen interface for the AI booking agent.
 * Handles end-to-end trip planning in a premium light theme.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CategoryNav from '@/components/dashboard/CategoryNav';
import ChatInterface from '@/components/chat/ChatInterface';
import { Sparkles, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AIAssistantPage() {
    const supabase = await createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            {/* Top Navigation */}
            <div className="bg-white border-b border-gray-200 p-6 shadow-sm z-10">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center relative border border-emerald-100">
                            <Sparkles className="w-6 h-6 text-emerald-600 relative" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">AI Trip Planner</h1>
                            <p className="text-sm text-gray-400 font-medium uppercase tracking-tight">End-to-end intelligent booking</p>
                        </div>
                    </div>

                    <CategoryNav />
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-8 overflow-hidden">
                {/* Helper Instructions / Context */}
                <div className="hidden lg:flex flex-col w-80 space-y-6 shrink-0">
                    <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-700">
                            <Info className="w-5 h-5" />
                            <h3 className="font-bold">How it works</h3>
                        </div>
                        <ul className="space-y-4 text-sm text-emerald-900/70 leading-relaxed font-medium">
                            <li>• Tell the AI where and when you want to play.</li>
                            <li>• It will recommend courses, hotels, and transport that fit together.</li>
                            <li>• You can swap specific items during the conversation.</li>
                            <li>• Once you're happy, confirm the whole package for approval.</li>
                        </ul>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
                        <h3 className="font-bold mb-4 text-gray-800">Suggested Prompts</h3>
                        <div className="space-y-2">
                            <PromptBadge text="Plan a 3-day trip to Bali" />
                            <PromptBadge text="Find luxury golf courses" />
                            <PromptBadge text="Book a weekend in Bandung" />
                        </div>
                    </div>
                </div>

                {/* Chat Interface Container */}
                <div className="flex-1 min-h-[600px] flex flex-col bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xl relative">
                    <ChatInterface />
                </div>
            </main>
        </div>
    );
}

function PromptBadge({ text }: { text: string }) {
    return (
        <button className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 transition-all text-sm text-gray-500 hover:text-emerald-700 font-medium">
            "{text}"
        </button>
    );
}
