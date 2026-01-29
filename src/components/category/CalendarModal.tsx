'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface CalendarModalProps {
    onClose: () => void;
    onSelect: (range: { start: string; end: string }) => void;
}

export default function CalendarModal({ onClose, onSelect }: CalendarModalProps) {
    const [startDate, setStartDate] = useState<number | null>(null);
    const [endDate, setEndDate] = useState<number | null>(null);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const month = "January 2026";

    const handleDateClick = (day: number) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else if (day < startDate) {
            setStartDate(day);
        } else {
            setEndDate(day);
        }
    };

    const handleConfirm = () => {
        if (startDate && endDate) {
            onSelect({
                start: `2026-01-${startDate.toString().padStart(2, '0')}`,
                end: `2026-01-${endDate.toString().padStart(2, '0')}`
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Select Dates</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Check-in & Check-out</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <button className="text-gray-400 hover:text-emerald-600"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="font-black text-sm uppercase tracking-widest text-gray-900">{month}</span>
                        <button className="text-gray-400 hover:text-emerald-600"><ChevronRight className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-black uppercase text-gray-300 mb-4">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {days.map(day => {
                            const isStart = startDate === day;
                            const isEnd = endDate === day;
                            const isInRange = startDate && endDate && day > startDate && day < endDate;

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`h-12 w-full rounded-2xl flex items-center justify-center text-sm font-bold transition-all relative ${isStart || isEnd
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 scale-105 z-10'
                                            : isInRange
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {day}
                                    {isStart && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Duration</p>
                        <p className="text-sm font-black text-emerald-600">
                            {startDate && endDate ? `${endDate - startDate} Nights` : 'Select range'}
                        </p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={!startDate || !endDate}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-gray-200 transition-all active:scale-95"
                    >
                        Confirm <Check className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
