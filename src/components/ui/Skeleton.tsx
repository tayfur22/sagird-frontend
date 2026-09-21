import { cn } from "@/lib/utils/cn";
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ width = "100%", height = 16, className, rounded }: SkeletonProps) {
  return (
    <span
      className={cn(styles.skeleton, rounded && styles.rounded, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
