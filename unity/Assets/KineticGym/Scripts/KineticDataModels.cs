using System;
using System.Collections.Generic;
using UnityEngine;

namespace KineticGym
{
    [Serializable]
    public class ExerciseSet
    {
        public int setNumber;
        public string previous;
        public float weight; // in kg
        public int reps;
        public bool completed;
    }

    [Serializable]
    public class Exercise
    {
        public string id;
        public string name;
        public string category; // e.g. "CHEST", "SHOULDERS"
        public string type;     // e.g. "STRENGTH", "HYPERTROPHY"
        public string imageUrl;
        public List<ExerciseSet> sets = new List<ExerciseSet>();
    }

    [Serializable]
    public class WorkoutPlan
    {
        public string id;
        public string title;
        public string subtitle;
        public int durationMin;
        public int targetKcal;
        public List<Exercise> exercises = new List<Exercise>();
        public string date;
    }

    [Serializable]
    public class Meal
    {
        public string id;
        public string timeLabel; // "MEAL 01: BREAKFAST"
        public string name;
        public int kcal;
        public int proteinG;
        public string imageUrl;
        public bool completed;
    }

    [Serializable]
    public class MacroNutrients
    {
        public MacroStat protein = new MacroStat();
        public MacroStat carbs = new MacroStat();
        public MacroStat fats = new MacroStat();
    }

    [Serializable]
    public class MacroStat
    {
        public int current;
        public int target;
    }

    [Serializable]
    public class DietPlan
    {
        public string id;
        public string date;
        public MacroNutrients macros = new MacroNutrients();
        public List<Meal> meals = new List<Meal>();
    }

    [Serializable]
    public class CardioLog
    {
        public string id;
        public string date;
        public string type; // "RUN" | "CYCLE" | "HIIT" | "OTHER"
        public float distanceKm;
        public string timeMin; // "MM:SS" or "HH:MM:SS"
        public int avgHeartRate;
        public string pace; // "5:09/KM"
        public string customType;
    }

    [Serializable]
    public class Supplement
    {
        public string id;
        public string name;
        public string timeLabel; // "08:00 AM • 1 CAP"
        public string icon;
        public bool completed;
    }

    [Serializable]
    public class WellnessCheckIn
    {
        public string id;
        public string date; // YYYY-MM-DD
        public int sleepQuality; // 1 to 5
        public int soreness;     // 1 to 5
        public int motivation;   // 1 to 5
        public string notes;
    }

    [Serializable]
    public class DailyHistoryEntry
    {
        public string date; // YYYY-MM-DD
        public string dayOfWeek;
        public bool completed;
        public WorkoutPlan workout;
        public DietPlan diet;
        public List<Supplement> supplements = new List<Supplement>();
        public CardioLog cardio;
    }

    [Serializable]
    public class Client
    {
        public string id;
        public string loginId;
        public string name;
        public string email;
        public string level; // "Elite Athlete" | "Active Member"
        public string avatarUrl;
        public string activeTier; // "BASIC" | "PRO" | "ELITE" | "SOLO"
        public bool hasPaidFee;
        public WorkoutPlan workoutPlan;
        public DietPlan dietPlan;
        public List<Supplement> supplements = new List<Supplement>();
        public List<CardioLog> cardioLogs = new List<CardioLog>();
        public string linkedTrainerId;
        public string linkedTrainerStatus; // "none" | "pending" | "approved" | "declined"
        public List<WellnessCheckIn> wellnessCheckIns = new List<WellnessCheckIn>();
        public string gymName;
        public List<DailyHistoryEntry> history = new List<DailyHistoryEntry>();
    }

    [Serializable]
    public class Trainer
    {
        public string id;
        public string loginId;
        public string name;
        public string email;
        public string avatarUrl;
        public string bio;
        public string specialty;
        public string experience;
        public string status; // "pending" | "approved"
        public string gymName;
    }

    [Serializable]
    public class User
    {
        public string id;
        public string loginId;
        public string email;
        public string name;
        public string role; // "OWNER" | "TRAINER" | "CLIENT"
        public string avatarUrl;
        public string trainerId;
        public string clientId;
        public string gymName;
        public string specialty;
        public string experience;
        public string bio;
    }

    [Serializable]
    public class ChatMessage
    {
        public string id;
        public string senderId;
        public string senderName;
        public string recipientId;
        public string text;
        public string timestamp;
        public long createdAt;
    }
}
