import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Support() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) { toast.error("Please fill in all fields."); return; }
    setSubmitted(true);
    toast.success("Message sent. We will respond within 2 business days.");
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-28 pb-20 max-w-3xl mx-auto">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Support</p>
        <h1 className="font-serif text-4xl font-light text-foreground mb-3">We are here to help.</h1>
        <p className="text-muted-foreground text-lg font-light mb-12">
          Whether you have a question about the platform, need help with your account, or want to request a refund — reach out and we will respond within 2 business days.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: MessageCircle, title: "General Questions", desc: "Platform features, how things work, getting started" },
            { icon: Mail, title: "Account & Billing", desc: "Subscription changes, refunds, account access" },
            { icon: BookOpen, title: "Content & Courses", desc: "Course access, digital products, resource library" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-border bg-card">
              <Icon className="h-5 w-5 text-accent mb-3" />
              <h3 className="font-serif text-base font-light text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="p-8 rounded-xl border border-accent/30 bg-accent/5 text-center">
            <h2 className="font-serif text-2xl font-light text-foreground mb-3">Message received.</h2>
            <p className="text-muted-foreground text-sm mb-5">Thank you for reaching out. We will respond to your message within 2 business days.</p>
            <Button variant="outline" asChild><Link href="/">Return Home</Link></Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-xl border border-border bg-card">
            <h2 className="font-serif text-xl font-light text-foreground mb-2">Send us a message</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">Your Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-sm">How can we help?</Label>
              <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your question or issue..." rows={5} className="resize-none" />
            </div>
            <Button type="submit" className="gap-2">
              Send Message <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Quick Links</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Terms of Service", href: "/legal/terms" },
              { label: "Privacy Policy", href: "/legal/privacy" },
              { label: "Refund Policy", href: "/legal/refunds" },
              { label: "Pricing", href: "/pricing" },
            ].map((l) => (
              <Link key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
                {l.label} <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
