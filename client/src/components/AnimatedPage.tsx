import { motion } from "framer-motion";
import { pageSpring } from "@/lib/springs";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrap every page component with AnimatedPage to get spring-based
 * enter/exit transitions on route changes.
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageSpring}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
