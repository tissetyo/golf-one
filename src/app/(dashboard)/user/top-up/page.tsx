/**
 * Top Up Payment Page (Checkout Simulation)
 * 
 * Simulated Xendit/Payment gateway flow for wallet top-up.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, ArrowLeft, ShieldCheck, CheckCircle2, ChevronRight, Layout } from 'lucide-react';
import Link from 'next/link';

export default function TopUpPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const amount = Number(searchParams.get('amount')) || 1000000;

    const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
        }, 2000);
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-8 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-400 font-medium mb-12">Rp {amount.toLocaleString()} has been added to your Golf Wallet.</p>
                <div className="w-full max-w-sm space-y-4">
                    <Link href="/user" className="block w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-900/10">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (step === 'processing') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
                <h1 className="text-xl font-black text-gray-900 mb-2">Processing Payment...</h1>
                <p className="text-gray-400 text-sm">Securing your transaction with GolfPay 🛡️</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white px-6 py-6 border-b border-gray-100 sticky top-0 z-30 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-black text-gray-900 leading-tight">Checkout</h1>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order #XP-902-1</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-500 ml-auto" />
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-4">
                {/* Amount Summary */}
                <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Top Up Amount</p>
                    <h2 className="text-3xl font-black">Rp {amount.toLocaleString()}</h2>
                </div>

                {/* Payment Methods */}
                <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Payment Method</h3>
                    <div className="space-y-3">
                        <PaymentMethodItem name="Virtual Account" icon={<Layout className="w-5 h-5" />} selected />
                        <PaymentMethodItem name="Credit Card" icon={<CreditCard className="w-5 h-5" />} />
                        <PaymentMethodItem name="E-Wallet (OVO/Dana)" icon={<CheckCircle2 className="w-5 h-5" />} />
                    </div>
                </section>

                <div className="pt-8">
                    <button
                        onClick={handlePay}
                        className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95"
                    >
                        Confirm & Pay Now
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase mt-6 tracking-widest">Powered by GolfPay Checkout</p>
                </div>
            </main>
        </div>
    );
}

function PaymentMethodItem({ name, icon, selected = false }: any) {
    return (
        <div className={`p-5 rounded-3xl bg-white border-2 flex items-center justify-between transition-all cursor-pointer ${selected ? 'border-emerald-500 shadow-md' : 'border-white'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                    {icon}
                </div>
                <span className="font-bold text-gray-900">{name}</span>
            </div>
            {selected ? (
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
            ) : (
                <div className="w-6 h-6 border-2 border-gray-100 rounded-full"></div>
            )}
        </div>
    );
}
