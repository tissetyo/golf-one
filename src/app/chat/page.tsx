/**
 * Chat Page
 * 
 * Main page for the AI-powered booking interface.
 * Displays the chat interface with user's conversation history.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        redirect('/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Get or create conversation
    const { data: conversations } = await supabase
        .from('conversations')
        .select('id, messages, context, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

    const latestConversation = conversations?.[0];

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            {/* Navigation Header */}
            <header className="flex items-center justify-between px-6 py-3 bg-gray-900/95 border-b border-gray-800 backdrop-blur-lg z-10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold text-white">Golf Tourism</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/user"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        My Bookings
                    </Link>
                    <Link
                        href="/scores"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Score Tracker
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm text-gray-300 hidden sm:block">
                            {profile?.full_name || user.email}
                        </span>
                    </div>
                </div>
            </header>

            {/* Chat Interface */}
            <main className="flex-1 overflow-hidden">
                <ChatInterface
                    conversationId={latestConversation?.id}
                    initialMessages={latestConversation?.messages || []}
                />
            </main>
        </div>
    );
}
