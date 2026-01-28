/**
 * Category Navigation Component
 * 
 * A visual selector for the main categories in the User Dashboard.
 * Includes icons and labels for Golf, Hotels, and Travel.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flag, Hotel, Map, Sparkles } from 'lucide-react';

const categories = [
    {
        name: 'Home',
        href: '/user',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'from-emerald-400 to-teal-500',
    },
    {
        name: 'Golf Courses',
        href: '/user/golf',
        icon: <Flag className="w-5 h-5" />,
        color: 'from-green-400 to-emerald-600',
    },
    {
        name: 'Hotels',
        href: '/user/hotels',
        icon: <Hotel className="w-5 h-5" />,
        color: 'from-blue-400 to-indigo-600',
    },
    {
        name: 'Travel Packages',
        href: '/user/travel',
        icon: <Map className="w-5 h-5" />,
        color: 'from-orange-400 to-red-500',
    },
];

export default function CategoryNav() {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-sm">
            {categories.map((cat) => {
                const isActive = pathname === cat.href;
                return (
                    <Link
                        key={cat.href}
                        href={cat.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
                            ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        {cat.icon}
                        <span className={`text-sm font-semibold ${isActive ? 'block' : 'hidden md:block'}`}>
                            {cat.name}
                        </span>
                    </Link>
                );
            })}

            <div className="ml-auto pl-2 border-l border-gray-200">
                <Link
                    href="/user/ai-assistant"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all group"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-emerald-500 rounded-full blur opacity-10 group-hover:opacity-20 transition-opacity animate-pulse"></div>
                        <svg className="w-5 h-5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold hidden lg:block">AI Assistant</span>
                </Link>
            </div>
        </div>
    );
}
