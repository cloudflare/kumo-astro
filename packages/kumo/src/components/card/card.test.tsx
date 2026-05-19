import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, KUMO_CARD_VARIANTS, KUMO_CARD_DEFAULT_VARIANTS } from "./card";

describe("Card", () => {
  it("renders with default variant", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders all sub-components", () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Title</Card.Title>
          <Card.Description>Description</Card.Description>
        </Card.Header>
        <Card.Content>Body content</Card.Content>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Description")).toBeTruthy();
    expect(screen.getByText("Body content")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
  });

  it("applies elevated variant classes", () => {
    const { container } = render(<Card variant="elevated">x</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-kumo-elevated");
  });

  it("applies ghost variant classes", () => {
    const { container } = render(<Card variant="ghost">x</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-transparent");
  });

  it("exports KUMO_CARD_VARIANTS with variant axis", () => {
    expect(KUMO_CARD_VARIANTS.variant.default).toBeDefined();
    expect(KUMO_CARD_VARIANTS.variant.elevated).toBeDefined();
    expect(KUMO_CARD_DEFAULT_VARIANTS.variant).toBe("default");
  });

  it("Card.Title renders as h3", () => {
    const { container } = render(<Card.Title>Hello</Card.Title>);
    expect(container.querySelector("h3")).toBeTruthy();
  });
});
