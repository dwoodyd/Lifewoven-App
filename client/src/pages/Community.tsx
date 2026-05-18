import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Bell, Sparkles, MessageCircle, Heart, BookOpen, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

const UPCOMING_FEATURES = [
  { icon: <MessageCircle className="h-5 w-5" />, title: "Shared Reflections", desc: "Post journal excerpts and receive thoughtful responses from the community." },
  { icon: <Sparkles className="h-5 w-5" />, title: "Accountability Circles", desc: "Join small groups aligned around a shared 5S focus area." },
  { icon: <Heart className="h-5 w-5" />, title: "Win Celebrations", desc: "Share breakthroughs — big and small — and be witnessed in your growth." },
  { icon: <BookOpen className="h-5 w-5" />, title: "Live Workshops", desc: "Oracle-facilitated group sessions on alignment, belief work, and identity." },
];

export default function Community() {
  const { isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [joined, setJoined] = useState(false);

  const joinWaitlist = trpc.paypalOrders.joinWaitlist.useMutation({
    onSuccess: () => {
      setJoined(true);
      toast.success("You're on the list. We'll reach out when the community opens.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleJoin = () => {
    const addr = email.trim() || user?.email || "";
    if (!addr) return toast.error("Please enter your email.");
    joinWaitlist.mutate({ email: addr, productName: "Community" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-8">
          <div className="p-2.5 sm:p-3 rounded-xl bg-secondary flex-shrink-0"><Users className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" /></div>
          <div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">Coming Soon</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2">Community</h1>
            <p className="text-muted-foreground text-base font-light max-w-xl">A space for people doing the real work — sharing the journey, not just the highlight reel.</p>
          </div>
        </div>

        {/* Waitlist card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card mb-8 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-2">Be First In</h2>
          <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">The Lifewoven community is in private beta. Join the waitlist and we'll invite you personally when the doors open.</p>
          {joined ? (
            <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
              <Sparkles className="h-4 w-4" /> You're on the list — we'll be in touch.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              {isAuthenticated ? (
                <Button onClick={handleJoin} disabled={joinWaitlist.isPending} className="w-full gap-2">
                  {joinWaitlist.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Notify Me
                </Button>
              ) : (
                <>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleJoin()}
                    className="flex-1 text-sm"
                  />
                  <Button onClick={handleJoin} disabled={joinWaitlist.isPending} className="gap-2 flex-shrink-0">
                    {joinWaitlist.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Join
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Upcoming features */}
        <h2 className="font-serif text-xl font-light text-foreground mb-5">What's Coming</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {UPCOMING_FEATURES.map(f => (
            <div key={f.title} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">{f.icon}<h3 className="font-medium text-foreground text-base">{f.title}</h3></div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
