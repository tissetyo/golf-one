/**
 * Category Cards Component
 * 
 * Large, high-impact buttons for the User Dashboard Home.
 * Replaces small tabs with an interactive grid for better accessibility.
 */

'use client';

import Link from 'next/link';
import { Flag, Hotel, Map, Sparkles, ArrowRight } from 'lucide-react';

const categories = [
    {
        name: 'Golf Courses',
        description: 'Book tee times at premier championship fairways.',
        href: '/user/golf',
        icon: <Flag className="w-8 h-8" />,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
        stats: '15+ Courses Available'
    },
    {
        name: 'Luxury Hotels',
        description: 'Find premium resorts near your favorite courses.',
        href: '/user/hotels',
        icon: <Hotel className="w-8 h-8" />,
        color: 'blue',
        gradient: 'from-blue-500 to-indigo-600',
        stats: 'Top Rated Accommodations'
    },
    {
        name: 'Travel Packages',
        description: 'VVIP airport transfers and bespoke tours.',
        href: '/user/travel',
        icon: <Map className="w-8 h-8" />,
        color: 'orange',
        gradient: 'from-orange-500 to-red-600',
        stats: 'Private & Guided'
    },
];

export default function CategoryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
                <Link
                    key={cat.href}
                    href={cat.href}
                    className="group relative bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 overflow-hidden"
                >
                    {/* Background Gradient Effect on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`}></div>

                    <div className="relative z-10">
                        <div className={`w-16 h-16 bg-${cat.color}-50 rounded-2xl flex items-center justify-center mb-6 text-${cat.color}-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                            {cat.icon}
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                            {cat.name}
                        </h3>

                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                            {cat.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {cat.stats}
                            </span>
                            <div className={`w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-${cat.color}-600 group-hover:text-white transition-all`}>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
