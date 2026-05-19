import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ToggleGroup,
  KUMO_TOGGLE_GROUP_VARIANTS,
  KUMO_TOGGLE_GROUP_DEFAULT_VARIANTS,
} from "./toggle-group";

describe("ToggleGroup", () => {
  it("renders items", () => {
    render(
      <ToggleGroup>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
  });

  it("selects item on click (single mode)", () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("Bold"));
    expect(onValueChange).toHaveBeenCalledWith("bold");
  });

  it("reflects controlled value", () => {
    const { container } = render(
      <ToggleGroup type="single" value="a">
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      </ToggleGroup>,
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].getAttribute("data-state")).toBe("on");
    expect(buttons[1].getAttribute("data-state")).toBe("off");
  });

  it("supports multiple selection", () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="multiple" value={["a"]} onValueChange={onValueChange}>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("B"));
    expect(onValueChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("exports KUMO_TOGGLE_GROUP_VARIANTS", () => {
    expect(KUMO_TOGGLE_GROUP_VARIANTS.type.single).toBeDefined();
    expect(KUMO_TOGGLE_GROUP_VARIANTS.variant.default).toBeDefined();
    expect(KUMO_TOGGLE_GROUP_DEFAULT_VARIANTS.type).toBe("single");
  });
});
