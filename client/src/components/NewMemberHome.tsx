/**
 * NewMemberHome — shown to authenticated users who have NOT yet taken the audit.
 * One calm, clear first step. No overwhelm.
 */
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function NewMemberHome({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase mb-6">
        Welcome
      </p>
      <h1
        className="leading-[1.08] mb-5"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 500 }}
      >
        Good to have you, {firstName}.
      </h1>
      <p
        className="text-muted-foreground leading-relaxed mb-10 max-w-sm"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)" }}
      >
        The first step is to find out where you are. The Alignment Audit takes five minutes and tells you exactly where to begin.
      </p>
      <Link
        href="/audit"
        className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
      >
        Take the Alignment Audit
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      <p className="mt-5 text-xs text-muted-foreground">
        5 minutes · 12 questions · Free
      </p>
    </div>
  );
}
