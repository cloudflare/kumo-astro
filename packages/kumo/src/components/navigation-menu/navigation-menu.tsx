import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export const KUMO_NAVIGATION_MENU_VARIANTS = {
  indicator: {
    none: { classes: "", description: "No active indicator" },
    underline: {
      classes: "",
      description: "Underline indicator for active item",
    },
  },
} as const;

export const KUMO_NAVIGATION_MENU_DEFAULT_VARIANTS = {
  indicator: "underline",
} as const;

export type KumoNavigationMenuIndicator =
  keyof typeof KUMO_NAVIGATION_MENU_VARIANTS.indicator;

// ─── Context ─────────────────────────────────────────────────────────────────

interface NavMenuContextValue {
  activeValue: string | null;
  setActiveValue: (v: string | null) => void;
}

const NavMenuContext = createContext<NavMenuContextValue>({
  activeValue: null,
  setActiveValue: () => {},
});

interface NavItemContextValue {
  value: string;
}

const NavItemContext = createContext<NavItemContextValue>({ value: "" });

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
}

const NavigationMenuRoot = React.forwardRef<HTMLElement, NavigationMenuProps>(
  ({ className, children, ...props }, ref) => {
    const [activeValue, setActiveValue] = useState<string | null>(null);

    const handleSetActive = useCallback((v: string | null) => {
      setActiveValue(v);
    }, []);

    return (
      <NavMenuContext.Provider value={{ activeValue, setActiveValue: handleSetActive }}>
        <nav
          ref={ref}
          aria-label="Main navigation"
          className={cn("relative", className)}
          onMouseLeave={() => setActiveValue(null)}
          {...props}
        >
          {children}
        </nav>
      </NavMenuContext.Provider>
    );
  },
);

NavigationMenuRoot.displayName = "NavigationMenu";

// ─── List ─────────────────────────────────────────────────────────────────────

export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  children?: React.ReactNode;
}

const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, children, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex items-center gap-1 list-none m-0 p-0", className)}
      {...props}
    >
      {children}
    </ul>
  ),
);

NavigationMenuList.displayName = "NavigationMenu.List";

// ─── Item ──────────────────────────────────────────────────────────────────────

export interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Unique identifier for this item (used to track open state) */
  value?: string;
  className?: string;
  children?: React.ReactNode;
}

let itemCounter = 0;
const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const id = React.useRef(value ?? `nav-item-${++itemCounter}`).current;
    return (
      <NavItemContext.Provider value={{ value: id }}>
        <li ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </li>
      </NavItemContext.Provider>
    );
  },
);

NavigationMenuItem.displayName = "NavigationMenu.Item";

// ─── Trigger ──────────────────────────────────────────────────────────────────

export interface NavigationMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(({ className, children, onClick, ...props }, ref) => {
  const { activeValue, setActiveValue } = useContext(NavMenuContext);
  const { value } = useContext(NavItemContext);
  const isOpen = activeValue === value;

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={isOpen}
      aria-haspopup="true"
      data-state={isOpen ? "open" : "closed"}
      onClick={(e) => {
        setActiveValue(isOpen ? null : value);
        onClick?.(e);
      }}
      onMouseEnter={() => setActiveValue(value)}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium",
        "text-kumo-default hover:bg-kumo-tint hover:text-kumo-default",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
        "transition-colors select-none",
        isOpen && "bg-kumo-tint",
        className,
      )}
      {...props}
    >
      {children}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        className={cn(
          "transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      >
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
});

NavigationMenuTrigger.displayName = "NavigationMenu.Trigger";

// ─── Content ──────────────────────────────────────────────────────────────────

export interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, children, ...props }, ref) => {
    const { activeValue } = useContext(NavMenuContext);
    const { value } = useContext(NavItemContext);
    const isOpen = activeValue === value;

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        data-state="open"
        className={cn(
          "absolute top-full left-0 z-50 pt-1.5",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "rounded-xl bg-kumo-elevated ring ring-kumo-hairline shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100",
            "p-2 min-w-[12rem]",
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);

NavigationMenuContent.displayName = "NavigationMenu.Content";

// ─── Link ─────────────────────────────────────────────────────────────────────

export interface NavigationMenuLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Whether this link is the currently active page */
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ active, className, children, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium no-underline",
        "text-kumo-default hover:bg-kumo-tint",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
        "transition-colors select-none",
        active && "bg-kumo-tint font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
);

NavigationMenuLink.displayName = "NavigationMenu.Link";

// ─── Sub-link (for use inside Content) ────────────────────────────────────────

export interface NavigationMenuSubLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const NavigationMenuSubLink = React.forwardRef<HTMLAnchorElement, NavigationMenuSubLinkProps>(
  ({ title, description, className, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "block rounded-lg px-3 py-2 no-underline",
        "hover:bg-kumo-tint",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
        "transition-colors",
        className,
      )}
      {...props}
    >
      {title && (
        <div className="text-sm font-medium text-kumo-default">{title}</div>
      )}
      {description && (
        <div className="text-xs text-kumo-subtle mt-0.5 leading-snug">{description}</div>
      )}
      {children}
    </a>
  ),
);

NavigationMenuSubLink.displayName = "NavigationMenu.SubLink";

// ─── Compound export ──────────────────────────────────────────────────────────

export const NavigationMenu = Object.assign(NavigationMenuRoot, {
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  SubLink: NavigationMenuSubLink,
});

NavigationMenu.displayName = "NavigationMenu";
