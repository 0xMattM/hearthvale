"use client";

import "@/components/land-scene/kit-box-geometry";
import {
  homesteadKitGhostSize,
  playerLandGridHalfExtent,
  WORLD,
} from "@game/shared";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { useMemo, useState } from "react";

interface HomesteadPlaceGridProps {
  occupied: ReadonlyArray<{ x: number; z: number }>;
  /** Building type being placed — drives ghost silhouette. */
  previewBuildingType?: string | null;
  /** Yaw in quarter-turns (0–3); R cycles in parent. */
  facing?: number;
  /** Creditcoin NFT plot size — place grid larger than the free yard. */
  nftLandSize?: string | null;
  onPickCell: (gridX: number, gridZ: number) => void;
}

/**
 * Ghost grid + hover preview for homestead kit placement.
 * Click confirms; R rotates preview (facing from parent).
 */
export function HomesteadPlaceGrid({
  occupied,
  previewBuildingType = null,
  facing = 0,
  nftLandSize = null,
  onPickCell,
}: HomesteadPlaceGridProps) {
  const lim = playerLandGridHalfExtent(nftLandSize);
  const [hover, setHover] = useState<{ x: number; z: number } | null>(null);

  const cells = useMemo(() => {
    const blocked = new Set(occupied.map((c) => `${c.x},${c.z}`));
    const list: Array<{ x: number; z: number }> = [];
    for (let x = -lim; x <= lim; x += 1) {
      for (let z = -lim; z <= lim; z += 1) {
        if (!blocked.has(`${x},${z}`)) list.push({ x, z });
      }
    }
    return list;
  }, [lim, occupied]);

  const ghost = previewBuildingType
    ? homesteadKitGhostSize(previewBuildingType)
    : { w: 1.1, h: 1, d: 1.1 };
  const yaw = (((facing % 4) + 4) % 4) * (Math.PI / 2);

  return (
    <group data-testid="homestead-place-grid">
      {cells.map((c) => {
        const wx = c.x * WORLD.GRID;
        const wz = c.z * WORLD.GRID;
        const isHover = hover?.x === c.x && hover?.z === c.z;
        return (
          <mesh
            key={`${c.x},${c.z}`}
            position={[wx, 0.06, wz]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(c);
            }}
            onPointerOut={() => {
              setHover((h) => (h?.x === c.x && h?.z === c.z ? null : h));
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPickCell(c.x, c.z);
            }}
          >
            <planeGeometry args={[WORLD.GRID * 0.85, WORLD.GRID * 0.85]} />
            <meshBasicMaterial
              color={isHover ? "#b8d878" : "#7a9a58"}
              transparent
              opacity={isHover ? 0.55 : 0.32}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {hover ? (
        <group
          position={[
            hover.x * WORLD.GRID,
            ghost.h / 2 + 0.08,
            hover.z * WORLD.GRID,
          ]}
          rotation={[0, yaw, 0]}
        >
          <mesh data-testid="homestead-place-ghost">
            <kitBoxGeometry args={[ghost.w, ghost.h, ghost.d]} />
            <meshBasicMaterial
              color="#c8e090"
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>
        </group>
      ) : null}

      <WorldHtml position={[0, 2.4, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="homestead-place-hint"
          style={{
            background: "rgba(18, 22, 16, 0.85)",
            color: "#e8f0e2",
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #7a9a58",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          Click to place · R rotate · Esc cancel
        </div>
      </WorldHtml>
    </group>
  );
}
