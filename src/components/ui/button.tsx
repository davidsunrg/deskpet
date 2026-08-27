import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-deskpet-mint-hover [a]:hover:bg-deskpet-mint-hover",
        outline:
          "border-deskpet-ink/20 bg-deskpet-paper text-deskpet-ink hover:border-deskpet-ink hover:bg-deskpet-mint-soft hover:text-deskpet-ink aria-expanded:bg-deskpet-mint-soft aria-expanded:text-deskpet-ink dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-deskpet-mint-soft aria-expanded:bg-deskpet-mint-soft aria-expanded:text-deskpet-ink",
        ghost:
          "text-deskpet-ink hover:bg-deskpet-mint-soft hover:text-deskpet-ink aria-expanded:bg-deskpet-mint-soft aria-expanded:text-deskpet-ink dark:text-foreground dark:hover:bg-accent",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-deskpet-ink underline-offset-4 hover:text-primary hover:underline",
        /* Brand CTAs — lift via shadow only (no hover translate: avoids edge jitter). */
        brutal:
          "rounded-full border-[3px] border-deskpet-ink bg-deskpet-mint font-black text-[#133e31] shadow-[5px_6px_0_0_rgba(56,42,53,0.14)] transition-[box-shadow,background-color] duration-200 ease-[cubic-bezier(.2,1.65,.47,.76)] hover:bg-deskpet-mint-hover hover:shadow-[9px_10px_0_0_rgba(56,42,53,0.16)] active:translate-x-px active:translate-y-px active:shadow-[3px_3px_0_0_rgba(56,42,53,0.16)] dark:border-foreground dark:text-primary-foreground",
        brutalSecondary:
          "rounded-full border-[3px] border-deskpet-ink bg-deskpet-sun font-black text-deskpet-ink shadow-[5px_6px_0_0_rgba(56,42,53,0.14)] transition-[box-shadow,background-color] duration-200 ease-[cubic-bezier(.2,1.65,.47,.76)] hover:bg-[#ffe08a] hover:shadow-[9px_10px_0_0_rgba(56,42,53,0.16)] active:translate-x-px active:translate-y-px active:shadow-[3px_3px_0_0_rgba(56,42,53,0.16)] dark:border-foreground dark:text-foreground",
        /* Same shape/motion as brutal; neutral fill for Cancel / secondary CTAs */
        brutalOutline:
          "rounded-full border-[3px] border-deskpet-ink bg-deskpet-paper font-black text-deskpet-ink shadow-[5px_6px_0_0_rgba(56,42,53,0.14)] transition-[box-shadow,background-color] duration-200 ease-[cubic-bezier(.2,1.65,.47,.76)] hover:bg-white hover:shadow-[9px_10px_0_0_rgba(56,42,53,0.16)] active:translate-x-px active:translate-y-px active:shadow-[3px_3px_0_0_rgba(56,42,53,0.16)] dark:border-foreground dark:bg-card dark:text-foreground",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        /* Pet-detail hero CTAs — references/html/pet-detail.html .button */
        xl: "h-[58px] gap-2.5 px-5 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
