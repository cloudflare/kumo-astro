import { Card, Button, Badge } from "@cloudflare/kumo";

/** Basic card with header, content, and footer */
export function CardBasicDemo() {
  return (
    <Card className="w-80">
      <Card.Header>
        <Card.Title>Worker Analytics</Card.Title>
        <Card.Description>Last 24 hours of request data</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-2xl font-bold text-kumo-default">1.2M</p>
        <p className="text-sm text-kumo-subtle">Total requests</p>
      </Card.Content>
      <Card.Footer>
        <Button size="sm">View details</Button>
      </Card.Footer>
    </Card>
  );
}

/** Card with elevated surface variant */
export function CardElevatedDemo() {
  return (
    <Card variant="elevated" className="w-80">
      <Card.Header>
        <Card.Title>Elevated Card</Card.Title>
        <Card.Description>Raised surface for highlighting content</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-sm text-kumo-default">This card uses the elevated surface variant.</p>
      </Card.Content>
    </Card>
  );
}

/** All card variants */
export function CardVariantsDemo() {
  return (
    <div className="flex flex-col gap-4">
      {(["default", "elevated", "recessed"] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>{variant.charAt(0).toUpperCase() + variant.slice(1)}</Card.Title>
              <Badge variant="secondary">{variant}</Badge>
            </div>
            <Card.Description>Surface variant: {variant}</Card.Description>
          </Card.Header>
        </Card>
      ))}
    </div>
  );
}
