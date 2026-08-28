import { cn } from "@/lib/utils";

/**
 * Shared scroll-safe page surface for routes that sit beneath Lifewoven's
 * fixed navigation. It establishes phone gutters and enough bottom clearance
 * for installed-PWA safe areas before individual screens add their content.
 */
function Page({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="page"
      className={cn("container screen-safe mx-auto", className)}
      {...props}
    />
  );
}

export { Page };
