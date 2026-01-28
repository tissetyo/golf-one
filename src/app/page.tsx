/**
 * Landing Page
 * 
 * Main entry point for the Golf Tourism Platform.
 * Features hero section, key features, and call-to-action.
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get some featured courses for display
  const { data: featuredCourses } = await supabase
    .from('golf_courses')
    .select('*')
    .eq('is_active', true)
    .limit(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Golf Tourism</span>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/chat"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-8">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered Golf Booking Experience
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Perfect Golf
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Vacation Awaits
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Book golf courses, hotels, and travel packages through our AI assistant.
            Track your scores offline and sync seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? '/chat' : '/register'}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              Start Booking Now
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-gray-800/50 border border-gray-700 text-white text-lg font-semibold rounded-xl hover:bg-gray-700/50 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need for Golf Tourism
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A complete platform connecting golfers with courses, hotels, and travel services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Booking Assistant</h3>
              <p className="text-gray-400">
                Chat with our AI to find and book the perfect golf experience. Get personalized recommendations based on price, rating, and proximity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Offline Score Tracking</h3>
              <p className="text-gray-400">
                Track your scores even without internet. Our PWA syncs automatically when you're back online.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl border border-purple-500/20">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Dynamic Vendor Swapping</h3>
              <p className="text-gray-400">
                Easily swap hotels or courses without rebuilding your entire booking. Keep what works, change what doesn't.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-2xl border border-yellow-500/20">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Vendor Approval System</h3>
              <p className="text-gray-400">
                Real-time approval from vendors before payment. Know your booking is confirmed before you pay.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gradient-to-br from-pink-500/10 to-pink-600/5 rounded-2xl border border-pink-500/20">
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Payments</h3>
              <p className="text-gray-400">
                Pay securely via Xendit with multiple payment options including bank transfer, e-wallet, and QRIS.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gradient-to-br from-teal-500/10 to-teal-600/5 rounded-2xl border border-teal-500/20">
              <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Multi-Vendor Platform</h3>
              <p className="text-gray-400">
                Book from multiple vendors in one package. Golf courses, hotels, and travel all in one seamless experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses && featuredCourses.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Featured Golf Courses
              </h2>
              <p className="text-gray-400">
                Discover top-rated golf courses available for booking
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    {course.images?.[0] ? (
                      <img
                        src={course.images[0]}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{course.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description || 'Experience world-class golfing at this premier course.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">{course.rating || '4.5'}</span>
                      </div>
                      {course.price_range && (
                        <span className="text-emerald-400 font-semibold">
                          From ${course.price_range.min}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl border border-emerald-500/30 p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Tee Off?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of golfers booking their perfect golf vacations through our AI-powered platform.
            </p>
            <Link
              href={user ? '/chat' : '/register'}
              className="inline-flex px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">Golf Tourism Platform</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 Golf Tourism. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
