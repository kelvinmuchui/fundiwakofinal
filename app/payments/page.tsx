"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Wallet, 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRightLeft, 
  Phone, 
  Shield, 
  Coins, 
  Info,
  RefreshCw,
} from "lucide-react";

interface Booking {
  _id: string;
  fundiId: string;
  clientId: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  status: string;
  quoteAmount?: number;
  paymentStatus?: "unpaid" | "escrowed" | "released" | "refunded";
  createdAt: string;
  fundi: {
    _id: string;
    name: string;
    skill: string;
    phone: string;
    photoURL?: string;
    hourlyRate?: string;
  } | null;
  client: {
    _id?: string;
    name: string;
    phone?: string;
  } | null;
}

interface Transaction {
  _id: string;
  bookingId: string;
  clientId: string;
  fundiId: string;
  amount: number;
  status: "pending" | "held" | "released" | "refunded" | "failed";
  mpesaPhoneNumber: string;
  checkoutRequestID?: string;
  mpesaReceiptNumber?: string;
  disbursementStatus?: "none" | "pending" | "success" | "failed";
  disbursementReceiptNumber?: string;
  disbursementPhone?: string;
  createdAt: string;
  updatedAt: string;
  serviceType: string;
  description: string;
  counterparty: {
    name: string;
    phone: string;
  } | null;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"escrow" | "history">("escrow");
  
  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [paymentStep, setPaymentStep] = useState<"form" | "polling" | "success" | "failed">("form");
  const [pollCountdown, setPollCountdown] = useState(30);
  const [payoutLoadingId, setPayoutLoadingId] = useState<string | null>(null);
  const [quoteInputId, setQuoteInputId] = useState<string | null>(null);
  const [quoteValue, setQuoteValue] = useState("");
  const [updatingQuoteId, setUpdatingQuoteId] = useState<string | null>(null);
  const [jobActionLoadingId, setJobActionLoadingId] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  // Wallet Top-Up State
  const [walletBalance, setWalletBalance] = useState(0);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpPhone, setTopUpPhone] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState("");
  const [topUpStep, setTopUpStep] = useState<"form" | "polling" | "success" | "failed">("form");
  const [topUpRequestId, setTopUpRequestId] = useState("");
  const [disputeLoadingId, setDisputeLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  // Fetch server-side payment config (mock mode flag, etc.)
  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((d) => setIsMockMode(d.mockMode === true))
      .catch(() => {});
  }, []);

  // Polling logic when STK Push is initiated
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    if ((paymentStep === "polling" && checkoutRequestId) || (topUpStep === "polling" && topUpRequestId)) {
      setPollCountdown(30);
      const activeRequestId = checkoutRequestId || topUpRequestId;
      const isTopUp = !!topUpRequestId;

      countdownTimer = setInterval(() => {
        setPollCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const pollStatus = async () => {
        try {
          const res = await fetch(`/api/payments/status?checkoutRequestID=${activeRequestId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "held" || data.status === "completed") {
              if (isTopUp) setTopUpStep("success");
              else setPaymentStep("success");
              clearInterval(countdownTimer);
              fetchData();
            } else if (data.status === "failed") {
              if (isTopUp) {
                setTopUpStep("failed");
                setTopUpError("Top-up failed. Please try again.");
              } else {
                setPaymentStep("failed");
                setPaymentError("Payment failed. Please check your phone status or try again.");
              }
              clearInterval(countdownTimer);
            }
          }
        } catch (err) {
          console.error("Error polling payment status:", err);
        }
      };

      // Poll every 2.5 seconds
      timer = setInterval(pollStatus, 2500);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [paymentStep, checkoutRequestId, topUpStep, topUpRequestId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Bookings
      const bookingsRes = await fetch("/api/bookings");
      let bookingsData: Booking[] = [];
      if (bookingsRes.ok) {
        const json = await bookingsRes.json();
        bookingsData = Array.isArray(json) ? json : json.data || [];
        setBookings(bookingsData);
      }

      // Fetch Transactions
      const txRes = await fetch("/api/payments");
      if (txRes.ok) {
        const json = await txRes.json();
        setTransactions(json.data || []);
      }

      // Fetch Wallet Balance
      const walletRes = await fetch("/api/wallet");
      if (walletRes.ok) {
        const json = await walletRes.json();
        if (json.data && json.data.balance !== undefined) {
          setWalletBalance(json.data.balance);
        }
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (booking: Booking) => {
    setSelectedBooking(booking);
    // Pre-fill phone number
    const userPhone = user?.phone || "";
    // Clean it up for display
    setMpesaNumber(userPhone.replace(/^254/, "0") || "07");
    setCustomAmount(booking.quoteAmount ? String(booking.quoteAmount) : "");
    setPaymentError("");
    setCheckoutRequestId("");
    setPaymentStep("form");
    setPaymentModalOpen(true);
  };

  const handleInitiateSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setPaymentLoading(true);
    setPaymentError("");

    const amountToPay = Number(customAmount) || selectedBooking.quoteAmount || 1000;

    try {
      const res = await fetch("/api/payments/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          phone: mpesaNumber,
          amount: amountToPay,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      setCheckoutRequestId(data.checkoutRequestID);
      setPaymentStep("polling");
    } catch (err: any) {
      setPaymentError(err.message || "An error occurred");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleInitiateTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount) return;

    setTopUpLoading(true);
    setTopUpError("");

    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: topUpPhone,
          amount: Number(topUpAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate top-up");
      }

      setTopUpRequestId(data.checkoutRequestID);
      setTopUpStep("polling");
    } catch (err: any) {
      setTopUpError(err.message || "An error occurred");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleRaiseDispute = async (bookingId: string) => {
    const tx = transactions.find(t => t.bookingId === bookingId && t.status === "held");
    if (!tx) {
      alert("No active escrow transaction found for this booking.");
      return;
    }

    const reason = prompt("Please provide a reason for disputing this escrow (e.g., poor quality, incomplete work):");
    if (!reason) return;

    setDisputeLoadingId(bookingId);
    try {
      const res = await fetch("/api/disputes/raise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: tx._id,
          bookingId: bookingId,
          reason: "other",
          description: reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to raise dispute");
      }

      alert("Dispute raised successfully. Escrow funds are frozen.");
      fetchData();
    } catch (err: any) {
      alert(`Error raising dispute: ${err.message}`);
    } finally {
      setDisputeLoadingId(null);
    }
  };

  const handleReleaseFunds = async (bookingId: string) => {
    if (!confirm("Are you sure you want to release the escrowed funds to the Fundi? This action is irreversible.")) {
      return;
    }

    setPayoutLoadingId(bookingId);
    try {
      const res = await fetch("/api/payments/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to release funds");
      }

      alert(data.message || "Funds released successfully!");
      fetchData();
    } catch (err: any) {
      alert(`Error releasing funds: ${err.message}`);
    } finally {
      setPayoutLoadingId(null);
    }
  };

  const handleSimulateWebhook = async (status: "success" | "failure") => {
    if (!checkoutRequestId) return;
    try {
      await fetch("/api/payments/simulate-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutRequestID: checkoutRequestId,
          status,
        }),
      });
    } catch (err) {
      console.error("Error simulating webhook:", err);
    }
  };

  // Fundi submit quote and accept booking
  const handleAcceptWithQuote = async (bookingId: string) => {
    if (!quoteValue || isNaN(Number(quoteValue)) || Number(quoteValue) <= 0) {
      alert("Please enter a valid quote amount.");
      return;
    }

    setUpdatingQuoteId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          status: "accepted",
          quoteAmount: Number(quoteValue),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to accept booking");
      }

      setQuoteInputId(null);
      setQuoteValue("");
      fetchData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingQuoteId(null);
    }
  };

  // Fundi updates job status to in_progress
  const handleMarkInProgress = async (bookingId: string) => {
    if (!confirm("Mark this job as started? This lets the client know work is now in progress.")) {
      return;
    }

    setJobActionLoadingId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          status: "in_progress",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }

      fetchData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setJobActionLoadingId(null);
    }
  };

  // Fundi updates job status to completed
  const handleMarkCompleted = async (bookingId: string) => {
    if (!confirm("Have you completed the work? This will notify the client to release the payment.")) {
      return;
    }

    setJobActionLoadingId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          status: "completed",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }

      fetchData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setJobActionLoadingId(null);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    if (user?.role === "client") {
      const activeEscrows = transactions
        .filter((tx) => tx.status === "held")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalSpent = transactions
        .filter((tx) => tx.status === "released")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const unpaidCount = bookings.filter(
        (b) => b.status === "accepted" && (!b.paymentStatus || b.paymentStatus === "unpaid")
      ).length;

      return { val1: activeEscrows, val2: unpaidCount, val3: totalSpent };
    } else {
      // Fundi
      const lockedInEscrow = transactions
        .filter((tx) => tx.status === "held")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalEarned = transactions
        .filter((tx) => tx.status === "released")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const pendingRelease = bookings.filter(
        (b) => b.status === "completed" && b.paymentStatus === "escrowed"
      ).reduce((sum, b) => sum + (b.quoteAmount || 0), 0);

      return { val1: lockedInEscrow, val2: pendingRelease, val3: totalEarned };
    }
  }, [bookings, transactions, user?.role]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full text-center bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Escrow Wallet Locked</h1>
          <p className="text-slate-400 mb-6">Please sign in to access your escrow payments and transaction dashboard.</p>
          <Link href="/auth" className="btn-primary w-full py-4 text-center">
            Sign In to Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-24 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Escrow Secured
              </span>
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                M-Pesa Connected
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white font-heading">
              Payments & Escrow Wallet
            </h1>
            <p className="mt-2 text-slate-400 max-w-xl text-sm leading-relaxed">
              {user?.role === "client" 
                ? "Secured transactions for your peace of mind. Pay to escrow, and only release the money to the artisan when the job is done."
                : "Manage your earnings securely. Get paid via M-Pesa. Track held escrows and request immediate payouts for completed jobs."
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition rounded-xl text-slate-400 hover:text-white"
              title="Refresh wallet data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                const userPhone = user?.phone || "";
                setTopUpPhone(userPhone.replace(/^254/, "0") || "07");
                setTopUpAmount("");
                setTopUpError("");
                setTopUpRequestId("");
                setTopUpStep("form");
                setTopUpModalOpen(true);
              }}
              className="px-5 py-3 bg-orange-500 hover:bg-orange-600 transition rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" /> Top Up Wallet
            </button>

            <Link 
              href="/dashboard"
              className="px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition rounded-xl text-sm font-semibold text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div className="rounded-3xl bg-slate-900/40 border border-orange-500/30 p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute right-6 top-6 text-orange-500/10 group-hover:text-orange-500/20 transition-all">
              <Wallet className="w-16 h-16" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
              My Wallet Balance
            </p>
            <h3 className="mt-3 text-3xl font-black text-white">
              KES {walletBalance.toLocaleString()}
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Available for payments or withdrawal
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute right-6 top-6 text-slate-500/10 group-hover:text-slate-500/20 transition-all">
              <Lock className="w-16 h-16" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {user?.role === "client" ? "Held in Escrow" : "Locked in Escrow"}
            </p>
            <h3 className="mt-3 text-3xl font-black text-white">
              KES {stats.val1.toLocaleString()}
            </h3>
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" /> Safe in intermediate bank account
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute right-6 top-6 text-orange-500/10 group-hover:text-orange-500/20 transition-all">
              <Clock className="w-16 h-16" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {user?.role === "client" ? "Unpaid Bookings" : "Pending Client Release"}
            </p>
            <h3 className="mt-3 text-3xl font-black text-white">
              {user?.role === "client" ? stats.val2 : `KES ${stats.val2.toLocaleString()}`}
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              {user?.role === "client" ? "Bookings requiring immediate funding" : "Awaiting client's release confirmation"}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute right-6 top-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-all">
              <Unlock className="w-16 h-16" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {user?.role === "client" ? "Total Service Spend" : "Total Earned & Disbursed"}
            </p>
            <h3 className="mt-3 text-3xl font-black text-white">
              KES {stats.val3.toLocaleString()}
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              {user?.role === "client" ? "Funds successfully released to artisans" : "Successfully payout disbursed to your M-Pesa"}
            </p>
          </div>
        </div>

        {/* Developer Sandbox Simulator Notice */}
        {isMockMode && (
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-5 mb-10 flex gap-4 items-start">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-500">M-Pesa Simulator Active (Dev Mode)</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                The application is running in mock/simulation mode since real M-Pesa credentials are not provided. 
                STK push requests will initiate immediately and mock success webhook callbacks will trigger automatically after 4 seconds to simulate user entry of their PIN.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab("escrow")}
            className={`py-4 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "escrow"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" /> Active Escrow Contracts
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Transaction History
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "escrow" && (
          <div className="space-y-6">
            
            {/* CLIENT VIEW */}
            {user?.role === "client" && (
              <div className="space-y-6">
                
                {/* 1. Unpaid bookings needing escrow payment */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Fund Escrow (Unpaid Bookings)
                  </h2>
                  
                  {bookings.filter(b => b.status === "accepted" && (!b.paymentStatus || b.paymentStatus === "unpaid")).length === 0 ? (
                    <div className="rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed p-10 text-center text-slate-500 text-sm">
                      No bookings currently require payment. When a Fundi accepts your request and sets a quote, they will appear here.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {bookings.filter(b => b.status === "accepted" && (!b.paymentStatus || b.paymentStatus === "unpaid")).map((booking) => (
                        <div key={booking._id} className="rounded-3xl bg-slate-900/30 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                                  {booking.serviceType}
                                </span>
                                <h3 className="text-lg font-bold text-white mt-2">
                                  Artisan: {booking.fundi?.name || "Professional"}
                                </h3>
                                <div className="mt-3 inline-flex items-center rounded-full bg-orange-500/10 text-orange-200 text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
                                  Quote accepted — pay escrow
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Agreed Quote</p>
                                <p className="text-xl font-black text-orange-500">
                                  KES {booking.quoteAmount?.toLocaleString() ?? "1,000"}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-slate-400 text-xs line-clamp-2">{booking.description}</p>
                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                              <p>Date: <span className="text-slate-300 font-semibold">{new Date(booking.preferredDate).toLocaleDateString()}</span></p>
                              <p>Location: <span className="text-slate-300 font-semibold">{booking.location}</span></p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenPayment(booking)}
                            className="mt-6 w-full btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 text-sm"
                          >
                            <Wallet className="w-4 h-4" /> Pay to Escrow via M-Pesa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 2. Escrowed payments currently held */}
                <section className="mt-12">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Funds Safely Held in Escrow
                  </h2>

                  {bookings.filter(b => b.paymentStatus === "escrowed").length === 0 ? (
                    <div className="rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed p-10 text-center text-slate-500 text-sm">
                      No funds are currently held in escrow.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {bookings.filter(b => b.paymentStatus === "escrowed").map((booking) => {
                        const isCompleted = booking.status === "completed";
                        return (
                          <div key={booking._id} className="rounded-3xl bg-slate-900/30 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full flex items-center justify-center text-emerald-500/20">
                              <Lock className="w-6 h-6 -mr-2.5 -mt-2.5" />
                            </div>

                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                                      {booking.serviceType}
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                      booking.status === "completed"
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : booking.status === "in_progress"
                                        ? "bg-sky-500/10 text-sky-400"
                                        : "bg-amber-500/10 text-amber-500"
                                    }`}>
                                      {booking.status === "completed"
                                        ? "Completed"
                                        : booking.status === "in_progress"
                                        ? "Work In Progress"
                                        : "Escrowed / Awaiting Start"}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-bold text-white mt-2">
                                    Artisan: {booking.fundi?.name || "Professional"}
                                  </h3>
                                  <div className="mt-3 inline-flex items-center rounded-full bg-slate-900/60 text-slate-200 text-[10px] uppercase tracking-wider px-3 py-1">
                                    {booking.status === "completed"
                                      ? "Ready for payout"
                                      : booking.status === "in_progress"
                                      ? "Work in progress"
                                      : "Awaiting start"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Escrowed</p>
                                  <p className="text-xl font-black text-emerald-500">
                                    KES {booking.quoteAmount?.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <p className="mt-3 text-slate-400 text-xs line-clamp-2">{booking.description}</p>
                              
                              <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                                <p>M-Pesa Status: <span className="text-emerald-500 font-semibold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Secured</span></p>
                                <p>Phone: <span className="text-slate-300">{booking.fundi?.phone}</span></p>
                              </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-2">
                              {isCompleted ? (
                                <button
                                  onClick={() => handleReleaseFunds(booking._id)}
                                  disabled={payoutLoadingId === booking._id}
                                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/10 transition mb-3"
                                >
                                  {payoutLoadingId === booking._id ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    <>
                                      <Unlock className="w-4 h-4" /> Confirm & Release Payout
                                    </>
                                  )}
                                </button>
                              ) : (
                                <div className="rounded-xl bg-slate-900 border border-slate-800/60 p-3.5 text-xs text-slate-400 flex gap-2 items-start mb-3">
                                  <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                  <span>
                                    Funds are safely locked. Once the Fundi completes the task and marks it finished, you can release the payment.
                                  </span>
                                </div>
                              )}

                              <button
                                onClick={() => handleRaiseDispute(booking._id)}
                                disabled={disputeLoadingId === booking._id}
                                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition"
                              >
                                {disputeLoadingId === booking._id ? "..." : (
                                  <>
                                    <AlertCircle className="w-4 h-4" /> Report Issue (Freeze Escrow)
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* FUNDI VIEW */}
            {user?.role === "fundi" && (
              <div className="space-y-6">
                
                {/* 1. Pending Booking Requests requiring Quotes */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Pending Booking Requests (Provide Quotes)
                  </h2>

                  {bookings.filter(b => b.status === "pending").length === 0 ? (
                    <div className="rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed p-10 text-center text-slate-500 text-sm">
                      No pending requests. Check back when clients request bookings.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {bookings.filter(b => b.status === "pending").map((booking) => (
                        <div key={booking._id} className="rounded-3xl bg-slate-900/30 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                                  {booking.serviceType}
                                </span>
                                <h3 className="text-lg font-bold text-white mt-2">
                                  Client: {booking.client?.name || "Valued Client"}
                                </h3>
                              </div>
                            </div>
                            <p className="mt-3 text-slate-400 text-xs line-clamp-2">{booking.description}</p>
                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                              <p>Requested Date: <span className="text-slate-300 font-semibold">{new Date(booking.preferredDate).toLocaleDateString()}</span></p>
                              <p>Location: <span className="text-slate-300 font-semibold">{booking.location}</span></p>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-800/30">
                            {quoteInputId === booking._id ? (
                              <div className="space-y-3">
                                <label className="block text-xs text-slate-400 font-medium">Enter Quote Amount (KES):</label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    value={quoteValue}
                                    onChange={(e) => setQuoteValue(e.target.value)}
                                    placeholder="e.g. 1500"
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 text-sm"
                                  />
                                  <button
                                    onClick={() => handleAcceptWithQuote(booking._id)}
                                    disabled={updatingQuoteId === booking._id}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center min-w-20"
                                  >
                                    {updatingQuoteId === booking._id ? "..." : "Accept"}
                                  </button>
                                  <button
                                    onClick={() => setQuoteInputId(null)}
                                    className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setQuoteInputId(booking._id);
                                  setQuoteValue(booking.fundi?.hourlyRate || "");
                                }}
                                className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition"
                              >
                                Accept & Provide Price Quote
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 2. Accepted Bookings Awaiting Escrow Payment */}
                <section className="mt-12">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Accepted Jobs Awaiting Client Payment
                  </h2>

                  {bookings.filter(b => b.status === "accepted" && (!b.paymentStatus || b.paymentStatus === "unpaid")).length === 0 ? (
                    <div className="rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed p-10 text-center text-slate-500 text-sm">
                      No accepted jobs are currently waiting for client escrow payment.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {bookings.filter(b => b.status === "accepted" && (!b.paymentStatus || b.paymentStatus === "unpaid")).map((booking) => (
                        <div key={booking._id} className="rounded-3xl bg-slate-900/30 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                                  {booking.serviceType}
                                </span>
                                <h3 className="text-lg font-bold text-white mt-2">
                                  Client: {booking.client?.name || "Valued Client"}
                                </h3>
                                <div className="mt-3 inline-flex items-center rounded-full bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-wider px-3 py-1">
                                  Accepted — awaiting escrow funding
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Quoted Amount</p>
                                <p className="text-xl font-black text-amber-400">
                                  KES {booking.quoteAmount?.toLocaleString() ?? "—"}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-slate-400 text-xs line-clamp-2">{booking.description}</p>
                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                              <p>Date: <span className="text-slate-300 font-semibold">{new Date(booking.preferredDate).toLocaleDateString()}</span></p>
                              <p>Location: <span className="text-slate-300 font-semibold">{booking.location}</span></p>
                            </div>
                          </div>

                          <div className="mt-6 rounded-xl bg-slate-900 border border-slate-800/60 p-3.5 text-xs text-slate-400">
                            The client still needs to pay the agreed quote into escrow. The job will move to active escrow once payment is confirmed.
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 3. Active Escrows - Funded & In-Progress */}
                <section className="mt-12">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Jobs (Escrow Funded)
                  </h2>

                  {bookings.filter(b => b.paymentStatus === "escrowed").length === 0 ? (
                    <div className="rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed p-10 text-center text-slate-500 text-sm">
                      No jobs currently have active escrow funding.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {bookings.filter(b => b.paymentStatus === "escrowed").map((booking) => {
                        const isCompleted = booking.status === "completed";
                        return (
                          <div key={booking._id} className="rounded-3xl bg-slate-900/30 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full flex items-center justify-center text-emerald-500/20">
                              <Lock className="w-6 h-6 -mr-2.5 -mt-2.5" />
                            </div>

                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                                      {booking.serviceType}
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                      booking.status === "completed"
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : booking.status === "in_progress"
                                        ? "bg-sky-500/10 text-sky-400"
                                        : "bg-amber-500/10 text-amber-500"
                                    }`}>
                                      {booking.status === "completed"
                                        ? "Completed"
                                        : booking.status === "in_progress"
                                        ? "Work In Progress"
                                        : "Escrowed / Awaiting Start"}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-bold text-white mt-2">
                                    Client: {booking.client?.name || "Valued Client"}
                                  </h3>
                                  <div className="mt-3 inline-flex items-center rounded-full bg-slate-900/60 text-slate-200 text-[10px] uppercase tracking-wider px-3 py-1">
                                    {booking.status === "completed"
                                      ? "Ready to be released"
                                      : booking.status === "in_progress"
                                      ? "Service ongoing"
                                      : "Escrowed — awaiting start"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Escrow Wallet</p>
                                  <p className="text-xl font-black text-emerald-500">
                                    KES {booking.quoteAmount?.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <p className="mt-3 text-slate-400 text-xs line-clamp-2">{booking.description}</p>
                              
                              <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                                <p>Location: <span className="text-slate-350">{booking.location}</span></p>
                                <p>Date: <span className="text-slate-350">{new Date(booking.preferredDate).toLocaleDateString()}</span></p>
                              </div>
                            </div>

                            <div className="mt-6">
                              {isCompleted ? (
                                <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 p-4 text-xs text-slate-400 flex gap-2 items-start">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                                  <span>
                                    You have completed the work. Client has been notified to release the KES {booking.quoteAmount} payment directly to your M-Pesa.
                                  </span>
                                </div>
                              ) : booking.status === "accepted" ? (
                                <button
                                  onClick={() => handleMarkInProgress(booking._id)}
                                  disabled={jobActionLoadingId === booking._id}
                                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 mb-3"
                                >
                                  {jobActionLoadingId === booking._id ? "..." : (
                                    <>
                                      <Clock className="w-4 h-4" /> Mark Job as Started
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMarkCompleted(booking._id)}
                                  disabled={jobActionLoadingId === booking._id}
                                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                                >
                                  {jobActionLoadingId === booking._id ? "..." : (
                                    <>
                                      <CheckCircle className="w-4 h-4" /> Mark Job as Completed
                                    </>
                                  )}
                                </button>
                              )}

                              {booking.status === "accepted" && (
                                <p className="mt-3 text-[11px] text-slate-400">
                                  Work has been funded but not started. Tap "Mark Job as Started" once you begin the task.
                                </p>
                              )}

                              {booking.status === "in_progress" && (
                                <p className="mt-3 text-[11px] text-slate-400">
                                  Job is in progress. Once the work is finished, tap "Mark Job as Completed" so the client can release escrow funds.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="rounded-3xl bg-slate-900/20 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Wallet Statements</h2>
              <span className="text-xs text-slate-400">{transactions.length} records found</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border-collapse">
                <thead className="bg-slate-900/40 text-slate-400 border-b border-slate-850">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Counterparty</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">M-Pesa Reference</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading transaction data...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                        No transactions recorded in this wallet yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isClient = user?.role === "client";
                      return (
                        <tr key={tx._id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">
                            #{tx._id.substring(16)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">
                            {tx.serviceType}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-slate-200 font-medium">{tx.counterparty?.name || "User"}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{tx.counterparty?.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-white">
                            KES {tx.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">
                            {tx.status === "released" && tx.disbursementReceiptNumber ? (
                              <div className="flex flex-col">
                                <span className="text-emerald-500 font-bold" title="Payout Receipt">Payout: {tx.disbursementReceiptNumber}</span>
                                <span className="text-[10px] text-slate-500">Pay: {tx.mpesaReceiptNumber || "N/A"}</span>
                              </div>
                            ) : (
                              tx.mpesaReceiptNumber || "None"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              tx.status === "held" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              tx.status === "released" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                              tx.status === "failed" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                              "bg-slate-800 text-slate-400"
                            }`}>
                              {tx.status === "held" ? "Escrow (Locked)" : 
                               tx.status === "released" ? "Released (Paid)" : 
                               tx.status === "failed" ? "Failed" : tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Payment STK Push Modal / Drawer */}
      {paymentModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" /> M-Pesa Payment Request
                </h3>
                <p className="text-xs text-slate-400 mt-1">Funds will be held in secure escrow</p>
              </div>
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* STEP 1: FORM */}
            {paymentStep === "form" && (
              <form onSubmit={handleInitiateSTK} className="space-y-5">
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Booking details</p>
                  <p className="text-sm font-bold text-white mt-1.5">{selectedBooking.serviceType} Service</p>
                  <p className="text-xs text-slate-400 mt-1">Artisan: {selectedBooking.fundi?.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Payment Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-5 py-4 bg-slate-950 border border-slate-850 rounded-2xl text-white outline-none focus:border-orange-500 font-medium"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1 ml-1">Agreed price as per the booking quote.</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full pl-12 pr-5 py-4 bg-slate-950 border border-slate-850 rounded-2xl text-white outline-none focus:border-orange-500 font-medium"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 ml-1">Must be registered with M-Pesa. Format: 07XXXXXXXX or 01XXXXXXXX.</p>
                </div>

                {paymentError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                >
                  {paymentLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>Pay KES {Number(customAmount || selectedBooking.quoteAmount || 1000).toLocaleString()} via M-Pesa</>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: POLLING (WAITING PIN) */}
            {paymentStep === "polling" && (
              <div className="space-y-6 text-center py-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">
                    {pollCountdown}s
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">M-Pesa STK Push Sent</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    We've initiated an M-Pesa request on your phone. Please check your screen, enter your M-Pesa PIN, and authorize the transaction.
                  </p>
                </div>

                {/* Simulated action panel in Mock/Sandbox Mode */}
                {isMockMode && (
                  <div className="pt-4 border-t border-slate-850 mt-6 space-y-3 bg-slate-950/40 p-4 rounded-2xl">
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Dev Sandbox Actions</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSimulateWebhook("success")}
                        className="flex-1 py-2 px-3 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/35 border border-emerald-500/20 rounded-xl text-xs font-bold transition"
                      >
                        Simulate Pin Success
                      </button>
                      <button
                        onClick={() => handleSimulateWebhook("failure")}
                        className="flex-1 py-2 px-3 bg-rose-600/20 text-rose-400 hover:bg-rose-600/35 border border-rose-500/20 rounded-xl text-xs font-bold transition"
                      >
                        Simulate Pin Reject
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500">
                      Safaricom webhook callbacks are simulated automatically, but you can use these buttons to force immediate response states.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: SUCCESS */}
            {paymentStep === "success" && (
              <div className="space-y-6 text-center py-6">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto border border-emerald-500/20 animate-bounce">
                  ✓
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Payment Escrowed!</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    KES {Number(customAmount).toLocaleString()} has been received and is held securely in escrow. 
                    The Fundi is notified and will begin working on your request.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setPaymentModalOpen(false);
                    fetchData();
                  }}
                  className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-2xl font-bold transition text-sm"
                >
                  Done
                </button>
              </div>
            )}

            {/* STEP 4: FAILED */}
            {paymentStep === "failed" && (
              <div className="space-y-6 text-center py-6">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto border border-rose-500/20">
                  ✕
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Payment Failed</h4>
                  <p className="text-xs text-rose-450 max-w-xs mx-auto leading-relaxed">
                    {paymentError || "The transaction request could not be processed. Please try again."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentStep("form")}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 text-white rounded-2xl font-bold transition text-sm"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 text-slate-350 rounded-2xl font-bold transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Wallet Top-Up Modal */}
      {topUpModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-orange-500" /> Top Up Wallet
                </h3>
                <p className="text-xs text-slate-400 mt-1">Add funds securely via M-Pesa</p>
              </div>
              <button 
                onClick={() => setTopUpModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {topUpStep === "form" && (
              <form onSubmit={handleInitiateTopUp} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Top-Up Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-5 py-4 bg-slate-950 border border-slate-850 rounded-2xl text-white outline-none focus:border-orange-500 font-medium"
                    required
                    min="10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={topUpPhone}
                      onChange={(e) => setTopUpPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full pl-12 pr-5 py-4 bg-slate-950 border border-slate-850 rounded-2xl text-white outline-none focus:border-orange-500 font-medium"
                      required
                    />
                  </div>
                </div>

                {topUpError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{topUpError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={topUpLoading}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                >
                  {topUpLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>Add KES {Number(topUpAmount || 0).toLocaleString()} to Wallet</>
                  )}
                </button>
              </form>
            )}

            {topUpStep === "polling" && (
              <div className="space-y-6 text-center py-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">
                    {pollCountdown}s
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">M-Pesa STK Push Sent</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    We've initiated an M-Pesa request on your phone. Please check your screen, enter your M-Pesa PIN to top up your wallet.
                  </p>
                </div>
              </div>
            )}

            {topUpStep === "success" && (
              <div className="space-y-6 text-center py-6">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto border border-emerald-500/20 animate-bounce">
                  ✓
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Top-Up Successful!</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Your wallet balance has been updated with KES {Number(topUpAmount).toLocaleString()}.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTopUpModalOpen(false);
                    fetchData();
                  }}
                  className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-2xl font-bold transition text-sm"
                >
                  Done
                </button>
              </div>
            )}

            {topUpStep === "failed" && (
              <div className="space-y-6 text-center py-6">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto border border-rose-500/20">
                  ✕
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Top-Up Failed</h4>
                  <p className="text-xs text-rose-450 max-w-xs mx-auto leading-relaxed">
                    {topUpError || "The transaction request could not be processed. Please try again."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTopUpStep("form")}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 text-white rounded-2xl font-bold transition text-sm"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setTopUpModalOpen(false)}
                    className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 text-slate-350 rounded-2xl font-bold transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
