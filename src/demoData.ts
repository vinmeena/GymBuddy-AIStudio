import { Client, GymOffer, JobPosting, ClientAssessment, ChatMessage, Trainer, User } from "./types";

export const DEMO_OFFERS: GymOffer[] = [
  {
    id: "summer_peak",
    tag: "LIMITED TIME OFFER",
    title: "SUMMER FITNESS BOOSTER",
    subtitle: "Get 30% off ELITE plan for the first 3 months. Unlocks simple Indian diet plans, personal trainer chat, and easy home weight-loss logs.",
    actionText: "CLAIM 30% OFF",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6IidSMroVw5btODTYM98ubc_lQSKFdJUAQxx8thVf-XGjjZIvaQAy4hg9J8aM7M64lbUn6z5M-kTRpZDd4_1uDyw_lXtCpfNiXipMDZNzYD2HORstP3CHffoAuaneEd8xMcGP_VH0ChlQsM_s1zzTHU7l-TwHWVG47Ae1ugeFdKkkIIc-S8AnroZmFM-wj8ei1UHsLAUkRm8kYwvN7qmDejCT1lCTFKH50q9_368Btm1UFdh2kXSxAV_MA2mzeuEDCYJYgXIYnP0",
    promoCode: "SUMMER30",
    discountPercent: 30,
    validUntil: "2026-12-31",
    isActive: true,
    gymName: "Kinetic Performance"
  },
  {
    id: "welcome_pro",
    tag: "NEW MEMBER SPECIAL",
    title: "WELCOME STARTER PACK",
    subtitle: "Flat 20% discount on PRO & ELITE membership with 1 free personal fitness assessment and custom meal plan.",
    actionText: "APPLY CODE",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    promoCode: "WELCOME20",
    discountPercent: 20,
    validUntil: "2026-12-31",
    isActive: true,
    gymName: "Kinetic Performance"
  },
  {
    id: "biometric_promo",
    tag: "EASY WATCH SYNC",
    title: "CONNECT YOUR SMARTWATCH",
    subtitle: "Simply connect your Fitbit, Garmin, or Apple Watch to track your daily steps, running speed, and heart-rate instantly.",
    actionText: "SYNC WATCH",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    promoCode: "SMARTFIT10",
    discountPercent: 10,
    validUntil: "2026-12-31",
    isActive: true,
    gymName: "Kinetic Performance"
  }
];

export const DEMO_CLIENTS: Client[] = [
  {
    id: "marcus_chen",
    loginId: "KNT-MARCUS",
    name: "Marcus Chen",
    email: "marcus@kinetic.pro",
    level: "Elite Athlete",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_8WC5T1lBgQKqukBbconm9ZQhXiqpNNWR10_xusW9t7zaoGiG_KV75jWsS79GCBKpfxD5WQt2vwqpLpPMvw37r8dZuk7LAeG-kMjwkAn8odjzqYJJqWNLRIccOffP4ev0xwLfTIwhR4uI6LnEY_4KdtRbKBHTOb4z1BvsLjrlYt1WZU6T_QkGAFUCEg6FRgEKh8SLc0qHEohDrdyVI-J6S9qshAQ4xZTciZVo-4xmAk-mrO8sB42IqdMYvxPBXo9HUrdpxkXnTQU",
    activeTier: "PRO",
    hasPaidFee: true,
    linkedTrainerId: "alex_volt",
    linkedTrainerStatus: "approved",
    workoutPlan: {
      id: "w_marcus",
      title: "Hypertrophy B",
      subtitle: "LEGS & CORE",
      durationMin: 75,
      targetKcal: 2850,
      date: "TUESDAY, OCT 24",
      exercises: [
        {
          id: "ex_bench",
          name: "Barbell Bench Press",
          category: "CHEST",
          type: "STRENGTH",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBYHRcoQ6NmNZ_vvQkvFr3QMFl-elHT5WJk_bnUyp3Oh2M4cLGxbrpjxNHr0tX5w4Ctf05pR0YkWb2TewZ0oMpoHawNadvtxL3JJXqNRnMtgmyQgt1D6lKtDke1dZ1KnUwoMAlfEqW6TsjgniSSicd5b8F4o-HsqhGtW6Iwg49a35USXX27yVVbJlY-K0kwDabpYFszoAy0wFZTRnFPRlvVltJwkVPEleDoFrTJa8yKPqvNu3rDkjZF_BQsIKz7_IfsyG3DHiMpGg",
          sets: [
            { setNumber: 1, previous: "100 x 8", weight: 102.5, reps: 8, completed: false },
            { setNumber: 2, previous: "100 x 8", weight: 102.5, reps: 8, completed: false }
          ]
        },
        {
          id: "ex_overhead",
          name: "Overhead Press",
          category: "SHOULDERS",
          type: "HYPERTROPHY",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL5fPH3CAVNDEnNEusT-gMPgLgnj230U5fLRh9M43m1P8llovIN7sLgaDyKje-3Y0i3oKXwf8KQlhdRubf5kBS8vXfsCnqVwVEvWC0n7KBuV9dyfI1CNX1qwWoYR06Of6A-DO-sTJGfkju2TI0d2TCEP3boglGl96wPyvzx9UEKddpONfOy85W_g_WhmzDxI5b92fG3gB3hhKgGMwVxjxUeGJEe1nguqBJ0EckKBtLPvmnsmgDGulkO6SMdFkmQawP7PFxjtyC544",
          sets: [
            { setNumber: 1, previous: "60 x 10", weight: 60, reps: 10, completed: false }
          ]
        }
      ]
    },
    dietPlan: {
      id: "d_marcus",
      date: "TUESDAY, OCT 24",
      macros: {
        protein: { current: 185, target: 220 },
        carbs: { current: 310, target: 350 },
        fats: { current: 65, target: 75 }
      },
      meals: [
        {
          id: "m1",
          timeLabel: "MEAL 01: BREAKFAST",
          name: "Pro-Oats with Berries",
          kcal: 620,
          proteinG: 45,
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARFSuDo6nPufAt1gh6sc9Es0tGrefP1kcTenfAMTRm6V4_QpmFgl9B6L37rRb89h4Io6hlraA0q6SREICK7J9bLIRh3Q5yqG0KCIkq5GTKWHffa6c3fkdX76bxL3igZ-mUWvcg5fuvK7p7Z955nvhLTZ2nIMr1AGwreOHnVj6xDAcBq4OO_hEjZKv1fogcTBkqUXq5RiMu6sv1e4tvQwQyUSngjShIERry26r59IaixbuAEHXMtATb2YGs-AWJx91zmA49Dxnxs_M",
          completed: true
        },
        {
          id: "m2",
          timeLabel: "MEAL 02: LUNCH",
          name: "Lean Salmon Bowl",
          kcal: 550,
          proteinG: 40,
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLyuWZcFU4ir09G9AI7F2bKriqgL2JJplHki6PwYvZeb8b7MrNsMpjB_fAVKvRkljnLqgdG3FOvinG7nclh2uf3H2uBKhFYKkBwdhWeYydjyV7mozvllwP7yMo-ohHQW0iSdqDAtnWofztWyT9TaF5q7lwKb_JTWEZzKtw7Y6z9NUbR7zowExah_o1_CamvT4EnjQbTFg0L-Mw2HsyzEMf-W18Uw4CiX1o5kgO2g7C0M35qDIErQbpwZPDpSnD8P9rpnnmM7jmsCA",
          completed: false
        },
        {
          id: "m3",
          timeLabel: "MEAL 03: POST-WORKOUT",
          name: "Whey & Nut Butter",
          kcal: 320,
          proteinG: 30,
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_k-JoWaJd_Qs6GpOLYUB7WSVRbeRRmu2O4N4extI5b8-8F1hcRaGX2Purv_GOtpu0UlVTbepTHEPj4hyaxgfrodY-uUYMVoGw0Ar_sniywkoomhYCGPcn71BR2tVG8Ez3LaVBNtvs10bdfJEsnxcDMWgGaybqMWsUXjgEDYK5tYhTIXGCsh1BmTmM5J9RO9ZZAjUlgm1WUAlOnjWd5d_bMse9NOv1XQrfwZ8qAUYg2GuYMPUbcm5KfqBZr-XHsB4se5M3uhRWOfY",
          completed: false
        }
      ]
    },
    supplements: [
      { id: "s1", name: "Multivitamin", timeLabel: "08:00 AM • 1 CAP", icon: "pill", completed: true },
      { id: "s2", name: "Creatine Mono", timeLabel: "PRE-WORKOUT • 5G", icon: "water_drop", completed: false },
      { id: "s3", name: "Beta-Alanine", timeLabel: "PRE-WORKOUT • 3.2G", icon: "bolt", completed: false },
      { id: "s4", name: "Whey Isolate", timeLabel: "POST-WORKOUT • 30G", icon: "fitness_center", completed: false },
      { id: "s5", name: "ZMA Complex", timeLabel: "BEFORE BED • 2 CAPS", icon: "bedtime", completed: false }
    ],
    cardioLogs: [
      { id: "c1", date: "OCT 23", type: "RUN", distanceKm: 8.2, timeMin: "42:15", avgHeartRate: 148, pace: "5:09/KM" },
      { id: "c2", date: "OCT 21", type: "CYCLE", distanceKm: 25.0, timeMin: "1:05:00", avgHeartRate: 138, pace: "2:36/KM" }
    ],
    wellnessCheckIns: [
      { id: "w1", date: "2026-07-03", sleepQuality: 4, soreness: 3, motivation: 5, notes: "Slept great. Ready to smash bench press today!" },
      { id: "w2", date: "2026-07-04", sleepQuality: 3, soreness: 4, motivation: 4, notes: "A bit sore in quads from legs session yesterday." },
      { id: "w3", date: "2026-07-05", sleepQuality: 5, soreness: 2, motivation: 5, notes: "Elite focus today, ready for heavy lifting." }
    ]
  },
  {
    id: "sarah_miller",
    loginId: "KNT-SARAH",
    name: "Sarah J. Miller",
    email: "sarah@kinetic.pro",
    level: "Active Member",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoH-I4E2CmMEeMFvrlPsjkzmxYvRI1wfo9kzLIpDzrMBLmazEA88o5HAmqoszPYh1aHO88nysSGt_iLtLQdK76Tq0YoeoH0zMocC7nc1bemZdlEKEUecp77P-QEHrCCTNT4R4VYANBJk49S_GMF1oW1ihYYhxAfYcUQhzj-zDelKMrni_vuYERYGiTzn1EQXWWIZtnINrOLlIcG011nYgxmhnDFQ08zyPyRkDrAL-F2vr7Sd8eEmG_HhCXJuW-q8iwG96L0CrDBXY",
    activeTier: "PRO",
    hasPaidFee: false,
    linkedTrainerId: "alex_volt",
    linkedTrainerStatus: "approved",
    workoutPlan: {
      id: "w_sarah",
      title: "Metabolic Blast",
      subtitle: "FULL BODY CONDITIONING",
      durationMin: 60,
      targetKcal: 1800,
      date: "TUESDAY, OCT 24",
      exercises: [
        {
          id: "ex_kettle",
          name: "Kettlebell Swings",
          category: "FULL BODY",
          type: "ENDURANCE",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoH-I4E2CmMEeMFvrlPsjkzmxYvRI1wfo9kzLIpDzrMBLmazEA88o5HAmqoszPYh1aHO88nysSGt_iLtLQdK76Tq0YoeoH0zMocC7nc1bemZdlEKEUecp77P-QEHrCCTNT4R4VYANBJk49S_GMF1oW1ihYYhxAfYcUQhzj-zDelKMrni_vuYERYGiTzn1EQXWWIZtnINrOLlIcG011nYgxmhnDFQ08zyPyRkDrAL-F2vr7Sd8eEmG_HhCXJuW-q8iwG96L0CrDBXY",
          sets: [
            { setNumber: 1, previous: "16kg x 20", weight: 20, reps: 20, completed: true },
            { setNumber: 2, previous: "16kg x 20", weight: 20, reps: 20, completed: true },
            { setNumber: 3, previous: "20kg x 15", weight: 20, reps: 15, completed: false }
          ]
        }
      ]
    },
    dietPlan: {
      id: "d_sarah",
      date: "TUESDAY, OCT 24",
      macros: {
        protein: { current: 110, target: 140 },
        carbs: { current: 150, target: 180 },
        fats: { current: 42, target: 55 }
      },
      meals: [
        {
          id: "m_sarah_1",
          timeLabel: "MEAL 01: BREAKFAST",
          name: "Egg White Omelette with Avocado",
          kcal: 380,
          proteinG: 35,
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARFSuDo6nPufAt1gh6sc9Es0tGrefP1kcTenfAMTRm6V4_QpmFgl9B6L37rRb89h4Io6hlraA0q6SREICK7J9bLIRh3Q5yqG0KCIkq5GTKWHffa6c3fkdX76bxL3igZ-mUWvcg5fuvK7p7Z955nvhLTZ2nIMr1AGwreOHnVj6xDAcBq4OO_hEjZKv1fogcTBkqUXq5RiMu6sv1e4tvQwQyUSngjShIERry26r59IaixbuAEHXMtATb2YGs-AWJx91zmA49Dxnxs_M",
          completed: true
        }
      ]
    },
    supplements: [
      { id: "s1", name: "Multivitamin", timeLabel: "08:00 AM • 1 CAP", icon: "pill", completed: true },
      { id: "s4", name: "Whey Isolate", timeLabel: "POST-WORKOUT • 25G", icon: "fitness_center", completed: false }
    ],
    cardioLogs: [],
    wellnessCheckIns: [
      { id: "ws1", date: "2026-07-04", sleepQuality: 3, soreness: 2, motivation: 4 },
      { id: "ws2", date: "2026-07-05", sleepQuality: 4, soreness: 3, motivation: 3 }
    ]
  },
  {
    id: "david_vance",
    loginId: "KNT-DAVID",
    name: "David Vance",
    email: "david@kinetic.pro",
    level: "Masters Level",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9YqLCKGKwJg_kNpiDRGoafns_gs-8nu3P9D_98OhTQrGXsZYddKTfqwJi4Dhdqc2QqpILhR8t-ZiUy6vgZUP4A3YoKWf5N4kqn7Cpq_IWf85ZVzClwouSIMcDb-qV1BVdhefzNZD5iII0Q6n_NdoKvkOsGR8O8souaDuwGk0KTuCntoHOaJK-YslJdbJXApbUsjvBH0tj0uP41eJSgZ_YrpouadsaZSSRXWZtXe4pMFv8Vf5Mm_VYtb0MnCagkGJzW-GvYu4-ycg",
    activeTier: "BASIC",
    hasPaidFee: false,
    linkedTrainerId: "alex_volt",
    linkedTrainerStatus: "approved",
    workoutPlan: {
      id: "w_david",
      title: "Recovery Flow",
      subtitle: "MOBILITY & YOGA",
      durationMin: 45,
      targetKcal: 600,
      date: "TUESDAY, OCT 24",
      exercises: [
        {
          id: "ex_yoga",
          name: "Hip Opener Sequences",
          category: "MOBILITY",
          type: "YOGA",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9YqLCKGKwJg_kNpiDRGoafns_gs-8nu3P9D_98OhTQrGXsZYddKTfqwJi4Dhdqc2QqpILhR8t-ZiUy6vgZUP4A3YoKWf5N4kqn7Cpq_IWf85ZVzClouSIMcDb-qV1BVdhefzNZD5iII0Q6n_NdoKvkOsGR8O8souaDuwGk0KTuCntoHOaJK-YslJdbJXApbUsjvBH0tj0uP41eJSgZ_YrpouadsaZSSRXWZtXe4pMFv8Vf5Mm_VYtb0MnCagkGJzW-GvYu4-ycg",
          sets: [
            { setNumber: 1, previous: "10 mins", weight: 0, reps: 1, completed: true }
          ]
        }
      ]
    },
    dietPlan: {
      id: "d_david",
      date: "TUESDAY, OCT 24",
      macros: {
        protein: { current: 90, target: 120 },
        carbs: { current: 180, target: 200 },
        fats: { current: 50, target: 60 }
      },
      meals: []
    },
    supplements: [
      { id: "s1", name: "Glucosamine", timeLabel: "08:00 AM • 2 TABS", icon: "pill", completed: true }
    ],
    cardioLogs: [],
    wellnessCheckIns: [
      { id: "wd1", date: "2026-07-05", sleepQuality: 5, soreness: 1, motivation: 4, notes: "Feeling light and refreshed for recovery flow." }
    ]
  }
];

export const DEMO_JOBS: JobPosting[] = [
  {
    id: "job1",
    title: "Senior Gym Trainer",
    gymName: "Gym Buddy Mumbai HQ",
    location: "Bandra West, Mumbai",
    salaryRange: "₹45,000 - ₹65,000 / Month",
    type: "Full-Time",
    description: "Seeking a certified fitness coach to guide daily strength, core workouts, and basic nutrition plans for gym members. Friendly English and Hindi communication is preferred.",
    createdAt: "Just now",
    contactEmail: "careers@gymbuddy.in",
    contactPhone: "+91 98765 43210"
  },
  {
    id: "job2",
    title: "Cardio & Zumba Instructor",
    gymName: "Gym Buddy Bangalore Centre",
    location: "Indiranagar, Bangalore",
    salaryRange: "₹25,000 - ₹35,000 / Month",
    type: "Part-Time",
    description: "Looking for an energetic, lively instructor for group cardio, fat-loss workouts, and interactive aerobics classes in early morning slots.",
    createdAt: "2 days ago",
    contactEmail: "jobs.bangalore@gymbuddy.in",
    contactPhone: "+91 87654 32109"
  }
];

export const DEMO_ASSESSMENTS: ClientAssessment[] = [
  {
    id: "as_1",
    clientId: "marcus_chen",
    clientName: "Marcus Chen",
    weightKg: 88.5,
    bodyFatPct: 9.8,
    goals: "Prep for State Classic Bodybuilding - target sub 8% body fat while retaining total bench power.",
    notes: "Requires precise metabolic macro adjustments on low-carb days. Squat activation has improved by 12%.",
    status: "reviewed",
    date: "2026-07-01"
  },
  {
    id: "as_2",
    clientId: "sarah_miller",
    clientName: "Sarah J. Miller",
    weightKg: 64.2,
    bodyFatPct: 18.5,
    goals: "Improve VO2 max score, achieve standard metabolic threshold and log 40km running per week.",
    notes: "Pending assessment of physical fatigue levels during high hydration schedules.",
    status: "pending",
    date: "2026-07-05"
  }
];

export const DEMO_CHATS: ChatMessage[] = [
  {
    id: "m_init_1",
    senderId: "alex_volt",
    senderName: 'Alex "Volt" Rivers',
    recipientId: "marcus_chen",
    text: "Hey Marcus, your bench press weight was updated to 102.5kg for today. Focus on speed off the chest!",
    timestamp: "08:15 AM"
  },
  {
    id: "m_init_2",
    senderId: "marcus_chen",
    senderName: "Marcus Chen",
    recipientId: "alex_volt",
    text: "Got it, coach! Feel super explosive today. Pro-Oats felt perfect for energy.",
    timestamp: "08:18 AM"
  },
  {
    id: "m_init_3",
    senderId: "alex_volt",
    senderName: 'Alex "Volt" Rivers',
    recipientId: "sarah_miller",
    text: "Hey Sarah! Keep pushing that Metabolic Blast today. Ensure you hit at least 140g protein.",
    timestamp: "Yesterday"
  },
  {
    id: "m_init_4",
    senderId: "sarah_miller",
    senderName: "Sarah J. Miller",
    recipientId: "alex_volt",
    text: "Thanks Alex! Submitting my daily fuel log soon.",
    timestamp: "Yesterday"
  }
];

export const DEMO_TRAINERS: Trainer[] = [
  {
    id: "alex_volt",
    loginId: "KNT-ALEX",
    name: "Alex \"Volt\" Rivers",
    email: "alex@kinetic.pro",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz4e-JW_2W6OazRiqtYWbTxuOeHw1WrY6nqGkcpyWJRfhePDWl1mrv6rGkH1iGQ5MLjTZ1lcv-5bdgkVcVR5qYnBcmpJfKxW81rPK55cu6kGPh9ax-Dl6-JQdsVDyfDmHwPmLPyI0xy1XGoqdesSRfd9EFFpxaGyUAKTuZgt8jy_fWiz6-0hPHxR4Xd_WSAExK5icD2SJhNHHEBeGTgvUfVaN1qTGGgwV_Lx1S-ndW6_ZWEXPGECPW65VnQk56R7RzBcw7-RL1_6g",
    bio: "Elite athletic performance coach. Specializes in force activation, gait tracking, compound lifting mechanics, and bio-marker recovery sync.",
    specialty: "Power & Hypertrophy Conditioning",
    experience: "8+ Years",
    status: "approved"
  },
  {
    id: "jordan_apex",
    loginId: "KNT-JORDAN",
    name: "Jordan \"Apex\" Steele",
    email: "jordan@kinetic.pro",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",
    bio: "High-intensity expert and conditioning specialist. Dedicated to raising active thresholds and running metabolic conditioning circuits.",
    specialty: "HIIT & Fat Loss Conditioning",
    experience: "5+ Years",
    status: "approved"
  },
  {
    id: "elena_symmetry",
    loginId: "KNT-ELENA",
    name: "Elena \"Symmetry\" Rostova",
    email: "elena@kinetic.pro",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    bio: "Active yoga therapist, biomechanics master. Focused on posture symmetry, deep core stabilization, and hydration health parameters.",
    specialty: "Mobility & Structural Recovery",
    experience: "6+ Years",
    status: "pending"
  }
];

export const DEMO_USERS: User[] = [
  {
    id: "owner_elena",
    email: "owner@kinetic.pro",
    name: "Elena Vance",
    role: "OWNER",
    passwordPlain: "owner123",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    gymName: "Kinetic Performance"
  },
  {
    id: "user_alex",
    loginId: "KNT-ALEX",
    email: "alex@kinetic.pro",
    name: "Alex \"Volt\" Rivers",
    role: "TRAINER",
    passwordPlain: "trainer123",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz4e-JW_2W6OazRiqtYWbTxuOeHw1WrY6nqGkcpyWJRfhePDWl1mrv6rGkH1iGQ5MLjTZ1lcv-5bdgkVcVR5qYnBcmpJfKxW81rPK55cu6kGPh9ax-Dl6-JQdsVDyfDmHwPmLPyI0xy1XGoqdesSRfd9EFFpxaGyUAKTuZgt8jy_fWiz6-0hPHxR4Xd_WSAExK5icD2SJhNHHEBeGTgvUfVaN1qTGGgwV_Lx1S-ndW6_ZWEXPGECPW65VnQk56R7RzBcw7-RL1_6g",
    trainerId: "alex_volt",
    gymName: "Kinetic Performance"
  },
  {
    id: "user_jordan",
    loginId: "KNT-JORDAN",
    email: "jordan@kinetic.pro",
    name: "Jordan \"Apex\" Steele",
    role: "TRAINER",
    passwordPlain: "trainer123",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",
    trainerId: "jordan_apex",
    gymName: "Kinetic Performance"
  },
  {
    id: "user_marcus",
    loginId: "KNT-MARCUS",
    email: "marcus@kinetic.pro",
    name: "Marcus Chen",
    role: "CLIENT",
    passwordPlain: "client123",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_8WC5T1lBgQKqukBbconm9ZQhXiqpNNWR10_xusW9t7zaoGiG_KV75jWsS79GCBKpfxD5WQt2vwqpLpPMvw37r8dZuk7LAeG-kMjwkAn8odjzqYJJqWNLRIccOffP4ev0xwLfTIwhR4uI6LnEY_4KdtRbKBHTOb4z1BvsLjrlYt1WZU6T_QkGAFUCEg6FRgEKh8SLc0qHEohDrdyVI-J6S9qshAQ4xZTciZVo-4xmAk-mrO8sB42IqdMYvxPBXo9HUrdpxkXnTQU",
    clientId: "marcus_chen",
    gymName: "Kinetic Performance"
  },
  {
    id: "user_sarah",
    loginId: "KNT-SARAH",
    email: "sarah@kinetic.pro",
    name: "Sarah J. Miller",
    role: "CLIENT",
    passwordPlain: "client123",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoH-I4E2CmMEeMFvrlPsjkzmxYvRI1wfo9kzLIpDzrMBLmazEA88o5HAmqoszPYh1aHO88nysSGt_iLtLQdK76Tq0YoeoH0zMocC7nc1bemZdlEKEUecp77P-QEHrCCTNT4R4VYANBJk49S_GMF1oW1ihYYhxAfYcUQhzj-zDelKMrni_vuYERYGiTzn1EQXWWIZtnINrOLlIcG011nYgxmhnDFQ08zyPyRkDrAL-F2vr7Sd8eEmG_HhCXJuW-q8iwG96L0CrDBXY",
    clientId: "sarah_miller",
    gymName: "Kinetic Performance"
  },
  {
    id: "user_david",
    loginId: "KNT-DAVID",
    email: "david@kinetic.pro",
    name: "David Vance",
    role: "CLIENT",
    passwordPlain: "client123",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9YqLCKGKwJg_kNpiDRGoafns_gs-8nu3P9D_98OhTQrGXsZYddKTfqwJi4Dhdqc2QqpILhR8t-ZiUy6vgZUP4A3YoKWf5N4kqn7Cpq_IWf85ZVzClouSIMcDb-qV1BVdhefzNZD5iII0Q6n_NdoKvkOsGR8O8souaDuwGk0KTuCntoHOaJK-YslJdbJXApbUsjvBH0tj0uP41eJSgZ_YrpouadsaZSSRXWZtXe4pMFv8Vf5Mm_VYtb0MnCagkGJzW-GvYu4-ycg",
    clientId: "david_vance",
    gymName: "Kinetic Performance"
  }
];
