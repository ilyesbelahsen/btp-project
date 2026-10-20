import * as React from "react";
import { Label as RadixLabel } from "radix-ui";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixLabel.Root>) {
  return (
    <RadixLabel.Root
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
