"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const avatarVariants = cva(
  [
    "relative flex shrink-0 overflow-hidden rounded-full",
    "bg-[var(--background-default-greige)]",
    "border border-[var(--stroke-default)]",
  ],
  {
    variants: {
      size: {
        "32": "h-8 w-8",      // 32px
        "40": "h-10 w-10",    // 40px
        "56": "h-14 w-14",    // 56px
        "72": "h-[72px] w-[72px]",
        "96": "h-24 w-24",    // 96px
        "120": "h-[120px] w-[120px]",
        "144": "h-36 w-36",   // 144px
      },
    },
    defaultVariants: {
      size: "32",
    },
  }
)

const avatarImageVariants = cva("aspect-square h-full w-full object-cover")

const avatarFallbackVariants = cva(
  [
    "flex h-full w-full items-center justify-center rounded-full",
    "bg-[var(--background-default-greige)] text-[var(--text-placeholder)]",
    "font-semibold uppercase",
  ],
  {
    variants: {
      size: {
        // Using design system type scale tokens
        "32": "text-[var(--font-size-caption)] leading-[var(--line-height-caption)]",      // 12px
        "40": "text-[var(--font-size-subbody)] leading-[var(--line-height-subbody)]",      // 14px
        "56": "text-[var(--font-size-title-3)] leading-[var(--line-height-title-3)]",      // 18px
        "72": "text-[var(--font-size-title-2)] leading-[var(--line-height-title-2)]",      // 20px
        "96": "text-[var(--font-size-title-1)] leading-[var(--line-height-title-1)]",      // 28px
        "120": "text-[36px] leading-[44px]",   // Scaled beyond type scale
        "144": "text-[44px] leading-[52px]",   // Scaled beyond type scale
      },
    },
    defaultVariants: {
      size: "32",
    },
  }
)

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size, className }))}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

export interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(avatarImageVariants(), className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>,
    VariantProps<typeof avatarFallbackVariants> {}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(avatarFallbackVariants({ size, className }))}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Convenience component that combines Avatar, AvatarImage, and AvatarFallback
export interface AvatarWithFallbackProps extends AvatarProps {
  src?: string
  alt?: string
  fallback: string
  delayMs?: number
}

const AvatarWithFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarWithFallbackProps
>(({ src, alt, fallback, delayMs, size, ...props }, ref) => (
  <Avatar ref={ref} size={size} {...props}>
    {src && <AvatarImage src={src} alt={alt} />}
    <AvatarFallback size={size} delayMs={delayMs}>
      {fallback}
    </AvatarFallback>
  </Avatar>
))
AvatarWithFallback.displayName = "AvatarWithFallback"

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarWithFallback,
  avatarVariants,
  avatarFallbackVariants,
}

