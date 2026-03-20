import { useRoute } from "wouter";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Clock, Star, Users, Check } from "lucide-react";

export default function CourseDetail() {
  const [, params] = useRoute("/course/:id");
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-3xl mx-auto">
        <Link href="/store"><p className="text-xs text-muted-foreground mb-6 hover:text-foreground transition-colors cursor-pointer">← Back to Store</p></Link>
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Course</p>
        <h1 className="font-serif text-4xl font-light text-foreground mb-3">Coming Soon</h1>
        <p className="text-muted-foreground font-light mb-8">This course is currently in development. Join the community to be notified when it launches.</p>
        <Button asChild variant="outline"><Link href="/store"><ArrowRight className="h-4 w-4 mr-2" /> Browse All Products</Link></Button>
      </div>
    </div>
  );
}
