import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, User as UserIcon, Dumbbell, Mail, Lock, LogIn, AlertCircle, 
  Sparkles, Key, Sun, Moon, Building, UserPlus, RefreshCw, Trash2, CheckCircle2,
  Smartphone, ArrowRight, ChevronDown, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Client, Trainer } from "../types";
import { KineticDatabase } from "../db";
import { DEMO_USERS, DEMO_CLIENTS, DEMO_TRAINERS } from "../demoData";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithPopup,
  ConfirmationResult
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸", label: "United States (+1)" },
  { code: "+91", country: "IN", flag: "🇮🇳", label: "India (+91)" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "United Kingdom (+44)" },
  { code: "+61", country: "AU", flag: "🇦🇺", label: "Australia (+61)" },
  { code: "+49", country: "DE", flag: "🇩🇪", label: "Germany (+49)" },
  { code: "+971", country: "AE", flag: "🇦🇪", label: "UAE (+971)" },
  { code: "+65", country: "SG", flag: "🇸🇬", label: "Singapore (+65)" },
  { code: "+81", country: "JP", flag: "🇯🇵", label: "Japan (+81)" },
];

export default function AuthScreen({ onAuthSuccess, theme = "dark", onToggleTheme }: AuthScreenProps) {
  // Main Tab: "PASSCODE" (Staff & Athletes) vs "OWNER" (Gym Owner: Google, Phone, and Email)
  const [activeTab, setActiveTab] = useState<"PASSCODE" | "OWNER">("OWNER");

  // Phone OTP States
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Google Sign-In Loading State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Onboarding Modal for New Users (Google or Mobile OTP)
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<{
    uid: string;
    email?: string;
    phone?: string;
    displayName?: string;
    photoURL?: string;
    provider: "google" | "phone";
  } | null>(null);

  const [onboardingRole, setOnboardingRole] = useState<"CLIENT" | "TRAINER" | "OWNER">("OWNER");
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingGymName, setOnboardingGymName] = useState("Kinetic Performance");
  const [onboardingSpecialty, setOnboardingSpecialty] = useState("Strength & Conditioning");

  // Passwordless login (Staff & Clients)
  const [loginIdInput, setLoginIdInput] = useState("");

  // Owner Email Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisteringOwner, setIsRegisteringOwner] = useState(false);
  const [registerGymName, setRegisterGymName] = useState("");
  const [registerOwnerName, setRegisterOwnerName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // UI status notifications
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-focus OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  // Helper to trigger haptic feedback
  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style }).catch(() => {});
    }
  };

  // Helper to create or link client profile for new users
  const createDefaultClientProfile = (userId: string, name: string, emailOrPhone: string, avatarUrl: string, gymName: string): Client => {
    const clientId = "client_" + userId;
    return {
      id: clientId,
      name: name,
      email: emailOrPhone,
      level: "Active Member",
      avatarUrl: avatarUrl,
      activeTier: "PRO",
      hasPaidFee: true,
      membershipStatus: "ACTIVE",
      membershipStartDate: new Date().toISOString().split("T")[0],
      gymName: gymName || "Kinetic Performance",
      workoutPlan: {
        id: "wp_" + Date.now(),
        title: "Foundation Hypertrophy",
        subtitle: "Full Body Starter Split",
        durationMin: 45,
        targetKcal: 420,
        exercises: [
          {
            id: "ex_1",
            name: "Barbell Back Squat",
            category: "LEGS",
            type: "STRENGTH",
            imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80",
            sets: [
              { setNumber: 1, previous: "60kg x 10", weight: 60, reps: 10, completed: false },
              { setNumber: 2, previous: "70kg x 8", weight: 70, reps: 8, completed: false },
              { setNumber: 3, previous: "75kg x 6", weight: 75, reps: 6, completed: false },
            ]
          },
          {
            id: "ex_2",
            name: "Dumbbell Incline Bench Press",
            category: "CHEST",
            type: "HYPERTROPHY",
            imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
            sets: [
              { setNumber: 1, previous: "22kg x 12", weight: 22, reps: 12, completed: false },
              { setNumber: 2, previous: "24kg x 10", weight: 24, reps: 10, completed: false },
            ]
          }
        ],
        date: new Date().toISOString().split("T")[0]
      },
      dietPlan: {
        id: "dp_" + Date.now(),
        date: new Date().toISOString().split("T")[0],
        macros: {
          protein: { current: 140, target: 175 },
          carbs: { current: 190, target: 240 },
          fats: { current: 55, target: 65 },
        },
        meals: [
          {
            id: "m_1",
            timeLabel: "MEAL 01 • BREAKFAST",
            name: "Steel Cut Oats + Whey Isolate & Blueberries",
            kcal: 540,
            proteinG: 42,
            imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=400&q=80",
            completed: true
          }
        ]
      },
      supplements: [
        { id: "sup_1", name: "Creatine Monohydrate", timeLabel: "POST-WORKOUT • 5G", icon: "bolt", completed: true },
        { id: "sup_2", name: "Omega-3 & Vitamin D3", timeLabel: "MORNING • 2 CAPS", icon: "pill", completed: false }
      ],
      cardioLogs: []
    };
  };

  // Helper to create trainer profile for new users
  const createDefaultTrainerProfile = (userId: string, name: string, emailOrPhone: string, avatarUrl: string, specialty: string, gymName: string): Trainer => {
    return {
      id: "trainer_" + userId,
      name: name,
      email: emailOrPhone,
      avatarUrl: avatarUrl,
      bio: "Certified Strength & Performance Coach dedicated to progressive overload and client physique transformation.",
      specialty: specialty || "Strength & Hypertrophy",
      experience: "5+ Years Professional Coaching",
      status: "approved",
      gymName: gymName || "Kinetic Performance"
    };
  };

  // GOOGLE LOGIN HANDLER
  const handleGoogleSignIn = async () => {
    triggerHaptic(ImpactStyle.Medium);
    setError("");
    setSuccess("");
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      if (!fbUser.email && !fbUser.uid) {
        throw new Error("Could not retrieve account details from Google.");
      }

      // Check Firestore users collection first
      let matchedUser: User | null = null;
      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          matchedUser = { id: userDocSnap.id, ...userDocSnap.data() } as User;
        }
      } catch (firestoreErr) {
        console.warn("Firestore lookup check error:", firestoreErr);
      }

      // Fallback check against local users
      if (!matchedUser) {
        const localUsers = KineticDatabase.getUsers();
        const userEmail = fbUser.email?.toLowerCase();
        matchedUser = localUsers.find(
          u => u.id === fbUser.uid || (userEmail && u.email?.toLowerCase() === userEmail)
        ) || null;
      }

      if (matchedUser) {
        setSuccess(`Signed in securely via Google! Welcome back, ${matchedUser.name}!`);
        setTimeout(() => {
          onAuthSuccess(matchedUser!);
        }, 800);
      } else {
        // First-time Google user: open onboarding role setup
        setPendingFirebaseUser({
          uid: fbUser.uid,
          email: fbUser.email || undefined,
          displayName: fbUser.displayName || "Athlete",
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fbUser.displayName || "GoogleUser")}`,
          provider: "google"
        });
        setOnboardingName(fbUser.displayName || "");
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      const msg = err?.message || "";
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in window was closed before completing.");
      } else if (err?.code === "auth/unauthorized-domain") {
        setError("Domain authorization in progress. Please try again in a few moments.");
      } else if (msg.includes("operation-not-allowed") || err?.code === "auth/operation-not-allowed") {
        setError("Google sign-in is temporarily unavailable. Please sign in with Phone or Passcode.");
      } else {
        setError(msg || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // SEND MOBILE OTP HANDLER
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic(ImpactStyle.Medium);
    setError("");
    setSuccess("");

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanNumber || cleanNumber.length < 7) {
      setError("Please enter a valid phone number (at least 7 digits).");
      return;
    }

    const fullPhoneNumber = `${selectedCountryCode}${cleanNumber}`;
    setIsSendingOtp(true);

    try {
      // Ensure recaptcha-container element exists
      let container = document.getElementById("recaptcha-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "recaptcha-container";
        document.body.appendChild(container);
      }

      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
      }

      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved for Phone Auth");
        },
        "expired-callback": () => {
          console.warn("reCAPTCHA expired, please retry");
        }
      });
      (window as any).recaptchaVerifier = verifier;

      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setResendCooldown(60);
      setSuccess(`Verification code sent to ${fullPhoneNumber}!`);
      
      // Auto-focus OTP first input after small delay
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      console.error("Phone Auth Send Error:", err);
      const errMsg = err?.message || "";
      const isRegionRestricted =
        errMsg.includes("region enabled") ||
        errMsg.includes("SMS unable to be sent") ||
        errMsg.includes("SMS region policy") ||
        errMsg.includes("this region enabled") ||
        errMsg.includes("region");

      if (isRegionRestricted) {
        setError(`SMS verification is currently restricted for region (${selectedCountryCode}). Please sign in with Google or use your Passcode.`);
      } else if (err?.code === "auth/operation-not-allowed") {
        setError("Phone authentication is temporarily unavailable. Please sign in with Google or Passcode.");
      } else if (err?.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please ensure your country code and digits are correct.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many verification requests. Please wait a few moments before trying again.");
      } else {
        setError(errMsg || "Failed to send verification SMS. Please check your network and retry.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // VERIFY MOBILE OTP HANDLER
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic(ImpactStyle.Medium);
    setError("");
    setSuccess("");

    const cleanOtp = otpCode.replace(/[^0-9]/g, "");
    if (!cleanOtp || cleanOtp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!confirmationResult) {
      setError("No active verification session. Please request a new verification code.");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const result = await confirmationResult.confirm(cleanOtp);
      const fbUser = result.user;
      const verifiedPhone = fbUser.phoneNumber || `${selectedCountryCode}${phoneNumber.replace(/[^0-9]/g, "")}`;

      // Check Firestore users
      let matchedUser: User | null = null;
      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          matchedUser = { id: userDocSnap.id, ...userDocSnap.data() } as User;
        }
      } catch (e) {
        console.warn("Firestore lookup check error:", e);
      }

      // Check local users by UID or phone
      if (!matchedUser) {
        const localUsers = KineticDatabase.getUsers();
        matchedUser = localUsers.find(
          u => u.id === fbUser.uid || (u.phone && u.phone === verifiedPhone)
        ) || null;
      }

      if (matchedUser) {
        setSuccess(`Phone verified successfully! Welcome back, ${matchedUser.name}!`);
        setTimeout(() => {
          onAuthSuccess(matchedUser!);
        }, 800);
      } else {
        // First-time Phone user: open onboarding role setup
        setPendingFirebaseUser({
          uid: fbUser.uid,
          phone: verifiedPhone,
          displayName: `Member ${verifiedPhone.slice(-4)}`,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(verifiedPhone)}`,
          provider: "phone"
        });
        setOnboardingName(`Member ${verifiedPhone.slice(-4)}`);
      }
    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      if (err?.code === "auth/invalid-verification-code") {
        setError("Invalid 6-digit verification code. Please check your SMS and try again.");
      } else if (err?.code === "auth/code-expired") {
        setError("This verification code has expired. Please click 'Resend Code'.");
      } else {
        setError(err?.message || "Verification failed. Please check your code.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // COMPLETE ONBOARDING FOR FIRST-TIME USERS
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFirebaseUser) return;
    triggerHaptic(ImpactStyle.Heavy);
    setError("");

    const name = onboardingName.trim() || (pendingFirebaseUser.displayName || "Gym Member");
    const emailOrPhone = pendingFirebaseUser.email || pendingFirebaseUser.phone || `${pendingFirebaseUser.uid.slice(0, 8)}@gymbuddy.pro`;
    const avatarUrl = pendingFirebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
    const gymName = onboardingGymName.trim() || "Kinetic Performance";

    let newUser: User;

    if (onboardingRole === "CLIENT") {
      const clientRecord = createDefaultClientProfile(
        pendingFirebaseUser.uid,
        name,
        emailOrPhone,
        avatarUrl,
        gymName
      );

      // Save client to local & Firestore
      const currentClients = KineticDatabase.getClients();
      KineticDatabase.saveClients([clientRecord, ...currentClients]);
      try {
        setDoc(doc(db, "clients", clientRecord.id), clientRecord).catch(err => console.error(err));
      } catch (e) {}

      newUser = {
        id: pendingFirebaseUser.uid,
        email: emailOrPhone,
        name: name,
        role: "CLIENT",
        avatarUrl: avatarUrl,
        clientId: clientRecord.id,
        gymName: gymName,
        phone: pendingFirebaseUser.phone,
        hasPaidFee: true,
        activeTier: "PRO"
      };
    } else if (onboardingRole === "TRAINER") {
      const trainerRecord = createDefaultTrainerProfile(
        pendingFirebaseUser.uid,
        name,
        emailOrPhone,
        avatarUrl,
        onboardingSpecialty,
        gymName
      );

      // Save trainer to local & Firestore
      const currentTrainers = KineticDatabase.getTrainers();
      KineticDatabase.saveTrainers([trainerRecord, ...currentTrainers]);
      try {
        setDoc(doc(db, "trainers", trainerRecord.id), trainerRecord).catch(err => console.error(err));
      } catch (e) {}

      newUser = {
        id: pendingFirebaseUser.uid,
        email: emailOrPhone,
        name: name,
        role: "TRAINER",
        avatarUrl: avatarUrl,
        trainerId: trainerRecord.id,
        gymName: gymName,
        phone: pendingFirebaseUser.phone,
        specialty: onboardingSpecialty
      };
    } else {
      // OWNER
      newUser = {
        id: pendingFirebaseUser.uid,
        email: emailOrPhone,
        name: name,
        role: "OWNER",
        avatarUrl: avatarUrl,
        gymName: gymName,
        phone: pendingFirebaseUser.phone
      };
    }

    // Save User to local DB and Firestore
    const currentUsers = KineticDatabase.getUsers();
    KineticDatabase.saveUsers([newUser, ...currentUsers.filter(u => u.id !== newUser.id)]);
    try {
      setDoc(doc(db, "users", newUser.id), newUser).catch(err => console.error(err));
    } catch (e) {}

    setSuccess(`Welcome to ${gymName}, ${name}! Profile created successfully.`);
    setPendingFirebaseUser(null);
    setTimeout(() => {
      onAuthSuccess(newUser);
    }, 800);
  };

  // PASSCODE LOGIN HANDLER (Staff / Athletes)
  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(ImpactStyle.Light);
    setError("");
    setSuccess("");

    if (!loginIdInput.trim()) {
      setError("Please enter your Unique Passcode / Login ID.");
      return;
    }

    const inputId = loginIdInput.trim().toUpperCase();
    let users = KineticDatabase.getUsers();
    let foundUser = users.find(
      (u) => u.loginId && u.loginId.trim().toUpperCase() === inputId
    );

    // If not in current users, check DEMO_USERS
    if (!foundUser) {
      const demoMatch = DEMO_USERS.find(
        (u) => u.loginId && u.loginId.trim().toUpperCase() === inputId
      );
      if (demoMatch) {
        foundUser = demoMatch;
        KineticDatabase.saveUsers([...users.filter((u) => u.id !== demoMatch.id), demoMatch]);
        if (demoMatch.role === "CLIENT" && demoMatch.clientId) {
          const currentClients = KineticDatabase.getClients();
          const demoClient = DEMO_CLIENTS.find((c) => c.id === demoMatch.clientId);
          if (demoClient && !currentClients.some((c) => c.id === demoClient.id)) {
            KineticDatabase.saveClients([...currentClients, demoClient]);
          }
        } else if (demoMatch.role === "TRAINER" && demoMatch.trainerId) {
          const currentTrainers = KineticDatabase.getTrainers();
          const demoTrainer = DEMO_TRAINERS.find((t) => t.id === demoMatch.trainerId);
          if (demoTrainer && !currentTrainers.some((t) => t.id === demoTrainer.id)) {
            KineticDatabase.saveTrainers([...currentTrainers, demoTrainer]);
          }
        }
      }
    }

    if (!foundUser) {
      setError(`Passcode "${inputId}" not found. Please verify your assigned passcode.`);
      return;
    }

    if (foundUser.role === "TRAINER" && foundUser.trainerId) {
      const localTrainers = KineticDatabase.getTrainers();
      const localRecord = localTrainers.find((t) => t.id === foundUser?.trainerId);
      if (localRecord?.status === "pending") {
        setError("Your Trainer application is still pending owner review.");
        return;
      }
    }

    setSuccess(`Welcome back, ${foundUser.name}! Logging you in...`);
    setTimeout(() => {
      onAuthSuccess(foundUser);
    }, 600);
  };

  // EMAIL LOGIN HANDLER (Owner)
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(ImpactStyle.Light);
    setError("");
    setSuccess("");

    let users = KineticDatabase.getUsers();

    if (isRegisteringOwner) {
      if (!registerGymName.trim() || !registerOwnerName.trim() || !registerEmail.trim() || !registerPassword) {
        setError("Please complete all owner registration fields.");
        return;
      }
      if (registerPassword !== registerConfirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const trimmedEmail = registerEmail.trim().toLowerCase();
      if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
        setError("An account with this email is already registered.");
        return;
      }

      const newOwner: User = {
        id: "owner_" + Date.now(),
        email: trimmedEmail,
        name: registerOwnerName.trim(),
        role: "OWNER",
        passwordPlain: registerPassword,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(registerOwnerName)}`,
        gymName: registerGymName.trim()
      };

      try {
        setDoc(doc(db, "users", newOwner.id), newOwner).catch(err => console.error(err));
      } catch (e) {}

      KineticDatabase.saveUsers([...users, newOwner]);
      setSuccess(`Gym registered! Welcome, ${newOwner.name}...`);
      setTimeout(() => {
        onAuthSuccess(newOwner);
      }, 700);
    } else {
      if (!email.trim() || !password) {
        setError("Please enter your Owner email and password.");
        return;
      }

      const trimmedEmail = email.trim().toLowerCase();
      let foundUser = users.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.passwordPlain === password && u.role === "OWNER"
      );

      // Demo owner credentials fallback
      if (!foundUser && trimmedEmail === "owner@kinetic.pro" && password === "owner123") {
        foundUser = DEMO_USERS.find((u) => u.id === "owner_elena") || {
          id: "owner_elena",
          email: "owner@kinetic.pro",
          name: "Elena Vance",
          role: "OWNER",
          passwordPlain: "owner123",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
          gymName: "Kinetic Performance"
        };
        KineticDatabase.saveUsers([...users.filter((u) => u.id !== foundUser.id), foundUser]);
      }

      if (foundUser) {
        setSuccess(`Welcome back, ${foundUser.name}! Loading ${foundUser.gymName || "portal"}...`);
        setTimeout(() => {
          onAuthSuccess(foundUser);
        }, 600);
      } else {
        setError("Invalid email or password. Please verify your credentials or use the demo credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-center items-center p-4 md:p-8 font-sans relative overflow-x-hidden selection:bg-volt selection:text-black">
      {/* Background Decorative Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-volt/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Top Bar Utilities */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        {onToggleTheme && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.99 }}
            onClick={onToggleTheme}
            type="button"
            className="p-2 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-volt rounded-full border border-zinc-800 transition-colors flex items-center justify-center cursor-pointer shadow-lg"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </motion.button>
        )}
      </div>

      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3.5 mb-6 z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-volt flex items-center justify-center text-black font-extrabold text-2xl shadow-xl shadow-volt/20 relative overflow-hidden group">
          <span className="relative z-10">⚡</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl md:text-4xl italic font-black text-volt tracking-tighter">
              GYM BUDDY
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-volt/10 text-volt border border-volt/20 rounded-full uppercase tracking-wider">
              v2.0
            </span>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
            Fitness Operations Hub • Kinetic Pro Platform
          </p>
        </div>
      </motion.div>

      {/* Main Authentication Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="max-w-xl w-full bg-[#18181b] border border-[#27272a] rounded-[32px] overflow-hidden shadow-2xl relative z-10"
      >
        {/* Top Glowing Accent Line */}
        <div className="h-1 bg-gradient-to-r from-rose-500 via-volt to-emerald-400" />

        <div className="p-6 md:p-8 space-y-6">
          {/* Tab Navigation Switcher */}
          <div className="grid grid-cols-2 bg-[#09090b] p-1.5 rounded-2xl border border-zinc-800/80 text-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("PASSCODE");
                setError("");
                setSuccess("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "PASSCODE" 
                  ? "bg-volt text-black shadow-md shadow-volt/10 font-black" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Key size={14} />
              <span>Staff Passcode</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("OWNER");
                setError("");
                setSuccess("");
                setOtpSent(false);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "OWNER" 
                  ? "bg-volt text-black shadow-md shadow-volt/10 font-black" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Building size={14} />
              <span>Gym Owner</span>
            </button>
          </div>

          {/* Feedback Banners */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 p-3.5 rounded-2xl text-xs font-semibold leading-relaxed"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="flex items-center gap-2.5 bg-volt/15 border border-volt/30 text-volt p-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-volt/5"
              >
                <Sparkles size={16} className="shrink-0 animate-bounce" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: STAFF / ATHLETE PASSCODE */}
          {activeTab === "PASSCODE" && (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                  Unique Login ID / Passcode
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-volt transition-colors">
                    <Key size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your assigned passcode (e.g. KNT-MARCUS)"
                    value={loginIdInput}
                    onChange={(e) => setLoginIdInput(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt/20 placeholder-zinc-600 transition-all uppercase tracking-wide"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                  Enter the unique passkey assigned to your member or trainer profile.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3.5 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-xs italic tracking-widest rounded-2xl transition-all shadow-xl shadow-volt/15 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <LogIn size={15} />
                <span>SIGN IN WITH PASSCODE ⚡</span>
              </motion.button>
            </form>
          )}

          {/* TAB 2: GYM OWNER SECTION (GOOGLE, PHONE OTP & EMAIL) */}
          {activeTab === "OWNER" && (
            <div className="space-y-6">
              {/* GOOGLE SIGN IN BUTTON */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 relative group"
                >
                  {isGoogleLoading ? (
                    <RefreshCw size={18} className="animate-spin text-zinc-600" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  <span className="font-bold tracking-tight">
                    {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
                  </span>
                </button>
                <p className="text-[10px] text-zinc-400 text-center mt-2 font-mono">
                  Fast, secure 1-click authentication
                </p>
              </div>

              {/* OR DIVIDER */}
              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-zinc-800 flex-1" />
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  OR SIGN IN WITH MOBILE OTP
                </span>
                <div className="h-[1px] bg-zinc-800 flex-1" />
              </div>

              {/* MOBILE PHONE OTP SECTION */}
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      {/* Country Code Select */}
                      <div className="relative w-36 shrink-0">
                        <select
                          value={selectedCountryCode}
                          onChange={(e) => setSelectedCountryCode(e.target.value)}
                          className="w-full h-full bg-[#09090b] border border-zinc-800 rounded-2xl px-3 py-3 text-xs text-white font-mono focus:outline-none focus:border-volt appearance-none cursor-pointer"
                        >
                          {COUNTRY_CODES.map((item) => (
                            <option key={item.code} value={item.code} className="bg-zinc-900 text-white">
                              {item.flag} {item.code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-4 text-zinc-500 pointer-events-none" />
                      </div>

                      {/* Phone Input */}
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
                          <Smartphone size={16} />
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 555-0199 or 9876543210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt/20 placeholder-zinc-600 transition-all tracking-wide"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Send Code Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSendingOtp || !phoneNumber.trim()}
                    className="w-full py-3.5 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-xs italic tracking-widest rounded-2xl transition-all shadow-xl shadow-volt/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>SENDING VERIFICATION CODE...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone size={15} />
                        <span>SEND VERIFICATION CODE VIA SMS ⚡</span>
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                /* OTP VERIFICATION VIEW */
                <form onSubmit={handleVerifyOtp} className="space-y-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white font-bold">Enter Verification Code</p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Sent to {selectedCountryCode} {phoneNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] font-mono text-volt underline hover:text-white cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  {/* 6-Digit OTP Box */}
                  <div className="space-y-1.5">
                    <input
                      ref={(el) => (otpInputRefs.current[0] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl px-4 py-3 text-center font-mono text-2xl tracking-[16px] text-volt focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt/30"
                    />
                  </div>

                  {/* Resend Cooldown */}
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Didn't receive SMS?</span>
                    {resendCooldown > 0 ? (
                      <span className="font-mono text-volt text-[11px]">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-volt font-bold underline hover:text-white cursor-pointer text-xs"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  {/* Submit OTP Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isVerifyingOtp || otpCode.length < 6}
                    className="w-full py-3.5 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-xs italic tracking-widest rounded-2xl transition-all shadow-xl shadow-volt/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>VERIFYING CODE...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>VERIFY & SIGN IN ⚡</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* OR DIVIDER: EMAIL & PASSWORD */}
              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-zinc-800 flex-1" />
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  OR WITH OWNER EMAIL & PASSWORD
                </span>
                <div className="h-[1px] bg-zinc-800 flex-1" />
              </div>

              {/* OWNER EMAIL / PASSWORD FORM */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
              {isRegisteringOwner ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                        Gym Space Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Iron Forge Gym"
                        value={registerGymName}
                        onChange={(e) => setRegisterGymName(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-volt"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Elena Vance"
                        value={registerOwnerName}
                        onChange={(e) => setRegisterOwnerName(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-volt"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="founder@yourgym.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-volt"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-volt"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                        Confirm
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-volt"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                      Gym Owner Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-volt">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="owner@yourgym.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-volt"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                      Owner Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-volt">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-volt"
                      />
                    </div>
                  </div>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3.5 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-xs italic tracking-widest rounded-2xl transition-all shadow-xl shadow-volt/15 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isRegisteringOwner ? <UserPlus size={15} /> : <LogIn size={15} />}
                <span>{isRegisteringOwner ? "REGISTER NEW GYM SPACE ⚡" : "LOG IN AS OWNER ⚡"}</span>
              </motion.button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisteringOwner(!isRegisteringOwner);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-xs text-zinc-400 hover:text-volt underline decoration-dotted underline-offset-4 font-mono font-bold cursor-pointer"
                >
                  {isRegisteringOwner ? "Already registered? Sign In" : "New Gym Owner? Register your facility"}
                </button>
              </div>
            </form>
            </div>
          )}
        </div>
      </motion.div>

      {/* MODAL 1: FIRST-TIME USER ONBOARDING (ROLE SELECTION) */}
      <AnimatePresence>
        {pendingFirebaseUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#18181b] border border-zinc-800 rounded-[28px] max-w-lg w-full p-6 md:p-8 relative shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-volt/10 text-volt flex items-center justify-center border border-volt/20 shadow-lg text-xl">
                  {pendingFirebaseUser.provider === "google" ? "⚡" : "📱"}
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-xl uppercase italic">
                    Welcome to Gym Buddy!
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Signed in via {pendingFirebaseUser.provider === "google" ? "Google Account" : "Verified Phone"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  Select your primary account role to configure your personalized dashboard:
                </p>

                {/* Role Selector Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOnboardingRole("CLIENT")}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                      onboardingRole === "CLIENT"
                        ? "bg-volt/15 border-volt text-white shadow-lg shadow-volt/10"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <Dumbbell size={20} className={onboardingRole === "CLIENT" ? "text-volt" : ""} />
                    <div>
                      <p className="text-xs font-bold leading-tight">Athlete</p>
                      <p className="text-[9px] font-mono text-zinc-500">Member</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnboardingRole("TRAINER")}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                      onboardingRole === "TRAINER"
                        ? "bg-volt/15 border-volt text-white shadow-lg shadow-volt/10"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <Zap size={20} className={onboardingRole === "TRAINER" ? "text-volt" : ""} />
                    <div>
                      <p className="text-xs font-bold leading-tight">Coach</p>
                      <p className="text-[9px] font-mono text-zinc-500">Trainer</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnboardingRole("OWNER")}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                      onboardingRole === "OWNER"
                        ? "bg-volt/15 border-volt text-white shadow-lg shadow-volt/10"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <Building size={20} className={onboardingRole === "OWNER" ? "text-volt" : ""} />
                    <div>
                      <p className="text-xs font-bold leading-tight">Owner</p>
                      <p className="text-[9px] font-mono text-zinc-500">Gym Space</p>
                    </div>
                  </button>
                </div>

                {/* Profile Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={onboardingName}
                      onChange={(e) => setOnboardingName(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-volt font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                      Gym Facility Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kinetic Performance"
                      value={onboardingGymName}
                      onChange={(e) => setOnboardingGymName(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-volt font-medium"
                    />
                  </div>

                  {onboardingRole === "TRAINER" && (
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                        Coaching Specialty
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hypertrophy & Olympic Lifting"
                        value={onboardingSpecialty}
                        onChange={(e) => setOnboardingSpecialty(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-volt font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPendingFirebaseUser(null)}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer font-mono"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="flex-1 py-3 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-xs italic tracking-widest rounded-xl transition-all shadow-lg shadow-volt/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>FINALIZE & ENTER APP ⚡</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container" className="invisible" />
    </div>
  );
}
