import React, { useState, useEffect } from "react";
import { 
  Dumbbell, Plus, Check, CheckCircle2, History, Trash2, Calendar, Activity,
  CreditCard, Bell, Sparkles, Volume2, ShieldCheck, ShieldAlert,
  Sliders, Smartphone, Play, CheckCircle, HelpCircle, Lock, Cpu, Info, Zap, X,
  ChevronLeft, ChevronRight, Moon, Flame, RefreshCw
} from "lucide-react";
import { Client, Exercise, ExerciseSet, Meal, WeeklyPlan, WorkoutPlan, DietPlan, Supplement, CardioLog, DailyHistoryEntry } from "../types";

interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isScheduled: boolean;
  isCompleted: boolean;
}

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  const days: CalendarDay[] = [];
  
  // Previous month padding days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dNum = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    days.push({
      dateKey: dateStr,
      dayNumber: dNum,
      isCurrentMonth: false,
      isScheduled: false,
      isCompleted: false,
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dayOfWeek = d.getDay();
    const isScheduled = [1, 3, 5, 6].includes(dayOfWeek); // Mon, Wed, Fri, Sat
    const todayNum = new Date().getDate();
    const todayMonth = new Date().getMonth();
    const todayYear = new Date().getFullYear();
    const isPast = (year < todayYear) || (year === todayYear && month < todayMonth) || (year === todayYear && month === todayMonth && i < todayNum);
    
    // completed if isScheduled and isPast with 85% probability
    const isCompleted = isScheduled && isPast && (i % 3 !== 0);
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateKey: dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isScheduled,
      isCompleted,
    });
  }
  
  // Next month padding days to round up to multiple of 7
  const totalSlots = Math.ceil(days.length / 7) * 7;
  const nextPaddingCount = totalSlots - days.length;
  for (let i = 1; i <= nextPaddingCount; i++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateKey: dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isScheduled: false,
      isCompleted: false,
    });
  }
  
  return days;
};
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Area
} from "recharts";

// Web Audio API Sound Synthesizer for high-craftsmanship physical state feedback
const playSynthesizedChime = (type: "payment" | "notification" | "error") => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === "payment") {
      // Harmonic success chord
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12, true); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24, true); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.36, true); // C6
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.stop(ctx.currentTime + 0.7);
    } else if (type === "notification") {
      // Future digital bubble sound
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880.00, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(1320.00, ctx.currentTime + 0.1, true); // E6
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Low dual error buzzer
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(130.00, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn("Audio feedback context blocked or unsupported:", e);
  }
};

interface ClientRoutineProps {
  client: Client;
  onUpdateClient: (updated: Client) => void;
  onNavigateToCoaches?: () => void;
}

export default function ClientRoutine({ 
  client, 
  onUpdateClient, 
  onNavigateToCoaches 
}: ClientRoutineProps) {
  const isSoloMember = client.activeTier === "SOLO" || !client.linkedTrainerId || client.linkedTrainerStatus !== "approved";

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExCategory, setNewExCategory] = useState("CHEST");
  const [newExType, setNewExType] = useState("STRENGTH");

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [newMealKcal, setNewMealKcal] = useState("");
  const [newMealProtein, setNewMealProtein] = useState("");
  const [newMealCarbs, setNewMealCarbs] = useState("");
  const [newMealFats, setNewMealFats] = useState("");
  const [newMealTime, setNewMealTime] = useState("BREAKFAST");
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Recharts past 7 days completion history data state
  const [historyData, setHistoryData] = useState([
    { day: "Mon", completionRate: 75, volumeKg: 1200 },
    { day: "Tue", completionRate: 90, volumeKg: 1650 },
    { day: "Wed", completionRate: 40, volumeKg: 800 },
    { day: "Thu", completionRate: 85, volumeKg: 1450 },
    { day: "Fri", completionRate: 100, volumeKg: 2100 },
    { day: "Sat", completionRate: 0, volumeKg: 0 },
    { day: "Sun", completionRate: 95, volumeKg: 1800 },
  ]);

  // 1.1 Calendar states
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [customDays, setCustomDays] = useState<Record<string, { isScheduled: boolean; isCompleted: boolean }>>({});
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Regulate calendar days when year/month changes or custom changes happen
  useEffect(() => {
    const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
    const defaultDays = generateCalendarDays(currentYear, currentMonth);
    const updatedDays = defaultDays.map(day => {
      const parts = day.dateKey.split("-").map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayOfWeekIndex = d.getDay();
      const dayName = DAYS_OF_WEEK[dayOfWeekIndex];
      
      // Determine if scheduled in weeklyPlan
      const dayPlan = client.weeklyPlan?.[dayName];
      const hasWorkout = !!(dayPlan?.workout?.exercises && dayPlan.workout.exercises.length > 0);
      const hasDiet = !!(dayPlan?.diet?.meals && dayPlan.diet.meals.length > 0);
      const hasSupps = !!(dayPlan?.supplements && dayPlan.supplements.length > 0);
      const hasCardio = !!dayPlan?.cardio;
      const isScheduled = hasWorkout || hasDiet || hasSupps || hasCardio;
      
      // Determine if completed in history
      const historyEntry = (client.history || []).find(h => h.date === day.dateKey);
      const isCompleted = historyEntry ? historyEntry.completed : false;
      
      return {
        ...day,
        isScheduled,
        isCompleted
      };
    });
    setCalendarDays(updatedDays);
  }, [currentYear, currentMonth, client.weeklyPlan, client.history]);

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    setSelectedDateStr(day.dateKey);
    setNotification(`Switched view to ${day.dayNumber} ${MONTH_NAMES[currentMonth]} (${getDayOfWeekName(day.dateKey)})`);
    playSynthesizedChime("notification");
    setTimeout(() => setNotification(null), 3000);
  };

  // 1.2 Wellness Check-in states & functions
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [soreness, setSoreness] = useState<number>(2);
  const [motivation, setMotivation] = useState<number>(4);
  const [wellnessNotes, setWellnessNotes] = useState<string>("");
  const [isEditingWellness, setIsEditingWellness] = useState<boolean>(false);

  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleWellnessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = getTodayDateStr();
    
    const existingList = client.wellnessCheckIns || [];
    const updatedList = existingList.filter(item => item.date !== todayStr);
    
    const newCheckIn = {
      id: "wc_" + Date.now(),
      date: todayStr,
      sleepQuality,
      soreness,
      motivation,
      notes: wellnessNotes.trim() || undefined
    };
    
    const updatedClient: Client = {
      ...client,
      wellnessCheckIns: [...updatedList, newCheckIn]
    };
    
    onUpdateClient(updatedClient);
    setNotification("⚡ DAILY WELLNESS SECURELY RECORDED!");
    playSynthesizedChime("notification");
    setIsEditingWellness(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const startEditingWellness = () => {
    const todayStr = getTodayDateStr();
    const todayData = (client.wellnessCheckIns || []).find(w => w.date === todayStr);
    if (todayData) {
      setSleepQuality(todayData.sleepQuality);
      setSoreness(todayData.soreness);
      setMotivation(todayData.motivation);
      setWellnessNotes(todayData.notes || "");
    }
    setIsEditingWellness(true);
  };

  // 2. Secured Payment gateway states
  const [activeTier, setActiveTier] = useState<"BASIC" | "PRO" | "ELITE" | "SOLO">(client.activeTier || "PRO");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: Idle, 1: Connecting, 2: Cryptographic Hash, 3: Clearance, 4: Approved
  const [paymentFeedback, setPaymentFeedback] = useState("");
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // 3. Push notifications state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushChannelConfig, setPushChannelConfig] = useState({
    workouts: true,
    macros: true,
    chats: true,
  });
  const [simulatedPushLogs, setSimulatedPushLogs] = useState<Array<{ id: string; msg: string; time: string }>>([
    { id: "1", msg: "Simulated Push Server connection handshake established.", time: "08:15 AM" },
    { id: "2", msg: "Push alerts set for high-priority workout updates.", time: "Yesterday" }
  ]);
  const [activePushToast, setActivePushToast] = useState<{ id: string; title: string; text: string } | null>(null);
  const [pushCountdown, setPushCountdown] = useState<number | null>(null);

  // Card formatting helpers
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const matches = clean.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(clean);
    }
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length >= 2) {
      setCardExpiry(clean.slice(0, 2) + "/" + clean.slice(2, 4));
    } else {
      setCardExpiry(clean);
    }
  };

  // Secure payment gateway handler
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      playSynthesizedChime("error");
      setPaymentFeedback("⚠️ Please fill in all required payment credentials.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentFeedback("Initiating handshake with secure card networks...");
    setPaymentStep(1);

    setTimeout(() => {
      setPaymentStep(2);
      setPaymentFeedback("Computing secure 256-bit cryptographic payload hash...");
    }, 1100);

    setTimeout(() => {
      setPaymentStep(3);
      setPaymentFeedback("Verifying 3D Secure verification signature with card issuer...");
    }, 2200);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentStep(4);
      playSynthesizedChime("payment");
      setPaymentFeedback("⚡ Clearance Approved! Account Tier fully activated.");

      // Propagate payment & subscription state to client object
      const updatedClient: Client = {
        ...client,
        activeTier: activeTier,
        hasPaidFee: true,
      };
      onUpdateClient(updatedClient);

      // Reset state and notification banner
      setNotification(`Awesome! Successfully cleared subscription fee & activated ${activeTier} Tier!`);
      setTimeout(() => setNotification(null), 5000);

      setTimeout(() => {
        setShowPaymentGateway(false);
        setPaymentStep(0);
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setCardName("");
        setCardZip("");
      }, 3500);
    }, 3800);
  };

  // Push notification dispatch simulator
  const triggerSimulatedPush = () => {
    if (!pushEnabled) {
      setPushEnabled(true);
    }

    playSynthesizedChime("notification");
    setPushCountdown(2);

    const countdownInterval = setInterval(() => {
      setPushCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      const pushTitles = [
        { title: "⚡ GYM BUDDY PUSH", text: "Coach Alex rivers has uploaded your adjusted Hypertrophy Lift Sheet." },
        { title: "🥗 NUTRITION COMPLIANCE", text: "Daily macros analyzed: 45g of protein needed to hit target." },
        { title: "🏋️‍♂️ ACTIVE LEVEL MILESTONE", text: "Physical streak completed: Volumetric intensity increased by 15%!" },
        { title: "💳 GATEWAY AUTO-CLEAR", text: "Stripe secure ledger synchrony successfully completed." }
      ];
      const selected = pushTitles[Math.floor(Math.random() * pushTitles.length)];
      const pushId = "push_" + Date.now();
      
      playSynthesizedChime("notification");
      setActivePushToast({ id: pushId, title: selected.title, text: selected.text });
      
      setSimulatedPushLogs(prev => [
        { id: pushId, msg: `[INCOMING ALERT] ${selected.title}: ${selected.text}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev
      ]);

      setTimeout(() => {
        setActivePushToast(current => current?.id === pushId ? null : current);
      }, 5000);
    }, 2000);
  };

  const isLinked = client.linkedTrainerId && client.linkedTrainerStatus === "approved";

  if (!isLinked) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#18181b] border border-[#27272a] text-center rounded-[32px] min-h-[400px] space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-volt/10 text-volt flex items-center justify-center mx-auto border border-volt/20">
          <Dumbbell size={28} />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h4 className="font-display text-lg font-black text-white italic uppercase">
            LIFT SHEET CLOUD-LOCKED
          </h4>
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
            Your personalized hypertrophy compound lifts and physical progression trackers are restricted until a certified coach approves your linking application.
          </p>
        </div>
        {onNavigateToCoaches && (
          <button
            onClick={onNavigateToCoaches}
            className="px-5 py-3 bg-volt text-black font-mono text-xs font-black rounded-2xl hover:bg-lime-300 transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            SEARCH AND LINK WITH A TRAINER ⚡
          </button>
        )}
      </div>
    );
  }

  const [selectedDateStr, setSelectedDateStr] = useState(() => getTodayDateStr());

  // Helper to get day name of week
  const getDayOfWeekName = (dateStr: string): string => {
    const parts = dateStr.split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return DAYS[d.getDay()];
  };

  // Resolve active plan data for the selected date
  const getSelectedDayData = () => {
    const dayName = getDayOfWeekName(selectedDateStr) as keyof WeeklyPlan;
    const historyEntry = (client.history || []).find(h => h.date === selectedDateStr);
    
    if (historyEntry) {
      const baseDiet = historyEntry.diet || { id: "diet_" + selectedDateStr, date: selectedDateStr, macros: { protein: { current: 0, target: 180 }, carbs: { current: 0, target: 250 }, fats: { current: 0, target: 70 } }, meals: [] };
      const completedMeals = baseDiet.meals.filter(m => m.completed);
      const currentProt = completedMeals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
      const currentCarb = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 1.5), 0);
      const currentFat = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 0.3), 0);

      const synchronizedDiet = {
        ...baseDiet,
        macros: {
          protein: { ...baseDiet.macros.protein, current: currentProt },
          carbs: { ...baseDiet.macros.carbs, current: currentCarb },
          fats: { ...baseDiet.macros.fats, current: currentFat }
        }
      };

      return {
        workout: historyEntry.workout || { id: "rest_" + selectedDateStr, title: "REST DAY", subtitle: "Recovery & Active Recovery Focus", durationMin: 0, targetKcal: 2000, exercises: [], date: selectedDateStr },
        diet: synchronizedDiet,
        supplements: historyEntry.supplements || [],
        cardio: historyEntry.cardio || null,
        completed: historyEntry.completed,
        isHistory: true
      };
    }
    
    // Otherwise, use weeklyPlan template
    const dayPlan = client.weeklyPlan?.[dayName];
    if (dayPlan) {
      const templateWorkout = dayPlan.workout ? {
        ...dayPlan.workout,
        date: selectedDateStr,
        exercises: dayPlan.workout.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({ ...s, completed: false }))
        }))
      } : { id: "rest_" + selectedDateStr, title: "REST DAY", subtitle: "Recovery & Active Recovery Focus", durationMin: 0, targetKcal: 2000, exercises: [], date: selectedDateStr };

      const baseDiet = dayPlan.diet ? {
        ...dayPlan.diet,
        date: selectedDateStr,
        meals: dayPlan.diet.meals.map(m => ({ ...m, completed: false }))
      } : { id: "diet_" + selectedDateStr, date: selectedDateStr, macros: { protein: { current: 0, target: 180 }, carbs: { current: 0, target: 250 }, fats: { current: 0, target: 70 } }, meals: [] };

      const completedMeals = baseDiet.meals.filter(m => m.completed);
      const currentProt = completedMeals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
      const currentCarb = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 1.5), 0);
      const currentFat = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 0.3), 0);

      const synchronizedDiet = {
        ...baseDiet,
        macros: {
          protein: { ...baseDiet.macros.protein, current: currentProt },
          carbs: { ...baseDiet.macros.carbs, current: currentCarb },
          fats: { ...baseDiet.macros.fats, current: currentFat }
        }
      };

      return {
        workout: templateWorkout,
        diet: synchronizedDiet,
        supplements: dayPlan.supplements.map(s => ({ ...s, completed: false })) || [],
        cardio: dayPlan.cardio ? { ...dayPlan.cardio, date: selectedDateStr } : null,
        completed: false,
        isHistory: false
      };
    }
    
    // Legacy fallback (before weeklyPlan was assigned)
    const baseDiet = client.dietPlan ? { ...client.dietPlan, date: selectedDateStr } : { id: "diet_" + selectedDateStr, date: selectedDateStr, macros: { protein: { current: 0, target: 180 }, carbs: { current: 0, target: 250 }, fats: { current: 0, target: 70 } }, meals: [] };
    const completedMeals = baseDiet.meals.filter(m => m.completed);
    const currentProt = completedMeals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
    const currentCarb = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 1.5), 0);
    const currentFat = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 0.3), 0);

    const synchronizedDiet = {
      ...baseDiet,
      macros: {
        protein: { ...baseDiet.macros.protein, current: currentProt },
        carbs: { ...baseDiet.macros.carbs, current: currentCarb },
        fats: { ...baseDiet.macros.fats, current: currentFat }
      }
    };

    return {
      workout: client.workoutPlan ? { ...client.workoutPlan, date: selectedDateStr } : { id: "rest_" + selectedDateStr, title: "REST DAY", subtitle: "Recovery & Active Recovery Focus", durationMin: 0, targetKcal: 2000, exercises: [], date: selectedDateStr },
      diet: synchronizedDiet,
      supplements: client.supplements ? client.supplements.map(s => ({ ...s, completed: false })) : [],
      cardio: client.cardioLogs?.[0] ? { ...client.cardioLogs[0], date: selectedDateStr } : null,
      completed: false,
      isHistory: false
    };
  };

  const currentDayData = getSelectedDayData();
  const { workout, diet, supplements, cardio, completed } = currentDayData;

  const [cardioDistance, setCardioDistance] = useState("");
  const [cardioTime, setCardioTime] = useState("");
  const [cardioHeartRate, setCardioHeartRate] = useState("");
  const [isSyncingLog, setIsSyncingLog] = useState(false);

  // Sync cardio input fields when selectedDateStr or cardio changes
  useEffect(() => {
    if (cardio) {
      setCardioDistance(cardio.distanceKm?.toString() || "");
      setCardioTime(cardio.timeMin || "");
      setCardioHeartRate(cardio.avgHeartRate?.toString() || "");
    } else {
      setCardioDistance("");
      setCardioTime("");
      setCardioHeartRate("");
    }
  }, [selectedDateStr, cardio]);

  // General persistence for a date's history entry
  const saveCurrentDayData = (
    dateStr: string, 
    updatedData: { 
      workout: WorkoutPlan; 
      diet: DietPlan; 
      supplements: Supplement[]; 
      cardio: CardioLog | null; 
      completed: boolean 
    }
  ) => {
    const dayName = getDayOfWeekName(dateStr);
    const existingHistory = client.history || [];
    
    const newEntry: DailyHistoryEntry = {
      date: dateStr,
      dayOfWeek: dayName,
      completed: updatedData.completed,
      workout: updatedData.workout,
      diet: updatedData.diet,
      supplements: updatedData.supplements,
      cardio: updatedData.cardio
    };
    
    const updatedHistory = [
      ...existingHistory.filter(h => h.date !== dateStr),
      newEntry
    ];
    
    // Synced Cardio logs: make sure we update the main cardioLogs array too
    let updatedCardioLogs = [...(client.cardioLogs || [])];
    if (updatedData.cardio) {
      updatedCardioLogs = [
        updatedData.cardio,
        ...updatedCardioLogs.filter(c => c.id !== updatedData.cardio?.id && c.date !== dateStr)
      ];
    } else {
      updatedCardioLogs = updatedCardioLogs.filter(c => c.date !== dateStr);
    }

    const isToday = dateStr === getTodayDateStr();
    
    const updatedClient: Client = {
      ...client,
      history: updatedHistory,
      cardioLogs: updatedCardioLogs,
      ...(isToday ? {
        workoutPlan: updatedData.workout,
        dietPlan: updatedData.diet,
        supplements: updatedData.supplements
      } : {})
    };
    
    onUpdateClient(updatedClient);
  };

  // Toggle exercise set completion
  const handleToggleSet = (exerciseId: string, setNumber: number) => {
    const updatedExercises = workout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.map(s => {
          if (s.setNumber === setNumber) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    saveCurrentDayData(selectedDateStr, {
      workout: updatedWorkout,
      diet,
      supplements,
      cardio,
      completed
    });
  };

  // Modify set weight or reps
  const handleSetChange = (exerciseId: string, setNumber: number, field: "weight" | "reps", value: string) => {
    const numVal = parseFloat(value) || 0;
    const updatedExercises = workout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.map(s => {
          if (s.setNumber === setNumber) {
            return { ...s, [field]: numVal };
          }
          return s;
        });
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    saveCurrentDayData(selectedDateStr, {
      workout: updatedWorkout,
      diet,
      supplements,
      cardio,
      completed
    });
  };

  // Add a new set to an exercise
  const handleAddSet = (exerciseId: string) => {
    const updatedExercises = workout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const nextSetNum = ex.sets.length + 1;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: ExerciseSet = {
          setNumber: nextSetNum,
          previous: lastSet ? `${lastSet.weight} x ${lastSet.reps}` : "0 x 0",
          weight: lastSet ? lastSet.weight : 60,
          reps: lastSet ? lastSet.reps : 10,
          completed: false
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    saveCurrentDayData(selectedDateStr, {
      workout: updatedWorkout,
      diet,
      supplements,
      cardio,
      completed
    });
  };

  // Add a brand new custom exercise
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName) return;

    if (!isSoloMember) {
      setNotification("Add restricted: upgrade to Solo Member in Billing to customize exercises.");
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const newExercise: Exercise = {
      id: "ex_" + Date.now(),
      name: newExName,
      category: newExCategory.toUpperCase(),
      type: newExType.toUpperCase(),
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80",
      sets: [
        { setNumber: 1, previous: "N/A", weight: 40, reps: 10, completed: false }
      ]
    };

    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, newExercise]
    };

    saveCurrentDayData(selectedDateStr, {
      workout: updatedWorkout,
      diet,
      supplements,
      cardio,
      completed
    });

    setNewExName("");
    setShowAddExerciseModal(false);
  };

  // Delete exercise
  const handleDeleteExercise = (exerciseId: string) => {
    if (!isSoloMember) {
      setNotification("Delete restricted: only your trainer can modify assigned workouts.");
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.filter(e => e.id !== exerciseId)
    };

    saveCurrentDayData(selectedDateStr, {
      workout: updatedWorkout,
      diet,
      supplements,
      cardio,
      completed
    });
  };

  // Toggle meal completion
  const handleToggleMeal = (mealId: string) => {
    const updatedMeals = diet.meals.map(m => {
      if (m.id === mealId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const completedMeals = updatedMeals.filter(m => m.completed);
    const currentProt = completedMeals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
    const currentCarb = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 1.5), 0);
    const currentFat = completedMeals.reduce((sum, m) => sum + Math.round((m.proteinG || 0) * 0.3), 0);

    const updatedDiet = {
      ...diet,
      macros: {
        protein: { ...diet.macros.protein, current: currentProt },
        carbs: { ...diet.macros.carbs, current: currentCarb },
        fats: { ...diet.macros.fats, current: currentFat }
      },
      meals: updatedMeals
    };

    saveCurrentDayData(selectedDateStr, {
      workout,
      diet: updatedDiet,
      supplements,
      cardio,
      completed
    });
  };

  // Add custom meal
  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName) return;

    if (!isSoloMember) {
      setNotification("Add restricted: upgrade to Solo Member in Billing to customize diets.");
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const mealProteinVal = parseInt(newMealProtein) || 25;
    const mealCarbsVal = parseInt(newMealCarbs) || 30;
    const mealFatsVal = parseInt(newMealFats) || 8;
    const calculatedKcal = (mealProteinVal * 4) + (mealCarbsVal * 4) + (mealFatsVal * 9);

    const newMeal: Meal = {
      id: "meal_" + Date.now(),
      name: newMealName,
      proteinG: mealProteinVal,
      timeLabel: "CUSTOM MEAL",
      kcal: calculatedKcal,
      completed: false,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80"
    };

    const updatedDiet = {
      ...diet,
      meals: [...diet.meals, newMeal]
    };

    saveCurrentDayData(selectedDateStr, {
      workout,
      diet: updatedDiet,
      supplements,
      cardio,
      completed
    });

    setNewMealName("");
    setNewMealProtein("");
    setNewMealCarbs("");
    setNewMealFats("");
    setNewMealKcal("");
    setShowAddMealModal(false);
    setNotification(`Successfully added meal: ${newMealName}!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Delete custom meal
  const handleDeleteMeal = (mealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSoloMember) {
      setNotification("Delete restricted: only your trainer can modify assigned diet logs.");
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const updatedDiet = {
      ...diet,
      meals: diet.meals.filter(m => m.id !== mealId)
    };

    saveCurrentDayData(selectedDateStr, {
      workout,
      diet: updatedDiet,
      supplements,
      cardio,
      completed
    });
  };

  // Supplement toggle handler
  const handleToggleSupplement = (suppId: string) => {
    const updatedSupplements = supplements.map(s => {
      if (s.id === suppId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    saveCurrentDayData(selectedDateStr, {
      workout,
      diet,
      supplements: updatedSupplements,
      cardio,
      completed
    });
    
    playSynthesizedChime("notification");
  };

  // Cardio Log submit/update handler
  const handleUpdateCardio = (e: React.FormEvent) => {
    e.preventDefault();
    const distanceVal = parseFloat(cardioDistance) || 0;
    const hrVal = parseInt(cardioHeartRate) || 0;
    
    // Calculate simple pace: time / distance
    let paceVal = "0:00/KM";
    if (distanceVal > 0 && cardioTime) {
      const timeParts = cardioTime.split(":").map(Number);
      let totalMins = 0;
      if (timeParts.length === 2) {
        totalMins = timeParts[0] + timeParts[1] / 60;
      } else if (timeParts.length === 1) {
        totalMins = timeParts[0];
      }
      const paceDec = totalMins / distanceVal;
      const paceMins = Math.floor(paceDec);
      const paceSecs = Math.round((paceDec - paceMins) * 60);
      paceVal = `${paceMins}:${String(paceSecs).padStart(2, '0')}/KM`;
    }

    const updatedCardio = cardio ? {
      ...cardio,
      distanceKm: distanceVal,
      timeMin: cardioTime || "30:00",
      avgHeartRate: hrVal,
      pace: paceVal
    } : {
      id: "cardio_" + Date.now(),
      date: selectedDateStr,
      type: "RUN" as const,
      distanceKm: distanceVal,
      timeMin: cardioTime || "30:00",
      avgHeartRate: hrVal,
      pace: paceVal
    };

    saveCurrentDayData(selectedDateStr, {
      workout,
      diet,
      supplements,
      cardio: updatedCardio,
      completed
    });

    setNotification("⚡ Cardio stats updated for today!");
    playSynthesizedChime("notification");
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle complete day
  const handleToggleCompleteDay = () => {
    const nextCompleted = !completed;
    saveCurrentDayData(selectedDateStr, {
      workout,
      diet,
      supplements,
      cardio,
      completed: nextCompleted
    });

    if (nextCompleted) {
      setNotification(`🎉 Day completely checked off! Kinetic score synchronized.`);
      playSynthesizedChime("payment");
    } else {
      setNotification(`⚡ Reopened daily log for edits.`);
      playSynthesizedChime("notification");
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Push Notification Toast Alert */}
      {activePushToast && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-[999] bg-[#121414]/95 border-2 border-volt p-4 rounded-2xl shadow-2xl max-w-[calc(100vw-2rem)] md:max-w-sm w-full animate-fadeIn flex gap-3 items-start backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-volt/25 text-volt flex items-center justify-center shrink-0 border border-volt/30">
            <Bell size={15} className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-volt font-black uppercase tracking-widest truncate mr-1">{activePushToast.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[8px] font-mono text-zinc-500 uppercase">JUST NOW</span>
                <button onClick={() => setActivePushToast(null)} className="text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs font-semibold text-white leading-relaxed break-words">
              {activePushToast.text}
            </p>
            <div className="flex gap-2 pt-1.5">
              <button 
                onClick={() => {
                  setActivePushToast(null);
                  setNotification(`Interacted with: ${activePushToast.title}`);
                  setTimeout(() => setNotification(null), 3000);
                }}
                className="px-2.5 py-1 bg-volt text-black font-mono text-[9px] font-black uppercase rounded hover:brightness-110 transition-all cursor-pointer"
              >
                OPEN
              </button>
              <button 
                onClick={() => setActivePushToast(null)}
                className="px-2.5 py-1 bg-zinc-800 text-zinc-400 font-mono text-[9px] font-bold uppercase rounded hover:text-white transition-all cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Header Block */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="font-mono text-xs text-volt font-bold uppercase tracking-widest">
            {selectedDateStr} • {getDayOfWeekName(selectedDateStr).toUpperCase()}'S REPEATABLE ROUTINE
          </span>
          <h2 className="font-display text-3xl md:text-5xl uppercase italic font-black text-white leading-tight">
            {workout.title}: {workout.subtitle}
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#1a1c1c] p-4 border border-[#444933] flex flex-col items-center min-w-[100px] rounded">
            <span className="font-mono text-[10px] text-[#c5c9ac] uppercase">DURATION</span>
            <span className="font-display text-2xl font-black text-volt italic">{workout.durationMin}m</span>
          </div>
          <div className="bg-[#1a1c1c] p-4 border border-[#444933] flex flex-col items-center min-w-[100px] rounded">
            <span className="font-mono text-[10px] text-[#c5c9ac] uppercase">TARGET KCAL</span>
            <span className="font-display text-2xl font-black text-volt italic">
              {workout.targetKcal.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* Dynamic Outstanding Subscription / Annual Fee Restriction Banner */}
      {!client.hasPaidFee && (
         <div className="bg-rose-500/10 border-2 border-rose-500/40 p-5 rounded-2xl space-y-4 animate-fadeIn">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div className="flex items-start gap-3">
               <div className="w-10 h-10 rounded-full bg-rose-500/25 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                 <ShieldAlert size={20} />
               </div>
               <div className="space-y-1">
                 <h4 className="font-display text-sm font-black text-white uppercase italic tracking-wider">
                   MEMBERSHIP PAYMENT PENDING
                 </h4>
                 <p className="text-[11px] text-zinc-400 leading-normal max-w-2xl font-semibold">
                   Your trainer has set up your daily workout routines, but advanced tracking charts, diet plans, and progress logs are temporarily locked. Please complete your membership fee payment to unlock the full features.
                 </p>
               </div>
             </div>
             <button
               onClick={() => {
                 setShowPaymentGateway(true);
                 document.getElementById("secure_payment_gateway")?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-black rounded-xl tracking-wider transition-all flex items-center gap-1.5 shrink-0 uppercase cursor-pointer"
             >
               <CreditCard size={13} /> PAY FEE & UNLOCK PORTAL
             </button>
           </div>
         </div>
       )}
 
       {/* Recharts Analytics: Completion & Volumetric Intensity Tracker */}
       <section className="bg-[#1a1c1c] border border-[#444933] p-5 rounded-2xl space-y-4">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#444933]/50 pb-3">
           <div className="space-y-0.5">
             <h3 className="font-display text-md font-bold text-white uppercase italic flex items-center gap-2">
               <span className="inline-block w-2.5 h-2.5 rounded-full bg-volt animate-ping"></span>
               YOUR DAILY WORKOUT PROGRESS
             </h3>
             <p className="text-[10px] font-mono text-zinc-400 font-bold">
               This chart displays your workout completion rate (%) and the total weight you lifted (kg) over the week.
             </p>
           </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-volt rounded-sm inline-block"></span>
              <span className="text-zinc-400">Completion (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-lime-400 inline-block border-t border-dashed"></span>
              <span className="text-zinc-400">Intensity (KG)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Chart Container (9 columns) */}
          <div className="lg:col-span-9 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={historyData.map(item => {
                  // Dynamically merge active today's stats into Sunday/Today
                  if (item.day === "Sun") {
                    const totalSets = (workout.exercises as any[]).reduce((acc: number, ex: any) => acc + ex.sets.length, 0);
                    const completedSets = (workout.exercises as any[]).reduce((acc: number, ex: any) => acc + ex.sets.filter((s: any) => s.completed).length, 0);
                    const currentRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

                    const currentVolume = (workout.exercises as any[]).reduce((acc: number, ex: any) => {
                      return acc + (ex.sets as any[]).reduce((setAcc: number, s: any) => s.completed ? setAcc + (s.weight * s.reps) : setAcc, 0);
                    }, 0);

                    return { ...item, completionRate: currentRate, volumeKg: currentVolume };
                  }
                  return item;
                })}
                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
              >
                <CartesianGrid stroke="#2c2f2f" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#c5c9ac" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#c5c9ac" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#ccff00" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                  unit="kg"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const completionItem = payload.find(p => p.dataKey === "completionRate");
                      const volumeItem = payload.find(p => p.dataKey === "volumeKg");
                      return (
                        <div className="bg-[#121414] border border-volt/30 p-3 rounded-xl shadow-2xl font-mono text-[10px] space-y-1">
                          <p className="text-zinc-400 font-extrabold uppercase">SESSION SUMMARY</p>
                          <p className="text-volt">
                            Completion: <span className="text-white font-bold">{completionItem ? completionItem.value : 0}%</span>
                          </p>
                          {volumeItem && (
                            <p className="text-lime-300">
                              Volume: <span className="text-white font-bold">{volumeItem.value} KG</span>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="completionRate" 
                  fill="#ccff00" 
                  opacity={0.15} 
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#ccff00" 
                  strokeWidth={2}
                  fill="url(#colorCompletion)"
                  opacity={0.3}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="volumeKg" 
                  stroke="#a3e635" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#1a1c1c", stroke: "#a3e635", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <defs>
                  <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Biometric Stats Insights panel (3 columns) */}
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="bg-[#121414] border border-[#444933]/40 p-4 rounded-xl flex flex-col justify-center">
              <span className="font-mono text-[9px] text-[#c5c9ac] uppercase">Active Completion</span>
              <span className="font-display text-2xl font-black text-volt italic">
                {(() => {
                  const totalSets = (workout.exercises as any[]).reduce((acc: number, ex: any) => acc + ex.sets.length, 0);
                  const completedSets = (workout.exercises as any[]).reduce((acc: number, ex: any) => acc + ex.sets.filter((s: any) => s.completed).length, 0);
                  return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
                })()}%
              </span>
              <p className="text-[9px] text-zinc-500 font-semibold mt-1">Real-time session compliance</p>
            </div>
            <div className="bg-[#121414] border border-[#444933]/40 p-4 rounded-xl flex flex-col justify-center">
              <span className="font-mono text-[9px] text-[#c5c9ac] uppercase">Assigned Intensity</span>
              <span className="font-display text-2xl font-black text-volt italic">
                {(workout.exercises as any[]).reduce((acc: number, ex: any) => {
                  return acc + (ex.sets as any[]).reduce((setAcc: number, s: any) => s.completed ? setAcc + (s.weight * s.reps) : setAcc, 0);
                }, 0).toLocaleString()} <span className="text-xs font-mono text-[#c5c9ac] font-bold">KG</span>
              </span>
              <p className="text-[9px] text-zinc-500 font-semibold mt-1">Total active workload</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Kinetic Flow Monthly Calendar */}
      <section className="bg-[#18181b]/80 border border-zinc-800/80 p-6 rounded-[28px] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-white uppercase italic flex items-center gap-2 tracking-tight">
              <Calendar className="text-volt animate-pulse" size={18} />
              MONTHLY KINETIC FLOW CALENDAR
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              Interactive grid tracking scheduled workout sessions, completions, and rest intervals. Click any day to toggle status.
            </p>
          </div>
          
          {/* Month selector controls */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(prev => prev - 1);
                } else {
                  setCurrentMonth(prev => prev - 1);
                }
              }}
              className="p-2 bg-zinc-900 hover:bg-volt hover:text-black border border-zinc-850 rounded-xl transition-all text-zinc-400 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-display text-xs font-black tracking-widest text-volt min-w-[150px] text-center bg-zinc-900 px-4 py-2 border border-zinc-850 rounded-xl">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(prev => prev + 1);
                } else {
                  setCurrentMonth(prev => prev + 1);
                }
              }}
              className="p-2 bg-zinc-900 hover:bg-volt hover:text-black border border-zinc-850 rounded-xl transition-all text-zinc-400 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-volt rounded flex items-center justify-center text-black">
              <Check size={9} strokeWidth={3.5} />
            </span>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-[#121414] border border-[#ccff00] border-dashed rounded inline-block"></span>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-red-500/20 border border-red-500/50 rounded inline-block"></span>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-[#121414] border border-zinc-800 rounded inline-block"></span>
            <span>Rest Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md ring-2 ring-volt inline-block"></span>
            <span>Today</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1 bg-[#121414]/60 p-5 rounded-2xl border border-zinc-800/40">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] text-[#c5c9ac] font-bold pb-2 border-b border-zinc-800/45">
            {DAY_LABELS.map(lbl => (
              <div key={lbl} className="py-1 tracking-wider">{lbl}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1.5 pt-3.5">
            {calendarDays.map((day, idx) => {
              const status = customDays[day.dateKey] || { isScheduled: day.isScheduled, isCompleted: day.isCompleted };
              
              const isToday = (() => {
                const today = new Date();
                return day.isCurrentMonth && 
                       today.getDate() === day.dayNumber && 
                       today.getMonth() === currentMonth && 
                       today.getFullYear() === currentYear;
              })();

              const isPast = (() => {
                const today = new Date();
                today.setHours(0,0,0,0);
                const d = new Date(currentYear, currentMonth, day.dayNumber);
                return day.isCurrentMonth && d < today;
              })();

              const isMissed = status.isScheduled && !status.isCompleted && isPast && !isToday;

              // Compute classes based on status
              let bgClass = "bg-transparent";
              let borderClass = "border-zinc-900/45";
              let textClass = "text-zinc-600";
              let glowClass = "";

              if (day.isCurrentMonth) {
                textClass = "text-zinc-300";
                if (status.isCompleted) {
                  bgClass = "bg-volt text-black";
                  borderClass = "border-volt";
                  textClass = "text-black font-extrabold";
                  glowClass = "shadow-[0_0_12px_rgba(163,230,53,0.18)]";
                } else if (isMissed) {
                  bgClass = "bg-red-500/10 hover:bg-red-500/15";
                  borderClass = "border-red-500/40";
                  textClass = "text-red-400";
                } else if (status.isScheduled) {
                  bgClass = "bg-zinc-900/50 hover:bg-zinc-800/20";
                  borderClass = "border-[#ccff00] border-dashed";
                  textClass = "text-volt font-bold";
                } else {
                  bgClass = "bg-zinc-900/20 hover:bg-zinc-800/10";
                  borderClass = "border-zinc-850";
                }
              } else {
                // Out of month padding
                bgClass = "bg-transparent opacity-25 pointer-events-none";
                borderClass = "border-transparent";
              }

              return (
                <div
                  key={`${day.dateKey}-${idx}`}
                  onClick={() => day.isCurrentMonth && handleDayClick(day)}
                  className={`
                    aspect-square rounded-2xl p-2.5 flex flex-col justify-between items-stretch border transition-all duration-300 select-none
                    ${bgClass} ${borderClass} ${textClass} ${glowClass}
                    ${day.isCurrentMonth ? "cursor-pointer hover:scale-[1.03] hover:border-volt" : ""}
                    ${isToday ? "ring-2 ring-volt ring-offset-2 ring-offset-[#121414]" : ""}
                  `}
                >
                  {/* Day Number and Today tag */}
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold">
                      {day.dayNumber}
                    </span>
                    {isToday && (
                      <span className="bg-volt text-black text-[7px] font-mono font-black px-1 rounded uppercase tracking-wider scale-90">
                        NOW
                      </span>
                    )}
                  </div>

                  {/* Icon or Status Indicator in the middle/bottom of box */}
                  <div className="flex justify-center items-center h-full">
                    {day.isCurrentMonth && (
                      status.isCompleted ? (
                        <Check size={14} strokeWidth={3.5} className="animate-scaleIn text-black" />
                      ) : isMissed ? (
                        <span className="text-[7px] font-mono font-bold bg-red-500/20 px-1 py-0.5 rounded text-red-500">MISSED</span>
                      ) : status.isScheduled ? (
                        <span className="text-[8px] font-mono font-black text-volt tracking-tight uppercase animate-pulse">LIFT</span>
                      ) : (
                        <span className="text-[7px] font-mono text-zinc-600 font-bold tracking-wider">REST</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {notification && (
        <div className="bg-volt/10 border border-volt text-volt px-5 py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider animate-fadeIn">
          ⚡ {notification}
        </div>
      )}

      {/* Grid Layout for Training (Exercises) & Nutrition Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Workout Exercises (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-display text-lg font-extrabold text-white uppercase italic tracking-tight">
              DAILY EXERCISE ROUTINE
            </h3>
            <button 
              type="button"
              onClick={() => {
                if (!isSoloMember) {
                  setNotification("Add restricted: upgrade to Solo Member in billing to customize your routine.");
                  playSynthesizedChime("error");
                  setTimeout(() => setNotification(null), 3500);
                } else {
                  setShowAddExerciseModal(true);
                }
              }}
              className="font-mono text-[10px] font-black bg-zinc-900 hover:bg-volt hover:text-black px-4 py-2 flex items-center gap-2 border border-zinc-800 hover:border-volt rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus size={14} /> ADD EXERCISE
            </button>
          </div>

          {/* Exercise list */}
          {workout.exercises.map((ex, exIdx) => (
            <div 
              key={ex.id}
              className="bg-[#18181b]/95 p-6 border border-zinc-800/80 space-y-5 relative overflow-hidden rounded-[24px] group hover:border-volt/30 transition-all shadow-sm"
            >
              <div className="absolute top-5 right-5 flex items-center gap-2.5">
                <span className="font-mono text-[10px] text-zinc-500 font-black tracking-widest">
                  STAGE {exIdx + 1 < 10 ? `0${exIdx + 1}` : exIdx + 1}
                </span>
                {isSoloMember && (
                  <button
                    onClick={() => handleDeleteExercise(ex.id)}
                    title="Delete exercise"
                    className="text-red-400 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-850 rounded-lg cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Header inside exercise card */}
              <div className="flex items-center gap-4 border-b border-zinc-900/60 pb-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800/60 shadow-inner">
                  <img 
                    src={ex.imageUrl} 
                    alt={ex.name} 
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                </div>
                <div>
                  <h4 className="font-display text-lg font-black text-white group-hover:text-volt transition-colors uppercase italic tracking-tight">
                    {ex.name}
                  </h4>
                  <div className="flex gap-2 mt-1.5">
                    <span className="bg-zinc-900/60 text-zinc-400 text-[9px] px-2.5 py-0.5 font-mono font-bold rounded-md uppercase border border-zinc-850">
                      {ex.category}
                    </span>
                    <span className="bg-zinc-900/60 text-zinc-400 text-[9px] px-2.5 py-0.5 font-mono font-bold rounded-md uppercase border border-zinc-850">
                      {ex.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Set Row Headings */}
              <div className="space-y-2">
                <div className="grid grid-cols-[38px_1fr_75px_70px_40px] sm:grid-cols-[48px_1fr_90px_85px_44px] gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 text-zinc-500 font-mono text-[9px] sm:text-[10px] border-b border-zinc-900/80 uppercase font-black tracking-widest text-center items-center">
                  <div className="text-left font-black">SET</div>
                  <div className="text-center sm:text-left">PREV</div>
                  <div>KG</div>
                  <div>REPS</div>
                  <div>DONE</div>
                </div>

                {/* Sets rows */}
                {ex.sets.map((set) => (
                  <div 
                    key={set.setNumber}
                    className={`grid grid-cols-[38px_1fr_75px_70px_40px] sm:grid-cols-[48px_1fr_90px_85px_44px] gap-2 sm:gap-3 items-center px-2.5 sm:px-3.5 py-2 rounded-xl transition-all ${
                      set.completed 
                        ? "bg-volt/[0.04] opacity-60 text-zinc-500 border border-volt/20" 
                        : "bg-zinc-900/50 hover:bg-zinc-900/80 text-white border border-zinc-850"
                    }`}
                  >
                    <div className="font-mono text-xs sm:text-sm font-black text-volt text-left">
                      #{set.setNumber}
                    </div>
                    <div className="font-mono text-xs text-zinc-400 font-medium truncate text-center sm:text-left">
                      {set.previous || "—"}
                    </div>
                    <div className="flex justify-center">
                      <input 
                        type="number"
                        inputMode="decimal"
                        disabled={set.completed}
                        value={set.weight !== undefined && set.weight !== null ? set.weight : ""}
                        onChange={(e) => handleSetChange(ex.id, set.setNumber, "weight", e.target.value)}
                        className="compact-input w-full bg-zinc-950/90 border border-zinc-800 focus:border-volt focus:ring-1 focus:ring-volt focus:outline-none py-1.5 px-1 font-mono text-xs sm:text-sm text-center text-white rounded-lg placeholder-zinc-700 transition-all disabled:opacity-40"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input 
                        type="number"
                        inputMode="numeric"
                        disabled={set.completed}
                        value={set.reps !== undefined && set.reps !== null ? set.reps : ""}
                        onChange={(e) => handleSetChange(ex.id, set.setNumber, "reps", e.target.value)}
                        className="compact-input w-full bg-zinc-950/90 border border-zinc-800 focus:border-volt focus:ring-1 focus:ring-volt focus:outline-none py-1.5 px-1 font-mono text-xs sm:text-sm text-center text-white rounded-lg placeholder-zinc-700 transition-all disabled:opacity-40"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-center">
                      <button 
                        type="button"
                        onClick={() => handleToggleSet(ex.id, set.setNumber)}
                        className={`w-9 h-9 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center rounded-xl transition-all active:scale-90 cursor-pointer ${
                          set.completed 
                            ? "text-black bg-volt border border-volt shadow-[0_0_10px_rgba(163,230,53,0.35)]" 
                            : "text-zinc-500 bg-zinc-850 hover:text-volt hover:bg-volt/10 border border-zinc-750"
                        }`}
                        title={set.completed ? "Mark incomplete" : "Mark completed"}
                      >
                        <Check size={16} strokeWidth={set.completed ? 3.5 : 2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleAddSet(ex.id)}
                className="w-full py-3 font-mono text-xs font-bold text-zinc-400 border border-dashed border-zinc-800 hover:border-volt/60 hover:text-white hover:bg-zinc-900/60 rounded-xl transition-all uppercase tracking-wider cursor-pointer active:scale-[0.99] touch-target flex items-center justify-center gap-2"
              >
                <Plus size={14} /> ADD SET
              </button>
            </div>
          ))}
        </div>

        {/* Nutrition Block (4 Columns Sidebar) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Daily Wellness Check-in Tracker */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold border-l-4 border-volt pl-3 text-white uppercase italic flex items-center gap-2">
              <Sparkles className="text-volt animate-pulse" size={18} />
              WELLNESS CHECK-IN
            </h3>
            
            <div className="bg-[#18181b]/95 p-6 border border-zinc-800/80 rounded-[24px] space-y-4 shadow-sm">
              {(() => {
                const todayStr = getTodayDateStr();
                const todayCheckIn = (client.wellnessCheckIns || []).find(w => w.date === todayStr);
                
                if (todayCheckIn && !isEditingWellness) {
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <span className="font-mono text-xs text-zinc-400 font-bold tracking-wider">STATUS: SYNCHRONIZED</span>
                        <span className="px-2.5 py-1 bg-volt/10 text-volt font-mono text-[8px] font-black rounded-lg border border-volt/20">
                          COMPLETED TODAY
                        </span>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        {/* Sleep Quality */}
                        <div className="bg-zinc-900 p-3.5 border border-zinc-850/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Moon className="text-volt" size={15} />
                            <span className="text-zinc-400 font-medium">Sleep Quality</span>
                          </div>
                          <span className="text-volt font-black">
                            {todayCheckIn.sleepQuality}/5 ({
                              todayCheckIn.sleepQuality === 1 && "Exhausted" ||
                              todayCheckIn.sleepQuality === 2 && "Restless" ||
                              todayCheckIn.sleepQuality === 3 && "Average" ||
                              todayCheckIn.sleepQuality === 4 && "Good" ||
                              todayCheckIn.sleepQuality === 5 && "Rested"
                            })
                          </span>
                        </div>

                        {/* Soreness */}
                        <div className="bg-zinc-900 p-3.5 border border-zinc-850/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Dumbbell className="text-volt animate-pulse" size={15} />
                            <span className="text-zinc-400 font-medium">Soreness Level</span>
                          </div>
                          <span className="text-volt font-black">
                            {todayCheckIn.soreness}/5 ({
                              todayCheckIn.soreness === 1 && "Fresh" ||
                              todayCheckIn.soreness === 2 && "Mild" ||
                              todayCheckIn.soreness === 3 && "Moderate" ||
                              todayCheckIn.soreness === 4 && "Very Sore" ||
                              todayCheckIn.soreness === 5 && "Severe"
                            })
                          </span>
                        </div>

                        {/* Motivation */}
                        <div className="bg-zinc-900 p-3.5 border border-zinc-850/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Flame className="text-volt" size={15} />
                            <span className="text-zinc-400 font-medium">Motivation</span>
                          </div>
                          <span className="text-volt font-black">
                            {todayCheckIn.motivation}/5 ({
                              todayCheckIn.motivation === 1 && "Sluggish" ||
                              todayCheckIn.motivation === 2 && "Low" ||
                              todayCheckIn.motivation === 3 && "Focused" ||
                              todayCheckIn.motivation === 4 && "Driven" ||
                              todayCheckIn.motivation === 5 && "Beast"
                            })
                          </span>
                        </div>

                        {todayCheckIn.notes && (
                          <div className="bg-zinc-900 p-3.5 border border-zinc-850/60 rounded-xl space-y-1.5">
                            <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">Wellness Comments</span>
                            <p className="text-xs text-zinc-300 italic">"{todayCheckIn.notes}"</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={startEditingWellness}
                        className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 font-mono text-[10px] font-bold rounded-xl border border-zinc-850 transition-all uppercase cursor-pointer"
                      >
                        Update Today's Check-in
                      </button>
                    </div>
                  );
                }

                return (
                  <form onSubmit={handleWellnessSubmit} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                      <span className="font-mono text-xs text-zinc-400 font-bold tracking-wider">DAILY BIOMETRIC CHECK-IN</span>
                      <span className="px-2 py-0.5 bg-volt/10 text-volt font-mono text-[8px] font-black rounded border border-volt/20">
                        HEALTH CHECK
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Sleep Quality */}
                      <div className="space-y-1.5">
                        <label className="flex justify-between items-center text-xs font-mono">
                          <span className="text-white font-bold flex items-center gap-1.5">
                            <Moon size={14} className="text-volt" /> SLEEP QUALITY
                          </span>
                          <span className="text-volt font-black">
                            {sleepQuality === 1 && "Exhausted"}
                            {sleepQuality === 2 && "Restless"}
                            {sleepQuality === 3 && "Average"}
                            {sleepQuality === 4 && "Good"}
                            {sleepQuality === 5 && "Fully Rested"}
                          </span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={`sleep-${num}`}
                              type="button"
                              onClick={() => {
                                setSleepQuality(num);
                                playSynthesizedChime("notification");
                              }}
                              className={`py-2 text-center rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                                sleepQuality === num
                                  ? "bg-volt border-volt text-black shadow-[0_0_8px_rgba(163,230,53,0.3)]"
                                  : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-volt/30"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Soreness */}
                      <div className="space-y-1.5">
                        <label className="flex justify-between items-center text-xs font-mono">
                          <span className="text-white font-bold flex items-center gap-1.5">
                            <Dumbbell size={14} className="text-volt" /> SORENESS LEVEL
                          </span>
                          <span className="text-volt font-black">
                            {soreness === 1 && "Fresh / None"}
                            {soreness === 2 && "Mild"}
                            {soreness === 3 && "Moderate"}
                            {soreness === 4 && "Very Sore"}
                            {soreness === 5 && "Severely Sore"}
                          </span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={`soreness-${num}`}
                              type="button"
                              onClick={() => {
                                setSoreness(num);
                                playSynthesizedChime("notification");
                              }}
                              className={`py-2 text-center rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                                soreness === num
                                  ? "bg-volt border-volt text-black shadow-[0_0_8px_rgba(163,230,53,0.3)]"
                                  : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-volt/30"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Motivation */}
                      <div className="space-y-1.5">
                        <label className="flex justify-between items-center text-xs font-mono">
                          <span className="text-white font-bold flex items-center gap-1.5">
                            <Flame size={14} className="text-volt" /> MOTIVATION LEVEL
                          </span>
                          <span className="text-volt font-black">
                            {motivation === 1 && "Sluggish"}
                            {motivation === 2 && "Low"}
                            {motivation === 3 && "Focused"}
                            {motivation === 4 && "Driven"}
                            {motivation === 5 && "Beast Mode"}
                          </span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={`motivation-${num}`}
                              type="button"
                              onClick={() => {
                                setMotivation(num);
                                playSynthesizedChime("notification");
                              }}
                              className={`py-2 text-center rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                                motivation === num
                                  ? "bg-volt border-volt text-black shadow-[0_0_8px_rgba(163,230,53,0.3)]"
                                  : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-volt/30"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes Field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-zinc-400 font-bold">
                          BIO-FEEDBACK NOTES (OPTIONAL)
                        </label>
                        <textarea
                          value={wellnessNotes}
                          onChange={(e) => setWellnessNotes(e.target.value)}
                          placeholder="e.g. slept 7h, quads slightly sore, motivation peak..."
                          className="w-full bg-zinc-900 border border-zinc-850 focus:border-volt focus:outline-none p-3 font-mono text-xs text-white rounded-xl placeholder-zinc-650 min-h-[60px] resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs">
                      {isEditingWellness && (
                        <button
                          type="button"
                          onClick={() => setIsEditingWellness(false)}
                          className="flex-1 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-450 font-mono text-[10px] font-bold rounded-xl uppercase transition-all cursor-pointer border border-zinc-800"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-volt hover:brightness-110 text-black font-mono text-[10px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Save Check-in
                      </button>
                    </div>
                  </form>
                );
              })()}
          </div>
        </div>

        {/* Daily Supplements Checklist */}
        {supplements && supplements.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="font-display text-lg font-bold border-l-4 border-volt pl-3 text-white uppercase italic flex items-center gap-2">
              <Sparkles className="text-volt" size={18} />
              DAILY SUPPLEMENTS
            </h3>
            
            <div className="bg-[#18181b]/95 p-6 border border-zinc-800/80 rounded-[24px] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="font-mono text-xs text-zinc-400 font-bold tracking-wider">SUPPLEMENT CHECKLIST</span>
                <span className="px-2 py-0.5 bg-volt/10 text-volt font-mono text-[8px] font-black rounded border border-volt/20">
                  {supplements.filter(s => s.completed).length}/{supplements.length} TAKEN
                </span>
              </div>

              <div className="divide-y divide-zinc-900 font-mono text-xs">
                {supplements.map((s) => (
                  <div 
                    key={s.id} 
                    onClick={() => handleToggleSupplement(s.id)}
                    className="flex items-center justify-between py-3.5 hover:bg-zinc-900/50 transition-all rounded-xl px-2 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        s.completed ? "bg-volt/10 border-volt/30 text-volt" : "bg-zinc-900 border-zinc-850 text-zinc-500 group-hover:text-volt"
                      }`}>
                        <Flame size={14} className={s.completed ? "animate-pulse" : ""} />
                      </div>
                      <div className="space-y-0.5">
                        <p className={`font-bold transition-colors ${s.completed ? "text-zinc-500 line-through" : "text-white"}`}>
                          {s.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase">
                          {s.timeLabel}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      s.completed ? "bg-volt border-volt text-black" : "border-zinc-700 group-hover:border-volt/60"
                    }`}>
                      {s.completed && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cardio Target & Logs */}
        <div className="space-y-4 pt-2">
          <h3 className="font-display text-lg font-bold border-l-4 border-volt pl-3 text-white uppercase italic flex items-center gap-2">
            <Activity className="text-volt" size={18} />
            CARDIO TRACKER
          </h3>
          
          <div className="bg-[#18181b]/95 p-6 border border-zinc-800/80 rounded-[24px] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="font-mono text-xs text-zinc-400 font-bold tracking-wider">CARDIO LOGS</span>
              <span className="px-2 py-0.5 bg-volt/10 text-volt font-mono text-[8px] font-black rounded border border-volt/20">
                {cardio ? "LOGGED" : "REST"}
              </span>
            </div>

            {/* Assigned Cardio Template Plan */}
            {cardio && (
              <div className="bg-zinc-900/50 p-4 border border-zinc-850 rounded-2xl space-y-2">
                <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">ASSIGNED TARGET</span>
                <div className="flex flex-col gap-1 text-white font-mono text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Flame className="text-volt" size={14} />
                    <span>{cardio.type || "STEADY STATE"} — {cardio.timeMin || "30:00"} MINS</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">
                    Target Distance: {cardio.distanceKm} KM • Target HR: {cardio.avgHeartRate} BPM
                  </div>
                </div>
              </div>
            )}

            {/* Cardio Stat Form */}
            <form onSubmit={handleUpdateCardio} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider">Distance (KM)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={cardioDistance}
                    onChange={(e) => setCardioDistance(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-zinc-900 border border-zinc-850 focus:border-volt/60 focus:outline-none px-3 py-2.5 rounded-xl font-mono text-xs text-white placeholder-neutral-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider">Duration (MINS)</label>
                  <input 
                    type="text"
                    placeholder="30:00"
                    value={cardioTime}
                    onChange={(e) => setCardioTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 focus:border-volt/60 focus:outline-none px-3 py-2.5 rounded-xl font-mono text-xs text-white placeholder-neutral-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider">Avg Heart Rate (BPM)</label>
                <input 
                  type="number"
                  value={cardioHeartRate}
                  onChange={(e) => setCardioHeartRate(e.target.value)}
                  placeholder="140"
                  className="w-full bg-zinc-900 border border-zinc-850 focus:border-volt/60 focus:outline-none px-3 py-2.5 rounded-xl font-mono text-xs text-white placeholder-neutral-700"
                />
              </div>

              {cardio?.pace && (
                <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 border border-zinc-850 rounded-xl font-mono text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">ESTIMATED PACE</span>
                  <span className="text-volt font-black">{cardio.pace}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-volt hover:bg-zinc-850 hover:text-volt text-zinc-400 font-mono text-[10px] font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Save Cardio Stats
              </button>
            </form>
          </div>
        </div>

        {/* Mark entire day completed button */}
        <div className="pt-2">
          <button
            onClick={handleToggleCompleteDay}
            className={`w-full py-4 rounded-[20px] font-mono text-xs font-black tracking-widest transition-all cursor-pointer uppercase border-2 flex items-center justify-center gap-2 ${
              completed
                ? "bg-volt/25 border-volt text-volt shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:bg-volt/30"
                : "bg-volt border-volt text-black hover:brightness-110 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
            }`}
          >
            {completed ? (
              <>
                <Check size={15} className="stroke-[3]" /> DAILY ROUTINE COMPLETED • CLICK TO REOPEN
              </>
            ) : (
              "✓ MARK DAILY ROUTINE AS COMPLETED"
            )}
          </button>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center w-full gap-2">
            <h3 className="font-display text-lg font-bold border-l-4 border-volt pl-3 text-white uppercase italic tracking-tight">
              NUTRITION & MACROS
            </h3>
            <button 
              type="button"
              onClick={() => {
                if (!isSoloMember) {
                  setNotification("Add restricted: upgrade to Solo Member in billing to customize your meal log.");
                  playSynthesizedChime("error");
                  setTimeout(() => setNotification(null), 3500);
                } else {
                  setShowAddMealModal(true);
                }
              }}
              className="font-mono text-[10px] font-black bg-zinc-900 hover:bg-volt hover:text-black px-4 py-2 flex items-center gap-2 border border-zinc-800 hover:border-volt rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus size={14} /> ADD MEAL
            </button>
          </div>

            {/* Macro Progress Cards */}
            <div className="bg-[#18181b]/95 p-6 border border-zinc-800/80 space-y-4 rounded-[24px] shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                <span className="font-mono text-xs text-zinc-400 font-bold tracking-wider">MACRONUTRIENT BALANCE</span>
                <span className="font-mono text-[10px] text-volt font-black uppercase tracking-wider">DAILY TARGET</span>
              </div>

              <div className="space-y-4">
                {/* Protein */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-white font-extrabold tracking-wide">PROTEIN</span>
                    <span className="text-zinc-400 font-bold">
                      {diet.macros.protein.current}g / {diet.macros.protein.target}g
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-900 w-full relative rounded-full overflow-hidden border border-zinc-850/40">
                    <div 
                      className="absolute h-full bg-volt rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(163,230,53,0.2)]" 
                      style={{ width: `${Math.min(100, (diet.macros.protein.current / diet.macros.protein.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-white font-extrabold tracking-wide">CARBOHYDRATES</span>
                    <span className="text-zinc-400 font-bold">
                      {diet.macros.carbs.current}g / {diet.macros.carbs.target}g
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-900 w-full relative rounded-full overflow-hidden border border-zinc-850/40">
                    <div 
                      className="absolute h-full bg-volt rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(163,230,53,0.2)]" 
                      style={{ width: `${Math.min(100, (diet.macros.carbs.current / diet.macros.carbs.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fats */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-white font-extrabold tracking-wide">DIETARY FATS</span>
                    <span className="text-zinc-400 font-bold">
                      {diet.macros.fats.current}g / {diet.macros.fats.target}g
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-900 w-full relative rounded-full overflow-hidden border border-zinc-850/40">
                    <div 
                      className="absolute h-full bg-volt rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(163,230,53,0.2)]" 
                      style={{ width: `${Math.min(100, (diet.macros.fats.current / diet.macros.fats.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal List */}
            <div className="space-y-3 pt-1">
              {diet.meals.map((meal) => (
                <div 
                  key={meal.id}
                  onClick={() => handleToggleMeal(meal.id)}
                  className={`border rounded-2xl flex items-center justify-between p-4 transition-all duration-300 group cursor-pointer ${
                    meal.completed 
                      ? "bg-volt/[0.03] border-volt/80 shadow-inner" 
                      : "bg-[#18181b]/95 border-zinc-800 hover:border-volt/40 shadow-sm"
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                      <img 
                        src={meal.imageUrl} 
                        alt={meal.name} 
                        className="w-full h-full object-cover transition-all"
                      />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-zinc-500 uppercase font-black tracking-wider block">
                        {meal.timeLabel}
                      </span>
                      <h5 className="font-extrabold text-sm text-white group-hover:text-volt transition-colors">
                        {meal.name}
                      </h5>
                      <p className="text-[10px] font-mono text-volt/75 font-semibold mt-0.5">
                        {meal.kcal} KCAL • {meal.proteinG}G PROTEIN
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSoloMember && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMeal(meal.id, e)}
                        title="Delete meal log"
                        className="p-1.5 text-zinc-500 hover:text-red-500 bg-zinc-900 border border-zinc-850 hover:border-red-500/30 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <button 
                      type="button"
                      className={`p-1.5 transition-colors cursor-pointer rounded-lg ${
                        meal.completed ? "text-volt bg-volt/10" : "text-zinc-600 group-hover:text-volt group-hover:bg-volt/10"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECURE PAYMENT PORTAL (Visa/Mastercard/Amex formatted input) */}
          <section id="secure_payment_gateway" className="bg-[#18181b]/95 border border-zinc-800/80 p-6 rounded-[24px] space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h4 className="font-display text-sm font-extrabold text-white uppercase italic flex items-center gap-2">
                <CreditCard size={15} className="text-volt" />
                SECURE BILLING PORTAL
              </h4>
              <span className="px-2.5 py-0.5 bg-volt/10 text-volt font-mono text-[8px] font-black rounded-md border border-volt/20">
                STRIPE ENGINE
              </span>
            </div>

            {client.hasPaidFee ? (
              <div className="p-4 bg-volt/[0.02] border border-volt/20 rounded-2xl space-y-3.5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-volt" />
                  <div>
                    <span className="block text-[10px] font-mono text-volt uppercase font-black tracking-widest">GYM BUDDY PREMIUM ACTIVE</span>
                    <span className="block text-xs font-black text-white uppercase">Active Plan: {client.activeTier || "PRO"} Tier</span>
                  </div>
                </div>
                <div className="border-t border-zinc-900 pt-2.5 text-[9px] font-mono text-zinc-400 space-y-1">
                  <p>• Billing Status: SECURE SYNCHRONIZED</p>
                  <p>• Automatic renewal active: {client.activeTier === "SOLO" ? "₹0 (Free Solo)" : client.activeTier === "BASIC" ? "₹499" : client.activeTier === "ELITE" ? "₹2,999" : "₹1,499"}/mo</p>
                  <p>• Last transaction ledger: CLEARED (AUTHORIZED)</p>
                </div>
                <button
                  onClick={() => {
                    playSynthesizedChime("notification");
                    // Cycle through: SOLO -> BASIC -> PRO -> ELITE
                    const nextTier = client.activeTier === "SOLO" ? "BASIC" : client.activeTier === "BASIC" ? "PRO" : client.activeTier === "PRO" ? "ELITE" : "SOLO";
                    setActiveTier(nextTier);
                    onUpdateClient({ ...client, activeTier: nextTier });
                    setNotification(`Plan adjusted to ${nextTier} Tier. Updated ledger successfully.`);
                    setTimeout(() => setNotification(null), 3000);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl border border-zinc-800 transition-all cursor-pointer"
                >
                  UPGRADE / SWITCH TIER (CURRENT: {client.activeTier || "PRO"})
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4 text-left">
                <div className="space-y-2">
                  <span className="block text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider">SELECT MEMBERSHIP TIER</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "SOLO" as const, label: "SOLO", price: "Free" },
                      { id: "BASIC" as const, label: "BASIC", price: "₹499" },
                      { id: "PRO" as const, label: "PRO", price: "₹1,499" },
                      { id: "ELITE" as const, label: "ELITE", price: "₹2,999" }
                    ].map(tier => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          playSynthesizedChime("notification");
                          setActiveTier(tier.id);
                        }}
                        className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                          activeTier === tier.id
                            ? "bg-volt/10 border-volt text-volt shadow-sm"
                            : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span className="font-display text-[10px] font-black uppercase italic">{tier.label}</span>
                        <span className="font-mono text-[9px] opacity-70 mt-0.5">{tier.price}/mo</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card autofill helper presets */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-wider">PRESET QUICK-FILL CREDS</span>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        playSynthesizedChime("notification");
                        setCardNumber("4111 1111 1111 1111");
                        setCardExpiry("12/28");
                        setCardCvc("420");
                        setCardName("Marcus Chen");
                        setCardZip("90210");
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-mono text-[8px] rounded-lg border border-zinc-850 transition-colors cursor-pointer"
                    >
                      💳 Visa (Marcus)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSynthesizedChime("notification");
                        setCardNumber("5555 5555 5555 5555");
                        setCardExpiry("10/29");
                        setCardCvc("888");
                        setCardName("Sarah Miller");
                        setCardZip("10001");
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-mono text-[8px] rounded-lg border border-zinc-850 transition-colors cursor-pointer"
                    >
                      💳 Mastercard (Sarah)
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-400 uppercase font-bold mb-1 tracking-wider">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Chen"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      disabled={isProcessingPayment}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-zinc-400 uppercase font-bold mb-1 tracking-wider">Credit Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4111 1111 1111 1111"
                        value={cardNumber}
                        onChange={e => handleCardNumberChange(e.target.value)}
                        disabled={isProcessingPayment}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt/60"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        {cardNumber.startsWith("4") ? (
                          <span className="text-blue-400 font-mono font-black text-[9px] tracking-wide">VISA</span>
                        ) : cardNumber.startsWith("5") ? (
                          <span className="text-orange-400 font-mono font-black text-[9px] tracking-wide">MC</span>
                        ) : cardNumber.startsWith("3") ? (
                          <span className="text-cyan-400 font-mono font-black text-[9px] tracking-wide">AMEX</span>
                        ) : (
                          <CreditCard size={12} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase font-bold mb-1 tracking-wider">Expiry</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => handleExpiryChange(e.target.value)}
                        disabled={isProcessingPayment}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs text-center focus:outline-none focus:border-volt/60"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase font-bold mb-1 tracking-wider">CVV</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value.replace(/\D/g, ""))}
                        disabled={isProcessingPayment}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs text-center focus:outline-none focus:border-volt/60"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase font-bold mb-1 tracking-wider">Zip Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="90210"
                        value={cardZip}
                        onChange={e => setCardZip(e.target.value.replace(/\D/g, ""))}
                        disabled={isProcessingPayment}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs text-center focus:outline-none focus:border-volt/60"
                      />
                    </div>
                  </div>
                </div>

                {isProcessingPayment && (
                  <div className="space-y-1.5 pt-1.5">
                    <div className="flex justify-between text-[8px] font-mono text-volt">
                      <span>PROCESSING SECURE CLEARANCE...</span>
                      <span>{paymentStep === 1 ? "25%" : paymentStep === 2 ? "50%" : "75%"}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 w-full rounded-full overflow-hidden relative border border-zinc-850/40">
                      <div 
                        className="absolute h-full bg-volt rounded-full transition-all duration-300"
                        style={{ width: paymentStep === 1 ? "25%" : paymentStep === 2 ? "50%" : "75%" }}
                      ></div>
                    </div>
                  </div>
                )}

                {paymentFeedback && (
                  <p className="text-[9px] font-mono text-zinc-400 text-center pt-1 animate-fadeIn font-semibold">
                    {paymentFeedback}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-volt text-black font-display font-black text-xs italic tracking-widest hover:brightness-110 active:scale-95 transition-all uppercase rounded-xl shadow-md mt-3 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock size={12} /> AUTHORIZE UPGRADE 🔒
                </button>
              </form>
            )}
          </section>

          <button 
            disabled={isSyncingLog}
            onClick={() => {
              setIsSyncingLog(true);
              setNotification("Saving and synchronizing daily logs...");
              playSynthesizedChime("notification");
              
              setTimeout(() => {
                if (!completed) {
                  const nextCompleted = true;
                  saveCurrentDayData(selectedDateStr, {
                    workout,
                    diet,
                    supplements,
                    cardio,
                    completed: nextCompleted
                  });
                  setNotification("Daily logs successfully synchronized. Gym streak maintained!");
                  playSynthesizedChime("payment");
                } else {
                  setNotification("Daily logs are already synchronized.");
                  playSynthesizedChime("payment");
                }
                setIsSyncingLog(false);
                setTimeout(() => setNotification(null), 4000);
              }, 1500);
            }}
            className={`w-full py-4 bg-volt text-black font-mono text-xs font-black tracking-widest hover:brightness-110 active:scale-95 transition-all uppercase rounded-2xl shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2`}
          >
            {isSyncingLog ? (
              <>
                <RefreshCw className="animate-spin" size={14} /> SYNCHRONIZING DAILY LOG...
              </>
            ) : completed ? (
              "DAILY LOG SYNCHRONIZED ✓"
            ) : (
              "COMPLETE DAILY LOG"
            )}
          </button>
        </aside>
      </div>

      {/* MODAL: ADD EXERCISE */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e2020] border border-[#444933] max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#444933] bg-[#282a2b] flex justify-between items-center shrink-0">
              <h3 className="font-display text-sm font-extrabold uppercase italic text-volt">
                ADD CUSTOM EXERCISE
              </h3>
              <button 
                onClick={() => setShowAddExerciseModal(false)}
                className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddExercise} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-[#c5c9ac] uppercase mb-1">Exercise Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Incline Dumbbell Fly"
                  value={newExName}
                  onChange={e => setNewExName(e.target.value)}
                  className="w-full bg-[#121414] border border-[#444933] rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#c5c9ac] uppercase mb-1">Target Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CHEST"
                    value={newExCategory}
                    onChange={e => setNewExCategory(e.target.value)}
                    className="w-full bg-[#121414] border border-[#444933] rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#c5c9ac] uppercase mb-1">Training Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. HYPERTROPHY"
                    value={newExType}
                    onChange={e => setNewExType(e.target.value)}
                    className="w-full bg-[#121414] border border-[#444933] rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded tracking-widest hover:brightness-110 active:scale-95 transition-all mt-2"
              >
                INSERT EXERCISE 🏋️‍♂️
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEAL */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e2020] border border-[#444933] max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#444933] bg-[#282a2b] flex justify-between items-center shrink-0">
              <h3 className="font-display text-sm font-extrabold uppercase italic text-volt">
                ADD CUSTOM MEAL
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddMealModal(false)}
                className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMeal} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-[#c5c9ac] uppercase mb-1">Meal Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Scrambled Eggs & Toast"
                  value={newMealName}
                  onChange={e => setNewMealName(e.target.value)}
                  className="w-full bg-[#121414] border border-[#444933] rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono text-[#c5c9ac] uppercase mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    placeholder="25"
                    value={newMealProtein}
                    onChange={e => setNewMealProtein(e.target.value)}
                    className="w-full bg-[#121414] border border-[#444933] rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#c5c9ac] uppercase mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    placeholder="30"
                    value={newMealCarbs}
                    onChange={e => setNewMealCarbs(e.target.value)}
                    className="w-full bg-[#121414] border border-[#444933] rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#c5c9ac] uppercase mb-1">Fats (g)</label>
                  <input 
                    type="number" 
                    placeholder="8"
                    value={newMealFats}
                    onChange={e => setNewMealFats(e.target.value)}
                    className="w-full bg-[#121414] border border-[#444933] rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded tracking-widest hover:brightness-110 active:scale-95 transition-all mt-2"
              >
                INSERT MEAL 🍽️
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
