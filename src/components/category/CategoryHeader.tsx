'use client';

import { ChevronLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CategoryHeaderProps {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    colorClass: string;
    onSearch?: (query: string) => void;
}

export default function CategoryHeader({ title, subtitle, icon, colorClass, onSearch }: CategoryHeaderProps) {
    const router = useRouter();

    return (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm -mx-6 px-6 py-4 lg:py-6">
            <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                        {/* Mobile Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all border border-gray-100"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className={`w-10 h-10 lg:w-14 lg:h-14 ${colorClass} rounded-xl lg:rounded-2xl flex items-center justify-center border border-black/5`}>
                            {icon}
                        </div>

                        <div>
                            <h1 className="text-xl lg:text-3xl font-black text-gray-900 leading-tight">{title}</h1>
                            {subtitle && (
                                <p className="text-[10px] lg:text-sm text-gray-400 font-bold uppercase tracking-widest leading-none mt-1 lg:mt-2">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Desktop Search (Hidden on Mobile) */}
                    <div className="relative group hidden lg:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            onChange={(e) => onSearch?.(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all w-[350px] shadow-sm font-medium"
                        />
                    </div>
                </div>

                {/* Mobile Search (Full Width) */}
                <div className="relative group lg:hidden">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={`Search ${title.toLowerCase()}...`}
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
}
