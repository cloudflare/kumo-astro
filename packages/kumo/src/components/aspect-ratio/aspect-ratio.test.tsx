import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AspectRatio, KUMO_ASPECT_RATIO_VARIANTS, KUMO_ASPECT_RATIO_DEFAULT_VARIANTS } from "./aspect-ratio";

describe("AspectRatio", () => {
  it("renders children inside the ratio box", () => {
    const { getByText } = render(
      <AspectRatio ratio="16/9">
        <span>content</span>
      </AspectRatio>,
    );
    expect(getByText("content")).toBeTruthy();
  });

  it("applies 16/9 ratio padding by default", () => {
    const { container } = render(<AspectRatio />);
    const wrapper = container.firstChild as HTMLElement;
    // 1/(16/9) * 100 = 56.25%
    expect(wrapper.style.paddingBottom).toBe("56.25%");
  });

  it("applies 1/1 square ratio", () => {
    const { container } = render(<AspectRatio ratio="1/1" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe("100%");
  });

  it("accepts numeric ratio", () => {
    const { container } = render(<AspectRatio ratio={2} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe("50%");
  });

  it("exports KUMO_ASPECT_RATIO_VARIANTS with ratio axis", () => {
    expect(KUMO_ASPECT_RATIO_VARIANTS.ratio["16/9"]).toBeDefined();
    expect(KUMO_ASPECT_RATIO_VARIANTS.ratio["1/1"]).toBeDefined();
    expect(KUMO_ASPECT_RATIO_DEFAULT_VARIANTS.ratio).toBe("16/9");
  });
});
