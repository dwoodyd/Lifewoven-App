import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { LoomCorner } from "@/components/Loom";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Send, Loader2, RefreshCw, BookOpen, Brain, Heart, Zap,
  AlertCircle, TrendingUp, MessageSquare, BarChart3, Shield, ChevronRight,
  RotateCcw, PhoneCall,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

const ORACLE_STARTERS = [
  "I feel stuck and don't know where to start.",
  "Help me understand my emotional state right now.",
  "I want to rewrite a constraining belief I have about myself.",
  "What habits should I focus on building first?",
  "I'm facing a big decision and need clarity.",
  "How do I find meaning in what I'm going through?",
  "I want to get into alignment. Where do I begin?",
];

const UNSTUCK_STARTERS = [
  "I know what I should do but I can't make myself do it.",
  "I started strong and then completely stopped. Again.",
  "I feel overwhelmed and I don't know where to begin.",
  "I've been avoiding something important. Help me understand why.",
  "I feel like I'm going in circles. Nothing is changing.",
  "I'm exhausted and I don't know if I'm making progress.",
];

const WISDOM_SOURCES = [
  { icon: Brain, label: "Mind Science", desc: "The creative power of thought and interior state — how consciousness shapes experience" },
  { icon: Heart, label: "Interior Alignment", desc: "Lifewoven Framework — emotional guidance and the art of allowing" },
  { icon: Sparkles, label: "Meaning-Centered Philosophy", desc: "Meaning as the root of resilience and purpose — the Lifewoven Why dimension" },
  { icon: Zap, label: "Behavioral Science", desc: "Identity-based habit formation — systems over goals" },
];

// Crisis keywords — triggers a safety resource prompt instead of LLM call
const CRISIS_KEYWORDS = /\b(suicid|kill myself|end my life|don't want to be here|want to die|self.harm|hurt myself|no reason to live|can't go on)\b/i;

type Message = { role: "user" | "assistant"; content: string; error?: boolean; crisis?: boolean; tags?: string[] };
type OracleMode = "guide" | "unstuck" | "patterns";

export default function Oracle() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem("oracle_consent") === "true";
  });
  const [mode, setMode] = useState<OracleMode>("guide");
  const [loomPulse, setLoomPulse] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const insights = trpc.oracle.insights.useQuery(undefined, { enabled: isAuthenticated && hasConsented });

  const chat = trpc.oracle.chat.useMutation({
    onSuccess: (data: any) => {
      setMessages(prev => [...prev.filter(m => !m.error), { role: "assistant", content: data.reply, tags: data.tags ?? [] }]);
      setIsLoading(false);
      setLoomPulse(true);
      setTimeout(() => setLoomPulse(false), 800);
    },
    onError: (err: any) => {
      const isTierGate = err?.data?.code === "FORBIDDEN" || err?.message?.includes("Oracle membership tier");
      setMessages(prev => [
        ...prev.filter(m => !m.error),
        {
          role: "assistant",
          content: isTierGate
            ? "__UPGRADE__"
            : "The Oracle couldn't reach you just now. Please try again in a moment.",
          error: true,
        },
      ]);
      setIsLoading(false);
    },
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleConsent = () => {
    localStorage.setItem("oracle_consent", "true");
    setHasConsented(true);
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || isLoading) return;

    // Crisis safety check — route to human resources, do not call LLM
    if (CRISIS_KEYWORDS.test(content)) {
      setMessages(prev => [
        ...prev,
        { role: "user", content },
        {
          role: "assistant",
          content: "crisis",
          crisis: true,
        },
      ]);
      setInput("");
      return;
    }

    const modePrefix = mode === "unstuck"
      ? "[UNSTUCK MODE] The user is feeling stuck. Respond with compassionate, practical guidance that helps them identify what is blocking them and one small next step. Do not lecture. Do not overwhelm. "
      : "";
    const cleanMessages = messages.filter(m => !m.error);
    const newMessages: Message[] = [...cleanMessages, { role: "user", content }];
    setMessages(newMessages);
    setLastUserMessage(content);
    setInput("");
    setIsLoading(true);
    chat.mutate({ message: modePrefix + content });
  };

  const retryLastMessage = () => {
    if (!lastUserMessage || isLoading) return;
    setMessages(prev => prev.filter(m => !m.error));
    setIsLoading(true);
    const modePrefix = mode === "unstuck"
      ? "[UNSTUCK MODE] The user is feeling stuck. Respond with compassionate, practical guidance that helps them identify what is blocking them and one small next step. Do not lecture. Do not overwhelm. "
      : "";
    chat.mutate({ message: modePrefix + lastUserMessage });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <div className="container pt-20 pb-6 max-w-3xl mx-auto flex flex-col flex-1 items-center justify-center text-center py-12 px-4 sm:px-6">
          <Sparkles className="h-16 w-16 text-accent mb-6" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">The Oracle awaits you.</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm">Sign in to access your personal AI guide, powered by the wisdom of the ages.</p>
          <Button asChild><a href={getLoginUrl()}>Begin Your Journey</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <div className="container pt-20 pb-6 max-w-3xl mx-auto flex flex-col flex-1 px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 rounded-xl bg-accent/10 flex-shrink-0">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-1">The Oracle</h1>
            <p className="text-muted-foreground text-sm font-light">
              Your personal AI guide, drawing from four pillars of transformational wisdom.
            </p>
          </div>
        </div>

        {/* Consent Gate — shown once, then remembered */}
        {!hasConsented && (
          <div className="rounded-xl border border-border bg-card p-6 mb-5">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground mb-1">Before we begin — a note on personalization</p>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  The Oracle can provide more relevant guidance when it draws on patterns from your journal entries, emotional check-ins, and habit history. This is entirely optional. You can use the Oracle without enabling this feature.
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button size="sm" onClick={handleConsent} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Enable personalized guidance
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setHasConsented(true)} className="text-muted-foreground">
                Use without personalization
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              You can change this preference anytime in{" "}
              <Link href="/settings" className="text-accent hover:underline">Settings → Oracle Preferences</Link>.
            </p>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-5 border-b border-border pb-4 overflow-x-auto">
          {[
            { id: "guide" as OracleMode, label: "Guide", icon: MessageSquare, desc: "Open conversation" },
            { id: "unstuck" as OracleMode, label: "Unstuck", icon: AlertCircle, desc: "When you're blocked" },
            { id: "patterns" as OracleMode, label: "Pattern Mirror", icon: BarChart3, desc: "Your insights" },
          ].map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                mode === id
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="font-medium">{label}</span>
              <span className="hidden sm:inline text-xs opacity-60">— {desc}</span>
            </button>
          ))}
        </div>

        {/* Pattern Mirror Tab */}
        {mode === "patterns" && (
          <div className="flex-1">
            <div className="mb-5">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Pattern Mirror</p>
              <p className="text-sm text-muted-foreground font-light">
                The Oracle has been watching. Here is what it has noticed across your journal entries, check-ins, and habits.
              </p>
            </div>
            {insights.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Scanning your patterns...</span>
              </div>
            ) : insights.data && insights.data.length > 0 ? (
              <div className="space-y-4">
                {insights.data.map((insight: any) => (
                  <div key={insight.id} className="p-5 rounded-xl border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {insight.insightType?.replace(/_/g, " ") || "Pattern"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(insight.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-base text-foreground font-light leading-relaxed">{insight.content}</p>
                        {insight.recommendedAction && (
                          <div className="mt-3 flex items-center gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-accent shrink-0" />
                            <p className="text-xs text-accent font-medium">{insight.recommendedAction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <TrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-serif text-lg font-light text-foreground mb-2">No patterns yet</p>
                <p className="text-base text-muted-foreground max-w-xs mx-auto">
                  The Oracle needs a few journal entries and check-ins before it can recognize patterns. Start there.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/journal">Open Journal</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Chat Area (Guide + Unstuck modes) */}
        {mode !== "patterns" && (
          <div className="flex flex-col flex-1 min-h-0 gap-4">

            {/* Unstuck mode banner */}
            {mode === "unstuck" && (
              <div className="rounded-xl border border-orange-200/40 bg-orange-50/5 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Unstuck Mode</p>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      You are not broken. You are not failing. You are a person whose system needs a different kind of input right now. The Oracle will respond with compassion and one small, concrete next step — nothing more.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Orientation panel — shown only before first message in guide mode */}
            {messages.length === 0 && mode === "guide" && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-base font-light text-foreground leading-relaxed mb-4">
                  The Oracle is not a search engine. It is a reflective guide — trained to meet you where you are, draw connections across your 5S dimensions, and offer wisdom that is both timeless and personally relevant to your situation.
                </p>
                <p className="text-base font-light text-muted-foreground leading-relaxed mb-4">
                  You can ask anything: a question you are wrestling with, a feeling you cannot name, a decision you are avoiding, or simply "where do I begin?"
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-2 min-h-[200px] max-h-[45vh] sm:max-h-[50vh]">
              {messages.length === 0 ? (
                <div className="pt-2">
                  <p className="font-serif text-base font-light text-muted-foreground mb-4">
                    {mode === "unstuck" ? "What is blocking you right now?" : "What would you like to explore today?"}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {(mode === "unstuck" ? UNSTUCK_STARTERS : ORACLE_STARTERS).map(s => (
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
                messages.map((msg, i) => {
                  // Crisis safety card
                  if (msg.crisis) {
                    return (
                      <div key={i} className="flex justify-start">
                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <PhoneCall className="h-3.5 w-3.5 text-red-400" />
                        </div>
                        <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-sm bg-red-50/10 border border-red-300/20 text-sm leading-relaxed space-y-3">
                          <p className="font-medium text-foreground">I hear you. What you're feeling matters deeply.</p>
                          <p className="text-muted-foreground font-light">
                            The Oracle is not equipped to provide crisis support — but real, caring humans are available right now.
                          </p>
                          <div className="space-y-1.5">
                            <p className="text-sm font-medium text-foreground">If you're in the US:</p>
                            <p className="text-sm text-muted-foreground">Call or text <strong className="text-foreground">988</strong> — Suicide &amp; Crisis Lifeline, available 24/7.</p>
                            <p className="text-sm text-muted-foreground">Crisis Text Line: Text <strong className="text-foreground">HOME</strong> to <strong className="text-foreground">741741</strong>.</p>
                          </div>
                          <p className="text-xs text-muted-foreground/70 italic">Please reach out to one of these resources. You deserve real support.</p>
                        </div>
                      </div>
                    );
                  }
                  // Error card with retry or upgrade CTA
                  if (msg.error) {
                    const isUpgradePrompt = msg.content === "__UPGRADE__";
                    return (
                      <div key={i} className="flex justify-start">
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <div className="max-w-[80%] p-4 rounded-2xl rounded-bl-sm bg-card border border-border/60 text-sm space-y-3">
                          {isUpgradePrompt ? (
                            <>
                              <p className="font-medium text-foreground">Oracle AI is available on the Oracle plan.</p>
                              <p className="text-muted-foreground text-xs">Upgrade to unlock unlimited Oracle AI sessions — your personal guide rooted in the full 5S Framework.</p>
                              <Link href="/pricing">
                                <Button size="sm" className="gap-1.5 h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                                  <Sparkles className="h-3 w-3" />
                                  Upgrade to Oracle
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <>
                              <p className="text-muted-foreground italic">{msg.content}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-7 text-xs"
                                onClick={retryLastMessage}
                                disabled={isLoading}
                              >
                                <RotateCcw className="h-3 w-3" />
                                Try again
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                  // Normal message
                  return (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-foreground text-background rounded-br-sm p-4" : "bg-card border border-border rounded-bl-sm"}`}>
                        {msg.role === "assistant" ? (
                          <>
                            <div className="p-4">
                              <Streamdown>{msg.content}</Streamdown>
                            </div>
                            {msg.tags && msg.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-0 border-t border-border/40 mt-1">
                                {msg.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                                      tag === "State" ? "bg-state/15 text-state border border-state/25" :
                                      tag === "Story" ? "bg-story/15 text-story border border-story/25" :
                                      tag === "Standards" ? "bg-standards/15 text-standards border border-standards/25" :
                                      tag === "Strategy" ? "bg-strategy/15 text-strategy border border-strategy/25" :
                                      "bg-stewardship/15 text-stewardship border border-stewardship/25"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-4">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  );
                })
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
                placeholder={mode === "unstuck" ? "Describe what is blocking you..." : "Ask the Oracle anything..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                className="resize-none text-sm min-h-[52px] max-h-[120px]"
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} size="icon" className="h-[52px] w-[52px] flex-shrink-0" aria-label="Send message">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
                {messages.length > 0 && (
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => { setMessages([]); setLastUserMessage(""); }} aria-label="New conversation" title="New conversation">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              The Oracle draws from the Lifewoven 5S Framework and the wisdom traditions that inform it.{" "}
              Not a substitute for professional mental health advice.
            </p>
          </div>
        )}
      </div>
      <LoomCorner size={52} pulse={loomPulse} tooltip="Loom listens" />
    </div>
  );
}
