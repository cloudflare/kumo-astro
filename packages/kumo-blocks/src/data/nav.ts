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
    ],
  },
];
