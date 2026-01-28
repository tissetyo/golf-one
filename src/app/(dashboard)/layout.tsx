import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
            {/* Main scrollable area */}
            <div className="flex-1 pb-20 lg:pb-0 overflow-y-auto">
                {children}
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
