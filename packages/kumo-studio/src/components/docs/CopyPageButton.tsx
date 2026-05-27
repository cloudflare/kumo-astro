import { useState } from "react";
import { Button, DropdownMenu } from "@cloudflare/kumo";
import {
  CopySimpleIcon,
  LinkSimpleIcon,
  FileMdIcon,
  CaretDownIcon,
  CheckIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { OpenAiLogo } from "@phosphor-icons/react";
import { ClaudeIcon } from "./icons/ClaudeIcon";
import { cn } from "@cloudflare/kumo";

const KUMO_DESIGN_RULES = `## Package Status (read this first)
- @cloudflare/kumo — the React component library. Published to npm. Use this for React projects.
- @cloudflare/kumo-astro — the Astro component library. NOT yet published to npm. If the user is in an Astro project, use @cloudflare/kumo React components as client islands instead.
- If you are unsure of the framework, default to @cloudflare/kumo (React).

## Project Setup (if starting from scratch)

### 1. Install packages
\`\`\`bash
npm install @cloudflare/kumo @phosphor-icons/react
npm install -D tailwindcss @tailwindcss/vite
\`\`\`

### 1b. Astro only — add the React integration
Astro does not support React by default. You must install it and register it:
\`\`\`bash
npx astro add react --yes
\`\`\`
This installs @astrojs/react, react, and react-dom, and automatically updates astro.config.mjs to include react() in the integrations array. Without this step, importing any .tsx file will throw a build error.

### 2. Create src/styles/global.css with this exact content
The @source path MUST be relative to where this file lives. If global.css is at src/styles/global.css, node_modules is two directories up:
\`\`\`css
@source "../../node_modules/@cloudflare/kumo/dist/**/*.{js,jsx,ts,tsx}";
@import "@cloudflare/kumo/styles";
@import "tailwindcss";

:root {
  color-scheme: light dark;
}
\`\`\`
CRITICAL: Order matters — @cloudflare/kumo/styles must come before @import "tailwindcss".
CRITICAL: The color-scheme property is required. Kumo uses CSS light-dark() functions for all tokens. Without color-scheme set, the browser cannot resolve light-dark() and all colors will be wrong.
If the @source path fails, adjust the relative path so it points to node_modules/@cloudflare/kumo/dist/ from where your CSS file lives.

### 3. Import CSS in Astro via frontmatter — NOT a link tag
In the frontmatter of your layout or page file (e.g. src/pages/index.astro or src/layouts/Layout.astro):
\`\`\`astro
---
import '../styles/global.css';
---
\`\`\`
NEVER use \`<link rel="stylesheet" href="/src/styles/global.css" />\` — files under src/ are not served as static assets in Astro. Without the frontmatter import, Kumo tokens will not load and all components will appear completely unstyled.

### 4. Add data-mode to your root html element
\`\`\`html
<html data-mode="light">
\`\`\`
Use data-mode="dark" for dark mode. Never use prefers-color-scheme — Kumo always uses the data-mode attribute.

### 5. Astro-specific: add @tailwindcss/vite to astro.config.mjs
If you ran \`astro add react\`, the file already exists with a react() integration. MERGE the vite plugin in — do not overwrite the file:
\`\`\`js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] }
});
\`\`\`

### 6. No root provider needed
Kumo does not require a theme provider or context wrapper. Drop components directly into your JSX or Astro pages.

### 7. Astro islands — how to use React components in Astro pages
Create a .tsx file for your Kumo components, then import and use it as a client island in your .astro page:

\`\`\`tsx
// src/components/MyComponent.tsx
import { Button } from '@cloudflare/kumo';

export default function MyComponent() {
  return (
    <div className="flex gap-2">
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  );
}
\`\`\`

\`\`\`astro
---
// src/pages/index.astro
import '../styles/global.css';
import MyComponent from '../components/MyComponent';
---
<html lang="en" data-mode="light">
  <body>
    <MyComponent client:load />
  </body>
</html>
\`\`\`
Use client:load for interactive components visible immediately (buttons, inputs, etc).
Use client:visible for components lower on the page that can load lazily.

### 8. Icons (optional)
\`\`\`bash
npm install @phosphor-icons/react   # React
npm install @phosphor-icons/web     # Astro / plain HTML
\`\`\`

### 9. Verify setup before building components
Before writing any component code, run the dev server and check that Kumo tokens are resolving:
- Open the browser and inspect any element
- You should see CSS custom properties like --color-kumo-base, --text-color-kumo-default in the :root styles
- If you see those, setup is correct. If not, the CSS import or @source path is broken — fix that first before proceeding.

## Kumo Design Rules (follow these exactly)
- ONLY use Kumo semantic tokens for colors — never raw Tailwind colors
- NEVER use dark: prefix — dark mode is automatic via CSS light-dark() tokens
- Use cn() to compose class names, imported from @cloudflare/kumo

## Token Reference

### Backgrounds (surfaces)
- bg-kumo-canvas — outermost page background
- bg-kumo-base — default component/card background
- bg-kumo-elevated — slightly above base (secondary cards)
- bg-kumo-recessed — slightly below base (segmented tabs background)
- bg-kumo-tint — subtle tint for table rows or hover states
- bg-kumo-contrast — high-contrast inverted background
- bg-kumo-overlay — popovers and overlays
- bg-kumo-control — form control backgrounds (inputs, selects)

### Brand
- bg-kumo-brand — Cloudflare blue (primary brand)
- bg-kumo-brand-hover — brand on hover
- text-kumo-brand — Cloudflare orange text

### Text
- text-kumo-default — primary body text (use this most)
- text-kumo-strong — slightly more emphasis
- text-kumo-subtle — muted, captions, secondary labels
- text-kumo-inactive — disabled text
- text-kumo-placeholder — input placeholder text
- text-kumo-inverse — text on inverted/contrast backgrounds
- text-kumo-link — link text

### Borders & Rings
- border-kumo-hairline / ring-kumo-hairline — subtle border between flat surfaces
- border-kumo-line / ring-kumo-line — stronger border on elevated surfaces

### Status (backgrounds)
- bg-kumo-info / bg-kumo-info-tint
- bg-kumo-success / bg-kumo-success-tint
- bg-kumo-warning / bg-kumo-warning-tint
- bg-kumo-danger / bg-kumo-danger-tint

### Status (text)
- text-kumo-info, text-kumo-success, text-kumo-warning, text-kumo-danger

## What NOT to do
| Wrong | Correct |
|-------|---------|
| bg-white | bg-kumo-base |
| text-gray-900 | text-kumo-default |
| border-gray-200 | border-kumo-hairline |
| text-red-600 | text-kumo-danger |
| bg-blue-600 | bg-kumo-brand |
| dark:bg-black | (remove — tokens handle it) |`;

interface CopyPageButtonProps {
  align?: "start" | "center" | "end";
  componentName?: string;
}

export function CopyPageButton({ align = "end", componentName }: CopyPageButtonProps) {
  const [copied, setCopied] = useState(false);

  const getMarkdownUrl = () => {
    const url = new URL(window.location.href);
    let path = url.pathname.replace(/\/+$/, "");
    path = path.replace(/^\/changelog\/.*/, "/changelog");
    return `${url.origin}${path}.md`;
  };

  const onCopySuccess = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPrompt = async () => {
    onCopySuccess();
    try {
      const markdownUrl = getMarkdownUrl();
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();

      const name = componentName ?? "this component";
      const prompt = `You are helping me build UI using the Kumo design system by Cloudflare.

${KUMO_DESIGN_RULES}

---

## Component Documentation: ${name}

${markdown}

---

## Your role
You are a Kumo design system expert. You have just been given full documentation for the ${name} component. Do not write any code yet.

Instead, ask the user the following questions one at a time:

1. Is Kumo already set up in your project, or are you starting from scratch? (This determines whether you need to walk through the setup steps above.)
2. What framework are you using? (React, Astro, Next.js, Vue, etc.)
3. What do you want to build? Describe it in plain English — don't worry about the technical details, just tell me what you need.
4. Based on their answer and the component documentation above, ask any follow-up questions about variants, sizes, or behaviour that would affect the implementation. For example, for a button: does it need a loading state? Is it a link or an action? What should it say?

Only once you fully understand what they need, write the code. Use only Kumo semantic tokens, no raw Tailwind colors, no dark: prefixes.`;

      await navigator.clipboard.writeText(prompt);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdownUrl = getMarkdownUrl();
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);
    } catch (error) {
      console.error("Failed to copy page as Markdown:", error);
    }
  };

  const handleCopyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      console.error("Failed to copy page link:", error);
    }
  };

  const handleViewMarkdown = () => window.open(getMarkdownUrl(), "_blank");

  const getAIPromptUrl = (baseUrl: string) => {
    const markdownUrl = getMarkdownUrl();
    const prompt = encodeURIComponent(
      `Read through this Kumo documentation: ${markdownUrl}. I'll need your help to understand it, so be prepared to explain concepts, share examples, and assist with debugging.`,
    );
    return `${baseUrl}?q=${prompt}`;
  };

  const handleOpenInClaude = () =>
    window.open(getAIPromptUrl("https://claude.ai/new"), "_blank");

  const handleOpenInChatGPT = () =>
    window.open(getAIPromptUrl("https://chatgpt.com"), "_blank");

  const ButtonIcon = copied ? CheckIcon : SparkleIcon;

  return (
    <div className="flex items-center" data-copy-ignore>
      <Button
        className="rounded-r-none border-r-0 gap-1.5"
        icon={<ButtonIcon size={16} />}
        onClick={handleCopyPrompt}
        size="sm"
        variant="secondary"
      >
        <span>{copied ? "Copied!" : "Copy Prompt"}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          render={
            <Button
              variant="secondary"
              size="sm"
              shape="square"
              aria-label="More copy options"
              className={cn("rounded-l-none")}
            >
              <CaretDownIcon size={12} />
            </Button>
          }
        />
        <DropdownMenu.Content align={align}>
          <DropdownMenu.Item icon={CopySimpleIcon} onClick={handleCopyMarkdown}>
            Copy page
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={LinkSimpleIcon} onClick={handleCopyPageLink}>
            Copy page link
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={FileMdIcon} onClick={handleViewMarkdown}>
            View page as Markdown
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            icon={<ClaudeIcon className="mr-2" />}
            onClick={handleOpenInClaude}
          >
            Open in Claude
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={OpenAiLogo} onClick={handleOpenInChatGPT}>
            Open in ChatGPT
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}
