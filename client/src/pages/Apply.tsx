/**
 * /apply — Founding Member Application Page
 * A single-page, high-conviction application form for Cohort 1.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const TIER_INFO = {
  explorer: { label: "Explorer", price: "$5/mo", desc: "Standalone tools — journal, habits, mood rhythm, and the 5S framework." },
  seeker:   { label: "Seeker",   price: "$9/mo", desc: "Everything in Explorer plus the Oracle AI, pathways, and community." },
  oracle:   { label: "Oracle",   price: "$19/mo", desc: "Full access — Seeker + the complete resource library, all courses, and early features." },
};

export default function Apply() {
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.applications.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || answer.trim().length < 50) return;
    submit.mutate({ name: name.trim(), email: email.trim(), answer: answer.trim(), origin: window.location.origin });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <CheckCircle2 className="h-14 w-14 text-accent mx-auto" />
          <h1 className="text-3xl font-serif text-foreground">You're in the queue.</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            I received your application. Check your inbox — I've sent a confirmation.
            I review every application personally and will be in touch soon.
          </p>
          <p className="text-muted-foreground/60 text-sm italic">— Lumen, on behalf of Lifewoven</p>
          <Link href="/">
            <Button variant="outline">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-xs tracking-[4px] uppercase text-accent mb-4">Lifewoven · Cohort 1</p>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight mb-6">
          Founding Member Access
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Lifewoven is not open to the public yet. Cohort 1 is small by design — a group of people who are already doing the work and want a platform built around it.
        </p>
        <p className="text-base text-muted-foreground/70 mt-4 leading-relaxed max-w-xl mx-auto">
          If approved, your rate is locked for life. No price increases, ever.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="max-w-3xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(TIER_INFO) as [keyof typeof TIER_INFO, typeof TIER_INFO[keyof typeof TIER_INFO]][]).map(([key, t]) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-card p-5 space-y-2"
            >
              <p className="text-xs tracking-[3px] uppercase text-accent">{t.label}</p>
              <p className="text-2xl font-serif text-accent">{t.price}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              <p className="text-xs text-muted-foreground/50 italic">Rate locked for life if approved</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-4">
          You don't choose a tier here — I'll assign one based on your application and where you are in your work.
        </p>
      </div>

      {/* Application Form */}
      <div className="max-w-xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-serif text-foreground mb-2">Apply for Access</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            One question. No pitch, no resume. Just tell me where you are.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs tracking-[2px] uppercase text-muted-foreground">Your Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs tracking-[2px] uppercase text-muted-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs tracking-[2px] uppercase text-muted-foreground">
                Where are you in your work right now?
              </label>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                Not your credentials. Not your goals. Where are you actually standing? What's alive, what's stuck, what are you moving toward?
              </p>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write freely. There's no right answer — I'm looking for honesty, not polish."
                rows={7}
                required
                minLength={50}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground/50 text-right">{answer.length} / 2000</p>
            </div>

            {submit.error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                {submit.error.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={submit.isPending || !name.trim() || !email.trim() || answer.trim().length < 50}
              className="w-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submit.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
              ) : "Submit Application"}
            </Button>

            <p className="text-xs text-center text-muted-foreground/50 leading-relaxed">
              Applications are reviewed personally. You'll hear back within a few days.
              No spam, no newsletter — just a decision.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
