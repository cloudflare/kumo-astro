export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const nav: NavSection[] = [
  {
    items: [
      { label: "Home", href: "/" },
      { label: "Installation", href: "/installation" },
      { label: "Contributing", href: "/contributing" },
      { label: "Colors", href: "/colors" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Figma Resources", href: "/figma-resources" },
      { label: "CLI", href: "/cli" },
      { label: "Registry", href: "/registry" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Blocks",
    items: [
      { label: "Auth", href: "/blocks/auth" },
      { label: "Dashboard", href: "/blocks/dashboard" },
      { label: "Forms", href: "/blocks/forms" },
      { label: "Hero", href: "/blocks/hero" },
      { label: "Marketing", href: "/blocks/marketing" },
      { label: "Navigation", href: "/blocks/navigation" },
      { label: "Pricing", href: "/blocks/pricing" },
      { label: "Settings", href: "/blocks/settings" },
    ],
  },
];
