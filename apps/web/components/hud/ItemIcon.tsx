"use client";

import { inventoryItemIconSpec, type ItemIconShape } from "@/lib/hud/inventory-item-icons";

interface ItemIconProps {
  itemId: string;
  /** Accessible name; omit when a nearby label already names the item. */
  label?: string;
  /** Extra class on the SVG (size wrappers live on the parent). */
  className?: string;
}

/**
 * Renders one inventory glyph from {@link inventoryItemIconSpec}.
 *
 * @param props - Catalog item id plus optional accessible label.
 */
export function ItemIcon({ itemId, label, className }: ItemIconProps) {
  const spec = inventoryItemIconSpec(itemId);
  return (
    <svg
      className={["item-icon", className].filter(Boolean).join(" ")}
      viewBox="0 0 32 32"
      role={label ? "img" : "presentation"}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      data-testid="inventory-item-icon"
      data-item-id={itemId}
    >
      <rect width="32" height="32" rx="6" fill={spec.bg} />
      <rect
        x="0.6"
        y="0.6"
        width="30.8"
        height="30.8"
        rx="5.4"
        fill="none"
        stroke={spec.rim}
        strokeWidth="1.1"
        opacity="0.7"
      />
      {spec.shapes.map((shape, index) => (
        <ItemIconPrimitive key={index} shape={shape} />
      ))}
    </svg>
  );
}

/**
 * Draws one SVG primitive from an icon spec.
 *
 * @param props.shape - Serialized shape.
 */
function ItemIconPrimitive({ shape }: { shape: ItemIconShape }) {
  if (shape.t === "circle") {
    return (
      <circle
        cx={shape.cx}
        cy={shape.cy}
        r={shape.r}
        fill={shape.fill ?? "none"}
        stroke={shape.stroke}
        strokeWidth={shape.sw}
      />
    );
  }
  if (shape.t === "ellipse") {
    return (
      <ellipse
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        fill={shape.fill ?? "none"}
      />
    );
  }
  if (shape.t === "rect") {
    return (
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.w}
        height={shape.h}
        rx={shape.rx ?? 0}
        fill={shape.fill ?? "none"}
        stroke={shape.stroke}
        strokeWidth={shape.sw}
      />
    );
  }
  if (shape.t === "poly") {
    return (
      <polygon
        points={shape.points}
        fill={shape.fill ?? "none"}
        stroke={shape.stroke}
        strokeWidth={shape.sw}
      />
    );
  }
  return (
    <path
      d={shape.d}
      fill={shape.fill ?? "none"}
      stroke={shape.stroke}
      strokeWidth={shape.sw}
      strokeLinecap={shape.lc}
      strokeLinejoin={shape.lj}
    />
  );
}
