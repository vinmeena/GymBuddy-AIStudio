import React, { useState } from "react";
import { 
  Users, PlusCircle, FileText, CheckCircle2, TrendingUp, AlertCircle, 
  Trash2, Briefcase, Plus, Dumbbell, Apple, Clock, Flame, Pill, Activity, Zap, X, Sparkles 
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from "recharts";
import { Client, JobPosting, ClientAssessment, WorkoutPlan, DietPlan, Supplement, CardioLog, Exercise, Meal, WeeklyPlan, WeeklyPlanDay } from "../types";

interface TrainerDashboardProps {
  clients: Client[];
  onUpdateClients: (updated: Client[]) => void;
  jobPostings: JobPosting[];
  onAddJob: (job: JobPosting) => void;
  onDeleteJob: (id: string) => void;
  assessments: ClientAssessment[];
  onAddAssessment: (assessment: ClientAssessment) => void;
  onViewClientRoutine: (clientId: string) => void;
  currentTrainerId: string;
}

export default function TrainerDashboard({
  clients,
  onUpdateClients,
  jobPostings,
  onAddJob,
  onDeleteJob,
  assessments,
  onAddAssessment,
  onViewClientRoutine,
  currentTrainerId
}: TrainerDashboardProps) {
  // Modal states
  const [showJobModal, setShowJobModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedClientForPlan, setSelectedClientForPlan] = useState<Client | null>(null);
  const [selectedDay, setSelectedDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday">("Monday");
  
  // Client log sheet inspection modal states
  const [inspectingClientLogs, setInspectingClientLogs] = useState<Client | null>(null);
  const [logModalTab, setLogModalTab] = useState<"wellness" | "cardio" | "workouts">("wellness");
  
  // Sharing and toast states
  const [sharingClient, setSharingClient] = useState<Client | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  const [weeklyPlanBuffer, setWeeklyPlanBuffer] = useState<WeeklyPlan | null>(null);
  const [copyTargetDays, setCopyTargetDays] = useState<string[]>([]);

  // Athlete dossier states
  const [activeDossierId, setActiveDossierId] = useState<string | null>(null);
  const [dossierTab, setDossierTab] = useState<"routine" | "diet" | "cardio" | "supplements" | "assessments" | "wellness">("routine");

  const handleHorizontalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollWidth > container.clientWidth) {
      container.scrollLeft += e.deltaY;
    }
  };

  // Job form state
  const [jobTitle, setJobTitle] = useState("");
  const [gymName, setGymName] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobType, setJobType] = useState<"Full-Time" | "Part-Time" | "Contract">("Full-Time");
  const [jobDesc, setJobDesc] = useState("");

  // Assessment form state
  const [assessmentClient, setAssessmentClient] = useState("");
  const [assessmentWeight, setAssessmentWeight] = useState("");
  const [assessmentBodyFat, setAssessmentBodyFat] = useState("");
  const [assessmentGoals, setAssessmentGoals] = useState("");
  const [assessmentNotes, setAssessmentNotes] = useState("");

  // Plan creation state
  const [planType, setPlanType] = useState<"WORKOUT" | "DIET" | "SUPPLEMENTS" | "CARDIO">("WORKOUT");
  const [workoutTitle, setWorkoutTitle] = useState("Hypertrophy C");
  const [workoutSub, setWorkoutSub] = useState("PULL DAY");
  const [workoutDur, setWorkoutDur] = useState("60");
  const [workoutCal, setWorkoutCal] = useState("2400");
  const [dietProtein, setDietProtein] = useState("180");
  const [dietCarbs, setDietCarbs] = useState("250");
  const [dietFats, setDietFats] = useState("70");

  // Supplements state
  const [supName, setSupName] = useState("Creatine Monohydrate");
  const [supTime, setSupTime] = useState("08:00 AM • 5G");
  const [supIcon, setSupIcon] = useState("bolt");

  // Cardio state
  const [cardioType, setCardioType] = useState<"RUN" | "CYCLE" | "HIIT">("RUN");
  const [cardioDist, setCardioDist] = useState("5.0");
  const [cardioTime, setCardioTime] = useState("25:00");
  const [cardioHR, setCardioHR] = useState("145");
  const [cardioPace, setCardioPace] = useState("5:00/KM");

  const trainerClients = clients.filter(c => c.linkedTrainerId === currentTrainerId && c.linkedTrainerStatus === "approved");
  const pendingRequests = clients.filter(c => c.linkedTrainerId === currentTrainerId && c.linkedTrainerStatus === "pending");

  const activeClientsCount = trainerClients.length;
  const pendingAssessments = assessments.filter(a => a.status === "pending" && trainerClients.some(tc => tc.id === a.clientId)).length;

  const getShareText = (client: Client) => {
    const lines = [];
    lines.push(`⚡ *Gym Buddy Training Plan for ${client.name}* ⚡`);
    
    let planFound = false;
    
    if (client.workoutPlan && client.workoutPlan.exercises && client.workoutPlan.exercises.length > 0) {
      lines.push(`\n🏋️‍♂️ *Workout Plan:* ${client.workoutPlan.title}`);
      if (client.workoutPlan.subtitle) lines.push(`*Focus:* ${client.workoutPlan.subtitle}`);
      lines.push(`*Exercises:*`);
      client.workoutPlan.exercises.slice(0, 8).forEach(ex => {
        lines.push(`  - ${ex.name} (${ex.sets?.length || 3} sets)`);
      });
      planFound = true;
    }
    
    if (client.dietPlan && client.dietPlan.macros) {
      const macros = client.dietPlan.macros;
      lines.push(`\n🍎 *Diet Macros Target:*`);
      if (macros.protein) lines.push(`  - Protein: ${macros.protein.target}g`);
      if (macros.carbs) lines.push(`  - Carbs: ${macros.carbs.target}g`);
      if (macros.fats) lines.push(`  - Fats: ${macros.fats.target}g`);
      planFound = true;
    }

    if (client.weeklyPlan) {
      const activeDays = Object.entries(client.weeklyPlan).filter(([dayName, dayObj]) => 
        (dayObj.workout && dayObj.workout.exercises && dayObj.workout.exercises.length > 0) ||
        (dayObj.diet && dayObj.diet.kcal > 0)
      );
      if (activeDays.length > 0) {
        lines.push(`\n📅 *Weekly Schedule:*`);
        activeDays.forEach(([dayName, dayObj]) => {
          const parts = [];
          if (dayObj.workout?.title) parts.push(`Workout: ${dayObj.workout.title}`);
          if (dayObj.diet?.kcal) parts.push(`Diet: ${dayObj.diet.kcal} kcal`);
          lines.push(`  - ${dayName}: ${parts.join(" | ")}`);
        });
        planFound = true;
      }
    }

    if (!planFound) {
      return "";
    }
    
    lines.push(`\nLet's crush those goals! 💪`);
    return lines.join("\n");
  };

  const handleSharePlan = (client: Client) => {
    const shareText = getShareText(client);
    if (shareText) {
      setSharingClient(client);
    } else {
      setToastMessage(`No fitness plan is prepared for ${client.name} yet!`);
    }
  };

  const handleAcceptRequest = (clientId: string) => {
    const updated = clients.map(c => c.id === clientId ? { ...c, linkedTrainerStatus: "approved" as const } : c);
    onUpdateClients(updated);
  };

  const handleDeclineRequest = (clientId: string) => {
    const updated = clients.map(c => c.id === clientId ? { ...c, linkedTrainerId: null, linkedTrainerStatus: "none" as const } : c);
    onUpdateClients(updated);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !gymName) return;

    const newJob: JobPosting = {
      id: "job_" + Date.now(),
      title: jobTitle,
      gymName,
      location: jobLocation || "Main HQ Studio",
      salaryRange: jobSalary || "$60k - $80k",
      type: jobType,
      description: jobDesc || "Exciting coaching opportunity with our team.",
      createdAt: "Just now"
    };

    onAddJob(newJob);
    // Reset & Close
    setJobTitle("");
    setGymName("");
    setJobLocation("");
    setJobSalary("");
    setJobDesc("");
    setShowJobModal(false);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find(c => c.id === assessmentClient) || clients[0];
    if (!targetClient) return;

    const newAssessment: ClientAssessment = {
      id: "as_" + Date.now(),
      clientId: targetClient.id,
      clientName: targetClient.name,
      weightKg: parseFloat(assessmentWeight) || 75,
      bodyFatPct: parseFloat(assessmentBodyFat) || 15,
      goals: assessmentGoals || "Conditioning and strength gain",
      notes: assessmentNotes || "First bio-metric scan completed.",
      status: "pending",
      date: new Date().toISOString().split("T")[0]
    };

    onAddAssessment(newAssessment);
    setAssessmentWeight("");
    setAssessmentBodyFat("");
    setAssessmentGoals("");
    setAssessmentNotes("");
    setShowAssessmentModal(false);
  };

  const handleOpenPlanModal = (client: Client) => {
    setSelectedClientForPlan(client);
    const clientCopy = JSON.parse(JSON.stringify(client));
    setWeeklyPlanBuffer(clientCopy.weeklyPlan || {});
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[new Date().getDay()];
    setSelectedDay((todayName === "Sunday" ? "Sunday" : todayName) as any);
    setShowPlanModal(true);
  };

  const handleAssignPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPlan || !weeklyPlanBuffer) return;

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[new Date().getDay()];
    
    // Calculate standard todayDateStr YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${month}-${day}`;

    const updatedClients = clients.map(client => {
      if (client.id === selectedClientForPlan.id) {
        // Filter out today's history entry to force client's today view to pull the newly assigned weeklyPlan template!
        const cleanedHistory = (client.history || []).filter(h => h.date !== todayDateStr);
        
        const updatedClient = {
          ...client,
          weeklyPlan: weeklyPlanBuffer,
          history: cleanedHistory
        };

        const todayPlan = weeklyPlanBuffer[todayName as keyof WeeklyPlan] || { workout: null, diet: null, supplements: [], cardio: null };
        if (todayPlan.workout) {
          updatedClient.workoutPlan = {
            ...todayPlan.workout,
            date: "TODAY'S SCHEDULE"
          };
        }
        if (todayPlan.diet) {
          updatedClient.dietPlan = {
            ...todayPlan.diet,
            date: "TODAY'S SCHEDULE"
          };
        }
        if (todayPlan.supplements) {
          updatedClient.supplements = todayPlan.supplements;
        }
        if (todayPlan.cardio) {
          updatedClient.cardioLogs = [
            todayPlan.cardio,
            ...(client.cardioLogs || []).filter(c => c.id !== todayPlan.cardio?.id)
          ];
        }

        return updatedClient;
      }
      return client;
    });

    onUpdateClients(updatedClients);
    setShowPlanModal(false);
    setSelectedClientForPlan(null);
    setWeeklyPlanBuffer(null);
  };

  const getDayPlan = (day: keyof WeeklyPlan): WeeklyPlanDay => {
    if (!weeklyPlanBuffer) return { workout: null, diet: null, supplements: [], cardio: null };
    return weeklyPlanBuffer[day] || { workout: null, diet: null, supplements: [], cardio: null };
  };

  const updateDayPlan = (day: keyof WeeklyPlan, updated: Partial<WeeklyPlanDay>) => {
    if (!weeklyPlanBuffer) return;
    const current = getDayPlan(day);
    setWeeklyPlanBuffer({
      ...weeklyPlanBuffer,
      [day]: {
        ...current,
        ...updated
      }
    });
  };

  const handleApplyCopy = () => {
    if (copyTargetDays.length === 0) return;
    const currentPlan = getDayPlan(selectedDay);
    const updatedBuffer = { ...weeklyPlanBuffer };
    copyTargetDays.forEach(day => {
      updatedBuffer[day as keyof WeeklyPlan] = JSON.parse(JSON.stringify(currentPlan));
    });
    setWeeklyPlanBuffer(updatedBuffer);
    setCopyTargetDays([]);
  };

  return (
    <div className="space-y-8">
      {/* Bento Grid Action Panels */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Active Clients Main Card */}
        <div className="md:col-span-8 bg-[#18181b] p-6 border border-[#27272a] relative overflow-hidden group rounded-3xl transition-all duration-300 hover:border-[#a3e635]">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-1">
                TOTAL ACTIVE CLIENTS
              </p>
              <h3 className="font-display text-5xl md:text-6xl font-black text-volt italic leading-none">
                {activeClientsCount}
              </h3>
            </div>
            <div className="flex items-center text-volt-dim text-sm mt-4 font-mono">
              <TrendingUp size={16} className="mr-1.5" />
              <span>+3 new clients joined this week</span>
            </div>
          </div>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none text-white">
            <Users size={120} />
          </div>
        </div>

        {/* Quick Action: New Assessment */}
        <button
          onClick={() => {
            if (clients.length > 0) {
              setAssessmentClient(clients[0].id);
            }
            setShowAssessmentModal(true);
          }}
          className="md:col-span-4 bg-volt text-black p-6 flex flex-col justify-between hover:bg-lime-300 active:scale-95 transition-all duration-300 volt-glow text-left rounded-3xl group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <div className="mt-8">
            <p className="font-mono text-xs font-black tracking-widest text-zinc-950 uppercase opacity-90">
              QUICK ACTION
            </p>
            <h4 className="font-display text-2xl font-black uppercase leading-tight italic text-zinc-950">
              HEALTH & FITNESS<br />CHECK-IN
            </h4>
          </div>
        </button>

        {/* Pending Assessments Summary List */}
        <div className="md:col-span-12 bg-[#18181b] p-6 border border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl transition-all duration-300 hover:border-[#a3e635]">
          <div>
            <h4 className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-1">
              PENDING CLIENT CHECKS
            </h4>
            <p className="font-sans text-lg text-white font-semibold">
              {pendingAssessments === 0 
                ? "All client logs and assessments are fully updated!" 
                : `${pendingAssessments} client check-ins waiting for your review`}
            </p>
          </div>
          <div className="flex items-center -space-x-3">
            {trainerClients.slice(0, 3).map((c, idx) => (
              <img
                key={c.id}
                src={c.avatarUrl}
                alt={c.name}
                className="w-10 h-10 rounded-full border-2 border-[#09090b] object-cover"
              />
            ))}
            {trainerClients.length > 3 && (
              <div className="w-10 h-10 rounded-full border-2 border-[#09090b] bg-volt text-black font-extrabold flex items-center justify-center text-xs">
                +{trainerClients.length - 3}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Connection requests awaiting trainer vetting */}
      {pendingRequests.length > 0 && (
        <div className="bg-[#18181b] p-6 border-2 border-amber-400/80 shadow-lg shadow-amber-400/5 rounded-3xl space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <p className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
              NEW CLIENT JOIN REQUESTS
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(client => (
              <div key={client.id} className="p-4 bg-[#09090b]/80 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-zinc-700">
                    <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{client.name}</h4>
                    <p className="text-[10px] font-mono text-zinc-500">{client.email || "Active Member"}</p>
                    <p className="text-[10px] text-volt font-semibold mt-1">Goal: {client.workoutPlan?.title || "Active Training"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(client.id)}
                    className="flex-grow py-2 bg-volt text-black font-mono text-[10px] font-black rounded-lg hover:bg-lime-300 transition-colors cursor-pointer"
                  >
                    APPROVE CONNECTION ⚡
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(client.id)}
                    className="px-3 py-2 bg-zinc-900 text-zinc-400 border border-zinc-850 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer font-mono text-[10px]"
                  >
                    DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Client Schedules (Training Plans list matching middle screenshot) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-zinc-850 pb-3">
          <div>
            <span className="font-mono text-[10px] text-volt uppercase tracking-widest font-black">
              ACTIVE TRAINING SCHEDULES
            </span>
            <h3 className="font-display text-xl md:text-2xl font-bold uppercase italic text-white tracking-tight mt-1">
              TODAY'S WORKOUT TARGETS
            </h3>
          </div>
        </div>

        {trainerClients.length === 0 ? (
          <div className="p-8 text-center bg-[#18181b] border border-[#27272a] rounded-3xl text-zinc-500 font-mono text-xs">
            No active linked clients. Connection requests will display above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainerClients.map((client) => {
              const isActive = client.id === "sarah_miller"; // simulating metabolic blast is active now
              return (
              <div 
                key={client.id}
                className={`p-6 rounded-[24px] border flex flex-col justify-between transition-all duration-300 relative group bg-[#18181b] ${
                  isActive 
                    ? "border-volt/80 shadow-[0_4px_24px_rgba(163,230,53,0.06)]" 
                    : "border-zinc-800 hover:border-volt/60 hover:shadow-xl hover:translate-y-[-2px]"
                }`}
              >
                {/* Time badge */}
                <div className="absolute top-5 right-5">
                  <span className={`px-2.5 py-1 text-[10px] font-mono rounded-lg font-bold tracking-wide ${
                    isActive ? "bg-volt text-black font-black" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {isActive ? "ACTIVE NOW" : client.id === "marcus_chen" ? "08:00 AM" : "11:30 AM"}
                  </span>
                </div>

                {/* Workout Title info */}
                <div className="mb-6 mt-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1 font-bold">
                    ASSIGNED PROGRAM
                  </span>
                  <h4 className="font-display text-lg font-extrabold text-white group-hover:text-volt transition-colors leading-snug">
                    {client.workoutPlan.title}
                  </h4>
                  <p className="font-sans text-xs text-zinc-400 mt-1">
                    {client.workoutPlan.subtitle}
                  </p>
                </div>

                {/* Client Profile info */}
                <div className="flex items-center gap-3.5 bg-zinc-900/30 p-3.5 rounded-2xl border border-zinc-850/60 my-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-zinc-800 bg-neutral-800">
                    <img 
                      src={client.avatarUrl} 
                      alt={client.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{client.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">{client.level}</p>
                  </div>
                </div>

                {/* Lower Action Line */}
                <div className="mt-4 pt-4 border-t border-zinc-800/60 flex justify-between items-center">
                  {isActive ? (
                    <div className="w-full flex items-center gap-3">
                      <div className="flex-1 bg-black/40 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-volt h-full w-[65%]"></div>
                      </div>
                      <span className="text-xs font-mono text-volt font-bold">65%</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-mono text-zinc-400 uppercase font-semibold">
                        {client.id === "marcus_chen" ? "READY FOR CHECK-IN" : "PLAN PREPARED"}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenPlanModal(client)}
                          title="Assign Workout/Diet"
                          className="p-1 text-volt-dim hover:text-volt hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                          onClick={() => handleSharePlan(client)}
                          title="Share Plan"
                          className="p-1 text-white hover:text-volt hover:scale-110 transition-transform cursor-pointer"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* Dynamic Activity/Performance Bar Chart */}
      <section className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl transition-all duration-300 hover:border-[#a3e635]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="font-display text-lg font-extrabold uppercase italic text-white">
              Performance Momentum
            </h3>
            <p className="text-xs text-zinc-500 font-semibold">
              Real-time aggregate cardio and lift load levels across active clients.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-volt"></span>
              <span className="text-[10px] font-mono text-white">INTENSITY</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span>
              <span className="text-[10px] font-mono text-white">VOLUME</span>
            </div>
          </div>
        </div>

        {/* Real-time Recharts Area Chart */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={(() => {
                const baselines = [
                  { time: "06:00 AM", intensityBase: 40, volumeBase: 30 },
                  { time: "08:00 AM", intensityBase: 65, volumeBase: 45 },
                  { time: "10:00 AM", intensityBase: 55, volumeBase: 40 },
                  { time: "12:00 PM", intensityBase: 80, volumeBase: 70 },
                  { time: "02:00 PM", intensityBase: 70, volumeBase: 60 },
                  { time: "04:00 PM", intensityBase: 60, volumeBase: 55 },
                  { time: "06:00 PM", intensityBase: 75, volumeBase: 80 },
                  { time: "08:00 PM", intensityBase: 50, volumeBase: 65 },
                  { time: "10:00 PM", intensityBase: 30, volumeBase: 25 },
                ];

                let totalExercises = 0;
                let totalSets = 0;

                clients.forEach(c => {
                  if (c.workoutPlan?.exercises) {
                    totalExercises += c.workoutPlan.exercises.length;
                    c.workoutPlan.exercises.forEach(ex => {
                      totalSets += ex.sets?.length || 0;
                    });
                  }
                  if (c.weeklyPlan) {
                    Object.values(c.weeklyPlan).forEach(day => {
                      if (day.workout?.exercises) {
                        totalExercises += day.workout.exercises.length;
                        day.workout.exercises.forEach(ex => {
                          totalSets += ex.sets?.length || 0;
                        });
                      }
                    });
                  }
                });

                const scaleIntensity = 1 + (totalSets * 0.01) + (clients.length * 0.02);
                const scaleVolume = 1 + (totalExercises * 0.015) + (clients.length * 0.02);

                return baselines.map(b => {
                  const seed = clients.length > 0 ? clients[0].name.charCodeAt(0) || 1 : 1;
                  const offset = Math.sin(b.intensityBase + seed) * 3;
                  
                  const intensity = Math.min(100, Math.round(b.intensityBase * scaleIntensity + offset));
                  const volume = Math.min(100, Math.round(b.volumeBase * scaleVolume - offset));

                  return {
                    time: b.time,
                    intensity: Math.max(15, intensity),
                    volume: Math.max(10, volume),
                  };
                });
              })()}
              margin={{ top: 10, right: 10, bottom: 0, left: -25 }}
            >
              <defs>
                <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ccff00" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ccff00" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#71717a" 
                fontSize={9} 
                fontFamily="monospace"
                tickLine={false} 
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={9} 
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#121414] border border-zinc-800 p-2.5 rounded-xl shadow-2xl font-mono text-[10px] space-y-1">
                        <p className="text-zinc-400 font-extrabold uppercase">{payload[0].payload.time}</p>
                        <p className="text-volt font-semibold">
                          INTENSITY: <span className="text-white font-bold">{payload[0].value}%</span>
                        </p>
                        {payload[1] && (
                          <p className="text-zinc-400 font-semibold">
                            VOLUME: <span className="text-white font-bold">{payload[1].value}%</span>
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                stroke="#ccff00" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorIntensity)" 
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#71717a" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* CLIENT LOGS & PROGRESS HUB */}
      <section className="bg-[#18181b]/80 border border-zinc-800/80 p-8 rounded-[32px] space-y-8 transition-all duration-300 hover:border-volt/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-5">
          <div>
            <span className="font-mono text-[10px] text-volt uppercase tracking-widest font-black">
              CLIENT PROGRESS RECORDS
            </span>
            <h3 className="font-display text-2xl font-extrabold uppercase italic text-white mt-1 tracking-tight">
              Client Profiles & Daily Logs
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Select any linked client below to track their real-time workout sheets, diet macros, cardiovascular activity, and bio-feedback.
            </p>
          </div>
        </div>

        {trainerClients.length === 0 ? (
          <div className="text-center py-10 font-mono text-xs text-zinc-500">
            Approved client profiles will populate the Intelligence database.
          </div>
        ) : (
          (() => {
            const currentDossierId = activeDossierId || (trainerClients.length > 0 ? trainerClients[0].id : null);
            const selectedDossierClient = clients.find(c => c.id === currentDossierId);
            
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar List of Clients */}
                <div className="lg:col-span-4 space-y-3 border-r border-zinc-800/50 pr-0 lg:pr-8 max-h-[500px] overflow-y-auto">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-3">
                    ACTIVE ROSTER ({trainerClients.length})
                  </span>
                  {trainerClients.map((tc) => {
                    const isSelected = tc.id === currentDossierId;
                    return (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setActiveDossierId(tc.id)}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                          isSelected 
                            ? "bg-zinc-900 border-volt text-volt font-bold ring-1 ring-volt/20" 
                            : "bg-[#09090b]/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50"
                        }`}
                      >
                        <img 
                          src={tc.avatarUrl} 
                          alt={tc.name} 
                          className={`w-10 h-10 rounded-full object-cover shrink-0 border-2 transition-colors ${
                            isSelected ? "border-volt" : "border-zinc-800"
                          }`} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate transition-colors ${isSelected ? "text-white" : "text-zinc-300"}`}>{tc.name}</p>
                          <p className={`text-[10px] font-mono truncate tracking-wide mt-0.5 ${isSelected ? "text-volt/80 font-black" : "text-zinc-500 font-bold uppercase"}`}>{tc.level}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dossier Detail Panel */}
                <div className="lg:col-span-8 flex flex-col gap-6 animate-fadeIn">
                  {selectedDossierClient ? (
                    <>
                      {/* Top Client Card Info */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 shadow-md">
                        <div className="flex items-center gap-4">
                          <img 
                            src={selectedDossierClient.avatarUrl} 
                            alt={selectedDossierClient.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-volt/60 shadow-md" 
                          />
                          <div className="space-y-1.5">
                            <h4 className="text-white font-extrabold text-lg leading-tight tracking-tight">{selectedDossierClient.name}</h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2.5 py-0.5 text-[9px] font-mono rounded bg-volt/10 text-volt font-black uppercase tracking-wider border border-volt/20">
                                {selectedDossierClient.level}
                              </span>
                              <span className="px-2.5 py-0.5 text-[9px] font-mono rounded bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider border border-zinc-800">
                                TIER: {selectedDossierClient.activeTier || "PRO"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectingClientLogs(selectedDossierClient)}
                            className="px-4 py-2 bg-volt text-black font-mono text-[10px] font-black rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md uppercase tracking-wider"
                          >
                            Open Log Sheet 🏋️‍♂️
                          </button>
                        </div>
                      </div>

                      {/* Sub Tabs Selection */}
                      <div 
                        onWheel={handleHorizontalWheel}
                        className="flex flex-row flex-nowrap bg-[#09090b]/80 p-1.5 rounded-2xl border border-zinc-800/80 overflow-x-auto gap-1 scrollbar-thin"
                      >
                        {(
                          [
                            { id: "routine", label: "Workout Plan", icon: <Dumbbell size={12} /> },
                            { id: "diet", label: "Diet Plan", icon: <Apple size={12} /> },
                            { id: "cardio", label: "Cardio Logs", icon: <Activity size={12} /> },
                            { id: "supplements", label: "Supplements", icon: <Pill size={12} /> },
                            { id: "assessments", label: "Fitness Checkups", icon: <FileText size={12} /> },
                            { id: "wellness", label: "Wellness Logs", icon: <Sparkles size={12} /> },
                          ] as const
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setDossierTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                              dossierTab === t.id 
                                ? "bg-zinc-900 text-volt font-black border border-volt/20 shadow-sm" 
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                            }`}
                          >
                            {t.icon}
                            <span>{t.label.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>

                      {/* Tab Contents */}
                      <div className="bg-[#09090b] p-5 rounded-2xl border border-zinc-800 min-h-[250px]">
                        {dossierTab === "routine" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="font-mono text-xs text-volt font-bold uppercase">Assigned Strength & Muscle Routine</span>
                              <span className="font-mono text-[10px] text-zinc-500 font-semibold">{selectedDossierClient.workoutPlan?.exercises?.length || 0} EXERCISES TOTAL</span>
                            </div>
                            {selectedDossierClient.workoutPlan?.exercises?.length > 0 ? (
                              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {selectedDossierClient.workoutPlan.exercises.map((ex) => (
                                  <div key={ex.id} className="p-3 bg-[#18181b] border border-zinc-800 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-white text-xs font-bold uppercase">{ex.name}</span>
                                      <span className="px-2 py-0.5 text-[8px] font-mono rounded bg-zinc-800 text-zinc-400">{ex.category} • {ex.type}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 font-mono text-[10px] text-zinc-400">
                                      {ex.sets.map((s, i) => (
                                        <div key={i} className="bg-[#09090b] p-1.5 border border-zinc-850 rounded text-center">
                                          <span className="block text-[8px] text-zinc-500 font-bold">SET {s.setNumber}</span>
                                          <span className="text-white font-black">{s.weight}kg x {s.reps}</span>
                                          <span className={`block text-[8px] mt-0.5 font-black uppercase ${s.completed ? "text-volt" : "text-zinc-600"}`}>
                                            {s.completed ? "Done" : "Pending"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 font-mono text-xs text-zinc-500">No workout exercises assigned currently. Use 'Assign Workout/Diet' tool.</div>
                            )}
                          </div>
                        )}

                        {dossierTab === "diet" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="font-mono text-xs text-volt font-bold uppercase">Nutrition & Meals Breakdown</span>
                              <span className="font-mono text-[10px] text-zinc-500 font-semibold">TARGET: {selectedDossierClient.dietPlan?.meals?.reduce((sum, m) => sum + m.kcal, 0) || 2400} KCAL</span>
                            </div>
                            
                            {/* Macros summary */}
                            <div className="grid grid-cols-3 gap-3 bg-[#18181b] p-3 rounded-xl border border-zinc-850 text-center font-mono">
                              <div>
                                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Protein</span>
                                <span className="text-white text-sm font-black">{selectedDossierClient.dietPlan?.macros?.protein?.target || 150}g</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Carbs</span>
                                <span className="text-white text-sm font-black">{selectedDossierClient.dietPlan?.macros?.carbs?.target || 200}g</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Fats</span>
                                <span className="text-white text-sm font-black">{selectedDossierClient.dietPlan?.macros?.fats?.target || 65}g</span>
                              </div>
                            </div>

                            {/* Meals List */}
                            {selectedDossierClient.dietPlan?.meals?.length > 0 ? (
                              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                {selectedDossierClient.dietPlan.meals.map((meal) => (
                                  <div key={meal.id} className="flex justify-between items-center p-3 bg-[#18181b] border border-zinc-850 rounded-xl">
                                    <div>
                                      <span className="block font-mono text-[8px] text-zinc-500 font-bold uppercase">{meal.timeLabel}</span>
                                      <span className="text-white text-xs font-bold">{meal.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs text-white font-mono font-bold block">{meal.kcal} kcal</span>
                                      <span className="text-[10px] text-volt font-mono">{meal.proteinG}g Protein</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 font-mono text-xs text-zinc-500">No diet plan or meals assigned.</div>
                            )}
                          </div>
                        )}

                        {dossierTab === "cardio" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="font-mono text-xs text-volt font-bold uppercase">Cardiovascular Sessions Log</span>
                              <span className="font-mono text-[10px] text-zinc-500 font-semibold">{selectedDossierClient.cardioLogs?.length || 0} TOTAL RUNS</span>
                            </div>
                            {selectedDossierClient.cardioLogs?.length > 0 ? (
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {selectedDossierClient.cardioLogs.map((log) => (
                                  <div key={log.id} className="flex justify-between items-center p-3 bg-[#18181b] border border-zinc-850 rounded-xl font-mono text-[11px]">
                                    <div>
                                      <span className="text-white font-black">{log.type === "OTHER" ? (log.customType || "Other") : log.type}</span>
                                      <span className="block text-[8px] text-zinc-500 font-bold">{log.date}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div>
                                        <span className="text-zinc-500 text-[8px] block uppercase">Dist</span>
                                        <span className="text-white font-bold">{log.distanceKm} KM</span>
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 text-[8px] block uppercase">Time</span>
                                        <span className="text-white">{log.timeMin}</span>
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 text-[8px] block uppercase">Pace</span>
                                        <span className="text-volt font-bold">{log.pace}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 font-mono text-xs text-zinc-500">No logged cardio history in system database.</div>
                            )}
                          </div>
                        )}

                        {dossierTab === "supplements" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="font-mono text-xs text-volt font-bold uppercase">Assigned Daily Supplements</span>
                              <span className="font-mono text-[10px] text-zinc-500 font-semibold">TAKEN TODAY</span>
                            </div>
                            {selectedDossierClient.supplements?.length > 0 ? (
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {selectedDossierClient.supplements.map((sup) => (
                                  <div key={sup.id} className="flex justify-between items-center p-3 bg-[#18181b] border border-zinc-850 rounded-xl">
                                    <div>
                                      <span className="text-white text-xs font-bold block">{sup.name}</span>
                                      <span className="font-mono text-[8px] text-zinc-500 font-semibold uppercase">{sup.timeLabel}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${sup.completed ? "bg-volt/10 text-volt border border-volt/20" : "bg-zinc-850 text-zinc-500"}`}>
                                        {sup.completed ? "TAKEN" : "PENDING"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 font-mono text-xs text-zinc-500">No prescribed daily supplement schedule.</div>
                            )}
                          </div>
                        )}

                        {dossierTab === "assessments" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="font-mono text-xs text-volt font-bold uppercase">Past Assessments & Progress Logs</span>
                              <span className="font-mono text-[10px] text-zinc-500 font-semibold">{assessments.filter(a => a.clientId === selectedDossierClient.id).length} TOTAL CHECKUPS</span>
                            </div>
                            {assessments.filter(a => a.clientId === selectedDossierClient.id).length > 0 ? (
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {assessments.filter(a => a.clientId === selectedDossierClient.id).map((as) => (
                                  <div key={as.id} className="p-3 bg-[#18181b] border border-zinc-850 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center font-mono">
                                      <span className="text-white text-[11px] font-black uppercase">ASSESSMENT DATE {as.date}</span>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${as.status === "reviewed" ? "bg-volt text-black" : "bg-amber-400 text-black animate-pulse"}`}>
                                        {as.status === "reviewed" ? "REVIEWED" : "PENDING"}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="bg-[#09090b] p-2 border border-zinc-850 rounded">
                                        <span className="block text-[8px] font-mono text-zinc-500 uppercase font-bold">Body Metrics</span>
                                        <p className="font-bold text-white text-sm font-display mt-0.5">{as.weightKg} KG • <span className="text-volt">{as.bodyFatPct}% BF</span></p>
                                      </div>
                                      <div className="bg-[#09090b] p-2 border border-zinc-850 rounded">
                                        <span className="block text-[8px] font-mono text-zinc-500 uppercase font-bold">Target Ambition</span>
                                        <p className="text-white text-[10px] font-semibold mt-0.5 truncate">{as.goals}</p>
                                      </div>
                                    </div>
                                    {as.notes && (
                                      <p className="text-[10px] text-zinc-400 leading-relaxed italic bg-[#09090b]/40 p-2 rounded-lg border border-zinc-850/50">
                                        Notes: {as.notes}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 font-mono text-xs text-zinc-500">No biometric scans conducted. Use 'New Assessment' quick action button above.</div>
                            )}
                          </div>
                        )}

                        {dossierTab === "wellness" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="font-mono text-xs text-volt font-bold uppercase">Daily Bio-Feedback & Wellness Logs</span>
                              <span className="font-mono text-[10px] text-zinc-500 font-semibold uppercase">
                                {(selectedDossierClient.wellnessCheckIns || []).length} Logs Total
                              </span>
                            </div>
                            {(selectedDossierClient.wellnessCheckIns || []).length > 0 ? (
                              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                                {[...(selectedDossierClient.wellnessCheckIns || [])].reverse().map((wc) => (
                                  <div key={wc.id} className="p-4 bg-[#18181b] border border-zinc-850 rounded-xl space-y-3 font-mono text-xs">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                      <span>CHECK-IN DATE: {wc.date}</span>
                                      <span className="text-volt">SYNCHRONIZED ⚡</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                      <div className="bg-[#09090b] p-2 border border-zinc-850/50 rounded">
                                        <span className="text-zinc-500 font-bold block uppercase mb-0.5">Sleep</span>
                                        <span className="text-white font-black">{wc.sleepQuality}/5</span>
                                      </div>
                                      <div className="bg-[#09090b] p-2 border border-zinc-850/50 rounded">
                                        <span className="text-zinc-500 font-bold block uppercase mb-0.5">Soreness</span>
                                        <span className="text-white font-black">{wc.soreness}/5</span>
                                      </div>
                                      <div className="bg-[#09090b] p-2 border border-zinc-850/50 rounded">
                                        <span className="text-zinc-500 font-bold block uppercase mb-0.5">Motivation</span>
                                        <span className="text-white font-black">{wc.motivation}/5</span>
                                      </div>
                                    </div>
                                    {wc.notes && (
                                      <p className="text-[10px] text-zinc-400 italic bg-[#09090b]/20 p-2 rounded border border-zinc-850/40">
                                        "{wc.notes}"
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 font-mono text-xs text-zinc-500">
                                No wellness logs found for this member. When the client registers their daily sleep, soreness, or motivation, their real-time biometrics will appear here immediately.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 font-mono text-xs text-zinc-500 bg-[#09090b] rounded-2xl border border-zinc-800">
                      Select a client dossier to review metabolic logs.
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </section>

      {/* MODAL: NEW ASSESSMENT */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt">
                CREATE BIO-METRIC ASSESSMENT
              </h3>
              <button 
                onClick={() => setShowAssessmentModal(false)}
                className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAssessment} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Client *</label>
                <select
                  value={assessmentClient}
                  onChange={e => setAssessmentClient(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Client Weight (KG) *</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    placeholder="e.g. 82.5"
                    value={assessmentWeight}
                    onChange={e => setAssessmentWeight(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Body Fat %</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g. 12.4"
                    value={assessmentBodyFat}
                    onChange={e => setAssessmentBodyFat(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Identified Fitness Goals</label>
                <input 
                  type="text" 
                  placeholder="e.g. Build explosive strength, improve aerobic ceiling"
                  value={assessmentGoals}
                  onChange={e => setAssessmentGoals(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Clinical Coaching Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Record squat mechanics, hydration levels, heart rate recovery anomalies, etc."
                  value={assessmentNotes}
                  onChange={e => setAssessmentNotes(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-sm italic rounded-2xl tracking-widest hover:bg-lime-300 active:scale-95 transition-all mt-2 cursor-pointer"
              >
                SUBMIT NEW ASSESSMENT 📈
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN PLAN SPECIFIC TO CLIENT */}
      {showPlanModal && selectedClientForPlan && weeklyPlanBuffer && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-display text-lg font-extrabold uppercase italic text-volt">
                  7-DAY REPEATABLE PLAN DESIGNER
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Assigning detailed daily schedule templates for <strong className="text-white">{selectedClientForPlan.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedClientForPlan(null);
                  setWeeklyPlanBuffer(null);
                }}
                className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* 7 Days of the Week Selection Tabs */}
            <div 
              onWheel={handleHorizontalWheel}
              className="bg-[#09090b] px-4 py-2 border-b border-zinc-800 shrink-0 overflow-x-auto flex flex-row flex-nowrap gap-1 scrollbar-thin"
            >
              {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const).map((day) => {
                const hasWork = !!getDayPlan(day).workout?.exercises?.length;
                const hasDietPlan = !!getDayPlan(day).diet?.meals?.length;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      setCopyTargetDays([]);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      selectedDay === day 
                        ? "bg-volt text-black shadow-md shadow-volt/10" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                    }`}
                  >
                    <span>{day}</span>
                    {(hasWork || hasDietPlan) && (
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedDay === day ? "bg-black" : "bg-volt"}`}></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Form Content */}
            <form onSubmit={handleAssignPlan} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Copy Plan Tool Block */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={13} className="text-volt" /> Copy {selectedDay}'s Routine
                  </h4>
                  <p className="text-[11px] text-zinc-400">Save time by copying the fully configured plan for {selectedDay} to other days of the week.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex flex-wrap gap-1 bg-[#09090b] border border-[#27272a] p-1 rounded-xl text-[10px]">
                    {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const)
                      .filter(d => d !== selectedDay)
                      .map(day => (
                        <label key={day} className={`px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all ${
                          copyTargetDays.includes(day) ? "bg-zinc-800 text-volt" : "text-zinc-500 hover:text-zinc-300"
                        }`}>
                          <input 
                            type="checkbox"
                            checked={copyTargetDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCopyTargetDays([...copyTargetDays, day]);
                              } else {
                                setCopyTargetDays(copyTargetDays.filter(d => d !== day));
                              }
                            }}
                            className="hidden"
                          />
                          <span>{day.slice(0, 3)}</span>
                        </label>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCopy}
                    disabled={copyTargetDays.length === 0}
                    className="bg-zinc-850 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[10px] px-3 py-1.5 rounded-xl font-bold border border-zinc-700/50 uppercase transition-all"
                  >
                    Apply Copy
                  </button>
                </div>
              </div>

              {/* Subtabs layout for Workout, Diet, Supplements, Cardio */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Side Navigation for Categories */}
                <div 
                  onWheel={handleHorizontalWheel}
                  className="lg:col-span-3 flex flex-row flex-nowrap lg:flex-col gap-1 bg-[#09090b]/50 border border-zinc-800 p-1.5 rounded-2xl overflow-x-auto lg:overflow-x-visible scrollbar-none shrink-0"
                >
                  {(["WORKOUT", "DIET", "SUPPLEMENTS", "CARDIO"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPlanType(type)}
                      className={`flex-1 lg:flex-none text-left px-4 py-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2.5 transition-all shrink-0 ${
                        planType === type 
                          ? "bg-zinc-800 text-white border-l-2 border-volt" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                      }`}
                    >
                      {type === "WORKOUT" && <Dumbbell size={14} className="text-volt" />}
                      {type === "DIET" && <Apple size={14} className="text-amber-400" />}
                      {type === "SUPPLEMENTS" && <Pill size={14} className="text-emerald-400" />}
                      {type === "CARDIO" && <Activity size={14} className="text-sky-400" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-9 bg-[#1c1c1f]/50 border border-zinc-800 rounded-2xl p-5 min-h-[400px]">
                  
                  {/* WORKOUT SECTION */}
                  {planType === "WORKOUT" && (() => {
                    const dayPlan = getDayPlan(selectedDay);
                    const workout = dayPlan.workout;

                    if (!workout) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-800">
                            <Dumbbell size={20} />
                          </div>
                          <h5 className="text-sm font-mono text-white uppercase font-bold">No Workout Assigned</h5>
                          <p className="text-xs text-zinc-400 mt-1 max-w-sm">This client has a REST day scheduled for {selectedDay}.</p>
                          <button
                            type="button"
                            onClick={() => {
                              updateDayPlan(selectedDay, {
                                workout: {
                                  id: "w_" + Date.now(),
                                  title: "Hypertrophy Session",
                                  subtitle: "LEGS & CORE",
                                  durationMin: 60,
                                  targetKcal: 400,
                                  exercises: [],
                                  date: selectedDay
                                }
                              });
                            }}
                            className="mt-4 bg-volt text-black font-mono text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-lime-300"
                          >
                            + Enable Workout Plan
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h4 className="text-xs font-mono font-extrabold uppercase italic tracking-widest text-volt">Workout Specifications</h4>
                          <button
                            type="button"
                            onClick={() => updateDayPlan(selectedDay, { workout: null })}
                            className="text-[10px] font-mono text-rose-500 hover:underline uppercase"
                          >
                            Set as Rest Day
                          </button>
                        </div>

                        {/* Workout Header Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Workout Session Title *</label>
                            <input 
                              type="text" 
                              required
                              value={workout.title}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  workout: { ...workout, title: e.target.value }
                                });
                              }}
                              placeholder="e.g., Push Hypertrophy, Upper Body Blast"
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Subtitle / Focus Target *</label>
                            <input 
                              type="text" 
                              required
                              value={workout.subtitle}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  workout: { ...workout, subtitle: e.target.value }
                                });
                              }}
                              placeholder="e.g., CHEST, TRICEPS & CORE"
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:col-span-2">
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Estimated Duration (Min) *</label>
                              <input 
                                type="number" 
                                required
                                value={workout.durationMin}
                                onChange={e => {
                                  updateDayPlan(selectedDay, {
                                    workout: { ...workout, durationMin: parseInt(e.target.value) || 0 }
                                  });
                                }}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Calories Burn (Kcal)</label>
                              <input 
                                type="number" 
                                required
                                value={workout.targetKcal}
                                onChange={e => {
                                  updateDayPlan(selectedDay, {
                                    workout: { ...workout, targetKcal: parseInt(e.target.value) || 0 }
                                  });
                                }}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Detailed Exercises List */}
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-mono text-white uppercase font-bold flex items-center gap-1.5">
                              <Dumbbell size={12} className="text-volt" /> Individual Exercises ({workout.exercises?.length || 0})
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                const newEx: Exercise = {
                                  id: "ex_" + Date.now() + "_" + Math.floor(Math.random()*1000),
                                  name: "New Exercise",
                                  category: "CHEST",
                                  type: "STRENGTH",
                                  imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80",
                                  sets: [{ setNumber: 1, previous: "N/A", weight: 60, reps: 8, completed: false }]
                                };
                                updateDayPlan(selectedDay, {
                                  workout: {
                                    ...workout,
                                    exercises: [...(workout.exercises || []), newEx]
                                  }
                                });
                              }}
                              className="text-[10px] font-mono text-volt bg-volt/10 px-2.5 py-1 rounded-lg hover:bg-volt/20 uppercase font-bold hover:scale-[1.02] cursor-pointer"
                            >
                              + Add Exercise
                            </button>
                          </div>

                          {workout.exercises && workout.exercises.length > 0 ? (
                            <div className="space-y-4">
                              {workout.exercises.map((ex, exIndex) => (
                                <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDayPlan(selectedDay, {
                                        workout: {
                                          ...workout,
                                          exercises: workout.exercises.filter(item => item.id !== ex.id)
                                        }
                                      });
                                    }}
                                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-500 transition-colors"
                                    title="Remove Exercise"
                                  >
                                    <Trash2 size={14} />
                                  </button>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                                    <div>
                                      <label className="block text-[9px] font-mono text-zinc-500 uppercase">Exercise Name</label>
                                      <input
                                        type="text"
                                        required
                                        value={ex.name}
                                        onChange={e => {
                                          const updated = workout.exercises.map(item => item.id === ex.id ? { ...item, name: e.target.value } : item);
                                          updateDayPlan(selectedDay, { workout: { ...workout, exercises: updated } });
                                        }}
                                        className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-white font-sans focus:outline-none focus:border-volt text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-mono text-zinc-500 uppercase">Category</label>
                                      <select
                                        value={ex.category}
                                        onChange={e => {
                                          const updated = workout.exercises.map(item => item.id === ex.id ? { ...item, category: e.target.value } : item);
                                          updateDayPlan(selectedDay, { workout: { ...workout, exercises: updated } });
                                        }}
                                        className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-volt text-xs"
                                      >
                                        {["CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE", "CARDIO", "FULL BODY"].map(cat => (
                                          <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-mono text-zinc-500 uppercase">Training Type</label>
                                      <select
                                        value={ex.type}
                                        onChange={e => {
                                          const updated = workout.exercises.map(item => item.id === ex.id ? { ...item, type: e.target.value as any } : item);
                                          updateDayPlan(selectedDay, { workout: { ...workout, exercises: updated } });
                                        }}
                                        className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-volt text-xs"
                                      >
                                        {["STRENGTH", "HYPERTROPHY", "ENDURANCE", "MOBILITY"].map(t => (
                                          <option key={t} value={t}>{t}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Sets details editor */}
                                  <div className="space-y-1.5 bg-[#09090b]/40 p-2.5 rounded-lg border border-zinc-800/40">
                                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                                      <span>Sets Configuration</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextSetNum = ex.sets.length + 1;
                                          const updatedSets = [
                                            ...ex.sets,
                                            { setNumber: nextSetNum, previous: ex.sets[ex.sets.length-1] ? `${ex.sets[ex.sets.length-1].weight} x ${ex.sets[ex.sets.length-1].reps}` : "N/A", weight: ex.sets[ex.sets.length-1]?.weight || 60, reps: ex.sets[ex.sets.length-1]?.reps || 8, completed: false }
                                          ];
                                          const updatedExList = workout.exercises.map(item => item.id === ex.id ? { ...item, sets: updatedSets } : item);
                                          updateDayPlan(selectedDay, { workout: { ...workout, exercises: updatedExList } });
                                        }}
                                        className="text-volt hover:underline uppercase"
                                      >
                                        + Add Set
                                      </button>
                                    </div>

                                    {ex.sets.map((set, setIdx) => (
                                      <div 
                                        key={setIdx} 
                                        onWheel={handleHorizontalWheel}
                                        className="flex items-center gap-3 text-xs bg-black/30 px-3 py-1.5 rounded-md border border-zinc-900 flex-nowrap overflow-x-auto scrollbar-none"
                                      >
                                        <span className="font-mono text-[10px] text-zinc-500 shrink-0 w-12 font-bold uppercase">SET {set.setNumber}</span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <input 
                                            type="number"
                                            value={set.weight}
                                            onChange={e => {
                                              const updatedSets = ex.sets.map((s, idx) => idx === setIdx ? { ...s, weight: parseFloat(e.target.value) || 0 } : s);
                                              const updatedExList = workout.exercises.map(item => item.id === ex.id ? { ...item, sets: updatedSets } : item);
                                              updateDayPlan(selectedDay, { workout: { ...workout, exercises: updatedExList } });
                                            }}
                                            className="compact-input w-14 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-center font-mono text-white text-xs"
                                          />
                                          <span className="text-[10px] text-zinc-500 font-mono">KG</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <input 
                                            type="number"
                                            value={set.reps}
                                            onChange={e => {
                                              const updatedSets = ex.sets.map((s, idx) => idx === setIdx ? { ...s, reps: parseInt(e.target.value) || 0 } : s);
                                              const updatedExList = workout.exercises.map(item => item.id === ex.id ? { ...item, sets: updatedSets } : item);
                                              updateDayPlan(selectedDay, { workout: { ...workout, exercises: updatedExList } });
                                            }}
                                            className="compact-input w-12 bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-center font-mono text-white text-xs"
                                          />
                                          <span className="text-[10px] text-zinc-500 font-mono">REPS</span>
                                        </div>
                                        {ex.sets.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const filteredSets = ex.sets.filter((_, idx) => idx !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 }));
                                              const updatedExList = workout.exercises.map(item => item.id === ex.id ? { ...item, sets: filteredSets } : item);
                                              updateDayPlan(selectedDay, { workout: { ...workout, exercises: updatedExList } });
                                            }}
                                            className="text-rose-500 hover:text-rose-400 font-mono text-[10px] uppercase ml-auto shrink-0 whitespace-nowrap"
                                          >
                                            Delete Set
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs font-mono text-zinc-500 italic py-6 text-center border border-dashed border-zinc-800 rounded-xl">No exercises added yet. Click "+ Add Exercise" above to add some clinical lift targets.</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* DIET SECTION */}
                  {planType === "DIET" && (() => {
                    const dayPlan = getDayPlan(selectedDay);
                    const diet = dayPlan.diet;

                    if (!diet) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-800">
                            <Apple size={20} />
                          </div>
                          <h5 className="text-sm font-mono text-white uppercase font-bold">No Diet Plan Enabled</h5>
                          <p className="text-xs text-zinc-400 mt-1 max-w-sm">No macro goals or meals are mapped for {selectedDay}.</p>
                          <button
                            type="button"
                            onClick={() => {
                              updateDayPlan(selectedDay, {
                                diet: {
                                  id: "d_" + Date.now(),
                                  date: selectedDay,
                                  macros: {
                                    protein: { current: 0, target: 160 },
                                    carbs: { current: 0, target: 220 },
                                    fats: { current: 0, target: 65 }
                                  },
                                  meals: []
                                }
                              });
                            }}
                            className="mt-4 bg-volt text-black font-mono text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-lime-300"
                          >
                            + Enable Diet Plan
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h4 className="text-xs font-mono font-extrabold uppercase italic tracking-widest text-amber-400">Dietary Target Config</h4>
                          <button
                            type="button"
                            onClick={() => updateDayPlan(selectedDay, { diet: null })}
                            className="text-[10px] font-mono text-rose-500 hover:underline uppercase text-rose-500"
                          >
                            Disable Diet Plan
                          </button>
                        </div>

                        {/* Macros Target Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Protein (g) *</label>
                            <input 
                              type="number" 
                              required
                              value={diet.macros.protein.target}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  diet: {
                                    ...diet,
                                    macros: {
                                      ...diet.macros,
                                      protein: { ...diet.macros.protein, target: parseInt(e.target.value) || 0 }
                                    }
                                  }
                                });
                              }}
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-volt text-xs text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Carbs (g) *</label>
                            <input 
                              type="number" 
                              required
                              value={diet.macros.carbs.target}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  diet: {
                                    ...diet,
                                    macros: {
                                      ...diet.macros,
                                      carbs: { ...diet.macros.carbs, target: parseInt(e.target.value) || 0 }
                                    }
                                  }
                                });
                              }}
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-volt text-xs text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Fats (g) *</label>
                            <input 
                              type="number" 
                              required
                              value={diet.macros.fats.target}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  diet: {
                                    ...diet,
                                    macros: {
                                      ...diet.macros,
                                      fats: { ...diet.macros.fats, target: parseInt(e.target.value) || 0 }
                                    }
                                  }
                                });
                              }}
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-volt text-xs text-center"
                            />
                          </div>
                        </div>

                        {/* Calculated total calories display */}
                        <div className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 flex justify-between items-center">
                          <span>Target Daily Energy Intake:</span>
                          <span className="text-amber-400 font-bold">
                            {(diet.macros.protein.target * 4 + diet.macros.carbs.target * 4 + diet.macros.fats.target * 9)} KCAL / DAY
                          </span>
                        </div>

                        {/* Meals list */}
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-mono text-white uppercase font-bold flex items-center gap-1.5">
                              🍽️ Assigned Meals ({diet.meals?.length || 0})
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                const newMeal: Meal = {
                                  id: "meal_" + Date.now() + "_" + Math.floor(Math.random()*100),
                                  timeLabel: `MEAL 0${(diet.meals?.length || 0) + 1}: MEAL`,
                                  name: "Lean Chicken and Quinoa",
                                  kcal: 450,
                                  proteinG: 35,
                                  imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80",
                                  completed: false
                                };
                                updateDayPlan(selectedDay, {
                                  diet: {
                                    ...diet,
                                    meals: [...(diet.meals || []), newMeal]
                                  }
                                });
                              }}
                              className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg hover:bg-amber-400/20 uppercase font-bold hover:scale-[1.02] cursor-pointer"
                            >
                              + Add Meal
                            </button>
                          </div>

                          {diet.meals && diet.meals.length > 0 ? (
                            <div className="space-y-3">
                              {diet.meals.map((meal) => (
                                <div key={meal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDayPlan(selectedDay, {
                                        diet: {
                                          ...diet,
                                          meals: diet.meals.filter(item => item.id !== meal.id)
                                        }
                                      });
                                    }}
                                    className="absolute top-3 right-3 text-zinc-500 hover:text-rose-500"
                                  >
                                    <Trash2 size={13} />
                                  </button>

                                  <div className="md:col-span-3">
                                    <label className="block text-[8px] font-mono text-zinc-500 uppercase">Meal Timing</label>
                                    <input
                                      type="text"
                                      required
                                      value={meal.timeLabel}
                                      onChange={e => {
                                        const updated = diet.meals.map(item => item.id === meal.id ? { ...item, timeLabel: e.target.value } : item);
                                        updateDayPlan(selectedDay, { diet: { ...diet, meals: updated } });
                                      }}
                                      placeholder="e.g. MEAL 01: BREAKFAST"
                                      className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:border-volt"
                                    />
                                  </div>

                                  <div className="md:col-span-4">
                                    <label className="block text-[8px] font-mono text-zinc-500 uppercase">Food Description</label>
                                    <input
                                      type="text"
                                      required
                                      value={meal.name}
                                      onChange={e => {
                                        const updated = diet.meals.map(item => item.id === meal.id ? { ...item, name: e.target.value } : item);
                                        updateDayPlan(selectedDay, { diet: { ...diet, meals: updated } });
                                      }}
                                      className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2 py-1 text-white font-sans text-xs focus:outline-none focus:border-volt"
                                    />
                                  </div>

                                  <div className="md:col-span-2">
                                    <label className="block text-[8px] font-mono text-zinc-500 uppercase">Kcal Goal</label>
                                    <input
                                      type="number"
                                      required
                                      value={meal.kcal}
                                      onChange={e => {
                                        const updated = diet.meals.map(item => item.id === meal.id ? { ...item, kcal: parseInt(e.target.value) || 0 } : item);
                                        updateDayPlan(selectedDay, { diet: { ...diet, meals: updated } });
                                      }}
                                      className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-volt text-center"
                                    />
                                  </div>

                                  <div className="md:col-span-2 pr-6">
                                    <label className="block text-[8px] font-mono text-zinc-500 uppercase">Protein (g)</label>
                                    <input
                                      type="number"
                                      required
                                      value={meal.proteinG}
                                      onChange={e => {
                                        const updated = diet.meals.map(item => item.id === meal.id ? { ...item, proteinG: parseInt(e.target.value) || 0 } : item);
                                        updateDayPlan(selectedDay, { diet: { ...diet, meals: updated } });
                                      }}
                                      className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-volt text-center"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs font-mono text-zinc-500 italic py-6 text-center border border-dashed border-zinc-800 rounded-xl">No specific diet plans configured. Click "+ Add Meal" to seed this calendar template.</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* SUPPLEMENTS SECTION */}
                  {planType === "SUPPLEMENTS" && (() => {
                    const dayPlan = getDayPlan(selectedDay);
                    const supplements = dayPlan.supplements || [];

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h4 className="text-xs font-mono font-extrabold uppercase italic tracking-widest text-emerald-400">Clinical Supplements Config</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const newSup: Supplement = {
                                id: "sup_" + Date.now() + "_" + Math.floor(Math.random()*100),
                                name: "Vitamin D3",
                                timeLabel: "08:00 AM • 1 CAP",
                                icon: "pill",
                                completed: false
                              };
                              updateDayPlan(selectedDay, { supplements: [...supplements, newSup] });
                            }}
                            className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg hover:bg-emerald-400/20 uppercase font-bold hover:scale-[1.02] cursor-pointer"
                          >
                            + Add Supplement
                          </button>
                        </div>

                        {supplements.length > 0 ? (
                          <div className="space-y-3">
                            {supplements.map((sup) => (
                              <div key={sup.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateDayPlan(selectedDay, {
                                      supplements: supplements.filter(item => item.id !== sup.id)
                                    });
                                  }}
                                  className="absolute top-3 right-3 text-zinc-500 hover:text-rose-500"
                                >
                                  <Trash2 size={13} />
                                </button>

                                <div className="md:col-span-5">
                                  <label className="block text-[8px] font-mono text-zinc-500 uppercase">Supplement Name</label>
                                  <input
                                    type="text"
                                    required
                                    value={sup.name}
                                    onChange={e => {
                                      const updated = supplements.map(item => item.id === sup.id ? { ...item, name: e.target.value } : item);
                                      updateDayPlan(selectedDay, { supplements: updated });
                                    }}
                                    placeholder="Creatine, Whey, Glutamine, ZMA..."
                                    className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-white font-sans text-xs focus:outline-none focus:border-volt"
                                  />
                                </div>

                                <div className="md:col-span-4">
                                  <label className="block text-[8px] font-mono text-zinc-500 uppercase">Dosage Instructions & Time</label>
                                  <input
                                    type="text"
                                    required
                                    value={sup.timeLabel}
                                    onChange={e => {
                                      const updated = supplements.map(item => item.id === sup.id ? { ...item, timeLabel: e.target.value } : item);
                                      updateDayPlan(selectedDay, { supplements: updated });
                                    }}
                                    placeholder="e.g., PRE-WORKOUT • 5G"
                                    className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-volt"
                                  />
                                </div>

                                <div className="md:col-span-3 pr-6">
                                  <label className="block text-[8px] font-mono text-zinc-500 uppercase">Icon Category</label>
                                  <select
                                    value={sup.icon}
                                    onChange={e => {
                                      const updated = supplements.map(item => item.id === sup.id ? { ...item, icon: e.target.value } : item);
                                      updateDayPlan(selectedDay, { supplements: updated });
                                    }}
                                    className="w-full bg-[#050507] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-volt text-xs"
                                  >
                                    <option value="bolt">⚡ Energy (bolt)</option>
                                    <option value="pill">💊 Capsule (pill)</option>
                                    <option value="water_drop">💧 Hydration (water)</option>
                                    <option value="fitness_center">🏋 Gym (fitness)</option>
                                    <option value="bedtime">🌙 Sleep (bedtime)</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-mono text-zinc-500 italic py-6 text-center border border-dashed border-zinc-800 rounded-xl">No supplement guidelines configured. Click "+ Add Supplement" to map requirements.</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* CARDIO SECTION */}
                  {planType === "CARDIO" && (() => {
                    const dayPlan = getDayPlan(selectedDay);
                    const cardio = dayPlan.cardio;

                    if (!cardio) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-800">
                            <Activity size={20} />
                          </div>
                          <h5 className="text-sm font-mono text-white uppercase font-bold">No Cardio Target Assigned</h5>
                          <p className="text-xs text-zinc-400 mt-1 max-w-sm">No secondary stamina logs or aerobic training mapped for {selectedDay}.</p>
                          <button
                            type="button"
                            onClick={() => {
                              updateDayPlan(selectedDay, {
                                cardio: {
                                  id: "cardio_" + Date.now(),
                                  date: selectedDay,
                                  type: "RUN",
                                  distanceKm: 5.0,
                                  timeMin: "25:00",
                                  avgHeartRate: 142,
                                  pace: "5:00/KM"
                                }
                              });
                            }}
                            className="mt-4 bg-volt text-black font-mono text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-lime-300"
                          >
                            + Enable Cardio Goal
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h4 className="text-xs font-mono font-extrabold uppercase italic tracking-widest text-sky-400">Cardiovascular Target Specifications</h4>
                          <button
                            type="button"
                            onClick={() => updateDayPlan(selectedDay, { cardio: null })}
                            className="text-[10px] font-mono text-rose-500 hover:underline uppercase text-rose-500"
                          >
                            Disable Cardio
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Cardio Class *</label>
                            <select 
                              value={cardio.type}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  cardio: { ...cardio, type: e.target.value as any }
                                });
                              }}
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-volt text-xs"
                            >
                              <option value="RUN">🏃 Outdoor Run</option>
                              <option value="CYCLE">🚴 Spinning / Cycling</option>
                              <option value="HIIT">🔥 HIIT Conditioning</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Distance (KM) *</label>
                            <input 
                              type="number" 
                              step="0.1"
                              required
                              value={cardio.distanceKm}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  cardio: { ...cardio, distanceKm: parseFloat(e.target.value) || 0 }
                                });
                              }}
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-volt text-xs text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Duration (Min)</label>
                            <input 
                              type="text" 
                              required
                              value={cardio.timeMin}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  cardio: { ...cardio, timeMin: e.target.value }
                                });
                              }}
                              placeholder="e.g. 25:00"
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-volt text-xs text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Intensity (BPM)</label>
                            <input 
                              type="number" 
                              required
                              value={cardio.avgHeartRate}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  cardio: { ...cardio, avgHeartRate: parseInt(e.target.value) || 0 }
                                });
                              }}
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-volt text-xs text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Pace Goal (Min/KM)</label>
                            <input 
                              type="text" 
                              required
                              value={cardio.pace}
                              onChange={e => {
                                updateDayPlan(selectedDay, {
                                  cardio: { ...cardio, pace: e.target.value }
                                });
                              }}
                              placeholder="e.g. 5:15/KM"
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-volt text-xs text-center"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* Central Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false);
                    setSelectedClientForPlan(null);
                    setWeeklyPlanBuffer(null);
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-mono py-3 font-bold uppercase text-xs rounded-xl border border-zinc-700 tracking-wider"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-xl tracking-widest hover:bg-lime-300 active:scale-95 transition-all cursor-pointer"
                >
                  PUBLISH 7-DAY REPEATABLE PLAN 🚀
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {sharingClient && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border-2 border-volt p-6 rounded-3xl w-full max-w-md relative animate-fade-in">
            <button 
              onClick={() => setSharingClient(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-display text-lg font-extrabold uppercase italic text-volt mb-2">
              Share Fitness Plan
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Share {sharingClient.name}'s fitness plan directly to WhatsApp or copy it to your clipboard.
            </p>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 font-mono text-[11px] text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-line mb-6 scrollbar-thin">
              {getShareText(sharingClient)}
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText(sharingClient))}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-black font-mono text-xs font-black py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider text-center"
              >
                Share on WhatsApp 💬
              </a>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getShareText(sharingClient));
                  setToastMessage("Plan copied to clipboard successfully!");
                  setSharingClient(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-volt text-black font-mono text-xs font-black py-3 rounded-xl hover:bg-white active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
              >
                Copy to Clipboard 📋
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Smooth and Nice Log Sheet Popup Modal */}
      {inspectingClientLogs && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center sm:p-4 overflow-hidden animate-fade-in">
          <div className="bg-[#18181b] w-full h-full sm:h-[85vh] sm:max-h-[85vh] sm:w-[92%] sm:max-w-4xl border-t-2 sm:border-2 border-volt/60 rounded-none sm:rounded-3xl flex flex-col overflow-hidden relative shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950 flex items-start justify-between gap-4 shrink-0 relative pr-14">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <img 
                  src={inspectingClientLogs.avatarUrl} 
                  alt={inspectingClientLogs.name} 
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-volt shadow-lg shrink-0" 
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base sm:text-xl font-black uppercase tracking-tight text-white italic truncate">
                      {inspectingClientLogs.name}
                    </h3>
                    <span className="px-1.5 py-0.5 text-[8px] font-mono rounded bg-volt/10 text-volt font-black uppercase tracking-wider border border-volt/20">
                      {inspectingClientLogs.level}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-0.5 truncate">{inspectingClientLogs.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setInspectingClientLogs(null);
                  setLogModalTab("wellness");
                }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white hover:border-volt transition-colors cursor-pointer z-10"
                title="Close Viewer"
              >
                <X size={12} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Quick Metrics Bento Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-6 bg-zinc-950/40 border-b border-zinc-800/40 shrink-0">
              <div className="bg-zinc-900/50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-800/60 text-center sm:text-left">
                <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Sleep Score (Latest)</span>
                <span className="text-sm sm:text-lg font-display font-black text-volt mt-0.5 sm:mt-1 block">
                  {(() => {
                    const checkIns = inspectingClientLogs.wellnessCheckIns || [];
                    return checkIns.length > 0 ? `${checkIns[checkIns.length - 1].sleepQuality} / 5` : "N/A";
                  })()}
                </span>
              </div>
              <div className="bg-zinc-900/50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-800/60 text-center sm:text-left">
                <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Soreness Level</span>
                <span className="text-sm sm:text-lg font-display font-black text-rose-500 mt-0.5 sm:mt-1 block">
                  {(() => {
                    const checkIns = inspectingClientLogs.wellnessCheckIns || [];
                    return checkIns.length > 0 ? `${checkIns[checkIns.length - 1].soreness} / 5` : "N/A";
                  })()}
                </span>
              </div>
              <div className="bg-zinc-900/50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-800/60 text-center sm:text-left">
                <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Motivation Index</span>
                <span className="text-sm sm:text-lg font-display font-black text-sky-400 mt-0.5 sm:mt-1 block">
                  {(() => {
                    const checkIns = inspectingClientLogs.wellnessCheckIns || [];
                    return checkIns.length > 0 ? `${checkIns[checkIns.length - 1].motivation} / 5` : "N/A";
                  })()}
                </span>
              </div>
              <div className="bg-zinc-900/50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-800/60 text-center sm:text-left">
                <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Cardio Logs</span>
                <span className="text-sm sm:text-lg font-display font-black text-white mt-0.5 sm:mt-1 block">
                  {inspectingClientLogs.cardioLogs?.length || 0} Sessions
                </span>
              </div>
            </div>

            {/* Custom Tab Selectors */}
            <div className="px-4 sm:px-6 pt-3 pb-1 bg-zinc-950/20 flex gap-1 sm:gap-2 border-b border-zinc-800/60 overflow-x-auto touch-pan-x shrink-0">
              <button
                onClick={() => setLogModalTab("wellness")}
                className={`pb-2.5 px-3 sm:px-4 font-mono text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-colors relative cursor-pointer whitespace-nowrap ${
                  logModalTab === "wellness" ? "text-volt" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Wellness Trends 📈
                {logModalTab === "wellness" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-volt" />}
              </button>
              <button
                onClick={() => setLogModalTab("cardio")}
                className={`pb-2.5 px-3 sm:px-4 font-mono text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-colors relative cursor-pointer whitespace-nowrap ${
                  logModalTab === "cardio" ? "text-volt" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Cardio Analytics 🏃‍♂️
                {logModalTab === "cardio" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-volt" />}
              </button>
              <button
                onClick={() => setLogModalTab("workouts")}
                className={`pb-2.5 px-3 sm:px-4 font-mono text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-colors relative cursor-pointer whitespace-nowrap ${
                  logModalTab === "workouts" ? "text-volt" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Routine Logs 🏋️‍♂️
                {logModalTab === "workouts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-volt" />}
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 sm:space-y-6 scrollbar-thin">
              {logModalTab === "wellness" && (
                <div className="space-y-5 sm:space-y-6">
                  {/* Wellness Area Chart */}
                  <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-900/80">
                    <h4 className="font-mono text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest mb-3">
                      Bio-Feedback Curves (Latest 5 Days)
                    </h4>
                    
                    {/* Dynamic High-End Cockpit Legend Key */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 font-mono text-[9px] sm:text-[10px]">
                      <div className="flex items-center gap-1.5 bg-[#ccff00]/5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#ccff00]/25 text-volt font-bold uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-volt" />
                        <span>Sleep Quality</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#38bdf8]/5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#38bdf8]/25 text-sky-400 font-bold uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>Motivation</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#f43f5e]/5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#f43f5e]/25 text-rose-500 font-bold uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>Soreness</span>
                      </div>
                    </div>

                    {inspectingClientLogs.wellnessCheckIns && inspectingClientLogs.wellnessCheckIns.length > 0 ? (
                      <div className="h-64 sm:h-80 md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={inspectingClientLogs.wellnessCheckIns.slice(-5).map(item => ({
                              date: item.date.split("-").slice(1).join("/"), // MM/DD
                              Sleep: item.sleepQuality,
                              Soreness: item.soreness,
                              Motivation: item.motivation
                            }))}
                            margin={{ top: 10, right: 10, bottom: 0, left: -25 }}
                          >
                            <defs>
                              <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ccff00" stopOpacity={0.0}/>
                              </linearGradient>
                              <linearGradient id="colorMotivation" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                              </linearGradient>
                              <linearGradient id="colorSoreness" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              stroke="#71717a" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                            />
                            <YAxis 
                              stroke="#71717a" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              domain={[0, 5]} 
                              ticks={[1, 2, 3, 4, 5]}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-xl font-mono text-[10px] space-y-1">
                                      <p className="text-zinc-500 font-bold uppercase">{payload[0].payload.date}</p>
                                      {payload.map((p) => {
                                        const colors: Record<string, string> = {
                                          Sleep: "text-volt",
                                          Motivation: "text-sky-400",
                                          Soreness: "text-rose-500",
                                        };
                                        return (
                                          <p key={p.name} className={`${colors[p.name || ""] || "text-white"} font-black`}>
                                            {p.name}: {p.value} / 5
                                          </p>
                                        );
                                      })}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Sleep" 
                              stroke="#ccff00" 
                              strokeWidth={2.5} 
                              fillOpacity={1} 
                              fill="url(#colorSleep)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Motivation" 
                              stroke="#38bdf8" 
                              strokeWidth={2.5} 
                              fillOpacity={1} 
                              fill="url(#colorMotivation)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Soreness" 
                              stroke="#f43f5e" 
                              strokeWidth={2.5} 
                              fillOpacity={1} 
                              fill="url(#colorSoreness)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-10 font-mono text-xs text-zinc-500">
                        No check-in history to map.
                      </div>
                    )}
                  </div>

                  {/* Wellness Texts List */}
                  <div className="space-y-3">
                    <h4 className="font-mono text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
                      Check-In Log Notes
                    </h4>
                    {inspectingClientLogs.wellnessCheckIns && inspectingClientLogs.wellnessCheckIns.length > 0 ? (
                      inspectingClientLogs.wellnessCheckIns.slice().reverse().map((item) => (
                        <div key={item.id} className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-volt">{item.date}</span>
                              <span className="text-zinc-600 text-[10px]">•</span>
                              <span className="text-xs text-zinc-400 font-semibold">User Submission</span>
                            </div>
                            <p className="text-xs text-zinc-200 font-sans italic font-medium leading-relaxed">
                              {item.notes ? `"${item.notes}"` : <span className="text-zinc-600">No written notes entered</span>}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <div className="bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800 text-center min-w-[50px]">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase font-bold">Sleep</span>
                              <span className="text-xs font-black text-volt">{item.sleepQuality}/5</span>
                            </div>
                            <div className="bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800 text-center min-w-[50px]">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase font-bold">Sore</span>
                              <span className="text-xs font-black text-rose-500">{item.soreness}/5</span>
                            </div>
                            <div className="bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800 text-center min-w-[50px]">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase font-bold">Motiv</span>
                              <span className="text-xs font-black text-sky-400">{item.motivation}/5</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-zinc-900/30 text-center py-8 rounded-2xl border border-zinc-800/40 font-mono text-xs text-zinc-500">
                        No check-in details logged yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {logModalTab === "cardio" && (
                <div className="space-y-4">
                  <h4 className="font-mono text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
                    Cardio Performance History
                  </h4>
                  {inspectingClientLogs.cardioLogs && inspectingClientLogs.cardioLogs.length > 0 ? (
                    inspectingClientLogs.cardioLogs.slice().reverse().map((log) => (
                      <div key={log.id} className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900/80 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-volt shrink-0">
                            <Flame size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-white">{log.type}</span>
                              <span className="px-1.5 py-0.5 text-[8px] rounded bg-zinc-800 font-mono text-zinc-400 font-bold uppercase">{log.date}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              AVG HEART RATE: <span className="text-zinc-300 font-bold">{log.avgHeartRate} BPM</span> • PACE: <span className="text-zinc-300 font-bold">{log.pace}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-extrabold text-volt leading-none">{log.distanceKm} KM</p>
                          <p className="text-[10px] font-mono text-zinc-500 mt-1">{log.timeMin} mins</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-zinc-900/30 text-center py-12 rounded-2xl border border-zinc-800/40 font-mono text-xs text-zinc-500">
                      No cardio sessions logged yet.
                    </div>
                  )}
                </div>
              )}

              {logModalTab === "workouts" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
                      Assigned Workout & Completed Sets
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">
                      {inspectingClientLogs.workoutPlan?.title} • {inspectingClientLogs.workoutPlan?.subtitle}
                    </span>
                  </div>
                  
                  {inspectingClientLogs.workoutPlan?.exercises && inspectingClientLogs.workoutPlan.exercises.length > 0 ? (
                    inspectingClientLogs.workoutPlan.exercises.map((exercise) => (
                      <div key={exercise.id} className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={exercise.imageUrl} 
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0" 
                            alt="" 
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{exercise.name}</p>
                            <span className="text-[9px] font-mono text-volt uppercase font-bold tracking-wider">{exercise.category} • {exercise.type}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                          {exercise.sets.map((set) => (
                            <div 
                              key={set.setNumber} 
                              className={`px-3 py-1 rounded-xl border text-center font-mono text-[10px] min-w-[75px] ${
                                set.completed 
                                  ? "bg-volt/10 border-volt/30 text-volt font-bold" 
                                  : "bg-zinc-900 border-zinc-800/80 text-zinc-500"
                              }`}
                            >
                              <span className="block text-[8px] uppercase tracking-wider text-zinc-500">SET {set.setNumber}</span>
                              <span className="font-black text-xs block mt-0.5">{set.weight}kg</span>
                              <span className="text-[9px] block text-zinc-400 mt-0.5">{set.reps} reps {set.completed ? "✓" : ""}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-zinc-900/30 text-center py-12 rounded-2xl border border-zinc-800/40 font-mono text-xs text-zinc-500">
                      No exercises assigned or active in current routine.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800/80 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => {
                  setInspectingClientLogs(null);
                  setLogModalTab("wellness");
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-volt text-black font-mono text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl hover:bg-white active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              >
                Close Log Sheets ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Micro toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#121214] border-2 border-volt p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-volt animate-ping" />
          <p className="font-mono text-xs text-white font-extrabold">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-white font-bold text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
