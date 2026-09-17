import React, { useState, useRef, useEffect } from "react";
import { Send, User, MessageSquare, Search, ShieldAlert, Check, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Client, ChatMessage, Trainer, User as UserType } from "../types";

interface ChatRoomProps {
  currentRole: "TRAINER" | "CLIENT" | "OWNER";
  clients: Client[];
  activeClient?: Client;
  onSelectClient?: (clientId: string) => void;
  chats: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  trainers: Trainer[];
  currentTrainerId?: string;
  onNavigateToCoaches?: () => void;
  gymName?: string;
  users?: UserType[];
}

export default function ChatRoom({
  currentRole,
  clients,
  activeClient,
  onSelectClient,
  chats,
  onAddMessage,
  trainers,
  currentTrainerId = "alex_volt",
  onNavigateToCoaches,
  gymName = "Kinetic Performance",
  users = []
}: ChatRoomProps) {
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Responsive mobile active view
  const [mobileActiveView, setMobileActiveView] = useState<"LIST" | "CHAT">("LIST");

  // Local message recipient selection states
  const [trainerSelectedRecipientId, setTrainerSelectedRecipientId] = useState<string>("");
  const [clientSelectedRecipient, setClientSelectedRecipient] = useState<"COACH" | "OWNER">("COACH");

  // Safe client fallback
  const safeActiveClient = (activeClient || clients[0] || { id: "none", name: "Guest", avatarUrl: "" }) as Client;
  const isClientLinked = safeActiveClient.linkedTrainerId && safeActiveClient.linkedTrainerStatus === "approved";

  // Owner selected recipient state
  const [ownerRecipientId, setOwnerRecipientId] = useState<string>("");
  const [ownerRecipientType, setOwnerRecipientType] = useState<"TRAINER" | "CLIENT">("TRAINER");

  // Sync trainer recipient selection with activeClient changes
  useEffect(() => {
    if (currentRole === "TRAINER" && safeActiveClient.id && safeActiveClient.id !== "none") {
      if (!trainerSelectedRecipientId) {
        setTrainerSelectedRecipientId(safeActiveClient.id);
      }
    }
  }, [safeActiveClient.id, currentRole]);

  // Default owner recipient on load
  useEffect(() => {
    if (currentRole === "OWNER") {
      if (ownerRecipientType === "TRAINER" && trainers.length > 0) {
        setOwnerRecipientId(trainers[0].id);
      } else if (ownerRecipientType === "CLIENT" && clients.length > 0) {
        setOwnerRecipientId(clients[0].id);
      }
    }
  }, [ownerRecipientType, currentRole, trainers, clients]);

  // Synthetic beep feedback
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Ignored
    }
  };

  // Find Owner's dynamic info if available to reflect real-time updates and edited photo
  const ownerUser = users?.find(u => u.role === "OWNER");
  const ownerAvatar = ownerUser?.avatarUrl || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=150";
  const ownerDisplayName = ownerUser ? `Gym Support (${ownerUser.gymName || gymName})` : `Gym Support (${gymName})`;

  // Determine chat partner
  const partnerTrainerId = safeActiveClient.linkedTrainerId || "alex_volt";
  const partnerTrainer = trainers.find(t => t.id === partnerTrainerId);
  const trainerName = partnerTrainer ? partnerTrainer.name : 'Alex "Volt" Rivers';
  const trainerAvatar = partnerTrainer ? partnerTrainer.avatarUrl : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200";

  let recipientId = "";
  let senderId = "";
  let senderName = "";
  let partnerName = "";
  let partnerAvatar = "";
  let partnerRole = "TRAINER";

  if (currentRole === "OWNER") {
    recipientId = ownerRecipientId;
    senderId = "owner";
    senderName = ownerUser?.name || "Gym Owner";
    
    if (ownerRecipientType === "TRAINER") {
      const tr = trainers.find(t => t.id === ownerRecipientId);
      partnerName = tr ? tr.name : "Trainer";
      partnerAvatar = tr ? tr.avatarUrl : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200";
      partnerRole = "TRAINER";
    } else {
      const cl = clients.find(c => c.id === ownerRecipientId);
      partnerName = cl ? cl.name : "Athlete";
      partnerAvatar = cl ? cl.avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";
      partnerRole = "CLIENT";
    }
  } else if (currentRole === "TRAINER") {
    senderId = currentTrainerId;
    senderName = trainers.find(t => t.id === currentTrainerId)?.name || 'Alex "Volt" Rivers';
    
    const targetRecipientId = trainerSelectedRecipientId || safeActiveClient.id;
    recipientId = targetRecipientId;
    
    if (targetRecipientId === "owner") {
      partnerName = ownerDisplayName;
      partnerAvatar = ownerAvatar;
      partnerRole = "OWNER";
    } else {
      const cl = clients.find(c => c.id === targetRecipientId);
      partnerName = cl ? cl.name : "Athlete";
      partnerAvatar = cl ? cl.avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";
      partnerRole = "CLIENT";
    }
  } else {
    senderId = safeActiveClient.id;
    senderName = safeActiveClient.name;
    
    if (clientSelectedRecipient === "OWNER") {
      recipientId = "owner";
      partnerName = ownerDisplayName;
      partnerAvatar = ownerAvatar;
      partnerRole = "OWNER";
    } else {
      recipientId = partnerTrainerId;
      partnerName = trainerName;
      partnerAvatar = trainerAvatar;
      partnerRole = "TRAINER";
    }
  }

  // Filter message list
  const filteredChats = chats.filter(msg => {
    if (currentRole === "OWNER") {
      return (msg.senderId === "owner" && msg.recipientId === ownerRecipientId) ||
             (msg.senderId === ownerRecipientId && msg.recipientId === "owner");
    } else if (currentRole === "TRAINER") {
      const targetRecipientId = trainerSelectedRecipientId || safeActiveClient.id;
      return (msg.senderId === currentTrainerId && msg.recipientId === targetRecipientId) ||
             (msg.senderId === targetRecipientId && msg.recipientId === currentTrainerId);
    } else {
      const targetRecipientId = clientSelectedRecipient === "OWNER" ? "owner" : partnerTrainerId;
      return (msg.senderId === safeActiveClient.id && msg.recipientId === targetRecipientId) ||
             (msg.senderId === targetRecipientId && msg.recipientId === safeActiveClient.id);
    }
  });

  // Filter linked clients for trainer
  const trainerClients = clients.filter(c => c.linkedTrainerId === currentTrainerId && c.linkedTrainerStatus === "approved");

  // Search filtered lists
  const searchedClients = trainerClients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const searchedOwnerTrainers = trainers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const searchedOwnerClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Scroll to bottom helper
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior
        });
      }
      // Extra fallback guard
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 40);
  };

  // Snappy instant scroll when changing conversation channels or partners
  useEffect(() => {
    scrollToBottom("auto");
  }, [safeActiveClient.id, ownerRecipientId, currentRole, trainerSelectedRecipientId, clientSelectedRecipient]);

  // Smooth scroll when a new message arrives in the current filtered conversation
  useEffect(() => {
    scrollToBottom("smooth");
  }, [filteredChats.length]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !recipientId) return;

    playChime();

    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      senderId,
      senderName,
      recipientId,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    onAddMessage(newMsg);
    setInputText("");
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Trainer has no linked athletes yet and they didn't select owner
  if (currentRole === "TRAINER" && trainerClients.length === 0 && trainerSelectedRecipientId !== "owner") {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#09090b] border border-zinc-800 text-center rounded-2xl h-[calc(100vh-175px)] md:h-[620px] space-y-4">
        <div className="w-14 h-14 rounded-full bg-volt/10 text-volt flex items-center justify-center border border-volt/20">
          <MessageSquare size={24} />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="font-display text-base font-bold text-white uppercase italic">
            No Active Clients
          </h4>
          <p className="text-xs text-zinc-400">
            You don't have any connected clients to chat with yet. Once athletes approve your link request, they will appear here.
          </p>
          <button 
            onClick={() => setTrainerSelectedRecipientId("owner")}
            className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase"
          >
            Chat with Gym Support ({gymName})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[calc(100vh-175px)] md:h-[620px] max-h-[820px] items-stretch min-h-[440px]">
      
      {/* Sidebar selection for Owner & Trainer */}
      {(currentRole === "TRAINER" || currentRole === "OWNER") && (
        <div className={`${mobileActiveView === "LIST" ? "flex" : "hidden"} md:flex md:col-span-4 bg-[#09090b] border border-zinc-800 rounded-2xl p-4 flex-col h-full overflow-hidden`}>
          <div className="shrink-0 mb-3">
            <h4 className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              {currentRole === "OWNER" ? "DIRECT CHATS" : "CHANNELS"}
            </h4>
          </div>
 
          {/* Search bar */}
          <div className="relative mb-3 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={12} />
            <input 
              type="text"
              placeholder="Search chat..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-750 transition-all font-semibold"
            />
          </div>
 
          {/* Owner toggles */}
          {currentRole === "OWNER" && (
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl mb-3 shrink-0">
              <button
                type="button"
                onClick={() => setOwnerRecipientType("TRAINER")}
                className={`flex-1 py-1.5 text-[9px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  ownerRecipientType === "TRAINER" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Coaches ({trainers.length})
              </button>
              <button
                type="button"
                onClick={() => setOwnerRecipientType("CLIENT")}
                className={`flex-1 py-1.5 text-[9px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  ownerRecipientType === "CLIENT" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Athletes ({clients.length})
              </button>
            </div>
          )}
 
          {/* Chat Threads list */}
          <div className="space-y-1 flex-grow overflow-y-auto pr-1 min-h-0">
            {currentRole === "TRAINER" ? (
              <div className="space-y-1">
                {/* Gym Support contact */}
                <div 
                  onClick={() => {
                    setTrainerSelectedRecipientId("owner");
                    setMobileActiveView("CHAT");
                  }}
                  className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                    trainerSelectedRecipientId === "owner" 
                      ? "bg-zinc-850 text-white border border-zinc-750" 
                      : "hover:bg-zinc-900/50 border border-transparent"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900">
                    <img src={ownerAvatar} alt={ownerDisplayName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-white truncate">{ownerDisplayName}</p>
                    <p className="text-[8px] font-mono text-volt-dim uppercase tracking-wider">SYSTEM SUPPORT</p>
                  </div>
                  {trainerSelectedRecipientId === "owner" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-volt shrink-0"></div>
                  )}
                </div>

                <div className="border-t border-zinc-850 my-2 pt-2">
                  <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-1.5 px-2">MY ATHLETES</p>
                </div>

                {searchedClients.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-zinc-650 uppercase font-mono">No athletes</div>
                ) : (
                  searchedClients.map((c) => {
                    const isSelected = trainerSelectedRecipientId === c.id;
                    return (
                      <div 
                        key={c.id}
                        onClick={() => {
                          setTrainerSelectedRecipientId(c.id);
                          onSelectClient?.(c.id);
                          setMobileActiveView("CHAT");
                        }}
                        className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-zinc-800/80 text-white" 
                            : "hover:bg-zinc-900/50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 shrink-0">
                          <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-white truncate">{c.name}</p>
                        </div>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-volt shrink-0"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              ownerRecipientType === "TRAINER" ? (
                searchedOwnerTrainers.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-zinc-650 uppercase font-mono">No coaches</div>
                ) : (
                  searchedOwnerTrainers.map((t) => {
                    const isSelected = t.id === ownerRecipientId;
                    return (
                      <div 
                        key={t.id}
                        onClick={() => {
                          setOwnerRecipientId(t.id);
                          setMobileActiveView("CHAT");
                        }}
                        className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-zinc-800/80 text-white" 
                            : "hover:bg-zinc-900/50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 shrink-0">
                          <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-white truncate">{t.name}</p>
                        </div>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-volt shrink-0"></div>
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                searchedOwnerClients.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-zinc-650 uppercase font-mono">No athletes</div>
                ) : (
                  searchedOwnerClients.map((c) => {
                    const isSelected = c.id === ownerRecipientId;
                    return (
                      <div 
                        key={c.id}
                        onClick={() => {
                          setOwnerRecipientId(c.id);
                          setMobileActiveView("CHAT");
                        }}
                        className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-zinc-800/80 text-white" 
                            : "hover:bg-zinc-900/50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 shrink-0">
                          <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-white truncate">{c.name}</p>
                        </div>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-volt shrink-0"></div>
                        )}
                      </div>
                    );
                  })
                )
              )
            )}
          </div>
        </div>
      )}
 
      {/* Message Feed Column */}
      <div className={`${mobileActiveView === "CHAT" || currentRole === "CLIENT" ? "flex" : "hidden md:flex"} flex-col h-full bg-[#09090b] border border-zinc-800 rounded-2xl overflow-hidden ${
        currentRole === "TRAINER" || currentRole === "OWNER" ? "md:col-span-8" : "md:col-span-12"
      }`}>
        
        {/* Header summary info */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-[#09090b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {(currentRole === "TRAINER" || currentRole === "OWNER") && (
              <button
                type="button"
                onClick={() => setMobileActiveView("LIST")}
                className="md:hidden p-1 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                title="Back to Chats"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 shrink-0">
              <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-white truncate">
                {partnerName}
              </h4>
              <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                Active Conversation
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded">
            {partnerRole === "OWNER" ? "GYM OWNER" : partnerRole}
          </span>
        </div>

        {/* Client Dual Pill Toggle */}
        {currentRole === "CLIENT" && (
          <div className="bg-zinc-950 border-b border-zinc-800 p-1.5 flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setClientSelectedRecipient("COACH")}
              className={`flex-1 py-1.5 text-[9px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                clientSelectedRecipient === "COACH" 
                  ? "bg-volt text-black font-black" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              <User size={10} />
              COACH CHAT
            </button>
            <button
              type="button"
              onClick={() => setClientSelectedRecipient("OWNER")}
              className={`flex-1 py-1.5 text-[9px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                clientSelectedRecipient === "OWNER" 
                  ? "bg-volt text-black font-black" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              <ShieldCheck size={10} />
              SUPPORT / OWNER
            </button>
          </div>
        )}
 
        {/* Message container / Locked view if not linked */}
        {currentRole === "CLIENT" && clientSelectedRecipient === "COACH" && !isClientLinked ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4 bg-zinc-950/40 min-h-0">
            <div className="w-12 h-12 rounded-full bg-volt/10 text-volt flex items-center justify-center border border-volt/20">
              <ShieldAlert size={20} />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h4 className="font-display text-sm font-bold text-white uppercase italic">
                Coach Chat Locked
              </h4>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Please link with an elite coach from the directory to start a direct line of communication.
              </p>
            </div>
            {onNavigateToCoaches && (
              <button
                onClick={onNavigateToCoaches}
                className="px-4 py-2 bg-volt text-black font-mono text-[10px] font-black rounded-xl hover:bg-lime-300 transition-all flex items-center gap-1 cursor-pointer uppercase"
              >
                Find a Coach
              </button>
            )}
          </div>
        ) : (
          <>
            <div 
              ref={scrollContainerRef}
              className="flex-grow p-5 overflow-y-auto space-y-4 bg-zinc-950/40 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-850 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-800"
            >
              {filteredChats.length === 0 ? (
                <div className="text-center py-24 text-zinc-500 font-mono text-xs">
                  No messages yet. Send a greeting below!
                </div>
              ) : (
                filteredChats.map((msg) => {
                  const isMe = msg.senderId === senderId;
                  const rawSenderId = msg.senderId ? msg.senderId.toLowerCase() : "";
                  const senderRole = rawSenderId === "owner" 
                    ? "GYM OWNER" 
                    : (rawSenderId === "alex_volt" || rawSenderId === "jordan_apex" || rawSenderId.startsWith("trainer") || rawSenderId.includes("knt-alex") || rawSenderId.includes("knt-jordan")) 
                      ? "COACH" 
                      : "ATHLETE";

                  return (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={`flex flex-col max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      {!isMe && (
                        <span className="text-[9px] font-mono font-extrabold text-zinc-400 mb-1 px-1 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[7px] font-black tracking-wider uppercase ${
                            senderRole === "GYM OWNER" 
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                              : senderRole === "COACH"
                                ? "bg-volt/10 text-volt border border-volt/20"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-750"
                          }`}>
                            {senderRole}
                          </span>
                          <span className="truncate max-w-[120px] text-zinc-300 font-semibold">{msg.senderName || "User"}</span>
                        </span>
                      )}
                      <div className={`p-3 px-4 rounded-2xl text-xs leading-relaxed break-words ${
                        isMe 
                          ? "bg-gradient-to-br from-volt to-lime-400 text-black rounded-tr-none font-bold shadow-md shadow-volt/5" 
                          : "bg-zinc-900 text-zinc-100 rounded-tl-none font-semibold border border-zinc-800/80 shadow-sm"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-zinc-500 font-mono mt-1 px-1">{msg.timestamp}</span>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
 
            {/* Input bar */}
            <form onSubmit={onFormSubmit} className="p-3 border-t border-zinc-800 bg-[#09090b] flex gap-2 shrink-0">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!recipientId}
                placeholder={
                  !recipientId 
                    ? "Select a conversation partner..." 
                    : "Type your message..."
                }
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-700 font-semibold placeholder-zinc-700 disabled:opacity-50 font-sans"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || !recipientId}
                className="px-4 py-3 bg-volt hover:bg-lime-300 text-black rounded-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                <Send size={12} strokeWidth={3} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
