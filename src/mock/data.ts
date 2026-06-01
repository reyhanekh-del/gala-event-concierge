// Deterministic mock data for the Gala prototype.
// No backend. Everything is in-memory; mutations persist to localStorage.

export type RsvpStatus = "pending" | "accepted" | "rejected" | "expired" | "checkedin" | "cancelled";

export type Guest = {
  id: string;
  name: string;
  phone: string;
  language: "en" | "ar";
  status: RsvpStatus;
  eventId: string;
  groupSize?: number;
  invitedAt: string; // ISO
  respondedAt?: string;
  inviterId?: string; // organizer or co-inviter
};

export type Event = {
  id: string;
  name: string;
  nameAr: string;
  venueId: string;
  cover: string; // gradient seed
  date: string; // ISO
  city: string;
  cityAr: string;
  address: string;
  addressAr: string;
  host: string;
  status: "upcoming" | "past" | "live";
  creditsTotal: number;
  creditsReserved: number;
  creditsConsumed: number;
  scannerPin: string;
  organizerId: string;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  creditsPurchased: number;
  creditsAllocated: number;
  revenue: number;
};

export type Organizer = {
  id: string;
  name: string;
  phone: string;
  venueId?: string;
  events: number;
};

export type CoInviter = {
  id: string;
  name: string;
  eventId: string;
  allocated: number;
  used: number;
};

export type Transaction = {
  id: string;
  date: string;
  type: "purchase" | "allocation" | "invite" | "refund";
  description: string;
  amount: number; // credits
};

export type Notification = {
  id: string;
  date: string;
  title: string;
  body: string;
  read: boolean;
};

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  popular?: boolean;
};

export type AuditEntry = {
  id: string;
  date: string;
  actor: string;
  action: string;
  target: string;
};

// ---- Seed ----
const COVERS = ["onyx", "pearl", "graphite", "smoke", "ivory", "ink"];

export const venues: Venue[] = [
  { id: "v_ritz", name: "The Ritz-Carlton Riyadh", city: "Riyadh", creditsPurchased: 12000, creditsAllocated: 8400, revenue: 184500 },
  { id: "v_addr", name: "Address Dubai Marina", city: "Dubai", creditsPurchased: 9000, creditsAllocated: 5200, revenue: 132000 },
  { id: "v_four", name: "Four Seasons Doha", city: "Doha", creditsPurchased: 6500, creditsAllocated: 3100, revenue: 95400 },
];

export const organizers: Organizer[] = [
  { id: "o_amal", name: "Amal Al-Saud", phone: "+966 50 123 4567", venueId: "v_ritz", events: 4 },
  { id: "o_kha", name: "Khalid Al-Mansoori", phone: "+971 50 987 6543", venueId: "v_addr", events: 3 },
  { id: "o_noor", name: "Noor Al-Thani", phone: "+974 33 222 1100", venueId: "v_four", events: 2 },
  { id: "o_self", name: "You (Demo)", phone: "+966 55 000 0000", events: 2 },
];

const today = new Date();
const days = (n: number) => new Date(today.getTime() + n * 86400000).toISOString();

export const events: Event[] = [
  {
    id: "e_wedding",
    name: "Royal Wedding Reception",
    nameAr: "حفل زفاف ملكي",
    venueId: "v_ritz",
    cover: "onyx",
    date: days(12),
    city: "Riyadh",
    cityAr: "الرياض",
    address: "Olaya St, The Ritz-Carlton, Riyadh",
    addressAr: "شارع العليا، الريتز كارلتون، الرياض",
    host: "Al-Saud Family",
    status: "upcoming",
    creditsTotal: 3000,
    creditsReserved: 1200,
    creditsConsumed: 850,
    scannerPin: "482917",
    organizerId: "o_amal",
  },
  {
    id: "e_gala",
    name: "Annual Charity Gala",
    nameAr: "حفل خيري سنوي",
    venueId: "v_addr",
    cover: "pearl",
    date: days(28),
    city: "Dubai",
    cityAr: "دبي",
    address: "Dubai Marina, Address Hotel",
    addressAr: "مارينا دبي، فندق العنوان",
    host: "Emirates Foundation",
    status: "upcoming",
    creditsTotal: 2000,
    creditsReserved: 800,
    creditsConsumed: 400,
    scannerPin: "751930",
    organizerId: "o_kha",
  },
  {
    id: "e_engage",
    name: "Engagement Celebration",
    nameAr: "حفل خطوبة",
    venueId: "v_four",
    cover: "graphite",
    date: days(5),
    city: "Doha",
    cityAr: "الدوحة",
    address: "Corniche, Four Seasons Doha",
    addressAr: "الكورنيش، فورسيزونز الدوحة",
    host: "Al-Thani Family",
    status: "upcoming",
    creditsTotal: 800,
    creditsReserved: 300,
    creditsConsumed: 180,
    scannerPin: "204658",
    organizerId: "o_noor",
  },
  {
    id: "e_launch",
    name: "Product Launch Dinner",
    nameAr: "عشاء إطلاق منتج",
    venueId: "v_addr",
    cover: "smoke",
    date: days(-14),
    city: "Dubai",
    cityAr: "دبي",
    address: "Address Dubai Marina",
    addressAr: "العنوان مارينا دبي",
    host: "Aurora Brand Co.",
    status: "past",
    creditsTotal: 500,
    creditsReserved: 500,
    creditsConsumed: 420,
    scannerPin: "192038",
    organizerId: "o_kha",
  },
  {
    id: "e_corp",
    name: "Corporate Anniversary",
    nameAr: "ذكرى تأسيس الشركة",
    venueId: "v_ritz",
    cover: "ivory",
    date: days(-45),
    city: "Riyadh",
    cityAr: "الرياض",
    address: "The Ritz-Carlton Ballroom",
    addressAr: "قاعة الريتز كارلتون",
    host: "Najd Holding",
    status: "past",
    creditsTotal: 1200,
    creditsReserved: 1200,
    creditsConsumed: 980,
    scannerPin: "338201",
    organizerId: "o_amal",
  },
  {
    id: "e_self",
    name: "My Birthday Soirée",
    nameAr: "حفل عيد ميلادي",
    venueId: "v_ritz",
    cover: "ink",
    date: days(40),
    city: "Riyadh",
    cityAr: "الرياض",
    address: "Private Villa, Diplomatic Quarter",
    addressAr: "فيلا خاصة، الحي الدبلوماسي",
    host: "You",
    status: "upcoming",
    creditsTotal: 300,
    creditsReserved: 120,
    creditsConsumed: 0,
    scannerPin: "555012",
    organizerId: "o_self",
  },
];

const NAMES = [
  ["Fahad Al-Otaibi", "+966 55 111 2233"],
  ["Layla Hassan", "+971 50 332 1100"],
  ["Mariam Al-Sabah", "+965 99 887 6655"],
  ["Yousef Al-Mutairi", "+966 53 444 5566"],
  ["Hessa Al-Maktoum", "+971 56 778 9900"],
  ["Tariq Al-Khalifa", "+973 39 112 3344"],
  ["Sara Al-Qasimi", "+971 50 998 7766"],
  ["Abdullah Al-Rashid", "+966 50 223 4455"],
  ["Reem Al-Faisal", "+966 56 776 8899"],
  ["Omar Bin Sultan", "+971 55 443 2211"],
  ["Fatima Al-Zahra", "+974 55 667 8899"],
  ["Saif Al-Nahyan", "+971 50 119 2233"],
  ["Aisha Al-Sabah", "+965 66 554 4332"],
  ["Hamad Al-Thani", "+974 33 998 7755"],
  ["Lulwa Al-Khalifa", "+973 36 221 5544"],
  ["Nasser Al-Maktoum", "+971 50 887 9911"],
];

const STATUSES: RsvpStatus[] = ["accepted", "accepted", "accepted", "pending", "pending", "rejected", "checkedin", "checkedin", "expired"];

export const guests: Guest[] = events.flatMap((ev, ei) =>
  NAMES.slice(0, 12 + (ei % 4)).map((n, i) => {
    const status: RsvpStatus = ev.status === "past" ? (i % 5 === 0 ? "rejected" : i % 4 === 0 ? "expired" : "checkedin") : STATUSES[(i + ei) % STATUSES.length];
    return {
      id: `g_${ev.id}_${i}`,
      name: n[0],
      phone: n[1],
      language: i % 3 === 0 ? "ar" : "en",
      status,
      eventId: ev.id,
      groupSize: i % 5 === 0 ? 2 + (i % 3) : undefined,
      invitedAt: days(-20 + i),
      respondedAt: status === "pending" ? undefined : days(-18 + i),
      inviterId: ev.organizerId,
    };
  }),
);

export const coInviters: CoInviter[] = [
  { id: "c_huda", name: "Huda Al-Salem", eventId: "e_wedding", allocated: 200, used: 145 },
  { id: "c_yara", name: "Yara Bin Zaid", eventId: "e_wedding", allocated: 150, used: 80 },
  { id: "c_omar", name: "Omar Al-Rashid", eventId: "e_gala", allocated: 100, used: 60 },
];

export const transactions: Transaction[] = [
  { id: "t1", date: days(-2), type: "purchase", description: "Bought 2,000 credits pack", amount: 2000 },
  { id: "t2", date: days(-3), type: "allocation", description: "Allocated to Royal Wedding", amount: -1000 },
  { id: "t3", date: days(-4), type: "invite", description: "Sent 12 invitations", amount: -12 },
  { id: "t4", date: days(-7), type: "purchase", description: "Bought 500 credits pack", amount: 500 },
  { id: "t5", date: days(-10), type: "refund", description: "Refunded expired invites", amount: 8 },
  { id: "t6", date: days(-15), type: "purchase", description: "Bought 10,000 credits pack", amount: 10000 },
];

export const notifications: Notification[] = [
  { id: "n1", date: days(0), title: "Fahad Al-Otaibi accepted", body: "Royal Wedding Reception", read: false },
  { id: "n2", date: days(-1), title: "Credits running low", body: "Annual Charity Gala has 200 credits left", read: false },
  { id: "n3", date: days(-1), title: "Huda checked in 12 guests", body: "Royal Wedding Reception", read: true },
  { id: "n4", date: days(-2), title: "New co-inviter added", body: "Yara Bin Zaid joined Royal Wedding", read: true },
  { id: "n5", date: days(-3), title: "Welcome to Gala", body: "Your account is ready.", read: true },
];

export const creditPackages: CreditPackage[] = [
  { id: "p_starter", name: "Starter", credits: 500, priceUsd: 99 },
  { id: "p_pro", name: "Premium", credits: 2000, priceUsd: 349, popular: true },
  { id: "p_lux", name: "Luxury", credits: 10000, priceUsd: 1499 },
];

export const auditLog: AuditEntry[] = [
  { id: "a1", date: days(0), actor: "amal@ritz.com", action: "Created event", target: "Royal Wedding Reception" },
  { id: "a2", date: days(-1), actor: "support@gala.app", action: "Resent invite", target: "Fahad Al-Otaibi" },
  { id: "a3", date: days(-2), actor: "khalid@addr.com", action: "Generated scanner PIN", target: "Annual Charity Gala" },
  { id: "a4", date: days(-3), actor: "admin@gala.app", action: "Adjusted credits +500", target: "Address Dubai Marina" },
  { id: "a5", date: days(-5), actor: "noor@fs.com", action: "Cancelled invite", target: "Sara Al-Qasimi" },
];

// ---- Helpers ----
export function eventById(id: string) {
  return events.find((e) => e.id === id);
}
export function venueById(id: string) {
  return venues.find((v) => v.id === id);
}
export function guestsByEvent(id: string) {
  return guests.filter((g) => g.eventId === id);
}
export function guestById(id: string) {
  return guests.find((g) => g.id === id);
}
export function rsvpStats(eventId: string) {
  const list = guestsByEvent(eventId);
  return {
    invited: list.length,
    accepted: list.filter((g) => g.status === "accepted" || g.status === "checkedin").length,
    rejected: list.filter((g) => g.status === "rejected").length,
    pending: list.filter((g) => g.status === "pending").length,
    expired: list.filter((g) => g.status === "expired").length,
    checkedin: list.filter((g) => g.status === "checkedin").length,
  };
}

export function totalCredits() {
  return {
    total: 14000,
    available: 8420,
    reserved: 4200,
    consumed: 1380,
  };
}

export function monthlyRevenue() {
  return [
    { month: "Jan", value: 18400 },
    { month: "Feb", value: 22100 },
    { month: "Mar", value: 26800 },
    { month: "Apr", value: 31200 },
    { month: "May", value: 28900 },
    { month: "Jun", value: 35400 },
    { month: "Jul", value: 41200 },
    { month: "Aug", value: 38800 },
    { month: "Sep", value: 44600 },
    { month: "Oct", value: 49100 },
    { month: "Nov", value: 52400 },
    { month: "Dec", value: 58900 },
  ];
}

export function responseTimeHist() {
  return [
    { bucket: "<1h", value: 42 },
    { bucket: "1-4h", value: 68 },
    { bucket: "4-12h", value: 51 },
    { bucket: "12-24h", value: 33 },
    { bucket: "1-3d", value: 22 },
    { bucket: ">3d", value: 11 },
  ];
}
