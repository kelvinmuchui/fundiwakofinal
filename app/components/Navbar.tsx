"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Internship", href: "/internship" },
    { name: "Hire Fundis", href: "/hire-fundis" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
];

const fundiNavLinks = [
    { name: "Internship", href: "/internship" },
    { name: "Wallet", href: "/payments" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Fundi Dashboard", href: "/fundi/dashboard" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const user = session?.user as { name?: string | null; role?: string } | undefined;
    const isFundi = user?.role === 'fundi';
    const visibleNavLinks = isFundi ? fundiNavLinks : navLinks;
    const isAdminPage = pathname?.startsWith('/admin');
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (isAdminPage) return;

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isAdminPage]);

    useEffect(() => {
        if (status !== 'authenticated' || !isFundi) {
            setUnreadMessages(0);
            return;
        }

        let active = true;
        const loadUnreadMessages = async () => {
            try {
                const response = await fetch('/api/messages', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`Unable to load unread messages (${response.status})`);
                }
                const data: { conversations?: Array<{ unreadCount?: number }> } = await response.json();
                if (active) {
                    setUnreadMessages(
                        (data.conversations ?? []).reduce(
                            (total, conversation) => total + (conversation.unreadCount ?? 0),
                            0,
                        ),
                    );
                }
            } catch (error) {
                console.error('Error loading navbar unread message count:', error);
            }
        };

        void loadUnreadMessages();
        const interval = window.setInterval(loadUnreadMessages, 30000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [isFundi, status]);

    const messageBadge = unreadMessages > 99 ? '99+' : unreadMessages;

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
                    <Link href={isFundi ? "/fundi/dashboard" : "/"} className="flex items-center gap-2 group">
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
                        {visibleNavLinks.map((link) => (
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
                        {isFundi && (
                            <Link
                                href="/messages"
                                aria-label={unreadMessages > 0 ? `Messages, ${unreadMessages} unread` : "Messages"}
                                title="Messages"
                                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <MessageSquare size={21} strokeWidth={2} aria-hidden="true" />
                                {unreadMessages > 0 && (
                                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-white">
                                        {messageBadge}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        {status === 'loading' ? (
                            <div className="w-10 h-10 bg-gray-200/20 rounded-full animate-pulse"></div>
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                {!isFundi && (
                                    <>
                                        <Link
                                            href="/profile"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${isScrolled ? "hover:bg-primary-50 text-gray-800 hover:text-primary-600" : "hover:bg-white/10 text-white"}`}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-500">
                                                {user?.name?.charAt(0) || 'U'}
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
                                    </>
                                )}
                                {user?.role === 'admin' && (
                                    <Link href="/admin/dashboard" className="px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300">
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className={`flex items-center gap-2 rounded-xl transition-all duration-300 ${isFundi ? "px-3 py-2 text-sm font-semibold" : "p-2"} ${isScrolled ? "text-gray-600 hover:text-red-600 hover:bg-red-50" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                                    title={isFundi ? "Logout" : "Sign Out"}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    {isFundi && <span>Logout</span>}
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
                    className={`md:hidden max-h-[80vh] overflow-y-auto transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="glass-light rounded-2xl p-4 space-y-1">
                        {visibleNavLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-xl text-black font-medium hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                            >
                                {link.name}
                            </a>
                        ))}
                        {isFundi && (
                            <Link
                                href="/messages"
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label={unreadMessages > 0 ? `Messages, ${unreadMessages} unread` : "Messages"}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-black transition-all duration-200 hover:bg-primary-50 hover:text-primary-600"
                            >
                                <MessageSquare size={19} aria-hidden="true" />
                                <span>Messages</span>
                                {unreadMessages > 0 && (
                                    <span className="ml-auto min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-white">
                                        {messageBadge}
                                    </span>
                                )}
                            </Link>
                        )}
                        <div className="pt-3 space-y-2 border-t border-neutral-200">
                            {status === 'loading' ? (
                                 <div className="px-4 py-3 text-center text-black">Loading...</div>
                            ) : session ? (
                                <>
                                    <div className="px-4 py-3 flex items-center gap-3 border-b border-neutral-100 mb-2">
                                         <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                             {user?.name?.charAt(0) || 'U'}
                                         </div>
                                         <div>
                                             <div className="text-black font-bold">{user?.name || 'User'}</div>
                                             <div className="text-xs text-gray-500 uppercase tracking-wider">{user?.role}</div>
                                         </div>
                                    </div>
                                    {!isFundi && (
                                        <>
                                            <Link
                                                href="/fundi/dashboard"
                                                className="block px-4 py-3 rounded-xl text-black font-medium hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Fundi Dashboard
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
                                        </>
                                    )}
                                    {user?.role === 'admin' && (
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
                                        {isFundi ? "Logout" : "Sign Out"}
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
