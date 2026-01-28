'use client';

import Link from 'next/link';
import { Flag, Hotel, Map, Sparkles, MessageCircle, Trophy, Ticket, HelpCircle } from 'lucide-react';

const services = [
    { name: 'Golf', icon: <Flag className="w-6 h-6" />, href: '/user/golf', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Hotels', icon: <Hotel className="w-6 h-6" />, href: '/user/hotels', color: 'bg-blue-50 text-blue-600' },
    { name: 'Travel', icon: <Map className="w-6 h-6" />, href: '/user/travel', color: 'bg-orange-50 text-orange-600' },
    { name: 'AI Planner', icon: <MessageCircle className="w-6 h-6" />, href: '/user/ai-assistant', color: 'bg-purple-50 text-purple-600' },
    { name: 'Tourney', icon: <Trophy className="w-6 h-6" />, href: '#', color: 'bg-amber-50 text-amber-600' },
    { name: 'Vouchers', icon: <Ticket className="w-6 h-6" />, href: '#', color: 'bg-rose-50 text-rose-600' },
    { name: 'Explore', icon: <Sparkles className="w-6 h-6" />, href: '#', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Support', icon: <HelpCircle className="w-6 h-6" />, href: '#', color: 'bg-gray-50 text-gray-500' },
];

export default function ServiceGrid() {
    return (
        <div className="grid grid-cols-4 gap-y-8 gap-x-4">
            {services.map((service) => (
                <Link key={service.name} href={service.href} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center shadow-sm group-active:scale-95 transition-all duration-200 border border-black/5`}>
                        {service.icon}
                    </div>
                    <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight text-center">
                        {service.name}
                    </span>
                </Link>
            ))}
        </div>
    );
}
