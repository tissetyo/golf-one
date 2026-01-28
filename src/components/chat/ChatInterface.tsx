/**
 * Chat Interface Component (Light Mode)
 * 
 * Conversational UI for AI-powered booking.
 * Features message bubbles, recommendation cards, and vendor swapping in a clean light theme.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MapPin, Star, DollarSign, RefreshCw } from 'lucide-react';
import type { ChatMessage, Recommendation } from '@/types';

interface ChatInterfaceProps {
    conversationId?: string;
    initialMessages?: ChatMessage[];
}

export default function ChatInterface({ conversationId: initialConversationId, initialMessages = [] }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(initialConversationId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /**
     * Send message to AI agent
     */
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationId,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setConversationId(result.data.conversationId);
                setMessages((prev) => [...prev, result.data.message]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: 'Sorry, something went wrong. Please try again.',
                        timestamp: new Date().toISOString(),
                    },
                ]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I couldn\'t connect to the server. Please try again.',
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSelectRecommendation = (recommendation: Recommendation) => {
        const message = `I'd like to book ${recommendation.name}`;
        setInputValue(message);
    };

    const handleSwapVendor = (recommendation: Recommendation) => {
        const message = `Show me alternatives to ${recommendation.name}`;
        setInputValue(message);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/10">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900">Golf Trip Assistant</h2>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-tight">AI Powered Concierge</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200">
                            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">How can I help you today?</h3>
                        <p className="text-gray-500 font-medium max-w-md mx-auto">
                            I can plan your entire trip from tee times to luxury stays and transport.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-2 justify-center">
                            {[
                                'Plan a 3-day Bali trip',
                                'Find luxury golf courses',
                                'Airport transfer for 2',
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setInputValue(suggestion)}
                                    className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 text-sm font-bold rounded-xl border border-gray-200 hover:border-emerald-200 transition-all shadow-sm"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                                ? 'bg-emerald-600 text-white shadow-emerald-900/10'
                                : 'bg-white text-gray-800 border border-gray-100'
                                }`}
                        >
                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                            {/* Recommendation Cards */}
                            {msg.metadata?.recommendations && msg.metadata.recommendations.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    {msg.metadata.recommendations.map((rec, recIndex) => (
                                        <RecommendationCard
                                            key={recIndex}
                                            recommendation={rec}
                                            onSelect={() => handleSelectRecommendation(rec)}
                                            onSwap={() => handleSwapVendor(rec)}
                                        />
                                    ))}
                                </div>
                            )}

                            <span className={`text-[10px] uppercase font-black tracking-widest mt-3 block opacity-40 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-5 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            rows={1}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all resize-none shadow-inner text-sm font-medium"
                            style={{ maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/10"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function RecommendationCard({ recommendation, onSelect, onSwap }: RecommendationCardProps) {
    const categoryIcons = {
        price: <DollarSign className="w-4 h-4" />,
        rating: <Star className="w-4 h-4" />,
        proximity: <MapPin className="w-4 h-4" />,
    };

    const categoryLabels = {
        price: 'Best Value',
        rating: 'Top Rated',
        proximity: 'Nearest',
    };

    const accentColors = {
        price: 'bg-green-50 text-green-700 border-green-100',
        rating: 'bg-amber-50 text-amber-700 border-amber-100',
        proximity: 'bg-blue-50 text-blue-700 border-blue-100',
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm transition-all hover:border-emerald-200">
            <div className="flex items-start gap-4">
                {recommendation.image_url ? (
                    <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
                        <img
                            src={recommendation.image_url}
                            alt={recommendation.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
                        {recommendation.type === 'golf' ? '⛳' : recommendation.type === 'hotel' ? '🏨' : '🚗'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${accentColors[recommendation.category]}`}>
                            {categoryIcons[recommendation.category]}
                            {categoryLabels[recommendation.category]}
                        </span>
                    </div>
                    <h4 className="font-black text-gray-900 truncate mb-1">{recommendation.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{recommendation.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs">
                        {recommendation.price > 0 && (
                            <span className="text-emerald-700 font-black">
                                Rp {recommendation.price.toLocaleString()}
                            </span>
                        )}
                        {recommendation.rating > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {recommendation.rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex gap-3 mt-5">
                <button
                    onClick={onSelect}
                    className="flex-1 py-3 px-4 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-emerald-700 shadow-md shadow-emerald-900/10"
                >
                    Select
                </button>
                <button
                    onClick={onSwap}
                    className="py-3 px-4 bg-white text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl border border-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

interface RecommendationCardProps {
    recommendation: Recommendation;
    onSelect: () => void;
    onSwap: () => void;
}
