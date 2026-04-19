import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
  trackEvent: publicProcedure
    .input(z.object({
      event: z.string(),
      properties: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(({ input }) => {
      // Lightweight server-side event log — extend with DB/analytics later
      console.log("[event]", input.event, JSON.stringify(input.properties ?? {}));
      return { ok: true };
    }),
});
