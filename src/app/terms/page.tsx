import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms — SUBMITTED." };

const SECTIONS = [
  {
    h: "WHAT WE DO",
    p: "SUBMITTED. is an independent crew of seniors who mentor students through their projects: idea selection, code guidance, report structure, presentation and viva preparation. We teach and guide — you build.",
  },
  {
    h: "YOUR WORK IS YOURS",
    p: "You are responsible for the work you submit and for following your university's academic rules. Starter code, templates and notes we share are learning material to build on and understand, not something to hand in as-is.",
  },
  {
    h: "NOT AFFILIATED",
    p: "We are not part of, endorsed by, or connected to Jain University or any other institution. University names are used only to describe who we help.",
  },
  {
    h: "NO GUARANTEES ON GRADES",
    p: "We help you understand and finish your project, but marks are decided by your faculty and examiners. We can't promise any particular grade or outcome.",
  },
  {
    h: "SCOPE & TIMELINES",
    p: "Scope, timeline and anything else are agreed with a crew member before work starts. If a deadline isn't realistic, we'll tell you upfront instead of overpromising.",
  },
  {
    h: "WE CAN SAY NO",
    p: "We may decline any request — for example, if it asks us to sit an exam, impersonate you, or do anything that breaks academic rules.",
  },
  {
    h: "CONTACT",
    p: "Questions about these terms? DM @submitted.co on Instagram or mail bit.geniuses.ac@gmail.com.",
  },
];

export default function Terms() {
  return <LegalPage title="TERMS." updated="13 NOV 2026" sections={SECTIONS} />;
}
