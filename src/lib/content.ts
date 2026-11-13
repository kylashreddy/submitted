// All landing-page copy lives here so the crew can edit words without touching layout.

export const UNIVERSITY = "Jain University";

export const STATS = { shipped: 247, branches: 9, vivasFailed: 0 };

export const DOMAINS = [
  "ML",
  "IOT",
  "WEB DEV",
  "BLOCKCHAIN",
  "CYBERSEC",
  "ANDROID",
  "DATA SCIENCE",
  "ROBOTICS",
];

export const STEPS = [
  { title: "DROP THE REQ", body: "Domain, deadline, what you're stuck on. Two minutes, tops." },
  { title: "WE VIBE CHECK IT", body: "A crew member emails you within 24h. Real human, real senior." },
  { title: "WE BUILD IT WITH YOU", body: "Starter code, a step-by-step guide and 1:1 doubt calls when you hit a wall." },
  { title: "INBOX DELIVERY", body: "Kit + report template + viva prep notes, straight to your mail." },
  { title: "YOU ACTUALLY UNDERSTAND IT", body: "No blank stares in the viva. You can explain every line." },
];

export const TRACKS = [
  {
    year: "1ST YEAR",
    tag: "MINI PROJECT ERA",
    stack: "C, Python, HTML, first mini projects",
    includes: ["Idea shortlist that fits your syllabus", "Starter code + line-by-line comments", "1-page report format", "1 doubt call"],
  },
  {
    year: "2ND YEAR",
    tag: "SKILL UNLOCK",
    stack: "Web, apps, DBMS, hackathon builds",
    includes: ["Repo with a working base build", "DB schema + ER diagram", "Report + PPT template", "2 doubt calls"],
  },
  {
    year: "3RD YEAR",
    tag: "MAIN CHARACTER ARC",
    stack: "ML, IoT, full-stack, internship-ready builds",
    includes: ["Dataset / hardware list sorted", "Architecture diagram", "Build guide you can follow solo", "Viva Q&A sheet", "2 doubt calls"],
  },
  {
    year: "4TH YEAR",
    tag: "FINAL BOSS",
    stack: "Major project, research paper, report + viva prep",
    includes: ["Full build mentoring, phase by phase", "Research paper structure + lit review help", "Full report in your college format", "Mock viva with a senior", "Unlimited* doubt calls"],
  },
];

export const RECEIPTS = [
  { quote: "bro the viva prep notes saved my life", who: "Ananya", meta: "3RD YR · CSE", time: "23:47" },
  { quote: "external asked me 6 questions. 5 were literally on the sheet 💀", who: "Rohit", meta: "4TH YR · ECE", time: "14:12" },
  { quote: "my guide said 'good work' for the first time in 3 years", who: "Sneha", meta: "4TH YR · IT", time: "18:03" },
  { quote: "ngl i thought it'd be a scam. it ran on the first try", who: "Arjun", meta: "2ND YR · AIML", time: "02:31" },
  { quote: "they explained the arduino wiring like i was 5. needed that", who: "Meghana", meta: "3RD YR · EEE", time: "11:58" },
  { quote: "submitted 4 hrs early. who even am i", who: "Faiz", meta: "1ST YR · CSE", time: "20:20" },
];

export const COUNTERS = [
  { n: STATS.shipped, label: "PROJECTS SHIPPED" },
  { n: STATS.branches, label: "BRANCHES COVERED" },
  { n: 24, label: "HR FIRST REPLY", suffix: "h" },
  { n: STATS.vivasFailed, label: "VIVAS FAILED" },
];

// Second marquee in the dark section: the things students actually get stuck on.
export const STUCK_ON = ["FIRST REVIEW", "SYNOPSIS", "MID-SEM DEMO", "REPORT FORMAT", "PLAGIARISM CHECK", "FINAL VIVA", "PPT NIGHT"];

export const DROP = [
  { title: "STARTER CODE REPO", body: "Private GitHub repo, clean commits, runs out of the box." },
  { title: "BUILD GUIDE", body: "Step-by-step doc so you can rebuild it yourself." },
  { title: "ARCHITECTURE DIAGRAM", body: "The box-and-arrow slide every external asks for." },
  { title: "DATASET", body: "Cleaned, sourced, and legal to use." },
  { title: "REPORT TEMPLATE", body: "Your college's format. Chapters pre-structured." },
  { title: "PPT TEMPLATE", body: "Slides that don't look like 2009." },
  { title: "VIVA Q&A SHEET", body: "The 40 questions they always ask, with answers you understand." },
  { title: "2 DOUBT-CLEARING CALLS", body: "Screen share. Ask the 'dumb' questions. No judgement." },
];

// Public crew list is anonymous on purpose — roles only, no names.
// Add a `photo` path (file in /public/crew) to swap the placeholder for a portrait.
export type CrewMember = { role: string; shipped: number; photo?: string };

export const CREW: CrewMember[] = [
  { role: "FULL STACK · AI/ML", shipped: 60 },
  { role: "IOT · EMBEDDED", shipped: 42 },
  { role: "DATA SCIENCE · RESEARCH", shipped: 51 },
  { role: "ANDROID · WEB", shipped: 38 },
];

/** Names for the admin "assign to" menu. Server-only: set CREW_MEMBERS in env so names never ship to the public site. */
export function crewNames(): string[] {
  const fromEnv = (process.env.CREW_MEMBERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : CREW.map((_, i) => `MENTOR ${String(i + 1).padStart(2, "0")}`);
}

export const FAQ = [
  {
    q: "IS THIS CHEATING?",
    a: "No. We help you build and understand it. You still do the work — just without the panic.",
  },
  {
    q: "HOW FAST?",
    a: "First reply within 24 hours. Most kits land in 3–7 days. Due tomorrow? Still drop it — pick the 1-day deadline and we'll be honest about what's doable.",
  },
  {
    q: "ARE YOU PART OF JAIN UNIVERSITY?",
    a: "No. We're an independent crew of seniors who've survived the same reviews, formats and vivas. Not affiliated with the university.",
  },
  {
    q: "WHAT IF IT DOESN'T RUN?",
    a: "Then it's on us. Hop on a call, we fix it with you until it runs on your machine. That's the deal.",
  },
  {
    q: "DO YOU KNOW THE JAIN REPORT FORMAT?",
    a: "Send us your department's format PDF or a senior's report. We match margins, chapter order, everything.",
  },
];

export const BRANCHES = ["CSE", "IT", "AIML", "AIDS", "ECE", "EEE", "MECH", "CIVIL", "OTHER"];
