import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  NativeSelect,
  KUMO_NATIVE_SELECT_VARIANTS,
  KUMO_NATIVE_SELECT_DEFAULT_VARIANTS,
} from "./native-select";

describe("NativeSelect", () => {
  it("renders options", () => {
    render(
      <NativeSelect aria-label="Fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </NativeSelect>,
    );
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.getByText("Banana")).toBeTruthy();
  });

  it("renders a <select> element", () => {
    const { container } = render(
      <NativeSelect aria-label="Test">
        <option>A</option>
      </NativeSelect>,
    );
    expect(container.querySelector("select")).toBeTruthy();
  });

  it("applies base size by default", () => {
    const { container } = render(
      <NativeSelect aria-label="Test">
        <option>A</option>
      </NativeSelect>,
    );
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.className).toContain("h-9");
  });

  it("applies sm size", () => {
    const { container } = render(
      <NativeSelect size="sm" aria-label="Test">
        <option>A</option>
      </NativeSelect>,
    );
    expect((container.querySelector("select") as HTMLElement).className).toContain("h-7");
  });

  it("respects disabled prop", () => {
    const { container } = render(
      <NativeSelect disabled aria-label="Test">
        <option>A</option>
      </NativeSelect>,
    );
    expect((container.querySelector("select") as HTMLSelectElement).disabled).toBe(true);
  });

  it("exports KUMO_NATIVE_SELECT_VARIANTS", () => {
    expect(KUMO_NATIVE_SELECT_VARIANTS.size.base).toBeDefined();
    expect(KUMO_NATIVE_SELECT_DEFAULT_VARIANTS.size).toBe("base");
  });
});
