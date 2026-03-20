import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Send, Loader2, RefreshCw } from "lucide-react";
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

type Message = { role: "user" | "assistant"; content: string };

export default function Oracle() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex-shrink-0">
            <Sparkles className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-1">The Oracle</h1>
            <p className="text-muted-foreground text-sm font-light">Your AI guide, drawing from the wisdom of Holmes, Hicks, Frankl, and Clear. Ask anything.</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <Sparkles className="h-16 w-16 text-amber-400 mb-6" />
            <h2 className="font-serif text-2xl font-light text-foreground mb-3">The Oracle awaits you.</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm">Sign in to access your personal AI guide, powered by the wisdom of the ages.</p>
            <Button asChild><a href={getLoginUrl()}>Begin Your Journey</a></Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[60vh]">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-serif text-lg font-light text-foreground mb-6">What would you like to explore today?</p>
                  <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
                    {ORACLE_STARTERS.map(s => (
                      <button key={s} onClick={() => sendMessage(s)} className="text-left p-3 rounded-xl border border-border hover:border-amber-300 hover:bg-amber-50/50 transition-all text-sm text-muted-foreground hover:text-foreground">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-foreground text-background rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                      {msg.role === "assistant" ? <Streamdown>{msg.content}</Streamdown> : msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span className="text-xs text-muted-foreground">The Oracle is reflecting...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
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
            <p className="text-xs text-muted-foreground text-center mt-3">The Oracle draws from Ernest Holmes, Abraham-Hicks, Viktor Frankl, and James Clear. Not a substitute for professional advice.</p>
          </div>
        )}
      </div>
    </div>
  );
}
