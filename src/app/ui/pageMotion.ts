import type { Variants } from "framer-motion"

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: "blur(10px)", transition: { duration: 0.2 } }
}

