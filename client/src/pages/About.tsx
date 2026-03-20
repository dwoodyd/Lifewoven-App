import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const TEACHERS = [
  { name: "Ernest Holmes", years: "1887–1960", role: "Founder, Science of Mind", quote: "The Universe is a spiritual system and man is a part of it. Change your thinking, change your life." },
  { name: "Abraham-Hicks", years: "Esther Hicks", role: "Law of Attraction Teachings", quote: "You are the creator of your own reality. The Universe adores you and knows only abundance." },
  { name: "Viktor Frankl", years: "1905–1997", role: "Logotherapy, Man's Search for Meaning", quote: "He who has a why to live for can bear almost any how." },
  { name: "James Clear", years: "Contemporary", role: "Atomic Habits, Behavior Science", quote: "You do not rise to the level of your goals. You fall to the level of your systems." },
  { name: "Summer McStravick", years: "Contemporary", role: "Flowdreaming, Creative Manifestation", quote: "Flowdreaming is the art of using emotion and imagination to co-create your life with the Universe." },
  { name: "Wayne Dyer", years: "1940–2015", role: "Self-Actualization, Spiritual Psychology", quote: "Change the way you look at things and the things you look at change." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">About</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">The Wisdom Behind LifeOS</h1>
          <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto leading-relaxed">LifeOS is built on a simple premise: the most powerful tools for human transformation have existed for decades — even centuries. They have been proven by millions of people across every culture and context. We have distilled them into a single, coherent system.</p>
        </div>
        <div className="p-8 rounded-2xl border border-border bg-card mb-12">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">The 5S Framework</h2>
          <p className="text-muted-foreground font-light leading-relaxed mb-6">The 5S Framework is the organizing architecture of LifeOS. It was developed by synthesizing the core teachings of all the wisdom traditions represented here, identifying the five universal domains that determine the quality of a human life.</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[{ s: "State", desc: "Emotional alignment" }, { s: "Story", desc: "Beliefs & identity" }, { s: "Standards", desc: "Habits & systems" }, { s: "Strategy", desc: "Decisions & leverage" }, { s: "Stewardship", desc: "Energy & resources" }].map(({ s, desc }) => (
              <div key={s} className="text-center p-3 rounded-xl bg-secondary">
                <p className="font-serif text-lg font-light text-foreground">{s}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <h2 className="font-serif text-2xl font-light text-foreground mb-8 text-center">The Teachers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {TEACHERS.map(t => (
            <div key={t.name} className="p-6 rounded-2xl border border-border bg-card">
              <h3 className="font-serif text-xl font-light text-foreground mb-1">{t.name}</h3>
              <p className="text-xs text-muted-foreground mb-1">{t.years} · {t.role}</p>
              <p className="text-sm text-muted-foreground font-light italic leading-relaxed mt-3">"{t.quote}"</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button asChild size="lg" className="gap-2"><Link href="/alignment-audit"><ArrowRight className="h-4 w-4" /> Begin Your Journey</Link></Button>
        </div>
      </div>
    </div>
  );
}
