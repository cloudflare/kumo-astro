import React from "react";
import { cn } from "../../utils/cn";

export const KUMO_CARD_VARIANTS = {
  variant: {
    default: {
      classes: "bg-kumo-base ring-kumo-hairline ring",
      description: "Default card with base background and subtle border",
    },
    elevated: {
      classes: "bg-kumo-elevated ring-kumo-hairline ring",
      description: "Elevated card with raised background",
    },
    recessed: {
      classes: "bg-kumo-recessed ring-kumo-hairline ring",
      description: "Recessed card with sunken background",
    },
    ghost: {
      classes: "bg-transparent",
      description: "Ghost card with no background or border",
    },
  },
} as const;

export const KUMO_CARD_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export type KumoCardVariant = keyof typeof KUMO_CARD_VARIANTS.variant;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual surface variant.
   * - `"default"` — Base background
   * - `"elevated"` — Raised surface
   * - `"recessed"` — Sunken surface
   * - `"ghost"` — No background
   * @default "default"
   */
  variant?: KumoCardVariant;
  className?: string;
  children?: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const variantConfig = KUMO_CARD_VARIANTS.variant[variant] ?? KUMO_CARD_VARIANTS.variant.default;
    return (
      <div
        ref={ref}
        className={cn("rounded-xl shadow-xs", variantConfig.classes, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardRoot.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

CardHeader.displayName = "Card.Header";

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none text-kumo-default", className)}
      {...props}
    >
      {children}
    </h3>
  ),
);

CardTitle.displayName = "Card.Title";

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-kumo-subtle", className)}
      {...props}
    >
      {children}
    </p>
  ),
);

CardDescription.displayName = "Card.Description";

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 pb-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

CardContent.displayName = "Card.Content";

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 px-6 pb-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

CardFooter.displayName = "Card.Footer";

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});

Card.displayName = "Card";
