import React, { useState, useEffect } from "react";
import { 
  Shield, User, MessageSquare, Dumbbell, Zap, Gift, 
  RefreshCw, Layers, Search, Award, Briefcase, LogOut, Palette, Sliders
} from "lucide-react";
import { KineticDatabase } from "./db";
import { Client, JobPosting, ClientAssessment, ChatMessage, GymOffer, Trainer, User as UserType } from "./types";
import { compressImage } from "./utils/image";
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import Header from "./components/Header";
import TrainerDashboard from "./components/TrainerDashboard";
import ClientRoutine from "./components/ClientRoutine";
import CardioFuel from "./components/CardioFuel";
import OfferWall from "./components/OfferWall";
import ChatRoom from "./components/ChatRoom";
import AuthScreen from "./components/AuthScreen";
import OwnerDashboard from "./components/OwnerDashboard";
import TrainerLinking from "./components/TrainerLinking";
import { motion, AnimatePresence } from "motion/react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";

type ClientTab = "ROUTINE" | "CARDIO" | "OFFERS" | "CHAT" | "COACH";
type TrainerTab = "DASHBOARD" | "CHAT";

const cleanFirestoreData = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData);
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    });
    return cleaned;
  }
  return obj;
};

export default function App() {
  // Authentication & Global DB states
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [assessments, setAssessments] = useState<ClientAssessment[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [offers, setOffers] = useState<GymOffer[]>([]);

  // Active view states
  const [activeClientIndex, setActiveClientIndex] = useState<number>(0);
  const [clientTab, setClientTab] = useState<ClientTab>("ROUTINE");
  const [trainerTab, setTrainerTab] = useState<TrainerTab>("DASHBOARD");
  const [ownerTab, setOwnerTab] = useState<"DASHBOARD" | "CHAT">("DASHBOARD");
  const [showResetModal, setShowResetModal] = useState(false);
  const [hasUnreadChats, setHasUnreadChats] = useState(false);

  // Clear unread chats flag when entering chat tab
  useEffect(() => {
    const inChat = currentUser?.role === "OWNER" 
      ? ownerTab === "CHAT" 
      : currentUser?.role === "TRAINER" 
        ? trainerTab === "CHAT" 
        : currentUser?.role === "CLIENT" 
          ? clientTab === "CHAT" 
          : false;
          
    if (inChat) {
      setHasUnreadChats(false);
    }
  }, [ownerTab, trainerTab, clientTab, currentUser]);

  // Push notifications state
  const [activePushToast, setActivePushToast] = useState<{ id: string; title: string; text: string } | null>(null);

  const isLoadedRef = React.useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gym-buddy-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  // Sync theme class to document body & html
  useEffect(() => {
    localStorage.setItem("gym-buddy-theme", theme);
    const root = document.documentElement;
    const body = document.body;
    if (theme === "light") {
      root.classList.add("light");
      body.classList.add("light");
    } else {
      root.classList.remove("light");
      body.classList.remove("light");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Load database on mount from Local Storage
  useEffect(() => {
    const initLocalData = () => {
      const loadedUser = KineticDatabase.getCurrentUser();
      setCurrentUser(loadedUser);

      const localClients = KineticDatabase.getClients();
      setClients(localClients);

      const localTrainers = KineticDatabase.getTrainers();
      setTrainers(localTrainers);

      const localJobs = KineticDatabase.getJobs();
      setJobPostings(localJobs);

      const localAssessments = KineticDatabase.getAssessments();
      setAssessments(localAssessments);

      const localUsers = KineticDatabase.getUsers();
      setUsers(localUsers);

      setOffers(KineticDatabase.getOffers());
      setChats(KineticDatabase.getChats());

      if (loadedUser && loadedUser.role === "CLIENT" && loadedUser.clientId) {
        const idx = localClients.findIndex(c => c.id === loadedUser.clientId);
        if (idx !== -1) {
          setActiveClientIndex(idx);
        }
      }

      // Asynchronously heal any bloated avatar URLs from previous non-compressed uploads
      const selfHealBloatedData = async (
        currentUsers: UserType[],
        currentClients: Client[],
        currentTrainers: Trainer[]
      ) => {
        let usersChanged = false;
        let clientsChanged = false;
        let trainersChanged = false;

        const healedUsers = await Promise.all(
          currentUsers.map(async (u) => {
            if (u.avatarUrl && u.avatarUrl.startsWith("data:image/") && u.avatarUrl.length > 30000) {
              try {
                const comp = await compressImage(u.avatarUrl);
                usersChanged = true;
                return { ...u, avatarUrl: comp };
              } catch (e) {
                console.error("Failed to self-heal user avatar:", e);
              }
            }
            return u;
          })
        );

        const healedClients = await Promise.all(
          currentClients.map(async (c) => {
            if (c.avatarUrl && c.avatarUrl.startsWith("data:image/") && c.avatarUrl.length > 30000) {
              try {
                const comp = await compressImage(c.avatarUrl);
                clientsChanged = true;
                return { ...c, avatarUrl: comp };
              } catch (e) {
                console.error("Failed to self-heal client avatar:", e);
              }
            }
            return c;
          })
        );

        const healedTrainers = await Promise.all(
          currentTrainers.map(async (t) => {
            if (t.avatarUrl && t.avatarUrl.startsWith("data:image/") && t.avatarUrl.length > 30000) {
              try {
                const comp = await compressImage(t.avatarUrl);
                trainersChanged = true;
                return { ...t, avatarUrl: comp };
              } catch (e) {
                console.error("Failed to self-heal trainer avatar:", e);
              }
            }
            return t;
          })
        );

        if (usersChanged) {
          KineticDatabase.saveUsers(healedUsers);
          setUsers(healedUsers);
          if (loadedUser) {
            const match = healedUsers.find(u => u.id === loadedUser.id);
            if (match) {
              KineticDatabase.setCurrentUser(match);
              setCurrentUser(match);
            }
          }
        }
        if (clientsChanged) {
          KineticDatabase.saveClients(healedClients);
          setClients(healedClients);
        }
        if (trainersChanged) {
          KineticDatabase.saveTrainers(healedTrainers);
          setTrainers(healedTrainers);
        }
      };

      selfHealBloatedData(localUsers, localClients, localTrainers);
    };

    initLocalData();
  }, []);

  // Configure native device settings (StatusBar and Keyboard) on mount
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch((err) => {
        console.warn("StatusBar style configure error:", err);
      });
      StatusBar.setBackgroundColor({ color: "#09090b" }).catch((err) => {
        console.warn("StatusBar color configure error:", err);
      });
      Keyboard.setScroll({ isDisabled: false }).catch((err) => {
        console.warn("Keyboard setScroll configure error:", err);
      });
    }
  }, []);

  // Process cloud-reset and cloud-seeding flags on startup
  useEffect(() => {
    const handleFlags = async () => {
      const forceSeed = localStorage.getItem("force_cloud_seed");
      const forceReset = localStorage.getItem("force_cloud_reset");

      if (forceReset === "true") {
        localStorage.removeItem("force_cloud_reset");
        const collections = ["users", "clients", "trainers", "jobs", "assessments", "offers", "chats"];
        for (const col of collections) {
          try {
            const snap = await getDocs(collection(db, col));
            snap.forEach((docSnap) => {
              deleteDoc(doc(db, col, docSnap.id)).catch(err => console.error("Error deleting doc on reset:", err));
            });
          } catch (e) {
            console.error("Failed to reset collection:", col, e);
          }
        }
      } else if (forceSeed === "true") {
        localStorage.removeItem("force_cloud_seed");
        try {
          // Clear all collections first to prevent stale cloud data from merging
          const collections = ["users", "clients", "trainers", "jobs", "assessments", "offers", "chats"];
          for (const col of collections) {
            const snap = await getDocs(collection(db, col));
            for (const docSnap of snap.docs) {
              await deleteDoc(doc(db, col, docSnap.id));
            }
          }

          const localUsers = KineticDatabase.getUsers();
          for (const u of localUsers) {
            await setDoc(doc(db, "users", u.id), u);
          }

          const localClients = KineticDatabase.getClients();
          for (const c of localClients) {
            await setDoc(doc(db, "clients", c.id), c);
          }

          const localTrainers = KineticDatabase.getTrainers();
          for (const t of localTrainers) {
            await setDoc(doc(db, "trainers", t.id), t);
          }

          const localJobs = KineticDatabase.getJobs();
          for (const j of localJobs) {
            await setDoc(doc(db, "jobs", j.id), j);
          }

          const localAssessments = KineticDatabase.getAssessments();
          for (const a of localAssessments) {
            await setDoc(doc(db, "assessments", a.id), a);
          }

          const localOffers = KineticDatabase.getOffers();
          for (const o of localOffers) {
            await setDoc(doc(db, "offers", o.id), o);
          }

          const localChats = KineticDatabase.getChats();
          for (const ch of localChats) {
            await setDoc(doc(db, "chats", ch.id), ch);
          }
        } catch (e) {
          console.error("Failed to force seed cloud:", e);
        }
      }
    };

    handleFlags();
  }, []);

  const currentUserRef = React.useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Real-time synchronization of Users collection with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const fetched: UserType[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as UserType);
        });

        if (fetched.length === 0) {
          const local = KineticDatabase.getUsers();
          if (local.length > 0) {
            local.forEach((item) => {
              setDoc(doc(db, "users", item.id), cleanFirestoreData(item)).catch(err => console.error("Error seeding user:", err));
            });
          }
        } else {
          setUsers(fetched);
          KineticDatabase.saveUsers(fetched);
          if (currentUserRef.current) {
            const updatedSelf = fetched.find(u => u.id === currentUserRef.current?.id);
            if (updatedSelf && JSON.stringify(updatedSelf) !== JSON.stringify(currentUserRef.current)) {
              setCurrentUser(updatedSelf);
              KineticDatabase.setCurrentUser(updatedSelf);
            }
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "users");
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync Firebase authenticated user session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && !currentUserRef.current) {
        try {
          const userDocSnap = await getDoc(doc(db, "users", fbUser.uid));
          if (userDocSnap.exists()) {
            const profile = { id: userDocSnap.id, ...userDocSnap.data() } as UserType;
            setCurrentUser(profile);
            KineticDatabase.setCurrentUser(profile);
          }
        } catch (e) {
          console.warn("Auth state sync check error:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Clients collection with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "clients"),
      (snapshot) => {
        const fetched: Client[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Client);
        });

        if (fetched.length === 0) {
          const local = KineticDatabase.getClients();
          if (local.length > 0) {
            local.forEach((item) => {
              setDoc(doc(db, "clients", item.id), cleanFirestoreData(item)).catch(err => console.error("Error seeding client:", err));
            });
          }
        } else {
          // Smart merge: Keep the history and updates from whichever client record is richer or has more history entries
          const local = KineticDatabase.getClients();
          const merged = fetched.map(cloudClient => {
            const localClient = local.find(l => l.id === cloudClient.id);
            if (!localClient) return cloudClient;

            const cloudHistoryLen = cloudClient.history?.length || 0;
            const localHistoryLen = localClient.history?.length || 0;

            if (localHistoryLen > cloudHistoryLen) {
              setDoc(doc(db, "clients", localClient.id), cleanFirestoreData(localClient)).catch(err => {
                console.error("Failed to sync richer local client to cloud:", err);
              });
              return localClient;
            }
            return cloudClient;
          });

          local.forEach(localClient => {
            if (!fetched.some(f => f.id === localClient.id)) {
              setDoc(doc(db, "clients", localClient.id), cleanFirestoreData(localClient)).catch(err => {
                console.error("Failed to upload local-only client:", err);
              });
              merged.push(localClient);
            }
          });

          setClients(merged);
          KineticDatabase.saveClients(merged);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "clients");
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Trainers collection with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "trainers"),
      (snapshot) => {
        const fetched: Trainer[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Trainer);
        });

        if (fetched.length === 0) {
          const local = KineticDatabase.getTrainers();
          if (local.length > 0) {
            local.forEach((item) => {
              setDoc(doc(db, "trainers", item.id), cleanFirestoreData(item)).catch(err => console.error("Error seeding trainer:", err));
            });
          }
        } else {
          setTrainers(fetched);
          KineticDatabase.saveTrainers(fetched);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "trainers");
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Job Postings with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "jobs"),
      (snapshot) => {
        const fetched: JobPosting[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as JobPosting);
        });

        if (fetched.length === 0) {
          const local = KineticDatabase.getJobs();
          if (local.length > 0) {
            local.forEach((item) => {
              setDoc(doc(db, "jobs", item.id), item).catch(err => console.error("Error seeding job:", err));
            });
          }
        } else {
          setJobPostings(fetched);
          KineticDatabase.saveJobs(fetched);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "jobs");
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Client Assessments with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "assessments"),
      (snapshot) => {
        const fetched: ClientAssessment[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as ClientAssessment);
        });

        if (fetched.length === 0) {
          const local = KineticDatabase.getAssessments();
          if (local.length > 0) {
            local.forEach((item) => {
              setDoc(doc(db, "assessments", item.id), item).catch(err => console.error("Error seeding assessment:", err));
            });
          }
        } else {
          setAssessments(fetched);
          KineticDatabase.saveAssessments(fetched);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "assessments");
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Offers collection with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "offers"),
      (snapshot) => {
        const fetched: GymOffer[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as GymOffer);
        });

        if (fetched.length === 0) {
          const local = KineticDatabase.getOffers();
          if (local.length > 0) {
            local.forEach((item) => {
              setDoc(doc(db, "offers", item.id), item).catch(err => console.error("Error seeding offer:", err));
            });
          }
        } else {
          setOffers(fetched);
          KineticDatabase.saveOffers(fetched);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "offers");
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of chats via Firestore
  useEffect(() => {
    if (!currentUser) return;

    const inChat = currentUser?.role === "OWNER" 
      ? ownerTab === "CHAT" 
      : currentUser?.role === "TRAINER" 
        ? trainerTab === "CHAT" 
        : currentUser?.role === "CLIENT" 
          ? clientTab === "CHAT" 
          : false;

    const chatsRef = collection(db, "chats");
    const unsubscribe = onSnapshot(
      chatsRef,
      (snapshot) => {
        const fetchedChats: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedChats.push({
            id: docSnap.id,
            senderId: data.senderId || "",
            senderName: data.senderName || "",
            recipientId: data.recipientId || "",
            text: data.text || "",
            timestamp: data.timestamp || "",
            createdAt: data.createdAt || 0,
          } as ChatMessage);
        });

        // Sort them by createdAt so they appear in correct chronological order
        fetchedChats.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        // If there are no chats in Firestore yet, we can seed them from INITIAL_CHATS
        if (fetchedChats.length === 0) {
          const localChats = KineticDatabase.getChats();
          localChats.forEach(async (msg, index) => {
            try {
              const msgId = msg.id || `m_init_${index}`;
              await setDoc(doc(db, "chats", msgId), {
                senderId: msg.senderId,
                senderName: msg.senderName,
                recipientId: msg.recipientId,
                text: msg.text,
                timestamp: msg.timestamp,
                createdAt: Date.now() - (localChats.length - index) * 60000,
              });
            } catch (err) {
              console.error("Failed to seed chat to Firestore:", err);
            }
          });
        } else {
          // Check if there are new messages sent by others
          // A message is considered "new" if it was created in the last 15 seconds
          const lastMsg = fetchedChats[fetchedChats.length - 1];

          // Map current user to their chat sender ID
          let myChatSenderId = currentUser.id;
          if (currentUser.role === "OWNER") {
            myChatSenderId = "owner";
          } else if (currentUser.role === "TRAINER") {
            myChatSenderId = currentUser.trainerId || "";
          } else if (currentUser.role === "CLIENT") {
            myChatSenderId = currentUser.clientId || "";
          }

          if (
            lastMsg &&
            lastMsg.senderId !== myChatSenderId &&
            lastMsg.createdAt &&
            lastMsg.createdAt > Date.now() - 15000
          ) {
            if (!inChat) {
              setHasUnreadChats(true);
              if (isLoadedRef.current) {
                setActivePushToast({
                  id: lastMsg.id,
                  title: `💬 MESSAGE FROM ${lastMsg.senderName.toUpperCase()}`,
                  text: lastMsg.text
                });
              }
            }
          }

          setChats(fetchedChats);
          KineticDatabase.saveChats(fetchedChats);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "chats");
      }
    );

    return () => unsubscribe();
  }, [currentUser, ownerTab, trainerTab, clientTab]);

  // Sync index when currentUser updates
  useEffect(() => {
    if (currentUser && currentUser.role === "CLIENT" && currentUser.clientId) {
      const idx = clients.findIndex(c => c.id === currentUser.clientId);
      if (idx !== -1) {
        setActiveClientIndex(idx);
      }
    }
  }, [currentUser, clients]);

  const activeClient = clients[activeClientIndex];

  // Listen for new gym offers automatically
  const [lastOfferCount, setLastOfferCount] = useState<number>(0);
  useEffect(() => {
    if (offers.length > 0) {
      if (lastOfferCount > 0 && offers.length > lastOfferCount) {
        const latestOffer = offers[0];
        if (isLoadedRef.current) {
          setActivePushToast({
            id: `offer_${Date.now()}`,
            title: `🎁 NEW SPECIAL OFFER: ${latestOffer.title}`,
            text: latestOffer.subtitle
          });
        }
      }
      setLastOfferCount(offers.length);
    }
  }, [offers, lastOfferCount]);

  // Listen for Client specific events automatically
  const [prevClientState, setPrevClientState] = useState<Client | null>(null);
  useEffect(() => {
    if (currentUser?.role === "CLIENT" && activeClient) {
      if (prevClientState) {
        // 1. Check if workout plan changed
        if (JSON.stringify(activeClient.workoutPlan) !== JSON.stringify(prevClientState.workoutPlan)) {
          if (isLoadedRef.current) {
            setActivePushToast({
              id: `workout_${Date.now()}`,
              title: "⚡ WORKOUT ROUTINE UPDATED",
              text: `Your daily lift sheet "${activeClient.workoutPlan?.title || "Routine"}" has been updated by your trainer.`
            });
          }
        }
        // 2. Check if trainer status changed
        if (activeClient.linkedTrainerStatus !== prevClientState.linkedTrainerStatus) {
          if (activeClient.linkedTrainerStatus === "approved") {
            const trainerName = trainers.find(t => t.id === activeClient.linkedTrainerId)?.name || "Trainer";
            if (isLoadedRef.current) {
              setActivePushToast({
                id: `trainer_${Date.now()}`,
                title: "🤝 COACH CONNECTION APPROVED",
                text: `Congratulations! ${trainerName} is now your official personal trainer.`
              });
            }
          }
        }
      }
      setPrevClientState(activeClient);
    }
  }, [activeClient, currentUser, trainers, prevClientState]);

  // LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase sign out error:", e);
    }
    KineticDatabase.setCurrentUser(null);
    setCurrentUser(null);
    // Reset view tabs
    setClientTab("ROUTINE");
    setTrainerTab("DASHBOARD");
  };

  const handleUpdateProfile = (updatedUser: UserType) => {
    const oldGymName = currentUser?.gymName;
    setCurrentUser(updatedUser);
    KineticDatabase.setCurrentUser(updatedUser);
    
    const currentUsers = KineticDatabase.getUsers();
    const updatedUsers = currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    KineticDatabase.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    try {
      const firebaseUser = { ...updatedUser };
      Object.keys(firebaseUser).forEach(key => {
        if (firebaseUser[key as keyof UserType] === undefined) {
          delete firebaseUser[key as keyof UserType];
        }
      });

      setDoc(doc(db, "users", updatedUser.id), firebaseUser).catch(err => {
        console.error("Async user sync to Firestore failed during profile update:", err);
      });
    } catch (e) {
      console.error("Firestore user write error:", e);
    }

    // If owner changes gym name, sync it for all other users, clients, and trainers
    if (updatedUser.role === "OWNER") {
      const newGymName = updatedUser.gymName;
      if (newGymName && newGymName !== oldGymName) {
        // Sync other users
        const otherUsers = updatedUsers.filter(u => u.id !== updatedUser.id);
        otherUsers.forEach(u => {
          const updatedOtherUser = { ...u, gymName: newGymName };
          setDoc(doc(db, "users", u.id), updatedOtherUser).catch(err => {
            console.error("Failed to sync user gym name to Firestore:", err);
          });
        });
        
        // Sync clients
        const currentClients = KineticDatabase.getClients();
        const updatedClients = currentClients.map(c => {
          const updatedClient = { ...c, gymName: newGymName };
          setDoc(doc(db, "clients", c.id), updatedClient).catch(err => {
            console.error("Failed to sync client gym name to Firestore:", err);
          });
          return updatedClient;
        });
        KineticDatabase.saveClients(updatedClients);
        setClients(updatedClients);

        // Sync trainers
        const currentTrainers = KineticDatabase.getTrainers();
        const updatedTrainers = currentTrainers.map(t => {
          const updatedTrainer = { ...t, gymName: newGymName };
          setDoc(doc(db, "trainers", t.id), updatedTrainer).catch(err => {
            console.error("Failed to sync trainer gym name to Firestore:", err);
          });
          return updatedTrainer;
        });
        KineticDatabase.saveTrainers(updatedTrainers);
        setTrainers(updatedTrainers);
      }
    }

    // Synchronize trainer table if user has a trainer role
    if (updatedUser.role === "TRAINER" && updatedUser.trainerId) {
      const currentTrainers = KineticDatabase.getTrainers();
      const updatedTrainers = currentTrainers.map(t => {
        if (t.id === updatedUser.trainerId) {
          return {
            ...t,
            name: updatedUser.name,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatarUrl,
            specialty: updatedUser.specialty || t.specialty,
            experience: updatedUser.experience || t.experience,
            bio: updatedUser.bio || t.bio,
            gymName: updatedUser.gymName || t.gymName,
          };
        }
        return t;
      });
      KineticDatabase.saveTrainers(updatedTrainers);
      setTrainers(updatedTrainers);

      const matchedTrainer = updatedTrainers.find(t => t.id === updatedUser.trainerId);
      if (matchedTrainer) {
        try {
          const firebaseTrainer = { ...matchedTrainer };
          Object.keys(firebaseTrainer).forEach(key => {
            if (firebaseTrainer[key as keyof Trainer] === undefined) {
              delete firebaseTrainer[key as keyof Trainer];
            }
          });

          setDoc(doc(db, "trainers", updatedUser.trainerId), firebaseTrainer).catch(err => {
            console.error("Async trainer sync to Firestore failed during profile update:", err);
          });
        } catch (e) {
          console.error("Firestore trainer write error:", e);
        }
      }
    }

    // Synchronize client table if user has a client role
    if (updatedUser.role === "CLIENT" && updatedUser.clientId) {
      const currentClients = KineticDatabase.getClients();
      const updatedClients = currentClients.map(c => {
        if (c.id === updatedUser.clientId) {
          return {
            ...c,
            name: updatedUser.name,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatarUrl,
            gymName: updatedUser.gymName || c.gymName,
          };
        }
        return c;
      });
      KineticDatabase.saveClients(updatedClients);
      setClients(updatedClients);

      const matchedClient = updatedClients.find(c => c.id === updatedUser.clientId);
      if (matchedClient) {
        try {
          const firebaseClient = { ...matchedClient };
          Object.keys(firebaseClient).forEach(key => {
            if (firebaseClient[key as keyof Client] === undefined) {
              delete firebaseClient[key as keyof Client];
            }
          });

          setDoc(doc(db, "clients", updatedUser.clientId), firebaseClient).catch(err => {
            console.error("Async client sync to Firestore failed during profile update:", err);
          });
        } catch (e) {
          console.error("Firestore client write error:", e);
        }
      }
    }
  };

  // CLIENT CRUD UPDATE COUPLING
  const handleUpdateClients = (updated: Client[]) => {
    const removed = clients.filter(c => !updated.some(u => u.id === c.id));
    setClients(updated);
    KineticDatabase.saveClients(updated);

    try {
      updated.forEach((client) => {
        setDoc(doc(db, "clients", client.id), cleanFirestoreData(client)).catch(err => {
          console.error(`Async client sync failed for client ${client.id}:`, err);
        });
      });
      removed.forEach((client) => {
        deleteDoc(doc(db, "clients", client.id)).catch(err => {
          console.error(`Async client delete failed for client ${client.id}:`, err);
        });
      });
    } catch (e) {
      console.error("Firestore clients batch write error:", e);
    }
  };

  const handleUpdateActiveClient = (updatedActive: Client) => {
    const updated = [...clients];
    const idx = clients.findIndex(c => c.id === updatedActive.id);
    if (idx !== -1) {
      updated[idx] = updatedActive;
      setClients(updated);
      KineticDatabase.saveClients(updated);

      try {
        setDoc(doc(db, "clients", updatedActive.id), cleanFirestoreData(updatedActive)).catch(err => {
          console.error(`Async active client sync failed for client ${updatedActive.id}:`, err);
        });
      } catch (e) {
        console.error("Firestore active client write error:", e);
      }
    }
  };

  // COACH APPLICATIONS & LISTING COUPLING
  const handleUpdateTrainers = (updated: Trainer[]) => {
    const removed = trainers.filter(t => !updated.some(u => u.id === t.id));
    setTrainers(updated);
    KineticDatabase.saveTrainers(updated);

    try {
      updated.forEach((trainer) => {
        setDoc(doc(db, "trainers", trainer.id), cleanFirestoreData(trainer)).catch(err => {
          console.error(`Async trainer sync failed for trainer ${trainer.id}:`, err);
        });
      });
      removed.forEach((trainer) => {
        deleteDoc(doc(db, "trainers", trainer.id)).catch(err => {
          console.error(`Async trainer delete failed for trainer ${trainer.id}:`, err);
        });
      });
    } catch (e) {
      console.error("Firestore trainers batch write error:", e);
    }
  };

  const handleUpdateUsers = (updated: UserType[]) => {
    const removed = users.filter(usr => !updated.some(u => u.id === usr.id));
    setUsers(updated);
    KineticDatabase.saveUsers(updated);

    try {
      updated.forEach((user) => {
        setDoc(doc(db, "users", user.id), user).catch(err => {
          console.error(`Async user sync failed for user ${user.id}:`, err);
        });
      });
      removed.forEach((user) => {
        deleteDoc(doc(db, "users", user.id)).catch(err => {
          console.error(`Async user delete failed for user ${user.id}:`, err);
        });
      });
    } catch (e) {
      console.error("Firestore users batch write error:", e);
    }
  };

  const handleAddJob = (job: JobPosting) => {
    const next = [job, ...jobPostings];
    setJobPostings(next);
    KineticDatabase.saveJobs(next);

    try {
      setDoc(doc(db, "jobs", job.id), job).catch(err => {
        console.error(`Async job sync failed for job ${job.id}:`, err);
      });
    } catch (e) {
      console.error("Firestore job write error:", e);
    }
  };

  const handleDeleteJob = (id: string) => {
    const next = jobPostings.filter(j => j.id !== id);
    setJobPostings(next);
    KineticDatabase.saveJobs(next);

    try {
      deleteDoc(doc(db, "jobs", id)).catch(err => {
        console.error(`Async job deletion failed for job ${id}:`, err);
      });
    } catch (e) {
      console.error("Firestore job deletion error:", e);
    }
  };

  const handleUpdateJobs = (updated: JobPosting[]) => {
    const removed = jobPostings.filter(j => !updated.some(u => u.id === j.id));
    setJobPostings(updated);
    KineticDatabase.saveJobs(updated);

    try {
      updated.forEach((job) => {
        setDoc(doc(db, "jobs", job.id), job).catch(err => {
          console.error(`Async job sync failed for job ${job.id}:`, err);
        });
      });
      removed.forEach((job) => {
        deleteDoc(doc(db, "jobs", job.id)).catch(err => {
          console.error(`Async job delete failed for job ${job.id}:`, err);
        });
      });
    } catch (e) {
      console.error("Firestore jobs batch write error:", e);
    }
  };

  const handleAddOffer = (newOffer: GymOffer) => {
    const next = [newOffer, ...offers];
    setOffers(next);
    KineticDatabase.saveOffers(next);

    try {
      setDoc(doc(db, "offers", newOffer.id), newOffer).catch(err => {
        console.error(`Async offer sync failed for offer ${newOffer.id}:`, err);
      });
    } catch (e) {
      console.error("Firestore offer write error:", e);
    }
  };

  const handleDeleteOffer = (id: string) => {
    const next = offers.filter(o => o.id !== id);
    setOffers(next);
    KineticDatabase.saveOffers(next);

    try {
      deleteDoc(doc(db, "offers", id)).catch(err => {
        console.error(`Async offer deletion failed for offer ${id}:`, err);
      });
    } catch (e) {
      console.error("Firestore offer deletion error:", e);
    }
  };

  const handleUpdateOffers = (updated: GymOffer[]) => {
    const removed = offers.filter(o => !updated.some(u => u.id === o.id));
    setOffers(updated);
    KineticDatabase.saveOffers(updated);

    try {
      updated.forEach((offer) => {
        setDoc(doc(db, "offers", offer.id), offer).catch(err => {
          console.error(`Async offer sync failed for offer ${offer.id}:`, err);
        });
      });
      removed.forEach((offer) => {
        deleteDoc(doc(db, "offers", offer.id)).catch(err => {
          console.error(`Async offer delete failed for offer ${offer.id}:`, err);
        });
      });
    } catch (e) {
      console.error("Firestore offers batch write error:", e);
    }
  };

  // BIO-METRIC ASSESSMENTS
  const handleAddAssessment = (assessment: ClientAssessment) => {
    const next = [assessment, ...assessments];
    setAssessments(next);
    KineticDatabase.saveAssessments(next);

    try {
      setDoc(doc(db, "assessments", assessment.id), assessment).catch(err => {
        console.error(`Async assessment sync failed for assessment ${assessment.id}:`, err);
      });
    } catch (e) {
      console.error("Firestore assessment write error:", e);
    }
  };

  // SECURE CHATS with live Firestore and fallback local storage integration
  const handleAddChat = async (msg: ChatMessage) => {
    try {
      await setDoc(doc(db, "chats", msg.id), {
        senderId: msg.senderId,
        senderName: msg.senderName,
        recipientId: msg.recipientId,
        text: msg.text,
        timestamp: msg.timestamp,
        createdAt: msg.createdAt || Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${msg.id}`);
    }
  };

  // DISPATCH CONNECTIONS (Search & Requests)
  const handleSendLinkingRequest = (trainerId: string) => {
    if (!currentUser || !currentUser.clientId) return;
    const updated = clients.map(c => {
      if (c.id === currentUser.clientId) {
        return {
          ...c,
          linkedTrainerId: trainerId,
          linkedTrainerStatus: "pending" as const
        };
      }
      return c;
    });
    handleUpdateClients(updated);
  };

  const handleCancelLinkingRequest = () => {
    if (!currentUser || !currentUser.clientId) return;
    const updated = clients.map(c => {
      if (c.id === currentUser.clientId) {
        return {
          ...c,
          linkedTrainerId: null,
          linkedTrainerStatus: "none" as const
        };
      }
      return c;
    });
    handleUpdateClients(updated);
  };

  const handleDisconnectTrainer = () => {
    if (!currentUser || !currentUser.clientId) return;
    const updated = clients.map(c => {
      if (c.id === currentUser.clientId) {
        return {
          ...c,
          linkedTrainerId: null,
          linkedTrainerStatus: "none" as const
        };
      }
      return c;
    });
    handleUpdateClients(updated);
  };

  const handleSelectClientById = (id: string) => {
    const idx = clients.findIndex(c => c.id === id);
    if (idx !== -1) {
      setActiveClientIndex(idx);
    }
  };

  const handleNavigateToChat = () => {
    if (currentUser?.role === "OWNER") {
      setOwnerTab("CHAT");
    } else if (currentUser?.role === "TRAINER") {
      setTrainerTab("CHAT");
    } else if (currentUser?.role === "CLIENT") {
      setClientTab("CHAT");
    }
  };

  // Resolve active gym name across all portals (reverting default if owner set custom gym name)
  const activeGymName = (() => {
    const ownerUser = users.find(u => u.role === "OWNER");
    if (ownerUser?.gymName) {
      return ownerUser.gymName;
    }
    return currentUser?.gymName || "Kinetic Performance";
  })();

  // AUTHENTICATION OVERLAY CHECK
  if (!currentUser) {
    return (
      <AuthScreen 
        onAuthSuccess={(user) => {
          KineticDatabase.setCurrentUser(user);
          setCurrentUser(user);
        }} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-volt selection:text-black transition-colors duration-300 ${theme === 'light' ? 'bg-[#f4f4f5] text-[#18181b]' : 'bg-[#09090b] text-[#fafafa]'}`}>
      {/* Dynamic Security Header */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onUpdateProfile={handleUpdateProfile}
        theme={theme} 
        onToggleTheme={handleToggleTheme} 
        gymName={activeGymName}
        chats={chats}
        hasUnreadChats={hasUnreadChats}
        onNavigateToChat={handleNavigateToChat}
        trainers={trainers}
      />

      {/* Viewport Core Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 pb-24 md:pb-8">
        
        {/* Responsive Desktop Sidebar Column */}
        <aside className="hidden md:flex flex-col justify-between w-64 bg-[#18181b] border border-[#27272a] p-5 shrink-0 rounded-3xl shadow-xl transition-all duration-300 hover:border-volt">
          <div className="space-y-6">
            <div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                NAVIGATION FEED
              </p>
              <h3 className="font-display text-lg font-black uppercase text-white italic">
                {currentUser.role === "OWNER" 
                  ? "OWNER PORTAL" 
                  : currentUser.role === "TRAINER" 
                  ? "COACH HUB" 
                  : "ATHLETE PORTAL"}
              </h3>
            </div>

            {/* OWNER NAVIGATION */}
            {currentUser.role === "OWNER" && (
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setOwnerTab("DASHBOARD")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    ownerTab === "DASHBOARD" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <Layers size={14} />
                  OWNER DASHBOARD
                </button>
                <button
                  onClick={() => setOwnerTab("CHAT")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    ownerTab === "CHAT" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <MessageSquare size={14} />
                    {hasUnreadChats && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-volt rounded-full border border-[#18181b] animate-pulse"></span>
                    )}
                  </div>
                  SYSTEM CHATS
                </button>
              </nav>
            )}

            {/* TRAINER NAVIGATION */}
            {currentUser.role === "TRAINER" && (
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setTrainerTab("DASHBOARD")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    trainerTab === "DASHBOARD" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <Layers size={14} />
                  COACH DASHBOARD
                </button>
                <button
                  onClick={() => setTrainerTab("CHAT")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    trainerTab === "CHAT" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <MessageSquare size={14} />
                    {hasUnreadChats && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-volt rounded-full border border-[#18181b] animate-pulse"></span>
                    )}
                  </div>
                  CLIENT CHAT
                </button>
              </nav>
            )}

            {/* CLIENT NAVIGATION */}
            {currentUser.role === "CLIENT" && activeClient && (
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setClientTab("ROUTINE")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    clientTab === "ROUTINE" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <Dumbbell size={14} />
                  LIFT SHEET
                </button>
                <button
                  onClick={() => setClientTab("CARDIO")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    clientTab === "CARDIO" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <Zap size={14} />
                  CARDIO & FUEL
                </button>
                <button
                  onClick={() => setClientTab("OFFERS")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    clientTab === "OFFERS" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <Gift size={14} />
                  OFFER WALL
                </button>
                <button
                  onClick={() => setClientTab("CHAT")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    clientTab === "CHAT" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <MessageSquare size={14} />
                    {hasUnreadChats && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-volt rounded-full border border-[#18181b] animate-pulse"></span>
                    )}
                  </div>
                  ASK TRAINER
                </button>
                <button
                  onClick={() => setClientTab("COACH")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    clientTab === "COACH" 
                      ? "bg-volt text-black font-black volt-glow" 
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <Search size={14} />
                  COACH DIRECTORY
                </button>
              </nav>
            )}
          </div>
        </aside>

        {/* Dynamic View Viewport Section */}
        <main className="flex-1 w-full min-w-0">
          {currentUser.role === "OWNER" ? (
            ownerTab === "DASHBOARD" ? (
              <OwnerDashboard
                clients={clients}
                onUpdateClients={handleUpdateClients}
                trainers={trainers}
                onUpdateTrainers={handleUpdateTrainers}
                users={users}
                onUpdateUsers={handleUpdateUsers}
                jobPostings={jobPostings}
                onAddJob={handleAddJob}
                onDeleteJob={handleDeleteJob}
                onUpdateJobs={handleUpdateJobs}
                offers={offers}
                onAddOffer={handleAddOffer}
                onDeleteOffer={handleDeleteOffer}
                onUpdateOffers={handleUpdateOffers}
                ownerGymName={currentUser.gymName}
              />
            ) : (
              <ChatRoom
                currentRole="OWNER"
                clients={clients}
                activeClient={activeClient}
                onSelectClient={handleSelectClientById}
                chats={chats}
                onAddMessage={handleAddChat}
                trainers={trainers}
                currentTrainerId="owner"
                gymName={activeGymName}
                users={users}
              />
            )
          ) : currentUser.role === "TRAINER" ? (
            trainerTab === "DASHBOARD" ? (
              <TrainerDashboard
                clients={clients}
                onUpdateClients={handleUpdateClients}
                jobPostings={jobPostings}
                onAddJob={handleAddJob}
                onDeleteJob={handleDeleteJob}
                assessments={assessments}
                onAddAssessment={handleAddAssessment}
                onViewClientRoutine={(clientId) => {
                  handleSelectClientById(clientId);
                }}
                currentTrainerId={currentUser.trainerId || "alex_volt"}
              />
            ) : (
              <ChatRoom
                currentRole="TRAINER"
                clients={clients}
                activeClient={activeClient}
                onSelectClient={handleSelectClientById}
                chats={chats}
                onAddMessage={handleAddChat}
                trainers={trainers}
                currentTrainerId={currentUser.trainerId || "alex_volt"}
                gymName={activeGymName}
                users={users}
              />
            )
          ) : (
            // CLIENT PORTAL TAB MULTIPLEXER
            activeClient ? (
              clientTab === "ROUTINE" ? (
                <ClientRoutine 
                  client={activeClient} 
                  onUpdateClient={handleUpdateActiveClient}
                  onNavigateToCoaches={() => setClientTab("COACH")}
                />
              ) : clientTab === "CARDIO" ? (
                <CardioFuel 
                  client={activeClient} 
                  onUpdateClient={handleUpdateActiveClient} 
                />
              ) : clientTab === "OFFERS" ? (
                <OfferWall 
                  client={activeClient} 
                  onUpdateClient={handleUpdateActiveClient} 
                  offers={offers}
                />
              ) : clientTab === "CHAT" ? (
                <ChatRoom
                  currentRole="CLIENT"
                  clients={clients}
                  activeClient={activeClient}
                  onSelectClient={handleSelectClientById}
                  chats={chats}
                  onAddMessage={handleAddChat}
                  trainers={trainers}
                  currentTrainerId="alex_volt"
                  onNavigateToCoaches={() => setClientTab("COACH")}
                  gymName={activeGymName}
                  users={users}
                />
              ) : (
                <TrainerLinking
                  client={activeClient}
                  trainers={trainers}
                  onSendRequest={handleSendLinkingRequest}
                  onCancelRequest={handleCancelLinkingRequest}
                  onDisconnect={handleDisconnectTrainer}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-[#18181b] border border-[#27272a] text-center rounded-3xl">
                <p className="font-mono text-sm text-zinc-400">Loading Client Profile telemetry...</p>
              </div>
            )
          )}
        </main>
      </div>

      {/* Floating Bottom Navigation Tab bar (Responsive Mobile Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/95 border-t border-zinc-800/90 h-[68px] pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center shadow-[0_-8px_30px_rgb(0,0,0,0.8)] backdrop-blur-xl px-2">
        {currentUser.role === "TRAINER" ? (
          <div className="grid grid-cols-2 w-full h-full items-center">
            <button
              onClick={() => setTrainerTab("DASHBOARD")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                trainerTab === "DASHBOARD" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all ${trainerTab === "DASHBOARD" ? "bg-volt/15 text-volt" : ""}`}>
                  <Layers size={20} />
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Dashboard
                </span>
                {trainerTab === "DASHBOARD" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
            <button
              onClick={() => setTrainerTab("CHAT")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                trainerTab === "CHAT" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all relative ${trainerTab === "CHAT" ? "bg-volt/15 text-volt" : ""}`}>
                  <MessageSquare size={20} />
                  {hasUnreadChats && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-volt rounded-full border-2 border-[#09090b] animate-pulse"></span>
                  )}
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Chat
                </span>
                {trainerTab === "CHAT" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
          </div>
        ) : currentUser.role === "CLIENT" ? (
          <div className="grid grid-cols-5 w-full h-full items-center">
            <button
              onClick={() => setClientTab("ROUTINE")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                clientTab === "ROUTINE" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all ${clientTab === "ROUTINE" ? "bg-volt/15 text-volt" : ""}`}>
                  <Dumbbell size={20} />
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Lift
                </span>
                {clientTab === "ROUTINE" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
            <button
              onClick={() => setClientTab("CARDIO")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                clientTab === "CARDIO" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all ${clientTab === "CARDIO" ? "bg-volt/15 text-volt" : ""}`}>
                  <Zap size={20} />
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Cardio
                </span>
                {clientTab === "CARDIO" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
            <button
              onClick={() => setClientTab("OFFERS")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                clientTab === "OFFERS" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all ${clientTab === "OFFERS" ? "bg-volt/15 text-volt" : ""}`}>
                  <Gift size={20} />
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Offers
                </span>
                {clientTab === "OFFERS" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
            <button
              onClick={() => setClientTab("CHAT")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                clientTab === "CHAT" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all relative ${clientTab === "CHAT" ? "bg-volt/15 text-volt" : ""}`}>
                  <MessageSquare size={20} />
                  {hasUnreadChats && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-volt rounded-full border-2 border-[#09090b] animate-pulse"></span>
                  )}
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Chat
                </span>
                {clientTab === "CHAT" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
            <button
              onClick={() => setClientTab("COACH")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                clientTab === "COACH" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all ${clientTab === "COACH" ? "bg-volt/15 text-volt" : ""}`}>
                  <Search size={20} />
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Coach
                </span>
                {clientTab === "COACH" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 w-full h-full items-center">
            <button
              onClick={() => setOwnerTab("DASHBOARD")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                ownerTab === "DASHBOARD" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all ${ownerTab === "DASHBOARD" ? "bg-volt/15 text-volt" : ""}`}>
                  <Layers size={20} />
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Director
                </span>
                {ownerTab === "DASHBOARD" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
            <button
              onClick={() => setOwnerTab("CHAT")}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer active:scale-95 touch-target ${
                ownerTab === "CHAT" ? "text-volt" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center relative">
                <div className={`p-1 rounded-xl transition-all relative ${ownerTab === "CHAT" ? "bg-volt/15 text-volt" : ""}`}>
                  <MessageSquare size={20} />
                  {hasUnreadChats && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-volt rounded-full border-2 border-[#09090b] animate-pulse"></span>
                  )}
                </div>
                <span className="text-[11px] font-sans font-bold tracking-tight mt-0.5">
                  Chat
                </span>
                {ownerTab === "CHAT" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-volt mt-0.5 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                )}
              </div>
            </button>
          </div>
        )}
      </nav>

      {/* Real-time Firebase Push Notification Toast Banner */}
      <AnimatePresence>
        {activePushToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto z-[120] bg-zinc-950/95 border border-volt/40 p-2.5 px-3.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] md:max-w-xs w-auto md:w-80 flex gap-2.5 items-center justify-between backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-volt/10 text-volt flex items-center justify-center shrink-0 border border-volt/20">
                <MessageSquare size={14} />
              </div>
              <div className="min-w-0">
                <h5 className="text-[11px] font-sans font-extrabold text-white uppercase tracking-wide truncate">{activePushToast.title}</h5>
                <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">{activePushToast.text}</p>
              </div>
            </div>
            <button 
              onClick={() => setActivePushToast(null)}
              className="text-zinc-500 hover:text-white cursor-pointer transition-colors shrink-0 text-base leading-none p-1"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
