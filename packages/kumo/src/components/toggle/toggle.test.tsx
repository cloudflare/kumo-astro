import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toggle, KUMO_TOGGLE_VARIANTS, KUMO_TOGGLE_DEFAULT_VARIANTS } from "./toggle";

describe("Toggle", () => {
  it("renders children", () => {
    render(<Toggle>Bold</Toggle>);
    expect(screen.getByText("Bold")).toBeTruthy();
  });

  it("defaults to unpressed state", () => {
    const { container } = render(<Toggle>B</Toggle>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.getAttribute("data-state")).toBe("off");
  });

  it("shows pressed state when pressed=true", () => {
    const { container } = render(<Toggle pressed>B</Toggle>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.getAttribute("data-state")).toBe("on");
  });

  it("calls onPressedChange on click", () => {
    const onPressedChange = vi.fn();
    const { container } = render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>B</Toggle>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("does not call onPressedChange when disabled", () => {
    const onPressedChange = vi.fn();
    const { container } = render(
      <Toggle disabled onPressedChange={onPressedChange}>B</Toggle>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("exports KUMO_TOGGLE_VARIANTS", () => {
    expect(KUMO_TOGGLE_VARIANTS.variant.default).toBeDefined();
    expect(KUMO_TOGGLE_VARIANTS.size.base).toBeDefined();
    expect(KUMO_TOGGLE_DEFAULT_VARIANTS.variant).toBe("default");
  });
});
