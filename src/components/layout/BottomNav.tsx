'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Calendar, Trophy, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', icon: <Home className="w-6 h-6" />, href: '/user' },
        { label: 'AI Agent', icon: <MessageSquare className="w-6 h-6" />, href: '/user/ai-assistant' },
        { label: 'Bookings', icon: <Calendar className="w-6 h-6" />, href: '/user/bookings' },
        { label: 'Scores', icon: <Trophy className="w-6 h-6" />, href: '/scores' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
                        <div className={`transition-all duration-300 ${isActive ? 'text-emerald-600 scale-110' : 'text-gray-400'}`}>
                            {item.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
