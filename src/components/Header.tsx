import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  User, Shield, Users, RefreshCw, Bell, LogOut, Award, Sun, Moon, 
  Camera, Video, Check, X, Sparkles, HelpCircle, Upload, Pencil
} from "lucide-react";
import { User as UserType, ChatMessage, Trainer } from "../types";
import { compressImage } from "../utils/image";
import { KineticDatabase } from "../db";

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onUpdateProfile?: (updatedUser: UserType) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  gymName?: string;
  chats?: ChatMessage[];
  hasUnreadChats?: boolean;
  onNavigateToChat?: () => void;
  trainers?: Trainer[];
}

export default function Header({ 
  currentUser, 
  onLogout, 
  onUpdateProfile,
  theme, 
  onToggleTheme,
  gymName,
  chats = [],
  hasUnreadChats = false,
  onNavigateToChat,
  trainers = []
}: HeaderProps) {
  if (!currentUser) return null;

  // Profile modal and camera states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Edit fields state
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editGymName, setEditGymName] = useState(currentUser.gymName || "");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (isProfileOpen && currentUser) {
      setEditName(currentUser.name);
      setEditEmail(currentUser.email);
      setEditGymName(currentUser.gymName || "");
      
      if (currentUser.role === "TRAINER" && trainers) {
        const matchedTrainer = trainers.find(t => t.id === currentUser.trainerId);
        if (matchedTrainer) {
          setEditSpecialty(matchedTrainer.specialty || "");
          setEditExperience(matchedTrainer.experience || "");
          setEditBio(matchedTrainer.bio || "");
        }
      }
      setCapturedImage(null);
    }
  }, [isProfileOpen, currentUser, trainers]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);

    // Detect mobile/tablet devices to directly trigger native camera capture
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log("Mobile device detected. Pivoting directly to native camera capture...");
      const mobileInput = document.getElementById("profile-mobile-camera-input") as HTMLInputElement;
      if (mobileInput) {
        mobileInput.click();
        return;
      }
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const mobileInput = document.getElementById("profile-mobile-camera-input") as HTMLInputElement;
      if (mobileInput) {
        mobileInput.click();
      } else {
        setCameraError("Camera access requires a secure (HTTPS) connection. Please use an HTTPS link or use the 'CHOOSE' file upload option below.");
      }
      return;
    }

    try {
      let mediaStream: MediaStream;
      try {
        // Try requesting user-facing camera with ideal dimensions
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 640 }, 
            facingMode: "user" 
          } 
        });
      } catch (err) {
        console.warn("Square camera constraints failed, falling back to basic user-facing:", err);
        try {
          // Fall back to a standard user-facing constraint (highly compatible on mobile browsers)
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: "user" 
            } 
          });
        } catch (err2) {
          console.warn("User-facing constraints failed, falling back to any available video stream:", err2);
          // Absolute fallback
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
        }
      }

      setStream(mediaStream);
      setIsCameraActive(true);
      
      // Bind video stream and play on mobile devices
      setTimeout(() => {
        const video = document.getElementById("profile-video-feed") as HTMLVideoElement;
        if (video) {
          video.srcObject = mediaStream;
          // Crucial for iOS/Android: programmatically trigger play after loadedmetadata
          video.onloadedmetadata = () => {
            video.play().catch(e => {
              console.error("Video play failed programmatically:", e);
            });
          };
          // Immediate play trigger fallback
          video.play().catch(e => {
            console.warn("Immediate play promise was rejected:", e);
          });
        }
      }, 300);
    } catch (err: any) {
      console.error("Camera access failed entirely:", err);
      const mobileInput = document.getElementById("profile-mobile-camera-input") as HTMLInputElement;
      if (mobileInput) {
        console.log("Live stream failed. Pivoting to native camera input fallback...");
        mobileInput.click();
      } else {
        setCameraError("Camera access denied or unavailable. Please grant permissions or try another browser.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById("profile-video-feed") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    if (video) {
      // Correct aspect ratio crop for various phone camera sensors
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;
      const size = Math.min(videoWidth, videoHeight);
      const sx = (videoWidth - size) / 2;
      const sy = (videoHeight - size) / 2;

      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Center crop the camera stream onto a 320x320 avatar
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 320, 320);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSaveProfile = () => {
    if (onUpdateProfile && currentUser) {
      const updatedUser: UserType = {
        ...currentUser,
        name: editName.trim(),
        email: editEmail.trim(),
        avatarUrl: capturedImage || currentUser.avatarUrl,
      };

      if (currentUser.role === "OWNER") {
        if (editGymName) {
          updatedUser.gymName = editGymName.trim();
        } else {
          delete updatedUser.gymName;
        }
      } else if (gymName) {
        updatedUser.gymName = gymName;
      } else if (currentUser.gymName) {
        updatedUser.gymName = currentUser.gymName;
      }

      if (currentUser.role === "TRAINER") {
        updatedUser.specialty = editSpecialty.trim();
        updatedUser.experience = editExperience.trim();
        updatedUser.bio = editBio.trim();
      } else {
        delete updatedUser.specialty;
        delete updatedUser.experience;
        delete updatedUser.bio;
      }

      onUpdateProfile(updatedUser);
      setIsProfileOpen(false);
      setCapturedImage(null);
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
    setIsProfileOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const rawBase64 = event.target.result as string;
          try {
            const compressed = await compressImage(rawBase64);
            setCapturedImage(compressed);
            setCameraError(null);
          } catch (err) {
            setCapturedImage(rawBase64);
            setCameraError(null);
          }
        }
      };
      reader.onerror = () => {
        setCameraError("Failed to read image file from device.");
      };
      reader.readAsDataURL(file);
    }
  };

  const renderNotificationsDropdown = (isMobile: boolean) => {
    if (!isNotificationsOpen) return null;

    // Filter messages that belong to other senders
    const incomingChats = chats.filter(m => m.senderId !== currentUser?.id);

    return (
      <>
        {/* Click-away backdrop */}
        <div 
          className="fixed inset-0 z-40 cursor-default bg-transparent" 
          onClick={() => setIsNotificationsOpen(false)}
        />
        {/* Dropdown Card */}
        <div className={`absolute ${isMobile ? 'right-[-36px] w-[calc(100vw-2rem)]' : 'right-0 w-80'} sm:right-0 sm:w-80 top-10 bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-left transition-all duration-200`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
            <span className="font-display font-black text-xs text-white tracking-wider">NOTIFICATIONS</span>
            {hasUnreadChats && (
              <span className="text-[9px] bg-volt/10 text-volt px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                NEW CHAT
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
            {hasUnreadChats && incomingChats.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">Unread Messages</p>
                {incomingChats
                  .slice(-3) // last 3 incoming messages
                  .reverse()
                  .map((msg, i) => (
                    <button
                      key={msg.id || i}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        onNavigateToChat?.();
                      }}
                      className="w-full text-left p-2.5 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-volt/30 rounded-xl transition-all flex flex-col gap-1 cursor-pointer group"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold text-volt group-hover:text-lime-300 transition-colors">
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-relaxed">
                        {msg.text}
                      </p>
                    </button>
                  ))
                }
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onNavigateToChat?.();
                  }}
                  className="w-full py-2.5 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-[10px] italic tracking-widest rounded-xl transition-all text-center block cursor-pointer"
                >
                  OPEN CHAT ROOM ⚡
                </button>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Check size={18} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">All caught up!</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">No new chat messages or system alerts.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b]/95 backdrop-blur-xl border-b border-[#27272a] px-3.5 sm:px-6 md:px-8 py-2.5 sm:py-3 flex justify-between items-center transition-all">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-volt flex items-center justify-center text-black font-extrabold shadow-md shadow-volt/20 shrink-0 text-sm sm:text-base">
          ⚡
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-base sm:text-xl md:text-2xl italic font-black text-volt tracking-tight uppercase leading-none truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
            {gymName || currentUser?.gymName || "Kinetic Performance"}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 tracking-wider font-bold">
              GYM BUDDY
            </span>
            <span className="inline-block sm:hidden px-1.5 py-0.2 bg-volt/10 text-volt font-mono text-[8px] font-black rounded border border-volt/20 uppercase tracking-tighter">
              {currentUser.role === "OWNER" ? "OWNER" : currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Top Bar Actions (Compact, Clean & High-Touch) */}
      <div className="sm:hidden flex items-center gap-1.5 shrink-0">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 bg-[#18181b] rounded-xl border border-zinc-800 text-zinc-400 hover:text-volt transition-all flex items-center justify-center cursor-pointer active:scale-95"
          title={theme === "light" ? "Switch to Dark" : "Switch to Light"}
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-9 h-9 text-zinc-400 hover:text-volt bg-[#18181b] rounded-xl border border-zinc-800 transition-all flex items-center justify-center relative cursor-pointer active:scale-95"
          >
            {hasUnreadChats && (
              <span className="w-2 h-2 rounded-full bg-volt absolute top-1.5 right-1.5 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.8)]"></span>
            )}
            <Bell size={15} />
          </button>
          {renderNotificationsDropdown(true)}
        </div>

        {/* Clickable Mobile Avatar to open Profile & Settings */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="w-9 h-9 rounded-xl overflow-hidden border-2 border-volt/60 bg-zinc-800 p-0.5 active:scale-95 transition-all cursor-pointer relative shadow-sm"
          title="Open Profile & Settings"
        >
          <img
            src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
            alt="Profile Avatar"
            className="w-full h-full object-cover rounded-lg"
          />
        </button>

        <button 
          onClick={onLogout}
          className="w-9 h-9 bg-[#18181b] rounded-xl border border-zinc-800 text-rose-400 hover:text-rose-350 transition-all flex items-center justify-center cursor-pointer active:scale-95"
          title="Secure Logout"
        >
          <LogOut size={15} />
        </button>
      </div>

      {/* Profile and Notifications (Desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="text-right flex items-center gap-3 bg-zinc-900/40 p-1.5 px-3 rounded-2xl border border-zinc-800 transition-all">
          <div>
            <p className="text-sm font-bold text-white">
              {currentUser.name}
            </p>
            <p className="text-[10px] font-mono text-volt uppercase tracking-wider font-semibold">
              {currentUser.email}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-volt shrink-0 bg-zinc-800 relative group">
            <img
              src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setIsProfileOpen(true)}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Edit Profile"
            >
              <Pencil size={14} className="text-volt" />
            </button>
          </div>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-volt border border-[#27272a] hover:border-volt/30 rounded-lg cursor-pointer transition-all"
            title="Edit Profile"
          >
            <Pencil size={12} />
          </button>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-1.5 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-volt rounded-full border border-[#27272a] transition-colors flex items-center justify-center cursor-pointer"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-zinc-400 hover:text-volt p-1.5 bg-[#18181b] hover:bg-zinc-800 rounded-full border border-[#27272a] transition-colors relative cursor-pointer"
          >
            {hasUnreadChats && (
              <span className="w-1.5 h-1.5 rounded-full bg-volt absolute top-0.5 right-0.5 animate-pulse"></span>
            )}
            <Bell size={18} />
          </button>
          {renderNotificationsDropdown(false)}
        </div>

        <div className="w-[1px] h-6 bg-zinc-800"></div>

        <button
          onClick={onLogout}
          className="p-2 bg-[#18181b] hover:bg-rose-500/10 border border-[#27272a] text-zinc-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
          title="Secure Logout"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Profile Settings Camera Modal */}
      {isProfileOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[#18181b] border border-[#27272a] rounded-[24px] max-w-md w-full p-5 md:p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto text-left scrollbar-thin scrollbar-thumb-zinc-800">
            <div className="absolute top-0 inset-x-0 h-1 bg-volt" />
            
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-full cursor-pointer transition-all"
            >
              <X size={18} />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-volt/10 text-volt flex items-center justify-center shrink-0">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-base tracking-tight leading-tight">Edit Profile</h3>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Update photo and basic details</p>
                </div>
              </div>

              {/* Error messages if camera fails */}
              {cameraError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl font-medium leading-relaxed space-y-2">
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => document.getElementById("profile-mobile-camera-input")?.click()}
                    className="w-full py-2 bg-volt text-black hover:bg-[#a3e635] font-display font-black uppercase text-[10px] italic tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Camera size={12} />
                    <span>TAP TO SNAP NATIVE PHOTO 📸</span>
                  </button>
                </div>
              )}

              {/* Avatar Showcase & Live Feed container */}
              <div className="flex flex-col items-center justify-center py-3 bg-[#09090b]/80 rounded-2xl border border-zinc-800/80">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-volt/30 shadow-xl shadow-black/20 bg-zinc-900 flex items-center justify-center">
                  {isCameraActive ? (
                    <video 
                      id="profile-video-feed" 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : capturedImage ? (
                    <img 
                      src={capturedImage} 
                      alt="Captured Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                      alt="Current Avatar" 
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Face overlay silhouette guide when camera is active */}
                  {isCameraActive && (
                    <div className="absolute inset-0 pointer-events-none border border-volt/40 rounded-full flex items-center justify-center">
                      <div className="w-[85%] h-[85%] border border-dashed border-volt/20 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold mt-3">
                  {isCameraActive ? "Align face inside circle" : capturedImage ? "Avatar preview" : "Current profile photo"}
                </p>
              </div>

              {/* Hidden File Input */}
              <input
                id="profile-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Hidden Mobile Native Camera Input */}
              <input
                id="profile-mobile-camera-input"
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Dynamic Camera Control Options */}
              <div className="space-y-3">
                {!isCameraActive && !capturedImage && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="py-2.5 bg-[#18181b] hover:bg-zinc-800 text-white border border-zinc-800 hover:border-volt/30 font-display font-black uppercase text-[10px] italic tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Video size={13} className="text-volt" />
                      <span>CAMERA ⚡</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => document.getElementById("profile-file-input")?.click()}
                      className="py-2.5 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-[10px] italic tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-volt/10"
                    >
                      <Upload size={13} />
                      <span>CHOOSE 📁</span>
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="flex gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-2 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-xs italic tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-volt/15"
                    >
                      <Camera size={14} className="animate-pulse" />
                      <span>TAKE SNAPSHOT 📸</span>
                    </button>
                  </div>
                )}

                {capturedImage && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedImage(null);
                        stopCamera();
                      }}
                      className="px-6 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                    >
                      Reset Photo 🔄
                    </button>
                  </div>
                )}
              </div>

              {/* Form fields for editing details */}
              <div className="space-y-4 pt-2 border-t border-zinc-800/80">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 focus:border-volt rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-sans"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 focus:border-volt rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-sans"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {currentUser.role === "OWNER" && (
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1.5">
                      Gym Name
                    </label>
                    <input
                      type="text"
                      value={editGymName}
                      onChange={(e) => setEditGymName(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800 focus:border-volt rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-sans"
                      placeholder="Enter custom gym name"
                    />
                  </div>
                )}

                {currentUser.role === "TRAINER" && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1.5">
                        Specialty Focus
                      </label>
                      <input
                        type="text"
                        value={editSpecialty}
                        onChange={(e) => setEditSpecialty(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 focus:border-volt rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-sans"
                        placeholder="e.g. Strength, Nutrition, Weight Loss"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1.5">
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        value={editExperience}
                        onChange={(e) => setEditExperience(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 focus:border-volt rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-sans"
                        placeholder="e.g. 5 Years"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1.5">
                        Coach Biography (Bio)
                      </label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full bg-[#09090b] border border-zinc-800 focus:border-volt rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-sans min-h-[70px] max-h-[140px]"
                        placeholder="Share your passion, credentials, and coaching style..."
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons for whole profile */}
              <div className="pt-2 border-t border-zinc-800/80 flex gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 py-2.5 bg-volt hover:bg-lime-300 text-black font-display font-black uppercase text-xs italic tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-volt/15"
                >
                  <Check size={15} />
                  <span>SAVE CHANGES ⚡</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
