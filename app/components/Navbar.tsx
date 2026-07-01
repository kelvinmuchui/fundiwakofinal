"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Internship", href: "/internship" },
    { name: "Hire Fundis", href: "/hire-fundis" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const user = session?.user as any;
    const isAdminPage = pathname?.startsWith('/admin');

    useEffect(() => {
        if (isAdminPage) return;

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isAdminPage]);

    if (isAdminPage) {
        return null;
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? "glass-light shadow-lg backdrop-blur-xl border-b border-white/10 bg-slate-950/95 py-3"
                : "backdrop-blur-xl border-b border-white/10 bg-slate-950/80 py-5"
                }`}
        >
            <div className="container-max px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
                            <svg
                                className="w-6 h-6 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
                                <path d="M17.64 15 22 10.64" />
                                <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16 4.6a2.81 2.81 0 0 0-3.98 0c-.6.6-1.4.93-2.25.93h-.86L6.18 8.26" />
                            </svg>
                        </div>
                        <div>
                            <span className={`text-xl font-heading font-bold transition-colors duration-300 ${isScrolled ? "text-gray-900" : "text-white"}`}>
                                Fundi
                            </span>
                            <span className="text-xl font-heading font-bold gradient-text">
                                Wako
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium transition-all duration-300 hover:text-primary-500 relative group ${isScrolled ? "text-gray-800 hover:text-primary-600" : "text-white/90"
                                    }`}
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full rounded-full" />
                            </a>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        {status === 'loading' ? (
                            <div className="w-10 h-10 bg-gray-200/20 rounded-full animate-pulse"></div>
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/profile"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${isScrolled ? "hover:bg-primary-50 text-gray-800 hover:text-primary-600" : "hover:bg-white/10 text-white"}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-500">
                                        {(session.user as any)?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="text-sm font-medium">Profile</span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all duration-300 border-2 ${isScrolled
                                        ? "border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                                        : "border-white/30 text-white hover:bg-white/10"
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/payments"
                                    className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all duration-300 ${isScrolled
                                        ? "text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                                        : "text-white/80 hover:text-white hover:bg-white/10"
                                        }`}
                                    title="Escrow Wallet"
                                >
                                    💰 Wallet
                                </Link>
                                {(session.user as any)?.role === 'fundi' && (
                                    <Link href="/fundi/profile" className="px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-600/20">
                                        Fundi Panel
                                    </Link>
                                )}
                                {(session.user as any)?.role === 'admin' && (
                                    <Link href="/admin/dashboard" className="px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300">
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className={`p-2 rounded-xl transition-all duration-300 ${isScrolled ? "text-gray-600 hover:text-red-600 hover:bg-red-50" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                                    title="Sign Out"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/auth"
                                    className={`px-5 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all duration-300 border-2 ${isScrolled
                                        ? "border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                                        : "border-white/30 text-white hover:bg-white/10"
                                        }`}
                                >
                                    Sign In
                                </Link>
                                <Link href="/become-a-fundi" className="btn-primary text-sm px-5 py-2.5">
                                    Become a Fundi
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"
                            }`}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="glass-light rounded-2xl p-4 space-y-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-xl text-black font-medium hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="pt-3 space-y-2 border-t border-neutral-200">
                            {status === 'loading' ? (
                                 <div className="px-4 py-3 text-center text-black">Loading...</div>
                            ) : session ? (
                                <>
                                    <div className="px-4 py-3 flex items-center gap-3 border-b border-neutral-100 mb-2">
                                         <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                             {(session.user as any)?.name?.charAt(0) || 'U'}
                                         </div>
                                         <div>
                                             <div className="text-black font-bold">{(session.user as any)?.name || 'User'}</div>
                                             <div className="text-xs text-gray-500 uppercase tracking-wider">{(session.user as any)?.role}</div>
                                         </div>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-3 rounded-xl text-black font-medium hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-3 rounded-xl text-black font-medium hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Bookings
                                    </Link>
                                    <Link
                                        href="/payments"
                                        className="block px-4 py-3 rounded-xl text-orange-600 font-medium hover:bg-orange-50 transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        💰 Escrow Wallet
                                    </Link>
                                    {(session.user as any)?.role === 'fundi' && (
                                        <Link
                                            href="/fundi/profile"
                                            className="block px-4 py-3 rounded-xl text-emerald-600 font-medium hover:bg-emerald-50 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Fundi Panel
                                        </Link>
                                    )}
                                    {(session.user as any)?.role === 'admin' && (
                                        <Link
                                            href="/admin/dashboard"
                                            className="block px-4 py-3 rounded-xl text-purple-600 font-medium hover:bg-purple-50 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-3 rounded-xl text-red-500 font-medium hover:bg-red-50 transition-all duration-200 mt-2"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth"
                                        className="block w-full text-center px-4 py-3 rounded-xl border-2 border-primary-500 text-primary-500 font-heading font-semibold hover:bg-primary-500 hover:text-white transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/become-a-fundi"
                                        className="block w-full text-center btn-primary mt-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Become a Fundi
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
