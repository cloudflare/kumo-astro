import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Resizable,
  KUMO_RESIZABLE_VARIANTS,
  KUMO_RESIZABLE_DEFAULT_VARIANTS,
} from "./resizable";

describe("Resizable", () => {
  it("renders panels", () => {
    render(
      <Resizable>
        <Resizable.Panel>Left</Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel>Right</Resizable.Panel>
      </Resizable>,
    );
    expect(screen.getByText("Left")).toBeTruthy();
    expect(screen.getByText("Right")).toBeTruthy();
  });

  it("renders horizontal layout by default", () => {
    const { container } = render(
      <Resizable>
        <Resizable.Panel>A</Resizable.Panel>
      </Resizable>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("flex-row");
  });

  it("renders vertical layout", () => {
    const { container } = render(
      <Resizable direction="vertical">
        <Resizable.Panel>A</Resizable.Panel>
      </Resizable>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("flex-col");
  });

  it("handle has role=separator", () => {
    render(
      <Resizable>
        <Resizable.Panel>A</Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel>B</Resizable.Panel>
      </Resizable>,
    );
    const handle = document.querySelector("[role=separator]");
    expect(handle).toBeTruthy();
  });

  it("panel respects defaultSize", () => {
    const { container } = render(
      <Resizable>
        <Resizable.Panel defaultSize={30}>A</Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel defaultSize={70}>B</Resizable.Panel>
      </Resizable>,
    );
    const panels = container.querySelectorAll("[data-panel]");
    expect((panels[0] as HTMLElement).style.flexBasis).toBe("30%");
    expect((panels[1] as HTMLElement).style.flexBasis).toBe("70%");
  });

  it("exports KUMO_RESIZABLE_VARIANTS", () => {
    expect(KUMO_RESIZABLE_VARIANTS.direction.horizontal).toBeDefined();
    expect(KUMO_RESIZABLE_VARIANTS.handleVariant.default).toBeDefined();
    expect(KUMO_RESIZABLE_DEFAULT_VARIANTS.direction).toBe("horizontal");
  });
});
