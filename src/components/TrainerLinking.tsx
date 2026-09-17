import React, { useState } from "react";
import { Search, ShieldAlert, CheckCircle, Award, HelpCircle, Shield, User, Dumbbell } from "lucide-react";
import { Client, Trainer } from "../types";

interface TrainerLinkingProps {
  client: Client;
  trainers: Trainer[];
  onSendRequest: (trainerId: string) => void;
  onCancelRequest: () => void;
  onDisconnect: () => void;
}

export default function TrainerLinking({
  client,
  trainers,
  onSendRequest,
  onCancelRequest,
  onDisconnect
}: TrainerLinkingProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const approvedCoaches = trainers.filter(t => t.status === "approved");

  // Filter based on search query
  const filteredCoaches = approvedCoaches.filter(coach => {
    const query = searchQuery.toLowerCase();
    return (
      coach.name.toLowerCase().includes(query) ||
      coach.specialty.toLowerCase().includes(query) ||
      coach.bio.toLowerCase().includes(query)
    );
  });

  const activeTrainer = approvedCoaches.find(t => t.id === client.linkedTrainerId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Current Link Status Summary Card */}
      <div className="bg-[#18181b] p-6 border border-[#27272a] rounded-[32px] overflow-hidden relative">
        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-mono text-volt uppercase tracking-wider font-bold">
              YOUR GYM CONNECTION HUB
            </span>
            <h2 className="font-display text-2xl font-black text-white italic uppercase">
              {client.linkedTrainerId && activeTrainer
                ? "CONNECTED TO YOUR COACH"
                : "FIND AND LINK WITH A COACH"}
            </h2>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed max-w-xl">
              {client.linkedTrainerId && activeTrainer
                ? `You are fully linked with Coach ${activeTrainer.name}. Your workout schedules, diet charts, and direct messaging chats are active and connected.`
                : "You are currently training solo. Choose a certified gym coach below to start your personal training routines, custom diets, and daily check-ins."}
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            {client.linkedTrainerId && activeTrainer ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                <CheckCircle className="text-emerald-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs font-bold text-white">Coach Assigned</p>
                  <p className="text-[10px] font-mono text-zinc-400">Matched with {activeTrainer.name}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="text-volt shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-white">Solo Member</p>
                  <p className="text-[10px] font-mono text-zinc-400">No trainer connected yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE CONNECTION MAP - SHOWING TIGHT LINKING */}
        <div className="mt-6 p-4 bg-[#09090b] border border-zinc-850 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">YOUR ACTIVE GYM LINK SYSTEM</span>
            <span className="text-[9px] font-mono text-volt uppercase font-bold bg-volt/10 px-2 py-0.5 rounded border border-volt/20">Tight Link active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Node 1: Client (You) */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-volt/25 text-volt flex items-center justify-center shrink-0 border border-volt/35">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">CLIENT (YOU)</p>
                <p className="text-xs font-bold text-white truncate">{client.name}</p>
              </div>
            </div>

            {/* Connection Link Indicators */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-volt animate-ping"></div>
                <span className="text-[9px] font-mono text-volt font-black uppercase">LINKED VIA</span>
              </div>
              <span className="text-xs font-mono text-zinc-500">◀──────────▶</span>
            </div>

            {/* Node 2: Gym Owner / Admin */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-volt/30 flex items-center gap-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-volt text-black flex items-center justify-center shrink-0">
                <Shield size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-mono text-volt uppercase font-bold">GYM OWNER (ADMIN)</p>
                <p className="text-xs font-bold text-white truncate">Gym 1 Management</p>
              </div>
            </div>

            {/* Connection Link Indicators */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-volt animate-ping"></div>
                <span className="text-[9px] font-mono text-volt font-black uppercase">APPROVED BY</span>
              </div>
              <span className="text-xs font-mono text-zinc-500">◀──────────▶</span>
            </div>

            {/* Node 3: Trainer */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${client.linkedTrainerId && activeTrainer ? "bg-zinc-900 border-zinc-800" : "bg-zinc-900/40 border-zinc-900 border-dashed"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${client.linkedTrainerId && activeTrainer ? "bg-volt/25 text-volt border border-volt/35" : "bg-zinc-800 text-zinc-600 border border-zinc-800/40"}`}>
                <Dumbbell size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">PERSONAL COACH</p>
                <p className="text-xs font-bold text-white truncate">{client.linkedTrainerId && activeTrainer ? activeTrainer.name : "Unassigned"}</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 leading-normal flex items-start gap-2.5">
            <HelpCircle size={14} className="text-volt shrink-0 mt-0.5" />
            <p>
              <strong>Owner Authorization Link:</strong> This gym operates on a tight-knit tri-linking system. Both you and your coach are authenticated under the supervision of <span className="text-white">Gym 1 Management</span>. Any updates to your assignment can be coordinated directly with the owner.
            </p>
          </div>
        </div>
      </div>

      {/* Roster search list for client */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-2">
          <div>
            <p className="font-mono text-xs text-volt uppercase tracking-wider">COACH DIRECTORY</p>
            <h3 className="font-display text-xl font-bold text-white uppercase italic">Active Roster Search</h3>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-volt placeholder-zinc-600 transition-colors"
            />
          </div>
        </div>

        {filteredCoaches.length === 0 ? (
          <div className="p-8 text-center bg-[#18181b] border border-[#27272a] rounded-3xl text-zinc-500 font-mono text-xs">
            No matching certified coaches found. Try adjusting your search keywords.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoaches.map((coach) => {
              const isAssignedToThis = client.linkedTrainerId === coach.id;

              return (
                <div
                  key={coach.id}
                  className={`p-5 bg-[#18181b] border rounded-3xl flex flex-col justify-between gap-4 transition-all ${
                    isAssignedToThis 
                      ? "border-volt shadow-lg shadow-volt/5" 
                      : "border-[#27272a] hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-700">
                        <img src={coach.avatarUrl} alt={coach.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm leading-tight">{coach.name}</h4>
                        <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] font-mono rounded font-bold mt-1 inline-block">
                          {coach.experience} EXPERIENCE
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-volt font-bold mt-3 uppercase">{coach.specialty}</p>
                    <p className="text-xs text-zinc-400 font-semibold leading-relaxed mt-2 line-clamp-3">&ldquo;{coach.bio}&rdquo;</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 mt-auto">
                    {isAssignedToThis ? (
                      client.linkedTrainerStatus === "approved" ? (
                        <div className="space-y-2">
                          <span className="w-full py-2 bg-volt/10 text-volt font-mono text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-1.5 border border-volt/20">
                            ★ ACTIVE PERSONAL COACH
                          </span>
                          <button
                            onClick={onDisconnect}
                            className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-mono text-[9px] uppercase rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                          >
                            DISCONNECT COACH
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="w-full py-2 bg-amber-500/10 text-amber-400 font-mono text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/20 animate-pulse">
                            ⚡ REQUEST PENDING
                          </span>
                          <button
                            onClick={onCancelRequest}
                            className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-[9px] uppercase rounded-lg transition-colors cursor-pointer border border-zinc-800"
                          >
                            CANCEL REQUEST
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        disabled={!!client.linkedTrainerId}
                        onClick={() => onSendRequest(coach.id)}
                        className={`w-full py-2.5 font-mono text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          client.linkedTrainerId
                            ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                            : "bg-volt text-black hover:bg-lime-300 shadow-md shadow-volt/10"
                        }`}
                      >
                        {client.linkedTrainerId ? "ALREADY ASSIGNED" : "REQUEST CONNECTION ⚡"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
