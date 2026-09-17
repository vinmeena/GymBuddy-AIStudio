export interface ExerciseSet {
  setNumber: number;
  previous: string;
  weight: number; // in kg
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: string; // e.g. "CHEST", "SHOULDERS"
  type: string; // e.g. "STRENGTH", "HYPERTROPHY"
  imageUrl: string;
  sets: ExerciseSet[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  targetKcal: number;
  exercises: Exercise[];
  date: string;
}

export interface Meal {
  id: string;
  timeLabel: string; // "MEAL 01: BREAKFAST"
  name: string;
  kcal: number;
  proteinG: number;
  imageUrl: string;
  completed: boolean;
}

export interface DietPlan {
  id: string;
  date: string;
  macros: {
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fats: { current: number; target: number };
  };
  meals: Meal[];
}

export interface CardioLog {
  id: string;
  date: string;
  type: "RUN" | "CYCLE" | "HIIT" | "OTHER";
  distanceKm: number;
  timeMin: string; // "MM:SS" or "HH:MM:SS"
  avgHeartRate: number;
  pace: string; // "5:09/KM"
  customType?: string;
}

export interface Supplement {
  id: string;
  name: string;
  timeLabel: string; // "08:00 AM • 1 CAP" or "PRE-WORKOUT • 5G"
  icon: string; // "pill" | "water_drop" | "bolt" | "fitness_center" | "bedtime"
  completed: boolean;
}

export interface JobPosting {
  id: string;
  title: string;
  gymName: string;
  location: string;
  salaryRange: string;
  type: "Full-Time" | "Part-Time" | "Contract";
  description: string;
  createdAt: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ClientAssessment {
  id: string;
  clientId: string;
  clientName: string;
  weightKg: number;
  bodyFatPct: number;
  goals: string;
  notes: string;
  status: "pending" | "reviewed";
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  timestamp: string;
  createdAt?: number;
}

export interface MembershipTier {
  id: "BASIC" | "PRO" | "ELITE" | "SOLO";
  name: string;
  price: number;
  features: string[];
  disabledFeatures: string[];
  isRecommended?: boolean;
}

export interface GymOffer {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  actionText: string;
  imageUrl: string;
  promoCode?: string;
  discountPercent?: number;
  validUntil?: string;
  expiresAt?: string;
  isActive?: boolean;
  gymName?: string;
}

export interface PaymentInvoice {
  id: string; // e.g. "INV-2026-9812"
  clientId: string;
  clientName: string;
  clientEmail: string;
  tier: "BASIC" | "PRO" | "ELITE" | "SOLO";
  period: "MONTHLY" | "ANNUAL";
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  promoCodeApplied?: string;
  paymentMethod: "CARD" | "UPI" | "NETBANKING" | "RAZORPAY";
  transactionRef: string;
  status: "PAID" | "PENDING" | "REFUNDED";
  createdAt: string; // ISO string
  validUntil: string; // ISO string
  gymName: string;
}

export interface WellnessCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  sleepQuality: number; // 1 to 5
  soreness: number; // 1 to 5
  motivation: number; // 1 to 5
  notes?: string;
}

export interface WeeklyPlanDay {
  workout: WorkoutPlan | null;
  diet: DietPlan | null;
  supplements: Supplement[];
  cardio: CardioLog | null;
}

export interface WeeklyPlan {
  Monday?: WeeklyPlanDay;
  Tuesday?: WeeklyPlanDay;
  Wednesday?: WeeklyPlanDay;
  Thursday?: WeeklyPlanDay;
  Friday?: WeeklyPlanDay;
  Saturday?: WeeklyPlanDay;
  Sunday?: WeeklyPlanDay;
}

export interface DailyHistoryEntry {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  completed: boolean;
  workout: WorkoutPlan | null;
  diet: DietPlan | null;
  supplements: Supplement[];
  cardio: CardioLog | null;
}

export interface Client {
  id: string;
  loginId?: string;
  name: string;
  email: string;
  level: string; // "Elite Athlete" | "Active Member" | "Masters Level"
  avatarUrl: string;
  activeTier: "BASIC" | "PRO" | "ELITE" | "SOLO" | null;
  hasPaidFee: boolean;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  membershipStatus?: "ACTIVE" | "EXPIRED" | "TRIAL" | "NONE";
  billingPeriod?: "MONTHLY" | "ANNUAL";
  invoices?: PaymentInvoice[];
  workoutPlan: WorkoutPlan;
  dietPlan: DietPlan;
  supplements: Supplement[];
  cardioLogs: CardioLog[];
  linkedTrainerId?: string | null;
  linkedTrainerStatus?: "none" | "pending" | "approved" | "declined";
  wellnessCheckIns?: WellnessCheckIn[];
  gymName?: string;
  weeklyPlan?: WeeklyPlan;
  history?: DailyHistoryEntry[];
}

export interface Trainer {
  id: string;
  loginId?: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  specialty: string;
  experience: string;
  status: "pending" | "approved";
  gymName?: string;
}

export interface User {
  id: string;
  loginId?: string;
  email: string;
  name: string;
  role: "OWNER" | "TRAINER" | "CLIENT";
  passwordPlain?: string; // For testing/simulated secure storage validation
  avatarUrl: string;
  trainerId?: string; // If role is TRAINER
  clientId?: string; // If role is CLIENT
  gymName?: string; // Name of their gym
  phone?: string;
  specialty?: string;
  experience?: string;
  bio?: string;
  activeTier?: "BASIC" | "PRO" | "ELITE" | "SOLO" | null;
  hasPaidFee?: boolean;
}
