import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Streamdown } from "streamdown";
import { useState } from "react";
import { toast } from "sonner";

export default function JournalEntry() {
  const [, params] = useRoute("/journal/:id");
  const id = parseInt(params?.id || "0");
  const { isAuthenticated } = useAuth();
  const [isReflecting, setIsReflecting] = useState(false);

  const { data: entry, refetch } = trpc.journal.get.useQuery({ id }, { enabled: isAuthenticated && !!id });
  const generateReflection = trpc.journal.generateReflection.useMutation({
    onSuccess: () => { toast.success("Oracle reflection added."); setIsReflecting(false); refetch(); },
    onError: () => setIsReflecting(false),
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-2xl mx-auto">
        <Link href="/journal"><div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6"><ArrowLeft className="h-3.5 w-3.5" /> Back to Journal</div></Link>
        {entry ? (
          <div>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="font-serif text-3xl font-light text-foreground mb-1">{entry.title || "Untitled Entry"}</h1>
                <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {!entry.aiReflection && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-shrink-0" onClick={() => { setIsReflecting(true); generateReflection.mutate({ entryId: entry.id, content: entry.content }); }} disabled={isReflecting}>
                  {isReflecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Oracle Reflect
                </Button>
              )}
            </div>
            <div className="prose prose-sm max-w-none text-foreground font-light leading-relaxed mb-8 whitespace-pre-wrap">{entry.content}</div>
            {entry.aiReflection && (
              <div className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-amber-500" /><p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Oracle Reflection</p></div>
                <Streamdown className="text-sm text-foreground leading-relaxed">{entry.aiReflection}</Streamdown>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16"><BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Entry not found.</p></div>
        )}
      </div>
    </div>
  );
}
