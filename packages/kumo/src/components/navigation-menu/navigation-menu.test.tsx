import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  NavigationMenu,
  KUMO_NAVIGATION_MENU_VARIANTS,
  KUMO_NAVIGATION_MENU_DEFAULT_VARIANTS,
} from "./navigation-menu";

describe("NavigationMenu", () => {
  it("renders nav links", () => {
    render(
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Docs")).toBeTruthy();
  });

  it("opens flyout on trigger click", () => {
    render(
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item value="products">
            <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <p>Products content</p>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );

    expect(screen.queryByText("Products content")).toBeNull();
    fireEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Products content")).toBeTruthy();
  });

  it("closes flyout on second trigger click", () => {
    render(
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item value="products">
            <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <p>Products content</p>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );

    fireEvent.click(screen.getByText("Products"));
    fireEvent.click(screen.getByText("Products"));
    expect(screen.queryByText("Products content")).toBeNull();
  });

  it("trigger has aria-expanded when open", () => {
    render(
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item value="test">
            <NavigationMenu.Trigger>Test</NavigationMenu.Trigger>
            <NavigationMenu.Content>Content</NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );
    const trigger = screen.getByRole("button", { name: "Test" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("link renders as anchor", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );
    const link = container.querySelector("a");
    expect(link?.href).toContain("/about");
  });

  it("exports KUMO_NAVIGATION_MENU_VARIANTS", () => {
    expect(KUMO_NAVIGATION_MENU_VARIANTS.indicator.underline).toBeDefined();
    expect(KUMO_NAVIGATION_MENU_DEFAULT_VARIANTS.indicator).toBe("underline");
  });
});
