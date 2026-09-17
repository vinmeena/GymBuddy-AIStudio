import React, { useState } from "react";
import { 
  Users, Shield, Briefcase, PlusCircle, Trash2, Check, X, FileText, 
  TrendingUp, Award, DollarSign, Calendar, Flame, AlertCircle, Plus,
  UserPlus, UserCheck, Star, RefreshCw, Edit, UserMinus, Share2, Mail, Phone,
  CreditCard, Tag, Copy, Printer, Search, CheckCircle2, Clock
} from "lucide-react";
import { Client, Trainer, JobPosting, GymOffer, User as UserType, PaymentInvoice } from "../types";

interface OwnerDashboardProps {
  clients: Client[];
  onUpdateClients: (updated: Client[]) => void;
  trainers: Trainer[];
  onUpdateTrainers: (updated: Trainer[]) => void;
  users: UserType[];
  onUpdateUsers: (updated: UserType[]) => void;
  jobPostings: JobPosting[];
  onAddJob: (job: JobPosting) => void;
  onDeleteJob: (id: string) => void;
  onUpdateJobs?: (updated: JobPosting[]) => void;
  offers: GymOffer[];
  onAddOffer: (offer: GymOffer) => void;
  onDeleteOffer: (id: string) => void;
  onUpdateOffers?: (updated: GymOffer[]) => void;
  ownerGymName?: string;
}

export default function OwnerDashboard({
  clients,
  onUpdateClients,
  trainers,
  onUpdateTrainers,
  users,
  onUpdateUsers,
  jobPostings,
  onAddJob,
  onDeleteJob,
  onUpdateJobs,
  offers,
  onAddOffer,
  onDeleteOffer,
  onUpdateOffers,
  ownerGymName = "Kinetic Performance"
}: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"APPLICATIONS" | "ROSTER" | "CLIENTS" | "JOBS" | "OFFERS" | "MEMBERSHIPS">("APPLICATIONS");
  
  // Registration success modal states
  const [successCreatedId, setSuccessCreatedId] = useState<string | null>(null);
  const [successCreatedName, setSuccessCreatedName] = useState<string>("");
  const [successCreatedRole, setSuccessCreatedRole] = useState<string>("");
  
  // Job modal states
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [gymName, setGymName] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobType, setJobType] = useState<"Full-Time" | "Part-Time" | "Contract">("Full-Time");
  const [jobDesc, setJobDesc] = useState("");
  const [jobContactEmail, setJobContactEmail] = useState("");
  const [jobContactPhone, setJobContactPhone] = useState("");

  // Offer modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerSubtitle, setOfferSubtitle] = useState("");
  const [offerTag, setOfferTag] = useState("");
  const [offerActionText, setOfferActionText] = useState("");
  const [offerImageUrl, setOfferImageUrl] = useState("");
  const [offerPromoCode, setOfferPromoCode] = useState("");
  const [offerDiscountPercent, setOfferDiscountPercent] = useState<number>(20);
  const [offerExpiresAt, setOfferExpiresAt] = useState("");
  const [offerIsActive, setOfferIsActive] = useState(true);

  // Add Client Modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientLevel, setClientLevel] = useState("Active Member");
  const [clientTier, setClientTier] = useState<"BASIC" | "PRO" | "ELITE">("PRO");
  const [clientPassword, setClientPassword] = useState("client123");
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");
  const [customClientCode, setCustomClientCode] = useState("");

  // Add Trainer Modal states
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [trainerEmail, setTrainerEmail] = useState("");
  const [trainerSpecialty, setTrainerSpecialty] = useState("Strength & Biomechanics");
  const [trainerExperience, setTrainerExperience] = useState("5+ Years");
  const [trainerBio, setTrainerBio] = useState("");
  const [trainerPassword, setTrainerPassword] = useState("trainer123");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [customTrainerCode, setCustomTrainerCode] = useState("");

  const generateRandomClientCode = (name: string) => {
    const base = name ? name.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 8) : "CLIENT";
    setCustomClientCode("KNT-" + base + Math.floor(100 + Math.random() * 900));
  };

  const generateRandomTrainerCode = (name: string) => {
    const base = name ? name.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 8) : "COACH";
    setCustomTrainerCode("KNT-" + base + Math.floor(100 + Math.random() * 900));
  };

  // Edit Trainer states
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [editTrainerName, setEditTrainerName] = useState("");
  const [editTrainerEmail, setEditTrainerEmail] = useState("");
  const [editTrainerSpecialty, setEditTrainerSpecialty] = useState("");
  const [editTrainerExperience, setEditTrainerExperience] = useState("");
  const [editTrainerBio, setEditTrainerBio] = useState("");
  const [editTrainerClientIds, setEditTrainerClientIds] = useState<string[]>([]);

  // Edit Client states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientEmail, setEditClientEmail] = useState("");
  const [editClientLevel, setEditClientLevel] = useState("");
  const [editClientTier, setEditClientTier] = useState<"BASIC" | "PRO" | "ELITE">("PRO");
  const [editClientTrainerId, setEditClientTrainerId] = useState("");

  // Edit Job states
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editGymName, setEditGymName] = useState("");
  const [editJobLocation, setEditJobLocation] = useState("");
  const [editJobSalary, setEditJobSalary] = useState("");
  const [editJobType, setEditJobType] = useState<"Full-Time" | "Part-Time" | "Contract">("Full-Time");
  const [editJobDesc, setEditJobDesc] = useState("");
  const [editJobContactEmail, setEditJobContactEmail] = useState("");
  const [editJobContactPhone, setEditJobContactPhone] = useState("");
  const [sharingJob, setSharingJob] = useState<JobPosting | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Edit Offer states
  const [editingOffer, setEditingOffer] = useState<GymOffer | null>(null);
  const [editOfferTitle, setEditOfferTitle] = useState("");
  const [editOfferSubtitle, setEditOfferSubtitle] = useState("");
  const [editOfferTag, setEditOfferTag] = useState("");
  const [editOfferActionText, setEditOfferActionText] = useState("");
  const [editOfferImageUrl, setEditOfferImageUrl] = useState("");
  const [editOfferPromoCode, setEditOfferPromoCode] = useState("");
  const [editOfferDiscountPercent, setEditOfferDiscountPercent] = useState<number>(20);
  const [editOfferExpiresAt, setEditOfferExpiresAt] = useState("");
  const [editOfferIsActive, setEditOfferIsActive] = useState(true);

  // Membership & Invoices Ledger States
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<PaymentInvoice | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(false);

  const pendingTrainers = trainers.filter(t => t.status === "pending");
  const approvedTrainers = trainers.filter(t => t.status === "approved");

  // Calculate projected revenue based on membership prices:
  // BASIC: 499, PRO: 1499, ELITE: 2999
  const totalRevenue = clients.reduce((acc, c) => {
    if (c.activeTier === "BASIC") return acc + 499;
    if (c.activeTier === "PRO") return acc + 1499;
    if (c.activeTier === "ELITE") return acc + 2999;
    return acc;
  }, 0);

  const handleApproveTrainer = (id: string) => {
    const updated = trainers.map(t => t.id === id ? { ...t, status: "approved" as const } : t);
    onUpdateTrainers(updated);
  };

  const handleDeclineTrainer = (id: string) => {
    const updated = trainers.filter(t => t.id !== id);
    onUpdateTrainers(updated);
  };

  // ADD TRAINER DIRECTLY BY OWNER
  const handleAddTrainerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerName || !trainerEmail) return;

    const trainerId = "trainer_" + Date.now();
    const generatedLoginId = (customTrainerCode.trim() || ("KNT-" + trainerName.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 8) + Math.floor(10 + Math.random() * 90))).toUpperCase();
    const newTrainer: Trainer = {
      id: trainerId,
      loginId: generatedLoginId,
      name: trainerName,
      email: trainerEmail,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(trainerName)}`,
      bio: trainerBio || "Certified performance and conditioning professional.",
      specialty: trainerSpecialty,
      experience: trainerExperience,
      status: "approved",
      gymName: ownerGymName
    };

    const newUser: UserType = {
      id: "user_" + Date.now(),
      loginId: generatedLoginId,
      email: trainerEmail,
      name: trainerName,
      role: "TRAINER",
      passwordPlain: "", // passwordless
      avatarUrl: newTrainer.avatarUrl,
      trainerId: trainerId,
      gymName: ownerGymName
    };

    onUpdateTrainers([...trainers, newTrainer]);
    onUpdateUsers([...users, newUser]);

    // Apply Client Assignments if selected
    if (selectedClientIds.length > 0) {
      const updatedClients = clients.map(c => {
        if (selectedClientIds.includes(c.id)) {
          return {
            ...c,
            linkedTrainerId: trainerId,
            linkedTrainerStatus: "approved" as const
          };
        }
        return c;
      });
      onUpdateClients(updatedClients);
    }

    // Save and show success ID
    setSuccessCreatedId(generatedLoginId);
    setSuccessCreatedName(trainerName);
    setSuccessCreatedRole("TRAINER");

    // reset state
    setTrainerName("");
    setTrainerEmail("");
    setTrainerBio("");
    setSelectedClientIds([]);
    setCustomTrainerCode("");
    setShowTrainerModal(false);
  };

  // REMOVE TRAINER DIRECTLY BY OWNER
  const handleRemoveTrainer = (trainerId: string) => {
    const updatedTrainers = trainers.filter(t => t.id !== trainerId);
    onUpdateTrainers(updatedTrainers);

    // Unlink clients
    const updatedClients = clients.map(c => {
      if (c.linkedTrainerId === trainerId) {
        return { ...c, linkedTrainerId: null, linkedTrainerStatus: "none" as const };
      }
      return c;
    });
    onUpdateClients(updatedClients);

    // Delete corresponding User
    const updatedUsers = users.filter(u => u.trainerId !== trainerId);
    onUpdateUsers(updatedUsers);
  };

  // ADD CLIENT DIRECTLY BY OWNER
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;

    const clientId = "client_" + Date.now();
    const generatedLoginId = (customClientCode.trim() || ("KNT-" + clientName.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 8) + Math.floor(10 + Math.random() * 90))).toUpperCase();
    const newClient: Client = {
      id: clientId,
      loginId: generatedLoginId,
      name: clientName,
      email: clientEmail,
      level: clientLevel,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(clientName)}`,
      activeTier: clientTier,
      hasPaidFee: true,
      linkedTrainerId: selectedTrainerId || null,
      linkedTrainerStatus: selectedTrainerId ? "approved" : "none",
      workoutPlan: {
        id: "w_" + clientId,
        title: "Adaptive Hypertrophy A",
        subtitle: "FULL BODY INTRO",
        durationMin: 60,
        targetKcal: 2200,
        date: "CREATED TODAY",
        exercises: [
          {
            id: "ex_bench_p",
            name: "Barbell Bench Press",
            category: "CHEST",
            type: "STRENGTH",
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBYHRcoQ6NmNZ_vvQkvFr3QMFl-elHT5WJk_bnUyp3Oh2M4cLGxbrpjxNHr0tX5w4Ctf05pR0YkWb2TewZ0oMpoHawNadvtxL3JJXqNRnMtgmyQgt1D6lKtDke1dZ1KnUwoMAlfEqW6TsjgniSSicd5b8F4o-HsqhGtW6Iwg49a35USXX27yVVbJlY-K0kwDabpYFszoAy0wFZTRnFPRlvVltJwkVPEleDoFrTJa8yKPqvNu3rDkjZF_BQsIKz7_IfsyG3DHiMpGg",
            sets: [{ setNumber: 1, previous: "N/A", weight: 60, reps: 10, completed: false }]
          }
        ]
      },
      dietPlan: {
        id: "d_" + clientId,
        date: "CREATED TODAY",
        macros: {
          protein: { current: 0, target: 160 },
          carbs: { current: 0, target: 220 },
          fats: { current: 0, target: 65 }
        },
        meals: [
          {
            id: "m_init_c",
            timeLabel: "MEAL 01: BREAKFAST",
            name: "Classic High Protein Oats",
            kcal: 450,
            proteinG: 30,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARFSuDo6nPufAt1gh6sc9Es0tGrefP1kcTenfAMTRm6V4_QpmFgl9B6L37rRb89h4Io6hlraA0q6SREICK7J9bLIRh3Q5yqG0KCIkq5GTKWHffa6c3fkdX76bxL3igZ-mUWvcg5fuvK7p7Z955nvhLTZ2nIMr1AGwreOHnVj6xDAcBq4OO_hEjZKv1fogcTBkqUXq5RiMu6sv1e4tvQwQyUSngjShIERry26r59IaixbuAEHXMtATb2YGs-AWJx91zmA49Dxnxs_M",
            completed: false
          }
        ]
      },
      supplements: [
        { id: "s_init_1", name: "Daily Multivitamin", timeLabel: "08:00 AM • 1 CAP", icon: "pill", completed: false }
      ],
      cardioLogs: [],
      gymName: ownerGymName
    };

    const newUser: UserType = {
      id: "user_" + Date.now(),
      loginId: generatedLoginId,
      email: clientEmail,
      name: clientName,
      role: "CLIENT",
      passwordPlain: "", // passwordless
      avatarUrl: newClient.avatarUrl,
      clientId: clientId,
      gymName: ownerGymName
    };

    onUpdateClients([...clients, newClient]);
    onUpdateUsers([...users, newUser]);

    // Save and show success ID
    setSuccessCreatedId(generatedLoginId);
    setSuccessCreatedName(clientName);
    setSuccessCreatedRole("CLIENT");

    // reset state
    setClientName("");
    setClientEmail("");
    setSelectedTrainerId("");
    setCustomClientCode("");
    setShowClientModal(false);
  };

  // REMOVE CLIENT DIRECTLY BY OWNER
  const handleRemoveClient = (clientId: string) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    onUpdateClients(updatedClients);

    const updatedUsers = users.filter(u => u.clientId !== clientId);
    onUpdateUsers(updatedUsers);
  };

  // ASSIGN CLIENT TO TRAINER (OR UNASSIGN)
  const handleAssignTrainer = (clientId: string, trainerId: string | null) => {
    const updatedClients = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          linkedTrainerId: trainerId || null,
          linkedTrainerStatus: trainerId ? ("approved" as const) : ("none" as const)
        };
      }
      return c;
    });
    onUpdateClients(updatedClients);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !gymName) return;

    const newJob: JobPosting = {
      id: "job_" + Date.now(),
      title: jobTitle,
      gymName,
      location: jobLocation || "Bandra West, Mumbai",
      salaryRange: jobSalary || "₹40,000 - ₹60,000 / Month",
      type: jobType,
      description: jobDesc || "Exciting fitness coaching opportunity with our team.",
      createdAt: "Just now",
      contactEmail: jobContactEmail || "careers@gymbuddy.in",
      contactPhone: jobContactPhone || "+91 98765 43210"
    };

    onAddJob(newJob);
    setJobTitle("");
    setGymName("");
    setJobLocation("");
    setJobSalary("");
    setJobDesc("");
    setJobContactEmail("");
    setJobContactPhone("");
    setShowJobModal(false);
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle || !offerTag) return;

    const newOffer: GymOffer = {
      id: "offer_" + Date.now(),
      tag: offerTag.toUpperCase(),
      title: offerTitle.toUpperCase(),
      subtitle: offerSubtitle || "Unlock unique training schedules with exclusive access passes.",
      actionText: offerActionText || "CLAIM OFFER",
      imageUrl: offerImageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
      promoCode: offerPromoCode ? offerPromoCode.trim().toUpperCase() : undefined,
      discountPercent: offerDiscountPercent || 20,
      expiresAt: offerExpiresAt || undefined,
      isActive: offerIsActive
    };

    onAddOffer(newOffer);
    setOfferTitle("");
    setOfferSubtitle("");
    setOfferTag("");
    setOfferActionText("");
    setOfferImageUrl("");
    setOfferPromoCode("");
    setOfferDiscountPercent(20);
    setOfferExpiresAt("");
    setOfferIsActive(true);
    setShowOfferModal(false);
  };

  // EDIT OPEN CONTROLS
  const openEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setEditTrainerName(trainer.name);
    setEditTrainerEmail(trainer.email);
    setEditTrainerSpecialty(trainer.specialty);
    setEditTrainerExperience(trainer.experience);
    setEditTrainerBio(trainer.bio);
    
    // Find all clients linked to this trainer
    const linkedClientIds = clients.filter(c => c.linkedTrainerId === trainer.id).map(c => c.id);
    setEditTrainerClientIds(linkedClientIds);
  };

  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setEditClientName(client.name);
    setEditClientEmail(client.email);
    setEditClientLevel(client.level);
    setEditClientTier(client.activeTier || "PRO");
    setEditClientTrainerId(client.linkedTrainerId || "");
  };

  const openEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setEditJobTitle(job.title);
    setEditGymName(job.gymName);
    setEditJobLocation(job.location);
    setEditJobSalary(job.salaryRange);
    setEditJobType(job.type);
    setEditJobDesc(job.description);
    setEditJobContactEmail(job.contactEmail || "careers@gymbuddy.in");
    setEditJobContactPhone(job.contactPhone || "+91 98765 43210");
  };

  const openEditOffer = (offer: GymOffer) => {
    setEditingOffer(offer);
    setEditOfferTitle(offer.title);
    setEditOfferSubtitle(offer.subtitle);
    setEditOfferTag(offer.tag);
    setEditOfferActionText(offer.actionText);
    setEditOfferImageUrl(offer.imageUrl);
    setEditOfferPromoCode(offer.promoCode || "");
    setEditOfferDiscountPercent(offer.discountPercent || 20);
    setEditOfferExpiresAt(offer.expiresAt || "");
    setEditOfferIsActive(offer.isActive !== false);
  };

  // EDIT SUBMIT CONTROLS
  const handleEditTrainerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainer) return;

    const updatedTrainers = trainers.map(t => {
      if (t.id === editingTrainer.id) {
        return {
          ...t,
          name: editTrainerName,
          email: editTrainerEmail,
          specialty: editTrainerSpecialty,
          experience: editTrainerExperience,
          bio: editTrainerBio
        };
      }
      return t;
    });
    onUpdateTrainers(updatedTrainers);

    const updatedUsers = users.map(u => {
      if (u.trainerId === editingTrainer.id) {
        return {
          ...u,
          name: editTrainerName,
          email: editTrainerEmail
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    // Update client linkages
    const updatedClients = clients.map(c => {
      const isCurrentlyLinked = c.linkedTrainerId === editingTrainer.id;
      const shouldBeLinked = editTrainerClientIds.includes(c.id);

      if (shouldBeLinked && !isCurrentlyLinked) {
        return {
          ...c,
          linkedTrainerId: editingTrainer.id,
          linkedTrainerStatus: "approved" as const
        };
      } else if (!shouldBeLinked && isCurrentlyLinked) {
        return {
          ...c,
          linkedTrainerId: null,
          linkedTrainerStatus: "none" as const
        };
      }
      return c;
    });
    onUpdateClients(updatedClients);

    setEditingTrainer(null);
  };

  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updatedClients = clients.map(c => {
      if (c.id === editingClient.id) {
        return {
          ...c,
          name: editClientName,
          email: editClientEmail,
          level: editClientLevel,
          activeTier: editClientTier,
          linkedTrainerId: editClientTrainerId || null,
          linkedTrainerStatus: editClientTrainerId ? ("approved" as const) : ("none" as const)
        };
      }
      return c;
    });
    onUpdateClients(updatedClients);

    const updatedUsers = users.map(u => {
      if (u.clientId === editingClient.id) {
        return {
          ...u,
          name: editClientName,
          email: editClientEmail
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    setEditingClient(null);
  };

  const handleEditJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const updatedJobs = jobPostings.map(j => {
      if (j.id === editingJob.id) {
        return {
          ...j,
          title: editJobTitle,
          gymName: editGymName,
          location: editJobLocation,
          salaryRange: editJobSalary,
          type: editJobType,
          description: editJobDesc,
          contactEmail: editJobContactEmail,
          contactPhone: editJobContactPhone
        };
      }
      return j;
    });

    if (onUpdateJobs) {
      onUpdateJobs(updatedJobs);
    } else {
      onDeleteJob(editingJob.id);
      onAddJob({
        ...editingJob,
        title: editJobTitle,
        gymName: editGymName,
        location: editJobLocation,
        salaryRange: editJobSalary,
        type: editJobType,
        description: editJobDesc,
        contactEmail: editJobContactEmail,
        contactPhone: editJobContactPhone
      });
    }

    setEditingJob(null);
  };

  const handleEditOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    const updatedOffers = offers.map(o => {
      if (o.id === editingOffer.id) {
        return {
          ...o,
          title: editOfferTitle.toUpperCase(),
          subtitle: editOfferSubtitle,
          tag: editOfferTag.toUpperCase(),
          actionText: editOfferActionText,
          imageUrl: editOfferImageUrl,
          promoCode: editOfferPromoCode ? editOfferPromoCode.trim().toUpperCase() : undefined,
          discountPercent: editOfferDiscountPercent || 20,
          expiresAt: editOfferExpiresAt || undefined,
          isActive: editOfferIsActive
        };
      }
      return o;
    });

    if (onUpdateOffers) {
      onUpdateOffers(updatedOffers);
    } else {
      onDeleteOffer(editingOffer.id);
      onAddOffer({
        ...editingOffer,
        title: editOfferTitle.toUpperCase(),
        subtitle: editOfferSubtitle,
        tag: editOfferTag.toUpperCase(),
        actionText: editOfferActionText,
        imageUrl: editOfferImageUrl,
        promoCode: editOfferPromoCode ? editOfferPromoCode.trim().toUpperCase() : undefined,
        discountPercent: editOfferDiscountPercent || 20,
        expiresAt: editOfferExpiresAt || undefined,
        isActive: editOfferIsActive
      });
    }

    setEditingOffer(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* High-End Operational Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-volt/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-volt/10 rounded-lg text-volt border border-volt/20">
              <Shield size={18} />
            </div>
            <span className="font-mono text-xs text-volt uppercase tracking-widest font-black">
              ADMINISTRATIVE CONSOLE
            </span>
          </div>
          <h2 className="font-display text-3xl font-black uppercase italic text-white leading-tight">
            Gym Buddy Director
          </h2>
          <p className="text-xs text-zinc-400 font-semibold max-w-xl leading-relaxed">
            Review trainer applications, control client assignments, administer job openings, and promote gym-wide active packages and subscription programs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 z-10">
          <button
            onClick={() => setShowTrainerModal(true)}
            className="px-4 py-2.5 bg-volt hover:bg-lime-300 text-black font-mono text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer uppercase shadow-md shadow-volt/10"
          >
            <UserPlus size={14} /> Onboard Coach
          </button>
          <button
            onClick={() => setShowClientModal(true)}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer uppercase border border-zinc-700"
          >
            <Plus size={14} /> Onboard Member
          </button>
        </div>
      </div>

      {/* Diagnostics Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gym Members */}
        <div className="bg-[#18181b] p-6 border border-[#27272a] rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-volt">
          <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-1">
            GYM POPULATION
          </p>
          <h3 className="font-display text-4xl font-black text-volt italic leading-none">
            {clients.length + approvedTrainers.length}
          </h3>
          <div className="flex items-center text-zinc-400 text-xs mt-3 font-mono">
            <span>{clients.length} Clients • {approvedTrainers.length} Active Coaches</span>
          </div>
        </div>

        {/* Certified active coaches */}
        <div className="bg-[#18181b] p-6 border border-[#27272a] rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-volt">
          <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-1">
            ACTIVE STAFF
          </p>
          <h3 className="font-display text-4xl font-black text-white italic leading-none">
            {approvedTrainers.length}
          </h3>
          <div className="flex items-center text-volt-dim text-xs mt-3 font-mono">
            <Award size={14} className="mr-1" />
            <span>Sole authority over staff & clients</span>
          </div>
        </div>

        {/* Pending coaches */}
        <div className="bg-[#18181b] p-6 border border-[#27272a] rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-volt">
          <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-1">
            APPLICATIONS
          </p>
          <h3 className={`font-display text-4xl font-black italic leading-none ${pendingTrainers.length > 0 ? "text-amber-400" : "text-zinc-500"}`}>
            {pendingTrainers.length}
          </h3>
          <div className="flex items-center text-zinc-400 text-xs mt-3 font-mono">
            <span>Coach sign-ups awaiting vetting</span>
          </div>
        </div>

        {/* Projected Monthly Revenue */}
        <div className="bg-[#18181b] p-6 border border-[#27272a] rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-volt">
          <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-1">
            EST. MONTHLY REVENUE
          </p>
          <h3 className="font-display text-4xl font-black text-emerald-400 italic leading-none">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h3>
          <div className="flex items-center text-emerald-500/80 text-xs mt-3 font-mono">
            <TrendingUp size={14} className="mr-1" />
            <span>Active client subscriptions</span>
          </div>
        </div>
      </section>

      {/* Primary Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap border-b border-zinc-800 gap-1.5 sm:gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab("APPLICATIONS")}
          className={`px-3.5 sm:px-4 py-2.5 text-xs font-mono tracking-wider font-extrabold uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap touch-target shrink-0 ${
            activeTab === "APPLICATIONS" 
              ? "bg-volt text-black shadow-[0_0_10px_rgba(163,230,53,0.25)]" 
              : "text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850"
          }`}
        >
          APPLICATIONS ({pendingTrainers.length})
        </button>
        <button
          onClick={() => setActiveTab("ROSTER")}
          className={`px-3.5 sm:px-4 py-2.5 text-xs font-mono tracking-wider font-extrabold uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap touch-target shrink-0 ${
            activeTab === "ROSTER" 
              ? "bg-volt text-black shadow-[0_0_10px_rgba(163,230,53,0.25)]" 
              : "text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850"
          }`}
        >
          COACH ROSTER ({approvedTrainers.length})
        </button>
        <button
          onClick={() => setActiveTab("CLIENTS")}
          className={`px-3.5 sm:px-4 py-2.5 text-xs font-mono tracking-wider font-extrabold uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap touch-target shrink-0 ${
            activeTab === "CLIENTS" 
              ? "bg-volt text-black shadow-[0_0_10px_rgba(163,230,53,0.25)]" 
              : "text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850"
          }`}
        >
          CLIENT ROSTER ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab("JOBS")}
          className={`px-3.5 sm:px-4 py-2.5 text-xs font-mono tracking-wider font-extrabold uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap touch-target shrink-0 ${
            activeTab === "JOBS" 
              ? "bg-volt text-black shadow-[0_0_10px_rgba(163,230,53,0.25)]" 
              : "text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850"
          }`}
        >
          GYM JOBS ({jobPostings.length})
        </button>
        <button
          onClick={() => setActiveTab("OFFERS")}
          className={`px-3.5 sm:px-4 py-2.5 text-xs font-mono tracking-wider font-extrabold uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap touch-target shrink-0 ${
            activeTab === "OFFERS" 
              ? "bg-volt text-black shadow-[0_0_10px_rgba(163,230,53,0.25)]" 
              : "text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850"
          }`}
        >
          GYM OFFERS ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab("MEMBERSHIPS")}
          className={`px-3.5 sm:px-4 py-2.5 text-xs font-mono tracking-wider font-extrabold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap touch-target shrink-0 ${
            activeTab === "MEMBERSHIPS" 
              ? "bg-volt text-black shadow-[0_0_10px_rgba(163,230,53,0.25)]" 
              : "text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850"
          }`}
        >
          <CreditCard size={14} />
          MEMBERSHIPS & REVENUE
        </button>
      </div>

      {/* Tab Panels */}
      <main className="space-y-6">
        {activeTab === "APPLICATIONS" && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-volt uppercase tracking-wider">Coach Applications</h3>
            {pendingTrainers.length === 0 ? (
              <div className="p-8 text-center bg-[#18181b] border border-[#27272a] rounded-3xl text-zinc-500 font-mono text-xs">
                No pending trainer applications found. New coach sign-ups will display here for approval.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTrainers.map(trainer => (
                  <div key={trainer.id} className="p-5 bg-[#18181b] border border-[#27272a] rounded-3xl flex flex-col justify-between gap-4 hover:border-volt transition-colors">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-700">
                        <img src={trainer.avatarUrl} alt={trainer.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{trainer.name}</h4>
                        <p className="text-xs text-zinc-400 font-mono">{trainer.email}</p>
                        <p className="text-xs text-volt font-bold mt-1.5">{trainer.specialty}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-400 font-semibold leading-relaxed bg-[#09090b] p-3 rounded-xl border border-zinc-800">
                      &ldquo;{trainer.bio}&rdquo;
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveTrainer(trainer.id)}
                        className="flex-1 py-2.5 bg-volt text-black font-mono text-xs font-black rounded-xl hover:bg-lime-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} /> APPROVE APPLICATION
                      </button>
                      <button
                        onClick={() => handleDeclineTrainer(trainer.id)}
                        className="px-3 bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Decline Application"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ROSTER" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-mono text-volt uppercase tracking-wider">Active Gym Coaches</h3>
              <button
                onClick={() => setShowTrainerModal(true)}
                className="px-3.5 py-1.5 bg-volt text-black font-mono text-xs font-black rounded-lg hover:bg-lime-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> ADD COACH
              </button>
            </div>

            {approvedTrainers.length === 0 ? (
              <div className="p-8 text-center bg-[#18181b] border border-[#27272a] rounded-3xl text-zinc-500 font-mono text-xs">
                No active coaches found. Use the &quot;ADD COACH&quot; button to create a new trainer.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedTrainers.map(trainer => {
                  const linkedClients = clients.filter(c => c.linkedTrainerId === trainer.id);
                  return (
                    <div key={trainer.id} className="p-5 bg-[#18181b] border border-[#27272a] rounded-3xl flex flex-col justify-between hover:border-volt transition-colors relative group">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                              <img src={trainer.avatarUrl} alt={trainer.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-bold text-sm truncate">{trainer.name}</h4>
                              <div className="flex gap-1.5 items-center mt-1 flex-wrap">
                                <span className="px-1.5 py-0.5 bg-volt/10 text-volt text-[9px] font-mono rounded font-bold border border-volt/20">
                                  {trainer.experience} EXP
                                </span>
                                <span className="text-[10px] font-mono font-bold bg-[#09090b] text-volt border border-volt/20 px-1.5 py-0.5 rounded" title="Unique Login ID">
                                  ID: {trainer.loginId || "KNT-ALEX"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-zinc-900/50 p-1 rounded-lg border border-zinc-850">
                            <button
                              onClick={() => openEditTrainer(trainer)}
                              className="text-zinc-500 hover:text-volt transition-colors p-1 rounded cursor-pointer"
                              title="Edit Coach"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveTrainer(trainer.id)}
                              className="text-zinc-500 hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                              title="Remove Trainer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-volt mt-2.5 font-bold uppercase">{trainer.specialty}</p>
                        <p className="text-[11px] text-zinc-400 mt-2 font-semibold line-clamp-2 leading-relaxed">&ldquo;{trainer.bio}&rdquo;</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/60">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">Assigned Clients ({linkedClients.length})</span>
                        {linkedClients.length === 0 ? (
                          <p className="text-[10px] text-zinc-600 font-mono italic">No clients assigned to this coach.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {linkedClients.map(lc => (
                              <span key={lc.id} className="text-[9px] font-mono font-bold bg-[#09090b] text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                                {lc.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "CLIENTS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-mono text-volt uppercase tracking-wider">Gym Athlete Roster</h3>
              <button
                onClick={() => setShowClientModal(true)}
                className="px-3.5 py-1.5 bg-volt text-black font-mono text-xs font-black rounded-lg hover:bg-lime-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> ADD CLIENT
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="p-8 text-center bg-[#18181b] border border-[#27272a] rounded-3xl text-zinc-500 font-mono text-xs">
                No clients registered in Gym 1. Use the &quot;ADD CLIENT&quot; button to onboard a new athlete.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(client => {
                  const activeCoach = approvedTrainers.find(t => t.id === client.linkedTrainerId);
                  return (
                    <div key={client.id} className="p-5 bg-[#18181b] border border-[#27272a] rounded-3xl flex flex-col justify-between hover:border-volt transition-colors relative group">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                              <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-bold text-sm leading-tight truncate">{client.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono truncate">{client.email}</p>
                              <span className="inline-block mt-1 text-[9px] font-mono font-bold bg-[#09090b] text-volt border border-volt/20 px-1.5 py-0.5 rounded truncate">
                                ID: {client.loginId || `KNT-${(client.id || "000").slice(-5).toUpperCase()}`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-zinc-900/50 p-1 rounded-lg border border-zinc-850">
                            <button
                              onClick={() => openEditClient(client)}
                              className="text-zinc-500 hover:text-volt transition-colors p-1 rounded cursor-pointer"
                              title="Edit Client"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveClient(client.id)}
                              className="text-zinc-500 hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                              title="Remove Client"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-0.5 bg-zinc-800/80 text-zinc-300 text-[9px] font-mono rounded font-bold uppercase tracking-wider">
                            {client.level}
                          </span>
                          <span className="px-2 py-0.5 bg-volt/10 border border-volt/20 text-volt text-[9px] font-mono rounded font-bold uppercase tracking-wider">
                            {client.activeTier || "NO MEMEBERSIP"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-zinc-800/60 space-y-2">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">
                          Assign Trainer / Personal Coach
                        </label>
                        <select
                          value={client.linkedTrainerId || ""}
                          onChange={(e) => handleAssignTrainer(client.id, e.target.value || null)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-2.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt transition-all cursor-pointer"
                        >
                          <option value="">-- UNASSIGNED (SOLO MEMBERSHIP) --</option>
                          {approvedTrainers.map(t => (
                            <option key={t.id} value={t.id}>
                              COACH: {t.name} ({t.specialty})
                            </option>
                          ))}
                        </select>

                        {activeCoach ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold mt-1.5 bg-emerald-500/5 border border-emerald-500/10 p-1.5 rounded-lg">
                            <UserCheck size={11} /> ASSIGNED TO {activeCoach.name.toUpperCase()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mt-1.5">
                            <AlertCircle size={11} /> Unassigned. Training Solo.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "JOBS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-mono text-volt uppercase tracking-wider">Open Positions</h3>
              <button
                onClick={() => setShowJobModal(true)}
                className="px-3.5 py-1.5 bg-volt text-black font-mono text-xs font-black rounded-lg hover:bg-lime-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> NEW POSTING
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobPostings.map(job => (
                <div key={job.id} className="p-5 bg-[#18181b] border border-[#27272a] rounded-3xl flex flex-col justify-between relative group hover:border-volt transition-all">
                  <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                    <button
                      onClick={() => openEditJob(job)}
                      className="text-zinc-500 hover:text-volt transition-colors p-1"
                      title="Edit Job"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="text-zinc-500 hover:text-rose-500 transition-colors p-1"
                      title="Delete Job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[9px] font-bold rounded">
                      {job.type}
                    </span>
                    <h4 className="text-white font-display text-lg font-extrabold italic uppercase mt-1">{job.title}</h4>
                    <p className="text-xs text-volt font-semibold font-mono">{job.gymName} • {job.location}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold">{job.description}</p>
                    
                    {/* Contact Details */}
                    <div className="pt-2 flex flex-col gap-1 text-[11px] text-zinc-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-volt" />
                        <span>Contact: {job.contactPhone || "+91 98765 43210"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-volt" />
                        <span>Email: {job.contactEmail || "careers@gymbuddy.in"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-zinc-300 font-bold">{job.salaryRange}</span>
                      <span className="font-mono text-zinc-500">{job.createdAt}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSharingJob(job);
                        setCopiedText(false);
                      }}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-volt font-mono text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      <Share2 size={12} /> SHARE JOB VACANCY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "OFFERS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-mono text-volt uppercase tracking-wider">Promotional Offers</h3>
              <button
                onClick={() => setShowOfferModal(true)}
                className="px-3.5 py-1.5 bg-volt text-black font-mono text-xs font-black rounded-lg hover:bg-lime-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> CREATE OFFER
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map(offer => (
                <div key={offer.id} className="bg-[#18181b] border border-[#27272a] rounded-3xl overflow-hidden flex flex-col sm:flex-row relative hover:border-volt transition-colors">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => openEditOffer(offer)}
                      className="bg-black/60 backdrop-blur-md p-1.5 rounded-full text-zinc-400 hover:text-volt transition-colors"
                      title="Edit Offer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteOffer(offer.id)}
                      className="bg-black/60 backdrop-blur-md p-1.5 rounded-full text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete Offer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="w-full sm:w-1/3 h-32 sm:h-auto relative">
                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-volt tracking-widest">{offer.tag}</span>
                      <h4 className="text-white font-display text-base font-extrabold italic uppercase mt-1 leading-tight">{offer.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-normal font-semibold">{offer.subtitle}</p>
                    </div>
                    <span className="mt-3 text-xs font-mono font-bold text-volt flex items-center gap-1">
                      Action: {offer.actionText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "MEMBERSHIPS" && (
          <div className="space-y-6">
            {/* Revenue Analytics Banner */}
            {(() => {
              const allInvoices: PaymentInvoice[] = clients
                .flatMap(c => c.invoices || [])
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              const collectedRev = allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
              const activeMembers = clients.filter(c => c.hasPaidFee).length;
              const basicCount = clients.filter(c => c.activeTier === "BASIC").length;
              const proCount = clients.filter(c => c.activeTier === "PRO").length;
              const eliteCount = clients.filter(c => c.activeTier === "ELITE").length;

              const filteredInvoices = allInvoices.filter(inv => {
                if (!invoiceSearchQuery) return true;
                const q = invoiceSearchQuery.toLowerCase();
                return (
                  inv.id.toLowerCase().includes(q) ||
                  inv.clientName.toLowerCase().includes(q) ||
                  inv.clientEmail.toLowerCase().includes(q) ||
                  inv.tier.toLowerCase().includes(q) ||
                  (inv.promoCodeApplied && inv.promoCodeApplied.toLowerCase().includes(q))
                );
              });

              const handleExtendValidity = (clientId: string, days: number) => {
                const updatedClients = clients.map(c => {
                  if (c.id === clientId) {
                    const currentExp = c.membershipExpiryDate ? new Date(c.membershipExpiryDate) : new Date();
                    const baseDate = currentExp > new Date() ? currentExp : new Date();
                    baseDate.setDate(baseDate.getDate() + days);

                    return {
                      ...c,
                      hasPaidFee: true,
                      membershipStatus: "ACTIVE" as const,
                      membershipExpiryDate: baseDate.toISOString(),
                      membershipStartDate: c.membershipStartDate || new Date().toISOString()
                    };
                  }
                  return c;
                });
                onUpdateClients(updatedClients);
              };

              const handleTierSwitch = (clientId: string, tier: "BASIC" | "PRO" | "ELITE") => {
                const updatedClients = clients.map(c => {
                  if (c.id === clientId) {
                    return {
                      ...c,
                      activeTier: tier,
                      hasPaidFee: true,
                      membershipStatus: "ACTIVE" as const
                    };
                  }
                  return c;
                });
                onUpdateClients(updatedClients);
              };

              return (
                <>
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-[#18181b] border border-zinc-800 rounded-3xl space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">TOTAL COLLECTED REVENUE</span>
                      <h4 className="font-display text-3xl font-black text-emerald-400 italic">
                        ₹{collectedRev.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">From {allInvoices.length} paid invoices</p>
                    </div>

                    <div className="p-5 bg-[#18181b] border border-zinc-800 rounded-3xl space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">SUBSCRIBED ATHLETES</span>
                      <h4 className="font-display text-3xl font-black text-volt italic">
                        {activeMembers} / {clients.length}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">{Math.round((activeMembers / Math.max(1, clients.length)) * 100)}% conversion rate</p>
                    </div>

                    <div className="p-5 bg-[#18181b] border border-zinc-800 rounded-3xl space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">PROJECTED MRR</span>
                      <h4 className="font-display text-3xl font-black text-white italic">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">Monthly recurring baseline</p>
                    </div>

                    <div className="p-5 bg-[#18181b] border border-zinc-800 rounded-3xl space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">TIER DISTRIBUTION</span>
                      <div className="flex gap-2 text-xs font-mono font-bold mt-2">
                        <span className="text-zinc-400">B: {basicCount}</span>
                        <span className="text-volt">P: {proCount}</span>
                        <span className="text-amber-400">E: {eliteCount}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Basic / Pro / Elite active plans</p>
                    </div>
                  </div>

                  {/* Member Validity & Tier Quick Control */}
                  <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-display text-base font-black text-white italic uppercase tracking-wider flex items-center gap-2">
                          <Users size={18} className="text-volt" />
                          MEMBER SUBSCRIPTION & VALIDITY MANAGER
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium mt-0.5">
                          Directly extend client validity dates or upgrade membership tiers.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-zinc-800 font-mono text-[10px] text-zinc-500 uppercase">
                            <th className="pb-3 px-3">ATHLETE / MEMBER</th>
                            <th className="pb-3 px-3">ACTIVE TIER</th>
                            <th className="pb-3 px-3">MEMBERSHIP STATUS</th>
                            <th className="pb-3 px-3">VALID UNTIL</th>
                            <th className="pb-3 px-3 text-right">QUICK EXTENSION ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 font-medium">
                          {clients.map(c => {
                            const expDate = c.membershipExpiryDate ? new Date(c.membershipExpiryDate) : null;
                            const isExpired = expDate ? expDate < new Date() : false;

                            return (
                              <tr key={c.id} className="hover:bg-zinc-800/20 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-white">{c.name}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono">{c.email}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <select 
                                    value={c.activeTier || "PRO"}
                                    onChange={(e) => handleTierSwitch(c.id, e.target.value as any)}
                                    className="bg-[#09090b] border border-zinc-700 text-volt text-[11px] font-mono font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                                  >
                                    <option value="BASIC">BASIC (₹499)</option>
                                    <option value="PRO">PRO (₹1,499)</option>
                                    <option value="ELITE">ELITE (₹2,999)</option>
                                  </select>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    c.hasPaidFee && !isExpired 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  }`}>
                                    {c.hasPaidFee && !isExpired ? "ACTIVE SUBSCRIBER" : "INACTIVE / EXPIRED"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono text-zinc-300">
                                  {expDate ? expDate.toLocaleDateString() : "No Expiry Set"}
                                </td>
                                <td className="py-3 px-3 text-right space-x-1.5">
                                  <button
                                    onClick={() => handleExtendValidity(c.id, 30)}
                                    className="bg-zinc-800 hover:bg-volt hover:text-black text-white px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    +30 Days
                                  </button>
                                  <button
                                    onClick={() => handleExtendValidity(c.id, 90)}
                                    className="bg-zinc-800 hover:bg-volt hover:text-black text-white px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    +90 Days
                                  </button>
                                  <button
                                    onClick={() => handleExtendValidity(c.id, 365)}
                                    className="bg-volt text-black hover:bg-lime-300 px-2.5 py-1 rounded-lg font-mono text-[10px] font-black transition-colors cursor-pointer"
                                  >
                                    +1 Year
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Invoices Ledger */}
                  <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-display text-base font-black text-white italic uppercase tracking-wider flex items-center gap-2">
                          <FileText size={18} className="text-volt" />
                          TRANSACTION & INVOICES REVENUE LEDGER
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium">
                          All incoming payments from Razorpay, UPI, Cards, and Netbanking.
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search invoices..."
                          value={invoiceSearchQuery}
                          onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-volt"
                        />
                      </div>
                    </div>

                    {filteredInvoices.length === 0 ? (
                      <div className="p-8 text-center bg-[#09090b] border border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs space-y-1">
                        <FileText size={24} className="mx-auto text-zinc-600 mb-2" />
                        <p>No payment invoices matching your query.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-zinc-800 font-mono text-[10px] text-zinc-500 uppercase">
                              <th className="pb-3 px-3">INVOICE ID</th>
                              <th className="pb-3 px-3">CLIENT</th>
                              <th className="pb-3 px-3">DATE</th>
                              <th className="pb-3 px-3">TIER / PERIOD</th>
                              <th className="pb-3 px-3">PAYMENT METHOD</th>
                              <th className="pb-3 px-3">PROMO APPLIED</th>
                              <th className="pb-3 px-3">NET AMOUNT</th>
                              <th className="pb-3 px-3 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/60 font-medium">
                            {filteredInvoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-zinc-800/20 transition-colors">
                                <td className="py-3 px-3 font-mono font-bold text-white">
                                  {inv.id}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-white">{inv.clientName}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono">{inv.clientEmail}</div>
                                </td>
                                <td className="py-3 px-3 text-zinc-400 font-mono">
                                  {new Date(inv.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-bold text-white">{inv.tier}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono ml-1">({inv.period})</span>
                                </td>
                                <td className="py-3 px-3 text-zinc-300 font-mono">
                                  {inv.paymentMethod}
                                </td>
                                <td className="py-3 px-3">
                                  {inv.promoCodeApplied ? (
                                    <span className="text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                                      {inv.promoCodeApplied} (-₹{inv.discountAmount})
                                    </span>
                                  ) : (
                                    <span className="text-zinc-500 text-[10px] font-mono">None</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 font-mono font-black text-volt text-sm">
                                  ₹{inv.totalAmount}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => setSelectedInvoiceForReceipt(inv)}
                                    className="inline-flex items-center gap-1 text-[11px] font-mono text-volt hover:text-lime-300 font-bold uppercase cursor-pointer"
                                  >
                                    <Printer size={13} /> View Receipt
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* JOB CREATION MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt">
                CREATE JOB LISTING
              </h3>
              <button onClick={() => setShowJobModal(false)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Job Title *</label>
                <input 
                  type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Lead Athletic Trainer"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Gym Location Name *</label>
                  <input 
                    type="text" required value={gymName} onChange={e => setGymName(e.target.value)} placeholder="Gym Buddy Downtown"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Location City *</label>
                  <input 
                    type="text" value={jobLocation} onChange={e => setJobLocation(e.target.value)} placeholder="Metro City, West"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Salary Range / Hourly *</label>
                  <input 
                    type="text" value={jobSalary} onChange={e => setJobSalary(e.target.value)} placeholder="e.g. $70k - $90k"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Position Type</label>
                  <select 
                    value={jobType} onChange={e => setJobType(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Job Description</label>
                <textarea 
                  value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={3} placeholder="Coaching scope, certifications required, etc."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Contact Email</label>
                  <input 
                    type="email" value={jobContactEmail} onChange={e => setJobContactEmail(e.target.value)} placeholder="careers@gymbuddy.in"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Contact Phone</label>
                  <input 
                    type="text" value={jobContactPhone} onChange={e => setJobContactPhone(e.target.value)} placeholder="+91 98765 43210"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                PUBLISH CAREER POSTING 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OFFER CREATION MODAL */}
      {showOfferModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt">
                CREATE PROMOTIONAL OFFER
              </h3>
              <button onClick={() => setShowOfferModal(false)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddOffer} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-[#fafafa] uppercase mb-1">Offer Title *</label>
                <input 
                  type="text" required value={offerTitle} onChange={e => setOfferTitle(e.target.value)} placeholder="e.g. Summer Performance Boot"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Tag (Short Promo Label) *</label>
                  <input 
                    type="text" required value={offerTag} onChange={e => setOfferTag(e.target.value)} placeholder="LIMITED TIME"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Button Action Text</label>
                  <input 
                    type="text" value={offerActionText} onChange={e => setOfferActionText(e.target.value)} placeholder="CLAIM OFFER"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Redeemable Promo Code</label>
                  <input 
                    type="text" value={offerPromoCode} onChange={e => setOfferPromoCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER30"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-volt font-mono text-xs uppercase focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Discount %</label>
                  <input 
                    type="number" min={5} max={90} value={offerDiscountPercent} onChange={e => setOfferDiscountPercent(Number(e.target.value))} placeholder="20"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Image URL</label>
                <input 
                  type="text" value={offerImageUrl} onChange={e => setOfferImageUrl(e.target.value)} placeholder="https://..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Subtitle / Details</label>
                <textarea 
                  value={offerSubtitle} onChange={e => setOfferSubtitle(e.target.value)} rows={3} placeholder="Promotional subtitle detailing discount percentages or synced benefits."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                PUBLISH PROMO OFFER ⚡
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CLIENT MODAL */}
      {showClientModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt flex items-center gap-1.5">
                <UserPlus size={18} /> REGISTER NEW GYM CLIENT
              </h3>
              <button onClick={() => setShowClientModal(false)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddClientSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Full Name *</label>
                <input 
                  type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Marcus Aurelius"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Email Address (Login Username) *</label>
                <input 
                  type="email" required value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="e.g. marcus@gmail.com"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Athletic Level</label>
                  <select 
                    value={clientLevel} onChange={e => setClientLevel(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  >
                    <option value="Active Member">Active Member</option>
                    <option value="Elite Athlete">Elite Athlete</option>
                    <option value="Masters Level">Masters Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Membership Tier</label>
                  <select 
                    value={clientTier} onChange={e => setClientTier(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  >
                    <option value="BASIC">BASIC (₹499/mo)</option>
                    <option value="PRO">PRO (₹1,499/mo)</option>
                    <option value="ELITE">ELITE (₹2,999/mo)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Assign Personal Coach</label>
                <select 
                  value={selectedTrainerId} onChange={e => setSelectedTrainerId(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt cursor-pointer"
                >
                  <option value="">-- SOLO (NO ASSIGNED COACH) --</option>
                  {approvedTrainers.map(t => (
                    <option key={t.id} value={t.id}>
                      COACH: {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Unique Passcode / Login ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customClientCode} 
                    onChange={e => setCustomClientCode(e.target.value.toUpperCase())} 
                    placeholder="e.g. KNT-84920"
                    className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => generateRandomClientCode(clientName)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 hover:text-volt border border-[#27272a] rounded-xl text-[10px] font-mono font-bold text-zinc-300 transition-colors shrink-0 cursor-pointer"
                  >
                    Generate Code
                  </button>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono">Customize or auto-generate a secure passcode for this client.</p>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <p className="text-[10px] font-mono text-volt uppercase tracking-wider font-bold">🔒 Passwordless Entry enabled</p>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                  No password required. A Unique Login ID will be auto-generated upon onboarding.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                ONBOARD GYM CLIENT 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD TRAINER MODAL */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt flex items-center gap-1.5">
                <UserPlus size={18} /> REGISTER CERTIFIED COACH
              </h3>
              <button onClick={() => setShowTrainerModal(false)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTrainerSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Coach Full Name *</label>
                <input 
                  type="text" required value={trainerName} onChange={e => setTrainerName(e.target.value)} placeholder="e.g. Elena Symmetry"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Email Address (Login Username) *</label>
                <input 
                  type="email" required value={trainerEmail} onChange={e => setTrainerEmail(e.target.value)} placeholder="e.g. elena@kinetic.pro"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Specialty</label>
                  <input 
                    type="text" required value={trainerSpecialty} onChange={e => setTrainerSpecialty(e.target.value)} placeholder="e.g. Biomechanics & Core"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Years Experience</label>
                  <input 
                    type="text" required value={trainerExperience} onChange={e => setTrainerExperience(e.target.value)} placeholder="e.g. 6+ Years"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Short Professional Bio</label>
                <textarea 
                  value={trainerBio} onChange={e => setTrainerBio(e.target.value)} rows={3} placeholder="Coaching specialties, background certifications, compound lifting focus etc."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-2">Assign Athletes / Clients</label>
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                  {clients.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No clients registered to assign.</p>
                  ) : (
                    clients.map(c => {
                      const isLinked = c.linkedTrainerId;
                      const currentTrainer = trainers.find(t => t.id === c.linkedTrainerId);
                      return (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedClientIds.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClientIds([...selectedClientIds, c.id]);
                              } else {
                                setSelectedClientIds(selectedClientIds.filter(id => id !== c.id));
                              }
                            }}
                            className="rounded border-zinc-700 text-volt focus:ring-volt bg-zinc-950 w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-zinc-300 font-bold group-hover:text-white transition-colors">{c.name}</span>
                            {isLinked && (
                              <span className="text-[9px] text-zinc-500 font-mono ml-2">
                                (With: {currentTrainer?.name || "Other"})
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Unique Passcode / Login ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customTrainerCode} 
                    onChange={e => setCustomTrainerCode(e.target.value.toUpperCase())} 
                    placeholder="e.g. KNT-COACHELENA"
                    className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => generateRandomTrainerCode(trainerName)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 hover:text-volt border border-[#27272a] rounded-xl text-[10px] font-mono font-bold text-zinc-300 transition-colors shrink-0 cursor-pointer"
                  >
                    Generate Code
                  </button>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono">Customize or auto-generate a secure passcode for this coach.</p>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <p className="text-[10px] font-mono text-volt uppercase tracking-wider font-bold">🔒 Passwordless Entry enabled</p>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                  No password required. A Unique Login ID will be auto-generated upon onboarding.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                ONBOARD CERTIFIED COACH 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARDING SUCCESS MODAL */}
      {successCreatedId && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border-2 border-volt max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 bg-volt/10 text-volt rounded-full flex items-center justify-center mx-auto text-2xl font-extrabold shadow-lg shadow-volt/10 border border-volt/20">
              ⚡
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-black uppercase italic text-volt">
                ONBOARDING COMPLETE
              </h3>
              <p className="text-xs text-zinc-400">
                The account has been successfully created and linked.
              </p>
            </div>

            <div className="p-4 bg-[#09090b] border border-zinc-800 rounded-2xl text-left space-y-3 font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Full Name</span>
                <span className="text-xs text-white font-bold font-sans">{successCreatedName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Account Role</span>
                <span className="text-xs text-volt font-bold">{successCreatedRole}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 uppercase block font-semibold mb-1">🔑 UNIQUE LOGIN ID</span>
                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
                  <span className="text-volt font-black tracking-widest text-sm">{successCreatedId}</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-800 px-1.5 py-0.5 rounded">COPY THIS</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal font-semibold">
              Provide this Unique Login ID to the {successCreatedRole === "TRAINER" ? "coach" : "athlete"} so they can login instantly. No password required.
            </p>

            <button
              onClick={() => {
                setSuccessCreatedId(null);
                setSuccessCreatedName("");
                setSuccessCreatedRole("");
              }}
              className="w-full py-3 bg-volt hover:bg-lime-300 text-black font-mono text-xs font-black uppercase rounded-xl tracking-wider cursor-pointer"
            >
              DONE, RETURN TO PORTAL
            </button>
          </div>
        </div>
      )}

      {/* EDIT COACH PROFILE MODAL */}
      {editingTrainer && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt flex items-center gap-1.5">
                <Edit size={18} /> EDIT COACH PROFILE
              </h3>
              <button onClick={() => setEditingTrainer(null)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditTrainerSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Coach Full Name *</label>
                <input 
                  type="text" required value={editTrainerName} onChange={e => setEditTrainerName(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Email Address *</label>
                <input 
                  type="email" required value={editTrainerEmail} onChange={e => setEditTrainerEmail(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Specialty</label>
                  <input 
                    type="text" required value={editTrainerSpecialty} onChange={e => setEditTrainerSpecialty(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Years Experience</label>
                  <input 
                    type="text" required value={editTrainerExperience} onChange={e => setEditTrainerExperience(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Short Professional Bio</label>
                <textarea 
                  value={editTrainerBio} onChange={e => setEditTrainerBio(e.target.value)} rows={3}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-2">Assigned Clients / Athletes</label>
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                  {clients.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No clients registered to assign.</p>
                  ) : (
                    clients.map(c => {
                      const isLinkedToSomeoneElse = c.linkedTrainerId && c.linkedTrainerId !== editingTrainer.id;
                      const otherTrainer = trainers.find(t => t.id === c.linkedTrainerId);
                      return (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editTrainerClientIds.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditTrainerClientIds([...editTrainerClientIds, c.id]);
                              } else {
                                setEditTrainerClientIds(editTrainerClientIds.filter(id => id !== c.id));
                              }
                            }}
                            className="rounded border-zinc-700 text-volt focus:ring-volt bg-zinc-950 w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-zinc-300 font-bold group-hover:text-white transition-colors">{c.name}</span>
                            {isLinkedToSomeoneElse && (
                              <span className="text-[9px] text-zinc-500 font-mono ml-2">
                                (With: {otherTrainer?.name || "Other"})
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                SAVE COACH PROFILE ⚡
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ATHLETE PROFILE MODAL */}
      {editingClient && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt flex items-center gap-1.5">
                <Edit size={18} /> EDIT ATHLETE PROFILE
              </h3>
              <button onClick={() => setEditingClient(null)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditClientSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Athlete Full Name *</label>
                <input 
                  type="text" required value={editClientName} onChange={e => setEditClientName(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Email Address *</label>
                <input 
                  type="email" required value={editClientEmail} onChange={e => setEditClientEmail(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Athletic Level</label>
                  <select 
                    value={editClientLevel} onChange={e => setEditClientLevel(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  >
                    <option value="Active Member">Active Member</option>
                    <option value="Elite Athlete">Elite Athlete</option>
                    <option value="Masters Level">Masters Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Membership Tier</label>
                  <select 
                    value={editClientTier} onChange={e => setEditClientTier(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="PRO">PRO</option>
                    <option value="ELITE">ELITE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Assigned Coach / Trainer</label>
                <select 
                  value={editClientTrainerId} onChange={e => setEditClientTrainerId(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt cursor-pointer"
                >
                  <option value="">-- SOLO (NO ASSIGNED COACH) --</option>
                  {approvedTrainers.map(t => (
                    <option key={t.id} value={t.id}>
                      COACH: {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                SAVE ATHLETE PROFILE 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JOB POSTING MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt flex items-center gap-1.5">
                <Edit size={18} /> EDIT CAREER POSTING
              </h3>
              <button onClick={() => setEditingJob(null)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditJobSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Job Title *</label>
                <input 
                  type="text" required value={editJobTitle} onChange={e => setEditJobTitle(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Gym Location Name *</label>
                  <input 
                    type="text" required value={editGymName} onChange={e => setEditGymName(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Location City *</label>
                  <input 
                    type="text" value={editJobLocation} onChange={e => setEditJobLocation(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Salary Range / Hourly *</label>
                  <input 
                    type="text" value={editJobSalary} onChange={e => setEditJobSalary(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Position Type</label>
                  <select 
                    value={editJobType} onChange={e => setEditJobType(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Job Description</label>
                <textarea 
                  value={editJobDesc} onChange={e => setEditJobDesc(e.target.value)} rows={3}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Contact Email</label>
                  <input 
                    type="email" value={editJobContactEmail} onChange={e => setEditJobContactEmail(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Contact Phone</label>
                  <input 
                    type="text" value={editJobContactPhone} onChange={e => setEditJobContactPhone(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                UPDATE CAREER POSTING 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROMOTIONAL OFFER MODAL */}
      {editingOffer && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shrink-0">
              <h3 className="font-display text-base font-extrabold uppercase italic text-volt flex items-center gap-1.5">
                <Edit size={18} /> EDIT PROMOTIONAL OFFER
              </h3>
              <button onClick={() => setEditingOffer(null)} className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditOfferSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-mono text-[#fafafa] uppercase mb-1">Offer Title *</label>
                <input 
                  type="text" required value={editOfferTitle} onChange={e => setEditOfferTitle(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Tag *</label>
                  <input 
                    type="text" required value={editOfferTag} onChange={e => setEditOfferTag(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Button Action Text</label>
                  <input 
                    type="text" value={editOfferActionText} onChange={e => setEditOfferActionText(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Redeemable Promo Code</label>
                  <input 
                    type="text" value={editOfferPromoCode} onChange={e => setEditOfferPromoCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER30"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-volt font-mono text-xs uppercase focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Discount %</label>
                  <input 
                    type="number" min={5} max={90} value={editOfferDiscountPercent} onChange={e => setEditOfferDiscountPercent(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-volt"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Image URL</label>
                <input 
                  type="text" value={editOfferImageUrl} onChange={e => setEditOfferImageUrl(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Subtitle / Details</label>
                <textarea 
                  value={editOfferSubtitle} onChange={e => setEditOfferSubtitle(e.target.value)} rows={3}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-volt"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-volt text-black py-3 font-display font-black uppercase text-xs italic rounded-2xl tracking-widest hover:bg-lime-300 mt-2 cursor-pointer"
              >
                UPDATE PROMO OFFER ⚡
              </button>
            </form>
          </div>
        </div>
      )}
      {/* OWNER INVOICE RECEIPT MODAL */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181b] border border-zinc-700 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <span className="font-mono text-[9px] bg-volt/10 text-volt px-2 py-0.5 rounded font-black uppercase">
                  OFFICIAL TAX RECEIPT
                </span>
                <h3 className="font-display text-2xl font-black text-white italic mt-1">
                  GYM BUDDY INVOICE
                </h3>
                <p className="text-[11px] font-mono text-zinc-400">
                  {selectedInvoiceForReceipt.gymName} • GST Registered
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForReceipt(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#09090b] p-4 rounded-2xl border border-zinc-800">
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Invoice Number</p>
                <p className="text-white font-bold">{selectedInvoiceForReceipt.id}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Transaction Ref</p>
                <p className="text-volt font-bold truncate">{selectedInvoiceForReceipt.transactionRef}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Date of Issue</p>
                <p className="text-zinc-300">{new Date(selectedInvoiceForReceipt.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Valid Until</p>
                <p className="text-emerald-400 font-bold">{new Date(selectedInvoiceForReceipt.validUntil).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-zinc-800/60">
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Billed Member</p>
                <p className="text-white font-semibold">{selectedInvoiceForReceipt.clientName} ({selectedInvoiceForReceipt.clientEmail})</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 border-b border-zinc-800 pb-4 text-xs">
              <div className="flex justify-between text-zinc-400 font-semibold py-1">
                <span>{selectedInvoiceForReceipt.tier} Membership ({selectedInvoiceForReceipt.period})</span>
                <span className="font-mono text-white font-bold">₹{selectedInvoiceForReceipt.baseAmount}</span>
              </div>
              {selectedInvoiceForReceipt.discountAmount > 0 && (
                <div className="flex justify-between text-volt font-semibold py-1">
                  <span>Promo Discount ({selectedInvoiceForReceipt.promoCodeApplied || "COUPON"})</span>
                  <span className="font-mono font-bold">-₹{selectedInvoiceForReceipt.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400 font-semibold py-1">
                <span>GST & Processing Fee</span>
                <span className="font-mono text-zinc-300">₹{selectedInvoiceForReceipt.taxAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>TOTAL PAID ({selectedInvoiceForReceipt.paymentMethod})</span>
                <span className="font-mono text-volt font-black text-base">₹{selectedInvoiceForReceipt.totalAmount}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedInvoiceForReceipt.id);
                  setCopiedInvoiceId(true);
                  setTimeout(() => setCopiedInvoiceId(false), 2000);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy size={14} /> {copiedInvoiceId ? "COPIED!" : "COPY ID"}
              </button>
              <button
                onClick={() => window.print()}
                className="bg-volt text-black hover:bg-lime-300 px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> PRINT RECEIPT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE JOB MODAL */}
      {sharingJob && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border-2 border-volt max-w-md w-full rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="font-display text-sm font-black uppercase italic text-volt flex items-center gap-2">
                <Share2 size={16} /> SHARE JOB VACANCY
              </h3>
              <button 
                onClick={() => setSharingJob(null)} 
                className="text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[9px] font-bold rounded">
                PREVIEW TEMPLATE
              </span>
              <div className="p-4 bg-[#09090b] border border-zinc-800 rounded-2xl text-left font-sans text-xs text-zinc-300 leading-relaxed whitespace-pre-line select-all">
                {`*Gym Buddy Job Vacancy!* ⚡

We are hiring a *${sharingJob.title}* at *${sharingJob.gymName}* (${sharingJob.location}).

*Position:* ${sharingJob.type}
*Salary:* ${sharingJob.salaryRange}
*About:* ${sharingJob.description}

*How to Apply:* 
📞 Call/WhatsApp: ${sharingJob.contactPhone || "+91 98765 43210"}
✉️ Email: ${sharingJob.contactEmail || "careers@gymbuddy.in"}`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `*Gym Buddy Job Vacancy!* ⚡\n\nWe are hiring a *${sharingJob.title}* at *${sharingJob.gymName}* (${sharingJob.location}).\n\n*Position:* ${sharingJob.type}\n*Salary:* ${sharingJob.salaryRange}\n\n*How to Apply:*\n📞 Call: ${sharingJob.contactPhone || "+91 98765 43210"}\n✉️ Email: ${sharingJob.contactEmail || "careers@gymbuddy.in"}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 bg-[#25D366] text-black font-mono text-xs font-black rounded-xl hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-1.5"
              >
                WHATSAPP
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(
                  `Gym Buddy Job Vacancy! ⚡\n\nWe are hiring a ${sharingJob.title} at ${sharingJob.gymName} (${sharingJob.location}).\n\nContact: ${sharingJob.contactPhone || "+91 98765 43210"} or ${sharingJob.contactEmail || "careers@gymbuddy.in"}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 bg-[#0088cc] text-white font-mono text-xs font-black rounded-xl hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-1.5"
              >
                TELEGRAM
              </a>
            </div>

            <button
              onClick={() => {
                const text = `Gym Buddy Job Vacancy! ⚡\n\nWe are hiring a ${sharingJob.title} at ${sharingJob.gymName} (${sharingJob.location}).\nPosition: ${sharingJob.type}\nSalary: ${sharingJob.salaryRange}\nAbout: ${sharingJob.description}\n\nApply via Phone: ${sharingJob.contactPhone || "+91 98765 43210"} or Email: ${sharingJob.contactEmail || "careers@gymbuddy.in"}`;
                navigator.clipboard.writeText(text);
                setCopiedText(true);
                setTimeout(() => setCopiedText(false), 2000);
              }}
              className={`w-full py-3 font-mono text-xs font-black uppercase rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                copiedText 
                  ? "bg-volt/10 border-volt text-volt" 
                  : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white"
              }`}
            >
              {copiedText ? "✓ COPIED TO CLIPBOARD" : "COPY TEXT FOR INSTAGRAM/LINKEDIN"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
