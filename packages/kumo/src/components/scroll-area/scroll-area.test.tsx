import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  ScrollArea,
  KUMO_SCROLL_AREA_VARIANTS,
  KUMO_SCROLL_AREA_DEFAULT_VARIANTS,
} from "./scroll-area";

describe("ScrollArea", () => {
  it("renders children", () => {
    const { getByText } = render(
      <ScrollArea maxHeight={200}>
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    expect(getByText("Scrollable content")).toBeTruthy();
  });

  it("sets maxHeight style", () => {
    const { container } = render(<ScrollArea maxHeight={300} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.maxHeight).toBe("300px");
  });

  it("sets overflow-y auto for vertical orientation", () => {
    const { container } = render(<ScrollArea orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.overflowY).toBe("auto");
    expect(el.style.overflowX).toBe("hidden");
  });

  it("sets overflow-x auto for horizontal orientation", () => {
    const { container } = render(<ScrollArea orientation="horizontal" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.overflowX).toBe("auto");
    expect(el.style.overflowY).toBe("hidden");
  });

  it("sets both overflow auto for both orientation", () => {
    const { container } = render(<ScrollArea orientation="both" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.overflowX).toBe("auto");
    expect(el.style.overflowY).toBe("auto");
  });

  it("exports KUMO_SCROLL_AREA_VARIANTS", () => {
    expect(KUMO_SCROLL_AREA_VARIANTS.orientation.vertical).toBeDefined();
    expect(KUMO_SCROLL_AREA_DEFAULT_VARIANTS.orientation).toBe("vertical");
  });

  it("merges custom className", () => {
    const { container } = render(<ScrollArea className="my-class" />);
    expect((container.firstChild as HTMLElement).className).toContain("my-class");
  });
});
