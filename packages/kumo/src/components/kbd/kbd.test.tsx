import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd, KUMO_KBD_VARIANTS, KUMO_KBD_DEFAULT_VARIANTS } from "./kbd";

describe("Kbd", () => {
  it("renders keyboard text", () => {
    render(<Kbd>⌘K</Kbd>);
    expect(screen.getByText("⌘K")).toBeTruthy();
  });

  it("renders a <kbd> element", () => {
    const { container } = render(<Kbd>Enter</Kbd>);
    expect(container.querySelector("kbd")).toBeTruthy();
  });

  it("applies base size by default", () => {
    const { container } = render(<Kbd>Enter</Kbd>);
    const el = container.querySelector("kbd") as HTMLElement;
    expect(el.className).toContain("h-6");
  });

  it("applies sm size", () => {
    const { container } = render(<Kbd size="sm">K</Kbd>);
    const el = container.querySelector("kbd") as HTMLElement;
    expect(el.className).toContain("h-5");
  });

  it("applies lg size", () => {
    const { container } = render(<Kbd size="lg">Tab</Kbd>);
    const el = container.querySelector("kbd") as HTMLElement;
    expect(el.className).toContain("h-7");
  });

  it("merges custom className", () => {
    const { container } = render(<Kbd className="my-custom">K</Kbd>);
    expect((container.querySelector("kbd") as HTMLElement).className).toContain("my-custom");
  });

  it("exports KUMO_KBD_VARIANTS with size axis", () => {
    expect(KUMO_KBD_VARIANTS.size.sm).toBeDefined();
    expect(KUMO_KBD_VARIANTS.size.base).toBeDefined();
    expect(KUMO_KBD_VARIANTS.size.lg).toBeDefined();
    expect(KUMO_KBD_DEFAULT_VARIANTS.size).toBe("base");
  });
});
