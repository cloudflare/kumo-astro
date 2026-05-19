import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Separator, KUMO_SEPARATOR_VARIANTS, KUMO_SEPARATOR_DEFAULT_VARIANTS } from "./separator";

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-orientation")).toBe("horizontal");
    expect(el.className).toContain("h-px");
  });

  it("renders a vertical separator", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-orientation")).toBe("vertical");
    expect(el.className).toContain("w-px");
  });

  it("is decorative (aria-hidden) by default", () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("has role=separator when decorative=false", () => {
    const { container } = render(<Separator decorative={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("role")).toBe("separator");
  });

  it("exports KUMO_SEPARATOR_VARIANTS with orientation axis", () => {
    expect(KUMO_SEPARATOR_VARIANTS.orientation.horizontal).toBeDefined();
    expect(KUMO_SEPARATOR_VARIANTS.orientation.vertical).toBeDefined();
    expect(KUMO_SEPARATOR_DEFAULT_VARIANTS.orientation).toBe("horizontal");
  });

  it("merges custom className", () => {
    const { container } = render(<Separator className="my-4" />);
    expect((container.firstChild as HTMLElement).className).toContain("my-4");
  });
});
