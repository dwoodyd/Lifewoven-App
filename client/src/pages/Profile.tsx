import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, BookOpen, Activity, Star, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: dashData } = trpc.profile.dashboard.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-20 pb-24 max-w-xl mx-auto text-center px-4 sm:px-6">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-light text-foreground mb-3">Your Profile</h1>
          <p className="text-muted-foreground mb-8">Sign in to view your profile, track your progress, and manage your account.</p>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-light text-foreground mb-1">{user?.name || "Seeker"}</h1>
          <p className="text-sm text-muted-foreground mb-6">{user?.email || ""}</p>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => logout()}><LogOut className="h-3.5 w-3.5" /> Sign Out</Button>
        </div>
        {dashData && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              { icon: BookOpen, label: "Recent Journals", value: dashData.recentJournals?.length ?? 0 },
              { icon: Activity, label: "Recent Check-ins", value: dashData.recentCheckIns?.length ?? 0 },
              { icon: Star, label: "Active Habits", value: dashData.activeHabits?.length ?? 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-3 sm:p-5 rounded-2xl border border-border bg-card text-center">
                <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-light text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-serif text-xl font-light text-foreground mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[{ href: "/dashboard", label: "Dashboard" }, { href: "/journal", label: "Journal" }, { href: "/pricing", label: "Upgrade Plan" }, { href: "/store", label: "Store" }].map(({ href, label }) => (
              <Link key={href} href={href}><div className="p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-sm text-foreground">{label}</div></Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
