import * as React from "react";
import { Drawer } from "vaul";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * ResponsiveDialog — renders as a bottom sheet (vaul Drawer) on mobile,
 * and as a centered Dialog on desktop (sm: breakpoint and above).
 *
 * Usage:
 *   <ResponsiveDialog open={open} onOpenChange={setOpen} title="Edit Habit">
 *     <p>Content here</p>
 *   </ResponsiveDialog>
 */

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Extra class for the content container */
  className?: string;
  /** Prevent closing by clicking the overlay (default: false) */
  dismissible?: boolean;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  dismissible = true,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange} dismissible={dismissible}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200" />
          <Drawer.Content
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-background",
              "border-t border-border shadow-xl",
              "max-h-[92dvh] outline-none"
            )}
          >
            {/* Drag handle */}
            <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

            <div className={cn("overflow-y-auto px-4 pb-safe-bottom", className)}>
              {(title || description) && (
                <div className="py-4 space-y-1">
                  {title && (
                    <Drawer.Title className="text-lg font-semibold leading-none">
                      {title}
                    </Drawer.Title>
                  )}
                  {description && (
                    <Drawer.Description className="text-sm text-muted-foreground">
                      {description}
                    </Drawer.Description>
                  )}
                </div>
              )}
              <div className="pb-4">{children}</div>
              {footer && <div className="pb-6">{footer}</div>}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
