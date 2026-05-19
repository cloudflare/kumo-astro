import { NativeSelect } from "@cloudflare/kumo";

/** Basic native select */
export function NativeSelectBasicDemo() {
  return (
    <NativeSelect aria-label="Framework" defaultValue="workers">
      <option value="workers">Cloudflare Workers</option>
      <option value="pages">Cloudflare Pages</option>
      <option value="r2">Cloudflare R2</option>
      <option value="d1">Cloudflare D1</option>
    </NativeSelect>
  );
}

/** All sizes */
export function NativeSelectSizesDemo() {
  return (
    <div className="flex flex-col gap-3">
      <NativeSelect size="sm" aria-label="Small select" defaultValue="a">
        <option value="a">Small (sm)</option>
        <option value="b">Option B</option>
      </NativeSelect>
      <NativeSelect size="base" aria-label="Base select" defaultValue="a">
        <option value="a">Base (default)</option>
        <option value="b">Option B</option>
      </NativeSelect>
      <NativeSelect size="lg" aria-label="Large select" defaultValue="a">
        <option value="a">Large (lg)</option>
        <option value="b">Option B</option>
      </NativeSelect>
    </div>
  );
}

/** Disabled state */
export function NativeSelectDisabledDemo() {
  return (
    <NativeSelect disabled aria-label="Disabled select" defaultValue="a">
      <option value="a">Disabled option</option>
      <option value="b">Other option</option>
    </NativeSelect>
  );
}

/** With option groups */
export function NativeSelectGroupsDemo() {
  return (
    <NativeSelect aria-label="Region" defaultValue="us-east-1">
      <optgroup label="Americas">
        <option value="us-east-1">US East (N. Virginia)</option>
        <option value="us-west-2">US West (Oregon)</option>
        <option value="sa-east-1">South America (São Paulo)</option>
      </optgroup>
      <optgroup label="Europe">
        <option value="eu-west-1">EU West (Ireland)</option>
        <option value="eu-central-1">EU Central (Frankfurt)</option>
      </optgroup>
      <optgroup label="Asia Pacific">
        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
      </optgroup>
    </NativeSelect>
  );
}
