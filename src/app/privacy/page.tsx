import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy — SUBMITTED." };

// Public privacy policy + data-deletion instructions (Meta / ManyChat ask for one).
const SECTIONS = [
  {
    h: "WHAT WE COLLECT",
    p: "From the request form: your name, email, branch, year, project domain, title, deadline and notes. From Instagram DMs to @submitted.co: your messages and Instagram user ID, so we can reply.",
  },
  {
    h: "WHY",
    p: "Only to reply to you and help with your project. We don't sell or share your data, and we don't run ads with it.",
  },
  {
    h: "AUTOMATED REPLIES",
    p: "Our Instagram account sends automatic replies to some messages (like questions about deadlines) using Meta Business Suite and ManyChat. A crew member reads and answers everything else.",
  },
  {
    h: "WHERE IT LIVES",
    p: "Requests are stored in our database (Supabase). Instagram messages stay in Instagram, Meta Business Suite and ManyChat. We use privacy-friendly visit counts (Vercel Analytics) — no ad trackers, no cookies for ads.",
  },
  {
    h: "DELETE YOUR DATA",
    p: "DM @submitted.co or mail bit.geniuses.ac@gmail.com with \"DELETE\" and your REQ number or email. We remove your request within 7 days and confirm when it's done.",
  },
];

export default function Privacy() {
  return <LegalPage title="PRIVACY." updated="13 NOV 2026" sections={SECTIONS} />;
}
