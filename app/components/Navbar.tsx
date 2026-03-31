"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#services" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
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
                ? "glass-light shadow-lg py-3"
                : "bg-transparent py-5"
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
                            <span className={`text-xl font-heading font-bold transition-colors duration-300 ${isScrolled ? "text-secondary-500" : "text-white"}`}>
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
                                className={`text-sm font-medium transition-all duration-300 hover:text-primary-500 relative group ${isScrolled ? "text-neutral-600" : "text-white/90"
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
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                <span className={`text-sm ${isScrolled ? "text-neutral-600" : "text-white/90"}`}>
                                    Welcome, {(session.user as any)?.name || 'User'}
                                </span>
                                {(session.user as any)?.role === 'admin' && (
                                    <Link href="/admin/dashboard" className="px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300">
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all duration-300 border-2 ${isScrolled
                                        ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                        : "border-white/30 text-white hover:bg-white/10"
                                        }`}
                                >
                                    Sign Out
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
                        className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? "text-white bg-black/20 hover:bg-black/30" : "text-white"
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
                                    <div className="px-4 py-3 text-black font-medium">
                                        Welcome, {(session.user as any)?.name || 'User'}
                                    </div>
                                    {(session.user as any)?.role === 'admin' && (
                                        <Link
                                            href="/admin/dashboard"
                                            className="block w-full text-center btn-primary"
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
                                        className="block w-full text-center px-4 py-3 rounded-xl border-2 border-red-500 text-red-500 font-heading font-semibold hover:bg-red-500 hover:text-white transition-all duration-200"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/signin"
                                        className="block w-full text-center px-4 py-3 rounded-xl border-2 border-primary-500 text-primary-500 font-heading font-semibold hover:bg-primary-500 hover:text-white transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/become-a-fundi"
                                        className="block w-full text-center btn-primary"
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
