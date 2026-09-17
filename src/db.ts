import { Client, JobPosting, ClientAssessment, ChatMessage, GymOffer, MembershipTier, Trainer, User, WeeklyPlan, DailyHistoryEntry } from "./types";
import { 
  DEMO_CLIENTS, DEMO_TRAINERS, DEMO_USERS, DEMO_JOBS, 
  DEMO_ASSESSMENTS, DEMO_CHATS, DEMO_OFFERS 
} from "./demoData";

// Active core tiers available in the system
export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "BASIC",
    name: "BASIC PLAN",
    price: 499,
    features: ["Daily Gym Entry", "Simple Workout Log", "Basic Support"],
    disabledFeatures: ["Personalized Diet Chart", "Direct Chat with Trainer", "Full Progress History"]
  },
  {
    id: "PRO",
    name: "PRO PLAN",
    price: 1499,
    features: ["Daily Gym Entry", "Personal Diet & Meal Charts", "Direct Chat with Trainer", "Full Progress History"],
    disabledFeatures: [],
    isRecommended: true
  },
  {
    id: "ELITE",
    name: "ELITE PLAN",
    price: 2999,
    features: ["Everything in PRO Plan", "1-on-1 Personal Trainer", "Daily Audio Calls Support", "All-Gym Branch Access Pass"],
    disabledFeatures: []
  }
];

// Default starter datasets for high-fidelity interactive sandbox & production
export const INITIAL_OFFERS: GymOffer[] = DEMO_OFFERS;
export const INITIAL_CLIENTS: Client[] = DEMO_CLIENTS;
export const INITIAL_TRAINERS: Trainer[] = DEMO_TRAINERS;
export const INITIAL_JOBS: JobPosting[] = DEMO_JOBS;
export const INITIAL_ASSESSMENTS: ClientAssessment[] = DEMO_ASSESSMENTS;
export const INITIAL_CHATS: ChatMessage[] = DEMO_CHATS;
export const INITIAL_USERS: User[] = DEMO_USERS;

// Helper to interact with local storage database safely
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(`kinetic_pro_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error("Local storage read error for key: ", key, e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`kinetic_pro_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage write error for key: ", key, e);
  }
}

export function ensureClientWeeklyPlan(client: Client): Client {
  if (client.weeklyPlan && client.history) {
    return client;
  }

  const updatedClient = { ...client };

  if (!updatedClient.history) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const historyList: DailyHistoryEntry[] = [];
    
    // Add past 5 days of history for high visual fidelity
    const today = new Date();
    for (let i = 5; i >= 1; i--) {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - i);
      const dateStr = pastDate.toISOString().split("T")[0];
      const dayName = days[pastDate.getDay() === 0 ? 6 : pastDate.getDay() - 1];
      
      historyList.push({
        date: dateStr,
        dayOfWeek: dayName,
        completed: i % 3 !== 0,
        workout: client.workoutPlan ? {
          ...client.workoutPlan,
          date: dateStr,
          exercises: client.workoutPlan.exercises?.map(ex => ({
            ...ex,
            sets: ex.sets.map(s => ({ ...s, completed: i % 3 !== 0 }))
          })) || []
        } : null,
        diet: client.dietPlan ? {
          ...client.dietPlan,
          date: dateStr,
          meals: client.dietPlan.meals.map(m => ({ ...m, completed: i % 3 !== 0 }))
        } : null,
        supplements: client.supplements?.map(s => ({ ...s, completed: i % 3 !== 0 })) || [],
        cardio: client.cardioLogs?.[0] || null
      });
    }
    updatedClient.history = historyList;
  }

  if (!updatedClient.weeklyPlan) {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
    const weeklyPlan: WeeklyPlan = {};

    daysOfWeek.forEach((day, index) => {
      const isActiveDay = [0, 2, 4, 5].includes(index); // Mon, Wed, Fri, Sat
      
      const dayWorkout = isActiveDay && client.workoutPlan ? {
        ...client.workoutPlan,
        title: index === 0 ? "Hypertrophy A" : index === 2 ? "Hypertrophy B" : index === 4 ? "Hypertrophy C" : "Conditioning Blast",
        subtitle: index === 0 ? "PUSH DAY (Chest/Shoulders)" : index === 2 ? "PULL DAY (Back/Biceps)" : index === 4 ? "LEGS & CORE" : "HIIT & Core Cardio",
        exercises: client.workoutPlan.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({ ...s, completed: false }))
        }))
      } : {
        id: "w_rest_" + index,
        title: "Active Recovery",
        subtitle: "Mobility, stretching, and light walking",
        durationMin: 30,
        targetKcal: 250,
        exercises: [],
        date: day
      };

      weeklyPlan[day] = {
        workout: dayWorkout,
        diet: client.dietPlan ? {
          ...client.dietPlan,
          macros: {
            protein: { current: 0, target: client.dietPlan.macros.protein.target },
            carbs: { current: 0, target: client.dietPlan.macros.carbs.target },
            fats: { current: 0, target: client.dietPlan.macros.fats.target }
          },
          meals: client.dietPlan.meals.map(m => ({ ...m, completed: false }))
        } : null,
        supplements: client.supplements?.map(s => ({ ...s, completed: false })) || [],
        cardio: client.cardioLogs?.[0] ? {
          ...client.cardioLogs[0],
          id: "cardio_day_" + index
        } : null
      };
    });

    updatedClient.weeklyPlan = weeklyPlan;
  }

  return updatedClient;
}

// Global state wrapper for the application
export class KineticDatabase {
  static getClients(): Client[] {
    const clients = getStoredData("clients", INITIAL_CLIENTS);
    const migrated = clients.map(ensureClientWeeklyPlan);
    const needsSave = JSON.stringify(clients) !== JSON.stringify(migrated);
    if (needsSave) {
      setStoredData("clients", migrated);
    }
    return migrated;
  }

  static saveClients(clients: Client[]): void {
    setStoredData("clients", clients);
  }

  static getTrainers(): Trainer[] {
    return getStoredData("trainers", INITIAL_TRAINERS);
  }

  static saveTrainers(trainers: Trainer[]): void {
    setStoredData("trainers", trainers);
  }

  static getUsers(): User[] {
    const stored = getStoredData("users", INITIAL_USERS);
    let updated = [...stored];
    let changed = false;
    for (const initialUser of INITIAL_USERS) {
      if (!updated.some(u => u.id === initialUser.id || u.email.toLowerCase() === initialUser.email.toLowerCase())) {
        updated.push(initialUser);
        changed = true;
      }
    }
    if (changed) {
      setStoredData("users", updated);
    }
    return updated;
  }

  static saveUsers(users: User[]): void {
    setStoredData("users", users);
  }

  static getJobs(): JobPosting[] {
    return getStoredData("jobs", INITIAL_JOBS);
  }

  static saveJobs(jobs: JobPosting[]): void {
    setStoredData("jobs", jobs);
  }

  static getAssessments(): ClientAssessment[] {
    return getStoredData("assessments", INITIAL_ASSESSMENTS);
  }

  static saveAssessments(assessments: ClientAssessment[]): void {
    setStoredData("assessments", assessments);
  }

  static getChats(): ChatMessage[] {
    return getStoredData("chats", INITIAL_CHATS);
  }

  static saveChats(chats: ChatMessage[]): void {
    setStoredData("chats", chats);
  }

  static getOffers(): GymOffer[] {
    return getStoredData("offers", INITIAL_OFFERS);
  }

  static saveOffers(offers: GymOffer[]): void {
    setStoredData("offers", offers);
  }

  static getCurrentUser(): User | null {
    return getStoredData<User | null>("current_user", null);
  }

  static setCurrentUser(user: User | null): void {
    setStoredData("current_user", user);
  }

  static resetDatabase(): void {
    localStorage.removeItem("kinetic_pro_clients");
    localStorage.removeItem("kinetic_pro_trainers");
    localStorage.removeItem("kinetic_pro_users");
    localStorage.removeItem("kinetic_pro_jobs");
    localStorage.removeItem("kinetic_pro_assessments");
    localStorage.removeItem("kinetic_pro_chats");
    localStorage.removeItem("kinetic_pro_offers");
    localStorage.removeItem("kinetic_pro_current_user");
    window.location.reload();
  }

  static loadDemoSandboxData(): void {
    localStorage.setItem("kinetic_pro_clients", JSON.stringify(DEMO_CLIENTS));
    localStorage.setItem("kinetic_pro_trainers", JSON.stringify(DEMO_TRAINERS));
    localStorage.setItem("kinetic_pro_users", JSON.stringify(DEMO_USERS));
    localStorage.setItem("kinetic_pro_jobs", JSON.stringify(DEMO_JOBS));
    localStorage.setItem("kinetic_pro_assessments", JSON.stringify(DEMO_ASSESSMENTS));
    localStorage.setItem("kinetic_pro_chats", JSON.stringify(DEMO_CHATS));
    localStorage.setItem("kinetic_pro_offers", JSON.stringify(DEMO_OFFERS));
    
    // Set Elena as the logged-in current user for smooth onboarding
    const elenaUser = DEMO_USERS.find(u => u.id === "owner_elena") || null;
    localStorage.setItem("kinetic_pro_current_user", JSON.stringify(elenaUser));
    window.location.reload();
  }
}
