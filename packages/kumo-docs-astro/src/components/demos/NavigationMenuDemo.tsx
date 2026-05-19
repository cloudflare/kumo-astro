import { NavigationMenu } from "@cloudflare/kumo";

/** Basic navigation menu with links */
export function NavigationMenuBasicDemo() {
  return (
    <NavigationMenu>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#" active>
            Dashboard
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Workers</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Pages</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Storage</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu>
  );
}

/** Navigation menu with flyout dropdown */
export function NavigationMenuWithFlyoutDemo() {
  return (
    <NavigationMenu>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#" active>
            Dashboard
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="compute">
          <NavigationMenu.Trigger>Compute</NavigationMenu.Trigger>
          <NavigationMenu.Content className="w-64">
            <NavigationMenu.SubLink
              href="#"
              title="Workers"
              description="Serverless functions at the edge"
            />
            <NavigationMenu.SubLink
              href="#"
              title="Pages"
              description="Deploy JAMstack sites globally"
            />
            <NavigationMenu.SubLink
              href="#"
              title="Containers"
              description="Run containerized workloads"
            />
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="storage">
          <NavigationMenu.Trigger>Storage</NavigationMenu.Trigger>
          <NavigationMenu.Content className="w-64">
            <NavigationMenu.SubLink
              href="#"
              title="KV"
              description="Key-value store at the edge"
            />
            <NavigationMenu.SubLink
              href="#"
              title="R2"
              description="S3-compatible object storage"
            />
            <NavigationMenu.SubLink
              href="#"
              title="D1"
              description="Serverless SQLite databases"
            />
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu>
  );
}
