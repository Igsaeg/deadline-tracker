// Recreated https://mui.com/material-ui/react-skeleton/'s skeleton loader using claude sonnet 5.5 medium

import type { HTMLAttributes } from "react";

type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";

interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
}

const skeletonVariantClasses: Record<SkeletonVariant, string> = {
  text: "h-auto scale-y-[0.6] origin-[0_55%] [border-radius:4px/6.7px]",
  circular: "rounded-full",
  rounded: "rounded-xl",
  rectangular: "",
};

export default function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  style,
  children,
  ...remainingProps
}: SkeletonProps) {
  const hasContent = Boolean(children);

  const classes = [
    "relative block overflow-hidden bg-elevated",
    "after:absolute after:inset-y-0 after:left-0 after:w-[150%] after:animate-wave",
    "after:[transform:translateX(-100%)]",
    "after:bg-[linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--color-border-subtle)_40%,transparent)_30%,var(--color-border-subtle)_50%,color-mix(in_srgb,var(--color-border-subtle)_40%,transparent)_70%,transparent_100%)]",
    skeletonVariantClasses[variant],
    hasContent && "[&>*]:invisible",
    hasContent && width === undefined && "max-w-fit",
    hasContent && height === undefined && "h-auto",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={{ width, height, ...style }} {...remainingProps}>
      {!hasContent && variant === "text" ? "\u00A0" : children}
    </span>
  );
}