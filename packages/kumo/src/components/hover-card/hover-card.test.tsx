import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  HoverCard,
  KUMO_HOVER_CARD_VARIANTS,
  KUMO_HOVER_CARD_DEFAULT_VARIANTS,
} from "./hover-card";

describe("HoverCard", () => {
  it("renders trigger", () => {
    render(
      <HoverCard>
        <HoverCard.Trigger>Hover me</HoverCard.Trigger>
        <HoverCard.Content>Card content</HoverCard.Content>
      </HoverCard>,
    );
    expect(screen.getByText("Hover me")).toBeTruthy();
  });

  it("content is hidden by default", () => {
    render(
      <HoverCard>
        <HoverCard.Trigger>Hover</HoverCard.Trigger>
        <HoverCard.Content>Hidden</HoverCard.Content>
      </HoverCard>,
    );
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("shows content immediately with openDelay=0", async () => {
    vi.useFakeTimers();
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>Hover</HoverCard.Trigger>
        <HoverCard.Content>Visible</HoverCard.Content>
      </HoverCard>,
    );

    fireEvent.mouseEnter(screen.getByText("Hover").parentElement!);
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByText("Visible")).toBeTruthy();
    vi.useRealTimers();
  });

  it("hides content after mouse leave with delay=0", async () => {
    vi.useFakeTimers();
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>Hover</HoverCard.Trigger>
        <HoverCard.Content>Content</HoverCard.Content>
      </HoverCard>,
    );

    fireEvent.mouseEnter(screen.getByText("Hover").parentElement!);
    await act(async () => { vi.runAllTimers(); });
    expect(screen.getByText("Content")).toBeTruthy();

    fireEvent.mouseLeave(screen.getByText("Hover").parentElement!);
    await act(async () => { vi.runAllTimers(); });
    expect(screen.queryByText("Content")).toBeNull();
    vi.useRealTimers();
  });

  it("exports KUMO_HOVER_CARD_VARIANTS", () => {
    expect(KUMO_HOVER_CARD_VARIANTS.side.bottom).toBeDefined();
    expect(KUMO_HOVER_CARD_VARIANTS.align.start).toBeDefined();
    expect(KUMO_HOVER_CARD_DEFAULT_VARIANTS.side).toBe("bottom");
  });
});
