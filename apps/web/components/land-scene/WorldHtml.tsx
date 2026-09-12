"use client";

import { Html } from "@react-three/drei";
import type { ComponentProps } from "react";
import { WORLD_LABEL_Z_INDEX_RANGE } from "@/lib/hud/world-html-layer";

type WorldHtmlProps = ComponentProps<typeof Html>;

/**
 * World nameplate Html — same as Drei Html, but z-index stays below HUD menus.
 *
 * @param props - Drei Html props; omit `zIndexRange` unless a caller needs a tighter band.
 */
export function WorldHtml({ zIndexRange, ...props }: WorldHtmlProps) {
  return (
    <Html
      {...props}
      zIndexRange={
        zIndexRange ??
        ([WORLD_LABEL_Z_INDEX_RANGE[0], WORLD_LABEL_Z_INDEX_RANGE[1]] as [
          number,
          number,
        ])
      }
    />
  );
}
