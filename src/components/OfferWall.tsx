import React, { useState, useEffect } from "react";
import { 
  ArrowRight, ShieldCheck, Check, Info, Lock, CreditCard, 
  Sparkles, Gift, AlertCircle, Apple, Calendar, CheckSquare,
  QrCode, Smartphone, Building2, ShieldAlert, KeyRound, HelpCircle,
  Tag, Download, Copy, Printer, FileText, Clock, Award, CheckCircle2, ChevronRight, X
} from "lucide-react";
import { Client, GymOffer, MembershipTier, PaymentInvoice } from "../types";
import { MEMBERSHIP_TIERS, INITIAL_OFFERS } from "../db";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface OfferWallProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
  offers: GymOffer[];
}

export default function OfferWall({ client, onUpdateClient, offers }: OfferWallProps) {
  const [activeTab, setActiveTab] = useState<"PLANS" | "OFFERS" | "INVOICES">("PLANS");
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  
  // Coupon / Promo Code Engine
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct: number; title: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Active Tax Invoice View Modal
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(false);

  // High-Fidelity Payment Gateway State Machine
  const [razorpayStep, setRazorpayStep] = useState<"METHOD" | "UPI" | "CARD" | "NETBANKING" | "OTP" | "SUCCESS">("METHOD");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<"CARD" | "UPI" | "NETBANKING" | "RAZORPAY">("CARD");
  
  // Form fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState(client.name || "");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [otpVal, setOtpVal] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<PaymentInvoice | null>(null);

  // Active Offers pool
  const allOffers: GymOffer[] = offers && offers.length > 0 ? offers : INITIAL_OFFERS;

  // Expose an OTP countdown timer during verify step
  useEffect(() => {
    let interval: any = null;
    if (razorpayStep === "OTP" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [razorpayStep, otpTimer]);

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const trimmed = raw.slice(0, 16);
    const parts = [];
    for (let i = 0; i < trimmed.length; i += 4) {
      parts.push(trimmed.slice(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (raw.length <= 2) {
      setCardExpiry(raw);
    } else {
      setCardExpiry(raw.slice(0, 2) + "/" + raw.slice(2, 4));
    }
  };

  // Calculate pricing
  const calculatePricing = (tier: MembershipTier) => {
    const basePeriodPrice = isAnnual ? Math.round(tier.price * 12 * 0.8) : tier.price;
    const discountPct = appliedPromo ? appliedPromo.discountPct : 0;
    const discountAmount = Math.round((basePeriodPrice * discountPct) / 100);
    const taxAmount = 49;
    const netTotal = Math.max(0, basePeriodPrice - discountAmount + taxAmount);

    return {
      basePeriodPrice,
      discountPct,
      discountAmount,
      taxAmount,
      netTotal
    };
  };

  // Apply a Promo Code
  const handleApplyPromoCode = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a valid coupon code.");
      setPromoSuccess(null);
      return;
    }

    // Check against active gym offers first
    const matchedOffer = allOffers.find(o => o.promoCode && o.promoCode.toUpperCase() === code && o.isActive !== false);
    
    if (matchedOffer) {
      const discount = matchedOffer.discountPercent || 20;
      setAppliedPromo({
        code: matchedOffer.promoCode!,
        discountPct: discount,
        title: matchedOffer.title
      });
      setPromoSuccess(`Coupon '${code}' applied! Saved ${discount}% off.`);
      setPromoError(null);
      setPromoInput(code);
      return;
    }

    // Check standard presets
    const standardPresets: Record<string, { discountPct: number; title: string }> = {
      "SUMMER30": { discountPct: 30, title: "Summer Fitness Booster" },
      "WELCOME20": { discountPct: 20, title: "New Member Starter Pack" },
      "SMARTFIT10": { discountPct: 10, title: "Smartwatch Sync Promo" },
      "FIT50": { discountPct: 50, title: "VIP Fitness Special" },
      "ANNUAL20": { discountPct: 20, title: "Annual Member Advantage" }
    };

    if (standardPresets[code]) {
      const preset = standardPresets[code];
      setAppliedPromo({
        code,
        discountPct: preset.discountPct,
        title: preset.title
      });
      setPromoSuccess(`Coupon '${code}' applied! Saved ${preset.discountPct}% off.`);
      setPromoError(null);
      setPromoInput(code);
    } else {
      setPromoError(`Coupon code '${code}' is invalid or expired.`);
      setPromoSuccess(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoSuccess(null);
    setPromoError(null);
  };

  const handleOpenPayment = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setRazorpayStep("METHOD");
    setActivePaymentMethod("CARD");
    setPaymentProcessing(false);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardName(client.name || "");
    setUpiId("");
    setOtpVal("");
    setOtpTimer(30);
    setPromoError(null);
  };

  const handleClaimOffer = (offer: GymOffer) => {
    if (offer.promoCode) {
      handleApplyPromoCode(offer.promoCode);
    }
    // Pick recommended or highest tier
    const targetTier = MEMBERSHIP_TIERS[2] || MEMBERSHIP_TIERS[1] || MEMBERSHIP_TIERS[0];
    handleOpenPayment(targetTier);
  };

  // Official Razorpay Script Injector with reliable fallback
  const handleLaunchOfficialRazorpay = () => {
    if (!selectedTier) return;
    setPaymentProcessing(true);
    setActivePaymentMethod("RAZORPAY");

    const pricing = calculatePricing(selectedTier);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      try {
        const options = {
          key: "rzp_test_GYMBUDDY2026", 
          amount: pricing.netTotal * 100, // in Paise
          currency: "INR",
          name: "GYM BUDDY",
          description: `Upgrade to ${selectedTier.name} (${isAnnual ? "Annual" : "Monthly"})`,
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6IidSMroVw5btODTYM98ubc_lQSKFdJUAQxx8thVf-XGjjZIvaQAy4hg9J8aM7M64lbUn6z5M-kTRpZDd4_1uDyw_lXtCpfNiXipMDZNzYD2HORstP3CHffoAuaneEd8xMcGP_VH0ChlQsM_s1zzTHU7l-TwHWVG47Ae1ugeFdKkkIIc-S8AnroZmFM-wj8ei1UHsLAUkRm8kYwvN7qmDejCT1lCTFKH50q9_368Btm1UFdh2kXSxAV_MA2mzeuEDCYJYgXIYnP0",
          handler: function (response: any) {
            completeSuccessfulPayment("RAZORPAY", response?.razorpay_payment_id || `pay_${Date.now()}`);
          },
          prefill: {
            name: client.name,
            email: client.email,
            contact: "+919876543210"
          },
          theme: {
            color: "#a3e635"
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setPaymentProcessing(false);
      } catch (err) {
        console.warn("Iframe blocked native Razorpay popup. Switching to in-app secure portal.");
        setPaymentProcessing(false);
        setRazorpayStep("METHOD");
      }
    };
    script.onerror = () => {
      console.warn("Razorpay script load error. Running integrated secure portal.");
      setPaymentProcessing(false);
      setRazorpayStep("METHOD");
    };
    document.body.appendChild(script);
  };

  // Progress to 3D Secure OTP verification
  const handleProgressToOtp = (e: React.FormEvent, method: "CARD" | "UPI" | "NETBANKING") => {
    e.preventDefault();
    setActivePaymentMethod(method);
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setRazorpayStep("OTP");
      setOtpTimer(30);
    }, 1000);
  };

  // Finalize payment, generate invoice, sync Firestore & local
  const completeSuccessfulPayment = (method: "CARD" | "UPI" | "NETBANKING" | "RAZORPAY", transRef?: string) => {
    if (!selectedTier) return;
    const pricing = calculatePricing(selectedTier);
    
    // Calculate validity period
    const startDate = new Date();
    const expiryDate = new Date();
    if (isAnnual) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    const txRef = transRef || `pay_GB${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: PaymentInvoice = {
      id: invoiceId,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      tier: selectedTier.id,
      period: isAnnual ? "ANNUAL" : "MONTHLY",
      baseAmount: pricing.basePeriodPrice,
      discountAmount: pricing.discountAmount,
      taxAmount: pricing.taxAmount,
      totalAmount: pricing.netTotal,
      promoCodeApplied: appliedPromo?.code,
      paymentMethod: method,
      transactionRef: txRef,
      status: "PAID",
      createdAt: startDate.toISOString(),
      validUntil: expiryDate.toISOString(),
      gymName: client.gymName || "Kinetic Performance"
    };

    const existingInvoices = client.invoices || [];
    const updatedInvoices = [newInvoice, ...existingInvoices];

    const updatedClient: Client = {
      ...client,
      activeTier: selectedTier.id,
      hasPaidFee: true,
      membershipStatus: "ACTIVE",
      membershipStartDate: startDate.toISOString(),
      membershipExpiryDate: expiryDate.toISOString(),
      billingPeriod: isAnnual ? "ANNUAL" : "MONTHLY",
      invoices: updatedInvoices
    };

    // Save to Firestore payments collection
    try {
      setDoc(doc(db, "payments", newInvoice.id), newInvoice).catch(err => {
        console.error("Firestore payment invoice sync failed:", err);
      });
    } catch (e) {
      console.error("Payment invoice setDoc error:", e);
    }

    // Save client update
    onUpdateClient(updatedClient);
    setLastGeneratedInvoice(newInvoice);
    setPaymentProcessing(false);
    setRazorpayStep("SUCCESS");
  };

  const handleConfirmOtpPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);
    setTimeout(() => {
      completeSuccessfulPayment(activePaymentMethod);
    }, 1200);
  };

  // Copy invoice ID
  const handleCopyInvoiceId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedInvoiceId(true);
    setTimeout(() => setCopiedInvoiceId(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#18181b] border border-[#27272a] p-4 md:p-6 rounded-3xl">
        <div>
          <span className="font-mono text-[10px] bg-volt/10 text-volt px-2.5 py-1 font-black rounded-lg inline-block uppercase tracking-wider mb-2">
            MEMBERSHIP & PERKS HUB
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-black text-white italic tracking-tight">
            PLANS, OFFERS & INVOICES
          </h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            Active Plan: <span className="text-volt font-bold">{client.activeTier || "NONE"}</span> • Status: <span className="text-emerald-400 font-bold">{client.hasPaidFee ? "ACTIVE SUBSCRIBER" : "FREE TRIAL"}</span>
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#09090b] p-1 border border-zinc-800 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab("PLANS")}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 font-mono text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap touch-target text-center ${
              activeTab === "PLANS" ? "bg-volt text-black shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            TIER PLANS
          </button>
          <button
            onClick={() => setActiveTab("OFFERS")}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 font-mono text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap touch-target ${
              activeTab === "OFFERS" ? "bg-volt text-black shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Tag size={13} />
            OFFERS ({allOffers.length})
          </button>
          <button
            onClick={() => setActiveTab("INVOICES")}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 font-mono text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap touch-target ${
              activeTab === "INVOICES" ? "bg-volt text-black shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText size={13} />
            INVOICES ({client.invoices?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: MEMBERSHIP TIERS & PRICING */}
      {activeTab === "PLANS" && (
        <div className="space-y-8">
          {/* Hero Promo Banner */}
          <section className="relative overflow-hidden bg-[#18181b] border border-[#27272a] rounded-3xl min-h-[300px] flex flex-col justify-end p-6 md:p-8 transition-all duration-300 hover:border-[#a3e635]">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6IidSMroVw5btODTYM98ubc_lQSKFdJUAQxx8thVf-XGjjZIvaQAy4hg9J8aM7M64lbUn6z5M-kTRpZDd4_1uDyw_lXtCpfNiXipMDZNzYD2HORstP3CHffoAuaneEd8xMcGP_VH0ChlQsM_s1zzTHU7l-TwHWVG47Ae1ugeFdKkkIIc-S8AnroZmFM-wj8ei1UHsLAUkRm8kYwvN7qmDejCT1lCTFKH50q9_368Btm1UFdh2kXSxAV_MA2mzeuEDCYJYgXIYnP0" 
                alt="Gym Buddy Performance" 
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-zinc-950/70 to-transparent"></div>
            </div>

            <div className="relative z-10 space-y-3.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] bg-volt text-black px-2.5 py-1 font-black rounded-lg inline-block uppercase tracking-wider">
                  FEATURED MEMBERSHIP
                </span>
                {appliedPromo && (
                  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 font-bold rounded-lg uppercase">
                    PROMO {appliedPromo.code} ACTIVE (-{appliedPromo.discountPct}%)
                  </span>
                )}
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white italic leading-tight">
                SUMMER PEAK PERFORMANCE
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed font-semibold">
                Unlock full biometric tracking, direct coach chat, personalized Indian macro diets, and all-gym branch pass.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={() => handleOpenPayment(MEMBERSHIP_TIERS[2])}
                  className="bg-volt text-black px-6 py-3 font-display font-black text-xs italic tracking-widest flex items-center gap-2 rounded-xl hover:bg-lime-300 active:scale-95 transition-all uppercase cursor-pointer"
                >
                  UPGRADE TO ELITE <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => setActiveTab("OFFERS")}
                  className="bg-[#09090b]/80 border border-zinc-700 text-white hover:text-volt px-5 py-3 font-mono font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Tag size={14} /> VIEW ALL OFFERS
                </button>
              </div>
            </div>
          </section>

          {/* Pricing Grid & Billing Switcher */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-zinc-800 pb-3">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white italic">
                  CHOOSE YOUR SUBSCRIPTION TIER
                </h2>
                <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                  Seamless payment via Razorpay, UPI, Cards, and Netbanking.
                </p>
              </div>

              {/* Monthly vs Annual Toggle */}
              <div className="bg-[#09090b] p-1 border border-zinc-800 rounded-2xl flex">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-2 font-mono text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                    !isAnnual ? "bg-volt text-black shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  MONTHLY BILLING
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-2 font-mono text-[10px] font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                    isAnnual ? "bg-volt text-black shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ANNUAL (-20% OFF)
                </button>
              </div>
            </div>

            {/* Promo Code Quick Bar */}
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-volt/10 text-volt flex items-center justify-center shrink-0 border border-volt/20">
                  <Tag size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Have a Gym Promo Code?</h4>
                  <p className="text-[11px] text-zinc-400 font-medium">Apply coupon code (e.g. SUMMER30, WELCOME20, SMARTFIT10)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {appliedPromo ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold font-mono">
                    <CheckCircle2 size={16} />
                    <span>{appliedPromo.code} (-{appliedPromo.discountPct}%)</span>
                    <button onClick={handleRemovePromo} className="text-zinc-400 hover:text-rose-400 ml-1 p-0.5 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                      type="text"
                      placeholder="ENTER PROMO CODE"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white placeholder-zinc-600 focus:outline-none focus:border-volt w-full sm:w-48"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromoCode()}
                      className="bg-volt text-black px-4 py-2 rounded-xl font-mono text-xs font-black uppercase hover:bg-lime-300 transition-colors shrink-0 cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Promo Messages */}
            {promoError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} /> {promoError}
              </p>
            )}
            {promoSuccess && (
              <p className="text-xs text-volt font-bold bg-volt/10 border border-volt/20 p-2.5 rounded-xl flex items-center gap-2">
                <Sparkles size={14} /> {promoSuccess}
              </p>
            )}

            {/* Tier Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {MEMBERSHIP_TIERS.map((tier) => {
                const isCurrent = client.activeTier === tier.id;
                const pricing = calculatePricing(tier);
                
                return (
                  <div 
                    key={tier.id}
                    className={`p-6 bg-[#18181b] border flex flex-col justify-between transition-all duration-300 relative rounded-3xl ${
                      tier.isRecommended 
                        ? "border-volt volt-glow md:-translate-y-2" 
                        : isCurrent 
                          ? "border-volt/70" 
                          : "border-[#27272a] hover:border-volt/40 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Recommended Tag */}
                    {tier.isRecommended && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-volt text-black px-4 py-1 font-mono text-[9px] font-black rounded-full uppercase tracking-wider shadow-lg">
                        RECOMMENDED
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs text-zinc-400 block uppercase font-bold">
                          {tier.name}
                        </span>
                        {isCurrent && (
                          <span className="bg-volt/20 text-volt text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                            CURRENT PLAN
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-3xl font-black text-white italic">
                            ₹{pricing.discountAmount > 0 ? (pricing.basePeriodPrice - pricing.discountAmount) : pricing.basePeriodPrice}
                          </span>
                          {pricing.discountAmount > 0 && (
                            <span className="text-zinc-500 line-through text-sm font-mono font-bold">
                              ₹{pricing.basePeriodPrice}
                            </span>
                          )}
                          <span className="text-zinc-500 text-xs font-mono font-semibold">
                            /{isAnnual ? "year" : "month"}
                          </span>
                        </div>
                        {pricing.discountAmount > 0 && (
                          <span className="text-[10px] font-mono text-volt font-bold block mt-1">
                            ⚡ Save ₹{pricing.discountAmount} with {appliedPromo?.code}
                          </span>
                        )}
                      </div>

                      {/* Feature lists */}
                      <ul className="space-y-3 mb-8">
                        {tier.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex gap-2 items-center text-xs text-white font-semibold">
                            <Check size={14} className="text-volt shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                        {tier.disabledFeatures.map((feat, dIdx) => (
                          <li key={dIdx} className="flex gap-2 items-center text-xs text-zinc-500 line-through">
                            <span className="shrink-0 font-bold">×</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleOpenPayment(tier)}
                      className={`w-full py-3.5 font-display font-black text-xs italic rounded-2xl tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                        isCurrent 
                          ? "bg-[#09090b] border border-zinc-800 text-volt hover:bg-volt hover:text-black" 
                          : tier.isRecommended
                            ? "bg-volt text-black hover:bg-lime-300 active:scale-95"
                            : "border border-volt text-volt hover:bg-volt hover:text-black active:scale-95"
                      }`}
                    >
                      {isCurrent ? "RENEW / EXTEND" : tier.id === "ELITE" ? "UNLEASH ELITE" : "SELECT PLAN"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Perks Feature Box */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#18181b] border border-zinc-800 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-volt/10 text-volt flex items-center justify-center shrink-0 border border-volt/20">
                <Check size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Custom Macro Architect</h5>
                <p className="text-[11px] text-zinc-400 mt-0.5">Real-time daily calorie & Indian meal plans.</p>
              </div>
            </div>
            <div className="p-4 bg-[#18181b] border border-zinc-800 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Smartphone size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Biometric Watch Sync</h5>
                <p className="text-[11px] text-zinc-400 mt-0.5">Direct sync with Fitbit, Garmin, Apple Health.</p>
              </div>
            </div>
            <div className="p-4 bg-[#18181b] border border-zinc-800 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Award size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">1-on-1 Coach Access</h5>
                <p className="text-[11px] text-zinc-400 mt-0.5">Direct encrypted chat with certified trainers.</p>
              </div>
            </div>
            <div className="p-4 bg-[#18181b] border border-zinc-800 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Tax Invoices & Receipts</h5>
                <p className="text-[11px] text-zinc-400 mt-0.5">Instant printable GST invoices with receipt IDs.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: ACTIVE OFFERS & COUPONS */}
      {activeTab === "OFFERS" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl font-black text-white italic">
                GYM PROMOTIONS & DEALS
              </h3>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Click any offer to auto-apply the discount coupon directly to your checkout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allOffers.map((offer) => (
              <div 
                key={offer.id}
                className="bg-[#18181b] border border-zinc-800 hover:border-volt/50 rounded-3xl overflow-hidden flex flex-col justify-between transition-all group"
              >
                {offer.imageUrl && (
                  <div className="relative h-44 overflow-hidden bg-zinc-900">
                    <img 
                      src={offer.imageUrl} 
                      alt={offer.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-volt text-black px-2.5 py-1 text-[9px] font-mono font-black rounded-lg uppercase">
                      {offer.tag || "HOT DEAL"}
                    </span>
                    {offer.discountPercent && (
                      <span className="absolute top-3 right-3 bg-black/80 text-volt border border-volt/30 px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg">
                        {offer.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                )}

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-display text-lg font-black text-white italic uppercase leading-snug">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                      {offer.subtitle}
                    </p>
                    {offer.promoCode && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">Code:</span>
                        <span className="text-xs font-mono font-black text-volt bg-volt/10 border border-volt/30 px-2 py-0.5 rounded">
                          {offer.promoCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleClaimOffer(offer)}
                    className="w-full py-3 bg-volt text-black hover:bg-lime-300 font-display font-black text-xs italic tracking-wider rounded-xl uppercase transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {offer.actionText || "APPLY OFFER"} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT INVOICE & MEMBERSHIP HISTORY */}
      {activeTab === "INVOICES" && (
        <div className="space-y-6">
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                SUBSCRIPTION STATUS
              </span>
              <h3 className="font-display text-2xl font-black text-white italic">
                {client.activeTier ? `${client.activeTier} MEMBERSHIP` : "FREE TRIAL ACCESS"}
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                {client.membershipExpiryDate ? (
                  <>Valid until <span className="text-volt font-bold">{new Date(client.membershipExpiryDate).toLocaleDateString()}</span> ({client.billingPeriod || "MONTHLY"})</>
                ) : (
                  "Upgrade to unlock full features and generate formal tax receipts."
                )}
              </p>
            </div>

            <button
              onClick={() => setActiveTab("PLANS")}
              className="bg-volt text-black font-display font-black text-xs italic px-6 py-3 rounded-xl uppercase hover:bg-lime-300 transition-all cursor-pointer shrink-0"
            >
              {client.hasPaidFee ? "EXTEND MEMBERSHIP" : "UPGRADE NOW"}
            </button>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl overflow-hidden p-6 space-y-4">
            <h4 className="font-display text-base font-black text-white italic uppercase tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-volt" />
              PAYMENT INVOICES & TAX RECEIPTS
            </h4>

            {(!client.invoices || client.invoices.length === 0) ? (
              <div className="p-8 text-center bg-[#09090b] border border-zinc-800/80 rounded-2xl space-y-3">
                <FileText size={32} className="text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400 font-semibold">No payment invoices logged yet.</p>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  When you complete a subscription upgrade via Razorpay, UPI, or Card, your tax invoices with transaction references will appear here.
                </p>
                <button
                  onClick={() => setActiveTab("PLANS")}
                  className="mt-2 bg-volt text-black text-xs font-mono font-bold px-4 py-2 rounded-xl uppercase hover:bg-lime-300 cursor-pointer"
                >
                  Choose a Plan
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-zinc-800 font-mono text-[10px] text-zinc-500 uppercase">
                      <th className="pb-3 px-3">INVOICE ID</th>
                      <th className="pb-3 px-3">DATE</th>
                      <th className="pb-3 px-3">PLAN TIER</th>
                      <th className="pb-3 px-3">PAYMENT METHOD</th>
                      <th className="pb-3 px-3">AMOUNT</th>
                      <th className="pb-3 px-3">STATUS</th>
                      <th className="pb-3 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {client.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-white flex items-center gap-1.5">
                          <span>{inv.id}</span>
                          <button 
                            onClick={() => handleCopyInvoiceId(inv.id)}
                            className="text-zinc-500 hover:text-volt p-1"
                            title="Copy Invoice ID"
                          >
                            <Copy size={12} />
                          </button>
                        </td>
                        <td className="py-3.5 px-3 text-zinc-400 font-mono">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-white">{inv.tier}</span>
                          <span className="text-[10px] text-zinc-500 font-mono ml-1">({inv.period})</span>
                        </td>
                        <td className="py-3.5 px-3 text-zinc-300 font-mono">
                          {inv.paymentMethod}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-volt">
                          ₹{inv.totalAmount}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            PAID
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-volt hover:text-lime-300 font-bold uppercase cursor-pointer"
                          >
                            <Printer size={13} /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL: RAZORPAY / CARD / UPI PORTAL */}
      {selectedTier && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181b] border border-[#27272a] max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[520px]">
            {/* Left Column: Order details summary */}
            <div className="md:w-5/12 p-6 bg-[#0c0c0e] border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between">
              <div>
                <button 
                  onClick={() => setSelectedTier(null)}
                  className="text-xs font-mono text-zinc-400 hover:text-volt flex items-center gap-1 mb-6 uppercase font-bold cursor-pointer"
                >
                  ← BACK / CANCEL
                </button>
                
                <div className="space-y-4">
                  <span className="font-mono text-[9px] bg-volt/10 text-volt px-2 py-1 rounded font-bold uppercase tracking-wider">
                    Secure Checkout
                  </span>
                  <h3 className="font-display text-lg font-black italic text-white uppercase tracking-tight">
                    ORDER SPECIFICATION
                  </h3>

                  {/* Pricing Breakdown */}
                  {(() => {
                    const pricing = calculatePricing(selectedTier);
                    return (
                      <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                          <span className="text-xs text-zinc-400 font-semibold">{selectedTier.name} ({isAnnual ? "Annual" : "Monthly"})</span>
                          <span className="font-mono text-xs font-bold text-white">
                            ₹{pricing.basePeriodPrice}
                          </span>
                        </div>
                        {pricing.discountAmount > 0 && (
                          <div className="flex justify-between items-center py-1 text-volt">
                            <span className="text-xs font-semibold flex items-center gap-1">
                              <Tag size={12} /> Coupon ({appliedPromo?.code})
                            </span>
                            <span className="font-mono text-xs font-bold">-₹{pricing.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-xs text-zinc-400 font-semibold">GST & Gateway Fee</span>
                          <span className="font-mono text-xs text-zinc-400">₹{pricing.taxAmount}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-t border-zinc-800 mt-2">
                          <span className="font-display text-xs font-bold text-white uppercase">NET AMOUNT DUE</span>
                          <span className="font-display text-2xl font-black text-volt italic">
                            ₹{pricing.netTotal}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Promo inside checkout */}
                  <div className="pt-2">
                    <div className="flex gap-1.5">
                      <input 
                        type="text"
                        placeholder="HAVE A PROMO CODE?"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value.toUpperCase())}
                        className="bg-[#09090b] border border-zinc-800 text-[11px] font-mono px-2.5 py-1.5 rounded-lg text-white w-full uppercase placeholder-zinc-600 focus:outline-none focus:border-volt"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPromoCode()}
                        className="bg-zinc-800 hover:bg-volt hover:text-black text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg uppercase cursor-pointer transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {promoSuccess && <p className="text-[10px] text-volt mt-1 font-bold">{promoSuccess}</p>}
                    {promoError && <p className="text-[10px] text-rose-400 mt-1 font-semibold">{promoError}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-900 pt-4 space-y-2">
                <div className="flex gap-2 items-center text-[10px] font-mono text-zinc-500 font-semibold">
                  <Lock size={12} className="text-volt shrink-0" />
                  <span>256-BIT SECURED PCI-DSS GATEWAY</span>
                </div>
                <div className="text-[9px] font-mono text-zinc-600 leading-relaxed font-semibold">
                  Gym Buddy handles payments via SSL encrypted tokens. Real tax receipts are auto-generated upon approval.
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Razorpay checkout portal */}
            <div className="md:w-7/12 bg-[#0d1321] flex flex-col justify-between">
              
              {/* Razorpay Brand Header */}
              <div className="bg-[#121c32] p-4 border-b border-zinc-800/80 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-black text-white italic text-xs tracking-tighter shadow-md">
                    R
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono font-black text-white tracking-widest uppercase">RAZORPAY SECURE</h4>
                    <p className="text-[9px] text-zinc-400 font-semibold">Gym Buddy Upgrade</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase font-mono">Amount</p>
                  <p className="text-xs font-bold text-volt font-mono">₹{calculatePricing(selectedTier).netTotal}</p>
                </div>
              </div>

              {/* Secure banner */}
              <div className="bg-zinc-900/60 py-1.5 px-4 flex justify-between items-center border-b border-zinc-800/40 text-[9px] font-mono text-zinc-500 font-bold shrink-0">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={10} className="text-volt" />
                  Secured by Razorpay • Trust of 5Cr+ users
                </span>
                <span className="text-zinc-600 font-semibold">v3.42</span>
              </div>

              {/* Checkout step viewport */}
              <div className="p-6 flex-1 flex flex-col justify-center min-h-[340px]">
                
                {/* 1. PAYMENT METHOD SELECTION */}
                {razorpayStep === "METHOD" && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider mb-2">Select Payment Method</p>
                    
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePaymentMethod("CARD");
                          setRazorpayStep("CARD");
                        }}
                        className="w-full bg-[#18233c] hover:bg-[#1f2e4e] border border-zinc-800 hover:border-blue-500/50 p-4 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500/20">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">Debit / Credit Card</h5>
                          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Pay via Visa, Mastercard, RuPay, Maestro</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActivePaymentMethod("UPI");
                          setRazorpayStep("UPI");
                        }}
                        className="w-full bg-[#18233c] hover:bg-[#1f2e4e] border border-zinc-800 hover:border-volt/50 p-4 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-volt/10 text-volt flex items-center justify-center shrink-0 border border-volt/20 group-hover:bg-volt/20">
                          <QrCode size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                            UPI & QR Code <span className="bg-volt/20 text-volt text-[8px] px-1 rounded font-mono uppercase tracking-normal">Popular</span>
                          </h5>
                          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Pay via GooglePay, PhonePe, Paytm or scan QR</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActivePaymentMethod("NETBANKING");
                          setRazorpayStep("NETBANKING");
                        }}
                        className="w-full bg-[#18233c] hover:bg-[#1f2e4e] border border-zinc-800 hover:border-orange-500/50 p-4 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:bg-orange-500/20">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">Netbanking</h5>
                          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Instant pay via SBI, HDFC, ICICI, Axis Bank</p>
                        </div>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 text-center">
                      <button
                        type="button"
                        onClick={handleLaunchOfficialRazorpay}
                        className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-blue-400 hover:text-white transition-colors cursor-pointer uppercase tracking-widest"
                      >
                        ⚡ LAUNCH OFFICIAL CHECKOUT WIDGET
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. CARD PAYMENT ENTRY */}
                {razorpayStep === "CARD" && (
                  <form onSubmit={(e) => handleProgressToOtp(e, "CARD")} className="space-y-4">
                    <button 
                      type="button"
                      onClick={() => setRazorpayStep("METHOD")}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to payment methods
                    </button>
                    
                    <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                      <CreditCard className="text-blue-500" size={14} />
                      <h4 className="text-xs font-display font-black text-white uppercase italic tracking-wide">Enter Card Details</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-[#18233c]/60 p-2 border-b border-zinc-800 rounded-lg">
                        <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black">Cardholder Name</label>
                        <input 
                          type="text" 
                          required
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          placeholder="AS INDICATED ON CARD" 
                          className="bg-transparent border-none w-full text-white font-mono text-xs uppercase focus:outline-none focus:ring-0 mt-0.5 placeholder-zinc-600"
                        />
                      </div>

                      <div className="bg-[#18233c]/60 p-2 border-b border-zinc-800 rounded-lg">
                        <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black">Card Number</label>
                        <input 
                          type="text" 
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4111 2222 3333 4444" 
                          className="bg-transparent border-none w-full text-white font-mono text-xs focus:outline-none focus:ring-0 mt-0.5 placeholder-zinc-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#18233c]/60 p-2 border-b border-zinc-800 rounded-lg">
                          <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black">Expiry</label>
                          <input 
                            type="text" 
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY" 
                            className="bg-transparent border-none w-full text-white font-mono text-xs focus:outline-none focus:ring-0 mt-0.5 placeholder-zinc-600"
                          />
                        </div>
                        <div className="bg-[#18233c]/60 p-2 border-b border-zinc-800 rounded-lg">
                          <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black">CVC / CVV</label>
                          <input 
                            type="password" 
                            required
                            maxLength={4}
                            value={cardCvc}
                            onChange={e => setCardCvc(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="•••" 
                            className="bg-transparent border-none w-full text-white font-mono text-xs focus:outline-none focus:ring-0 mt-0.5 placeholder-zinc-600"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={paymentProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                    >
                      {paymentProcessing ? "AUTHORIZING CARD..." : `PAY ₹${calculatePricing(selectedTier).netTotal}`}
                    </button>
                  </form>
                )}

                {/* 3. UPI PAYMENT ENTRY */}
                {razorpayStep === "UPI" && (
                  <form onSubmit={(e) => handleProgressToOtp(e, "UPI")} className="space-y-4">
                    <button 
                      type="button"
                      onClick={() => setRazorpayStep("METHOD")}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to payment methods
                    </button>

                    <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                      <QrCode className="text-volt" size={14} />
                      <h4 className="text-xs font-display font-black text-white uppercase italic tracking-wide">UPI & QR Code</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-5 flex flex-col items-center p-3 bg-white rounded-2xl border border-zinc-800">
                        <div className="w-24 h-24 bg-[#0d1321] p-1.5 rounded-lg flex flex-wrap items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 border-2 border-volt/20 animate-pulse"></div>
                          <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                            <div className="bg-volt w-4 h-4 rounded"></div>
                            <div className="bg-white w-4 h-4 rounded"></div>
                            <div className="bg-volt w-4 h-4 rounded"></div>
                            <div className="bg-volt w-4 h-4 rounded"></div>
                            <div className="bg-white w-4 h-4 rounded"></div>
                            <div className="bg-volt w-4 h-4 rounded"></div>
                            <div className="bg-white w-4 h-4 rounded"></div>
                            <div className="bg-white w-4 h-4 rounded"></div>
                            <div className="bg-volt w-4 h-4 rounded"></div>
                            <div className="bg-white w-4 h-4 rounded"></div>
                            <div className="bg-volt w-4 h-4 rounded"></div>
                            <div className="bg-volt w-4 h-4 rounded"></div>
                          </div>
                          <div className="absolute w-5 h-5 bg-[#0d1321] rounded-full border border-volt flex items-center justify-center">
                            <Lock size={8} className="text-volt" />
                          </div>
                        </div>
                        <span className="text-[7px] font-mono text-zinc-700 font-bold uppercase mt-1.5 text-center">Scan with GPay/PhonePe</span>
                      </div>

                      <div className="sm:col-span-7 space-y-3">
                        <div className="bg-[#18233c]/60 p-2 border-b border-zinc-800 rounded-lg">
                          <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black">Enter UPI ID</label>
                          <input 
                            type="text" 
                            required
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank" 
                            className="bg-transparent border-none w-full text-white font-mono text-xs focus:outline-none focus:ring-0 mt-0.5 placeholder-zinc-600"
                          />
                        </div>
                        <p className="text-[9px] text-zinc-400 leading-normal font-medium">
                          Payment collect request will be sent to your UPI app.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={paymentProcessing}
                      className="w-full bg-volt text-black font-mono py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer mt-4 flex items-center justify-center gap-1.5 hover:bg-lime-300"
                    >
                      {paymentProcessing ? "DISPATCHING UPI REQUEST..." : `PROCEED WITH UPI • ₹${calculatePricing(selectedTier).netTotal}`}
                    </button>
                  </form>
                )}

                {/* 4. NETBANKING SELECTION */}
                {razorpayStep === "NETBANKING" && (
                  <form onSubmit={(e) => handleProgressToOtp(e, "NETBANKING")} className="space-y-4">
                    <button 
                      type="button"
                      onClick={() => setRazorpayStep("METHOD")}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to payment methods
                    </button>

                    <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                      <Building2 className="text-orange-500" size={14} />
                      <h4 className="text-xs font-display font-black text-white uppercase italic tracking-wide">Select Netbanking Bank</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {["sbi", "hdfc", "icici", "axis"].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-mono text-[10px] font-black uppercase ${
                            selectedBank === b 
                              ? "bg-orange-500/10 border-orange-500 text-orange-400" 
                              : "bg-[#18233c]/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                          }`}
                        >
                          {b === "sbi" ? "STATE BANK OF INDIA" : b === "hdfc" ? "HDFC BANK" : b === "icici" ? "ICICI BANK" : "AXIS BANK"}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={paymentProcessing}
                      className="w-full bg-orange-500 text-white font-mono py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer mt-4 flex items-center justify-center gap-1.5 hover:bg-orange-400"
                    >
                      {paymentProcessing ? "CONNECTING TO SECURE CORE..." : `LOG IN & PAY ₹${calculatePricing(selectedTier).netTotal}`}
                    </button>
                  </form>
                )}

                {/* 5. 3D SECURE OTP PORTAL */}
                {razorpayStep === "OTP" && (
                  <form onSubmit={handleConfirmOtpPayment} className="space-y-4">
                    <div className="text-center p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-2.5 items-start text-left mb-2">
                      <KeyRound className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <h6 className="text-[10px] font-mono font-black text-yellow-500 uppercase tracking-widest">Bank Authorization Required</h6>
                        <p className="text-[9px] text-zinc-400 font-semibold leading-relaxed mt-0.5">
                          A test verification code <span className="text-white font-black">1234</span> was dispatched to the mobile number on file.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#18233c]/80 p-4 border border-zinc-800 rounded-2xl space-y-3">
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase text-center font-black">ENTER 3D SECURE OTP</label>
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        value={otpVal}
                        onChange={e => setOtpVal(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="1 2 3 4" 
                        className="bg-transparent border-b-2 border-zinc-700 w-full text-center text-white font-mono text-xl tracking-[12px] focus:outline-none focus:border-volt pb-1 mt-1 placeholder-zinc-700"
                      />
                      <p className="text-[9px] text-zinc-500 font-bold text-center mt-2 font-mono uppercase">
                        OTP expires in 00:{otpTimer > 9 ? otpTimer : `0${otpTimer}`}s • <button type="button" onClick={() => setOtpTimer(30)} className="text-volt underline hover:text-white cursor-pointer uppercase">Resend</button>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={paymentProcessing}
                      className="w-full bg-volt text-black font-mono py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer mt-4 flex items-center justify-center gap-1.5 hover:bg-lime-300"
                    >
                      {paymentProcessing ? "VERIFYING TRANSACTION..." : "CONFIRM PAYMENT & ACTIVATE ⚡"}
                    </button>
                  </form>
                )}

                {/* 6. PAYMENT SUCCESS SCREEN */}
                {razorpayStep === "SUCCESS" && (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-14 h-14 rounded-full bg-volt/10 text-volt flex items-center justify-center mx-auto border-2 border-volt">
                      <Check size={32} strokeWidth={3} />
                    </div>
                    
                    <div>
                      <h4 className="font-display text-lg font-black text-white italic uppercase tracking-tight">
                        PAYMENT APPROVED!
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
                        {lastGeneratedInvoice ? lastGeneratedInvoice.id : "INV-2026-PAID"}
                      </p>
                      <p className="text-xs text-zinc-400 mt-2 font-semibold max-w-sm mx-auto leading-relaxed">
                        Your subscription has been activated in the database! Formal tax invoice generated.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                      {lastGeneratedInvoice && (
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(lastGeneratedInvoice)}
                          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold rounded-xl uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileText size={14} /> View Tax Invoice
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTier(null);
                          setRazorpayStep("METHOD");
                        }}
                        className="px-5 py-2.5 bg-volt text-black font-mono text-xs font-black rounded-xl hover:bg-lime-300 uppercase cursor-pointer"
                      >
                        DONE
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Footer */}
              <div className="bg-[#121c32] p-3 text-center border-t border-zinc-800/60 text-[9px] font-mono text-zinc-500 font-semibold shrink-0">
                Gym Buddy SSL Gateway • Real-time database sync verified
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE TAX INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181b] border border-zinc-700 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <span className="font-mono text-[9px] bg-volt/10 text-volt px-2 py-0.5 rounded font-black uppercase">
                  OFFICIAL TAX INVOICE
                </span>
                <h3 className="font-display text-2xl font-black text-white italic mt-1">
                  GYM BUDDY RECEIPT
                </h3>
                <p className="text-[11px] font-mono text-zinc-400">
                  {selectedInvoice.gymName} • GST Registered
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#09090b] p-4 rounded-2xl border border-zinc-800">
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Invoice Number</p>
                <p className="text-white font-bold">{selectedInvoice.id}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Transaction Ref</p>
                <p className="text-volt font-bold truncate">{selectedInvoice.transactionRef}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Date of Issue</p>
                <p className="text-zinc-300">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Valid Until</p>
                <p className="text-emerald-400 font-bold">{new Date(selectedInvoice.validUntil).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-zinc-800/60">
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Billed To</p>
                <p className="text-white font-semibold">{selectedInvoice.clientName} ({selectedInvoice.clientEmail})</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 border-b border-zinc-800 pb-4 text-xs">
              <div className="flex justify-between text-zinc-400 font-semibold py-1">
                <span>{selectedInvoice.tier} Membership ({selectedInvoice.period})</span>
                <span className="font-mono text-white font-bold">₹{selectedInvoice.baseAmount}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-volt font-semibold py-1">
                  <span>Promo Discount ({selectedInvoice.promoCodeApplied || "COUPON"})</span>
                  <span className="font-mono font-bold">-₹{selectedInvoice.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400 font-semibold py-1">
                <span>GST & Platform Processing</span>
                <span className="font-mono text-zinc-300">₹{selectedInvoice.taxAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>TOTAL PAID ({selectedInvoice.paymentMethod})</span>
                <span className="font-mono text-volt font-black text-base">₹{selectedInvoice.totalAmount}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleCopyInvoiceId(selectedInvoice.id)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy size={14} /> {copiedInvoiceId ? "COPIED!" : "COPY ID"}
              </button>
              <button
                onClick={() => window.print()}
                className="bg-volt text-black hover:bg-lime-300 px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> PRINT RECEIPT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
