import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Target, Plus, CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp,
  Calendar, Loader2, Pencil, Flag, PauseCircle, XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MODULE_COLORS: Record<string, string> = {
  state: "bg-state/10 text-state border-state/20",
  story: "bg-story/10 text-story border-story/20",
  standards: "bg-standards/10 text-standards border-standards/20",
  strategy: "bg-strategy/10 text-strategy border-strategy/20",
  stewardship: "bg-stewardship/10 text-stewardship border-stewardship/20",
  free: "bg-muted text-muted-foreground border-border",
};

const MODULE_LABELS: Record<string, string> = {
  state: "State", story: "Story", standards: "Standards",
  strategy: "Strategy", stewardship: "Stewardship", free: "General",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <Flag className="h-3.5 w-3.5 text-amber-500" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  paused: <PauseCircle className="h-3.5 w-3.5 text-blue-400" />,
  abandoned: <XCircle className="h-3.5 w-3.5 text-muted-foreground" />,
};

type GoalStatus = "active" | "completed" | "paused" | "abandoned";

interface GoalWithMilestones {
  id: number;
  title: string;
  description: string | null;
  module: string;
  status: GoalStatus;
  targetDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  milestones: { id: number; title: string; isCompleted: boolean; completedAt: Date | null }[];
}

export default function Goals() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [statusFilter, setStatusFilter] = useState<"active" | "completed" | "all">("active");
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithMilestones | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState<Record<number, string>>({});

  // Form state
  const [form, setForm] = useState({
    title: "", description: "", module: "free" as string,
    targetDate: "", milestones: [""],
  });

  const { data: goalsList = [], isLoading } = trpc.goals.list.useQuery(
    { status: statusFilter },
    { enabled: isAuthenticated }
  );

  const createGoal = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("Goal created.");
      utils.goals.list.invalidate();
      utils.goals.stats.invalidate();
      setShowCreateDialog(false);
      setForm({ title: "", description: "", module: "free", targetDate: "", milestones: [""] });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateGoal = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("Goal updated.");
      utils.goals.list.invalidate();
      utils.goals.stats.invalidate();
      setEditingGoal(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteGoal = trpc.goals.delete.useMutation({
    onSuccess: () => {
      toast.success("Goal deleted.");
      utils.goals.list.invalidate();
      utils.goals.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMilestone = trpc.goals.toggleMilestone.useMutation({
    onMutate: async ({ id }) => {
      await utils.goals.list.cancel();
      const prev = utils.goals.list.getData({ status: statusFilter });
      utils.goals.list.setData({ status: statusFilter }, (old) =>
        old?.map(g => ({
          ...g,
          milestones: g.milestones.map(m =>
            m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
          ),
        }))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.goals.list.setData({ status: statusFilter }, ctx.prev);
      toast.error("Failed to update milestone.");
    },
    onSettled: () => utils.goals.list.invalidate(),
  });

  const addMilestone = trpc.goals.addMilestone.useMutation({
    onSuccess: (_d, vars) => {
      utils.goals.list.invalidate();
      setNewMilestoneText(prev => ({ ...prev, [vars.goalId]: "" }));
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMilestone = trpc.goals.deleteMilestone.useMutation({
    onSuccess: () => utils.goals.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  function toggleExpand(id: number) {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function milestoneProgress(goal: GoalWithMilestones) {
    if (!goal.milestones.length) return null;
    const done = goal.milestones.filter(m => m.isCompleted).length;
    return { done, total: goal.milestones.length, pct: Math.round((done / goal.milestones.length) * 100) };
  }

  function handleCreate() {
    if (!form.title.trim()) { toast.error("Goal title is required."); return; }
    const milestones = form.milestones.map(m => m.trim()).filter(Boolean);
    createGoal.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      module: form.module as any,
      targetDate: form.targetDate || undefined,
      milestones: milestones.length ? milestones : undefined,
    });
  }

  function handleStatusChange(goal: GoalWithMilestones, status: GoalStatus) {
    updateGoal.mutate({ id: goal.id, status });
  }

  const goals = goalsList as GoalWithMilestones[];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-light text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-amber-500" /> Goals
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set intentions, track milestones, and move toward who you are becoming.
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["active", "completed", "all"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Goal list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {statusFilter === "active" ? "No active goals yet. Create your first one." : "No goals found."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {goals.map(goal => {
                const progress = milestoneProgress(goal);
                const isExpanded = expandedGoals.has(goal.id);
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-border bg-card overflow-hidden"
                  >
                    {/* Goal header */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <button
                          className="mt-0.5 flex-shrink-0"
                          onClick={() => handleStatusChange(goal, goal.status === "completed" ? "active" : "completed")}
                          title={goal.status === "completed" ? "Mark active" : "Mark complete"}
                        >
                          {goal.status === "completed"
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            : <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-base font-medium ${goal.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {goal.title}
                            </span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${MODULE_COLORS[goal.module]}`}>
                              {MODULE_LABELS[goal.module]}
                            </Badge>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {goal.targetDate && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            )}
                            {progress && (
                              <span className="text-xs text-muted-foreground">
                                {progress.done}/{progress.total} milestones
                              </span>
                            )}
                          </div>
                          {progress && (
                            <Progress value={progress.pct} className="h-1 mt-2" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditingGoal(goal)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this goal and all its milestones?")) {
                                deleteGoal.mutate({ id: goal.id });
                              }
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {goal.milestones.length > 0 && (
                            <button
                              onClick={() => toggleExpand(goal.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Milestones */}
                    <AnimatePresence>
                      {(isExpanded || goal.milestones.length > 0) && (
                        <motion.div
                          initial={false}
                          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
                            {goal.milestones.map(m => (
                              <div key={m.id} className="flex items-center gap-2 group">
                                <button onClick={() => toggleMilestone.mutate({ id: m.id })}>
                                  {m.isCompleted
                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                    : <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors" />
                                  }
                                </button>
                                <span className={`text-sm flex-1 ${m.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {m.title}
                                </span>
                                <button
                                  onClick={() => deleteMilestone.mutate({ id: m.id })}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {/* Add milestone inline */}
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="Add a milestone…"
                                value={newMilestoneText[goal.id] ?? ""}
                                onChange={e => setNewMilestoneText(prev => ({ ...prev, [goal.id]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === "Enter" && (newMilestoneText[goal.id] ?? "").trim()) {
                                    addMilestone.mutate({ goalId: goal.id, title: (newMilestoneText[goal.id] ?? "").trim() });
                                  }
                                }}
                                className="h-8 text-sm"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                disabled={!(newMilestoneText[goal.id] ?? "").trim()}
                                onClick={() => {
                                  const t = (newMilestoneText[goal.id] ?? "").trim();
                                  if (t) addMilestone.mutate({ goalId: goal.id, title: t });
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand toggle when milestones exist but collapsed */}
                    {goal.milestones.length > 0 && !isExpanded && (
                      <button
                        onClick={() => toggleExpand(goal.id)}
                        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground border-t border-border transition-colors"
                      >
                        <ChevronDown className="h-3 w-3" />
                        {goal.milestones.length} milestone{goal.milestones.length !== 1 ? "s" : ""}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif font-light">New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <Input
                placeholder="What do you want to achieve?"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <Textarea
                placeholder="Why does this matter? What does success look like?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Module</label>
                <Select value={form.module} onValueChange={v => setForm(f => ({ ...f, module: v }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODULE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Target Date</label>
                <Input
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Milestones (optional)</label>
              <div className="space-y-2">
                {form.milestones.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Milestone ${i + 1}`}
                      value={m}
                      onChange={e => {
                        const next = [...form.milestones];
                        next[i] = e.target.value;
                        setForm(f => ({ ...f, milestones: next }));
                      }}
                      className="h-8 text-sm"
                    />
                    {form.milestones.length > 1 && (
                      <button
                        onClick={() => setForm(f => ({ ...f, milestones: f.milestones.filter((_, j) => j !== i) }))}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setForm(f => ({ ...f, milestones: [...f.milestones, ""] }))}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add milestone
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createGoal.isPending}>
              {createGoal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif font-light">Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={editingGoal.title}
                  onChange={e => setEditingGoal(g => g ? { ...g, title: e.target.value } : g)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Textarea
                  value={editingGoal.description ?? ""}
                  onChange={e => setEditingGoal(g => g ? { ...g, description: e.target.value } : g)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Module</label>
                  <Select value={editingGoal.module} onValueChange={v => setEditingGoal(g => g ? { ...g, module: v } : g)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODULE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <Select value={editingGoal.status} onValueChange={v => setEditingGoal(g => g ? { ...g, status: v as GoalStatus } : g)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="abandoned">Abandoned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Target Date</label>
                <Input
                  type="date"
                  value={editingGoal.targetDate ? new Date(editingGoal.targetDate).toISOString().split("T")[0] : ""}
                  onChange={e => setEditingGoal(g => g ? { ...g, targetDate: e.target.value ? new Date(e.target.value) : null } : g)}
                  className="h-9"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGoal(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!editingGoal.title.trim()) { toast.error("Title is required."); return; }
                  updateGoal.mutate({
                    id: editingGoal.id,
                    title: editingGoal.title.trim(),
                    description: editingGoal.description ?? undefined,
                    module: editingGoal.module as any,
                    status: editingGoal.status,
                    targetDate: editingGoal.targetDate
                      ? new Date(editingGoal.targetDate).toISOString().split("T")[0]
                      : null,
                  });
                }}
                disabled={updateGoal.isPending}
              >
                {updateGoal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
