import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "en" | "ar";

type Dict = Record<string, string>;

const en: Dict = {
  "app.gala": "Gala",
  "app.tagline": "Invitations, refined.",
  "app.launcher.title": "Choose an experience",
  "app.launcher.subtitle": "A premium invitation & RSVP platform for the GCC.",
  "app.organizer": "Organizer App",
  "app.organizer.desc": "Mobile experience for hosts & co-inviters.",
  "app.invitee": "Invitee Page",
  "app.invitee.desc": "What your guests see when invited.",
  "app.venue": "Venue Portal",
  "app.venue.desc": "Hotels & venues managing events.",
  "app.scanner": "Door Scanner",
  "app.scanner.desc": "Check guests in at the door.",
  "app.admin": "Gala Admin",
  "app.admin.desc": "Internal operations & support.",
  "nav.dashboard": "Dashboard",
  "nav.events": "Events",
  "nav.credits": "Credits",
  "nav.invite": "Invite",
  "nav.rsvp": "RSVP",
  "nav.notifications": "Notifications",
  "nav.transactions": "Transactions",
  "nav.delegation": "Delegation",
  "nav.settings": "Settings",
  "nav.analytics": "Analytics",
  "nav.revenue": "Revenue",
  "nav.venues": "Venues",
  "nav.organizers": "Organizers",
  "nav.packages": "Packages",
  "nav.audit": "Audit logs",
  "nav.support": "Support",
  "common.back": "Back",
  "common.next": "Next",
  "common.continue": "Continue",
  "common.confirm": "Confirm",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.create": "Create",
  "common.search": "Search",
  "common.copy": "Copy",
  "common.copied": "Copied",
  "common.send": "Send",
  "common.accept": "Accept",
  "common.reject": "Reject",
  "common.preview": "Preview",
  "common.total": "Total",
  "common.available": "Available",
  "common.reserved": "Reserved",
  "common.consumed": "Consumed",
  "common.credits": "credits",
  "rsvp.invited": "Invited",
  "rsvp.accepted": "Accepted",
  "rsvp.rejected": "Rejected",
  "rsvp.pending": "Pending",
  "rsvp.expired": "Expired",
  "rsvp.checkedin": "Checked in",
  "invite.you_are_invited": "You're invited",
  "invite.host": "Hosted by",
  "invite.add_wallet": "Add to Wallet",
  "invite.your_pass": "Your pass",
  "invite.show_at_door": "Show this at the door",
  "scanner.title": "Door Scanner",
  "scanner.enter_pin": "Enter event PIN",
  "scanner.scan_demo": "Scan demo QR",
  "scanner.valid": "Welcome",
  "scanner.already": "Already checked in",
  "scanner.invalid": "Invalid QR code",
  "scanner.cancelled": "Invitation cancelled",
  "scanner.wrong": "Wrong event",
  "scanner.next": "Scan next guest",
};

const ar: Dict = {
  "app.gala": "Gala",
  "app.tagline": "دعوات بأسلوب راقٍ.",
  "app.launcher.title": "اختر التجربة",
  "app.launcher.subtitle": "منصة دعوات وحضور فاخرة لدول الخليج.",
  "app.organizer": "تطبيق المنظّم",
  "app.organizer.desc": "تجربة المضيفين على الجوال.",
  "app.invitee": "صفحة المدعو",
  "app.invitee.desc": "ما يراه ضيفك عند الدعوة.",
  "app.venue": "بوابة المكان",
  "app.venue.desc": "الفنادق والقاعات.",
  "app.scanner": "ماسح الباب",
  "app.scanner.desc": "تسجيل دخول الضيوف.",
  "app.admin": "إدارة Gala",
  "app.admin.desc": "العمليات الداخلية والدعم.",
  "nav.dashboard": "الرئيسية",
  "nav.events": "الفعاليات",
  "nav.credits": "الرصيد",
  "nav.invite": "دعوة",
  "nav.rsvp": "الردود",
  "nav.notifications": "الإشعارات",
  "nav.transactions": "المعاملات",
  "nav.delegation": "التفويض",
  "nav.settings": "الإعدادات",
  "nav.analytics": "التحليلات",
  "nav.revenue": "الإيرادات",
  "nav.venues": "الأماكن",
  "nav.organizers": "المنظّمون",
  "nav.packages": "الباقات",
  "nav.audit": "سجل التدقيق",
  "nav.support": "الدعم",
  "common.back": "رجوع",
  "common.next": "التالي",
  "common.continue": "متابعة",
  "common.confirm": "تأكيد",
  "common.cancel": "إلغاء",
  "common.save": "حفظ",
  "common.create": "إنشاء",
  "common.search": "بحث",
  "common.copy": "نسخ",
  "common.copied": "تم النسخ",
  "common.send": "إرسال",
  "common.accept": "قبول",
  "common.reject": "رفض",
  "common.preview": "معاينة",
  "common.total": "الإجمالي",
  "common.available": "المتاح",
  "common.reserved": "المحجوز",
  "common.consumed": "المُستخدَم",
  "common.credits": "رصيد",
  "rsvp.invited": "مدعو",
  "rsvp.accepted": "قبل",
  "rsvp.rejected": "رفض",
  "rsvp.pending": "بانتظار الرد",
  "rsvp.expired": "منتهي",
  "rsvp.checkedin": "تم الدخول",
  "invite.you_are_invited": "أنت مدعو",
  "invite.host": "بدعوة من",
  "invite.add_wallet": "إضافة للمحفظة",
  "invite.your_pass": "تذكرتك",
  "invite.show_at_door": "اعرض هذا عند الباب",
  "scanner.title": "ماسح الباب",
  "scanner.enter_pin": "أدخل رمز الفعالية",
  "scanner.scan_demo": "مسح رمز تجريبي",
  "scanner.valid": "أهلاً وسهلاً",
  "scanner.already": "تم تسجيل الدخول مسبقاً",
  "scanner.invalid": "رمز غير صالح",
  "scanner.cancelled": "تم إلغاء الدعوة",
  "scanner.wrong": "فعالية خاطئة",
  "scanner.next": "مسح ضيف آخر",
};

const dicts: Record<Locale, Dict> = { en, ar };

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: string) => string;
  dir: "ltr" | "rtl";
};

const I18nCtx = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("gala.locale") as Locale)) || "en";
    setLocaleState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("gala.locale", locale);
  }, [locale]);

  const value: Ctx = {
    locale,
    setLocale: setLocaleState,
    t: (k) => dicts[locale][k] ?? dicts.en[k] ?? k,
    dir: locale === "ar" ? "rtl" : "ltr",
  };
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside LocaleProvider");
  return ctx;
}
