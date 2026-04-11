import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Heart, MessageCircle, Star, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

const CATEGORY_COLORS: Record<string, string> = {
  share: "text-state", question: "text-strategy", win: "text-standards",
  support: "text-story", workshop: "text-stewardship",
};

export default function Community() {
  const { isAuthenticated, user } = useAuth();
  const [showNewPost, setShowNewPost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<"share" | "question" | "win" | "support" | "workshop">("share");

  const { data: posts, refetch } = trpc.community.posts.useQuery({ limit: 20 });
  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => { toast.success("Post shared with the community."); setPostTitle(""); setPostContent(""); setShowNewPost(false); refetch(); },
  });
  const likePost = trpc.community.like.useMutation({ onSuccess: () => refetch() });

  const categories = ["share", "question", "win", "support", "workshop"] as const;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-secondary flex-shrink-0"><Users className="h-6 w-6 text-foreground" /></div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-1">Community</h1>
              <p className="text-muted-foreground text-sm font-light">Share your journey. Support others. Grow together.</p>
            </div>
          </div>
          {isAuthenticated && !showNewPost && (
            <Button onClick={() => setShowNewPost(true)} className="gap-2 flex-shrink-0"><Plus className="h-4 w-4" /> Share</Button>
          )}
        </div>
        {!isAuthenticated && (
          <div className="p-6 rounded-2xl border border-border bg-card mb-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-serif text-lg font-light text-foreground mb-2">Join the Community</p>
            <p className="text-sm text-muted-foreground mb-4">Sign in to share your journey, ask questions, and celebrate wins with others on the path.</p>
            <Button asChild><a href={getLoginUrl()}>Sign In to Participate</a></Button>
          </div>
        )}
        {showNewPost && (
          <div className="p-6 rounded-2xl border border-border bg-card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-light text-foreground">Share with the Community</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowNewPost(false)}>Cancel</Button>
            </div>
            <Input placeholder="Title" value={postTitle} onChange={e => setPostTitle(e.target.value)} className="mb-3 text-sm" />
            <Textarea placeholder="Share your insight, question, win, or experience..." value={postContent} onChange={e => setPostContent(e.target.value)} className="resize-none text-sm mb-3" rows={4} />
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(cat => (
                <button key={cat} onClick={() => setPostCategory(cat)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${postCategory === cat ? `border-current bg-current/10 ${CATEGORY_COLORS[cat]}` : "border-border text-muted-foreground"}`}>{cat}</button>
              ))}
            </div>
            <Button onClick={() => createPost.mutate({ title: postTitle, content: postContent, category: postCategory })} disabled={!postTitle || !postContent || createPost.isPending} className="gap-2">
              {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Post
            </Button>
          </div>
        )}
        <div className="space-y-4">
          {posts && posts.length > 0 ? posts.map((post: any) => (
            <div key={post.id} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-foreground">{post.title}</h3>
                <Badge variant="secondary" className={`text-xs capitalize flex-shrink-0 ${CATEGORY_COLORS[post.category]}`}>{post.category}</Badge>
              </div>
              <p className="text-base text-muted-foreground font-light leading-relaxed mb-4">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <button onClick={() => isAuthenticated ? likePost.mutate({ postId: post.id }) : toast.info("Sign in to like posts")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Heart className="h-3.5 w-3.5" /> {post.likesCount || 0}
                </button>
                <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> {post.commentsCount || 0}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-serif text-lg font-light text-foreground mb-2">The community is just beginning.</p>
              <p className="text-base text-muted-foreground mb-6">Be the first to share your journey.</p>
              {isAuthenticated && <Button onClick={() => setShowNewPost(true)} className="gap-2"><Plus className="h-4 w-4" /> Share First</Button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
