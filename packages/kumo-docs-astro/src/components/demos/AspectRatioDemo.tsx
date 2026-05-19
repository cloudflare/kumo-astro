import { AspectRatio } from "@cloudflare/kumo";

/** 16:9 widescreen ratio containing an image */
export function AspectRatioWideDemo() {
  return (
    <div className="w-80">
      <AspectRatio ratio="16/9">
        <div className="h-full w-full rounded-lg bg-kumo-tint flex items-center justify-center">
          <span className="text-kumo-subtle text-sm">16 / 9</span>
        </div>
      </AspectRatio>
    </div>
  );
}

/** All preset ratios */
export function AspectRatioPresetsDemo() {
  const ratios = ["16/9", "4/3", "1/1", "3/2", "9/16"] as const;
  return (
    <div className="grid grid-cols-3 gap-4">
      {ratios.map((ratio) => (
        <div key={ratio}>
          <AspectRatio ratio={ratio}>
            <div className="h-full w-full rounded-md bg-kumo-tint flex items-center justify-center">
              <span className="text-kumo-subtle text-xs">{ratio}</span>
            </div>
          </AspectRatio>
        </div>
      ))}
    </div>
  );
}

/** Custom numeric ratio */
export function AspectRatioCustomDemo() {
  return (
    <div className="w-80">
      <AspectRatio ratio={21 / 9}>
        <div className="h-full w-full rounded-lg bg-kumo-tint flex items-center justify-center">
          <span className="text-kumo-subtle text-sm">21 : 9 (ultrawide)</span>
        </div>
      </AspectRatio>
    </div>
  );
}
