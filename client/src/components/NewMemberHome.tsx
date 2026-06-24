/**
 * NewMemberHome — shown to authenticated users who have NOT yet taken the audit.
 * One calm, clear first step. No overwhelm.
 * Spec: lifewoven-returning-member-home-spec.html — "Logged-in, brand-new member" branch
 */
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";

export default function NewMemberHome({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="max-w-[520px] mx-auto px-6 flex flex-col items-center text-center pt-28 pb-24">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase mb-6">
          Welcome
        </p>
        <h1
          className="leading-[1.06] mb-4 text-foreground"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.6rem, 7vw, 3.8rem)",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Good to have you, {firstName}.
        </h1>
        <p
          className="text-muted-foreground leading-relaxed mb-10 max-w-sm"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(1.1rem, 2.8vw, 1.3rem)",
          }}
        >
          The first step is to find out where you are. The Capacity Audit takes five minutes and tells you exactly where to begin.
        </p>
        <Link
          href="/audit"
          className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-85 transition-opacity"
        >
          Take the Capacity Audit
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          5 minutes · 12 questions · Free
        </p>
      </main>
    </div>
  );
}
