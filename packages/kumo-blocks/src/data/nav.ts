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
    title: "AI (300)",
    items: [
      { label: "Accessibility Checker", href: "/blocks/auth" },
      { label: "Agent Multi Step", href: "/blocks/dashboard" },
      { label: "Agent Plan Builder", href: "/blocks/forms" },
      { label: "Agent Task Queue", href: "/blocks/hero" },
      { label: "AI Workflow", href: "/blocks/marketing" },
      { label: "API Playground", href: "/blocks/marketing" },
      { label: "Changelog Generator", href: "/blocks/navigation" },
      { label: "Chat Branching", href: "/blocks/pricing" },
      { label: "Chat Empty State", href: "/blocks/settings" },
      { label: "Chat Floating Widget", href: "/blocks/settings" },
      { label: "Chat Fullscreen", href: "/blocks/settings" },
      { label: "Chat Minimal", href: "/blocks/settings" },
      { label: "Chat Split Panel", href: "/blocks/settings" },
      { label: "Chat Threaded", href: "/blocks/settings" },
      { label: "Chat with Context", href: "/blocks/settings" },
      { label: "Chat with Canvas", href: "/blocks/settings" },
    ],
  },
  {
    title: "User (726)",
    items: [
      { label: "Account", href: "/blocks/settings" },
      { label: "Profile", href: "/blocks/settings" },
      { label: "Settings", href: "/blocks/settings" },
      { label: "Login", href: "/blocks/settings" },
      { label: "Onboarding", href: "/blocks/settings" },
      { label: "Notification", href: "/blocks/settings" },
      { label: "Team", href: "/blocks/settings" },
    ],
  },
  {
    title: "Layout (550)",
    items: [
      { label: "Navbar", href: "/blocks/settings" },
      { label: "Sidebar", href: "/blocks/settings" },
      { label: "Footer", href: "/blocks/settings" },
      { label: "Dialog", href: "/blocks/settings" },
      { label: "Stepper", href: "/blocks/settings" },
    ],
  },
];
