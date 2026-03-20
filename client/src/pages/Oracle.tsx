import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Send, Loader2, RefreshCw, BookOpen, Brain, Heart, Zap } from "lucide-react";
import { Streamdown } from "streamdown";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

const ORACLE_STARTERS = [
  "I feel stuck and don't know where to start.",
  "Help me understand my emotional state right now.",
  "I want to rewrite a limiting belief I have about myself.",
  "What habits should I focus on building first?",
  "I'm facing a big decision and need clarity.",
  "How do I find meaning in what I'm going through?",
  "I want to get into alignment. Where do I begin?",
];

const WISDOM_SOURCES = [
  { icon: Brain, label: "Ernest Holmes", desc: "Science of Mind — the creative power of thought" },
  { icon: Heart, label: "Abraham-Hicks", desc: "Law of Attraction — emotional alignment and the Vortex" },
  { icon: Sparkles, label: "Viktor Frankl", desc: "Logotherapy — meaning as the root of resilience" },
  { icon: Zap, label: "James Clear", desc: "Atomic Habits — identity-based behavior change" },
];

type Message = { role: "user" | "assistant"; content: string };

export default function Oracle() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = trpc.oracle.chat.useMutation({
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      setIsLoading(false);
    },
    onError: () => { toast.error("Oracle is unavailable. Try again."); setIsLoading(false); },
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = (content: string) => {
    if (!content.trim() || isLoading) return;
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    chat.mutate({ message: content });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <div className="container pt-24 pb-6 max-w-3xl mx-auto flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-accent/10 flex-shrink-0">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-1">The Oracle</h1>
            <p className="text-muted-foreground text-sm font-light">
              Your personal AI guide, drawing from four pillars of transformational wisdom.
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <Sparkles className="h-16 w-16 text-accent mb-6" />
            <h2 className="font-serif text-2xl font-light text-foreground mb-3">The Oracle awaits you.</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm">Sign in to access your personal AI guide, powered by the wisdom of the ages.</p>
            <Button asChild><a href={getLoginUrl()}>Begin Your Journey</a></Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 gap-4">

            {/* Orientation panel — shown only before first message */}
            {messages.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-light text-foreground leading-relaxed mb-4">
                  The Oracle is not a search engine. It is a reflective guide — trained to meet you where you are, draw connections across your 5S dimensions, and offer wisdom that is both timeless and personally relevant to your situation.
                </p>
                <p className="text-sm font-light text-muted-foreground leading-relaxed mb-4">
                  You can ask anything: a question you are wrestling with, a feeling you cannot name, a decision you are avoiding, or simply "where do I begin?" The Oracle will respond with clarity, compassion, and direction.
                </p>
                <button
                  onClick={() => setShowSources(s => !s)}
                  className="text-xs font-mono text-accent hover:underline tracking-wider uppercase flex items-center gap-1"
                >
                  <BookOpen className="h-3 w-3" />
                  {showSources ? "Hide" : "See"} the wisdom sources
                </button>
                {showSources && (
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {WISDOM_SOURCES.map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/40">
                        <Icon className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-2 min-h-[200px] max-h-[55vh]">
              {messages.length === 0 ? (
                <div className="pt-2">
                  <p className="font-serif text-base font-light text-muted-foreground mb-4">What would you like to explore today?</p>
                  <div className="grid grid-cols-1 gap-2">
                    {ORACLE_STARTERS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-left p-3.5 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-foreground text-background rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                      {msg.role === "assistant" ? <Streamdown>{msg.content}</Streamdown> : msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span className="text-xs text-muted-foreground italic">The Oracle is reflecting...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="Ask the Oracle anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                className="resize-none text-sm min-h-[52px] max-h-[120px]"
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} size="icon" className="h-[52px] w-[52px] flex-shrink-0">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
                {messages.length > 0 && (
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => setMessages([])} title="New conversation">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              The Oracle draws from Ernest Holmes, Abraham-Hicks, Viktor Frankl, and James Clear.{" "}
              Not a substitute for professional mental health advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
