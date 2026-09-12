"use client";

import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { GRID } from "@/components/land-scene/landProximity";
import {
  isLandEditorWorldPickable,
  landEditorPickupBuildings,
} from "@/lib/hud/land-editor";
import {
  homesteadKitGhostSize,
  interactHighlightRingMaterials,
  type BuildingDto,
} from "@game/shared";

interface HomesteadEditorOverlayProps {
  buildings: BuildingDto[];
  selectedId: string | null;
  placingKit: boolean;
  busy?: boolean;
  onSelect: (buildingId: string) => void;
  onMove: (buildingId: string) => void;
  onPickup: (buildingId: string) => void;
}

/**
 * World click targets + Move / Pick up chips while the land editor (P) is open.
 *
 * @param props - Placed buildings and editor callbacks.
 */
export function HomesteadEditorOverlay({
  buildings,
  selectedId,
  placingKit,
  busy = false,
  onSelect,
  onMove,
  onPickup,
}: HomesteadEditorOverlayProps) {
  const pickable = landEditorPickupBuildings(buildings).filter((b) =>
    isLandEditorWorldPickable(b.type, placingKit, b.slotIndex),
  );
  if (pickable.length === 0) return null;

  const ring = interactHighlightRingMaterials();

  return (
    <group data-testid="land-editor-world">
      {pickable.map((building) => {
        const ghost = homesteadKitGhostSize(building.type);
        const wx = building.x * GRID;
        const wz = building.z * GRID;
        const selected = building.id === selectedId;
        return (
          <group key={building.id} position={[wx, 0, wz]}>
            <mesh
              position={[0, ghost.h / 2 + 0.08, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(building.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
              data-testid="land-editor-world-pick"
            >
              <boxGeometry
                args={[ghost.w + 0.25, ghost.h + 0.35, ghost.d + 0.25]}
              />
              <meshBasicMaterial
                color="#c8e090"
                transparent
                opacity={selected ? 0.16 : 0.05}
                depthWrite={false}
              />
            </mesh>
            {selected ? (
              <>
                <mesh
                  position={[0, ring.y, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <ringGeometry
                    args={[ring.innerRadius, ring.outerRadius, ring.segments]}
                  />
                  <meshBasicMaterial
                    color="#c8e090"
                    transparent
                    opacity={0.85}
                  />
                </mesh>
                <WorldHtml
                  position={[0, ghost.h + 1.15, 0]}
                  center
                  style={{ pointerEvents: "auto" }}
                >
                  <div
                    className="land-editor-world-actions"
                    data-testid="land-editor-world-actions"
                  >
                    <button
                      type="button"
                      disabled={busy}
                      data-testid="land-editor-world-move"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(building.id);
                      }}
                    >
                      Move
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      data-testid="land-editor-world-pickup"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPickup(building.id);
                      }}
                    >
                      Pick up
                    </button>
                  </div>
                </WorldHtml>
              </>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
