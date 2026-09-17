import React, { useState } from "react";
import { 
  Flame, Heart, CheckSquare, Plus, Check, ChevronRight, 
  Settings, Pill, Droplet, Zap, Dumbbell, Moon, Bike, Footprints 
} from "lucide-react";
import { Client, CardioLog, Supplement } from "../types";

interface CardioFuelProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
}

export default function CardioFuel({ client, onUpdateClient }: CardioFuelProps) {
  // Logger form states
  const [activeType, setActiveType] = useState<"RUN" | "CYCLE" | "HIIT" | "OTHER">("RUN");
  const [customTypeInput, setCustomTypeInput] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Helper to calculate standard todayDateStr YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format date for display
  const formatDateStr = (dateStr: string) => {
    if (dateStr && dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("-");
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const mIdx = parseInt(month, 10) - 1;
      return `${months[mIdx] || "OCT"} ${parseInt(day, 10)}`;
    }
    return dateStr;
  };

  const handleLogCardio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration) return;

    const distNum = parseFloat(distance) || 0;
    const hrNum = parseInt(heartRate) || 145;

    // Calculate dynamic pace
    let paceStr = "N/A";
    if (distNum > 0) {
      const minMatch = duration.match(/^(\d+)(?::(\d+))?$/);
      let totalMin = parseFloat(duration) || 30;
      if (minMatch) {
        const mins = parseInt(minMatch[1]) || 0;
        const secs = parseInt(minMatch[2]) || 0;
        totalMin = mins + secs / 60;
      }
      const decimalPace = totalMin / distNum;
      const paceMins = Math.floor(decimalPace);
      const paceSecs = Math.round((decimalPace - paceMins) * 60);
      paceStr = `${paceMins}:${paceSecs < 10 ? "0" : ""}${paceSecs}/KM`;
    }

    const typeLabel = activeType === "OTHER" ? (customTypeInput.trim() || "Other") : activeType;
    const todayStr = getTodayDateStr();

    const newLog: CardioLog = {
      id: "cardio_" + Date.now(),
      date: todayStr,
      type: activeType,
      distanceKm: distNum,
      timeMin: duration,
      avgHeartRate: hrNum,
      pace: paceStr,
      customType: activeType === "OTHER" ? (customTypeInput.trim() || "Other") : undefined
    };

    // Also update today's history entry
    const existingHistory = client.history || [];
    const todayEntry = existingHistory.find(h => h.date === todayStr);

    let updatedHistory = [...existingHistory];
    if (todayEntry) {
      const updatedEntry = {
        ...todayEntry,
        cardio: newLog
      };
      updatedHistory = [
        ...existingHistory.filter(h => h.date !== todayStr),
        updatedEntry
      ];
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[new Date().getDay()];
      const dayPlan = client.weeklyPlan?.[dayName] || { workout: null, diet: null, supplements: [], cardio: null };
      
      const newEntry = {
        date: todayStr,
        dayOfWeek: dayName,
        completed: false,
        workout: dayPlan.workout,
        diet: dayPlan.diet,
        supplements: dayPlan.supplements || [],
        cardio: newLog
      };
      updatedHistory.push(newEntry);
    }

    const updatedClient: Client = {
      ...client,
      cardioLogs: [newLog, ...(client.cardioLogs || [])],
      history: updatedHistory
    };

    onUpdateClient(updatedClient);

    // Reset inputs
    setDistance("");
    setDuration("");
    setHeartRate("");
    setCustomTypeInput("");
    
    // Set nice custom notification
    setNotification(`Cardio session logged! ${typeLabel} • ${distNum} KM • ${duration}`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Toggle supplements and update progress
  const handleToggleSupplement = (id: string) => {
    const updatedSupplements = client.supplements.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    // Also update today's history entry
    const todayStr = getTodayDateStr();
    const existingHistory = client.history || [];
    const todayEntry = existingHistory.find(h => h.date === todayStr);

    let updatedHistory = [...existingHistory];
    if (todayEntry) {
      const updatedEntrySupps = (todayEntry.supplements || []).map(s => {
        if (s.id === id || s.name === client.supplements.find(item => item.id === id)?.name) {
          return { ...s, completed: !s.completed };
        }
        return s;
      });
      const updatedEntry = {
        ...todayEntry,
        supplements: updatedEntrySupps
      };
      updatedHistory = [
        ...existingHistory.filter(h => h.date !== todayStr),
        updatedEntry
      ];
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[new Date().getDay()];
      const dayPlan = client.weeklyPlan?.[dayName] || { workout: null, diet: null, supplements: [], cardio: null };
      
      const updatedEntrySupps = (dayPlan.supplements || []).map(s => {
        if (s.id === id || s.name === client.supplements.find(item => item.id === id)?.name) {
          return { ...s, completed: !s.completed };
        }
        return s;
      });

      const newEntry = {
        date: todayStr,
        dayOfWeek: dayName,
        completed: false,
        workout: dayPlan.workout,
        diet: dayPlan.diet,
        supplements: updatedEntrySupps,
        cardio: dayPlan.cardio
      };
      updatedHistory.push(newEntry);
    }

    onUpdateClient({
      ...client,
      supplements: updatedSupplements,
      history: updatedHistory
    });
  };

  // Calculate supplement adherence percentage
  const totalSupps = client.supplements.length;
  const completedSupps = client.supplements.filter(s => s.completed).length;
  const adherencePct = totalSupps > 0 ? Math.round((completedSupps / totalSupps) * 100) : 0;

  // Icons mapper for supplements
  const renderSupplementIcon = (icon: string) => {
    const classes = "text-[#c5c9ac] group-hover:text-volt transition-colors";
    switch (icon) {
      case "pill": return <Pill className={classes} size={20} />;
      case "water_drop": return <Droplet className={classes} size={20} />;
      case "bolt": return <Zap className={classes} size={20} />;
      case "fitness_center": return <Dumbbell className={classes} size={20} />;
      case "bedtime": return <Moon className={classes} size={20} />;
      default: return <Pill className={classes} size={20} />;
    }
  };

  // Sum total weekly distance dynamically
  const totalWeeklyDist = client.cardioLogs.reduce((sum, log) => sum + log.distanceKm, 0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-volt tracking-widest uppercase font-bold">
            PERFORMANCE HUB
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-black text-white uppercase italic leading-none mt-1">
            Cardio & Fuel
          </h2>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-zinc-900 border border-[#27272a] text-volt font-mono text-[10px] font-bold rounded-xl uppercase">
            {(() => {
              const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
              const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
              const d = new Date();
              return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
            })()}
          </div>
          <div className="px-4 py-2 bg-volt text-black font-mono text-[10px] font-black rounded-xl uppercase">
            LIVE SYNC
          </div>
        </div>
      </section>

      {notification && (
        <div className="bg-volt/10 border border-volt text-volt px-5 py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider animate-fadeIn">
          ⚡ {notification}
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Cardio Logging Form (8 Columns) */}
        <section className="md:col-span-8 space-y-4">
          <form onSubmit={handleLogCardio} className="bg-[#18181b] p-6 border border-[#27272a] flex flex-col gap-5 rounded-3xl transition-all duration-300 hover:border-[#a3e635]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-display text-lg font-black uppercase italic text-white">
                New Activity
              </h3>
              
              {/* Type toggles */}
              <div className="grid grid-cols-4 bg-[#09090b] p-1 rounded-2xl border border-[#27272a] gap-1 w-full sm:w-auto">
                {(["RUN", "CYCLE", "HIIT", "OTHER"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`py-2 px-3 font-mono text-xs font-black rounded-xl transition-all cursor-pointer touch-target flex items-center justify-center ${
                      activeType === type 
                        ? "bg-volt text-black font-extrabold shadow-[0_0_10px_rgba(163,230,53,0.3)]" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {activeType === "OTHER" && (
              <div className="flex flex-col gap-1.5 p-3.5 bg-[#09090b] rounded-2xl border border-[#27272a] animate-fadeIn">
                <label className="font-mono text-xs text-zinc-400 uppercase font-black tracking-wider">
                  Custom Cardio Activity Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Rowing, Swimming, Stairmaster, Yoga"
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  className="bg-transparent border-b border-zinc-800 text-sm font-sans text-white py-1.5 focus:border-volt focus:outline-none transition-all placeholder-neutral-700"
                />
              </div>
            )}

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <div className="flex flex-col gap-1.5 bg-[#09090b]/60 p-3.5 rounded-2xl border border-zinc-850">
                <label className="font-mono text-xs text-zinc-400 uppercase font-bold">
                  Distance (KM)
                </label>
                <input 
                  type="text"
                  placeholder="0.00"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="bg-transparent border-b border-[#27272a] text-2xl sm:text-3xl font-display font-black text-white py-1 focus:border-volt focus:outline-none transition-all placeholder-neutral-700"
                />
              </div>

              <div className="flex flex-col gap-1.5 bg-[#09090b]/60 p-3.5 rounded-2xl border border-zinc-850">
                <label className="font-mono text-xs text-zinc-400 uppercase font-bold">
                  Time (MIN)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. 42:15"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-transparent border-b border-[#27272a] text-2xl sm:text-3xl font-display font-black text-white py-1 focus:border-volt focus:outline-none transition-all placeholder-neutral-700"
                />
              </div>

              <div className="flex flex-col gap-1.5 bg-[#09090b]/60 p-3.5 rounded-2xl border border-zinc-850">
                <label className="font-mono text-xs text-zinc-400 uppercase font-bold">
                  Avg Heart Rate
                </label>
                <div className="flex items-center justify-between border-b border-[#27272a] focus-within:border-volt transition-colors">
                  <input 
                    type="number"
                    placeholder="145"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="bg-transparent border-none text-2xl sm:text-3xl font-display font-black text-white py-1 focus:outline-none w-full placeholder-neutral-700"
                  />
                  <Heart className="text-volt fill-volt animate-pulse shrink-0" size={22} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-volt text-black font-display text-base sm:text-lg font-black uppercase py-4 rounded-2xl hover:bg-lime-300 transition-all active:scale-[0.98] mt-2 italic tracking-widest cursor-pointer touch-target shadow-[0_0_20px_rgba(163,230,53,0.25)]"
            >
              LOG WORKOUT ⚡
            </button>
          </form>

          {/* Cardio visualization graphics matching mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weekly Distance bar charts */}
            <div className="bg-[#18181b] p-5 border border-[#27272a] rounded-3xl transition-all duration-300 hover:border-[#a3e635]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold">
                  Weekly Distance
                </span>
                <span className="font-display text-lg font-black text-volt italic">
                  {totalWeeklyDist} KM
                </span>
              </div>
              
              <div className="h-32 flex items-end gap-2 pt-2">
                <div className="flex-1 bg-zinc-800 hover:bg-volt/40 h-[20%] rounded-t-lg transition-all group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-[8px] font-mono p-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap text-white border border-[#27272a]">Mon: 2KM</div>
                </div>
                <div className="flex-1 bg-zinc-800 hover:bg-volt/40 h-[45%] rounded-t-lg transition-all group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-[8px] font-mono p-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap text-white border border-[#27272a]">Wed: 5.5KM</div>
                </div>
                <div className="flex-1 bg-volt h-[85%] rounded-t-lg transition-all group relative shadow-[0_-4px_10px_rgba(163,230,53,0.3)]">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-[8px] font-mono p-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap text-white border border-[#27272a]">Fri: {totalWeeklyDist}KM</div>
                </div>
                <div className="flex-1 bg-zinc-800 hover:bg-volt/40 h-[30%] rounded-t-lg transition-all group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-[8px] font-mono p-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap text-white border border-[#27272a]">Sat: 3KM</div>
                </div>
                <div className="flex-1 bg-zinc-800 hover:bg-volt/40 h-[60%] rounded-t-lg transition-all group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-[8px] font-mono p-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap text-white border border-[#27272a]">Sun: 6KM</div>
                </div>
                <div className="flex-1 bg-zinc-800 hover:bg-volt/40 h-[15%] rounded-t-lg transition-all group relative"></div>
                <div className="flex-1 bg-zinc-800 hover:bg-volt/40 h-[5%] rounded-t-lg transition-all"></div>
              </div>
            </div>

            {/* Intensity Trend Graph matching mockup */}
            <div className="bg-[#18181b] p-5 border border-[#27272a] flex flex-col justify-between rounded-3xl transition-all duration-300 hover:border-[#a3e635]">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold">
                  Intensity Trend
                </span>
                <span className="font-display text-lg font-black text-rose-400 italic">
                  +12%
                </span>
              </div>
              <div className="relative h-24 overflow-hidden mt-4">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                  <path 
                    d="M0,40 Q25,10 50,45 T100,20 T150,50 T200,10" 
                    fill="none" 
                    stroke="#a3e635" 
                    strokeWidth="3"
                  />
                  <path 
                    d="M0,40 Q25,10 50,45 T100,20 T150,50 T200,10 V60 H0 Z" 
                    fill="url(#grad1)" 
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#a3e635", stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: "#a3e635", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Supplementation Sidebar (4 Columns) */}
        <aside className="md:col-span-4 bg-[#18181b] border border-[#27272a] p-5 flex flex-col justify-between rounded-3xl transition-all duration-300 hover:border-[#a3e635]">
          {client.linkedTrainerId && client.linkedTrainerStatus === "approved" ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-lg font-black uppercase italic text-white">
                    Daily Fuel
                  </h3>
                  <button className="text-volt hover:bg-zinc-800 p-2 rounded-xl transition-colors cursor-pointer">
                    <Settings size={16} />
                  </button>
                </div>

                {/* Checklist items */}
                <div className="space-y-2">
                  {client.supplements.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleToggleSupplement(item.id)}
                      className={`group flex items-center justify-between p-3 border rounded-2xl bg-[#09090b] hover:border-volt transition-colors cursor-pointer ${
                        item.completed ? "border-volt" : "border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {renderSupplementIcon(item.icon)}
                        <div>
                          <p className="font-bold text-sm text-white">{item.name}</p>
                          <p className="font-mono text-[9px] text-zinc-500 font-semibold uppercase">{item.timeLabel}</p>
                        </div>
                      </div>
                      
                      {/* Styled Checkbox */}
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        item.completed ? "bg-volt border-volt text-black" : "border-zinc-800"
                      }`}>
                        {item.completed && <Check size={13} strokeWidth={4} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold">
                    Daily Adherence
                  </span>
                  <span className="font-mono text-xs font-bold text-volt">
                    {adherencePct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#09090b] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-volt shadow-[0_0_8px_rgba(163,230,53,0.5)] transition-all duration-500"
                    style={{ width: `${adherencePct}%` }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-volt/10 text-volt flex items-center justify-center border border-volt/20">
                <Pill size={24} />
              </div>
              <div className="space-y-2">
                <p className="font-display text-sm font-black uppercase text-white italic tracking-wider">DAILY FUEL LOCKED</p>
                <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                  Your daily supplement logs, customized pre-workouts, and performance optimization dosages are locked. Request a verified gym coach to sync daily fuel plans.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Activity History List */}
      <section className="space-y-3">
        <h3 className="font-display text-lg font-black uppercase text-white italic border-l-4 border-volt pl-3">
          Activity History
        </h3>
        
        <div className="space-y-2">
          {client.cardioLogs.map((log) => {
            const isRun = log.type === "RUN";
            const isCycle = log.type === "CYCLE";
            const isHiit = log.type === "HIIT";
            
            let label = "Cardio Run Session";
            let IconComp = <Footprints size={18} />;
            
            if (isCycle) {
              label = "Endurance Bike Tour";
              IconComp = <Bike size={18} />;
            } else if (isHiit) {
              label = "High Intensity Interval";
              IconComp = <Flame size={18} />;
            } else if (log.type === "OTHER") {
              label = log.customType || "Other Cardio Session";
              IconComp = <Zap size={18} />;
            }

            return (
              <div 
                key={log.id}
                className="grid grid-cols-2 md:grid-cols-6 items-center p-4 bg-[#18181b] border border-[#27272a] hover:border-volt hover:scale-[1.01] transition-all group rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-full bg-volt/10 text-volt shrink-0">
                    {IconComp}
                  </span>
                  <span className="font-mono text-xs text-white font-bold">{formatDateStr(log.date)}</span>
                </div>

                <div className="hidden md:block">
                  <span className="font-bold text-sm text-white capitalize">
                    {label}
                  </span>
                </div>

                <div className="text-right md:text-left">
                  <span className="font-mono text-[10px] text-zinc-500 font-semibold uppercase mr-1">DIST:</span>
                  <span className="font-display text-sm font-bold text-white italic">{log.distanceKm} KM</span>
                </div>

                <div className="hidden md:block">
                  <span className="font-mono text-[10px] text-zinc-500 font-semibold uppercase mr-1">TIME:</span>
                  <span className="font-mono text-sm text-white">{log.timeMin}</span>
                </div>

                <div className="hidden md:block">
                  <span className="font-mono text-[10px] text-zinc-500 font-semibold uppercase mr-1">HR:</span>
                  <span className="font-mono text-sm text-volt">{log.avgHeartRate} BPM</span>
                </div>

                <div className="flex justify-end col-span-1">
                  <ChevronRight className="text-zinc-400 group-hover:text-volt transition-colors" size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
